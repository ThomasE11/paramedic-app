import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generateQuizQuestions } from '@/lib/gemini';
import { DifficultyLevel } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only allow lecturers and admins to generate quizzes
    if (session.user.role !== 'LECTURER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { skillId, questionCount = 5 } = await request.json();

    if (!skillId) {
      return NextResponse.json(
        { error: 'Skill ID is required' },
        { status: 400 }
      );
    }

    // Get skill information
    const skill = await prisma.skill.findUnique({
      where: { id: parseInt(skillId) },
      include: {
        category: true
      }
    });

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Generate questions using Gemini AI
    const questions = await generateQuizQuestions(
      skill.name,
      skill.description,
      skill.objectives,
      skill.difficultyLevel,
      Math.min(questionCount, 10) // Limit to max 10 questions
    );

    // Save questions to database
    const savedQuestions = await Promise.all(
      questions.map(async (question) => {
        return await prisma.quizQuestion.create({
          data: {
            skillId: skill.id,
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            difficulty: question.difficulty as DifficultyLevel,
          }
        });
      })
    );

    return NextResponse.json({
      message: `Generated ${savedQuestions.length} quiz questions successfully`,
      questions: savedQuestions,
      skill: {
        id: skill.id,
        name: skill.name,
        category: skill.category.name
      }
    });

  } catch (error) {
    console.error('Error generating quiz questions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate quiz questions' },
      { status: 500 }
    );
  }
}