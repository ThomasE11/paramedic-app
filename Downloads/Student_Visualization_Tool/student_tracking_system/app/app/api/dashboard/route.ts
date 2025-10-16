
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

    // Get total students count
    const totalStudents = await prisma.student.count();

    // Get module stats
    const modules = await prisma.module.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      }
    });

    const moduleStats = modules.map(module => ({
      moduleId: module.id,
      moduleCode: module.code,
      moduleName: module.name,
      studentCount: module._count.students
    }));

    // Get recent activities
    const recentActivities = await prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            module: {
              select: { code: true, name: true }
            }
          }
        }
      }
    });

    return NextResponse.json({
      totalStudents,
      moduleStats,
      recentActivities
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
