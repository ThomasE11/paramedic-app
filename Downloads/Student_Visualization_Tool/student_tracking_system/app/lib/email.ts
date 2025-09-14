
import nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

// Create Gmail transporter
export function createGmailTransporter() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPassword) {
    throw new Error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  });
}

// Send email function
export async function sendEmail(emailData: EmailData) {
  try {
    const transporter = createGmailTransporter();
    
    const mailOptions = {
      from: `"HCT Student Tracker" <${process.env.GMAIL_USER}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

// Email templates
export const emailTemplates = {
  classReminder: (studentName: string, className: string, date: string, time: string, location?: string) => ({
    subject: `Reminder: ${className} - ${date}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Class Reminder</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">HCT Al Ain EMS Program</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Dear ${studentName},</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            This is a friendly reminder about your upcoming class:
          </p>
          
          <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">${className}</h3>
            <p style="margin: 5px 0; color: #666;"><strong>📅 Date:</strong> ${date}</p>
            <p style="margin: 5px 0; color: #666;"><strong>🕐 Time:</strong> ${time}</p>
            ${location ? `<p style="margin: 5px 0; color: #666;"><strong>📍 Location:</strong> ${location}</p>` : ''}
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
    `,
    text: `
Dear ${studentName},

This is a reminder about your upcoming class:

Class: ${className}
Date: ${date}
Time: ${time}
${location ? `Location: ${location}` : ''}

Please make sure to attend on time and bring all necessary materials.

Best regards,
Your HCT Al Ain EMS Instructor
    `
  }),

  attendanceAlert: (studentName: string, className: string, date: string, attendanceStatus: string) => ({
    subject: `Attendance Notice: ${className}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${attendanceStatus === 'absent' ? '#dc3545' : attendanceStatus === 'late' ? '#ffc107' : '#28a745'}; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Attendance Notice</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">HCT Al Ain EMS Program</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Dear ${studentName},</p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            This message is regarding your attendance for:
          </p>
          
          <div style="background: #f8f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${attendanceStatus === 'absent' ? '#dc3545' : attendanceStatus === 'late' ? '#ffc107' : '#28a745'};">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">${className}</h3>
            <p style="margin: 5px 0; color: #666;"><strong>📅 Date:</strong> ${date}</p>
            <p style="margin: 5px 0; color: #666;"><strong>📊 Status:</strong> <span style="color: ${attendanceStatus === 'absent' ? '#dc3545' : attendanceStatus === 'late' ? '#ffc107' : '#28a745'}; font-weight: bold; text-transform: capitalize;">${attendanceStatus}</span></p>
          </div>
          
          ${attendanceStatus === 'absent' ? 
            `<p style="font-size: 16px; color: #555; line-height: 1.6;">
              You were marked as absent for this class. Please contact your instructor if this is incorrect or if you have any concerns about your attendance.
            </p>` :
            attendanceStatus === 'late' ?
            `<p style="font-size: 16px; color: #555; line-height: 1.6;">
              You were marked as late for this class. Please ensure to arrive on time for future sessions.
            </p>` :
            `<p style="font-size: 16px; color: #555; line-height: 1.6;">
              Thank you for attending this class. Your participation is appreciated.
            </p>`
          }
          
          <p style="font-size: 16px; color: #555; margin-top: 30px;">
            Best regards,<br>
            <strong>Your HCT Al Ain EMS Instructor</strong>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
          <p>This is an automated message from HCT Student Tracking System</p>
        </div>
      </div>
    `,
    text: `
Dear ${studentName},

This message is regarding your attendance for:

Class: ${className}
Date: ${date}
Status: ${attendanceStatus}

${attendanceStatus === 'absent' ? 
  'You were marked as absent for this class. Please contact your instructor if this is incorrect.' :
  attendanceStatus === 'late' ?
  'You were marked as late for this class. Please ensure to arrive on time for future sessions.' :
  'Thank you for attending this class. Your participation is appreciated.'
}

Best regards,
Your HCT Al Ain EMS Instructor
    `
  }),

  generalMessage: (studentName: string, subject: string, message: string) => ({
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">${subject}</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">HCT Al Ain EMS Program</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333;">Dear ${studentName},</p>
          
          <div style="font-size: 16px; color: #555; line-height: 1.6; margin: 20px 0;">
            ${message.replace(/\n/g, '<br>')}
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
    `,
    text: `
Dear ${studentName},

${message}

Best regards,
Your HCT Al Ain EMS Instructor
    `
  })
};
