import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('➕ Creating missing AEM230 students...');
    
    // Get the AEM230 module
    const aem230Module = await prisma.module.findUnique({
      where: { code: 'AEM230' }
    });
    
    if (!aem230Module) {
      console.error('❌ AEM230 module not found!');
      return;
    }
    
    // Students to create based on your screenshots
    const studentsToCreate = [
      {
        studentId: 'H00541639',
        firstName: 'Shahad',
        lastName: 'Alshamsi',
        fullName: 'Shahad Mohammed Khamis Juma Alshamsi',
        email: 'H00541639@hct.ac.ae'
      },
      {
        studentId: 'H00524101',
        firstName: 'Mohammed',
        lastName: 'Alkhsousi',
        fullName: 'Mohammed Hamad Mohammed Alkhsousi',
        email: 'H00524101@hct.ac.ae'
      }
    ];
    
    console.log(`\n➕ Creating ${studentsToCreate.length} missing students...`);
    
    for (const studentData of studentsToCreate) {
      // Check if student already exists
      const existingStudent = await prisma.student.findFirst({
        where: { studentId: studentData.studentId }
      });
      
      if (existingStudent) {
        console.log(`⚠️  Student ${studentData.studentId} already exists: ${existingStudent.fullName}`);
        
        // Just assign to AEM230 if not already assigned
        if (!existingStudent.moduleId) {
          await prisma.student.update({
            where: { id: existingStudent.id },
            data: { moduleId: aem230Module.id }
          });
          console.log(`✅ Assigned existing student to AEM230: ${existingStudent.fullName}`);
        } else {
          console.log(`⚠️  Student already assigned to a module`);
        }
      } else {
        // Create new student
        const newStudent = await prisma.student.create({
          data: {
            studentId: studentData.studentId,
            firstName: studentData.firstName,
            lastName: studentData.lastName,
            fullName: studentData.fullName,
            email: studentData.email,
            moduleId: aem230Module.id
          }
        });
        console.log(`✅ Created and assigned: ${newStudent.fullName} (${newStudent.studentId})`);
      }
    }
    
    // Verify final count
    console.log('\n🔍 Verifying final AEM230 student count...');
    const finalStudents = await prisma.student.findMany({
      where: { moduleId: aem230Module.id },
      select: { fullName: true, studentId: true },
      orderBy: { fullName: 'asc' }
    });
    
    console.log(`✅ AEM230 now has ${finalStudents.length} students:`);
    finalStudents.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.fullName} (${student.studentId})`);
    });
    
    if (finalStudents.length === 31) {
      console.log('\n🎉 ✅ AEM230 PERFECT! Now has exactly 31 students as shown in screenshots!');
    } else {
      console.log(`\n⚠️  Expected 31 students, but found ${finalStudents.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error creating missing students:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
