import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Debugging seeder...');
  
  // Check if we have students, modules, subjects, locations, and time slots
  const students = await prisma.student.count();
  const modules = await prisma.module.count();
  const subjects = await prisma.subject.count();
  const locations = await prisma.location.count();
  const timeSlots = await prisma.timeSlot.count();
  const schedules = await prisma.schedule.count();
  const scheduleEntries = await prisma.scheduleEntry.count();
  
  console.log('📊 Database counts:');
  console.log(`   Students: ${students}`);
  console.log(`   Modules: ${modules}`);
  console.log(`   Subjects: ${subjects}`);
  console.log(`   Locations: ${locations}`);
  console.log(`   Time Slots: ${timeSlots}`);
  console.log(`   Schedules: ${schedules}`);
  console.log(`   Schedule Entries: ${scheduleEntries}`);
  
  // Get first few of each to check the data
  const firstStudent = await prisma.student.findFirst({ include: { module: true } });
  const firstSubject = await prisma.subject.findFirst();
  const firstLocation = await prisma.location.findFirst();
  const firstTimeSlot = await prisma.timeSlot.findFirst();
  
  console.log('\n📋 Sample data:');
  console.log('Student:', firstStudent);
  console.log('Subject:', firstSubject);
  console.log('Location:', firstLocation);
  console.log('Time Slot:', firstTimeSlot);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
