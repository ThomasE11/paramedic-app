#!/usr/bin/env tsx

/**
 * Manual Site Visit Form Test with Authentication
 * This test logs in first, then tests the complete Site Visit workflow
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3003';
const TEST_OUTPUT_DIR = path.join(process.cwd(), 'test-output', 'manual');

const DEMO_CREDENTIALS = {
  email: 'elias@twetemo.com',
  password: 'test123'
};

// Ensure output directory exists
if (!fs.existsSync(TEST_OUTPUT_DIR)) {
  fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
}

async function main() {
  console.log('\n🚀 Starting Manual Site Visit Form Test with Authentication\n');
  console.log('============================================================\n');

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Launch browser
    console.log('🌐 Launching browser...');
    browser = await chromium.launch({
      headless: false, // Visual mode so you can see it working
      slowMo: 300 // Slow down actions for visibility
    });

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    page = await context.newPage();

    // Step 1: Navigate to login page
    console.log('\n📝 Step 1: Navigating to login page...');
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Login page loaded');

    // Step 2: Fill in login credentials
    console.log('\n🔐 Step 2: Logging in with demo credentials...');
    await page.fill('input[name="email"]', DEMO_CREDENTIALS.email);
    await page.fill('input[name="password"]', DEMO_CREDENTIALS.password);

    // Take screenshot before login
    await page.screenshot({ path: path.join(TEST_OUTPUT_DIR, '01-login-page.png') });

    // Submit login form
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    console.log('✅ Login successful');

    // Wait for redirect to dashboard or classes
    await page.waitForTimeout(2000);

    // Step 3: Navigate to Classes page
    console.log('\n📚 Step 3: Navigating to Classes page...');
    await page.goto(`${BASE_URL}/classes`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot of classes page
    await page.screenshot({ path: path.join(TEST_OUTPUT_DIR, '02-classes-page.png'), fullPage: true });
    console.log('✅ Classes page loaded');

    // Step 4: Click Site Visits Tab
    console.log('\n🏥 Step 4: Clicking Site Visits tab...');
    const siteVisitsTab = page.locator('text=Site Visits').first();
    await siteVisitsTab.waitFor({ state: 'visible', timeout: 10000 });
    await siteVisitsTab.click();
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(TEST_OUTPUT_DIR, '03-site-visits-tab.png'), fullPage: true });
    console.log('✅ Site Visits tab active');

    // Step 5: Click New Record Button
    console.log('\n➕ Step 5: Opening new record dialog...');
    const newRecordButton = page.locator('button:has-text("New Record")').first();
    await newRecordButton.click();
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(TEST_OUTPUT_DIR, '04-new-record-dialog.png'), fullPage: true });
    console.log('✅ New record dialog opened');

    // Step 6: Select Student
    console.log('\n👤 Step 6: Selecting student...');
    const selectTrigger = page.locator('[role="combobox"]').first();
    await selectTrigger.click();
    await page.waitForTimeout(500);

    const firstOption = page.locator('[role="option"]').first();
    await firstOption.waitFor({ state: 'visible', timeout: 5000 });
    const studentName = await firstOption.textContent();
    await firstOption.click();
    await page.waitForTimeout(1000);

    console.log(`✅ Selected student: ${studentName}`);

    // Step 7: Fill Basic Information
    console.log('\n📋 Step 7: Filling basic information...');
    await page.fill('input[name="discussionDate"]', '2025-10-24');
    await page.fill('input[name="discussionTime"]', '14:30');
    await page.fill('input[name="companyNameLocation"]', 'Sheikh Shakhbout Medical City (SSMC)');
    await page.fill('input[name="conductorName"]', 'Dr. Sarah Johnson');

    // Select HCT Mentor role
    const mentorCheckbox = page.locator('input[value="HCT Mentor"]').first();
    await mentorCheckbox.check();

    await page.screenshot({ path: path.join(TEST_OUTPUT_DIR, '05-basic-info-filled.png'), fullPage: true });
    console.log('✅ Basic information filled');

    // Step 8: Fill Discussion Details
    console.log('\n💬 Step 8: Filling discussion details...');
    await page.fill('textarea[name="peoplePresent"]', 'Student, Clinical Supervisor, HCT Mentor, Ward Nurse Manager, Senior Paramedic');
    await page.fill('textarea[name="discussedTopics"]', 'Patient assessment techniques, emergency procedures, documentation standards, communication with patients and families, professional ethics');
    await page.fill('textarea[name="studentActions"]', 'Performed comprehensive patient assessments, documented care accurately, communicated effectively with multidisciplinary team');
    await page.fill('textarea[name="evidenceAvailable"]', 'Patient assessment forms, clinical documentation, supervisor observations, video recordings of procedures');

    await page.screenshot({ path: path.join(TEST_OUTPUT_DIR, '06-discussion-filled.png'), fullPage: true });
    console.log('✅ Discussion details filled');

    // Step 9: Fill Attendance Information
    console.log('\n📅 Step 9: Filling attendance information...');
    await page.fill('textarea[name="followUpAttendance"]', 'Perfect attendance record - all 8 sessions completed on time. Student demonstrates excellent punctuality and professional commitment.');
    await page.check('input[name="attendanceRecorded"]');
    await page.fill('input[name="attendanceSessions"]', '8');

    await page.screenshot({ path: path.join(TEST_OUTPUT_DIR, '07-attendance-filled.png'), fullPage: true });
    console.log('✅ Attendance information filled');

    // Step 10: Describe Challenging Cases
    console.log('\n🏥 Step 10: Adding challenging cases...');
    await page.fill('textarea[name="interestingCases"]', 'Complex trauma case: Motorcycle accident with multiple fractures and severe bleeding. Student demonstrated excellent critical thinking and patient communication skills under high-stress conditions. Successfully assisted in stabilization and transfer to trauma unit.');

    await page.screenshot({ path: path.join(TEST_OUTPUT_DIR, '08-cases-filled.png'), fullPage: true });
    console.log('✅ Challenging cases documented');

    // Step 11: Select Completed Skills
    console.log('\n🎯 Step 11: Marking completed skills...');
    const skills = [
      'bloodPressure',
      'temperature',
      'respiratoryRate',
      'heartRate',
      'woundCare',
      'sutures',
      'ecg',
      'nasalThroatSwabs',
      'xrayObservation',
      'lucasMechanicalDevice',
      'hgtRecording',
      'arterialBloodGases'
    ];

    for (const skill of skills) {
      await page.check(`input[name="skillsCompleted.${skill}"]`);
      await page.waitForTimeout(100);
    }

    await page.screenshot({ path: path.join(TEST_OUTPUT_DIR, '09-skills-checked.png'), fullPage: true });
    console.log(`✅ Checked ${skills.length} completed skills`);

    // Step 12: Add SA2 Discussion
    console.log('\n📝 Step 12: Adding SA2 assessment discussion...');
    await page.fill('textarea[name="sa2Discussion"]', 'Reviewed presentation requirements and video submission guidelines. Student has selected appropriate clinical scenario and is well-prepared for successful completion. Timeline discussed and agreed upon.');

    await page.screenshot({ path: path.join(TEST_OUTPUT_DIR, '10-sa2-filled.png'), fullPage: true });
    console.log('✅ SA2 discussion added');

    // Step 13: Add Conductor Signature
    console.log('\n✍️  Step 13: Adding conductor signature...');
    const conductorCanvas = page.locator('canvas').first();
    const conductorBox = await conductorCanvas.boundingBox();

    if (conductorBox) {
      // Draw a simple signature
      await page.mouse.move(conductorBox.x + 50, conductorBox.y + 60);
      await page.mouse.down();
      await page.mouse.move(conductorBox.x + 150, conductorBox.y + 40);
      await page.mouse.move(conductorBox.x + 250, conductorBox.y + 70);
      await page.mouse.up();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: path.join(TEST_OUTPUT_DIR, '11-conductor-signature.png'), fullPage: true });
    console.log('✅ Conductor signature added');

    // Step 14: Add Student Signature
    console.log('\n✍️  Step 14: Adding student signature...');
    const studentCanvas = page.locator('canvas').nth(1);
    const studentBox = await studentCanvas.boundingBox();

    if (studentBox) {
      // Draw a different signature
      await page.mouse.move(studentBox.x + 40, studentBox.y + 70);
      await page.mouse.down();
      await page.mouse.move(studentBox.x + 120, studentBox.y + 50);
      await page.mouse.move(studentBox.x + 200, studentBox.y + 80);
      await page.mouse.move(studentBox.x + 280, studentBox.y + 60);
      await page.mouse.up();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: path.join(TEST_OUTPUT_DIR, '12-both-signatures.png'), fullPage: true });
    console.log('✅ Student signature added');

    // Step 15: Scroll to buttons
    console.log('\n📜 Step 15: Scrolling to action buttons...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(TEST_OUTPUT_DIR, '13-ready-to-save.png'), fullPage: true });
    console.log('✅ Scrolled to buttons');

    // Step 16: Save Record
    console.log('\n💾 Step 16: Saving record to database...');
    const saveButton = page.locator('button:has-text("Save Record")').first();

    // Listen for API response
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/record-of-discussion') && response.request().method() === 'POST',
      { timeout: 10000 }
    );

    await saveButton.click();
    const response = await responsePromise;
    const responseData = await response.json();

    await page.waitForTimeout(2000);

    console.log('✅ Record saved successfully!');
    console.log(`📝 Record ID: ${responseData.id}`);

    await page.screenshot({ path: path.join(TEST_OUTPUT_DIR, '14-record-saved.png'), fullPage: true });

    // Step 17: Generate PDF
    console.log('\n📄 Step 17: Generating and downloading PDF...');
    const downloadPromise = page.waitForEvent('download');
    const pdfButton = page.locator('button:has-text("Generate PDF")').first();
    await pdfButton.click();

    const download = await downloadPromise;
    const downloadPath = path.join(TEST_OUTPUT_DIR, await download.suggestedFilename());
    await download.saveAs(downloadPath);

    const stats = fs.statSync(downloadPath);

    console.log('✅ PDF downloaded successfully!');
    console.log(`📦 File: ${await download.suggestedFilename()}`);
    console.log(`📏 Size: ${(stats.size / 1024).toFixed(2)} KB`);

    // Step 18: Close dialog and view record list
    console.log('\n📋 Step 18: Viewing records list...');
    const cancelButton = page.locator('button:has-text("Cancel")').first();
    await cancelButton.click();
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(TEST_OUTPUT_DIR, '15-records-list-final.png'), fullPage: true });

    const recordCount = await page.locator('.space-y-4 > div').count();
    console.log(`✅ Records list showing ${recordCount} record(s)`);

    // Success summary
    console.log('\n\n============================================================');
    console.log('✅ TEST COMPLETED SUCCESSFULLY!');
    console.log('============================================================\n');

    console.log('📊 Test Summary:');
    console.log(`   ✅ Login: Success`);
    console.log(`   ✅ Navigation: Success`);
    console.log(`   ✅ Form Fill: Complete (30+ fields)`);
    console.log(`   ✅ Skills Checked: ${skills.length} skills`);
    console.log(`   ✅ Signatures: Both added`);
    console.log(`   ✅ Database Save: Success (ID: ${responseData.id})`);
    console.log(`   ✅ PDF Download: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`\n📁 Screenshots saved to: ${TEST_OUTPUT_DIR}`);
    console.log(`📄 PDF saved to: ${downloadPath}\n`);

    // Keep browser open for 5 seconds to see the final state
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (page) {
      await page.screenshot({ path: path.join(TEST_OUTPUT_DIR, 'error-screenshot.png'), fullPage: true });
    }
    throw error;
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

main()
  .then(() => {
    console.log('🎉 All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });
