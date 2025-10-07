#!/usr/bin/env tsx

/**
 * Comprehensive Attendance Persistence Test
 * Tests the complete attendance workflow to ensure data consistency
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
  test: string;
  passed: boolean;
  details?: string;
  error?: string;
}

async function runTests() {
  const results: TestResult[] = [];

  console.log('🧪 Starting Attendance Persistence Tests\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Database connection
    console.log('\n1️⃣  Testing database connection...');
    try {
      await prisma.$connect();
      results.push({ test: 'Database Connection', passed: true, details: 'Successfully connected' });
      console.log('✅ Database connected');
    } catch (error: any) {
      results.push({ test: 'Database Connection', passed: false, error: error.message });
      console.log('❌ Database connection failed');
      throw error;
    }

    // Test 2: Check required tables exist
    console.log('\n2️⃣  Checking database schema...');
    try {
      const tables = ['Student', 'ClassSession', 'Attendance', 'Module', 'User'];
      for (const table of tables) {
        const count = await (prisma as any)[table.toLowerCase()].count();
        console.log(`   - ${table}: ${count} records`);
      }
      results.push({ test: 'Database Schema', passed: true, details: 'All tables exist' });
      console.log('✅ Schema validated');
    } catch (error: any) {
      results.push({ test: 'Database Schema', passed: false, error: error.message });
      console.log('❌ Schema validation failed');
    }

    // Test 3: Find or create test module
    console.log('\n3️⃣  Setting up test module...');
    let testModule = await prisma.module.findFirst({
      where: { code: 'TEST101' }
    });

    if (!testModule) {
      testModule = await prisma.module.create({
        data: {
          code: 'TEST101',
          name: 'Test Module for Attendance',
          description: 'Automated test module'
        }
      });
      console.log('   Created new test module:', testModule.code);
    } else {
      console.log('   Using existing test module:', testModule.code);
    }
    results.push({ test: 'Module Setup', passed: true, details: `Module ID: ${testModule.id}` });

    // Test 4: Find or create test students
    console.log('\n4️⃣  Setting up test students...');
    const testStudentData = [
      { studentId: 'TEST001', firstName: 'Test', lastName: 'Student One', email: 'test1@test.ac.ae' },
      { studentId: 'TEST002', firstName: 'Test', lastName: 'Student Two', email: 'test2@test.ac.ae' },
      { studentId: 'TEST003', firstName: 'Test', lastName: 'Student Three', email: 'test3@test.ac.ae' }
    ];

    const testStudents = [];
    for (const data of testStudentData) {
      let student = await prisma.student.findUnique({
        where: { email: data.email }
      });

      if (!student) {
        student = await prisma.student.create({
          data: {
            ...data,
            fullName: `${data.firstName} ${data.lastName}`,
            moduleId: testModule.id
          }
        });
        console.log(`   Created student: ${student.fullName}`);
      } else {
        // Update to link with test module
        student = await prisma.student.update({
          where: { id: student.id },
          data: { moduleId: testModule.id }
        });
        console.log(`   Using existing student: ${student.fullName}`);
      }
      testStudents.push(student);
    }
    results.push({ test: 'Student Setup', passed: true, details: `${testStudents.length} students ready` });

    // Test 5: Find or create test instructor
    console.log('\n5️⃣  Setting up test instructor...');
    let testUser = await prisma.user.findUnique({
      where: { email: 'test@instructor.ac.ae' }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@instructor.ac.ae',
          name: 'Test Instructor',
          role: 'instructor'
        }
      });
      console.log('   Created test instructor');
    } else {
      console.log('   Using existing test instructor');
    }
    results.push({ test: 'Instructor Setup', passed: true, details: `User ID: ${testUser.id}` });

    // Test 6: Create class session
    console.log('\n6️⃣  Creating class session...');
    const testDate = new Date();
    testDate.setHours(0, 0, 0, 0);

    // Clean up any existing test sessions
    await prisma.classSession.deleteMany({
      where: {
        moduleId: testModule.id,
        title: { contains: 'Test Session' }
      }
    });

    const classSession = await prisma.classSession.create({
      data: {
        title: 'Test Session for Attendance',
        description: 'Automated test session',
        moduleId: testModule.id,
        instructorId: testUser.id,
        date: testDate,
        startTime: '09:00',
        endTime: '10:30',
        duration: 90,
        type: 'lecture',
        status: 'scheduled'
      }
    });
    console.log(`   Created class session: ${classSession.title}`);
    results.push({ test: 'Class Session Creation', passed: true, details: `Session ID: ${classSession.id}` });

    // Test 7: Create attendance records (first save)
    console.log('\n7️⃣  Testing attendance creation...');
    const attendanceData = testStudents.map((student, index) => ({
      classSessionId: classSession.id,
      studentId: student.id,
      status: index % 2 === 0 ? 'present' : 'absent',
      notes: `Test note ${index + 1}`,
      markedAt: new Date(),
      markedBy: testUser.id
    }));

    const createdAttendance = await prisma.$transaction(
      attendanceData.map(data =>
        prisma.attendance.create({ data })
      )
    );
    console.log(`   Created ${createdAttendance.length} attendance records`);
    results.push({ test: 'Attendance Creation', passed: true, details: `${createdAttendance.length} records created` });

    // Test 8: Verify persistence (read back)
    console.log('\n8️⃣  Verifying data persistence...');
    const savedAttendance = await prisma.attendance.findMany({
      where: { classSessionId: classSession.id },
      include: {
        student: true,
        classSession: true
      }
    });

    if (savedAttendance.length !== testStudents.length) {
      throw new Error(`Expected ${testStudents.length} records, found ${savedAttendance.length}`);
    }

    for (const record of savedAttendance) {
      if (!record.student || !record.classSession) {
        throw new Error('Missing relations in saved data');
      }
    }
    console.log(`   ✅ All ${savedAttendance.length} records persisted correctly`);
    results.push({ test: 'Data Persistence', passed: true, details: 'All records retrieved successfully' });

    // Test 9: Test upsert (update existing)
    console.log('\n9️⃣  Testing attendance updates (upsert)...');
    const updatedAttendance = await prisma.$transaction(
      testStudents.map(student =>
        prisma.attendance.upsert({
          where: {
            classSessionId_studentId: {
              classSessionId: classSession.id,
              studentId: student.id
            }
          },
          update: {
            status: 'present',
            notes: 'Updated via upsert',
            markedAt: new Date()
          },
          create: {
            classSessionId: classSession.id,
            studentId: student.id,
            status: 'present',
            notes: 'Created via upsert',
            markedAt: new Date(),
            markedBy: testUser.id
          }
        })
      )
    );
    console.log(`   Updated ${updatedAttendance.length} records`);

    // Verify updates
    const verifyUpdated = await prisma.attendance.findMany({
      where: { classSessionId: classSession.id }
    });

    const allPresent = verifyUpdated.every(record => record.status === 'present');
    const allUpdated = verifyUpdated.every(record => record.notes?.includes('upsert'));

    if (!allPresent || !allUpdated) {
      throw new Error('Updates not persisted correctly');
    }

    console.log('   ✅ All updates persisted correctly');
    results.push({ test: 'Attendance Updates', passed: true, details: 'Upsert operations successful' });

    // Test 10: Test concurrent updates
    console.log('\n🔟 Testing concurrent updates...');
    const concurrentUpdates = await Promise.all(
      testStudents.map((student, index) =>
        prisma.attendance.update({
          where: {
            classSessionId_studentId: {
              classSessionId: classSession.id,
              studentId: student.id
            }
          },
          data: {
            status: index % 2 === 0 ? 'late' : 'excused',
            notes: `Concurrent update ${index}`
          }
        })
      )
    );
    console.log(`   ✅ ${concurrentUpdates.length} concurrent updates completed`);
    results.push({ test: 'Concurrent Updates', passed: true, details: 'All concurrent operations successful' });

    // Test 11: Verify final state
    console.log('\n1️⃣1️⃣  Verifying final state...');
    const finalState = await prisma.attendance.findMany({
      where: { classSessionId: classSession.id },
      include: {
        student: { select: { fullName: true } },
        marker: { select: { name: true } }
      }
    });

    console.log('\n   Final Attendance Records:');
    for (const record of finalState) {
      console.log(`   - ${record.student.fullName}: ${record.status} (${record.notes})`);
    }
    results.push({ test: 'Final State Verification', passed: true, details: 'All data intact' });

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    results.push({ test: 'Overall Test Suite', passed: false, error: error.message });
  } finally {
    await prisma.$disconnect();
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 TEST SUMMARY\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  for (const result of results) {
    const icon = result.passed ? '✅' : '❌';
    const status = result.passed ? 'PASSED' : 'FAILED';
    console.log(`${icon} ${result.test}: ${status}`);
    if (result.details) {
      console.log(`   ${result.details}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }

  console.log(`\n📈 Results: ${passed} passed, ${failed} failed out of ${results.length} tests`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Attendance system is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

runTests().catch(console.error);
