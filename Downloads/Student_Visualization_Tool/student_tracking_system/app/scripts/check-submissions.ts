#!/usr/bin/env tsx

/**
 * Check Submissions and Evaluations
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSubmissions() {
  console.log('🔍 Checking Submissions and Evaluations\n');
  console.log('=' .repeat(60));

  try {
    const submissions = await prisma.submission.findMany({
      include: {
        student: {
          select: {
            fullName: true,
            email: true
          }
        },
        assignment: {
          select: {
            title: true
          }
        },
        evaluations: true
      },
      orderBy: { submittedAt: 'desc' }
    });

    console.log(`\n📊 Found ${submissions.length} submissions:\n`);

    for (const sub of submissions) {
      console.log(`\n📝 Submission: ${sub.assignment.title}`);
      console.log(`   Student: ${sub.student.fullName}`);
      console.log(`   File: ${sub.fileName}`);
      console.log(`   Submitted: ${sub.submittedAt.toLocaleString()}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Has extracted text: ${sub.extractedText ? 'Yes' : 'No'}`);

      if (sub.extractedText) {
        console.log(`   Text length: ${sub.extractedText.length} characters`);
        console.log(`   Text preview: ${sub.extractedText.substring(0, 100)}...`);
      } else {
        console.log(`   ⚠️  No extracted text!`);
      }

      console.log(`   Evaluations: ${sub.evaluations.length}`);

      if (sub.evaluations.length > 0) {
        for (const ev of sub.evaluations) {
          console.log(`
   📊 Evaluation:`);
          console.log(`      Score: ${ev.totalScore}/${ev.maxScore} (${ev.percentage.toFixed(1)}%)`);
          console.log(`      Has feedback: ${ev.feedback ? 'Yes' : 'No'}`);
          console.log(`      Has strengths: ${ev.strengths ? 'Yes' : 'No'}`);
          console.log(`      Has improvements: ${ev.improvements ? 'Yes' : 'No'}`);
        }
      } else {
        console.log(`   ⚠️  No evaluation yet`);
      }
    }

    // Check for failed evaluations
    const failedEvaluations = await prisma.evaluation.findMany({
      where: {
        totalScore: 0,
        feedback: { contains: 'failed' }
      },
      include: {
        submission: {
          include: {
            student: true,
            assignment: true
          }
        }
      }
    });

    if (failedEvaluations.length > 0) {
      console.log(`\n\n⚠️  Found ${failedEvaluations.length} failed evaluations:\n`);

      for (const ev of failedEvaluations) {
        console.log(`❌ Failed Evaluation:`);
        console.log(`   Student: ${ev.submission.student.fullName}`);
        console.log(`   Assignment: ${ev.submission.assignment.title}`);
        console.log(`   Feedback: ${ev.feedback}`);
        console.log(`   Submission ID: ${ev.submissionId}`);
        console.log(`   Rubric ID: ${ev.rubricId}\n`);
      }
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubmissions();
