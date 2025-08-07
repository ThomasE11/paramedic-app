import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

export async function generateQuizQuestions(
  skillName: string,
  skillDescription: string,
  objectives: any,
  difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' = 'BEGINNER',
  questionCount: number = 5
): Promise<QuizQuestion[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate ${questionCount} multiple-choice quiz questions for a paramedic training skill.

Skill Information:
- Name: ${skillName}
- Description: ${skillDescription}
- Objectives: ${typeof objectives === 'string' ? objectives : JSON.stringify(objectives)}
- Difficulty Level: ${difficultyLevel}

Requirements:
1. Create practical, realistic questions that test understanding of this specific paramedic skill
2. Each question should have 4 multiple-choice options (A, B, C, D)
3. Questions should be relevant to emergency medical situations
4. Include scenario-based questions when appropriate
5. Provide clear explanations for why each answer is correct
6. Match the difficulty level requested

Please respond with a JSON array in this exact format:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of why this answer is correct",
    "difficulty": "${difficultyLevel}"
  }
]

Make sure the response is valid JSON only, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response to extract JSON
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const questions: QuizQuestion[] = JSON.parse(jsonText);
      
      // Validate the structure
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }

      // Validate each question
      questions.forEach((q, index) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || 
            typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3 ||
            !q.explanation || !q.difficulty) {
          throw new Error(`Invalid question structure at index ${index}`);
        }
      });

      return questions;
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.error('Raw response:', text);
      throw new Error('Failed to parse quiz questions from Gemini response');
    }
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw new Error(`Failed to generate quiz questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateSkillFeedback(
  skillName: string,
  studentResponse: string,
  correctAnswer: string,
  skillContext: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `As a paramedic training instructor, provide constructive feedback for a student's response to a skill-related question.

Skill: ${skillName}
Context: ${skillContext}
Correct Answer: ${correctAnswer}
Student's Response: ${studentResponse}

Please provide:
1. Brief assessment of the student's response
2. Specific feedback on what they got right or wrong
3. Educational guidance to help them improve
4. Any safety considerations if applicable

Keep the feedback encouraging but accurate, focused on learning outcomes.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating feedback:', error);
    return 'Unable to generate feedback at this time. Please consult your instructor.';
  }
}