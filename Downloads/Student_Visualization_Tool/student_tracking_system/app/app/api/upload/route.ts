import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
// Dynamic imports to prevent build issues
const pdfreader = require('pdf-parse');
const mammoth = require('mammoth');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/rtf'
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'submission' or 'rubric'
    const assignmentId = formData.get('assignmentId') as string;
    const studentId = formData.get('studentId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Please upload PDF, Word, or text files only.'
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 10MB.'
      }, { status: 400 });
    }

    // Validate required fields based on type
    if (type === 'submission' && !studentId) {
      return NextResponse.json({
        error: 'Student ID is required for submissions'
      }, { status: 400 });
    }

    if (!assignmentId) {
      return NextResponse.json({
        error: 'Assignment ID is required'
      }, { status: 400 });
    }

    // Create unique filename
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${nanoid()}_${Date.now()}${fileExtension}`;

    // Create upload directory structure
    const uploadDir = path.join(process.cwd(), 'uploads', type, assignmentId);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(uploadDir, uniqueFilename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);

    // Extract text content for AI processing
    let extractedText = '';
    let metadata = {};

    try {
      if (file.type === 'text/plain') {
        extractedText = buffer.toString('utf-8');
      } else if (file.type === 'application/pdf') {
        const pdfData = await pdfreader(buffer);
        extractedText = pdfData.text;
        metadata = {
          pageCount: pdfData.numpages,
          wordCount: pdfData.text.split(/\s+/).length
        };
      } else if (file.type.includes('word') || file.type.includes('document')) {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
        metadata = {
          wordCount: result.value.split(/\s+/).length,
          hasImages: result.messages.some(m => m.type === 'warning' && m.message.includes('image'))
        };
      }
    } catch (error) {
      console.warn('Failed to extract text:', error);
      extractedText = 'Text extraction failed - manual review required';
    }

    // Analyze content based on type
    let analysis = {};
    if (type === 'rubric' && extractedText) {
      analysis = await analyzeRubric(extractedText);
    } else if (type === 'submission' && extractedText) {
      analysis = await analyzeSubmission(extractedText);
    }

    const fileInfo = {
      fileName: file.name,
      filePath: filePath,
      fileSize: file.size,
      mimeType: file.type,
      uniqueFilename,
      extractedText,
      metadata,
      analysis,
      uploadedBy: session.user.id,
      type,
      assignmentId,
      studentId: type === 'submission' ? studentId : null,
      uploadedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      file: fileInfo,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      error: 'Failed to upload file'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const type = searchParams.get('type');

    if (!assignmentId || !type) {
      return NextResponse.json({
        error: 'Assignment ID and type are required'
      }, { status: 400 });
    }

    // Return list of uploaded files for an assignment
    const uploadDir = path.join(process.cwd(), 'uploads', type, assignmentId);

    if (!existsSync(uploadDir)) {
      return NextResponse.json({
        files: [],
        message: 'No files found'
      });
    }

    // This would typically query the database for file metadata
    // For now, we'll return a simple response
    return NextResponse.json({
      files: [],
      message: 'File listing not yet implemented'
    });

  } catch (error) {
    console.error('File listing error:', error);
    return NextResponse.json({
      error: 'Failed to list files'
    }, { status: 500 });
  }
}

async function analyzeRubric(text: string) {
  try {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Look for common rubric patterns
    const criteriaPatterns = [
      /criteria|criterion/i,
      /points?|marks?|score/i,
      /excellent|good|satisfactory|poor|outstanding/i,
      /level [1-5]|grade [a-f]/i
    ];

    const potentialCriteria = [];
    const scoringInfo = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (criteriaPatterns.some(pattern => pattern.test(line))) {
        potentialCriteria.push({
          line: i + 1,
          text: line,
          context: lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 3))
        });
      }

      const scoreMatch = line.match(/(\d+)\s*(?:points?|marks?|%)/i);
      if (scoreMatch) {
        scoringInfo.push({
          line: i + 1,
          score: parseInt(scoreMatch[1]),
          text: line
        });
      }
    }

    return {
      type: 'rubric',
      criteria: potentialCriteria,
      scoring: scoringInfo,
      totalLines: lines.length,
      suggestedStructure: inferRubricStructure(text),
      readyForAI: potentialCriteria.length > 0 && scoringInfo.length > 0
    };

  } catch (error) {
    console.error('Rubric analysis error:', error);
    return {
      type: 'rubric',
      error: 'Failed to analyze rubric structure',
      rawText: text.substring(0, 500) + '...'
    };
  }
}

async function analyzeSubmission(text: string) {
  try {
    const wordCount = text.split(/\s+/).length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    const academicPatterns = {
      citations: (text.match(/\([^)]*\d{4}[^)]*\)/g) || []).length,
      references: /references?|bibliography|works cited/i.test(text),
      headings: text.split('\n').filter(line =>
        line.trim().length > 0 &&
        line.trim().length < 100 &&
        !/[.!?]$/.test(line.trim())
      ).length,
      questions: (text.match(/\?/g) || []).length,
      bullets: (text.match(/^\s*[•·-]\s/gm) || []).length
    };

    const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 4);
    const wordFreq = words.reduce((freq: Record<string, number>, word) => {
      freq[word] = (freq[word] || 0) + 1;
      return freq;
    }, {});

    const keyThemes = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    return {
      type: 'submission',
      metrics: {
        wordCount,
        paragraphCount: paragraphs.length,
        averageParagraphLength: Math.round(wordCount / paragraphs.length),
        ...academicPatterns
      },
      keyThemes,
      preview: text.substring(0, 300) + '...',
      readyForEvaluation: wordCount > 100 && paragraphs.length > 1
    };

  } catch (error) {
    console.error('Submission analysis error:', error);
    return {
      type: 'submission',
      error: 'Failed to analyze submission content',
      rawText: text.substring(0, 500) + '...'
    };
  }
}

function inferRubricStructure(text: string): any {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  const hasTable = lines.some(line => line.includes('|') || /\t/.test(line));
  const numberedCriteria = lines.filter(line => /^\d+\.?\s/.test(line));
  const scoringLevels = lines.filter(line =>
    /(excellent|outstanding|good|satisfactory|adequate|poor|unsatisfactory)/i.test(line) ||
    /\b[1-5]\s*(?:points?|marks?)\b/i.test(line)
  );

  return {
    format: hasTable ? 'table' : 'list',
    criteriaCount: numberedCriteria.length,
    hasScoring: scoringLevels.length > 0,
    suggestedCriteria: numberedCriteria.slice(0, 5),
    suggestedLevels: scoringLevels.slice(0, 3)
  };
}