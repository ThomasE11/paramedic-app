
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { Role, ProgressStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, studentId } = await request.json();

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Generate student ID if not provided for students
    let finalStudentId = studentId;
    if (role === 'STUDENT' && !studentId) {
      // Generate a student ID based on year and count
      const year = new Date().getFullYear();
      const studentCount = await prisma.user.count({
        where: { role: 'STUDENT' }
      });
      finalStudentId = `STU${year}${String(studentCount + 1).padStart(3, '0')}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role,
        studentId: finalStudentId || null,
      },
    });

    // If it's a student, initialize their progress with zero skills
    if (role === 'STUDENT') {
      try {
        // Get all skills to initialize progress records
        const skills = await prisma.skill.findMany({
          select: { id: true }
        });

        // Create initial progress records for all skills
        if (skills.length > 0) {
          const progressRecords = skills.map(skill => ({
            userId: user.id,
            skillId: skill.id,
            status: ProgressStatus.NOT_STARTED,
            attempts: 0,
            completedSteps: [],
            timeSpentMinutes: 0,
            currentSessionTime: 0,
            totalTimeSpent: 0,
            reflectionTime: 0,
          }));

          // Batch create all progress records
          await prisma.studentProgress.createMany({
            data: progressRecords,
            skipDuplicates: true
          });
        }
      } catch (progressError) {
        console.warn('Could not initialize student progress records:', progressError);
        // Continue anyway - progress records can be created later when skills are accessed
      }
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
