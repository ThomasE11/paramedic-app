
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Get specific student's subject enrollments
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = params.id;

    // Mock student data with subject enrollments
    const mockStudentData = {
      'student-1': {
        id: 'student-1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        studentId: 'STU001',
        role: 'STUDENT',
        subjects: [
          {
            id: 'enrollment-1',
            userId: 'student-1',
            subjectId: 'subject-1',
            isActive: true,
            enrolledAt: new Date('2024-01-15').toISOString(),
            subject: {
              id: 'subject-1',
              code: 'BLS101',
              name: 'Basic Life Support',
              level: 'BEGINNER',
              description: 'Fundamental life support skills',
              skills: [
                {
                  id: 'subject-skill-1',
                  subjectId: 'subject-1',
                  skillId: 'skill-1',
                  isRequired: true,
                  skill: {
                    id: 'skill-1',
                    name: 'CPR Adult',
                    difficultyLevel: 'INTERMEDIATE',
                    isCritical: true,
                    progress: [
                      {
                        status: 'COMPLETED',
                        completedSteps: ['step-1', 'step-2', 'step-3', 'step-4', 'step-5'],
                        timeSpentMinutes: 120,
                      }
                    ]
                  }
                },
                {
                  id: 'subject-skill-2',
                  subjectId: 'subject-1',
                  skillId: 'skill-2',
                  isRequired: true,
                  skill: {
                    id: 'skill-2',
                    name: 'AED Use',
                    difficultyLevel: 'BEGINNER',
                    isCritical: true,
                    progress: [
                      {
                        status: 'IN_PROGRESS',
                        completedSteps: ['step-1', 'step-2'],
                        timeSpentMinutes: 45,
                      }
                    ]
                  }
                }
              ],
              _count: {
                skills: 2,
                users: 25,
              }
            }
          },
          {
            id: 'enrollment-2',
            userId: 'student-1',
            subjectId: 'subject-2',
            isActive: true,
            enrolledAt: new Date('2024-01-20').toISOString(),
            subject: {
              id: 'subject-2',
              code: 'ALS201',
              name: 'Advanced Life Support',
              level: 'ADVANCED',
              description: 'Advanced emergency medical procedures',
              skills: [
                {
                  id: 'subject-skill-3',
                  subjectId: 'subject-2',
                  skillId: 'skill-3',
                  isRequired: true,
                  skill: {
                    id: 'skill-3',
                    name: 'IV Insertion',
                    difficultyLevel: 'ADVANCED',
                    isCritical: true,
                    progress: [
                      {
                        status: 'NOT_STARTED',
                        completedSteps: [],
                        timeSpentMinutes: 0,
                      }
                    ]
                  }
                }
              ],
              _count: {
                skills: 1,
                users: 15,
              }
            }
          }
        ]
      },
      'student-2': {
        id: 'student-2',
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        studentId: 'STU002',
        role: 'STUDENT',
        subjects: [
          {
            id: 'enrollment-3',
            userId: 'student-2',
            subjectId: 'subject-1',
            isActive: true,
            enrolledAt: new Date('2024-01-15').toISOString(),
            subject: {
              id: 'subject-1',
              code: 'BLS101',
              name: 'Basic Life Support',
              level: 'BEGINNER',
              description: 'Fundamental life support skills',
              skills: [
                {
                  id: 'subject-skill-1',
                  subjectId: 'subject-1',
                  skillId: 'skill-1',
                  isRequired: true,
                  skill: {
                    id: 'skill-1',
                    name: 'CPR Adult',
                    difficultyLevel: 'INTERMEDIATE',
                    isCritical: true,
                    progress: [
                      {
                        status: 'IN_PROGRESS',
                        completedSteps: ['step-1', 'step-2', 'step-3'],
                        timeSpentMinutes: 75,
                      }
                    ]
                  }
                },
                {
                  id: 'subject-skill-2',
                  subjectId: 'subject-1',
                  skillId: 'skill-2',
                  isRequired: true,
                  skill: {
                    id: 'skill-2',
                    name: 'AED Use',
                    difficultyLevel: 'BEGINNER',
                    isCritical: true,
                    progress: [
                      {
                        status: 'COMPLETED',
                        completedSteps: ['step-1', 'step-2', 'step-3'],
                        timeSpentMinutes: 30,
                      }
                    ]
                  }
                }
              ],
              _count: {
                skills: 2,
                users: 25,
              }
            }
          }
        ]
      },
      'student-3': {
        id: 'student-3',
        name: 'Emma Rodriguez',
        email: 'emma.rodriguez@example.com',
        studentId: 'STU003',
        role: 'STUDENT',
        subjects: [
          {
            id: 'enrollment-4',
            userId: 'student-3',
            subjectId: 'subject-2',
            isActive: true,
            enrolledAt: new Date('2024-01-25').toISOString(),
            subject: {
              id: 'subject-2',
              code: 'ALS201',
              name: 'Advanced Life Support',
              level: 'ADVANCED',
              description: 'Advanced emergency medical procedures',
              skills: [
                {
                  id: 'subject-skill-3',
                  subjectId: 'subject-2',
                  skillId: 'skill-3',
                  isRequired: true,
                  skill: {
                    id: 'skill-3',
                    name: 'IV Insertion',
                    difficultyLevel: 'ADVANCED',
                    isCritical: true,
                    progress: [
                      {
                        status: 'NOT_STARTED',
                        completedSteps: [],
                        timeSpentMinutes: 0,
                      }
                    ]
                  }
                }
              ],
              _count: {
                skills: 1,
                users: 15,
              }
            }
          }
        ]
      }
    };

    const student = mockStudentData[studentId as keyof typeof mockStudentData];

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Mock all available subjects
    const allSubjects = [
      {
        id: 'subject-1',
        code: 'BLS101',
        name: 'Basic Life Support',
        level: 'BEGINNER',
        description: 'Fundamental life support skills',
        _count: {
          skills: 2,
          users: 25,
        }
      },
      {
        id: 'subject-2',
        code: 'ALS201',
        name: 'Advanced Life Support',
        level: 'ADVANCED',
        description: 'Advanced emergency medical procedures',
        _count: {
          skills: 1,
          users: 15,
        }
      },
      {
        id: 'subject-3',
        code: 'PEDS301',
        name: 'Pediatric Emergency Care',
        level: 'INTERMEDIATE',
        description: 'Specialized care for pediatric patients',
        _count: {
          skills: 3,
          users: 18,
        }
      },
    ];

    // Calculate enrollment progress for enrolled subjects
    const enrolledSubjects = student.subjects.map(enrollment => {
      const subject = enrollment.subject;
      const totalSkills = subject.skills.length;
      let completedSkills = 0;
      let totalTimeSpent = 0;

      subject.skills.forEach(subjectSkill => {
        const progress = subjectSkill.skill.progress?.[0];
        if (progress?.status === 'COMPLETED' || progress?.status === 'MASTERED') {
          completedSkills++;
        }
        if (progress?.timeSpentMinutes) {
          totalTimeSpent += progress.timeSpentMinutes;
        }
      });

      return {
        ...enrollment,
        subject: {
          ...subject,
          progress: {
            totalSkills,
            completedSkills,
            completionRate: totalSkills > 0 ? (completedSkills / totalSkills) * 100 : 0,
            totalTimeSpent,
          }
        }
      };
    });

    return NextResponse.json({
      student: {
        ...student,
        subjects: enrolledSubjects
      },
      allSubjects,
      enrolledSubjectIds: student.subjects.map(s => s.subjectId)
    });
  } catch (error) {
    console.error('Error fetching student subjects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update student's subject enrollments
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = params.id;
    const body = await request.json();
    const { subjectIds } = body;

    if (!Array.isArray(subjectIds)) {
      return NextResponse.json({ error: 'subjectIds must be an array' }, { status: 400 });
    }

    // Mock enrollment updates
    const mockEnrollments = subjectIds.map(subjectId => ({
      id: `enrollment-${Date.now()}-${subjectId}`,
      userId: studentId,
      subjectId: subjectId,
      isActive: true,
      enrolledAt: new Date().toISOString(),
      subject: {
        id: subjectId,
        code: subjectId === 'subject-1' ? 'BLS101' : subjectId === 'subject-2' ? 'ALS201' : 'PEDS301',
        name: subjectId === 'subject-1' ? 'Basic Life Support' : subjectId === 'subject-2' ? 'Advanced Life Support' : 'Pediatric Emergency Care',
        level: subjectId === 'subject-1' ? 'BEGINNER' : subjectId === 'subject-2' ? 'ADVANCED' : 'INTERMEDIATE',
      }
    }));

    return NextResponse.json(mockEnrollments);
  } catch (error) {
    console.error('Error updating student subjects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
