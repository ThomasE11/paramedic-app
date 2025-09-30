
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Demo mode - return null (class not found)
    if (process.env.NODE_ENV === 'production' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      console.log('Demo mode: Class not found');
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const classSession = await prisma.classSession.findUnique({
      where: { id },
      include: {
        module: true,
        subject: true,
        location: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        attendance: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                fullName: true,
                studentId: true,
                email: true
              }
            },
            marker: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            student: {
              lastName: 'asc'
            }
          }
        }
      }
    });

    if (!classSession) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json(classSession);
  } catch (error) {
    console.error('Class fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch class' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      subjectId,
      moduleId,
      locationId,
      date,
      startTime,
      endTime,
      duration,
      type,
      status,
      capacity,
      notes,
      color
    } = body;

    // Calculate duration if not provided
    const calculatedDuration = duration || (() => {
      if (startTime && endTime) {
        const start = new Date(`2000-01-01T${startTime}:00`);
        const end = new Date(`2000-01-01T${endTime}:00`);
        return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      }
      return undefined;
    })();

    const updatedClass = await prisma.classSession.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(subjectId !== undefined && { subjectId }),
        ...(moduleId !== undefined && { moduleId }),
        ...(locationId !== undefined && { locationId }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(calculatedDuration !== undefined && { duration: calculatedDuration }),
        ...(type !== undefined && { type }),
        ...(status !== undefined && { status }),
        ...(capacity !== undefined && { capacity }),
        ...(notes !== undefined && { notes }),
        ...(color !== undefined && { color })
      },
      include: {
        module: true,
        subject: true,
        location: true,
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        attendance: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                fullName: true,
                studentId: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('Class update error:', error);
    return NextResponse.json(
      { error: 'Failed to update class' },
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
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await prisma.classSession.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Class deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete class' },
      { status: 500 }
    );
  }
}
