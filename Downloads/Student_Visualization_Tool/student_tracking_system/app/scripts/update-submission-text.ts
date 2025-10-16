/**
 * Update submission with extracted text and re-trigger evaluation
 *
 * Usage: npx tsx scripts/update-submission-text.ts <submission-id> <extracted-text-file>
 */

import { prisma } from '../lib/db';
import { readFile } from 'fs/promises';

async function updateSubmissionText(submissionId: string, textFilePath: string) {
  try {
    // Read extracted text
    const extractedText = await readFile(textFilePath, 'utf-8');

    console.log(`📝 Updating submission ${submissionId}`);
    console.log(`📊 Text length: ${extractedText.length} characters`);
    console.log(`📊 Word count: ${extractedText.split(/\s+/).length} words\n`);

    // Update submission
    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        extractedText,
        status: 'pending' // Reset to pending for re-evaluation
      },
      include: {
        student: true,
        assignment: true,
        evaluations: true
      }
    });

    console.log(`✅ Submission updated successfully`);
    console.log(`   Student: ${submission.student.fullName}`);
    console.log(`   Assignment: ${submission.assignment.title}`);
    console.log(`   Status: ${submission.status}`);

    // Delete existing evaluations to allow re-evaluation
    if (submission.evaluations.length > 0) {
      console.log(`\n🗑️  Deleting ${submission.evaluations.length} existing evaluation(s)...`);
      await prisma.evaluation.deleteMany({
        where: { submissionId }
      });
      console.log(`✅ Evaluations deleted`);
    }

    console.log(`\n✨ Ready for re-evaluation!`);
    console.log(`\nNext steps:`);
    console.log(`  1. Go to the Assignments page in the app`);
    console.log(`  2. Find "${submission.assignment.title}"`);
    console.log(`  3. Click "View Submissions"`);
    console.log(`  4. Find student "${submission.student.fullName}"`);
    console.log(`  5. Click "Evaluate" to run AI evaluation with the extracted text`);

    return submission;

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
const submissionId = process.argv[2];
const textFilePath = process.argv[3];

if (!submissionId || !textFilePath) {
  console.error('❌ Usage: npx tsx scripts/update-submission-text.ts <submission-id> <text-file>');
  console.error('\nExample:');
  console.error('  npx tsx scripts/update-submission-text.ts cmgnqb8y60001rxkz96o77kym extracted-text.txt');
  process.exit(1);
}

updateSubmissionText(submissionId, textFilePath)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
