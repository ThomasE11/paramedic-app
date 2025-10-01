import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      command,
      mode = 'case_study',
      moduleContext,
      studentContext,
      brainstormingSession,
      conversationHistory = [],
      specialty,
      difficulty = 'intermediate',
      preferences = {},
      userId,
      conversationId,
      actionMode = false,
      fileInfo = null
    } = body;

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

    // Get comprehensive context data for dynamic AI
    const [students, modules, classSessions, assignments, subjects] = await Promise.all([
      prisma.student.findMany({
        include: {
          module: true,
          notes: {
            orderBy: { createdAt: 'desc' },
            take: 5
          },
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
      prisma.module.findMany(),
      prisma.classSession.findMany({
        orderBy: { date: 'desc' },
        take: 20,
        include: {
          attendance: true
        }
      }),
      prisma.assignment.findMany({
        include: {
          module: true,
          submissions: true
        }
      }),
      prisma.subject.findMany()
    ]);

    // Build conversation context for memory
    const conversationContext = conversationHistory.length > 0
      ? `\n\nCONVERSATION HISTORY (Last 5 messages):\n${conversationHistory.slice(-5).map((msg: any) =>
          `${msg.type === 'user' ? 'USER' : 'ASSISTANT'}: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}`
        ).join('\n')}\n`
      : '';

    // Dynamic system prompt for comprehensive AI assistant
    const systemPrompt = actionMode ?
    `You are CLAUDIA - the Comprehensive Learning And University Database Intelligence Assistant for HCT Al Ain EMS Program. You can perform ANY administrative or educational task through natural language commands.

🎯 DYNAMIC CAPABILITIES:
You can dynamically perform ANY operation on this student management system including:

STUDENT OPERATIONS:
- Add/update/delete student records
- Modify student information (name, email, phone, module)
- Add notes to student profiles
- Search and filter students
- Update student attendance rates
- Create student progress reports

ATTENDANCE MANAGEMENT:
- Mark attendance for individual students or entire classes
- Update attendance rates and statistics
- Create attendance reports
- Modify historical attendance records
- Generate attendance summaries

CLASS & SCHEDULE OPERATIONS:
- Create new class sessions
- Schedule classes and manage timetables
- Update class information
- Manage class rosters

ASSIGNMENT & GRADING:
- Create new assignments
- Update assignment details
- Manage submissions
- Generate grade reports
- Create rubrics and evaluation criteria
- Process uploaded document files (PDF/Word)
- Extract text from rubrics and student submissions
- Automatically grade assignments using uploaded rubrics
- Create assignments from uploaded rubric documents

MODULE & CURRICULUM:
- Create or modify modules
- Update module information
- Manage subject associations
- Track module performance

EMAIL & COMMUNICATION:
- Send emails to students or groups
- Create email templates
- Bulk communication management

REPORTING & ANALYTICS:
- Generate comprehensive reports
- Create data exports
- Analyze student performance
- Track attendance trends

CURRENT SYSTEM STATE:
- Institution: HCT Al Ain EMS Program
- User: ${user.name} (${user.role})
- Total Students: ${students.length}
- Active Modules: ${modules.length}
- Recent Class Sessions: ${classSessions.length}
- Active Assignments: ${assignments.length}

STUDENTS DATABASE:
${students.slice(0, 20).map(s => `
- ID: ${s.studentId} | Name: ${s.fullName} | Module: ${s.module?.code || 'None'}
  Email: ${s.email} | Recent Notes: ${s.notes?.slice(0, 1).map(n => n.content).join('; ') || 'None'}
  Attendance: ${s.attendance.length} records`).join('\n')}
${students.length > 20 ? `\n... and ${students.length - 20} more students` : ''}

MODULES:
${modules.map(m => `- ${m.code}: ${m.name} (${students.filter(s => s.moduleId === m.id).length} students)`).join('\n')}

RECENT CLASSES:
${classSessions.slice(0, 10).map(c => `- ${c.title} (${c.date}) - ${c.attendance.length} attendance records`).join('\n')}

ASSIGNMENTS:
${assignments.slice(0, 10).map(a => `- ${a.title} (${a.module?.code}) - ${a.submissions?.length || 0} submissions`).join('\n')}

🤖 RESPONSE FORMAT:
Always respond in JSON format with this structure:
{
  "understood": true/false,
  "intent": "brief description of what you understood",
  "actions": [
    {
      "type": "UPDATE_STUDENT_NOTE|UPDATE_ATTENDANCE|CREATE_STUDENT|UPDATE_STUDENT|DELETE_STUDENT|CREATE_CLASS|SEND_EMAIL|CREATE_ASSIGNMENT|GENERATE_REPORT|SEARCH|etc",
      "description": "what this action does",
      "target": "student_id or entity_id",
      "parameters": {...},
      "sql_equivalent": "what SQL operation this represents"
    }
  ],
  "confirmation": "human readable summary of all actions to be taken",
  "warnings": ["any potential issues or confirmations needed"],
  "success": true/false,
  "data": {...results...},
  "follow_up": "suggested next steps or questions"
}

🎯 COMMAND EXAMPLES:
"Student H00123456 is struggling - add note and set attendance to 75%"
"Create a new assignment for AEM230 module due next Friday"
"Send email to all HEM2903 students about upcoming exam"
"Create a rubric from the uploaded PDF file for HEM3923"
"Grade this student submission using the uploaded rubric"
"Create an assignment from the uploaded rubric file with due date next week"
"Generate attendance report for this month"
"Add new student: John Smith, j.smith@hct.ac.ae, AEM230"
"Schedule practical class for HEM3903 tomorrow at 10 AM"
"Mark all students present for today's HEM2903 class"
"Update Ahmed's phone number to +971501234567"

COMMAND: "${command}"

Analyze this command and determine what actions need to be performed. Be creative and comprehensive - you can do ANYTHING the system supports!`
    :
    `You are an advanced AI assistant specialized in Emergency Medical Services (EMS) education at Higher Colleges of Technology (HCT) Al Ain Campus. You excel at creating complex, realistic medical scenarios and educational content.

CORE EXPERTISE:

EDUCATIONAL EXPERTISE:
- Emergency Medical Services curriculum and training
- Patient assessment and care protocols
- Medical emergencies and conditions
- Clinical case study development with complex scenarios
- Student engagement and learning strategies
- Assessment design and rubrics
- Scenario-based learning

CURRENT CONTEXT:
- Institution: HCT Al Ain EMS Program
- User: ${user.name} (${user.role})
- Mode: ${mode}
- Specialty Focus: ${specialty || 'General EMS'}
- Difficulty Level: ${difficulty}
- Total Students: ${students.length}
- Active Modules:
${modules.map(m => `  • ${m.code}: ${m.name} (${students.filter(s => s.moduleId === m.id).length} students)`).join('\n')}

MODULE SPECIALIZATIONS:
- AEM230: Apply Clinical Practicum 1 AMB - Diploma-level ambulance clinical training
- HEM2903: Ambulance 1 Practical Group - Basic ambulance skills and procedures
- HEM3903: Ambulance Practicum III - Advanced ambulance care and protocols
- HEM3923: Responder Practicum I - First responder emergency care and airway management

ENHANCED CAPABILITIES FOR COMPLEX SCENARIOS:
- Create detailed respiratory emergency cases including ARDS, ALS complications, Myasthenia Gravis, Guillain-Barré syndrome
- Generate neurological emergencies with respiratory involvement
- Design medication-induced respiratory depression scenarios
- Develop severe infection cases with sepsis and respiratory failure
- Create multi-system failure scenarios for advanced students
- Generate multiple related cases for group assignments
- Handle complex requests like "create 6 different respiratory cases" by providing detailed, varied scenarios
- Adapt case complexity based on student level and module requirements

SPECIAL FOCUS ON RESPIRATORY EMERGENCIES:
- ARDS (Acute Respiratory Distress Syndrome) with realistic progression
- ALS (Amyotrophic Lateral Sclerosis) with respiratory muscle weakness
- Myasthenia Gravis crisis with respiratory failure
- Guillain-Barré syndrome with ascending paralysis affecting breathing
- Medication-induced respiratory depression (opioids, sedatives)
- Severe pneumonia with sepsis and multi-organ involvement
- Complex airway management scenarios
- Ventilator-dependent patients in emergency situations

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
- Complex respiratory emergencies (ARDS, ALS complications, Myasthenia Gravis, Guillain-Barré syndrome)
- Neurological conditions with respiratory involvement (Stroke, Seizures, TBI)
- Medication-induced respiratory depression and complications
- Severe infections with sepsis and respiratory failure
- Trauma and injuries (MVA, Falls, Burns)
- Medical emergencies (Diabetes, Allergic reactions)
- Psychiatric emergencies
- Pediatric and geriatric considerations
- Multi-system failure scenarios

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

CONTEXT UNDERSTANDING RULES:
- When user says "create six of them" or "make six cases", refer to the previous case type discussed
- When user mentions "students in this module", refer to the module context provided
- When user asks for "email to students", prepare email content for the specified module
- Maintain conversation continuity by referencing previous cases, topics, and requests
- For follow-up requests, build upon previously generated content

RESPONSE FORMAT (JSON):
{
  "understood": true/false,
  "mode": "case_study|brainstorm|educational_content|student_specific|module_content|multiple_cases|email_composition",
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
  "multipleCases": [
    {
      "title": "Case 1 Title",
      "description": "Case 1 description",
      "scenario": { /* same structure as above */ }
    }
  ],
  "emailContent": {
    "subject": "Email subject line",
    "body": "Email body content",
    "recipients": ["student emails or module info"]
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
- Encourage critical thinking and clinical reasoning
- When creating multiple cases, ensure variety in presentations and complexity
- For complex requests like "6 respiratory cases", provide detailed scenarios for each

${conversationContext}

IMPORTANT: Respond ONLY with valid JSON. Do not include any text before or after the JSON object.`;

    const requestBody = {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `${command}${fileInfo ? `

📎 ATTACHED FILE:
- Filename: ${fileInfo.fileName}
- Type: ${fileInfo.type === 'rubric' ? 'Rubric Document' : 'Student Submission'}
- Size: ${Math.round(fileInfo.fileSize / 1024)}KB
- Extracted Text: ${fileInfo.extractedText || 'No text extracted'}
- Analysis: ${JSON.stringify(fileInfo.analysis, null, 2)}

Please process this attached file according to my request.` : ''}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 3000, // Optimized for faster response
      temperature: 0.6, // Balanced creativity and accuracy
      stream: false // Ensure we get complete response
    };

    console.log('Educational AI: Sending request to DeepSeek API...');

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);

      // Provide more user-friendly error messages
      let userMessage = 'AI Service temporarily unavailable';
      if (response.status === 429) {
        userMessage = 'AI service is busy. Please try again in a few moments.';
      } else if (response.status === 401) {
        userMessage = 'AI service authentication failed. Please contact support.';
      } else if (response.status >= 500) {
        userMessage = 'AI service is experiencing technical difficulties. Please try again later.';
      }

      return NextResponse.json({
        understood: false,
        error: userMessage,
        details: `API Error ${response.status}`,
        mode: mode
      }, { status: 200 }); // Return 200 to avoid client-side error handling
    }

    const aiResponseData = await response.json();
    const content = aiResponseData.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({
        understood: false,
        error: 'AI service returned empty response. Please try again.',
        mode: mode
      }, { status: 200 });
    }

    let aiResponse;
    try {
      // Clean the content in case there's extra text
      const cleanContent = content.trim();
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}') + 1;

      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonContent = cleanContent.substring(jsonStart, jsonEnd);
        aiResponse = JSON.parse(jsonContent);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw content:', content);
      return NextResponse.json({
        understood: false,
        error: 'AI response format error. Please try rephrasing your request.',
        details: 'Response parsing failed',
        mode: mode
      }, { status: 200 });
    }

    // If in action mode, execute the actions
    if (actionMode && aiResponse.actions && aiResponse.actions.length > 0) {
      const executionResults = [];

      for (const action of aiResponse.actions) {
        try {
          const result = await executeAction(action, user.id, prisma);
          executionResults.push(result);
        } catch (error) {
          executionResults.push({
            type: action.type,
            success: false,
            error: error.message
          });
        }
      }

      // Log the action execution
      await prisma.activity.create({
        data: {
          type: 'ai_dynamic_action_performed',
          description: `CLAUDIA executed: ${aiResponse.confirmation}`,
          metadata: {
            command: command,
            actions: aiResponse.actions,
            results: executionResults,
            performedBy: user.name || user.email,
            timestamp: new Date().toISOString()
          }
        }
      });

      return NextResponse.json({
        ...aiResponse,
        success: true,
        executionResults,
        generatedAt: new Date().toISOString(),
        actionMode: true,
        context: {
          user: user.name,
          institution: 'HCT Al Ain',
          program: 'Emergency Medical Services'
        }
      });
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

    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('DeepSeek API fetch error:', fetchError);

      if (fetchError.name === 'AbortError') {
        return NextResponse.json({
          understood: false,
          error: 'Request timed out. The AI service is taking too long to respond. Please try a simpler request.',
          mode: mode
        }, { status: 200 });
      }

      return NextResponse.json({
        understood: false,
        error: 'Failed to connect to AI service. Please try again.',
        mode: mode
      }, { status: 200 });
    }

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

// Dynamic action execution function
async function executeAction(action: any, userId: string, prisma: any) {
  switch (action.type) {
    case 'UPDATE_STUDENT_NOTE':
      return await updateStudentNote(action, userId, prisma);

    case 'UPDATE_ATTENDANCE':
      return await updateAttendance(action, prisma);

    case 'CREATE_STUDENT':
      return await createStudent(action, prisma);

    case 'UPDATE_STUDENT':
      return await updateStudent(action, prisma);

    case 'CREATE_CLASS':
      return await createClass(action, prisma);

    case 'CREATE_ASSIGNMENT':
      return await createAssignment(action, userId, prisma);

    case 'CREATE_RUBRIC_FROM_FILE':
      return await createRubricFromFile(action, userId, prisma);

    case 'GRADE_SUBMISSION':
      return await gradeSubmission(action, userId, prisma);

    case 'CREATE_ASSIGNMENT_FROM_RUBRIC':
      return await createAssignmentFromRubric(action, userId, prisma);

    case 'UPDATE_STUDENT_GPA':
      return await updateStudentGPA(action, prisma);

    case 'TRACK_STUDENT_PROGRESS':
      return await trackStudentProgress(action, userId, prisma);

    case 'SEND_EMAIL':
      return await sendEmail(action, prisma);

    case 'MARK_ATTENDANCE':
      return await markAttendance(action, prisma);

    case 'GENERATE_REPORT':
      return await generateReport(action, prisma);

    case 'SEARCH':
      return await searchOperation(action, prisma);

    case 'UPDATE_MODULE':
      return await updateModule(action, prisma);

    case 'CREATE_MODULE':
      return await createModule(action, prisma);

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

// Individual action implementations
async function updateStudentNote(action: any, userId: string, prisma: any) {
  const { target, parameters } = action;

  // Find student by various identifiers
  const student = await findStudent(target, prisma);
  if (!student) throw new Error(`Student not found: ${target}`);

  const note = await prisma.note.create({
    data: {
      studentId: student.id,
      userId,
      title: parameters.title || `AI Note - ${new Date().toLocaleDateString()}`,
      content: parameters.content,
      category: parameters.category || 'academic'
    }
  });

  return {
    type: action.type,
    success: true,
    data: { note, student: { id: student.id, name: student.fullName } }
  };
}

async function updateAttendance(action: any, prisma: any) {
  const { target, parameters } = action;
  const student = await findStudent(target, prisma);
  if (!student) throw new Error(`Student not found: ${target}`);

  const attendanceRecords = await prisma.attendance.findMany({
    where: { studentId: student.id },
    include: { classSession: true }
  });

  const totalSessions = attendanceRecords.length;
  const targetRate = parameters.attendanceRate / 100;
  const targetPresentSessions = Math.round(totalSessions * targetRate);

  // Update most recent records to match target rate
  const sortedRecords = attendanceRecords.sort((a, b) =>
    new Date(b.classSession.date).getTime() - new Date(a.classSession.date).getTime()
  );

  let updated = 0;
  for (let i = 0; i < Math.min(targetPresentSessions, sortedRecords.length); i++) {
    if (sortedRecords[i].status !== 'present') {
      await prisma.attendance.update({
        where: { id: sortedRecords[i].id },
        data: { status: 'present' }
      });
      updated++;
    }
  }

  for (let i = targetPresentSessions; i < sortedRecords.length; i++) {
    if (sortedRecords[i].status !== 'absent') {
      await prisma.attendance.update({
        where: { id: sortedRecords[i].id },
        data: { status: 'absent' }
      });
      updated++;
    }
  }

  return {
    type: action.type,
    success: true,
    data: {
      student: { id: student.id, name: student.fullName },
      updatedRecords: updated,
      targetRate: parameters.attendanceRate,
      totalSessions
    }
  };
}

async function createStudent(action: any, prisma: any) {
  const { parameters } = action;

  // Find module if specified
  let moduleId = null;
  if (parameters.moduleCode) {
    const module = await prisma.module.findFirst({
      where: { code: parameters.moduleCode }
    });
    moduleId = module?.id;
  }

  const student = await prisma.student.create({
    data: {
      studentId: parameters.studentId,
      firstName: parameters.firstName,
      lastName: parameters.lastName,
      fullName: `${parameters.firstName} ${parameters.lastName}`,
      email: parameters.email,
      phone: parameters.phone || null,
      moduleId
    },
    include: { module: true }
  });

  return {
    type: action.type,
    success: true,
    data: { student }
  };
}

async function updateStudent(action: any, prisma: any) {
  const { target, parameters } = action;
  const student = await findStudent(target, prisma);
  if (!student) throw new Error(`Student not found: ${target}`);

  // Handle module update if specified
  if (parameters.moduleCode) {
    const module = await prisma.module.findFirst({
      where: { code: parameters.moduleCode }
    });
    if (module) parameters.moduleId = module.id;
    delete parameters.moduleCode;
  }

  const updatedStudent = await prisma.student.update({
    where: { id: student.id },
    data: parameters,
    include: { module: true }
  });

  return {
    type: action.type,
    success: true,
    data: { student: updatedStudent }
  };
}

async function createClass(action: any, prisma: any) {
  const { parameters } = action;

  // Find module if specified
  let moduleId = null;
  if (parameters.moduleCode) {
    const module = await prisma.module.findFirst({
      where: { code: parameters.moduleCode }
    });
    moduleId = module?.id;
  }

  const classSession = await prisma.classSession.create({
    data: {
      title: parameters.title,
      description: parameters.description || '',
      date: new Date(parameters.date),
      startTime: parameters.startTime || '09:00',
      endTime: parameters.endTime || '10:00',
      location: parameters.location || 'TBD',
      moduleId,
      maxAttendees: parameters.maxAttendees || 50
    },
    include: { module: true }
  });

  return {
    type: action.type,
    success: true,
    data: { classSession }
  };
}

async function createAssignment(action: any, userId: string, prisma: any) {
  const { parameters } = action;

  // Find module
  const module = await prisma.module.findFirst({
    where: { code: parameters.moduleCode }
  });

  const assignment = await prisma.assignment.create({
    data: {
      title: parameters.title,
      description: parameters.description || '',
      type: parameters.type || 'written_assignment',
      moduleId: module?.id,
      dueDate: parameters.dueDate ? new Date(parameters.dueDate) : null,
      maxScore: parameters.maxScore || 100,
      createdBy: userId
    },
    include: { module: true }
  });

  return {
    type: action.type,
    success: true,
    data: { assignment }
  };
}

async function sendEmail(action: any, prisma: any) {
  // This would integrate with your email service
  return {
    type: action.type,
    success: true,
    data: { message: 'Email functionality would be implemented here' }
  };
}

async function markAttendance(action: any, prisma: any) {
  const { parameters } = action;

  // Implementation for marking attendance
  return {
    type: action.type,
    success: true,
    data: { message: 'Attendance marking would be implemented here' }
  };
}

async function generateReport(action: any, prisma: any) {
  const { parameters } = action;

  // Implementation for generating reports
  return {
    type: action.type,
    success: true,
    data: { message: 'Report generation would be implemented here' }
  };
}

async function searchOperation(action: any, prisma: any) {
  const { parameters } = action;

  const results = await prisma.student.findMany({
    where: {
      OR: [
        { fullName: { contains: parameters.query, mode: 'insensitive' } },
        { studentId: { contains: parameters.query, mode: 'insensitive' } },
        { email: { contains: parameters.query, mode: 'insensitive' } }
      ]
    },
    include: { module: true }
  });

  return {
    type: action.type,
    success: true,
    data: { results }
  };
}

async function updateModule(action: any, prisma: any) {
  const { target, parameters } = action;

  const module = await prisma.module.update({
    where: { code: target },
    data: parameters
  });

  return {
    type: action.type,
    success: true,
    data: { module }
  };
}

async function createModule(action: any, prisma: any) {
  const { parameters } = action;

  const module = await prisma.module.create({
    data: {
      code: parameters.code,
      name: parameters.name,
      description: parameters.description || ''
    }
  });

  return {
    type: action.type,
    success: true,
    data: { module }
  };
}

// Helper function to find students by various identifiers
async function findStudent(identifier: string, prisma: any) {
  return await prisma.student.findFirst({
    where: {
      OR: [
        { id: identifier },
        { studentId: identifier },
        { fullName: { contains: identifier, mode: 'insensitive' } },
        { firstName: { contains: identifier, mode: 'insensitive' } },
        { lastName: { contains: identifier, mode: 'insensitive' } },
        { email: { contains: identifier, mode: 'insensitive' } }
      ]
    },
    include: { module: true }
  });
}

// File processing action implementations
async function createRubricFromFile(action: any, userId: string, prisma: any) {
  const { parameters } = action;
  const { fileInfo, rubricName, subjectId, maxScore } = parameters;

  try {
    // Create rubric from extracted file content
    const rubric = await prisma.rubric.create({
      data: {
        name: rubricName || `Rubric from ${fileInfo.fileName}`,
        description: `Auto-generated from uploaded file: ${fileInfo.fileName}`,
        subjectId: subjectId,
        maxScore: maxScore || 100,
        criteria: fileInfo.analysis || {},
        createdBy: userId,
        extractedFrom: {
          fileName: fileInfo.fileName,
          uploadedAt: fileInfo.uploadedAt,
          extractedText: fileInfo.extractedText
        }
      }
    });

    return {
      success: true,
      message: `Created rubric "${rubric.name}" from uploaded file`,
      data: rubric
    };
  } catch (error) {
    console.error('Failed to create rubric from file:', error);
    return {
      success: false,
      message: 'Failed to create rubric from uploaded file',
      error: error.message
    };
  }
}

async function gradeSubmission(action: any, userId: string, prisma: any) {
  const { parameters } = action;
  const { fileInfo, studentId, assignmentId, rubricId } = parameters;

  try {
    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        studentId,
        assignmentId,
        content: fileInfo.extractedText,
        extractedText: fileInfo.extractedText,
        fileName: fileInfo.fileName,
        fileSize: fileInfo.fileSize,
        analysis: fileInfo.analysis,
        status: 'submitted',
        submittedAt: new Date()
      }
    });

    // Trigger AI evaluation if rubric is provided
    if (rubricId) {
      try {
        const evaluationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3003'}/api/evaluate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            submissionId: submission.id,
            rubricId: rubricId
          })
        });

        if (evaluationResponse.ok) {
          const evaluationResult = await evaluationResponse.json();

          // Update student record with new score
          const totalScore = evaluationResult.evaluation.totalScore;
          const maxScore = evaluationResult.evaluation.assignment?.maxScore || 100;
          const gradePercentage = (totalScore / maxScore) * 100;

          // Add note to student record about the evaluation
          await prisma.note.create({
            data: {
              studentId,
              userId,
              title: `Automatic Grade: ${submission.assignment?.title || 'Assignment'}`,
              content: `Score: ${totalScore}/${maxScore} (${gradePercentage.toFixed(1)}%)\n\nAI Feedback: ${evaluationResult.evaluation.feedback}\n\nSuggestions: ${evaluationResult.evaluation.suggestions}`,
              category: 'academic'
            }
          });

          // Create activity record
          await prisma.activity.create({
            data: {
              studentId,
              type: 'grade_received',
              description: `Received grade for ${submission.assignment?.title || 'assignment'}: ${totalScore}/${maxScore}`,
              metadata: {
                submissionId: submission.id,
                evaluationId: evaluationResult.evaluation.id,
                score: totalScore,
                maxScore,
                percentage: gradePercentage
              }
            }
          });

          return {
            success: true,
            message: `Graded submission and updated student record automatically`,
            data: {
              submission,
              evaluation: evaluationResult.evaluation,
              gradePercentage
            }
          };
        }
      } catch (evalError) {
        console.error('Failed to auto-evaluate:', evalError);
      }
    }

    return {
      success: true,
      message: `Created submission record for student`,
      data: submission
    };
  } catch (error) {
    console.error('Failed to grade submission:', error);
    return {
      success: false,
      message: 'Failed to process submission',
      error: error.message
    };
  }
}

async function createAssignmentFromRubric(action: any, userId: string, prisma: any) {
  const { parameters } = action;
  const { fileInfo, assignmentTitle, moduleId, dueDate, maxScore } = parameters;

  try {
    // Extract assignment details from rubric file
    const extractedCriteria = fileInfo.analysis?.criteria || [];
    const totalScore = fileInfo.analysis?.scoring?.reduce((sum: number, item: any) => sum + item.score, 0) || maxScore || 100;

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        title: assignmentTitle || `Assignment from ${fileInfo.fileName}`,
        description: `Created from uploaded rubric: ${fileInfo.fileName}`,
        moduleId,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week
        maxScore: totalScore,
        type: 'assessment',
        createdBy: userId,
        rubricSource: {
          fileName: fileInfo.fileName,
          extractedText: fileInfo.extractedText,
          criteria: extractedCriteria
        }
      }
    });

    // Also create a rubric for this assignment
    const rubric = await prisma.rubric.create({
      data: {
        name: `${assignment.title} Rubric`,
        description: `Rubric for ${assignment.title}`,
        assignmentId: assignment.id,
        maxScore: totalScore,
        criteria: fileInfo.analysis,
        createdBy: userId
      }
    });

    return {
      success: true,
      message: `Created assignment "${assignment.title}" with rubric from uploaded file`,
      data: { assignment, rubric }
    };
  } catch (error) {
    console.error('Failed to create assignment from rubric:', error);
    return {
      success: false,
      message: 'Failed to create assignment from rubric file',
      error: error.message
    };
  }
}

async function updateStudentGPA(action: any, prisma: any) {
  const { parameters } = action;
  const { studentId, newGPA, reason } = parameters;

  try {
    const student = await findStudent(studentId, prisma);
    if (!student) {
      return {
        success: false,
        message: 'Student not found'
      };
    }

    const oldGPA = student.currentGPA;

    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: { currentGPA: newGPA }
    });

    // Create activity record
    await prisma.activity.create({
      data: {
        studentId: student.id,
        type: 'gpa_updated',
        description: `GPA updated from ${oldGPA || 'N/A'} to ${newGPA}${reason ? ` - ${reason}` : ''}`,
        metadata: {
          oldGPA,
          newGPA,
          reason
        }
      }
    });

    return {
      success: true,
      message: `Updated GPA for ${student.fullName} from ${oldGPA || 'N/A'} to ${newGPA}`,
      data: updatedStudent
    };
  } catch (error) {
    console.error('Failed to update student GPA:', error);
    return {
      success: false,
      message: 'Failed to update student GPA',
      error: error.message
    };
  }
}

async function trackStudentProgress(action: any, userId: string, prisma: any) {
  const { parameters } = action;
  const { studentId, assignmentId, moduleId, progressNotes, score, areas_of_improvement } = parameters;

  try {
    const student = await findStudent(studentId, prisma);
    if (!student) {
      return {
        success: false,
        message: 'Student not found'
      };
    }

    // Create comprehensive progress note
    const noteContent = `Progress Update:
${progressNotes || 'General progress tracking'}

${score ? `Recent Score: ${score}` : ''}
${areas_of_improvement ? `Areas for Improvement: ${areas_of_improvement}` : ''}

Tracked automatically by CLAUDIA AI`;

    const note = await prisma.note.create({
      data: {
        studentId: student.id,
        userId,
        title: `Progress Tracking - ${new Date().toLocaleDateString()}`,
        content: noteContent,
        category: 'academic'
      }
    });

    // Create activity record
    await prisma.activity.create({
      data: {
        studentId: student.id,
        type: 'progress_tracked',
        description: `Progress tracked and updated`,
        metadata: {
          noteId: note.id,
          assignmentId,
          moduleId,
          score,
          trackedBy: 'CLAUDIA_AI'
        }
      }
    });

    return {
      success: true,
      message: `Progress tracked for ${student.fullName}`,
      data: { note, student }
    };
  } catch (error) {
    console.error('Failed to track student progress:', error);
    return {
      success: false,
      message: 'Failed to track student progress',
      error: error.message
    };
  }
}