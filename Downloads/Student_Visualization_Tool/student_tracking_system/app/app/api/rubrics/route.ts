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

    const rubrics = await prisma.rubric.findMany({
      where: {
        ...(assignmentId && { assignmentId }),
        isActive: true
      },
      include: {
        assignment: {
          include: {
            module: true,
            subject: true
          }
        },
        creator: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: {
            evaluations: true
          }
        }
      },
      orderBy: [
        { version: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      rubrics,
      success: true
    });

  } catch (error) {
    console.error('Error fetching rubrics:', error);
    return NextResponse.json({
      error: 'Failed to fetch rubrics'
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
      title,
      description,
      criteria,
      weightings
    } = body;

    // Validate required fields
    if (!assignmentId || !title || !criteria) {
      return NextResponse.json({
        error: 'Assignment ID, title, and criteria are required'
      }, { status: 400 });
    }

    // Verify assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId }
    });

    if (!assignment) {
      return NextResponse.json({
        error: 'Assignment not found'
      }, { status: 404 });
    }

    // Get latest version number for this assignment
    const latestRubric = await prisma.rubric.findFirst({
      where: { assignmentId },
      orderBy: { version: 'desc' }
    });

    const version = latestRubric ? latestRubric.version + 1 : 1;

    // Deactivate previous versions if this is a new version
    if (latestRubric) {
      await prisma.rubric.updateMany({
        where: { assignmentId },
        data: { isActive: false }
      });
    }

    const rubric = await prisma.rubric.create({
      data: {
        assignmentId,
        title,
        description,
        criteria,
        weightings,
        version,
        createdBy: session.user.id
      },
      include: {
        assignment: {
          include: {
            module: true,
            subject: true
          }
        },
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      rubric,
      success: true,
      message: 'Rubric created successfully'
    });

  } catch (error) {
    console.error('Error creating rubric:', error);
    return NextResponse.json({
      error: 'Failed to create rubric'
    }, { status: 500 });
  }
}