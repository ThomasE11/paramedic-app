#!/usr/bin/env tsx

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { stationCodeToLocation } from './station-codes';

const scheduleFile = '/Users/eliastlcthomas/Desktop/HCT_schedule.xlsx';

console.log('\n🔍 EXTRACTING HCT STUDENT SCHEDULES\n');
console.log('='.repeat(70) + '\n');

// Read the Excel file
const workbook = XLSX.readFile(scheduleFile);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log(`📄 Total rows in file: ${data.length}\n`);

// Find the "DIPLOMA STUDENTS" marker row
let diplomaStudentsRow = -1;
for (let i = 0; i < data.length; i++) {
  const row = data[i];
  for (let j = 0; j < row.length; j++) {
    if (row[j] && String(row[j]).includes('DIPLOMA STUDENTS')) {
      diplomaStudentsRow = i;
      console.log(`✓ Found "DIPLOMA STUDENTS" marker at row ${i + 1}`);
      break;
    }
  }
  if (diplomaStudentsRow !== -1) break;
}

if (diplomaStudentsRow === -1) {
  console.error('❌ Could not find "DIPLOMA STUDENTS" marker');
  process.exit(1);
}

// Header is at row 7 (index 6) - contains day abbreviations
// Date row is at row 8 (index 7) - contains dates 1-31
const headerRow = 6; // Row 7 in Excel (0-indexed)
const dateRow = 7;    // Row 8 in Excel (0-indexed)

console.log(`✓ Using header row at row ${headerRow + 1}`);
console.log(`✓ Using date row at row ${dateRow + 1}`);

// Extract dates and days from header and date rows
const headerData = data[headerRow];
const dateData = data[dateRow];
const dateColumns: { col: number; date: string; day: string }[] = [];

// Day abbreviation mapping
const dayAbbrevMap: Record<string, string> = {
  'W': 'Wednesday',
  'TH': 'Thursday',
  'F': 'Friday',
  'S': 'Saturday',
  'M': 'Monday',
  'TU': 'Tuesday'
};

// Columns 3-35 contain the schedule (Oct 1 - Oct 31 + Nov 1-2)
for (let col = 3; col < 36; col++) {
  const dayAbbrev = headerData[col];
  const dateNum = dateData[col];

  if (dayAbbrev && dateNum && typeof dateNum === 'number') {
    const dayName = dayAbbrevMap[dayAbbrev] || dayAbbrev;

    // Determine month (October for dates 1-31, November for dates 1-2 in columns after 31)
    let month = 10; // October
    let year = 2025;
    if (col > 33 && dateNum <= 2) {
      month = 11; // November
    }

    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;

    dateColumns.push({ col, date: dateStr, day: dayName });
  }
}

console.log(`✓ Found ${dateColumns.length} date columns`);
console.log('\nDate columns:');
dateColumns.forEach(dc => {
  console.log(`  Column ${dc.col}: ${dc.day} ${dc.date}`);
});

// Extract HCT students (rows after "DIPLOMA STUDENTS" marker)
const students: any[] = [];
const startRow = diplomaStudentsRow + 1;

console.log(`\n📋 Extracting HCT students from row ${startRow + 1}...\n`);

for (let i = startRow; i < data.length; i++) {
  const row = data[i];

  // Skip empty rows
  if (!row || row.length === 0) continue;

  // Column 2 contains the student name
  const fullName = row[2];
  // Column 36 contains the mobile number
  const mobile = row[36];

  // Skip if no name
  if (!fullName || typeof fullName !== 'string' || fullName.length < 3) continue;

  const shifts: any[] = [];

  // Extract shift codes for each date column
  for (const dateCol of dateColumns) {
    const shiftCode = row[dateCol.col];

    // Only process if there's a shift code and it's in our station mapping
    if (shiftCode && typeof shiftCode === 'string') {
      const code = shiftCode.trim().toUpperCase();

      // Check if code exists in our station mapping
      if (stationCodeToLocation[code]) {
        shifts.push({
          date: dateCol.date,
          dayOfWeek: dateCol.day,
          shiftCode: code,
          station: stationCodeToLocation[code].name
        });
      }
    }
  }

  // Only add students who have at least one shift
  if (shifts.length > 0) {
    students.push({
      fullName: fullName.trim(),
      mobile: mobile ? String(mobile).trim() : null,
      shifts
    });

    console.log(`✓ ${fullName.trim()} - Mobile: ${mobile || 'N/A'}: ${shifts.length} shifts`);
  }
}

console.log(`\n✅ Extracted ${students.length} HCT students with schedules\n`);

// Save to file
const outputFile = '/Users/eliastlcthomas/Desktop/hct_student_schedules.json';
fs.writeFileSync(outputFile, JSON.stringify(students, null, 2));

console.log(`💾 Saved to: ${outputFile}\n`);

// Print summary
console.log('📊 Summary:');
console.log(`   Total HCT students: ${students.length}`);
console.log(`   Total shifts: ${students.reduce((sum, s) => sum + s.shifts.length, 0)}`);
console.log(`   Unique stations: ${new Set(students.flatMap(s => s.shifts.map(sh => sh.station))).size}`);
console.log();

// Print first few students as sample
console.log('📋 Sample data (first 3 students):\n');
students.slice(0, 3).forEach(student => {
  console.log(`${student.fullName}`);
  student.shifts.slice(0, 3).forEach((shift: any) => {
    console.log(`  ${shift.date} (${shift.dayOfWeek}): ${shift.shiftCode} - ${shift.station}`);
  });
  if (student.shifts.length > 3) {
    console.log(`  ... and ${student.shifts.length - 3} more shifts`);
  }
  console.log();
});
