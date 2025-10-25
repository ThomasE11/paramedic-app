import { prisma } from '@/lib/db';

async function main() {
  console.log('Activity Log - Last 15 entries:');
  console.log('='.repeat(60));

  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: 'desc' },
    take: 15
  });

  if (activities.length === 0) {
    console.log('No activities found in database');
    return;
  }

  activities.forEach((activity, index) => {
    const num = index + 1;
    console.log(`${num}. Type: ${activity.type}`);
    console.log(`   Description: ${activity.description}`);
    console.log(`   Created: ${activity.createdAt}`);
    if (activity.metadata) {
      console.log(`   Metadata: ${JSON.stringify(activity.metadata)}`);
    }
    console.log('');
  });

  console.log(`Total: ${activities.length} activities`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
