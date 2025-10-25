#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { stationCodeToLocation, shiftCodeToTime } from './station-codes';

const prisma = new PrismaClient();

// Load extracted schedule data
const schedules = JSON.parse(
  fs.readFileSync('/Users/eliastlcthomas/Desktop/hct_student_schedules.json', 'utf-8')
);

async function main() {
  console.log('\n🚀 IMPORTING HCT STUDENT SCHEDULES TO DATABASE\n');
  console.log('='.repeat(70) + '\n');

  try {
    // Step 1: Create clinical placement locations
    console.log('📍 Step 1: Creating clinical placement locations...\n');

    const locationMap = new Map<string, string>();

    for (const [code, locationData] of Object.entries(stationCodeToLocation)) {
      const existingLocation = await prisma.location.findFirst({
        where: { name: locationData.name }
      });

      if (existingLocation) {
        console.log(`   ✓ Location exists: ${locationData.name}`);
        locationMap.set(code, existingLocation.id);
      } else {
        const newLocation = await prisma.location.create({
          data: {
            name: locationData.name,
            type: locationData.type,
            capacity: 10, // Default capacity for clinical placements
            building: 'Abu Dhabi Civil Defense',
            floor: 'N/A',
            equipment: 'Ambulance and emergency medical equipment'
          }
        });
        console.log(`   + Created: ${locationData.name} (ID: ${newLocation.id})`);
        locationMap.set(code, newLocation.id);
      }
    }

    console.log(`\n✅ Locations ready: ${locationMap.size}\n`);

    // Step 2: Create time slots
    console.log('⏰ Step 2: Creating time slots...\n');

    const timeSlotMap = new Map<string, string>();

    for (const [code, timeData] of Object.entries(shiftCodeToTime)) {
      const timeSlotName = `${timeData.start}-${timeData.end}`;

      const existingTimeSlot = await prisma.timeSlot.findFirst({
        where: {
          startTime: timeData.start,
          endTime: timeData.end
        }
      });

      if (existingTimeSlot) {
        console.log(`   ✓ Time slot exists: ${timeSlotName}`);
        timeSlotMap.set(code, existingTimeSlot.id);
      } else {
        // Calculate duration in minutes
        const [startHour, startMin] = timeData.start.split(':').map(Number);
        const [endHour, endMin] = timeData.end.split(':').map(Number);
        let duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);

        // Handle overnight shifts (negative duration)
        if (duration < 0) {
          duration = 1440 + duration; // Add 24 hours (1440 minutes)
        }

        const newTimeSlot = await prisma.timeSlot.create({
          data: {
            startTime: timeData.start,
            endTime: timeData.end,
            duration: duration
          }
        });
        console.log(`   + Created: ${timeSlotName} (${duration} mins) (ID: ${newTimeSlot.id})`);
        timeSlotMap.set(code, newTimeSlot.id);
      }
    }

    console.log(`\n✅ Time slots ready: ${timeSlotMap.size}\n`);

    // Step 3: Import schedules for each student
    console.log('📅 Step 3: Importing student schedules...\n');

    let totalSchedulesCreated = 0;
    let totalEntriesCreated = 0;

    for (const studentSchedule of schedules) {
      console.log(`\n👤 ${studentSchedule.fullName}`);

      // Try to match student by full name (case-insensitive)
      const student = await prisma.student.findFirst({
        where: {
          fullName: {
            equals: studentSchedule.fullName,
            mode: 'insensitive'
          }
        }
      });

      if (!student) {
        console.log(`   ⚠️  Student not found in database - skipping`);
        console.log(`      (Name: "${studentSchedule.fullName}")`);
        continue;
      }

      console.log(`   ✓ Matched to student ID: ${student.studentId}`);

      // Delete existing schedule for October 2025 (if any)
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

      // Create schedule entries for each shift
      console.log(`   Adding ${studentSchedule.shifts.length} shifts...`);

      for (const shift of studentSchedule.shifts) {
        const locationId = locationMap.get(shift.shiftCode);
        const timeSlotId = timeSlotMap.get(shift.shiftCode);
        const timeData = shiftCodeToTime[shift.shiftCode];

        if (!locationId || !timeSlotId) {
          console.log(`   ⚠️  Unknown shift code: ${shift.shiftCode} on ${shift.date}`);
          continue;
        }

        const entry = await prisma.scheduleEntry.create({
          data: {
            scheduleId: schedule.id,
            timeSlotId: timeSlotId,
            locationId: locationId,
            dayOfWeek: shift.dayOfWeek,
            startTime: timeData.start,
            endTime: timeData.end,
            title: `Clinical Placement - ${stationCodeToLocation[shift.shiftCode].name}`,
            type: 'clinical_placement',
            notes: `Shift code: ${shift.shiftCode} | Date: ${shift.date}`,
            color: '#10B981', // Green for clinical placements
            isRecurring: false
          }
        });

        totalEntriesCreated++;
        console.log(`     • ${shift.date}: ${shift.shiftCode} (${timeData.start}-${timeData.end})`);
      }

      console.log(`   ✅ ${studentSchedule.shifts.length} shifts added`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n🎉 IMPORT COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`   Locations created/verified: ${locationMap.size}`);
    console.log(`   Time slots created/verified: ${timeSlotMap.size}`);
    console.log(`   Student schedules created: ${totalSchedulesCreated}`);
    console.log(`   Schedule entries created: ${totalEntriesCreated}`);
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
