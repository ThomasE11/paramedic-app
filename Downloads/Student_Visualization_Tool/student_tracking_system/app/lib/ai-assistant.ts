/**
 * AI Assistant - Intelligent Natural Language Interface
 *
 * Handles diverse instructor requests like:
 * - "Send a reminder to student H00601771 about practicals"
 * - "Show me students who are failing"
 * - "Create a note for all AEM230 students about upcoming exam"
 * - "Generate encouragement email for struggling students"
 * - "What's the attendance rate for this week?"
 */

import { prisma } from '@/lib/db';
import { generateAIEmail, sendAIEmail } from './ai-email-service';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const INSTRUCTOR_NAME = 'Elias Thomas';
const INSTRUCTOR_EMAIL = 'elias.thomas@hct.ac.ae';

export interface AIAssistantRequest {
  instruction: string; // Natural language instruction from instructor
  context?: any; // Optional additional context
}

export interface AIAssistantResponse {
  success: boolean;
  action?: string; // What action was taken
  result?: any; // Result of the action
  message?: string; // Human-readable message
  error?: string;
}

/**
 * Parse instructor's natural language instruction into structured action
 */
async function parseInstruction(instruction: string): Promise<{
  action: string;
  parameters: any;
}> {
  const prompt = `You are an AI assistant helping EMS instructor ${INSTRUCTOR_NAME} manage students.

Parse this instruction into a structured action:
"${instruction}"

Available actions:
- send_email: Send email to student(s)
- create_note: Add note to student profile(s)
- query_students: Find/filter students
- query_attendance: Check attendance data
- query_grades: Check grade data
- query_assignments: Check assignment data
- generate_report: Generate summary or report

Extract:
1. Action type (one of the above)
2. Target (student ID, module code, or criteria)
3. Email type (if applicable): feedback, encouragement, reminder, custom
4. Content/context for the action
5. Any filters or conditions

Return ONLY valid JSON:
{
  "action": "action_type",
  "parameters": {
    "target": "student_id or criteria",
    "emailType": "type",
    "content": "message or context",
    "filters": {}
  }
}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse instruction');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Execute send_email action
 */
async function executeSendEmail(params: any): Promise<any> {
  const { target, emailType, content } = params;

  // Find student by ID or criteria
  let students = [];

  if (target.startsWith('H')) {
    // Single student by ID
    const student = await prisma.student.findUnique({
      where: { studentId: target }
    });
    if (student) students = [student];
  } else {
    // Query by criteria
    students = await prisma.student.findMany({
      where: params.filters || {},
      take: 10 // Limit to 10 for safety
    });
  }

  if (students.length === 0) {
    return { error: 'No students found matching criteria' };
  }

  const results = [];

  for (const student of students) {
    // Generate email
    const emailRequest = {
      studentId: student.id,
      emailType: emailType || 'custom',
      context: {
        studentName: student.fullName,
        studentEmail: student.email,
        customPrompt: content
      },
      senderName: INSTRUCTOR_NAME,
      senderEmail: INSTRUCTOR_EMAIL
    };

    const generated = await generateAIEmail(emailRequest);

    if (!generated.success) {
      results.push({
        student: student.studentId,
        status: 'failed',
        error: generated.error
      });
      continue;
    }

    // Send email
    const sent = await sendAIEmail(
      emailRequest,
      generated.subject!,
      generated.body!,
      true // confirmed
    );

    results.push({
      student: student.studentId,
      name: student.fullName,
      status: sent.success ? 'sent' : 'failed',
      subject: generated.subject,
      error: sent.error
    });

    // Wait for rate limiting
    if (students.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  return {
    emailsSent: results.filter(r => r.status === 'sent').length,
    totalStudents: students.length,
    results
  };
}

/**
 * Execute create_note action
 */
async function executeCreateNote(params: any): Promise<any> {
  const { target, content } = params;

  // Find student(s)
  let students = [];

  if (target.startsWith('H')) {
    const student = await prisma.student.findUnique({
      where: { studentId: target }
    });
    if (student) students = [student];
  } else {
    students = await prisma.student.findMany({
      where: params.filters || {},
      take: 50
    });
  }

  if (students.length === 0) {
    return { error: 'No students found' };
  }

  // Get instructor user
  const instructor = await prisma.user.findFirst({
    where: { role: 'instructor' }
  });

  if (!instructor) {
    return { error: 'No instructor user found' };
  }

  const notes = [];

  for (const student of students) {
    const note = await prisma.note.create({
      data: {
        studentId: student.id,
        userId: instructor.id,
        title: `Note from ${INSTRUCTOR_NAME}`,
        content: content,
        category: 'general'
      }
    });

    notes.push({
      student: student.studentId,
      name: student.fullName,
      noteId: note.id
    });
  }

  return {
    notesCreated: notes.length,
    notes
  };
}

/**
 * Execute query_students action
 */
async function executeQueryStudents(params: any): Promise<any> {
  const students = await prisma.student.findMany({
    where: params.filters || {},
    include: {
      module: true,
      grades: {
        take: 1,
        orderBy: { createdAt: 'desc' }
      }
    },
    take: 20
  });

  return {
    count: students.length,
    students: students.map(s => ({
      id: s.studentId,
      name: s.fullName,
      email: s.email,
      module: s.module?.code,
      recentGrade: s.grades[0]?.grade
    }))
  };
}

/**
 * Main AI Assistant Handler
 */
export async function handleAIInstruction(request: AIAssistantRequest): Promise<AIAssistantResponse> {
  try {
    // Parse instruction
    const parsed = await parseInstruction(request.instruction);

    let result;

    // Execute action
    switch (parsed.action) {
      case 'send_email':
        result = await executeSendEmail(parsed.parameters);
        break;

      case 'create_note':
        result = await executeCreateNote(parsed.parameters);
        break;

      case 'query_students':
        result = await executeQueryStudents(parsed.parameters);
        break;

      default:
        return {
          success: false,
          error: `Action "${parsed.action}" not yet implemented`
        };
    }

    if (result.error) {
      return {
        success: false,
        error: result.error
      };
    }

    return {
      success: true,
      action: parsed.action,
      result,
      message: `Successfully executed: ${parsed.action}`
    };

  } catch (error) {
    console.error('AI Assistant error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
