import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const prisma = new PrismaClient();

// Function to parse CSV properly
function parseCSV(csvContent: string) {
  const lines = csvContent.trim().split('\n');
  const students = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(',');
    
    // Expected format: Sheet,Table,Student Name,Student Number,Emirates ID,Program,Course
    const student = {
      'Student Name': parts[2]?.trim() || '',
      'Student Number': parts[3]?.trim() || '',
      'Course': parts[6]?.trim() || ''
    };
    
    students.push(student);
  }
  
  return students;
}

// Function to generate email from student number
function generateEmail(studentNumber: string) {
  return `${studentNumber.toLowerCase()}@hct.ac.ae`;
}

// Function to parse name into first and last name
function parseName(fullName: string) {
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  return { firstName, lastName };
}

// Generate phone number (placeholder)
function generatePhone(index: number) {
  return `+97150123${String(4500 + index).padStart(4, '0')}`;
}

async function main() {
  try {
    console.log('🔄 Clearing existing students...');
    await prisma.student.deleteMany();
    
    console.log('📂 Reading student data from CSV...');
    const csvPath = path.join(__dirname, '../data/students.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const studentsData = parseCSV(csvContent);
    
    console.log(`📊 Found ${studentsData.length} students in CSV`);
    
    // Get modules
    const modules = await prisma.module.findMany();
    const moduleMap = {
      'HEM3923': modules.find(m => m.code === 'HEM3923')?.id,
      'HEM3903': modules.find(m => m.code === 'HEM3903')?.id, 
      'HEM2903': modules.find(m => m.code === 'HEM2903')?.id,
      'AEM230': modules.find(m => m.code === 'AEM230')?.id
    };
    
    console.log('🏫 Module mapping:', moduleMap);
    
    // Process each student
    const processedStudents = [];
    const courseCounts: { [key: string]: number } = {};
    
    for (let i = 0; i < studentsData.length; i++) {
      const student = studentsData[i];
      const { firstName, lastName } = parseName(student['Student Name']);
      
      // Count courses for debugging
      courseCounts[student.Course] = (courseCounts[student.Course] || 0) + 1;
      
      // Determine module based on course
      let moduleId = moduleMap['AEM230']; // Default to AEM230
      
      if (student.Course === 'Responder Practicum I') {
        moduleId = moduleMap['HEM3923'];
      } else if (student.Course === 'Ambulance Practicum III') {
        moduleId = moduleMap['HEM3903'];
      } else if (student.Course === 'Ambulance Practicum I') {
        moduleId = moduleMap['HEM2903'];
      }
      
      const studentData = {
        studentId: student['Student Number'],
        firstName,
        lastName,
        fullName: student['Student Name'],
        email: generateEmail(student['Student Number']),
        phone: generatePhone(i),
        moduleId
      };
      
      processedStudents.push(studentData);
    }
    
    console.log('📚 Course distribution:', courseCounts);
    console.log('💾 Creating students in database...');
    
    // Create students
    for (const studentData of processedStudents) {
      await prisma.student.create({
        data: studentData
      });
    }
    
    // Get final counts by module
    const finalCounts = await prisma.student.groupBy({
      by: ['moduleId'],
      _count: {
        id: true
      }
    });
    
    console.log('✅ Database updated successfully!');
    console.log('📈 Final student counts by module:');
    
    for (const count of finalCounts) {
      const module = modules.find(m => m.id === count.moduleId);
      console.log(`   ${module?.code}: ${count._count.id} students`);
    }
    
    const total = await prisma.student.count();
    console.log(`📊 Total students: ${total}`);
    
  } catch (error) {
    console.error('❌ Error updating students:', error);
  }
}

main()
  .catch((e) => {
    console.error('❌ Script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
