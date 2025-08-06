import { NextRequest, NextResponse } from 'next/server';
export const dynamic = "force-dynamic";
export const runtime = 'nodejs';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { autoEnrollStudentSkills } from '@/scripts/seed-skills-mapping';

const prisma = new PrismaClient();

// Enroll student in subject (with automatic skill enrollment)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or lecturer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'LECTURER')) {
      return NextResponse.json({ 
        error: 'Only administrators and lecturers can enroll students' 
      }, { status: 403 });
    }

    const { studentId, subjectId, action = 'enroll' } = await request.json();

    if (!studentId || !subjectId) {
      return NextResponse.json({ 
        error: 'Student ID and Subject ID are required' 
      }, { status: 400 });
    }

    // Verify student exists and is a student
    const student = await prisma.user.findUnique({
      where: { id: studentId }
    });

    if (!student || student.role !== 'STUDENT') {
      return NextResponse.json({ 
        error: 'Invalid student ID or user is not a student' 
      }, { status: 400 });
    }

    // Verify subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(subjectId) },
      include: {
        skills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                difficultyLevel: true,
                estimatedTimeMinutes: true
              }
            }
          }
        }
      }
    });

    if (!subject) {
      return NextResponse.json({ 
        error: 'Subject not found' 
      }, { status: 404 });
    }

    if (action === 'enroll') {
      // Check if already enrolled
      const existingEnrollment = await prisma.userSubject.findUnique({
        where: {
          userId_subjectId: {
            userId: studentId,
            subjectId: parseInt(subjectId)
          }
        }
      });

      if (existingEnrollment && existingEnrollment.isActive) {
        return NextResponse.json({ 
          error: 'Student is already enrolled in this subject' 
        }, { status: 409 });
      }

      // Create or reactivate enrollment
      const enrollment = await prisma.userSubject.upsert({
        where: {
          userId_subjectId: {
            userId: studentId,
            subjectId: parseInt(subjectId)
          }
        },
        update: {
          isActive: true,
          enrolledAt: new Date()
        },
        create: {
          userId: studentId,
          subjectId: parseInt(subjectId),
          isActive: true,
          enrolledAt: new Date()
        }
      });

      // Auto-enroll student in all skills for this subject
      const skillEnrollmentResult = await autoEnrollStudentSkills(studentId, parseInt(subjectId));

      // Create notification for student
      await prisma.notification.create({
        data: {
          userId: studentId,
          type: 'PROGRESS_UPDATE',
          title: 'Subject Enrollment Successful',
          message: `You have been enrolled in ${subject.name}. You now have access to ${skillEnrollmentResult.skillsEnrolled} skills.`,
          relatedData: { 
            subjectId: parseInt(subjectId),
            subjectName: subject.name,
            skillsCount: skillEnrollmentResult.skillsEnrolled,
            enrolledBy: user.name
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Student enrolled successfully',
        enrollment: {
          ...enrollment,
          subject: {
            id: subject.id,
            code: subject.code,
            name: subject.name,
            level: subject.level
          },
          skillsEnrolled: skillEnrollmentResult.skillsEnrolled,
          skills: subject.skills.map(ss => ss.skill)
        }
      });

    } else if (action === 'unenroll') {
      // Deactivate enrollment (don't delete to preserve history)
      const enrollment = await prisma.userSubject.update({
        where: {
          userId_subjectId: {
            userId: studentId,
            subjectId: parseInt(subjectId)
          }
        },
        data: {
          isActive: false
        }
      });

      // Note: We don't remove skill progress as it represents student's work
      // But we could mark skills as inactive or restrict access

      // Create notification for student
      await prisma.notification.create({
        data: {
          userId: studentId,
          type: 'SYSTEM_MESSAGE',
          title: 'Subject Unenrollment',
          message: `You have been unenrolled from ${subject.name}. Your progress has been preserved.`,
          relatedData: { 
            subjectId: parseInt(subjectId),
            subjectName: subject.name,
            unenrolledBy: user.name
          }
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Student unenrolled successfully',
        enrollment
      });

    } else {
      return NextResponse.json({ 
        error: 'Invalid action. Use "enroll" or "unenroll"' 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error managing subject enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to manage enrollment' },
      { status: 500 }
    );
  }
}

// Get enrollment information
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or lecturer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'LECTURER')) {
      return NextResponse.json({ 
        error: 'Only administrators and lecturers can view enrollments' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const subjectId = searchParams.get('subjectId');

    if (studentId && subjectId) {
      // Get specific enrollment
      const enrollment = await prisma.userSubject.findUnique({
        where: {
          userId_subjectId: {
            userId: studentId,
            subjectId: parseInt(subjectId)
          }
        },
        include: {
          subject: {
            include: {
              skills: {
                include: {
                  skill: {
                    include: {
                      category: true
                    }
                  }
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              studentId: true
            }
          }
        }
      });

      if (!enrollment) {
        return NextResponse.json({ 
          error: 'Enrollment not found' 
        }, { status: 404 });
      }

      // Get student's progress for subject skills
      const skillProgress = await prisma.studentProgress.findMany({
        where: {
          userId: studentId,
          skillId: {
            in: enrollment.subject.skills.map(ss => ss.skillId)
          }
        },
        include: {
          skill: {
            select: {
              id: true,
              name: true,
              difficultyLevel: true
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        enrollment: {
          ...enrollment,
          skillProgress
        }
      });

    } else if (studentId) {
      // Get all enrollments for a student
      const enrollments = await prisma.userSubject.findMany({
        where: { 
          userId: studentId,
          isActive: true
        },
        include: {
          subject: {
            include: {
              _count: {
                select: {
                  skills: true
                }
              }
            }
          }
        },
        orderBy: {
          enrolledAt: 'desc'
        }
      });

      return NextResponse.json({
        success: true,
        enrollments
      });

    } else if (subjectId) {
      // Get all students enrolled in a subject
      const enrollments = await prisma.userSubject.findMany({
        where: { 
          subjectId: parseInt(subjectId),
          isActive: true
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              studentId: true
            }
          }
        },
        orderBy: {
          enrolledAt: 'desc'
        }
      });

      return NextResponse.json({
        success: true,
        enrollments
      });

    } else {
      // Get all active enrollments (admin overview)
      const enrollments = await prisma.userSubject.findMany({
        where: { isActive: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              studentId: true
            }
          },
          subject: {
            select: {
              id: true,
              code: true,
              name: true,
              level: true
            }
          }
        },
        orderBy: {
          enrolledAt: 'desc'
        },
        take: 50 // Limit for performance
      });

      return NextResponse.json({
        success: true,
        enrollments
      });
    }

  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

// Bulk enrollment operations
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Only administrators can perform bulk operations' 
      }, { status: 403 });
    }

    const { operation, studentIds, subjectIds } = await request.json();

    if (!operation || !studentIds || !subjectIds) {
      return NextResponse.json({ 
        error: 'Operation, student IDs, and subject IDs are required' 
      }, { status: 400 });
    }

    const results = [];

    if (operation === 'bulk_enroll') {
      for (const studentId of studentIds) {
        for (const subjectId of subjectIds) {
          try {
            // Create enrollment
            const enrollment = await prisma.userSubject.upsert({
              where: {
                userId_subjectId: {
                  userId: studentId,
                  subjectId: parseInt(subjectId)
                }
              },
              update: {
                isActive: true,
                enrolledAt: new Date()
              },
              create: {
                userId: studentId,
                subjectId: parseInt(subjectId),
                isActive: true,
                enrolledAt: new Date()
              }
            });

            // Auto-enroll in skills
            const skillResult = await autoEnrollStudentSkills(studentId, parseInt(subjectId));

            results.push({
              studentId,
              subjectId,
              success: true,
              skillsEnrolled: skillResult.skillsEnrolled
            });

          } catch (error) {
            results.push({
              studentId,
              subjectId,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk ${operation} completed`,
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });

  } catch (error) {
    console.error('Error in bulk enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
