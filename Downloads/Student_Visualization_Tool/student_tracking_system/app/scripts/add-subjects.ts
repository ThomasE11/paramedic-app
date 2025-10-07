import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const subjectData = [
  // AEM230 Subjects
  { code: 'AEM230-PRAC', name: 'Clinical Ambulance Practice', description: 'Hands-on ambulance practice and patient care', credits: 3, moduleCode: 'AEM230' },
  { code: 'AEM230-THEO', name: 'Emergency Medical Theory', description: 'Theoretical foundations of emergency medical care', credits: 2, moduleCode: 'AEM230' },
  { code: 'AEM230-COMM', name: 'Patient Communication', description: 'Communication skills for emergency situations', credits: 1, moduleCode: 'AEM230' },

  // HEM2903 Subjects
  { code: 'HEM2903-FUND', name: 'Healthcare Emergency Fundamentals', description: 'Basic principles of healthcare emergency management', credits: 4, moduleCode: 'HEM2903' },
  { code: 'HEM2903-TRIA', name: 'Triage and Assessment', description: 'Emergency triage and patient assessment skills', credits: 3, moduleCode: 'HEM2903' },
  { code: 'HEM2903-PHARM', name: 'Emergency Pharmacology', description: 'Medications used in emergency medical care', credits: 2, moduleCode: 'HEM2903' },

  // HEM3903 Subjects
  { code: 'HEM3903-ADV', name: 'Advanced Emergency Procedures', description: 'Advanced life support and emergency procedures', credits: 4, moduleCode: 'HEM3903' },
  { code: 'HEM3903-TRAUMA', name: 'Trauma Management', description: 'Comprehensive trauma care and management', credits: 3, moduleCode: 'HEM3903' },
  { code: 'HEM3903-LEAD', name: 'Emergency Leadership', description: 'Leadership in emergency medical situations', credits: 2, moduleCode: 'HEM3903' },

  // HEM3923 Subjects
  { code: 'HEM3923-RESP', name: 'First Responder Skills', description: 'Essential first responder techniques and protocols', credits: 3, moduleCode: 'HEM3923' },
  { code: 'HEM3923-SCENE', name: 'Scene Management', description: 'Managing emergency scenes and coordination', credits: 2, moduleCode: 'HEM3923' }
];

async function addSubjects() {
  try {
    console.log('=== ADDING SUBJECTS TO MODULES ===\n');

    // Get modules
    const modules = await prisma.module.findMany();
    const moduleMap = new Map(modules.map(m => [m.code, m.id]));

    console.log('Available modules:', modules.map(m => m.code).join(', '));
    console.log('');

    let addedCount = 0;

    for (const subject of subjectData) {
      const moduleId = moduleMap.get(subject.moduleCode);

      if (!moduleId) {
        console.log(`⚠️  Module ${subject.moduleCode} not found, skipping ${subject.code}`);
        continue;
      }

      // Check if subject already exists
      const existing = await prisma.subject.findUnique({
        where: { code: subject.code }
      });

      if (existing) {
        console.log(`⏭️  Subject ${subject.code} already exists, skipping`);
        continue;
      }

      try {
        await prisma.subject.create({
          data: {
            code: subject.code,
            name: subject.name,
            description: subject.description,
            credits: subject.credits,
            moduleId: moduleId
          }
        });

        console.log(`✅ Added ${subject.name} (${subject.code}) to ${subject.moduleCode}`);
        addedCount++;
      } catch (error) {
        console.error(`❌ Error adding ${subject.code}:`, error);
      }
    }

    console.log(`\n✅ Added ${addedCount} subjects successfully!`);

    // Display final counts
    console.log('\n=== SUBJECT DISTRIBUTION ===');
    const moduleSubjects = await prisma.module.findMany({
      include: {
        subjects: true,
        _count: {
          select: { subjects: true }
        }
      },
      orderBy: { code: 'asc' }
    });

    moduleSubjects.forEach(module => {
      console.log(`${module.code}: ${module._count.subjects} subjects`);
      module.subjects.forEach(subject => {
        console.log(`  - ${subject.code}: ${subject.name} (${subject.credits} credits)`);
      });
      console.log('');
    });

  } catch (error) {
    console.error('Error adding subjects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSubjects();