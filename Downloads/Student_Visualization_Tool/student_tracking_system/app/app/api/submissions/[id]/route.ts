import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const submissionId = params.id;

    // Get submission details before deletion
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
        student: {
          select: {
            id: true,
            fullName: true
          }
        },
        evaluations: true
      }
    });

    if (!submission) {
      return NextResponse.json({
        error: 'Submission not found'
      }, { status: 404 });
    }

    // Delete the submission (evaluations will cascade delete)
    await prisma.submission.delete({
      where: { id: submissionId }
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        studentId: submission.studentId,
        type: 'submission_deleted',
        description: `Submission deleted for ${submission.assignment.title}`,
        metadata: {
          assignmentId: submission.assignmentId,
          fileName: submission.fileName,
          deletedBy: session.user.id,
          evaluationsDeleted: submission.evaluations.length
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Submission deleted successfully. ${submission.evaluations.length} evaluation(s) also removed.`
    });

  } catch (error) {
    console.error('Error deleting submission:', error);
    return NextResponse.json({
      error: 'Failed to delete submission'
    }, { status: 500 });
  }
}
