import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { getSkillsByCategory } from '@/lib/skills-data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Admin skills API called');
    
    const session = await getServerSession(authConfig);
    
    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Session found:', session.user?.email, 'Role:', session.user?.role);

    if (session.user.role !== 'ADMIN') {
      console.log('❌ User is not admin:', session.user?.role);
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    console.log('📊 Loading skills data...');
    const allSkills = getSkillsByCategory(categoryId || undefined);
    console.log('✅ Skills loaded:', allSkills.length);

    const adminSkills = allSkills.map(skill => ({
      ...skill,
      totalSteps: skill.steps?.length || 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    console.log('✅ Returning', adminSkills.length, 'skills to admin');
    return NextResponse.json(adminSkills);
  } catch (error) {
    console.error('❌ Error fetching admin skills:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}