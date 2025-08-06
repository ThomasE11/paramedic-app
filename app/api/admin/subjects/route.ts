import { NextRequest, NextResponse } from 'next/server';
export const dynamic = "force-dynamic";
export const runtime = 'nodejs';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all subjects
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or lecturer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'LECTURER')) {
      return NextResponse.json({ 
        error: 'Only administrators and lecturers can view subjects' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('includeStats') === 'true';
    const isActive = searchParams.get('isActive');

    // Build where clause
    let whereClause: any = {};
    if (isActive !== null) {
      whereClause.isActive = isActive === 'true';
    }

    const subjects = await prisma.subject.findMany({
      where: whereClause,
      include: {
        ...(includeStats && {
          skills: {
            select: { skillId: true }
          },
          users: {
            where: { isActive: true },
            select: { userId: true }
          }
        })
      },
      orderBy: [
        { level: 'asc' },
        { code: 'asc' }
      ]
    });

    // Add stats if requested
    const subjectsWithStats = includeStats ? subjects.map(subject => ({
      ...subject,
      stats: {
        skillCount: subject.skills?.length || 0,
        enrolledStudents: subject.users?.length || 0
      }
    })) : subjects;

    return NextResponse.json({
      success: true,
      subjects: subjectsWithStats
    });

  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}

// Create new subject
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Only administrators can create subjects' 
      }, { status: 403 });
    }

    const { code, name, level, description, isActive = true } = await request.json();

    if (!code || !name || !level) {
      return NextResponse.json({ 
        error: 'Code, name, and level are required' 
      }, { status: 400 });
    }

    // Check if subject code already exists
    const existingSubject = await prisma.subject.findUnique({
      where: { code }
    });

    if (existingSubject) {
      return NextResponse.json({ 
        error: 'Subject code already exists' 
      }, { status: 409 });
    }

    const subject = await prisma.subject.create({
      data: {
        code,
        name,
        level,
        description: description || null,
        isActive
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subject created successfully',
      subject
    });

  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
}
