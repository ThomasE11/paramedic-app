import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📋 Checking assignments for HEM modules...\n');

  const modules = await prisma.module.findMany({
    where: {
      code: {
        in: ['HEM2903', 'HEM3903', 'HEM3923']
      }
    },
    include: {
      assignments: {
        orderBy: {
          dueDate: 'asc'
        }
      }
    }
  });

  for (const module of modules) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📚 ${module.code} - ${module.name}`);
    console.log(`${'='.repeat(60)}`);

    if (module.assignments.length === 0) {
      console.log('❌ No assignments found\n');
    } else {
      console.log(`✅ ${module.assignments.length} assignments found:\n`);

      module.assignments.forEach((assignment, idx) => {
        console.log(`${idx + 1}. ${assignment.title}`);
        console.log(`   Due: ${assignment.dueDate?.toLocaleDateString() || 'No due date'}`);
        console.log(`   Max Score: ${assignment.maxScore}`);
        console.log(`   Active: ${assignment.isActive ? '✅' : '❌'}`);
        console.log('');
      });
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('✅ Check complete\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
