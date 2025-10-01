import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

interface ParsedCriterion {
  name: string;
  description: string;
  levels: {
    level: string;
    score: number;
    descriptor: string;
  }[];
  maxScore: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { rubricText } = body;

    if (!rubricText || rubricText.trim().length < 10) {
      return NextResponse.json({
        error: 'Rubric text is required and must be substantial'
      }, { status: 400 });
    }

    // Use AI to parse and structure the rubric
    const parsingPrompt = `You are an expert at analyzing and structuring academic rubrics. Your task is to take unstructured rubric text and convert it into a well-organized, structured format.

# Rubric Text to Parse:
${rubricText}

---

# Your Task:

Analyze the provided rubric text and extract:
1. All assessment criteria (e.g., "Critical Thinking", "Writing Quality", "Evidence Use")
2. For each criterion, identify:
   - The criterion name
   - A brief description of what it assesses
   - All scoring levels (e.g., Excellent, Good, Satisfactory, Needs Improvement)
   - The point value for each level
   - The descriptor/requirements for each level

# Output Format:

Provide your response as a JSON object with this exact structure:

\`\`\`json
{
  "title": "Overall rubric title or name",
  "description": "Brief description of what this rubric assesses",
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
          "descriptor": "Detailed description of what excellent performance looks like"
        },
        {
          "level": "Good",
          "score": 20,
          "descriptor": "Detailed description of what good performance looks like"
        },
        {
          "level": "Satisfactory",
          "score": 15,
          "descriptor": "Detailed description of what satisfactory performance looks like"
        },
        {
          "level": "Needs Improvement",
          "score": 10,
          "descriptor": "Detailed description of what needs improvement"
        }
      ]
    }
  ]
}
\`\`\`

Important:
- Be thorough and capture all criteria
- Preserve the exact wording of descriptors
- Ensure scores are numeric and consistent
- If scoring isn't explicit, infer reasonable point distributions
- If the rubric uses percentages, convert to points out of 100`;

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
            content: 'You are an expert academic assessment specialist who excels at analyzing and structuring grading rubrics. You extract criteria, scoring levels, and descriptors with precision.'
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
      throw new Error(`DeepSeek API error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const aiAnalysis = aiData.choices[0].message.content;

    // Extract JSON from response
    const jsonMatch = aiAnalysis.match(/```json\s*([\s\S]*?)\s*```/) ||
                     aiAnalysis.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON');
    }

    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const parsedRubric = JSON.parse(jsonStr);

    return NextResponse.json({
      success: true,
      rubric: parsedRubric,
      message: 'Rubric parsed successfully'
    });

  } catch (error) {
    console.error('[Rubric Parse] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to parse rubric'
    }, { status: 500 });
  }
}
