import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activity = await prisma.moduleActivity.findUnique({
      where: { id: params.id },
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

    if (!activity) {
      return NextResponse.json({
        error: 'Activity not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      activity
    });

  } catch (error) {
    console.error('Module activity fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch module activity'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      activityType,
      date,
      duration,
      targetAudience,
      description,
      content,
      objectives,
      outcomes,
      facilitator,
      location,
      studentCount,
      attachments,
      notes
    } = body;

    const activity = await prisma.moduleActivity.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(activityType && { activityType }),
        ...(date && { date: new Date(date) }),
        ...(duration !== undefined && { duration }),
        ...(targetAudience !== undefined && { targetAudience }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        ...(objectives !== undefined && { objectives }),
        ...(outcomes !== undefined && { outcomes }),
        ...(facilitator !== undefined && { facilitator }),
        ...(location !== undefined && { location }),
        ...(studentCount !== undefined && { studentCount }),
        ...(attachments !== undefined && { attachments }),
        ...(notes !== undefined && { notes })
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
      message: 'Module activity updated successfully'
    });

  } catch (error) {
    console.error('Module activity update error:', error);
    return NextResponse.json({
      error: 'Failed to update module activity'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.moduleActivity.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Module activity deleted successfully'
    });

  } catch (error) {
    console.error('Module activity deletion error:', error);
    return NextResponse.json({
      error: 'Failed to delete module activity'
    }, { status: 500 });
  }
}
