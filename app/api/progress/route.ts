import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';

type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'MASTERED';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    // Temporarily allow without authentication for testing
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session?.user?.id || 'student-1';
    const isPreviewMode = request.headers.get('X-Preview-Mode') === 'true';

    // Students can only access their own progress
    if (session?.user?.role === 'STUDENT' && userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Mock progress data
    const mockProgress = [
      {
        id: 'progress-1',
        userId: userId,
        skillId: 'skill-1',
        status: 'COMPLETED' as ProgressStatus,
        completedCount: 5,
        timeSpentMinutes: 0,
        lastAttemptDate: new Date().toISOString(),
        completionDate: new Date().toISOString(),
        selfAssessmentScore: 85,
        completedSteps: ['step-1', 'step-2', 'step-3'],
        isPreview: isPreviewMode,
        skill: {
          id: 'skill-1',
          name: 'CPR Adult',
          description: 'Adult cardiopulmonary resuscitation',
          categoryId: 'bls-1',
          minimumRequirement: 5,
          category: {
            id: 'bls-1',
            name: 'Basic Life Support',
            colorCode: '#3B82F6',
          }
        }
      },
      {
        id: 'progress-2',
        userId: userId,
        skillId: 'skill-2',
        status: 'IN_PROGRESS' as ProgressStatus,
        completedCount: 3,
        timeSpentMinutes: 0,
        lastAttemptDate: new Date(Date.now() - 3600000).toISOString(),
        completionDate: null,
        selfAssessmentScore: null,
        completedSteps: ['step-1', 'step-2'],
        isPreview: isPreviewMode,
        skill: {
          id: 'skill-2',
          name: 'AED Use',
          description: 'Automated external defibrillator use',
          categoryId: 'bls-1',
          minimumRequirement: 3,
          category: {
            id: 'bls-1',
            name: 'Basic Life Support',
            colorCode: '#3B82F6',
          }
        }
      },
      {
        id: 'progress-3',
        userId: userId,
        skillId: 'skill-3',
        status: 'NOT_STARTED' as ProgressStatus,
        completedCount: 0,
        timeSpentMinutes: 0,
        lastAttemptDate: null,
        completionDate: null,
        selfAssessmentScore: null,
        completedSteps: [],
        isPreview: isPreviewMode,
        skill: {
          id: 'skill-3',
          name: 'IV Insertion',
          description: 'Intravenous line insertion',
          categoryId: 'als-1',
          minimumRequirement: 5,
          category: {
            id: 'als-1',
            name: 'Advanced Life Support',
            colorCode: '#EF4444',
          }
        }
      }
    ];

    return NextResponse.json(mockProgress);
  } catch (error) {
    console.error('Error fetching progress:', error);
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

    const { skillId, status, completedSteps, timeSpent, selfAssessmentScore } = await request.json();
    const isPreviewMode = request.headers.get('X-Preview-Mode') === 'true';

    // Mock progress update
    const mockUpdatedProgress = {
      id: `progress-${skillId}`,
      userId: session?.user?.id || 'student-1',
      skillId,
      status: status as ProgressStatus,
      completedCount: completedSteps?.length || 0,
      timeSpentMinutes: timeSpent || 0,
      lastAttemptDate: new Date().toISOString(),
      completionDate: (status === 'COMPLETED' || status === 'MASTERED') ? new Date().toISOString() : null,
      selfAssessmentScore: selfAssessmentScore || null,
      completedSteps: completedSteps || [],
      isPreview: isPreviewMode,
      skill: {
        id: skillId,
        name: 'Mock Skill',
        description: 'Mock skill for development',
        categoryId: 'mock-category',
        minimumRequirement: 5,
        category: {
          id: 'mock-category',
          name: 'Mock Category',
          colorCode: '#6B7280',
        }
      }
    };

    return NextResponse.json(mockUpdatedProgress);
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}