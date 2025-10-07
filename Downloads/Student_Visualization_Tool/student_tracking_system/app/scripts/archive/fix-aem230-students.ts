import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 Fixing AEM230 student assignments...');
    
    // Get the AEM230 module
    const aem230Module = await prisma.module.findUnique({
      where: { code: 'AEM230' }
    });
    
    if (!aem230Module) {
      console.error('❌ AEM230 module not found!');
      return;
    }
    
    console.log(`✅ Found AEM230 module: ${aem230Module.name}`);
    
    // 1. Remove the incorrect student: Rouda Ali Khamis Ali Alkaabi (H00594034)
    console.log('\n🗑️  Removing incorrect student from AEM230...');
    const incorrectStudent = await prisma.student.findFirst({
      where: { studentId: 'H00594034' }
    });
    
    if (incorrectStudent) {
      await prisma.student.update({
        where: { id: incorrectStudent.id },
        data: { moduleId: null }
      });
      console.log(`✅ Removed: ${incorrectStudent.fullName} (H00594034)`);
    }
    
    // 2. Add missing students to AEM230
    console.log('\n➕ Adding missing students to AEM230...');
    
    // Find missing students by their student IDs
    const missingStudentIds = ['H00541639', 'H00524101'];
    
    for (const studentId of missingStudentIds) {
      const student = await prisma.student.findFirst({
        where: { studentId: studentId }
      });
      
      if (student) {
        await prisma.student.update({
          where: { id: student.id },
          data: { moduleId: aem230Module.id }
        });
        console.log(`✅ Added: ${student.fullName} (${studentId})`);
      } else {
        console.log(`❌ Student not found: ${studentId}`);
      }
    }
    
    // 3. Verify the fix
    console.log('\n🔍 Verifying the fix...');
    const updatedStudents = await prisma.student.findMany({
      where: { moduleId: aem230Module.id },
      select: { fullName: true, studentId: true },
      orderBy: { fullName: 'asc' }
    });
    
    console.log(`✅ AEM230 now has ${updatedStudents.length} students:`);
    updatedStudents.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.fullName} (${student.studentId})`);
    });
    
    // Expected count should be 31 (30 + 2 added - 1 removed)
    if (updatedStudents.length === 31) {
      console.log('\n🎉 ✅ AEM230 FIXED! Now has correct 31 students!');
    } else {
      console.log(`\n⚠️  Expected 31 students, but found ${updatedStudents.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing AEM230 students:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
