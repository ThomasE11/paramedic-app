import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSystemFunctionality() {
  console.log('🧪 Running comprehensive system tests...');

  try {
    // Test 1: Database connectivity
    console.log('\n🔌 Testing database connectivity...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');

    // Test 2: Student data integrity
    console.log('\n👥 Testing student data integrity...');
    const totalStudents = await prisma.student.count();
    const studentsWithModules = await prisma.student.count({
      where: { moduleId: { not: null } }
    });

    console.log(`📊 Total students: ${totalStudents}`);
    console.log(`📚 Students with modules: ${studentsWithModules}`);

    if (totalStudents !== studentsWithModules) {
      console.log('❌ Some students are not assigned to modules');
    } else {
      console.log('✅ All students are properly assigned to modules');
    }

    // Test 3: Module integrity
    console.log('\n📚 Testing module integrity...');
    const modules = await prisma.module.findMany({
      include: {
        _count: { select: { students: true } }
      }
    });

    console.log('Module breakdown:');
    modules.forEach(module => {
      console.log(`   ${module.code}: ${module._count.students} students`);
    });

    // Test 4: Student-Module relationships
    console.log('\n🔗 Testing student-module relationships...');
    const studentsWithInvalidModules = await prisma.student.findMany({
      where: {
        moduleId: { not: null },
        module: null
      }
    });

    if (studentsWithInvalidModules.length > 0) {
      console.log(`❌ Found ${studentsWithInvalidModules.length} students with invalid module references`);
    } else {
      console.log('✅ All student-module relationships are valid');
    }

    // Test 5: Email uniqueness
    console.log('\n📧 Testing email uniqueness...');
    const emailCounts = await prisma.student.groupBy({
      by: ['email'],
      _count: { email: true },
      having: {
        email: {
          _count: {
            gt: 1
          }
        }
      }
    });

    if (emailCounts.length > 0) {
      console.log(`❌ Found ${emailCounts.length} duplicate email addresses`);
    } else {
      console.log('✅ All student emails are unique');
    }

    // Test 6: Student ID uniqueness
    console.log('\n🆔 Testing student ID uniqueness...');
    const studentIdCounts = await prisma.student.groupBy({
      by: ['studentId'],
      _count: { studentId: true },
      having: {
        studentId: {
          _count: {
            gt: 1
          }
        }
      }
    });

    if (studentIdCounts.length > 0) {
      console.log(`❌ Found ${studentIdCounts.length} duplicate student IDs`);
    } else {
      console.log('✅ All student IDs are unique');
    }

    // Test 7: Data consistency with CSV
    console.log('\n📋 Testing data consistency with CSV...');

    // Expected counts based on final 4-module structure
    const expectedCounts = {
      'HEM2903': 15,  // Ambulance 1 Practical Group (previously EMS2947)
      'HEM3903': 9,   // Ambulance Practicum III
      'AEM230': 30,   // Apply Clinical Practicum 1 Ambulance (previously ACP1AMB)
      'HEM3923': 6    // Responder Practicum I
    };

    let consistencyIssues = 0;
    for (const [moduleCode, expectedCount] of Object.entries(expectedCounts)) {
      const module = modules.find(m => m.code === moduleCode);
      if (module) {
        if (module._count.students === expectedCount) {
          console.log(`✅ ${moduleCode}: ${module._count.students} students (matches expected)`);
        } else {
          console.log(`❌ ${moduleCode}: ${module._count.students} students (expected ${expectedCount})`);
          consistencyIssues++;
        }
      } else {
        console.log(`❌ Module ${moduleCode} not found`);
        consistencyIssues++;
      }
    }

    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`   Total students: ${totalStudents}`);
    console.log(`   Total modules: ${modules.length}`);
    console.log(`   Consistency issues: ${consistencyIssues}`);
    console.log(`   Invalid module relationships: ${studentsWithInvalidModules.length}`);
    console.log(`   Duplicate emails: ${emailCounts.length}`);
    console.log(`   Duplicate student IDs: ${studentIdCounts.length}`);

    const hasIssues = consistencyIssues > 0 ||
                     studentsWithInvalidModules.length > 0 ||
                     emailCounts.length > 0 ||
                     studentIdCounts.length > 0 ||
                     totalStudents !== studentsWithModules;

    if (hasIssues) {
      console.log('\n❌ System tests completed with issues');
      process.exit(1);
    } else {
      console.log('\n✅ All system tests passed successfully');
    }

  } catch (error) {
    console.error('\n❌ System test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  testSystemFunctionality();
}

export { testSystemFunctionality };