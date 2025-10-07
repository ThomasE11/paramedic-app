import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 Fixing HEM3923 student assignments...');
    
    // Get the HEM3923 module
    const hem3923Module = await prisma.module.findUnique({
      where: { code: 'HEM3923' }
    });
    
    if (!hem3923Module) {
      console.error('❌ HEM3923 module not found!');
      return;
    }
    
    console.log(`✅ Found HEM3923 module: ${hem3923Module.name}`);
    
    // Correct students for HEM3923 - Responder Practicum I (from your screenshot)
    const correctHem3923Students = [
      {
        studentId: 'H00461337',
        firstName: 'Alreem',
        lastName: 'Ahmed Saif Mohammed Alameri',
        fullName: 'Alreem Ahmed Saif Mohammed Alameri',
        email: 'h00461337@hct.ac.ae'
      },
      {
        studentId: 'H00461314',
        firstName: 'Fatima',
        lastName: 'Ali Saif Albian Almarzouei',
        fullName: 'Fatima Ali Saif Albian Almarzouei',
        email: 'h00461314@hct.ac.ae'
      },
      {
        studentId: 'H00461453',
        firstName: 'Abdulhamid',
        lastName: 'Bashar Abdulla Hasan Alqadeda',
        fullName: 'Abdulhamid Bashar Abdulla Hasan Alqadeda',
        email: 'h00461453@hct.ac.ae'
      },
      {
        studentId: 'H00459151',
        firstName: 'Aysha',
        lastName: 'Helal Humaid Anaf Alkaabi',
        fullName: 'Aysha Helal Humaid Anaf Alkaabi',
        email: 'h00459151@hct.ac.ae'
      },
      {
        studentId: 'H00459808',
        firstName: 'Elyazia',
        lastName: 'Jumaa Ahmad Haji',
        fullName: 'Elyazia Jumaa Ahmad Haji',
        email: 'h00459808@hct.ac.ae'
      },
      {
        studentId: 'H00460995',
        firstName: 'Mohammed',
        lastName: 'Nasser Khamis Salem Alkhsuaee',
        fullName: 'Mohammed Nasser Khamis Salem Alkhsuaee',
        email: 'h00460995@hct.ac.ae'
      }
    ];
    
    console.log('📋 Correct HEM3923 students list:');
    correctHem3923Students.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.fullName} (${student.studentId})`);
    });
    
    // First, remove all current students from HEM3923
    console.log('\n🧹 Removing current students from HEM3923...');
    const currentHem3923Students = await prisma.student.findMany({
      where: { moduleId: hem3923Module.id },
      select: { id: true, fullName: true, studentId: true }
    });
    
    console.log(`Found ${currentHem3923Students.length} current students in HEM3923:`);
    currentHem3923Students.forEach(student => {
      console.log(`   - ${student.fullName} (${student.studentId})`);
    });
    
    // Update current HEM3923 students to have no module (we'll reassign them later if needed)
    await prisma.student.updateMany({
      where: { moduleId: hem3923Module.id },
      data: { moduleId: null }
    });
    
    console.log('✅ Cleared current HEM3923 assignments');
    
    // Now assign the correct students to HEM3923
    console.log('\n📝 Assigning correct students to HEM3923...');
    let assignedCount = 0;
    let createdCount = 0;
    
    for (const studentData of correctHem3923Students) {
      try {
        // Try to find existing student
        let student = await prisma.student.findFirst({
          where: {
            OR: [
              { studentId: studentData.studentId },
              { email: studentData.email }
            ]
          }
        });
        
        if (student) {
          // Update existing student
          await prisma.student.update({
            where: { id: student.id },
            data: {
              ...studentData,
              moduleId: hem3923Module.id
            }
          });
          console.log(`   ✅ Updated: ${studentData.fullName}`);
          assignedCount++;
        } else {
          // Create new student
          student = await prisma.student.create({
            data: {
              ...studentData,
              moduleId: hem3923Module.id,
              phone: '+971501234567' // Default phone
            }
          });
          console.log(`   ➕ Created: ${studentData.fullName}`);
          createdCount++;
        }
      } catch (error) {
        console.error(`   ❌ Error with ${studentData.fullName}:`, error);
      }
    }
    
    // Verify the final state
    console.log('\n🔍 Verifying final HEM3923 assignments...');
    const finalHem3923Students = await prisma.student.findMany({
      where: { moduleId: hem3923Module.id },
      select: { fullName: true, studentId: true, email: true },
      orderBy: { fullName: 'asc' }
    });
    
    console.log(`\n✅ Final HEM3923 student count: ${finalHem3923Students.length}`);
    finalHem3923Students.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.fullName} (${student.studentId})`);
    });
    
    console.log(`\n🎉 HEM3923 fix completed!`);
    console.log(`   📊 Updated: ${assignedCount} students`);
    console.log(`   ➕ Created: ${createdCount} students`);
    console.log(`   📋 Total in HEM3923: ${finalHem3923Students.length} students`);
    
  } catch (error) {
    console.error('❌ Error fixing HEM3923 students:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
