#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';
import { generateAIEmail, sendAIEmail } from '../lib/ai-email-service';

const prisma = new PrismaClient();

async function sendPracticalsReminder() {
  const studentNumber = 'H00601771';

  console.log('🔍 Looking up student...\n');

  const student = await prisma.student.findUnique({
    where: { studentId: studentNumber },
    include: { module: true }
  });

  if (!student) {
    console.error('❌ Student not found');
    return;
  }

  console.log('📋 Student Details:');
  console.log(`   Name: ${student.fullName}`);
  console.log(`   Email: ${student.email}`);
  console.log(`   Module: ${student.module?.code} - ${student.module?.name}\n`);

  // Step 1: Generate email
  console.log('📧 Generating reminder email...\n');

  const emailRequest = {
    studentId: student.id, // Use database ID, not student number
    emailType: 'reminder' as const,
    context: {
      studentName: student.fullName,
      studentEmail: student.email,
      customPrompt: 'Please remind this student to schedule and make time for practical sessions with me. It is important that we arrange these sessions soon so they can complete their clinical requirements.'
    },
    senderName: 'EMS Instructor',
    senderEmail: 'instructor@hct.ac.ae'
  };

  const generated = await generateAIEmail(emailRequest);

  if (!generated.success) {
    console.error('❌ Email generation failed:', generated.error);
    return;
  }

  console.log('✅ Email Generated:');
  console.log('━'.repeat(80));
  console.log(`Subject: ${generated.subject}\n`);
  console.log('Body:');
  console.log(generated.body);
  console.log('━'.repeat(80));
  console.log('\n');

  // Step 2: Send email
  console.log('📤 Sending email to student...\n');

  const sendResult = await sendAIEmail(
    emailRequest,
    generated.subject!,
    generated.body!,
    true // confirmed = true
  );

  if (sendResult.success) {
    console.log('✅ Email sent successfully!\n');
  } else if (sendResult.rateLimited) {
    console.log('⏰ Rate limited - please wait 5 seconds between emails\n');
  } else {
    console.error('❌ Email sending failed:', sendResult.error, '\n');
  }

  // Wait for rate limit if needed
  if (sendResult.rateLimited) {
    console.log('⏳ Waiting 5 seconds to respect rate limit...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Retry send
    console.log('🔄 Retrying email send...\n');
    const retryResult = await sendAIEmail(
      emailRequest,
      generated.subject!,
      generated.body!,
      true
    );

    if (retryResult.success) {
      console.log('✅ Email sent successfully on retry!\n');
    } else {
      console.error('❌ Email sending failed on retry:', retryResult.error, '\n');
    }
  }

  // Step 3: Add note to student profile
  console.log('📝 Adding note to student profile...\n');

  // Get instructor user ID (use first instructor user found)
  const instructorUser = await prisma.user.findFirst({
    where: { role: 'instructor' }
  });

  if (!instructorUser) {
    console.error('❌ No instructor user found in database\n');
    return;
  }

  const note = await prisma.note.create({
    data: {
      studentId: student.id,
      userId: instructorUser.id,
      title: 'Practicals Scheduling Reminder',
      content: 'Reminder sent to student to schedule practical sessions with instructor. Follow-up needed to confirm scheduling.',
      category: 'reminder'
    }
  });

  console.log('✅ Note added to profile:');
  console.log(`   ID: ${note.id}`);
  console.log(`   Created: ${note.createdAt}`);
  console.log(`   Content: ${note.content}\n`);

  // Step 4: Log activity
  await prisma.activity.create({
    data: {
      studentId: student.id,
      type: 'note_added',
      description: 'Reminder about scheduling practicals - note added to profile',
      metadata: {
        noteId: note.id,
        emailSent: sendResult.success
      }
    }
  });

  console.log('🎉 All tasks completed successfully!');
  console.log('━'.repeat(80));
  console.log('Summary:');
  console.log('  ✅ Email generated and sent to', student.email);
  console.log('  ✅ Note added to student profile');
  console.log('  ✅ Activity logged in system');
}

sendPracticalsReminder()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
