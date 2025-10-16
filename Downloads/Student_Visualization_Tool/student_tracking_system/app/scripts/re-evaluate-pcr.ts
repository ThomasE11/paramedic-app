import { prisma } from '../lib/db';

async function reEvaluatePCR() {
  // Find the PCR submission
  const submission = await prisma.submission.findFirst({
    where: {
      assignment: {
        title: { contains: 'PCR' }
      }
    },
    include: {
      evaluations: true
    },
    orderBy: { submittedAt: 'desc' }
  });

  if (!submission) {
    console.log('No PCR submission found.');
    return;
  }

  console.log('=== Re-Evaluating PCR ===\n');

  // Delete existing evaluation
  if (submission.evaluations.length > 0) {
    const deleted = await prisma.evaluation.deleteMany({
      where: { submissionId: submission.id }
    });
    console.log(`✅ Deleted ${deleted.count} old evaluation(s)`);
  }

  // Find the active PCR rubric
  const rubric = await prisma.rubric.findFirst({
    where: {
      assignment: {
        title: { contains: 'PCR' }
      },
      isActive: true
    },
    orderBy: { version: 'desc' }
  });

  if (!rubric) {
    console.log('❌ No active PCR rubric found');
    return;
  }

  console.log(`✅ Using rubric: ${rubric.title} (v${rubric.version})`);
  console.log(`\nSubmission ID: ${submission.id}`);
  console.log(`Rubric ID: ${rubric.id}`);
  console.log('\nNow call the re-evaluate API with these IDs:');
  console.log(`
POST /api/evaluate/re-evaluate
{
  "submissionId": "${submission.id}",
  "rubricId": "${rubric.id}"
}
`);

  console.log('Or run this curl command:');
  console.log(`
curl -X POST http://localhost:3000/api/evaluate/re-evaluate \\
  -H "Content-Type: application/json" \\
  -d '{
    "submissionId": "${submission.id}",
    "rubricId": "${rubric.id}"
  }'
`);

  await prisma.$disconnect();
}

reEvaluatePCR().catch(console.error);
