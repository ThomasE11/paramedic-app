import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Course mapping from CSV to our module codes
const courseMapping = {
  'Ambulance Practicum I': 'HEM2903',
  'Ambulance Practicum III': 'HEM3903',
  'Responder Practicum I': 'HEM3923',
  'Apply Clinical Practicum 1 AMB': 'AEM230'
};

async function restoreCorrectStudentAllocation() {
  try {
    console.log('=== RESTORING CORRECT STUDENT ALLOCATION ===\n');

    // Read and parse CSV file
    const csvPath = path.join(process.cwd(), 'data', 'students.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');

    console.log('Reading student data from CSV...\n');

    // Parse students from CSV
    const studentsData = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',');
      const studentName = values[2]?.trim();
      const studentNumber = values[3]?.trim();
      const course = values[6]?.trim();

      if (studentName && studentNumber && course) {
        // Split name into first and last
        const nameParts = studentName.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        const moduleCode = courseMapping[course as keyof typeof courseMapping];
        if (moduleCode) {
          studentsData.push({
            studentId: studentNumber,
            firstName,
            lastName,
            fullName: studentName,
            email: `${studentNumber.toLowerCase()}@hct.ac.ae`,
            course,
            moduleCode
          });
        }
      }
    }

    console.log(`Parsed ${studentsData.length} students from CSV`);

    // Get module IDs
    const modules = await prisma.module.findMany();
    const moduleMap = new Map(modules.map(m => [m.code, m.id]));

    // Clear all existing students first
    console.log('\nClearing existing students...');
    await prisma.student.deleteMany({});
    console.log('✅ Cleared all existing students');

    // Add students according to CSV data
    console.log('\nAdding students according to CSV specifications...\n');

    const moduleStats = new Map();
    let totalAdded = 0;

    for (const student of studentsData) {
      const moduleId = moduleMap.get(student.moduleCode);
      if (!moduleId) {
        console.log(`⚠️  Module ${student.moduleCode} not found for ${student.studentId}`);
        continue;
      }

      try {
        await prisma.student.create({
          data: {
            studentId: student.studentId,
            firstName: student.firstName,
            lastName: student.lastName,
            fullName: student.fullName,
            email: student.email,
            moduleId: moduleId,
            currentGPA: Math.random() * 1.5 + 2.5, // Random GPA 2.5-4.0
            creditHours: Math.floor(Math.random() * 10) + 15, // Random 15-25
            phone: `04${Math.floor(Math.random() * 90000000) + 10000000}` // Random mobile
          }
        });

        const count = moduleStats.get(student.moduleCode) || 0;
        moduleStats.set(student.moduleCode, count + 1);
        totalAdded++;

        console.log(`✅ Added ${student.firstName} ${student.lastName} (${student.studentId}) to ${student.moduleCode}`);
      } catch (error) {
        console.error(`❌ Error adding ${student.studentId}:`, error);
      }
    }

    console.log(`\n✅ Successfully added ${totalAdded} students`);

    // Display final allocation
    console.log('\n=== FINAL STUDENT ALLOCATION (AS PER CSV) ===');

    const finalModules = await prisma.module.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      },
      orderBy: { code: 'asc' }
    });

    finalModules.forEach(module => {
      console.log(`${module.code}: ${module._count.students} students`);
    });

    console.log('\n=== ALLOCATION BY COURSE TYPE ===');
    for (const [moduleCode, count] of moduleStats) {
      const courseName = Object.keys(courseMapping).find(
        key => courseMapping[key as keyof typeof courseMapping] === moduleCode
      );
      console.log(`${courseName} (${moduleCode}): ${count} students`);
    }

    console.log('\n✅ Student allocation restored according to your specifications!');

  } catch (error) {
    console.error('Error restoring student allocation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreCorrectStudentAllocation();