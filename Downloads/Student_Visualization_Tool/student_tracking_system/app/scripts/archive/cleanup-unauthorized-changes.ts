import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupUnauthorizedChanges() {
  try {
    console.log('=== CLEANING UP UNAUTHORIZED CHANGES ===\n');

    // 1. Remove unauthorized users that were created
    console.log('1. Removing unauthorized users...');

    const unauthorizedEmails = [
      'admin@hct.edu.ae',
      'instructor@hct.edu.ae'
    ];

    for (const email of unauthorizedEmails) {
      const deleted = await prisma.user.deleteMany({
        where: { email: email }
      });
      if (deleted.count > 0) {
        console.log(`✅ Removed unauthorized user: ${email}`);
      }
    }

    // 2. Remove students that were added without authorization
    console.log('\n2. Removing unauthorized students...');

    // Remove students with IDs that start with HEM290301-HEM290316 and HEM390301-HEM390307
    const unauthorizedStudentIds = [
      'HEM290301', 'HEM290302', 'HEM290303', 'HEM290304', 'HEM290305', 'HEM290306',
      'HEM290307', 'HEM290308', 'HEM290309', 'HEM290310', 'HEM290311', 'HEM290312',
      'HEM290313', 'HEM290314', 'HEM290315', 'HEM290316',
      'HEM390301', 'HEM390302', 'HEM390303', 'HEM390304', 'HEM390305', 'HEM390306', 'HEM390307'
    ];

    const deletedStudents = await prisma.student.deleteMany({
      where: {
        studentId: {
          in: unauthorizedStudentIds
        }
      }
    });

    console.log(`✅ Removed ${deletedStudents.count} unauthorized students`);

    // 3. Check what users remain
    console.log('\n3. Checking remaining users...');
    const remainingUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true
      }
    });

    remainingUsers.forEach(user => {
      console.log(`   ${user.email}: ${user.name} (${user.role})`);
    });

    // 4. Check current student counts
    console.log('\n4. Current student allocation...');
    const modules = await prisma.module.findMany({
      include: {
        _count: {
          select: { students: true }
        }
      },
      orderBy: { code: 'asc' }
    });

    modules.forEach(module => {
      console.log(`   ${module.code}: ${module._count.students} students`);
    });

    console.log('\n✅ Cleanup completed successfully!');

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupUnauthorizedChanges();