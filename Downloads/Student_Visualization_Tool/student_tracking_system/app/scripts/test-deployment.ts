#!/usr/bin/env npx tsx

/**
 * Deployment Testing Script
 * Tests AI functionality, database connectivity, and core features
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🔍 Testing database connectivity...');

  try {
    // Test basic connectivity
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Count records
    const [modules, students, locations, classes] = await Promise.all([
      prisma.module.count(),
      prisma.student.count(),
      prisma.location.count(),
      prisma.classSession.count()
    ]);

    console.log('📊 Database inventory:');
    console.log(`   - Modules: ${modules}`);
    console.log(`   - Students: ${students}`);
    console.log(`   - Locations: ${locations}`);
    console.log(`   - Class Sessions: ${classes}`);

    // Test specific queries
    const responderStudents = await prisma.student.count({
      where: {
        module: {
          code: 'HEM3923'
        }
      }
    });

    console.log(`   - HEM3923 Responder students: ${responderStudents}`);

    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}

async function testEnvironmentVariables() {
  console.log('🔍 Testing environment variables...');

  const requiredVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'GEMINI_API_KEY',
    'GMAIL_USER',
    'GMAIL_APP_PASSWORD'
  ];

  let allPresent = true;

  for (const varName of requiredVars) {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Present`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      allPresent = false;
    }
  }

  return allPresent;
}

async function testAIFunctionality() {
  console.log('🔍 Testing AI service configuration...');

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found');
      return false;
    }

    console.log('✅ AI API key is configured');

    // Test a simple API call
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Test connection. Respond with just "OK".'
          }]
        }],
        generationConfig: {
          maxOutputTokens: 10
        }
      })
    });

    if (response.ok) {
      console.log('✅ AI service connection successful');
      return true;
    } else {
      console.error('❌ AI service connection failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ AI service test failed:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting deployment tests...\n');

  const results = {
    database: await testDatabase(),
    environment: await testEnvironmentVariables(),
    ai: await testAIFunctionality()
  };

  console.log('\n📋 Test Results:');
  console.log(`   Database: ${results.database ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Environment: ${results.environment ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   AI Service: ${results.ai ? '✅ PASS' : '❌ FAIL'}`);

  const allPassed = Object.values(results).every(Boolean);

  if (allPassed) {
    console.log('\n🎉 All tests PASSED! Your deployment is ready to use.');
    console.log('\n🔗 Production URL: https://student-tracking-system-67ofuwrlk-thomase11s-projects.vercel.app');
    console.log('\n📝 Quick Test Instructions:');
    console.log('   1. Login to the system');
    console.log('   2. Try the AI assistant with: "Show me all responder students"');
    console.log('   3. Create a new class session');
    console.log('   4. Check the student list and attendance features');
  } else {
    console.log('\n❌ Some tests FAILED. Please check the issues above.');
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Test execution failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });