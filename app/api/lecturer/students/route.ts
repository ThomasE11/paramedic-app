import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock student data for testing
    const mockStudents = [
      {
        id: '1',
        name: 'John Student',
        email: 'john.student@example.com',
        studentId: 'ST001',
        createdAt: new Date().toISOString(),
        progress: [
          {
            id: '1',
            status: 'COMPLETED',
            timeSpentMinutes: 45,
            attempts: 2,
            skill: {
              id: 1,
              name: 'Adult CPR',
              category: {
                id: 1,
                name: 'Basic Life Support',
                colorCode: '#3B82F6'
              }
            }
          },
          {
            id: '2',
            status: 'IN_PROGRESS',
            timeSpentMinutes: 30,
            attempts: 1,
            skill: {
              id: 2,
              name: 'IV Access',
              category: {
                id: 2,
                name: 'Advanced Life Support',
                colorCode: '#10B981'
              }
            }
          }
        ],
        reflections: [
          {
            id: '1',
            rating: 4,
            createdAt: new Date().toISOString(),
            skill: {
              id: 1,
              name: 'Adult CPR'
            }
          }
        ],
        subjects: [
          {
            id: '1',
            subjectId: 1,
            enrolledAt: new Date().toISOString(),
            subject: {
              id: 1,
              code: 'BLS101',
              name: 'Basic Life Support',
              level: 'Beginner',
              _count: {
                skills: 15
              }
            }
          }
        ]
      },
      {
        id: '2',
        name: 'Jane Student',
        email: 'jane.student@example.com',
        studentId: 'ST002',
        createdAt: new Date().toISOString(),
        progress: [
          {
            id: '3',
            status: 'MASTERED',
            timeSpentMinutes: 60,
            attempts: 3,
            skill: {
              id: 3,
              name: 'Trauma Assessment',
              category: {
                id: 3,
                name: 'Trauma Care',
                colorCode: '#F59E0B'
              }
            }
          }
        ],
        reflections: [
          {
            id: '2',
            rating: 5,
            createdAt: new Date().toISOString(),
            skill: {
              id: 3,
              name: 'Trauma Assessment'
            }
          }
        ],
        subjects: [
          {
            id: '2',
            subjectId: 2,
            enrolledAt: new Date().toISOString(),
            subject: {
              id: 2,
              code: 'TC101',
              name: 'Trauma Care',
              level: 'Intermediate',
              _count: {
                skills: 12
              }
            }
          }
        ]
      }
    ];

    return NextResponse.json(mockStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}