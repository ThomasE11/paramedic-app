import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface EvaluationCriteria {
  name: string;
  description: string;
  maxPoints: number;
  weight: number;
  levels: {
    level: string;
    description: string;
    points: number;
  }[];
}

interface RubricCriteria {
  criteria: EvaluationCriteria[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { submissionId, rubricId } = body;

    if (!submissionId || !rubricId) {
      return NextResponse.json({
        error: 'Submission ID and Rubric ID are required'
      }, { status: 400 });
    }

    // Fetch submission with all related data
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            module: true
          }
        },
        student: {
          include: {
            module: true,
            submissions: {
              include: {
                evaluations: true
              },
              orderBy: { submittedAt: 'desc' },
              take: 5 // Get last 5 submissions for context
            }
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json({
        error: 'Submission not found'
      }, { status: 404 });
    }

    // Fetch rubric
    const rubric = await prisma.rubric.findUnique({
      where: { id: rubricId }
    });

    if (!rubric) {
      return NextResponse.json({
        error: 'Rubric not found'
      }, { status: 404 });
    }

    // Check if evaluation already exists
    const existingEvaluation = await prisma.evaluation.findFirst({
      where: {
        submissionId,
        rubricId
      }
    });

    if (existingEvaluation) {
      return NextResponse.json({
        error: 'Evaluation already exists for this submission'
      }, { status: 409 });
    }

    const startTime = Date.now();

    // Prepare AI evaluation prompt
    const rubricCriteria = rubric.criteria as RubricCriteria;
    const studentHistory = submission.student.submissions
      .filter(s => s.id !== submissionId)
      .map(s => ({
        assignment: s.assignment,
        evaluations: s.evaluations
      }));

    const evaluationPrompt = `
You are an expert academic evaluator for ${submission.assignment.module?.name} (${submission.assignment.module?.code}).
You will evaluate a student's ${submission.assignment.type} submission against the provided rubric.

STUDENT CONTEXT:
- Name: ${submission.student.fullName}
- Student ID: ${submission.student.studentId}
- Module: ${submission.assignment.module?.name}
- Assignment: ${submission.assignment.title}

STUDENT HISTORY (for context and tracking improvement):
${studentHistory.map(h => `
Previous submission evaluations and scores to track progress and improvement patterns.
`).join('\n')}

RUBRIC CRITERIA:
${JSON.stringify(rubricCriteria.criteria, null, 2)}

SUBMISSION CONTENT:
${submission.extractedText || 'No text content available'}

EVALUATION INSTRUCTIONS:
1. Evaluate the submission against each criterion in the rubric
2. For each criterion, determine the appropriate level and assign points
3. Provide specific, constructive feedback
4. Identify strengths and areas for improvement
5. Compare with student's previous work if available to note progress
6. Suggest specific actions for improvement

RESPONSE FORMAT (JSON):
{
  "scores": {
    "criterionName1": {
      "points": number,
      "level": "string",
      "justification": "detailed explanation"
    },
    "criterionName2": {
      "points": number,
      "level": "string",
      "justification": "detailed explanation"
    }
  },
  "totalScore": number,
  "feedback": "Overall constructive feedback",
  "strengths": "Specific strengths identified",
  "improvements": "Specific areas for improvement",
  "suggestions": "Actionable suggestions for future work",
  "progressNotes": "Notes on student's progress compared to previous submissions",
  "confidence": number (0-1)
}

Be thorough, fair, and constructive in your evaluation. Focus on helping the student learn and improve.
`;

    try {
      if (!DEEPSEEK_API_KEY) {
        throw new Error('DeepSeek API key not configured');
      }

      const aiResponse = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: "system",
              content: "You are an expert academic evaluator. Provide detailed, constructive, and fair evaluations following the exact JSON format requested."
            },
            {
              role: "user",
              content: evaluationPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!aiResponse.ok) {
        throw new Error(`DeepSeek API error: ${aiResponse.statusText}`);
      }

      const aiData = await aiResponse.json();

      // Clean markdown code blocks from response
      let responseContent = aiData.choices[0].message.content || '{}';
      responseContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const evaluationResult = JSON.parse(responseContent);
      const processingTime = Date.now() - startTime;

      // Calculate maxScore from rubric criteria
      const maxScore = rubricCriteria.criteria.reduce((sum, c) => sum + c.maxPoints, 0);
      const safePercentage = maxScore > 0 ? (evaluationResult.totalScore / maxScore) * 100 : 0;

      console.log('[Evaluate] AI Response parsed successfully:', {
        totalScore: evaluationResult.totalScore,
        maxScore: maxScore,
        criteriaCount: Object.keys(evaluationResult.scores || {}).length
      });

      // Create evaluation record
      const evaluation = await prisma.evaluation.create({
        data: {
          submissionId,
          rubricId,
          totalScore: evaluationResult.totalScore,
          maxScore: maxScore,
          percentage: safePercentage,
          feedback: evaluationResult.feedback,
          criteriaScores: evaluationResult.scores,
          strengths: evaluationResult.strengths,
          improvements: evaluationResult.improvements,
          evaluatedBy: 'ai'
        },
        include: {
          submission: {
            include: {
              student: true,
              assignment: true
            }
          },
          rubric: true
        }
      });

      // Update submission status
      await prisma.submission.update({
        where: { id: submissionId },
        data: { status: 'evaluated' }
      });

      // Create note on student's account
      await prisma.note.create({
        data: {
          studentId: submission.studentId,
          userId: session.user.id,
          title: `AI Evaluation: ${submission.assignment.title}`,
          content: `Score: ${evaluationResult.totalScore}/${maxScore}

Strengths: ${evaluationResult.strengths}

Areas for Improvement: ${evaluationResult.improvements}

Suggestions: ${evaluationResult.suggestions}`,
          category: 'academic'
        }
      });

      // Log activity for submission evaluation
      await prisma.activity.create({
        data: {
          studentId: submission.studentId,
          type: 'submission_evaluated',
          description: `Received ${evaluationResult.totalScore}/${maxScore} (${evaluation.percentage.toFixed(1)}%) on ${submission.assignment.title}`,
          metadata: {
            assignmentId: submission.assignmentId,
            assignmentTitle: submission.assignment.title,
            submissionId: submission.id,
            evaluationId: evaluation.id,
            score: evaluationResult.totalScore,
            maxScore: maxScore,
            percentage: evaluation.percentage,
            strengths: evaluationResult.strengths,
            improvements: evaluationResult.improvements,
            evaluatedBy: 'ai'
          }
        }
      });

      // Update student progress
      await updateStudentProgress(submission.studentId, submission.assignment.moduleId, submission.assignmentId, evaluationResult.totalScore);

      return NextResponse.json({
        evaluation,
        success: true,
        message: 'Evaluation completed successfully'
      });

    } catch (aiError) {
      console.error('AI evaluation error:', aiError);

      // Calculate maxScore from rubric criteria for fallback
      const maxScore = rubricCriteria.criteria.reduce((sum, c) => sum + c.maxPoints, 0);

      // Create a fallback evaluation
      const evaluation = await prisma.evaluation.create({
        data: {
          submissionId,
          rubricId,
          criteriaScores: {},
          totalScore: 0,
          maxScore: maxScore > 0 ? maxScore : 100,
          percentage: 0,
          feedback: 'AI evaluation failed. Manual review required.',
          evaluatedBy: 'ai'
        }
      });

      return NextResponse.json({
        evaluation,
        success: false,
        message: 'AI evaluation failed, manual review required'
      });
    }

  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json({
      error: 'Failed to evaluate submission'
    }, { status: 500 });
  }
}

async function updateStudentProgress(studentId: string, moduleId: string | null, assignmentId: string, score: number) {
  try {
    if (!moduleId) {
      console.warn('No moduleId provided for progress tracking');
      return;
    }

    // This function can be implemented later when StudentProgress model is added
    console.log(`Progress tracking for student ${studentId}, module ${moduleId}, assignment ${assignmentId}, score: ${score}`);
  } catch (error) {
    console.error('Failed to update student progress:', error);
  }
}