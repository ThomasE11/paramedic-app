
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { allProcessedSkills, categoriesWithCounts } from '@/lib/skills-data';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'LECTURER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Real analytics data using comprehensive skills system
    const totalSkills = allProcessedSkills.length;
    const totalStudents = 25; // This would come from actual database query
    
    const analytics = {
      totalStudents,
      totalSkills,
      totalProgress: 180,
      totalReflections: 89,
      
      // Progress by status
      progressByStatus: {
        NOT_STARTED: 945,
        IN_PROGRESS: 120,
        COMPLETED: 45,
        MASTERED: 15,
      },
      
      // Progress by category (using real categories from skills system)
      progressByCategory: categoriesWithCounts.map(category => ({
        categoryId: category.id,
        categoryName: category.name,
        colorCode: category.colorCode,
        totalSkills: category.skillCount,
        completedProgress: Math.floor(category.skillCount * totalStudents * 0.4), // Mock completion rate
        inProgressProgress: Math.floor(category.skillCount * totalStudents * 0.3), // Mock in-progress rate
      })),
      
      // Time spent by category (using real categories)
      timeByCategory: categoriesWithCounts.map(category => ({
        categoryId: category.id,
        categoryName: category.name,
        totalTime: category.skillCount * 45 + Math.floor(Math.random() * 500), // Mock time data
      })),
      
      // Student completion rates (using real total skills count)
      studentCompletionRates: [
        {
          studentId: 'student-1',
          studentName: 'Sarah Johnson',
          totalSkills: totalSkills,
          completedSkills: Math.floor(totalSkills * 0.844),
          completionRate: 84.4,
          totalTimeSpent: 720,
        },
        {
          studentId: 'student-2',
          studentName: 'Michael Chen',
          totalSkills: totalSkills,
          completedSkills: Math.floor(totalSkills * 0.711),
          completionRate: 71.1,
          totalTimeSpent: 640,
        },
        {
          studentId: 'student-3',
          studentName: 'Emma Rodriguez',
          totalSkills: totalSkills,
          completedSkills: Math.floor(totalSkills * 0.622),
          completionRate: 62.2,
          totalTimeSpent: 580,
        },
        {
          studentId: 'student-4',
          studentName: 'David Wilson',
          totalSkills: totalSkills,
          completedSkills: Math.floor(totalSkills * 0.556),
          completionRate: 55.6,
          totalTimeSpent: 520,
        },
        {
          studentId: 'student-5',
          studentName: 'Lisa Thompson',
          totalSkills: totalSkills,
          completedSkills: Math.floor(totalSkills * 0.489),
          completionRate: 48.9,
          totalTimeSpent: 480,
        },
      ],
      
      // Recent activity
      recentActivity: {
        recentProgress: [
          {
            id: 'progress-1',
            skill: {
              id: 'skill-1',
              name: 'CPR Adult',
              category: { name: 'Basic Life Support' }
            },
            user: { id: 'student-1', name: 'Sarah Johnson' },
            status: 'COMPLETED',
            lastAttemptDate: new Date().toISOString(),
            timeSpentMinutes: 45,
          },
          {
            id: 'progress-2',
            skill: {
              id: 'skill-2',
              name: 'IV Insertion',
              category: { name: 'Advanced Life Support' }
            },
            user: { id: 'student-2', name: 'Michael Chen' },
            status: 'IN_PROGRESS',
            lastAttemptDate: new Date(Date.now() - 3600000).toISOString(),
            timeSpentMinutes: 30,
          },
        ],
        recentReflections: [
          {
            id: 'reflection-1',
            skill: {
              id: 'skill-1',
              name: 'CPR Adult',
              category: { name: 'Basic Life Support' }
            },
            user: { id: 'student-1', name: 'Sarah Johnson' },
            content: 'Great practice session, felt confident with compressions.',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'reflection-2',
            skill: {
              id: 'skill-3',
              name: 'Trauma Assessment',
              category: { name: 'Trauma Care' }
            },
            user: { id: 'student-3', name: 'Emma Rodriguez' },
            content: 'Need more practice with secondary assessment.',
            createdAt: new Date(Date.now() - 1800000).toISOString(),
          },
        ],
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
