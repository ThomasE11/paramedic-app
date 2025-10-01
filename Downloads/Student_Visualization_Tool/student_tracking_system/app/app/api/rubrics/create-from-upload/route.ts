import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

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
    const assignmentId = formData.get('assignmentId') as string;
    const rubricTitle = formData.get('title') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
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

    // Verify assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { module: true }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Create unique filename
    const fileExtension = path.extname(file.name);
    const uniqueFilename = `${nanoid()}_${Date.now()}${fileExtension}`;

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'uploads', 'rubric', assignmentId);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(uploadDir, uniqueFilename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Extract text from file
    let extractedText = '';
    try {
      if (file.type === 'text/plain') {
        extractedText = buffer.toString('utf-8');
      } else if (file.type === 'application/pdf') {
        const pdfreader = (await import('pdf-parse')).default;
        const pdfData = await pdfreader(buffer);
        extractedText = pdfData.text;
      } else if (file.type.includes('word') || file.type.includes('document')) {
        const mammoth = (await import('mammoth')).default;
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      return NextResponse.json({
        error: 'Failed to extract text from document. Please try a different file format.'
      }, { status: 500 });
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return NextResponse.json({
        error: 'Could not extract sufficient text from the document. Please ensure the rubric contains readable text.'
      }, { status: 400 });
    }

    // Use AI to parse and structure the rubric
    const parsingPrompt = `You are an expert at analyzing and structuring academic rubrics. Extract the rubric structure from this document.

# Rubric Document:
${extractedText}

---

# Task:

Analyze this rubric and extract:
1. The overall rubric title/name
2. All assessment criteria
3. For each criterion:
   - Name of the criterion
   - Description/what it assesses
   - All scoring levels (e.g., Excellent, Good, Satisfactory, etc.)
   - Point value for each level
   - Detailed descriptor for each level

# Output Format (JSON):

\`\`\`json
{
  "title": "Extracted rubric title",
  "description": "Overall description of what this rubric assesses",
  "totalMaxScore": 100,
  "criteria": [
    {
      "name": "Criterion Name",
      "description": "What this criterion assesses",
      "maxScore": 25,
      "levels": [
        {
          "level": "Excellent",
          "score": 25,
          "descriptor": "Detailed requirements for excellent performance"
        },
        {
          "level": "Good",
          "score": 20,
          "descriptor": "Detailed requirements for good performance"
        }
      ]
    }
  ]
}
\`\`\`

Important:
- Preserve exact wording from the document
- Extract ALL criteria and levels
- Ensure scores are numeric
- If scoring isn't explicit, infer reasonable distributions`;

    const aiResponse = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert academic assessment specialist who excels at analyzing and structuring grading rubrics with precision.'
          },
          {
            role: 'user',
            content: parsingPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`AI parsing failed: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const aiAnalysis = aiData.choices[0].message.content;

    // Extract JSON from response
    const jsonMatch = aiAnalysis.match(/```json\s*([\s\S]*?)\s*```/) ||
                     aiAnalysis.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const parsedRubric = JSON.parse(jsonStr);

    // Get latest version number
    const latestRubric = await prisma.rubric.findFirst({
      where: { assignmentId },
      orderBy: { version: 'desc' }
    });

    const version = latestRubric ? latestRubric.version + 1 : 1;

    // Deactivate previous versions
    if (latestRubric) {
      await prisma.rubric.updateMany({
        where: { assignmentId },
        data: { isActive: false }
      });
    }

    // Create rubric in database
    const rubric = await prisma.rubric.create({
      data: {
        assignmentId,
        title: rubricTitle || parsedRubric.title || file.name,
        description: parsedRubric.description,
        criteria: parsedRubric.criteria,
        version,
        fileName: file.name,
        filePath: filePath,
        fileSize: file.size,
        mimeType: file.type,
        extractedText: extractedText,
        createdBy: session.user.id
      },
      include: {
        assignment: {
          include: {
            module: true
          }
        },
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      rubric: rubric,
      parsedStructure: parsedRubric,
      message: 'Rubric uploaded and created successfully'
    });

  } catch (error) {
    console.error('[Create Rubric from Upload] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to create rubric from upload'
    }, { status: 500 });
  }
}
