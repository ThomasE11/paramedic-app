import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { emails } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'No emails provided' }, { status: 400 });
    }

    // Generate mailto links for each email
    const emailLinks = emails.map((email: any) => {
      const subject = encodeURIComponent(email.subject);
      const bodyText = encodeURIComponent(email.body);

      return {
        studentId: email.studentId,
        studentName: email.studentName,
        firstName: email.firstName,
        email: email.email,
        mailtoLink: `mailto:${email.email}?subject=${subject}&body=${bodyText}`,
        subject: email.subject,
        body: email.body
      };
    });

    return NextResponse.json({
      success: true,
      message: `Generated ${emailLinks.length} personalized email links`,
      emailLinks,
      totalEmails: emailLinks.length
    });

  } catch (error) {
    console.error('Send emails error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate email links',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
