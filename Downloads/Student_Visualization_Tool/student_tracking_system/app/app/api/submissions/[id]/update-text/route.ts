import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const submissionId = params.id;
    const body = await request.json();
    const { extractedText } = body;

    if (!extractedText || typeof extractedText !== 'string') {
      return NextResponse.json({
        error: 'Valid text content is required'
      }, { status: 400 });
    }

    // Fetch submission
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: true,
        assignment: true
      }
    });

    if (!submission) {
      return NextResponse.json({
        error: 'Submission not found'
      }, { status: 404 });
    }

    // Update submission with manually provided text
    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        extractedText,
        status: 'submitted' // Reset to submitted so it can be re-evaluated
      },
      include: {
        student: true,
        assignment: true
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        studentId: submission.studentId,
        type: 'submission_updated',
        description: `Submission text manually updated for ${submission.assignment.title}`,
        metadata: {
          submissionId: submission.id,
          assignmentTitle: submission.assignment.title,
          textLength: extractedText.length,
          updatedBy: session.user.email
        }
      }
    });

    return NextResponse.json({
      success: true,
      submission: updated,
      message: 'Submission text updated successfully. You can now re-evaluate this submission.'
    });

  } catch (error) {
    console.error('Update submission text error:', error);
    return NextResponse.json({
      error: 'Failed to update submission text'
    }, { status: 500 });
  }
}
