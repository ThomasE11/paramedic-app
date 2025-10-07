import nodemailer from 'nodemailer';

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  studentName: string;
}

export interface SendEmailsResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}

/**
 * Send multiple emails with delay between each to avoid spam filters
 * @param emails Array of email payloads
 * @param delayMs Delay in milliseconds between each email (default: 30000 = 30 seconds)
 */
export async function sendBulkEmails(
  emails: EmailPayload[],
  delayMs: number = 30000
): Promise<SendEmailsResult> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const result: SendEmailsResult = {
    success: true,
    sent: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];

    try {
      await transporter.sendMail({
        from: `"${process.env.GMAIL_USER}" <${process.env.GMAIL_USER}>`,
        to: email.to,
        subject: email.subject,
        text: email.body,
        html: email.body.replace(/\n/g, '<br>'),
      });

      result.sent++;
      console.log(`✓ Email sent to ${email.studentName} (${email.to}) [${i + 1}/${emails.length}]`);

      // Add delay between emails (except for the last one)
      if (i < emails.length - 1) {
        console.log(`⏳ Waiting ${delayMs / 1000} seconds before next email...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      result.failed++;
      result.errors.push({
        email: email.to,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      console.error(`✗ Failed to send email to ${email.studentName} (${email.to}):`, error);

      // Continue with next email even if one fails
    }
  }

  if (result.failed > 0) {
    result.success = false;
  }

  return result;
}

/**
 * Send a single email immediately
 */
export async function sendSingleEmail(email: EmailPayload): Promise<boolean> {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${process.env.GMAIL_USER}" <${process.env.GMAIL_USER}>`,
      to: email.to,
      subject: email.subject,
      text: email.body,
      html: email.body.replace(/\n/g, '<br>'),
    });

    console.log(`✓ Email sent to ${email.studentName} (${email.to})`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to send email to ${email.studentName} (${email.to}):`, error);
    return false;
  }
}
