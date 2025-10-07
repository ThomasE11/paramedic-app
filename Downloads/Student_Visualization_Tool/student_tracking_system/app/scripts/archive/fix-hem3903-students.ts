import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 Fixing HEM3903 student assignments...');
    
    // Get the HEM3903 module
    const hem3903Module = await prisma.module.findUnique({
      where: { code: 'HEM3903' }
    });
    
    if (!hem3903Module) {
      console.error('❌ HEM3903 module not found!');
      return;
    }
    
    console.log(`✅ Found HEM3903 module: ${hem3903Module.name}`);
    
    // Correct students for HEM3903 - Ambulance Practicum III (from your screenshot)
    const correctHem3903Students = [
      {
        studentId: 'H00467388',
        firstName: 'Nahian',
        lastName: 'Abdullah Ali Rashed Al Saadi',
        fullName: 'Nahian Abdullah Ali Rashed Al Saadi',
        email: 'h00467388@hct.ac.ae'
      },
      {
        studentId: 'H00491322',
        firstName: 'Mahra',
        lastName: 'Abdulla Saeed Bakhit Alshebli',
        fullName: 'Mahra Abdulla Saeed Bakhit Alshebli',
        email: 'h00491322@hct.ac.ae'
      },
      {
        studentId: 'H00459031',
        firstName: 'Saeed',
        lastName: 'Amer Salem Ahmed Alseiari',
        fullName: 'Saeed Amer Salem Ahmed Alseiari',
        email: 'h00459031@hct.ac.ae'
      },
      {
        studentId: 'H00513261',
        firstName: 'Yunis',
        lastName: 'Maaruf',
        fullName: 'Yunis Maaruf',
        email: 'h00513261@hct.ac.ae'
      },
      {
        studentId: 'H00473436',
        firstName: 'Abdulla',
        lastName: 'Mohamed Abdulla Obaid Alfarsi',
        fullName: 'Abdulla Mohamed Abdulla Obaid Alfarsi',
        email: 'h00473436@hct.ac.ae'
      },
      {
        studentId: 'H00491239',
        firstName: 'Sherina',
        lastName: 'Obaid Ali Rashed Aljahoori',
        fullName: 'Sherina Obaid Ali Rashed Aljahoori',
        email: 'h00491239@hct.ac.ae'
      },
      {
        studentId: 'H00491089',
        firstName: 'Bakhita',
        lastName: 'Saeed Rashed Hedairem Alketbi',
        fullName: 'Bakhita Saeed Rashed Hedairem Alketbi',
        email: 'h00491089@hct.ac.ae'
      },
      {
        studentId: 'H00491292',
        firstName: 'Alanood',
        lastName: 'Saif Jawaan Obaid Almansoori',
        fullName: 'Alanood Saif Jawaan Obaid Almansoori',
        email: 'h00491292@hct.ac.ae'
      },
      {
        studentId: 'H00491415',
        firstName: 'Shamsa',
        lastName: 'Salem Musabbeh Ahmed Alkaabi',
        fullName: 'Shamsa Salem Musabbeh Ahmed Alkaabi',
        email: 'h00491415@hct.ac.ae'
      }
    ];
    
    console.log('📋 Correct HEM3903 students list:');
    correctHem3903Students.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.fullName} (${student.studentId})`);
    });
    
    // Check current students in HEM3903
    console.log('\n🔍 Current students in HEM3903...');
    const currentHem3903Students = await prisma.student.findMany({
      where: { moduleId: hem3903Module.id },
      select: { id: true, fullName: true, studentId: true }
    });
    
    console.log(`Found ${currentHem3903Students.length} current students in HEM3903:`);
    currentHem3903Students.forEach(student => {
      console.log(`   - ${student.fullName} (${student.studentId})`);
    });
    
    // First, remove all current students from HEM3903
    console.log('\n🧹 Clearing current HEM3903 assignments...');
    await prisma.student.updateMany({
      where: { moduleId: hem3903Module.id },
      data: { moduleId: null }
    });
    
    console.log('✅ Cleared current HEM3903 assignments');
    
    // Now assign the correct students to HEM3903
    console.log('\n📝 Assigning correct students to HEM3903...');
    let assignedCount = 0;
    let createdCount = 0;
    
    for (const studentData of correctHem3903Students) {
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
              moduleId: hem3903Module.id
            }
          });
          console.log(`   ✅ Updated: ${studentData.fullName}`);
          assignedCount++;
        } else {
          // Create new student
          student = await prisma.student.create({
            data: {
              ...studentData,
              moduleId: hem3903Module.id,
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
    console.log('\n🔍 Verifying final HEM3903 assignments...');
    const finalHem3903Students = await prisma.student.findMany({
      where: { moduleId: hem3903Module.id },
      select: { fullName: true, studentId: true, email: true },
      orderBy: { fullName: 'asc' }
    });
    
    console.log(`\n✅ Final HEM3903 student count: ${finalHem3903Students.length}`);
    finalHem3903Students.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.fullName} (${student.studentId})`);
    });
    
    console.log(`\n🎉 HEM3903 fix completed!`);
    console.log(`   📊 Updated: ${assignedCount} students`);
    console.log(`   ➕ Created: ${createdCount} students`);
    console.log(`   📋 Total in HEM3903: ${finalHem3903Students.length} students`);
    
  } catch (error) {
    console.error('❌ Error fixing HEM3903 students:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
