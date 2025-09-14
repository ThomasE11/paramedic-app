
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, recipients, subject, message, classId } = body;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let emailsSent = 0;
    let errors: any[] = [];

    if (type === 'general') {
      // Send general message
      for (const studentId of recipients) {
        try {
          const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { id: true, firstName: true, lastName: true, fullName: true, email: true }
          });

          if (student && student.email) {
            const template = emailTemplates.generalMessage(
              student.fullName,
              subject,
              message
            );

            await sendEmail({
              to: student.email,
              subject: template.subject,
              html: template.html,
              text: template.text
            });

            emailsSent++;

            // Log activity
            await prisma.activity.create({
              data: {
                studentId: student.id,
                type: 'email_sent',
                description: `Email sent: "${subject}"`,
                metadata: {
                  subject,
                  sentBy: user.name || user.email,
                  sentAt: new Date().toISOString()
                }
              }
            });
          }
        } catch (error) {
          console.error(`Failed to send email to student ${studentId}:`, error);
          errors.push({ studentId, error: error instanceof Error ? error.message : 'Unknown error' });
        }
      }
    } else if (type === 'class_reminder' && classId) {
      // Send class reminder
      const classSession = await prisma.classSession.findUnique({
        where: { id: classId },
        include: {
          module: true,
          location: true,
          attendance: {
            include: {
              student: {
                select: { id: true, firstName: true, lastName: true, fullName: true, email: true }
              }
            }
          }
        }
      });

      if (!classSession) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 });
      }

      for (const attendance of classSession.attendance) {
        try {
          const student = attendance.student;
          if (student.email) {
            const template = emailTemplates.classReminder(
              student.fullName,
              classSession.title,
              new Date(classSession.date).toLocaleDateString(),
              `${classSession.startTime} - ${classSession.endTime}`,
              classSession.location?.name
            );

            await sendEmail({
              to: student.email,
              subject: template.subject,
              html: template.html,
              text: template.text
            });

            emailsSent++;

            // Log activity
            await prisma.activity.create({
              data: {
                studentId: student.id,
                type: 'email_sent',
                description: `Class reminder sent: "${classSession.title}"`,
                metadata: {
                  classId: classSession.id,
                  className: classSession.title,
                  sentBy: user.name || user.email,
                  sentAt: new Date().toISOString()
                }
              }
            });
          }
        } catch (error) {
          console.error(`Failed to send reminder to student ${attendance.studentId}:`, error);
          errors.push({ 
            studentId: attendance.studentId, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully sent ${emailsSent} emails${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
    });

  } catch (error) {
    console.error('Email sending error:', error);
    
    // Check if it's a Gmail configuration error
    if (error instanceof Error && error.message.includes('Gmail credentials not configured')) {
      return NextResponse.json({
        error: 'Gmail not configured',
        message: 'Please configure your Gmail credentials first',
        needsSetup: true
      }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    );
  }
}
