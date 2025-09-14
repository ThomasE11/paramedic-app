
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface TimeSlot {
  day: number;
  startTime: string;
  endTime: string;
  duration: number;
}

interface FreeSlot {
  day: number;
  dayName: string;
  startTime: string;
  endTime: string;
  duration: number;
  availableStudents: string[];
  studentCount: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      studentIds,
      minDuration = 60, // minimum duration in minutes
      semester = 'current',
      academicYear = '2024-2025',
      dayFilter, // optional: filter by specific days [1,2,3,4,5] for weekdays
      timeRange // optional: { start: '09:00', end: '17:00' }
    } = body;

    if (!studentIds || studentIds.length === 0) {
      return NextResponse.json({ error: 'Student IDs are required' }, { status: 400 });
    }

    // Demo mode - return empty alignment result
    if (process.env.NODE_ENV === 'production' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      console.log('Demo mode: Returning empty schedule alignment');

      return NextResponse.json({
        freeSlots: [],
        recommendations: [],
        studentsAnalyzed: [],
        totalSlots: 0,
        parameters: {
          minDuration,
          workingHours: timeRange || { start: '09:00', end: '17:00' },
          daysChecked: dayFilter || [1, 2, 3, 4, 5]
        }
      });
    }

    // Get schedules for all specified students
    const schedules = await prisma.schedule.findMany({
      where: {
        studentId: { in: studentIds },
        semester,
        academicYear,
        isActive: true
      },
      include: {
        entries: {
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' }
          ]
        },
        student: {
          select: {
            id: true,
            fullName: true,
            studentId: true
          }
        }
      }
    });

    if (schedules.length === 0) {
      return NextResponse.json({ error: 'No schedules found for the specified students' }, { status: 404 });
    }

    // Define working hours (can be made configurable)
    const workingHours = timeRange || { start: '08:00', end: '18:00' };
    const daysToCheck = dayFilter || [1, 2, 3, 4, 5]; // Monday to Friday by default
    const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const freeSlots: FreeSlot[] = [];

    // Check each day
    for (const day of daysToCheck) {
      // Get all busy times for this day across all students
      const busyTimes: { [studentId: string]: TimeSlot[] } = {};
      
      schedules.forEach(schedule => {
        const studentId = schedule.studentId;
        busyTimes[studentId] = schedule.entries
          .filter(entry => entry.dayOfWeek === day)
          .map(entry => ({
            day: entry.dayOfWeek,
            startTime: entry.startTime,
            endTime: entry.endTime,
            duration: calculateDuration(entry.startTime, entry.endTime)
          }))
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
      });

      // Find free slots for this day
      const dayFreeSlots = findFreeSlots(
        busyTimes,
        day,
        dayNames[day],
        workingHours,
        minDuration,
        studentIds
      );

      freeSlots.push(...dayFreeSlots);
    }

    // Sort free slots by student count (descending) and then by duration (descending)
    freeSlots.sort((a, b) => {
      if (a.studentCount !== b.studentCount) {
        return b.studentCount - a.studentCount;
      }
      return b.duration - a.duration;
    });

    // AI-powered recommendations
    const recommendations = generateRecommendations(freeSlots, schedules);

    return NextResponse.json({
      freeSlots,
      recommendations,
      studentsAnalyzed: schedules.map(s => ({
        id: s.student.id,
        name: s.student.fullName,
        studentId: s.student.studentId
      })),
      totalSlots: freeSlots.length,
      parameters: {
        minDuration,
        workingHours,
        daysChecked: daysToCheck.map((d: number) => dayNames[d])
      }
    });
  } catch (error) {
    console.error('Schedule alignment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper functions
function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return endMinutes - startMinutes;
}

function findFreeSlots(
  busyTimes: { [studentId: string]: TimeSlot[] },
  day: number,
  dayName: string,
  workingHours: { start: string; end: string },
  minDuration: number,
  allStudentIds: string[]
): FreeSlot[] {
  const freeSlots: FreeSlot[] = [];
  const timeSlots = generateTimeSlots(workingHours.start, workingHours.end, 30); // 30-minute intervals

  for (let i = 0; i < timeSlots.length - 1; i++) {
    const currentSlot = timeSlots[i];
    const nextSlot = timeSlots[i + 1];
    
    // Find which students are available during this slot
    const availableStudents: string[] = [];
    
    allStudentIds.forEach(studentId => {
      const studentBusyTimes = busyTimes[studentId] || [];
      const isAvailable = !studentBusyTimes.some(busyTime => 
        timeOverlaps(currentSlot, nextSlot, busyTime.startTime, busyTime.endTime)
      );
      
      if (isAvailable) {
        availableStudents.push(studentId);
      }
    });

    // Look for continuous free time slots
    if (availableStudents.length > 0) {
      let endSlotIndex = i + 1;
      let continuousAvailable = [...availableStudents];
      
      // Extend the slot as long as the same students remain available
      while (endSlotIndex < timeSlots.length - 1) {
        const extendedSlot = timeSlots[endSlotIndex + 1];
        const stillAvailable: string[] = [];
        
        continuousAvailable.forEach(studentId => {
          const studentBusyTimes = busyTimes[studentId] || [];
          const isStillAvailable = !studentBusyTimes.some(busyTime => 
            timeOverlaps(timeSlots[endSlotIndex], extendedSlot, busyTime.startTime, busyTime.endTime)
          );
          
          if (isStillAvailable) {
            stillAvailable.push(studentId);
          }
        });
        
        if (stillAvailable.length === continuousAvailable.length && stillAvailable.length > 0) {
          continuousAvailable = stillAvailable;
          endSlotIndex++;
        } else {
          break;
        }
      }
      
      const duration = calculateDuration(currentSlot, timeSlots[endSlotIndex]);
      
      if (duration >= minDuration) {
        freeSlots.push({
          day,
          dayName,
          startTime: currentSlot,
          endTime: timeSlots[endSlotIndex],
          duration,
          availableStudents: continuousAvailable,
          studentCount: continuousAvailable.length
        });
      }
      
      // Skip processed slots
      i = endSlotIndex - 1;
    }
  }

  return freeSlots;
}

function generateTimeSlots(startTime: string, endTime: string, intervalMinutes: number): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  while (currentMinutes <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    currentMinutes += intervalMinutes;
  }
  
  return slots;
}

function timeOverlaps(slotStart: string, slotEnd: string, busyStart: string, busyEnd: string): boolean {
  return slotStart < busyEnd && slotEnd > busyStart;
}

function generateRecommendations(freeSlots: FreeSlot[], schedules: any[]): any[] {
  const recommendations = [];
  
  // Best overall slot (highest student count)
  const bestSlot = freeSlots.find(slot => slot.studentCount === Math.max(...freeSlots.map(s => s.studentCount)));
  if (bestSlot) {
    recommendations.push({
      type: 'best_overall',
      title: 'Best Overall Time Slot',
      description: `${bestSlot.dayName} ${bestSlot.startTime}-${bestSlot.endTime} has the most students available (${bestSlot.studentCount} students)`,
      slot: bestSlot,
      priority: 'high'
    });
  }
  
  // Longest available slot
  const longestSlot = freeSlots.find(slot => slot.duration === Math.max(...freeSlots.map(s => s.duration)));
  if (longestSlot && longestSlot !== bestSlot) {
    recommendations.push({
      type: 'longest_duration',
      title: 'Longest Available Slot',
      description: `${longestSlot.dayName} ${longestSlot.startTime}-${longestSlot.endTime} provides the longest duration (${longestSlot.duration} minutes)`,
      slot: longestSlot,
      priority: 'medium'
    });
  }
  
  // Mid-week recommendations
  const midWeekSlots = freeSlots.filter(slot => [2, 3, 4].includes(slot.day)); // Tuesday, Wednesday, Thursday
  if (midWeekSlots.length > 0) {
    const bestMidWeek = midWeekSlots[0]; // Already sorted by student count and duration
    recommendations.push({
      type: 'mid_week',
      title: 'Mid-Week Recommendation',
      description: `${bestMidWeek.dayName} ${bestMidWeek.startTime}-${bestMidWeek.endTime} is optimal for mid-week activities`,
      slot: bestMidWeek,
      priority: 'medium'
    });
  }
  
  return recommendations;
}
