
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authConfig } from '@/lib/auth';
import { getSkillById } from '@/lib/skills-data';

export const dynamic = 'force-dynamic';

// Generate dynamic questions based on skill content
function generateQuestionsFromSkill(skill: any): any[] {
  const questions = [];
  let questionId = 1;

  // Generate questions from objectives
  if (skill.objectives && skill.objectives.length > 0) {
    skill.objectives.slice(0, 2).forEach((objective: string, index: number) => {
      questions.push({
        id: questionId++,
        question: `What is the primary objective of this step: "${objective}"?`,
        options: [
          'To ensure patient safety',
          'To follow protocol correctly',
          'To demonstrate competency',
          'All of the above'
        ],
        correctAnswer: 3, // "All of the above"
        explanation: `This objective focuses on proper technique, safety, and protocol adherence: ${objective}`,
        difficulty: 'INTERMEDIATE',
      });
    });
  }

  // Generate questions from common errors
  if (skill.commonErrors && skill.commonErrors.length > 0) {
    const error = skill.commonErrors[0];
    questions.push({
      id: questionId++,
      question: `Which of the following is a common error when performing ${skill.name}?`,
      options: [
        error,
        'Perfect execution every time',
        'Following all protocols',
        'Maintaining sterile technique'
      ],
      correctAnswer: 0, // The actual error
      explanation: `Common errors should be avoided. ${error} is a frequent mistake in ${skill.name}.`,
      difficulty: 'INTERMEDIATE',
    });
  }

  // Generate questions from indications
  if (skill.indications && skill.indications.length > 0) {
    const indication = skill.indications[0];
    questions.push({
      id: questionId++,
      question: `When is ${skill.name} indicated?`,
      options: [
        'Never appropriate',
        indication,
        'Only in emergencies',
        'Only with doctor approval'
      ],
      correctAnswer: 1, // The actual indication
      explanation: `${skill.name} is indicated when: ${indication}`,
      difficulty: 'EASY',
    });
  }

  // Generate questions from equipment
  if (skill.equipment && skill.equipment.length > 0) {
    const equipment = skill.equipment.slice(0, 3);
    questions.push({
      id: questionId++,
      question: `Which equipment is essential for ${skill.name}?`,
      options: [
        equipment[0] || 'Standard medical equipment',
        'No equipment needed',
        'Only advanced equipment',
        'Equipment is optional'
      ],
      correctAnswer: 0, // First equipment item
      explanation: `Essential equipment for ${skill.name} includes: ${equipment.join(', ')}`,
      difficulty: 'EASY',
    });
  }

  // Generate questions from contraindications
  if (skill.contraindications && skill.contraindications.length > 0) {
    const contraindication = skill.contraindications[0];
    questions.push({
      id: questionId++,
      question: `When should ${skill.name} NOT be performed?`,
      options: [
        'Always safe to perform',
        contraindication,
        'Only when convenient',
        'When patient requests it'
      ],
      correctAnswer: 1, // The contraindication
      explanation: `${skill.name} should not be performed when: ${contraindication}`,
      difficulty: 'INTERMEDIATE',
    });
  }

  // If no specific content, generate generic safety questions
  if (questions.length === 0) {
    questions.push({
      id: 1,
      question: `What is the most important consideration when performing ${skill.name}?`,
      options: [
        'Speed of execution',
        'Patient safety and proper technique',
        'Equipment availability',
        'Time constraints'
      ],
      correctAnswer: 1,
      explanation: 'Patient safety and proper technique are always the primary considerations in any medical procedure.',
      difficulty: 'EASY',
    });

    questions.push({
      id: 2,
      question: `Before performing ${skill.name}, what should you always do first?`,
      options: [
        'Start immediately',
        'Check equipment and assess patient',
        'Call for backup',
        'Review textbook'
      ],
      correctAnswer: 1,
      explanation: 'Always assess the patient and ensure you have the proper equipment before beginning any procedure.',
      difficulty: 'EASY',
    });
  }

  return questions;
}

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
    
    // Get skill from real data
    const skill = getSkillById(skillId);
    
    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    // Generate questions dynamically from skill content
    const questions = generateQuestionsFromSkill(skill);

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No questions available for this skill' }, { status: 404 });
    }

    // Return a random question
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

    return NextResponse.json(randomQuestion);
  } catch (error) {
    console.error('Error fetching practice question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    // Get skill from real data
    const skill = getSkillById(skillId);
    
    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    // Generate questions to find the one being answered
    const questions = generateQuestionsFromSkill(skill);
    const question = questions.find(q => q.id === questionId);

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const isCorrect = selectedAnswer === question.correctAnswer;

    // Log the attempt (in a real app, this would go to database)
    console.log('Quiz attempt recorded:', {
      userId: session?.user?.id || 'anonymous',
      questionId,
      skillId,
      selectedAnswer,
      isCorrect,
      stepNumber,
      responseTimeMs,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || 'No explanation available.',
    });
  } catch (error) {
    console.error('Error submitting practice question answer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
