#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { stationCodeToLocation, shiftCodeToTime } from './station-codes';

const prisma = new PrismaClient();

// Load extracted schedule data
const schedules = JSON.parse(
  fs.readFileSync('/Users/eliastlcthomas/Desktop/hct_student_schedules.json', 'utf-8')
);

// Helper to extract last name
function getLastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1].toUpperCase();
}

async function main() {
  console.log('\n🚀 IMPORTING HCT STUDENT SCHEDULES (FLEXIBLE MATCHING)\n');
  console.log('='.repeat(70) + '\n');

  try {
    // Step 1: Get all locations
    console.log('📍 Step 1: Loading locations...\n');

    const locations = await prisma.location.findMany();
    const locationMap = new Map<string, string>();

    for (const location of locations) {
      // Try to match by exact name from stationCodeToLocation
      for (const [code, locData] of Object.entries(stationCodeToLocation)) {
        if (location.name === locData.name) {
          locationMap.set(code, location.id);
        }
      }
    }

    console.log(`✅ Loaded ${locationMap.size} location mappings\n`);

    // Step 2: Get all time slots
    console.log('⏰ Step 2: Loading time slots...\n');

    const timeSlots = await prisma.timeSlot.findMany();
    const timeSlotMap = new Map<string, string>();

    for (const timeSlot of timeSlots) {
      for (const [code, timeData] of Object.entries(shiftCodeToTime)) {
        if (timeSlot.startTime === timeData.start && timeSlot.endTime === timeData.end) {
          timeSlotMap.set(code, timeSlot.id);
        }
      }
    }

    console.log(`✅ Loaded ${timeSlotMap.size} time slot mappings\n`);

    // Step 3: Get all HCT students
    console.log('👥 Step 3: Loading HCT students from database...\n');

    const students = await prisma.student.findMany({
      where: {
        studentId: {
          startsWith: 'H00'
        }
      },
      select: {
        id: true,
        studentId: true,
        fullName: true
      }
    });

    console.log(`✅ Found ${students.length} HCT students in database\n`);

    // Create last name index
    const studentsByLastName = new Map<string, typeof students[0]>();
    for (const student of students) {
      const lastName = getLastName(student.fullName);
      studentsByLastName.set(lastName, student);
    }

    // Step 4: Import schedules
    console.log('📅 Step 4: Importing student schedules...\n');

    let totalSchedulesCreated = 0;
    let totalEntriesCreated = 0;
    let totalSkipped = 0;

    for (const studentSchedule of schedules) {
      console.log(`\n👤 ${studentSchedule.fullName}`);

      // Try to match by last name
      const excelLastName = getLastName(studentSchedule.fullName);
      const student = studentsByLastName.get(excelLastName);

      if (!student) {
        console.log(`   ⚠️  No match found for last name: ${excelLastName}`);
        totalSkipped++;
        continue;
      }

      console.log(`   ✓ Matched to: ${student.fullName} (${student.studentId})`);

      // Delete existing schedule for Fall 2025
      await prisma.schedule.deleteMany({
        where: {
          studentId: student.id,
          semester: 'Fall 2025',
          academicYear: '2025-2026'
        }
      });

      // Create new schedule
      const schedule = await prisma.schedule.create({
        data: {
          studentId: student.id,
          semester: 'Fall 2025',
          academicYear: '2025-2026',
          isActive: true
        }
      });

      console.log(`   ✓ Created schedule (ID: ${schedule.id})`);
      totalSchedulesCreated++;

      // Create schedule entries
      let entriesCreated = 0;

      // Day of week mapping
      const dayOfWeekMap: Record<string, number> = {
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6,
        'Sunday': 0
      };

      for (const shift of studentSchedule.shifts) {
        const locationId = locationMap.get(shift.shiftCode);
        const timeSlotId = timeSlotMap.get(shift.shiftCode);
        const timeData = shiftCodeToTime[shift.shiftCode];

        if (!locationId || !timeSlotId) {
          console.log(`   ⚠️  Missing location/timeslot for: ${shift.shiftCode}`);
          continue;
        }

        await prisma.scheduleEntry.create({
          data: {
            scheduleId: schedule.id,
            timeSlotId: timeSlotId,
            locationId: locationId,
            dayOfWeek: dayOfWeekMap[shift.dayOfWeek] || 0,
            startTime: timeData.start,
            endTime: timeData.end,
            title: `Clinical Placement - ${stationCodeToLocation[shift.shiftCode].name}`,
            type: 'clinical_placement',
            notes: `Shift code: ${shift.shiftCode} | Date: ${shift.date}`,
            color: '#10B981',
            isRecurring: false
          }
        });

        entriesCreated++;
        totalEntriesCreated++;
      }

      console.log(`   ✅ Created ${entriesCreated} schedule entries`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n🎉 IMPORT COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   Students processed: ${schedules.length}`);
    console.log(`   Schedules created: ${totalSchedulesCreated}`);
    console.log(`   Schedule entries created: ${totalEntriesCreated}`);
    console.log(`   Students skipped: ${totalSkipped}`);
    console.log();

  } catch (error) {
    console.error('\n❌ Error during import:', error);
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
