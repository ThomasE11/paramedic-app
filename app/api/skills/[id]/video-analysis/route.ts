
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Temporarily allow without authentication for testing
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const skillId = params.id;
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const videoDuration = parseInt(formData.get('duration') as string) || 0;

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Mock skill data for analysis
    const mockSkills = {
      'skill-1': {
        id: 'skill-1',
        name: 'CPR Adult',
        description: 'Adult cardiopulmonary resuscitation technique',
        estimatedTimeMinutes: 5,
        isCritical: true,
        steps: [
          { stepNumber: 1, title: 'Check responsiveness', description: 'Tap shoulders and shout "Are you OK?"' },
          { stepNumber: 2, title: 'Call for help', description: 'Call 911 and get AED if available' },
          { stepNumber: 3, title: 'Check pulse', description: 'Check carotid pulse for 10 seconds' },
          { stepNumber: 4, title: 'Position hands', description: 'Place heel of hand on lower half of breastbone' },
          { stepNumber: 5, title: 'Perform compressions', description: 'Push hard and fast, 2 inches deep, 100-120 per minute' },
        ],
        objectives: [
          'Demonstrate proper hand placement for compressions',
          'Maintain appropriate compression depth and rate',
          'Follow correct sequence of steps',
        ],
      },
      'skill-2': {
        id: 'skill-2',
        name: 'AED Use',
        description: 'Automated External Defibrillator operation',
        estimatedTimeMinutes: 3,
        isCritical: true,
        steps: [
          { stepNumber: 1, title: 'Turn on AED', description: 'Press power button and follow voice prompts' },
          { stepNumber: 2, title: 'Attach pads', description: 'Place pads as shown in diagrams' },
          { stepNumber: 3, title: 'Clear and analyze', description: 'Ensure no one is touching patient during analysis' },
          { stepNumber: 4, title: 'Deliver shock if advised', description: 'Press shock button if AED advises' },
        ],
        objectives: [
          'Demonstrate proper AED pad placement',
          'Follow safety protocols during analysis and shock',
          'Respond appropriately to AED voice commands',
        ],
      },
      'skill-3': {
        id: 'skill-3',
        name: 'IV Insertion',
        description: 'Intravenous line insertion technique',
        estimatedTimeMinutes: 8,
        isCritical: false,
        steps: [
          { stepNumber: 1, title: 'Gather supplies', description: 'Collect IV catheter, tubing, fluids, gloves, tourniquet' },
          { stepNumber: 2, title: 'Apply tourniquet', description: 'Place tourniquet 4-6 inches above insertion site' },
          { stepNumber: 3, title: 'Locate vein', description: 'Palpate for suitable vein' },
          { stepNumber: 4, title: 'Insert catheter', description: 'Insert catheter at 15-30 degree angle' },
          { stepNumber: 5, title: 'Secure and flush', description: 'Secure catheter and flush with saline' },
        ],
        objectives: [
          'Demonstrate proper sterile technique',
          'Select appropriate insertion site',
          'Successfully insert IV catheter',
        ],
      },
    };

    const skill = mockSkills[skillId as keyof typeof mockSkills];

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    // Generate a unique session ID
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Start mock processing (simulate AI analysis)
    processMockVideoAnalysis(sessionId, skill, videoDuration);

    return NextResponse.json({
      sessionId: sessionId,
      status: 'PROCESSING',
      message: 'Video uploaded successfully. Analysis in progress...',
    });

  } catch (error) {
    console.error('Error in video analysis API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Temporarily allow without authentication for testing
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Check if this session exists in our mock storage
    const mockSession = mockVideoSessions.get(sessionId);

    if (!mockSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(mockSession);

  } catch (error) {
    console.error('Error fetching video analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Mock storage for video analysis sessions (in production, this would be a database)
const mockVideoSessions = new Map();

async function processMockVideoAnalysis(sessionId: string, skill: any, videoDuration: number) {
  try {
    console.log(`🤖 Starting Mock AI Teaching Assistant analysis for session ${sessionId}`);
    
    // Create initial session
    const session = {
      id: sessionId,
      userId: 'student-1',
      skillId: skill.id,
      videoPath: `/videos/mock-${sessionId}.webm`,
      videoDuration: videoDuration,
      status: 'PROCESSING',
      skill: skill,
      analysisResults: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store in mock storage
    mockVideoSessions.set(sessionId, session);

    // Simulate processing time (10-15 seconds)
    setTimeout(() => {
      const mockAnalysisResult = generateMockAnalysisResult(skill);
      
      // Update session with results
      session.status = 'COMPLETED';
      session.analysisResults = [mockAnalysisResult];
      session.updatedAt = new Date();
      
      mockVideoSessions.set(sessionId, session);
      
      console.log(`🎉 Mock AI Teaching Assistant analysis completed for session ${sessionId}`);
    }, 12000); // 12 seconds delay

  } catch (error) {
    console.error('Error processing mock video analysis:', error);
    
    // Update session status to failed
    const session = mockVideoSessions.get(sessionId);
    if (session) {
      session.status = 'FAILED';
      session.updatedAt = new Date();
      mockVideoSessions.set(sessionId, session);
    }
    
    throw error;
  }
}

function generateMockAnalysisResult(skill: any) {
  // Generate realistic mock analysis based on skill type
  const baseScores = {
    'skill-1': { technique: 85, sequence: 90, timing: 80, communication: 75 }, // CPR
    'skill-2': { technique: 92, sequence: 88, timing: 95, communication: 85 }, // AED
    'skill-3': { technique: 70, sequence: 75, timing: 65, communication: 80 }, // IV
  };

  const scores = baseScores[skill.id as keyof typeof baseScores] || { technique: 75, sequence: 80, timing: 70, communication: 75 };
  const overallScore = Math.round((scores.technique + scores.sequence + scores.timing + scores.communication) / 4);

  const mockAnalyses = {
    'skill-1': {
      overallFeedback: "Excellent demonstration of CPR technique! Your compression depth and rate were consistently within guidelines. You showed confidence throughout the procedure and maintained good body mechanics. Focus on reducing hesitation between compressions and rescue breaths to improve flow.",
      strengths: [
        "Perfect hand placement on lower half of breastbone",
        "Maintained compression depth of 2+ inches throughout",
        "Clear, loud communication when checking responsiveness",
        "Good body positioning to maximize compression effectiveness"
      ],
      areasForImprovement: [
        "Slight delay between compression cycles - aim for minimal interruptions",
        "Could improve rescue breath delivery technique",
        "Remember to reassess pulse after 2 minutes of CPR"
      ],
      specificRecommendations: [
        "Practice with metronome to maintain consistent 100-120 BPM rate",
        "Work on smooth transitions between compressions and rescue breaths",
        "Review proper bag-mask ventilation technique"
      ],
      detectedSteps: [1, 2, 3, 4, 5],
      missedSteps: [],
      incorrectSteps: [],
      audioTranscription: "Are you okay? Are you okay? Sir, can you hear me? I'm going to start CPR. Calling 911 now. Starting compressions... one, two, three, four, five...",
    },
    'skill-2': {
      overallFeedback: "Outstanding AED performance! You followed all safety protocols perfectly and demonstrated excellent situational awareness. Your pad placement was textbook perfect, and you clearly understood the importance of ensuring no one was touching the patient during analysis and shock delivery.",
      strengths: [
        "Perfect AED pad placement - right upper chest, left lower chest",
        "Excellent safety awareness - clearly announced 'clear' before shock",
        "Followed AED voice prompts accurately without hesitation",
        "Maintained professional demeanor throughout emergency situation"
      ],
      areasForImprovement: [
        "Could be slightly faster in initial AED setup",
        "Remember to continue CPR immediately after shock delivery if no pulse"
      ],
      specificRecommendations: [
        "Practice rapid AED deployment scenarios",
        "Review post-shock protocols and pulse checks",
        "Continue excellent safety communication habits"
      ],
      detectedSteps: [1, 2, 3, 4],
      missedSteps: [],
      incorrectSteps: [],
      audioTranscription: "AED is on. Placing pads now. Everyone stand back! Analyzing rhythm. Shock advised. Everyone clear! Delivering shock now. Continuing CPR.",
    },
    'skill-3': {
      overallFeedback: "Good foundation in IV insertion technique! You demonstrated proper sterile technique and showed good understanding of anatomy. Your approach was methodical and safety-conscious. Work on confidence during vein palpation and needle insertion to improve success rate.",
      strengths: [
        "Excellent sterile technique throughout procedure",
        "Proper tourniquet application and timing",
        "Good communication with patient",
        "Appropriate site selection and preparation"
      ],
      areasForImprovement: [
        "Hesitation during vein palpation - trust your assessment",
        "Needle insertion angle could be slightly shallower",
        "Work on advancing catheter more smoothly after flashback"
      ],
      specificRecommendations: [
        "Practice vein palpation on different arm models",
        "Review insertion angle technique (15-30 degrees)",
        "Practice one-handed catheter advancement technique"
      ],
      detectedSteps: [1, 2, 3, 4, 5],
      missedSteps: [],
      incorrectSteps: [],
      audioTranscription: "I'm going to start an IV line now. You'll feel a small stick. Tourniquet is on. I can feel a good vein here. Inserting now. Got it! Removing tourniquet. Flushing line.",
    },
  };

  const analysis = mockAnalyses[skill.id as keyof typeof mockAnalyses] || mockAnalyses['skill-1'];

  return {
    id: `result-${Date.now()}`,
    sessionId: '',
    overallScore: overallScore,
    techniqueScore: scores.technique,
    sequenceScore: scores.sequence,
    timingScore: scores.timing,
    communicationScore: scores.communication,
    overallFeedback: analysis.overallFeedback,
    strengths: analysis.strengths,
    areasForImprovement: analysis.areasForImprovement,
    specificRecommendations: analysis.specificRecommendations,
    stepAnalysis: skill.steps.map((step: any, index: number) => ({
      stepNumber: step.stepNumber,
      detected: !analysis.missedSteps.includes(step.stepNumber),
      accuracy: Math.max(70, scores.technique + Math.random() * 20 - 10),
      timing: Math.max(70, scores.timing + Math.random() * 20 - 10),
      feedback: `Step ${step.stepNumber} (${step.title}) was ${Math.random() > 0.3 ? 'performed well' : 'needs improvement'}. ${step.description}`,
      criticalErrors: Math.random() > 0.8 ? [`Critical error in ${step.title.toLowerCase()}`] : [],
      suggestions: [`Practice ${step.title.toLowerCase()} technique`, `Review ${step.title.toLowerCase()} protocols`],
      timestampMoments: [`${Math.floor(Math.random() * 3)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`],
    })),
    audioTranscription: analysis.audioTranscription,
    detectedSteps: analysis.detectedSteps,
    missedSteps: analysis.missedSteps,
    incorrectSteps: analysis.incorrectSteps,
    timestampAnalysis: {
      excellentMoments: [
        {
          time: "0:45",
          description: "Perfect technique demonstration",
          skill: "Technique"
        },
        {
          time: "2:30",
          description: "Clear professional communication",
          skill: "Communication"
        }
      ],
      improvementMoments: [
        {
          time: "1:15",
          description: "Minor hesitation in procedure",
          skill: "Timing",
          suggestion: "Practice smooth transitions between steps"
        }
      ]
    },
    educationalRecommendations: analysis.specificRecommendations,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
