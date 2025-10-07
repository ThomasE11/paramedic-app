#!/usr/bin/env tsx

/**
 * Remove Test Students
 * Removes all test students and their related data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeTestStudents() {
  console.log('🗑️  Removing Test Students\n');
  console.log('=' .repeat(60));

  try {
    // Find all test students
    const testStudents = await prisma.student.findMany({
      where: {
        OR: [
          { studentId: { startsWith: 'TEST' } },
          { email: { contains: 'test@test.ac.ae' } },
          { email: { startsWith: 'testapi' } }
        ]
      },
      include: {
        activities: true,
        attendance: true,
        notes: true,
        submissions: true
      }
    });

    console.log(`\n📊 Found ${testStudents.length} test students:\n`);

    for (const student of testStudents) {
      console.log(`\n🔍 ${student.fullName} (${student.studentId})`);
      console.log(`   Email: ${student.email}`);
      console.log(`   Activities: ${student.activities.length}`);
      console.log(`   Attendance: ${student.attendance.length}`);
      console.log(`   Notes: ${student.notes.length}`);
      console.log(`   Submissions: ${student.submissions.length}`);
    }

    if (testStudents.length === 0) {
      console.log('\n✅ No test students found to remove.\n');
      return;
    }

    console.log('\n⚠️  This will delete all test students and their related data.');
    console.log('   Proceeding with deletion...\n');

    // Delete test students (cascade will handle related records)
    for (const student of testStudents) {
      try {
        await prisma.student.delete({
          where: { id: student.id }
        });

        console.log(`✅ Deleted: ${student.fullName}`);
      } catch (error: any) {
        console.log(`❌ Failed to delete ${student.fullName}: ${error.message}`);
      }
    }

    // Also clean up test modules
    const testModules = await prisma.module.findMany({
      where: {
        OR: [
          { code: { startsWith: 'TEST' } },
          { code: 'TEST_API' }
        ]
      }
    });

    for (const module of testModules) {
      try {
        await prisma.module.delete({
          where: { id: module.id }
        });
        console.log(`✅ Deleted test module: ${module.code}`);
      } catch (error: any) {
        console.log(`❌ Failed to delete module ${module.code}: ${error.message}`);
      }
    }

    // Clean up test class sessions
    const testSessions = await prisma.classSession.findMany({
      where: {
        OR: [
          { title: { contains: 'Test' } },
          { title: { contains: 'API Test' } }
        ]
      }
    });

    for (const session of testSessions) {
      try {
        await prisma.classSession.delete({
          where: { id: session.id }
        });
        console.log(`✅ Deleted test session: ${session.title}`);
      } catch (error: any) {
        console.log(`❌ Failed to delete session ${session.title}: ${error.message}`);
      }
    }

    // Clean up test user
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@instructor.ac.ae' }
    });

    if (testUser) {
      try {
        await prisma.user.delete({
          where: { id: testUser.id }
        });
        console.log(`✅ Deleted test user: test@instructor.ac.ae`);
      } catch (error: any) {
        console.log(`❌ Failed to delete test user: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Cleanup Complete!\n');

    // Show updated counts
    const remainingStudents = await prisma.student.count();
    const remainingActivities = await prisma.activity.count();

    console.log(`Students remaining: ${remainingStudents}`);
    console.log(`Activities remaining: ${remainingActivities}\n`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

removeTestStudents();
