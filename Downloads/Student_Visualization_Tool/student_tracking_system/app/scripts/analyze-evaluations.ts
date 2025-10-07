import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeEvaluations() {
  console.log('🔍 Analyzing Evaluation Patterns\n');
  console.log('='.repeat(80));

  // Fetch all submissions with evaluations
  const submissions = await prisma.submission.findMany({
    include: {
      student: true,
      assignment: true,
      evaluations: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { submittedAt: 'desc' }
  });

  console.log(`\n📊 Total Submissions: ${submissions.length}`);
  console.log(`✅ Evaluated: ${submissions.filter(s => s.evaluations.length > 0).length}`);
  console.log(`⏳ Pending: ${submissions.filter(s => s.evaluations.length === 0).length}\n`);

  // Analyze score distribution
  const scores = submissions
    .filter(s => s.evaluations.length > 0)
    .map(s => ({
      student: s.student.fullName,
      assignment: s.assignment.title,
      score: s.evaluations[0].totalScore,
      maxScore: s.evaluations[0].maxScore,
      percentage: s.evaluations[0].percentage,
      textLength: s.extractedText?.length || 0,
      evaluation: s.evaluations[0]
    }));

  console.log('='.repeat(80));
  console.log('📈 Score Distribution Analysis\n');

  // Group by score
  const scoreGroups = scores.reduce((acc, curr) => {
    const key = `${curr.score}/${curr.maxScore}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(curr);
    return acc;
  }, {} as Record<string, typeof scores>);

  Object.entries(scoreGroups).forEach(([scoreKey, items]) => {
    console.log(`\n📍 Score: ${scoreKey} (${items.length} submissions)`);
    console.log(`   Percentage: ${items[0].percentage.toFixed(1)}%`);
    console.log(`   Students:`);
    items.forEach(item => {
      console.log(`   - ${item.student} (${item.assignment})`);
      console.log(`     Text length: ${item.textLength.toLocaleString()} chars`);
    });
  });

  console.log('\n' + '='.repeat(80));
  console.log('🔬 Detailed Evaluation Analysis\n');

  // Analyze each evaluation in detail
  for (const score of scores) {
    console.log('─'.repeat(80));
    console.log(`\n📝 Submission: ${score.assignment}`);
    console.log(`👤 Student: ${score.student}`);
    console.log(`📊 Score: ${score.score}/${score.maxScore} (${score.percentage.toFixed(1)}%)`);
    console.log(`📄 Submission Text Length: ${score.textLength.toLocaleString()} characters\n`);

    // Show text preview
    const textPreview = score.evaluation.submission?.extractedText?.substring(0, 200) || 'No text';
    console.log(`📖 Text Preview: ${textPreview}...\n`);

    // Show criteria scores
    if (score.evaluation.criteriaScores && typeof score.evaluation.criteriaScores === 'object') {
      console.log('🎯 Criteria Breakdown:');
      const criteriaScores = score.evaluation.criteriaScores as Record<string, any>;
      Object.entries(criteriaScores).forEach(([criterion, data]) => {
        console.log(`   • ${criterion}: ${data.points} pts (${data.level})`);
        console.log(`     Justification: ${data.justification?.substring(0, 100)}...`);
      });
    }

    console.log(`\n💡 Strengths: ${score.evaluation.strengths?.substring(0, 150)}...`);
    console.log(`⚠️  Improvements: ${score.evaluation.improvements?.substring(0, 150)}...`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('🎯 Potential Issues Detection\n');

  // Check for identical scores
  const identicalScores = Object.entries(scoreGroups).filter(([_, items]) => items.length > 2);
  if (identicalScores.length > 0) {
    console.log('⚠️  WARNING: Multiple submissions with identical scores:');
    identicalScores.forEach(([score, items]) => {
      console.log(`   ${score}: ${items.length} submissions`);

      // Check if they have different text lengths
      const lengths = items.map(i => i.textLength);
      const minLength = Math.min(...lengths);
      const maxLength = Math.max(...lengths);

      if (maxLength - minLength > 1000) {
        console.log(`   ⚠️  CONCERN: Text lengths vary significantly (${minLength} to ${maxLength} chars)`);
      }
    });
  }

  // Check for zero scores
  const zeroScores = scores.filter(s => s.score === 0);
  if (zeroScores.length > 0) {
    console.log(`\n⚠️  WARNING: ${zeroScores.length} submissions with 0 score:`);
    zeroScores.forEach(s => {
      console.log(`   - ${s.student} (${s.assignment})`);
      console.log(`     Text length: ${s.textLength} chars`);
      console.log(`     Text preview: ${s.evaluation.submission?.extractedText?.substring(0, 100) || 'No text'}`);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Analysis Complete\n');

  await prisma.$disconnect();
}

analyzeEvaluations().catch(console.error);
