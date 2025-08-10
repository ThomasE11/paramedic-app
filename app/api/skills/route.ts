
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { getSkillsByCategory } from '@/lib/comprehensive-skills-updated';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const includeProgress = searchParams.get('includeProgress') === 'true';

    const allSkills = getSkillsByCategory(categoryId || undefined);

    if (includeProgress && session.user.role === 'STUDENT') {
      const skillIds = allSkills.map(skill => skill.id);
      const progressData = await prisma.studentProgress.findMany({
        where: {
          userId: session.user.id,
          skillId: { in: skillIds },
        },
      });

      const skillsWithProgress = allSkills.map(skill => {
        const progress = progressData.filter(p => p.skillId === skill.id);
        return {
          ...skill,
          progress,
        };
      });

      return NextResponse.json(skillsWithProgress);
    }

    return NextResponse.json(allSkills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
