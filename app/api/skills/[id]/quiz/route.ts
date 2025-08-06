import { NextRequest, NextResponse } from 'next/server';
export const dynamic = "force-dynamic";
export const runtime = 'nodejs';

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get random quiz question for skill
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const skillId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const stepNumber = searchParams.get('stepNumber');

    // Get quiz questions for this skill
    const questions = await prisma.quizQuestion.findMany({
      where: {
        skillId: skillId
      }
    });

    if (questions.length === 0) {
      // Generate fallback questions based on skill data
      const skill = await prisma.skill.findUnique({
        where: { id: skillId },
        include: {
          category: true,
          steps: true
        }
      });

      if (!skill) {
        return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
      }

      // Create fallback questions based on skill information
      const fallbackQuestions = [
        {
          id: Math.floor(Math.random() * 1000000),
          question: `What is the primary objective when performing ${skill.name}?`,
          options: [
            `To complete all steps according to protocol and ensure patient safety`,
            `To finish as quickly as possible`,
            `To demonstrate advanced techniques`,
            `To impress supervisors with complex procedures`
          ],
          correctAnswer: 0,
          explanation: `The primary objective when performing ${skill.name} is to follow proper protocol while maintaining patient safety throughout the procedure.`
        },
        {
          id: Math.floor(Math.random() * 1000000),
          question: `Before beginning ${skill.name}, what should you always do first?`,
          options: [
            `Start the procedure immediately`,
            `Gather equipment and ensure patient consent`,
            `Call for additional help`,
            `Document the procedure`
          ],
          correctAnswer: 1,
          explanation: `Before any medical procedure, you must gather all necessary equipment and ensure proper patient consent and preparation.`
        },
        {
          id: Math.floor(Math.random() * 1000000),
          question: `What is the most important safety consideration during ${skill.name}?`,
          options: [
            `Completing the procedure quickly`,
            `Following universal precautions and maintaining sterile technique`,
            `Using the most advanced equipment available`,
            `Having multiple people assist`
          ],
          correctAnswer: 1,
          explanation: `Universal precautions and maintaining appropriate sterile technique are crucial for patient safety and infection prevention.`
        }
      ];

      // Select a random fallback question
      const fallbackQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
      fallbackQuestion.difficulty = skill.difficultyLevel;
      fallbackQuestion.skillId = skillId;

      return NextResponse.json(fallbackQuestion);
    }

    // Select a random question
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

    return NextResponse.json({
      id: randomQuestion.id,
      question: randomQuestion.question,
      options: randomQuestion.options,
      correctAnswer: randomQuestion.correctAnswer,
      explanation: randomQuestion.explanation || `This relates to the proper execution of ${randomQuestion.question}`,
      difficulty: randomQuestion.difficulty,
      skillId: randomQuestion.skillId
    });

  } catch (error) {
    console.error('Error fetching quiz question:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    );
  }
}

// Submit quiz answer
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const skillId = parseInt(params.id);
    const { questionId, selectedAnswer, stepNumber, responseTimeMs } = await request.json();

    if (selectedAnswer === undefined) {
      return NextResponse.json({ error: 'Selected answer is required' }, { status: 400 });
    }

    // Try to find the question in the database
    let question = await prisma.quizQuestion.findUnique({
      where: { id: questionId }
    });

    let correct = false;
    let correctAnswer = 0;
    let explanation = '';

    if (question) {
      // Database question
      correct = selectedAnswer === question.correctAnswer;
      correctAnswer = question.correctAnswer;
      explanation = question.explanation || `The correct answer is option ${String.fromCharCode(65 + question.correctAnswer)}.`;
    } else {
      // Fallback question (generated on-the-fly)
      correctAnswer = 0; // First option is always correct for fallback questions
      correct = selectedAnswer === correctAnswer;
      explanation = correct ? 
        `Correct! Patient safety and protocol adherence are always the primary objectives.` :
        `Incorrect. The primary objective should always be patient safety and following proper protocol.`;
    }

    // Record the quiz attempt
    try {
      await prisma.quizAttempt.create({
        data: {
          userId: session.user.id,
          questionId: question?.id || questionId,
          skillId: skillId,
          selectedAnswer: selectedAnswer,
          isCorrect: correct,
          attemptDate: new Date()
        }
      });
    } catch (error) {
      // If quiz attempt creation fails (e.g., for fallback questions), continue anyway
      console.log('Could not record quiz attempt:', error);
    }

    return NextResponse.json({
      correct,
      correctAnswer,
      explanation,
      responseTime: responseTimeMs || 0
    });

  } catch (error) {
    console.error('Error submitting quiz answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}
