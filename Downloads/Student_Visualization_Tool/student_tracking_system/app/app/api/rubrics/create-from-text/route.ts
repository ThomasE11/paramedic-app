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
    const { assignmentId, rubricText, title } = body;

    if (!assignmentId || !rubricText) {
      return NextResponse.json({
        error: 'Assignment ID and rubric text are required'
      }, { status: 400 });
    }

    if (rubricText.trim().length < 50) {
      return NextResponse.json({
        error: 'Rubric text must be substantial (at least 50 characters)'
      }, { status: 400 });
    }

    // Verify assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { module: true }
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Use AI to parse and structure the rubric
    const parsingPrompt = `You are an expert at analyzing and structuring academic rubrics. Extract the rubric structure from this text.

# Rubric Text:
${rubricText}

---

# Task:

Analyze this rubric and extract:
1. The overall rubric title/name
2. All assessment criteria
3. For each criterion:
   - Name of the criterion
   - Description/what it assesses
   - All scoring levels (e.g., Excellent, Good, Satisfactory, etc.)
   - Point value for each level
   - Detailed descriptor for each level

# Output Format (JSON):

\`\`\`json
{
  "title": "Extracted rubric title",
  "description": "Overall description of what this rubric assesses",
  "totalMaxScore": 100,
  "criteria": [
    {
      "name": "Criterion Name",
      "description": "What this criterion assesses",
      "maxScore": 25,
      "levels": [
        {
          "level": "Excellent",
          "score": 25,
          "descriptor": "Detailed requirements for excellent performance"
        },
        {
          "level": "Good",
          "score": 20,
          "descriptor": "Detailed requirements for good performance"
        },
        {
          "level": "Satisfactory",
          "score": 15,
          "descriptor": "Detailed requirements for satisfactory performance"
        }
      ]
    }
  ]
}
\`\`\`

Important:
- Preserve exact wording from the text
- Extract ALL criteria and levels mentioned
- Ensure scores are numeric
- If scoring isn't explicit, infer reasonable point distributions
- If percentages are given, convert to points out of 100`;

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
            content: 'You are an expert academic assessment specialist who excels at analyzing and structuring grading rubrics with precision.'
          },
          {
            role: 'user',
            content: parsingPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000
      })
    });

    if (!aiResponse.ok) {
      throw new Error(`AI parsing failed: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const aiAnalysis = aiData.choices[0].message.content;

    // Extract JSON from response
    const jsonMatch = aiAnalysis.match(/```json\s*([\s\S]*?)\s*```/) ||
                     aiAnalysis.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Could not parse AI response. Please try reformatting your rubric text.');
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const parsedRubric = JSON.parse(jsonStr);

    // Get latest version number
    const latestRubric = await prisma.rubric.findFirst({
      where: { assignmentId },
      orderBy: { version: 'desc' }
    });

    const version = latestRubric ? latestRubric.version + 1 : 1;

    // Deactivate previous versions
    if (latestRubric) {
      await prisma.rubric.updateMany({
        where: { assignmentId },
        data: { isActive: false }
      });
    }

    // Create rubric in database
    const rubric = await prisma.rubric.create({
      data: {
        assignmentId,
        title: title || parsedRubric.title || 'Rubric',
        description: parsedRubric.description,
        criteria: parsedRubric.criteria,
        version,
        extractedText: rubricText,
        createdBy: session.user.id
      },
      include: {
        assignment: {
          include: {
            module: true
          }
        },
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      rubric: rubric,
      parsedStructure: parsedRubric,
      message: 'Rubric created successfully from pasted text'
    });

  } catch (error) {
    console.error('[Create Rubric from Text] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to create rubric from text'
    }, { status: 500 });
  }
}
