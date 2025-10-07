
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const classSessionId = url.searchParams.get('classSessionId');
    const studentId = url.searchParams.get('studentId');
    const status = url.searchParams.get('status');

    const where: any = {};
    
    if (classSessionId) {
      where.classSessionId = classSessionId;
    }
    
    if (studentId) {
      where.studentId = studentId;
    }
    
    if (status) {
      where.status = status;
    }

    const attendance = await prisma.attendance.findMany({
      where,
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
        classSession: {
          select: {
            id: true,
            title: true,
            date: true,
            startTime: true,
            endTime: true,
            type: true
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
      orderBy: [
        { classSession: { date: 'desc' } },
        { student: { lastName: 'asc' } }
      ]
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Attendance fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
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
    const { attendance } = body; // Array of attendance records

    if (!Array.isArray(attendance) || attendance.length === 0) {
      return NextResponse.json(
        { error: 'Attendance data must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate each attendance record
    for (const record of attendance) {
      if (!record.classSessionId || !record.studentId || !record.status) {
        return NextResponse.json(
          { error: 'Each attendance record must have classSessionId, studentId, and status' },
          { status: 400 }
        );
      }

      // Validate status values
      const validStatuses = ['present', 'absent', 'late', 'excused'];
      if (!validStatuses.includes(record.status)) {
        return NextResponse.json(
          { error: `Invalid status: ${record.status}. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Verify all referenced entities exist
    const classSessionIds = [...new Set(attendance.map(r => r.classSessionId))];
    const studentIds = [...new Set(attendance.map(r => r.studentId))];

    const [classSessions, students] = await Promise.all([
      prisma.classSession.findMany({
        where: { id: { in: classSessionIds } },
        select: { id: true }
      }),
      prisma.student.findMany({
        where: { id: { in: studentIds } },
        select: { id: true }
      })
    ]);

    const existingClassSessionIds = new Set(classSessions.map(cs => cs.id));
    const existingStudentIds = new Set(students.map(s => s.id));

    // Validate all IDs exist
    for (const record of attendance) {
      if (!existingClassSessionIds.has(record.classSessionId)) {
        return NextResponse.json(
          { error: `Class session not found: ${record.classSessionId}` },
          { status: 404 }
        );
      }
      if (!existingStudentIds.has(record.studentId)) {
        return NextResponse.json(
          { error: `Student not found: ${record.studentId}` },
          { status: 404 }
        );
      }
    }

    // Use transaction to ensure all-or-nothing save
    const results = await prisma.$transaction(
      attendance.map(record =>
        prisma.attendance.upsert({
          where: {
            classSessionId_studentId: {
              classSessionId: record.classSessionId,
              studentId: record.studentId
            }
          },
          update: {
            status: record.status,
            notes: record.notes || null,
            markedAt: new Date(),
            markedBy: user.id,
            duration: record.duration || null
          },
          create: {
            classSessionId: record.classSessionId,
            studentId: record.studentId,
            status: record.status,
            notes: record.notes || null,
            markedAt: new Date(),
            markedBy: user.id,
            duration: record.duration || null
          },
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                fullName: true,
                studentId: true
              }
            },
            classSession: {
              select: {
                id: true,
                title: true,
                date: true,
                startTime: true,
                endTime: true
              }
            }
          }
        })
      )
    );

    console.log(`Successfully saved ${results.length} attendance records for user ${user.email}`);

    // Log activity for each student
    const activityPromises = results.map(async (record) => {
      try {
        await prisma.activity.create({
          data: {
            studentId: record.studentId,
            type: 'attendance_marked',
            description: `Attendance marked as ${record.status} for ${record.classSession.title}`,
            metadata: {
              status: record.status,
              classSessionId: record.classSessionId,
              classTitle: record.classSession.title,
              date: record.classSession.date,
              markedBy: user.email,
              notes: record.notes
            }
          }
        });
      } catch (error) {
        console.error(`Failed to log activity for student ${record.studentId}:`, error);
      }
    });

    await Promise.allSettled(activityPromises);

    return NextResponse.json(results, { status: 201 });
  } catch (error: any) {
    console.error('Attendance marking error:', error);

    // Return detailed error messages for debugging
    const errorMessage = error?.message || 'Failed to mark attendance';
    const errorCode = error?.code || 'UNKNOWN_ERROR';

    return NextResponse.json(
      {
        error: errorMessage,
        code: errorCode,
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
