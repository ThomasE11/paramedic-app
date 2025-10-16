import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');

    const submissions = await prisma.submission.findMany({
      where: {
        ...(assignmentId && { assignmentId }),
        ...(studentId && { studentId }),
        ...(status && { status })
      },
      include: {
        assignment: {
          include: {
            module: true
          }
        },
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
            email: true,
            module: true
          }
        },
        evaluations: {
          include: {
            rubric: {
              select: { id: true, title: true, version: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: [
        { submittedAt: 'desc' }
      ]
    });

    return NextResponse.json({
      submissions,
      success: true
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({
      error: 'Failed to fetch submissions'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      assignmentId,
      studentId,
      fileName,
      filePath,
      fileSize,
      mimeType,
      content,
      extractedText,
      metadata
    } = body;

    // Validate required fields
    if (!assignmentId || !studentId || !fileName || !filePath) {
      return NextResponse.json({
        error: 'Assignment ID, student ID, file name, and file path are required'
      }, { status: 400 });
    }

    // Verify assignment and student exist
    const [assignment, student] = await Promise.all([
      prisma.assignment.findUnique({ where: { id: assignmentId } }),
      prisma.student.findUnique({ where: { id: studentId } })
    ]);

    if (!assignment) {
      return NextResponse.json({
        error: 'Assignment not found'
      }, { status: 404 });
    }

    if (!student) {
      return NextResponse.json({
        error: 'Student not found'
      }, { status: 404 });
    }

    // Check if student already has a submission for this assignment
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId,
        studentId
      }
    });

    // If submission exists, delete it to allow resubmission
    // This enables the workflow where instructors delete poor submissions
    // and request students to resubmit
    if (existingSubmission) {
      await prisma.submission.delete({
        where: { id: existingSubmission.id }
      });
    }

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId,
        fileName,
        filePath,
        fileSize: fileSize || 0,
        mimeType: mimeType || 'application/octet-stream',
        extractedText,
        uploadedBy: session.user.id,
        status: 'submitted'
      },
      include: {
        assignment: {
          include: {
            module: true
          }
        },
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
            email: true,
            module: true
          }
        }
      }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        studentId,
        type: 'submission_created',
        description: `Submitted ${assignment.title}`,
        metadata: {
          assignmentId,
          fileName,
          submissionId: submission.id
        }
      }
    });

    return NextResponse.json({
      submission,
      success: true,
      message: 'Submission created successfully'
    });

  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json({
      error: 'Failed to create submission'
    }, { status: 500 });
  }
}