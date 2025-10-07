import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Correct student list for HEM3923
const HEM3923_STUDENTS = [
  {
    studentId: 'h00461337',
    firstName: 'Alreem',
    lastName: 'Ahmed Saif Mohammed Alameri',
    fullName: 'Alreem Ahmed Saif Mohammed Alameri',
    email: 'H00461337@hct.ac.ae'
  },
  {
    studentId: 'h00461314',
    firstName: 'Fatima',
    lastName: 'Ali Saif Ahlan Almazrouei',
    fullName: 'Fatima Ali Saif Ahlan Almazrouei',
    email: 'H00461314@hct.ac.ae'
  },
  {
    studentId: 'h00441453',
    firstName: 'Abdulhamid',
    lastName: 'Bashar Abdulla Hasan Alhaddad',
    fullName: 'Abdulhamid Bashar Abdulla Hasan Alhaddad',
    email: 'H00441453@hct.ac.ae'
  },
  {
    studentId: 'h00459151',
    firstName: 'Aysha',
    lastName: 'Helal Humaid Anad Alkaabi',
    fullName: 'Aysha Helal Humaid Anad Alkaabi',
    email: 'H00459151@hct.ac.ae'
  },
  {
    studentId: 'h00495808',
    firstName: 'Elyazia',
    lastName: 'Jumaa Ahmad Haji',
    fullName: 'Elyazia Jumaa Ahmad Haji',
    email: 'H00495808@hct.ac.ae'
  },
  {
    studentId: 'h00490995',
    firstName: 'Mohammed',
    lastName: 'Nasser Khamis Salem Aleissaee',
    fullName: 'Mohammed Nasser Khamis Salem Aleissaee',
    email: 'H00490995@hct.ac.ae'
  }
]

async function main() {
  console.log('🔍 Checking current database state...')

  // Check if HEM3923 module exists
  let hem3923Module = await prisma.module.findUnique({
    where: { code: 'HEM3923' },
    include: { students: true }
  })

  if (!hem3923Module) {
    console.log('📝 Creating HEM3923 module...')
    hem3923Module = await prisma.module.create({
      data: {
        code: 'HEM3923',
        name: 'Responder Practicum I',
        description: 'HEM 3923 - Responder Practicum I (2025.10_15109)',
        totalCredits: 3
      },
      include: { students: true }
    })
  }

  console.log(`📊 Current students in HEM3923: ${hem3923Module.students.length}`)
  hem3923Module.students.forEach(student => {
    console.log(`  - ${student.studentId}: ${student.fullName}`)
  })

  console.log('\n🎯 Target students for HEM3923:')
  HEM3923_STUDENTS.forEach(student => {
    console.log(`  - ${student.studentId}: ${student.fullName}`)
  })

  // Create or update students and assign them to HEM3923
  console.log('\n🔄 Processing student allocations...')

  for (const studentData of HEM3923_STUDENTS) {
    try {
      // Check if student exists
      let student = await prisma.student.findUnique({
        where: { studentId: studentData.studentId }
      })

      if (!student) {
        // Create new student
        console.log(`➕ Creating new student: ${studentData.studentId}`)
        student = await prisma.student.create({
          data: {
            ...studentData,
            moduleId: hem3923Module.id
          }
        })
      } else {
        // Update existing student to assign to HEM3923
        console.log(`🔄 Updating student: ${studentData.studentId}`)
        student = await prisma.student.update({
          where: { studentId: studentData.studentId },
          data: {
            ...studentData,
            moduleId: hem3923Module.id
          }
        })
      }

      console.log(`✅ ${student.studentId} assigned to HEM3923`)
    } catch (error) {
      console.error(`❌ Error processing ${studentData.studentId}:`, error)
    }
  }

  // Remove any students that shouldn't be in HEM3923
  const targetStudentIds = HEM3923_STUDENTS.map(s => s.studentId)
  const currentStudents = await prisma.student.findMany({
    where: { moduleId: hem3923Module.id }
  })

  for (const student of currentStudents) {
    if (!targetStudentIds.includes(student.studentId)) {
      console.log(`🗑️ Removing ${student.studentId} from HEM3923`)
      await prisma.student.update({
        where: { id: student.id },
        data: { moduleId: null }
      })
    }
  }

  // Final verification
  console.log('\n✅ Final verification:')
  const updatedModule = await prisma.module.findUnique({
    where: { code: 'HEM3923' },
    include: { students: true }
  })

  console.log(`📊 Students now in HEM3923: ${updatedModule?.students.length}`)
  updatedModule?.students.forEach(student => {
    console.log(`  ✓ ${student.studentId}: ${student.fullName}`)
  })

  console.log('\n🎉 Student allocation update completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })