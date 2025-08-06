import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isRead = searchParams.get('isRead');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Mock notifications data based on user role
    const mockNotifications = [
      {
        id: 'notif-1',
        userId: session.user.id,
        type: 'SYSTEM',
        title: 'Welcome to Paramedic Skills Matrix',
        message: 'Your account has been successfully created. Start exploring your dashboard!',
        isRead: false,
        relatedSkillId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        }
      },
      {
        id: 'notif-2',
        userId: session.user.id,
        type: 'PROGRESS_UPDATE',
        title: 'Skill Progress Update',
        message: session.user.role === 'STUDENT' 
          ? 'You have completed CPR Adult skill. Great job!' 
          : 'Sarah Johnson has completed CPR Adult skill.',
        isRead: false,
        relatedSkillId: 'skill-1',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        }
      },
      {
        id: 'notif-3',
        userId: session.user.id,
        type: 'ASSIGNMENT',
        title: 'New Assignment Available',
        message: session.user.role === 'STUDENT' 
          ? 'New skill assignment: AED Use practice is now available.' 
          : 'Assignment reminder: Students need to complete AED Use by end of week.',
        isRead: true,
        relatedSkillId: 'skill-2',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        }
      },
      {
        id: 'notif-4',
        userId: session.user.id,
        type: 'FEEDBACK',
        title: 'Instructor Feedback',
        message: session.user.role === 'STUDENT' 
          ? 'You have received feedback on your CPR Adult practice session.' 
          : 'Student reflection submitted for CPR Adult requires your review.',
        isRead: false,
        relatedSkillId: 'skill-1',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        }
      },
      {
        id: 'notif-5',
        userId: session.user.id,
        type: 'REMINDER',
        title: 'Practice Reminder',
        message: session.user.role === 'STUDENT' 
          ? 'Don\'t forget to complete your IV Insertion practice this week.' 
          : 'Reminder: Review pending student submissions.',
        isRead: true,
        relatedSkillId: 'skill-3',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 259200000).toISOString(),
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
        }
      }
    ];

    // Apply filters
    let filteredNotifications = mockNotifications;
    
    if (type && type !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.type === type);
    }
    
    if (isRead && isRead !== 'all') {
      filteredNotifications = filteredNotifications.filter(n => n.isRead === (isRead === 'true'));
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedNotifications = filteredNotifications.slice(offset, offset + limit);

    return NextResponse.json({
      notifications: paginatedNotifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredNotifications.length / limit),
        totalItems: filteredNotifications.length,
        hasMore: offset + limit < filteredNotifications.length,
      },
      summary: {
        total: filteredNotifications.length,
        unread: filteredNotifications.filter(n => !n.isRead).length,
        byType: {
          SYSTEM: filteredNotifications.filter(n => n.type === 'SYSTEM').length,
          PROGRESS_UPDATE: filteredNotifications.filter(n => n.type === 'PROGRESS_UPDATE').length,
          ASSIGNMENT: filteredNotifications.filter(n => n.type === 'ASSIGNMENT').length,
          FEEDBACK: filteredNotifications.filter(n => n.type === 'FEEDBACK').length,
          REMINDER: filteredNotifications.filter(n => n.type === 'REMINDER').length,
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId, isRead, action } = await request.json();

    if (action === 'mark_all_read') {
      // Mock mark all as read
      return NextResponse.json({ success: true, updated: 3 });
    }

    // Mock notification update
    const mockUpdatedNotification = {
      id: notificationId,
      isRead: isRead,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockUpdatedNotification);
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId } = await request.json();

    // Mock notification deletion
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}