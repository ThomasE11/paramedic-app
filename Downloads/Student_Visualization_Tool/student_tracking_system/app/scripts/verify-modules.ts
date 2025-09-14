import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Verifying all module assignments...\n');
    
    const modules = await prisma.module.findMany({
      include: {
        students: {
          select: {
            studentId: true,
            fullName: true,
            email: true
          },
          orderBy: { fullName: 'asc' }
        }
      },
      orderBy: { code: 'asc' }
    });
    
    modules.forEach(module => {
      console.log(`📚 ${module.code} - ${module.name}`);
      console.log(`   👥 Students: ${module.students.length}`);
      
      if (module.students.length > 0) {
        module.students.forEach((student, index) => {
          console.log(`   ${index + 1}. ${student.fullName} (${student.studentId})`);
        });
      } else {
        console.log('   (No students assigned)');
      }
      console.log('');
    });
    
    const totalStudents = modules.reduce((sum, module) => sum + module.students.length, 0);
    console.log(`📊 Total students across all modules: ${totalStudents}`);
    
    // Check for students without modules
    const studentsWithoutModule = await prisma.student.findMany({
      where: { moduleId: null },
      select: { studentId: true, fullName: true }
    });
    
    if (studentsWithoutModule.length > 0) {
      console.log(`\n⚠️  Students without module assignment: ${studentsWithoutModule.length}`);
      studentsWithoutModule.forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.fullName} (${student.studentId})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error verifying modules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
