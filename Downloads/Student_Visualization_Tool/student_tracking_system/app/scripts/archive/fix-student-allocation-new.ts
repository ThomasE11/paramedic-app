import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Healthcare module data based on typical Australian healthcare programs
const healthcareStudentData = [
  // Additional HEM2903 students
  { studentId: 'HEM290301', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@student.edu.au', module: 'HEM2903' },
  { studentId: 'HEM290302', firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@student.edu.au', module: 'HEM2903' },
  { studentId: 'HEM290303', firstName: 'Emma', lastName: 'Williams', email: 'emma.williams@student.edu.au', module: 'HEM2903' },
  { studentId: 'HEM290304', firstName: 'James', lastName: 'Brown', email: 'james.brown@student.edu.au', module: 'HEM2903' },
  { studentId: 'HEM290305', firstName: 'Sophie', lastName: 'Miller', email: 'sophie.miller@student.edu.au', module: 'HEM2903' },
  { studentId: 'HEM290306', firstName: 'Daniel', lastName: 'Davis', email: 'daniel.davis@student.edu.au', module: 'HEM2903' },
  { studentId: 'HEM290307', firstName: 'Olivia', lastName: 'Wilson', email: 'olivia.wilson@student.edu.au', module: 'HEM2903' },
  { studentId: 'HEM290308', firstName: 'Thomas', lastName: 'Moore', email: 'thomas.moore@student.edu.au', module: 'HEM2903' },
  { studentId: 'HEM290309', firstName: 'Grace', lastName: 'Taylor', email: 'grace.taylor@student.edu.au', module: 'HEM2903' },
  { studentId: 'HEM290310', firstName: 'Ryan', lastName: 'Anderson', email: 'ryan.anderson@student.edu.au', module: 'HEM2903' },
  { studentId: 'HEM290311', firstName: 'Isabella', lastName: 'Thomas', email: 'isabella.thomas@student.edu.au', module: 'HEM2903' },
  { studentId: 'HEM290312', firstName: 'Luke', lastName: 'Jackson', email: 'luke.jackson@student.edu.au', module: 'HEM2903' },
  { studentId: 'HEM290313', firstName: 'Chloe', lastName: 'White', email: 'chloe.white@student.edu.au', module: 'HEM2903' },
  { studentId: 'HEM290314', firstName: 'Joshua', lastName: 'Harris', email: 'joshua.harris@student.edu.au', module: 'HEM2903' },
  { studentId: 'HEM290315', firstName: 'Zoe', lastName: 'Martin', email: 'zoe.martin@student.edu.au', module: 'HEM2903' },
  { studentId: 'HEM290316', firstName: 'Ethan', lastName: 'Thompson', email: 'ethan.thompson@student.edu.au', module: 'HEM2903' },

  // Additional HEM3903 students
  { studentId: 'HEM390301', firstName: 'Alexandra', lastName: 'Garcia', email: 'alexandra.garcia@student.edu.au', module: 'HEM3903' },
  { studentId: 'HEM390302', firstName: 'Nathan', lastName: 'Martinez', email: 'nathan.martinez@student.edu.au', module: 'HEM3903' },
  { studentId: 'HEM390303', firstName: 'Mia', lastName: 'Robinson', email: 'mia.robinson@student.edu.au', module: 'HEM3903' },
  { studentId: 'HEM390304', firstName: 'Connor', lastName: 'Clark', email: 'connor.clark@student.edu.au', module: 'HEM3903' },
  { studentId: 'HEM390305', firstName: 'Lily', lastName: 'Rodriguez', email: 'lily.rodriguez@student.edu.au', module: 'HEM3903' },
  { studentId: 'HEM390306', firstName: 'Jacob', lastName: 'Lewis', email: 'jacob.lewis@student.edu.au', module: 'HEM3903' },
  { studentId: 'HEM390307', firstName: 'Ava', lastName: 'Lee', email: 'ava.lee@student.edu.au', module: 'HEM3903' }
];

async function fixStudentAllocation() {
  try {
    console.log('=== FIXING STUDENT MODULE ALLOCATION ===\n');

    // Get module IDs
    const modules = await prisma.module.findMany({
      where: {
        code: {
          in: ['HEM2903', 'HEM3903']
        }
      }
    });

    const moduleMap = new Map(modules.map(m => [m.code, m.id]));

    console.log('Adding missing students to modules...\n');

    // Add missing students
    for (const studentData of healthcareStudentData) {
      const moduleId = moduleMap.get(studentData.module);

      if (!moduleId) {
        console.log(`⚠️  Module ${studentData.module} not found, skipping ${studentData.studentId}`);
        continue;
      }

      // Check if student already exists
      const existingStudent = await prisma.student.findUnique({
        where: { studentId: studentData.studentId }
      });

      if (existingStudent) {
        console.log(`⏭️  Student ${studentData.studentId} already exists, skipping`);
        continue;
      }

      // Check if email is already taken
      const existingEmail = await prisma.student.findUnique({
        where: { email: studentData.email }
      });

      if (existingEmail) {
        console.log(`⚠️  Email ${studentData.email} already exists, skipping ${studentData.studentId}`);
        continue;
      }

      try {
        await prisma.student.create({
          data: {
            studentId: studentData.studentId,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            fullName: `${studentData.firstName} ${studentData.lastName}`,
            email: studentData.email,
            moduleId: moduleId,
            currentGPA: Math.random() * 1.5 + 2.5, // Random GPA between 2.5-4.0
            creditHours: Math.floor(Math.random() * 10) + 15, // Random credit hours 15-25
            phone: `04${Math.floor(Math.random() * 90000000) + 10000000}` // Random Australian mobile
          }
        });

        console.log(`✅ Added ${studentData.firstName} ${studentData.lastName} (${studentData.studentId}) to ${studentData.module}`);
      } catch (error) {
        console.error(`❌ Error adding ${studentData.studentId}:`, error);
      }
    }

    console.log('\n=== REBALANCING EXISTING STUDENTS ===\n');

    // Get current student counts
    const currentCounts = await prisma.module.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      }
    });

    currentCounts.forEach(module => {
      console.log(`${module.code}: ${module._count.students} students`);
    });

    // Move some students from AEM230 to HEM2903 if needed
    const aem230 = await prisma.module.findUnique({
      where: { code: 'AEM230' },
      include: {
        students: {
          take: 6, // Move 6 students
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    const hem2903Module = await prisma.module.findUnique({
      where: { code: 'HEM2903' }
    });

    if (aem230 && hem2903Module && aem230.students.length > 0) {
      console.log(`\nMoving ${aem230.students.length} students from AEM230 to HEM2903...`);

      for (const student of aem230.students) {
        await prisma.student.update({
          where: { id: student.id },
          data: { moduleId: hem2903Module.id }
        });

        console.log(`✅ Moved ${student.firstName} ${student.lastName} from AEM230 to HEM2903`);
      }
    }

    console.log('\n=== FINAL MODULE ALLOCATION ===\n');

    // Get final counts
    const finalCounts = await prisma.module.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      },
      orderBy: { code: 'asc' }
    });

    finalCounts.forEach(module => {
      console.log(`${module.code}: ${module._count.students} students`);
    });

    console.log('\n✅ Student allocation fixed successfully!');

  } catch (error) {
    console.error('Error fixing student allocation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixStudentAllocation();