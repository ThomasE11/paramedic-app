
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { categoriesWithCounts, getSkillsByCategory } from '@/lib/skills-data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
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
              status: Math.random() > 0.7 ? 'COMPLETED' : Math.random() > 0.4 ? 'IN_PROGRESS' : 'NOT_STARTED',
              completedCount: Math.floor(Math.random() * 5),
              timeSpentMinutes: Math.floor(Math.random() * 60),
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
