
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { skillId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const skillId = params.skillId;
    
    // Mock quiz questions for each skill
    const mockQuestions = {
      'skill-1': [
        {
          id: 'quiz-1',
          question: 'What is the correct compression depth for adult CPR?',
          options: ['1 inch', '2 inches', '3 inches', '4 inches'],
          difficulty: 'EASY',
          correctAnswer: '2 inches',
          explanation: 'Adult CPR compressions should be at least 2 inches deep to be effective.',
        },
        {
          id: 'quiz-2',
          question: 'What is the correct compression rate for adult CPR?',
          options: ['60-80 per minute', '80-100 per minute', '100-120 per minute', '120-140 per minute'],
          difficulty: 'EASY',
          correctAnswer: '100-120 per minute',
          explanation: 'The correct rate is 100-120 compressions per minute.',
        },
        {
          id: 'quiz-3',
          question: 'What is the compression to ventilation ratio for adult CPR?',
          options: ['15:2', '30:2', '5:1', '10:1'],
          difficulty: 'INTERMEDIATE',
          correctAnswer: '30:2',
          explanation: 'The standard ratio is 30 compressions to 2 rescue breaths.',
        },
      ],
      'skill-2': [
        {
          id: 'quiz-4',
          question: 'Where should AED pads be placed?',
          options: ['Both on the chest', 'One on chest, one on back', 'One upper right, one lower left', 'Both on the back'],
          difficulty: 'EASY',
          correctAnswer: 'One upper right, one lower left',
          explanation: 'AED pads should be placed on the upper right chest and lower left chest.',
        },
        {
          id: 'quiz-5',
          question: 'What should you do while the AED is analyzing?',
          options: ['Continue CPR', 'Touch the patient', 'Ensure no one touches the patient', 'Turn off the AED'],
          difficulty: 'EASY',
          correctAnswer: 'Ensure no one touches the patient',
          explanation: 'Nobody should touch the patient during analysis to prevent interference.',
        },
      ],
      'skill-3': [
        {
          id: 'quiz-6',
          question: 'What angle should the IV catheter be inserted at?',
          options: ['5-10 degrees', '15-30 degrees', '45-60 degrees', '90 degrees'],
          difficulty: 'INTERMEDIATE',
          correctAnswer: '15-30 degrees',
          explanation: 'IV catheters should be inserted at a 15-30 degree angle to the skin.',
        },
        {
          id: 'quiz-7',
          question: 'How far above the insertion site should the tourniquet be placed?',
          options: ['2-3 inches', '4-6 inches', '6-8 inches', '8-10 inches'],
          difficulty: 'EASY',
          correctAnswer: '4-6 inches',
          explanation: 'The tourniquet should be placed 4-6 inches above the insertion site.',
        },
      ],
    };

    const questions = mockQuestions[skillId as keyof typeof mockQuestions];
    
    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'No questions found for this skill' }, { status: 404 });
    }

    // Return a random question (without correctAnswer and explanation for students)
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    const { correctAnswer, explanation, ...questionForStudent } = randomQuestion;

    return NextResponse.json(questionForStudent);
  } catch (error) {
    console.error('Error fetching quiz question:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { skillId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questionId, selectedAnswer } = await request.json();
    const skillId = params.skillId;

    // Mock quiz questions with answers
    const mockQuestions = {
      'skill-1': [
        {
          id: 'quiz-1',
          correctAnswer: '2 inches',
          explanation: 'Adult CPR compressions should be at least 2 inches deep to be effective.',
        },
        {
          id: 'quiz-2',
          correctAnswer: '100-120 per minute',
          explanation: 'The correct rate is 100-120 compressions per minute.',
        },
        {
          id: 'quiz-3',
          correctAnswer: '30:2',
          explanation: 'The standard ratio is 30 compressions to 2 rescue breaths.',
        },
      ],
      'skill-2': [
        {
          id: 'quiz-4',
          correctAnswer: 'One upper right, one lower left',
          explanation: 'AED pads should be placed on the upper right chest and lower left chest.',
        },
        {
          id: 'quiz-5',
          correctAnswer: 'Ensure no one touches the patient',
          explanation: 'Nobody should touch the patient during analysis to prevent interference.',
        },
      ],
      'skill-3': [
        {
          id: 'quiz-6',
          correctAnswer: '15-30 degrees',
          explanation: 'IV catheters should be inserted at a 15-30 degree angle to the skin.',
        },
        {
          id: 'quiz-7',
          correctAnswer: '4-6 inches',
          explanation: 'The tourniquet should be placed 4-6 inches above the insertion site.',
        },
      ],
    };

    const questions = mockQuestions[skillId as keyof typeof mockQuestions];
    const question = questions?.find(q => q.id === questionId);

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const isCorrect = selectedAnswer === question.correctAnswer;

    // Mock recording the attempt (no database needed)
    const mockAttempt = {
      id: `attempt-${Date.now()}`,
      userId: session.user.id,
      questionId,
      skillId,
      selectedAnswer,
      isCorrect,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    });
  } catch (error) {
    console.error('Error submitting quiz answer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
