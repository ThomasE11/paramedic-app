import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// In-memory storage for messages (in production, this would be a database)
let messages: any[] = [
  {
    id: 'msg-1',
    fromId: 'lecturer-dev-123',
    fromName: 'Test Lecturer',
    fromRole: 'LECTURER',
    toId: 'student-dev-123',
    toName: 'Test Student',
    subject: 'CPR Practice Feedback',
    content: 'Great work on your CPR practice today! I noticed significant improvement in your compression depth.',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'msg-2',
    fromId: 'lecturer-dev-123',
    fromName: 'Test Lecturer',
    fromRole: 'LECTURER',
    toId: 'student-dev-123',
    toName: 'Test Student',
    subject: 'IV Insertion Preparation',
    content: 'Please review the IV insertion technique video before next class.',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

let conversations: any[] = [];

// Initialize conversations from messages
function updateConversations() {
  const conversationMap = new Map();
  
  messages.forEach(message => {
    const otherUserId = message.fromId;
    const otherUserName = message.fromName;
    const otherUserRole = message.fromRole;
    
    const key = `${message.fromId}-${message.toId}`;
    const reverseKey = `${message.toId}-${message.fromId}`;
    
    let existingKey = conversationMap.has(key) ? key : conversationMap.has(reverseKey) ? reverseKey : key;
    
    if (!conversationMap.has(existingKey)) {
      conversationMap.set(existingKey, {
        id: existingKey,
        participants: [message.fromId, message.toId],
        participantNames: [message.fromName, message.toName],
        lastMessage: message.content,
        lastMessageAt: message.createdAt,
        messages: []
      });
    }
    
    conversationMap.get(existingKey).messages.push(message);
    
    // Update last message if this message is newer
    if (new Date(message.createdAt) > new Date(conversationMap.get(existingKey).lastMessageAt)) {
      conversationMap.get(existingKey).lastMessage = message.content;
      conversationMap.get(existingKey).lastMessageAt = message.createdAt;
    }
  });
  
  conversations = Array.from(conversationMap.values());
}

// Initialize conversations
updateConversations();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const userId = session.user.id;

    if (conversationId) {
      // Get messages for a specific conversation
      const conversation = conversations.find(conv => 
        conv.id === conversationId && conv.participants.includes(userId)
      );
      
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      return NextResponse.json({
        conversation,
        messages: conversation.messages.sort((a: any, b: any) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      });
    } else {
      // Get all conversations for the user
      const userConversations = conversations
        .filter(conv => conv.participants.includes(userId))
        .map(conv => {
          const otherParticipantId = conv.participants.find((id: string) => id !== userId);
          const otherParticipantName = conv.participantNames.find((name: string, index: number) => 
            conv.participants[index] !== userId
          );
          
          // Get the other participant's role from the latest message
          const latestMessage = conv.messages[conv.messages.length - 1];
          const otherParticipantRole = latestMessage?.fromId === userId ? 
            (latestMessage?.toRole || 'STUDENT') : 
            (latestMessage?.fromRole || 'LECTURER');

          const unreadCount = conv.messages.filter((msg: any) => 
            msg.toId === userId && !msg.isRead
          ).length;

          return {
            id: conv.id,
            participantId: otherParticipantId,
            participantName: otherParticipantName,
            participantRole: otherParticipantRole,
            lastMessage: conv.lastMessage,
            lastMessageAt: conv.lastMessageAt,
            unreadCount,
            messages: conv.messages
          };
        })
        .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

      return NextResponse.json(userConversations);
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { toId, toName, subject, content } = await request.json();

    if (!toId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newMessage = {
      id: `msg-${Date.now()}`,
      fromId: session.user.id,
      fromName: session.user.name,
      fromRole: session.user.role,
      toId,
      toName,
      subject: subject || 'Message',
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    messages.push(newMessage);
    updateConversations();

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, isRead } = await request.json();

    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (messages[messageIndex].toId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    messages[messageIndex].isRead = isRead;
    messages[messageIndex].updatedAt = new Date().toISOString();

    updateConversations();

    return NextResponse.json(messages[messageIndex]);
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}