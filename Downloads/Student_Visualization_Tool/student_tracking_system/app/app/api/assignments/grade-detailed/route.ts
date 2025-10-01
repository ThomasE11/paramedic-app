import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface CriterionScore {
  criterion: string;
  score: number;
  maxScore: number;
  justification: string;
  quotes: string[];
}

interface DetailedGradingResponse {
  criteriaScores: CriterionScore[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  overallFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  actionPlan: string[];
  detailedAnalysis: string;
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

    // Fetch submission with student details
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
            email: true
          }
        },
        assignment: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            maxScore: true
          }
        }
      }
    });

    if (!submission) {
      return NextResponse.json({
        error: 'Submission not found'
      }, { status: 404 });
    }

    // Fetch rubric with criteria
    const rubric = await prisma.rubric.findUnique({
      where: { id: rubricId },
      include: {
        assignment: {
          select: {
            title: true,
            type: true
          }
        }
      }
    });

    if (!rubric) {
      return NextResponse.json({
        error: 'Rubric not found'
      }, { status: 404 });
    }

    // Construct the detailed grading prompt
    const gradingPrompt = buildDetailedGradingPrompt(
      submission.extractedText || 'No text extracted',
      rubric.criteria,
      rubric.extractedText || '',
      submission.assignment
    );

    // Call DeepSeek API for detailed analysis
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
            role: 'system',
            content: 'You are an expert university lecturer and a fair, constructive assessor. Your task is to analyze student submissions against provided grading rubrics and generate detailed, helpful feedback that supports student learning and improvement.'
          },
          {
            role: 'user',
            content: gradingPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`DeepSeek API error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const aiAnalysis = aiData.choices[0].message.content;

    // Parse the AI response to extract structured data
    const gradingResult = parseDetailedGradingResponse(aiAnalysis, rubric.criteria);

    // Save the evaluation to database
    const evaluation = await prisma.evaluation.create({
      data: {
        submissionId: submission.id,
        rubricId: rubric.id,
        totalScore: gradingResult.totalScore,
        maxScore: gradingResult.maxScore,
        percentage: gradingResult.percentage,
        feedback: gradingResult.detailedAnalysis,
        criteriaScores: gradingResult.criteriaScores,
        strengths: gradingResult.strengths.join('\n\n'),
        improvements: gradingResult.areasForImprovement.join('\n\n'),
        evaluatedBy: 'ai'
      }
    });

    // Update submission status
    await prisma.submission.update({
      where: { id: submission.id },
      data: { status: 'graded' }
    });

    return NextResponse.json({
      success: true,
      evaluation: {
        ...evaluation,
        actionPlan: gradingResult.actionPlan,
        criteriaDetails: gradingResult.criteriaScores
      },
      message: 'Detailed grading completed successfully'
    });

  } catch (error) {
    console.error('[Detailed Grading] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to grade submission'
    }, { status: 500 });
  }
}

function buildDetailedGradingPrompt(
  submissionText: string,
  rubricCriteria: any,
  rubricDescription: string,
  assignment: any
): string {
  return `# Detailed Assessment Task

## Assignment Information
- **Title:** ${assignment.title}
- **Type:** ${assignment.type}
- **Maximum Score:** ${assignment.maxScore}
${assignment.description ? `- **Description:** ${assignment.description}` : ''}

## Grading Rubric
${rubricDescription}

### Criteria Details
${JSON.stringify(rubricCriteria, null, 2)}

## Student Submission
${submissionText}

---

## Your Task

Please provide a comprehensive, detailed assessment following these steps:

### 1. Analyze the Rubric
Carefully review the grading criteria, score levels, and descriptors provided above.

### 2. Analyze the Submission
Thoroughly read and understand the student's work.

### 3. Grade Each Criterion
For each criterion in the rubric:
- Assign an appropriate score based on the submission quality
- Write a detailed justification (3-5 sentences)
- Quote or reference specific examples from the student's text
- Explain why this score level was chosen

### 4. Provide Overall Feedback
Write a comprehensive summary paragraph (5-8 sentences) that:
- Explains the student's overall performance
- Highlights 2-3 key strengths with specific examples
- Identifies 2-3 primary areas for improvement
- Maintains an encouraging, constructive tone

### 5. Create an Action Plan
Provide 3-4 specific, actionable recommendations formatted as:
- Clear, concrete steps the student can take
- Specific techniques or resources to use
- Framed constructively and positively
- Prioritized by importance

## Response Format

Please structure your response as a JSON object with this exact format:

\`\`\`json
{
  "criteriaScores": [
    {
      "criterion": "Criterion name",
      "score": 8,
      "maxScore": 10,
      "justification": "Detailed explanation of why this score was assigned...",
      "quotes": ["Specific quote from submission", "Another relevant quote"]
    }
  ],
  "overallFeedback": "Comprehensive paragraph summarizing overall performance...",
  "strengths": [
    "First key strength with specific example",
    "Second key strength with specific example",
    "Third key strength with specific example"
  ],
  "areasForImprovement": [
    "First area needing improvement with explanation",
    "Second area needing improvement with explanation",
    "Third area needing improvement with explanation"
  ],
  "actionPlan": [
    "First specific, actionable recommendation",
    "Second specific, actionable recommendation",
    "Third specific, actionable recommendation",
    "Fourth specific, actionable recommendation (optional)"
  ]
}
\`\`\`

Be thorough, fair, and constructive in your assessment. Focus on helping the student learn and improve.`;
}

function parseDetailedGradingResponse(aiResponse: string, rubricCriteria: any): DetailedGradingResponse {
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) ||
                     aiResponse.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON');
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const parsed = JSON.parse(jsonStr);

    // Calculate totals
    const totalScore = parsed.criteriaScores.reduce((sum: number, c: CriterionScore) => sum + c.score, 0);
    const maxScore = parsed.criteriaScores.reduce((sum: number, c: CriterionScore) => sum + c.maxScore, 0);
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    return {
      criteriaScores: parsed.criteriaScores,
      totalScore,
      maxScore,
      percentage: Math.round(percentage * 100) / 100,
      overallFeedback: parsed.overallFeedback,
      strengths: parsed.strengths || [],
      areasForImprovement: parsed.areasForImprovement || [],
      actionPlan: parsed.actionPlan || [],
      detailedAnalysis: JSON.stringify(parsed, null, 2)
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    // Fallback to basic structure
    return {
      criteriaScores: [],
      totalScore: 0,
      maxScore: 0,
      percentage: 0,
      overallFeedback: aiResponse,
      strengths: [],
      areasForImprovement: [],
      actionPlan: [],
      detailedAnalysis: aiResponse
    };
  }
}
