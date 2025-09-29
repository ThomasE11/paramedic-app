import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface StudentData {
  studentName: string;
  studentNumber: string;
  emiratesId: string;
  program: string;
  course: string;
}

async function parseCSV(): Promise<StudentData[]> {
  const csvPath = path.join(process.cwd(), 'data', 'students.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  const students: StudentData[] = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const columns = line.split(',');
    if (columns.length >= 6) {
      students.push({
        studentName: columns[2].trim(),
        studentNumber: columns[3].trim(),
        emiratesId: columns[4].trim(),
        program: columns[5].trim(),
        course: columns[6].trim()
      });
    }
  }

  return students;
}

function parseStudentName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
}

function generateEmail(fullName: string, studentNumber: string): string {
  const { firstName, lastName } = parseStudentName(fullName);
  const cleanName = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/[^a-z.]/g, '');
  return `${cleanName}@hct.ac.ae`;
}

async function syncStudentData() {
  try {
    console.log('🔄 Starting student data sync...');

    const students = await parseCSV();
    console.log(`📊 Found ${students.length} students in CSV`);

    // Create or update modules based on courses
    const moduleMap = new Map<string, string>();

    const courses = [...new Set(students.map(s => s.course))];
    for (const course of courses) {
      let moduleCode = '';
      let moduleName = '';

      if (course.includes('Ambulance Practicum III')) {
        moduleCode = 'HEM3903';
        moduleName = 'Ambulance Practicum III';
      } else if (course.includes('Responder Practicum I')) {
        moduleCode = 'HEM3923';
        moduleName = 'Responder Practicum I';
      } else if (course.includes('Ambulance Practicum I')) {
        moduleCode = 'EMS2947';
        moduleName = 'Ambulance Practicum I';
      } else {
        moduleCode = course.replace(/[^A-Z0-9]/g, '');
        moduleName = course;
      }

      const module = await prisma.module.upsert({
        where: { code: moduleCode },
        update: { name: moduleName },
        create: {
          code: moduleCode,
          name: moduleName,
          description: `${moduleName} module for Emergency Medical Services program`
        }
      });

      moduleMap.set(course, module.id);
      console.log(`📚 Module ${moduleCode} created/updated`);
    }

    // Sync students
    let createdCount = 0;
    let updatedCount = 0;

    for (const studentData of students) {
      const { firstName, lastName } = parseStudentName(studentData.studentName);
      const email = generateEmail(studentData.studentName, studentData.studentNumber);
      const moduleId = moduleMap.get(studentData.course);

      const existingStudent = await prisma.student.findUnique({
        where: { studentId: studentData.studentNumber }
      });

      if (existingStudent) {
        await prisma.student.update({
          where: { studentId: studentData.studentNumber },
          data: {
            firstName,
            lastName,
            fullName: studentData.studentName,
            email,
            moduleId
          }
        });
        updatedCount++;
      } else {
        await prisma.student.create({
          data: {
            studentId: studentData.studentNumber,
            firstName,
            lastName,
            fullName: studentData.studentName,
            email,
            moduleId
          }
        });
        createdCount++;
      }
    }

    console.log(`✅ Sync completed: ${createdCount} created, ${updatedCount} updated`);

    // Get final counts
    const totalStudents = await prisma.student.count();
    const moduleStats = await prisma.module.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      }
    });

    console.log(`📈 Total students in database: ${totalStudents}`);
    console.log('📊 Students per module:');
    for (const module of moduleStats) {
      console.log(`   ${module.code}: ${module._count.students} students`);
    }

  } catch (error) {
    console.error('❌ Error syncing student data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  syncStudentData();
}

export { syncStudentData };