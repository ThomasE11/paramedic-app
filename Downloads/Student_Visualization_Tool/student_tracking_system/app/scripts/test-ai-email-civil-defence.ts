import { PrismaClient } from '@prisma/client';
import * as readline from 'readline';

const prisma = new PrismaClient();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface EmailDraft {
  studentId: string;
  studentName: string;
  email: string;
  subject: string;
  body: string;
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
  
  // Remove markdown code blocks if present
  content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  const emailData = JSON.parse(content);
  return {
    subject: emailData.subject,
    body: emailData.body
  };
}

async function testAIEmailGeneration() {
  console.log('🤖 AI EMAIL GENERATION TEST - Civil Defence Induction\n');
  console.log('='.repeat(80));
  console.log('\n📋 TASK: Generate personalized emails for security clearance completion');
  console.log('📍 Location: Abu Dhabi Civil Defence Office, Al Ain');
  console.log('🕐 Time: 09:00 AM (2 hours)');
  console.log('⚠️  Urgency: MANDATORY attendance\n');
  console.log('='.repeat(80));

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

    console.log(`\n✅ Found ${students.length} students in database\n`);

    // Test with first 3 students
    console.log('🧪 TESTING AI EMAIL GENERATION (First 3 students)...\n');
    console.log('─'.repeat(80));

    const testStudents = students.slice(0, 3);
    const emailDrafts: EmailDraft[] = [];

    for (let i = 0; i < testStudents.length; i++) {
      const student = testStudents[i];
      
      console.log(`\n[${i + 1}/3] Generating email for: ${student.fullName}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Module: ${student.module?.code || 'N/A'}`);
      
      try {
        const emailContent = await generatePersonalizedEmail(
          student.fullName,
          student.email
        );

        emailDrafts.push({
          studentId: student.id,
          studentName: student.fullName,
          email: student.email,
          subject: emailContent.subject,
          body: emailContent.body
        });

        console.log(`   ✅ Email generated successfully`);
        
        // Small delay to avoid rate limiting
        if (i < testStudents.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error: any) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    // Display generated emails
    console.log('\n\n' + '='.repeat(80));
    console.log('📧 GENERATED EMAIL PREVIEWS');
    console.log('='.repeat(80));

    for (let i = 0; i < emailDrafts.length; i++) {
      const draft = emailDrafts[i];
      
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`EMAIL ${i + 1} of ${emailDrafts.length}`);
      console.log('─'.repeat(80));
      console.log(`To: ${draft.studentName} <${draft.email}>`);
      console.log(`Subject: ${draft.subject}`);
      console.log(`\nBody:\n`);
      console.log(draft.body);
      console.log('─'.repeat(80));
    }

    // AI Quality Assessment
    console.log('\n\n' + '='.repeat(80));
    console.log('🎯 AI QUALITY ASSESSMENT');
    console.log('='.repeat(80));

    const assessmentChecks = [
      {
        check: 'Personalization',
        test: emailDrafts.every(e => e.body.includes(e.studentName.split(' ')[0])),
        description: 'Each email uses student\'s first name'
      },
      {
        check: 'Security Clearance Mentioned',
        test: emailDrafts.every(e => 
          e.body.toLowerCase().includes('security clearance') || 
          e.body.toLowerCase().includes('clearance')
        ),
        description: 'All emails mention security clearance completion'
      },
      {
        check: 'Location Included',
        test: emailDrafts.every(e => 
          e.body.includes('Al Ain') || 
          e.body.includes('https://maps.google.com')
        ),
        description: 'All emails include location information'
      },
      {
        check: 'Time Specified',
        test: emailDrafts.every(e => e.body.includes('09:00') || e.body.includes('9:00')),
        description: 'All emails specify 09:00 AM start time'
      },
      {
        check: 'Urgency Conveyed',
        test: emailDrafts.every(e => 
          e.body.toLowerCase().includes('mandatory') || 
          e.body.toLowerCase().includes('must attend') ||
          e.body.toLowerCase().includes('important')
        ),
        description: 'All emails convey urgency/mandatory nature'
      },
      {
        check: 'Professional Tone',
        test: emailDrafts.every(e => 
          e.body.includes('Dear') || 
          e.body.includes('Best regards') ||
          e.body.includes('Sincerely')
        ),
        description: 'All emails maintain professional tone'
      }
    ];

    let passedChecks = 0;
    console.log('\n');
    
    for (const check of assessmentChecks) {
      const status = check.test ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${check.check}: ${check.description}`);
      if (check.test) passedChecks++;
    }

    const qualityScore = (passedChecks / assessmentChecks.length) * 100;
    console.log(`\n📊 Quality Score: ${qualityScore.toFixed(0)}% (${passedChecks}/${assessmentChecks.length} checks passed)`);

    // Recommendation
    console.log('\n\n' + '='.repeat(80));
    console.log('💡 RECOMMENDATION');
    console.log('='.repeat(80));

    if (qualityScore >= 80) {
      console.log('\n✅ AI EMAIL GENERATION: EXCELLENT');
      console.log('   The AI successfully generates personalized, professional emails');
      console.log('   that include all required information with appropriate urgency.');
      console.log('\n   ✅ READY TO PROCEED with automated sending to all 61 students');
    } else if (qualityScore >= 60) {
      console.log('\n⚠️  AI EMAIL GENERATION: GOOD (Minor improvements needed)');
      console.log('   The AI generates acceptable emails but may need prompt refinement.');
      console.log('\n   ⚠️  REVIEW RECOMMENDED before sending to all students');
    } else {
      console.log('\n❌ AI EMAIL GENERATION: NEEDS IMPROVEMENT');
      console.log('   The AI is not consistently meeting quality requirements.');
      console.log('\n   ❌ DO NOT PROCEED - Refine prompts and test again');
    }

    console.log('\n\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`\n✅ Total Students: ${students.length}`);
    console.log(`✅ Test Emails Generated: ${emailDrafts.length}`);
    console.log(`✅ Quality Score: ${qualityScore.toFixed(0)}%`);
    console.log(`✅ AI Status: ${qualityScore >= 80 ? 'READY' : qualityScore >= 60 ? 'NEEDS REVIEW' : 'NOT READY'}`);

    if (qualityScore >= 80) {
      console.log('\n\n' + '='.repeat(80));
      console.log('🚀 NEXT STEP: ACTIVATE AUTOMATION');
      console.log('='.repeat(80));
      console.log('\nTo send emails to all 61 students with 10-second delays, run:');
      console.log('\n   npx tsx scripts/send-civil-defence-emails.ts');
      console.log('\nThis will:');
      console.log('   1. Generate personalized emails for all 61 students');
      console.log('   2. Send each email with 10-second delay between sends');
      console.log('   3. Log all sent emails to database');
      console.log('   4. Provide real-time progress updates');
      console.log('\n⏱️  Estimated time: ~10 minutes (61 students × 10 seconds)');
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAIEmailGeneration().catch(console.error);

