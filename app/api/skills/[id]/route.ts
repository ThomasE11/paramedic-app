import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { allProcessedSkills, getSkillById } from '@/lib/comprehensive-skills-updated';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Temporarily allow without authentication for testing
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const skillId = params.id;
    
    // Get skill from comprehensive skills system
    const skill = getSkillById(skillId);

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    // Generate mock progress for testing
    const generateMockProgress = () => {
      if (session?.user?.role !== 'STUDENT') return [];
      
      const progressStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'MASTERED'];
      const randomStatus = progressStatuses[Math.floor(Math.random() * progressStatuses.length)];
      const completedStepsCount = randomStatus === 'NOT_STARTED' ? 0 : 
                                  randomStatus === 'COMPLETED' || randomStatus === 'MASTERED' ? skill.steps.length :
                                  Math.floor(Math.random() * skill.steps.length);
      
      return [{
        id: `progress-${skillId}`,
        userId: session?.user?.id || 'student-1',
        skillId: skill.id,
        status: randomStatus,
        completedCount: randomStatus === 'NOT_STARTED' ? 0 : Math.floor(Math.random() * 5) + 1,
        timeSpentMinutes: randomStatus === 'NOT_STARTED' ? 0 : Math.floor(Math.random() * 180) + 30,
        lastAttemptDate: randomStatus === 'NOT_STARTED' ? null : new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        completionDate: randomStatus === 'COMPLETED' || randomStatus === 'MASTERED' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        selfAssessmentScore: randomStatus === 'NOT_STARTED' ? null : Math.floor(Math.random() * 40) + 60,
        completedSteps: skill.steps.slice(0, completedStepsCount).map(step => step.id),
        attempts: randomStatus === 'NOT_STARTED' ? 0 : Math.floor(Math.random() * 5) + 1,
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }];
    };

    // Convert our skill format to the expected API format
    const enhancedSkill = {
      id: skill.id,
      name: skill.name,
      description: skill.description,
      categoryId: skill.categoryId,
      isActive: skill.isActive,
      minimumRequirement: skill.minimumRequirement,
      timeEstimateMinutes: skill.timeEstimateMinutes,
      estimatedTimeMinutes: skill.timeEstimateMinutes, // alias for frontend
      difficultyLevel: skill.difficultyLevel,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
      category: skill.category,
      isCritical: skill.isCritical,
      objectives: skill.objectives,
      indications: skill.indications,
      contraindications: skill.contraindications,
      equipment: skill.equipment?.map((item, index) => 
        typeof item === 'string' 
          ? { item, required: index < 3 } // Mark first 3 as required
          : { item, required: item.required !== false }
      ) || [],
      steps: skill.steps.map(step => ({
        id: step.id,
        skillId: skill.id,
        stepNumber: step.stepNumber,
        title: step.title,
        description: step.description,
        keyPoints: step.keyPoints || [],
        isCritical: step.isCritical,
        timeEstimate: step.timeEstimate || 60,
        isRequired: step.isRequired,
        equipment: null, // Individual steps don't have equipment in our model
        duration: (step.timeEstimate || 60) * 60, // Convert minutes to seconds
        createdAt: skill.createdAt,
        updatedAt: skill.updatedAt,
      })),
      assessmentCriteria: skill.assessmentCriteria,
      quizQuestions: [], // We'll generate these dynamically via Gemini
      progress: generateMockProgress(),
    };

    return NextResponse.json(enhancedSkill);
  } catch (error) {
    console.error('Error fetching skill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}