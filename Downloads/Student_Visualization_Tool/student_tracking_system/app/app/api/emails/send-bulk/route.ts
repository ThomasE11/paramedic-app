import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendBulkEmails, EmailPayload } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { emails, delaySeconds = 30 } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Emails array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate email structure
    const validatedEmails: EmailPayload[] = emails.map((email: any) => ({
      to: email.email || email.to,
      subject: email.subject,
      body: email.body,
      studentName: email.firstName || email.studentName || 'Student',
    }));

    console.log(`📧 Starting bulk email send to ${validatedEmails.length} students...`);
    console.log(`⏱️  Delay between emails: ${delaySeconds} seconds`);

    // Send emails with specified delay
    const result = await sendBulkEmails(validatedEmails, delaySeconds * 1000);

    console.log(`📊 Email send complete: ${result.sent} sent, ${result.failed} failed`);

    return NextResponse.json({
      success: result.success,
      sent: result.sent,
      failed: result.failed,
      total: validatedEmails.length,
      errors: result.errors,
      message: `Successfully sent ${result.sent} out of ${validatedEmails.length} emails`,
    });
  } catch (error) {
    console.error('Bulk email send error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send emails',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
