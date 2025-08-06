
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Get all enrollments with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'LECTURER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const userId = searchParams.get('userId');

    const whereClause: any = { isActive: true };
    
    if (subjectId) {
      whereClause.subjectId = parseInt(subjectId);
    }
    
    if (userId) {
      whereClause.userId = userId;
    }

    const enrollments = await prisma.userSubject.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
          }
        },
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
            level: true,
          }
        }
      },
      orderBy: [
        { subject: { code: 'asc' } },
        { user: { name: 'asc' } }
      ]
    });

    return NextResponse.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create new enrollment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'LECTURER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, subjectId, userIds, subjectIds } = body;

    // Handle single enrollment
    if (userId && subjectId) {
      const enrollment = await prisma.userSubject.upsert({
        where: {
          userId_subjectId: {
            userId,
            subjectId: parseInt(subjectId)
          }
        },
        create: {
          userId,
          subjectId: parseInt(subjectId),
          isActive: true,
        },
        update: {
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              studentId: true,
            }
          },
          subject: {
            select: {
              id: true,
              code: true,
              name: true,
              level: true,
            }
          }
        }
      });

      return NextResponse.json(enrollment);
    }

    // Handle bulk enrollment
    if (userIds && subjectIds) {
      const enrollments = [];
      
      for (const uid of userIds) {
        for (const sid of subjectIds) {
          const enrollment = await prisma.userSubject.upsert({
            where: {
              userId_subjectId: {
                userId: uid,
                subjectId: parseInt(sid)
              }
            },
            create: {
              userId: uid,
              subjectId: parseInt(sid),
              isActive: true,
            },
            update: {
              isActive: true,
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  studentId: true,
                }
              },
              subject: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  level: true,
                }
              }
            }
          });
          
          enrollments.push(enrollment);
        }
      }

      return NextResponse.json(enrollments);
    }

    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete enrollment
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'LECTURER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const subjectId = searchParams.get('subjectId');

    if (!userId || !subjectId) {
      return NextResponse.json({ error: 'Missing userId or subjectId' }, { status: 400 });
    }

    await prisma.userSubject.updateMany({
      where: {
        userId,
        subjectId: parseInt(subjectId),
      },
      data: {
        isActive: false,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
