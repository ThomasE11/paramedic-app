
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = params.id;

    // Mock student data
    const mockStudents = {
      'student-1': {
        id: 'student-1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        studentId: 'STU001',
        createdAt: new Date('2024-01-15').toISOString(),
        progress: [
          {
            id: 'progress-1',
            userId: 'student-1',
            skillId: 'skill-1',
            status: 'COMPLETED',
            completedCount: 5,
            timeSpentMinutes: 120,
            lastAttemptDate: new Date().toISOString(),
            completionDate: new Date().toISOString(),
            selfAssessmentScore: 85,
            skill: {
              id: 'skill-1',
              name: 'CPR Adult',
              description: 'Adult cardiopulmonary resuscitation',
              difficultyLevel: 'INTERMEDIATE',
              category: {
                id: 'bls-1',
                name: 'Basic Life Support',
                colorCode: '#3B82F6',
              }
            }
          },
          {
            id: 'progress-2',
            userId: 'student-1',
            skillId: 'skill-2',
            status: 'IN_PROGRESS',
            completedCount: 2,
            timeSpentMinutes: 45,
            lastAttemptDate: new Date(Date.now() - 86400000).toISOString(),
            completionDate: null,
            selfAssessmentScore: 70,
            skill: {
              id: 'skill-2',
              name: 'AED Use',
              description: 'Automated External Defibrillator operation',
              difficultyLevel: 'BEGINNER',
              category: {
                id: 'bls-1',
                name: 'Basic Life Support',
                colorCode: '#3B82F6',
              }
            }
          }
        ],
        reflections: [
          {
            id: 'reflection-1',
            userId: 'student-1',
            skillId: 'skill-1',
            content: 'Today I practiced CPR on the mannequin. I felt more confident with the compression depth and was able to maintain the correct rate of 100-120 compressions per minute. I need to work on hand positioning as I sometimes drift from the correct placement.',
            isPrivate: false,
            createdAt: new Date().toISOString(),
            skill: {
              id: 'skill-1',
              name: 'CPR Adult',
              description: 'Adult cardiopulmonary resuscitation',
            }
          }
        ]
      },
      'student-2': {
        id: 'student-2',
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        studentId: 'STU002',
        createdAt: new Date('2024-01-16').toISOString(),
        progress: [
          {
            id: 'progress-3',
            userId: 'student-2',
            skillId: 'skill-2',
            status: 'COMPLETED',
            completedCount: 3,
            timeSpentMinutes: 60,
            lastAttemptDate: new Date(Date.now() - 86400000).toISOString(),
            completionDate: new Date(Date.now() - 86400000).toISOString(),
            selfAssessmentScore: 92,
            skill: {
              id: 'skill-2',
              name: 'AED Use',
              description: 'Automated External Defibrillator operation',
              difficultyLevel: 'BEGINNER',
              category: {
                id: 'bls-1',
                name: 'Basic Life Support',
                colorCode: '#3B82F6',
              }
            }
          }
        ],
        reflections: [
          {
            id: 'reflection-2',
            userId: 'student-2',
            skillId: 'skill-2',
            content: 'AED practice went well today. I was able to follow all the voice prompts correctly and remembered to check for breathing and pulse. The pad placement felt natural this time.',
            isPrivate: false,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            skill: {
              id: 'skill-2',
              name: 'AED Use',
              description: 'Automated External Defibrillator operation',
            }
          }
        ]
      },
      'student-3': {
        id: 'student-3',
        name: 'Emma Rodriguez',
        email: 'emma.rodriguez@example.com',
        studentId: 'STU003',
        createdAt: new Date('2024-01-17').toISOString(),
        progress: [
          {
            id: 'progress-4',
            userId: 'student-3',
            skillId: 'skill-3',
            status: 'NOT_STARTED',
            completedCount: 0,
            timeSpentMinutes: 0,
            lastAttemptDate: null,
            completionDate: null,
            selfAssessmentScore: null,
            skill: {
              id: 'skill-3',
              name: 'IV Insertion',
              description: 'Intravenous line insertion technique',
              difficultyLevel: 'ADVANCED',
              category: {
                id: 'als-1',
                name: 'Advanced Life Support',
                colorCode: '#EF4444',
              }
            }
          }
        ],
        reflections: [
          {
            id: 'reflection-3',
            userId: 'student-3',
            skillId: 'skill-3',
            content: 'First attempt at IV insertion. Found it challenging to locate the vein initially. Need more practice with palpation technique before attempting insertion.',
            isPrivate: false,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            skill: {
              id: 'skill-3',
              name: 'IV Insertion',
              description: 'Intravenous line insertion technique',
            }
          }
        ]
      }
    };

    const student = mockStudents[studentId as keyof typeof mockStudents];

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
