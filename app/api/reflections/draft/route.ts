import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      skillId, 
      content, 
      rating, 
      whatWentWell, 
      whatToimprove, 
      futureGoals, 
      isPrivate,
      isDraft = true,
      timestamp 
    } = body;

    if (!skillId) {
      return NextResponse.json({ error: 'skillId is required' }, { status: 400 });
    }

    // Save as draft reflection
    await prisma.reflection.upsert({
      where: {
        studentId_skillId: {
          studentId: session.user.id,
          skillId: skillId
        }
      },
      update: {
        content: content || '',
        rating: rating || 5,
        whatWentWell: whatWentWell || '',
        whatToImprove: whatToimprove || '',
        futureGoals: futureGoals || '',
        isPrivate: isPrivate || false,
        isDraft,
        draftSavedAt: timestamp ? new Date(timestamp) : new Date(),
        updatedAt: new Date()
      },
      create: {
        studentId: session.user.id,
        skillId: skillId,
        content: content || '',
        rating: rating || 5,
        whatWentWell: whatWentWell || '',
        whatToImprove: whatToimprove || '',
        futureGoals: futureGoals || '',
        isPrivate: isPrivate || false,
        isDraft,
        draftSavedAt: timestamp ? new Date(timestamp) : new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Draft saved automatically',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error saving reflection draft:', error);
    return NextResponse.json(
      { error: 'Failed to save draft', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const skillId = searchParams.get('skillId');

    if (!skillId) {
      return NextResponse.json({ error: 'skillId is required' }, { status: 400 });
    }

    // Get existing draft
    const draft = await prisma.reflection.findUnique({
      where: {
        studentId_skillId: {
          studentId: session.user.id,
          skillId: skillId
        }
      }
    });

    if (!draft || !draft.isDraft) {
      return NextResponse.json({ hasDraft: false });
    }

    return NextResponse.json({
      hasDraft: true,
      draft: {
        content: draft.content,
        rating: draft.rating,
        whatWentWell: draft.whatWentWell,
        whatToImprove: draft.whatToImprove,
        futureGoals: draft.futureGoals,
        isPrivate: draft.isPrivate,
        draftSavedAt: draft.draftSavedAt
      }
    });

  } catch (error) {
    console.error('Error fetching reflection draft:', error);
    return NextResponse.json({ error: 'Failed to fetch draft' }, { status: 500 });
  }
}