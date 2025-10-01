
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
    const moduleId = searchParams.get('moduleId');

    // Demo mode - return empty subjects for now
    if (process.env.NODE_ENV === 'production' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      console.log('Demo mode: Returning empty subjects');
      return NextResponse.json({ subjects: [] });
    }

    const whereClause: any = {};

    if (moduleId) {
      whereClause.moduleId = moduleId;
    }

    const subjects = await prisma.subject.findMany({
      where: whereClause,
      include: {
        module: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        _count: {
          select: {
            grades: true,
            scheduleEntries: true
          }
        }
      },
      orderBy: {
        code: 'asc'
      }
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Subjects fetch error:', error);
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
    const { code, name, description, credits, moduleId } = body;

    const subject = await prisma.subject.create({
      data: {
        code,
        name,
        description,
        credits,
        moduleId
      },
      include: {
        module: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Subject created successfully',
      subject 
    });
  } catch (error) {
    console.error('Subject create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
