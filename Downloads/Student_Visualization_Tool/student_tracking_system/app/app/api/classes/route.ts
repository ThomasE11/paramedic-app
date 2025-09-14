
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const moduleId = url.searchParams.get('moduleId');
    const date = url.searchParams.get('date');
    const status = url.searchParams.get('status');

    // Demo mode - return empty classes for now
    if (process.env.NODE_ENV === 'production' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      console.log('Demo mode: Returning empty classes');
      return NextResponse.json([]);
    }

    const where: any = {};

    if (moduleId) {
      where.moduleId = moduleId;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.date = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    if (status) {
      where.status = status;
    }

    const classes = await prisma.classSession.findMany({
      where,
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
        },
        _count: {
          select: {
            attendance: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error('Classes fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

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
      type = 'lecture',
      capacity = 30,
      notes,
      color = '#3B82F6',
      isRecurring = false,
      recurringPattern,
      recurringEndDate
    } = body;

    // Validate required fields
    if (!title || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields: title, date, startTime, endTime' },
        { status: 400 }
      );
    }

    // Calculate duration if not provided
    const calculatedDuration = duration || (() => {
      const start = new Date(`2000-01-01T${startTime}:00`);
      const end = new Date(`2000-01-01T${endTime}:00`);
      return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    })();

    const newClass = await prisma.classSession.create({
      data: {
        title,
        description,
        subjectId: subjectId || null,
        moduleId: moduleId || null,
        locationId: locationId || null,
        instructorId: user.id,
        date: new Date(date),
        startTime,
        endTime,
        duration: calculatedDuration,
        type,
        capacity,
        notes,
        color,
        isRecurring,
        recurringPattern: recurringPattern || null,
        recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : null
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
        }
      }
    });

    // If the class is for a specific module, create attendance records for all students
    if (moduleId) {
      const students = await prisma.student.findMany({
        where: { moduleId }
      });

      if (students.length > 0) {
        await prisma.attendance.createMany({
          data: students.map((student: { id: string }) => ({
            classSessionId: newClass.id,
            studentId: student.id,
            status: 'absent' // Default to absent, will be updated when marked
          }))
        });
      }
    }

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error('Class creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}
