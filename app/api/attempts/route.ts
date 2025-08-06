import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface Attempt {
  id: string;
  userId: string;
  skillId: string;
  skillName: string;
  status: 'COMPLETE' | 'INCOMPLETE';
  startTime: string;
  endTime?: string;
  totalSteps: number;
  completedSteps: number;
  timeSpentMinutes: number;
  reflectionCompleted?: boolean;
  createdAt: string;
}

// In-memory storage for attempts (in production, this would be a database)
let attempts: Attempt[] = [];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    // Temporarily allow without authentication for testing
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session?.user?.id || 'student-1';
    const skillId = searchParams.get('skillId');

    // Filter attempts for user and optionally by skill
    let userAttempts = attempts.filter(attempt => attempt.userId === userId);
    
    if (skillId) {
      userAttempts = userAttempts.filter(attempt => attempt.skillId === skillId);
    }

    // Sort by creation date, most recent first
    userAttempts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      attempts: userAttempts,
      totalAttempts: userAttempts.length,
      completedAttempts: userAttempts.filter(a => a.status === 'COMPLETE').length,
      incompleteAttempts: userAttempts.filter(a => a.status === 'INCOMPLETE').length,
    });
  } catch (error) {
    console.error('Error fetching attempts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    // Temporarily allow without authentication for testing
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { 
      skillId, 
      skillName,
      action,
      totalSteps,
      completedSteps,
      timeSpentMinutes,
      reflectionCompleted 
    } = await request.json();

    const userId = session?.user?.id || 'student-1';

    if (action === 'START') {
      // Create a new attempt when practice starts
      const newAttempt: Attempt = {
        id: `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        skillId,
        skillName,
        status: 'INCOMPLETE',
        startTime: new Date().toISOString(),
        totalSteps: totalSteps || 0,
        completedSteps: 0,
        timeSpentMinutes: 0,
        createdAt: new Date().toISOString(),
      };

      attempts.push(newAttempt);

      return NextResponse.json({
        success: true,
        attempt: newAttempt,
        message: 'Practice attempt started'
      });

    } else if (action === 'UPDATE') {
      // Find the most recent incomplete attempt for this user and skill
      const activeAttempt = attempts
        .filter(a => a.userId === userId && a.skillId === skillId && a.status === 'INCOMPLETE')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      if (activeAttempt) {
        // Update the attempt
        activeAttempt.completedSteps = completedSteps || 0;
        activeAttempt.timeSpentMinutes = timeSpentMinutes || 0;

        return NextResponse.json({
          success: true,
          attempt: activeAttempt,
          message: 'Practice attempt updated'
        });
      }

      return NextResponse.json({ error: 'No active attempt found' }, { status: 404 });

    } else if (action === 'COMPLETE') {
      // Mark attempt as complete when skill practice finishes
      const activeAttempt = attempts
        .filter(a => a.userId === userId && a.skillId === skillId && a.status === 'INCOMPLETE')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      if (activeAttempt) {
        activeAttempt.status = 'COMPLETE';
        activeAttempt.endTime = new Date().toISOString();
        activeAttempt.completedSteps = completedSteps || activeAttempt.completedSteps;
        activeAttempt.timeSpentMinutes = timeSpentMinutes || activeAttempt.timeSpentMinutes;
        activeAttempt.reflectionCompleted = reflectionCompleted || false;

        return NextResponse.json({
          success: true,
          attempt: activeAttempt,
          message: 'Practice attempt completed'
        });
      }

      return NextResponse.json({ error: 'No active attempt found' }, { status: 404 });

    } else if (action === 'ABANDON') {
      // Mark attempt as incomplete when practice is abandoned
      const activeAttempt = attempts
        .filter(a => a.userId === userId && a.skillId === skillId && a.status === 'INCOMPLETE')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      if (activeAttempt) {
        activeAttempt.endTime = new Date().toISOString();
        activeAttempt.completedSteps = completedSteps || activeAttempt.completedSteps;
        activeAttempt.timeSpentMinutes = timeSpentMinutes || activeAttempt.timeSpentMinutes;
        // status remains 'INCOMPLETE'

        return NextResponse.json({
          success: true,
          attempt: activeAttempt,
          message: 'Practice attempt marked as incomplete'
        });
      }

      return NextResponse.json({ error: 'No active attempt found' }, { status: 404 });

    } else if (action === 'REFLECTION_COMPLETE') {
      // Mark reflection as completed for the most recent complete attempt
      const recentCompleteAttempt = attempts
        .filter(a => a.userId === userId && a.skillId === skillId && a.status === 'COMPLETE')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      if (recentCompleteAttempt) {
        recentCompleteAttempt.reflectionCompleted = true;

        return NextResponse.json({
          success: true,
          attempt: recentCompleteAttempt,
          message: 'Reflection completed for attempt'
        });
      }

      return NextResponse.json({ error: 'No recent complete attempt found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing attempt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}