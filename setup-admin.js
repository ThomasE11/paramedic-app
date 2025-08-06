const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@ems-training.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: 'EMS Admin',
        email: 'admin@ems-training.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@ems-training.com');
    console.log('🔑 Password: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password after first login!');

    // Create a test lecturer
    const lecturerPassword = await bcrypt.hash('lecturer123', 12);
    await prisma.user.create({
      data: {
        name: 'Test Lecturer',
        email: 'lecturer@ems-training.com',
        password: lecturerPassword,
        role: 'LECTURER',
      },
    });

    // Create a test student
    const studentPassword = await bcrypt.hash('student123', 12);
    await prisma.user.create({
      data: {
        name: 'Test Student',
        email: 'student@ems-training.com',
        password: studentPassword,
        role: 'STUDENT',
        studentId: 'STU001',
      },
    });

    console.log('✅ Test users created:');
    console.log('👨‍🏫 Lecturer: lecturer@ems-training.com / lecturer123');
    console.log('🎓 Student: student@ems-training.com / student123');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();