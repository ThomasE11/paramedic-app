
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const moduleId = searchParams.get('moduleId');
    const semester = searchParams.get('semester') || 'current';
    const academicYear = searchParams.get('academicYear') || '2024-2025';

    const whereClause: any = {
      semester,
      academicYear
    };

    if (studentId) {
      whereClause.studentId = studentId;
    }

    if (moduleId) {
      whereClause.moduleId = moduleId;
    }

    const grades = await prisma.grade.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            studentId: true,
            email: true
          }
        },
        subject: {
          select: {
            id: true,
            code: true,
            name: true,
            credits: true
          }
        },
        module: {
          select: {
            id: true,
            code: true,
            name: true
          }
        }
      },
      orderBy: [
        { student: { fullName: 'asc' } },
        { subject: { code: 'asc' } },
        { examType: 'asc' }
      ]
    });

    return NextResponse.json({ grades });
  } catch (error) {
    console.error('Grades fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      studentId, 
      subjectId, 
      moduleId,
      grade, 
      creditHours, 
      examType,
      examDate,
      comments,
      semester = 'current',
      academicYear = '2024-2025'
    } = body;

    // Convert grade to grade points
    const gradePoints = convertGradeToPoints(grade);

    const newGrade = await prisma.grade.create({
      data: {
        studentId,
        subjectId,
        moduleId,
        grade,
        gradePoints,
        creditHours,
        semester,
        academicYear,
        examType,
        examDate: examDate ? new Date(examDate) : null,
        comments
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            studentId: true
          }
        },
        subject: {
          select: {
            code: true,
            name: true
          }
        }
      }
    });

    // Update student GPA
    await updateStudentGPA(studentId);
    
    // Update module GPA if moduleId provided
    if (moduleId) {
      await updateModuleGPA(moduleId);
    }

    return NextResponse.json({ 
      message: 'Grade added successfully',
      grade: newGrade 
    });
  } catch (error) {
    console.error('Grade create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      id,
      grade, 
      creditHours, 
      examType,
      examDate,
      comments
    } = body;

    // Convert grade to grade points
    const gradePoints = convertGradeToPoints(grade);

    const existingGrade = await prisma.grade.findUnique({
      where: { id },
      select: { studentId: true, moduleId: true }
    });

    if (!existingGrade) {
      return NextResponse.json({ error: 'Grade not found' }, { status: 404 });
    }

    const updatedGrade = await prisma.grade.update({
      where: { id },
      data: {
        grade,
        gradePoints,
        creditHours,
        examType,
        examDate: examDate ? new Date(examDate) : null,
        comments
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            studentId: true
          }
        },
        subject: {
          select: {
            code: true,
            name: true
          }
        }
      }
    });

    // Update student GPA
    await updateStudentGPA(existingGrade.studentId);
    
    // Update module GPA if moduleId exists
    if (existingGrade.moduleId) {
      await updateModuleGPA(existingGrade.moduleId);
    }

    return NextResponse.json({ 
      message: 'Grade updated successfully',
      grade: updatedGrade 
    });
  } catch (error) {
    console.error('Grade update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Grade ID is required' }, { status: 400 });
    }

    const existingGrade = await prisma.grade.findUnique({
      where: { id },
      select: { studentId: true, moduleId: true }
    });

    if (!existingGrade) {
      return NextResponse.json({ error: 'Grade not found' }, { status: 404 });
    }

    await prisma.grade.delete({
      where: { id }
    });

    // Update student GPA
    await updateStudentGPA(existingGrade.studentId);
    
    // Update module GPA if moduleId exists
    if (existingGrade.moduleId) {
      await updateModuleGPA(existingGrade.moduleId);
    }

    return NextResponse.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Grade delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function convertGradeToPoints(grade: string): number {
  const gradeMap: { [key: string]: number } = {
    'A+': 4.0,
    'A': 3.7,
    'A-': 3.3,
    'B+': 3.0,
    'B': 2.7,
    'B-': 2.3,
    'C+': 2.0,
    'C': 1.7,
    'C-': 1.3,
    'D+': 1.0,
    'D': 0.7,
    'F': 0.0
  };
  
  return gradeMap[grade] || 0.0;
}

async function updateStudentGPA(studentId: string) {
  const grades = await prisma.grade.findMany({
    where: { studentId },
    select: {
      gradePoints: true,
      creditHours: true
    }
  });

  if (grades.length === 0) {
    await prisma.student.update({
      where: { id: studentId },
      data: { currentGPA: 0.0, creditHours: 0 }
    });
    return;
  }

  let totalQualityPoints = 0;
  let totalCreditHours = 0;

  grades.forEach(grade => {
    totalQualityPoints += grade.gradePoints * grade.creditHours;
    totalCreditHours += grade.creditHours;
  });

  const gpa = totalCreditHours > 0 ? totalQualityPoints / totalCreditHours : 0.0;

  await prisma.student.update({
    where: { id: studentId },
    data: { 
      currentGPA: Math.round(gpa * 100) / 100, // Round to 2 decimal places
      creditHours: totalCreditHours 
    }
  });
}

async function updateModuleGPA(moduleId: string) {
  const grades = await prisma.grade.findMany({
    where: { moduleId },
    select: {
      gradePoints: true,
      creditHours: true
    }
  });

  if (grades.length === 0) {
    await prisma.module.update({
      where: { id: moduleId },
      data: { averageGPA: 0.0, totalCredits: 0 }
    });
    return;
  }

  let totalQualityPoints = 0;
  let totalCreditHours = 0;

  grades.forEach(grade => {
    totalQualityPoints += grade.gradePoints * grade.creditHours;
    totalCreditHours += grade.creditHours;
  });

  const gpa = totalCreditHours > 0 ? totalQualityPoints / totalCreditHours : 0.0;

  await prisma.module.update({
    where: { id: moduleId },
    data: { 
      averageGPA: Math.round(gpa * 100) / 100, // Round to 2 decimal places
      totalCredits: totalCreditHours 
    }
  });
}
