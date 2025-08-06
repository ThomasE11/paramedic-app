import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    // Temporarily allow without authentication for testing
    // if (!session || session.user.role !== 'LECTURER') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const conversationWith = searchParams.get('conversationWith');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (conversationWith) {
      // Mock messages for a specific conversation
      const mockMessages = [
        {
          id: 'message-1',
          userId: conversationWith,
          title: 'Message from Student',
          message: 'Hi, I have a question about the CPR Adult skill practice.',
          type: 'MESSAGE',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          user: {
            id: conversationWith,
            name: 'Sarah Johnson',
            email: 'sarah.johnson@example.com',
            studentId: 'STU001',
          }
        },
        {
          id: 'message-2',
          userId: session?.user?.id || 'lecturer-1',
          title: 'Reply to Sarah Johnson',
          message: 'Hi Sarah, I\'d be happy to help. What specific aspect of CPR are you having trouble with?',
          type: 'MESSAGE',
          isRead: true,
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          user: {
            id: session?.user?.id || 'lecturer-1',
            name: session?.user?.name || 'Dr. Sarah Wilson',
            email: session?.user?.email || 'dr.wilson@example.com',
            studentId: null,
          }
        },
        {
          id: 'message-3',
          userId: conversationWith,
          title: 'Message from Student',
          message: 'I\'m struggling with the correct compression depth. Could you review my technique?',
          type: 'MESSAGE',
          isRead: true,
          createdAt: new Date(Date.now() - 900000).toISOString(),
          user: {
            id: conversationWith,
            name: 'Sarah Johnson',
            email: 'sarah.johnson@example.com',
            studentId: 'STU001',
          }
        }
      ];

      return NextResponse.json({
        messages: mockMessages,
        pagination: {
          currentPage: page,
          limit,
          hasMore: false,
        }
      });
    } else {
      // Mock students for conversation list
      const mockStudents = [
        {
          student: {
            id: 'student-1',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@example.com',
            studentId: 'STU001',
          },
          lastMessage: {
            id: 'message-1',
            message: 'Hi, I have a question about the CPR Adult skill practice.',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            isRead: false,
          },
          unreadCount: 2
        },
        {
          student: {
            id: 'student-2',
            name: 'Michael Chen',
            email: 'michael.chen@example.com',
            studentId: 'STU002',
          },
          lastMessage: {
            id: 'message-4',
            message: 'Thank you for the feedback on my AED technique!',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            isRead: true,
          },
          unreadCount: 0
        },
        {
          student: {
            id: 'student-3',
            name: 'Emma Rodriguez',
            email: 'emma.rodriguez@example.com',
            studentId: 'STU003',
          },
          lastMessage: {
            id: 'message-5',
            message: 'Can we schedule a practice session for IV insertion?',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            isRead: false,
          },
          unreadCount: 1
        },
        {
          student: {
            id: 'student-4',
            name: 'James Wilson',
            email: 'james.wilson@example.com',
            studentId: 'STU004',
          },
          lastMessage: null,
          unreadCount: 0
        },
        {
          student: {
            id: 'student-5',
            name: 'Lisa Thompson',
            email: 'lisa.thompson@example.com',
            studentId: 'STU005',
          },
          lastMessage: {
            id: 'message-6',
            message: 'Could you review my reflection on the patient assessment skill?',
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            isRead: true,
          },
          unreadCount: 0
        }
      ];

      return NextResponse.json({
        conversations: mockStudents,
        totalStudents: mockStudents.length,
        summary: {
          totalConversations: mockStudents.filter(s => s.lastMessage).length,
          totalUnread: mockStudents.reduce((sum, student) => sum + student.unreadCount, 0),
        }
      });
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    // Temporarily allow without authentication for testing
    // if (!session || session.user.role !== 'LECTURER') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { recipientId, message, type } = await request.json();

    // Mock message creation
    const mockMessage = {
      id: `message-${Date.now()}`,
      userId: session?.user?.id || 'lecturer-1',
      recipientId,
      message,
      type: type || 'MESSAGE',
      isRead: false,
      createdAt: new Date().toISOString(),
      user: {
        id: session?.user?.id || 'lecturer-1',
        name: session?.user?.name || 'Dr. Sarah Wilson',
        email: session?.user?.email || 'dr.wilson@example.com',
        studentId: null,
      }
    };

    return NextResponse.json(mockMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}