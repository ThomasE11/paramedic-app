import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSubmissions() {
  console.log('📋 CHECKING SUBMISSION CONTENT\n');
  
  const submissions = await prisma.submission.findMany({
    include: {
      student: {
        select: {
          fullName: true,
          studentId: true
        }
      },
      assignment: {
        select: {
          title: true
        }
      },
      evaluations: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log(`Total submissions: ${submissions.length}\n`);

  for (const sub of submissions) {
    const hasEvaluation = sub.evaluations.length > 0;
    const textLength = sub.extractedText?.length || 0;
    const hasFile = !!sub.filePath;

    console.log(`${'─'.repeat(80)}`);
    console.log(`Student: ${sub.student.fullName} (${sub.student.studentId})`);
    console.log(`Assignment: ${sub.assignment.title}`);
    console.log(`Evaluated: ${hasEvaluation ? '✅ Yes' : '❌ No'}`);
    console.log(`Has File: ${hasFile ? '✅ Yes' : '❌ No'}`);
    console.log(`Text Length: ${textLength} chars`);
    
    if (textLength > 0) {
      console.log(`\nExtracted Text Preview (first 500 chars):`);
      console.log(`"${sub.extractedText?.substring(0, 500)}..."`);
    }
    
    if (hasEvaluation) {
      const evaluation = sub.evaluations[0];
      console.log(`\nEvaluation:`);
      console.log(`  Score: ${evaluation.totalScore}/${evaluation.maxScore} (${evaluation.percentage.toFixed(1)}%)`);
      console.log(`  Feedback: ${evaluation.feedback?.substring(0, 200)}...`);
    }
    
    console.log('');
  }

  await prisma.$disconnect();
}

checkSubmissions().catch(console.error);

