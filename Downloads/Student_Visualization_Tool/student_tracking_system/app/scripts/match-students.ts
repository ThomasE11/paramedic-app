#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

const scheduleFile = '/Users/eliastlcthomas/Desktop/HCT_schedule.xlsx';
const workbook = XLSX.readFile(scheduleFile);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

async function main() {
  // Get all HCT students from database
  const students = await prisma.student.findMany({
    where: {
      studentId: {
        startsWith: 'H00'
      }
    },
    select: {
      id: true,
      studentId: true,
      firstName: true,
      lastName: true,
      phoneNumber: true
    }
  });

  console.log(`\nFound ${students.length} HCT students in database\n`);
  
  // Sample: show first 10
  students.slice(0, 10).forEach(s => {
    console.log(`${s.studentId} - ${s.firstName} ${s.lastName} - ${s.phoneNumber || 'No phone'}`);
  });

  // Check a few Excel names
  console.log('\n\nSample Excel names (rows 24-30):');
  for (let i = 23; i < 30; i++) {
    const name = data[i][2];
    const mobile = data[i][36];
    if (name) {
      console.log(`${name} - Mobile: ${mobile || 'None'}`);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
