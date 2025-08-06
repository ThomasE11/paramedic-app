import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { allProcessedSkills as processedSkills, skillCategories } from '@/lib/skills-data';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Allow students and lecturers (including lecturers in student view mode)
    if (!['STUDENT', 'LECTURER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ 
        error: 'Access denied - Students and Lecturers only' 
      }, { status: 403 });
    }

    // Check if user is a lecturer in student view mode
    const isLecturerInStudentView = session.user.role === 'LECTURER' && session.user.viewMode === 'student';
    const isAdmin = session.user.role === 'ADMIN';

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    // Lecturers in student view mode and admins can see ALL skills
    // Regular students see only their enrolled skills (for now, showing all for development)
    const showAllSkills = isLecturerInStudentView || isAdmin || session.user.role === 'STUDENT';

    // Get all skills from the processed skills data
    let finalSkills = processedSkills.map(skill => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      categoryId: skill.categoryId,
      difficultyLevel: skill.difficultyLevel,
      timeEstimateMinutes: skill.timeEstimateMinutes,
      isCritical: skill.isCritical || false,
      objectives: skill.objectives || [],
      indications: skill.indications || [],
      contraindications: skill.contraindications || [],
      equipment: skill.equipment || [],
      category: skill.category,
      steps: skill.steps,
      // Default progress for development
      progress: {
        status: 'NOT_STARTED',
        totalAttempts: 0,
        completeAttempts: 0,
        totalTimeSpentMinutes: 0,
        completedSteps: [],
        selfAssessmentScore: null
      },
      // Default subject enrollment for development
      subjects: [{
        id: 'default-subject',
        subjectId: 'paramedic-core',
        skillId: skill.id,
        isCore: skill.isCritical || false,
        subject: {
          id: 'paramedic-core',
          code: 'PMC101',
          name: 'Paramedic Core Skills',
          level: 'INTERMEDIATE'
        }
      }]
    }));

    // Apply category filter if provided
    if (categoryId) {
      finalSkills = finalSkills.filter(skill => 
        skill.categoryId && skill.categoryId === categoryId
      );
    }

    // Generate summary statistics
    const summary = {
      totalSubjects: 1, // Development fallback
      totalSkills: finalSkills.length,
      skillsByStatus: {
        NOT_STARTED: finalSkills.length, // All skills start as NOT_STARTED in development
        IN_PROGRESS: 0,
        COMPLETED: 0,
        MASTERED: 0
      },
      skillsByDifficulty: {
        BEGINNER: finalSkills.filter(s => s.difficultyLevel === 'BEGINNER').length,
        INTERMEDIATE: finalSkills.filter(s => s.difficultyLevel === 'INTERMEDIATE').length,
        ADVANCED: finalSkills.filter(s => s.difficultyLevel === 'ADVANCED').length
      },
      totalPracticeTime: 0,
      totalAttempts: 0,
      criticalSkills: finalSkills.filter(s => s.isCritical).length
    };

    // Default subjects - lecturers in student view see all skills available
    const subjects = isLecturerInStudentView || isAdmin ? [{
      id: 'all-skills',
      code: 'ALL', 
      name: 'All Available Skills',
      level: 'ALL_LEVELS',
      description: 'Complete paramedic skills library (Lecturer View)',
      enrolledAt: new Date().toISOString(),
      isActive: true
    }] : [{
      id: 'paramedic-core',
      code: 'PMC101', 
      name: 'Paramedic Core Skills',
      level: 'INTERMEDIATE',
      description: 'Essential paramedic skills and procedures',
      enrolledAt: new Date().toISOString(),
      isActive: true
    }];

    return NextResponse.json({
      success: true,
      subjects,
      skills: finalSkills,
      summary
    });

  } catch (error) {
    console.error('Error fetching enrolled skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrolled skills' },
      { status: 500 }
    );
  }
}