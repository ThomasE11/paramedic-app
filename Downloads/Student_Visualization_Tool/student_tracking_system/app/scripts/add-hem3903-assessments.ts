import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const assessments = [
  {
    title: 'Portfolio - Case Study Presentation',
    description: 'Case study presentation assessment (10% weighting). Presentations on 22 October 2025.',
    type: 'Portfolio',
    dueDate: new Date('2025-10-12T23:59:59.000Z'),
    maxScore: 10,
  },
  {
    title: 'Portfolio - Case Reflection 1',
    description: 'Case reflection assignment 1 (10% weighting)',
    type: 'Portfolio',
    dueDate: new Date('2025-10-18T23:59:59.000Z'),
    maxScore: 10,
  },
  {
    title: 'Portfolio - Case Reflection 2',
    description: 'Case reflection assignment 2 (10% weighting)',
    type: 'Portfolio',
    dueDate: new Date('2025-11-01T23:59:59.000Z'),
    maxScore: 10,
  },
  {
    title: 'Portfolio - PCR 1',
    description: 'Patient Care Report 1 (5% weighting)',
    type: 'Portfolio',
    dueDate: new Date('2025-10-11T23:59:59.000Z'),
    maxScore: 5,
  },
  {
    title: 'Portfolio - PCR 2',
    description: 'Patient Care Report 2 (5% weighting)',
    type: 'Portfolio',
    dueDate: new Date('2025-10-17T23:59:59.000Z'),
    maxScore: 5,
  },
  {
    title: 'Portfolio - PCR 3',
    description: 'Patient Care Report 3 (5% weighting)',
    type: 'Portfolio',
    dueDate: new Date('2025-10-25T23:59:59.000Z'),
    maxScore: 5,
  },
  {
    title: 'Portfolio - PCR 4',
    description: 'Patient Care Report 4 (5% weighting)',
    type: 'Portfolio',
    dueDate: new Date('2025-11-05T23:59:59.000Z'),
    maxScore: 5,
  },
  {
    title: 'Portfolio - Skills Logbook',
    description: 'Skills logbook documentation (20% weighting)',
    type: 'Portfolio',
    dueDate: new Date('2025-11-08T23:59:59.000Z'),
    maxScore: 20,
  },
  {
    title: 'Portfolio - Evaluation',
    description: 'Portfolio evaluation (20% weighting, Final assessment)',
    type: 'Portfolio',
    dueDate: new Date('2025-11-20T23:59:59.000Z'),
    maxScore: 20,
  },
  {
    title: 'Portfolio - Clinical Practice Integration',
    description: 'Clinical practice integration assessment (10% weighting, Final assessment)',
    type: 'Portfolio',
    dueDate: new Date('2025-11-20T23:59:59.000Z'),
    maxScore: 10,
  },
  {
    title: 'Clinical Learning Hours',
    description: 'Clinical practice and virtual/lab hours completion. Required by due date.',
    type: 'Clinical',
    dueDate: new Date('2025-11-20T23:59:59.000Z'),
    maxScore: 100,
  },
];

async function main() {
  console.log('🎯 Adding HEM3903 assessment schedule...\n');

  // Find HEM3903 module
  const module = await prisma.module.findFirst({
    where: { code: 'HEM3903' }
  });

  if (!module) {
    console.error('❌ HEM3903 module not found!');
    process.exit(1);
  }

  console.log(`✅ Found module: ${module.code} - ${module.name}`);

  // Find an instructor user
  const instructor = await prisma.user.findFirst({
    where: { role: 'instructor' }
  });

  if (!instructor) {
    console.error('❌ No instructor user found!');
    process.exit(1);
  }

  console.log(`✅ Using instructor: ${instructor.name}\n`);

  let created = 0;
  let skipped = 0;

  for (const assessment of assessments) {
    // Check if assignment already exists
    const existing = await prisma.assignment.findFirst({
      where: {
        title: assessment.title,
        moduleId: module.id
      }
    });

    if (existing) {
      console.log(`⏭️  Skipped: ${assessment.title} (already exists)`);
      skipped++;
      continue;
    }

    // Create assignment
    const created_assignment = await prisma.assignment.create({
      data: {
        title: assessment.title,
        description: assessment.description,
        type: assessment.type,
        dueDate: assessment.dueDate,
        maxScore: assessment.maxScore,
        isActive: true,
        module: {
          connect: { id: module.id }
        },
        creator: {
          connect: { id: instructor.id }
        }
      }
    });

    console.log(`✅ Created: ${assessment.title}`);
    console.log(`   Due: ${assessment.dueDate.toLocaleDateString()}`);
    console.log(`   Max Score: ${assessment.maxScore}\n`);
    created++;
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Created: ${created} assignments`);
  console.log(`⏭️  Skipped: ${skipped} assignments (already exist)`);
  console.log(`📝 Total: ${assessments.length} assignments\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
