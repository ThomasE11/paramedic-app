import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkStudentAllocations() {
  console.log('=== STUDENT ALLOCATION REPORT ===\n')

  // Get all modules with student counts
  const modules = await prisma.module.findMany({
    include: {
      students: true
    },
    orderBy: {
      code: 'asc'
    }
  })

  for (const module of modules) {
    console.log(`\n--- ${module.code} (${module.name}) ---`)
    console.log(`Actual: ${module.students.length} students`)

    if (module.students.length > 0) {
      console.log('Students:')
      module.students.forEach((student, index) => {
        console.log(`  ${index + 1}. ${student.fullName} (${student.studentId})`)
      })
    } else {
      console.log('No students enrolled')
    }

    // Check for specific issues
    if (module.code === 'HEM3903') {
      console.log('\n*** HEM3903 ANALYSIS ***')
      console.log('Should have 13 students (excluding instructor)')
      console.log(`Current count: ${module.students.length}`)

      // Look for instructor (likely named Elias Thomas)
      const instructor = module.students.find(s => s.fullName.includes('Elias Thomas'))
      if (instructor) {
        console.log(`Found instructor: ${instructor.fullName} - SHOULD BE REMOVED`)
      }

      // Look for missing student H00513261
      const missingStudent = module.students.find(s => s.studentId === 'H00513261')
      if (!missingStudent) {
        console.log('*** MISSING: Student H00513261 not found in HEM3903 ***')
      } else {
        console.log(`Found H00513261: ${missingStudent.fullName}`)
      }
    }

    if (module.code === 'HEM2903') {
      console.log('\n*** HEM2903 ANALYSIS ***')
      console.log('Should have 14 students (16 minus instructor and preview student)')
      console.log(`Current count: ${module.students.length}`)
    }

    if (module.code === 'HEM3923') {
      console.log('\n*** HEM3923 ANALYSIS ***')
      console.log('Should have 6 students - This one is correct according to user')
      console.log(`Current count: ${module.students.length}`)
    }
  }

  // Check if student H00513261 exists in the system
  console.log('\n=== SEARCHING FOR STUDENT H00513261 ===')
  const student = await prisma.student.findUnique({
    where: { studentId: 'H00513261' },
    include: {
      module: true
    }
  })

  if (student) {
    console.log(`Found student: ${student.fullName}`)
    console.log(`Email: ${student.email}`)
    if (student.module) {
      console.log(`Currently enrolled in: ${student.module.code} - ${student.module.name}`)
    } else {
      console.log('Not enrolled in any module')
    }
  } else {
    console.log('*** STUDENT H00513261 NOT FOUND IN SYSTEM ***')
  }

  // Check for any students with "Elias Thomas" in name
  console.log('\n=== SEARCHING FOR INSTRUCTOR ACCOUNTS ===')
  const instructors = await prisma.student.findMany({
    where: {
      fullName: {
        contains: 'Elias Thomas',
        mode: 'insensitive'
      }
    },
    include: {
      module: true
    }
  })

  if (instructors.length > 0) {
    console.log('Found instructor accounts in student table:')
    instructors.forEach(instructor => {
      console.log(`  - ${instructor.fullName} (${instructor.studentId}) in ${instructor.module?.code || 'No module'}`)
    })
  } else {
    console.log('No instructor accounts found in student table')
  }

  await prisma.$disconnect()
}

checkStudentAllocations().catch(console.error)