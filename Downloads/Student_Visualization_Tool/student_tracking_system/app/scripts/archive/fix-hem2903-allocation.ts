import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Correct student list for HEM2903 - Ambulance Practicum I (2025.10_12598)
const HEM2903_STUDENTS = [
  {
    studentId: 'h00542198',
    firstName: 'Fatima',
    lastName: 'Abdulla Salem Abdulla Alkaabi',
    fullName: 'Fatima Abdulla Salem Abdulla Alkaabi',
    email: 'H00542198@hct.ac.ae'
  },
  {
    studentId: 'h00491399',
    firstName: 'Shamayel',
    lastName: 'Ahmed Nashr Alsaadi',
    fullName: 'Shamayel Ahmed Nashr Alsaadi',
    email: 'H00491399@hct.ac.ae'
  },
  {
    studentId: 'h00542939',
    firstName: 'Mohammed',
    lastName: 'Bader Nasser Abdulla Alblooshi',
    fullName: 'Mohammed Bader Nasser Abdulla Alblooshi',
    email: 'H00542939@hct.ac.ae'
  },
  {
    studentId: 'h00467407',
    firstName: 'Nahyan',
    lastName: 'Ibrahim Abdulla Ibrahim Alblooshi',
    fullName: 'Nahyan Ibrahim Abdulla Ibrahim Alblooshi',
    email: 'H00467407@hct.ac.ae'
  },
  {
    studentId: 'h00467469',
    firstName: 'Qmasha',
    lastName: 'Imad Wadee Mohammed Aldhaheri',
    fullName: 'Qmasha Imad Wadee Mohammed Aldhaheri',
    email: 'H00467469@hct.ac.ae'
  },
  {
    studentId: 'h00542183',
    firstName: 'Shama',
    lastName: 'Juma Saeed Juma Alkaabi',
    fullName: 'Shama Juma Saeed Juma Alkaabi',
    email: 'H00542183@hct.ac.ae'
  },
  {
    studentId: 'h00542199',
    firstName: 'Shahd',
    lastName: 'Khaled Ali Mohammed Alblooshi',
    fullName: 'Shahd Khaled Ali Mohammed Alblooshi',
    email: 'H00542199@hct.ac.ae'
  },
  {
    studentId: 'h00541555',
    firstName: 'Mahra',
    lastName: 'Khalifa Mohammed Khalifa Alghafli',
    fullName: 'Mahra Khalifa Mohammed Khalifa Alghafli',
    email: 'H00541555@hct.ac.ae'
  },
  {
    studentId: 'h00491386',
    firstName: 'Sana',
    lastName: 'Mohammed Nasser Gharib Al Ahbabi',
    fullName: 'Sana Mohammed Nasser Gharib Al Ahbabi',
    email: 'H00491386@hct.ac.ae'
  },
  {
    studentId: 'h00542172',
    firstName: 'Talal',
    lastName: 'Mohammed Yousef Abdulla Alblooshi',
    fullName: 'Talal Mohammed Yousef Abdulla Alblooshi',
    email: 'H00542172@hct.ac.ae'
  },
  {
    studentId: 'h00498340',
    firstName: 'Zayed',
    lastName: 'Mubarak Khamis Kharboush Almansoori',
    fullName: 'Zayed Mubarak Khamis Kharboush Almansoori',
    email: 'H00498340@hct.ac.ae'
  },
  {
    studentId: 'h00510900',
    firstName: 'Athba',
    lastName: 'Saeed Ali Abed Alaryani',
    fullName: 'Athba Saeed Ali Abed Alaryani',
    email: 'H00510900@hct.ac.ae'
  },
  {
    studentId: 'h00541559',
    firstName: 'Afra',
    lastName: 'Subaih Humaid Salem Al Manei',
    fullName: 'Afra Subaih Humaid Salem Al Manei',
    email: 'H00541559@hct.ac.ae'
  },
  {
    studentId: 'h00542178',
    firstName: 'Ahmed',
    lastName: 'Tareq Mohmed Ali Alhosani',
    fullName: 'Ahmed Tareq Mohmed Ali Alhosani',
    email: 'H00542178@hct.ac.ae'
  }
]

async function main() {
  console.log('🔍 Checking current database state for HEM2903...')

  // Check if HEM2903 module exists
  let hem2903Module = await prisma.module.findUnique({
    where: { code: 'HEM2903' },
    include: { students: true }
  })

  if (!hem2903Module) {
    console.log('📝 Creating HEM2903 module...')
    hem2903Module = await prisma.module.create({
      data: {
        code: 'HEM2903',
        name: 'Ambulance Practicum I',
        description: 'HEM 2903 - Ambulance Practicum I (2025.10_12598)',
        totalCredits: 3
      },
      include: { students: true }
    })
  }

  console.log(`📊 Current students in HEM2903: ${hem2903Module.students.length}`)
  hem2903Module.students.forEach(student => {
    console.log(`  - ${student.studentId}: ${student.fullName}`)
  })

  console.log('\n🎯 Target students for HEM2903:')
  HEM2903_STUDENTS.forEach(student => {
    console.log(`  - ${student.studentId}: ${student.fullName}`)
  })

  // Create or update students and assign them to HEM2903
  console.log('\n🔄 Processing student allocations...')

  for (const studentData of HEM2903_STUDENTS) {
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
            moduleId: hem2903Module.id
          }
        })
      } else {
        // Update existing student to assign to HEM2903
        console.log(`🔄 Updating student: ${studentData.studentId}`)
        student = await prisma.student.update({
          where: { studentId: studentData.studentId },
          data: {
            ...studentData,
            moduleId: hem2903Module.id
          }
        })
      }

      console.log(`✅ ${student.studentId} assigned to HEM2903`)
    } catch (error) {
      console.error(`❌ Error processing ${studentData.studentId}:`, error)
    }
  }

  // Remove any students that shouldn't be in HEM2903
  const targetStudentIds = HEM2903_STUDENTS.map(s => s.studentId)
  const currentStudents = await prisma.student.findMany({
    where: { moduleId: hem2903Module.id }
  })

  for (const student of currentStudents) {
    if (!targetStudentIds.includes(student.studentId)) {
      console.log(`🗑️ Removing ${student.studentId} from HEM2903`)
      await prisma.student.update({
        where: { id: student.id },
        data: { moduleId: null }
      })
    }
  }

  // Final verification
  console.log('\n✅ Final verification:')
  const updatedModule = await prisma.module.findUnique({
    where: { code: 'HEM2903' },
    include: { students: true }
  })

  console.log(`📊 Students now in HEM2903: ${updatedModule?.students.length}`)
  updatedModule?.students.forEach(student => {
    console.log(`  ✓ ${student.studentId}: ${student.fullName}`)
  })

  console.log('\n🎉 HEM2903 student allocation update completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })