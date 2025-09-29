import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixModuleStructure() {
  try {
    console.log('🔧 Fixing module structure to have only 4 modules...');

    // Step 1: Get the 4 required modules
    const requiredModuleCodes = ['HEM2903', 'HEM3903', 'AEM230', 'HEM3923'];

    // Step 2: Ensure all 4 required modules exist
    for (const code of requiredModuleCodes) {
      const existingModule = await prisma.module.findUnique({
        where: { code }
      });

      if (!existingModule) {
        let name = '';
        switch (code) {
          case 'HEM2903':
            name = 'Ambulance 1 Practical Group';
            break;
          case 'HEM3903':
            name = 'Ambulance Practicum III';
            break;
          case 'AEM230':
            name = 'Apply Clinical Practicum 1 Ambulance (Diploma)';
            break;
          case 'HEM3923':
            name = 'Responder Practicum I';
            break;
        }

        await prisma.module.create({
          data: {
            code,
            name,
            description: `${name} module for Emergency Medical Services program`
          }
        });
        console.log(`✅ Created module: ${code}`);
      }
    }

    // Step 3: Get module IDs
    const modules = await prisma.module.findMany({
      where: {
        code: { in: requiredModuleCodes }
      }
    });

    const moduleMap = new Map<string, string>();
    modules.forEach(module => {
      moduleMap.set(module.code, module.id);
    });

    // Step 4: Move students from EMS2947 to HEM2903 (Course 529247_1 from screenshots)
    const emsModule = await prisma.module.findUnique({
      where: { code: 'EMS2947' }
    });

    if (emsModule) {
      const emsStudents = await prisma.student.findMany({
        where: { moduleId: emsModule.id }
      });

      console.log(`📋 Moving ${emsStudents.length} students from EMS2947 to HEM2903`);

      await prisma.student.updateMany({
        where: { moduleId: emsModule.id },
        data: { moduleId: moduleMap.get('HEM2903') }
      });
    }

    // Step 5: Move students from ACP1AMB to AEM230
    const acpModule = await prisma.module.findUnique({
      where: { code: 'ACP1AMB' }
    });

    if (acpModule) {
      const acpStudents = await prisma.student.findMany({
        where: { moduleId: acpModule.id }
      });

      console.log(`📋 Moving ${acpStudents.length} students from ACP1AMB to AEM230`);

      await prisma.student.updateMany({
        where: { moduleId: acpModule.id },
        data: { moduleId: moduleMap.get('AEM230') }
      });
    }

    // Step 6: Delete the extra modules
    if (emsModule) {
      await prisma.module.delete({
        where: { id: emsModule.id }
      });
      console.log('🗑️  Deleted EMS2947 module');
    }

    if (acpModule) {
      await prisma.module.delete({
        where: { id: acpModule.id }
      });
      console.log('🗑️  Deleted ACP1AMB module');
    }

    // Step 7: Verify the final structure
    const finalModules = await prisma.module.findMany({
      include: {
        _count: { select: { students: true } }
      },
      orderBy: { code: 'asc' }
    });

    console.log('\n✅ Final module structure:');
    finalModules.forEach(module => {
      console.log(`   ${module.code}: ${module.name} (${module._count.students} students)`);
    });

    const totalStudents = await prisma.student.count();
    console.log(`\n📊 Total students: ${totalStudents}`);

    if (finalModules.length === 4) {
      console.log('\n✅ Successfully restructured to 4 modules as requested!');
    } else {
      console.log(`\n⚠️  Warning: Found ${finalModules.length} modules instead of 4`);
    }

  } catch (error) {
    console.error('❌ Error fixing module structure:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixModuleStructure();