import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/rtf'
];

// Extract student ID from filename (e.g., H00123456.pdf → H00123456)
function extractStudentIdFromFilename(filename: string): string | null {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

  // Match patterns like H00123456, h00123456, HOO123456, etc.
  const match = nameWithoutExt.match(/([Hh][Oo0]{2}\d{6})/);

  if (match) {
    // Normalize to uppercase and replace O's with 0's
    return match[1].toUpperCase().replace(/O/g, '0');
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const assignmentId = formData.get('assignmentId') as string;
    const autoEvaluate = formData.get('autoEvaluate') === 'true';
    const rubricId = formData.get('rubricId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    if (autoEvaluate && !rubricId) {
      return NextResponse.json({ error: 'Rubric ID is required for auto-evaluation' }, { status: 400 });
    }

    // Verify assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { module: true }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const results = {
      successful: [] as any[],
      failed: [] as any[],
      skipped: [] as any[]
    };

    const uploadDir = path.join(process.cwd(), 'uploads', 'submission', assignmentId);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Process each file
    for (const file of files) {
      try {
        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
          results.failed.push({
            fileName: file.name,
            reason: 'Invalid file type. Only PDF, Word, and text files are allowed.'
          });
          continue;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          results.failed.push({
            fileName: file.name,
            reason: 'File too large. Maximum size is 10MB.'
          });
          continue;
        }

        // Extract student ID from filename
        const extractedStudentId = extractStudentIdFromFilename(file.name);

        if (!extractedStudentId) {
          results.failed.push({
            fileName: file.name,
            reason: 'Could not extract student ID from filename. Please use format: H00123456.pdf'
          });
          continue;
        }

        // Find student by studentId
        const student = await prisma.student.findFirst({
          where: { studentId: extractedStudentId }
        });

        if (!student) {
          results.failed.push({
            fileName: file.name,
            studentId: extractedStudentId,
            reason: `Student not found with ID: ${extractedStudentId}`
          });
          continue;
        }

        // Check if submission already exists for this student and assignment
        const existingSubmission = await prisma.submission.findFirst({
          where: {
            assignmentId,
            studentId: student.id
          }
        });

        if (existingSubmission) {
          results.skipped.push({
            fileName: file.name,
            studentId: extractedStudentId,
            studentName: student.fullName,
            reason: 'Submission already exists for this student'
          });
          continue;
        }

        // Save file
        const fileExtension = path.extname(file.name);
        const uniqueFilename = `${student.studentId}_${nanoid()}_${Date.now()}${fileExtension}`;
        const filePath = path.join(uploadDir, uniqueFilename);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Extract text content
        let extractedText = '';
        let metadata: any = {};

        try {
          if (file.type === 'text/plain') {
            extractedText = buffer.toString('utf-8');
          } else if (file.type === 'application/pdf') {
            const pdfParse = (await import('pdf-parse')).default;
            const pdfData = await pdfParse(buffer);
            extractedText = pdfData.text.trim();
            metadata = {
              pageCount: pdfData.numpages,
              wordCount: extractedText.split(/\s+/).filter(w => w).length,
              extractedChars: extractedText.length
            };

            if (!extractedText || extractedText.length < 50) {
              extractedText = 'PDF appears to be image-based or has no extractable text.';
              metadata = { extractionFailed: true, reason: 'insufficient_text' };
            }
          } else if (file.type.includes('word') || file.type.includes('document')) {
            const mammoth = (await import('mammoth')).default;
            const result = await mammoth.extractRawText({ buffer });
            extractedText = result.value;
            metadata = {
              wordCount: result.value.split(/\s+/).length
            };
          }
        } catch (error) {
          console.warn('Text extraction error for', file.name, ':', error);
          extractedText = 'Text extraction failed - manual review required';
        }

        // Create submission in database
        const submission = await prisma.submission.create({
          data: {
            assignmentId,
            studentId: student.id,
            fileName: file.name,
            filePath,
            fileSize: file.size,
            mimeType: file.type,
            extractedText,
            metadata,
            status: 'pending',
            submittedAt: new Date()
          },
          include: {
            student: {
              select: {
                id: true,
                studentId: true,
                fullName: true
              }
            }
          }
        });

        results.successful.push({
          fileName: file.name,
          studentId: extractedStudentId,
          studentName: student.fullName,
          submissionId: submission.id,
          wordCount: metadata.wordCount || 0
        });

      } catch (error: any) {
        console.error('Error processing file', file.name, ':', error);
        results.failed.push({
          fileName: file.name,
          reason: error.message || 'Unknown error occurred'
        });
      }
    }

    const summary = {
      total: files.length,
      successful: results.successful.length,
      failed: results.failed.length,
      skipped: results.skipped.length
    };

    return NextResponse.json({
      success: true,
      summary,
      results,
      message: `Processed ${summary.total} files: ${summary.successful} uploaded, ${summary.failed} failed, ${summary.skipped} skipped`,
      autoEvaluate: autoEvaluate && results.successful.length > 0 ? {
        enabled: true,
        rubricId,
        submissionIds: results.successful.map(r => r.submissionId)
      } : null
    });

  } catch (error) {
    console.error('Batch upload error:', error);
    return NextResponse.json({
      error: 'Failed to process batch upload'
    }, { status: 500 });
  }
}
