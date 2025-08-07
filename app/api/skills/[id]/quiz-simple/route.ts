import { NextRequest, NextResponse } from 'next/server';
export const dynamic = "force-dynamic";
export const runtime = 'nodejs';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Simple quiz system that doesn't rely on database storage
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const skillId = params.id;
    
    console.log(`Generating quiz for skill: ${skillId}`);

    // Generate skill-specific questions based on skill ID
    const questions = generateSkillQuestions(skillId);
    
    // Select a random question
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

    console.log(`Generated question for skill ${skillId}:`, randomQuestion.question);

    return NextResponse.json(randomQuestion);

  } catch (error) {
    console.error('Error generating quiz question:', error);
    return NextResponse.json(
      { error: 'Failed to generate question' },
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { questionId, selectedAnswer } = await request.json();

    if (selectedAnswer === undefined) {
      return NextResponse.json({ error: 'Selected answer is required' }, { status: 400 });
    }

    // For simple quiz, get the correct answer from the question ID
    const correctAnswer = getCorrectAnswer(questionId);
    const correct = selectedAnswer === correctAnswer;
    const explanation = getExplanation(questionId, correct);

    console.log(`Quiz answer submitted - Question: ${questionId}, Selected: ${selectedAnswer}, Correct: ${correctAnswer}, Is Correct: ${correct}`);

    return NextResponse.json({
      correct,
      correctAnswer,
      explanation
    });

  } catch (error) {
    console.error('Error submitting quiz answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}

function generateSkillQuestions(skillId: string) {
  const baseQuestions = [
    {
      id: 1,
      question: "What is the most important first step before beginning any medical procedure?",
      options: [
        "Gather all necessary equipment and ensure patient consent",
        "Start the procedure immediately to save time",
        "Call for additional assistance",
        "Document the procedure"
      ],
      correctAnswer: 0,
      explanation: "Patient consent and proper equipment preparation are essential before any medical procedure."
    },
    {
      id: 2,
      question: "What safety precaution should ALWAYS be followed during patient care?",
      options: [
        "Work as quickly as possible",
        "Use universal precautions and maintain proper technique",
        "Only use the most expensive equipment",
        "Always have multiple people assist"
      ],
      correctAnswer: 1,
      explanation: "Universal precautions and proper technique are fundamental to patient safety and infection control."
    },
    {
      id: 3,
      question: "When should you stop a procedure?",
      options: [
        "Only when complete",
        "If the patient experiences distress or complications arise",
        "Never, once started",
        "Only if equipment fails"
      ],
      correctAnswer: 1,
      explanation: "Patient safety is paramount - procedures should be stopped if patient distress or complications occur."
    },
    {
      id: 4,
      question: "What is the primary goal of any medical intervention?",
      options: [
        "To demonstrate technical skill",
        "To complete the procedure quickly",
        "To ensure patient safety and optimal outcomes",
        "To use all available equipment"
      ],
      correctAnswer: 2,
      explanation: "Patient safety and achieving optimal clinical outcomes should always be the primary goal."
    },
    {
      id: 5,
      question: "How should you handle unexpected complications during a procedure?",
      options: [
        "Continue without changes",
        "Stop, assess, and modify approach as needed",
        "Speed up the procedure",
        "Ignore and document later"
      ],
      correctAnswer: 1,
      explanation: "When complications arise, it's important to pause, reassess the situation, and modify your approach accordingly."
    }
  ];

  // Add skill-specific questions based on skill type
  const skillSpecificQuestions = getSkillSpecificQuestions(skillId);
  
  return [...baseQuestions, ...skillSpecificQuestions];
}

function getSkillSpecificQuestions(skillId: string) {
  const skillName = skillId.replace(/skill-\d+/, '').toLowerCase();
  
  // CPR related questions
  if (skillName.includes('cpr') || skillId.includes('cpr')) {
    return [
      {
        id: 101,
        question: "What is the correct compression rate for adult CPR?",
        options: [
          "80-100 compressions per minute",
          "100-120 compressions per minute",
          "120-140 compressions per minute",
          "60-80 compressions per minute"
        ],
        correctAnswer: 1,
        explanation: "The AHA recommends 100-120 compressions per minute for effective adult CPR."
      },
      {
        id: 102,
        question: "What is the correct compression depth for adult CPR?",
        options: [
          "1-2 inches (2.5-5 cm)",
          "At least 2 inches (5 cm) but not more than 2.4 inches (6 cm)",
          "2.5-3 inches (6-7.5 cm)",
          "1.5 inches (4 cm)"
        ],
        correctAnswer: 1,
        explanation: "Adult chest compressions should be at least 2 inches (5 cm) deep but not exceed 2.4 inches (6 cm)."
      }
    ];
  }

  // IV related questions
  if (skillName.includes('iv') || skillName.includes('intravenous')) {
    return [
      {
        id: 201,
        question: "What gauge needle is typically used for adult fluid resuscitation?",
        options: [
          "22 gauge",
          "20 gauge", 
          "18 gauge or larger",
          "24 gauge"
        ],
        correctAnswer: 2,
        explanation: "For fluid resuscitation, 18 gauge or larger catheters are preferred for adequate flow rates."
      },
      {
        id: 202,
        question: "What is the first sign of IV infiltration?",
        options: [
          "Severe pain",
          "Swelling and coolness at the site",
          "Bleeding from the insertion site",
          "Rapid infusion of fluids"
        ],
        correctAnswer: 1,
        explanation: "IV infiltration typically presents with swelling, coolness, and discomfort at the insertion site."
      }
    ];
  }

  // Airway management questions
  if (skillName.includes('airway') || skillName.includes('intubation') || skillName.includes('bvm')) {
    return [
      {
        id: 301,
        question: "What is the most important step before attempting intubation?",
        options: [
          "Positioning the patient",
          "Pre-oxygenation with 100% oxygen",
          "Checking equipment",
          "Administering sedation"
        ],
        correctAnswer: 1,
        explanation: "Pre-oxygenation maximizes oxygen reserves and provides the longest safe apnea time during intubation."
      },
      {
        id: 302,
        question: "How do you confirm endotracheal tube placement?",
        options: [
          "Listen for breath sounds only",
          "Use multiple methods: visualization, auscultation, capnography",
          "Check chest rise only",
          "Use capnography alone"
        ],
        correctAnswer: 1,
        explanation: "Multiple confirmation methods should be used to ensure proper ET tube placement and prevent complications."
      }
    ];
  }

  // Default questions for other skills
  return [
    {
      id: 501,
      question: "When performing this skill, what should you monitor continuously?",
      options: [
        "Only the procedure steps",
        "Patient response and vital signs",
        "Equipment function only",
        "Time elapsed"
      ],
      correctAnswer: 1,
      explanation: "Continuous monitoring of patient response and vital signs is essential during any medical procedure."
    }
  ];
}

function getCorrectAnswer(questionId: number): number {
  // Map question IDs to correct answers
  const answerMap: { [key: number]: number } = {
    1: 0, 2: 1, 3: 1, 4: 2, 5: 1,
    101: 1, 102: 1,
    201: 2, 202: 1,
    301: 1, 302: 1,
    501: 1
  };
  
  return answerMap[questionId] || 0;
}

function getExplanation(questionId: number, correct: boolean): string {
  if (correct) {
    return "Correct! You have demonstrated good understanding of this concept.";
  } else {
    const explanations: { [key: number]: string } = {
      1: "Patient consent and equipment preparation are essential before any procedure.",
      2: "Universal precautions and proper technique are fundamental to safe patient care.",
      3: "Patient safety is paramount - always stop if complications arise.",
      4: "Patient safety and optimal outcomes should always be the primary goal.",
      5: "When complications occur, pause to reassess and modify your approach.",
      101: "The AHA guidelines recommend 100-120 compressions per minute for adult CPR.",
      102: "Chest compressions should be at least 2 inches deep but not exceed 2.4 inches.",
      201: "Larger gauge catheters (18G or larger) provide better flow rates for resuscitation.",
      202: "IV infiltration typically causes swelling, coolness, and discomfort at the site.",
      301: "Pre-oxygenation is critical to maximize oxygen reserves before intubation attempts.",
      302: "Multiple confirmation methods ensure proper tube placement and patient safety.",
      501: "Continuous patient monitoring is essential during all medical procedures."
    };
    
    return explanations[questionId] || "Please review the key concepts for this skill.";
  }
}