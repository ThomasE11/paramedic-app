import { NextRequest, NextResponse } from 'next/server';
export const dynamic = "force-dynamic";
export const runtime = 'nodejs';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get student's mastery status and progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a student
    const student = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!student || student.role !== 'STUDENT') {
      return NextResponse.json({ 
        error: 'Only students can access mastery status' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');
    const view = searchParams.get('view'); // 'mastered' | 'in-progress' | 'requests' | 'all'

    // Get mastered skills (skills with MASTERED status)
    const masteredSkills = await prisma.studentProgress.findMany({
      where: {
        userId: session.user.id,
        status: 'MASTERED'
      },
      include: {
        skill: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                colorCode: true
              }
            }
          }
        }
      },
      orderBy: {
        completionDate: 'desc'
      }
    });

    // Get skills in progress (that could potentially be requested for mastery)
    const inProgressSkills = await prisma.studentProgress.findMany({
      where: {
        userId: session.user.id,
        status: { in: ['COMPLETED', 'IN_PROGRESS'] },
        completeAttempts: { gt: 0 } // Must have at least one complete attempt
      },
      include: {
        skill: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                colorCode: true
              }
            }
          }
        }
      },
      orderBy: {
        lastAttemptDate: 'desc'
      }
    });

    // Get mastery requests for this student
    const masteryRequests = await prisma.masteryRequest.findMany({
      where: {
        studentId: session.user.id
      },
      include: {
        skill: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                colorCode: true
              }
            }
          }
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        requestDate: 'desc'
      }
    });

    // If specific skillId is requested, get detailed information
    let skillDetail = null;
    if (skillId) {
      const progress = await prisma.studentProgress.findUnique({
        where: {
          userId_skillId: {
            userId: session.user.id,
            skillId: parseInt(skillId)
          }
        },
        include: {
          skill: {
            include: {
              category: true,
              steps: true
            }
          }
        }
      });

      if (progress) {
        // Get skill attempts for this skill
        const attempts = await prisma.skillAttempt.findMany({
          where: {
            userId: session.user.id,
            skillId: parseInt(skillId)
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Last 10 attempts
        });

        // Get any mastery request for this skill
        const masteryRequest = await prisma.masteryRequest.findFirst({
          where: {
            studentId: session.user.id,
            skillId: parseInt(skillId)
          },
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            requestDate: 'desc'
          }
        });

        skillDetail = {
          progress,
          attempts,
          masteryRequest,
          canRequestMastery: progress.completeAttempts > 0 && 
                           progress.status !== 'MASTERED' &&
                           (!masteryRequest || !['PENDING', 'UNDER_REVIEW'].includes(masteryRequest.status))
        };
      }
    }

    // Get statistics
    const stats = {
      masteredCount: masteredSkills.length,
      inProgressCount: inProgressSkills.length,
      pendingRequestsCount: masteryRequests.filter(r => r.status === 'PENDING').length,
      approvedRequestsCount: masteryRequests.filter(r => r.status === 'APPROVED').length,
      rejectedRequestsCount: masteryRequests.filter(r => r.status === 'REJECTED').length,
      
      // Total practice time across all skills
      totalPracticeTime: await prisma.studentProgress.aggregate({
        where: { userId: session.user.id },
        _sum: { totalTimeSpentMinutes: true }
      }).then(result => result._sum.totalTimeSpentMinutes || 0),

      // Total attempts across all skills
      totalAttempts: await prisma.studentProgress.aggregate({
        where: { userId: session.user.id },
        _sum: { totalAttempts: true }
      }).then(result => result._sum.totalAttempts || 0)
    };

    // Get recent activity
    const recentActivity = [
      // Recent mastery requests
      ...masteryRequests.slice(0, 5).map(request => ({
        type: 'mastery_request',
        date: request.requestDate,
        skill: request.skill,
        status: request.status,
        data: request
      })),
      
      // Recent completions (skills that were recently completed)
      ...masteredSkills.slice(0, 5).map(progress => ({
        type: 'skill_mastered',
        date: progress.completionDate || progress.updatedAt,
        skill: progress.skill,
        status: 'mastered',
        data: progress
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    // Filter data based on view parameter
    let responseData: any = {
      stats,
      recentActivity
    };

    if (view === 'mastered' || view === 'all' || !view) {
      responseData.masteredSkills = masteredSkills;
    }

    if (view === 'in-progress' || view === 'all' || !view) {
      responseData.inProgressSkills = inProgressSkills;
    }

    if (view === 'requests' || view === 'all' || !view) {
      responseData.masteryRequests = masteryRequests;
    }

    if (skillDetail) {
      responseData.skillDetail = skillDetail;
    }

    return NextResponse.json({
      success: true,
      mastery: responseData,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        studentId: student.studentId
      }
    });

  } catch (error) {
    console.error('Error fetching student mastery data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mastery data' },
      { status: 500 }
    );
  }
}
