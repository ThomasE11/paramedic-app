#!/usr/bin/env tsx

import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function updatePassword() {
  const email = 'elias@twetemo.com';
  const password = 'test123';

  console.log(`Updating password for ${email}...`);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword
    },
    create: {
      email,
      name: 'Elias Thomas',
      role: 'instructor',
      password: hashedPassword
    }
  });

  console.log('✅ Password updated successfully');
  console.log(`User: ${user.email} (${user.name})`);
  console.log(`Role: ${user.role}`);
  console.log('\nYou can now login with:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);

  await prisma.$disconnect();
}

updatePassword().catch(console.error);
