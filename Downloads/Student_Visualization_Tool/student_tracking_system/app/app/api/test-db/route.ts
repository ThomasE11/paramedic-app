import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('[TEST-DB] Starting database connection test...');
    console.log('[TEST-DB] DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('[TEST-DB] DATABASE_URL preview:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    // Test 1: Check Prisma connection
    console.log('[TEST-DB] Testing Prisma connection...');
    await prisma.$connect();
    console.log('[TEST-DB] ✅ Prisma connected successfully');
    
    // Test 2: Count students
    console.log('[TEST-DB] Counting students...');
    const studentCount = await prisma.student.count();
    console.log('[TEST-DB] ✅ Student count:', studentCount);
    
    // Test 3: Count modules
    console.log('[TEST-DB] Counting modules...');
    const moduleCount = await prisma.module.count();
    console.log('[TEST-DB] ✅ Module count:', moduleCount);
    
    // Test 4: Count users
    console.log('[TEST-DB] Counting users...');
    const userCount = await prisma.user.count();
    console.log('[TEST-DB] ✅ User count:', userCount);
    
    // Test 5: Get first student
    console.log('[TEST-DB] Fetching first student...');
    const firstStudent = await prisma.student.findFirst({
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true
      }
    });
    console.log('[TEST-DB] ✅ First student:', firstStudent);
    
    await prisma.$disconnect();
    console.log('[TEST-DB] ✅ All tests passed!');
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        studentCount,
        moduleCount,
        userCount,
        firstStudent,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          databaseUrlPreview: process.env.DATABASE_URL?.substring(0, 50) + '...'
        }
      }
    });
  } catch (error) {
    console.error('[TEST-DB] ❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPreview: process.env.DATABASE_URL?.substring(0, 50) + '...'
      }
    }, { status: 500 });
  }
}

