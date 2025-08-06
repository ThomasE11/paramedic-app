import { NextRequest, NextResponse } from 'next/server';
export const dynamic = "force-dynamic";
export const runtime = 'nodejs';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all students
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
        error: 'Only administrators and lecturers can view students' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const includeEnrollments = searchParams.get('includeEnrollments') === 'true';
    const search = searchParams.get('search');

    // Build where clause
    let whereClause: any = {
      role: 'STUDENT'
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } }
      ];
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        createdAt: true,
        ...(includeEnrollments && {
          subjects: {
            where: { isActive: true },
            include: {
              subject: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  level: true
                }
              }
            }
          },
          progress: {
            select: {
              status: true,
              skillId: true
            }
          }
        })
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    // Add stats if enrollments are included
    const studentsWithStats = includeEnrollments ? students.map(student => ({
      ...student,
      stats: {
        enrolledSubjects: student.subjects?.length || 0,
        totalSkills: student.progress?.length || 0,
        masteredSkills: student.progress?.filter(p => p.status === 'MASTERED').length || 0,
        completedSkills: student.progress?.filter(p => p.status === 'COMPLETED').length || 0
      }
    })) : students;

    return NextResponse.json({
      success: true,
      students: studentsWithStats
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
