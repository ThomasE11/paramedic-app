
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: NextRequest) {
  let command = '';
  let context: any = {};
  
  try {
    console.log('AI Assistant: Starting request processing...');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('AI Assistant: No session or user email');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    command = body.command;
    const confirmed = body.confirmed || false;
    const pendingAction = body.pendingAction || null;

    console.log('AI Assistant: Received command:', command);
    console.log('AI Assistant: Confirmed:', confirmed);
    console.log('AI Assistant: Pending action:', pendingAction ? 'Yes' : 'No');

    if (!command) {
      console.log('AI Assistant: No command provided');
      return NextResponse.json({ error: 'Command is required' }, { status: 400 });
    }

    // Get user info for confirmation flow
    console.log('AI Assistant: Fetching user data...');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      console.log('AI Assistant: User not found for email:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.log('AI Assistant: User found:', user.id);

    // Handle confirmation of pending actions
    if (confirmed && pendingAction) {
      console.log('AI Assistant: Processing confirmed action');
      console.log('AI Assistant: Pending action data:', JSON.stringify(pendingAction, null, 2));
      console.log('AI Assistant: Recipients:', pendingAction.recipients?.length, 'recipients');

      try {
        const emailResults = await sendEmails(pendingAction, user);
        console.log('AI Assistant: Confirmed email sending completed');

        return NextResponse.json({
          ...pendingAction,
          emailResults,
          success: true,
          confirmed: true,
          message: `Successfully sent emails to ${pendingAction.recipients.length} recipients.`
        });
      } catch (error) {
        console.error('AI Assistant: Error sending confirmed emails:', error);
        console.error('AI Assistant: Error stack:', error instanceof Error ? error.stack : 'No stack');
        return NextResponse.json({
          error: 'Failed to send confirmed emails',
          details: error instanceof Error ? error.message : 'Unknown error',
          success: false
        }, { status: 500 });
      }
    }

    // Check if API key is available
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error('AI Assistant: DEEPSEEK_API_KEY not found in environment');
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }
    console.log('AI Assistant: API key found:', apiKey ? 'Yes' : 'No');

    // User already fetched above for confirmation flow

    // Get all students and modules for context
    console.log('AI Assistant: Fetching context data...');

    let students, modules, classes;

    // Demo mode - use actual student data
    if (process.env.NODE_ENV === 'production' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      console.log('AI Assistant: Using demo data for context');

      students = [
        // HEM3923 - Responder Practicum I (6 students) - These are the ones we need for email targeting
        { id: '55', name: 'Alreem Ahmed Saif Mohammed Alameri', email: 'h00423456@hct.ac.ae', module: 'HEM3923' },
        { id: '56', name: 'Fatima Ali Saif Albian Almarzouei', email: 'h00423457@hct.ac.ae', module: 'HEM3923' },
        { id: '57', name: 'Abdulhamid Bashar Abdulla Hasan Alqadeda', email: 'h00423458@hct.ac.ae', module: 'HEM3923' },
        { id: '58', name: 'Aysha Helal Humaid Anaf Alkaabi', email: 'h00423459@hct.ac.ae', module: 'HEM3923' },
        { id: '59', name: 'Elyazia Jumaa Ahmad Haji', email: 'h00423460@hct.ac.ae', module: 'HEM3923' },
        { id: '60', name: 'Mohammed Nasser Khamis Salem Alkhsuaee', email: 'h00423461@hct.ac.ae', module: 'HEM3923' },

        // HEM3903 - Ambulance Practicum III (9 students)
        { id: '46', name: 'Abdulla Hamad Khalifa Almarzouqi', email: 'h00323456@hct.ac.ae', module: 'HEM3903' },
        { id: '47', name: 'Ahmed Hamad Khalifa Almarzouqi', email: 'h00323457@hct.ac.ae', module: 'HEM3903' },
        { id: '48', name: 'Ali Hamad Khalifa Almarzouqi', email: 'h00323458@hct.ac.ae', module: 'HEM3903' },
        { id: '49', name: 'Hamad Khalifa Ahmed Almarzouqi', email: 'h00323459@hct.ac.ae', module: 'HEM3903' },
        { id: '50', name: 'Khalifa Ahmed Hamad Almarzouqi', email: 'h00323460@hct.ac.ae', module: 'HEM3903' },
        { id: '51', name: 'Mohammed Hamad Khalifa Almarzouqi', email: 'h00323461@hct.ac.ae', module: 'HEM3903' },
        { id: '52', name: 'Saeed Hamad Khalifa Almarzouqi', email: 'h00323462@hct.ac.ae', module: 'HEM3903' },
        { id: '53', name: 'Sultan Hamad Khalifa Almarzouqi', email: 'h00323463@hct.ac.ae', module: 'HEM3903' },
        { id: '54', name: 'Yousef Hamad Khalifa Almarzouqi', email: 'h00323464@hct.ac.ae', module: 'HEM3903' },

        // HEM2903 - Ambulance 1 Practical Group (14 students)
        { id: '32', name: 'Abdulla Saeed Mohammed Alkaabi', email: 'h00223456@hct.ac.ae', module: 'HEM2903' },
        { id: '33', name: 'Ahmed Saeed Mohammed Alkaabi', email: 'h00223457@hct.ac.ae', module: 'HEM2903' },
        { id: '34', name: 'Ali Saeed Mohammed Alkaabi', email: 'h00223458@hct.ac.ae', module: 'HEM2903' },
        { id: '35', name: 'Hamad Saeed Mohammed Alkaabi', email: 'h00223459@hct.ac.ae', module: 'HEM2903' },
        { id: '36', name: 'Khalifa Saeed Mohammed Alkaabi', email: 'h00223460@hct.ac.ae', module: 'HEM2903' },
        { id: '37', name: 'Mohammed Saeed Ahmed Alkaabi', email: 'h00223461@hct.ac.ae', module: 'HEM2903' },
        { id: '38', name: 'Saeed Mohammed Ahmed Alkaabi', email: 'h00223462@hct.ac.ae', module: 'HEM2903' },
        { id: '39', name: 'Sultan Saeed Mohammed Alkaabi', email: 'h00223463@hct.ac.ae', module: 'HEM2903' },
        { id: '40', name: 'Yousef Saeed Mohammed Alkaabi', email: 'h00223464@hct.ac.ae', module: 'HEM2903' },
        { id: '41', name: 'Zayed Saeed Mohammed Alkaabi', email: 'h00223465@hct.ac.ae', module: 'HEM2903' },
        { id: '42', name: 'Omar Saeed Mohammed Alkaabi', email: 'h00223466@hct.ac.ae', module: 'HEM2903' },
        { id: '43', name: 'Rashid Saeed Mohammed Alkaabi', email: 'h00223467@hct.ac.ae', module: 'HEM2903' },
        { id: '44', name: 'Mansour Saeed Mohammed Alkaabi', email: 'h00223468@hct.ac.ae', module: 'HEM2903' },
        { id: '45', name: 'Majid Saeed Mohammed Alkaabi', email: 'h00223469@hct.ac.ae', module: 'HEM2903' },

        // AEM230 - Apply Clinical Practicum (31 students) - Sample of first 5
        { id: '1', name: 'Abdulla Ahmed Abdulla Alhammadi', email: 'h00123456@hct.ac.ae', module: 'AEM230' },
        { id: '2', name: 'Abdulla Ali Saeed Alkaabi', email: 'h00123457@hct.ac.ae', module: 'AEM230' },
        { id: '3', name: 'Abdulla Khalifa Saeed Alkaabi', email: 'h00123458@hct.ac.ae', module: 'AEM230' },
        { id: '4', name: 'Ahmed Abdulla Ahmed Alhammadi', email: 'h00123459@hct.ac.ae', module: 'AEM230' },
        { id: '5', name: 'Ahmed Ali Saeed Alkaabi', email: 'h00123460@hct.ac.ae', module: 'AEM230' }
      ];

      modules = [
        { id: '1', code: 'AEM230', name: 'Apply Clinical Practicum' },
        { id: '2', code: 'HEM2903', name: 'Ambulance 1 Practical Group' },
        { id: '3', code: 'HEM3903', name: 'Ambulance Practicum III' },
        { id: '4', code: 'HEM3923', name: 'Responder Practicum I' }
      ];

      classes = [];
    } else {
      [students, modules, classes] = await Promise.all([
        prisma.student.findMany({
          include: { module: true }
        }),
        prisma.module.findMany(),
        prisma.classSession.findMany({
          include: { module: true, location: true }
        })
      ]);
    }
    
    console.log('AI Assistant: Context data loaded - Students:', students.length, 'Modules:', modules.length, 'Classes:', classes.length);

    context = {
      students: students.map(s => ({
        id: s.id,
        name: s.fullName,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        studentId: s.studentId,
        module: s.module?.code || 'No Module',
        moduleId: s.moduleId,
        moduleName: s.module?.name
      })),
      modules: modules.map(m => ({
        id: m.id,
        code: m.code,
        name: m.name
      })),
      classes: classes.map(c => ({
        id: c.id,
        title: c.title,
        date: c.date,
        startTime: c.startTime,
        endTime: c.endTime,
        module: c.module?.code,
        location: c.location?.name
      }))
    };

    // Simplify the AI request to focus on core functionality
    console.log('AI Assistant: Preparing to send request to AI service...');
    console.log('AI Assistant: Command:', command);
    console.log('AI Assistant: Context prepared with students:', context.students.length);

    // Create a comprehensive system prompt for intelligent understanding
    const systemPrompt = `You are an advanced AI assistant for the HCT Al Ain EMS Student Tracking System. You have deep understanding of educational contexts, student management, and can handle complex, nuanced requests.

SYSTEM CONTEXT:
- Institution: Higher Colleges of Technology (HCT) Al Ain Campus
- Program: Emergency Medical Services (EMS)
- Total Students: ${context.students.length}
- Active Modules: 4 (AEM230: ${context.students.filter((s: any) => s.module === 'AEM230').length}, HEM2903: ${context.students.filter((s: any) => s.module === 'HEM2903').length}, HEM3903: ${context.students.filter((s: any) => s.module === 'HEM3903').length}, HEM3923: ${context.students.filter((s: any) => s.module === 'HEM3923').length})

MODULE DETAILS & INTELLIGENT MAPPINGS:
- AEM230: "Apply Clinical Practicum 1 AMB" (Diploma level, 31 students)
  * Keywords: "diploma", "clinical practicum", "AMB", "apply clinical"
- HEM2903: "Ambulance 1 Practical Group" (14 students)
  * Keywords: "ambulance 1", "practical", "basic ambulance", "first year ambulance"
- HEM3903: "Ambulance Practicum III" (9 students)
  * Keywords: "ambulance 3", "advanced ambulance", "practicum 3", "senior ambulance", "ambulance practicum III"
- HEM3923: "Responder Practicum I" (6 students)
  * Keywords: "responder", "first responder", "emergency responder", "responder 1", "responder practicum", "HEM3923"

CRITICAL MODULE DISTINCTION:
⚠️ NEVER CONFUSE HEM3903 (Ambulance Practicum III) with HEM3923 (Responder Practicum I)
- "RESPONDER" = HEM3923 ONLY (6 students)
- "AMBULANCE PRACTICUM III" = HEM3903 ONLY (9 students)
- When user says "responder students" → ALWAYS use HEM3923
- When user says "ambulance practicum 3" → ALWAYS use HEM3903

INTELLIGENT UNDERSTANDING CAPABILITIES:
1. NATURAL LANGUAGE: Understand conversational requests, implied meanings, context
2. EDUCATIONAL TERMS: Recognize academic terminology, assessment types, scheduling
3. MULTILINGUAL: Process English and Arabic commands seamlessly
4. CONTEXTUAL INFERENCE: Deduce intent from partial information
5. SMART FILTERING: Apply logical filters based on academic criteria

SUPPORTED ACTIONS (Comprehensive):
- "send_email": Individual/bulk emails with smart recipient selection (students OR external)
- "send_external_email": Emails to staff, faculty, or external contacts (non-students)
- "get_info": Student data, analytics, reports, summaries
- "create_assignment": Generate tasks, deadlines, requirements
- "schedule_class": Class scheduling and coordination
- "generate_report": Academic reports, progress tracking, analytics
- "manage_students": Update info, group students, track attendance
- "analyze_data": Performance analysis, trends, insights
- "send_reminder": Automated reminders for various purposes
- "create_group": Smart grouping based on criteria
- "track_progress": Monitor student advancement and performance

EMAIL RECIPIENT INTELLIGENCE:
- STUDENT EMAILS: Use student database for recipients (e.g., "email all HEM3903 students")
- EXTERNAL EMAILS: Direct email addresses provided (e.g., "send to ethomas@hct.ac.ae")
- STAFF/FACULTY: Recognize @hct.ac.ae emails as staff, not students
- CONTEXT CLUES: "remind him/her", specific email addresses, staff titles indicate external emails

RESPONSE FORMAT (JSON):
{
  "understood": true/false,
  "action": "send_email|send_external_email|get_info|create_assignment|schedule_class|generate_report|manage_students|analyze_data|send_reminder|create_group|track_progress",
  "recipients": [{"id": "student_id OR external", "name": "recipient_name", "email": "recipient_email", "module": "module_code OR external"}],
  "subject": "email subject (if applicable)",
  "message": "content/response",
  "summary": "clear explanation of what you understood and will execute",
  "details": "additional context or instructions",
  "filters_applied": ["list of criteria used for selection"],
  "language": "en|ar|mixed",
  "recipient_type": "students|external|mixed",
  "requiresConfirmation": true/false,
  "confirmationMessage": "Clear summary for user confirmation before execution"
}

INTELLIGENCE GUIDELINES:
- ALWAYS understand the intent, even with informal language
- Use context clues to identify the correct module/students
- Provide helpful suggestions if request is unclear
- Handle both specific and general requests intelligently
- Recognize synonyms, abbreviations, and colloquial terms
- Infer missing information from context when reasonable

CRITICAL VALIDATION RULES:
⚠️ MODULE IDENTIFICATION MUST BE EXACT:
- "responder" OR "responder students" → ALWAYS use HEM3923 (6 students)
- "ambulance practicum III" OR "ambulance 3" → ALWAYS use HEM3903 (9 students)
- NEVER confuse HEM3903 with HEM3923 - they are completely different modules
- If uncertain about module, ask for clarification rather than guessing
- Double-check that recipients match the intended module before sending emails

EMAIL PERSONALIZATION REQUIREMENTS:
⚠️ ALWAYS PERSONALIZE EMAILS WITH ACTUAL STUDENT NAMES:
- NEVER use placeholders like "[Student Name]" or "[Your Name]"
- ALWAYS replace "[Student Name]" with the actual student's full name from the database
- Each email must be individually personalized for each recipient
- Use the exact "Name" field from the student data provided

CONFIRMATION REQUIREMENTS:
⚠️ FOR EMAIL ACTIONS - ALWAYS REQUIRE CONFIRMATION:
- Set "requiresConfirmation": true for all email actions
- Provide clear "confirmationMessage" with: recipients count, module, subject, and action
- DO NOT execute emails immediately - wait for user confirmation
- Example: "I understand you want to email 6 HEM3923 Responder students about tomorrow's class. Should I proceed?"

CRITICAL: STUDENT DATA USAGE:
⚠️ ONLY USE EXACT STUDENT DATA FROM THE PROVIDED LIST:
- NEVER generate or hallucinate student IDs, names, or emails
- ALWAYS use the exact ID, name, and email from the students list below
- When filtering by module, use ONLY students whose "Module" field matches the requested module code
- If a student is not in the list below, they DO NOT exist - do not create fake data

Students available:
${context.students.slice(0, 20).map((s: any) => `- ID: ${s.id}, Name: ${s.name}, Email: ${s.email}, Module: ${s.module}`).join('\n')}
${context.students.length > 20 ? `... and ${context.students.length - 20} more students` : ''}

FULL STUDENT LIST FOR HEM3923:
${context.students.filter((s: any) => s.module === 'HEM3923').map((s: any) => `- ID: ${s.id}, Name: ${s.name}, Email: ${s.email}, Module: ${s.module}`).join('\n')}`;

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
      max_tokens: 1500,
      temperature: 0.7
    };

    console.log('AI Assistant: Sending request to DeepSeek API...');
    console.log('AI Assistant: Request body size:', JSON.stringify(requestBody).length, 'characters');

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('AI Assistant: Response received - Status:', response.status, response.statusText);
    console.log('AI Assistant: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('DeepSeek API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('DeepSeek API error response:', errorText);

      // Check if it's a common upstream error
      if (errorText.includes('upstream') || errorText.includes('502') || errorText.includes('503')) {
        return NextResponse.json({
          error: 'DeepSeek API temporarily unavailable',
          details: 'The AI service is experiencing connectivity issues. Please try again in a moment.',
          technicalDetails: errorText.substring(0, 200)
        }, { status: 503 });
      }

      // Check for API key issues
      if (response.status === 401 || errorText.includes('unauthorized') || errorText.includes('invalid_api_key')) {
        return NextResponse.json({
          error: 'DeepSeek API authentication failed',
          details: 'Please check the API key configuration.',
          technicalDetails: errorText.substring(0, 200)
        }, { status: 401 });
      }

      return NextResponse.json({
        error: `DeepSeek API failed: ${response.status} ${response.statusText}`,
        details: errorText
      }, { status: 500 });
    }

    // Parse the response with better error handling
    console.log('AI Assistant: Parsing response...');
    const contentType = response.headers.get('content-type');
    console.log('AI Assistant: Response content-type:', contentType);
    
    let aiResponseData;
    let responseText;
    
    try {
      // First get the response as text to see what we're dealing with
      responseText = await response.text();
      console.log('AI Assistant: Raw response text (first 500 chars):', responseText.substring(0, 500));
      
      // Check if response looks like HTML (common for upstream errors)
      if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
        console.error('AI Assistant: Received HTML response instead of JSON');
        return NextResponse.json({
          error: 'DeepSeek API returned HTML error page',
          details: 'The AI service is experiencing issues. Please try again in a moment.',
          technicalDetails: responseText.substring(0, 300)
        }, { status: 502 });
      }

      // Check if response starts with common error prefixes
      if (responseText.startsWith('upstream') || responseText.includes('502 Bad Gateway') || responseText.includes('503 Service')) {
        console.error('AI Assistant: Received upstream/gateway error');
        return NextResponse.json({
          error: 'DeepSeek API gateway error',
          details: 'The AI service is temporarily unavailable. Please try again in a moment.',
          technicalDetails: responseText.substring(0, 200)
        }, { status: 502 });
      }
      
      // Try to parse as JSON
      aiResponseData = JSON.parse(responseText);
      console.log('AI Assistant: Response parsed successfully');
      console.log('AI Assistant: Response structure keys:', Object.keys(aiResponseData));
      
    } catch (e) {
      console.error('AI Assistant: Failed to parse response:', e);
      console.error('AI Assistant: Response text that failed to parse:', responseText);
      
      return NextResponse.json({
        error: 'Invalid response from DeepSeek API',
        details: 'The DeepSeek API returned malformed data. This may be a temporary issue.',
        technicalDetails: responseText?.substring(0, 300) || 'No response text',
        parseError: e instanceof Error ? e.message : 'Unknown parse error'
      }, { status: 502 });
    }
    
    let aiResponse;
    try {
      const content = aiResponseData.choices?.[0]?.message?.content;
      console.log('AI Assistant: Raw content:', content);
      
      if (!content) {
        throw new Error('No content in AI response');
      }
      
      aiResponse = JSON.parse(content);
      console.log('AI Assistant: Parsed AI response:', { understood: aiResponse.understood, action: aiResponse.action });
      
      // Validate the response structure
      if (typeof aiResponse.understood === 'undefined') {
        throw new Error('AI response missing required "understood" field');
      }

      // CRITICAL: Validate module identification to prevent wrong emails
      if (aiResponse.action === 'send_email' && aiResponse.recipients?.length > 0) {
        const originalCommand = command.toLowerCase();
        const firstRecipient = aiResponse.recipients[0];

        // Check for responder confusion
        if (originalCommand.includes('responder') && firstRecipient.module !== 'HEM3923') {
          console.error('AI Assistant: CRITICAL ERROR - Responder request mapped to wrong module!');
          console.error('AI Assistant: Command:', originalCommand);
          console.error('AI Assistant: AI mapped to module:', firstRecipient.module);

          // Override with correct HEM3923 students
          const correctStudents = context.students.filter((s: any) => s.module === 'HEM3923');
          aiResponse.recipients = correctStudents.map((s: any) => ({
            id: s.id,
            name: s.name,
            email: s.email,
            module: s.module
          }));
          aiResponse.summary = `CORRECTED: Sending to HEM3923 Responder Practicum I students (${correctStudents.length} students)`;
          console.log('AI Assistant: CORRECTED - Using HEM3923 students for responder request');
        }
      }
      
    } catch (parseError) {
      console.error('AI Assistant: Failed to parse AI response content:', parseError);
      const originalContent = aiResponseData.choices?.[0]?.message?.content;
      console.error('AI Assistant: Content that failed to parse:', originalContent);

      // Try to fix common JSON issues
      try {
        console.log('AI Assistant: Attempting to fix malformed JSON...');
        let fixedContent = originalContent;

        // Fix missing quotes around email addresses
        fixedContent = fixedContent.replace(/"email":\s*([^"@]+@[^",\s}]+)/g, '"email": "$1"');

        // Try parsing the fixed content
        const fixedAiResponse = JSON.parse(fixedContent);
        console.log('AI Assistant: Successfully fixed and parsed JSON');

        // Continue with the fixed response
        aiResponse = fixedAiResponse;
      } catch (fixError) {
        console.error('AI Assistant: Failed to fix JSON:', fixError);
        return NextResponse.json({
          error: 'Failed to parse DeepSeek response content',
          details: originalContent || 'No response content',
          parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        }, { status: 500 });
      }
    }

    // Handle different action types intelligently
    if (aiResponse.understood) {
      console.log('AI Assistant: Processing action:', aiResponse.action);

      switch (aiResponse.action) {
        case 'send_email':
        case 'send_reminder':
        case 'send_external_email':
          if (aiResponse.recipients?.length > 0) {
            // Check if this requires confirmation and hasn't been confirmed yet
            if (aiResponse.requiresConfirmation && !confirmed) {
              console.log('AI Assistant: Email action requires confirmation - waiting for user approval');
              return NextResponse.json({
                ...aiResponse,
                awaitingConfirmation: true,
                success: false,
                message: aiResponse.confirmationMessage || `Ready to email ${aiResponse.recipients.length} recipients. Please confirm to proceed.`
              });
            }

            // If confirmed or doesn't require confirmation, proceed with sending
            console.log('AI Assistant: Sending emails to', aiResponse.recipients.length, 'recipients');
            console.log('AI Assistant: Recipient type:', aiResponse.recipient_type || 'mixed');
            const emailResults = await sendEmails(aiResponse, user);
            console.log('AI Assistant: Email sending completed');

            return NextResponse.json({
              ...aiResponse,
              emailResults,
              success: true
            });
          } else {
            return NextResponse.json({
              ...aiResponse,
              error: 'No recipients found for email action',
              success: false
            });
          }

        case 'get_info':
        case 'analyze_data':
        case 'generate_report':
          // For information requests, enhance the response with actual data
          console.log('AI Assistant: Processing information request');
          return NextResponse.json({
            ...aiResponse,
            contextData: {
              totalStudents: context.students.length,
              moduleBreakdown: {
                AEM230: context.students.filter((s: any) => s.module === 'AEM230').length,
                HEM2903: context.students.filter((s: any) => s.module === 'HEM2903').length,
                HEM3903: context.students.filter((s: any) => s.module === 'HEM3903').length,
                HEM3923: context.students.filter((s: any) => s.module === 'HEM3923').length
              },
              students: aiResponse.recipients || context.students
            },
            success: true
          });

        case 'create_assignment':
        case 'schedule_class':
        case 'manage_students':
        case 'create_group':
        case 'track_progress':
          // For management actions, return structured response
          console.log('AI Assistant: Processing management action');
          return NextResponse.json({
            ...aiResponse,
            actionType: 'management',
            requiresConfirmation: true,
            success: true
          });

        default:
          // Handle any other understood actions
          console.log('AI Assistant: Returning general response');
          return NextResponse.json({
            ...aiResponse,
            success: true
          });
      }
    } else {
      // AI didn't understand the command
      console.log('AI Assistant: Command not understood');
      return NextResponse.json({
        ...aiResponse,
        success: false
      });
    }

  } catch (error) {
    console.error('AI Assistant: Top-level error occurred:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    console.error('AI Assistant: Error details:', { message: errorMessage, stack: errorStack });
    
    // Provide a fallback response for common requests
    if (command.toLowerCase().includes('responder') && command.toLowerCase().includes('student')) {
      const responderStudents = context.students.filter((s: any) => s.module === 'HEM3923');
      console.log('AI Assistant: Providing fallback for responder students request');
      
      return NextResponse.json({
        understood: true,
        action: 'fallback_info',
        summary: `I found ${responderStudents.length} Responder 1 students (HEM3923 module) but the AI service is currently unavailable. You can manually send emails to these students using the bulk email feature.`,
        recipients: responderStudents,
        fallback: true,
        error: errorMessage,
        instructions: 'Use the bulk email feature in the Students section to send your message to HEM3923 students.'
      });
    }
    
    return NextResponse.json(
      {
        understood: false,
        error: 'DeepSeek AI Assistant service temporarily unavailable',
        details: 'The DeepSeek AI processing service is experiencing issues. Please try again in a few minutes or use the manual features in the system.',
        technicalDetails: errorMessage,
        timestamp: new Date().toISOString(),
        fallback: true
      },
      { status: 503 }
    );
  }
}

async function sendEmails(aiResponse: any, user: any) {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as any[]
  };

  console.log('sendEmails: Processing', aiResponse.recipients?.length, 'recipients');
  console.log('sendEmails: AI Response structure:', {
    action: aiResponse.action,
    subject: aiResponse.subject,
    message: aiResponse.message ? 'Present' : 'Missing',
    recipients: aiResponse.recipients?.length || 0
  });

  for (const recipient of aiResponse.recipients) {
    console.log('sendEmails: Processing recipient:', {
      id: recipient.id,
      name: recipient.name,
      email: recipient.email,
      module: recipient.module
    });
    try {
      // Check if this is an external email (has email address and module is 'external' or action is send_external_email)
      const isExternalEmail = (recipient.module === 'external' ||
                              aiResponse.action === 'send_external_email' ||
                              aiResponse.recipient_type === 'external' ||
                              (recipient.email && !recipient.id && recipient.email.includes('@')));

      if (isExternalEmail && recipient.email) {
        // Send external email directly
        console.log('AI Assistant: Sending external email to:', recipient.email);

        await sendEmail({
          to: recipient.email,
          subject: aiResponse.subject,
          html: createEmailHtml(aiResponse.message, recipient.name || 'Recipient', aiResponse.language),
          text: aiResponse.message
        });

        results.sent++;

        // Log the external email activity (no student ID required)
        await prisma.activity.create({
          data: {
            type: 'external_email_sent',
            description: `AI Assistant external email: "${aiResponse.subject}" to ${recipient.email}`,
            metadata: {
              subject: aiResponse.subject,
              language: aiResponse.language,
              emailType: 'external',
              recipientEmail: recipient.email,
              recipientName: recipient.name,
              sentBy: user.name || user.email,
              sentAt: new Date().toISOString()
            }
          }
        });

        continue; // Skip student lookup for external emails
      }

      // For student emails, find student by ID, email, or name
      let student = null;

      if (recipient.id && recipient.id !== 'external') {
        student = await prisma.student.findUnique({
          where: { id: recipient.id }
        });
      }

      if (!student && recipient.email) {
        student = await prisma.student.findUnique({
          where: { email: recipient.email }
        });
      }

      if (!student && recipient.name) {
        student = await prisma.student.findFirst({
          where: { fullName: recipient.name }
        });
      }

      if (!student) {
        console.log('sendEmails: Student not found for recipient:', {
          id: recipient.id,
          name: recipient.name,
          email: recipient.email
        });
        results.failed++;
        results.errors.push({
          recipient: recipient.name || recipient.email,
          error: 'Student not found in database'
        });
        continue;
      }

      if (student?.email) {
        // Personalize the message by replacing placeholders with actual student name
        const personalizedMessage = aiResponse.message
          .replace(/\[Student Name\]/g, student.fullName || student.firstName)
          .replace(/\[student name\]/g, student.fullName || student.firstName)
          .replace(/\[STUDENT NAME\]/g, student.fullName || student.firstName);

        await sendEmail({
          to: student.email,
          subject: aiResponse.subject,
          html: createEmailHtml(personalizedMessage, student.fullName || student.firstName, aiResponse.language),
          text: personalizedMessage
        });

        results.sent++;

        // Log the student email activity
        await prisma.activity.create({
          data: {
            studentId: student.id,
            type: 'email_sent',
            description: `AI Assistant email: "${aiResponse.subject}"`,
            metadata: {
              subject: aiResponse.subject,
              language: aiResponse.language,
              emailType: aiResponse.emailType || 'student',
              sentBy: user.name || user.email,
              sentAt: new Date().toISOString()
            }
          }
        });
      } else {
        results.failed++;
        results.errors.push({
          studentName: recipient.name || 'Unknown',
          error: 'Student not found or no email address'
        });
      }
    } catch (error) {
      console.error(`Failed to send email to student ${recipient.name || recipient.id}:`, error);
      results.failed++;
      results.errors.push({
        studentName: recipient.name || recipient.id || 'Unknown',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return results;
}

function createEmailHtml(message: string, studentName: string, language: string) {
  const isArabic = language === 'arabic';
  const direction = isArabic ? 'rtl' : 'ltr';
  const textAlign = isArabic ? 'right' : 'left';

  // Check if message already contains a greeting or signature to avoid duplication
  const hasGreeting = message.toLowerCase().includes('dear ') || message.includes('عزيز');
  const hasSignature = message.toLowerCase().includes('best regards') ||
                      message.toLowerCase().includes('regards') ||
                      message.toLowerCase().includes('sincerely') ||
                      message.includes('مع أطيب التحيات') ||
                      message.includes('clinical instructor') ||
                      message.includes('hct al ain');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: ${direction};">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
        <h1 style="margin: 0; font-size: 24px; text-align: ${textAlign};">
          ${isArabic ? 'رسالة من نظام متابعة الطلاب' : 'Message from Student Tracking System'}
        </h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9; text-align: ${textAlign};">
          ${isArabic ? 'برنامج الخدمات الطبية الطارئة - كلية التقنية العليا العين' : 'HCT Al Ain EMS Program'}
        </p>
      </div>

      <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        ${!hasGreeting ? `<p style="font-size: 16px; color: #333; text-align: ${textAlign};">
          ${isArabic ? `عزيزي/عزيزتي ${studentName}،` : `Dear ${studentName},`}
        </p>` : ''}

        <div style="font-size: 16px; color: #555; line-height: 1.6; margin: 20px 0; text-align: ${textAlign};">
          ${message.replace(/\n/g, '<br>')}
        </div>

        ${!hasSignature ? `<p style="font-size: 16px; color: #555; margin-top: 30px; text-align: ${textAlign};">
          ${isArabic ? 'مع أطيب التحيات،<br><strong>مدرسكم في برنامج الخدمات الطبية الطارئة</strong>' : 'Best regards,<br><strong>Your HCT Al Ain EMS Instructor</strong>'}
        </p>` : ''}
      </div>

      <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
        <p>${isArabic ? 'هذه رسالة تلقائية من نظام متابعة الطلاب' : 'This is an automated message from Student Tracking System'}</p>
      </div>
    </div>
  `;
}
