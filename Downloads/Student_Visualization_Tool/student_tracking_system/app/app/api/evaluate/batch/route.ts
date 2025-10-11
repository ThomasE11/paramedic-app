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

interface EvaluationResult {
  submissionId: string;
  studentId: string;
  studentName: string;
  success: boolean;
  evaluation?: any;
  error?: string;
  processingTime?: number;
}

/**
 * Batch evaluation endpoint - processes multiple submissions sequentially with isolated context
 * Each submission gets its own AI context to prevent cross-contamination
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { submissionIds, rubricId } = body;

    if (!submissionIds || !Array.isArray(submissionIds) || submissionIds.length === 0) {
      return NextResponse.json({
        error: 'Submission IDs array is required'
      }, { status: 400 });
    }

    if (!rubricId) {
      return NextResponse.json({
        error: 'Rubric ID is required'
      }, { status: 400 });
    }

    // Limit batch size to prevent timeouts and ensure quality
    if (submissionIds.length > 20) {
      return NextResponse.json({
        error: 'Maximum 20 submissions allowed per batch'
      }, { status: 400 });
    }

    // Fetch rubric once (shared across all evaluations)
    const rubric = await prisma.rubric.findUnique({
      where: { id: rubricId }
    });

    if (!rubric) {
      return NextResponse.json({
        error: 'Rubric not found'
      }, { status: 404 });
    }

    // Handle both rubric structures: { criteria: [] } or { categories: [] }
    const rubricCriteria = rubric.criteria as any;
    const criteriaArray = rubricCriteria.criteria || rubricCriteria.categories || [];
    const maxScore = criteriaArray.reduce((sum: number, c: any) => sum + (c.maxPoints || c.maxScore || c.weight || 0), 0);

    console.log('[Batch Evaluate] Rubric criteria count:', criteriaArray.length);
    console.log('[Batch Evaluate] Max score:', maxScore);

    const results: EvaluationResult[] = [];
    const batchStartTime = Date.now();

    // Process each submission sequentially to maintain isolated context
    for (const submissionId of submissionIds) {
      const submissionStartTime = Date.now();

      try {
        // Fetch submission with ISOLATED context (only this student's data)
        const submission = await prisma.submission.findUnique({
          where: { id: submissionId },
          include: {
            assignment: {
              include: {
                module: true
              }
            },
            student: {
              select: {
                id: true,
                studentId: true,
                fullName: true,
                module: true,
                submissions: {
                  where: {
                    id: { not: submissionId }
                  },
                  include: {
                    evaluations: {
                      select: {
                        totalScore: true,
                        maxScore: true,
                        percentage: true,
                        createdAt: true
                      }
                    }
                  },
                  orderBy: { submittedAt: 'desc' },
                  take: 3 // Only last 3 for context efficiency
                }
              }
            }
          }
        });

        if (!submission) {
          results.push({
            submissionId,
            studentId: 'unknown',
            studentName: 'unknown',
            success: false,
            error: 'Submission not found'
          });
          continue;
        }

        // Check if evaluation already exists
        const existingEvaluation = await prisma.evaluation.findFirst({
          where: {
            submissionId,
            rubricId
          }
        });

        if (existingEvaluation) {
          results.push({
            submissionId,
            studentId: submission.student.studentId,
            studentName: submission.student.fullName,
            success: false,
            error: 'Evaluation already exists'
          });
          continue;
        }

        // Build ISOLATED evaluation prompt for this specific student
        const evaluationPrompt = `
You are an expert academic evaluator for ${submission.assignment.module?.name} (${submission.assignment.module?.code}).
You will evaluate ONE SPECIFIC STUDENT's ${submission.assignment.type} submission against the provided rubric.

IMPORTANT: This is an independent evaluation. Do not compare with other students. Focus only on this student's work.

STUDENT CONTEXT:
- Name: ${submission.student.fullName}
- Student ID: ${submission.student.studentId}
- Module: ${submission.assignment.module?.name}
- Assignment: ${submission.assignment.title}

STUDENT'S PREVIOUS PERFORMANCE (for tracking individual improvement):
${submission.student.submissions.length > 0
  ? submission.student.submissions.map((s: any) =>
    `Previous assignment: Scored ${s.evaluations[0]?.percentage?.toFixed(1) || 'N/A'}%`
  ).join('\n')
  : 'No previous submissions'}

RUBRIC CRITERIA:
${JSON.stringify(criteriaArray, null, 2)}

SUBMISSION CONTENT:
${submission.extractedText || 'No text content available'}

CRITICAL EVALUATION INSTRUCTIONS:
You must be STRICT and LITERAL in applying the rubric. Do NOT make assumptions or be generous.

1. LITERAL INTERPRETATION: Each rubric criterion lists specific required elements
   - ALL elements must be explicitly present in the submission to award full marks
   - DO NOT assume elements are "implied" - they must be explicitly documented
   - DO NOT give credit for partial or implied completion

2. EVIDENCE-BASED SCORING:
   - Quote specific text from the submission to justify scores
   - If an element is not explicitly documented, it is MISSING
   - Count missing/incomplete elements accurately

3. LEVEL SELECTION:
   - Read each level's description carefully
   - Match the submission to the MOST ACCURATE level (not the highest possible)
   - Best Practice (highest score) requires ALL elements complete and excellent
   - If ANY required element is missing, incomplete, or poor quality → lower level

4. SPECIFIC RUBRIC REQUIREMENTS:
   ${submission.assignment.type === 'skill_assessment' ? `
   For PCR/Skill Assessments:
   - "998 call details/code" means explicit call code must be documented (e.g., "Code 3 Cardiac")
   - "Annotated silhouette" requires a visual body diagram with markings (not just text description)
   - "Body systems review" requires systematic documentation of multiple systems (CVS, Resp, Neuro, etc.)
   - "Rationale for treatments" means explicit explanation for decisions (not just listing interventions)
   - "Reassessment" requires documented post-intervention changes with specific values
   ` : ''}

5. INDEPENDENCE: Evaluate ONLY this student's work
   - Do not compare with other students
   - Compare only with this student's own previous work (if available)

6. QUALITY STANDARDS:
   - Identify strengths and areas for improvement objectively
   - Suggest specific, actionable improvements
   - Be constructive but rigorous

7. CONFIDENCE RATING:
   - Rate your confidence in the evaluation (0-1)
   - Lower confidence if submission is unclear, incomplete, or hard to assess

RESPONSE FORMAT (JSON ONLY - NO MARKDOWN):
{
  "scores": {
    "criterionName1": {
      "points": number,
      "level": "string",
      "justification": "detailed explanation with specific quotes/evidence",
      "missingElements": ["list any missing required elements"],
      "evidence": "specific text from submission that supports this score"
    }
  },
  "totalScore": number,
  "feedback": "Overall constructive feedback",
  "strengths": "Specific strengths identified with evidence",
  "improvements": "Specific areas for improvement with actionable steps",
  "suggestions": "Actionable suggestions for future work",
  "progressNotes": "Notes on this student's individual progress",
  "confidence": number (0-1)
}

Remember: Be STRICT, LITERAL, and EVIDENCE-BASED. Do not be generous or assume implied content.
`;

        // Call AI API with ISOLATED context
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
                content: "You are an expert academic evaluator. Provide detailed, constructive, and fair evaluations. Return ONLY valid JSON without markdown formatting."
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
        const safePercentage = maxScore > 0 ? (evaluationResult.totalScore / maxScore) * 100 : 0;

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
            content: `Score: ${evaluationResult.totalScore}/${maxScore} (${safePercentage.toFixed(1)}%)

Strengths: ${evaluationResult.strengths}

Areas for Improvement: ${evaluationResult.improvements}

Suggestions: ${evaluationResult.suggestions}`,
            category: 'academic'
          }
        });

        // Log activity
        await prisma.activity.create({
          data: {
            studentId: submission.studentId,
            type: 'submission_evaluated',
            description: `Received ${evaluationResult.totalScore}/${maxScore} (${safePercentage.toFixed(1)}%) on ${submission.assignment.title}`,
            metadata: {
              assignmentId: submission.assignmentId,
              assignmentTitle: submission.assignment.title,
              submissionId: submission.id,
              evaluationId: evaluation.id,
              score: evaluationResult.totalScore,
              maxScore: maxScore,
              percentage: safePercentage,
              evaluatedBy: 'ai-batch'
            }
          }
        });

        const processingTime = Date.now() - submissionStartTime;

        results.push({
          submissionId,
          studentId: submission.student.studentId,
          studentName: submission.student.fullName,
          success: true,
          evaluation: {
            id: evaluation.id,
            totalScore: evaluationResult.totalScore,
            maxScore: maxScore,
            percentage: safePercentage
          },
          processingTime
        });

      } catch (error: any) {
        console.error(`Evaluation failed for submission ${submissionId}:`, error);

        results.push({
          submissionId,
          studentId: 'error',
          studentName: 'error',
          success: false,
          error: error.message || 'Unknown error occurred'
        });
      }

      // Small delay between evaluations to respect API rate limits
      if (submissionIds.indexOf(submissionId) < submissionIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const totalTime = Date.now() - batchStartTime;
    const summary = {
      total: submissionIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalTime,
      averageTime: Math.round(totalTime / submissionIds.length)
    };

    return NextResponse.json({
      success: true,
      summary,
      results,
      message: `Batch evaluation completed: ${summary.successful} successful, ${summary.failed} failed`
    });

  } catch (error) {
    console.error('Batch evaluation error:', error);
    return NextResponse.json({
      error: 'Failed to process batch evaluation'
    }, { status: 500 });
  }
}
