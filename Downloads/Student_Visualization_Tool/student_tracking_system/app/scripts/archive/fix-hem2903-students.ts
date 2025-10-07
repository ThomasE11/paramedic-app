import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 Fixing HEM2903 student assignments...');
    
    // Get the HEM2903 module
    const hem2903Module = await prisma.module.findUnique({
      where: { code: 'HEM2903' }
    });
    
    if (!hem2903Module) {
      console.error('❌ HEM2903 module not found!');
      return;
    }
    
    console.log(`✅ Found HEM2903 module: ${hem2903Module.name}`);
    
    // Correct students for HEM2903 - Ambulance Practicum 1 (from your screenshot)
    const correctHem2903Students = [
      {
        studentId: 'H00542198',
        firstName: 'Fatima',
        lastName: 'Abdulla Salem Abdulla Alkaabi',
        fullName: 'Fatima Abdulla Salem Abdulla Alkaabi',
        email: 'h00542198@hct.ac.ae'
      },
      {
        studentId: 'H00491399',
        firstName: 'Shamayel',
        lastName: 'Ahmed Nashr Alsaadi',
        fullName: 'Shamayel Ahmed Nashr Alsaadi',
        email: 'h00491399@hct.ac.ae'
      },
      {
        studentId: 'H00542939',
        firstName: 'Mohammed',
        lastName: 'Bader Nasser Abdulla Alblooshi',
        fullName: 'Mohammed Bader Nasser Abdulla Alblooshi',
        email: 'h00542939@hct.ac.ae'
      },
      {
        studentId: 'H00467407',
        firstName: 'Nahyan',
        lastName: 'Ibrahim Abdulla Ibrahim Alblooshi',
        fullName: 'Nahyan Ibrahim Abdulla Ibrahim Alblooshi',
        email: 'h00467407@hct.ac.ae'
      },
      {
        studentId: 'H00467469',
        firstName: 'Qmasha',
        lastName: 'Imad Wadee Mohammed Aldhaheri',
        fullName: 'Qmasha Imad Wadee Mohammed Aldhaheri',
        email: 'h00467469@hct.ac.ae'
      },
      {
        studentId: 'H00542183',
        firstName: 'Shama',
        lastName: 'Juma Saeed Juma Alkaabi',
        fullName: 'Shama Juma Saeed Juma Alkaabi',
        email: 'h00542183@hct.ac.ae'
      },
      {
        studentId: 'H00542199',
        firstName: 'Shahd',
        lastName: 'Khaled Ali Mohammed Alblooshi',
        fullName: 'Shahd Khaled Ali Mohammed Alblooshi',
        email: 'h00542199@hct.ac.ae'
      },
      {
        studentId: 'H00541555',
        firstName: 'Mahra',
        lastName: 'Khalifa Mohammed Khalifa Alghafli',
        fullName: 'Mahra Khalifa Mohammed Khalifa Alghafli',
        email: 'h00541555@hct.ac.ae'
      },
      {
        studentId: 'H00491386',
        firstName: 'Sana',
        lastName: 'Mohammed Nasser Gharib Al Ahbabi',
        fullName: 'Sana Mohammed Nasser Gharib Al Ahbabi',
        email: 'h00491386@hct.ac.ae'
      },
      {
        studentId: 'H00542172',
        firstName: 'Talal',
        lastName: 'Mohammed Yousef Abdulla Alblooshi',
        fullName: 'Talal Mohammed Yousef Abdulla Alblooshi',
        email: 'h00542172@hct.ac.ae'
      },
      {
        studentId: 'H00498340',
        firstName: 'Zayed',
        lastName: 'Mubarak Khamis Kharboush Almansoori',
        fullName: 'Zayed Mubarak Khamis Kharboush Almansoori',
        email: 'h00498340@hct.ac.ae'
      },
      {
        studentId: 'H00510900',
        firstName: 'Athba',
        lastName: 'Saeed Ali Abed Alaryani',
        fullName: 'Athba Saeed Ali Abed Alaryani',
        email: 'h00510900@hct.ac.ae'
      },
      {
        studentId: 'H00541559',
        firstName: 'Afra',
        lastName: 'Subaih Humaid Salem Al Manei',
        fullName: 'Afra Subaih Humaid Salem Al Manei',
        email: 'h00541559@hct.ac.ae'
      },
      {
        studentId: 'H00542178',
        firstName: 'Ahmed',
        lastName: 'Tareq Mohmed Ali Alhosani',
        fullName: 'Ahmed Tareq Mohmed Ali Alhosani',
        email: 'h00542178@hct.ac.ae'
      }
    ];
    
    console.log('📋 Correct HEM2903 students list:');
    correctHem2903Students.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.fullName} (${student.studentId})`);
    });
    
    // Check current students in HEM2903
    console.log('\n🔍 Current students in HEM2903...');
    const currentHem2903Students = await prisma.student.findMany({
      where: { moduleId: hem2903Module.id },
      select: { id: true, fullName: true, studentId: true }
    });
    
    console.log(`Found ${currentHem2903Students.length} current students in HEM2903:`);
    currentHem2903Students.forEach(student => {
      console.log(`   - ${student.fullName} (${student.studentId})`);
    });
    
    // First, remove all current students from HEM2903
    console.log('\n🧹 Clearing current HEM2903 assignments...');
    await prisma.student.updateMany({
      where: { moduleId: hem2903Module.id },
      data: { moduleId: null }
    });
    
    console.log('✅ Cleared current HEM2903 assignments');
    
    // Now assign the correct students to HEM2903
    console.log('\n📝 Assigning correct students to HEM2903...');
    let assignedCount = 0;
    let createdCount = 0;
    
    for (const studentData of correctHem2903Students) {
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
              moduleId: hem2903Module.id
            }
          });
          console.log(`   ✅ Updated: ${studentData.fullName}`);
          assignedCount++;
        } else {
          // Create new student
          student = await prisma.student.create({
            data: {
              ...studentData,
              moduleId: hem2903Module.id,
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
    console.log('\n🔍 Verifying final HEM2903 assignments...');
    const finalHem2903Students = await prisma.student.findMany({
      where: { moduleId: hem2903Module.id },
      select: { fullName: true, studentId: true, email: true },
      orderBy: { fullName: 'asc' }
    });
    
    console.log(`\n✅ Final HEM2903 student count: ${finalHem2903Students.length}`);
    finalHem2903Students.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.fullName} (${student.studentId})`);
    });
    
    console.log(`\n🎉 HEM2903 fix completed!`);
    console.log(`   📊 Updated: ${assignedCount} students`);
    console.log(`   ➕ Created: ${createdCount} students`);
    console.log(`   📋 Total in HEM2903: ${finalHem2903Students.length} students`);
    
  } catch (error) {
    console.error('❌ Error fixing HEM2903 students:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
