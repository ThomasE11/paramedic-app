import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyStudentAccounts() {
  try {
    console.log('🔍 Verifying student account linkages...');

    // Check for students without modules
    const studentsWithoutModules = await prisma.student.findMany({
      where: { moduleId: null },
      select: { id: true, studentId: true, fullName: true }
    });

    if (studentsWithoutModules.length > 0) {
      console.log(`⚠️  Found ${studentsWithoutModules.length} students without modules:`);
      studentsWithoutModules.forEach(student => {
        console.log(`   - ${student.studentId}: ${student.fullName}`);
      });
    } else {
      console.log('✅ All students are linked to modules');
    }

    // Check for duplicate student IDs
    const studentIds = await prisma.student.findMany({
      select: { studentId: true }
    });

    const duplicateIds = studentIds.filter((item, index, array) =>
      array.findIndex(t => t.studentId === item.studentId) !== index
    );

    if (duplicateIds.length > 0) {
      console.log(`⚠️  Found duplicate student IDs: ${duplicateIds.map(d => d.studentId).join(', ')}`);
    } else {
      console.log('✅ No duplicate student IDs found');
    }

    // Check for students with invalid emails
    const studentsWithInvalidEmails = await prisma.student.findMany({
      where: {
        OR: [
          { email: null },
          { email: '' },
          { email: { not: { contains: '@' } } }
        ]
      },
      select: { id: true, studentId: true, fullName: true, email: true }
    });

    if (studentsWithInvalidEmails.length > 0) {
      console.log(`⚠️  Found ${studentsWithInvalidEmails.length} students with invalid emails:`);
      studentsWithInvalidEmails.forEach(student => {
        console.log(`   - ${student.studentId}: ${student.fullName} (${student.email})`);
      });
    } else {
      console.log('✅ All students have valid email addresses');
    }

    // Check module integrity
    const modules = await prisma.module.findMany({
      include: {
        _count: { select: { students: true } }
      }
    });

    console.log('\n📊 Module integrity check:');
    modules.forEach(module => {
      console.log(`   ${module.code}: ${module._count.students} students`);
    });

    // Check for orphaned records
    const studentsWithInvalidModules = await prisma.student.findMany({
      where: {
        moduleId: { not: null },
        module: null
      },
      select: { id: true, studentId: true, fullName: true, moduleId: true }
    });

    if (studentsWithInvalidModules.length > 0) {
      console.log(`⚠️  Found ${studentsWithInvalidModules.length} students linked to non-existent modules:`);
      studentsWithInvalidModules.forEach(student => {
        console.log(`   - ${student.studentId}: ${student.fullName} (moduleId: ${student.moduleId})`);
      });
    } else {
      console.log('✅ All student-module links are valid');
    }

    // Summary
    const totalStudents = await prisma.student.count();
    const totalModules = await prisma.module.count();

    console.log('\n📈 Summary:');
    console.log(`   Total students: ${totalStudents}`);
    console.log(`   Total modules: ${totalModules}`);
    console.log(`   Students without modules: ${studentsWithoutModules.length}`);
    console.log(`   Duplicate student IDs: ${duplicateIds.length}`);
    console.log(`   Students with invalid emails: ${studentsWithInvalidEmails.length}`);
    console.log(`   Students with invalid module links: ${studentsWithInvalidModules.length}`);

    const hasIssues = studentsWithoutModules.length > 0 ||
                     duplicateIds.length > 0 ||
                     studentsWithInvalidEmails.length > 0 ||
                     studentsWithInvalidModules.length > 0;

    if (hasIssues) {
      console.log('\n❌ Verification completed with issues found');
      process.exit(1);
    } else {
      console.log('\n✅ All student accounts are properly linked and verified');
    }

  } catch (error) {
    console.error('❌ Error verifying student accounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  verifyStudentAccounts();
}

export { verifyStudentAccounts };