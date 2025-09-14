"use strict";(()=>{var e={};e.id=7972,e.ids=[7972],e.modules={53524:e=>{e.exports=require("@prisma/client")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},27790:e=>{e.exports=require("assert")},78893:e=>{e.exports=require("buffer")},84770:e=>{e.exports=require("crypto")},17702:e=>{e.exports=require("events")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},86624:e=>{e.exports=require("querystring")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},38602:(e,t,n)=>{n.r(t),n.d(t,{originalPathname:()=>E,patchFetch:()=>S,requestAsyncStorage:()=>p,routeModule:()=>m,serverHooks:()=>A,staticGenerationAsyncStorage:()=>g});var a={};n.r(a),n.d(a,{POST:()=>u});var s=n(49303),i=n(88716),r=n(60670),o=n(87070),c=n(75571),l=n(90455),d=n(72331);async function u(e){try{let t;let n=await (0,c.getServerSession)(l.L);if(!n?.user?.email)return o.NextResponse.json({error:"Unauthorized"},{status:401});let{command:a,mode:s="general",moduleContext:i,studentContext:r,brainstormingSession:u}=await e.json();if(!a)return o.NextResponse.json({error:"Command is required"},{status:400});let m=process.env.DEEPSEEK_API_KEY;if(!m)return o.NextResponse.json({error:"AI service not configured"},{status:500});let p=await d._.user.findUnique({where:{email:n.user.email}});if(!p)return o.NextResponse.json({error:"User not found"},{status:404});let[g,A]=await Promise.all([d._.student.findMany({include:{module:!0,attendance:{take:10,orderBy:{markedAt:"desc"},include:{classSession:{select:{date:!0,title:!0}}}}}}),d._.module.findMany()]),E=`You are an advanced AI assistant specialized in Emergency Medical Services (EMS) education at Higher Colleges of Technology (HCT) Al Ain Campus. You are an expert in:

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
- Total Students: ${g.length}
- Active Modules:
${A.map(e=>`  • ${e.code}: ${e.name} (${g.filter(t=>t.moduleId===e.id).length} students)`).join("\n")}

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

${r?`
STUDENT CONTEXT:
- Name: ${r.name}
- Module: ${r.module?.code} - ${r.module?.name}
- Attendance Rate: ${r.attendanceRate||"Unknown"}%
- Recent Performance: ${r.notes?r.notes.slice(0,3).join("; "):"No specific notes"}
`:""}

${i?`
MODULE FOCUS: ${i.code} - ${i.name}
Students in this module: ${g.filter(e=>e.moduleId===i.id).length}
`:""}

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
          "temperature": "X\xb0C",
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
- Encourage critical thinking and clinical reasoning`;console.log("Educational AI: Sending request to DeepSeek API...");let S=await fetch("https://api.deepseek.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${m}`},body:JSON.stringify({model:"deepseek-chat",messages:[{role:"system",content:E},{role:"user",content:a}],response_format:{type:"json_object"},max_tokens:2e3,temperature:.8})});if(!S.ok){let e=await S.text();return console.error("DeepSeek API error:",S.status,e),o.NextResponse.json({error:`DeepSeek API failed: ${S.status}`,details:e},{status:500})}let y=await S.json(),f=y.choices?.[0]?.message?.content;if(!f)return o.NextResponse.json({error:"No content in AI response"},{status:500});try{t=JSON.parse(f)}catch(e){return console.error("Failed to parse AI response:",e),o.NextResponse.json({error:"Failed to parse AI response",details:f},{status:500})}return await d._.activity.create({data:{type:"educational_content_generated",description:`Generated educational content: ${t.content?.title||"Untitled"}`,metadata:{mode:t.mode,targetModule:t.content?.targetModule,difficulty:t.content?.difficulty,generatedBy:p.name||p.email,generatedAt:new Date().toISOString(),command:a.substring(0,100)}}}),o.NextResponse.json({...t,success:!0,generatedAt:new Date().toISOString(),context:{user:p.name,institution:"HCT Al Ain",program:"Emergency Medical Services"}})}catch(e){return console.error("Educational AI Assistant error:",e),o.NextResponse.json({understood:!1,error:"Educational AI service temporarily unavailable",details:e instanceof Error?e.message:"Unknown error"},{status:503})}}let m=new s.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/ai-assistant/educational/route",pathname:"/api/ai-assistant/educational",filename:"route",bundlePath:"app/api/ai-assistant/educational/route"},resolvedPagePath:"/Users/eliastlcthomas/Downloads/Student_Visualization_Tool/student_tracking_system/app/app/api/ai-assistant/educational/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:p,staticGenerationAsyncStorage:g,serverHooks:A}=m,E="/api/ai-assistant/educational/route";function S(){return(0,r.patchFetch)({serverHooks:A,staticGenerationAsyncStorage:g})}},90455:(e,t,n)=>{n.d(t,{L:()=>s});var a=n(53797);n(13539),n(9487),n(42023);let s={adapter:void 0,providers:[(0,a.Z)({name:"credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){if(!e?.email||!e?.password)return null;{console.log("Demo mode: Checking credentials");let t=[{email:"admin@test.com",password:"admin123",name:"Admin User",role:"admin"},{email:"instructor@test.com",password:"instructor123",name:"Test Instructor",role:"instructor"},{email:"elias@twetemo.com",password:"test123",name:"Elias Thomas",role:"instructor"}].find(t=>t.email===e.email&&t.password===e.password);return t?{id:Date.now().toString(),email:t.email,name:t.name,role:t.role}:null}}})],session:{strategy:"jwt"},pages:{signIn:"/auth/signin"},callbacks:{jwt:async({token:e,user:t})=>(t&&(e.role=t.role),e),session:async({session:e,token:t})=>(t&&(e.user.id=t.sub,e.user.role=t.role),e)}}},9487:(e,t,n)=>{n.d(t,{_:()=>s});var a=n(53524);let s=globalThis.prisma??new a.PrismaClient},72331:(e,t,n)=>{n.d(t,{_:()=>s});var a=n(53524);let s=globalThis.prisma??new a.PrismaClient}};var t=require("../../../../webpack-runtime.js");t.C(e);var n=e=>t(t.s=e),a=t.X(0,[9276,2776,9637,5972],()=>n(38602));module.exports=a})();