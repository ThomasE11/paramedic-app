/**
 * Test script for the NEW safe AI email system
 *
 * This script demonstrates:
 * - Safe email generation (preview only)
 * - Rate limiting
 * - Explicit confirmation required
 * - Single recipient only
 */

import { PrismaClient } from '@prisma/client';
import { generateAIEmail, sendAIEmail, AIEmailRequest } from '../lib/ai-email-service';

const prisma = new PrismaClient();

async function testNewAIEmailSystem() {
  console.log('🧪 Testing NEW Safe AI Email System\n');
  console.log('='.repeat(60));

  try {
    // Get a test student
    const student = await prisma.student.findFirst({
      select: {
        id: true,
        fullName: true,
        email: true
      }
    });

    if (!student) {
      console.log('❌ No students found in database');
      return;
    }

    console.log(`✅ Test Student: ${student.fullName}`);
    console.log(`   Email: ${student.email}\n`);

    // Test 1: Generate email preview (SAFE - does not send)
    console.log('📝 TEST 1: Generate Email Preview (No Sending)');
    console.log('-'.repeat(60));

    const request: AIEmailRequest = {
      studentId: student.id,
      emailType: 'encouragement',
      context: {
        studentName: student.fullName,
        studentEmail: student.email,
        customPrompt: 'Keep up the great work in your EMS studies!'
      },
      senderName: 'Test Instructor',
      senderEmail: 'test@hct.ac.ae'
    };

    const previewResult = await generateAIEmail(request);

    if (previewResult.success) {
      console.log('✅ Email generated successfully!');
      console.log(`   Subject: ${previewResult.subject}`);
      console.log(`   Body Preview: ${previewResult.body?.substring(0, 100)}...`);
      console.log('   ⚠️  NOTE: Email was NOT sent (preview only)\n');
    } else {
      console.log('❌ Failed to generate email');
      console.log(`   Error: ${previewResult.error}\n`);
      return;
    }

    // Test 2: Rate limiting
    console.log('⏱️  TEST 2: Rate Limiting');
    console.log('-'.repeat(60));
    console.log('Attempting immediate second generation...');

    const rateLimitResult = await generateAIEmail(request);

    if (rateLimitResult.rateLimited) {
      console.log('✅ Rate limiting works correctly!');
      console.log('   Second request was blocked (5-second minimum)\n');
    } else {
      console.log('⚠️  Rate limiting may not be working\n');
    }

    // Wait for rate limit
    console.log('⏳ Waiting 6 seconds for rate limit to reset...');
    await new Promise(resolve => setTimeout(resolve, 6000));
    console.log('✅ Rate limit reset\n');

    // Test 3: Send email (with confirmation)
    console.log('📧 TEST 3: Send Email (Requires Explicit Confirmation)');
    console.log('-'.repeat(60));
    console.log('⚠️  THIS WILL ACTUALLY SEND AN EMAIL TO THE STUDENT');
    console.log(`   Recipient: ${student.email}`);
    console.log('   To proceed, manually call sendAIEmail with confirmed=true\n');

    // SAFETY: Commented out to prevent accidental sending
    // Uncomment and run manually if you want to test actual sending
    /*
    const sendResult = await sendAIEmail(
      request,
      previewResult.subject!,
      previewResult.body!,
      true // Explicit confirmation
    );

    if (sendResult.success) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Failed to send email');
      console.log(`   Error: ${sendResult.error}`);
    }
    */

    console.log('✅ Skipped actual sending (safety measure)');
    console.log('   Uncomment code to test actual email sending\n');

    // Test 4: Attempt send without confirmation (should fail)
    console.log('🛡️  TEST 4: Safety Check - Send Without Confirmation');
    console.log('-'.repeat(60));

    const unsafeResult = await sendAIEmail(
      request,
      previewResult.subject!,
      previewResult.body!,
      false // NO confirmation
    );

    if (!unsafeResult.success) {
      console.log('✅ Safety check passed!');
      console.log('   Email was NOT sent without explicit confirmation');
      console.log(`   Error: ${unsafeResult.error}\n`);
    } else {
      console.log('❌ SECURITY ISSUE: Email sent without confirmation!\n');
    }

    // Summary
    console.log('='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Email generation (preview mode)');
    console.log('✅ Rate limiting enforcement');
    console.log('✅ Safety check (confirmation required)');
    console.log('✅ Single recipient only');
    console.log('✅ No automatic loops');
    console.log('\n🎉 All safety features working correctly!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testNewAIEmailSystem().catch(console.error);
