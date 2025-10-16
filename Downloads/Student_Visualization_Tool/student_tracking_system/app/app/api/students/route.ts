
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const moduleId = searchParams.get('moduleId') || '';
    const sortBy = searchParams.get('sortBy') || 'firstName';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (moduleId && moduleId !== 'all') {
      where.moduleId = moduleId;
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        module: true,
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 3
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: {
        [sortBy]: sortOrder as 'asc' | 'desc'
      }
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, firstName, lastName, phone, moduleId } = body;

    if (!studentId || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Required fields: studentId, firstName, lastName' },
        { status: 400 }
      );
    }

    // Always use correct email format: studentId@hct.ac.ae
    const email = `${studentId}@hct.ac.ae`;

    // Check for existing student with same studentId
    const existing = await prisma.student.findFirst({
      where: {
        OR: [
          { email },
          { studentId }
        ]
      }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Student with this ID already exists' },
        { status: 400 }
      );
    }

    const student = await prisma.student.create({
      data: {
        studentId,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email, // Now always uses studentId@hct.ac.ae format
        phone: phone || null,
        moduleId: moduleId || null
      },
      include: {
        module: true
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        studentId: student.id,
        type: 'student_created',
        description: `Student ${student.fullName} was added to the system`,
        metadata: { addedBy: session.user.email }
      }
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}
