
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

const subjects = [
  { code: 'HEM3903A', name: 'Ambulance Practicum III - Theory', moduleCode: 'HEM3903', credits: 3 },
  { code: 'HEM3903B', name: 'Ambulance Practicum III - Practical', moduleCode: 'HEM3903', credits: 2 },
  { code: 'HEM2903A', name: 'Ambulance 1 Practical - Theory', moduleCode: 'HEM2903', credits: 3 },
  { code: 'HEM2903B', name: 'Ambulance 1 Practical - Clinical', moduleCode: 'HEM2903', credits: 2 },
  { code: 'HEM3923A', name: 'Responder Practicum I - Theory', moduleCode: 'HEM3923', credits: 2 },
  { code: 'HEM3923B', name: 'Responder Practicum I - Field Training', moduleCode: 'HEM3923', credits: 3 },
  { code: 'AEM230A', name: 'Clinical Practicum 1 AMB - Theory', moduleCode: 'AEM230', credits: 2 },
  { code: 'AEM230B', name: 'Clinical Practicum 1 AMB - Clinical', moduleCode: 'AEM230', credits: 4 },
];

const locations = [
  { name: 'Lecture Hall A', type: 'classroom', capacity: 50, building: 'Main Building', floor: '1st' },
  { name: 'Lecture Hall B', type: 'classroom', capacity: 40, building: 'Main Building', floor: '1st' },
  { name: 'EMS Lab 1', type: 'lab', capacity: 20, building: 'Skills Building', floor: '2nd', equipment: 'Medical simulation equipment' },
  { name: 'EMS Lab 2', type: 'lab', capacity: 20, building: 'Skills Building', floor: '2nd', equipment: 'Ambulance simulator' },
  { name: 'Clinical Skills Room', type: 'lab', capacity: 15, building: 'Skills Building', floor: '3rd', equipment: 'Patient care equipment' },
  { name: 'Al Ain Hospital', type: 'clinic', capacity: 8, building: 'External', floor: 'Various', equipment: 'Real clinical environment' },
  { name: 'UAE Ambulance Service', type: 'clinic', capacity: 6, building: 'External', floor: 'Field', equipment: 'Ambulance units' },
];

const timeSlots = [
  { startTime: '08:00', endTime: '09:00', duration: 60 },
  { startTime: '09:00', endTime: '10:00', duration: 60 },
  { startTime: '10:00', endTime: '11:00', duration: 60 },
  { startTime: '11:00', endTime: '12:00', duration: 60 },
  { startTime: '12:00', endTime: '13:00', duration: 60 },
  { startTime: '13:00', endTime: '14:00', duration: 60 },
  { startTime: '14:00', endTime: '15:00', duration: 60 },
  { startTime: '15:00', endTime: '16:00', duration: 60 },
  { startTime: '16:00', endTime: '17:00', duration: 60 },
  { startTime: '17:00', endTime: '18:00', duration: 60 },
];

const instructors = [
  'Dr. Ahmed Al Mansouri',
  'Dr. Fatima Al Zahra',
  'Prof. Mohammed Hassan',
  'Ms. Sarah Johnson',
  'Mr. Omar Al Dhaheri',
  'Dr. Aisha Al Ameri',
];

// Sample schedule templates by module
const scheduleTemplates = {
  'HEM3903': [
    { dayOfWeek: 1, startTime: '08:00', endTime: '10:00', title: 'Advanced Patient Assessment', type: 'lecture', subjectCode: 'HEM3903A', instructor: 'Dr. Ahmed Al Mansouri', location: 'Lecture Hall A' },
    { dayOfWeek: 1, startTime: '10:00', endTime: '12:00', title: 'Ambulance Operations', type: 'practical', subjectCode: 'HEM3903B', instructor: 'Mr. Omar Al Dhaheri', location: 'EMS Lab 1' },
    { dayOfWeek: 2, startTime: '09:00', endTime: '11:00', title: 'Emergency Pharmacology', type: 'lecture', subjectCode: 'HEM3903A', instructor: 'Dr. Fatima Al Zahra', location: 'Lecture Hall B' },
    { dayOfWeek: 3, startTime: '08:00', endTime: '12:00', title: 'Clinical Placement', type: 'clinical', subjectCode: 'HEM3903B', instructor: 'Dr. Aisha Al Ameri', location: 'Al Ain Hospital' },
    { dayOfWeek: 4, startTime: '14:00', endTime: '16:00', title: 'Case Studies Review', type: 'tutorial', subjectCode: 'HEM3903A', instructor: 'Prof. Mohammed Hassan', location: 'Lecture Hall A' },
    { dayOfWeek: 5, startTime: '08:00', endTime: '10:00', title: 'Skills Assessment', type: 'practical', subjectCode: 'HEM3903B', instructor: 'Ms. Sarah Johnson', location: 'Clinical Skills Room' },
  ],
  'HEM2903': [
    { dayOfWeek: 1, startTime: '09:00', endTime: '11:00', title: 'Basic Life Support', type: 'lecture', subjectCode: 'HEM2903A', instructor: 'Prof. Mohammed Hassan', location: 'Lecture Hall B' },
    { dayOfWeek: 1, startTime: '14:00', endTime: '16:00', title: 'BLS Practical Training', type: 'practical', subjectCode: 'HEM2903B', instructor: 'Ms. Sarah Johnson', location: 'EMS Lab 2' },
    { dayOfWeek: 2, startTime: '08:00', endTime: '10:00', title: 'Patient Care Fundamentals', type: 'lecture', subjectCode: 'HEM2903A', instructor: 'Dr. Fatima Al Zahra', location: 'Lecture Hall A' },
    { dayOfWeek: 3, startTime: '10:00', endTime: '12:00', title: 'Medical Equipment Usage', type: 'practical', subjectCode: 'HEM2903B', instructor: 'Mr. Omar Al Dhaheri', location: 'EMS Lab 1' },
    { dayOfWeek: 4, startTime: '09:00', endTime: '13:00', title: 'Hospital Observation', type: 'clinical', subjectCode: 'HEM2903B', instructor: 'Dr. Aisha Al Ameri', location: 'Al Ain Hospital' },
    { dayOfWeek: 5, startTime: '13:00', endTime: '15:00', title: 'Theory Review', type: 'tutorial', subjectCode: 'HEM2903A', instructor: 'Prof. Mohammed Hassan', location: 'Lecture Hall B' },
  ],
  'HEM3923': [
    { dayOfWeek: 1, startTime: '10:00', endTime: '12:00', title: 'First Response Protocols', type: 'lecture', subjectCode: 'HEM3923A', instructor: 'Dr. Ahmed Al Mansouri', location: 'Lecture Hall A' },
    { dayOfWeek: 2, startTime: '14:00', endTime: '17:00', title: 'Field Response Training', type: 'practical', subjectCode: 'HEM3923B', instructor: 'Mr. Omar Al Dhaheri', location: 'UAE Ambulance Service' },
    { dayOfWeek: 3, startTime: '09:00', endTime: '11:00', title: 'Emergency Scene Management', type: 'lecture', subjectCode: 'HEM3923A', instructor: 'Ms. Sarah Johnson', location: 'Lecture Hall B' },
    { dayOfWeek: 4, startTime: '08:00', endTime: '12:00', title: 'Field Practicum', type: 'clinical', subjectCode: 'HEM3923B', instructor: 'Dr. Aisha Al Ameri', location: 'UAE Ambulance Service' },
    { dayOfWeek: 5, startTime: '10:00', endTime: '12:00', title: 'Case Study Analysis', type: 'tutorial', subjectCode: 'HEM3923A', instructor: 'Prof. Mohammed Hassan', location: 'Clinical Skills Room' },
  ],
  'AEM230': [
    { dayOfWeek: 1, startTime: '13:00', endTime: '15:00', title: 'Clinical Assessment Techniques', type: 'lecture', subjectCode: 'AEM230A', instructor: 'Dr. Fatima Al Zahra', location: 'Lecture Hall A' },
    { dayOfWeek: 1, startTime: '15:00', endTime: '17:00', title: 'Assessment Practice', type: 'practical', subjectCode: 'AEM230B', instructor: 'Dr. Aisha Al Ameri', location: 'Clinical Skills Room' },
    { dayOfWeek: 2, startTime: '08:00', endTime: '12:00', title: 'Hospital Clinical Rotation', type: 'clinical', subjectCode: 'AEM230B', instructor: 'Dr. Ahmed Al Mansouri', location: 'Al Ain Hospital' },
    { dayOfWeek: 3, startTime: '13:00', endTime: '17:00', title: 'Ambulance Clinical Rotation', type: 'clinical', subjectCode: 'AEM230B', instructor: 'Mr. Omar Al Dhaheri', location: 'UAE Ambulance Service' },
    { dayOfWeek: 4, startTime: '10:00', endTime: '12:00', title: 'Clinical Documentation', type: 'lecture', subjectCode: 'AEM230A', instructor: 'Ms. Sarah Johnson', location: 'Lecture Hall B' },
    { dayOfWeek: 5, startTime: '14:00', endTime: '17:00', title: 'Integrated Clinical Skills', type: 'practical', subjectCode: 'AEM230B', instructor: 'Prof. Mohammed Hassan', location: 'EMS Lab 1' },
  ]
};

async function main() {
  try {
    console.log('🚀 Starting timetable seeding...');
    
    // Clear existing timetable data
    console.log('🧹 Clearing existing timetable data...');
    await prisma.scheduleEntry.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.scheduleConflict.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.location.deleteMany();
    await prisma.timeSlot.deleteMany();
    
    // Create time slots
    console.log('⏰ Creating time slots...');
    const createdTimeSlots = [];
    for (const slot of timeSlots) {
      const timeSlot = await prisma.timeSlot.create({
        data: slot
      });
      createdTimeSlots.push(timeSlot);
    }
    console.log(`✅ Created ${createdTimeSlots.length} time slots`);
    
    // Create locations
    console.log('📍 Creating locations...');
    const createdLocations = [];
    for (const location of locations) {
      const loc = await prisma.location.create({
        data: location
      });
      createdLocations.push(loc);
    }
    console.log(`✅ Created ${createdLocations.length} locations`);
    
    // Get modules and create subjects
    console.log('📚 Creating subjects...');
    const modules = await prisma.module.findMany();
    const moduleMap = modules.reduce((acc, mod) => {
      acc[mod.code] = mod.id;
      return acc;
    }, {} as Record<string, string>);
    
    const createdSubjects = [];
    for (const subject of subjects) {
      const moduleId = moduleMap[subject.moduleCode];
      if (moduleId) {
        const subj = await prisma.subject.create({
          data: {
            code: subject.code,
            name: subject.name,
            credits: subject.credits,
            moduleId
          }
        });
        createdSubjects.push(subj);
      }
    }
    console.log(`✅ Created ${createdSubjects.length} subjects`);
    
    // Get students and create schedules
    console.log('👥 Creating student schedules...');
    const students = await prisma.student.findMany({
      include: {
        module: true
      }
    });
    
    const subjectMap = createdSubjects.reduce((acc, subj) => {
      acc[subj.code] = subj.id;
      return acc;
    }, {} as Record<string, string>);
    
    const locationMap = createdLocations.reduce((acc, loc) => {
      acc[loc.name] = loc.id;
      return acc;
    }, {} as Record<string, string>);
    
    const timeSlotMap = createdTimeSlots.reduce((acc, ts) => {
      const key = `${ts.startTime}-${ts.endTime}`;
      acc[key] = ts.id;
      return acc;
    }, {} as Record<string, string>);
    
    let schedulesCreated = 0;
    let entriesCreated = 0;
    
    for (const student of students) {
      if (!student.module) continue;
      
      const template = scheduleTemplates[student.module.code as keyof typeof scheduleTemplates];
      if (!template) continue;
      
      // Create schedule for student
      const schedule = await prisma.schedule.create({
        data: {
          studentId: student.id,
          semester: 'current',
          academicYear: '2024-2025',
          isActive: true
        }
      });
      
      schedulesCreated++;
      
      // Create schedule entries
      for (const entry of template) {
        const timeSlotKey = `${entry.startTime}-${entry.endTime}`;
        const timeSlotId = timeSlotMap[timeSlotKey];
        const subjectId = subjectMap[entry.subjectCode];
        const locationId = locationMap[entry.location];
        
        if (timeSlotId && subjectId && locationId) {
          await prisma.scheduleEntry.create({
            data: {
              scheduleId: schedule.id,
              subjectId,
              timeSlotId,
              locationId,
              dayOfWeek: entry.dayOfWeek,
              startTime: entry.startTime,
              endTime: entry.endTime,
              title: entry.title,
              type: entry.type,
              instructor: entry.instructor,
              color: getTypeColor(entry.type)
            }
          });
          entriesCreated++;
        }
      }
      
      // Add some variation to schedules (randomly skip some entries for some students)
      if (Math.random() < 0.3) { // 30% chance to have a lighter schedule
        const entriesToRemove = Math.floor(Math.random() * 2) + 1;
        const allEntries = await prisma.scheduleEntry.findMany({
          where: { scheduleId: schedule.id },
          take: entriesToRemove
        });
        
        if (allEntries.length > 0) {
          await prisma.scheduleEntry.deleteMany({
            where: {
              id: { in: allEntries.map(e => e.id) }
            }
          });
          entriesCreated -= allEntries.length;
        }
      }
    }
    
    console.log(`✅ Created ${schedulesCreated} schedules with ${entriesCreated} entries`);
    console.log('🎉 Timetable seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding timetables:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function getTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'lecture': return '#3B82F6'; // Blue
    case 'practical': return '#10B981'; // Green
    case 'clinical': return '#EF4444'; // Red
    case 'tutorial': return '#8B5CF6'; // Purple
    case 'lab': return '#F59E0B'; // Orange
    default: return '#6B7280'; // Gray
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
