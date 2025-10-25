import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const scheduleFile = '/Users/eliastlcthomas/Desktop/HCT_schedule.xlsx';

console.log('Reading HCT schedule file...');

const workbook = XLSX.readFile(scheduleFile);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('\n=== HCT SCHEDULE DATA ===\n');
console.log('Total rows:', data.length);
console.log('\nFirst 10 rows:');
data.slice(0, 10).forEach((row: any, index: number) => {
  console.log(`Row ${index}:`, row);
});

// Save full data to file for analysis
const outputPath = path.join(__dirname, '../hct-schedule-data.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
console.log(`\nFull data saved to: ${outputPath}`);

// Try to identify structure
console.log('\n=== ANALYZING STRUCTURE ===\n');
if (data.length > 0) {
  const headers = data[0] as any[];
  console.log('Detected headers:', headers);

  // Show sample data rows
  console.log('\nSample data rows (formatted):');
  data.slice(1, 6).forEach((row: any, index: number) => {
    const formatted: any = {};
    headers.forEach((header: string, i: number) => {
      formatted[header] = row[i];
    });
    console.log(`\nStudent ${index + 1}:`, JSON.stringify(formatted, null, 2));
  });
}

// Look for HCT vs Fatima College indicators
console.log('\n=== CHECKING FOR COLLEGE IDENTIFIERS ===\n');
const allText = JSON.stringify(data).toLowerCase();
if (allText.includes('fatima')) {
  console.log('✓ Found "Fatima" references - will need to filter');
}
if (allText.includes('hct')) {
  console.log('✓ Found "HCT" references');
}

console.log('\n=== COMPLETE ===');
