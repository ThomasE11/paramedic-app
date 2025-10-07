import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function systemHealthCheck() {
  console.log('=== COMPREHENSIVE SYSTEM HEALTH CHECK ===\n');

  try {
    // 1. Database Connection Test
    console.log('1. Testing Database Connection...');
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful\n');

    // 2. Check All Tables Have Data
    console.log('2. Checking Table Data Integrity...');

    const modules = await prisma.module.count();
    const students = await prisma.student.count();
    const users = await prisma.user.count();
    const subjects = await prisma.subject.count();
    const locations = await prisma.location.count();
    const classSessions = await prisma.classSession.count();
    const attendance = await prisma.attendance.count();
    const timeSlots = await prisma.timeSlot.count();

    console.log(`   Modules: ${modules}`);
    console.log(`   Students: ${students}`);
    console.log(`   Users: ${users}`);
    console.log(`   Subjects: ${subjects}`);
    console.log(`   Locations: ${locations}`);
    console.log(`   Class Sessions: ${classSessions}`);
    console.log(`   Attendance Records: ${attendance}`);
    console.log(`   Time Slots: ${timeSlots}`);
    console.log('');

    // 3. Check for Data Consistency
    console.log('3. Data Consistency Checks...');

    // Students without modules
    const studentsWithoutModules = await prisma.student.count({
      where: { moduleId: null }
    });

    // Class sessions without modules
    const sessionsWithoutModules = await prisma.classSession.count({
      where: { moduleId: null }
    });

    // Check for potential data issues
    const attendanceRecords = await prisma.attendance.findMany({
      take: 1
    });

    console.log(`   Students without modules: ${studentsWithoutModules}`);
    console.log(`   Class sessions without modules: ${sessionsWithoutModules}`);
    console.log(`   Attendance records available: ${attendanceRecords.length > 0 ? 'Yes' : 'No'}`);
    console.log('');

    // 4. Module Distribution Check
    console.log('4. Module Distribution Analysis...');
    const moduleDistribution = await prisma.module.findMany({
      include: {
        _count: {
          select: {
            students: true,
            classSessions: true,
            subjects: true
          }
        }
      },
      orderBy: { code: 'asc' }
    });

    moduleDistribution.forEach(module => {
      console.log(`   ${module.code}: ${module._count.students} students, ${module._count.classSessions} sessions, ${module._count.subjects} subjects`);
    });
    console.log('');

    // 5. User Authentication Check
    console.log('5. User Authentication Status...');
    const usersWithPasswords = await prisma.user.count({
      where: {
        password: {
          not: null
        }
      }
    });

    const adminUsers = await prisma.user.count({
      where: { role: 'admin' }
    });

    const instructorUsers = await prisma.user.count({
      where: { role: 'instructor' }
    });

    console.log(`   Users with passwords: ${usersWithPasswords}/${users}`);
    console.log(`   Admin users: ${adminUsers}`);
    console.log(`   Instructor users: ${instructorUsers}`);
    console.log('');

    // 6. Recent Activity Check
    console.log('6. Recent System Activity...');
    const recentStudents = await prisma.student.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    const recentSessions = await prisma.classSession.count({
      where: {
        date: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    console.log(`   Students created in last 24h: ${recentStudents}`);
    console.log(`   Class sessions in last 7 days: ${recentSessions}`);
    console.log('');

    // 7. Performance Indicators
    console.log('7. Performance Indicators...');
    const avgStudentsPerModule = students / modules;
    const avgSessionsPerModule = classSessions / modules;

    console.log(`   Average students per module: ${avgStudentsPerModule.toFixed(2)}`);
    console.log(`   Average sessions per module: ${avgSessionsPerModule.toFixed(2)}`);
    console.log('');

    // 8. Critical Issues Check
    console.log('8. Critical Issues Check...');
    let criticalIssues = 0;

    if (modules === 0) {
      console.log('❌ CRITICAL: No modules found');
      criticalIssues++;
    }

    if (students === 0) {
      console.log('❌ CRITICAL: No students found');
      criticalIssues++;
    }

    if (users === 0) {
      console.log('❌ CRITICAL: No users found');
      criticalIssues++;
    }

    if (adminUsers === 0) {
      console.log('⚠️  WARNING: No admin users found');
    }

    if (studentsWithoutModules > 0) {
      console.log(`⚠️  WARNING: ${studentsWithoutModules} students not assigned to modules`);
    }

    if (criticalIssues === 0) {
      console.log('✅ No critical issues found');
    }

    console.log('\n=== HEALTH CHECK COMPLETE ===');
    console.log(`Status: ${criticalIssues === 0 ? 'HEALTHY' : 'NEEDS ATTENTION'}`);
    console.log(`Critical Issues: ${criticalIssues}`);

  } catch (error) {
    console.error('❌ System Health Check Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

systemHealthCheck();