import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

interface EmailResult {
  studentName: string;
  email: string;
  success: boolean;
  error?: string;
}

async function generatePersonalizedEmail(
  studentName: string,
  studentEmail: string
): Promise<{ subject: string; body: string }> {
  const prompt = `You are an official communication assistant for HCT Al Ain EMS Program.

Generate a professional, personalized email for the following student:

**Student Name:** ${studentName}
**Student Email:** ${studentEmail}

**Email Purpose:**
Inform the student that their security clearance with Abu Dhabi Civil Defence has been concluded and they are now ready to start their clinical placement shifts.

**Key Information to Include:**
1. Security clearance has been completed
2. They are now cleared to begin clinical placement shifts
3. URGENT: They must attend a mandatory induction/orientation
4. Location: Abu Dhabi Civil Defence Office, Al Ain
   - Google Maps Link: https://maps.google.com/?q=24.237560,55.750942
5. Date: TODAY - Thursday, 16th October 2025
6. Time: 09:00 AM (2 hours duration)
7. This is MANDATORY - everyone must attend
8. Emphasize the importance and urgency - this is happening TODAY

**Tone:**
- Professional and official
- Warm and encouraging
- Clear sense of urgency
- Personalized to the student

**Format:**
Return ONLY a JSON object with this structure (no markdown, no code blocks):
{
  "subject": "Your subject line here",
  "body": "Your email body here with proper paragraphs and formatting"
}

Make the email feel personal by using the student's name naturally throughout.`;

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: "system",
          content: "You are a professional email communication assistant for an EMS educational program. Generate clear, professional, personalized emails. Return ONLY valid JSON without markdown formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.statusText}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content || '{}';
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  const emailData = JSON.parse(content);
  return {
    subject: emailData.subject,
    body: emailData.body
  };
}

async function sendEmailToStudent(
  studentName: string,
  studentEmail: string,
  subject: string,
  body: string,
  transporter: any
): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"HCT Al Ain EMS Program" <${GMAIL_USER}>`,
      to: studentEmail,
      subject: subject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
    });
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to send: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

async function sendCivilDefenceEmails() {
  console.log('🚀 AUTOMATED EMAIL SENDING - Civil Defence Induction\n');
  console.log('='.repeat(80));
  console.log('\n📋 TASK: Send personalized emails to all students');
  console.log('📍 Location: Abu Dhabi Civil Defence Office, Al Ain');
  console.log('🕐 Time: 09:00 AM (2 hours)');
  console.log('⏱️  Delay: 10 seconds between each email');
  console.log('⚠️  Urgency: MANDATORY attendance\n');
  console.log('='.repeat(80));

  // Verify Gmail credentials
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error('\n❌ ERROR: Gmail credentials not configured');
    console.error('   Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env file');
    process.exit(1);
  }

  // Create email transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  try {
    // Fetch all students
    const students = await prisma.student.findMany({
      select: {
        id: true,
        studentId: true,
        fullName: true,
        email: true,
        module: {
          select: {
            code: true,
            name: true
          }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });

    console.log(`\n✅ Found ${students.length} students\n`);
    console.log('⏳ Starting email generation and sending process...\n');
    console.log('─'.repeat(80));

    const results: EmailResult[] = [];
    const startTime = Date.now();

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const progress = `[${i + 1}/${students.length}]`;
      
      console.log(`\n${progress} ${student.fullName}`);
      console.log(`   📧 ${student.email}`);
      console.log(`   📚 ${student.module?.code || 'N/A'}`);
      
      try {
        // Generate personalized email
        console.log(`   🤖 Generating personalized email...`);
        const emailContent = await generatePersonalizedEmail(
          student.fullName,
          student.email
        );

        // Send email
        console.log(`   📤 Sending email...`);
        const sent = await sendEmailToStudent(
          student.fullName,
          student.email,
          emailContent.subject,
          emailContent.body,
          transporter
        );

        if (sent) {
          console.log(`   ✅ Email sent successfully`);
          
          // Log to database
          await prisma.activity.create({
            data: {
              studentId: student.id,
              type: 'email_sent',
              description: `Civil Defence Induction Email: "${emailContent.subject}"`,
              metadata: {
                subject: emailContent.subject,
                sentBy: 'Automated System',
                sentAt: new Date().toISOString(),
                type: 'civil_defence_induction',
                urgent: true
              }
            }
          });

          results.push({
            studentName: student.fullName,
            email: student.email,
            success: true
          });
        } else {
          results.push({
            studentName: student.fullName,
            email: student.email,
            success: false,
            error: 'Failed to send email'
          });
        }

        // Delay before next email (except for last one)
        if (i < students.length - 1) {
          console.log(`   ⏳ Waiting 10 seconds before next email...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        }

      } catch (error: any) {
        console.log(`   ❌ Error: ${error.message}`);
        results.push({
          studentName: student.fullName,
          email: student.email,
          success: false,
          error: error.message
        });
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(1);

    // Summary Report
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 FINAL REPORT');
    console.log('='.repeat(80));

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`\n✅ Successfully Sent: ${successful}/${students.length}`);
    console.log(`❌ Failed: ${failed}/${students.length}`);
    console.log(`⏱️  Total Time: ${duration} minutes`);

    if (failed > 0) {
      console.log('\n\n❌ FAILED EMAILS:');
      console.log('─'.repeat(80));
      results.filter(r => !r.success).forEach(r => {
        console.log(`   • ${r.studentName} (${r.email})`);
        console.log(`     Error: ${r.error}`);
      });
    }

    console.log('\n\n✅ EMAIL CAMPAIGN COMPLETED');
    console.log('\nAll students have been notified about:');
    console.log('   ✅ Security clearance completion');
    console.log('   ✅ Mandatory induction at Civil Defence Office');
    console.log('   ✅ Date, time, and location details');
    console.log('   ✅ Urgency and importance of attendance');

    console.log('\n📋 Next Steps:');
    console.log('   1. Monitor email responses');
    console.log('   2. Follow up with students who don\'t confirm');
    console.log('   3. Prepare attendance list for Monday induction');

  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

sendCivilDefenceEmails().catch(console.error);

