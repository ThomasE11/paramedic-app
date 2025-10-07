// Check student distribution across modules
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStudentDistribution() {
  console.log('📊 Checking Student Distribution Across Modules\n');

  try {
    // Get all modules
    const modules = await prisma.module.findMany({
      orderBy: { code: 'asc' }
    });

    console.log('📋 Available Modules:');
    modules.forEach(module => {
      console.log(`   ${module.code}: ${module.name}`);
    });
    console.log();

    // Get all students with their module relationships
    const students = await prisma.student.findMany({
      include: {
        module: true
      },
      orderBy: [
        { module: { code: 'asc' } },
        { studentId: 'asc' }
      ]
    });

    console.log(`👥 Total Students Found: ${students.length}\n`);

    // Group by module
    const moduleGroups = {};
    students.forEach(student => {
      const moduleCode = student.module?.code || 'NO_MODULE';
      if (!moduleGroups[moduleCode]) {
        moduleGroups[moduleCode] = [];
      }
      moduleGroups[moduleCode].push(student);
    });

    // Display distribution
    console.log('📊 Student Distribution by Module:');
    Object.keys(moduleGroups).sort().forEach(moduleCode => {
      const moduleStudents = moduleGroups[moduleCode];
      console.log(`\n   ${moduleCode}: ${moduleStudents.length} students`);
      moduleStudents.forEach(student => {
        console.log(`      - ${student.studentId}: ${student.fullName} (${student.email || 'No email'})`);
      });
    });

    // Check for students without modules
    const studentsWithoutModule = students.filter(s => !s.module);
    if (studentsWithoutModule.length > 0) {
      console.log(`\n⚠️  Students without module assignment: ${studentsWithoutModule.length}`);
      studentsWithoutModule.forEach(student => {
        console.log(`      - ${student.studentId}: ${student.fullName}`);
      });
    }

    // Summary
    console.log('\n📈 Summary:');
    Object.keys(moduleGroups).sort().forEach(moduleCode => {
      if (moduleCode !== 'NO_MODULE') {
        console.log(`   ${moduleCode}: ${moduleGroups[moduleCode].length} students`);
      }
    });

    if (moduleGroups['NO_MODULE']) {
      console.log(`   ⚠️  Unassigned: ${moduleGroups['NO_MODULE'].length} students`);
    }

  } catch (error) {
    console.error('❌ Error checking student distribution:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudentDistribution().catch(console.error);