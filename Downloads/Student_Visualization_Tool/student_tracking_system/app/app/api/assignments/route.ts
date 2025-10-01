import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const assignments = await prisma.assignment.findMany({
      where: {
        ...(moduleId && { moduleId }),
        ...(includeInactive ? {} : { isActive: true })
      },
      include: {
        module: true,
        creator: {
          select: { id: true, name: true, email: true }
        },
        rubrics: {
          where: { isActive: true },
          select: { id: true, title: true, version: true }
        },
        submissions: {
          select: { id: true, studentId: true, status: true }
        },
        _count: {
          select: {
            submissions: true,
            rubrics: true
          }
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      assignments,
      success: true
    });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({
      error: 'Failed to fetch assignments'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      moduleId,
      subjectId,
      dueDate,
      maxScore
    } = body;

    // Validate required fields
    if (!title || !moduleId || !type) {
      return NextResponse.json({
        error: 'Title, module ID, and type are required'
      }, { status: 400 });
    }

    // Verify module exists
    const module = await prisma.module.findUnique({
      where: { id: moduleId }
    });

    if (!module) {
      return NextResponse.json({
        error: 'Module not found'
      }, { status: 404 });
    }

    // Verify subject exists if provided
    if (subjectId) {
      const subject = await prisma.subject.findUnique({
        where: { id: subjectId }
      });

      if (!subject) {
        return NextResponse.json({
          error: 'Subject not found'
        }, { status: 404 });
      }
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        type,
        moduleId,
        subjectId,
        dueDate: dueDate ? new Date(dueDate) : null,
        maxScore: maxScore || 100.0,
        createdBy: session.user.id
      },
      include: {
        module: true,
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      assignment,
      success: true,
      message: 'Assignment created successfully'
    });

  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({
      error: 'Failed to create assignment'
    }, { status: 500 });
  }
}