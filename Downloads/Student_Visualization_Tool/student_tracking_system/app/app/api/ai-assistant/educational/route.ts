import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  PROJECT_ASSIGNMENTS,
  findProjectByStudentId,
  findProjectByStudentName,
  createProjectNoteContent
} from '@/lib/project-assignments';

// Task Context Management - Ensures each request is treated independently
interface TaskContext {
  taskId: string;
  emails: any[];
  timestamp: number;
  subject: string;
  intent: string; // What the user asked for (e.g., "office hours", "blue room activities")
  moduleCode?: string;
}

// In-memory cache for pending emails with task isolation (by user ID)
const pendingEmailsCache = new Map<string, TaskContext>();

// Clean up old cached emails (older than 30 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [userId, data] of pendingEmailsCache.entries()) {
    if (now - data.timestamp > 30 * 60 * 1000) {
      pendingEmailsCache.delete(userId);
      console.log(`🗑️  Auto-cleared stale email cache for user ${userId}`);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

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

    // Enrich students with their assigned research projects
    const studentsWithProjects = students.map(student => {
      const project = findProjectByStudentId(student.studentId);
      return {
        ...student,
        assignedProject: project
      };
    });

    // Build conversation context for memory
    const conversationContext = conversationHistory.length > 0
      ? `\n\n🔄 CONVERSATION HISTORY (Last 5 messages):
${conversationHistory.slice(-5).map((msg: any, index: any) => {
  const messageNum = conversationHistory.length - 5 + index + 1;
  return `Message ${messageNum} - ${msg.type === 'user' ? 'USER' : 'ASSISTANT'}:\n${msg.content.substring(0, 300)}${msg.content.length > 300 ? '...' : ''}`;
}).join('\n\n')}

📌 IMPORTANT: If the user's current request is a follow-up or refinement (like "make the time 12 o'clock" or "change that to..."),
look at the ASSISTANT's last message to understand what was just generated, then regenerate it with the requested modifications.
`
      : '';

    // Dynamic system prompt for comprehensive AI assistant
    const systemPrompt = actionMode ?
    `You are CLAUDIA - the Comprehensive Learning And University Database Intelligence Assistant for HCT Al Ain EMS Program.

🧠 ADVANCED AI CAPABILITIES:
You are an INTELLIGENT, AUTONOMOUS, SYSTEM-WIDE assistant with:
- DEEP REASONING: Analyze context, infer needs, and propose solutions
- PROACTIVE INTELLIGENCE: Anticipate needs and suggest improvements
- MULTI-STEP PLANNING: Break complex requests into coordinated actions
- CONTEXTUAL AWARENESS: Remember conversation history and student context
- SMART AUTOMATION: Automatically add helpful notes, track progress, and maintain data integrity

🎯 COMPREHENSIVE SYSTEM OPERATIONS:
You can dynamically perform ANY operation on this student management system including:

🎓 STUDENT OPERATIONS:
- Add/update/delete student records
- Modify student information (name, email, phone, module)
- **SMART NOTES**: Automatically add contextual notes based on actions
  - ALWAYS include "content" parameter when creating notes (REQUIRED)
  - Example: {"type": "UPDATE_STUDENT_NOTE", "parameters": {"content": "Meeting requested for 12:00 PM today"}}
- Search and filter students with intelligent matching
- Update student attendance with automatic progress tracking
- Create comprehensive student progress reports
- **INTELLIGENT ANALYSIS**: Identify struggling students and suggest interventions

📊 ATTENDANCE MANAGEMENT:
- Mark attendance for individual students or entire classes
- Update attendance rates with automatic alerts for low attendance
- Create attendance reports with trend analysis
- Modify historical attendance records with audit trail
- Generate attendance summaries with predictions
- **AUTO-NOTIFY**: Send automatic reminders to students with poor attendance

📅 CLASS & SCHEDULE OPERATIONS:
- Create new class sessions with conflict detection
- Schedule classes and manage timetables intelligently
- Update class information with cascading updates
- Manage class rosters with enrollment limits
- **SMART SCHEDULING**: Suggest optimal class times based on student availability

📝 ASSIGNMENT & GRADING:
- Create new assignments with auto-generated rubrics
- Update assignment details with student notifications
- Manage submissions with progress tracking
- Generate grade reports with statistical analysis
- Create rubrics and evaluation criteria
- Process uploaded document files (PDF/Word)
- Extract text from rubrics and student submissions
- Automatically grade assignments using uploaded rubrics
- Create assignments from uploaded rubric documents
- **INTELLIGENT FEEDBACK**: Generate personalized feedback for each student

📚 MODULE & CURRICULUM:
- Create or modify modules with learning objectives
- Update module information with version tracking
- Manage subject associations with prerequisite checking
- Track module performance with analytics
- **CURRICULUM INSIGHTS**: Suggest module improvements based on student performance

✉️ EMAIL & COMMUNICATION:
- Compose personalized individual emails (using first names only)
- Generate email drafts for module-wide announcements
- Create individualized content that replaces "Dear Students" with "Dear [FirstName]"
- Provide email previews for instructor approval
- Support both individual and bulk email generation
- **SMART COMPOSITION**: Automatically determine appropriate tone and content based on context
- **AUTO-FOLLOW-UP**: Suggest follow-up communications based on student responses

📈 REPORTING & ANALYTICS:
- Generate comprehensive reports with visualizations
- Create data exports in multiple formats
- Analyze student performance with predictive insights
- Track attendance trends with forecasting
- **PROACTIVE ALERTS**: Identify students at risk and suggest interventions
- **PERFORMANCE INSIGHTS**: Analyze module effectiveness and suggest improvements

🔍 RESEARCH PROJECT MANAGEMENT:
- Track research project assignments and progress
- Add project details to student notes automatically
- Create module activities from project assignments
- Monitor project completion and milestones
- **INTELLIGENT GUIDANCE**: Provide project-specific support based on student's assigned topic

CURRENT SYSTEM STATE:
- Institution: HCT Al Ain EMS Program
- User: ${user.name || user.email} (${user.role || 'instructor'})
- Total Students: ${students.length}
- Active Modules: ${modules.length}
- Recent Class Sessions: ${classSessions.length}
- Active Assignments: ${assignments.length}

STUDENTS DATABASE WITH ASSIGNED RESEARCH PROJECTS:
${studentsWithProjects.slice(0, 20).map(s => `
- ID: ${s.studentId} | Name: ${s.fullName} | Module: ${s.module?.code || 'None'}
  Email: ${s.email}
  ${s.assignedProject ? `📋 ASSIGNED PROJECT: Project #${s.assignedProject.projectNumber} - ${s.assignedProject.projectTitle}` : '⚠️  NO PROJECT ASSIGNED'}
  Recent Notes: ${s.notes?.slice(0, 1).map(n => n.content.substring(0, 100)).join('; ') || 'None'}
  Attendance: ${s.attendance.length} records`).join('\n')}
${students.length > 20 ? `\n... and ${students.length - 20} more students` : ''}

MODULES:
${modules.map(m => `- ${m.code}: ${m.name} (${students.filter(s => s.moduleId === m.id).length} students)`).join('\n')}

RECENT CLASSES:
${classSessions.slice(0, 10).map(c => `- ${c.title} (${c.date}) - ${c.attendance.length} attendance records`).join('\n')}

ASSIGNMENTS:
${assignments.slice(0, 10).map(a => `- ${a.title} (${a.module?.code}) - ${a.submissions?.length || 0} submissions`).join('\n')}

🧠 INTELLIGENT REASONING FRAMEWORK:
Before responding, analyze the request using this framework:

1. **CONTEXT ANALYSIS**: What is the user trying to achieve? What's the underlying need?
2. **STUDENT CONTEXT**: Who are the students involved? What are their current statuses, projects, attendance?
3. **MULTI-STEP PLANNING**: Does this require multiple coordinated actions?
4. **PROACTIVE ADDITIONS**: What helpful actions should I take automatically (e.g., add progress notes, send notifications)?
5. **POTENTIAL ISSUES**: What could go wrong? What confirmations are needed?
6. **FOLLOW-UP SUGGESTIONS**: What should happen next?

🤖 ENHANCED RESPONSE FORMAT:
Always respond in JSON format with this structure:
{
  "understood": true/false,
  "intent": "clear description of what you understood and why",
  "reasoning": "brief explanation of your analysis and approach",
  "context_used": ["list of contextual information you considered"],
  "actions": [
    {
      "type": "UPDATE_STUDENT_NOTE|UPDATE_ATTENDANCE|CREATE_STUDENT|UPDATE_STUDENT|DELETE_STUDENT|CREATE_CLASS|SEND_EMAIL|CREATE_ASSIGNMENT|GENERATE_REPORT|SEARCH|ANALYZE_STUDENTS|BATCH_UPDATE|etc",
      "description": "what this action does",
      "target": "student_id or entity_id",
      "parameters": {...},
      "reasoning": "why this action is needed",
      "automatic": false // true if this is a proactive addition
    }
  ],
  "automatic_enhancements": [
    {
      "action": "description of automatic helpful action being added",
      "benefit": "why this helps the user"
    }
  ],
  "confirmation": "human readable summary of all actions to be taken",
  "warnings": ["any potential issues or confirmations needed"],
  "success": true/false,
  "data": {...results...},
  "insights": ["data-driven insights discovered during analysis"],
  "recommendations": ["proactive suggestions based on system state"],
  "follow_up": "suggested next steps or questions"
}

🎯 BASIC COMMAND EXAMPLES:

SINGLE STUDENT OPERATIONS (use studentId parameter):
"Student H00123456 is struggling - add note and set attendance to 75%"
"H00459031 please find this student and ask them to come see me" → Email ONLY H00459031
"Send email to H00542178 about missing assignment" → Email ONLY that one student
"Update Ahmed's phone number to +971501234567"

MODULE/GROUP OPERATIONS (use moduleCode parameter):
"Create a new assignment for AEM230 module due next Friday"
"Email all HEM3923 students about tomorrow's exam"
"Mark all HEM2903 students present for today"

ALL STUDENTS OPERATIONS (use moduleCode: null, RARE):
"Send campus-wide announcement to all students"
"Email all students about holiday schedule"

SINGLE STUDENT = studentId parameter, NOT moduleCode: null!

📋 RESEARCH PROJECT COMMANDS:
"Add project assignments to all student notes"
"Add research projects to HEM2903 module activities"
"What is Fatima's assigned project?"
"Show all students assigned to project 7"

✉️ INTELLIGENT COMMUNICATION COMMANDS:
"Email all students in HEM3923 about office hours tomorrow 9-11 AM"
"Send personalized emails to students with low attendance"
"Email students on mental health projects about new resources"
"Notify all students with pending submissions"

📊 SMART ANALYSIS COMMANDS:
"Analyze student performance in HEM2903"
"Find students who are struggling and need intervention"
"Show me students with attendance below 80%"
"Which students haven't submitted their assignments?"
"Generate a report on module performance"

🤖 PROACTIVE & INTELLIGENT COMMANDS:
"Help Fatima with her research project" - AI automatically knows her Project #7 and provides targeted support
"Check on students who missed last class" - AI finds them, checks attendance history, and suggests actions
"Prepare for tomorrow's class" - AI reviews attendance, pending work, and suggests preparation tasks
"Review student progress this week" - AI analyzes all activities and provides insights
"Suggest interventions for at-risk students" - AI identifies struggling students and recommends specific actions

🔄 BATCH & WORKFLOW COMMANDS:
"Mark all students present for today's HEM2903 class and add a note about today's topic"
"Create assignment, send notification emails, and add reminders to student notes"
"Update attendance for all absent students and send them catch-up resources"
"Find struggling students, add support notes, and schedule follow-up emails"

🧠 CONTEXT-AWARE COMMANDS (AI uses full context):
"The student keeps missing class" - AI infers which student from conversation history
"Follow up on that" - AI knows what action to follow up on
"Do the same for the other students" - AI applies same action to relevant group
"What should I do next?" - AI analyzes system state and suggests priorities

📝 FOLLOW-UP INSTRUCTIONS & REFINEMENTS:
You MUST be able to handle follow-up instructions that modify previous actions:
- "Please make the time at 12 o'clock" → Update the previously generated email with the new time
- "Change that to 2 PM" → Modify the time in the previous email action
- "Add that to the subject line" → Update the subject of the previously generated email
- "Make it more formal" → Regenerate the email with a more formal tone

IMPORTANT FOR FOLLOW-UPS:
1. **Look at conversation history** to understand what was just done
2. **Identify what needs to change** (time, subject, tone, recipient, etc.)
3. **Regenerate the action** with the updated information
4. **Keep everything else the same** (same student, same intent, same context)
5. **If an email was generated**, create a new SEND_EMAIL action with the updated details

EXAMPLE FOLLOW-UP FLOW:
User: "H00459031 please ask them to come see me"
AI: Generates email with "please stop by when your schedule allows"
User: "Please make the time at 12 o'clock"
AI: Regenerates SEND_EMAIL with "I am available until 12:00 PM today" or "Please come see me at 12:00 PM"

🚨 CRITICAL - TASK ISOLATION SYSTEM 🚨
EACH REQUEST IS A NEW, INDEPENDENT TASK. NEVER MIX TASKS OR USE DATA FROM PREVIOUS REQUESTS.

TASK ISOLATION RULES:
1. **NEW REQUEST = NEW TASK**: When the user makes a new request, treat it as completely separate from any previous request
2. **NO MEMORY MIXING**: Do NOT combine information from "office hours" with "blue room activities" or any other different tasks
3. **FRESH ANALYSIS**: For each request, analyze ONLY what the user is currently asking for
4. **SUBJECT LINE = TASK IDENTIFIER**: The subject line you create identifies the specific task
5. **ONE TASK AT A TIME**: Never reference or include content from previous unrelated email requests

EXAMPLE OF CORRECT TASK ISOLATION:
- Request 1: "Email students about office hours Monday" → Generate emails with subject "Office Hours - Monday"
- Request 2: "Email students about blue room activities" → Generate COMPLETELY NEW emails with subject "Blue Room Activities" (NOT office hours!)
- When user says "send" → Send ONLY the most recent task's emails (blue room, NOT office hours)

IMPORTANT EMAIL HANDLING:
- When asked to "email students" or "send email to students", ALWAYS:
  1. **ANALYZE THE CURRENT REQUEST ONLY** - Do NOT look at previous email content
  2. **EXTRACT STUDENT IDENTIFIERS FIRST**:
     - If the request mentions a SPECIFIC student ID (like H00459031, H00123456, etc.), extract it
     - If the request mentions a specific student name, extract it
     - **SINGLE STUDENT = ONE EMAIL ONLY**: Use studentId parameter, NOT moduleCode
  3. Identify which module(s) the students belong to (leave moduleCode null for all students)
  4. Create individual personalized emails using first names only (not full names)
  5. REWRITE the user's message into professional, well-formatted email text
     - Convert conversational language to professional tone
     - Fix grammar and formatting
     - Make it read naturally as if written by the instructor
     - Keep the core message and intent
     - **USE ONLY THE CURRENT REQUEST'S CONTENT**
  6. Generate a SEND_EMAIL action with these REQUIRED parameters:
     - subject: "..." (create appropriate subject line from CURRENT request - e.g., "Blue Room Activities" NOT "Office Hours")
     - body: "Dear Student,\n\n[professionally written message FROM CURRENT REQUEST ONLY]\n\nBest regards,\n[instructor name]"
     - **studentId: "H00XXXXX"** (if specific student mentioned) OR
     - **moduleCode: "CODE"** (if specific module mentioned) OR
     - **moduleCode: null** (for all students - USE ONLY if explicitly requested)
     - individualEmails: true
  7. The system will automatically replace "Dear Student/Students" with "Dear [FirstName]"
  8. Mark as requiresConfirmation: true for instructor approval

⚠️ **CRITICAL SAFETY CHECK**:
- If the request mentions a SINGLE student by ID or name, NEVER use moduleCode: null
- ALWAYS use studentId parameter for single-student requests
- Double-check: "H00459031" = ONE STUDENT, not all students!

EXAMPLE EMAIL ACTIONS:

Example 1 - SINGLE STUDENT (when specific ID mentioned):
{
  "actions": [
    {
      "type": "SEND_EMAIL",
      "description": "Send meeting request to student H00459031",
      "parameters": {
        "studentId": "H00459031",
        "subject": "Meeting Request - Available Until 11:40 Today",
        "body": "Dear Student,\n\nI hope you are doing well. I would like to request that you come see me at your earliest convenience, as I am available until 11:40 AM today. Please stop by when your schedule allows.\n\nBest regards,\nElias Thomas\nEMS Instructor, HCT Al Ain",
        "individualEmails": true
      }
    },
    {
      "type": "UPDATE_STUDENT_NOTE",
      "description": "Add note to student record about meeting request",
      "target": "H00459031",
      "parameters": {
        "content": "Instructor requested meeting - Available until 11:40 AM today. Email sent on 10/13/2025.",
        "title": "Meeting Request",
        "category": "administrative"
      }
    }
  ]
}

Example 2 - MODULE STUDENTS:
{
  "type": "SEND_EMAIL",
  "description": "Send office hours email to HEM3923 module students",
  "parameters": {
    "moduleCode": "HEM3923",
    "subject": "Office Hours - Monday, October 6th",
    "body": "Dear Student,\n\nMy office hours tomorrow will be from 9:00 to 11:00 AM...",
    "individualEmails": true
  }
}

Example 3 - ALL STUDENTS (rarely used):
{
  "type": "SEND_EMAIL",
  "description": "Send announcement to all students",
  "parameters": {
    "moduleCode": null,
    "subject": "Important Campus Announcement",
    "body": "Dear Student,\n\nThis is an important message for all students...",
    "individualEmails": true
  },
  "reasoning": "User explicitly requested to email ALL students with campus-wide announcement"
}

FOLLOW-UP COMMANDS FOR SENDING EMAILS:
When user says ONLY "send", "proceed", "yes", "go ahead", "yes send them", or similar SHORT confirmation commands:
  - This means they want to actually SEND the emails that were just generated
  - Create a SEND_EMAIL_NOW action to trigger actual email sending
  - Since you don't have access to the previously generated email list, create NEW emails using the SAME parameters from the user's original request
  - The user's original email request was about office hours on Monday October 6th, 9-11 AM for work placement and logbook support
  - Generate ALL students' emails again and send them
  - Use delaySeconds: 30 (30 seconds between each email to avoid spam filters)

SEND_EMAIL_NOW ACTION EXAMPLE (when user says "send"):
{
  "understood": true,
  "intent": "Send the previously generated emails to all students",
  "actions": [
    {
      "type": "SEND_EMAIL",
      "description": "Regenerate personalized emails for all students",
      "parameters": {
        "subject": "Office Hours - Monday, October 6th",
        "body": "Dear Student,\n\nI hope this message finds you well. I would like to inform you that my office hours tomorrow (Monday, October 6th) will be from 9:00 to 11:00 AM. I will be available for one-on-one sessions to discuss any work placement related tasks, address any issues or concerns with your logbook, or provide general support. Please feel free to come see me during this time.\n\nBest regards,\nElias Thomas\nEMS Instructor, HCT Al Ain",
        "moduleCode": null,
        "individualEmails": true
      }
    },
    {
      "type": "SEND_EMAIL_NOW",
      "description": "Send all emails with 30-second delays between each",
      "parameters": {
        "emails": "\${EMAILS_FROM_PREVIOUS_ACTION}",
        "delaySeconds": 30
      }
    }
  ],
  "confirmation": "Sending 60 personalized emails to all students with 30-second delays to avoid spam filters. This will take approximately 30 minutes.",
  "warnings": ["Email sending will take approximately 30 minutes due to spam prevention delays"],
  "success": true
}

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
- User: ${user.name || user.email} (${user.role || 'instructor'})
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
      let previousEmails = null; // Store emails from SEND_EMAIL for SEND_EMAIL_NOW

      for (const action of aiResponse.actions) {
        try {
          // If this is SEND_EMAIL_NOW and we have emails from previous action
          if (action.type === 'SEND_EMAIL_NOW' && action.parameters?.emails === '${EMAILS_FROM_PREVIOUS_ACTION}') {
            if (previousEmails) {
              action.parameters.emails = previousEmails;
            } else {
              executionResults.push({
                type: action.type,
                success: false,
                error: 'No emails available from previous action'
              });
              continue;
            }
          }

          const result = await executeAction(action, user.id, prisma);
          executionResults.push(result);

          // Store emails if this was a SEND_EMAIL action
          if (action.type === 'SEND_EMAIL' && result.success && result.data?.emails) {
            previousEmails = result.data.emails;
          }
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
          user: user.name || user.email,
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
        user: user.name || user.email,
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
      return await sendEmail(action, userId, prisma);

    case 'SEND_EMAIL_NOW':
      return await sendEmailNow(action, userId, prisma);

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

    case 'ADD_PROJECT_ASSIGNMENTS':
      return await addProjectAssignments(action, userId, prisma);

    case 'ADD_PROJECT_TO_STUDENT':
      return await addProjectToStudent(action, userId, prisma);

    case 'GET_STUDENT_PROJECT':
      return await getStudentProject(action, prisma);

    case 'GET_PROJECT_STUDENTS':
      return await getProjectStudents(action, prisma);

    case 'ADD_MODULE_PROJECT_ACTIVITIES':
      return await addModuleProjectActivities(action, userId, prisma);

    case 'ANALYZE_STUDENTS':
      return await analyzeStudents(action, prisma);

    case 'IDENTIFY_AT_RISK':
      return await identifyAtRiskStudents(action, prisma);

    case 'BATCH_UPDATE':
      return await batchUpdate(action, userId, prisma);

    case 'GENERATE_INSIGHTS':
      return await generateInsights(action, prisma);

    case 'AUTO_ADD_NOTES':
      return await autoAddNotes(action, userId, prisma);

    case 'SMART_SEARCH':
      return await smartSearch(action, prisma);

    case 'PREDICT_PERFORMANCE':
      return await predictPerformance(action, prisma);

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

  // Ensure content is provided with a default if missing
  const content = parameters.content || parameters.note || parameters.message ||
                  `Meeting requested - ${parameters.reason || 'General follow-up'}`;

  const note = await prisma.note.create({
    data: {
      studentId: student.id,
      userId,
      title: parameters.title || `AI Note - ${new Date().toLocaleDateString()}`,
      content: content,
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

async function sendEmail(action: any, userId: string, prisma: any) {
  const { parameters } = action;

  if (!parameters) {
    return {
      type: action.type,
      success: false,
      error: 'Email parameters are missing'
    };
  }

  const { moduleCode, studentId, subject, body, message, individualEmails = true } = parameters;

  // Use 'message' as fallback if 'body' is not provided
  const emailBody = body || message;

  if (!emailBody) {
    return {
      type: action.type,
      success: false,
      error: 'Email body/message is required'
    };
  }

  try {
    // Get students based on priority: studentId > moduleCode > all students
    let students = [];

    // Priority 1: Specific student ID
    if (studentId) {
      const student = await findStudent(studentId, prisma);
      if (!student) {
        return {
          type: action.type,
          success: false,
          error: `Student ${studentId} not found`
        };
      }
      students = [student];
      console.log(`📧 Single student email targeted: ${student.studentId} - ${student.fullName}`);
    }
    // Priority 2: Module filter
    else if (moduleCode) {
      const module = await prisma.module.findFirst({
        where: { code: moduleCode },
        include: {
          students: true
        }
      });

      if (!module) {
        return {
          type: action.type,
          success: false,
          error: `Module ${moduleCode} not found`
        };
      }

      students = module.students;
      console.log(`📧 Module email targeted: ${moduleCode} with ${students.length} students`);
    }
    // Priority 3: All students (only if explicitly no filter)
    else {
      students = await prisma.student.findMany({
        orderBy: { firstName: 'asc' }
      });
      console.log(`⚠️  Bulk email to ALL ${students.length} students (no filter specified)`);
    }

    if (students.length === 0) {
      return {
        type: action.type,
        success: false,
        error: 'No students found'
      };
    }

    // Generate personalized emails for each student
    const emailList = students.map(student => {
      // Get first name only
      const firstName = student.firstName || student.fullName.split(' ')[0];

      // Personalize the email body - replace various greeting patterns
      let personalizedBody = emailBody
        .replace(/Dear Students?/gi, `Dear ${firstName}`)
        .replace(/Hi Students?/gi, `Hi ${firstName}`)
        .replace(/Hello Students?/gi, `Hello ${firstName}`)
        .replace(/Greetings Students?/gi, `Greetings ${firstName}`);

      return {
        studentId: student.id, // Use database ID, not student number
        studentNumber: student.studentId, // Keep student number for reference
        studentName: student.fullName,
        firstName: firstName,
        email: student.email,
        subject: subject,
        body: personalizedBody,
        to: student.email
      };
    });

    // Generate unique task ID for this email generation request
    const taskId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Extract intent from subject and body to identify the task
    const intent = subject.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    // Check if there's already a cached task for this user
    const existingTask = pendingEmailsCache.get(userId);
    const warnings = [];

    if (existingTask) {
      // There's already a pending email task - this is a critical warning!
      console.log(`\n⚠️  ============ CACHE OVERWRITE WARNING ============`);
      console.log(`   User ${userId} already has a pending email task!`);
      console.log(`   EXISTING Task: "${existingTask.intent}"`);
      console.log(`   EXISTING Subject: "${existingTask.subject}"`);
      console.log(`   EXISTING Emails: ${existingTask.emails.length}`);
      console.log(`   NEW Task: "${intent}"`);
      console.log(`   NEW Subject: "${subject}"`);
      console.log(`   NEW Emails: ${emailList.length}`);
      console.log(`   ⚠️  THE OLD TASK WILL BE REPLACED!`);
      console.log(`===================================================\n`);

      warnings.push(`⚠️  CRITICAL: You already have a pending email task!`);
      warnings.push(`Previous task: "${existingTask.subject}" (${existingTask.emails.length} emails)`);
      warnings.push(`This new task will REPLACE the previous one.`);
      warnings.push(`If you want to send the PREVIOUS task instead, say "send previous" or "cancel this".`);
      warnings.push(`To proceed with THIS new task, say "send" or "proceed".`);
    }

    // Cache the emails with full task context
    const taskContext: TaskContext = {
      taskId,
      emails: emailList,
      timestamp: Date.now(),
      subject: subject,
      intent: intent,
      moduleCode: moduleCode || undefined
    };

    pendingEmailsCache.set(userId, taskContext);

    console.log(`✅ Cached new email task for user ${userId}:`);
    console.log(`   Task ID: ${taskId}`);
    console.log(`   Intent: "${intent}"`);
    console.log(`   Subject: "${subject}"`);
    console.log(`   Emails: ${emailList.length}`);
    console.log(`   Module: ${moduleCode || 'All students'}`);

    // Add safety warnings for bulk emails
    if (!studentId && !moduleCode && students.length > 10) {
      warnings.push(`⚠️  Bulk email to ALL ${students.length} students (no filter specified)`);
      warnings.push('If this was intended for a single student, please specify their student ID (e.g., H00459031)');
    }

    return {
      type: action.type,
      success: true,
      data: {
        emailsGenerated: emailList.length,
        emails: emailList,
        studentId: studentId,
        moduleCode: moduleCode,
        isBulkEmail: !studentId && !moduleCode,
        preview: emailList[0], // First email as preview
        requiresConfirmation: true,
        warnings: warnings.length > 0 ? warnings : undefined,
        cached: true,
        taskId: taskId,
        taskIntent: intent,
        cacheMessage: existingTask
          ? `⚠️  REPLACED previous task "${existingTask.subject}". New task: "${intent}" (${emailList.length} emails). Say "send" to proceed with THIS task.`
          : `✅ Cached ${emailList.length} personalized emails. Task: "${intent}". Say "send" or "proceed" to send them now.`,
        replacedTask: existingTask ? {
          subject: existingTask.subject,
          intent: existingTask.intent,
          emailCount: existingTask.emails.length
        } : undefined
      }
    };
  } catch (error) {
    console.error('Email generation error:', error);
    return {
      type: action.type,
      success: false,
      error: error.message
    };
  }
}

async function sendEmailNow(action: any, userId: string, prisma: any) {
  const { parameters } = action;

  if (!parameters) {
    return {
      type: action.type,
      success: false,
      error: 'Email parameters are missing'
    };
  }

  let { emails, delaySeconds = 30, moduleCode } = parameters;

  // If no emails provided, check cache
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    const cached = pendingEmailsCache.get(userId);
    if (cached && cached.emails) {
      console.log(`\n📧 ============ RETRIEVING CACHED EMAIL TASK ============`);
      console.log(`   User: ${userId}`);
      console.log(`   Task ID: ${cached.taskId}`);
      console.log(`   Intent: "${cached.intent}"`);
      console.log(`   Subject: "${cached.subject}"`);
      console.log(`   Emails to send: ${cached.emails.length}`);
      console.log(`   Module: ${cached.moduleCode || 'All students'}`);
      console.log(`   Cached at: ${new Date(cached.timestamp).toISOString()}`);
      console.log(`=======================================================\n`);

      emails = cached.emails;
      moduleCode = cached.moduleCode;
    } else {
      return {
        type: action.type,
        success: false,
        error: 'No emails to send. Please generate emails first by describing what you want to communicate.'
      };
    }
  }

  try {
    // Import nodemailer and send emails directly
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    let sent = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];

      try {
        await transporter.sendMail({
          from: `"${process.env.GMAIL_USER}" <${process.env.GMAIL_USER}>`,
          to: email.email || email.to,
          subject: email.subject,
          text: email.body,
          html: email.body.replace(/\n/g, '<br>'),
        });

        sent++;
        console.log(`✓ Email sent to ${email.firstName || email.studentName} (${email.email || email.to}) [${i + 1}/${emails.length}]`);

        // Log the sent email
        try {
          await prisma.emailLog.create({
            data: {
              studentId: email.studentId || null,
              recipientEmail: email.email || email.to,
              recipientName: email.studentName || email.firstName || 'Unknown',
              subject: email.subject,
              body: email.body,
              sentBy: userId,
              moduleCode: moduleCode || null,
              status: 'sent',
              emailType: determineEmailType(email.subject, email.body),
              sentAt: new Date(),
            }
          });

          // Create a note for the student
          if (email.studentId) {
            const noteContent = `Email sent: "${email.subject}"\n\nSummary: ${generateEmailSummary(email.body)}`;
            await prisma.note.create({
              data: {
                studentId: email.studentId,
                userId: userId,
                title: `Email: ${email.subject}`,
                content: noteContent,
                category: 'communication',
              }
            });
          }
        } catch (logError) {
          console.error('Failed to log email:', logError);
        }

        // Add delay between emails (except for the last one)
        if (i < emails.length - 1) {
          console.log(`⏳ Waiting ${delaySeconds} seconds before next email...`);
          await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
        }
      } catch (error) {
        failed++;
        errors.push({
          email: email.email || email.to,
          error: error.message,
        });
        console.error(`✗ Failed to send email to ${email.firstName || email.studentName}:`, error.message);

        // Log failed email
        try {
          await prisma.emailLog.create({
            data: {
              studentId: email.studentId || null,
              recipientEmail: email.email || email.to,
              recipientName: email.studentName || email.firstName || 'Unknown',
              subject: email.subject,
              body: email.body,
              sentBy: userId,
              moduleCode: moduleCode || null,
              status: 'failed',
              emailType: determineEmailType(email.subject, email.body),
              sentAt: new Date(),
            }
          });
        } catch (logError) {
          console.error('Failed to log failed email:', logError);
        }
      }
    }

    const success = failed === 0;

    // Clear cache after sending (success or failure)
    pendingEmailsCache.delete(userId);
    console.log(`🗑️  Cleared email cache for user ${userId}`);

    return {
      type: action.type,
      success,
      data: {
        sent,
        failed,
        total: emails.length,
        errors,
        message: `Successfully sent ${sent} out of ${emails.length} emails`
      }
    };
  } catch (error) {
    console.error('Send email now error:', error);
    return {
      type: action.type,
      success: false,
      error: error.message
    };
  }
}

// Helper function to determine email type from content
function determineEmailType(subject: string, body: string): string {
  const content = (subject + ' ' + body).toLowerCase();

  if (content.includes('office hour')) return 'office_hours';
  if (content.includes('assignment') || content.includes('submission')) return 'assignment';
  if (content.includes('grade') || content.includes('feedback')) return 'feedback';
  if (content.includes('attendance')) return 'attendance';
  if (content.includes('reminder')) return 'reminder';
  if (content.includes('announcement')) return 'announcement';

  return 'general';
}

// Helper function to generate email summary for notes
function generateEmailSummary(body: string): string {
  // Get first 150 characters or first 2 sentences
  const sentences = body.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const summary = sentences.slice(0, 2).join('. ').trim();

  if (summary.length > 150) {
    return summary.substring(0, 147) + '...';
  }

  return summary + (sentences.length > 2 ? '...' : '');
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

// Project Assignment Action Handlers

async function addProjectAssignments(action: any, userId: string, prisma: any) {
  const { parameters } = action;

  try {
    const results = {
      created: 0,
      skipped: 0,
      errors: [],
      students: []
    };

    for (const projectAssignment of PROJECT_ASSIGNMENTS) {
      try {
        // Find student by student ID
        const student = await prisma.student.findFirst({
          where: { studentId: projectAssignment.studentId }
        });

        if (!student) {
          results.skipped++;
          results.errors.push(`Student ${projectAssignment.studentId} (${projectAssignment.studentName}) not found in database`);
          continue;
        }

        // Check if project assignment note already exists
        const existingNote = await prisma.note.findFirst({
          where: {
            studentId: student.id,
            title: { contains: 'RESEARCH PROJECT ASSIGNMENT' }
          }
        });

        if (existingNote && !parameters?.force) {
          results.skipped++;
          results.students.push({
            name: student.fullName,
            status: 'skipped',
            reason: 'Project assignment note already exists'
          });
          continue;
        }

        // Create the project assignment note
        const noteContent = createProjectNoteContent(projectAssignment);

        const note = await prisma.note.create({
          data: {
            studentId: student.id,
            userId,
            title: '📋 RESEARCH PROJECT ASSIGNMENT',
            content: noteContent,
            category: 'academic'
          }
        });

        results.created++;
        results.students.push({
          name: student.fullName,
          studentId: student.studentId,
          project: `Project #${projectAssignment.projectNumber}: ${projectAssignment.projectTitle}`,
          status: 'created',
          noteId: note.id
        });

      } catch (studentError) {
        results.errors.push(`Error processing ${projectAssignment.studentName}: ${studentError.message}`);
      }
    }

    return {
      type: action.type,
      success: true,
      data: {
        totalProjects: PROJECT_ASSIGNMENTS.length,
        created: results.created,
        skipped: results.skipped,
        errors: results.errors,
        students: results.students,
        summary: `Successfully added ${results.created} project assignments. Skipped ${results.skipped}. ${results.errors.length} errors.`
      }
    };
  } catch (error) {
    console.error('Failed to add project assignments:', error);
    return {
      type: action.type,
      success: false,
      error: error.message
    };
  }
}

async function addProjectToStudent(action: any, userId: string, prisma: any) {
  const { target, parameters } = action;

  try {
    // Find student
    const student = await findStudent(target, prisma);
    if (!student) {
      return {
        type: action.type,
        success: false,
        error: `Student not found: ${target}`
      };
    }

    // Find project assignment
    const projectAssignment = findProjectByStudentId(student.studentId);
    if (!projectAssignment) {
      return {
        type: action.type,
        success: false,
        error: `No project assignment found for student ${student.fullName} (${student.studentId})`
      };
    }

    // Create the project note
    const noteContent = createProjectNoteContent(projectAssignment);

    const note = await prisma.note.create({
      data: {
        studentId: student.id,
        userId,
        title: '📋 RESEARCH PROJECT ASSIGNMENT',
        content: noteContent,
        category: 'academic'
      }
    });

    return {
      type: action.type,
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.fullName,
          studentId: student.studentId
        },
        project: {
          number: projectAssignment.projectNumber,
          title: projectAssignment.projectTitle
        },
        note: {
          id: note.id,
          title: note.title
        }
      }
    };
  } catch (error) {
    console.error('Failed to add project to student:', error);
    return {
      type: action.type,
      success: false,
      error: error.message
    };
  }
}

async function getStudentProject(action: any, prisma: any) {
  const { target } = action;

  try {
    // Find student
    const student = await findStudent(target, prisma);
    if (!student) {
      return {
        type: action.type,
        success: false,
        error: `Student not found: ${target}`
      };
    }

    // Find project assignment
    const projectAssignment = findProjectByStudentId(student.studentId);
    if (!projectAssignment) {
      return {
        type: action.type,
        success: true,
        data: {
          student: {
            id: student.id,
            name: student.fullName,
            studentId: student.studentId
          },
          project: null,
          message: `No project assignment found for ${student.fullName}`
        }
      };
    }

    return {
      type: action.type,
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.fullName,
          studentId: student.studentId
        },
        project: projectAssignment
      }
    };
  } catch (error) {
    console.error('Failed to get student project:', error);
    return {
      type: action.type,
      success: false,
      error: error.message
    };
  }
}

async function getProjectStudents(action: any, prisma: any) {
  const { parameters } = action;
  const { projectNumber } = parameters;

  try {
    // Get all assignments for this project
    const assignments = PROJECT_ASSIGNMENTS.filter(
      a => a.projectNumber === projectNumber
    );

    if (assignments.length === 0) {
      return {
        type: action.type,
        success: true,
        data: {
          projectNumber,
          students: [],
          message: `No students assigned to project #${projectNumber}`
        }
      };
    }

    // Find students in database
    const studentsData = [];
    for (const assignment of assignments) {
      const student = await prisma.student.findFirst({
        where: { studentId: assignment.studentId },
        include: { module: true }
      });

      if (student) {
        studentsData.push({
          id: student.id,
          name: student.fullName,
          studentId: student.studentId,
          email: student.email,
          module: student.module?.code,
          project: {
            number: assignment.projectNumber,
            title: assignment.projectTitle
          }
        });
      }
    }

    return {
      type: action.type,
      success: true,
      data: {
        projectNumber,
        projectTitle: assignments[0]?.projectTitle,
        students: studentsData,
        count: studentsData.length
      }
    };
  } catch (error) {
    console.error('Failed to get project students:', error);
    return {
      type: action.type,
      success: false,
      error: error.message
    };
  }
}

async function addModuleProjectActivities(action: any, userId: string, prisma: any) {
  const { parameters } = action;
  const { moduleCode = 'HEM2903', force = false } = parameters || {};

  try {
    // Find the module
    const module = await prisma.module.findFirst({
      where: { code: moduleCode }
    });

    if (!module) {
      return {
        type: action.type,
        success: false,
        error: `Module ${moduleCode} not found. Please create the module first.`
      };
    }

    const results = {
      created: 0,
      skipped: 0,
      errors: [],
      activities: []
    };

    // Group projects by project number
    const projectGroups = new Map<number, any[]>();
    for (const assignment of PROJECT_ASSIGNMENTS) {
      const existing = projectGroups.get(assignment.projectNumber) || [];
      existing.push(assignment);
      projectGroups.set(assignment.projectNumber, existing);
    }

    // Create module activity for each unique project
    for (const [projectNumber, assignments] of projectGroups.entries()) {
      const firstAssignment = assignments[0];

      try {
        // Check if activity already exists
        const existingActivity = await prisma.moduleActivity.findFirst({
          where: {
            moduleId: module.id,
            title: { contains: `Project #${projectNumber}` }
          }
        });

        if (existingActivity && !force) {
          results.skipped++;
          continue;
        }

        // Extract sections from brief
        const sections = parseProjectBrief(firstAssignment.projectBrief);

        // Get assigned students
        const assignedStudents = assignments.map(a => ({
          name: a.studentName,
          studentId: a.studentId
        }));

        // Create the module activity
        const activity = await prisma.moduleActivity.create({
          data: {
            moduleId: module.id,
            title: `Project #${projectNumber}: ${firstAssignment.projectTitle}`,
            activityType: 'research_project',
            date: new Date(),
            duration: 10,
            targetAudience: assignedStudents.map(s => s.name).join(', '),
            description: `Research Project Assignment #${projectNumber}\n\n${firstAssignment.projectTitle}\n\nAssigned to ${assignedStudents.length} student(s)`,
            content: {
              projectNumber,
              projectTitle: firstAssignment.projectTitle,
              assignedStudents,
              clinicalHours: 10,
              fullBrief: firstAssignment.projectBrief
            },
            objectives: [
              'Conduct comprehensive literature review',
              'Answer all research questions with evidence',
              'Develop UAE-specific recommendations',
              'Create professional presentation'
            ],
            outcomes: `Students will demonstrate understanding through research and presentation.`,
            facilitator: 'Research Project',
            location: 'Independent Study',
            studentCount: assignedStudents.length,
            createdBy: userId
          }
        });

        results.created++;
        results.activities.push({
          projectNumber,
          title: firstAssignment.projectTitle,
          activityId: activity.id,
          students: assignedStudents.length
        });

      } catch (error) {
        results.errors.push({
          projectNumber,
          error: error.message
        });
      }
    }

    return {
      type: action.type,
      success: true,
      data: {
        module: {
          code: module.code,
          name: module.name
        },
        created: results.created,
        skipped: results.skipped,
        totalProjects: 14,
        activities: results.activities,
        errors: results.errors,
        summary: `Created ${results.created} research project activities in ${moduleCode}. Skipped ${results.skipped} existing activities.`
      }
    };
  } catch (error) {
    console.error('Failed to add module project activities:', error);
    return {
      type: action.type,
      success: false,
      error: error.message
    };
  }
}

// Helper function to parse project brief
function parseProjectBrief(brief: string) {
  const sections: any = {};

  const backgroundMatch = brief.match(/\*\*Background & Context:\*\*\s*([\s\S]*?)(?=\n\*\*Key Research Questions|\n\*\*|$)/);
  if (backgroundMatch) {
    sections.background = backgroundMatch[1].trim();
  }

  return sections;
}

// Advanced Intelligent Action Handlers

async function analyzeStudents(action: any, prisma: any) {
  const { parameters } = action;
  const { moduleCode, criteria } = parameters || {};

  try {
    let studentsQuery: any = {
      include: {
        module: true,
        attendance: {
          include: {
            classSession: true
          }
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        grades: true,
        submissions: {
          include: {
            assignment: true
          }
        }
      }
    };

    if (moduleCode) {
      const module = await prisma.module.findFirst({
        where: { code: moduleCode }
      });
      if (module) {
        studentsQuery.where = { moduleId: module.id };
      }
    }

    const students = await prisma.student.findMany(studentsQuery);

    const analysis = students.map(student => {
      const totalSessions = student.attendance.length;
      const presentSessions = student.attendance.filter((a: any) => a.status === 'present').length;
      const attendanceRate = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0;

      const avgGrade = student.grades.length > 0
        ? student.grades.reduce((sum: number, g: any) => sum + g.gradePoints, 0) / student.grades.length
        : null;

      const submissionRate = student.submissions.length > 0
        ? (student.submissions.filter((s: any) => s.status === 'submitted').length / student.submissions.length) * 100
        : null;

      const recentNotes = student.notes.slice(0, 3);
      const concernFlags = recentNotes.filter((n: any) =>
        n.content.toLowerCase().includes('struggling') ||
        n.content.toLowerCase().includes('concern') ||
        n.content.toLowerCase().includes('issue')
      ).length;

      return {
        studentId: student.studentId,
        name: student.fullName,
        email: student.email,
        module: student.module?.code,
        metrics: {
          attendanceRate: Math.round(attendanceRate),
          averageGrade: avgGrade ? avgGrade.toFixed(2) : 'N/A',
          submissionRate: submissionRate ? Math.round(submissionRate) : 'N/A',
          totalNotes: student.notes.length,
          concernFlags
        },
        status: attendanceRate < 75 || concernFlags > 0 ? 'needs_attention' :
                attendanceRate > 90 && (avgGrade || 0) > 3.0 ? 'excelling' : 'on_track',
        projectAssignment: findProjectByStudentId(student.studentId)
      };
    });

    return {
      type: action.type,
      success: true,
      data: {
        totalStudents: students.length,
        analysis,
        summary: {
          excelling: analysis.filter(a => a.status === 'excelling').length,
          onTrack: analysis.filter(a => a.status === 'on_track').length,
          needsAttention: analysis.filter(a => a.status === 'needs_attention').length
        }
      }
    };
  } catch (error) {
    console.error('Failed to analyze students:', error);
    return {
      type: action.type,
      success: false,
      error: error.message
    };
  }
}

async function identifyAtRiskStudents(action: any, prisma: any) {
  const { parameters } = action;
  const { threshold = 75, moduleCode } = parameters || {};

  try {
    let studentsQuery: any = {
      include: {
        module: true,
        attendance: {
          include: {
            classSession: {
              select: {
                date: true,
                title: true
              }
            }
          },
          orderBy: { markedAt: 'desc' },
          take: 10
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        submissions: {
          include: {
            assignment: {
              select: {
                title: true,
                dueDate: true
              }
            }
          }
        }
      }
    };

    if (moduleCode) {
      const module = await prisma.module.findFirst({
        where: { code: moduleCode }
      });
      if (module) {
        studentsQuery.where = { moduleId: module.id };
      }
    }

    const students = await prisma.student.findMany(studentsQuery);

    const atRiskStudents = students.filter(student => {
      const totalSessions = student.attendance.length;
      const presentSessions = student.attendance.filter((a: any) => a.status === 'present').length;
      const attendanceRate = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 100;

      return attendanceRate < threshold;
    }).map(student => {
      const totalSessions = student.attendance.length;
      const presentSessions = student.attendance.filter((a: any) => a.status === 'present').length;
      const attendanceRate = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 100;

      const lastThreeSessions = student.attendance.slice(0, 3);
      const consecutiveAbsences = lastThreeSessions.filter((a: any) => a.status === 'absent').length;

      const pendingSubmissions = student.submissions.filter((s: any) => s.status === 'pending').length;

      return {
        studentId: student.studentId,
        name: student.fullName,
        email: student.email,
        module: student.module?.code,
        riskFactors: {
          attendanceRate: Math.round(attendanceRate),
          consecutiveAbsences,
          pendingSubmissions,
          recentNotes: student.notes.length
        },
        recommendedActions: [
          attendanceRate < 50 ? 'Immediate intervention - Schedule urgent meeting' :
          attendanceRate < 75 ? 'Schedule check-in meeting' : null,
          consecutiveAbsences >= 2 ? 'Send attendance concern email' : null,
          pendingSubmissions > 0 ? 'Send submission reminder' : null
        ].filter(Boolean),
        projectAssignment: findProjectByStudentId(student.studentId)
      };
    });

    return {
      type: action.type,
      success: true,
      data: {
        atRiskCount: atRiskStudents.length,
        threshold,
        students: atRiskStudents,
        urgentCases: atRiskStudents.filter(s => s.riskFactors.attendanceRate < 50).length
      }
    };
  } catch (error) {
    console.error('Failed to identify at-risk students:', error);
    return {
      type: action.type,
      success: false,
      error: error.message
    };
  }
}

async function batchUpdate(action: any, userId: string, prisma: any) {
  const { parameters } = action;
  const { targets, operation, operationData } = parameters;

  try {
    const results = {
      successful: [],
      failed: []
    };

    for (const target of targets) {
      try {
        let result;
        switch (operation) {
          case 'ADD_NOTE':
            const student = await findStudent(target, prisma);
            if (student) {
              const note = await prisma.note.create({
                data: {
                  studentId: student.id,
                  userId,
                  title: operationData.title,
                  content: operationData.content,
                  category: operationData.category || 'general'
                }
              });
              results.successful.push({ target, noteId: note.id });
            }
            break;

          case 'UPDATE_ATTENDANCE':
            // Implementation for batch attendance update
            results.successful.push({ target, updated: true });
            break;

          default:
            results.failed.push({ target, error: `Unknown operation: ${operation}` });
        }
      } catch (error) {
        results.failed.push({ target, error: error.message });
      }
    }

    return {
      type: action.type,
      success: true,
      data: {
        operation,
        totalTargets: targets.length,
        successful: results.successful.length,
        failed: results.failed.length,
        results
      }
    };
  } catch (error) {
    console.error('Batch update failed:', error);
    return {
      type: action.type,
      success: false,
      error: error.message
    };
  }
}

async function generateInsights(action: any, prisma: any) {
  const { parameters } = action;
  const { scope = 'system', moduleCode } = parameters || {};

  try {
    const insights = [];

    // Get all students with comprehensive data
    const students = await prisma.student.findMany({
      include: {
        attendance: true,
        notes: true,
        grades: true,
        submissions: true,
        module: true
      }
    });

    // Overall attendance trend
    const totalAttendance = students.reduce((sum, s) => sum + s.attendance.length, 0);
    const totalPresent = students.reduce((sum, s) =>
      sum + s.attendance.filter((a: any) => a.status === 'present').length, 0
    );
    const avgAttendance = totalAttendance > 0 ? (totalPresent / totalAttendance) * 100 : 0;

    insights.push({
      category: 'attendance',
      insight: `Overall attendance rate is ${Math.round(avgAttendance)}%`,
      recommendation: avgAttendance < 80 ? 'Consider implementing attendance improvement strategies' : 'Maintain current engagement levels'
    });

    // Students needing intervention
    const lowAttendance = students.filter(s => {
      const rate = s.attendance.length > 0 ?
        (s.attendance.filter((a: any) => a.status === 'present').length / s.attendance.length) * 100 : 100;
      return rate < 75;
    });

    if (lowAttendance.length > 0) {
      insights.push({
        category: 'intervention',
        insight: `${lowAttendance.length} students have attendance below 75%`,
        recommendation: `Priority intervention needed for: ${lowAttendance.slice(0, 3).map(s => s.fullName).join(', ')}${lowAttendance.length > 3 ? '...' : ''}`,
        actionable: true,
        affectedStudents: lowAttendance.map(s => s.studentId)
      });
    }

    // Submission patterns
    const totalSubmissions = students.reduce((sum, s) => sum + s.submissions.length, 0);
    if (totalSubmissions > 0) {
      insights.push({
        category: 'engagement',
        insight: `Total submissions tracked: ${totalSubmissions}`,
        recommendation: 'Continue monitoring submission patterns for early intervention'
      });
    }

    // Module-specific insights
    if (moduleCode) {
      const module = await prisma.module.findFirst({
        where: { code: moduleCode },
        include: {
          students: {
            include: {
              attendance: true,
              grades: true
            }
          }
        }
      });

      if (module) {
        insights.push({
          category: 'module_performance',
          insight: `Module ${moduleCode} has ${module.students.length} enrolled students`,
          recommendation: `Monitor individual progress and provide targeted support`
        });
      }
    }

    return {
      type: action.type,
      success: true,
      data: {
        scope,
        totalStudents: students.length,
        insights,
        generatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Failed to generate insights:', error);
    return {
      type: action.type,
      success: false,
      error: error.message
    };
  }
}

async function autoAddNotes(action: any, userId: string, prisma: any) {
  const { parameters } = action;
  const { context, targets, noteTemplate } = parameters;

  try {
    const notes = [];

    for (const target of targets) {
      const student = await findStudent(target, prisma);
      if (!student) continue;

      const project = findProjectByStudentId(student.studentId);

      const noteContent = noteTemplate
        .replace('{studentName}', student.fullName)
        .replace('{project}', project ? `Project #${project.projectNumber}: ${project.projectTitle}` : 'N/A')
        .replace('{context}', context);

      const note = await prisma.note.create({
        data: {
          studentId: student.id,
          userId,
          title: `Auto-generated: ${context}`,
          content: noteContent,
          category: 'system_generated'
        }
      });

      notes.push({
        studentId: student.studentId,
        studentName: student.fullName,
        noteId: note.id
      });
    }

    return {
      type: action.type,
      success: true,
      data: {
        notesCreated: notes.length,
        notes
      }
    };
  } catch (error) {
    console.error('Failed to auto-add notes:', error);
    return {
      type: action.type,
      success: false,
      error: error.message
    };
  }
}

async function smartSearch(action: any, prisma: any) {
  const { parameters } = action;
  const { query, filters } = parameters;

  try {
    const searchConditions: any = {
      OR: [
        { fullName: { contains: query, mode: 'insensitive' } },
        { studentId: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (filters?.moduleCode) {
      const module = await prisma.module.findFirst({
        where: { code: filters.moduleCode }
      });
      if (module) {
        searchConditions.AND = [{ moduleId: module.id }];
      }
    }

    const results = await prisma.student.findMany({
      where: searchConditions,
      include: {
        module: true,
        attendance: { take: 5, orderBy: { markedAt: 'desc' } },
        notes: { take: 3, orderBy: { createdAt: 'desc' } }
      }
    });

    return {
      type: action.type,
      success: true,
      data: {
        query,
        resultsCount: results.length,
        results: results.map(s => ({
          studentId: s.studentId,
          name: s.fullName,
          email: s.email,
          module: s.module?.code,
          recentAttendance: s.attendance.length,
          recentNotes: s.notes.length,
          project: findProjectByStudentId(s.studentId)
        }))
      }
    };
  } catch (error) {
    console.error('Smart search failed:', error);
    return {
      type: action.type,
      success: false,
      error: error.message
    };
  }
}

async function predictPerformance(action: any, prisma: any) {
  const { parameters } = action;
  const { studentId } = parameters;

  try {
    const student = await findStudent(studentId, prisma);
    if (!student) {
      return {
        type: action.type,
        success: false,
        error: 'Student not found'
      };
    }

    const fullStudent = await prisma.student.findUnique({
      where: { id: student.id },
      include: {
        attendance: {
          orderBy: { markedAt: 'desc' },
          take: 20
        },
        grades: true,
        submissions: true,
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!fullStudent) {
      return {
        type: action.type,
        success: false,
        error: 'Student data not found'
      };
    }

    // Calculate current metrics
    const totalSessions = fullStudent.attendance.length;
    const presentCount = fullStudent.attendance.filter(a => a.status === 'present').length;
    const attendanceRate = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

    const avgGrade = fullStudent.grades.length > 0
      ? fullStudent.grades.reduce((sum, g) => sum + g.gradePoints, 0) / fullStudent.grades.length
      : null;

    // Simple trend analysis
    const recentAttendance = fullStudent.attendance.slice(0, 5);
    const recentPresent = recentAttendance.filter(a => a.status === 'present').length;
    const recentRate = recentAttendance.length > 0 ? (recentPresent / recentAttendance.length) * 100 : 0;

    const trend = recentRate > attendanceRate ? 'improving' :
                  recentRate < attendanceRate ? 'declining' : 'stable';

    const prediction = {
      currentPerformance: {
        attendanceRate: Math.round(attendanceRate),
        averageGrade: avgGrade ? avgGrade.toFixed(2) : 'N/A',
        totalSubmissions: fullStudent.submissions.length
      },
      trend,
      predictions: {
        likelyOutcome: attendanceRate > 85 && (avgGrade || 0) > 3.0 ? 'Excellent' :
                       attendanceRate > 75 && (avgGrade || 0) > 2.5 ? 'Good' :
                       attendanceRate > 65 ? 'Satisfactory' : 'At Risk',
        confidenceLevel: totalSessions > 10 ? 'High' : 'Medium',
        recommendations: [
          attendanceRate < 75 ? 'Immediate attendance intervention needed' : null,
          trend === 'declining' ? 'Monitor closely - showing declining pattern' : null,
          trend === 'improving' ? 'Positive trend - continue current support' : null,
          (avgGrade || 0) < 2.5 ? 'Academic support recommended' : null
        ].filter(Boolean)
      }
    };

    return {
      type: action.type,
      success: true,
      data: {
        studentId: fullStudent.studentId,
        studentName: fullStudent.fullName,
        prediction
      }
    };
  } catch (error) {
    console.error('Performance prediction failed:', error);
    return {
      type: action.type,
      success: false,
      error: error.message
    };
  }
}