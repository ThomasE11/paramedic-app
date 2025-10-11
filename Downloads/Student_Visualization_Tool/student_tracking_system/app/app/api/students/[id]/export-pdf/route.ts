import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = params.id;

    // Fetch comprehensive student data
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        module: {
          select: {
            name: true,
            code: true
          }
        },
        submissions: {
          include: {
            assignment: {
              select: {
                title: true,
                type: true
              }
            },
            evaluations: {
              include: {
                rubric: {
                  select: {
                    title: true
                  }
                }
              }
            }
          },
          orderBy: {
            submittedAt: 'desc'
          }
        },
        notes: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        attendance: {
          include: {
            classSession: {
              select: {
                title: true,
                date: true
              }
            }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Calculate attendance stats
    const totalClasses = student.attendance.length;
    const presentCount = student.attendance.filter(a => a.status === 'present').length;
    const absentCount = totalClasses - presentCount;
    const attendancePercentage = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 0;

    // Transform evaluations data
    const evaluations = student.submissions
      .filter(sub => sub.evaluations.length > 0)
      .map(sub => {
        const evaluation = sub.evaluations[0]; // Get latest evaluation
        return {
          assignmentTitle: sub.assignment.title,
          submittedAt: sub.submittedAt,
          score: evaluation.totalScore,
          maxScore: evaluation.maxScore,
          percentage: evaluation.percentage,
          feedback: evaluation.feedback,
          strengths: evaluation.strengths || undefined,
          improvements: evaluation.improvements || undefined,
          criteriaScores: evaluation.criteriaScores as Record<string, any>
        };
      });

    // Transform notes data
    const notes = student.notes.map(note => ({
      title: note.title,
      content: note.content,
      category: note.category,
      createdAt: note.createdAt,
      createdBy: note.user.name || note.user.email
    }));

    // Return structured data for PDF generation on client
    return NextResponse.json({
      student: {
        fullName: student.fullName,
        studentId: student.studentId,
        email: student.email,
        module: student.module
      },
      evaluations,
      notes,
      attendance: {
        total: totalClasses,
        present: presentCount,
        absent: absentCount,
        percentage: attendancePercentage
      }
    });

  } catch (error) {
    console.error('[Export PDF] Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch student data for export'
    }, { status: 500 });
  }
}
