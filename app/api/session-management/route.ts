import { NextRequest, NextResponse } from 'next/server';
export const dynamic = "force-dynamic";
export const runtime = 'nodejs';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Handle inactivity detection and session pausing
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      action, 
      attemptId, 
      skillId, 
      pauseType = 'INACTIVITY',
      reason = null 
    } = await request.json();

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    switch (action) {
      case 'pause_session':
        return await pauseSession(session.user.id, attemptId, skillId, pauseType, reason);
      
      case 'resume_session':
        return await resumeSession(session.user.id, attemptId, skillId);
      
      case 'check_inactivity':
        return await checkInactivity(session.user.id, attemptId, skillId);
      
      case 'heartbeat':
        return await updateHeartbeat(session.user.id, attemptId, skillId);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in session management:', error);
    return NextResponse.json(
      { error: 'Session management failed' },
      { status: 500 }
    );
  }
}

async function pauseSession(
  userId: string, 
  attemptId: string | null, 
  skillId: number | null, 
  pauseType: string, 
  reason: string | null
) {
  if (!attemptId && !skillId) {
    return NextResponse.json({ 
      error: 'Either attemptId or skillId is required' 
    }, { status: 400 });
  }

  const now = new Date();

  // If we have attemptId, work with specific attempt
  if (attemptId) {
    const attempt = await prisma.skillAttempt.findUnique({
      where: { id: attemptId },
      include: { skill: true }
    });

    if (!attempt || attempt.userId !== userId) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    // Update attempt status
    await prisma.skillAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'PAUSED',
        lastActivityTime: now,
        pausedCount: { increment: 1 },
        inactivityPauses: pauseType === 'INACTIVITY' ? { increment: 1 } : undefined,
        manualPauses: pauseType === 'MANUAL' ? { increment: 1 } : undefined
      }
    });

    // Create pause log
    await prisma.skillAttemptPause.create({
      data: {
        attemptId: attemptId,
        pauseType: pauseType as any,
        pauseTime: now,
        reason: reason
      }
    });

    skillId = attempt.skillId;
  }

  // Update student progress
  await prisma.studentProgress.update({
    where: {
      userId_skillId: {
        userId: userId,
        skillId: skillId!
      }
    },
    data: {
      sessionPaused: true,
      pauseReason: reason || pauseType,
      lastActivityTime: now
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Session paused',
    pauseType: pauseType,
    timestamp: now
  });
}

async function resumeSession(
  userId: string, 
  attemptId: string | null, 
  skillId: number | null
) {
  if (!attemptId && !skillId) {
    return NextResponse.json({ 
      error: 'Either attemptId or skillId is required' 
    }, { status: 400 });
  }

  const now = new Date();

  // If we have attemptId, work with specific attempt
  if (attemptId) {
    const attempt = await prisma.skillAttempt.findUnique({
      where: { id: attemptId },
      include: { 
        skill: true,
        pauseLogs: {
          where: { resumeTime: null },
          orderBy: { pauseTime: 'desc' },
          take: 1
        }
      }
    });

    if (!attempt || attempt.userId !== userId) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    // Update attempt status
    await prisma.skillAttempt.update({
      where: { id: attemptId },
      data: {
        status: 'IN_PROGRESS',
        lastActivityTime: now
      }
    });

    // Update the most recent pause log
    if (attempt.pauseLogs.length > 0) {
      const pauseLog = attempt.pauseLogs[0];
      const pauseDuration = Math.round(
        (now.getTime() - pauseLog.pauseTime.getTime()) / 1000
      );

      await prisma.skillAttemptPause.update({
        where: { id: pauseLog.id },
        data: {
          resumeTime: now,
          duration: pauseDuration
        }
      });
    }

    skillId = attempt.skillId;
  }

  // Update student progress
  await prisma.studentProgress.update({
    where: {
      userId_skillId: {
        userId: userId,
        skillId: skillId!
      }
    },
    data: {
      sessionPaused: false,
      pauseReason: null,
      lastActivityTime: now,
      isSessionActive: true
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Session resumed',
    timestamp: now
  });
}

async function checkInactivity(
  userId: string, 
  attemptId: string | null, 
  skillId: number | null
) {
  if (!attemptId && !skillId) {
    return NextResponse.json({ 
      error: 'Either attemptId or skillId is required' 
    }, { status: 400 });
  }

  const now = new Date();
  const inactivityThreshold = 60 * 1000; // 1 minute in milliseconds

  // Get current progress
  let progress;
  if (skillId) {
    progress = await prisma.studentProgress.findUnique({
      where: {
        userId_skillId: {
          userId: userId,
          skillId: skillId
        }
      }
    });
  } else if (attemptId) {
    const attempt = await prisma.skillAttempt.findUnique({
      where: { id: attemptId }
    });
    if (attempt) {
      progress = await prisma.studentProgress.findUnique({
        where: {
          userId_skillId: {
            userId: userId,
            skillId: attempt.skillId
          }
        }
      });
      skillId = attempt.skillId;
    }
  }

  if (!progress) {
    return NextResponse.json({ error: 'Progress not found' }, { status: 404 });
  }

  // Check if session is inactive
  const lastActivity = progress.lastActivityTime;
  const timeSinceLastActivity = lastActivity 
    ? now.getTime() - lastActivity.getTime()
    : inactivityThreshold + 1;

  const isInactive = timeSinceLastActivity > inactivityThreshold;

  // If inactive and session is still active, auto-pause
  if (isInactive && progress.isSessionActive && !progress.sessionPaused) {
    await pauseSession(userId, attemptId, skillId!, 'INACTIVITY', 'Auto-paused due to inactivity');
    
    return NextResponse.json({
      success: true,
      isInactive: true,
      autoPaused: true,
      timeSinceLastActivity: Math.round(timeSinceLastActivity / 1000),
      message: 'Session auto-paused due to inactivity'
    });
  }

  return NextResponse.json({
    success: true,
    isInactive: isInactive,
    autoPaused: false,
    timeSinceLastActivity: Math.round(timeSinceLastActivity / 1000),
    sessionActive: progress.isSessionActive,
    sessionPaused: progress.sessionPaused
  });
}

async function updateHeartbeat(
  userId: string, 
  attemptId: string | null, 
  skillId: number | null
) {
  if (!attemptId && !skillId) {
    return NextResponse.json({ 
      error: 'Either attemptId or skillId is required' 
    }, { status: 400 });
  }

  const now = new Date();

  // Update attempt if provided
  if (attemptId) {
    const attempt = await prisma.skillAttempt.findUnique({
      where: { id: attemptId }
    });

    if (attempt && attempt.userId === userId) {
      await prisma.skillAttempt.update({
        where: { id: attemptId },
        data: { lastActivityTime: now }
      });
      skillId = attempt.skillId;
    }
  }

  // Update progress
  if (skillId) {
    await prisma.studentProgress.update({
      where: {
        userId_skillId: {
          userId: userId,
          skillId: skillId
        }
      },
      data: {
        lastActivityTime: now
      }
    });
  }

  return NextResponse.json({
    success: true,
    timestamp: now
  });
}

// GET endpoint to check current session status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');
    const attemptId = searchParams.get('attemptId');

    if (!skillId && !attemptId) {
      return NextResponse.json({ 
        error: 'Either skillId or attemptId is required' 
      }, { status: 400 });
    }

    let progress;
    let attempt = null;

    if (attemptId) {
      attempt = await prisma.skillAttempt.findUnique({
        where: { id: attemptId },
        include: {
          pauseLogs: {
            orderBy: { pauseTime: 'desc' },
            take: 5
          }
        }
      });

      if (attempt && attempt.userId === session.user.id) {
        progress = await prisma.studentProgress.findUnique({
          where: {
            userId_skillId: {
              userId: session.user.id,
              skillId: attempt.skillId
            }
          }
        });
      }
    } else if (skillId) {
      progress = await prisma.studentProgress.findUnique({
        where: {
          userId_skillId: {
            userId: session.user.id,
            skillId: parseInt(skillId)
          }
        }
      });

      // Get current active attempt if any
      attempt = await prisma.skillAttempt.findFirst({
        where: {
          userId: session.user.id,
          skillId: parseInt(skillId),
          status: { in: ['IN_PROGRESS', 'PAUSED'] }
        },
        include: {
          pauseLogs: {
            orderBy: { pauseTime: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    const now = new Date();
    const lastActivity = progress?.lastActivityTime;
    const timeSinceLastActivity = lastActivity 
      ? Math.round((now.getTime() - lastActivity.getTime()) / 1000)
      : null;

    return NextResponse.json({
      success: true,
      progress: progress,
      attempt: attempt,
      currentTime: now,
      timeSinceLastActivity: timeSinceLastActivity,
      isInactive: timeSinceLastActivity ? timeSinceLastActivity > 60 : false
    });

  } catch (error) {
    console.error('Error getting session status:', error);
    return NextResponse.json(
      { error: 'Failed to get session status' },
      { status: 500 }
    );
  }
}