import { prisma } from '../lib/db';

async function checkAllPCRs() {
  const submissions = await prisma.submission.findMany({
    where: {
      assignment: {
        type: 'skill_assessment'
      }
    },
    include: {
      student: { select: { fullName: true, studentId: true } },
      assignment: { select: { title: true } },
      evaluations: {
        select: { totalScore: true, maxScore: true },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { submittedAt: 'desc' }
  });

  console.log('=== ALL PCR SUBMISSIONS ===\n');

  let totalSubmissions = submissions.length;
  let failedExtractions = 0;
  let zeroScores = 0;
  let validExtractions = 0;

  for (const sub of submissions) {
    const extractionFailed = sub.extractedText?.includes('extraction failed') ||
                            sub.extractedText?.includes('Error:') ||
                            (sub.extractedText && sub.extractedText.length < 200);
    const hasValidExtraction = sub.extractedText && sub.extractedText.length > 200 && !extractionFailed;
    const score = sub.evaluations[0]?.totalScore || 0;
    const maxScore = sub.evaluations[0]?.maxScore || 25;

    if (extractionFailed) failedExtractions++;
    if (score === 0) zeroScores++;
    if (hasValidExtraction) validExtractions++;

    console.log(`Student: ${sub.student.fullName} (${sub.student.studentId})`);
    console.log(`File: ${sub.fileName}`);
    console.log(`Status: ${sub.status}`);
    console.log(`Extraction: ${hasValidExtraction ? '✅ SUCCESS' : '❌ FAILED'} (${sub.extractedText?.length || 0} chars)`);

    if (extractionFailed) {
      console.log(`  Error: ${sub.extractedText?.substring(0, 100)}...`);
    }

    console.log(`Score: ${score}/${maxScore} ${sub.evaluations.length > 0 ? '(✅ Evaluated)' : '(⏳ Pending)'}`);
    console.log('---\n');
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Total Submissions: ${totalSubmissions}`);
  console.log(`Failed Extractions: ${failedExtractions} ❌`);
  console.log(`Valid Extractions: ${validExtractions} ✅`);
  console.log(`Zero Scores: ${zeroScores}`);
  console.log(`\n⚠️  Issue: ${failedExtractions} submissions have extraction errors`);
  console.log(`💡 Solution: Use Claude Vision OCR to extract handwritten content`);

  await prisma.$disconnect();
}

checkAllPCRs().catch(console.error);
