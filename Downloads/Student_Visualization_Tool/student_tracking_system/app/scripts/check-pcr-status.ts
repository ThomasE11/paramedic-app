import { prisma } from '../lib/db';

async function checkRecentEvaluations() {
  const recentSubmissions = await prisma.submission.findMany({
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
          rubric: { select: { title: true, version: true, isActive: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { submittedAt: 'desc' },
    take: 5
  });

  console.log('=== Recent PCR Submissions ===\n');

  if (recentSubmissions.length === 0) {
    console.log('No PCR submissions found.');
    return;
  }

  recentSubmissions.forEach((sub, idx) => {
    console.log(`\n[${idx + 1}] Submission:`);
    console.log(`  Student: ${sub.student.fullName} (${sub.student.studentId})`);
    console.log(`  Assignment: ${sub.assignment.title}`);
    console.log(`  Extracted Text: ${sub.extractedText?.length || 0} chars`);
    console.log(`  Extraction Failed: ${sub.extractedText?.includes('Text extraction failed') ? 'YES' : 'NO'}`);
    console.log(`  Evaluations: ${sub.evaluations.length}`);

    if (sub.evaluations.length > 0) {
      sub.evaluations.forEach((e, eidx) => {
        console.log(`    [${eidx + 1}] ${e.totalScore}/${e.maxScore} (${e.percentage.toFixed(1)}%)`);
        console.log(`        Rubric: ${e.rubric.title} v${e.rubric.version} (Active: ${e.rubric.isActive})`);
      });
    } else {
      console.log('    No evaluations yet.');
    }
  });

  // Check rubrics
  console.log('\n\n=== PCR Rubrics ===\n');
  const rubrics = await prisma.rubric.findMany({
    where: {
      assignment: {
        title: { contains: 'PCR' }
      }
    },
    include: {
      assignment: { select: { title: true } },
      _count: { select: { evaluations: true } }
    },
    orderBy: { version: 'desc' }
  });

  rubrics.forEach((r, idx) => {
    console.log(`\n[${idx + 1}] Rubric:`);
    console.log(`  Title: ${r.title}`);
    console.log(`  Version: ${r.version}`);
    console.log(`  Active: ${r.isActive}`);
    console.log(`  Assignment: ${r.assignment.title}`);
    console.log(`  Evaluations: ${r._count.evaluations}`);
    console.log(`  Criteria Structure: ${JSON.stringify(r.criteria).substring(0, 100)}...`);
  });

  await prisma.$disconnect();
}

checkRecentEvaluations().catch(console.error);
