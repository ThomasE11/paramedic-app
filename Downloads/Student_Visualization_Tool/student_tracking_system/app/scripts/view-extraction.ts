import { prisma } from '../lib/db';

async function viewExtraction() {
  const submission = await prisma.submission.findFirst({
    where: {
      assignment: {
        title: { contains: 'PCR' }
      }
    },
    include: {
      assignment: true,
      student: { select: { fullName: true, studentId: true } }
    },
    orderBy: { submittedAt: 'desc' }
  });

  if (!submission) {
    console.log('No PCR submission found.');
    return;
  }

  console.log('=== PCR Submission Extracted Text ===\n');
  console.log(`Student: ${submission.student.fullName} (${submission.student.studentId})`);
  console.log(`Assignment: ${submission.assignment.title}`);
  console.log(`File: ${submission.fileName}`);
  console.log(`\nExtracted Text (${submission.extractedText?.length || 0} chars):\n`);
  console.log('---START---');
  console.log(submission.extractedText || '[NO TEXT]');
  console.log('---END---');

  await prisma.$disconnect();
}

viewExtraction().catch(console.error);
