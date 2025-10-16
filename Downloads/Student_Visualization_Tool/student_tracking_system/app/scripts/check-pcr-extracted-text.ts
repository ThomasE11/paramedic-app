import { prisma } from '../lib/db';

async function showExtractedText() {
  try {
    const submission = await prisma.submission.findFirst({
      where: {
        fileName: { contains: 'PCRNo.1', mode: 'insensitive' }
      },
      include: {
        student: true,
        assignment: true
      }
    });

    if (!submission) {
      console.log('Not found');
      return;
    }

    console.log('='.repeat(80));
    console.log('ACTUAL SUBMISSION EXTRACTED TEXT');
    console.log('='.repeat(80));
    console.log('Student:', submission.student.fullName);
    console.log('File:', submission.fileName);
    console.log('\nExtracted Text Length:', submission.extractedText?.length || 0, 'characters');
    console.log('\n--- EXTRACTED TEXT ---\n');
    console.log(submission.extractedText || 'No text extracted');
    console.log('\n--- END ---');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

showExtractedText();
