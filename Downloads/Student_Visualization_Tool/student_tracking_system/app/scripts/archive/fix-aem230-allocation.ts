import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Correct student list for AEM230 - Apply Clinical Practicum 1 Amb (2025.10_15116)
// Combined from both screenshots - first screenshot shows items 1-25, second shows items 26-32
const AEM230_STUDENTS = [
  // From first screenshot (items 1-25)
  {
    studentId: 'h00599984',
    firstName: 'Dheyab',
    lastName: 'Abdallah Ali Saif Almazrui',
    fullName: 'Dheyab Abdallah Ali Saif Almazrui',
    email: 'H00599984@hct.ac.ae'
  },
  {
    studentId: 'h00566881',
    firstName: 'Ali',
    lastName: 'Abdulla Ali Sulaiman Alameri',
    fullName: 'Ali Abdulla Ali Sulaiman Alameri',
    email: 'H00566881@hct.ac.ae'
  },
  {
    studentId: 'h00546028',
    firstName: 'Mohammed',
    lastName: 'Abdulla Mohammed Binreed Abubousi',
    fullName: 'Mohammed Abdulla Mohammed Binreed Abubousi',
    email: 'H00546028@hct.ac.ae'
  },
  {
    studentId: 'h00594180',
    firstName: 'Shamna',
    lastName: 'Ahmed Eid Obaid Alketbi',
    fullName: 'Shamna Ahmed Eid Obaid Alketbi',
    email: 'H00594180@hct.ac.ae'
  },
  {
    studentId: 'h00601791',
    firstName: 'Maitha',
    lastName: 'Ali Mubarak Mohammed Alshamsi',
    fullName: 'Maitha Ali Mubarak Mohammed Alshamsi',
    email: 'H00601791@hct.ac.ae'
  },
  {
    studentId: 'h00605422',
    firstName: 'Shamsa',
    lastName: 'Fahed Yousef Abdulla Alsaawafi',
    fullName: 'Shamsa Fahed Yousef Abdulla Alsaawafi',
    email: 'H00605422@hct.ac.ae'
  },
  {
    studentId: 'h00601770',
    firstName: 'Shouq',
    lastName: 'Hamad Obaid Hamad Alshamsi',
    fullName: 'Shouq Hamad Obaid Hamad Alshamsi',
    email: 'H00601770@hct.ac.ae'
  },
  {
    studentId: 'h00594101',
    firstName: 'Mohammed',
    lastName: 'Hamed Mohammed Alharsusi',
    fullName: 'Mohammed Hamed Mohammed Alharsusi',
    email: 'H00594101@hct.ac.ae'
  },
  {
    studentId: 'h00609157',
    firstName: 'Mohammed',
    lastName: 'Khalifa Abdulla Hareb Aldhaheri',
    fullName: 'Mohammed Khalifa Abdulla Hareb Aldhaheri',
    email: 'H00609157@hct.ac.ae'
  },
  {
    studentId: 'h00600102',
    firstName: 'Sultan',
    lastName: 'Khulaf Ali Mohammed Alhajeri',
    fullName: 'Sultan Khulaf Ali Mohammed Alhajeri',
    email: 'H00600102@hct.ac.ae'
  },
  {
    studentId: 'h00601777',
    firstName: 'Mahra',
    lastName: 'Mohammed Abdulla Khamis Alshamsi',
    fullName: 'Mahra Mohammed Abdulla Khamis Alshamsi',
    email: 'H00601777@hct.ac.ae'
  },
  {
    studentId: 'h00600088',
    firstName: 'Abdulla',
    lastName: 'Mohammed Abdulrahman Saeed Almeqbaali',
    fullName: 'Abdulla Mohammed Abdulrahman Saeed Almeqbaali',
    email: 'H00600088@hct.ac.ae'
  },
  {
    studentId: 'h00542166',
    firstName: 'Saeed',
    lastName: 'Mohammed Ali Rashed Almeqbaali',
    fullName: 'Saeed Mohammed Ali Rashed Almeqbaali',
    email: 'H00542166@hct.ac.ae'
  },
  {
    studentId: 'h00601746',
    firstName: 'Mariam',
    lastName: 'Mohammed Ateeq Altheeb Alshamsi',
    fullName: 'Mariam Mohammed Ateeq Altheeb Alshamsi',
    email: 'H00601746@hct.ac.ae'
  },
  {
    studentId: 'h00571107',
    firstName: 'Naji',
    lastName: 'Mohammed Bujair Salem Alameri',
    fullName: 'Naji Mohammed Bujair Salem Alameri',
    email: 'H00571107@hct.ac.ae'
  },
  {
    studentId: 'h00594069',
    firstName: 'Mariam',
    lastName: 'Mohammed Khalfan Saeed Alshamsi',
    fullName: 'Mariam Mohammed Khalfan Saeed Alshamsi',
    email: 'H00594069@hct.ac.ae'
  },
  {
    studentId: 'h00541639',
    firstName: 'Shahad',
    lastName: 'Mohammed Khamis Juma Alshamsi',
    fullName: 'Shahad Mohammed Khamis Juma Alshamsi',
    email: 'H00541639@hct.ac.ae'
  },
  {
    studentId: 'h00530541',
    firstName: 'Ahmed',
    lastName: 'Mohammed Khamis Saeed Ayalyaaes',
    fullName: 'Ahmed Mohammed Khamis Saeed Ayalyaaes',
    email: 'H00530541@hct.ac.ae'
  },
  {
    studentId: 'h00601771',
    firstName: 'Meera',
    lastName: 'Mohammed Rashed Khalifa Alkaabi',
    fullName: 'Meera Mohammed Rashed Khalifa Alkaabi',
    email: 'H00601771@hct.ac.ae'
  },
  {
    studentId: 'h00594158',
    firstName: 'Mariam',
    lastName: 'Mohammed Saif Alabed Alnaimi',
    fullName: 'Mariam Mohammed Saif Alabed Alnaimi',
    email: 'H00594158@hct.ac.ae'
  },
  {
    studentId: 'h00594033',
    firstName: 'Ghalya',
    lastName: 'Nasser Abdulrahman Nasser Al Ahbabi',
    fullName: 'Ghalya Nasser Abdulrahman Nasser Al Ahbabi',
    email: 'H00594033@hct.ac.ae'
  },
  {
    studentId: 'h00502212',
    firstName: 'Theyab',
    lastName: 'Obaid Ahmed Obaid Albaai',
    fullName: 'Theyab Obaid Ahmed Obaid Albaai',
    email: 'H00502212@hct.ac.ae'
  },
  {
    studentId: 'h00601795',
    firstName: 'Mariam',
    lastName: 'Obaid Hareb Obaid Alkaabi',
    fullName: 'Mariam Obaid Hareb Obaid Alkaabi',
    email: 'H00601795@hct.ac.ae'
  },
  {
    studentId: 'h00601780',
    firstName: 'Afra',
    lastName: 'Saeed Khaseb Rashed Alneyadi',
    fullName: 'Afra Saeed Khaseb Rashed Alneyadi',
    email: 'H00601780@hct.ac.ae'
  },
  {
    studentId: 'h00593951',
    firstName: 'Mahra',
    lastName: 'Saif Mohammed Yehal Aldhaheri',
    fullName: 'Mahra Saif Mohammed Yehal Aldhaheri',
    email: 'H00593951@hct.ac.ae'
  },
  // From second screenshot (items 26-32)
  {
    studentId: 'h00530550',
    firstName: 'Sultan',
    lastName: 'Salem Ali Ali Ajnebi',
    fullName: 'Sultan Salem Ali Ali Ajnebi',
    email: 'H00530550@hct.ac.ae'
  },
  {
    studentId: 'h00594076',
    firstName: 'Alanoud',
    lastName: 'Salem Saeed Shenan Alnuaimi',
    fullName: 'Alanoud Salem Saeed Shenan Alnuaimi',
    email: 'H00594076@hct.ac.ae'
  },
  {
    studentId: 'h00602802',
    firstName: 'Mohammed',
    lastName: 'Salim Abdallah Humaid Alomani',
    fullName: 'Mohammed Salim Abdallah Humaid Alomani',
    email: 'H00602802@hct.ac.ae'
  },
  {
    studentId: 'h00594105',
    firstName: 'Hamad',
    lastName: 'Salim Hamad Matar Alnaimi',
    fullName: 'Hamad Salim Hamad Matar Alnaimi',
    email: 'H00594105@hct.ac.ae'
  },
  {
    studentId: 'h00600056',
    firstName: 'Rania',
    lastName: 'Salim Khamis Khalfan Ayalyaaes',
    fullName: 'Rania Salim Khamis Khalfan Ayalyaaes',
    email: 'H00600056@hct.ac.ae'
  },
  {
    studentId: 'h00604014',
    firstName: 'Latifa',
    lastName: 'Yousef Sultan Abdulla Aldhaheri',
    fullName: 'Latifa Yousef Sultan Abdulla Aldhaheri',
    email: 'H00604014@hct.ac.ae'
  }
]

async function main() {
  console.log('🔍 Checking current database state for AEM230...')

  // Check if AEM230 module exists
  let aem230Module = await prisma.module.findUnique({
    where: { code: 'AEM230' },
    include: { students: true }
  })

  if (!aem230Module) {
    console.log('📝 Creating AEM230 module...')
    aem230Module = await prisma.module.create({
      data: {
        code: 'AEM230',
        name: 'Apply Clinical Practicum 1 Amb',
        description: 'AEM 230 - Apply Clinical Practicum 1 Amb (2025.10_15116)',
        totalCredits: 3
      },
      include: { students: true }
    })
  }

  console.log(`📊 Current students in AEM230: ${aem230Module.students.length}`)
  aem230Module.students.forEach(student => {
    console.log(`  - ${student.studentId}: ${student.fullName}`)
  })

  console.log('\n🎯 Target students for AEM230:')
  console.log(`Total target students: ${AEM230_STUDENTS.length}`)
  AEM230_STUDENTS.forEach((student, index) => {
    console.log(`  ${index + 1}. ${student.studentId}: ${student.fullName}`)
  })

  // Create or update students and assign them to AEM230
  console.log('\n🔄 Processing student allocations...')

  for (const studentData of AEM230_STUDENTS) {
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
            moduleId: aem230Module.id
          }
        })
      } else {
        // Update existing student to assign to AEM230
        console.log(`🔄 Updating student: ${studentData.studentId}`)
        student = await prisma.student.update({
          where: { studentId: studentData.studentId },
          data: {
            ...studentData,
            moduleId: aem230Module.id
          }
        })
      }

      console.log(`✅ ${student.studentId} assigned to AEM230`)
    } catch (error) {
      console.error(`❌ Error processing ${studentData.studentId}:`, error)
    }
  }

  // Remove any students that shouldn't be in AEM230
  const targetStudentIds = AEM230_STUDENTS.map(s => s.studentId)
  const currentStudents = await prisma.student.findMany({
    where: { moduleId: aem230Module.id }
  })

  for (const student of currentStudents) {
    if (!targetStudentIds.includes(student.studentId)) {
      console.log(`🗑️ Removing ${student.studentId} from AEM230`)
      await prisma.student.update({
        where: { id: student.id },
        data: { moduleId: null }
      })
    }
  }

  // Final verification
  console.log('\n✅ Final verification:')
  const updatedModule = await prisma.module.findUnique({
    where: { code: 'AEM230' },
    include: { students: true }
  })

  console.log(`📊 Students now in AEM230: ${updatedModule?.students.length}`)
  updatedModule?.students.forEach((student, index) => {
    console.log(`  ${index + 1}. ✓ ${student.studentId}: ${student.fullName}`)
  })

  console.log('\n🎉 AEM230 student allocation update completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })