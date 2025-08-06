import { NextRequest, NextResponse } from 'next/server';
export const dynamic = "force-dynamic";
export const runtime = 'nodejs';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get subject-skill mappings
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
        error: 'Only administrators and lecturers can view subject-skill mappings' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const skillId = searchParams.get('skillId');
    const includeStats = searchParams.get('includeStats') === 'true';

    if (subjectId && skillId) {
      // Get specific mapping
      const mapping = await prisma.subjectSkill.findUnique({
        where: {
          subjectId_skillId: {
            subjectId: parseInt(subjectId),
            skillId: parseInt(skillId)
          }
        },
        include: {
          subject: true,
          skill: {
            include: {
              category: true,
              steps: true
            }
          }
        }
      });

      if (!mapping) {
        return NextResponse.json({ 
          error: 'Subject-skill mapping not found' 
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        mapping
      });

    } else if (subjectId) {
      // Get all skills for a subject
      const subject = await prisma.subject.findUnique({
        where: { id: parseInt(subjectId) },
        include: {
          skills: {
            include: {
              skill: {
                include: {
                  category: true,
                  steps: true,
                  ...(includeStats && {
                    progress: {
                      select: {
                        status: true,
                        totalAttempts: true,
                        totalTimeSpentMinutes: true
                      }
                    },
                    masteryRequests: {
                      select: {
                        status: true
                      }
                    }
                  })
                }
              }
            }
          },
          ...(includeStats && {
            users: {
              where: { isActive: true },
              select: { userId: true }
            }
          })
        }
      });

      if (!subject) {
        return NextResponse.json({ 
          error: 'Subject not found' 
        }, { status: 404 });
      }

      let stats = null;
      if (includeStats) {
        const enrolledStudentCount = subject.users?.length || 0;
        stats = {
          enrolledStudents: enrolledStudentCount,
          totalSkills: subject.skills.length,
          coreSkills: subject.skills.filter(ss => ss.isCore).length,
          skillsByDifficulty: {
            BEGINNER: subject.skills.filter(ss => ss.skill.difficultyLevel === 'BEGINNER').length,
            INTERMEDIATE: subject.skills.filter(ss => ss.skill.difficulty === 'INTERMEDIATE').length,
            ADVANCED: subject.skills.filter(ss => ss.skill.difficultyLevel === 'ADVANCED').length
          }
        };
      }

      return NextResponse.json({
        success: true,
        subject: {
          ...subject,
          stats
        }
      });

    } else if (skillId) {
      // Get all subjects for a skill
      const skill = await prisma.skill.findUnique({
        where: { id: parseInt(skillId) },
        include: {
          subjects: {
            include: {
              subject: true
            }
          },
          category: true,
          steps: true,
          ...(includeStats && {
            progress: {
              select: {
                status: true,
                totalAttempts: true,
                totalTimeSpentMinutes: true
              }
            },
            masteryRequests: {
              select: {
                status: true
              }
            }
          })
        }
      });

      if (!skill) {
        return NextResponse.json({ 
          error: 'Skill not found' 
        }, { status: 404 });
      }

      let stats = null;
      if (includeStats) {
        stats = {
          totalSubjects: skill.subjects.length,
          totalStudentsWithAccess: await prisma.userSubject.count({
            where: {
              subjectId: {
                in: skill.subjects.map(ss => ss.subjectId)
              },
              isActive: true
            }
          }),
          totalAttempts: skill.progress?.reduce((sum, p) => sum + p.totalAttempts, 0) || 0,
          totalPracticeTime: skill.progress?.reduce((sum, p) => sum + p.totalTimeSpentMinutes, 0) || 0,
          masteryRequests: {
            pending: skill.masteryRequests?.filter(mr => mr.status === 'PENDING').length || 0,
            approved: skill.masteryRequests?.filter(mr => mr.status === 'APPROVED').length || 0,
            rejected: skill.masteryRequests?.filter(mr => mr.status === 'REJECTED').length || 0
          }
        };
      }

      return NextResponse.json({
        success: true,
        skill: {
          ...skill,
          stats
        }
      });

    } else {
      // Get all mappings overview
      const mappings = await prisma.subjectSkill.findMany({
        include: {
          subject: {
            select: {
              id: true,
              code: true,
              name: true,
              level: true
            }
          },
          skill: {
            select: {
              id: true,
              name: true,
              difficultyLevel: true,
              isCritical: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  colorCode: true
                }
              }
            }
          }
        },
        orderBy: [
          { subject: { level: 'asc' } },
          { subject: { code: 'asc' } },
          { skill: { name: 'asc' } }
        ]
      });

      // Group by subject for easier handling
      const mappingsBySubject = mappings.reduce((acc, mapping) => {
        const subjectKey = mapping.subjectId;
        if (!acc[subjectKey]) {
          acc[subjectKey] = {
            subject: mapping.subject,
            skills: []
          };
        }
        acc[subjectKey].skills.push({
          ...mapping.skill,
          isCore: mapping.isCore,
          mappingId: mapping.id
        });
        return acc;
      }, {} as any);

      return NextResponse.json({
        success: true,
        mappings: Object.values(mappingsBySubject),
        summary: {
          totalMappings: mappings.length,
          totalSubjects: Object.keys(mappingsBySubject).length,
          totalUniqueSkills: new Set(mappings.map(m => m.skillId)).size
        }
      });
    }

  } catch (error) {
    console.error('Error fetching subject-skill mappings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mappings' },
      { status: 500 }
    );
  }
}

// Create or update subject-skill mapping
export async function POST(request: NextRequest) {
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
        error: 'Only administrators can create subject-skill mappings' 
      }, { status: 403 });
    }

    const { subjectId, skillId, isCore = true } = await request.json();

    if (!subjectId || !skillId) {
      return NextResponse.json({ 
        error: 'Subject ID and Skill ID are required' 
      }, { status: 400 });
    }

    // Verify subject and skill exist
    const [subject, skill] = await Promise.all([
      prisma.subject.findUnique({ where: { id: parseInt(subjectId) } }),
      prisma.skill.findUnique({ where: { id: parseInt(skillId) } })
    ]);

    if (!subject) {
      return NextResponse.json({ 
        error: 'Subject not found' 
      }, { status: 404 });
    }

    if (!skill) {
      return NextResponse.json({ 
        error: 'Skill not found' 
      }, { status: 404 });
    }

    // Create the mapping
    const mapping = await prisma.subjectSkill.create({
      data: {
        subjectId: parseInt(subjectId),
        skillId: parseInt(skillId),
        isCore: isCore
      },
      include: {
        subject: true,
        skill: {
          include: {
            category: true
          }
        }
      }
    });

    // Auto-enroll all students currently enrolled in this subject
    const enrolledStudents = await prisma.userSubject.findMany({
      where: {
        subjectId: parseInt(subjectId),
        isActive: true
      }
    });

    // Create progress entries for all enrolled students
    const progressEntries = enrolledStudents.map(enrollment => ({
      userId: enrollment.userId,
      skillId: parseInt(skillId),
      status: 'NOT_STARTED' as const,
      totalAttempts: 0,
      completeAttempts: 0,
      incompleteAttempts: 0,
      completedSteps: [],
      totalTimeSpentMinutes: 0,
      completeTimeMinutes: 0,
      incompleteTimeMinutes: 0
    }));

    if (progressEntries.length > 0) {
      await prisma.studentProgress.createMany({
        data: progressEntries,
        skipDuplicates: true // In case some students already have progress for this skill
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Subject-skill mapping created successfully',
      mapping,
      studentsEnrolled: progressEntries.length
    });

  } catch (error) {
    console.error('Error creating subject-skill mapping:', error);
    
    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'This skill is already mapped to this subject' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create mapping' },
      { status: 500 }
    );
  }
}

// Update subject-skill mapping
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
        error: 'Only administrators can update subject-skill mappings' 
      }, { status: 403 });
    }

    const { subjectId, skillId, isCore } = await request.json();

    if (!subjectId || !skillId) {
      return NextResponse.json({ 
        error: 'Subject ID and Skill ID are required' 
      }, { status: 400 });
    }

    // Update the mapping
    const mapping = await prisma.subjectSkill.update({
      where: {
        subjectId_skillId: {
          subjectId: parseInt(subjectId),
          skillId: parseInt(skillId)
        }
      },
      data: {
        isCore: isCore
      },
      include: {
        subject: true,
        skill: {
          include: {
            category: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Subject-skill mapping updated successfully',
      mapping
    });

  } catch (error) {
    console.error('Error updating subject-skill mapping:', error);
    return NextResponse.json(
      { error: 'Failed to update mapping' },
      { status: 500 }
    );
  }
}

// Delete subject-skill mapping
export async function DELETE(request: NextRequest) {
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
        error: 'Only administrators can delete subject-skill mappings' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const skillId = searchParams.get('skillId');

    if (!subjectId || !skillId) {
      return NextResponse.json({ 
        error: 'Subject ID and Skill ID are required' 
      }, { status: 400 });
    }

    // Check if mapping exists
    const existingMapping = await prisma.subjectSkill.findUnique({
      where: {
        subjectId_skillId: {
          subjectId: parseInt(subjectId),
          skillId: parseInt(skillId)
        }
      }
    });

    if (!existingMapping) {
      return NextResponse.json({ 
        error: 'Subject-skill mapping not found' 
      }, { status: 404 });
      }

    // Delete the mapping
    await prisma.subjectSkill.delete({
      where: {
        subjectId_skillId: {
          subjectId: parseInt(subjectId),
          skillId: parseInt(skillId)
        }
      }
    });

    // Note: We don't delete student progress as it represents their work
    // But you might want to mark skills as no longer accessible

    return NextResponse.json({
      success: true,
      message: 'Subject-skill mapping deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting subject-skill mapping:', error);
    return NextResponse.json(
      { error: 'Failed to delete mapping' },
      { status: 500 }
    );
  }
}
