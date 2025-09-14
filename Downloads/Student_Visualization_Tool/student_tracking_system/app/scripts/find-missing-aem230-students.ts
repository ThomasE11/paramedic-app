import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Finding missing AEM230 students...');
    
    // Missing student IDs from screenshots
    const missingIds = ['H00541639', 'H00524101'];
    
    // Expected names from screenshots
    const expectedStudents = [
      { id: 'H00541639', name: 'Shahad Mohammed Khamis Juma Alshamsi' },
      { id: 'H00524101', name: 'Mohammed Hamad Mohammed Alkhsousi' }
    ];
    
    console.log('\n🔍 Searching for missing students by name...');
    
    for (const expected of expectedStudents) {
      console.log(`\n🔍 Looking for: ${expected.name} (${expected.id})`);
      
      // Search by partial name match
      const nameWords = expected.name.split(' ');
      const firstName = nameWords[0];
      const lastName = nameWords[nameWords.length - 1];
      
      // Try different search patterns
      const searchPatterns = [
        expected.name, // Full name
        `${firstName}%${lastName}`, // First and last name
        `%${firstName}%`, // Just first name
        `%${lastName}%`, // Just last name
      ];
      
      for (const pattern of searchPatterns) {
        const students = await prisma.student.findMany({
          where: {
            fullName: {
              contains: pattern.replace('%', ''),
              mode: 'insensitive'
            }
          },
          select: { id: true, fullName: true, studentId: true, moduleId: true }
        });
        
        if (students.length > 0) {
          console.log(`   Found ${students.length} matches for pattern "${pattern}":`);
          students.forEach(student => {
            const moduleStatus = student.moduleId ? 'assigned' : 'unassigned';
            console.log(`     - ${student.fullName} (${student.studentId}) [${moduleStatus}]`);
          });
          break; // Stop searching once we find matches
        }
      }
    }
    
    // Also check for unassigned students that might be these missing ones
    console.log('\n🔍 Checking unassigned students...');
    const unassignedStudents = await prisma.student.findMany({
      where: { moduleId: null },
      select: { id: true, fullName: true, studentId: true },
      orderBy: { fullName: 'asc' }
    });
    
    console.log(`Found ${unassignedStudents.length} unassigned students:`);
    unassignedStudents.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.fullName} (${student.studentId})`);
    });
    
    // Check if any unassigned students match our expected names
    console.log('\n🔍 Checking if any unassigned students match expected names...');
    for (const expected of expectedStudents) {
      const nameWords = expected.name.toLowerCase().split(' ');
      const firstName = nameWords[0];
      const lastName = nameWords[nameWords.length - 1];
      
      const possibleMatches = unassignedStudents.filter(student => {
        const studentNameLower = student.fullName.toLowerCase();
        return studentNameLower.includes(firstName) && studentNameLower.includes(lastName);
      });
      
      if (possibleMatches.length > 0) {
        console.log(`   Possible matches for ${expected.name}:`);
        possibleMatches.forEach(match => {
          console.log(`     - ${match.fullName} (${match.studentId})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error finding missing students:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
