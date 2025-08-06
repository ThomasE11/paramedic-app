import { NextRequest, NextResponse } from 'next/server';
export const dynamic = "force-dynamic";
export const runtime = 'nodejs';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Submit a mastery request (Student)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      skillId, 
      requestMessage, 
      studentNotes 
    } = await request.json();

    if (!skillId) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }

    // Check if user has permission to request mastery (is a student)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ 
        error: 'Only students can submit mastery requests' 
      }, { status: 403 });
    }

    // Check if skill exists and user has progress
    const skill = await prisma.skill.findUnique({
      where: { id: parseInt(skillId) },
      include: { 
        category: true,
        steps: true
      }
    });

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    // Get student's progress for this skill
    const progress = await prisma.studentProgress.findUnique({
      where: {
        userId_skillId: {
          userId: session.user.id,
          skillId: parseInt(skillId)
        }
      }
    });

    if (!progress) {
      return NextResponse.json({ 
        error: 'No progress found for this skill. You must practice the skill before requesting mastery.' 
      }, { status: 400 });
    }

    // Check if student has sufficient practice (at least 1 complete attempt)
    if (progress.completeAttempts === 0) {
      return NextResponse.json({ 
        error: 'You must complete at least one full practice session (including quiz) before requesting mastery.' 
      }, { status: 400 });
    }

    // Check if there's already a pending or under review request
    const existingRequest = await prisma.masteryRequest.findFirst({
      where: {
        studentId: session.user.id,
        skillId: parseInt(skillId),
        status: { in: ['PENDING', 'UNDER_REVIEW'] }
      }
    });

    if (existingRequest) {
      return NextResponse.json({ 
        error: 'You already have a pending mastery request for this skill.' 
      }, { status: 409 });
    }

    // Calculate statistics for the request
    const skillAttempts = await prisma.skillAttempt.findMany({
      where: {
        userId: session.user.id,
        skillId: parseInt(skillId),
        status: 'COMPLETED'
      }
    });

    const averageScore = skillAttempts.length > 0 
      ? skillAttempts.reduce((sum, attempt) => sum + (attempt.quizScore || 0), 0) / skillAttempts.length
      : null;

    // Create the mastery request
    const masteryRequest = await prisma.masteryRequest.create({
      data: {
        studentId: session.user.id,
        skillId: parseInt(skillId),
        status: 'PENDING',
        requestMessage: requestMessage || null,
        studentNotes: studentNotes || null,
        totalPracticeTime: progress.totalTimeSpentMinutes,
        totalAttempts: progress.totalAttempts,
        averageScore: averageScore
      },
      include: {
        skill: {
          include: {
            category: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true
          }
        }
      }
    });

    // Create notification for instructors
    const instructors = await prisma.user.findMany({
      where: {
        role: { in: ['LECTURER', 'ADMIN'] }
      }
    });

    // Create notifications for all instructors
    const notifications = instructors.map(instructor => ({
      userId: instructor.id,
      type: 'MASTERY_REQUEST' as const,
      title: 'New Mastery Request',
      message: `${user.name} has requested mastery assessment for ${skill.name}`,
      relatedSkillId: parseInt(skillId),
      relatedData: { 
        masteryRequestId: masteryRequest.id,
        studentId: session.user.id,
        studentName: user.name
      }
    }));

    await prisma.notification.createMany({
      data: notifications
    });

    return NextResponse.json({
      success: true,
      masteryRequest: masteryRequest,
      message: 'Mastery request submitted successfully. Instructors have been notified.'
    });

  } catch (error) {
    console.error('Error creating mastery request:', error);
    return NextResponse.json(
      { error: 'Failed to create mastery request' },
      { status: 500 }
    );
  }
}

// Get mastery requests (Different views for students vs instructors)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view'); // 'my-requests' | 'instructor-review' | 'all'
    const skillId = searchParams.get('skillId');
    const status = searchParams.get('status');

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let whereClause: any = {};

    if (view === 'my-requests' || user.role === 'STUDENT') {
      // Students can only see their own requests
      whereClause.studentId = session.user.id;
    } else if (view === 'instructor-review' && (user.role === 'LECTURER' || user.role === 'ADMIN')) {
      // Instructors see pending/under review requests
      whereClause.status = { in: ['PENDING', 'UNDER_REVIEW'] };
    } else if (user.role === 'LECTURER' || user.role === 'ADMIN') {
      // Instructors can see all requests
      // No additional where clause needed
    } else {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    if (skillId) {
      whereClause.skillId = parseInt(skillId);
    }

    if (status) {
      whereClause.status = status;
    }

    const masteryRequests = await prisma.masteryRequest.findMany({
      where: whereClause,
      include: {
        skill: {
          include: {
            category: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true
          }
        },
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        requestDate: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      masteryRequests: masteryRequests,
      userRole: user.role
    });

  } catch (error) {
    console.error('Error fetching mastery requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mastery requests' },
      { status: 500 }
    );
  }
}

// Update mastery request status (Instructor approval/rejection)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      masteryRequestId, 
      decision, 
      instructorNotes,
      status
    } = await request.json();

    if (!masteryRequestId || (!decision && !status)) {
      return NextResponse.json({ 
        error: 'Mastery request ID and decision/status are required' 
      }, { status: 400 });
    }

    // Check if user is an instructor
    const instructor = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!instructor || (instructor.role !== 'LECTURER' && instructor.role !== 'ADMIN')) {
      return NextResponse.json({ 
        error: 'Only instructors can review mastery requests' 
      }, { status: 403 });
    }

    // Get the mastery request
    const masteryRequest = await prisma.masteryRequest.findUnique({
      where: { id: masteryRequestId },
      include: {
        skill: {
          include: {
            category: true
          }
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true
          }
        }
      }
    });

    if (!masteryRequest) {
      return NextResponse.json({ error: 'Mastery request not found' }, { status: 404 });
    }

    if (masteryRequest.status === 'APPROVED' || masteryRequest.status === 'REJECTED') {
      return NextResponse.json({ 
        error: 'This mastery request has already been reviewed' 
      }, { status: 409 });
    }

    // Prepare update data
    const updateData: any = {
      reviewedBy: session.user.id,
      reviewDate: new Date(),
      instructorNotes: instructorNotes || null
    };

    if (decision) {
      updateData.decision = decision;
      updateData.status = decision === 'MASTERED' ? 'APPROVED' : 'REJECTED';
      
      if (decision === 'MASTERED') {
        updateData.masteryDate = new Date();
      }
    } else if (status) {
      updateData.status = status;
    }

    // Update the mastery request
    const updatedRequest = await prisma.masteryRequest.update({
      where: { id: masteryRequestId },
      data: updateData,
      include: {
        skill: true,
        student: true,
        instructor: true
      }
    });

    // If approved as mastered, update student progress
    if (decision === 'MASTERED') {
      await prisma.studentProgress.update({
        where: {
          userId_skillId: {
            userId: masteryRequest.studentId,
            skillId: masteryRequest.skillId
          }
        },
        data: {
          status: 'MASTERED',
          completionDate: new Date()
        }
      });
    }

    // Create notification for student
    const notificationType = decision === 'MASTERED' ? 'MASTERY_APPROVED' : 
                           decision === 'NOT_MASTERED' || decision === 'NEEDS_MORE_PRACTICE' ? 'MASTERY_REJECTED' : 
                           'PROGRESS_UPDATE';

    const notificationMessage = decision === 'MASTERED' 
      ? `Congratulations! Your mastery request for ${masteryRequest.skill.name} has been approved.`
      : decision === 'NOT_MASTERED' 
      ? `Your mastery request for ${masteryRequest.skill.name} needs more work. Please review instructor feedback.`
      : decision === 'NEEDS_MORE_PRACTICE'
      ? `Your mastery request for ${masteryRequest.skill.name} requires additional practice. Please continue practicing and try again.`
      : `Your mastery request for ${masteryRequest.skill.name} has been updated.`;

    await prisma.notification.create({
      data: {
        userId: masteryRequest.studentId,
        type: notificationType,
        title: decision === 'MASTERED' ? 'Mastery Approved!' : 'Mastery Request Update',
        message: notificationMessage,
        relatedSkillId: masteryRequest.skillId,
        relatedData: { 
          masteryRequestId: masteryRequest.id,
          decision: decision,
          instructorName: instructor.name
        }
      }
    });

    return NextResponse.json({
      success: true,
      masteryRequest: updatedRequest,
      message: `Mastery request ${decision === 'MASTERED' ? 'approved' : 'reviewed'} successfully.`
    });

  } catch (error) {
    console.error('Error updating mastery request:', error);
    return NextResponse.json(
      { error: 'Failed to update mastery request' },
      { status: 500 }
    );
  }
}