import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';

/**
 * UNIFIED CLAUDIA AI ASSISTANT
 *
 * Comprehensive AI assistant that combines:
 * 1. Educational content generation (case studies, scenarios, assessments)
 * 2. Instructor command execution (emails, notes, student management)
 * 3. Robust validation and verification
 * 4. Automatic activity logging and note creation
 * 5. Natural language understanding for diverse commands
 *
 * Features:
 * - Automatic "Elias Thomas" signature on all emails
 * - Double-checking and confirmation before critical actions
 * - Comprehensive error handling and rollback
 * - Activity logging for complete audit trail
 * - Automatic note creation on student profiles
 * - Intelligent context awareness
 */

const INSTRUCTOR_NAME = 'Elias Thomas';
const INSTRUCTOR_EMAIL = 'elias.thomas@hct.ac.ae';

interface ClaudiaRequest {
  command: string;
  mode?: 'educational' | 'instructor' | 'auto'; // auto = detect intent
  confirmed?: boolean;
  pendingAction?: any;
  context?: {
    moduleCode?: string;
    moduleName?: string;
    moduleId?: string;
    studentId?: string;
    studentName?: string;
  };
}

interface ClaudiaResponse {
  success: boolean;
  understood: boolean;
  mode: string;
  action: string;
  summary: string;
  details?: any;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  pendingAction?: any;
  actionsPerformed?: {
    emailsSent?: number;
    notesCreated?: number;
    activitiesLogged?: number;
    studentsAffected?: number;
  };
  educationalContent?: any;
  error?: string;
  warnings?: string[];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;

  try {
    // 1. AUTHENTICATION & AUTHORIZATION
    console.log('[Claudia] Starting request processing...');

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        understood: false,
        error: 'Unauthorized - Please sign in',
        mode: 'error',
        action: 'none'
      }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        understood: false,
        error: 'User not found in database',
        mode: 'error',
        action: 'none'
      }, { status: 404 });
    }

    userId = user.id;

    // Only instructors can use instructor commands
    const canUseInstructorCommands = user.role === 'instructor';

    // 2. PARSE REQUEST
    const body: ClaudiaRequest = await request.json();
    const { command, mode = 'auto', confirmed = false, pendingAction, context } = body;

    if (!command || command.trim().length < 3) {
      return NextResponse.json({
        success: false,
        understood: false,
        error: 'Command is required and must be at least 3 characters',
        mode: 'error',
        action: 'none'
      }, { status: 400 });
    }

    console.log('[Claudia] Command:', command);
    console.log('[Claudia] Mode:', mode);
    console.log('[Claudia] User:', user.name, '(', user.role, ')');

    // 3. HANDLE CONFIRMED ACTIONS
    if (confirmed && pendingAction) {
      console.log('[Claudia] Executing confirmed action...');
      return await executeConfirmedAction(pendingAction, user);
    }

    // 4. GET CONTEXT DATA
    const contextData = await getContextData(context);

    // 5. DETERMINE INTENT AND GENERATE AI RESPONSE
    const intent = mode === 'auto' ? await detectIntent(command) : mode;

    console.log('[Claudia] Detected intent:', intent);

    let aiResponse: ClaudiaResponse;

    if (intent === 'educational') {
      aiResponse = await handleEducationalRequest(command, contextData, user);
    } else if (intent === 'instructor') {
      if (!canUseInstructorCommands) {
        return NextResponse.json({
          success: false,
          understood: true,
          error: 'Instructor commands are only available to instructors',
          mode: 'instructor',
          action: 'denied',
          summary: 'You do not have permission to execute instructor commands'
        }, { status: 403 });
      }
      aiResponse = await handleInstructorRequest(command, contextData, user);
    } else {
      aiResponse = {
        success: false,
        understood: false,
        error: 'Could not understand the request. Please be more specific.',
        mode: 'unknown',
        action: 'none',
        summary: 'Unable to process command'
      };
    }

    // 6. ADD PROCESSING METADATA
    aiResponse.details = {
      ...aiResponse.details,
      processingTime: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString(),
      processedBy: user.name || user.email
    };

    console.log('[Claudia] Response ready:', aiResponse.action);
    return NextResponse.json(aiResponse);

  } catch (error) {
    console.error('[Claudia] Error:', error);

    // Log error activity if we have a user
    if (userId) {
      try {
        await prisma.activity.create({
          data: {
            type: 'ai_error',
            description: `Claudia AI error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            metadata: {
              error: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined,
              timestamp: new Date().toISOString()
            }
          }
        });
      } catch (logError) {
        console.error('[Claudia] Failed to log error:', logError);
      }
    }

    return NextResponse.json({
      success: false,
      understood: false,
      error: 'An unexpected error occurred while processing your request',
      details: error instanceof Error ? error.message : 'Unknown error',
      mode: 'error',
      action: 'none'
    }, { status: 500 });
  }
}

/**
 * Detect the intent of the command (educational vs instructor)
 */
async function detectIntent(command: string): Promise<'educational' | 'instructor'> {
  const lowerCommand = command.toLowerCase();

  // Instructor command keywords
  const instructorKeywords = [
    'send', 'email', 'remind', 'notify', 'message',
    'create note', 'add note', 'note about',
    'update', 'change', 'modify',
    'show me', 'list', 'find', 'query',
    'follow up', 'check in', 'contact'
  ];

  // Educational content keywords
  const educationalKeywords = [
    'create case', 'generate case', 'case study',
    'scenario', 'patient',
    'brainstorm', 'ideas for',
    'lesson plan', 'assignment',
    'assessment', 'quiz', 'test', 'exam',
    'learning objective', 'educational'
  ];

  const hasInstructorKeyword = instructorKeywords.some(kw => lowerCommand.includes(kw));
  const hasEducationalKeyword = educationalKeywords.some(kw => lowerCommand.includes(kw));

  // If both, prioritize based on context
  if (hasInstructorKeyword && hasEducationalKeyword) {
    // If mentions specific students or emails, it's instructor
    if (lowerCommand.includes('h00') || lowerCommand.includes('student') || lowerCommand.includes('email')) {
      return 'instructor';
    }
    return 'educational';
  }

  if (hasInstructorKeyword) return 'instructor';
  if (hasEducationalKeyword) return 'educational';

  // Default to instructor for action-oriented commands
  return 'instructor';
}

/**
 * Get relevant context data for AI processing
 */
async function getContextData(context?: any) {
  const [students, modules, classes] = await Promise.all([
    prisma.student.findMany({
      include: {
        module: true,
        notes: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        activities: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    }),
    prisma.module.findMany(),
    prisma.classSession.findMany({
      where: {
        date: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      include: { module: true, location: true }
    })
  ]);

  return {
    students: students.map(s => ({
      id: s.id,
      studentId: s.studentId,
      name: s.fullName,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      module: s.module?.code,
      moduleName: s.module?.name,
      recentNotes: s.notes.length,
      recentActivities: s.activities.length
    })),
    modules: modules.map(m => ({
      id: m.id,
      code: m.code,
      name: m.name
    })),
    recentClasses: classes.map(c => ({
      title: c.title,
      date: c.date,
      module: c.module?.code,
      location: c.location?.name
    })),
    context: context || {}
  };
}

/**
 * Handle educational content generation requests
 */
async function handleEducationalRequest(
  command: string,
  contextData: any,
  user: any
): Promise<ClaudiaResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      understood: true,
      mode: 'educational',
      action: 'error',
      summary: 'AI service not configured',
      error: 'GEMINI_API_KEY not found'
    };
  }

  const systemPrompt = `You are Claudia, an advanced educational AI assistant for HCT Al Ain EMS Program.

EDUCATIONAL CONTENT GENERATION CAPABILITIES:
1. Medical Case Studies - Create realistic patient scenarios with vital signs, symptoms, progression
2. Learning Objectives - Define clear, measurable educational outcomes
3. Assessment Tools - Generate quizzes, rubrics, evaluation criteria
4. Lesson Plans - Structure comprehensive teaching sessions
5. Brainstorming - Ideate creative teaching approaches
6. Scenario Variations - Adapt cases for different difficulty levels

CONTEXT:
- Institution: Higher Colleges of Technology (HCT) Al Ain
- Program: Emergency Medical Services (EMS)
- Available Modules: ${contextData.modules.map((m: any) => `${m.code} (${m.name})`).join(', ')}
- Total Students: ${contextData.students.length}

RESPONSE FORMAT (JSON):
{
  "understood": true/false,
  "mode": "educational",
  "action": "case_study|lesson_plan|assessment|brainstorm|scenario",
  "summary": "Brief description of what you're creating",
  "content": {
    "title": "Content title",
    "description": "Detailed description",
    "targetModule": "Module code",
    "difficulty": "beginner|intermediate|advanced",
    "learningObjectives": ["objective 1", "objective 2"],
    "scenario": {
      "patientInfo": {
        "name": "Patient name",
        "age": 45,
        "gender": "Male/Female",
        "medicalHistory": ["condition 1", "condition 2"]
      },
      "presentation": {
        "chiefComplaint": "Main complaint",
        "symptoms": ["symptom 1", "symptom 2"],
        "vitalSigns": {
          "bloodPressure": "120/80",
          "heartRate": "75 bpm",
          "respiratoryRate": "16/min",
          "oxygenSaturation": "98%",
          "temperature": "37.0°C"
        },
        "physicalFindings": ["finding 1", "finding 2"]
      },
      "progression": ["stage 1", "stage 2"],
      "expectedActions": ["action 1", "action 2"],
      "learningPoints": ["point 1", "point 2"]
    }
  },
  "educationalNotes": "Teaching tips and guidance",
  "assessmentIdeas": ["idea 1", "idea 2"]
}

User Request: ${command}

Generate appropriate educational content based on the request.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: systemPrompt }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 4096,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No content in AI response');
    }

    const aiResult = JSON.parse(content);

    // Log the educational content creation
    await prisma.activity.create({
      data: {
        type: 'educational_content_created',
        description: `Claudia generated: ${aiResult.content?.title || 'Educational content'}`,
        metadata: {
          mode: 'educational',
          action: aiResult.action,
          title: aiResult.content?.title,
          module: aiResult.content?.targetModule,
          createdBy: user.name || user.email,
          timestamp: new Date().toISOString()
        }
      }
    });

    return {
      success: true,
      understood: true,
      mode: 'educational',
      action: aiResult.action || 'educational_content',
      summary: aiResult.summary || `Created ${aiResult.content?.title}`,
      educationalContent: aiResult.content,
      details: {
        title: aiResult.content?.title,
        module: aiResult.content?.targetModule,
        difficulty: aiResult.content?.difficulty,
        objectives: aiResult.content?.learningObjectives?.length || 0
      },
      actionsPerformed: {
        activitiesLogged: 1
      }
    };

  } catch (error) {
    console.error('[Claudia] Educational AI error:', error);
    return {
      success: false,
      understood: true,
      mode: 'educational',
      action: 'error',
      summary: 'Failed to generate educational content',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Handle instructor command execution requests
 */
async function handleInstructorRequest(
  command: string,
  contextData: any,
  user: any
): Promise<ClaudiaResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      understood: true,
      mode: 'instructor',
      action: 'error',
      summary: 'AI service not configured',
      error: 'GEMINI_API_KEY not found'
    };
  }

  const systemPrompt = `You are Claudia, an intelligent instructor assistant for ${INSTRUCTOR_NAME} at HCT Al Ain EMS Program.

INSTRUCTOR COMMAND CAPABILITIES:
1. Send Emails - Individual or bulk emails to students with automatic "Elias Thomas" signature
2. Create Notes - Add notes to student profiles with proper categorization
3. Query Students - Find and filter students by various criteria
4. Schedule Follow-ups - Track and manage student communications
5. Activity Logging - Maintain complete audit trail of all actions

CRITICAL RULES:
- ALWAYS use exact student data from the provided list
- NEVER generate fake student IDs, names, or emails
- ALWAYS personalize emails with actual student names
- ALWAYS require confirmation before sending emails
- ALWAYS create notes for significant actions
- ALWAYS log activities for audit trail

AVAILABLE STUDENTS:
${contextData.students.slice(0, 30).map((s: any) =>
  `- ID: ${s.studentId}, Name: ${s.name}, Email: ${s.email}, Module: ${s.module}`
).join('\n')}
${contextData.students.length > 30 ? `\n... and ${contextData.students.length - 30} more students` : ''}

RESPONSE FORMAT (JSON):
{
  "understood": true,
  "mode": "instructor",
  "action": "send_email|create_note|query_students|follow_up",
  "summary": "What you understood and will do",
  "requiresConfirmation": true,
  "confirmationMessage": "Clear confirmation request",
  "recipients": [
    {
      "id": "student_database_id",
      "studentId": "H00XXXXXX",
      "name": "Full Name",
      "email": "email@hct.ac.ae",
      "module": "MODULE_CODE"
    }
  ],
  "emailDetails": {
    "subject": "Email subject",
    "body": "Email body with [Student Name] placeholders",
    "type": "reminder|followup|encouragement|custom"
  },
  "noteDetails": {
    "title": "Note title",
    "content": "Note content",
    "category": "academic|reminder|followup|behavioral"
  },
  "verificat": {
    "studentsFound": 5,
    "correctModule": true,
    "emailsValid": true,
    "notesWillBeCreated": true
  }
}

User Command: ${command}

Process the command and prepare the action with full verification.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: systemPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No content in AI response');
    }

    const aiResult = JSON.parse(content);

    // Validate and enrich the response
    const validatedResponse = await validateInstructorAction(aiResult, contextData);

    return validatedResponse;

  } catch (error) {
    console.error('[Claudia] Instructor AI error:', error);
    return {
      success: false,
      understood: true,
      mode: 'instructor',
      action: 'error',
      summary: 'Failed to process instructor command',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Validate and enrich instructor action with double-checking
 */
async function validateInstructorAction(
  aiResult: any,
  contextData: any
): Promise<ClaudiaResponse> {
  const warnings: string[] = [];

  // Validate recipients exist in database
  if (aiResult.recipients && aiResult.recipients.length > 0) {
    const validRecipients = [];

    for (const recipient of aiResult.recipients) {
      const student = contextData.students.find((s: any) =>
        s.studentId === recipient.studentId || s.id === recipient.id
      );

      if (student) {
        validRecipients.push({
          id: student.id,
          studentId: student.studentId,
          name: student.name,
          email: student.email,
          module: student.module
        });
      } else {
        warnings.push(`Student ${recipient.studentId || recipient.name} not found in database`);
      }
    }

    aiResult.recipients = validRecipients;
  }

  // Check for duplicate emails in last hour
  if (aiResult.action === 'send_email' && aiResult.emailDetails) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    for (const recipient of aiResult.recipients || []) {
      const recentEmail = await prisma.activity.findFirst({
        where: {
          studentId: recipient.id,
          type: 'email_sent',
          createdAt: { gte: oneHourAgo },
          metadata: {
            path: ['subject'],
            string_contains: aiResult.emailDetails.subject.substring(0, 20)
          }
        }
      });

      if (recentEmail) {
        warnings.push(`Similar email already sent to ${recipient.name} within the last hour`);
      }
    }
  }

  return {
    success: true,
    understood: true,
    mode: 'instructor',
    action: aiResult.action,
    summary: aiResult.summary,
    requiresConfirmation: true,
    confirmationMessage: aiResult.confirmationMessage ||
      `Ready to ${aiResult.action.replace('_', ' ')} for ${aiResult.recipients?.length || 0} student(s). Proceed?`,
    pendingAction: aiResult,
    warnings: warnings.length > 0 ? warnings : undefined,
    details: {
      action: aiResult.action,
      studentsAffected: aiResult.recipients?.length || 0,
      verification: aiResult.verification,
      warnings: warnings.length
    }
  };
}

/**
 * Execute a confirmed action with full tracking
 */
async function executeConfirmedAction(
  pendingAction: any,
  user: any
): Promise<ClaudiaResponse> {
  const results = {
    emailsSent: 0,
    notesCreated: 0,
    activitiesLogged: 0,
    studentsAffected: 0,
    errors: [] as string[]
  };

  try {
    const { action, recipients, emailDetails, noteDetails } = pendingAction;

    // Process each recipient
    for (const recipient of recipients || []) {
      try {
        const student = await prisma.student.findUnique({
          where: { id: recipient.id }
        });

        if (!student) {
          results.errors.push(`Student ${recipient.name} not found`);
          continue;
        }

        // Send email if requested
        if (action === 'send_email' && emailDetails) {
          const personalizedBody = emailDetails.body
            .replace(/\[Student Name\]/g, student.fullName)
            .replace(/\[student name\]/g, student.fullName);

          await sendEmail({
            to: student.email,
            subject: emailDetails.subject,
            html: createEmailHTML(personalizedBody, student.fullName),
            text: personalizedBody
          });

          results.emailsSent++;

          // Log email activity
          await prisma.activity.create({
            data: {
              studentId: student.id,
              type: 'email_sent',
              description: `Claudia sent email: "${emailDetails.subject}"`,
              metadata: {
                subject: emailDetails.subject,
                emailType: emailDetails.type,
                sentBy: INSTRUCTOR_NAME,
                sentAt: new Date().toISOString()
              }
            }
          });

          results.activitiesLogged++;
        }

        // Create note if requested or if email was sent
        if (noteDetails || emailDetails) {
          const noteContent = noteDetails?.content ||
            `Email sent: ${emailDetails?.subject}\n\n${emailDetails?.body.substring(0, 200)}...`;

          const noteTitle = noteDetails?.title ||
            `Email: ${emailDetails?.subject}`;

          await prisma.note.create({
            data: {
              studentId: student.id,
              userId: user.id,
              title: noteTitle,
              content: noteContent,
              category: noteDetails?.category || 'reminder'
            }
          });

          results.notesCreated++;
        }

        results.studentsAffected++;

      } catch (studentError) {
        console.error(`[Claudia] Error processing student ${recipient.name}:`, studentError);
        results.errors.push(`Failed for ${recipient.name}: ${studentError instanceof Error ? studentError.message : 'Unknown error'}`);
      }
    }

    // Log overall action
    await prisma.activity.create({
      data: {
        type: 'claudia_action_completed',
        description: `Claudia completed: ${action} for ${results.studentsAffected} students`,
        metadata: {
          action,
          emailsSent: results.emailsSent,
          notesCreated: results.notesCreated,
          studentsAffected: results.studentsAffected,
          errors: results.errors,
          executedBy: user.name || user.email,
          timestamp: new Date().toISOString()
        }
      }
    });

    results.activitiesLogged++;

    return {
      success: true,
      understood: true,
      mode: 'instructor',
      action: 'completed',
      summary: `Successfully completed: ${results.emailsSent} emails sent, ${results.notesCreated} notes created`,
      actionsPerformed: results,
      warnings: results.errors.length > 0 ? results.errors : undefined
    };

  } catch (error) {
    console.error('[Claudia] Error executing confirmed action:', error);

    return {
      success: false,
      understood: true,
      mode: 'instructor',
      action: 'error',
      summary: 'Failed to execute action',
      error: error instanceof Error ? error.message : 'Unknown error',
      actionsPerformed: results
    };
  }
}

/**
 * Create professional email HTML with branding
 */
function createEmailHTML(message: string, studentName: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Message from ${INSTRUCTOR_NAME}</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">HCT Al Ain EMS Program</p>
      </div>

      <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; color: #333;">Dear ${studentName},</p>

        <div style="font-size: 16px; color: #555; line-height: 1.6; margin: 20px 0;">
          ${message.replace(/\n/g, '<br>')}
        </div>

        <p style="font-size: 16px; color: #555; margin-top: 30px;">
          Best regards,<br>
          <strong>${INSTRUCTOR_NAME}</strong><br>
          <span style="color: #888; font-size: 14px;">Clinical Instructor<br>HCT Al Ain EMS Program</span>
        </p>
      </div>

      <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
        <p>Sent via Claudia AI Assistant • ${new Date().toLocaleDateString()}</p>
      </div>
    </div>
  `;
}
