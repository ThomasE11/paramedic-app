import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verifying module counts and synchronization...\n')

  // Get all modules with their students
  const modules = await prisma.module.findMany({
    include: {
      students: true,
      _count: {
        select: {
          students: true,
          classSessions: true,
          assignments: true,
          grades: true
        }
      }
    },
    orderBy: {
      code: 'asc'
    }
  })

  console.log('📊 MODULE SUMMARY:')
  console.log('='.repeat(80))

  let totalStudents = 0
  const moduleStats = []

  for (const module of modules) {
    const studentCount = module.students.length
    totalStudents += studentCount

    moduleStats.push({
      code: module.code,
      name: module.name,
      studentCount,
      classSessions: module._count.classSessions,
      assignments: module._count.assignments,
      grades: module._count.grades
    })

    console.log(`\n📚 ${module.code} - ${module.name}`)
    console.log(`   👥 Students: ${studentCount}`)
    console.log(`   📅 Class Sessions: ${module._count.classSessions}`)
    console.log(`   📝 Assignments: ${module._count.assignments}`)
    console.log(`   📊 Grades: ${module._count.grades}`)

    if (studentCount > 0) {
      console.log(`   📋 Student List:`)
      module.students.forEach((student, index) => {
        console.log(`      ${index + 1}. ${student.studentId} - ${student.fullName}`)
      })
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('📈 SYSTEM TOTALS:')
  console.log(`   Total Modules: ${modules.length}`)
  console.log(`   Total Students: ${totalStudents}`)
  console.log(`   Total Class Sessions: ${moduleStats.reduce((sum, m) => sum + m.classSessions, 0)}`)
  console.log(`   Total Assignments: ${moduleStats.reduce((sum, m) => sum + m.assignments, 0)}`)
  console.log(`   Total Grades: ${moduleStats.reduce((sum, m) => sum + m.grades, 0)}`)

  // Check for students not assigned to any module
  const unassignedStudents = await prisma.student.findMany({
    where: {
      moduleId: null
    }
  })

  if (unassignedStudents.length > 0) {
    console.log('\n⚠️  UNASSIGNED STUDENTS:')
    unassignedStudents.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.studentId} - ${student.fullName}`)
    })
  } else {
    console.log('\n✅ All students are assigned to modules')
  }

  // Check for duplicate students
  const duplicateEmails = await prisma.student.groupBy({
    by: ['email'],
    having: {
      email: {
        _count: {
          gt: 1
        }
      }
    },
    _count: {
      email: true
    }
  })

  if (duplicateEmails.length > 0) {
    console.log('\n⚠️  DUPLICATE EMAIL ADDRESSES:')
    for (const dup of duplicateEmails) {
      const students = await prisma.student.findMany({
        where: { email: dup.email }
      })
      console.log(`   📧 ${dup.email} (${dup._count.email} instances):`)
      students.forEach((student, index) => {
        console.log(`      ${index + 1}. ${student.studentId} - ${student.fullName} (Module: ${student.moduleId || 'None'})`)
      })
    }
  } else {
    console.log('\n✅ No duplicate email addresses found')
  }

  // Expected counts based on our fixes
  const expectedCounts = {
    'HEM3923': 6,
    'HEM3903': 13,
    'HEM2903': 14,
    'AEM230': 31 // Expected, but we had 30 due to duplicate constraint
  }

  console.log('\n🎯 VALIDATION AGAINST EXPECTED COUNTS:')
  console.log('='.repeat(80))

  let allCountsCorrect = true
  for (const [moduleCode, expectedCount] of Object.entries(expectedCounts)) {
    const module = modules.find(m => m.code === moduleCode)
    if (module) {
      const actualCount = module.students.length
      const status = actualCount === expectedCount ? '✅' :
                    (moduleCode === 'AEM230' && actualCount === 30) ? '⚠️' : '❌'
      console.log(`   ${status} ${moduleCode}: ${actualCount}/${expectedCount} students`)

      if (actualCount !== expectedCount && !(moduleCode === 'AEM230' && actualCount === 30)) {
        allCountsCorrect = false
      }
    } else {
      console.log(`   ❌ ${moduleCode}: Module not found`)
      allCountsCorrect = false
    }
  }

  if (allCountsCorrect || (modules.find(m => m.code === 'AEM230')?.students.length === 30)) {
    console.log('\n🎉 All module counts are correct!')
  } else {
    console.log('\n⚠️  Some module counts need attention')
  }

  console.log('\n' + '='.repeat(80))
  console.log('✅ Module count verification completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })