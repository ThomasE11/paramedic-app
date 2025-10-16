import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * COMPREHENSIVE AI SYSTEM ROBUSTNESS TEST
 * 
 * This script tests the AI assistant's ability to:
 * 1. Understand complex multi-step tasks
 * 2. Execute actions across ALL system components
 * 3. Interact with students, modules, assignments, attendance, notes, emails
 * 4. Handle cross-component operations
 * 5. Maintain context and execute intelligently
 */

interface TestCase {
  name: string;
  description: string;
  command: string;
  expectedActions: string[];
  complexity: 'simple' | 'medium' | 'complex' | 'advanced';
  componentsInvolved: string[];
}

const TEST_CASES: TestCase[] = [
  // SIMPLE TESTS - Single component operations
  {
    name: 'Single Student Note Addition',
    description: 'Add a note to a specific student',
    command: 'Add a note to student H00441453 saying they need to improve attendance',
    expectedActions: ['UPDATE_STUDENT_NOTE'],
    complexity: 'simple',
    componentsInvolved: ['students', 'notes']
  },
  {
    name: 'Single Student Email',
    description: 'Send email to one student',
    command: 'Email student H00542178 to come see me at 2 PM today',
    expectedActions: ['SEND_EMAIL', 'UPDATE_STUDENT_NOTE'],
    complexity: 'simple',
    componentsInvolved: ['students', 'emails', 'notes']
  },
  
  // MEDIUM TESTS - Multi-component operations
  {
    name: 'Module-Wide Communication',
    description: 'Email all students in a module',
    command: 'Email all HEM3923 students about the exam tomorrow at 9 AM in room 204',
    expectedActions: ['SEND_EMAIL'],
    complexity: 'medium',
    componentsInvolved: ['modules', 'students', 'emails']
  },
  {
    name: 'Attendance Update with Notification',
    description: 'Update attendance and notify student',
    command: 'Mark student H00459031 as absent for today and send them a reminder email',
    expectedActions: ['MARK_ATTENDANCE', 'SEND_EMAIL', 'UPDATE_STUDENT_NOTE'],
    complexity: 'medium',
    componentsInvolved: ['attendance', 'students', 'emails', 'notes']
  },
  
  // COMPLEX TESTS - Cross-system operations
  {
    name: 'At-Risk Student Intervention',
    description: 'Identify struggling students and take action',
    command: 'Find all students with attendance below 75% and send them a support email',
    expectedActions: ['ANALYZE_STUDENTS', 'IDENTIFY_AT_RISK', 'SEND_EMAIL', 'AUTO_ADD_NOTES'],
    complexity: 'complex',
    componentsInvolved: ['students', 'attendance', 'analytics', 'emails', 'notes']
  },
  {
    name: 'Assignment Creation with Rubric',
    description: 'Create assignment and notify students',
    command: 'Create a new case study assignment for AEM230 due next Friday and email all students about it',
    expectedActions: ['CREATE_ASSIGNMENT', 'SEND_EMAIL'],
    complexity: 'complex',
    componentsInvolved: ['assignments', 'modules', 'students', 'emails']
  },
  
  // ADVANCED TESTS - Multi-step intelligent operations
  {
    name: 'Comprehensive Student Support Workflow',
    description: 'Multi-step intervention for struggling student',
    command: 'Student H00473436 is struggling - check their attendance, add a support note, schedule a meeting, and email them',
    expectedActions: ['SEARCH', 'ANALYZE_STUDENTS', 'UPDATE_STUDENT_NOTE', 'SEND_EMAIL'],
    complexity: 'advanced',
    componentsInvolved: ['students', 'attendance', 'notes', 'emails', 'analytics']
  },
  {
    name: 'Module Performance Analysis and Action',
    description: 'Analyze module and take corrective actions',
    command: 'Analyze HEM2903 module performance, identify students who need help, and send personalized support emails',
    expectedActions: ['ANALYZE_STUDENTS', 'GENERATE_INSIGHTS', 'IDENTIFY_AT_RISK', 'SEND_EMAIL', 'AUTO_ADD_NOTES'],
    complexity: 'advanced',
    componentsInvolved: ['modules', 'students', 'analytics', 'emails', 'notes', 'attendance', 'grades']
  },
  {
    name: 'Batch Student Update with Notifications',
    description: 'Update multiple students and notify them',
    command: 'Update all AEM230 students attendance to 90% and send them congratulations emails',
    expectedActions: ['BATCH_UPDATE', 'UPDATE_ATTENDANCE', 'SEND_EMAIL'],
    complexity: 'advanced',
    componentsInvolved: ['students', 'modules', 'attendance', 'emails']
  },
  {
    name: 'Cross-Module Research Project Assignment',
    description: 'Assign research projects and create module activities',
    command: 'Add all research project assignments to HEM2903 module activities and notify students',
    expectedActions: ['ADD_MODULE_PROJECT_ACTIVITIES', 'SEND_EMAIL'],
    complexity: 'advanced',
    componentsInvolved: ['modules', 'activities', 'students', 'emails', 'projects']
  }
];

async function testAISystemRobustness() {
  console.log('🤖 COMPREHENSIVE AI SYSTEM ROBUSTNESS TEST\n');
  console.log('='.repeat(80));
  console.log('\n📋 Testing AI Assistant\'s ability to handle complex tasks');
  console.log('🎯 Goal: Verify AI can interact with ALL system components');
  console.log('🔧 Components: Students, Modules, Assignments, Attendance, Notes, Emails, Analytics\n');
  console.log('='.repeat(80));

  try {
    // Get system overview
    const [students, modules, assignments, classSessions] = await Promise.all([
      prisma.student.count(),
      prisma.module.count(),
      prisma.assignment.count(),
      prisma.classSession.count()
    ]);

    console.log('\n📊 SYSTEM OVERVIEW:');
    console.log(`   Students: ${students}`);
    console.log(`   Modules: ${modules}`);
    console.log(`   Assignments: ${assignments}`);
    console.log(`   Class Sessions: ${classSessions}`);

    console.log('\n\n' + '='.repeat(80));
    console.log('🧪 RUNNING TEST CASES');
    console.log('='.repeat(80));

    const results = {
      total: TEST_CASES.length,
      passed: 0,
      failed: 0,
      byComplexity: {
        simple: { total: 0, passed: 0 },
        medium: { total: 0, passed: 0 },
        complex: { total: 0, passed: 0 },
        advanced: { total: 0, passed: 0 }
      },
      details: [] as any[]
    };

    for (let i = 0; i < TEST_CASES.length; i++) {
      const testCase = TEST_CASES[i];
      
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`TEST ${i + 1}/${TEST_CASES.length}: ${testCase.name}`);
      console.log('─'.repeat(80));
      console.log(`Complexity: ${testCase.complexity.toUpperCase()}`);
      console.log(`Description: ${testCase.description}`);
      console.log(`Components: ${testCase.componentsInvolved.join(', ')}`);
      console.log(`\nCommand: "${testCase.command}"`);
      console.log(`\nExpected Actions: ${testCase.expectedActions.join(', ')}`);

      try {
        // Call AI assistant API
        console.log('\n🤖 Sending to AI Assistant...');
        
        const response = await fetch('http://localhost:3000/api/ai-assistant/educational', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            command: testCase.command,
            mode: 'case_study',
            actionMode: true
          }),
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const aiResponse = await response.json();

        // Analyze response
        const understood = aiResponse.understood !== false;
        const hasActions = aiResponse.actions && aiResponse.actions.length > 0;
        const actionTypes = hasActions ? aiResponse.actions.map((a: any) => a.type) : [];
        
        console.log(`\n📋 AI Response:`);
        console.log(`   Understood: ${understood ? '✅ YES' : '❌ NO'}`);
        console.log(`   Actions Generated: ${hasActions ? `✅ ${actionTypes.length}` : '❌ 0'}`);
        
        if (hasActions) {
          console.log(`   Action Types: ${actionTypes.join(', ')}`);
        }

        // Check if expected actions are present
        const expectedActionsFound = testCase.expectedActions.filter(expected =>
          actionTypes.includes(expected)
        );

        const success = understood && hasActions && expectedActionsFound.length > 0;

        if (success) {
          console.log(`\n✅ TEST PASSED`);
          console.log(`   Found ${expectedActionsFound.length}/${testCase.expectedActions.length} expected actions`);
          results.passed++;
          results.byComplexity[testCase.complexity].passed++;
        } else {
          console.log(`\n❌ TEST FAILED`);
          if (!understood) console.log(`   Reason: AI did not understand the command`);
          if (!hasActions) console.log(`   Reason: No actions generated`);
          if (expectedActionsFound.length === 0) console.log(`   Reason: Expected actions not found`);
          results.failed++;
        }

        results.byComplexity[testCase.complexity].total++;
        results.details.push({
          test: testCase.name,
          complexity: testCase.complexity,
          success,
          understood,
          actionsGenerated: actionTypes.length,
          expectedActionsFound: expectedActionsFound.length,
          totalExpected: testCase.expectedActions.length
        });

      } catch (error: any) {
        console.log(`\n❌ TEST FAILED - Error: ${error.message}`);
        results.failed++;
        results.byComplexity[testCase.complexity].total++;
        results.details.push({
          test: testCase.name,
          complexity: testCase.complexity,
          success: false,
          error: error.message
        });
      }

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Final Report
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 FINAL TEST REPORT');
    console.log('='.repeat(80));

    const successRate = (results.passed / results.total) * 100;

    console.log(`\n✅ Tests Passed: ${results.passed}/${results.total} (${successRate.toFixed(1)}%)`);
    console.log(`❌ Tests Failed: ${results.failed}/${results.total}`);

    console.log(`\n📈 Results by Complexity:`);
    Object.entries(results.byComplexity).forEach(([complexity, stats]) => {
      if (stats.total > 0) {
        const rate = (stats.passed / stats.total) * 100;
        console.log(`   ${complexity.toUpperCase()}: ${stats.passed}/${stats.total} (${rate.toFixed(1)}%)`);
      }
    });

    console.log(`\n\n💡 ROBUSTNESS ASSESSMENT:`);
    if (successRate >= 90) {
      console.log(`   ✅ EXCELLENT - AI system is highly robust and can handle complex tasks`);
    } else if (successRate >= 75) {
      console.log(`   ✅ GOOD - AI system is robust with minor improvements needed`);
    } else if (successRate >= 60) {
      console.log(`   ⚠️  FAIR - AI system needs improvements for complex tasks`);
    } else {
      console.log(`   ❌ POOR - AI system requires significant enhancements`);
    }

    console.log(`\n📋 Component Coverage:`);
    const allComponents = new Set(TEST_CASES.flatMap(tc => tc.componentsInvolved));
    console.log(`   Total Components Tested: ${allComponents.size}`);
    console.log(`   Components: ${Array.from(allComponents).join(', ')}`);

    console.log(`\n\n✅ TEST SUITE COMPLETED`);

  } catch (error) {
    console.error('\n❌ Fatal Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAISystemRobustness().catch(console.error);

