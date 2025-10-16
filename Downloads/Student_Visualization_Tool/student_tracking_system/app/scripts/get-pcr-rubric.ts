import { prisma } from '../lib/db';

async function getPCRRubric() {
  try {
    const rubric = await prisma.rubric.findFirst({
      where: {
        title: { contains: 'PCR Assessment', mode: 'insensitive' }
      }
    });

    if (!rubric) {
      console.log('PCR rubric not found');
      return;
    }

    console.log('='.repeat(80));
    console.log('PCR RUBRIC STRUCTURE');
    console.log('='.repeat(80));
    console.log('ID:', rubric.id);
    console.log('Title:', rubric.title);
    console.log('Version:', rubric.version);
    console.log('\n--- RUBRIC CRITERIA/CATEGORIES ---\n');
    console.log(JSON.stringify(rubric.criteria, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getPCRRubric();
