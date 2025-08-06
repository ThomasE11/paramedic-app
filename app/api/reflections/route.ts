import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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
      studentId: 'STU001'
    };

    const { skillId, content, rating, whatWentWell, whatToimprove, futureGoals, isPrivate } = await request.json();

    // Mock reflection creation
    const mockReflection = {
      id: `reflection-${Date.now()}`,
      userId: mockUser.id,
      skillId: skillId,
      content: content,
      rating: rating || 5,
      whatWentWell: whatWentWell || '',
      whatToimprove: whatToimprove || '',
      futureGoals: futureGoals || '',
      isPrivate: isPrivate || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        studentId: mockUser.studentId,
      },
      skill: {
        id: skillId,
        name: skillId === 'skill-1' ? 'CPR Adult' : skillId === 'skill-2' ? 'AED Use' : 'IV Insertion',
        category: {
          id: skillId === 'skill-1' || skillId === 'skill-2' ? 'bls-1' : 'als-1',
          name: skillId === 'skill-1' || skillId === 'skill-2' ? 'Basic Life Support' : 'Advanced Life Support',
          colorCode: skillId === 'skill-1' || skillId === 'skill-2' ? '#3B82F6' : '#EF4444',
        }
      }
    };

    return NextResponse.json(mockReflection);
  } catch (error) {
    console.error('Error creating reflection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
      role: 'STUDENT',
      studentId: 'STU001'
    };

    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');
    const userId = searchParams.get('userId');
    const isPrivate = searchParams.get('isPrivate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Mock reflections data
    const mockReflections = [
      {
        id: 'reflection-1',
        userId: 'student-1',
        skillId: 'skill-1',
        content: 'Today I practiced CPR on the mannequin. I felt more confident with the compression depth and was able to maintain the correct rate of 100-120 compressions per minute. I need to work on hand positioning as I sometimes drift from the correct placement.',
        rating: 4,
        whatWentWell: 'Maintained proper compression rate and depth throughout the session',
        whatToimprove: 'Hand positioning accuracy needs work',
        futureGoals: 'Practice hand placement on different body types',
        isPrivate: false,
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
        }
      },
      {
        id: 'reflection-2',
        userId: 'student-2',
        skillId: 'skill-2',
        content: 'AED practice went well today. I was able to follow all the voice prompts correctly and remembered to check for breathing and pulse. The pad placement felt natural this time.',
        rating: 5,
        whatWentWell: 'Followed voice prompts correctly and proper pad placement',
        whatToimprove: 'Speed of initial assessment could be faster',
        futureGoals: 'Practice rhythm recognition',
        isPrivate: false,
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
            id: 'bls-1',
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
        rating: 2,
        whatWentWell: 'Proper sterile technique maintained throughout',
        whatToimprove: 'Vein location and palpation skills',
        futureGoals: 'Practice on training arms more regularly',
        isPrivate: false,
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
        }
      },
      {
        id: 'reflection-4',
        userId: mockUser.id,
        skillId: 'skill-1',
        content: 'Personal reflection: Working on improving my technique. This session felt much better than last time.',
        rating: 3,
        whatWentWell: 'Better rhythm control than previous session',
        whatToimprove: 'Compression depth consistency',
        futureGoals: 'Focus on maintaining quality throughout longer sessions',
        isPrivate: true,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 259200000).toISOString(),
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          studentId: mockUser.studentId,
        },
        skill: {
          id: 'skill-1',
          name: 'CPR Adult',
          category: {
            id: 'bls-1',
            name: 'Basic Life Support',
            colorCode: '#3B82F6',
          }
        }
      }
    ];

    // Apply filters
    let filteredReflections = mockReflections;
    
    if (skillId) {
      filteredReflections = filteredReflections.filter(r => r.skillId === skillId);
    }
    
    if (userId) {
      filteredReflections = filteredReflections.filter(r => r.userId === userId);
    }
    
    if (isPrivate !== null) {
      filteredReflections = filteredReflections.filter(r => r.isPrivate === (isPrivate === 'true'));
    }

    // For students, only show their own private reflections
    if (mockUser.role === 'STUDENT') {
      filteredReflections = filteredReflections.filter(r => 
        r.userId === mockUser.id || !r.isPrivate
      );
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedReflections = filteredReflections.slice(offset, offset + limit);

    return NextResponse.json({
      reflections: paginatedReflections,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredReflections.length / limit),
        totalItems: filteredReflections.length,
        hasMore: offset + limit < filteredReflections.length,
      }
    });
  } catch (error) {
    console.error('Error fetching reflections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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
      studentId: 'STU001'
    };

    const { reflectionId, content, isPrivate } = await request.json();

    // Mock reflection update
    const mockUpdatedReflection = {
      id: reflectionId,
      userId: mockUser.id,
      content: content,
      isPrivate: isPrivate,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockUpdatedReflection);
  } catch (error) {
    console.error('Error updating reflection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Temporarily allow without authentication for testing
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { reflectionId } = await request.json();

    // Mock reflection deletion
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reflection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}