#!/usr/bin/env tsx
import * as XLSX from 'xlsx';

const scheduleFile = '/Users/eliastlcthomas/Desktop/HCT_schedule.xlsx';
const workbook = XLSX.readFile(scheduleFile);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('\nChecking mobile number column...\n');

// Find "DIPLOMA STUDENTS" marker
let diplomaRow = -1;
for (let i = 0; i < data.length; i++) {
  if (data[i].join(' ').includes('DIPLOMA STUDENTS')) {
    diplomaRow = i;
    break;
  }
}

console.log(`DIPLOMA STUDENTS at row: ${diplomaRow + 1}\n`);

// Check first 10 HCT students for mobile numbers
console.log('First 10 HCT students with mobile numbers:\n');
for (let i = diplomaRow + 1; i < diplomaRow + 11; i++) {
  const row = data[i];
  const name = row[2];
  const mobile = row[36]; // Column 36 is mobile based on earlier check
  
  if (name) {
    console.log(`${name}`);
    console.log(`  Mobile: ${mobile || 'NONE'}`);
    console.log(`  Row data (cols 35-38):`, row.slice(35, 39));
    console.log();
  }
}
