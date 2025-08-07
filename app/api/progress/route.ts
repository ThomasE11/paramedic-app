import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSkillById } from '@/lib/comprehensive-skills-updated';

type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'MASTERED';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;
    
    // Students can only access their own progress
    if (session.user.role === 'STUDENT' && userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch actual progress from database
    const progressData = await prisma.studentProgress.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
          }
        }
      }
    });

    // Enhance progress with skill data from comprehensive skills system
    const enhancedProgress = progressData.map(progress => {
      const skill = getSkillById(progress.skillId.toString());
      
      return {
        id: progress.id,
        userId: progress.userId,
        skillId: progress.skillId.toString(),
        status: progress.status,
        completedCount: (progress.completedSteps as number[])?.length || 0,
        timeSpentMinutes: progress.timeSpentMinutes,
        lastAttemptDate: progress.lastAttemptDate,
        completionDate: progress.completionDate,
        selfAssessmentScore: progress.selfAssessmentScore,
        completedSteps: progress.completedSteps as number[] || [],
        skill: skill ? {
          id: skill.id,
          name: skill.name,
          description: skill.description,
          categoryId: skill.categoryId,
          minimumRequirement: skill.minimumRequirement,
          steps: { length: skill.steps.length },
          category: skill.category
        } : null
      };
    }).filter(progress => progress.skill !== null); // Only return progress for valid skills

    return NextResponse.json(enhancedProgress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { skillId, status, completedSteps, timeSpent, selfAssessmentScore, sessionDuration, isIdle, sessionStartTime } = await request.json();
    
    // Upsert progress in database (create or update)
    const updatedProgress = await prisma.studentProgress.upsert({
      where: {
        userId_skillId: {
          userId: session.user.id,
          skillId: parseInt(skillId)
        }
      },
      update: {
        status: status as any,
        completedSteps: completedSteps || [],
        timeSpentMinutes: timeSpent || 0,
        totalTimeSpent: (timeSpent || 0) + (sessionDuration || 0),
        lastAttemptDate: new Date(),
        completionDate: (status === 'COMPLETED' || status === 'MASTERED') ? new Date() : null,
        selfAssessmentScore: selfAssessmentScore,
        currentSessionTime: sessionDuration || 0,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        skillId: parseInt(skillId),
        status: status as any,
        completedSteps: completedSteps || [],
        timeSpentMinutes: timeSpent || 0,
        totalTimeSpent: timeSpent || 0,
        lastAttemptDate: new Date(),
        completionDate: (status === 'COMPLETED' || status === 'MASTERED') ? new Date() : null,
        selfAssessmentScore: selfAssessmentScore,
        currentSessionTime: sessionDuration || 0,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
          }
        }
      }
    });
    
    // Get skill data from comprehensive skills system
    const skill = getSkillById(skillId);
    
    const responseData = {
      id: updatedProgress.id,
      userId: updatedProgress.userId,
      skillId: skillId,
      status: updatedProgress.status,
      completedCount: (updatedProgress.completedSteps as number[])?.length || 0,
      timeSpentMinutes: updatedProgress.timeSpentMinutes,
      lastAttemptDate: updatedProgress.lastAttemptDate,
      completionDate: updatedProgress.completionDate,
      selfAssessmentScore: updatedProgress.selfAssessmentScore,
      completedSteps: updatedProgress.completedSteps as number[] || [],
      skill: skill ? {
        id: skill.id,
        name: skill.name,
        description: skill.description,
        categoryId: skill.categoryId,
        category: skill.category
      } : null
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}