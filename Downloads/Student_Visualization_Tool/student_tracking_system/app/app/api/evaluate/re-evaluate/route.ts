import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface EvaluationCriteria {
  name: string;
  description: string;
  maxScore: number;
  levels: {
    level: string;
    descriptor: string;
    score: number;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { submissionId, rubricId } = body;

    console.log('[Re-Evaluate] Starting re-evaluation:', { submissionId, rubricId });

    // Delete existing evaluation if exists
    await prisma.evaluation.deleteMany({
      where: {
        submissionId,
        rubricId
      }
    });

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
          select: {
            id: true,
            studentId: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Fetch rubric
    const rubric = await prisma.rubric.findUnique({
      where: { id: rubricId }
    });

    if (!rubric) {
      return NextResponse.json({ error: 'Rubric not found' }, { status: 404 });
    }

    console.log('[Re-Evaluate] Submission text length:', submission.extractedText?.length);

    // Handle both rubric structures: { criteria: [] } or { categories: [] }
    const rubricCriteria = rubric.criteria as any;
    const criteriaArray = rubricCriteria.criteria || rubricCriteria.categories || [];

    console.log('[Re-Evaluate] Rubric criteria count:', criteriaArray.length);

    // Calculate max possible score from rubric (handle both maxPoints and weight fields)
    const maxPossibleScore = criteriaArray.reduce((sum: number, c: any) => sum + (c.maxPoints || c.maxScore || c.weight || 0), 0);

    console.log('[Re-Evaluate] Max possible score from rubric:', maxPossibleScore);

    // Prepare AI evaluation prompt with stringent academic standards
    const evaluationPrompt = `You are an expert academic evaluator for Advanced Paramedicine education with 15+ years of clinical and educational experience.

ASSIGNMENT: ${submission.assignment.title}
STUDENT: ${submission.student.fullName} (${submission.student.studentId})
MODULE: ${submission.assignment.module?.name}

RUBRIC CRITERIA:
${JSON.stringify(criteriaArray, null, 2)}

STUDENT SUBMISSION:
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

5. QUALITY STANDARDS:
   - Identify strengths and areas for improvement objectively
   - Suggest specific, actionable improvements
   - Be constructive but rigorous

6. CONFIDENCE RATING:
   - Rate your confidence in the evaluation (0-1)
   - Lower confidence if submission is unclear, incomplete, or hard to assess

RESPONSE FORMAT (JSON only, no markdown code blocks):
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
  "confidence": number (0-1)
}

Remember: Be STRICT, LITERAL, and EVIDENCE-BASED. Do not be generous or assume implied content.`;

    try {
      if (!DEEPSEEK_API_KEY) {
        throw new Error('DeepSeek API key not configured');
      }

      console.log('[Re-Evaluate] Calling DeepSeek API...');

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
              content: "You are an expert academic evaluator. Provide detailed, constructive, and fair evaluations following the exact JSON format requested. Do not wrap your response in markdown code blocks."
            },
            {
              role: "user",
              content: evaluationPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 3000
        })
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('[Re-Evaluate] DeepSeek API error:', errorText);
        throw new Error(`DeepSeek API error: ${aiResponse.statusText}`);
      }

      const aiData = await aiResponse.json();
      console.log('[Re-Evaluate] DeepSeek raw response length:', aiData.choices[0].message.content.length);

      // Clean markdown code blocks from response
      let responseContent = aiData.choices[0].message.content || '{}';
      responseContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      console.log('[Re-Evaluate] Cleaned response:', responseContent.substring(0, 200));

      const evaluationResult = JSON.parse(responseContent);

      console.log('[Re-Evaluate] Parsed evaluation:', {
        totalScore: evaluationResult.totalScore,
        maxScore: maxPossibleScore,
        percentage: (evaluationResult.totalScore / maxPossibleScore) * 100
      });

      // Create evaluation record
      const evaluation = await prisma.evaluation.create({
        data: {
          submissionId,
          rubricId,
          totalScore: evaluationResult.totalScore,
          maxScore: maxPossibleScore,
          percentage: (evaluationResult.totalScore / maxPossibleScore) * 100,
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

      console.log('[Re-Evaluate] Success! Evaluation created:', evaluation.id);

      return NextResponse.json({
        evaluation,
        success: true,
        message: 'Re-evaluation completed successfully'
      });

    } catch (aiError: any) {
      console.error('[Re-Evaluate] AI evaluation error:', aiError);

      return NextResponse.json({
        error: 'AI evaluation failed',
        details: aiError.message,
        success: false
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[Re-Evaluate] Error:', error);
    return NextResponse.json({
      error: 'Failed to re-evaluate submission',
      details: error.message
    }, { status: 500 });
  }
}
