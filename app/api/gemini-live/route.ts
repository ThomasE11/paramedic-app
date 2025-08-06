
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface GeminiSession {
  skillId: string;
  sessionId: string;
  isStreaming: boolean;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
}

const sessions = new Map<string, GeminiSession>();

// Simulate AI coaching functionality for demo purposes
// In production, this would integrate with actual Gemini API

async function generateAIFeedback(context: any) {
  // Simulate AI feedback based on context
  const responses = {
    initialization: {
      content: context.content || 'Ready to practice! I\'ll guide you through each step.',
      type: 'guidance'
    },
    tracking_update: {
      content: generateTrackingFeedback(context.data),
      type: 'correction'
    },
    question: {
      content: 'I understand your question about the skill. Let me help you with that step.',
      type: 'guidance'
    },
    default: {
      content: 'Keep practicing! Focus on proper technique and safety.',
      type: 'encouragement'
    }
  };
  
  return responses[context.type as keyof typeof responses] || responses.default;
}

function generateTrackingFeedback(trackingData: any) {
  if (!trackingData) return 'Continue practicing your technique.';
  
  const { accuracyScore, currentStep } = trackingData;
  
  if (accuracyScore > 0.8) {
    return `Excellent technique! You're performing step ${currentStep} very well.`;
  } else if (accuracyScore > 0.6) {
    return `Good progress! Adjust your positioning slightly for better accuracy in step ${currentStep}.`;
  } else {
    return `Try to position your hands more precisely. Focus on the target area for step ${currentStep}.`;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const skillId = searchParams.get('skillId');
  
  if (!skillId) {
    return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
  }
  
  // Return connection info for demo
  return NextResponse.json({ 
    message: 'Gemini Live simulation ready',
    skillId,
    status: 'connected'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skillId, action, data, messageType } = body;
    
    if (!skillId) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }
    
    // Handle different actions
    switch (action) {
      case 'start_session':
        const sessionId = Date.now().toString();
        sessions.set(sessionId, {
          skillId,
          sessionId,
          isStreaming: false,
          conversationHistory: []
        });
        
        return NextResponse.json({ 
          message: 'Session started',
          sessionId,
          status: 'connected'
        });
      
      case 'send_message':
        const feedback = await generateAIFeedback({
          type: messageType || 'default',
          data,
          content: data?.content
        });
        
        return NextResponse.json({
          type: 'feedback',
          content: feedback.content,
          feedbackType: feedback.type,
          timestamp: Date.now()
        });
      
      case 'tracking_update':
        const trackingFeedback = await generateAIFeedback({
          type: 'tracking_update',
          data
        });
        
        return NextResponse.json({
          type: 'feedback',
          content: trackingFeedback.content,
          feedbackType: trackingFeedback.type,
          timestamp: Date.now()
        });
      
      case 'end_session':
        const sessionToEnd = body.sessionId;
        if (sessionToEnd) {
          sessions.delete(sessionToEnd);
        }
        return NextResponse.json({ message: 'Session ended' });
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in Gemini Live API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
