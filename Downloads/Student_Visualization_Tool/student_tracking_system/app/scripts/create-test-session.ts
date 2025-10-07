import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔧 Creating/updating test user for dashboard access...');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'elias@twetemo.com' }
    });

    if (existingUser) {
      console.log('✅ User already exists:', existingUser.email);

      // Update password to ensure it works
      const hashedPassword = await bcrypt.hash('test123', 10);
      await prisma.user.update({
        where: { email: 'elias@twetemo.com' },
        data: {
          password: hashedPassword,
          role: 'instructor'
        }
      });
      console.log('✅ Updated user password and role');
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash('test123', 10);
      const newUser = await prisma.user.create({
        data: {
          email: 'elias@twetemo.com',
          name: 'Elias Thomas',
          password: hashedPassword,
          role: 'instructor'
        }
      });
      console.log('✅ Created new user:', newUser.email);
    }

    console.log('\n📝 Login credentials:');
    console.log('   Email: elias@twetemo.com');
    console.log('   Password: test123');
    console.log('\n🌐 Access the application at: http://localhost:3003');
    console.log('   1. Go to /auth/signin');
    console.log('   2. Login with the credentials above');
    console.log('   3. Check /dashboard for student counts');
    console.log('   4. Check /students for student cards');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();