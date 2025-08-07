import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSkillById } from '@/lib/comprehensive-skills-updated';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { skillId, content, rating, whatWentWell, whatToimprove, futureGoals, isPrivate } = await request.json();

    // Create reflection in database
    const reflection = await prisma.reflectionNote.create({
      data: {
        userId: session.user.id,
        skillId: parseInt(skillId),
        content: content,
        rating: rating || 5,
        whatWentWell: whatWentWell || '',
        whatToimprove: whatToimprove || '',
        futureGoals: futureGoals || '',
        isPrivate: isPrivate || false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
          }
        }
      }
    });

    // Get skill data from comprehensive skills system
    const skill = getSkillById(skillId);

    const responseData = {
      id: reflection.id,
      userId: reflection.userId,
      skillId: skillId,
      content: reflection.content,
      rating: reflection.rating,
      whatWentWell: reflection.whatWentWell,
      whatToimprove: reflection.whatToimprove,
      futureGoals: reflection.futureGoals,
      isPrivate: reflection.isPrivate,
      createdAt: reflection.createdAt.toISOString(),
      updatedAt: reflection.updatedAt.toISOString(),
      user: reflection.user,
      skill: skill ? {
        id: skill.id,
        name: skill.name,
        category: skill.category
      } : null
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error creating reflection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');
    const userId = searchParams.get('userId');
    const isPrivate = searchParams.get('isPrivate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Build where clause for database query
    const whereClause: any = {};
    
    if (skillId) {
      whereClause.skillId = parseInt(skillId);
    }
    
    if (userId) {
      whereClause.userId = userId;
    }
    
    if (isPrivate !== null) {
      whereClause.isPrivate = isPrivate === 'true';
    }
    
    // For students, only show their own private reflections or public ones
    if (session.user.role === 'STUDENT') {
      whereClause.OR = [
        { userId: session.user.id },
        { isPrivate: false }
      ];
    }
    
    // Fetch reflections from database
    const reflections = await prisma.reflectionNote.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    // Get total count for pagination
    const totalCount = await prisma.reflectionNote.count({
      where: whereClause
    });
    
    // Enhance reflections with skill data
    const enhancedReflections = reflections.map(reflection => {
      const skill = getSkillById(reflection.skillId.toString());
      
      return {
        id: reflection.id,
        userId: reflection.userId,
        skillId: reflection.skillId.toString(),
        content: reflection.content,
        rating: reflection.rating,
        whatWentWell: reflection.whatWentWell,
        whatToimprove: reflection.whatToimprove,
        futureGoals: reflection.futureGoals,
        isPrivate: reflection.isPrivate,
        createdAt: reflection.createdAt.toISOString(),
        updatedAt: reflection.updatedAt.toISOString(),
        user: reflection.user,
        skill: skill ? {
          id: skill.id,
          name: skill.name,
          category: skill.category
        } : null
      };
    });

    return NextResponse.json({
      reflections: enhancedReflections,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        hasMore: (page - 1) * limit + limit < totalCount,
      }
    });
  } catch (error) {
    console.error('Error fetching reflections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reflectionId, content, rating, whatWentWell, whatToimprove, futureGoals, isPrivate } = await request.json();

    // Update reflection in database
    const updatedReflection = await prisma.reflectionNote.update({
      where: {
        id: reflectionId,
        userId: session.user.id, // Ensure user can only update their own reflections
      },
      data: {
        content: content,
        rating: rating,
        whatWentWell: whatWentWell,
        whatToimprove: whatToimprove,
        futureGoals: futureGoals,
        isPrivate: isPrivate,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
          }
        }
      }
    });

    // Get skill data from comprehensive skills system
    const skill = getSkillById(updatedReflection.skillId.toString());

    const responseData = {
      id: updatedReflection.id,
      userId: updatedReflection.userId,
      skillId: updatedReflection.skillId.toString(),
      content: updatedReflection.content,
      rating: updatedReflection.rating,
      whatWentWell: updatedReflection.whatWentWell,
      whatToimprove: updatedReflection.whatToimprove,
      futureGoals: updatedReflection.futureGoals,
      isPrivate: updatedReflection.isPrivate,
      createdAt: updatedReflection.createdAt.toISOString(),
      updatedAt: updatedReflection.updatedAt.toISOString(),
      user: updatedReflection.user,
      skill: skill ? {
        id: skill.id,
        name: skill.name,
        category: skill.category
      } : null
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error updating reflection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reflectionId } = await request.json();

    // Delete reflection from database
    await prisma.reflectionNote.delete({
      where: {
        id: reflectionId,
        userId: session.user.id, // Ensure user can only delete their own reflections
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reflection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}