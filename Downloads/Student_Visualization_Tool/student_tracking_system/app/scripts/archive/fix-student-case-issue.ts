import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixStudentCaseIssue() {
  console.log('=== FIXING STUDENT ID CASE ISSUES ===\n')

  // Check for student with lowercase h00513261
  const studentLowercase = await prisma.student.findUnique({
    where: { studentId: 'h00513261' },
    include: { module: true }
  })

  if (studentLowercase) {
    console.log(`Found student with lowercase ID: ${studentLowercase.fullName} (${studentLowercase.studentId})`)
    console.log(`Currently in module: ${studentLowercase.module?.code || 'None'}`)

    // Check if this student is in HEM3903
    if (studentLowercase.module?.code === 'HEM3903') {
      console.log('✓ Student h00513261 (Yunis Maaruf) is correctly enrolled in HEM3903')
    } else {
      console.log('✗ Student h00513261 is not in HEM3903, needs to be moved')
    }
  }

  // Check for student with uppercase H00513261
  const studentUppercase = await prisma.student.findUnique({
    where: { studentId: 'H00513261' }
  })

  if (studentUppercase) {
    console.log(`Found student with uppercase ID: ${studentUppercase.fullName} (${studentUppercase.studentId})`)
  } else {
    console.log('No student found with uppercase ID H00513261')
  }

  // Check the frontend display issue - maybe it's filtering students incorrectly
  console.log('\n=== CHECKING FRONTEND DISPLAY LOGIC ===')

  // Get HEM3903 module
  const hem3903 = await prisma.module.findUnique({
    where: { code: 'HEM3903' },
    include: { students: true }
  })

  if (hem3903) {
    console.log(`HEM3903 has ${hem3903.students.length} students in database`)
    console.log('All students:')
    hem3903.students.forEach((student, index) => {
      console.log(`  ${index + 1}. ${student.fullName} (${student.studentId})`)
    })
  }

  await prisma.$disconnect()
}

fixStudentCaseIssue().catch(console.error)