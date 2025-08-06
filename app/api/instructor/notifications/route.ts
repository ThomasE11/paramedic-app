import { NextRequest, NextResponse } from 'next/server';
export const dynamic = "force-dynamic";
export const runtime = 'nodejs';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get instructor notifications
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
        error: 'Only instructors can access instructor notifications' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // Filter by notification type
    const isRead = searchParams.get('isRead'); // Filter by read status
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    let whereClause: any = {
      userId: session.user.id
    };

    if (type) {
      whereClause.type = type;
    }

    if (isRead !== null) {
      whereClause.isRead = isRead === 'true';
    }

    // Get notifications with related data
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        // We don't have a direct relation to skill in notification model based on original schema
        // but we can get skill info through relatedSkillId
      }
    });

    // Enrich notifications with skill and mastery request data
    const enrichedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        let skillInfo = null;
        let masteryRequestInfo = null;
        let studentInfo = null;

        // Get skill information if relatedSkillId exists
        if (notification.relatedSkillId) {
          skillInfo = await prisma.skill.findUnique({
            where: { id: notification.relatedSkillId },
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  colorCode: true
                }
              }
            }
          });
        }

        // Get mastery request information if it's a mastery-related notification
        if (notification.type === 'MASTERY_REQUEST' && notification.relatedData) {
          const relatedData = notification.relatedData as any;
          if (relatedData.masteryRequestId) {
            masteryRequestInfo = await prisma.masteryRequest.findUnique({
              where: { id: relatedData.masteryRequestId },
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    studentId: true
                  }
                }
              }
            });
            studentInfo = masteryRequestInfo?.student;
          } else if (relatedData.studentId) {
            studentInfo = await prisma.user.findUnique({
              where: { id: relatedData.studentId },
              select: {
                id: true,
                name: true,
                email: true,
                studentId: true
              }
            });
          }
        }

        return {
          ...notification,
          skill: skillInfo,
          masteryRequest: masteryRequestInfo,
          student: studentInfo
        };
      })
    );

    // Get count of unread notifications
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false
      }
    });

    // Get count of mastery requests pending review
    const pendingMasteryRequests = await prisma.masteryRequest.count({
      where: {
        status: { in: ['PENDING', 'UNDER_REVIEW'] }
      }
    });

    return NextResponse.json({
      success: true,
      notifications: enrichedNotifications,
      pagination: {
        limit,
        offset,
        hasMore: enrichedNotifications.length === limit
      },
      summary: {
        unreadCount,
        pendingMasteryRequests,
        totalNotifications: await prisma.notification.count({
          where: { userId: session.user.id }
        })
      }
    });

  } catch (error) {
    console.error('Error fetching instructor notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// Mark notifications as read
export async function PATCH(request: NextRequest) {
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
        error: 'Only instructors can update instructor notifications' 
      }, { status: 403 });
    }

    const { notificationIds, markAllAsRead } = await request.json();

    if (markAllAsRead) {
      // Mark all notifications as read for this instructor
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false
        },
        data: {
          isRead: true
        }
      });

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId: session.user.id // Ensure user can only update their own notifications
        },
        data: {
          isRead: true
        }
      });

      return NextResponse.json({
        success: true,
        message: `${notificationIds.length} notification(s) marked as read`
      });
    } else {
      return NextResponse.json({
        error: 'Either notificationIds array or markAllAsRead flag is required'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

// Delete notifications
export async function DELETE(request: NextRequest) {
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
        error: 'Only instructors can delete instructor notifications' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const deleteRead = searchParams.get('deleteRead') === 'true';

    if (notificationId) {
      // Delete specific notification
      const deletedNotification = await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId: session.user.id // Ensure user can only delete their own notifications
        }
      });

      if (deletedNotification.count === 0) {
        return NextResponse.json({
          error: 'Notification not found or you do not have permission to delete it'
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } else if (deleteRead) {
      // Delete all read notifications
      const result = await prisma.notification.deleteMany({
        where: {
          userId: session.user.id,
          isRead: true
        }
      });

      return NextResponse.json({
        success: true,
        message: `${result.count} read notification(s) deleted`
      });
    } else {
      return NextResponse.json({
        error: 'Either notification id or deleteRead parameter is required'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
}