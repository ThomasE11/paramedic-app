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
    const moduleId = searchParams.get('moduleId');
    const activityType = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};

    if (moduleId) {
      where.moduleId = moduleId;
    }

    if (activityType) {
      where.activityType = activityType;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const activities = await prisma.moduleActivity.findMany({
      where,
      include: {
        module: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      activities
    });

  } catch (error) {
    console.error('Module activities fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch module activities'
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
      moduleId,
      title,
      activityType = 'seminar',
      date,
      duration,
      targetAudience,
      description,
      content,
      objectives = [],
      outcomes,
      facilitator,
      location,
      studentCount,
      attachments,
      notes
    } = body;

    if (!moduleId || !title || !date) {
      return NextResponse.json({
        error: 'Module ID, title, and date are required'
      }, { status: 400 });
    }

    // Verify module exists
    const module = await prisma.module.findUnique({
      where: { id: moduleId }
    });

    if (!module) {
      return NextResponse.json({
        error: 'Module not found'
      }, { status: 404 });
    }

    const activity = await prisma.moduleActivity.create({
      data: {
        moduleId,
        title,
        activityType,
        date: new Date(date),
        duration,
        targetAudience,
        description,
        content,
        objectives,
        outcomes,
        facilitator: facilitator || session.user.name,
        location,
        studentCount,
        attachments,
        notes,
        createdBy: session.user.id!
      },
      include: {
        module: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      activity,
      message: 'Module activity created successfully'
    });

  } catch (error) {
    console.error('Module activity creation error:', error);
    return NextResponse.json({
      error: 'Failed to create module activity'
    }, { status: 500 });
  }
}
