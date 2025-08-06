import { NextRequest, NextResponse } from 'next/server';
export const dynamic = "force-dynamic";
export const runtime = 'nodejs';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Start a new skill attempt
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { skillId } = await request.json();

    if (!skillId) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }

    // Get current progress
    const progress = await prisma.studentProgress.findUnique({
      where: {
        userId_skillId: {
          userId: session.user.id,
          skillId: parseInt(skillId)
        }
      }
    });

    // Create or update progress
    const updatedProgress = await prisma.studentProgress.upsert({
      where: {
        userId_skillId: {
          userId: session.user.id,
          skillId: parseInt(skillId)
        }
      },
      create: {
        userId: session.user.id,
        skillId: parseInt(skillId),
        status: 'IN_PROGRESS',
        totalAttempts: 1,
        currentSessionStart: new Date(),
        lastActivityTime: new Date(),
        isSessionActive: true,
        sessionPaused: false
      },
      update: {
        totalAttempts: { increment: 1 },
        currentSessionStart: new Date(),
        lastActivityTime: new Date(),
        isSessionActive: true,
        sessionPaused: false,
        status: progress?.status === 'NOT_STARTED' ? 'IN_PROGRESS' : progress?.status
      }
    });

    // Create a new skill attempt record
    const attempt = await prisma.skillAttempt.create({
      data: {
        userId: session.user.id,
        skillId: parseInt(skillId),
        attemptNumber: updatedProgress.totalAttempts,
        status: 'IN_PROGRESS',
        startTime: new Date(),
        lastActivityTime: new Date(),
        stepsCompleted: [],
        quizCompleted: false
      }
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      progress: updatedProgress
    });

  } catch (error) {
    console.error('Error starting skill attempt:', error);
    return NextResponse.json(
      { error: 'Failed to start skill attempt' },
      { status: 500 }
    );
  }
}

// Update skill attempt progress (step completion, activity tracking)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      attemptId, 
      stepCompleted, 
      stepsCompleted, 
      activityUpdate = true,
      quizCompleted = false,
      quizScore = null,
      notes = null
    } = await request.json();

    if (!attemptId) {
      return NextResponse.json({ error: 'Attempt ID is required' }, { status: 400 });
    }

    // Get current attempt
    const currentAttempt = await prisma.skillAttempt.findUnique({
      where: { id: attemptId },
      include: { skill: true }
    });

    if (!currentAttempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (currentAttempt.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized access to attempt' }, { status: 403 });
    }

    // Update attempt data
    const updateData: any = {
      lastActivityTime: new Date(),
      updatedAt: new Date()
    };

    if (stepCompleted !== undefined) {
      const currentSteps = currentAttempt.stepsCompleted || [];
      if (!currentSteps.includes(stepCompleted)) {
        updateData.stepsCompleted = [...currentSteps, stepCompleted];
      }
    }

    if (stepsCompleted !== undefined) {
      updateData.stepsCompleted = stepsCompleted;
    }

    if (quizCompleted !== undefined) {
      updateData.quizCompleted = quizCompleted;
    }

    if (quizScore !== null) {
      updateData.quizScore = quizScore;
    }

    if (notes !== null) {
      updateData.notes = notes;
    }

    // Calculate total time if ending
    if (currentAttempt.startTime) {
      const totalMinutes = Math.round(
        (new Date().getTime() - currentAttempt.startTime.getTime()) / (1000 * 60)
      );
      updateData.totalTimeMinutes = totalMinutes;
    }

    const updatedAttempt = await prisma.skillAttempt.update({
      where: { id: attemptId },
      data: updateData
    });

    // Update student progress activity time
    if (activityUpdate) {
      await prisma.studentProgress.update({
        where: {
          userId_skillId: {
            userId: session.user.id,
            skillId: currentAttempt.skillId
          }
        },
        data: {
          lastActivityTime: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      attempt: updatedAttempt
    });

  } catch (error) {
    console.error('Error updating skill attempt:', error);
    return NextResponse.json(
      { error: 'Failed to update skill attempt' },
      { status: 500 }
    );
  }
}

// Complete or end a skill attempt
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      attemptId, 
      completionType, 
      finalQuizScore = null,
      reason = null 
    } = await request.json();

    if (!attemptId || !completionType) {
      return NextResponse.json({ 
        error: 'Attempt ID and completion type are required' 
      }, { status: 400 });
    }

    // Get current attempt
    const currentAttempt = await prisma.skillAttempt.findUnique({
      where: { id: attemptId },
      include: { 
        skill: { include: { steps: true } },
        user: true
      }
    });

    if (!currentAttempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    if (currentAttempt.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized access to attempt' }, { status: 403 });
    }

    const endTime = new Date();
    const totalMinutes = currentAttempt.startTime 
      ? Math.round((endTime.getTime() - currentAttempt.startTime.getTime()) / (1000 * 60))
      : 0;

    // Determine attempt status and completion type
    let attemptStatus: 'COMPLETED' | 'INCOMPLETE' | 'ABANDONED' = 'INCOMPLETE';
    let isComplete = false;

    // Complete attempt = steps completed AND quiz completed
    if (completionType === 'COMPLETE_WITH_QUIZ' && 
        currentAttempt.stepsCompleted.length === currentAttempt.skill.steps.length &&
        currentAttempt.quizCompleted) {
      attemptStatus = 'COMPLETED';
      isComplete = true;
    } else if (completionType === 'STEPS_ONLY' && 
               currentAttempt.stepsCompleted.length === currentAttempt.skill.steps.length) {
      attemptStatus = 'COMPLETED';
      isComplete = true;
    } else if (completionType === 'ABANDONED') {
      attemptStatus = 'ABANDONED';
    }

    // Update attempt record
    const updatedAttempt = await prisma.skillAttempt.update({
      where: { id: attemptId },
      data: {
        status: attemptStatus,
        endTime: endTime,
        totalTimeMinutes: totalMinutes,
        completionType: completionType,
        quizScore: finalQuizScore,
        notes: reason
      }
    });

    // Update student progress
    const progressUpdate: any = {
      lastActivityTime: endTime,
      lastAttemptDate: endTime,
      isSessionActive: false,
      sessionPaused: false,
      currentSessionStart: null
    };

    if (isComplete) {
      progressUpdate.completeAttempts = { increment: 1 };
      progressUpdate.completeTimeMinutes = { increment: totalMinutes };
      
      // Check if this should mark skill as completed
      const currentProgress = await prisma.studentProgress.findUnique({
        where: {
          userId_skillId: {
            userId: session.user.id,
            skillId: currentAttempt.skillId
          }
        }
      });
      
      if (currentProgress && currentProgress.status !== 'MASTERED') {
        progressUpdate.status = 'COMPLETED';
        progressUpdate.completionDate = endTime;
      }
    } else {
      progressUpdate.incompleteAttempts = { increment: 1 };
      progressUpdate.incompleteTimeMinutes = { increment: totalMinutes };
    }

    progressUpdate.totalTimeSpentMinutes = { increment: totalMinutes };

    const updatedProgress = await prisma.studentProgress.update({
      where: {
        userId_skillId: {
          userId: session.user.id,
          skillId: currentAttempt.skillId
        }
      },
      data: progressUpdate
    });

    // Create notification for completion
    if (isComplete) {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'PROGRESS_UPDATE',
          title: 'Skill Practice Completed!',
          message: `You have successfully completed practice for ${currentAttempt.skill.name}`,
          relatedSkillId: currentAttempt.skillId,
          relatedData: { attemptId: attemptId, completionType }
        }
      });
    }

    return NextResponse.json({
      success: true,
      attempt: updatedAttempt,
      progress: updatedProgress,
      isComplete
    });

  } catch (error) {
    console.error('Error completing skill attempt:', error);
    return NextResponse.json(
      { error: 'Failed to complete skill attempt' },
      { status: 500 }
    );
  }
}

// Get attempt history for a skill
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');

    if (!skillId) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }

    const attempts = await prisma.skillAttempt.findMany({
      where: {
        userId: session.user.id,
        skillId: parseInt(skillId)
      },
      include: {
        pauseLogs: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const progress = await prisma.studentProgress.findUnique({
      where: {
        userId_skillId: {
          userId: session.user.id,
          skillId: parseInt(skillId)
        }
      }
    });

    return NextResponse.json({
      success: true,
      attempts,
      progress
    });

  } catch (error) {
    console.error('Error fetching attempt history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attempt history' },
      { status: 500 }
    );
  }
}
