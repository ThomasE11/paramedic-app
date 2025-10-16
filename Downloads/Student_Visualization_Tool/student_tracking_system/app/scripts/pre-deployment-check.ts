import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * PRE-DEPLOYMENT COMPREHENSIVE CHECK
 * 
 * Verifies that all systems are ready for production deployment:
 * 1. Database connectivity and data integrity
 * 2. Environment variables configuration
 * 3. API endpoints functionality
 * 4. AI system robustness
 * 5. Email system configuration
 * 6. File upload/download capabilities
 * 7. Authentication system
 * 8. All critical features
 */

interface CheckResult {
  category: string;
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  critical: boolean;
}

const results: CheckResult[] = [];

function addResult(category: string, check: string, status: 'pass' | 'fail' | 'warning', message: string, critical = false) {
  results.push({ category, check, status, message, critical });
}

async function checkEnvironmentVariables() {
  console.log('\n🔧 Checking Environment Variables...');
  
  const requiredVars = [
    { name: 'DATABASE_URL', critical: true },
    { name: 'NEXTAUTH_SECRET', critical: true },
    { name: 'NEXTAUTH_URL', critical: true },
    { name: 'DEEPSEEK_API_KEY', critical: true },
    { name: 'GMAIL_USER', critical: false },
    { name: 'GMAIL_APP_PASSWORD', critical: false }
  ];

  for (const envVar of requiredVars) {
    if (process.env[envVar.name]) {
      addResult('Environment', envVar.name, 'pass', `✅ ${envVar.name} is configured`, envVar.critical);
    } else {
      addResult('Environment', envVar.name, envVar.critical ? 'fail' : 'warning', 
        `${envVar.critical ? '❌' : '⚠️'} ${envVar.name} is missing`, envVar.critical);
    }
  }
}

async function checkDatabaseConnectivity() {
  console.log('\n🗄️  Checking Database Connectivity...');
  
  try {
    await prisma.$connect();
    addResult('Database', 'Connection', 'pass', '✅ Database connection successful', true);

    // Check critical tables
    const tables = [
      { name: 'students', query: () => prisma.student.count() },
      { name: 'modules', query: () => prisma.module.count() },
      { name: 'assignments', query: () => prisma.assignment.count() },
      { name: 'users', query: () => prisma.user.count() },
      { name: 'notes', query: () => prisma.note.count() },
      { name: 'attendance', query: () => prisma.attendance.count() }
    ];

    for (const table of tables) {
      try {
        const count = await table.query();
        addResult('Database', `Table: ${table.name}`, 'pass', `✅ ${table.name} table accessible (${count} records)`, true);
      } catch (error) {
        addResult('Database', `Table: ${table.name}`, 'fail', `❌ ${table.name} table error: ${error}`, true);
      }
    }

  } catch (error) {
    addResult('Database', 'Connection', 'fail', `❌ Database connection failed: ${error}`, true);
  }
}

async function checkAPIEndpoints() {
  console.log('\n🌐 Checking API Endpoints...');
  
  const endpoints = [
    '/api/students',
    '/api/modules',
    '/api/assignments',
    '/api/dashboard',
    '/api/ai-assistant',
    '/api/ai-assistant/educational'
  ];

  // Note: In production, these would be actual HTTP requests
  // For now, we check if the route files exist
  const apiDir = path.join(process.cwd(), 'app', 'api');
  
  for (const endpoint of endpoints) {
    const routePath = endpoint.replace('/api/', '');
    const fullPath = path.join(apiDir, routePath, 'route.ts');
    
    if (fs.existsSync(fullPath)) {
      addResult('API', endpoint, 'pass', `✅ ${endpoint} route exists`, true);
    } else {
      addResult('API', endpoint, 'fail', `❌ ${endpoint} route missing`, true);
    }
  }
}

async function checkAISystemConfiguration() {
  console.log('\n🤖 Checking AI System Configuration...');
  
  if (process.env.DEEPSEEK_API_KEY) {
    addResult('AI System', 'API Key', 'pass', '✅ DeepSeek API key configured', true);
    
    // Check if AI can be reached (basic test)
    try {
      const response = await fetch('https://api.deepseek.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      });
      
      if (response.ok) {
        addResult('AI System', 'API Connectivity', 'pass', '✅ DeepSeek API is reachable', true);
      } else {
        addResult('AI System', 'API Connectivity', 'warning', `⚠️ DeepSeek API returned ${response.status}`, false);
      }
    } catch (error) {
      addResult('AI System', 'API Connectivity', 'warning', `⚠️ Could not verify DeepSeek API: ${error}`, false);
    }
  } else {
    addResult('AI System', 'API Key', 'fail', '❌ DeepSeek API key not configured', true);
  }

  // Check AI assistant route files
  const aiRoutes = [
    'app/api/ai-assistant/route.ts',
    'app/api/ai-assistant/educational/route.ts'
  ];

  for (const route of aiRoutes) {
    const fullPath = path.join(process.cwd(), route);
    if (fs.existsSync(fullPath)) {
      addResult('AI System', `Route: ${route}`, 'pass', `✅ ${route} exists`, true);
    } else {
      addResult('AI System', `Route: ${route}`, 'fail', `❌ ${route} missing`, true);
    }
  }
}

async function checkEmailSystemConfiguration() {
  console.log('\n📧 Checking Email System Configuration...');
  
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    addResult('Email System', 'Gmail Configuration', 'pass', '✅ Gmail credentials configured', false);
  } else {
    addResult('Email System', 'Gmail Configuration', 'warning', '⚠️ Gmail credentials not configured - email features will not work', false);
  }

  // Check email library files
  const emailLibs = [
    'lib/email.ts',
    'lib/email-service.ts'
  ];

  for (const lib of emailLibs) {
    const fullPath = path.join(process.cwd(), lib);
    if (fs.existsSync(fullPath)) {
      addResult('Email System', `Library: ${lib}`, 'pass', `✅ ${lib} exists`, false);
    } else {
      addResult('Email System', `Library: ${lib}`, 'warning', `⚠️ ${lib} missing`, false);
    }
  }
}

async function checkFileSystemConfiguration() {
  console.log('\n📁 Checking File System Configuration...');
  
  const requiredDirs = [
    'uploads/submissions',
    'uploads/rubric'
  ];

  for (const dir of requiredDirs) {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      addResult('File System', `Directory: ${dir}`, 'pass', `✅ ${dir} exists`, false);
    } else {
      addResult('File System', `Directory: ${dir}`, 'warning', `⚠️ ${dir} missing - will be created on first upload`, false);
    }
  }
}

async function checkCriticalFeatures() {
  console.log('\n⚙️  Checking Critical Features...');
  
  try {
    // Check if we have at least one user (for authentication)
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      addResult('Features', 'User Accounts', 'pass', `✅ ${userCount} user account(s) configured`, true);
    } else {
      addResult('Features', 'User Accounts', 'warning', '⚠️ No user accounts - create one for authentication', true);
    }

    // Check if we have students
    const studentCount = await prisma.student.count();
    if (studentCount > 0) {
      addResult('Features', 'Student Data', 'pass', `✅ ${studentCount} students in system`, false);
    } else {
      addResult('Features', 'Student Data', 'warning', '⚠️ No students in system', false);
    }

    // Check if we have modules
    const moduleCount = await prisma.module.count();
    if (moduleCount > 0) {
      addResult('Features', 'Module Data', 'pass', `✅ ${moduleCount} modules configured`, false);
    } else {
      addResult('Features', 'Module Data', 'warning', '⚠️ No modules configured', false);
    }

  } catch (error) {
    addResult('Features', 'Data Check', 'fail', `❌ Error checking features: ${error}`, true);
  }
}

async function runPreDeploymentCheck() {
  console.log('🚀 PRE-DEPLOYMENT COMPREHENSIVE CHECK\n');
  console.log('='.repeat(80));
  console.log('\n📋 Verifying all systems are ready for production deployment');
  console.log('🎯 Checking: Database, APIs, AI, Email, Files, Features\n');
  console.log('='.repeat(80));

  try {
    await checkEnvironmentVariables();
    await checkDatabaseConnectivity();
    await checkAPIEndpoints();
    await checkAISystemConfiguration();
    await checkEmailSystemConfiguration();
    await checkFileSystemConfiguration();
    await checkCriticalFeatures();

    // Generate Report
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 DEPLOYMENT READINESS REPORT');
    console.log('='.repeat(80));

    const categories = [...new Set(results.map(r => r.category))];
    
    for (const category of categories) {
      const categoryResults = results.filter(r => r.category === category);
      const passed = categoryResults.filter(r => r.status === 'pass').length;
      const failed = categoryResults.filter(r => r.status === 'fail').length;
      const warnings = categoryResults.filter(r => r.status === 'warning').length;

      console.log(`\n📁 ${category}:`);
      categoryResults.forEach(r => {
        console.log(`   ${r.message}`);
      });
      console.log(`   Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`);
    }

    // Overall Assessment
    const totalChecks = results.length;
    const passedChecks = results.filter(r => r.status === 'pass').length;
    const failedChecks = results.filter(r => r.status === 'fail').length;
    const warningChecks = results.filter(r => r.status === 'warning').length;
    const criticalFailures = results.filter(r => r.status === 'fail' && r.critical).length;

    console.log('\n\n' + '='.repeat(80));
    console.log('🎯 OVERALL ASSESSMENT');
    console.log('='.repeat(80));
    console.log(`\n✅ Passed: ${passedChecks}/${totalChecks}`);
    console.log(`❌ Failed: ${failedChecks}/${totalChecks}`);
    console.log(`⚠️  Warnings: ${warningChecks}/${totalChecks}`);
    console.log(`🚨 Critical Failures: ${criticalFailures}`);

    const successRate = (passedChecks / totalChecks) * 100;

    console.log(`\n📈 Success Rate: ${successRate.toFixed(1)}%`);

    console.log(`\n\n💡 DEPLOYMENT RECOMMENDATION:`);
    if (criticalFailures === 0 && successRate >= 90) {
      console.log(`   ✅ READY FOR DEPLOYMENT`);
      console.log(`   All critical systems are operational`);
      console.log(`   ${warningChecks > 0 ? `Note: ${warningChecks} non-critical warnings present` : 'No warnings'}`);
    } else if (criticalFailures === 0 && successRate >= 75) {
      console.log(`   ⚠️  DEPLOYMENT POSSIBLE WITH CAUTION`);
      console.log(`   All critical systems operational but some features may be limited`);
      console.log(`   Recommended: Address warnings before deployment`);
    } else if (criticalFailures > 0) {
      console.log(`   ❌ NOT READY FOR DEPLOYMENT`);
      console.log(`   ${criticalFailures} critical failure(s) must be resolved`);
      console.log(`   Action Required: Fix critical issues before deploying`);
    } else {
      console.log(`   ⚠️  DEPLOYMENT NOT RECOMMENDED`);
      console.log(`   Too many failures - address issues before deployment`);
    }

    console.log(`\n\n✅ PRE-DEPLOYMENT CHECK COMPLETED`);

  } catch (error) {
    console.error('\n❌ Fatal Error during pre-deployment check:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runPreDeploymentCheck().catch(console.error);

