
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const semester = searchParams.get('semester') || 'current';
    const academicYear = searchParams.get('academicYear') || '2024-2025';

    // Demo mode - return empty schedules for now
    if (process.env.NODE_ENV === 'production' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      console.log('Demo mode: Returning empty schedules');

      if (studentId) {
        // Return null for specific student (no schedule found)
        return NextResponse.json({ schedule: null });
      } else {
        // Return empty array for all schedules
        return NextResponse.json({ schedules: [] });
      }
    }

    if (studentId) {
      // Get specific student's schedule
      const schedule = await prisma.schedule.findFirst({
        where: {
          studentId,
          semester,
          academicYear,
          isActive: true
        },
        include: {
          entries: {
            include: {
              subject: true,
              location: true,
              timeSlot: true
            },
            orderBy: [
              { dayOfWeek: 'asc' },
              { startTime: 'asc' }
            ]
          },
          student: {
            select: {
              id: true,
              fullName: true,
              studentId: true,
              email: true,
              module: {
                select: {
                  code: true,
                  name: true
                }
              }
            }
          }
        }
      });

      return NextResponse.json({ schedule });
    } else {
      // Get all schedules
      const schedules = await prisma.schedule.findMany({
        where: {
          semester,
          academicYear,
          isActive: true
        },
        include: {
          entries: {
            include: {
              subject: true,
              location: true,
              timeSlot: true
            },
            orderBy: [
              { dayOfWeek: 'asc' },
              { startTime: 'asc' }
            ]
          },
          student: {
            select: {
              id: true,
              fullName: true,
              studentId: true,
              email: true,
              module: {
                select: {
                  code: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          student: {
            fullName: 'asc'
          }
        }
      });

      return NextResponse.json({ schedules });
    }
  } catch (error) {
    console.error('Schedules fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, semester = 'current', academicYear = '2024-2025', entries } = body;

    // Create or update schedule
    const schedule = await prisma.schedule.upsert({
      where: {
        studentId_semester_academicYear: {
          studentId,
          semester,
          academicYear
        }
      },
      update: {
        isActive: true,
        entries: {
          deleteMany: {}, // Remove existing entries
          create: entries.map((entry: any) => ({
            subjectId: entry.subjectId,
            timeSlotId: entry.timeSlotId,
            locationId: entry.locationId,
            dayOfWeek: entry.dayOfWeek,
            startTime: entry.startTime,
            endTime: entry.endTime,
            title: entry.title,
            type: entry.type || 'class',
            instructor: entry.instructor,
            notes: entry.notes,
            color: entry.color || '#3B82F6',
            isRecurring: entry.isRecurring ?? true
          }))
        }
      },
      create: {
        studentId,
        semester,
        academicYear,
        isActive: true,
        entries: {
          create: entries.map((entry: any) => ({
            subjectId: entry.subjectId,
            timeSlotId: entry.timeSlotId,
            locationId: entry.locationId,
            dayOfWeek: entry.dayOfWeek,
            startTime: entry.startTime,
            endTime: entry.endTime,
            title: entry.title,
            type: entry.type || 'class',
            instructor: entry.instructor,
            notes: entry.notes,
            color: entry.color || '#3B82F6',
            isRecurring: entry.isRecurring ?? true
          }))
        }
      },
      include: {
        entries: {
          include: {
            subject: true,
            location: true,
            timeSlot: true
          }
        },
        student: {
          select: {
            fullName: true,
            studentId: true
          }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Schedule created/updated successfully',
      schedule 
    });
  } catch (error) {
    console.error('Schedule create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
