import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { allProcessedSkills, getSkillById } from '@/lib/comprehensive-skills-updated';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
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

    // Generate step-based progress for testing
    const generateStepBasedProgress = () => {
      if (session?.user?.role !== 'STUDENT') return [];
      
      // Calculate progress based on actual skill steps, not random values
      const totalSteps = skill.steps.length;
      const skillId = skill.id;
      
      // For demo purposes, simulate different progress levels based on skill ID
      // In production, this would come from actual database queries
      let completedStepsCount: number;
      let status: string;
      let timeSpentMinutes: number;
      
      // Use deterministic progress based on skill characteristics instead of random
      const skillIndex = parseInt(skillId.replace(/\D/g, '')) || 1;
      const progressPercent = ((skillIndex % 4) + 1) * 0.25; // 25%, 50%, 75%, 100%
      
      completedStepsCount = Math.floor(totalSteps * progressPercent);
      
      if (completedStepsCount === 0) {
        status = 'NOT_STARTED';
        timeSpentMinutes = 0;
      } else if (completedStepsCount >= totalSteps) {
        status = 'COMPLETED';
        timeSpentMinutes = skill.timeEstimateMinutes || 60;
        completedStepsCount = totalSteps; // Ensure we don't exceed total steps
      } else {
        status = 'IN_PROGRESS';
        timeSpentMinutes = Math.floor((completedStepsCount / totalSteps) * (skill.timeEstimateMinutes || 60));
      }
      
      const completedSteps = skill.steps.slice(0, completedStepsCount).map(step => step.stepNumber);
      
      return [{
        id: `progress-${skillId}`,
        userId: session?.user?.id || 'student-1',
        skillId: skill.id,
        status: status,
        completedCount: completedStepsCount,
        timeSpentMinutes: timeSpentMinutes,
        lastAttemptDate: status === 'NOT_STARTED' ? null : new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        completionDate: status === 'COMPLETED' ? new Date().toISOString() : null,
        selfAssessmentScore: status === 'NOT_STARTED' ? null : Math.min(95, 70 + (completedStepsCount / totalSteps) * 25),
        completedSteps: completedSteps,
        attempts: status === 'NOT_STARTED' ? 0 : Math.ceil(completedStepsCount / 3) || 1,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
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
      progress: generateStepBasedProgress(),
    };

    return NextResponse.json(enhancedSkill);
  } catch (error) {
    console.error('Error fetching skill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}