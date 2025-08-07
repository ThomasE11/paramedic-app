import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface SessionData {
  skillId: string;
  action: 'START' | 'UPDATE' | 'PAUSE' | 'RESUME' | 'COMPLETE' | 'ABANDON';
  completedSteps?: number[];
  notes?: string;
  reflection?: any;
  clientTimeSpent?: number; // For validation only
}

// In-memory session tracking for reliability
const activeSessions = new Map<string, {
  studentId: string;
  skillId: string;
  startTime: Date;
  lastUpdateTime: Date;
  isPaused: boolean;
  pausedDuration: number;
  completedSteps: number[];
  totalTimeSpent: number;
}>();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = session.user.id;
    const body: SessionData = await request.json();
    const { skillId, action, completedSteps = [], notes, reflection, clientTimeSpent = 0 } = body;

    const sessionKey = `${studentId}-${skillId}`;
    const now = new Date();

    switch (action) {
      case 'START': {
        // Check for existing active session and clean up
        const existingSession = activeSessions.get(sessionKey);
        if (existingSession) {
          // Complete the existing session first
          await completeSession(sessionKey, existingSession, 'ABANDON');
        }

        // Start new session
        const newSession = {
          studentId,
          skillId,
          startTime: now,
          lastUpdateTime: now,
          isPaused: false,
          pausedDuration: 0,
          completedSteps: [],
          totalTimeSpent: 0,
        };

        activeSessions.set(sessionKey, newSession);

        // Create skill attempt record
        await prisma.skillAttempt.create({
          data: {
            studentId,
            skillId,
            status: 'IN_PROGRESS',
            startTime: now,
            completedSteps: [],
            timeSpentMinutes: 0,
            sessionData: { action: 'START', timestamp: now.toISOString() }
          }
        });

        return NextResponse.json({ 
          success: true, 
          sessionId: sessionKey,
          serverTime: now.toISOString(),
          message: 'Practice session started' 
        });
      }

      case 'UPDATE': {
        const activeSession = activeSessions.get(sessionKey);
        if (!activeSession || activeSession.isPaused) {
          return NextResponse.json({ error: 'No active session found' }, { status: 400 });
        }

        // Calculate server-side time
        const timeSinceLastUpdate = now.getTime() - activeSession.lastUpdateTime.getTime();
        const timeInMinutes = Math.floor(timeSinceLastUpdate / (1000 * 60));
        
        // Only add time if it's reasonable (max 10 minutes per update to prevent manipulation)
        const validTimeToAdd = Math.min(timeInMinutes, 10);
        
        activeSession.totalTimeSpent += validTimeToAdd;
        activeSession.lastUpdateTime = now;
        activeSession.completedSteps = completedSteps;

        // Update database
        await prisma.skillAttempt.updateMany({
          where: {
            studentId,
            skillId,
            status: 'IN_PROGRESS',
            endTime: null
          },
          data: {
            completedSteps,
            timeSpentMinutes: activeSession.totalTimeSpent,
            lastUpdateTime: now,
            sessionData: { 
              action: 'UPDATE', 
              timestamp: now.toISOString(),
              serverTimeSpent: activeSession.totalTimeSpent,
              clientTimeSpent
            }
          }
        });

        return NextResponse.json({ 
          success: true,
          serverTimeSpent: activeSession.totalTimeSpent,
          serverTime: now.toISOString()
        });
      }

      case 'PAUSE': {
        const activeSession = activeSessions.get(sessionKey);
        if (!activeSession) {
          return NextResponse.json({ error: 'No active session found' }, { status: 400 });
        }

        // Calculate and add time before pausing
        const timeSinceLastUpdate = now.getTime() - activeSession.lastUpdateTime.getTime();
        const timeInMinutes = Math.floor(timeSinceLastUpdate / (1000 * 60));
        activeSession.totalTimeSpent += Math.min(timeInMinutes, 10);

        activeSession.isPaused = true;
        activeSession.lastUpdateTime = now;

        return NextResponse.json({ 
          success: true,
          serverTimeSpent: activeSession.totalTimeSpent,
          message: 'Session paused'
        });
      }

      case 'RESUME': {
        const activeSession = activeSessions.get(sessionKey);
        if (!activeSession) {
          return NextResponse.json({ error: 'No session found to resume' }, { status: 400 });
        }

        activeSession.isPaused = false;
        activeSession.lastUpdateTime = now;

        return NextResponse.json({ 
          success: true,
          serverTimeSpent: activeSession.totalTimeSpent,
          message: 'Session resumed'
        });
      }

      case 'COMPLETE': {
        const activeSession = activeSessions.get(sessionKey);
        if (!activeSession) {
          return NextResponse.json({ error: 'No active session found' }, { status: 400 });
        }

        // Calculate final time
        if (!activeSession.isPaused) {
          const finalTime = now.getTime() - activeSession.lastUpdateTime.getTime();
          const finalMinutes = Math.floor(finalTime / (1000 * 60));
          activeSession.totalTimeSpent += Math.min(finalMinutes, 10);
        }

        await completeSession(sessionKey, activeSession, 'COMPLETE', { notes, reflection });

        return NextResponse.json({ 
          success: true,
          serverTimeSpent: activeSession.totalTimeSpent,
          message: 'Practice session completed successfully'
        });
      }

      case 'ABANDON': {
        const activeSession = activeSessions.get(sessionKey);
        if (activeSession) {
          await completeSession(sessionKey, activeSession, 'ABANDON');
        }

        return NextResponse.json({ 
          success: true,
          message: 'Session abandoned'
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Practice session error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');

    if (!skillId) {
      return NextResponse.json({ error: 'skillId is required' }, { status: 400 });
    }

    const studentId = session.user.id;
    const sessionKey = `${studentId}-${skillId}`;
    
    // Check for active session
    const activeSession = activeSessions.get(sessionKey);
    
    if (activeSession) {
      // Calculate current time spent
      let currentTimeSpent = activeSession.totalTimeSpent;
      
      if (!activeSession.isPaused) {
        const currentTime = new Date().getTime() - activeSession.lastUpdateTime.getTime();
        const currentMinutes = Math.floor(currentTime / (1000 * 60));
        currentTimeSpent += Math.min(currentMinutes, 10);
      }

      return NextResponse.json({
        hasActiveSession: true,
        sessionStartTime: activeSession.startTime.toISOString(),
        isPaused: activeSession.isPaused,
        serverTimeSpent: currentTimeSpent,
        completedSteps: activeSession.completedSteps,
        sessionId: sessionKey
      });
    }

    // Get cumulative practice time for this skill
    const skillAttempts = await prisma.skillAttempt.findMany({
      where: {
        studentId,
        skillId,
        status: { in: ['COMPLETED', 'IN_PROGRESS'] }
      },
      select: {
        timeSpentMinutes: true,
        status: true,
        completedSteps: true
      }
    });

    const cumulativeTime = skillAttempts.reduce((total, attempt) => total + (attempt.timeSpentMinutes || 0), 0);
    const lastAttempt = skillAttempts[skillAttempts.length - 1];

    return NextResponse.json({
      hasActiveSession: false,
      cumulativeTimeSpent: cumulativeTime,
      lastCompletedSteps: lastAttempt?.completedSteps || [],
      totalAttempts: skillAttempts.length
    });

  } catch (error) {
    console.error('Error fetching practice session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function completeSession(
  sessionKey: string, 
  activeSession: any, 
  status: 'COMPLETE' | 'ABANDON',
  additionalData?: { notes?: string; reflection?: any }
) {
  const now = new Date();

  try {
    // Update the skill attempt
    await prisma.skillAttempt.updateMany({
      where: {
        studentId: activeSession.studentId,
        skillId: activeSession.skillId,
        status: 'IN_PROGRESS',
        endTime: null
      },
      data: {
        status: status === 'COMPLETE' ? 'COMPLETED' : 'ABANDONED',
        endTime: now,
        timeSpentMinutes: activeSession.totalTimeSpent,
        completedSteps: activeSession.completedSteps,
        notes: additionalData?.notes,
        sessionData: {
          ...additionalData,
          completedAt: now.toISOString(),
          totalDuration: now.getTime() - activeSession.startTime.getTime()
        }
      }
    });

    // Update student progress with cumulative time
    const allAttempts = await prisma.skillAttempt.findMany({
      where: {
        studentId: activeSession.studentId,
        skillId: activeSession.skillId,
        status: { in: ['COMPLETED', 'IN_PROGRESS'] }
      }
    });

    const totalPracticeTime = allAttempts.reduce((sum, attempt) => sum + (attempt.timeSpentMinutes || 0), 0);
    const totalAttempts = allAttempts.length;
    const completedAttempts = allAttempts.filter(a => a.status === 'COMPLETED').length;

    await prisma.studentProgress.upsert({
      where: {
        studentId_skillId: {
          studentId: activeSession.studentId,
          skillId: activeSession.skillId
        }
      },
      update: {
        status: status === 'COMPLETE' ? 'COMPLETED' : 'IN_PROGRESS',
        timeSpentMinutes: totalPracticeTime,
        completedSteps: activeSession.completedSteps,
        totalAttempts,
        completeAttempts: completedAttempts,
        lastPracticedAt: now,
        updatedAt: now
      },
      create: {
        studentId: activeSession.studentId,
        skillId: activeSession.skillId,
        status: status === 'COMPLETE' ? 'COMPLETED' : 'IN_PROGRESS',
        timeSpentMinutes: totalPracticeTime,
        completedSteps: activeSession.completedSteps,
        totalAttempts,
        completeAttempts: completedAttempts,
        lastPracticedAt: now
      }
    });

  } catch (error) {
    console.error('Error completing session:', error);
  } finally {
    // Always remove from active sessions
    activeSessions.delete(sessionKey);
  }
}

// Cleanup stale sessions (run periodically or on server restart)
setInterval(() => {
  const now = new Date();
  const staleThreshold = 30 * 60 * 1000; // 30 minutes

  for (const [sessionKey, session] of activeSessions.entries()) {
    const timeSinceUpdate = now.getTime() - session.lastUpdateTime.getTime();
    
    if (timeSinceUpdate > staleThreshold) {
      console.log(`Cleaning up stale session: ${sessionKey}`);
      completeSession(sessionKey, session, 'ABANDON');
    }
  }
}, 10 * 60 * 1000); // Check every 10 minutes