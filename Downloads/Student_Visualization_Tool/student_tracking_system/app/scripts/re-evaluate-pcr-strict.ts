import { prisma } from '../lib/db';

async function reEvaluateWithStrictCriteria() {
  try {
    console.log('Finding PCR submission...');

    const submission = await prisma.submission.findFirst({
      where: {
        fileName: { contains: 'PCRNo.1', mode: 'insensitive' }
      },
      include: {
        evaluations: true,
        assignment: true,
        student: true
      }
    });

    if (!submission) {
      console.log('PCR submission not found');
      return;
    }

    console.log('Found submission:', submission.id);
    console.log('Student:', submission.student.fullName);
    console.log('Current evaluations:', submission.evaluations.length);

    // Delete existing evaluations
    if (submission.evaluations.length > 0) {
      console.log('\nDeleting', submission.evaluations.length, 'existing evaluation(s)...');
      await prisma.evaluation.deleteMany({
        where: {
          submissionId: submission.id
        }
      });
      console.log('✅ Deleted old evaluations');
    }

    // Update submission status to pending
    await prisma.submission.update({
      where: { id: submission.id },
      data: { status: 'pending' }
    });

    console.log('\n✅ Submission ready for re-evaluation');
    console.log('\nNow trigger evaluation via:');
    console.log('1. Go to http://localhost:3000/assignments');
    console.log('2. Click on "PCR Evaluation"');
    console.log('3. Click "Evaluate" on the submission');
    console.log('4. Select "PCR Assessment Rubric (25 marks)"');
    console.log('5. Click "Evaluate Submission"');
    console.log('\nThe new stricter prompt will be used automatically.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

reEvaluateWithStrictCriteria();
