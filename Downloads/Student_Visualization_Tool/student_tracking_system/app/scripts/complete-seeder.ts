import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Creating schedule entries for all students...');
    
    // Get all students with modules
    const students = await prisma.student.findMany({
      include: { module: true }
    });
    
    const subjects = await prisma.subject.findMany();
    const locations = await prisma.location.findMany();
    const timeSlots = await prisma.timeSlot.findMany();
    
    console.log(`Processing ${students.length} students...`);
    
    let entriesCreated = 0;
    const moduleStudentCounts: { [key: string]: number } = {};
    
    for (const student of students) {
      if (!student.module) continue;
      
      moduleStudentCounts[student.module.code] = (moduleStudentCounts[student.module.code] || 0) + 1;
      
      // Find schedule for this student
      const schedule = await prisma.schedule.findFirst({
        where: { studentId: student.id }
      });
      
      if (!schedule) continue;
      
      // Create entries based on module
      const entries = getEntriesForModule(student.module.code, subjects, locations, timeSlots);
      
      for (const entry of entries) {
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
              instructor: entry.instructor,
              color: entry.color
            }
          });
          entriesCreated++;
        } catch (error) {
          console.log(`Failed to create entry for ${student.fullName}: ${(error as Error).message}`);
        }
      }
    }
    
    console.log('\n📊 Results:');
    console.log(`✅ Created ${entriesCreated} schedule entries`);
    console.log('\n📋 Students per module:');
    Object.entries(moduleStudentCounts).forEach(([module, count]) => {
      console.log(`   ${module}: ${count} students`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getEntriesForModule(moduleCode: string, subjects: any[], locations: any[], timeSlots: any[]) {
  const lectureHallA = locations.find(l => l.name === 'Lecture Hall A');
  const lectureHallB = locations.find(l => l.name === 'Lecture Hall B');
  const lab1 = locations.find(l => l.name === 'EMS Lab 1');
  const lab2 = locations.find(l => l.name === 'EMS Lab 2');
  const clinicalRoom = locations.find(l => l.name === 'Clinical Skills Room');
  const hospital = locations.find(l => l.name === 'Al Ain Hospital');
  const ambulanceService = locations.find(l => l.name === 'UAE Ambulance Service');
  
  const timeSlot8 = timeSlots.find(t => t.startTime === '08:00');
  const timeSlot9 = timeSlots.find(t => t.startTime === '09:00');
  const timeSlot10 = timeSlots.find(t => t.startTime === '10:00');
  const timeSlot11 = timeSlots.find(t => t.startTime === '11:00');
  const timeSlot13 = timeSlots.find(t => t.startTime === '13:00');
  const timeSlot14 = timeSlots.find(t => t.startTime === '14:00');
  const timeSlot15 = timeSlots.find(t => t.startTime === '15:00');
  
  const moduleSubjects = subjects.filter(s => s.code.includes(moduleCode));
  const theorySubject = moduleSubjects.find(s => s.code.includes('A')) || moduleSubjects[0];
  const practicalSubject = moduleSubjects.find(s => s.code.includes('B')) || moduleSubjects[1] || theorySubject;
  
  const entries = [];
  
  switch (moduleCode) {
    case 'HEM3903': // Ambulance Practicum III
      entries.push({
        dayOfWeek: 1, startTime: '08:00', endTime: '09:00',
        title: 'Advanced Patient Assessment', type: 'lecture',
        instructor: 'Dr. Ahmed Al Mansouri', color: '#3B82F6',
        subjectId: theorySubject?.id, locationId: lectureHallA?.id, timeSlotId: timeSlot8?.id
      });
      entries.push({
        dayOfWeek: 1, startTime: '10:00', endTime: '11:00',
        title: 'Ambulance Operations', type: 'practical',
        instructor: 'Mr. Omar Al Dhaheri', color: '#10B981',
        subjectId: practicalSubject?.id, locationId: lab1?.id, timeSlotId: timeSlot10?.id
      });
      entries.push({
        dayOfWeek: 3, startTime: '08:00', endTime: '09:00',
        title: 'Clinical Placement', type: 'clinical',
        instructor: 'Dr. Aisha Al Ameri', color: '#EF4444',
        subjectId: practicalSubject?.id, locationId: hospital?.id, timeSlotId: timeSlot8?.id
      });
      entries.push({
        dayOfWeek: 4, startTime: '14:00', endTime: '15:00',
        title: 'Case Studies Review', type: 'tutorial',
        instructor: 'Prof. Mohammed Hassan', color: '#8B5CF6',
        subjectId: theorySubject?.id, locationId: lectureHallB?.id, timeSlotId: timeSlot14?.id
      });
      break;
      
    case 'HEM2903': // Ambulance 1 Practical Group
      entries.push({
        dayOfWeek: 1, startTime: '09:00', endTime: '10:00',
        title: 'Basic Life Support', type: 'lecture',
        instructor: 'Prof. Mohammed Hassan', color: '#3B82F6',
        subjectId: theorySubject?.id, locationId: lectureHallB?.id, timeSlotId: timeSlot9?.id
      });
      entries.push({
        dayOfWeek: 1, startTime: '14:00', endTime: '15:00',
        title: 'BLS Practical Training', type: 'practical',
        instructor: 'Ms. Sarah Johnson', color: '#10B981',
        subjectId: practicalSubject?.id, locationId: lab2?.id, timeSlotId: timeSlot14?.id
      });
      entries.push({
        dayOfWeek: 3, startTime: '10:00', endTime: '11:00',
        title: 'Medical Equipment Usage', type: 'practical',
        instructor: 'Mr. Omar Al Dhaheri', color: '#10B981',
        subjectId: practicalSubject?.id, locationId: lab1?.id, timeSlotId: timeSlot10?.id
      });
      entries.push({
        dayOfWeek: 4, startTime: '09:00', endTime: '10:00',
        title: 'Hospital Observation', type: 'clinical',
        instructor: 'Dr. Aisha Al Ameri', color: '#EF4444',
        subjectId: practicalSubject?.id, locationId: hospital?.id, timeSlotId: timeSlot9?.id
      });
      break;
      
    case 'HEM3923': // Responder Practicum I
      entries.push({
        dayOfWeek: 1, startTime: '10:00', endTime: '11:00',
        title: 'First Response Protocols', type: 'lecture',
        instructor: 'Dr. Ahmed Al Mansouri', color: '#3B82F6',
        subjectId: theorySubject?.id, locationId: lectureHallA?.id, timeSlotId: timeSlot10?.id
      });
      entries.push({
        dayOfWeek: 2, startTime: '14:00', endTime: '15:00',
        title: 'Field Response Training', type: 'practical',
        instructor: 'Mr. Omar Al Dhaheri', color: '#10B981',
        subjectId: practicalSubject?.id, locationId: ambulanceService?.id, timeSlotId: timeSlot14?.id
      });
      entries.push({
        dayOfWeek: 4, startTime: '08:00', endTime: '09:00',
        title: 'Field Practicum', type: 'clinical',
        instructor: 'Dr. Aisha Al Ameri', color: '#EF4444',
        subjectId: practicalSubject?.id, locationId: ambulanceService?.id, timeSlotId: timeSlot8?.id
      });
      break;
      
    case 'AEM230': // Apply Clinical Practicum 1 AMB
      entries.push({
        dayOfWeek: 1, startTime: '13:00', endTime: '14:00',
        title: 'Clinical Assessment Techniques', type: 'lecture',
        instructor: 'Dr. Fatima Al Zahra', color: '#3B82F6',
        subjectId: theorySubject?.id, locationId: lectureHallA?.id, timeSlotId: timeSlot13?.id
      });
      entries.push({
        dayOfWeek: 1, startTime: '15:00', endTime: '16:00',
        title: 'Assessment Practice', type: 'practical',
        instructor: 'Dr. Aisha Al Ameri', color: '#10B981',
        subjectId: practicalSubject?.id, locationId: clinicalRoom?.id, timeSlotId: timeSlot15?.id
      });
      entries.push({
        dayOfWeek: 2, startTime: '08:00', endTime: '09:00',
        title: 'Hospital Clinical Rotation', type: 'clinical',
        instructor: 'Dr. Ahmed Al Mansouri', color: '#EF4444',
        subjectId: practicalSubject?.id, locationId: hospital?.id, timeSlotId: timeSlot8?.id
      });
      entries.push({
        dayOfWeek: 3, startTime: '13:00', endTime: '14:00',
        title: 'Ambulance Clinical Rotation', type: 'clinical',
        instructor: 'Mr. Omar Al Dhaheri', color: '#EF4444',
        subjectId: practicalSubject?.id, locationId: ambulanceService?.id, timeSlotId: timeSlot13?.id
      });
      break;
  }
  
  // Filter out entries with missing data
  return entries.filter(entry => 
    entry.subjectId && entry.locationId && entry.timeSlotId
  );
}

main();
