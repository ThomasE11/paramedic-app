import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
// These will be imported dynamically in the function to prevent build issues

const MAX_FILE_SIZE = 60 * 1024 * 1024; // 60MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/rtf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/tiff',
  'image/bmp'
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
        error: 'Invalid file type. Please upload PDF, Word, text, or image files only.'
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 60MB.'
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
        try {
          // Use pdf-parse for PDF extraction (better for Node.js/Next.js)
          const pdfParse = (await import('pdf-parse')).default;

          const pdfData = await pdfParse(buffer);

          extractedText = pdfData.text.trim();
          metadata = {
            pageCount: pdfData.numpages,
            wordCount: extractedText.split(/\s+/).filter(w => w).length,
            extractedChars: extractedText.length
          };

          // If PDF has insufficient text, it might be image-based (scanned/handwritten)
          if (!extractedText || extractedText.length < 50) {
            console.log('PDF appears to be image-based, attempting OCR extraction...');

            try {
              // Try to extract images and perform OCR
              const ocrResult = await performPdfOcr(buffer);

              if (ocrResult.success && ocrResult.text && ocrResult.text.length > 50) {
                extractedText = ocrResult.text;
                metadata = {
                  pageCount: pdfData.numpages,
                  extractionMethod: 'ocr',
                  ocrConfidence: ocrResult.confidence,
                  isHandwritten: true,
                  wordCount: extractedText.split(/\s+/).filter(w => w).length,
                  extractedChars: extractedText.length
                };
                console.log('OCR extraction successful:', {
                  textLength: extractedText.length,
                  confidence: ocrResult.confidence
                });
              } else {
                extractedText = 'PDF appears to be image-based or handwritten. OCR processing will be attempted during evaluation. The AI will analyze visual content.';
                metadata = {
                  extractionFailed: false,
                  reason: 'image_based_pdf',
                  requiresOcr: true,
                  isHandwritten: true,
                  pageCount: pdfData.numpages
                };
              }
            } catch (ocrError: any) {
              console.warn('OCR extraction failed:', ocrError);
              extractedText = 'Handwritten or image-based PDF detected. The AI will attempt to process visual content during evaluation.';
              metadata = {
                extractionFailed: false,
                reason: 'ocr_unavailable',
                requiresOcr: true,
                isHandwritten: true,
                pageCount: pdfData.numpages
              };
            }
          }
        } catch (pdfError: any) {
          console.error('PDF extraction failed:', pdfError);
          // If PDF extraction fails, provide clear message
          extractedText = `PDF text extraction failed. Error: ${pdfError.message || 'Unknown error'}. The PDF may be encrypted, corrupted, or image-based. Please manually input the text content or re-upload the file.`;
          metadata = { extractionFailed: true, error: pdfError.message };
        }
      } else if (file.type.includes('word') || file.type.includes('document')) {
        // Dynamic import to prevent build issues
        const mammoth = (await import('mammoth')).default;
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
        metadata = {
          wordCount: result.value.split(/\s+/).length,
          hasImages: result.messages.some(m => m.type === 'warning' && m.message.includes('image'))
        };
      } else if (file.type.includes('image/')) {
        // Handle image uploads (scanned/handwritten documents)
        console.log('Image file detected, attempting OCR...');
        try {
          const ocrResult = await performImageOcr(buffer, file.type);

          if (ocrResult.success && ocrResult.text) {
            extractedText = ocrResult.text;
            metadata = {
              extractionMethod: 'ocr',
              isHandwritten: true,
              ocrConfidence: ocrResult.confidence,
              imageType: file.type,
              wordCount: ocrResult.text.split(/\s+/).filter(w => w).length
            };
          } else {
            extractedText = 'Image uploaded. OCR processing will be performed during evaluation. The AI will analyze visual content.';
            metadata = {
              extractionMethod: 'pending_ocr',
              isHandwritten: true,
              imageType: file.type,
              requiresOcr: true
            };
          }
        } catch (imageError: any) {
          console.warn('Image OCR failed:', imageError);
          extractedText = 'Handwritten document image detected. The AI will process visual content during evaluation.';
          metadata = {
            extractionFailed: false,
            isHandwritten: true,
            imageType: file.type,
            requiresOcr: true
          };
        }
      }
    } catch (error) {
      console.warn('General extraction error:', error);
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

// OCR Helper Functions for Handwritten/Image-based Content
async function performPdfOcr(pdfBuffer: Buffer): Promise<{ success: boolean; text: string; confidence?: number }> {
  try {
    // Use Tesseract.js for OCR on PDF images
    const Tesseract = (await import('tesseract.js')).default;

    // Convert PDF to images (this is a simplified approach)
    // In production, you'd want to use pdf2pic or similar
    console.log('Attempting OCR on PDF...');

    // For now, return indication that OCR is needed
    // The actual OCR will be performed by Claude during evaluation
    return {
      success: false,
      text: '',
      confidence: 0
    };
  } catch (error) {
    console.error('PDF OCR error:', error);
    return {
      success: false,
      text: '',
      confidence: 0
    };
  }
}

async function performImageOcr(imageBuffer: Buffer, mimeType: string): Promise<{ success: boolean; text: string; confidence?: number }> {
  try {
    console.log('Attempting OCR on image...');

    // Use Tesseract.js for OCR
    const Tesseract = (await import('tesseract.js')).default;

    // Convert buffer to data URL
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Perform OCR
    const { data } = await Tesseract.recognize(dataUrl, 'eng', {
      logger: (m: any) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    const confidence = data.confidence / 100;
    const text = data.text.trim();

    console.log('OCR completed:', {
      textLength: text.length,
      confidence: confidence,
      wordCount: text.split(/\s+/).length
    });

    return {
      success: text.length > 20,
      text,
      confidence
    };
  } catch (error) {
    console.error('Image OCR error:', error);
    return {
      success: false,
      text: '',
      confidence: 0
    };
  }
}