import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'EASY' | 'INTERMEDIATE' | 'ADVANCED';
}

// Store previously asked questions per user session to avoid repeats
const userQuestionHistory = new Map<string, Set<string>>();

// Store generated questions temporarily for answer validation
const questionStorage = new Map<string, QuizQuestion>();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    // Temporarily allow without authentication for testing
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const skillId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = session?.user?.id || 'anonymous-user';
    const stepNumber = searchParams.get('stepNumber') || '1';

    // Get skill information to generate relevant questions
    const skillInfo = getSkillInfo(skillId);
    if (!skillInfo) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    // Get user's question history
    const userHistory = userQuestionHistory.get(userId) || new Set();

    // Generate question using Gemini API
    const question = await generateQuestionWithGemini(skillInfo, userHistory, stepNumber);
    
    // Add question ID to user history
    userHistory.add(question.id);
    userQuestionHistory.set(userId, userHistory);

    // Store question for answer validation (keep for 1 hour)
    questionStorage.set(question.id, question);
    setTimeout(() => {
      questionStorage.delete(question.id);
    }, 60 * 60 * 1000); // 1 hour

    // Clean up old histories (keep only last 50 questions per user)
    if (userHistory.size > 50) {
      const historyArray = Array.from(userHistory);
      const newHistory = new Set(historyArray.slice(-40)); // Keep last 40
      userQuestionHistory.set(userId, newHistory);
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error generating Gemini question:', error);
    
    // Fallback to static questions if Gemini fails
    const fallbackQuestion = getFallbackQuestion(params.id);
    
    // Store fallback question for validation too
    questionStorage.set(fallbackQuestion.id, fallbackQuestion);
    setTimeout(() => {
      questionStorage.delete(fallbackQuestion.id);
    }, 60 * 60 * 1000); // 1 hour
    
    return NextResponse.json(fallbackQuestion);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    
    // Temporarily allow without authentication for testing
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { questionId, selectedAnswer, stepNumber, responseTimeMs } = await request.json();
    const skillId = params.id;

    // Retrieve the stored question for validation
    const storedQuestion = questionStorage.get(questionId);
    
    if (!storedQuestion) {
      return NextResponse.json({ error: 'Question not found or expired' }, { status: 404 });
    }

    // Validate the answer
    const isCorrect = selectedAnswer === storedQuestion.correctAnswer;
    
    console.log('Gemini quiz attempt recorded:', {
      userId: session?.user?.id || 'anonymous',
      questionId,
      skillId,
      selectedAnswer,
      correctAnswer: storedQuestion.correctAnswer,
      isCorrect,
      stepNumber,
      responseTimeMs,
      timestamp: new Date().toISOString(),
    });

    // Clean up the question after validation
    questionStorage.delete(questionId);

    return NextResponse.json({
      correct: isCorrect,
      correctAnswer: storedQuestion.correctAnswer,
      explanation: storedQuestion.explanation,
    });
  } catch (error) {
    console.error('Error submitting Gemini question answer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateQuestionWithGemini(
  skillInfo: any, 
  userHistory: Set<string>, 
  stepNumber: string
): Promise<QuizQuestion> {
  try {
    // Check if we have Google Gemini API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Google Gemini API key not found, using fallback questions');
      throw new Error('Gemini API key not configured');
    }

    const prompt = `Generate a SHORT, CONCISE multiple-choice quiz question for paramedic training on: "${skillInfo.name}".

Requirements:
1. Question must be under 15 words and directly related to this skill
2. Provide exactly 4 short options (3-5 words each)
3. Include one correct answer and three realistic distractors
4. Keep explanation under 20 words
5. Focus on critical, practical knowledge only
6. No complex scenarios - direct, factual questions only

Skill: ${skillInfo.name}
Level: ${skillInfo.difficultyLevel}

Previously asked question IDs to avoid: ${Array.from(userHistory).slice(-5).join(', ')}

Respond in this EXACT JSON format:
{
  "question": "Short question here?",
  "options": ["Short A", "Short B", "Short C", "Short D"],
  "correctAnswer": 0,
  "explanation": "Brief explanation under 20 words.",
  "difficulty": "${skillInfo.difficultyLevel}"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated by Gemini');
    }

    // Parse the JSON response from Gemini
    const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
    const questionData = JSON.parse(cleanedText);

    // Create unique question ID
    const questionId = `gemini-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: questionId,
      question: questionData.question,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation,
      difficulty: questionData.difficulty || skillInfo.difficultyLevel,
    };

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

function getSkillInfo(skillId: string) {
  const skills = {
    'skill-1': {
      name: 'CPR Adult',
      description: 'Adult cardiopulmonary resuscitation technique - the cornerstone of basic life support',
      difficultyLevel: 'INTERMEDIATE',
    },
    'skill-2': {
      name: 'AED Use',
      description: 'Automated External Defibrillator operation and safety procedures',
      difficultyLevel: 'BEGINNER',
    },
    'skill-3': {
      name: 'IV Insertion',
      description: 'Intravenous line insertion technique with sterile procedure',
      difficultyLevel: 'ADVANCED',
    },
  };

  return skills[skillId as keyof typeof skills] || null;
}

function getFallbackQuestion(skillId: string): QuizQuestion {
  const fallbackQuestions = {
    'skill-1': {
      id: `fallback-cpr-${Date.now()}`,
      question: 'Adult CPR compression rate?',
      options: ['80-100/min', '100-120/min', '120-140/min', '60-80/min'],
      correctAnswer: 1,
      explanation: 'AHA recommends 100-120 compressions per minute.',
      difficulty: 'INTERMEDIATE' as const,
    },
    'skill-2': {
      id: `fallback-aed-${Date.now()}`,
      question: 'During AED rhythm analysis?',
      options: ['Continue CPR', 'Check pulse', 'Clear patient', 'Remove pads'],
      correctAnswer: 2,
      explanation: 'No one should touch patient during analysis.',
      difficulty: 'BEGINNER' as const,
    },
    'skill-3': {
      id: `fallback-iv-${Date.now()}`,
      question: 'IV needle insertion angle?',
      options: ['10-15 degrees', '15-30 degrees', '30-45 degrees', '45-60 degrees'],
      correctAnswer: 1,
      explanation: '15-30 degrees optimal for successful venipuncture.',
      difficulty: 'ADVANCED' as const,
    },
  };

  return fallbackQuestions[skillId as keyof typeof fallbackQuestions] || fallbackQuestions['skill-1'];
}