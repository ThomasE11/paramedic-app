import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning up duplicate student records...\n')

  // Find all unassigned students that are uppercase versions of assigned students
  const unassignedStudents = await prisma.student.findMany({
    where: {
      moduleId: null
    }
  })

  const assignedStudents = await prisma.student.findMany({
    where: {
      moduleId: {
        not: null
      }
    }
  })

  console.log(`Found ${unassignedStudents.length} unassigned students`)
  console.log(`Found ${assignedStudents.length} assigned students`)

  // Create a map of lowercase student IDs to assigned students
  const assignedStudentMap = new Map()
  assignedStudents.forEach(student => {
    assignedStudentMap.set(student.studentId.toLowerCase(), student)
  })

  let deletedCount = 0
  const studentsToDelete = []

  // Check each unassigned student to see if they have a lowercase counterpart
  for (const unassignedStudent of unassignedStudents) {
    const lowercaseId = unassignedStudent.studentId.toLowerCase()

    // If there's a lowercase version that's assigned, this is a duplicate
    if (assignedStudentMap.has(lowercaseId)) {
      const assignedCounterpart = assignedStudentMap.get(lowercaseId)

      console.log(`🗑️  Duplicate found:`)
      console.log(`    Unassigned: ${unassignedStudent.studentId} - ${unassignedStudent.fullName}`)
      console.log(`    Assigned:   ${assignedCounterpart.studentId} - ${assignedCounterpart.fullName}`)

      studentsToDelete.push(unassignedStudent.id)
      deletedCount++
    }
  }

  if (studentsToDelete.length > 0) {
    console.log(`\n🗑️  Deleting ${studentsToDelete.length} duplicate student records...`)

    // First, delete any related records
    await prisma.attendance.deleteMany({
      where: {
        studentId: {
          in: studentsToDelete
        }
      }
    })

    await prisma.grade.deleteMany({
      where: {
        studentId: {
          in: studentsToDelete
        }
      }
    })

    await prisma.note.deleteMany({
      where: {
        studentId: {
          in: studentsToDelete
        }
      }
    })

    await prisma.activity.deleteMany({
      where: {
        studentId: {
          in: studentsToDelete
        }
      }
    })

    await prisma.scheduleConflict.deleteMany({
      where: {
        studentId: {
          in: studentsToDelete
        }
      }
    })

    await prisma.schedule.deleteMany({
      where: {
        studentId: {
          in: studentsToDelete
        }
      }
    })

    await prisma.submission.deleteMany({
      where: {
        studentId: {
          in: studentsToDelete
        }
      }
    })

    await prisma.studentProgress.deleteMany({
      where: {
        studentId: {
          in: studentsToDelete
        }
      }
    })

    // Now delete the student records
    const deleteResult = await prisma.student.deleteMany({
      where: {
        id: {
          in: studentsToDelete
        }
      }
    })

    console.log(`✅ Deleted ${deleteResult.count} duplicate student records`)
  } else {
    console.log('✅ No duplicate student records found to delete')
  }

  // Verify final counts
  console.log('\n📊 Final verification:')
  const finalModules = await prisma.module.findMany({
    include: {
      _count: {
        select: {
          students: true
        }
      }
    },
    orderBy: {
      code: 'asc'
    }
  })

  finalModules.forEach(module => {
    console.log(`   ${module.code}: ${module._count.students} students`)
  })

  const totalStudentsAfter = await prisma.student.count()
  const unassignedAfter = await prisma.student.count({
    where: {
      moduleId: null
    }
  })

  console.log(`\n📈 Final totals:`)
  console.log(`   Total students: ${totalStudentsAfter}`)
  console.log(`   Unassigned students: ${unassignedAfter}`)
  console.log(`   Assigned students: ${totalStudentsAfter - unassignedAfter}`)

  if (unassignedAfter === 0) {
    console.log('\n🎉 All students are now properly assigned to modules!')
  } else {
    console.log(`\n⚠️  Still have ${unassignedAfter} unassigned students`)
  }

  console.log('\n✅ Cleanup completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })