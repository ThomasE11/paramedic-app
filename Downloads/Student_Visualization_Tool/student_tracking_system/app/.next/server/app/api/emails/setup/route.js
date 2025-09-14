"use strict";(()=>{var e={};e.id=2530,e.ids=[2530],e.modules={53524:e=>{e.exports=require("@prisma/client")},72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},27790:e=>{e.exports=require("assert")},78893:e=>{e.exports=require("buffer")},61282:e=>{e.exports=require("child_process")},84770:e=>{e.exports=require("crypto")},80665:e=>{e.exports=require("dns")},17702:e=>{e.exports=require("events")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},98216:e=>{e.exports=require("net")},19801:e=>{e.exports=require("os")},55315:e=>{e.exports=require("path")},86624:e=>{e.exports=require("querystring")},76162:e=>{e.exports=require("stream")},82452:e=>{e.exports=require("tls")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},3270:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>f,patchFetch:()=>h,requestAsyncStorage:()=>g,routeModule:()=>m,serverHooks:()=>y,staticGenerationAsyncStorage:()=>x});var s={};r.r(s),r.d(s,{GET:()=>c,POST:()=>u});var a=r(49303),i=r(88716),o=r(60670),n=r(87070),l=r(75571),p=r(90455),d=r(36119);async function c(e){try{let e=await (0,l.getServerSession)(p.L);if(!e?.user?.email)return n.NextResponse.json({error:"Unauthorized"},{status:401});let t=process.env.GMAIL_USER,r=process.env.GMAIL_APP_PASSWORD;return n.NextResponse.json({configured:!!(t&&r),gmailUser:t||null,instructions:{step1:"Go to your Google Account settings",step2:"Navigate to Security > 2-Step Verification",step3:"Enable 2-Step Verification if not already enabled",step4:"Go to Security > App passwords",step5:"Generate an app password for 'Mail'",step6:"Use this app password in your environment variables"}})}catch(e){return console.error("Gmail setup check error:",e),n.NextResponse.json({error:"Failed to check Gmail setup"},{status:500})}}async function u(e){try{let t=await (0,l.getServerSession)(p.L);if(!t?.user?.email)return n.NextResponse.json({error:"Unauthorized"},{status:401});let{testEmail:r}=await e.json(),s=(0,d.RX)(),a=await s.sendMail({from:`"HCT Student Tracker Test" <${process.env.GMAIL_USER}>`,to:r||t.user.email,subject:"Gmail Integration Test - HCT Student Tracker",html:`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
            <h1 style="margin: 0; font-size: 24px;">🎉 Gmail Integration Successful!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">HCT Student Tracking System</p>
          </div>
          
          <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333;">Congratulations!</p>
            
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
              Your Gmail integration is working perfectly. You can now send emails directly from your student tracking system to:
            </p>
            
            <ul style="color: #555; line-height: 1.8;">
              <li>Send class reminders to students</li>
              <li>Notify students about attendance</li>
              <li>Send personalized messages</li>
              <li>Communicate with entire modules</li>
            </ul>
            
            <p style="font-size: 16px; color: #555; margin-top: 30px;">
              Test completed at: <strong>${new Date().toLocaleString()}</strong>
            </p>
          </div>
        </div>
      `,text:`
Gmail Integration Test Successful!

Your Gmail integration is working perfectly. You can now send emails directly from your student tracking system.

Test completed at: ${new Date().toLocaleString()}
      `});return n.NextResponse.json({success:!0,message:"Gmail integration test successful!",messageId:a.messageId,testSentTo:r||t.user.email})}catch(e){return console.error("Gmail test error:",e),n.NextResponse.json({success:!1,error:e instanceof Error?e.message:"Unknown error",message:"Gmail integration test failed. Please check your credentials."},{status:400})}}let m=new a.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/emails/setup/route",pathname:"/api/emails/setup",filename:"route",bundlePath:"app/api/emails/setup/route"},resolvedPagePath:"/Users/eliastlcthomas/Downloads/Student_Visualization_Tool/student_tracking_system/app/app/api/emails/setup/route.ts",nextConfigOutput:"",userland:s}),{requestAsyncStorage:g,staticGenerationAsyncStorage:x,serverHooks:y}=m,f="/api/emails/setup/route";function h(){return(0,o.patchFetch)({serverHooks:y,staticGenerationAsyncStorage:x})}},90455:(e,t,r)=>{r.d(t,{L:()=>a});var s=r(53797);r(13539),r(9487),r(42023);let a={adapter:void 0,providers:[(0,s.Z)({name:"credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(e){if(!e?.email||!e?.password)return null;{console.log("Demo mode: Checking credentials");let t=[{email:"admin@test.com",password:"admin123",name:"Admin User",role:"admin"},{email:"instructor@test.com",password:"instructor123",name:"Test Instructor",role:"instructor"},{email:"elias@twetemo.com",password:"test123",name:"Elias Thomas",role:"instructor"}].find(t=>t.email===e.email&&t.password===e.password);return t?{id:Date.now().toString(),email:t.email,name:t.name,role:t.role}:null}}})],session:{strategy:"jwt"},pages:{signIn:"/auth/signin"},callbacks:{jwt:async({token:e,user:t})=>(t&&(e.role=t.role),e),session:async({session:e,token:t})=>(t&&(e.user.id=t.sub,e.user.role=t.role),e)}}},9487:(e,t,r)=>{r.d(t,{_:()=>a});var s=r(53524);let a=globalThis.prisma??new s.PrismaClient},36119:(e,t,r)=>{r.d(t,{Cz:()=>i,RX:()=>a,vl:()=>o});var s=r(55245);function a(){let e=process.env.GMAIL_USER,t=process.env.GMAIL_APP_PASSWORD;if(!e||!t)throw Error("Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.");return s.createTransport({service:"gmail",host:"smtp.gmail.com",port:587,secure:!1,auth:{user:e,pass:t}})}async function i(e){try{let t=a(),r={from:`"HCT Student Tracker" <${process.env.GMAIL_USER}>`,to:e.to,subject:e.subject,html:e.html,text:e.text},s=await t.sendMail(r);return console.log("Email sent successfully:",s.messageId),{success:!0,messageId:s.messageId}}catch(e){throw console.error("Email sending error:",e),e}}let o={classReminder:(e,t,r,s,a)=>({subject:`Reminder: ${t} - ${r}`,html:`
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
            <p style="margin: 5px 0; color: #666;"><strong>📅 Date:</strong> ${r}</p>
            <p style="margin: 5px 0; color: #666;"><strong>🕐 Time:</strong> ${s}</p>
            ${a?`<p style="margin: 5px 0; color: #666;"><strong>📍 Location:</strong> ${a}</p>`:""}
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
Date: ${r}
Time: ${s}
${a?`Location: ${a}`:""}

Please make sure to attend on time and bring all necessary materials.

Best regards,
Your HCT Al Ain EMS Instructor
    `}),attendanceAlert:(e,t,r,s)=>({subject:`Attendance Notice: ${t}`,html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${"absent"===s?"#dc3545":"late"===s?"#ffc107":"#28a745"}; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Attendance Notice</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">HCT Al Ain EMS Program</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Dear ${e},</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            This message is regarding your attendance for:
          </p>
          
          <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${"absent"===s?"#dc3545":"late"===s?"#ffc107":"#28a745"};">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">${t}</h3>
            <p style="margin: 5px 0; color: #666;"><strong>📅 Date:</strong> ${r}</p>
            <p style="margin: 5px 0; color: #666;"><strong>📊 Status:</strong> <span style="color: ${"absent"===s?"#dc3545":"late"===s?"#ffc107":"#28a745"}; font-weight: bold; text-transform: capitalize;">${s}</span></p>
          </div>
          
          ${"absent"===s?`<p style="font-size: 16px; color: #555; line-height: 1.6;">
              You were marked as absent for this class. Please contact your instructor if this is incorrect or if you have any concerns about your attendance.
            </p>`:"late"===s?`<p style="font-size: 16px; color: #555; line-height: 1.6;">
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
Date: ${r}
Status: ${s}

${"absent"===s?"You were marked as absent for this class. Please contact your instructor if this is incorrect.":"late"===s?"You were marked as late for this class. Please ensure to arrive on time for future sessions.":"Thank you for attending this class. Your participation is appreciated."}

Best regards,
Your HCT Al Ain EMS Instructor
    `}),generalMessage:(e,t,r)=>({subject:t,html:`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">${t}</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">HCT Al Ain EMS Program</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Dear ${e},</p>
          
          <div style="font-size: 16px; color: #555; line-height: 1.6; margin: 20px 0;">
            ${r.replace(/\n/g,"<br>")}
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

${r}

Best regards,
Your HCT Al Ain EMS Instructor
    `})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[9276,2776,9637,5972,5245],()=>r(3270));module.exports=s})();