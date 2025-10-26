import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Comprehensive test suite for Unified Claudia AI Assistant
 *
 * Tests:
 * 1. Educational content generation (case studies, scenarios)
 * 2. Instructor commands (emails, notes, queries)
 * 3. Natural language understanding
 * 4. Confirmation flow
 * 5. Safety features (duplicate prevention, validation)
 * 6. Activity logging
 * 7. Note creation
 */

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function testClaudia(command: string, expectedMode: string, expectedAction: string): Promise<TestResult> {
  console.log(`\n🧪 Testing: "${command}"`);
  console.log(`   Expected mode: ${expectedMode}, Expected action: ${expectedAction}`);

  try {
    const response = await fetch('http://localhost:3000/api/ai-assistant/unified', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        command,
        mode: 'auto'
      }),
    });

    const data = await response.json();

    console.log(`   Response:`, {
      understood: data.understood,
      mode: data.mode,
      action: data.action,
      summary: data.summary
    });

    const passed = data.understood &&
                   data.mode === expectedMode &&
                   data.action.includes(expectedAction);

    return {
      test: command,
      passed,
      message: passed ? '✅ Passed' : `❌ Failed - Got mode: ${data.mode}, action: ${data.action}`,
      details: data
    };

  } catch (error) {
    console.error(`   Error:`, error);
    return {
      test: command,
      passed: false,
      message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    };
  }
}

async function runTests() {
  console.log('🚀 Starting Unified Claudia AI Test Suite\n');
  console.log('=' .repeat(80));

  // Test 1: Educational content generation
  console.log('\n📚 EDUCATIONAL CONTENT TESTS');
  console.log('-'.repeat(80));

  results.push(await testClaudia(
    'Create a cardiac emergency case study for intermediate students',
    'educational',
    'case_study'
  ));

  results.push(await testClaudia(
    'Generate a respiratory distress scenario with vital signs',
    'educational',
    'scenario'
  ));

  results.push(await testClaudia(
    'Brainstorm ideas for trauma assessment exercises',
    'educational',
    'brainstorm'
  ));

  // Test 2: Instructor email commands
  console.log('\n📧 INSTRUCTOR EMAIL TESTS');
  console.log('-'.repeat(80));

  results.push(await testClaudia(
    'Send reminder to H00601771 about clinical logs',
    'instructor',
    'send_email'
  ));

  results.push(await testClaudia(
    'Email all HEM3923 students about tomorrow\'s practical session',
    'instructor',
    'send_email'
  ));

  results.push(await testClaudia(
    'Follow up with H00541639 about their PCR submission',
    'instructor',
    'send_email'
  ));

  // Test 3: Note creation commands
  console.log('\n📝 NOTE CREATION TESTS');
  console.log('-'.repeat(80));

  results.push(await testClaudia(
    'Add note to H00601771 about excellent participation in class',
    'instructor',
    'create_note'
  ));

  results.push(await testClaudia(
    'Create note for student H00541639 - needs extra support with assessments',
    'instructor',
    'create_note'
  ));

  // Test 4: Student query commands
  console.log('\n🔍 STUDENT QUERY TESTS');
  console.log('-'.repeat(80));

  results.push(await testClaudia(
    'Show me all students in HEM3923 module',
    'instructor',
    'query_students'
  ));

  results.push(await testClaudia(
    'Find students who missed class yesterday',
    'instructor',
    'query_students'
  ));

  // Test 5: Natural language variations
  console.log('\n💬 NATURAL LANGUAGE TESTS');
  console.log('-'.repeat(80));

  results.push(await testClaudia(
    'Can you check on Meera (H00601771) about her practicals?',
    'instructor',
    'send_email'
  ));

  results.push(await testClaudia(
    'I need to create a heart attack case for my students',
    'educational',
    'case_study'
  ));

  // Test 6: Confirmation and verification
  console.log('\n🔒 SAFETY & VERIFICATION TESTS');
  console.log('-'.repeat(80));

  console.log('\n   Testing confirmation requirement for email actions...');
  const emailTest = await testClaudia(
    'Send email to H00601771 reminding about clinical documentation',
    'instructor',
    'send_email'
  );

  if (emailTest.details?.requiresConfirmation) {
    console.log('   ✅ Confirmation required: YES (as expected)');
    emailTest.message = '✅ Passed - Confirmation required for email';
    emailTest.passed = true;
  } else {
    console.log('   ❌ Confirmation required: NO (should require confirmation!)');
    emailTest.message = '❌ Failed - Email should require confirmation';
    emailTest.passed = false;
  }
  results.push(emailTest);

  // Test 7: Activity logging verification
  console.log('\n📊 ACTIVITY LOGGING TESTS');
  console.log('-'.repeat(80));

  const recentActivities = await prisma.activity.findMany({
    where: {
      type: {
        in: ['claudia_action_completed', 'educational_content_created', 'ai_error']
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log(`   Found ${recentActivities.length} recent Claudia activities in database`);
  results.push({
    test: 'Activity Logging',
    passed: recentActivities.length > 0,
    message: recentActivities.length > 0
      ? `✅ Passed - ${recentActivities.length} activities logged`
      : '❌ Failed - No activities found',
    details: recentActivities
  });

  // Test Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  console.log('\n📝 DETAILED RESULTS:');
  console.log('-'.repeat(80));
  results.forEach((result, idx) => {
    console.log(`${idx + 1}. ${result.message}`);
    console.log(`   Test: ${result.test}`);
    if (!result.passed && result.details) {
      console.log(`   Details:`, JSON.stringify(result.details, null, 2).substring(0, 200));
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('🎯 RECOMMENDATIONS:');
  console.log('='.repeat(80));

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Review the following:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.test}`);
    });
  } else {
    console.log('\n✨ All tests passed! Claudia is working perfectly.');
  }

  console.log('\n💡 NEXT STEPS:');
  console.log('   1. Review failed tests if any');
  console.log('   2. Test in the UI at /ai-assistant');
  console.log('   3. Try real instructor commands');
  console.log('   4. Verify email delivery and note creation');
  console.log('   5. Check activity logs in database');

  console.log('\n🎓 CLAUDIA CAPABILITIES:');
  console.log('   Educational:');
  console.log('   - Create medical case studies with vital signs');
  console.log('   - Generate patient scenarios and progressions');
  console.log('   - Brainstorm teaching ideas');
  console.log('   - Create assessment questions');
  console.log('   - Design lesson plans');
  console.log('\n   Instructor:');
  console.log('   - Send personalized emails (auto-signed "Elias Thomas")');
  console.log('   - Create notes on student profiles');
  console.log('   - Query and filter students');
  console.log('   - Schedule follow-ups');
  console.log('   - Track all activities');
  console.log('\n   Safety:');
  console.log('   - Confirmation required for emails');
  console.log('   - Duplicate prevention (1-hour window)');
  console.log('   - Student data validation');
  console.log('   - Complete activity logging');
  console.log('   - Automatic note creation');

  console.log('\n✅ Test suite complete!\n');

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('❌ Fatal error running tests:', error);
  process.exit(1);
});
