
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

    const { recipientIds, message, subject } = await request.json();

    if (!recipientIds || !Array.isArray(recipientIds) || recipientIds.length === 0) {
      return NextResponse.json({ error: 'No recipients specified' }, { status: 400 });
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Mock recipient data
    const mockStudents = [
      { id: 'student-1', name: 'Sarah Johnson', email: 'sarah.johnson@example.com', studentId: 'STU001' },
      { id: 'student-2', name: 'Michael Chen', email: 'michael.chen@example.com', studentId: 'STU002' },
      { id: 'student-3', name: 'Emma Rodriguez', email: 'emma.rodriguez@example.com', studentId: 'STU003' },
      { id: 'student-4', name: 'James Wilson', email: 'james.wilson@example.com', studentId: 'STU004' },
      { id: 'student-5', name: 'Lisa Thompson', email: 'lisa.thompson@example.com', studentId: 'STU005' },
    ];

    // Filter to valid recipients
    const validRecipients = mockStudents.filter(student => recipientIds.includes(student.id));

    if (validRecipients.length === 0) {
      return NextResponse.json({ error: 'No valid recipients found' }, { status: 404 });
    }

    // Mock bulk message creation
    const mockMessages = validRecipients.map((recipient) => ({
      id: `message-${Date.now()}-${recipient.id}`,
      userId: session?.user?.id || 'lecturer-1',
      recipientId: recipient.id,
      title: subject || 'Bulk Message',
      message: message.trim(),
      type: 'MESSAGE',
      isRead: false,
      createdAt: new Date().toISOString(),
      user: {
        id: session?.user?.id || 'lecturer-1',
        name: session?.user?.name || 'Dr. Sarah Wilson',
        email: session?.user?.email || 'dr.wilson@example.com',
        studentId: null,
      },
      recipient
    }));

    return NextResponse.json({
      success: true,
      messagesSent: mockMessages.length,
      recipients: validRecipients.map(r => ({ id: r.id, name: r.name })),
      messages: mockMessages
    });
  } catch (error) {
    console.error('Error sending bulk message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
