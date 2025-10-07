import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        module: true,
        creator: {
          select: {
            name: true,
            email: true
          }
        },
        rubrics: {
          include: {
            creator: {
              select: {
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                evaluations: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        submissions: {
          include: {
            student: {
              select: {
                studentId: true,
                fullName: true
              }
            }
          }
        },
        _count: {
          select: {
            submissions: true,
            rubrics: true
          }
        }
      }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error('Get assignment error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: assignmentId } = await params;

    // Check if assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        _count: {
          select: {
            submissions: true,
            rubrics: true
          }
        }
      }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Delete in transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // 1. Delete all evaluations for submissions
      await tx.evaluation.deleteMany({
        where: {
          submission: {
            assignmentId
          }
        }
      });

      // 2. Delete all submissions
      await tx.submission.deleteMany({
        where: { assignmentId }
      });

      // 3. Delete all rubrics
      await tx.rubric.deleteMany({
        where: { assignmentId }
      });

      // 4. Delete the assignment itself
      await tx.assignment.delete({
        where: { id: assignmentId }
      });
    });

    return NextResponse.json({
      success: true,
      message: `Assignment "${assignment.title}" and all related data deleted successfully`,
      deletedCounts: {
        submissions: assignment._count.submissions,
        rubrics: assignment._count.rubrics
      }
    });

  } catch (error) {
    console.error('[Delete Assignment] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to delete assignment'
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: assignmentId } = await params;
    const body = await request.json();
    const { isActive } = body;

    // Update assignment active status
    const assignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: { isActive },
      include: {
        module: true,
        creator: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: {
            submissions: true,
            rubrics: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      assignment,
      message: `Assignment ${isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('[Update Assignment] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to update assignment'
    }, { status: 500 });
  }
}
