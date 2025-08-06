
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    // Temporarily allow without authentication for testing
    // if (!session || session.user.role !== 'LECTURER') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const skillId = searchParams.get('skillId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Mock student reflections data
    const mockReflections = [
      {
        id: 'reflection-1',
        userId: 'student-1',
        skillId: 'skill-1',
        content: 'Today I practiced CPR on the mannequin. I felt more confident with the compression depth and was able to maintain the correct rate of 100-120 compressions per minute. I need to work on hand positioning as I sometimes drift from the correct placement.',
        isPrivate: false,
        rating: 4,
        whatWentWell: 'I maintained proper compression depth and rate throughout the session. My hand positioning was generally correct.',
        whatToimprove: 'Need to work on consistent hand placement and avoid drifting from the correct position on the sternum.',
        futureGoals: 'Practice more on mannequin to build muscle memory for proper hand positioning. Focus on maintaining form throughout entire session.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: 'student-1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          studentId: 'STU001',
        },
        skill: {
          id: 'skill-1',
          name: 'CPR Adult',
          category: {
            name: 'Basic Life Support',
            colorCode: '#3B82F6',
          }
        }
      },
      {
        id: 'reflection-2',
        userId: 'student-2',
        skillId: 'skill-2',
        content: 'AED practice went well today. I was able to follow all the voice prompts correctly and remembered to check for breathing and pulse. The pad placement felt natural this time.',
        isPrivate: false,
        rating: 5,
        whatWentWell: 'Successfully followed all voice prompts and correctly placed AED pads. Checked for breathing and pulse before starting.',
        whatToimprove: 'Could be faster in the initial assessment phase. Need to work on scene safety checks.',
        futureGoals: 'Practice more scenarios to improve response time and include more comprehensive scene safety assessments.',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        user: {
          id: 'student-2',
          name: 'Michael Chen',
          email: 'michael.chen@example.com',
          studentId: 'STU002',
        },
        skill: {
          id: 'skill-2',
          name: 'AED Use',
          category: {
            name: 'Basic Life Support',
            colorCode: '#3B82F6',
          }
        }
      },
      {
        id: 'reflection-3',
        userId: 'student-3',
        skillId: 'skill-3',
        content: 'First attempt at IV insertion. Found it challenging to locate the vein initially. Need more practice with palpation technique before attempting insertion.',
        isPrivate: false,
        rating: 3,
        whatWentWell: 'Successfully completed the procedure with supervision. Good sterile technique throughout.',
        whatToimprove: 'Need to improve vein palpation skills and gain more confidence with needle insertion angle.',
        futureGoals: 'Practice more IV insertions on training arms. Focus on developing better tactile skills for vein location.',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        user: {
          id: 'student-3',
          name: 'Emma Rodriguez',
          email: 'emma.rodriguez@example.com',
          studentId: 'STU003',
        },
        skill: {
          id: 'skill-3',
          name: 'IV Insertion',
          category: {
            name: 'Advanced Life Support',
            colorCode: '#EF4444',
          }
        }
      },
    ];

    // Mock video analysis sessions
    const mockVideoSessions = [
      {
        id: 'video-1',
        userId: 'student-1',
        skillId: 'skill-1',
        sessionId: 'session-1',
        status: 'COMPLETED',
        videoDuration: 180,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        user: {
          id: 'student-1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          studentId: 'STU001',
        },
        skill: {
          id: 'skill-1',
          name: 'CPR Adult',
          category: {
            name: 'Basic Life Support',
            colorCode: '#3B82F6',
          }
        },
        analysisResults: [
          {
            id: 'result-1',
            overallScore: 85.2,
            techniqueScore: 88.5,
            sequenceScore: 82.0,
            timingScore: 85.8,
            overallFeedback: 'Good compression technique with consistent depth and rate. Hand placement needs minor adjustment for optimal positioning.',
            strengths: [
              'Maintained proper compression depth throughout session',
              'Consistent rate of 100-120 compressions per minute',
              'Good recovery between compressions',
              'Effective ventilation technique'
            ],
            areasForImprovement: [
              'Hand placement occasionally drifts from optimal position',
              'Could improve consistency in hand interlocking',
              'Work on maintaining straight arms throughout'
            ],
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          }
        ]
      },
      {
        id: 'video-2',
        userId: 'student-2',
        skillId: 'skill-2',
        sessionId: 'session-2',
        status: 'COMPLETED',
        videoDuration: 145,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
        user: {
          id: 'student-2',
          name: 'Michael Chen',
          email: 'michael.chen@example.com',
          studentId: 'STU002',
        },
        skill: {
          id: 'skill-2',
          name: 'AED Use',
          category: {
            name: 'Basic Life Support',
            colorCode: '#3B82F6',
          }
        },
        analysisResults: [
          {
            id: 'result-2',
            overallScore: 92.5,
            techniqueScore: 94.0,
            sequenceScore: 91.5,
            timingScore: 92.0,
            overallFeedback: 'Excellent AED operation with perfect adherence to safety protocols. All steps executed correctly and efficiently.',
            strengths: [
              'Perfect pad placement and positioning',
              'Clear and confident voice commands',
              'Excellent safety awareness throughout',
              'Proper scene assessment before starting'
            ],
            areasForImprovement: [
              'Could work on faster initial response time',
              'Practice with different patient positioning scenarios'
            ],
            createdAt: new Date(Date.now() - 7200000).toISOString(),
          }
        ]
      },
      {
        id: 'video-3',
        userId: 'student-3',
        skillId: 'skill-3',
        sessionId: 'session-3',
        status: 'PROCESSING',
        videoDuration: 220,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
        user: {
          id: 'student-3',
          name: 'Emma Rodriguez',
          email: 'emma.rodriguez@example.com',
          studentId: 'STU003',
        },
        skill: {
          id: 'skill-3',
          name: 'IV Insertion',
          category: {
            name: 'Advanced Life Support',
            colorCode: '#EF4444',
          }
        },
        analysisResults: []
      },
    ];

    // Mock progress data
    const mockProgressData = [
      {
        id: 'progress-1',
        userId: 'student-1',
        skillId: 'skill-1',
        status: 'COMPLETED',
        attempts: 5,
        timeSpentMinutes: 120,
        completedSteps: ['assessment', 'positioning', 'compression', 'ventilation', 'aed_use'],
        instructorNotes: 'Excellent progress on CPR technique. Shows great improvement in compression depth and rate consistency.',
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: 'student-1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          studentId: 'STU001',
        },
        skill: {
          id: 'skill-1',
          name: 'CPR Adult',
          category: {
            name: 'Basic Life Support',
            colorCode: '#3B82F6',
          }
        }
      },
      {
        id: 'progress-2',
        userId: 'student-2',
        skillId: 'skill-2',
        status: 'IN_PROGRESS',
        attempts: 3,
        timeSpentMinutes: 75,
        completedSteps: ['safety_check', 'pad_placement', 'operation'],
        instructorNotes: 'Good understanding of AED operation. Continue practicing with different scenarios.',
        createdAt: new Date('2024-01-20').toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        user: {
          id: 'student-2',
          name: 'Michael Chen',
          email: 'michael.chen@example.com',
          studentId: 'STU002',
        },
        skill: {
          id: 'skill-2',
          name: 'AED Use',
          category: {
            name: 'Basic Life Support',
            colorCode: '#3B82F6',
          }
        }
      },
      {
        id: 'progress-3',
        userId: 'student-3',
        skillId: 'skill-3',
        status: 'IN_PROGRESS',
        attempts: 2,
        timeSpentMinutes: 45,
        completedSteps: ['preparation', 'sterile_technique'],
        instructorNotes: 'Initial attempts show promise. Focus on vein palpation techniques before next session.',
        createdAt: new Date('2024-01-25').toISOString(),
        updatedAt: new Date('2024-01-25').toISOString(),
        user: {
          id: 'student-3',
          name: 'Emma Rodriguez',
          email: 'emma.rodriguez@example.com',
          studentId: 'STU003',
        },
        skill: {
          id: 'skill-3',
          name: 'IV Insertion',
          category: {
            name: 'Advanced Life Support',
            colorCode: '#EF4444',
          }
        }
      },
    ];

    // Mock students for filtering
    const mockStudents = [
      {
        id: 'student-1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        studentId: 'STU001',
      },
      {
        id: 'student-2',
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        studentId: 'STU002',
      },
      {
        id: 'student-3',
        name: 'Emma Rodriguez',
        email: 'emma.rodriguez@example.com',
        studentId: 'STU003',
      },
    ];

    // Mock skills for filtering
    const mockSkills = [
      {
        id: 1,
        name: 'CPR Adult',
        category: {
          name: 'Basic Life Support',
          colorCode: '#3B82F6',
        }
      },
      {
        id: 2,
        name: 'AED Use',
        category: {
          name: 'Basic Life Support',
          colorCode: '#3B82F6',
        }
      },
      {
        id: 3,
        name: 'IV Insertion',
        category: {
          name: 'Advanced Life Support',
          colorCode: '#EF4444',
        }
      },
      {
        id: 4,
        name: 'Vital Signs Assessment',
        category: {
          name: 'Patient Assessment',
          colorCode: '#8B5CF6',
        }
      },
      {
        id: 5,
        name: 'Airway Management',
        category: {
          name: 'Advanced Life Support',
          colorCode: '#EF4444',
        }
      },
    ];

    // Apply filters
    let filteredReflections = mockReflections;
    let filteredVideoSessions = mockVideoSessions;
    let filteredProgressData = mockProgressData;

    if (studentId && studentId !== 'all') {
      filteredReflections = filteredReflections.filter(r => r.userId === studentId);
      filteredVideoSessions = filteredVideoSessions.filter(v => v.userId === studentId);
      filteredProgressData = filteredProgressData.filter(p => p.userId === studentId);
    }

    if (skillId && skillId !== 'all') {
      filteredReflections = filteredReflections.filter(r => r.skillId === skillId);
      filteredVideoSessions = filteredVideoSessions.filter(v => v.skillId === skillId);
      filteredProgressData = filteredProgressData.filter(p => p.skillId === skillId);
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedReflections = filteredReflections.slice(skip, skip + limit);
    const paginatedVideoSessions = filteredVideoSessions.slice(skip, skip + limit);
    const paginatedProgressData = filteredProgressData.slice(skip, skip + limit);

    return NextResponse.json({
      reflections: paginatedReflections,
      videoSessions: paginatedVideoSessions,
      progressData: paginatedProgressData,
      summary: {
        totalReflections: filteredReflections.length,
        totalVideoSessions: filteredVideoSessions.length,
        totalProgress: filteredProgressData.length,
        totalStudents: mockStudents.length,
        totalSkills: mockSkills.length,
      },
      filters: {
        students: mockStudents,
        skills: mockSkills,
      },
      pagination: {
        currentPage: page,
        limit,
        hasMore: skip + limit < filteredReflections.length,
      }
    });
  } catch (error) {
    console.error('Error fetching student feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
