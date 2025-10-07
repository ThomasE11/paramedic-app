import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStudentModuleAllocation() {
  try {
    console.log('=== STUDENT-MODULE ALLOCATION ANALYSIS ===\n');

    // Get all modules
    const modules = await prisma.module.findMany({
      include: {
        students: true,
        _count: {
          select: {
            students: true
          }
        }
      },
      orderBy: {
        code: 'asc'
      }
    });

    console.log('Module Summary:');
    console.log('===============');
    modules.forEach(module => {
      console.log(`${module.code}: ${module.name} - ${module._count.students} students`);
    });
    console.log('');

    // Get total students
    const totalStudents = await prisma.student.count();
    const allocatedStudents = await prisma.student.count({
      where: {
        moduleId: {
          not: null
        }
      }
    });
    const unallocatedStudents = await prisma.student.count({
      where: {
        moduleId: null
      }
    });

    console.log('Student Allocation Summary:');
    console.log('==========================');
    console.log(`Total Students: ${totalStudents}`);
    console.log(`Allocated Students: ${allocatedStudents}`);
    console.log(`Unallocated Students: ${unallocatedStudents}`);
    console.log('');

    // Get unallocated students
    if (unallocatedStudents > 0) {
      console.log('Unallocated Students:');
      console.log('====================');
      const unallocated = await prisma.student.findMany({
        where: {
          moduleId: null
        },
        select: {
          studentId: true,
          firstName: true,
          lastName: true,
          email: true
        }
      });

      unallocated.forEach(student => {
        console.log(`${student.studentId}: ${student.firstName} ${student.lastName} (${student.email})`);
      });
      console.log('');
    }

    // Expected module enrollments (based on typical healthcare programs)
    const expectedEnrollments = {
      'AEM230': 25, // Advanced Emergency Medicine
      'HEM2903': 30, // Healthcare Emergency Management
      'HEM3903': 20, // Advanced Healthcare Emergency Management
    };

    console.log('Expected vs Actual Enrollments:');
    console.log('===============================');

    for (const module of modules) {
      const expected = expectedEnrollments[module.code as keyof typeof expectedEnrollments] || 'Unknown';
      const actual = module._count.students;
      const difference = typeof expected === 'number' ? actual - expected : 'N/A';

      console.log(`${module.code}:`);
      console.log(`  Expected: ${expected}`);
      console.log(`  Actual: ${actual}`);
      console.log(`  Difference: ${difference}`);
      console.log('');
    }

    // Check for duplicate students
    const duplicateEmails = await prisma.student.groupBy({
      by: ['email'],
      having: {
        email: {
          _count: {
            gt: 1
          }
        }
      },
      _count: {
        email: true
      }
    });

    if (duplicateEmails.length > 0) {
      console.log('Duplicate Student Emails Found:');
      console.log('===============================');
      for (const duplicate of duplicateEmails) {
        console.log(`Email: ${duplicate.email} (${duplicate._count.email} occurrences)`);

        const students = await prisma.student.findMany({
          where: { email: duplicate.email },
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
            moduleId: true,
            module: {
              select: {
                code: true,
                name: true
              }
            }
          }
        });

        students.forEach(student => {
          console.log(`  - ${student.studentId}: ${student.firstName} ${student.lastName} (Module: ${student.module?.code || 'None'})`);
        });
        console.log('');
      }
    }

    // Check for students with missing basic info
    const studentsWithMissingInfo = await prisma.student.findMany({
      where: {
        OR: [
          { firstName: { equals: '' } },
          { lastName: { equals: '' } },
          { email: { equals: '' } },
          { studentId: { equals: '' } }
        ]
      }
    });

    if (studentsWithMissingInfo.length > 0) {
      console.log('Students with Missing Information:');
      console.log('=================================');
      studentsWithMissingInfo.forEach(student => {
        console.log(`${student.studentId || 'NO_ID'}: ${student.firstName || 'NO_FIRST'} ${student.lastName || 'NO_LAST'} (${student.email || 'NO_EMAIL'})`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('Error checking student allocation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudentModuleAllocation();