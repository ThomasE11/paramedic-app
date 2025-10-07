#!/usr/bin/env npx tsx

/**
 * Production Database Setup Script
 * This script migrates and seeds the production database with sample data
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting production database setup...');

  // Check if we're connected to the right database
  console.log('📊 Checking database connection...');

  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  // Check if data already exists
  const existingModules = await prisma.module.count();
  const existingStudents = await prisma.student.count();

  if (existingModules > 0 || existingStudents > 0) {
    console.log(`📋 Database already has data: ${existingModules} modules, ${existingStudents} students`);
    console.log('To reset and reseed, delete the data first or use --force flag');
    return;
  }

  console.log('🌱 Seeding database with sample data...');

  // Create modules
  const modules = await Promise.all([
    prisma.module.create({
      data: {
        code: 'AEM230',
        name: 'Apply Clinical Practicum',
        description: 'Clinical practice module for diploma students',
        totalCredits: 6,
        averageGPA: 0.0
      }
    }),
    prisma.module.create({
      data: {
        code: 'HEM2903',
        name: 'Ambulance 1 Practical Group',
        description: 'Basic ambulance procedures and practical training',
        totalCredits: 4,
        averageGPA: 0.0
      }
    }),
    prisma.module.create({
      data: {
        code: 'HEM3903',
        name: 'Ambulance Practicum III',
        description: 'Advanced ambulance procedures and emergency response',
        totalCredits: 5,
        averageGPA: 0.0
      }
    }),
    prisma.module.create({
      data: {
        code: 'HEM3923',
        name: 'Responder Practicum I',
        description: 'First responder training and emergency medical response',
        totalCredits: 4,
        averageGPA: 0.0
      }
    })
  ]);

  console.log(`✅ Created ${modules.length} modules`);

  // Create locations
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        name: 'Simulation Lab A',
        capacity: 25,
        type: 'laboratory',
        building: 'Medical Building',
        floor: '2nd Floor',
        equipment: 'Medical simulation equipment, manikins, monitors'
      }
    }),
    prisma.location.create({
      data: {
        name: 'Classroom 301',
        capacity: 30,
        type: 'classroom',
        building: 'Academic Building',
        floor: '3rd Floor',
        equipment: 'Projector, whiteboard, audio system'
      }
    }),
    prisma.location.create({
      data: {
        name: 'Ambulance Training Center',
        capacity: 15,
        type: 'practical',
        building: 'Training Facility',
        floor: 'Ground Floor',
        equipment: 'Ambulance vehicles, medical equipment, stretchers'
      }
    })
  ]);

  console.log(`✅ Created ${locations.length} locations`);

  // Create sample students
  const studentData = [
    // HEM3923 - Responder Practicum I (6 students)
    { id: '55', name: 'Alreem Ahmed Saif Mohammed Alameri', email: 'h00423456@hct.ac.ae', module: 'HEM3923' },
    { id: '56', name: 'Fatima Ali Saif Albian Almarzouei', email: 'h00423457@hct.ac.ae', module: 'HEM3923' },
    { id: '57', name: 'Abdulhamid Bashar Abdulla Hasan Alqadeda', email: 'h00423458@hct.ac.ae', module: 'HEM3923' },
    { id: '58', name: 'Aysha Helal Humaid Anaf Alkaabi', email: 'h00423459@hct.ac.ae', module: 'HEM3923' },
    { id: '59', name: 'Elyazia Jumaa Ahmad Haji', email: 'h00423460@hct.ac.ae', module: 'HEM3923' },
    { id: '60', name: 'Mohammed Nasser Khamis Salem Alkhsuaee', email: 'h00423461@hct.ac.ae', module: 'HEM3923' },

    // HEM3903 - Ambulance Practicum III (9 students)
    { id: '46', name: 'Abdulla Hamad Khalifa Almarzouqi', email: 'h00323456@hct.ac.ae', module: 'HEM3903' },
    { id: '47', name: 'Ahmed Hamad Khalifa Almarzouqi', email: 'h00323457@hct.ac.ae', module: 'HEM3903' },
    { id: '48', name: 'Ali Hamad Khalifa Almarzouqi', email: 'h00323458@hct.ac.ae', module: 'HEM3903' },
    { id: '49', name: 'Hamad Khalifa Ahmed Almarzouqi', email: 'h00323459@hct.ac.ae', module: 'HEM3903' },
    { id: '50', name: 'Khalifa Ahmed Hamad Almarzouqi', email: 'h00323460@hct.ac.ae', module: 'HEM3903' },
    { id: '51', name: 'Mohammed Hamad Khalifa Almarzouqi', email: 'h00323461@hct.ac.ae', module: 'HEM3903' },
    { id: '52', name: 'Saeed Hamad Khalifa Almarzouqi', email: 'h00323462@hct.ac.ae', module: 'HEM3903' },
    { id: '53', name: 'Sultan Hamad Khalifa Almarzouqi', email: 'h00323463@hct.ac.ae', module: 'HEM3903' },
    { id: '54', name: 'Yousef Hamad Khalifa Almarzouqi', email: 'h00323464@hct.ac.ae', module: 'HEM3903' },

    // HEM2903 - Ambulance 1 Practical Group (14 students)
    { id: '32', name: 'Abdulla Saeed Mohammed Alkaabi', email: 'h00223456@hct.ac.ae', module: 'HEM2903' },
    { id: '33', name: 'Ahmed Saeed Mohammed Alkaabi', email: 'h00223457@hct.ac.ae', module: 'HEM2903' },
    { id: '34', name: 'Ali Saeed Mohammed Alkaabi', email: 'h00223458@hct.ac.ae', module: 'HEM2903' },
    { id: '35', name: 'Hamad Saeed Mohammed Alkaabi', email: 'h00223459@hct.ac.ae', module: 'HEM2903' },
    { id: '36', name: 'Khalifa Saeed Mohammed Alkaabi', email: 'h00223460@hct.ac.ae', module: 'HEM2903' },
    { id: '37', name: 'Mohammed Saeed Ahmed Alkaabi', email: 'h00223461@hct.ac.ae', module: 'HEM2903' },
    { id: '38', name: 'Saeed Mohammed Ahmed Alkaabi', email: 'h00223462@hct.ac.ae', module: 'HEM2903' },
    { id: '39', name: 'Sultan Saeed Mohammed Alkaabi', email: 'h00223463@hct.ac.ae', module: 'HEM2903' },
    { id: '40', name: 'Yousef Saeed Mohammed Alkaabi', email: 'h00223464@hct.ac.ae', module: 'HEM2903' },
    { id: '41', name: 'Zayed Saeed Mohammed Alkaabi', email: 'h00223465@hct.ac.ae', module: 'HEM2903' },
    { id: '42', name: 'Omar Saeed Mohammed Alkaabi', email: 'h00223466@hct.ac.ae', module: 'HEM2903' },
    { id: '43', name: 'Rashid Saeed Mohammed Alkaabi', email: 'h00223467@hct.ac.ae', module: 'HEM2903' },
    { id: '44', name: 'Mansour Saeed Mohammed Alkaabi', email: 'h00223468@hct.ac.ae', module: 'HEM2903' },
    { id: '45', name: 'Majid Saeed Mohammed Alkaabi', email: 'h00223469@hct.ac.ae', module: 'HEM2903' },

    // AEM230 - Apply Clinical Practicum (first 10 of 31 students)
    { id: '1', name: 'Abdulla Ahmed Abdulla Alhammadi', email: 'h00123456@hct.ac.ae', module: 'AEM230' },
    { id: '2', name: 'Abdulla Ali Saeed Alkaabi', email: 'h00123457@hct.ac.ae', module: 'AEM230' },
    { id: '3', name: 'Abdulla Khalifa Saeed Alkaabi', email: 'h00123458@hct.ac.ae', module: 'AEM230' },
    { id: '4', name: 'Ahmed Abdulla Ahmed Alhammadi', email: 'h00123459@hct.ac.ae', module: 'AEM230' },
    { id: '5', name: 'Ahmed Ali Saeed Alkaabi', email: 'h00123460@hct.ac.ae', module: 'AEM230' },
    { id: '6', name: 'Ali Ahmed Abdulla Alhammadi', email: 'h00123461@hct.ac.ae', module: 'AEM230' },
    { id: '7', name: 'Ali Khalifa Saeed Alkaabi', email: 'h00123462@hct.ac.ae', module: 'AEM230' },
    { id: '8', name: 'Hamad Ahmed Abdulla Alhammadi', email: 'h00123463@hct.ac.ae', module: 'AEM230' },
    { id: '9', name: 'Khalifa Ali Saeed Alkaabi', email: 'h00123464@hct.ac.ae', module: 'AEM230' },
    { id: '10', name: 'Mohammed Ahmed Abdulla Alhammadi', email: 'h00123465@hct.ac.ae', module: 'AEM230' }
  ];

  // Create students
  let studentsCreated = 0;
  for (const student of studentData) {
    const module = modules.find(m => m.code === student.module);
    if (!module) {
      console.error(`Module ${student.module} not found for student ${student.name}`);
      continue;
    }

    const nameParts = student.name.split(' ');
    const firstName = nameParts[0] || student.name;
    const lastName = nameParts.slice(1).join(' ') || '';

    await prisma.student.create({
      data: {
        studentId: `H${student.id.padStart(8, '0')}`,
        firstName,
        lastName,
        fullName: student.name,
        email: student.email,
        moduleId: module.id,
        currentGPA: Math.random() * 2 + 2.5, // Random GPA between 2.5-4.5
        creditHours: Math.floor(Math.random() * 20) + 60 // Random credit hours 60-80
      }
    });
    studentsCreated++;
  }

  console.log(`✅ Created ${studentsCreated} students`);

  // Create sample class sessions
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const classSessions = await Promise.all([
    prisma.classSession.create({
      data: {
        title: 'Emergency Response Simulation',
        description: 'Hands-on simulation of emergency medical response scenarios',
        moduleId: modules.find(m => m.code === 'HEM3923')?.id,
        locationId: locations[0].id, // Simulation Lab A
        date: tomorrow,
        startTime: '09:00',
        endTime: '11:00',
        duration: 120,
        type: 'practical',
        status: 'scheduled',
        capacity: 6
      }
    }),
    prisma.classSession.create({
      data: {
        title: 'Advanced Ambulance Procedures',
        description: 'Advanced techniques in ambulance operations and patient care',
        moduleId: modules.find(m => m.code === 'HEM3903')?.id,
        locationId: locations[2].id, // Ambulance Training Center
        date: tomorrow,
        startTime: '14:00',
        endTime: '16:00',
        duration: 120,
        type: 'practical',
        status: 'scheduled',
        capacity: 9
      }
    })
  ]);

  console.log(`✅ Created ${classSessions.length} class sessions`);

  console.log('🎉 Production database setup completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Modules: ${modules.length}`);
  console.log(`   - Students: ${studentsCreated}`);
  console.log(`   - Locations: ${locations.length}`);
  console.log(`   - Class Sessions: ${classSessions.length}`);
  console.log('\n🚀 Your production system is now ready to use!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database setup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });