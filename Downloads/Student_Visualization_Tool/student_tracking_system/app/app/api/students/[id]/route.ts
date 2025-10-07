
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = "force-dynamic";

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

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        module: true,
        notes: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        activities: {
          orderBy: { createdAt: 'desc' }
        },
        emailLogs: {
          orderBy: { sentAt: 'desc' },
          take: 20
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Get student error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' },
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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { firstName, lastName, email, phone, moduleId } = body;

    const student = await prisma.student.update({
      where: { id },
      data: {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email,
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
        type: 'student_updated',
        description: `Student information updated`,
        metadata: { updatedBy: session.user.email }
      }
    });

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
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

    await prisma.student.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
