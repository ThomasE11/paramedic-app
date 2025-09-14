import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

// Simple test to create one schedule entry
async function main() {
  try {
    console.log('🚀 Creating test schedule entries...');
    
    // Get a few students from different modules
    const students = await prisma.student.findMany({
      include: { module: true },
      take: 5
    });
    
    const subjects = await prisma.subject.findMany();
    const locations = await prisma.location.findMany();
    const timeSlots = await prisma.timeSlot.findMany();
    
    console.log(`Found ${students.length} students, ${subjects.length} subjects, ${locations.length} locations, ${timeSlots.length} time slots`);
    
    let entriesCreated = 0;
    
    for (const student of students) {
      if (!student.module) continue;
      
      console.log(`Creating entries for ${student.fullName} (${student.module.code})`);
      
      // Find schedule for this student
      const schedule = await prisma.schedule.findFirst({
        where: { studentId: student.id }
      });
      
      if (!schedule) {
        console.log(`No schedule found for ${student.fullName}, skipping`);
        continue;
      }
      
      // Create a few sample entries based on module
      const sampleEntries = getSampleEntriesForModule(student.module.code, subjects, locations, timeSlots);
      
      for (const entry of sampleEntries) {
        try {
          await prisma.scheduleEntry.create({
            data: {
              scheduleId: schedule.id,
              subjectId: entry.subjectId,
              timeSlotId: entry.timeSlotId,
              locationId: entry.locationId,
              dayOfWeek: entry.dayOfWeek,
              startTime: entry.startTime,
              endTime: entry.endTime,
              title: entry.title,
              type: entry.type,
              instructor: entry.instructor || 'TBA',
              color: entry.color
            }
          });
          entriesCreated++;
          console.log(`  ✅ Created entry: ${entry.title}`);
        } catch (error) {
          console.log(`  ❌ Failed to create entry: ${entry.title}`, (error as Error).message);
        }
      }
    }
    
    console.log(`✅ Created ${entriesCreated} schedule entries`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getSampleEntriesForModule(moduleCode: string, subjects: any[], locations: any[], timeSlots: any[]) {
  const lectureHall = locations.find(l => l.name === 'Lecture Hall A');
  const lab = locations.find(l => l.name === 'EMS Lab 1');
  const hospital = locations.find(l => l.name === 'Al Ain Hospital');
  
  const morning1 = timeSlots.find(t => t.startTime === '08:00');
  const morning2 = timeSlots.find(t => t.startTime === '09:00');
  const afternoon1 = timeSlots.find(t => t.startTime === '14:00');
  
  const moduleSubject = subjects.find(s => s.code.startsWith(moduleCode));
  
  if (!lectureHall || !lab || !morning1 || !moduleSubject) {
    console.log('Missing required data for creating entries');
    return [];
  }
  
  const entries = [];
  
  // Monday morning lecture
  entries.push({
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:00',
    title: `${moduleCode} Theory`,
    type: 'lecture',
    instructor: 'Dr. Ahmed Al Mansouri',
    color: '#3B82F6',
    subjectId: moduleSubject.id,
    locationId: lectureHall.id,
    timeSlotId: morning1.id
  });
  
  // Tuesday practical
  if (morning2) {
    entries.push({
      dayOfWeek: 2,
      startTime: '09:00',
      endTime: '10:00',
      title: `${moduleCode} Practical`,
      type: 'practical',
      instructor: 'Ms. Sarah Johnson',
      color: '#10B981',
      subjectId: moduleSubject.id,
      locationId: lab.id,
      timeSlotId: morning2.id
    });
  }
  
  // Wednesday clinical (if hospital exists)
  if (hospital && afternoon1) {
    entries.push({
      dayOfWeek: 3,
      startTime: '14:00',
      endTime: '15:00',
      title: `${moduleCode} Clinical`,
      type: 'clinical',
      instructor: 'Dr. Fatima Al Zahra',
      color: '#EF4444',
      subjectId: moduleSubject.id,
      locationId: hospital.id,
      timeSlotId: afternoon1.id
    });
  }
  
  return entries;
}

main();
