import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Correct student list for HEM3903 - Ambulance Practicum III (2025.10_11139)
const HEM3903_STUDENTS = [
  {
    studentId: 'h00467388',
    firstName: 'Nahian',
    lastName: 'Abdullah Ali Rashed Al Saadi',
    fullName: 'Nahian Abdullah Ali Rashed Al Saadi',
    email: 'H00467388@hct.ac.ae'
  },
  {
    studentId: 'h00491322',
    firstName: 'Mahra',
    lastName: 'Abdulla Saeed Bakhit Alshebi',
    fullName: 'Mahra Abdulla Saeed Bakhit Alshebi',
    email: 'H00491322@hct.ac.ae'
  },
  {
    studentId: 'h00374079',
    firstName: 'Abdulla',
    lastName: 'Ahmed Hasan Rhaimdad Alblooshi',
    fullName: 'Abdulla Ahmed Hasan Rhaimdad Alblooshi',
    email: 'H00374079@hct.ac.ae'
  },
  {
    studentId: 'h00459031',
    firstName: 'Saeed',
    lastName: 'Amer Salem Ahmed Alseiari',
    fullName: 'Saeed Amer Salem Ahmed Alseiari',
    email: 'H00459031@hct.ac.ae'
  },
  {
    studentId: 'h00396512',
    firstName: 'Aziz',
    lastName: 'Hamad Nasser Ali Al Ahbabi',
    fullName: 'Aziz Hamad Nasser Ali Al Ahbabi',
    email: 'H00396512@hct.ac.ae'
  },
  {
    studentId: 'h00513261',
    firstName: 'Yunis',
    lastName: 'Maaruf',
    fullName: 'Yunis Maaruf',
    email: 'H00513261@hct.ac.ae'
  },
  {
    studentId: 'h00473436',
    firstName: 'Abdulla',
    lastName: 'Mohamed Abdulla Obaid Alfarsi',
    fullName: 'Abdulla Mohamed Abdulla Obaid Alfarsi',
    email: 'H00473436@hct.ac.ae'
  },
  {
    studentId: 'h00355387',
    firstName: 'Musabbeh',
    lastName: 'Mohammed Rashed Hamad Alhajeri',
    fullName: 'Musabbeh Mohammed Rashed Hamad Alhajeri',
    email: 'H00355387@hct.ac.ae'
  },
  {
    studentId: 'h00322517',
    firstName: 'Jassem',
    lastName: 'Mujeeb Abdullatif Abdulnabi Alblooshi',
    fullName: 'Jassem Mujeeb Abdullatif Abdulnabi Alblooshi',
    email: 'H00322517@hct.ac.ae'
  },
  {
    studentId: 'h00491239',
    firstName: 'Sherina',
    lastName: 'Obaid Ali Rashed Alghoor',
    fullName: 'Sherina Obaid Ali Rashed Alghoor',
    email: 'H00491239@hct.ac.ae'
  },
  {
    studentId: 'h00491089',
    firstName: 'Bakhita',
    lastName: 'Saeed Rashed Hedairem Alketbi',
    fullName: 'Bakhita Saeed Rashed Hedairem Alketbi',
    email: 'H00491089@hct.ac.ae'
  },
  {
    studentId: 'h00491292',
    firstName: 'Alanood',
    lastName: 'Saif Jawaan Obaid Almansoori',
    fullName: 'Alanood Saif Jawaan Obaid Almansoori',
    email: 'H00491292@hct.ac.ae'
  },
  {
    studentId: 'h00491415',
    firstName: 'Shamsa',
    lastName: 'Salem Musabbeh Ahmed Alkaabi',
    fullName: 'Shamsa Salem Musabbeh Ahmed Alkaabi',
    email: 'H00491415@hct.ac.ae'
  }
]

async function main() {
  console.log('🔍 Checking current database state for HEM3903...')

  // Check if HEM3903 module exists
  let hem3903Module = await prisma.module.findUnique({
    where: { code: 'HEM3903' },
    include: { students: true }
  })

  if (!hem3903Module) {
    console.log('📝 Creating HEM3903 module...')
    hem3903Module = await prisma.module.create({
      data: {
        code: 'HEM3903',
        name: 'Ambulance Practicum III',
        description: 'HEM 3903 - Ambulance Practicum III (2025.10_11139)',
        totalCredits: 3
      },
      include: { students: true }
    })
  }

  console.log(`📊 Current students in HEM3903: ${hem3903Module.students.length}`)
  hem3903Module.students.forEach(student => {
    console.log(`  - ${student.studentId}: ${student.fullName}`)
  })

  console.log('\n🎯 Target students for HEM3903:')
  HEM3903_STUDENTS.forEach(student => {
    console.log(`  - ${student.studentId}: ${student.fullName}`)
  })

  // Create or update students and assign them to HEM3903
  console.log('\n🔄 Processing student allocations...')

  for (const studentData of HEM3903_STUDENTS) {
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
            moduleId: hem3903Module.id
          }
        })
      } else {
        // Update existing student to assign to HEM3903
        console.log(`🔄 Updating student: ${studentData.studentId}`)
        student = await prisma.student.update({
          where: { studentId: studentData.studentId },
          data: {
            ...studentData,
            moduleId: hem3903Module.id
          }
        })
      }

      console.log(`✅ ${student.studentId} assigned to HEM3903`)
    } catch (error) {
      console.error(`❌ Error processing ${studentData.studentId}:`, error)
    }
  }

  // Remove any students that shouldn't be in HEM3903
  const targetStudentIds = HEM3903_STUDENTS.map(s => s.studentId)
  const currentStudents = await prisma.student.findMany({
    where: { moduleId: hem3903Module.id }
  })

  for (const student of currentStudents) {
    if (!targetStudentIds.includes(student.studentId)) {
      console.log(`🗑️ Removing ${student.studentId} from HEM3903`)
      await prisma.student.update({
        where: { id: student.id },
        data: { moduleId: null }
      })
    }
  }

  // Final verification
  console.log('\n✅ Final verification:')
  const updatedModule = await prisma.module.findUnique({
    where: { code: 'HEM3903' },
    include: { students: true }
  })

  console.log(`📊 Students now in HEM3903: ${updatedModule?.students.length}`)
  updatedModule?.students.forEach(student => {
    console.log(`  ✓ ${student.studentId}: ${student.fullName}`)
  })

  console.log('\n🎉 HEM3903 student allocation update completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })