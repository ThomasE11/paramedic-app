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
    console.log('[Re-Evaluate] Rubric criteria count:', (rubric.criteria as any)?.length);

    // Calculate max possible score from rubric
    const criteria = rubric.criteria as EvaluationCriteria[];
    const maxPossibleScore = criteria.reduce((sum, criterion) => sum + criterion.maxScore, 0);

    console.log('[Re-Evaluate] Max possible score from rubric:', maxPossibleScore);

    // Prepare AI evaluation prompt with stringent academic standards
    const evaluationPrompt = `You are an expert academic evaluator for Advanced Paramedicine education with 15+ years of clinical and educational experience.

ASSIGNMENT: ${submission.assignment.title}
STUDENT: ${submission.student.fullName} (${submission.student.studentId})
MODULE: ${submission.assignment.module?.name}

RUBRIC CRITERIA:
${criteria.map(c => `
${c.name} (Max: ${c.maxScore} points):
${c.levels.map(level => `- ${level.level} (${level.score} points): ${level.descriptor}`).join('\n')}
`).join('\n')}

STUDENT SUBMISSION:
${submission.extractedText || 'No text content available'}

CRITICAL EVALUATION STANDARDS:

For "Ability to critically analyze the incident" - OUTSTANDING requires:
✓ Differential diagnosis with 3+ alternative conditions considered
✓ Pathophysiology explanation (WHY symptoms occur, not just WHAT they are)
✓ Evidence-based guidelines cited with SPECIFIC recommendations (not just title)
✓ Clinical reasoning showing synthesis of theory + practice
✓ Discussion of clinical decision rules or protocols
✓ Acknowledgment of uncertainty and clinical limitations

For "Solutions/Action Plan" - OUTSTANDING requires:
✓ Specific, measurable learning objectives (NOT vague "read more")
✓ Evidence-based references for improvement strategies
✓ Timeline or implementation plan
✓ Self-assessment of knowledge gaps with concrete remediation

For "Overall Performance" - OUTSTANDING requires:
✓ References cited WITH specific guideline quotes/recommendations used
✓ Evidence levels discussed (e.g., "NICE Grade A recommendation")
✓ Integration of multiple authoritative sources
✓ Application of evidence to justify clinical decisions

EVALUATION INSTRUCTIONS:
1. **BE DISCRIMINATING** - Each submission is UNIQUE. Do NOT give similar scores to different submissions unless they truly have similar quality
2. **TEXT LENGTH MATTERS** - A 5,700 char submission vs 9,800 char submission should NOT get identical scores unless shorter one is significantly more concise/efficient
3. **RIGOROUS STANDARDS** - Outstanding (4/4) is RARE. Reserve it for truly exceptional work that meets ALL rubric descriptors
4. **DEPTH VARIATIONS** - If one submission has deeper analysis, more examples, better references - it should score HIGHER
5. **Quote SPECIFIC text** - Justify each score with exact quotes showing why this submission earns this specific score
6. **Avoid Score Clustering** - If evaluating 3 submissions, they should have varied scores (not all 17/20) unless truly identical in quality
7. **Missing Elements = Lower Scores**:
   - No differential diagnosis? Deduct from critical analysis
   - References listed but not applied? Deduct from overall performance
   - Vague action plan ("read more")? Maximum 3/4 for that criterion
   - No pathophysiology explanation? Deduct from critical analysis
8. **Compare & Contrast** - Longer, more detailed submissions with more examples should score higher than shorter, surface-level ones

RESPONSE FORMAT (JSON only, no markdown):
{
  "scores": {
    "Description": {
      "points": <number 0-4>,
      "level": "<Outstanding|Very Good|Satisfactory|Less Than Satisfactory|Omitted>",
      "justification": "<Quote exact text, explain why it meets/doesn't meet descriptor requirements>"
    },
    "Thoughts and Feelings": {
      "points": <number 0-4>,
      "level": "<level name>",
      "justification": "<Quote exact text showing emotional reflection depth>"
    },
    "Ability to critically analyze the incident": {
      "points": <number 0-4>,
      "level": "<level name>",
      "justification": "<Check: differential diagnosis? pathophysiology explained? guidelines quoted? If any missing, NOT outstanding>"
    },
    "Solutions / recommendation / improvement strategies (Action)": {
      "points": <number 0-4>,
      "level": "<level name>",
      "justification": "<Check: specific measurable goals? timeline? If vague 'read more', give 3/4 max>"
    },
    "Overall Performance": {
      "points": <number 0-4>,
      "level": "<level name>",
      "justification": "<Check: references USED with quotes? If just listed, NOT outstanding>"
    }
  },
  "totalScore": <sum of all points>,
  "feedback": "<START WITH STUDENT'S FIRST NAME. Constructive feedback highlighting what would elevate work to Outstanding level>",
  "strengths": "<Specific strengths with evidence quoted from submission>",
  "improvements": "<Specific gaps: missing differential dx? vague actions? references not applied?>",
  "suggestions": "<Concrete, measurable next steps with specific resources/protocols to study>"
}

IMPORTANT: Start the feedback field with the student's first name: "${submission.student.firstName}, [your feedback...]"

Be academically rigorous. Reserve "Outstanding" for truly exceptional work. "Very Good" is still excellent but has minor gaps.`;

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
