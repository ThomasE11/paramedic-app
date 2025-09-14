
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createGmailTransporter } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Gmail credentials are configured
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    return NextResponse.json({
      configured: !!(gmailUser && gmailPassword),
      gmailUser: gmailUser || null,
      instructions: {
        step1: "Go to your Google Account settings",
        step2: "Navigate to Security > 2-Step Verification",
        step3: "Enable 2-Step Verification if not already enabled",
        step4: "Go to Security > App passwords",
        step5: "Generate an app password for 'Mail'",
        step6: "Use this app password in your environment variables"
      }
    });
  } catch (error) {
    console.error('Gmail setup check error:', error);
    return NextResponse.json(
      { error: 'Failed to check Gmail setup' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { testEmail } = body;

    // Test Gmail connection
    const transporter = createGmailTransporter();
    
    // Send test email
    const testResult = await transporter.sendMail({
      from: `"HCT Student Tracker Test" <${process.env.GMAIL_USER}>`,
      to: testEmail || session.user.email,
      subject: 'Gmail Integration Test - HCT Student Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
            <h1 style="margin: 0; font-size: 24px;">🎉 Gmail Integration Successful!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">HCT Student Tracking System</p>
          </div>
          
          <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333;">Congratulations!</p>
            
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Your Gmail integration is working perfectly. You can now send emails directly from your student tracking system to:
            </p>
            
            <ul style="color: #555; line-height: 1.8;">
              <li>Send class reminders to students</li>
              <li>Notify students about attendance</li>
              <li>Send personalized messages</li>
              <li>Communicate with entire modules</li>
            </ul>
            
            <p style="font-size: 16px; color: #555; margin-top: 30px;">
              Test completed at: <strong>${new Date().toLocaleString()}</strong>
            </p>
          </div>
        </div>
      `,
      text: `
Gmail Integration Test Successful!

Your Gmail integration is working perfectly. You can now send emails directly from your student tracking system.

Test completed at: ${new Date().toLocaleString()}
      `
    });

    return NextResponse.json({
      success: true,
      message: 'Gmail integration test successful!',
      messageId: testResult.messageId,
      testSentTo: testEmail || session.user.email
    });

  } catch (error) {
    console.error('Gmail test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Gmail integration test failed. Please check your credentials.'
    }, { status: 400 });
  }
}
