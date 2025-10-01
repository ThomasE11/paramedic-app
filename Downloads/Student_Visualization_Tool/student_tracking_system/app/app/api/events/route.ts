import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const SUBMISSION_EVENTS = [
  {
    id: 'logbook-review-1',
    title: 'Logbook Review Point #1 [MANDATORY]',
    date: '2025-10-04',
    type: 'mandatory',
    description: 'First mandatory logbook review checkpoint',
    color: '#DC2626'
  },
  {
    id: 'case-reflection-1',
    title: 'Case Reflection #1',
    date: '2025-10-04',
    type: 'submission',
    description: 'First case reflection submission',
    color: '#059669'
  },
  {
    id: 'case-presentation',
    title: 'Case Presentation',
    date: '2025-10-11',
    type: 'submission',
    description: 'Case presentation due',
    color: '#0284C7'
  },
  {
    id: 'cpr-1',
    title: 'CPR #1',
    date: '2025-10-18',
    type: 'submission',
    description: 'First CPR submission',
    color: '#7C3AED'
  },
  {
    id: 'case-reflection-2',
    title: 'Case Reflection #2',
    date: '2025-10-18',
    type: 'submission',
    description: 'Second case reflection submission',
    color: '#059669'
  },
  {
    id: 'cpr-2',
    title: 'CPR #2',
    date: '2025-10-25',
    type: 'submission',
    description: 'Second CPR submission',
    color: '#7C3AED'
  },
  {
    id: 'logbook-review-2',
    title: 'Logbook Review Point #2 [MANDATORY]',
    date: '2025-11-01',
    type: 'mandatory',
    description: 'Second mandatory logbook review checkpoint',
    color: '#DC2626'
  },
  {
    id: 'case-reflection-3',
    title: 'Case Reflection #3',
    date: '2025-11-01',
    type: 'submission',
    description: 'Third case reflection submission',
    color: '#059669'
  },
  {
    id: 'logbook-review-3',
    title: 'Logbook Review Point #3 [MANDATORY]',
    date: '2025-11-08',
    type: 'mandatory',
    description: 'Final mandatory logbook review checkpoint',
    color: '#DC2626'
  },
  {
    id: 'final-logbook',
    title: 'Final Logbook Submission',
    date: '2025-11-08',
    type: 'final',
    description: 'Final logbook submission deadline',
    color: '#DC2626'
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    // Get class sessions
    let classEvents: any[] = [];
    try {
      const classSessions = await prisma.classSession.findMany({
        where: {
          ...(startDate && endDate ? {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          } : {})
        },
        include: {
          subject: true,
          module: true,
          location: true,
          instructor: true
        },
        orderBy: {
          date: 'asc'
        }
      });

      classEvents = classSessions.map(session => ({
        id: session.id,
        title: session.title,
        date: session.date.toISOString().split('T')[0],
        startTime: session.startTime,
        endTime: session.endTime,
        type: 'class',
        description: session.description || '',
        location: session.location?.name || '',
        instructor: session.instructor?.name || '',
        subject: session.subject?.name || '',
        module: session.module?.name || '',
        color: session.color || '#3B82F6'
      }));
    } catch (error) {
      console.error('Error fetching class sessions:', error);
    }

    // Filter submission events by date range if provided
    let submissionEvents = SUBMISSION_EVENTS;
    if (startDate && endDate) {
      submissionEvents = SUBMISSION_EVENTS.filter(event =>
        event.date >= startDate && event.date <= endDate
      );
    }

    const allEvents = [...classEvents, ...submissionEvents];

    return NextResponse.json({
      events: allEvents,
      success: true
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, date, startTime, endTime, type, color } = body;

    // Create a new class session event
    const newEvent = await prisma.classSession.create({
      data: {
        title,
        description,
        date: new Date(date),
        startTime,
        endTime,
        duration: calculateDuration(startTime, endTime),
        type: type || 'event',
        color: color || '#3B82F6',
        instructorId: session.user?.id
      },
      include: {
        subject: true,
        module: true,
        location: true,
        instructor: true
      }
    });

    return NextResponse.json({
      event: {
        id: newEvent.id,
        title: newEvent.title,
        date: newEvent.date.toISOString().split('T')[0],
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        type: 'class',
        description: newEvent.description || '',
        color: newEvent.color || '#3B82F6'
      },
      success: true
    });

  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return endMinutes - startMinutes;
}