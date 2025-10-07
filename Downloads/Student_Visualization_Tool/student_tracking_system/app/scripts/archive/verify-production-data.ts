import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Exact student lists from screenshots
const SCREENSHOT_DATA = {
  HEM3923: [
    'h00461337 - Alreem Ahmed Saif Mohammed Alameri - H00461337@hct.ac.ae',
    'h00461314 - Fatima Ali Saif Ahlan Almazrouei - H00461314@hct.ac.ae',
    'h00441453 - Abdulhamid Bashar Abdulla Hasan Alhaddad - H00441453@hct.ac.ae',
    'h00459151 - Aysha Helal Humaid Anad Alkaabi - H00459151@hct.ac.ae',
    'h00495808 - Elyazia Jumaa Ahmad Haji - H00495808@hct.ac.ae',
    'h00490995 - Mohammed Nasser Khamis Salem Aleissaee - H00490995@hct.ac.ae'
  ],
  HEM3903: [
    'h00467388 - Nahian Abdullah Ali Rashed Al Saadi - H00467388@hct.ac.ae',
    'h00491322 - Mahra Abdulla Saeed Bakhit Alshebi - H00491322@hct.ac.ae',
    'h00374079 - Abdulla Ahmed Hasan Rhaimdad Alblooshi - H00374079@hct.ac.ae',
    'h00459031 - Saeed Amer Salem Ahmed Alseiari - H00459031@hct.ac.ae',
    'h00396512 - Aziz Hamad Nasser Ali Al Ahbabi - H00396512@hct.ac.ae',
    'h00513261 - Yunis Maaruf - H00513261@hct.ac.ae',
    'h00473436 - Abdulla Mohamed Abdulla Obaid Alfarsi - H00473436@hct.ac.ae',
    'h00355387 - Musabbeh Mohammed Rashed Hamad Alhajeri - H00355387@hct.ac.ae',
    'h00322517 - Jassem Mujeeb Abdullatif Abdulnabi Alblooshi - H00322517@hct.ac.ae',
    'h00491239 - Sherina Obaid Ali Rashed Alghoor - H00491239@hct.ac.ae',
    'h00491089 - Bakhita Saeed Rashed Hedairem Alketbi - H00491089@hct.ac.ae',
    'h00491292 - Alanood Saif Jawaan Obaid Almansoori - H00491292@hct.ac.ae',
    'h00491415 - Shamsa Salem Musabbeh Ahmed Alkaabi - H00491415@hct.ac.ae'
  ],
  HEM2903: [
    'h00542198 - Fatima Abdulla Salem Abdulla Alkaabi - H00542198@hct.ac.ae',
    'h00491399 - Shamayel Ahmed Nashr Alsaadi - H00491399@hct.ac.ae',
    'h00542939 - Mohammed Bader Nasser Abdulla Alblooshi - H00542939@hct.ac.ae',
    'h00467407 - Nahyan Ibrahim Abdulla Ibrahim Alblooshi - H00467407@hct.ac.ae',
    'h00467469 - Qmasha Imad Wadee Mohammed Aldhaheri - H00467469@hct.ac.ae',
    'h00542183 - Shama Juma Saeed Juma Alkaabi - H00542183@hct.ac.ae',
    'h00542199 - Shahd Khaled Ali Mohammed Alblooshi - H00542199@hct.ac.ae',
    'h00541555 - Mahra Khalifa Mohammed Khalifa Alghafli - H00541555@hct.ac.ae',
    'h00491386 - Sana Mohammed Nasser Gharib Al Ahbabi - H00491386@hct.ac.ae',
    'h00542172 - Talal Mohammed Yousef Abdulla Alblooshi - H00542172@hct.ac.ae',
    'h00498340 - Zayed Mubarak Khamis Kharboush Almansoori - H00498340@hct.ac.ae',
    'h00510900 - Athba Saeed Ali Abed Alaryani - H00510900@hct.ac.ae',
    'h00541559 - Afra Subaih Humaid Salem Al Manei - H00541559@hct.ac.ae',
    'h00542178 - Ahmed Tareq Mohmed Ali Alhosani - H00542178@hct.ac.ae'
  ],
  AEM230: [
    // First screenshot (1-25)
    'h00599984 - Dheyab Abdallah Ali Saif Almazrui - H00599984@hct.ac.ae',
    'h00566881 - Ali Abdulla Ali Sulaiman Alameri - H00566881@hct.ac.ae',
    'h00546028 - Mohammed Abdulla Mohammed Binreed Abubousi - H00546028@hct.ac.ae',
    'h00594180 - Shamna Ahmed Eid Obaid Alketbi - H00594180@hct.ac.ae',
    'h00601791 - Maitha Ali Mubarak Mohammed Alshamsi - H00601791@hct.ac.ae',
    'h00605422 - Shamsa Fahed Yousef Abdulla Alsaawafi - H00605422@hct.ac.ae',
    'h00601770 - Shouq Hamad Obaid Hamad Alshamsi - H00601770@hct.ac.ae',
    'h00594101 - Mohammed Hamed Mohammed Alharsusi - H00594101@hct.ac.ae',
    'h00609157 - Mohammed Khalifa Abdulla Hareb Aldhaheri - H00609157@hct.ac.ae',
    'h00600102 - Sultan Khulaf Ali Mohammed Alhajeri - H00600102@hct.ac.ae',
    'h00601777 - Mahra Mohammed Abdulla Khamis Alshamsi - H00601777@hct.ac.ae',
    'h00600088 - Abdulla Mohammed Abdulrahman Saeed Almeqbaali - H00600088@hct.ac.ae',
    'h00542166 - Saeed Mohammed Ali Rashed Almeqbaali - H00542166@hct.ac.ae',
    'h00601746 - Mariam Mohammed Ateeq Altheeb Alshamsi - H00601746@hct.ac.ae',
    'h00571107 - Naji Mohammed Bujair Salem Alameri - H00571107@hct.ac.ae',
    'h00594069 - Mariam Mohammed Khalfan Saeed Alshamsi - H00594069@hct.ac.ae',
    'h00541639 - Shahad Mohammed Khamis Juma Alshamsi - H00541639@hct.ac.ae',
    'h00530541 - Ahmed Mohammed Khamis Saeed Ayalyaaes - H00530541@hct.ac.ae',
    'h00601771 - Meera Mohammed Rashed Khalifa Alkaabi - H00601771@hct.ac.ae',
    'h00594158 - Mariam Mohammed Saif Alabed Alnaimi - H00594158@hct.ac.ae',
    'h00594033 - Ghalya Nasser Abdulrahman Nasser Al Ahbabi - H00594033@hct.ac.ae',
    'h00502212 - Theyab Obaid Ahmed Obaid Albaai - H00502212@hct.ac.ae',
    'h00601795 - Mariam Obaid Hareb Obaid Alkaabi - H00601795@hct.ac.ae',
    'h00601780 - Afra Saeed Khaseb Rashed Alneyadi - H00601780@hct.ac.ae',
    'h00593951 - Mahra Saif Mohammed Yehal Aldhaheri - H00593951@hct.ac.ae',
    // Second screenshot (26-31)
    'h00530550 - Sultan Salem Ali Ali Ajnebi - H00530550@hct.ac.ae',
    'h00594076 - Alanoud Salem Saeed Shenan Alnuaimi - H00594076@hct.ac.ae',
    'h00602802 - Mohammed Salim Abdallah Humaid Alomani - H00602802@hct.ac.ae',
    'h00594105 - Hamad Salim Hamad Matar Alnaimi - H00594105@hct.ac.ae',
    'h00600056 - Rania Salim Khamis Khalfan Ayalyaaes - H00600056@hct.ac.ae',
    'h00604014 - Latifa Yousef Sultan Abdulla Aldhaheri - H00604014@hct.ac.ae'
  ]
}

function parseStudentLine(line: string) {
  const match = line.match(/^(\w+) - (.+) - (\S+@\S+)$/)
  if (!match) return null

  const [, studentId, fullName, email] = match
  const nameParts = fullName.split(' ')

  return {
    studentId: studentId.toLowerCase(),
    firstName: nameParts[0],
    lastName: nameParts.slice(1).join(' '),
    fullName,
    email
  }
}

async function main() {
  console.log('🔍 VERIFYING PRODUCTION DATA AGAINST SCREENSHOTS\n')

  // Parse all screenshot data
  const expectedStudents = new Map()
  let totalExpected = 0

  for (const [moduleCode, studentLines] of Object.entries(SCREENSHOT_DATA)) {
    console.log(`📸 ${moduleCode}: ${studentLines.length} students expected`)

    for (const line of studentLines) {
      const student = parseStudentLine(line)
      if (student) {
        expectedStudents.set(student.studentId, {
          ...student,
          expectedModule: moduleCode
        })
        totalExpected++
      }
    }
  }

  console.log(`\n📊 EXPECTED TOTALS FROM SCREENSHOTS:`)
  console.log(`   HEM3923: ${SCREENSHOT_DATA.HEM3923.length} students`)
  console.log(`   HEM3903: ${SCREENSHOT_DATA.HEM3903.length} students`)
  console.log(`   HEM2903: ${SCREENSHOT_DATA.HEM2903.length} students`)
  console.log(`   AEM230: ${SCREENSHOT_DATA.AEM230.length} students`)
  console.log(`   TOTAL EXPECTED: ${totalExpected} students`)

  // Check current database
  const modules = await prisma.module.findMany({
    include: {
      students: true
    },
    orderBy: { code: 'asc' }
  })

  console.log(`\n📊 CURRENT DATABASE:`)
  let totalCurrent = 0
  for (const module of modules) {
    console.log(`   ${module.code}: ${module.students.length} students`)
    totalCurrent += module.students.length
  }

  const unassigned = await prisma.student.count({
    where: { moduleId: null }
  })

  const totalStudents = await prisma.student.count()

  console.log(`   UNASSIGNED: ${unassigned} students`)
  console.log(`   TOTAL IN DATABASE: ${totalStudents} students`)

  // Find discrepancies
  console.log(`\n🔍 ANALYZING DISCREPANCIES:`)

  const currentStudents = await prisma.student.findMany({
    include: { module: true }
  })

  const currentStudentMap = new Map()
  currentStudents.forEach(s => {
    currentStudentMap.set(s.studentId, s)
  })

  // Students in screenshots but not in database
  const missingStudents = []
  for (const [studentId, expectedStudent] of expectedStudents.entries()) {
    if (!currentStudentMap.has(studentId)) {
      missingStudents.push(expectedStudent)
    }
  }

  // Students in database but not in screenshots
  const extraStudents = []
  for (const [studentId, currentStudent] of currentStudentMap.entries()) {
    if (!expectedStudents.has(studentId)) {
      extraStudents.push(currentStudent)
    }
  }

  // Students in wrong modules
  const wrongModuleStudents = []
  for (const [studentId, expectedStudent] of expectedStudents.entries()) {
    const currentStudent = currentStudentMap.get(studentId)
    if (currentStudent) {
      const currentModuleCode = currentStudent.module?.code
      if (currentModuleCode !== expectedStudent.expectedModule) {
        wrongModuleStudents.push({
          student: currentStudent,
          currentModule: currentModuleCode,
          expectedModule: expectedStudent.expectedModule
        })
      }
    }
  }

  console.log(`\n❌ MISSING STUDENTS (${missingStudents.length}):`)
  missingStudents.forEach(s => {
    console.log(`   ${s.studentId} - ${s.fullName} (should be in ${s.expectedModule})`)
  })

  console.log(`\n➕ EXTRA STUDENTS (${extraStudents.length}):`)
  extraStudents.forEach(s => {
    console.log(`   ${s.studentId} - ${s.fullName} (in ${s.module?.code || 'UNASSIGNED'}) - NOT IN SCREENSHOTS`)
  })

  console.log(`\n🔄 WRONG MODULE ASSIGNMENTS (${wrongModuleStudents.length}):`)
  wrongModuleStudents.forEach(w => {
    console.log(`   ${w.student.studentId} - ${w.student.fullName}`)
    console.log(`     Current: ${w.currentModule || 'UNASSIGNED'} → Expected: ${w.expectedModule}`)
  })

  console.log(`\n📋 SUMMARY:`)
  console.log(`   Expected total: ${totalExpected}`)
  console.log(`   Current total: ${totalStudents}`)
  console.log(`   Missing: ${missingStudents.length}`)
  console.log(`   Extra: ${extraStudents.length}`)
  console.log(`   Wrong modules: ${wrongModuleStudents.length}`)

  if (missingStudents.length === 0 && extraStudents.length === 0 && wrongModuleStudents.length === 0) {
    console.log(`\n✅ ALL DATA MATCHES SCREENSHOTS PERFECTLY!`)
  } else {
    console.log(`\n⚠️  DISCREPANCIES FOUND - NEEDS CORRECTION`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })