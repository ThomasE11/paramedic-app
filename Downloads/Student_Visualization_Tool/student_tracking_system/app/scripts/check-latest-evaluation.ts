import { prisma } from '../lib/db';

async function checkLatestEvaluation() {
  const submission = await prisma.submission.findFirst({
    where: {
      assignment: {
        title: { contains: 'PCR' }
      }
    },
    include: {
      assignment: true,
      student: { select: { fullName: true, studentId: true } },
      evaluations: {
        include: {
          rubric: { select: { title: true, version: true, isActive: true, criteria: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { submittedAt: 'desc' }
  });

  if (!submission) {
    console.log('No PCR submission found.');
    return;
  }

  console.log('=== PCR Submission ===');
  console.log(`Student: ${submission.student.fullName} (${submission.student.studentId})`);
  console.log(`Assignment: ${submission.assignment.title}`);
  console.log(`Extracted Text Length: ${submission.extractedText?.length || 0} chars`);
  console.log(`\nExtracted Text Preview:`);
  console.log(submission.extractedText?.substring(0, 300) || '[NO TEXT]');

  if (submission.evaluations.length > 0) {
    const evaluation = submission.evaluations[0];
    console.log('\n\n=== Latest Evaluation ===');
    console.log(`Score: ${evaluation.totalScore}/${evaluation.maxScore} (${evaluation.percentage.toFixed(1)}%)`);
    console.log(`Rubric: ${evaluation.rubric.title} v${evaluation.rubric.version}`);
    console.log(`Rubric Active: ${evaluation.rubric.isActive}`);

    // Check rubric structure
    const rubricCriteria = evaluation.rubric.criteria as any;
    const criteriaArray = rubricCriteria.criteria || rubricCriteria.categories || [];
    console.log(`\nRubric Structure: ${rubricCriteria.criteria ? 'criteria' : 'categories'} (${criteriaArray.length} items)`);

    if (criteriaArray.length > 0) {
      console.log('\nRubric Criteria:');
      criteriaArray.forEach((c: any, idx: number) => {
        const points = c.maxPoints || c.maxScore || c.weight || 0;
        console.log(`  ${idx + 1}. ${c.name} (${points} points)`);
      });
    }

    console.log('\n\nCriteria Scores:');
    console.log(JSON.stringify(evaluation.criteriaScores, null, 2));

    console.log('\n\nFeedback:');
    console.log(evaluation.feedback);

    console.log('\n\nStrengths:');
    console.log(evaluation.strengths);

    console.log('\n\nImprovements:');
    console.log(evaluation.improvements);
  } else {
    console.log('\n\nNo evaluations found for this submission.');
  }

  await prisma.$disconnect();
}

checkLatestEvaluation().catch(console.error);
