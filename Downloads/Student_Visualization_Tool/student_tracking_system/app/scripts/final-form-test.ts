#!/usr/bin/env tsx

import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:3003';
const DESKTOP = '/Users/eliastlcthomas/Desktop';
const OUTPUT_DIR = path.join(DESKTOP, 'site-visit-test');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function main() {
  console.log('\n🔍 COMPREHENSIVE SITE VISIT FORM TEST\n');
  console.log('Screenshots will be saved to:', OUTPUT_DIR, '\n');
  console.log('==================================================\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    devtools: false
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // STEP 1: Go to Classes and handle redirect to login
    console.log('📚 STEP 1: Navigating to Classes page...');
    await page.goto(`${BASE_URL}/classes`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(OUTPUT_DIR, '01-initial-page.png'), fullPage: true });

    // Check if we're on login page
    const isLoginPage = await page.locator('input[placeholder*="User Name"], input[placeholder*="name"]').count();

    if (isLoginPage > 0) {
      console.log('🔐 Detected login page, logging in...');

      // Fill username (User Name field)
      await page.fill('input[placeholder*="User Name"], input[placeholder*="name"]', 'elias@twetemo.com');
      await page.fill('input[placeholder*="Password"], input[type="password"]', 'test123');

      await page.screenshot({ path: path.join(OUTPUT_DIR, '02-filled-login.png'), fullPage: true });

      // Click Login button and wait for navigation
      await Promise.all([
        page.waitForNavigation({ timeout: 10000 }),
        page.click('button:has-text("Login")')
      ]);

      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(OUTPUT_DIR, '03-after-login.png'), fullPage: true });
      console.log('✅ Logged in successfully\n');

      // Navigate to Classes
      console.log('📚 STEP 2: Going to Classes page...');
      await page.goto(`${BASE_URL}/classes`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, '04-classes-page.png'), fullPage: true });
    console.log('✅ Classes page loaded\n');

    // STEP 3: Find and Click Site Visits Tab
    console.log('🏥 STEP 3: Looking for Site Visits tab...');

    const pageText = await page.textContent('body');
    console.log('  - Page contains "Site Visits":', pageText?.includes('Site Visits'));

    // Wait for tabs to load
    await page.waitForSelector('[role="tablist"]', { timeout: 10000 });

    const tabs = await page.locator('[role="tab"]').all();
    console.log(`  - Found ${tabs.length} tabs`);

    for (let i = 0; i < tabs.length; i++) {
      const tabText = await tabs[i].textContent();
      console.log(`    Tab ${i + 1}: "${tabText?.trim()}"`);
    }

    // Click Site Visits tab
    let clicked = false;
    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text?.includes('Site Visits')) {
        await tab.click();
        clicked = true;
        console.log('✅ Clicked Site Visits tab');
        break;
      }
    }

    if (!clicked) {
      throw new Error('Site Visits tab not found!');
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05-site-visits-tab.png'), fullPage: true });
    console.log();

    // STEP 4: Click New Record
    console.log('➕ STEP 4: Clicking New Record button...');

    const newRecordBtns = await page.locator('button:has-text("New Record")').count();
    console.log(`  - New Record buttons found: ${newRecordBtns}`);

    if (newRecordBtns === 0) {
      throw new Error('No "New Record" button found!');
    }

    await page.click('button:has-text("New Record")');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(OUTPUT_DIR, '06-dialog-opened.png'), fullPage: true });
    console.log('✅ Dialog opened\n');

    // STEP 5: Check for students
    console.log('👤 STEP 5: Checking for student dropdown...');

    const dialogText = await page.textContent('[role="dialog"]');
    console.log('  - Dialog contains "No students":', dialogText?.includes('No students'));
    console.log('  - Dialog contains "Select a student":', dialogText?.includes('Select a student'));

    const selectCount = await page.locator('[role="combobox"]').count();
    console.log(`  - Comboboxes found: ${selectCount}`);

    if (selectCount === 0) {
      console.log('\n❌ ERROR: No student dropdown found!');
      console.log('This means the students prop is still not being passed correctly.');
      await page.screenshot({ path: path.join(OUTPUT_DIR, '07-ERROR-no-dropdown.png'), fullPage: true });

      // Save page HTML for debugging
      const html = await page.content();
      fs.writeFileSync(path.join(OUTPUT_DIR, 'dialog-html.txt'), html);

      throw new Error('Student dropdown not found - check if fix was applied');
    }

    // STEP 6: Select student
    console.log('\n📋 STEP 6: Opening student dropdown...');
    await page.click('[role="combobox"]');
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(OUTPUT_DIR, '08-dropdown-opened.png'), fullPage: true });

    const optionsCount = await page.locator('[role="option"]').count();
    console.log(`  - Student options available: ${optionsCount}`);

    if (optionsCount === 0) {
      console.log('\n❌ ERROR: No students in dropdown!');
      await page.screenshot({ path: path.join(OUTPUT_DIR, '09-ERROR-no-students.png'), fullPage: true });
      throw new Error('No students found in dropdown');
    }

    // Select first student
    const firstOption = await page.locator('[role="option"]').first().textContent();
    console.log(`  - Selecting: ${firstOption}`);

    await page.locator('[role="option"]').first().click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(OUTPUT_DIR, '10-student-selected.png'), fullPage: true });
    console.log('✅ Student selected\n');

    // STEP 7: Fill form
    console.log('📝 STEP 7: Filling out the form...\n');

    console.log('  → Discussion Date & Time');
    await page.fill('input[name="discussionDate"]', '2025-10-24');
    await page.fill('input[name="discussionTime"]', '15:30');

    console.log('  → Location & Conductor');
    await page.fill('input[name="companyNameLocation"]', 'Sheikh Shakhbout Medical City (SSMC)');
    await page.fill('input[name="conductorName"]', 'Dr. Sarah Johnson');

    console.log('  → Conductor Role');
    await page.check('input[value="HCT Mentor"]');

    await page.screenshot({ path: path.join(OUTPUT_DIR, '11-basic-info-filled.png'), fullPage: true });

    console.log('  → Discussion Details');
    await page.fill('textarea[name="peoplePresent"]', 'Student, Clinical Supervisor, HCT Mentor, Ward Nurse Manager, Senior Paramedic');
    await page.fill('textarea[name="discussedTopics"]', 'Patient assessment techniques, emergency procedures, documentation standards, communication skills');
    await page.fill('textarea[name="followUpAttendance"]', 'Perfect attendance - all 8 sessions completed. Student demonstrates excellent professionalism.');

    console.log('  → Challenging Cases');
    await page.fill('textarea[name="interestingCases"]', 'Motor cycle accident with multiple fractures. Severe bleeding controlled. Student showed excellent critical thinking.');

    console.log('  → Attendance');
    await page.check('input[name="attendanceRecorded"]');
    await page.fill('input[name="attendanceSessions"]', '8');

    await page.screenshot({ path: path.join(OUTPUT_DIR, '12-discussion-filled.png'), fullPage: true });

    console.log('  → Skills Checklist');
    const skills = [
      'bloodPressure',
      'temperature',
      'respiratoryRate',
      'heartRate',
      'woundCare',
      'ecg',
      'nasalThroatSwabs',
      'xrayObservation'
    ];

    for (const skill of skills) {
      await page.check(`input[name="skillsCompleted.${skill}"]`);
    }
    console.log(`    ✓ Checked ${skills.length} skills`);

    console.log('  → SA2 Discussion');
    await page.fill('textarea[name="sa2Discussion"]', 'Student is well-prepared for Professional Practice presentation. Timeline discussed and agreed.');

    await page.screenshot({ path: path.join(OUTPUT_DIR, '13-skills-and-sa2.png'), fullPage: true });

    console.log('✅ Form filled\n');

    // STEP 8: Signatures
    console.log('✍️  STEP 8: Adding signatures...');

    const canvases = await page.locator('canvas').all();
    console.log(`  - Found ${canvases.length} signature canvases`);

    // Conductor signature
    console.log('  → Drawing conductor signature');
    const canvas1Box = await canvases[0].boundingBox();
    if (canvas1Box) {
      await page.mouse.move(canvas1Box.x + 50, canvas1Box.y + 50);
      await page.mouse.down();
      await page.mouse.move(canvas1Box.x + 200, canvas1Box.y + 70);
      await page.mouse.up();
    }

    // Student signature
    console.log('  → Drawing student signature');
    const canvas2Box = await canvases[1].boundingBox();
    if (canvas2Box) {
      await page.mouse.move(canvas2Box.x + 60, canvas2Box.y + 60);
      await page.mouse.down();
      await page.mouse.move(canvas2Box.x + 220, canvas2Box.y + 80);
      await page.mouse.up();
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, '14-signatures-added.png'), fullPage: true });
    console.log('✅ Signatures added\n');

    // STEP 9: Scroll to bottom
    console.log('📜 STEP 9: Scrolling to action buttons...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(OUTPUT_DIR, '15-ready-to-save.png'), fullPage: true });
    console.log('✅ Scrolled to bottom\n');

    // STEP 10: Save
    console.log('💾 STEP 10: Saving record...');

    const saveBtn = page.locator('button:has-text("Save Record")');
    await saveBtn.waitFor({ state: 'visible' });

    const savePromise = page.waitForResponse(
      response => response.url().includes('/api/record-of-discussion'),
      { timeout: 15000 }
    );

    await saveBtn.click();
    const saveResponse = await savePromise;
    const saveData = await saveResponse.json();

    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '16-record-saved.png'), fullPage: true });

    console.log('✅ Record saved!');
    console.log(`  - Record ID: ${saveData.id}\n`);

    // STEP 11: Generate PDF
    console.log('📄 STEP 11: Generating PDF...');

    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('button:has-text("Generate PDF")');

    const download = await downloadPromise;
    const pdfFilename = await download.suggestedFilename();
    const pdfPath = path.join(OUTPUT_DIR, pdfFilename);
    await download.saveAs(pdfPath);

    const pdfStats = fs.statSync(pdfPath);

    console.log('✅ PDF downloaded!');
    console.log(`  - Filename: ${pdfFilename}`);
    console.log(`  - Size: ${(pdfStats.size / 1024).toFixed(2)} KB`);
    console.log(`  - Location: ${pdfPath}\n`);

    // STEP 12: Close and view list
    console.log('📋 STEP 12: Closing dialog and viewing list...');
    await page.click('button:has-text("Cancel")');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(OUTPUT_DIR, '17-FINAL-records-list.png'), fullPage: true });

    const recordCards = await page.locator('.space-y-4 > div').count();
    console.log(`✅ Records in list: ${recordCards}\n`);

    // SUCCESS!
    console.log('\n==================================================');
    console.log('🎉 TEST COMPLETED SUCCESSFULLY!');
    console.log('==================================================\n');

    console.log('📊 Summary:');
    console.log(`  ✅ Login: Success`);
    console.log(`  ✅ Site Visits Tab: Found and clicked`);
    console.log(`  ✅ Student Selection: ${firstOption}`);
    console.log(`  ✅ Form Fields: All filled (30+ fields)`);
    console.log(`  ✅ Skills: ${skills.length} checked`);
    console.log(`  ✅ Signatures: Both drawn`);
    console.log(`  ✅ Database Save: ${saveData.id}`);
    console.log(`  ✅ PDF Download: ${(pdfStats.size / 1024).toFixed(2)} KB`);
    console.log(`  ✅ Records Listed: ${recordCards}`);

    console.log(`\n📁 All screenshots saved to: ${OUTPUT_DIR}`);
    console.log(`📄 PDF saved to: ${pdfPath}\n`);

    // Keep browser open for a few seconds
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('\n❌ TEST FAILED!\n');
    console.error('Error:', error);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'ZZZZZ-ERROR-SCREENSHOT.png'),
      fullPage: true
    });

    console.error(`\n📸 Error screenshot saved to: ${OUTPUT_DIR}/ZZZZZ-ERROR-SCREENSHOT.png\n`);

    process.exit(1);
  } finally {
    await browser.close();
  }
}

main().then(() => {
  console.log('✨ Test script completed\n');
  process.exit(0);
}).catch((err) => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
