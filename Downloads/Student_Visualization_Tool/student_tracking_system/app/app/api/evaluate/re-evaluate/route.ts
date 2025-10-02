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

    // Prepare AI evaluation prompt
    const evaluationPrompt = `You are an expert academic evaluator for Emergency Medical Services education.

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

EVALUATION INSTRUCTIONS:
1. Carefully read the student's submission
2. For each criterion, determine which level best matches the student's work
3. Assign the corresponding score for that level
4. Provide specific justification with quotes from the student's work
5. Identify overall strengths and areas for improvement
6. Provide 2-4 specific, actionable recommendations

RESPONSE FORMAT (JSON only, no markdown):
{
  "scores": {
    "Description": {
      "points": <number 0-4>,
      "level": "<Outstanding|Very Good|Satisfactory|Less Than Satisfactory|Omitted>",
      "justification": "<detailed explanation with specific quotes from submission>"
    },
    "Thoughts and Feelings": {
      "points": <number 0-4>,
      "level": "<level name>",
      "justification": "<detailed explanation>"
    },
    "Ability to critically analyze the incident": {
      "points": <number 0-4>,
      "level": "<level name>",
      "justification": "<detailed explanation>"
    },
    "Solutions / recommendation / improvement strategies (Action)": {
      "points": <number 0-4>,
      "level": "<level name>",
      "justification": "<detailed explanation>"
    },
    "Overall Performance": {
      "points": <number 0-4>,
      "level": "<level name>",
      "justification": "<detailed explanation>"
    }
  },
  "totalScore": <sum of all points>,
  "feedback": "<overall constructive feedback paragraph>",
  "strengths": "<specific strengths identified>",
  "improvements": "<specific areas for improvement>",
  "suggestions": "<2-4 actionable recommendations>"
}

Be thorough, fair, and constructive. Base scores strictly on the rubric descriptors.`;

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
