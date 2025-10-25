#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicates() {
  console.log('🔍 CHECKING FOR DUPLICATE EMAILS\n');
  console.log('='.repeat(80));

  // Check recent email activities
  const recentEmails = await prisma.activity.findMany({
    where: {
      type: 'email_sent',
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    },
    include: {
      student: {
        select: {
          studentId: true,
          fullName: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log(`Total emails sent in last 24 hours: ${recentEmails.length}\n`);

  // Group by student to find duplicates
  const emailsByStudent = new Map<string, typeof recentEmails>();

  for (const email of recentEmails) {
    const studentId = email.student.studentId;
    if (!emailsByStudent.has(studentId)) {
      emailsByStudent.set(studentId, []);
    }
    emailsByStudent.get(studentId)!.push(email);
  }

  // Check for duplicates
  console.log('📊 EMAIL BREAKDOWN BY STUDENT:\n');

  let duplicatesFound = false;

  for (const [studentId, emails] of emailsByStudent.entries()) {
    const student = emails[0].student;
    console.log(`Student: ${student.fullName} (${studentId})`);
    console.log(`  Email: ${student.email}`);
    console.log(`  Count: ${emails.length} email(s)\n`);

    if (emails.length > 1) {
      duplicatesFound = true;
      console.log('  ⚠️  DUPLICATE DETECTED - Details:');
      emails.forEach((e, i) => {
        console.log(`    ${i + 1}. ${e.description}`);
        console.log(`       Sent: ${e.createdAt}`);
        console.log(`       Metadata: ${JSON.stringify(e.metadata)}\n`);
      });
    }
  }

  if (!duplicatesFound) {
    console.log('✅ No duplicate emails detected!\n');
  }

  // Show most recent emails for Meera specifically
  console.log('='.repeat(80));
  console.log('📧 EMAILS TO MEERA (H00601771):\n');

  const meeraEmails = recentEmails.filter(e => e.student.studentId === 'H00601771');

  if (meeraEmails.length === 0) {
    console.log('No emails found for this student.\n');
  } else {
    meeraEmails.forEach((e, i) => {
      console.log(`Email ${i + 1}:`);
      console.log(`  Subject: ${e.description}`);
      console.log(`  Sent: ${e.createdAt}`);
      console.log(`  AI Generated: ${(e.metadata as any)?.aiGenerated || false}\n`);
    });
  }

  console.log('='.repeat(80));
  console.log('\n✅ Duplicate check complete!');
}

checkDuplicates()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
