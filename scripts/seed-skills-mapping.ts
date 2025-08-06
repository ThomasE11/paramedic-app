import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface SkillEnrollmentResult {
  skillsEnrolled: number;
  errors: string[];
}

/**
 * Auto-enroll a student in all skills associated with a subject
 * @param studentId - The ID of the student to enroll
 * @param subjectId - The ID of the subject containing the skills
 * @returns Promise with enrollment results
 */
export async function autoEnrollStudentSkills(
  studentId: string, 
  subjectId: number
): Promise<SkillEnrollmentResult> {
  try {
    // Get all skills associated with the subject
    const subjectSkills = await prisma.subjectSkill.findMany({
      where: {
        subjectId: subjectId
      },
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
    });

    if (subjectSkills.length === 0) {
      return {
        skillsEnrolled: 0,
        errors: ['No skills found for this subject']
      };
    }

    const results: SkillEnrollmentResult = {
      skillsEnrolled: 0,
      errors: []
    };

    // Enroll student in each skill
    for (const subjectSkill of subjectSkills) {
      try {
        // Check if student is already enrolled in this skill
        const existingProgress = await prisma.studentProgress.findUnique({
          where: {
            userId_skillId: {
              userId: studentId,
              skillId: subjectSkill.skillId
            }
          }
        });

        if (!existingProgress) {
          // Create new student progress entry for this skill
          await prisma.studentProgress.create({
            data: {
              userId: studentId,
              skillId: subjectSkill.skillId,
              status: 'NOT_STARTED',
              progress: 0,
              timeSpentMinutes: 0,
              startedAt: new Date(),
              isActive: true
            }
          });

          results.skillsEnrolled++;
        }

      } catch (error) {
        const errorMessage = `Failed to enroll in skill ${subjectSkill.skill.name}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        results.errors.push(errorMessage);
        console.error('Skill enrollment error:', error);
      }
    }

    return results;

  } catch (error) {
    console.error('Auto-enrollment error:', error);
    return {
      skillsEnrolled: 0,
      errors: [
        `Failed to auto-enroll student in skills: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      ]
    };
  }
}

/**
 * Remove student enrollment from all skills associated with a subject
 * @param studentId - The ID of the student to unenroll
 * @param subjectId - The ID of the subject containing the skills
 * @returns Promise with unenrollment results
 */
export async function removeStudentFromSubjectSkills(
  studentId: string, 
  subjectId: number
): Promise<SkillEnrollmentResult> {
  try {
    // Get all skills associated with the subject
    const subjectSkills = await prisma.subjectSkill.findMany({
      where: {
        subjectId: subjectId
      },
      select: {
        skillId: true
      }
    });

    if (subjectSkills.length === 0) {
      return {
        skillsEnrolled: 0,
        errors: ['No skills found for this subject']
      };
    }

    const skillIds = subjectSkills.map(ss => ss.skillId);

    // Mark student progress as inactive (preserve data but remove access)
    const updateResult = await prisma.studentProgress.updateMany({
      where: {
        userId: studentId,
        skillId: {
          in: skillIds
        }
      },
      data: {
        isActive: false
      }
    });

    return {
      skillsEnrolled: updateResult.count,
      errors: []
    };

  } catch (error) {
    console.error('Skill unenrollment error:', error);
    return {
      skillsEnrolled: 0,
      errors: [
        `Failed to unenroll student from skills: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      ]
    };
  }
}

/**
 * Get all skills that a student should have access to based on their subject enrollments
 * @param studentId - The ID of the student
 * @returns Promise with list of accessible skills
 */
export async function getStudentAccessibleSkills(studentId: string) {
  try {
    // Get all active subject enrollments for the student
    const subjectEnrollments = await prisma.userSubject.findMany({
      where: {
        userId: studentId,
        isActive: true
      },
      include: {
        subject: {
          include: {
            skills: {
              include: {
                skill: {
                  include: {
                    category: {
                      select: {
                        id: true,
                        name: true,
                        description: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Flatten all skills from all enrolled subjects
    const accessibleSkills = subjectEnrollments.flatMap(enrollment => 
      enrollment.subject.skills.map(subjectSkill => ({
        ...subjectSkill.skill,
        subjectId: enrollment.subjectId,
        subjectName: enrollment.subject.name,
        subjectCode: enrollment.subject.code
      }))
    );

    // Remove duplicates (student might be enrolled in multiple subjects with same skills)
    const uniqueSkills = accessibleSkills.filter((skill, index, self) => 
      index === self.findIndex(s => s.id === skill.id)
    );

    return uniqueSkills;

  } catch (error) {
    console.error('Error fetching accessible skills:', error);
    throw new Error(`Failed to fetch accessible skills: ${
      error instanceof Error ? error.message : 'Unknown error'
    }`);
  }
}
