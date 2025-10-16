import { prisma } from '@/lib/db';

async function addShahadStudent() {
  try {
    console.log('🔍 Checking if student H00541639 exists...');

    // Check if student already exists
    const existingStudent = await prisma.student.findFirst({
      where: { studentId: 'H00541639' }
    });

    if (existingStudent) {
      console.log('⚠️  Student H00541639 already exists:');
      console.log(existingStudent);
      return;
    }

    console.log('✅ Student does not exist. Proceeding with creation...');

    // Find AEM230 module
    console.log('🔍 Finding AEM230 module...');
    const aem230Module = await prisma.module.findFirst({
      where: { code: 'AEM230' }
    });

    if (!aem230Module) {
      console.error('❌ AEM230 module not found!');
      console.log('Available modules:');
      const modules = await prisma.module.findMany();
      console.log(modules);
      return;
    }

    console.log(`✅ Found AEM230 module: ${aem230Module.name} (ID: ${aem230Module.id})`);

    // Create the student
    console.log('📝 Creating student record...');
    const newStudent = await prisma.student.create({
      data: {
        studentId: 'H00541639',
        firstName: 'Shahad',
        lastName: 'Alshamsi',
        fullName: 'Shahad Mohammed Khamis Juma Alshamsi',
        email: 'H00541639@hct.ac.ae',
        moduleId: aem230Module.id
      },
      include: {
        module: true
      }
    });

    console.log('✅ Student created successfully!');
    console.log({
      studentId: newStudent.studentId,
      fullName: newStudent.fullName,
      email: newStudent.email,
      module: newStudent.module?.code,
      databaseId: newStudent.id
    });

    // Verify the student exists in the module
    console.log('\n🔍 Verifying student in AEM230...');
    const studentsInAEM230 = await prisma.student.findMany({
      where: { moduleId: aem230Module.id },
      select: {
        studentId: true,
        fullName: true
      }
    });

    console.log(`\n✅ AEM230 now has ${studentsInAEM230.length} students`);
    const shahad = studentsInAEM230.find(s => s.studentId === 'H00541639');
    if (shahad) {
      console.log(`✅ Confirmed: ${shahad.fullName} is in AEM230`);
    }

  } catch (error) {
    console.error('❌ Error adding student:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addShahadStudent();
