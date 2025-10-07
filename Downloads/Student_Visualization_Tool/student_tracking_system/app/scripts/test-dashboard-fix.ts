import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDashboardData() {
  try {
    console.log('🧪 Testing dashboard data availability...');

    // Get total students count
    const totalStudents = await prisma.student.count();
    console.log(`✅ Total students: ${totalStudents}`);

    // Get module stats
    const modules = await prisma.module.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      }
    });

    console.log('\n📊 Module breakdown:');
    modules.forEach(module => {
      console.log(`   ${module.code}: ${module._count.students} students`);
    });

    // Test the exact same query as the dashboard API
    const moduleStats = modules.map(module => ({
      moduleId: module.id,
      moduleCode: module.code,
      moduleName: module.name,
      studentCount: module._count.students
    }));

    // Get recent activities
    const recentActivities = await prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            module: {
              select: { code: true, name: true }
            }
          }
        }
      }
    });

    console.log(`\n📝 Recent activities: ${recentActivities.length}`);

    // Test student data for cards
    const students = await prisma.student.findMany({
      take: 5,
      include: {
        module: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      }
    });

    console.log(`\n👥 Sample students for cards:`);
    students.forEach(student => {
      console.log(`   ${student.studentId}: ${student.fullName} (${student.module?.code || 'No Module'})`);
    });

    // Final dashboard object (same as API response)
    const dashboardData = {
      totalStudents,
      moduleStats,
      recentActivities
    };

    console.log('\n✅ Dashboard API response format:');
    console.log(`   Total Students: ${dashboardData.totalStudents}`);
    console.log(`   Module Stats: ${dashboardData.moduleStats.length} modules`);
    console.log(`   Recent Activities: ${dashboardData.recentActivities.length} activities`);

    if (totalStudents > 0) {
      console.log('\n✅ Data is available - the issue is likely authentication or frontend state');
    } else {
      console.log('\n❌ No student data found - database sync may have failed');
    }

  } catch (error) {
    console.error('❌ Error testing dashboard data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDashboardData();