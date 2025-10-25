import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendAIEmail, AIEmailRequest } from '@/lib/ai-email-service';

/**
 * Send AI-generated email (requires explicit confirmation)
 * POST /api/ai-email/send
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, emailType, context, subject, body: emailBody, confirmed } = body;

    // Validate required fields
    if (!studentId || !emailType || !context || !subject || !emailBody) {
      return NextResponse.json({
        error: 'Missing required fields: studentId, emailType, context, subject, body'
      }, { status: 400 });
    }

    // SAFETY: Require explicit confirmation
    if (confirmed !== true) {
      return NextResponse.json({
        error: 'Email sending requires explicit confirmation (confirmed: true)'
      }, { status: 400 });
    }

    // Build AI email request
    const aiRequest: AIEmailRequest = {
      studentId,
      emailType,
      context: {
        studentName: context.studentName,
        studentEmail: context.studentEmail,
        assignmentName: context.assignmentName,
        grade: context.grade,
        feedback: context.feedback,
        customPrompt: context.customPrompt
      },
      senderName: session.user.name || 'Instructor',
      senderEmail: session.user.email
    };

    // Send email
    const result = await sendAIEmail(aiRequest, subject, emailBody, confirmed);

    if (!result.success) {
      return NextResponse.json({
        error: result.error || 'Failed to send email',
        rateLimited: result.rateLimited
      }, { status: result.rateLimited ? 429 : 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      recipient: context.studentEmail
    });

  } catch (error) {
    console.error('AI email sending error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to send email'
    }, { status: 500 });
  }
}
