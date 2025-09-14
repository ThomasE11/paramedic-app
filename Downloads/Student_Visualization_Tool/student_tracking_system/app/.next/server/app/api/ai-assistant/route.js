"use strict";(()=>{var e={};e.id=7388,e.ids=[7388],e.modules={53524:e=>{e.exports=require("@prisma/client")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},27790:e=>{e.exports=require("assert")},78893:e=>{e.exports=require("buffer")},61282:e=>{e.exports=require("child_process")},84770:e=>{e.exports=require("crypto")},80665:e=>{e.exports=require("dns")},17702:e=>{e.exports=require("events")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},98216:e=>{e.exports=require("net")},19801:e=>{e.exports=require("os")},55315:e=>{e.exports=require("path")},86624:e=>{e.exports=require("querystring")},76162:e=>{e.exports=require("stream")},82452:e=>{e.exports=require("tls")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},14425:(e,t,s)=>{s.r(t),s.d(t,{originalPathname:()=>E,patchFetch:()=>I,requestAsyncStorage:()=>h,routeModule:()=>A,serverHooks:()=>x,staticGenerationAsyncStorage:()=>f});var a={};s.r(a),s.d(a,{POST:()=>u});var n=s(49303),i=s(88716),r=s(60670),o=s(87070),l=s(75571),d=s(90455),c=s(72331),m=s(36119);async function u(e){let t="",s={};try{let a,n,i,r,m,u;console.log("AI Assistant: Starting request processing...");let g=await (0,l.getServerSession)(d.L);if(!g?.user?.email)return console.log("AI Assistant: No session or user email"),o.NextResponse.json({error:"Unauthorized"},{status:401});let A=await e.json();t=A.command;let h=A.confirmed||!1,f=A.pendingAction||null;if(console.log("AI Assistant: Received command:",t),console.log("AI Assistant: Confirmed:",h),console.log("AI Assistant: Pending action:",f?"Yes":"No"),!t)return console.log("AI Assistant: No command provided"),o.NextResponse.json({error:"Command is required"},{status:400});console.log("AI Assistant: Fetching user data...");let x=await c._.user.findUnique({where:{email:g.user.email}});if(!x)return console.log("AI Assistant: User not found for email:",g.user.email),o.NextResponse.json({error:"User not found"},{status:404});if(console.log("AI Assistant: User found:",x.id),h&&f){console.log("AI Assistant: Processing confirmed action"),console.log("AI Assistant: Pending action data:",JSON.stringify(f,null,2)),console.log("AI Assistant: Recipients:",f.recipients?.length,"recipients");try{let e=await p(f,x);return console.log("AI Assistant: Confirmed email sending completed"),o.NextResponse.json({...f,emailResults:e,success:!0,confirmed:!0,message:`Successfully sent emails to ${f.recipients.length} recipients.`})}catch(e){return console.error("AI Assistant: Error sending confirmed emails:",e),console.error("AI Assistant: Error stack:",e instanceof Error?e.stack:"No stack"),o.NextResponse.json({error:"Failed to send confirmed emails",details:e instanceof Error?e.message:"Unknown error",success:!1},{status:500})}}let E=process.env.DEEPSEEK_API_KEY;if(!E)return console.error("AI Assistant: DEEPSEEK_API_KEY not found in environment"),o.NextResponse.json({error:"AI service not configured"},{status:500});console.log("AI Assistant: API key found:",E?"Yes":"No"),console.log("AI Assistant: Fetching context data..."),console.log("AI Assistant: Using demo data for context"),a=[{id:"55",name:"Alreem Ahmed Saif Mohammed Alameri",email:"h00423456@hct.ac.ae",module:"HEM3923"},{id:"56",name:"Fatima Ali Saif Albian Almarzouei",email:"h00423457@hct.ac.ae",module:"HEM3923"},{id:"57",name:"Abdulhamid Bashar Abdulla Hasan Alqadeda",email:"h00423458@hct.ac.ae",module:"HEM3923"},{id:"58",name:"Aysha Helal Humaid Anaf Alkaabi",email:"h00423459@hct.ac.ae",module:"HEM3923"},{id:"59",name:"Elyazia Jumaa Ahmad Haji",email:"h00423460@hct.ac.ae",module:"HEM3923"},{id:"60",name:"Mohammed Nasser Khamis Salem Alkhsuaee",email:"h00423461@hct.ac.ae",module:"HEM3923"},{id:"46",name:"Abdulla Hamad Khalifa Almarzouqi",email:"h00323456@hct.ac.ae",module:"HEM3903"},{id:"47",name:"Ahmed Hamad Khalifa Almarzouqi",email:"h00323457@hct.ac.ae",module:"HEM3903"},{id:"48",name:"Ali Hamad Khalifa Almarzouqi",email:"h00323458@hct.ac.ae",module:"HEM3903"},{id:"49",name:"Hamad Khalifa Ahmed Almarzouqi",email:"h00323459@hct.ac.ae",module:"HEM3903"},{id:"50",name:"Khalifa Ahmed Hamad Almarzouqi",email:"h00323460@hct.ac.ae",module:"HEM3903"},{id:"51",name:"Mohammed Hamad Khalifa Almarzouqi",email:"h00323461@hct.ac.ae",module:"HEM3903"},{id:"52",name:"Saeed Hamad Khalifa Almarzouqi",email:"h00323462@hct.ac.ae",module:"HEM3903"},{id:"53",name:"Sultan Hamad Khalifa Almarzouqi",email:"h00323463@hct.ac.ae",module:"HEM3903"},{id:"54",name:"Yousef Hamad Khalifa Almarzouqi",email:"h00323464@hct.ac.ae",module:"HEM3903"},{id:"32",name:"Abdulla Saeed Mohammed Alkaabi",email:"h00223456@hct.ac.ae",module:"HEM2903"},{id:"33",name:"Ahmed Saeed Mohammed Alkaabi",email:"h00223457@hct.ac.ae",module:"HEM2903"},{id:"34",name:"Ali Saeed Mohammed Alkaabi",email:"h00223458@hct.ac.ae",module:"HEM2903"},{id:"35",name:"Hamad Saeed Mohammed Alkaabi",email:"h00223459@hct.ac.ae",module:"HEM2903"},{id:"36",name:"Khalifa Saeed Mohammed Alkaabi",email:"h00223460@hct.ac.ae",module:"HEM2903"},{id:"37",name:"Mohammed Saeed Ahmed Alkaabi",email:"h00223461@hct.ac.ae",module:"HEM2903"},{id:"38",name:"Saeed Mohammed Ahmed Alkaabi",email:"h00223462@hct.ac.ae",module:"HEM2903"},{id:"39",name:"Sultan Saeed Mohammed Alkaabi",email:"h00223463@hct.ac.ae",module:"HEM2903"},{id:"40",name:"Yousef Saeed Mohammed Alkaabi",email:"h00223464@hct.ac.ae",module:"HEM2903"},{id:"41",name:"Zayed Saeed Mohammed Alkaabi",email:"h00223465@hct.ac.ae",module:"HEM2903"},{id:"42",name:"Omar Saeed Mohammed Alkaabi",email:"h00223466@hct.ac.ae",module:"HEM2903"},{id:"43",name:"Rashid Saeed Mohammed Alkaabi",email:"h00223467@hct.ac.ae",module:"HEM2903"},{id:"44",name:"Mansour Saeed Mohammed Alkaabi",email:"h00223468@hct.ac.ae",module:"HEM2903"},{id:"45",name:"Majid Saeed Mohammed Alkaabi",email:"h00223469@hct.ac.ae",module:"HEM2903"},{id:"1",name:"Abdulla Ahmed Abdulla Alhammadi",email:"h00123456@hct.ac.ae",module:"AEM230"},{id:"2",name:"Abdulla Ali Saeed Alkaabi",email:"h00123457@hct.ac.ae",module:"AEM230"},{id:"3",name:"Abdulla Khalifa Saeed Alkaabi",email:"h00123458@hct.ac.ae",module:"AEM230"},{id:"4",name:"Ahmed Abdulla Ahmed Alhammadi",email:"h00123459@hct.ac.ae",module:"AEM230"},{id:"5",name:"Ahmed Ali Saeed Alkaabi",email:"h00123460@hct.ac.ae",module:"AEM230"}],n=[{id:"1",code:"AEM230",name:"Apply Clinical Practicum"},{id:"2",code:"HEM2903",name:"Ambulance 1 Practical Group"},{id:"3",code:"HEM3903",name:"Ambulance Practicum III"},{id:"4",code:"HEM3923",name:"Responder Practicum I"}],i=[],console.log("AI Assistant: Context data loaded - Students:",a.length,"Modules:",n.length,"Classes:",i.length),s={students:a.map(e=>({id:e.id,name:e.fullName,firstName:e.firstName,lastName:e.lastName,email:e.email,studentId:e.studentId,module:e.module?.code||"No Module",moduleId:e.moduleId,moduleName:e.module?.name})),modules:n.map(e=>({id:e.id,code:e.code,name:e.name})),classes:i.map(e=>({id:e.id,title:e.title,date:e.date,startTime:e.startTime,endTime:e.endTime,module:e.module?.code,location:e.location?.name}))},console.log("AI Assistant: Preparing to send request to AI service..."),console.log("AI Assistant: Command:",t),console.log("AI Assistant: Context prepared with students:",s.students.length);let I=`You are an advanced AI assistant for the HCT Al Ain EMS Student Tracking System. You have deep understanding of educational contexts, student management, and can handle complex, nuanced requests.

SYSTEM CONTEXT:
- Institution: Higher Colleges of Technology (HCT) Al Ain Campus
- Program: Emergency Medical Services (EMS)
- Total Students: ${s.students.length}
- Active Modules: 4 (AEM230: ${s.students.filter(e=>"AEM230"===e.module).length}, HEM2903: ${s.students.filter(e=>"HEM2903"===e.module).length}, HEM3903: ${s.students.filter(e=>"HEM3903"===e.module).length}, HEM3923: ${s.students.filter(e=>"HEM3923"===e.module).length})

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
${s.students.slice(0,20).map(e=>`- ID: ${e.id}, Name: ${e.name}, Email: ${e.email}, Module: ${e.module}`).join("\n")}
${s.students.length>20?`... and ${s.students.length-20} more students`:""}

FULL STUDENT LIST FOR HEM3923:
${s.students.filter(e=>"HEM3923"===e.module).map(e=>`- ID: ${e.id}, Name: ${e.name}, Email: ${e.email}, Module: ${e.module}`).join("\n")}`,y={model:"deepseek-chat",messages:[{role:"system",content:I},{role:"user",content:t}],response_format:{type:"json_object"},max_tokens:1500,temperature:.7};console.log("AI Assistant: Sending request to DeepSeek API..."),console.log("AI Assistant: Request body size:",JSON.stringify(y).length,"characters");let b=await fetch("https://api.deepseek.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${E}`},body:JSON.stringify(y)});if(console.log("AI Assistant: Response received - Status:",b.status,b.statusText),console.log("AI Assistant: Response headers:",Object.fromEntries(b.headers.entries())),!b.ok){console.error("DeepSeek API error:",b.status,b.statusText);let e=await b.text();if(console.error("DeepSeek API error response:",e),e.includes("upstream")||e.includes("502")||e.includes("503"))return o.NextResponse.json({error:"DeepSeek API temporarily unavailable",details:"The AI service is experiencing connectivity issues. Please try again in a moment.",technicalDetails:e.substring(0,200)},{status:503});if(401===b.status||e.includes("unauthorized")||e.includes("invalid_api_key"))return o.NextResponse.json({error:"DeepSeek API authentication failed",details:"Please check the API key configuration.",technicalDetails:e.substring(0,200)},{status:401});return o.NextResponse.json({error:`DeepSeek API failed: ${b.status} ${b.statusText}`,details:e},{status:500})}console.log("AI Assistant: Parsing response...");let S=b.headers.get("content-type");console.log("AI Assistant: Response content-type:",S);try{if(m=await b.text(),console.log("AI Assistant: Raw response text (first 500 chars):",m.substring(0,500)),m.includes("<html")||m.includes("<!DOCTYPE"))return console.error("AI Assistant: Received HTML response instead of JSON"),o.NextResponse.json({error:"DeepSeek API returned HTML error page",details:"The AI service is experiencing issues. Please try again in a moment.",technicalDetails:m.substring(0,300)},{status:502});if(m.startsWith("upstream")||m.includes("502 Bad Gateway")||m.includes("503 Service"))return console.error("AI Assistant: Received upstream/gateway error"),o.NextResponse.json({error:"DeepSeek API gateway error",details:"The AI service is temporarily unavailable. Please try again in a moment.",technicalDetails:m.substring(0,200)},{status:502});r=JSON.parse(m),console.log("AI Assistant: Response parsed successfully"),console.log("AI Assistant: Response structure keys:",Object.keys(r))}catch(e){return console.error("AI Assistant: Failed to parse response:",e),console.error("AI Assistant: Response text that failed to parse:",m),o.NextResponse.json({error:"Invalid response from DeepSeek API",details:"The DeepSeek API returned malformed data. This may be a temporary issue.",technicalDetails:m?.substring(0,300)||"No response text",parseError:e instanceof Error?e.message:"Unknown parse error"},{status:502})}try{let e=r.choices?.[0]?.message?.content;if(console.log("AI Assistant: Raw content:",e),!e)throw Error("No content in AI response");if(u=JSON.parse(e),console.log("AI Assistant: Parsed AI response:",{understood:u.understood,action:u.action}),void 0===u.understood)throw Error('AI response missing required "understood" field');if("send_email"===u.action&&u.recipients?.length>0){let e=t.toLowerCase(),a=u.recipients[0];if(e.includes("responder")&&"HEM3923"!==a.module){console.error("AI Assistant: CRITICAL ERROR - Responder request mapped to wrong module!"),console.error("AI Assistant: Command:",e),console.error("AI Assistant: AI mapped to module:",a.module);let t=s.students.filter(e=>"HEM3923"===e.module);u.recipients=t.map(e=>({id:e.id,name:e.name,email:e.email,module:e.module})),u.summary=`CORRECTED: Sending to HEM3923 Responder Practicum I students (${t.length} students)`,console.log("AI Assistant: CORRECTED - Using HEM3923 students for responder request")}}}catch(t){console.error("AI Assistant: Failed to parse AI response content:",t);let e=r.choices?.[0]?.message?.content;console.error("AI Assistant: Content that failed to parse:",e);try{console.log("AI Assistant: Attempting to fix malformed JSON...");let t=e;t=t.replace(/"email":\s*([^"@]+@[^",\s}]+)/g,'"email": "$1"');let s=JSON.parse(t);console.log("AI Assistant: Successfully fixed and parsed JSON"),u=s}catch(s){return console.error("AI Assistant: Failed to fix JSON:",s),o.NextResponse.json({error:"Failed to parse DeepSeek response content",details:e||"No response content",parseError:t instanceof Error?t.message:"Unknown parse error"},{status:500})}}if(!u.understood)return console.log("AI Assistant: Command not understood"),o.NextResponse.json({...u,success:!1});switch(console.log("AI Assistant: Processing action:",u.action),u.action){case"send_email":case"send_reminder":case"send_external_email":if(!(u.recipients?.length>0))return o.NextResponse.json({...u,error:"No recipients found for email action",success:!1});{if(u.requiresConfirmation&&!h)return console.log("AI Assistant: Email action requires confirmation - waiting for user approval"),o.NextResponse.json({...u,awaitingConfirmation:!0,success:!1,message:u.confirmationMessage||`Ready to email ${u.recipients.length} recipients. Please confirm to proceed.`});console.log("AI Assistant: Sending emails to",u.recipients.length,"recipients"),console.log("AI Assistant: Recipient type:",u.recipient_type||"mixed");let e=await p(u,x);return console.log("AI Assistant: Email sending completed"),o.NextResponse.json({...u,emailResults:e,success:!0})}case"get_info":case"analyze_data":case"generate_report":return console.log("AI Assistant: Processing information request"),o.NextResponse.json({...u,contextData:{totalStudents:s.students.length,moduleBreakdown:{AEM230:s.students.filter(e=>"AEM230"===e.module).length,HEM2903:s.students.filter(e=>"HEM2903"===e.module).length,HEM3903:s.students.filter(e=>"HEM3903"===e.module).length,HEM3923:s.students.filter(e=>"HEM3923"===e.module).length},students:u.recipients||s.students},success:!0});case"create_assignment":case"schedule_class":case"manage_students":case"create_group":case"track_progress":return console.log("AI Assistant: Processing management action"),o.NextResponse.json({...u,actionType:"management",requiresConfirmation:!0,success:!0});default:return console.log("AI Assistant: Returning general response"),o.NextResponse.json({...u,success:!0})}}catch(a){console.error("AI Assistant: Top-level error occurred:",a);let e=a instanceof Error?a.message:"Unknown error";if(console.error("AI Assistant: Error details:",{message:e,stack:a instanceof Error?a.stack:"No stack trace"}),t.toLowerCase().includes("responder")&&t.toLowerCase().includes("student")){let t=s.students.filter(e=>"HEM3923"===e.module);return console.log("AI Assistant: Providing fallback for responder students request"),o.NextResponse.json({understood:!0,action:"fallback_info",summary:`I found ${t.length} Responder 1 students (HEM3923 module) but the AI service is currently unavailable. You can manually send emails to these students using the bulk email feature.`,recipients:t,fallback:!0,error:e,instructions:"Use the bulk email feature in the Students section to send your message to HEM3923 students."})}return o.NextResponse.json({understood:!1,error:"DeepSeek AI Assistant service temporarily unavailable",details:"The DeepSeek AI processing service is experiencing issues. Please try again in a few minutes or use the manual features in the system.",technicalDetails:e,timestamp:new Date().toISOString(),fallback:!0},{status:503})}}async function p(e,t){let s={sent:0,failed:0,errors:[]};for(let a of(console.log("sendEmails: Processing",e.recipients?.length,"recipients"),console.log("sendEmails: AI Response structure:",{action:e.action,subject:e.subject,message:e.message?"Present":"Missing",recipients:e.recipients?.length||0}),e.recipients)){console.log("sendEmails: Processing recipient:",{id:a.id,name:a.name,email:a.email,module:a.module});try{if(("external"===a.module||"send_external_email"===e.action||"external"===e.recipient_type||a.email&&!a.id&&a.email.includes("@"))&&a.email){console.log("AI Assistant: Sending external email to:",a.email),await (0,m.Cz)({to:a.email,subject:e.subject,html:g(e.message,a.name||"Recipient",e.language),text:e.message}),s.sent++,await c._.activity.create({data:{type:"external_email_sent",description:`AI Assistant external email: "${e.subject}" to ${a.email}`,metadata:{subject:e.subject,language:e.language,emailType:"external",recipientEmail:a.email,recipientName:a.name,sentBy:t.name||t.email,sentAt:new Date().toISOString()}}});continue}let n=null;if(a.id&&"external"!==a.id&&(n=await c._.student.findUnique({where:{id:a.id}})),!n&&a.email&&(n=await c._.student.findUnique({where:{email:a.email}})),!n&&a.name&&(n=await c._.student.findFirst({where:{fullName:a.name}})),!n){console.log("sendEmails: Student not found for recipient:",{id:a.id,name:a.name,email:a.email}),s.failed++,s.errors.push({recipient:a.name||a.email,error:"Student not found in database"});continue}if(n?.email){let a=e.message.replace(/\[Student Name\]/g,n.fullName||n.firstName).replace(/\[student name\]/g,n.fullName||n.firstName).replace(/\[STUDENT NAME\]/g,n.fullName||n.firstName);await (0,m.Cz)({to:n.email,subject:e.subject,html:g(a,n.fullName||n.firstName,e.language),text:a}),s.sent++,await c._.activity.create({data:{studentId:n.id,type:"email_sent",description:`AI Assistant email: "${e.subject}"`,metadata:{subject:e.subject,language:e.language,emailType:e.emailType||"student",sentBy:t.name||t.email,sentAt:new Date().toISOString()}}})}else s.failed++,s.errors.push({studentName:a.name||"Unknown",error:"Student not found or no email address"})}catch(e){console.error(`Failed to send email to student ${a.name||a.id}:`,e),s.failed++,s.errors.push({studentName:a.name||a.id||"Unknown",error:e instanceof Error?e.message:"Unknown error"})}}return s}function g(e,t,s){let a="arabic"===s,n=a?"right":"left",i=e.toLowerCase().includes("dear ")||e.includes("عزيز"),r=e.toLowerCase().includes("best regards")||e.toLowerCase().includes("regards")||e.toLowerCase().includes("sincerely")||e.includes("مع أطيب التحيات")||e.includes("clinical instructor")||e.includes("hct al ain");return`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; direction: ${a?"rtl":"ltr"};">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
        <h1 style="margin: 0; font-size: 24px; text-align: ${n};">
          ${a?"رسالة من نظام متابعة الطلاب":"Message from Student Tracking System"}
        </h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9; text-align: ${n};">
          ${a?"برنامج الخدمات الطبية الطارئة - كلية التقنية العليا العين":"HCT Al Ain EMS Program"}
        </p>
      </div>

      <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        ${i?"":`<p style="font-size: 16px; color: #333; text-align: ${n};">
          ${a?`عزيزي/عزيزتي ${t}،`:`Dear ${t},`}
        </p>`}

        <div style="font-size: 16px; color: #555; line-height: 1.6; margin: 20px 0; text-align: ${n};">
          ${e.replace(/\n/g,"<br>")}
        </div>

        ${r?"":`<p style="font-size: 16px; color: #555; margin-top: 30px; text-align: ${n};">
          ${a?"مع أطيب التحيات،<br><strong>مدرسكم في برنامج الخدمات الطبية الطارئة</strong>":"Best regards,<br><strong>Your HCT Al Ain EMS Instructor</strong>"}
        </p>`}
      </div>

      <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
        <p>${a?"هذه رسالة تلقائية من نظام متابعة الطلاب":"This is an automated message from Student Tracking System"}</p>
      </div>
    </div>
  `}let A=new n.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/ai-assistant/route",pathname:"/api/ai-assistant",filename:"route",bundlePath:"app/api/ai-assistant/route"},resolvedPagePath:"/Users/eliastlcthomas/Downloads/Student_Visualization_Tool/student_tracking_system/app/app/api/ai-assistant/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:h,staticGenerationAsyncStorage:f,serverHooks:x}=A,E="/api/ai-assistant/route";function I(){return(0,r.patchFetch)({serverHooks:x,staticGenerationAsyncStorage:f})}},90455:(e,t,s)=>{s.d(t,{L:()=>n});var a=s(53797);s(13539),s(9487),s(42023);let n={adapter:void 0,providers:[(0,a.Z)({name:"credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){if(!e?.email||!e?.password)return null;{console.log("Demo mode: Checking credentials");let t=[{email:"admin@test.com",password:"admin123",name:"Admin User",role:"admin"},{email:"instructor@test.com",password:"instructor123",name:"Test Instructor",role:"instructor"},{email:"elias@twetemo.com",password:"test123",name:"Elias Thomas",role:"instructor"}].find(t=>t.email===e.email&&t.password===e.password);return t?{id:Date.now().toString(),email:t.email,name:t.name,role:t.role}:null}}})],session:{strategy:"jwt"},pages:{signIn:"/auth/signin"},callbacks:{jwt:async({token:e,user:t})=>(t&&(e.role=t.role),e),session:async({session:e,token:t})=>(t&&(e.user.id=t.sub,e.user.role=t.role),e)}}},9487:(e,t,s)=>{s.d(t,{_:()=>n});var a=s(53524);let n=globalThis.prisma??new a.PrismaClient},36119:(e,t,s)=>{s.d(t,{Cz:()=>i,RX:()=>n,vl:()=>r});var a=s(55245);function n(){let e=process.env.GMAIL_USER,t=process.env.GMAIL_APP_PASSWORD;if(!e||!t)throw Error("Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.");return a.createTransport({service:"gmail",host:"smtp.gmail.com",port:587,secure:!1,auth:{user:e,pass:t}})}async function i(e){try{let t=n(),s={from:`"HCT Student Tracker" <${process.env.GMAIL_USER}>`,to:e.to,subject:e.subject,html:e.html,text:e.text},a=await t.sendMail(s);return console.log("Email sent successfully:",a.messageId),{success:!0,messageId:a.messageId}}catch(e){throw console.error("Email sending error:",e),e}}let r={classReminder:(e,t,s,a,n)=>({subject:`Reminder: ${t} - ${s}`,html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Class Reminder</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">HCT Al Ain EMS Program</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Dear ${e},</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            This is a friendly reminder about your upcoming class:
          </p>
          
          <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">${t}</h3>
            <p style="margin: 5px 0; color: #666;"><strong>📅 Date:</strong> ${s}</p>
            <p style="margin: 5px 0; color: #666;"><strong>🕐 Time:</strong> ${a}</p>
            ${n?`<p style="margin: 5px 0; color: #666;"><strong>📍 Location:</strong> ${n}</p>`:""}
          </div>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Please make sure to attend on time and bring all necessary materials.
          </p>
          
          <p style="font-size: 16px; color: #555; margin-top: 30px;">
            Best regards,<br>
            <strong>Your HCT Al Ain EMS Instructor</strong>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
          <p>This is an automated message from HCT Student Tracking System</p>
        </div>
      </div>
    `,text:`
Dear ${e},

This is a reminder about your upcoming class:

Class: ${t}
Date: ${s}
Time: ${a}
${n?`Location: ${n}`:""}

Please make sure to attend on time and bring all necessary materials.

Best regards,
Your HCT Al Ain EMS Instructor
    `}),attendanceAlert:(e,t,s,a)=>({subject:`Attendance Notice: ${t}`,html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${"absent"===a?"#dc3545":"late"===a?"#ffc107":"#28a745"}; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Attendance Notice</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">HCT Al Ain EMS Program</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Dear ${e},</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            This message is regarding your attendance for:
          </p>
          
          <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${"absent"===a?"#dc3545":"late"===a?"#ffc107":"#28a745"};">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">${t}</h3>
            <p style="margin: 5px 0; color: #666;"><strong>📅 Date:</strong> ${s}</p>
            <p style="margin: 5px 0; color: #666;"><strong>📊 Status:</strong> <span style="color: ${"absent"===a?"#dc3545":"late"===a?"#ffc107":"#28a745"}; font-weight: bold; text-transform: capitalize;">${a}</span></p>
          </div>
          
          ${"absent"===a?`<p style="font-size: 16px; color: #555; line-height: 1.6;">
              You were marked as absent for this class. Please contact your instructor if this is incorrect or if you have any concerns about your attendance.
            </p>`:"late"===a?`<p style="font-size: 16px; color: #555; line-height: 1.6;">
              You were marked as late for this class. Please ensure to arrive on time for future sessions.
            </p>`:`<p style="font-size: 16px; color: #555; line-height: 1.6;">
              Thank you for attending this class. Your participation is appreciated.
            </p>`}
          
          <p style="font-size: 16px; color: #555; margin-top: 30px;">
            Best regards,<br>
            <strong>Your HCT Al Ain EMS Instructor</strong>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
          <p>This is an automated message from HCT Student Tracking System</p>
        </div>
      </div>
    `,text:`
Dear ${e},

This message is regarding your attendance for:

Class: ${t}
Date: ${s}
Status: ${a}

${"absent"===a?"You were marked as absent for this class. Please contact your instructor if this is incorrect.":"late"===a?"You were marked as late for this class. Please ensure to arrive on time for future sessions.":"Thank you for attending this class. Your participation is appreciated."}

Best regards,
Your HCT Al Ain EMS Instructor
    `}),generalMessage:(e,t,s)=>({subject:t,html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">${t}</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">HCT Al Ain EMS Program</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Dear ${e},</p>
          
          <div style="font-size: 16px; color: #555; line-height: 1.6; margin: 20px 0;">
            ${s.replace(/\n/g,"<br>")}
          </div>
          
          <p style="font-size: 16px; color: #555; margin-top: 30px;">
            Best regards,<br>
            <strong>Your HCT Al Ain EMS Instructor</strong>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
          <p>This is an automated message from HCT Student Tracking System</p>
        </div>
      </div>
    `,text:`
Dear ${e},

${s}

Best regards,
Your HCT Al Ain EMS Instructor
    `})}},72331:(e,t,s)=>{s.d(t,{_:()=>n});var a=s(53524);let n=globalThis.prisma??new a.PrismaClient}};var t=require("../../../webpack-runtime.js");t.C(e);var s=e=>t(t.s=e),a=t.X(0,[9276,2776,9637,5972,5245],()=>s(14425));module.exports=a})();