import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { evaluationId } = body;

    if (!evaluationId) {
      return NextResponse.json({
        error: 'Evaluation ID is required'
      }, { status: 400 });
    }

    // Fetch evaluation with all related data
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: {
        submission: {
          include: {
            student: true,
            assignment: {
              include: {
                module: true
              }
            }
          }
        },
        rubric: true
      }
    });

    if (!evaluation) {
      return NextResponse.json({
        error: 'Evaluation not found'
      }, { status: 404 });
    }

    // Get instructor info
    const instructor = await prisma.user.findUnique({
      where: { email: session.user.email! }
    });

    const student = evaluation.submission.student;
    const assignment = evaluation.submission.assignment;
    const criteriaScores = evaluation.criteriaScores as any;

    // Generate structured feedback for the email
    const feedbackPrompt = `
You are drafting a professional, encouraging feedback email from a paramedic/healthcare educator to a student about their assignment.

INSTRUCTOR: ${instructor?.name || session.user.name || 'Your Instructor'}
STUDENT: ${student.fullName}
ASSIGNMENT: ${assignment.title}
MODULE: ${assignment.module?.name} (${assignment.module?.code})

EVALUATION RESULTS:
Score: ${evaluation.totalScore}/${evaluation.maxScore} (${evaluation.percentage.toFixed(1)}%)

DETAILED SCORES BY CRITERION:
${Object.entries(criteriaScores || {}).map(([criterion, data]: [string, any]) =>
  `- ${criterion}: ${data.points} pts (${data.level})
   ${data.justification}`
).join('\n')}

STRENGTHS IDENTIFIED:
${evaluation.strengths || 'Not specified'}

AREAS FOR IMPROVEMENT:
${evaluation.improvements || 'Not specified'}

OVERALL FEEDBACK:
${evaluation.feedback || 'No additional feedback'}

TASK:
Generate a professional, encouraging, and HIGHLY SPECIFIC feedback email following this structure:

**EMAIL STRUCTURE:**

1. **Opening (1-2 sentences)**: Warm greeting mentioning the specific assignment/case

2. **Strengths Section (1 paragraph)**:
   - Start with "First, I want to commend you on the strengths in your submission."
   - Be SPECIFIC - reference exact details from their work (e.g., vital signs they documented, steps they followed, clinical reasoning they demonstrated)
   - Explain WHY these are strengths and what they demonstrate about their clinical/academic skills

3. **Areas for Growth (1 sentence transition)**:
   - E.g., "To help you advance toward an Outstanding level, there are a few areas where you can deepen your analysis."

4. **SPECIFIC, ACTIONABLE SUGGESTIONS (2-3 numbered points with detailed examples)**:
   Each suggestion MUST include:
   - What to improve (e.g., "Broaden Your Differential Diagnosis")
   - HOW to do it with a concrete framework or approach
   - A DETAILED EXAMPLE showing exactly what this looks like in practice

   Example format:
   "1. [Skill to Improve]
   [Explanation of the skill and why it matters]

   Example for this case:
   [Specific, detailed example with actual quotes/scenarios showing HOW to apply the skill to THEIR assignment]"

   Examples of good suggestions:
   - "Integrate Evidence-Based Guidelines Directly" → Show them how to cite PHECC/NICE guidelines with exact quote format
   - "Structure Your Action Plan with SMART Framework" → Give them a complete SMART goal example based on their work
   - "Deepen Clinical Reasoning" → Show them how to write differential diagnoses with ruling in/out criteria

5. **Closing (2-3 sentences)**:
   - Affirm their progress ("You're on the right track...")
   - Express confidence in their growth
   - Offer continued support

**CRITICAL REQUIREMENTS:**
- Include AT LEAST 2-3 specific, worked examples showing them EXACTLY how to improve
- Reference specific details from their evaluation scores and feedback
- Use healthcare/paramedic terminology appropriately
- Make examples directly applicable to THEIR assignment type
- Keep tone warm, professional, and encouraging throughout
- Length: 400-600 words (detailed examples require more space)

**TONE:** Professional educator, warm, constructive, solution-focused, evidence-based

Return ONLY the email body text. Start with "Dear ${student.fullName}," and end with a professional closing and the instructor's name.
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
              content: "You are an expert paramedic/healthcare educator who writes exceptionally detailed, practical feedback emails. Your specialty is providing SPECIFIC, WORKED EXAMPLES that show students exactly HOW to improve. You never give vague advice - you always demonstrate the skill with a concrete example from their work. Your emails are professional, warm, evidence-based, and deeply educational."
            },
            {
              role: "user",
              content: feedbackPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!aiResponse.ok) {
        throw new Error(`DeepSeek API error: ${aiResponse.statusText}`);
      }

      const aiData = await aiResponse.json();
      const emailBody = aiData.choices[0].message.content.trim();

      // Generate subject line
      const subjectLine = `Feedback on ${assignment.title} - ${assignment.module?.code}`;

      // Create structured response
      const response = {
        success: true,
        emailDraft: {
          to: student.email,
          subject: subjectLine,
          body: emailBody,
          studentName: student.fullName,
          assignmentTitle: assignment.title,
          score: `${evaluation.totalScore}/${evaluation.maxScore}`,
          percentage: evaluation.percentage.toFixed(1)
        },
        metadata: {
          evaluationId: evaluation.id,
          submissionId: evaluation.submissionId,
          studentId: student.id,
          generatedAt: new Date().toISOString()
        }
      };

      return NextResponse.json(response);

    } catch (aiError: any) {
      console.error('AI email generation error:', aiError);

      // Fallback to template-based email
      const fallbackEmail = generateFallbackEmail(
        student.fullName,
        assignment.title,
        assignment.module?.code || '',
        evaluation,
        instructor?.name || session.user.name || 'Your Instructor'
      );

      return NextResponse.json({
        success: true,
        emailDraft: {
          to: student.email,
          subject: `Feedback on ${assignment.title} - ${assignment.module?.code}`,
          body: fallbackEmail,
          studentName: student.fullName,
          assignmentTitle: assignment.title,
          score: `${evaluation.totalScore}/${evaluation.maxScore}`,
          percentage: evaluation.percentage.toFixed(1)
        },
        metadata: {
          evaluationId: evaluation.id,
          submissionId: evaluation.submissionId,
          studentId: student.id,
          generatedAt: new Date().toISOString(),
          usingFallback: true
        }
      });
    }

  } catch (error: any) {
    console.error('Email generation error:', error);
    return NextResponse.json({
      error: 'Failed to generate feedback email',
      details: error.message
    }, { status: 500 });
  }
}

function generateFallbackEmail(
  studentName: string,
  assignmentTitle: string,
  moduleCode: string,
  evaluation: any,
  instructorName: string
): string {
  return `Dear ${studentName},

I hope this email finds you well. I have just had the opportunity to review your ${assignmentTitle} for ${moduleCode}, and I wanted to share some feedback with you.

Your submission demonstrates several noteworthy strengths:
${evaluation.strengths || 'You showed good understanding of the core concepts covered in this assignment.'}

However, there are a few areas where I believe you could further develop your skills:
${evaluation.improvements || 'Consider reviewing the course materials to strengthen your understanding of the key concepts.'}

Here are some specific suggestions for improvement:
1. Review the relevant course materials and examples provided during class
2. Practice applying the concepts in different scenarios
3. Don't hesitate to reach out during office hours if you need clarification

Your current score is ${evaluation.totalScore} out of ${evaluation.maxScore} (${evaluation.percentage.toFixed(1)}%). I encourage you to use this feedback constructively as you continue to develop your skills.

Please feel free to reach out if you would like to discuss this feedback further or if you have any questions. I'm here to support your learning journey.

Best regards,
${instructorName}`;
}
