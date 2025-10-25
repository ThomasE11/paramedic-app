#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import { stationCodeToLocation, shiftCodeToTime } from './station-codes';

const prisma = new PrismaClient();

const scheduleFile = '/Users/eliastlcthomas/Desktop/hct_student_schedules.json';

async function main() {
  console.log('\n🚀 IMPORTING HCT CLINICAL PLACEMENTS\n');
  console.log('='.repeat(70) + '\n');

  // Read extracted schedule data
  const scheduleData = JSON.parse(fs.readFileSync(scheduleFile, 'utf-8'));
  console.log(`📄 Loaded ${scheduleData.length} students from file\n`);

  // Get all students from database
  const allStudents = await prisma.student.findMany({
    select: {
      id: true,
      fullName: true,
    },
  });

  console.log(`📊 Found ${allStudents.length} students in database\n`);

  // Build lookup map by first name + last name
  // Arabic names in DB: "First Middle1 Middle2 LastName"
  // Excel names: "FIRST LASTNAME"
  const studentsByName = new Map<string, typeof allStudents[0]>();

  // Helper function to normalize Arabic name variations
  function normalizeArabicName(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z]/g, '') // Remove non-letters
      .replace(/ou/g, 'o')    // Normalize ou → o
      .replace(/aa/g, 'a')    // Normalize double-a
      .replace(/ee/g, 'e')    // Normalize double-e
      .replace(/oo/g, 'o')    // Normalize double-o
      .replace(/ii/g, 'i')    // Normalize double-i
      .replace(/y/g, '');     // Remove y (Alyhyaie vs Alyahyaee)
  }

  allStudents.forEach(student => {
    const parts = student.fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      const firstName = normalizeArabicName(parts[0]);
      const lastName = normalizeArabicName(parts[parts.length - 1]);
      const key = `${firstName}|${lastName}`;
      studentsByName.set(key, student);
    }
  });

  console.log(`✓ Indexed ${studentsByName.size} students by normalized first+last name\n`);

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

  // Get first user (for createdBy field)
  const firstUser = await prisma.user.findFirst();
  if (!firstUser) {
    console.error('❌ No users found in database');
    process.exit(1);
  }

  let matched = 0;
  let skipped = 0;
  let placementsCreated = 0;

  // Helper function to normalize Arabic name variations (same as above)
  function normalizeArabicName(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z]/g, '') // Remove non-letters
      .replace(/ou/g, 'o')    // Normalize ou → o
      .replace(/aa/g, 'a')    // Normalize double-a
      .replace(/ee/g, 'e')    // Normalize double-e
      .replace(/oo/g, 'o')    // Normalize double-o
      .replace(/ii/g, 'i')    // Normalize double-i
      .replace(/y/g, '');     // Remove y (Alyhyaie vs Alyahyaee)
  }

  // Process each student from the schedule file
  for (const studentSchedule of scheduleData) {
    // Parse Excel name: "FIRST MIDDLE? LASTNAME" → first + last
    const parts = studentSchedule.fullName.trim().split(/\s+/);
    if (parts.length < 2) {
      console.log(`⚠️  Skipping ${studentSchedule.fullName} - invalid name format`);
      skipped++;
      continue;
    }

    const firstName = normalizeArabicName(parts[0]);
    const lastName = normalizeArabicName(parts[parts.length - 1]);
    const key = `${firstName}|${lastName}`;

    const student = studentsByName.get(key);

    if (!student) {
      console.log(`⚠️  Skipping ${studentSchedule.fullName} - no matching student in database`);
      skipped++;
      continue;
    }

    console.log(`\n✓ Matched: ${studentSchedule.fullName} → ${student.fullName}`);
    matched++;

    // Delete existing placements for this student in this module
    const deleted = await prisma.placementAssignment.deleteMany({
      where: {
        studentId: student.id,
        moduleId: clinicalModule.id,
      },
    });

    if (deleted.count > 0) {
      console.log(`  ℹ️  Deleted ${deleted.count} existing placement(s)`);
    }

    // Create placement assignments for each shift
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

      // Find or create PlacementSite for this location
      let placementSite = await prisma.placementSite.findFirst({
        where: {
          name: locationInfo.name,
        },
      });

      if (!placementSite) {
        placementSite = await prisma.placementSite.create({
          data: {
            name: locationInfo.name,
            type: 'ambulance_station',
            isActive: true,
          },
        });
      }

      // Parse the date
      const shiftDate = new Date(shift.date);
      const startDateTime = new Date(shiftDate);
      const [startHour, startMin] = timeInfo.start.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMin), 0);

      const endDateTime = new Date(shiftDate);
      const [endHour, endMin] = timeInfo.end.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMin), 0);

      // Create the placement assignment
      await prisma.placementAssignment.create({
        data: {
          studentId: student.id,
          siteId: placementSite.id,
          moduleId: clinicalModule.id,
          startDate: startDateTime,
          endDate: endDateTime,
          shift: `${shift.dayOfWeek} ${timeInfo.start}-${timeInfo.end}`,
          rotationType: 'clinical',
          status: 'scheduled',
          notes: `Station: ${shift.station}\nShift Code: ${shift.shiftCode}\nDate: ${shift.date}`,
          createdBy: firstUser.id,
        },
      });

      placementsCreated++;
    }

    console.log(`  ✓ Created ${studentSchedule.shifts.length} placement assignment(s)`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ IMPORT COMPLETE\n');
  console.log(`📊 Summary:`);
  console.log(`   Matched students: ${matched}`);
  console.log(`   Skipped students: ${skipped}`);
  console.log(`   Placement assignments created: ${placementsCreated}`);
  console.log();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
