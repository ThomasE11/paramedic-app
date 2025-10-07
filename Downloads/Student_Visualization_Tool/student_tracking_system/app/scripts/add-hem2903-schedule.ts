import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const submissionSchedule = {
  requirements: {
    rolePlay: 1,
    pcrs: 4,
    skillsLog: 1,
    portfolioEvaluation: 1,
    clinicalIntegration: 1,
    clinicalHours: 144
  },
  timeline: [
    {
      date: '2025-10-09',
      time: '11:59 PM',
      items: [
        {
          type: 'portfolio',
          number: 1,
          title: 'Portfolio - Role Play-Patient Handover',
          description: 'Role play assessment demonstrating patient handover skills. Weighting: 10% (CW). Presentations on 21 October 2025.',
          mandatory: true,
          emoji: '🎭'
        }
      ]
    },
    {
      date: '2025-10-10',
      time: '11:59 PM',
      items: [
        {
          type: 'pcr',
          number: 1,
          title: 'Portfolio - PCR 1',
          description: 'Patient Care Report 1. Weighting: 5% (CW)',
          mandatory: true,
          emoji: '📋'
        }
      ]
    },
    {
      date: '2025-10-15',
      time: '11:59 PM',
      items: [
        {
          type: 'pcr',
          number: 2,
          title: 'Portfolio - PCR 2',
          description: 'Patient Care Report 2. Weighting: 5% (CW)',
          mandatory: true,
          emoji: '📋'
        }
      ]
    },
    {
      date: '2025-10-20',
      time: '11:59 PM',
      items: [
        {
          type: 'pcr',
          number: 3,
          title: 'Portfolio - PCR 3',
          description: 'Patient Care Report 3. Weighting: 5% (CW)',
          mandatory: true,
          emoji: '📋'
        }
      ]
    },
    {
      date: '2025-11-03',
      time: '11:59 PM',
      items: [
        {
          type: 'pcr',
          number: 4,
          title: 'Portfolio - PCR 4',
          description: 'Patient Care Report 4. Weighting: 5% (CW)',
          mandatory: true,
          emoji: '📋'
        }
      ]
    },
    {
      date: '2025-11-06',
      time: '11:59 PM',
      items: [
        {
          type: 'skills',
          number: 1,
          title: 'Portfolio - Skills Log',
          description: 'Skills log documentation. Weighting: 30% (CW)',
          mandatory: true,
          emoji: '📚'
        }
      ]
    },
    {
      date: '2025-11-20',
      time: '11:59 PM',
      items: [
        {
          type: 'evaluation',
          number: 1,
          title: 'Portfolio - Evaluation',
          description: 'Portfolio evaluation. Weighting: 20% (Final)',
          mandatory: true,
          emoji: '📝'
        },
        {
          type: 'integration',
          number: 1,
          title: 'Portfolio - Clinical Practice Integration',
          description: 'Clinical practice integration assessment. Weighting: 20% (Final)',
          mandatory: true,
          emoji: '🏥'
        },
        {
          type: 'clinical',
          number: 1,
          title: 'Clinical Learning',
          description: 'Clinical Practice: 144 hours (80% clinical, 20% virtual/lab). All clinical hours must be completed by this date.',
          mandatory: true,
          emoji: '⚕️'
        }
      ]
    }
  ],
  criticalDeadlines: [
    { title: 'Role Play Submission', date: '2025-10-09' },
    { title: 'Skills Log Due', date: '2025-11-06' },
    { title: 'Final Portfolio & Clinical Hours', date: '2025-11-20' }
  ]
};

async function main() {
  console.log('📅 Adding HEM2903 submission schedule...\n');

  // Find HEM2903 module
  const module = await prisma.module.findFirst({
    where: { code: 'HEM2903' }
  });

  if (!module) {
    console.error('❌ HEM2903 module not found!');
    process.exit(1);
  }

  console.log(`✅ Found module: ${module.code} - ${module.name}`);

  // Update module with submission schedule
  await prisma.module.update({
    where: { id: module.id },
    data: {
      submissionSchedule: submissionSchedule
    }
  });

  console.log('\n✅ Submission schedule added successfully!');
  console.log(`\n📊 Schedule Summary:`);
  console.log(`   - ${submissionSchedule.timeline.length} timeline entries`);
  console.log(`   - ${submissionSchedule.criticalDeadlines.length} critical deadlines`);
  console.log(`   - Total submissions: ${submissionSchedule.timeline.reduce((sum, entry) => sum + entry.items.length, 0)}`);
  console.log('\n✨ Students can now view the full submission schedule in the module detail page!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
