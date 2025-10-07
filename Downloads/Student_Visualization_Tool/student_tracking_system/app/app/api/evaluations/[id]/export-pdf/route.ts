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

    const evaluationId = params.id;

    // Fetch evaluation with all related data
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: {
        submission: {
          include: {
            assignment: {
              select: {
                title: true,
                type: true
              }
            },
            student: {
              select: {
                fullName: true,
                studentId: true,
                email: true
              }
            }
          }
        },
        rubric: {
          select: {
            title: true
          }
        }
      }
    });

    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }

    // Return structured data for PDF generation
    return NextResponse.json({
      evaluation: {
        assignmentTitle: evaluation.submission.assignment.title,
        submittedAt: evaluation.submission.submittedAt,
        score: evaluation.totalScore,
        maxScore: evaluation.maxScore,
        percentage: evaluation.percentage,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths || undefined,
        improvements: evaluation.improvements || undefined,
        criteriaScores: evaluation.criteriaScores as Record<string, any>
      },
      studentInfo: {
        fullName: evaluation.submission.student.fullName,
        studentId: evaluation.submission.student.studentId,
        email: evaluation.submission.student.email
      }
    });

  } catch (error) {
    console.error('[Export Evaluation PDF] Error:', error);
    return NextResponse.json({
      error: 'Failed to fetch evaluation data for export'
    }, { status: 500 });
  }
}
