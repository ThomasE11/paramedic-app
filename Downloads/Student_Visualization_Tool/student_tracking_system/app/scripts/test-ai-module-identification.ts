import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Testing AI Module Identification...');
    
    // Get students by module to verify data
    const studentsByModule = await prisma.student.findMany({
      include: { module: true },
      orderBy: { fullName: 'asc' }
    });
    
    console.log('\n📊 Current Student Distribution:');
    
    const moduleGroups = studentsByModule.reduce((acc: any, student) => {
      const moduleCode = student.module?.code || 'No Module';
      if (!acc[moduleCode]) acc[moduleCode] = [];
      acc[moduleCode].push(student);
      return acc;
    }, {});
    
    Object.entries(moduleGroups).forEach(([moduleCode, students]: [string, any]) => {
      console.log(`\n${moduleCode}: ${students.length} students`);
      students.forEach((student: any, index: number) => {
        console.log(`   ${index + 1}. ${student.fullName} (${student.studentId})`);
      });
    });
    
    // Test specific module queries
    console.log('\n🧪 Testing Module Queries:');
    
    const hem3923Students = await prisma.student.findMany({
      where: { module: { code: 'HEM3923' } },
      include: { module: true }
    });
    
    const hem3903Students = await prisma.student.findMany({
      where: { module: { code: 'HEM3903' } },
      include: { module: true }
    });
    
    console.log(`\n✅ HEM3923 (Responder Practicum I): ${hem3923Students.length} students`);
    hem3923Students.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.fullName} (${student.studentId})`);
    });
    
    console.log(`\n✅ HEM3903 (Ambulance Practicum III): ${hem3903Students.length} students`);
    hem3903Students.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.fullName} (${student.studentId})`);
    });
    
    // Check if the students you mentioned are in the wrong module
    const problematicStudents = [
      'Nahian Abdullah Ali Rashed Al Saadi',
      'Sherina Obaid Ali Rashed Aljahoori', 
      'Alanood Saif Jawaan Obaid Almansoori',
      'Mahra Abdulla Saeed Bakhit Alshebli',
      'Yunis Maaruf'
    ];
    
    console.log('\n🚨 Checking Students That Received Wrong Emails:');
    for (const studentName of problematicStudents) {
      const student = await prisma.student.findFirst({
        where: { 
          fullName: { 
            contains: studentName.split(' ')[0], // Search by first name
            mode: 'insensitive' 
          }
        },
        include: { module: true }
      });
      
      if (student) {
        const moduleCode = student.module?.code || 'No Module';
        const isCorrect = moduleCode === 'HEM3923' ? '✅' : '❌';
        console.log(`   ${isCorrect} ${student.fullName} → ${moduleCode} (${student.module?.name})`);
      } else {
        console.log(`   ❓ Student not found: ${studentName}`);
      }
    }
    
    // Test the AI context data format
    console.log('\n🤖 AI Context Data Format:');
    const contextStudents = studentsByModule.map(s => ({
      id: s.id,
      name: s.fullName,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      studentId: s.studentId,
      module: s.module?.code || 'No Module',
      moduleId: s.moduleId,
      moduleName: s.module?.name
    }));
    
    const hem3923Context = contextStudents.filter(s => s.module === 'HEM3923');
    const hem3903Context = contextStudents.filter(s => s.module === 'HEM3903');
    
    console.log(`\nHEM3923 in AI context: ${hem3923Context.length} students`);
    hem3923Context.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.name} (${student.studentId}) - ${student.module}`);
    });
    
    console.log(`\nHEM3903 in AI context: ${hem3903Context.length} students`);
    hem3903Context.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.name} (${student.studentId}) - ${student.module}`);
    });
    
  } catch (error) {
    console.error('❌ Error testing module identification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
