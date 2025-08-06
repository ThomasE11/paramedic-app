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
    const page = parseInt(searchParams.get('page') || '1');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const studentId = searchParams.get('studentId');
    const skillId = searchParams.get('skillId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // Mock student submissions data formatted for frontend
    const mockSubmissions = [
      {
        id: 'submission-1',
        type: 'reflection',
        status: 'completed',
        title: 'CPR Adult Reflection',
        content: 'Today I practiced CPR on the mannequin. I felt more confident with the compression depth and was able to maintain the correct rate of 100-120 compressions per minute. I need to work on hand positioning as I sometimes drift from the correct placement.',
        rating: 4,
        whatWentWell: 'I maintained proper compression depth and rate throughout the session. My hand positioning was generally correct.',
        whatToimprove: 'Need to work on consistent hand placement and avoid drifting from the correct position on the sternum.',
        futureGoals: 'Practice more on mannequin to build muscle memory for proper hand positioning.',
        submissionDate: new Date().toISOString(),
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
            id: 'bls-1',
            name: 'Basic Life Support',
            colorCode: '#3B82F6',
          }
        },
        instructorNotes: null,
      },
      {
        id: 'submission-2',
        type: 'video',
        status: 'processing',
        title: 'AED Use Video Analysis',
        content: 'Video submission for AED use practice session.',
        videoDuration: 180,
        submissionDate: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
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
            id: 'bls-1',
            name: 'Basic Life Support',
            colorCode: '#3B82F6',
          }
        },
        analysisResults: [
          {
            id: 'result-1',
            overallScore: 85,
            techniqueScore: 88,
            sequenceScore: 90,
            timingScore: 78,
            overallFeedback: 'Good pad placement and safety awareness. Minor issue with voice clarity.',
            strengths: [
              'Excellent pad placement technique',
              'Good safety awareness throughout',
              'Proper sequence followed'
            ],
            areasForImprovement: [
              'Voice commands could be clearer',
              'Slightly slower response time'
            ]
          }
        ],
        instructorNotes: 'Great improvement on AED technique. Keep practicing voice commands.',
      },
      {
        id: 'submission-3',
        type: 'progress',
        status: 'in_progress',
        title: 'IV Insertion Practice Progress',
        content: 'First attempt at IV insertion. Found it challenging to locate the vein initially. Need more practice with palpation technique.',
        attempts: 3,
        timeSpentMinutes: 45,
        completedSteps: ['step-1', 'step-2'],
        submissionDate: new Date(Date.now() - 172800000).toISOString(),
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
            id: 'als-1',
            name: 'Advanced Life Support',
            colorCode: '#EF4444',
          }
        },
        instructorNotes: null,
      },
      {
        id: 'submission-4',
        type: 'reflection',
        status: 'mastered',
        title: 'AED Use Reflection - Follow-up',
        content: 'Good session with the AED. Remembered all the safety checks and pad placement was correct. Voice commands were clear and confident.',
        rating: 5,
        whatWentWell: 'All safety checks completed correctly. Pad placement was perfect and voice commands were clear.',
        whatToimprove: 'Continue practicing to maintain consistency.',
        futureGoals: 'Focus on teaching others and helping struggling classmates.',
        submissionDate: new Date(Date.now() - 259200000).toISOString(),
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        user: {
          id: 'student-1',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          studentId: 'STU001',
        },
        skill: {
          id: 'skill-2',
          name: 'AED Use',
          category: {
            id: 'bls-1',
            name: 'Basic Life Support',
            colorCode: '#3B82F6',
          }
        },
        instructorNotes: 'Excellent reflection. Your technique has improved significantly.',
      }
    ];

    // Apply filters
    let filteredSubmissions = mockSubmissions;
    
    if (studentId && studentId !== 'all') {
      filteredSubmissions = filteredSubmissions.filter(s => s.user.id === studentId);
    }
    
    if (skillId && skillId !== 'all') {
      filteredSubmissions = filteredSubmissions.filter(s => s.skill.id === skillId);
    }
    
    if (type && type !== 'all') {
      filteredSubmissions = filteredSubmissions.filter(s => s.type === type);
    }
    
    if (status && status !== 'all') {
      filteredSubmissions = filteredSubmissions.filter(s => s.status === status);
    }

    // Apply sorting
    filteredSubmissions.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];
      
      if (aVal === null || bVal === null) {
        return 0; // Consider null values as equal
      }
      
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    // Apply pagination
    const limit = 10;
    const offset = (page - 1) * limit;
    const paginatedSubmissions = filteredSubmissions.slice(offset, offset + limit);

    return NextResponse.json({
      submissions: paginatedSubmissions,
      summary: {
        total: filteredSubmissions.length,
        reflections: filteredSubmissions.filter(s => s.type === 'reflection').length,
        videoSessions: filteredSubmissions.filter(s => s.type === 'video').length,
        progressUpdates: filteredSubmissions.filter(s => s.type === 'progress').length,
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredSubmissions.length / limit),
        totalItems: filteredSubmissions.length,
        hasMore: offset + limit < filteredSubmissions.length,
        limit: limit,
      },
      filters: {
        students: [
          { id: 'student-1', name: 'Sarah Johnson', studentId: 'STU001' },
          { id: 'student-2', name: 'Michael Chen', studentId: 'STU002' },
          { id: 'student-3', name: 'Emma Rodriguez', studentId: 'STU003' },
        ],
        skills: [
          { id: 'skill-1', name: 'CPR Adult' },
          { id: 'skill-2', name: 'AED Use' },
          { id: 'skill-3', name: 'IV Insertion' },
        ],
        types: ['reflection', 'video', 'progress'],
        statuses: ['completed', 'processing', 'in_progress', 'mastered'],
      }
    });
  } catch (error) {
    console.error('Error fetching student submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || session.user.role !== 'LECTURER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { submissionId, feedback, rating, grade } = await request.json();

    // Mock submission update
    const mockUpdatedSubmission = {
      id: submissionId,
      status: 'REVIEWED',
      instructorFeedback: {
        id: `feedback-${Date.now()}`,
        comment: feedback,
        rating: rating,
        createdAt: new Date().toISOString(),
        lecturer: {
          id: session.user.id,
          name: session.user.name,
        }
      },
      grade: grade,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockUpdatedSubmission);
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}