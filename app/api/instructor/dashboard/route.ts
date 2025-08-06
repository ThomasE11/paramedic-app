import { NextRequest, NextResponse } from 'next/server';
export const dynamic = "force-dynamic";
export const runtime = 'nodejs';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get instructor dashboard data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an instructor
    const instructor = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!instructor || (instructor.role !== 'LECTURER' && instructor.role !== 'ADMIN')) {
      return NextResponse.json({ 
        error: 'Only instructors can access instructor dashboard' 
      }, { status: 403 });
    }

    // Get pending mastery requests
    const pendingRequests = await prisma.masteryRequest.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true
          }
        },
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
        requestDate: 'asc' // Oldest first
      },
      take: 20 // Limit to most recent/urgent
    });

    // Get under review requests (assigned to this instructor or in review state)
    const underReviewRequests = await prisma.masteryRequest.findMany({
      where: {
        status: 'UNDER_REVIEW'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true
          }
        },
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
        requestDate: 'asc'
      }
    });

    // Get recent mastery decisions (approved/rejected in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDecisions = await prisma.masteryRequest.findMany({
      where: {
        status: { in: ['APPROVED', 'REJECTED'] },
        reviewDate: {
          gte: thirtyDaysAgo
        },
        reviewedBy: session.user.id // Only show decisions made by this instructor
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true
          }
        },
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
        reviewDate: 'desc'
      },
      take: 10
    });

    // Get statistics
    const stats = {
      // Pending requests count
      pendingCount: await prisma.masteryRequest.count({
        where: { status: 'PENDING' }
      }),

      // Under review count
      underReviewCount: await prisma.masteryRequest.count({
        where: { status: 'UNDER_REVIEW' }
      }),

      // This instructor's decisions in last 30 days
      myRecentDecisions: await prisma.masteryRequest.count({
        where: {
          reviewedBy: session.user.id,
          reviewDate: { gte: thirtyDaysAgo }
        }
      }),

      // This instructor's approval rate in last 30 days
      myApprovals: await prisma.masteryRequest.count({
        where: {
          reviewedBy: session.user.id,
          status: 'APPROVED',
          reviewDate: { gte: thirtyDaysAgo }
        }
      }),

      // Total active students (students with progress)
      activeStudents: await prisma.user.count({
        where: {
          role: 'STUDENT',
          progress: {
            some: {
              status: { in: ['IN_PROGRESS', 'COMPLETED'] }
            }
          }
        }
      }),

      // Skills with mastery requests this month
      skillsWithRequests: await prisma.masteryRequest.groupBy({
        by: ['skillId'],
        where: {
          requestDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _count: {
          skillId: true
        }
      })
    };

    // Calculate approval rate
    const approvalRate = stats.myRecentDecisions > 0 
      ? Math.round((stats.myApprovals / stats.myRecentDecisions) * 100)
      : 0;

    // Get most requested skills (this month)
    const mostRequestedSkills = await prisma.skill.findMany({
      where: {
        masteryRequests: {
          some: {
            requestDate: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        }
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            colorCode: true
          }
        },
        _count: {
          select: {
            masteryRequests: {
              where: {
                requestDate: {
                  gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
              }
            }
          }
        }
      },
      orderBy: {
        masteryRequests: {
          _count: 'desc'
        }
      },
      take: 5
    });

    // Get unread notifications count
    const unreadNotifications = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false
      }
    });

    // Get recent activity (student progress updates, new registrations, etc.)
    const recentActivity = await prisma.studentProgress.findMany({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        },
        status: { in: ['COMPLETED', 'MASTERED'] }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            studentId: true
          }
        },
        skill: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                name: true,
                colorCode: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10
    });

    return NextResponse.json({
      success: true,
      dashboard: {
        summary: {
          pendingRequests: stats.pendingCount,
          underReviewRequests: stats.underReviewCount,
          recentDecisions: stats.myRecentDecisions,
          approvalRate: approvalRate,
          activeStudents: stats.activeStudents,
          unreadNotifications
        },
        pendingRequests,
        underReviewRequests,
        recentDecisions,
        mostRequestedSkills,
        recentActivity,
        instructor: {
          id: instructor.id,
          name: instructor.name,
          email: instructor.email,
          role: instructor.role
        }
      }
    });

  } catch (error) {
    console.error('Error fetching instructor dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
