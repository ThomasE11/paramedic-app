#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { stationCodeToLocation, shiftCodeToTime } from './station-codes';

const prisma = new PrismaClient();

const scheduleFile = '/Users/eliastlcthomas/Desktop/hct_student_schedules.json';

async function main() {
  console.log('\n🚀 IMPORTING HCT STUDENT SCHEDULES (BY MOBILE NUMBER)\n');
  console.log('='.repeat(70) + '\n');

  // Read extracted schedule data
  const scheduleData = JSON.parse(fs.readFileSync(scheduleFile, 'utf-8'));
  console.log(`📄 Loaded ${scheduleData.length} students from file\n`);

  // Get all students from database
  const allStudents = await prisma.student.findMany({
    select: {
      id: true,
      fullName: true,
      phone: true,
    },
  });

  console.log(`📊 Found ${allStudents.length} students in database\n`);

  // Build lookup map by first name + last name
  // Arabic names in DB: "First Middle1 Middle2 LastName"
  // Excel names: "FIRST LASTNAME"
  const studentsByName = new Map<string, typeof allStudents[0]>();
  allStudents.forEach(student => {
    const parts = student.fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      const firstName = parts[0].toLowerCase();
      const lastName = parts[parts.length - 1].toLowerCase();
      const key = `${firstName}|${lastName}`;
      studentsByName.set(key, student);
    }
  });

  console.log(`✓ Indexed ${studentsByName.size} students by first+last name\n`);

  // Get or create Clinical Placement module
  let clinicalModule = await prisma.module.findFirst({
    where: {
      OR: [
        { name: { contains: 'Clinical' } },
        { code: 'HCT-CLINICAL' },
      ],
    },
  });

  if (!clinicalModule) {
    console.log('  Creating HCT Clinical Placement module...');
    clinicalModule = await prisma.module.create({
      data: {
        code: 'HCT-CLINICAL',
        name: 'HCT Clinical Placement',
        description: 'Abu Dhabi Civil Defense Ambulance Station Placements for HCT Diploma Students',
      },
    });
  }

  console.log(`✓ Using clinical module: ${clinicalModule.name}\n`);

  let matched = 0;
  let skipped = 0;
  let schedulesCreated = 0;
  let entriesCreated = 0;

  // Process each student from the schedule file
  for (const studentSchedule of scheduleData) {
    // Parse Excel name: "FIRST MIDDLE? LASTNAME" → first + last
    const parts = studentSchedule.fullName.trim().split(/\s+/);
    if (parts.length < 2) {
      console.log(`⚠️  Skipping ${studentSchedule.fullName} - invalid name format`);
      skipped++;
      continue;
    }

    const firstName = parts[0].toLowerCase();
    const lastName = parts[parts.length - 1].toLowerCase();
    const key = `${firstName}|${lastName}`;

    const student = studentsByName.get(key);

    if (!student) {
      console.log(`⚠️  Skipping ${studentSchedule.fullName} - no matching student in database`);
      skipped++;
      continue;
    }

    console.log(`\n✓ Matched: ${studentSchedule.fullName} → ${student.fullName}`);
    matched++;

    // Check if schedule already exists
    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        studentId: student.id,
        semester: 'Fall 2025',
        academicYear: '2025-2026',
      },
    });

    if (existingSchedule) {
      console.log(`  ℹ️  Schedule already exists, deleting old entries...`);
      await prisma.scheduleEntry.deleteMany({
        where: { scheduleId: existingSchedule.id },
      });
    }

    // Create or update schedule
    const schedule = existingSchedule || await prisma.schedule.create({
      data: {
        studentId: student.id,
        semester: 'Fall 2025',
        academicYear: '2025-2026',
      },
    });

    if (!existingSchedule) {
      schedulesCreated++;
    }

    console.log(`  📅 ${existingSchedule ? 'Updated' : 'Created'} schedule for ${student.fullName}`);

    // Create schedule entries for each shift
    for (const shift of studentSchedule.shifts) {
      const locationInfo = stationCodeToLocation[shift.shiftCode];
      const timeInfo = shiftCodeToTime[shift.shiftCode];

      if (!locationInfo || !timeInfo) {
        console.log(`    ⚠️  Unknown shift code: ${shift.shiftCode}`);
        continue;
      }

      // Find the location in database
      const location = await prisma.location.findFirst({
        where: {
          name: locationInfo.name,
          type: locationInfo.type,
        },
      });

      if (!location) {
        console.log(`    ⚠️  Location not found: ${locationInfo.name}`);
        continue;
      }

      // Create the schedule entry
      await prisma.scheduleEntry.create({
        data: {
          scheduleId: schedule.id,
          moduleId: clinicalModule.id,
          locationId: location.id,
          dayOfWeek: shift.dayOfWeek,
          startTime: timeInfo.start,
          endTime: timeInfo.end,
          notes: `Date: ${shift.date}\nShift Code: ${shift.shiftCode}\nStation: ${shift.station}`,
        },
      });

      entriesCreated++;
    }

    console.log(`  ✓ Created ${studentSchedule.shifts.length} schedule entries`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ IMPORT COMPLETE\n');
  console.log(`📊 Summary:`);
  console.log(`   Matched students: ${matched}`);
  console.log(`   Skipped students: ${skipped}`);
  console.log(`   Schedules created: ${schedulesCreated}`);
  console.log(`   Schedule entries created: ${entriesCreated}`);
  console.log();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
