import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Verifying AEM230 student assignments...');
    
    // Get the AEM230 module
    const aem230Module = await prisma.module.findUnique({
      where: { code: 'AEM230' }
    });
    
    if (!aem230Module) {
      console.error('❌ AEM230 module not found!');
      return;
    }
    
    console.log(`✅ Found AEM230 module: ${aem230Module.name}`);
    
    // Correct students for AEM230 from your screenshots (excluding instructor Elias Thomas)
    const correctAem230Students = [
      'H00530550', // Sultan Salem Ali Ali Aljneibi
      'H00594076', // Alanoud Salem Saeed Shenain Alnuaimi
      'H00602802', // Mohammed Salim Abdallah Humaid Alomairi
      'H00594105', // Hamad Salim Hamad Mattar Alnaaimi
      'H00600056', // Ranad Sultan Khamis Khalfan Alyahyaee
      'H00604014', // Latifa Yousef Sultan Abdulla Alshamsi
      'H00571107', // Naji Mohammed Bujair Salem Alameri
      'H00594069', // Mariam Mohammed Khalfan Saeed Alshamsi
      'H00541639', // Shahad Mohammed Khamis Juma Alshamsi
      'H00530541', // Ahmed Mohammed Khamis Saeed Alyahyaee
      'H00601771', // Meera Mohammed Rashed Khalifa Alkaabi
      'H00594158', // Turfa Mohammed Saif Alabed Alnuaimi
      'H00594033', // Ghalya Nasser Abdulrahman Nasser Al Ahbabi
      'H00502212', // Theyab Obaid Ahmed Obaid Albadi
      'H00601795', // Mariam Obaid Hareb Obaid Alkaabi
      'H00601780', // Afra Saeed Khassib Rashed Alsheryani
      'H00593951', // Mahra Saif Mohammed Yehal Aldhaheri
      'H00599984', // Dheyab Abdallah Ali Saif Almazruii
      'H00566881', // Ali Abdulla Ali Sulaiman Alameri
      'H00546028', // Mohammed Abdulla Mohammed Binreed Alsubousi
      'H00594180', // Shamma Ahmed Eid Obaid Alketbi
      'H00601791', // Maitha Ali Mubarak Mohammed Alshamsi
      'H00605422', // Shamsa Fahed Yousef Abdulla Alsawwafi
      'H00601770', // Shouq Hamad Obaid Hamad Alshamsi
      'H00524101', // Mohammed Hamad Mohammed Alkhsousi
      'H00609157', // Mohammed Khalifa Abdulla Hareb Aldhaheri
      'H00600102', // Sultan Khulaif Ali Mohammed Alhajeri
      'H00601777', // Mahra Mohammed Abdulla Khamis Alshamsi
      'H00600088', // Abdulla Mohammed Abdulrahman Saeed Almeqbaali
      'H00542166', // Saeed Mohammed Ali Rashed Almeqbaali
      'H00601746'  // Mariam Mohammed Ateeq Altheeb Alshamsi
    ];
    
    console.log(`📋 Expected AEM230 students from screenshots: ${correctAem230Students.length}`);
    
    // Check current students in AEM230
    console.log('\n🔍 Current students in AEM230 database...');
    const currentAem230Students = await prisma.student.findMany({
      where: { moduleId: aem230Module.id },
      select: { id: true, fullName: true, studentId: true },
      orderBy: { fullName: 'asc' }
    });
    
    console.log(`Found ${currentAem230Students.length} current students in AEM230:`);
    currentAem230Students.forEach((student, index) => {
      const isExpected = correctAem230Students.includes(student.studentId);
      const status = isExpected ? '✅' : '❌';
      console.log(`   ${index + 1}. ${student.fullName} (${student.studentId}) ${status}`);
    });
    
    // Check for missing students
    console.log('\n🔍 Checking for missing students...');
    const currentStudentIds = currentAem230Students.map(s => s.studentId);
    const missingStudents = correctAem230Students.filter(id => !currentStudentIds.includes(id));
    
    if (missingStudents.length > 0) {
      console.log(`❌ Missing ${missingStudents.length} students from database:`);
      missingStudents.forEach(id => {
        console.log(`   - ${id}`);
      });
    } else {
      console.log('✅ No missing students');
    }
    
    // Check for extra students
    console.log('\n🔍 Checking for extra students...');
    const extraStudents = currentStudentIds.filter(id => !correctAem230Students.includes(id));
    
    if (extraStudents.length > 0) {
      console.log(`❌ Found ${extraStudents.length} extra students in database:`);
      extraStudents.forEach(id => {
        const student = currentAem230Students.find(s => s.studentId === id);
        console.log(`   - ${student?.fullName} (${id})`);
      });
    } else {
      console.log('✅ No extra students');
    }
    
    // Summary
    console.log('\n📊 VERIFICATION SUMMARY:');
    console.log(`   📋 Expected students: ${correctAem230Students.length}`);
    console.log(`   💾 Database students: ${currentAem230Students.length}`);
    console.log(`   ❌ Missing students: ${missingStudents.length}`);
    console.log(`   ➕ Extra students: ${extraStudents.length}`);
    
    if (missingStudents.length === 0 && extraStudents.length === 0) {
      console.log('\n🎉 ✅ AEM230 VERIFICATION PASSED! All students match perfectly!');
    } else {
      console.log('\n⚠️  AEM230 VERIFICATION FAILED! Discrepancies found.');
    }
    
  } catch (error) {
    console.error('❌ Error verifying AEM230 students:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
