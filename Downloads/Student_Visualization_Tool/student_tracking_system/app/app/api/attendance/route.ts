
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
    }

    // Use upsert to handle both creating and updating attendance records
    const results = await Promise.all(
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

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    console.error('Attendance marking error:', error);
    return NextResponse.json(
      { error: 'Failed to mark attendance' },
      { status: 500 }
    );
  }
}
