import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateAIEmail, AIEmailRequest } from '@/lib/ai-email-service';

/**
 * Generate AI email preview (does not send)
 * POST /api/ai-email/generate
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, emailType, context } = body;

    // Validate required fields
    if (!studentId || !emailType || !context) {
      return NextResponse.json({
        error: 'Missing required fields: studentId, emailType, context'
      }, { status: 400 });
    }

    // Validate email type
    const validTypes = ['feedback', 'encouragement', 'reminder', 'custom'];
    if (!validTypes.includes(emailType)) {
      return NextResponse.json({
        error: `Invalid email type. Must be one of: ${validTypes.join(', ')}`
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

    // Generate email (preview only)
    const result = await generateAIEmail(aiRequest);

    if (!result.success) {
      return NextResponse.json({
        error: result.error || 'Failed to generate email',
        rateLimited: result.rateLimited
      }, { status: result.rateLimited ? 429 : 500 });
    }

    return NextResponse.json({
      success: true,
      subject: result.subject,
      body: result.body,
      preview: true,
      message: 'Email generated successfully (preview mode)'
    });

  } catch (error) {
    console.error('AI email generation error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to generate email'
    }, { status: 500 });
  }
}
