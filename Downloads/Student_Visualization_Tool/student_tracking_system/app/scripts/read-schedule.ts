#!/usr/bin/env tsx
import * as XLSX from 'xlsx';

const scheduleFile = '/Users/eliastlcthomas/Desktop/HCT_schedule.xlsx';
const workbook = XLSX.readFile(scheduleFile);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('\nLooking for student IDs in first HCT student row (row 24):');
const row24 = data[23];
row24.forEach((cell, idx) => {
  if (cell !== undefined && cell !== '') {
    console.log(`  [${idx}]: ${cell}`);
  }
});

console.log('\n\nSample student with data (row 38 - SHAHED ALSHAMSI):');
const row38 = data[36];
row38.forEach((cell, idx) => {
  if (cell !== undefined && cell !== '') {
    console.log(`  [${idx}]: ${cell}`);
  }
});

console.log('\n\nChecking header row to map columns:');
console.log('Row 7 (days): ', data[6]);
console.log('\nRow 8 (dates):', data[7]);
