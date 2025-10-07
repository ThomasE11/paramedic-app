import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const productionUsers = [
  {
    email: 'elias@twetemo.com',
    password: 'StrongPassword123!', // Replace with secure password
    name: 'Elias Thomas',
    role: 'instructor',
    title: 'Lead Instructor',
    department: 'Healthcare Emergency Management',
    bio: 'Healthcare education specialist with expertise in emergency management and paramedic training.'
  },
  {
    email: 'admin@hct.edu.ae',
    password: 'AdminSecure456!', // Replace with secure password
    name: 'System Administrator',
    role: 'admin',
    title: 'System Administrator',
    department: 'IT Department',
    bio: 'System administrator managing the student tracking and educational platform.'
  },
  {
    email: 'instructor@hct.edu.ae',
    password: 'InstructorPass789!', // Replace with secure password
    name: 'Guest Instructor',
    role: 'instructor',
    title: 'Clinical Instructor',
    department: 'Healthcare Emergency Management',
    bio: 'Clinical instructor specializing in emergency medical services education.'
  }
];

async function setupProductionUsers() {
  try {
    console.log('=== SETTING UP PRODUCTION USERS ===\n');

    for (const userData of productionUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`⏭️  User ${userData.email} already exists, updating password...`);

        // Hash the new password
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        // Update existing user
        await prisma.user.update({
          where: { email: userData.email },
          data: {
            password: hashedPassword,
            name: userData.name,
            role: userData.role,
            title: userData.title,
            department: userData.department,
            bio: userData.bio
          }
        });

        console.log(`✅ Updated user: ${userData.name} (${userData.email})`);
      } else {
        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        // Create new user
        await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            name: userData.name,
            role: userData.role,
            title: userData.title,
            department: userData.department,
            bio: userData.bio,
            emailVerified: new Date(),
            preferences: {}
          }
        });

        console.log(`✅ Created user: ${userData.name} (${userData.email})`);
      }
    }

    // Display final user list
    console.log('\n=== PRODUCTION USERS SUMMARY ===\n');
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        title: true,
        department: true
      },
      orderBy: { role: 'asc' }
    });

    allUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}: ${user.name} (${user.email})`);
      console.log(`  Title: ${user.title || 'N/A'}`);
      console.log(`  Department: ${user.department || 'N/A'}`);
      console.log('');
    });

    console.log('⚠️  IMPORTANT: Update the environment variables with secure passwords!');
    console.log('⚠️  Remove demo mode from auth.ts after testing!');

  } catch (error) {
    console.error('Error setting up production users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupProductionUsers();