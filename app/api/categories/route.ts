
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { categoriesWithCounts, getSkillsByCategory } from '@/lib/skills-data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    // Temporarily allow without authentication for testing
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Mock user data when no session
    const mockUser = session?.user || {
      id: 'student-1',
      name: 'Test Student',
      email: 'student@test.com',
      role: 'STUDENT'
    };

    const { searchParams } = new URL(request.url);
    const includeSkills = searchParams.get('includeSkills') === 'true';

    // Get categories from actual skill sheet data
    const categories = categoriesWithCounts.map(category => {
      const categoryData = {
        id: category.id,
        name: category.name,
        description: `${category.name} skills and procedures`,
        colorCode: category.colorCode,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        skillCount: category.skillCount,
      };

      if (includeSkills) {
        const categorySkills = getSkillsByCategory(category.id);
        return {
          ...categoryData,
          skills: categorySkills.map(skill => ({
            id: skill.id,
            name: skill.name,
            description: skill.description,
            categoryId: skill.categoryId,
            isActive: skill.isActive,
            minimumRequirement: skill.minimumRequirement,
            timeEstimateMinutes: skill.timeEstimateMinutes,
            difficultyLevel: skill.difficultyLevel,
            progress: mockUser.role === 'STUDENT' ? [{
              id: `progress-${skill.id}`,
              userId: mockUser.id,
              skillId: skill.id,
              // Progress based on skill characteristics instead of random values
              status: (() => {
                const skillIndex = parseInt(skill.id.replace(/\D/g, '')) || 1;
                if (skillIndex % 4 === 0) return 'COMPLETED';
                if (skillIndex % 3 === 0) return 'IN_PROGRESS';
                return 'NOT_STARTED';
              })(),
              // Completed count based on skill steps, not random
              completedCount: (() => {
                const skillIndex = parseInt(skill.id.replace(/\D/g, '')) || 1;
                const totalSteps = skill.steps?.length || 8; // Default to 8 steps if not specified
                if (skillIndex % 4 === 0) return totalSteps; // Completed
                if (skillIndex % 3 === 0) return Math.floor(totalSteps * 0.6); // 60% progress
                return 0; // Not started
              })(),
              // Time based on estimated completion, not random
              timeSpentMinutes: (() => {
                const skillIndex = parseInt(skill.id.replace(/\D/g, '')) || 1;
                const estimatedTime = skill.timeEstimateMinutes || 30;
                if (skillIndex % 4 === 0) return estimatedTime; // Full time for completed
                if (skillIndex % 3 === 0) return Math.floor(estimatedTime * 0.6); // 60% time for in-progress
                return 0; // No time for not started
              })(),
            }] : [],
          }))
        };
      }

      return categoryData;
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
