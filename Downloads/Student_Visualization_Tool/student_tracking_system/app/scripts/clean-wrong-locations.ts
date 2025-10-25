#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n🧹 CLEANING WRONG LOCATIONS FROM DATABASE\n');
  console.log('='.repeat(70) + '\n');

  try {
    // First, delete all schedules and schedule entries to avoid foreign key issues
    console.log('🗑️  Step 1: Deleting all existing clinical placement schedules...\n');

    const deletedEntries = await prisma.scheduleEntry.deleteMany({
      where: {
        type: 'clinical_placement'
      }
    });

    console.log(`   ✓ Deleted ${deletedEntries.count} schedule entries\n`);

    // Delete all locations that are not Abu Dhabi Civil Defense ambulance stations
    console.log('🗑️  Step 2: Deleting wrong locations...\n');

    // Delete locations that are clearly wrong (classrooms, labs, hospitals)
    const deletedLocations = await prisma.location.deleteMany({
      where: {
        OR: [
          { type: 'clinical_placement' }, // Old wrong clinical placements
          { name: { contains: 'Lab' } },
          { name: { contains: 'Classroom' } },
          { name: { contains: 'Hospital' } },
          { name: { contains: 'Juma Al Majid' } },
          { name: { contains: 'Zayed Hospital' } },
          { building: 'External Clinical Site' }
        ],
        NOT: {
          name: {
            contains: 'Abu Dhabi Civil Defense'
          }
        }
      }
    });

    console.log(`   ✓ Deleted ${deletedLocations.count} wrong locations\n`);

    // Show remaining locations
    const remainingLocations = await prisma.location.findMany({
      orderBy: { name: 'asc' }
    });

    console.log(`📍 Remaining locations: ${remainingLocations.length}\n`);

    if (remainingLocations.length > 0) {
      console.log('Locations in database:');
      remainingLocations.forEach(loc => {
        console.log(`   - ${loc.name} (${loc.type})`);
      });
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ CLEANUP COMPLETE!\n');

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('✨ Script completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
