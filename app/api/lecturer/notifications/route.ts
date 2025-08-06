
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || (session.user.role !== 'LECTURER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isRead = searchParams.get('isRead');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Mock notifications data for development
    const mockNotifications = [
      {
        id: 'notif-1',
        userId: session.user.id,
        type: 'FEEDBACK',
        title: 'New Student Reflection',
        message: 'Sarah Johnson submitted a reflection for CPR Adult skill',
        isRead: false,
        relatedSkillId: 'skill-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        },
        relatedData: {
          skill: {
            id: 'skill-1',
            name: 'CPR Adult',
            category: {
              name: 'Basic Life Support',
              colorCode: '#3B82F6',
            }
          },
          recentReflections: [
            {
              id: 'reflection-1',
              content: 'Great practice session, felt confident with compressions.',
              createdAt: new Date().toISOString(),
              user: {
                name: 'Sarah Johnson',
                studentId: 'STU001',
              }
            }
          ],
          recentVideoSessions: []
        }
      },
      {
        id: 'notif-2',
        userId: session.user.id,
        type: 'PROGRESS_UPDATE',
        title: 'Student Progress Update',
        message: 'Michael Chen completed AED Use skill',
        isRead: false,
        relatedSkillId: 'skill-2',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        },
        relatedData: {
          skill: {
            id: 'skill-2',
            name: 'AED Use',
            category: {
              name: 'Basic Life Support',
              colorCode: '#3B82F6',
            }
          },
          recentProgress: [
            {
              id: 'progress-2',
              status: 'COMPLETED',
              completedCount: 3,
              updatedAt: new Date(Date.now() - 3600000).toISOString(),
              user: {
                name: 'Michael Chen',
                studentId: 'STU002',
              }
            }
          ]
        }
      },
      {
        id: 'notif-3',
        userId: session.user.id,
        type: 'ASSIGNMENT',
        title: 'New Assignment Due',
        message: 'IV Insertion skill practice is due in 3 days',
        isRead: true,
        relatedSkillId: 'skill-3',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        },
        relatedData: {
          skill: {
            id: 'skill-3',
            name: 'IV Insertion',
            category: {
              name: 'Advanced Life Support',
              colorCode: '#EF4444',
            }
          }
        }
      }
    ];

    // Filter notifications based on query parameters
    let filteredNotifications = mockNotifications;
    
    if (type && type !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.type === type);
    }
    
    if (isRead && isRead !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.isRead === (isRead === 'true'));
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedNotifications = filteredNotifications.slice(skip, skip + limit);

    // Calculate summary statistics
    const totalNotifications = mockNotifications.length;
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;
    const typeBreakdown = {
      FEEDBACK: mockNotifications.filter(n => n.type === 'FEEDBACK').length,
      PROGRESS_UPDATE: mockNotifications.filter(n => n.type === 'PROGRESS_UPDATE').length,
      ASSIGNMENT: mockNotifications.filter(n => n.type === 'ASSIGNMENT').length,
    };

    return NextResponse.json({
      notifications: paginatedNotifications,
      summary: {
        total: totalNotifications,
        unread: unreadCount,
        typeBreakdown,
      },
      pagination: {
        currentPage: page,
        limit,
        hasMore: paginatedNotifications.length === limit,
      }
    });
  } catch (error) {
    console.error('Error fetching lecturer notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || (session.user.role !== 'LECTURER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId, isRead, action } = await request.json();

    // Mock update for development
    if (action === 'mark_all_read') {
      return NextResponse.json({ success: true });
    }

    // Mock notification update
    const mockNotification = {
      id: notificationId,
      userId: session.user.id,
      isRead: isRead,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockNotification);
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || (session.user.role !== 'LECTURER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId } = await request.json();

    // Mock deletion for development
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
