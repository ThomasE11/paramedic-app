import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { command, mode = 'general', moduleContext, studentContext, brainstormingSession } = body;

    if (!command) {
      return NextResponse.json({ error: 'Command is required' }, { status: 400 });
    }

    // Get API key
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get context data
    const [students, modules] = await Promise.all([
      prisma.student.findMany({
        include: {
          module: true,
          attendance: {
            take: 10,
            orderBy: { markedAt: 'desc' },
            include: {
              classSession: {
                select: {
                  date: true,
                  title: true
                }
              }
            }
          }
        }
      }),
      prisma.module.findMany()
    ]);

    // Create educational system prompt
    const systemPrompt = `You are an advanced AI assistant specialized in Emergency Medical Services (EMS) education at Higher Colleges of Technology (HCT) Al Ain Campus. You are an expert in:

EDUCATIONAL EXPERTISE:
- Emergency Medical Services curriculum and training
- Patient assessment and care protocols
- Medical emergencies and conditions
- Clinical case study development
- Student engagement and learning strategies
- Assessment design and rubrics
- Scenario-based learning

CURRENT CONTEXT:
- Institution: HCT Al Ain EMS Program
- Total Students: ${students.length}
- Active Modules:
${modules.map(m => `  • ${m.code}: ${m.name} (${students.filter(s => s.moduleId === m.id).length} students)`).join('\n')}

MODULE SPECIALIZATIONS:
- AEM230: Apply Clinical Practicum 1 AMB - Diploma-level ambulance clinical training
- HEM2903: Ambulance 1 Practical Group - Basic ambulance skills and procedures
- HEM3903: Ambulance Practicum III - Advanced ambulance care and protocols
- HEM3923: Responder Practicum I - First responder emergency care

CAPABILITIES:
1. **CASE STUDY GENERATION**: Create realistic medical scenarios with:
   - Patient demographics and history
   - Chief complaint and presenting symptoms
   - Vital signs (realistic and condition-appropriate)
   - Physical examination findings
   - Progressive scenario development
   - Learning objectives alignment

2. **EDUCATIONAL CONTENT CREATION**:
   - Lesson plans and learning outcomes
   - Assessment rubrics and marking schemes
   - Practice scenarios and skill stations
   - Student assignments and projects

3. **BRAINSTORMING & REFINEMENT**:
   - Iterative case development
   - Scenario complexity adjustment
   - Multiple difficulty levels
   - Student-specific adaptations

4. **CONTEXTUAL INTELLIGENCE**:
   - Module-specific content alignment
   - Student performance consideration
   - Curriculum standard compliance
   - Real-world application focus

MEDICAL CONDITIONS EXPERTISE:
- Cardiovascular emergencies (AMI, CHF, Arrhythmias)
- Respiratory emergencies (Asthma, COPD, Pneumonia)
- Neurological conditions (Stroke, Seizures, TBI)
- Trauma and injuries (MVA, Falls, Burns)
- Medical emergencies (Diabetes, Allergic reactions)
- Psychiatric emergencies
- Pediatric and geriatric considerations

RESPONSE MODES:
1. **CASE_STUDY**: Generate complete medical scenarios
2. **BRAINSTORM**: Interactive case refinement and development
3. **EDUCATIONAL_CONTENT**: Create lesson plans, assessments
4. **STUDENT_SPECIFIC**: Adapt content for individual students
5. **MODULE_CONTENT**: Create module-specific educational materials

${studentContext ? `
STUDENT CONTEXT:
- Name: ${studentContext.name}
- Module: ${studentContext.module?.code} - ${studentContext.module?.name}
- Attendance Rate: ${studentContext.attendanceRate || 'Unknown'}%
- Recent Performance: ${studentContext.notes ? studentContext.notes.slice(0, 3).join('; ') : 'No specific notes'}
` : ''}

${moduleContext ? `
MODULE FOCUS: ${moduleContext.code} - ${moduleContext.name}
Students in this module: ${students.filter(s => s.moduleId === moduleContext.id).length}
` : ''}

RESPONSE FORMAT (JSON):
{
  "understood": true/false,
  "mode": "case_study|brainstorm|educational_content|student_specific|module_content",
  "content": {
    "title": "scenario or content title",
    "description": "detailed description",
    "learningObjectives": ["objective1", "objective2"],
    "targetModule": "module code",
    "difficulty": "beginner|intermediate|advanced",
    "scenario": {
      "patientInfo": {
        "age": number,
        "gender": "male|female",
        "name": "patient name",
        "medicalHistory": ["condition1", "condition2"]
      },
      "presentation": {
        "chiefComplaint": "main complaint",
        "symptoms": ["symptom1", "symptom2"],
        "vitalSigns": {
          "bloodPressure": "systolic/diastolic mmHg",
          "heartRate": "X bpm",
          "respiratoryRate": "X/min",
          "oxygenSaturation": "X%",
          "temperature": "X°C",
          "bloodGlucose": "X mmol/L (if relevant)"
        },
        "physicalFindings": ["finding1", "finding2"]
      },
      "progression": ["stage1", "stage2", "stage3"],
      "expectedActions": ["action1", "action2"],
      "learningPoints": ["point1", "point2"]
    }
  },
  "brainstormingOptions": {
    "refinements": ["option1", "option2"],
    "variations": ["variation1", "variation2"],
    "difficultyAdjustments": ["easier version", "harder version"]
  },
  "nextSteps": ["suggestion1", "suggestion2"],
  "educationalNotes": "additional teaching points",
  "assessmentIdeas": ["assessment method1", "assessment method2"]
}

CRITICAL GUIDELINES:
- Always create medically accurate and realistic scenarios
- Align content with appropriate module learning objectives
- Consider student level and capabilities
- Include progressive complexity options
- Provide clear learning outcomes
- Support evidence-based practice
- Encourage critical thinking and clinical reasoning`;

    const requestBody = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: command
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.8 // Slightly higher for creative educational content
    };

    console.log('Educational AI: Sending request to DeepSeek API...');

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return NextResponse.json({
        error: `DeepSeek API failed: ${response.status}`,
        details: errorText
      }, { status: 500 });
    }

    const aiResponseData = await response.json();
    const content = aiResponseData.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({
        error: 'No content in AI response'
      }, { status: 500 });
    }

    let aiResponse;
    try {
      aiResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json({
        error: 'Failed to parse AI response',
        details: content
      }, { status: 500 });
    }

    // Log the educational content generation for tracking
    await prisma.activity.create({
      data: {
        type: 'educational_content_generated',
        description: `Generated educational content: ${aiResponse.content?.title || 'Untitled'}`,
        metadata: {
          mode: aiResponse.mode,
          targetModule: aiResponse.content?.targetModule,
          difficulty: aiResponse.content?.difficulty,
          generatedBy: user.name || user.email,
          generatedAt: new Date().toISOString(),
          command: command.substring(0, 100) // First 100 chars of command
        }
      }
    });

    return NextResponse.json({
      ...aiResponse,
      success: true,
      generatedAt: new Date().toISOString(),
      context: {
        user: user.name,
        institution: 'HCT Al Ain',
        program: 'Emergency Medical Services'
      }
    });

  } catch (error) {
    console.error('Educational AI Assistant error:', error);
    return NextResponse.json(
      {
        understood: false,
        error: 'Educational AI service temporarily unavailable',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}