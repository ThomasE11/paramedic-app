/**
 * Script to create Excel and CSV templates for placement schedule uploads
 * Run: npx tsx scripts/create-placement-templates.ts
 */

import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Create output directory
const outputDir = join(process.cwd(), 'placement-templates');

console.log('📝 Creating Placement Schedule Templates...\n');

// Template 1: Simple Table Format
function createSimpleTableTemplate() {
  const data = [
    ['Student Name', 'Student ID', 'Site Name', 'Site Type', 'Start Date', 'End Date', 'Week Number', 'Shift', 'Mentor'],
    ['Fatima Al Mazrouei', 'H20230101', 'Al Ain Hospital', 'hospital', '2025-01-15', '2025-02-12', '3-6', 'day', 'Dr. Ahmed Hassan'],
    ['Mohammed Hassan', 'H20230102', 'Sheikh Khalifa Medical City', 'hospital', '2025-01-15', '2025-02-12', '3-6', 'night', 'Nurse Sarah Ali'],
    ['Aisha Abdullah', 'H20230103', 'Abu Dhabi Ambulance Station 1', 'ambulance_station', '2025-01-15', '2025-02-12', '3-6', 'rotating', 'Paramedic Khalid'],
    ['Omar Al Hashimi', 'H20230104', 'Community Health Center - Mussafah', 'community_clinic', '2025-01-15', '2025-02-12', '3-6', 'day', 'Dr. Layla Mohammed'],
    ['Sara Al Ameri', 'H20230105', 'Cleveland Clinic Abu Dhabi', 'hospital', '2025-01-15', '2025-02-12', '3-6', 'day', 'Dr. John Smith'],
    [],
    ['Fatima Al Mazrouei', 'H20230101', 'Sheikh Khalifa Medical City', 'hospital', '2025-02-13', '2025-03-12', '7-10', 'night', 'Dr. Ali Ahmed'],
    ['Mohammed Hassan', 'H20230102', 'Abu Dhabi Ambulance Station 2', 'ambulance_station', '2025-02-13', '2025-03-12', '7-10', 'rotating', 'Paramedic Ahmed'],
    ['Aisha Abdullah', 'H20230103', 'Al Ain Hospital - ICU', 'hospital', '2025-02-13', '2025-03-12', '7-10', 'night', 'Nurse Mariam'],
    ['Omar Al Hashimi', 'H20230104', 'Tawam Hospital', 'hospital', '2025-02-13', '2025-03-12', '7-10', 'day', 'Dr. Hassan Ali'],
    ['Sara Al Ameri', 'H20230105', 'Primary Care Center - Al Reem', 'primary_care', '2025-02-13', '2025-03-12', '7-10', 'day', 'Dr. Fatima Saeed'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 25 }, // Student Name
    { wch: 12 }, // Student ID
    { wch: 35 }, // Site Name
    { wch: 18 }, // Site Type
    { wch: 12 }, // Start Date
    { wch: 12 }, // End Date
    { wch: 12 }, // Week Number
    { wch: 10 }, // Shift
    { wch: 25 }, // Mentor
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Placements');

  return wb;
}

// Template 2: Detailed Format with Department
function createDetailedTemplate() {
  const data = [
    ['Week', 'Student Name', 'Student ID', 'Site Name', 'Department', 'Site Type', 'Start Date', 'End Date', 'Shift', 'Mentor', 'Notes'],
    ['3-6', 'Fatima Al Mazrouei', 'H20230101', 'Al Ain Hospital', 'Emergency Department', 'hospital', '2025-01-15', '2025-02-12', 'day', 'Dr. Ahmed Hassan', 'Focus on trauma cases'],
    ['3-6', 'Mohammed Hassan', 'H20230102', 'Sheikh Khalifa Medical City', 'Intensive Care Unit', 'hospital', '2025-01-15', '2025-02-12', 'night', 'Nurse Sarah Ali', 'Critical care skills'],
    ['3-6', 'Aisha Abdullah', 'H20230103', 'Abu Dhabi Ambulance Station 1', 'Ambulance Operations', 'ambulance_station', '2025-01-15', '2025-02-12', 'rotating', 'Paramedic Khalid', 'Pre-hospital care'],
    ['3-6', 'Omar Al Hashimi', 'H20230104', 'Community Health Center', 'Primary Care', 'community_clinic', '2025-01-15', '2025-02-12', 'day', 'Dr. Layla Mohammed', 'Preventive medicine'],
    ['3-6', 'Sara Al Ameri', 'H20230105', 'Cleveland Clinic Abu Dhabi', 'Cardiology', 'hospital', '2025-01-15', '2025-02-12', 'day', 'Dr. John Smith', 'Cardiac emergencies'],
    [],
    ['7-10', 'Fatima Al Mazrouei', 'H20230101', 'Sheikh Khalifa Medical City', 'Emergency Department', 'hospital', '2025-02-13', '2025-03-12', 'night', 'Dr. Ali Ahmed', 'Night shift experience'],
    ['7-10', 'Mohammed Hassan', 'H20230102', 'Abu Dhabi Ambulance', 'Field Operations', 'ambulance_station', '2025-02-13', '2025-03-12', 'rotating', 'Paramedic Ahmed', 'All shifts rotation'],
    ['7-10', 'Aisha Abdullah', 'H20230103', 'Al Ain Hospital', 'Intensive Care', 'hospital', '2025-02-13', '2025-03-12', 'night', 'Nurse Mariam', 'Advanced ICU skills'],
    ['7-10', 'Omar Al Hashimi', 'H20230104', 'Tawam Hospital', 'Emergency Medicine', 'hospital', '2025-02-13', '2025-03-12', 'day', 'Dr. Hassan Ali', 'Level 1 trauma'],
    ['7-10', 'Sara Al Ameri', 'H20230105', 'Primary Care Center', 'Family Medicine', 'primary_care', '2025-02-13', '2025-03-12', 'day', 'Dr. Fatima Saeed', 'Community health'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = [
    { wch: 8 },  // Week
    { wch: 25 }, // Student Name
    { wch: 12 }, // Student ID
    { wch: 35 }, // Site Name
    { wch: 25 }, // Department
    { wch: 18 }, // Site Type
    { wch: 12 }, // Start Date
    { wch: 12 }, // End Date
    { wch: 10 }, // Shift
    { wch: 25 }, // Mentor
    { wch: 30 }, // Notes
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Detailed Placements');

  return wb;
}

// Template 3: Narrative/Free-form Style
function createNarrativeTemplate() {
  const data = [
    ['Clinical Placement Schedule - Semester 1, 2025'],
    [''],
    ['=== WEEK 3-6 (January 15 - February 12, 2025) ==='],
    [''],
    ['Fatima Al Mazrouei (H20230101)'],
    ['Site: Al Ain Hospital - Emergency Department'],
    ['Type: Hospital'],
    ['Shift: Day shift (08:00 - 16:00)'],
    ['Mentor: Dr. Ahmed Hassan'],
    [''],
    ['Mohammed Hassan (H20230102)'],
    ['Site: Sheikh Khalifa Medical City - Intensive Care Unit'],
    ['Type: Hospital'],
    ['Shift: Night shift (20:00 - 08:00)'],
    ['Mentor: Nurse Sarah Ali'],
    [''],
    ['Aisha Abdullah (H20230103)'],
    ['Site: Abu Dhabi Ambulance Station 1'],
    ['Type: Ambulance Station'],
    ['Shift: Rotating shifts'],
    ['Mentor: Paramedic Khalid Mohammed'],
    [''],
    ['=== WEEK 7-10 (February 13 - March 12, 2025) ==='],
    [''],
    ['Fatima Al Mazrouei (H20230101)'],
    ['Site: Sheikh Khalifa Medical City - Emergency Department'],
    ['Shift: Night shift'],
    ['Mentor: Dr. Ali Ahmed'],
    [''],
    ['Mohammed Hassan (H20230102)'],
    ['Site: Abu Dhabi Ambulance - Field Operations'],
    ['Shift: Rotating (all shifts)'],
    ['Mentor: Paramedic Ahmed Saeed'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 80 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Narrative Format');

  return wb;
}

// Template 4: Multi-sheet with Sites info
function createMultiSheetTemplate() {
  // Sheet 1: Placements
  const placementsData = [
    ['Student Name', 'Student ID', 'Site Name', 'Start Date', 'End Date', 'Week', 'Shift', 'Mentor'],
    ['Fatima Al Mazrouei', 'H20230101', 'Al Ain Hospital', '2025-01-15', '2025-02-12', '3-6', 'day', 'Dr. Ahmed Hassan'],
    ['Mohammed Hassan', 'H20230102', 'Sheikh Khalifa Medical City', '2025-01-15', '2025-02-12', '3-6', 'night', 'Nurse Sarah Ali'],
    ['Aisha Abdullah', 'H20230103', 'Abu Dhabi Ambulance Station 1', '2025-01-15', '2025-02-12', '3-6', 'rotating', 'Paramedic Khalid'],
  ];

  // Sheet 2: Sites Information
  const sitesData = [
    ['Site Name', 'Type', 'Address', 'Contact Person', 'Phone', 'Email'],
    ['Al Ain Hospital', 'hospital', 'Al Ain City', 'Dr. Ahmed Hassan', '+971-3-7037777', 'ahmed.hassan@aah.ae'],
    ['Sheikh Khalifa Medical City', 'hospital', 'Abu Dhabi', 'Nurse Sarah Ali', '+971-2-6100000', 'sarah.ali@skmc.ae'],
    ['Abu Dhabi Ambulance Station 1', 'ambulance_station', 'Abu Dhabi', 'Paramedic Khalid', '+971-2-4444444', 'khalid@ada.ae'],
  ];

  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.aoa_to_sheet(placementsData);
  ws1['!cols'] = [
    { wch: 25 }, { wch: 12 }, { wch: 35 }, { wch: 12 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Placements');

  const ws2 = XLSX.utils.aoa_to_sheet(sitesData);
  ws2['!cols'] = [
    { wch: 35 }, { wch: 18 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 30 }
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'Sites Info');

  return wb;
}

// Template 5: Blank Template for custom use
function createBlankTemplate() {
  const data = [
    ['Student Name', 'Student ID', 'Site Name', 'Site Type', 'Start Date', 'End Date', 'Week Number', 'Shift', 'Mentor'],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  ws['!cols'] = [
    { wch: 25 }, { wch: 12 }, { wch: 35 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 25 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Placements');

  return wb;
}

// Create CSV template
function createCSVTemplate() {
  const data = [
    ['Student Name', 'Student ID', 'Site Name', 'Site Type', 'Start Date', 'End Date', 'Week Number', 'Shift', 'Mentor'],
    ['Fatima Al Mazrouei', 'H20230101', 'Al Ain Hospital', 'hospital', '2025-01-15', '2025-02-12', '3-6', 'day', 'Dr. Ahmed Hassan'],
    ['Mohammed Hassan', 'H20230102', 'Sheikh Khalifa Medical City', 'hospital', '2025-01-15', '2025-02-12', '3-6', 'night', 'Nurse Sarah Ali'],
    ['Aisha Abdullah', 'H20230103', 'Abu Dhabi Ambulance Station 1', 'ambulance_station', '2025-01-15', '2025-02-12', '3-6', 'rotating', 'Paramedic Khalid'],
  ];

  return data.map(row => row.join(',')).join('\n');
}

// Create text template
function createTextTemplate() {
  return `Clinical Placement Schedule - Semester 1, 2025

=== WEEK 3-6 (January 15 - February 12, 2025) ===

Fatima Al Mazrouei (H20230101)
- Site: Al Ain Hospital - Emergency Department
- Type: Hospital
- Shift: Day shift (08:00 - 16:00)
- Mentor: Dr. Ahmed Hassan

Mohammed Hassan (H20230102)
- Site: Sheikh Khalifa Medical City - Intensive Care Unit
- Type: Hospital
- Shift: Night shift (20:00 - 08:00)
- Mentor: Nurse Sarah Ali

Aisha Abdullah (H20230103)
- Site: Abu Dhabi Ambulance Station 1
- Type: Ambulance Station
- Shift: Rotating shifts
- Mentor: Paramedic Khalid Mohammed

Omar Al Hashimi (H20230104)
- Site: Community Health Center - Mussafah
- Type: Community Clinic
- Shift: Day shift
- Mentor: Dr. Layla Mohammed

Sara Al Ameri (H20230105)
- Site: Cleveland Clinic Abu Dhabi - Cardiology
- Type: Hospital
- Shift: Day shift
- Mentor: Dr. John Smith


=== WEEK 7-10 (February 13 - March 12, 2025) ===

Fatima Al Mazrouei (H20230101)
- Site: Sheikh Khalifa Medical City - Emergency Department
- Shift: Night shift
- Mentor: Dr. Ali Ahmed

Mohammed Hassan (H20230102)
- Site: Abu Dhabi Ambulance - Field Operations
- Shift: Rotating (all shifts)
- Mentor: Paramedic Ahmed Saeed

Aisha Abdullah (H20230103)
- Site: Al Ain Hospital - Intensive Care Unit
- Shift: Night shift
- Mentor: Nurse Mariam Abdullah

Omar Al Hashimi (H20230104)
- Site: Tawam Hospital - Emergency Medicine
- Shift: Day shift
- Mentor: Dr. Hassan Ali

Sara Al Ameri (H20230105)
- Site: Primary Care Center - Al Reem Island
- Shift: Day shift
- Mentor: Dr. Fatima Saeed
`;
}

// Main execution
try {
  console.log('1️⃣  Creating Simple Table Template...');
  const simpleWB = createSimpleTableTemplate();
  XLSX.writeFile(simpleWB, join(outputDir, '1-Simple-Table-Template.xlsx'));
  console.log('   ✅ Created: 1-Simple-Table-Template.xlsx\n');

  console.log('2️⃣  Creating Detailed Template with Departments...');
  const detailedWB = createDetailedTemplate();
  XLSX.writeFile(detailedWB, join(outputDir, '2-Detailed-Template.xlsx'));
  console.log('   ✅ Created: 2-Detailed-Template.xlsx\n');

  console.log('3️⃣  Creating Narrative/Free-form Template...');
  const narrativeWB = createNarrativeTemplate();
  XLSX.writeFile(narrativeWB, join(outputDir, '3-Narrative-Template.xlsx'));
  console.log('   ✅ Created: 3-Narrative-Template.xlsx\n');

  console.log('4️⃣  Creating Multi-sheet Template...');
  const multiSheetWB = createMultiSheetTemplate();
  XLSX.writeFile(multiSheetWB, join(outputDir, '4-Multi-Sheet-Template.xlsx'));
  console.log('   ✅ Created: 4-Multi-Sheet-Template.xlsx\n');

  console.log('5️⃣  Creating Blank Template...');
  const blankWB = createBlankTemplate();
  XLSX.writeFile(blankWB, join(outputDir, '5-Blank-Template.xlsx'));
  console.log('   ✅ Created: 5-Blank-Template.xlsx\n');

  console.log('6️⃣  Creating CSV Template...');
  const csvContent = createCSVTemplate();
  writeFileSync(join(outputDir, '6-CSV-Template.csv'), csvContent);
  console.log('   ✅ Created: 6-CSV-Template.csv\n');

  console.log('7️⃣  Creating Text Template...');
  const textContent = createTextTemplate();
  writeFileSync(join(outputDir, '7-Text-Template.txt'), textContent);
  console.log('   ✅ Created: 7-Text-Template.txt\n');

  console.log('🎉 All templates created successfully!\n');
  console.log(`📁 Templates location: ${outputDir}\n`);
  console.log('📝 Template descriptions:');
  console.log('   1. Simple Table - Basic format, easiest to use');
  console.log('   2. Detailed - Includes departments and notes');
  console.log('   3. Narrative - Free-form text style');
  console.log('   4. Multi-sheet - Placements + Sites info');
  console.log('   5. Blank - Empty template for your data');
  console.log('   6. CSV - Comma-separated values');
  console.log('   7. Text - Plain text format\n');
  console.log('💡 Tip: Use any of these templates to upload your placement schedule!');
  console.log('   The AI will understand all formats and parse them automatically.\n');

} catch (error) {
  console.error('❌ Error creating templates:', error);
  process.exit(1);
}
