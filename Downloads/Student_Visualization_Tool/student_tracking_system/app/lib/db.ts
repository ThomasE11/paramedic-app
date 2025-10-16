import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

console.log('[DB] Initializing Prisma Client...');
console.log('[DB] DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('[DB] DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 50) + '...');
console.log('[DB] NODE_ENV:', process.env.NODE_ENV);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Handle connection errors gracefully
prisma.$connect()
  .then(() => {
    console.log('[DB] ✅ Prisma connected successfully');
  })
  .catch((err) => {
    console.error('[DB] ❌ Failed to connect to database:', err);
  })
