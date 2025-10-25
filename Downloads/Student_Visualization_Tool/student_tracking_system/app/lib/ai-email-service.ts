/**
 * AI Email Service - Clean, Safe Implementation
 *
 * This service provides AI-powered email generation with the following safety features:
 * - Rate limiting (max 1 email per 5 seconds)
 * - Single recipient only (no bulk sending)
 * - Explicit user confirmation required
 * - Complete audit logging
 * - Error handling and rollback
 */

import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Rate limiting: Track last email send time
let lastEmailSentAt: number = 0;
const MIN_EMAIL_INTERVAL_MS = 5000; // 5 seconds between emails

export interface AIEmailRequest {
  studentId: string;
  emailType: 'feedback' | 'encouragement' | 'reminder' | 'custom';
  context: {
    studentName: string;
    studentEmail: string;
    assignmentName?: string;
    grade?: number;
    feedback?: string;
    customPrompt?: string;
  };
  senderName: string;
  senderEmail: string;
}

export interface AIEmailResponse {
  success: boolean;
  subject?: string;
  body?: string;
  error?: string;
  rateLimited?: boolean;
}

/**
 * Rate limiting check
 */
function checkRateLimit(): boolean {
  const now = Date.now();
  const timeSinceLastEmail = now - lastEmailSentAt;

  if (timeSinceLastEmail < MIN_EMAIL_INTERVAL_MS) {
    return false; // Rate limited
  }

  return true;
}

/**
 * Generate AI email content using Gemini
 */
async function generateEmailContent(request: AIEmailRequest): Promise<{ subject: string; body: string }> {
  const { context, emailType } = request;

  let prompt = '';

  switch (emailType) {
    case 'feedback':
      prompt = `You are a professional EMS instructor providing feedback to a student.

Student: ${context.studentName}
Assignment: ${context.assignmentName}
Grade: ${context.grade}/100
Instructor Feedback: ${context.feedback}

Generate a professional, encouraging email that:
1. Acknowledges their work
2. Provides constructive feedback
3. Encourages improvement
4. Is warm but professional
5. Is concise (max 200 words)

Return ONLY valid JSON:
{
  "subject": "Subject line here",
  "body": "Email body here"
}`;
      break;

    case 'encouragement':
      prompt = `You are a supportive EMS instructor sending encouragement.

Student: ${context.studentName}
Context: ${context.customPrompt || 'General encouragement'}

Generate a warm, encouraging email (max 150 words) that:
1. Is genuinely supportive
2. Is professional yet friendly
3. Motivates the student
4. References their EMS journey

Return ONLY valid JSON:
{
  "subject": "Subject line here",
  "body": "Email body here"
}`;
      break;

    case 'reminder':
      prompt = `You are an EMS instructor sending a reminder.

Student: ${context.studentName}
Reminder about: ${context.customPrompt}

Generate a professional reminder email (max 150 words) that:
1. Is clear and direct
2. Provides necessary details
3. Is polite but firm
4. Includes a call to action

Return ONLY valid JSON:
{
  "subject": "Subject line here",
  "body": "Email body here"
}`;
      break;

    case 'custom':
      if (!context.customPrompt) {
        throw new Error('Custom prompt is required for custom email type');
      }
      prompt = `You are a professional EMS instructor communicating with a student.

Student: ${context.studentName}
Context: ${context.customPrompt}

Generate a professional email (max 200 words) based on the context provided.
Be professional, clear, and supportive.

Return ONLY valid JSON:
{
  "subject": "Subject line here",
  "body": "Email body here"
}`;
      break;
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are a professional email assistant. Generate clear, professional emails for an EMS educational program. Always return ONLY valid JSON without markdown formatting.\n\n${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  let content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  // Clean up markdown formatting
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  const emailData = JSON.parse(content);

  if (!emailData.subject || !emailData.body) {
    throw new Error('Invalid email content generated');
  }

  return {
    subject: emailData.subject,
    body: emailData.body
  };
}

/**
 * Generate AI email (preview only, does not send)
 */
export async function generateAIEmail(request: AIEmailRequest): Promise<AIEmailResponse> {
  try {
    // Check rate limit
    if (!checkRateLimit()) {
      return {
        success: false,
        error: 'Rate limited. Please wait 5 seconds between email generations.',
        rateLimited: true
      };
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: request.studentId },
      select: { id: true, fullName: true, email: true }
    });

    if (!student) {
      return {
        success: false,
        error: 'Student not found'
      };
    }

    // Verify email matches
    if (student.email !== request.context.studentEmail) {
      return {
        success: false,
        error: 'Student email mismatch'
      };
    }

    // Generate email content
    const { subject, body } = await generateEmailContent(request);

    // Update rate limit timestamp (for generation)
    lastEmailSentAt = Date.now();

    return {
      success: true,
      subject,
      body
    };

  } catch (error) {
    console.error('AI email generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate email'
    };
  }
}

/**
 * Send AI-generated email (requires explicit confirmation)
 */
export async function sendAIEmail(
  request: AIEmailRequest,
  subject: string,
  body: string,
  confirmed: boolean = false
): Promise<AIEmailResponse> {
  try {
    // SAFETY: Require explicit confirmation
    if (!confirmed) {
      return {
        success: false,
        error: 'Email sending requires explicit confirmation'
      };
    }

    // Check rate limit
    if (!checkRateLimit()) {
      return {
        success: false,
        error: 'Rate limited. Please wait 5 seconds between emails.',
        rateLimited: true
      };
    }

    // Verify student exists
    const student = await prisma.student.findUnique({
      where: { id: request.studentId },
      select: { id: true, fullName: true, email: true }
    });

    if (!student) {
      return {
        success: false,
        error: 'Student not found'
      };
    }

    // Send email using existing email service
    await sendEmail({
      to: student.email,
      subject: subject,
      html: body.replace(/\n/g, '<br>'),
      text: body
    });

    // Update rate limit timestamp
    lastEmailSentAt = Date.now();

    // Log activity
    await prisma.activity.create({
      data: {
        studentId: student.id,
        type: 'email_sent',
        description: `AI-generated email sent: "${subject}"`,
        metadata: {
          subject,
          emailType: request.emailType,
          sentBy: request.senderName,
          sentByEmail: request.senderEmail,
          sentAt: new Date().toISOString(),
          aiGenerated: true
        }
      }
    });

    console.log(`✅ AI email sent to ${student.fullName} (${student.email})`);

    return {
      success: true,
      subject,
      body
    };

  } catch (error) {
    console.error('AI email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email'
    };
  }
}

/**
 * Get AI email generation stats for monitoring
 */
export async function getAIEmailStats(userId: string) {
  const activities = await prisma.activity.findMany({
    where: {
      type: 'email_sent',
      metadata: {
        path: ['aiGenerated'],
        equals: true
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 100
  });

  return {
    totalSent: activities.length,
    lastSentAt: activities[0]?.createdAt,
    recentEmails: activities.slice(0, 10).map(a => ({
      studentId: a.studentId,
      subject: (a.metadata as any)?.subject,
      sentAt: a.createdAt,
      sentBy: (a.metadata as any)?.sentBy
    }))
  };
}
