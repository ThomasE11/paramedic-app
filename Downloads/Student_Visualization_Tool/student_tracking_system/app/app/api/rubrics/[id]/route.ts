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

    const rubric = await prisma.rubric.findUnique({
      where: { id },
      include: {
        assignment: {
          include: {
            module: true
          }
        },
        creator: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!rubric) {
      return NextResponse.json({ error: 'Rubric not found' }, { status: 404 });
    }

    return NextResponse.json({ rubric });
  } catch (error) {
    console.error('Get rubric error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rubric' },
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

    const { id } = await params;

    // Check if rubric exists and has evaluations
    const rubric = await prisma.rubric.findUnique({
      where: { id },
      include: {
        evaluations: {
          select: {
            id: true
          }
        }
      }
    });

    if (!rubric) {
      return NextResponse.json({ error: 'Rubric not found' }, { status: 404 });
    }

    // If rubric has evaluations, disconnect them (preserve grades) before deleting
    if (rubric.evaluations.length > 0) {
      // Set rubricId to null for all evaluations using this rubric
      // This preserves the evaluation data and grades while removing the rubric reference
      await prisma.evaluation.updateMany({
        where: { rubricId: id },
        data: { rubricId: null }
      });
    }

    // Delete rubric (evaluations are now disconnected, grades preserved)
    await prisma.rubric.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: rubric.evaluations.length > 0
        ? `Rubric deleted successfully. ${rubric.evaluations.length} evaluation(s) preserved with their grades.`
        : 'Rubric deleted successfully'
    });
  } catch (error) {
    console.error('Delete rubric error:', error);
    return NextResponse.json(
      { error: 'Failed to delete rubric' },
      { status: 500 }
    );
  }
}
