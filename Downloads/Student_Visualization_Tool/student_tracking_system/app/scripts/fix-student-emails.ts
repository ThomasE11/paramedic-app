#!/usr/bin/env tsx

/**
 * Fix Student Email Addresses
 * Updates all student emails to use correct format: studentId@hct.ac.ae
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixStudentEmails() {
  console.log('🔧 Fixing Student Email Addresses\n');
  console.log('=' .repeat(60));

  try {
    // Get all students
    const students = await prisma.student.findMany({
      select: {
        id: true,
        studentId: true,
        email: true,
        fullName: true
      }
    });

    console.log(`\n📊 Found ${students.length} students in database\n`);

    const updates = [];
    const errors = [];

    for (const student of students) {
      const correctEmail = `${student.studentId}@hct.ac.ae`;

      if (student.email !== correctEmail) {
        try {
          await prisma.student.update({
            where: { id: student.id },
            data: { email: correctEmail }
          });

          updates.push({
            name: student.fullName,
            old: student.email,
            new: correctEmail
          });

          console.log(`✅ ${student.fullName}`);
          console.log(`   Old: ${student.email}`);
          console.log(`   New: ${correctEmail}\n`);
        } catch (error: any) {
          errors.push({
            name: student.fullName,
            studentId: student.studentId,
            error: error.message
          });

          console.log(`❌ ${student.fullName}: ${error.message}\n`);
        }
      } else {
        console.log(`✓ ${student.fullName} - Already correct (${student.email})`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📈 Update Summary:\n');
    console.log(`Total Students: ${students.length}`);
    console.log(`Updated: ${updates.length}`);
    console.log(`Errors: ${errors.length}`);
    console.log(`Already Correct: ${students.length - updates.length - errors.length}`);

    if (errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      for (const error of errors) {
        console.log(`   - ${error.name} (${error.studentId}): ${error.error}`);
      }
    }

    if (updates.length > 0) {
      console.log('\n✅ All email addresses have been updated to the correct format!');
      console.log('   Format: studentId@hct.ac.ae\n');
    } else {
      console.log('\n✅ All email addresses are already in the correct format!\n');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

fixStudentEmails();
