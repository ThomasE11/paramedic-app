
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Temporarily allow without authentication for testing
    // if (!session || session.user.role !== 'LECTURER') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { 
      submissionId, 
      submissionType, 
      comment, 
      isPrivate = false 
    } = await request.json();

    if (!submissionId || !submissionType || !comment?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Mock comment creation
    const mockComment = {
      id: `comment-${Date.now()}`,
      submissionId,
      submissionType,
      comment: comment.trim(),
      isPrivate,
      createdAt: new Date().toISOString(),
      instructor: {
        id: session?.user?.id || 'lecturer-1',
        name: session?.user?.name || 'Dr. Sarah Wilson',
        email: session?.user?.email || 'dr.wilson@example.com'
      }
    };

    // Mock notification for student
    const mockNotification = {
      id: `notification-${Date.now()}`,
      type: 'FEEDBACK',
      title: 'New Instructor Feedback',
      message: `You have received feedback on your ${submissionType}: "${comment.trim().substring(0, 50)}${comment.trim().length > 50 ? '...' : ''}"`,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true, 
      comment: mockComment,
      notification: mockNotification
    });
  } catch (error) {
    console.error('Error adding instructor comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
