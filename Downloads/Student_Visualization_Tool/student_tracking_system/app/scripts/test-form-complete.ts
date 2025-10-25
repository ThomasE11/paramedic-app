#!/usr/bin/env tsx

import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:3003';
const OUTPUT_DIR = path.join(process.cwd(), 'test-output', 'form-test');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function main() {
  console.log('\n🚀 AUTOMATED SITE VISIT FORM TEST\n');
  console.log('==================================================\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // Step 1: Login
    console.log('📝 Step 1: Logging in...');
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.waitForLoadState('networkidle');

    await page.fill('input[type="email"]', 'elias@twetemo.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');

    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01-logged-in.png') });
    console.log('✅ Logged in successfully\n');

    // Step 2: Navigate to Classes
    console.log('📚 Step 2: Navigating to Classes page...');
    await page.goto(`${BASE_URL}/classes`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '02-classes-page.png'), fullPage: true });
    console.log('✅ Classes page loaded\n');

    // Step 3: Click Site Visits Tab
    console.log('🏥 Step 3: Clicking Site Visits tab...');

    // Wait for tabs to be visible
    await page.waitForSelector('[role="tablist"]', { timeout: 10000 });

    // Find and click Site Visits tab
    const tabs = await page.locator('[role="tab"]').all();
    console.log(`Found ${tabs.length} tabs`);

    let siteVisitsTabFound = false;
    for (const tab of tabs) {
      const text = await tab.textContent();
      console.log(`Tab text: "${text}"`);
      if (text?.includes('Site Visits')) {
        await tab.click();
        siteVisitsTabFound = true;
        console.log('✅ Clicked Site Visits tab');
        break;
      }
    }

    if (!siteVisitsTabFound) {
      throw new Error('Site Visits tab not found!');
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '03-site-visits-tab.png'), fullPage: true });
    console.log('✅ Site Visits tab active\n');

    // Step 4: Check for "No records" or "New Record" button
    console.log('🔍 Step 4: Checking page state...');

    const pageContent = await page.textContent('body');
    console.log('Page contains "No records":', pageContent?.includes('No records'));
    console.log('Page contains "No students":', pageContent?.includes('No students'));

    // Look for New Record button
    const newRecordButton = page.locator('button:has-text("New Record")');
    const buttonCount = await newRecordButton.count();
    console.log(`New Record buttons found: ${buttonCount}\n`);

    if (buttonCount === 0) {
      console.log('❌ ERROR: No "New Record" button found!');
      await page.screenshot({ path: path.join(OUTPUT_DIR, '04-ERROR-no-button.png'), fullPage: true });

      // Debug: Show what's on the page
      const html = await page.content();
      fs.writeFileSync(path.join(OUTPUT_DIR, 'page-html.txt'), html);
      console.log('📄 Page HTML saved to page-html.txt');

      throw new Error('New Record button not found - check if Site Visits tab is implemented');
    }

    // Step 5: Click New Record
    console.log('➕ Step 5: Clicking New Record button...');
    await newRecordButton.first().click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05-dialog-opened.png'), fullPage: true });
    console.log('✅ Dialog opened\n');

    // Step 6: Check for student dropdown
    console.log('👤 Step 6: Looking for student selection...');

    const dialogContent = await page.textContent('[role="dialog"]');
    console.log('Dialog contains "No students":', dialogContent?.includes('No students'));
    console.log('Dialog contains "Select a student":', dialogContent?.includes('Select a student'));

    // Look for combobox
    const combobox = page.locator('[role="combobox"]');
    const comboboxCount = await combobox.count();
    console.log(`Comboboxes found: ${comboboxCount}`);

    if (comboboxCount === 0) {
      console.log('❌ ERROR: No student dropdown found!');
      await page.screenshot({ path: path.join(OUTPUT_DIR, '06-ERROR-no-dropdown.png'), fullPage: true });

      if (dialogContent?.includes('No students')) {
        console.log('\n⚠️  Issue: Dialog shows "No students found"');
        console.log('This means students are not being loaded from the API.');
      }

      throw new Error('Student dropdown not found');
    }

    // Step 7: Select student
    console.log('\n👤 Step 7: Selecting student...');
    await combobox.first().click();
    await page.waitForTimeout(1000);

    // Wait for options
    await page.waitForSelector('[role="option"]', { timeout: 5000 });

    const options = await page.locator('[role="option"]').all();
    console.log(`Found ${options.length} student options`);

    if (options.length === 0) {
      console.log('❌ ERROR: No students in dropdown!');
      await page.screenshot({ path: path.join(OUTPUT_DIR, '07-ERROR-no-students.png'), fullPage: true });
      throw new Error('No students available in dropdown');
    }

    const firstStudent = await options[0].textContent();
    console.log(`Selecting: ${firstStudent}`);
    await options[0].click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '08-student-selected.png'), fullPage: true });
    console.log('✅ Student selected\n');

    // Step 8: Fill form
    console.log('📝 Step 8: Filling form fields...');

    await page.fill('input[name="discussionDate"]', '2025-10-24');
    await page.fill('input[name="discussionTime"]', '14:30');
    await page.fill('input[name="companyNameLocation"]', 'Sheikh Shakhbout Medical City');
    await page.fill('input[name="conductorName"]', 'Dr. Sarah Johnson');

    // Check HCT Mentor
    await page.check('input[value="HCT Mentor"]');

    await page.screenshot({ path: path.join(OUTPUT_DIR, '09-basic-info.png'), fullPage: true });
    console.log('✅ Basic info filled\n');

    // Step 9: Fill text areas
    console.log('💬 Step 9: Filling discussion details...');

    await page.fill('textarea[name="peoplePresent"]', 'Student, Supervisor, Mentor');
    await page.fill('textarea[name="discussedTopics"]', 'Patient care, Emergency procedures');
    await page.fill('textarea[name="followUpAttendance"]', 'Perfect attendance - 5 sessions');
    await page.fill('textarea[name="interestingCases"]', 'Trauma case with excellent outcomes');
    await page.fill('textarea[name="sa2Discussion"]', 'Student well prepared for assessment');

    await page.screenshot({ path: path.join(OUTPUT_DIR, '10-textareas-filled.png'), fullPage: true });
    console.log('✅ Discussion details filled\n');

    // Step 10: Attendance
    console.log('📅 Step 10: Setting attendance...');
    await page.check('input[name="attendanceRecorded"]');
    await page.fill('input[name="attendanceSessions"]', '5');
    console.log('✅ Attendance set\n');

    // Step 11: Skills
    console.log('🎯 Step 11: Marking skills...');
    const skills = ['bloodPressure', 'temperature', 'respiratoryRate', 'heartRate', 'ecg'];
    for (const skill of skills) {
      await page.check(`input[name="skillsCompleted.${skill}"]`);
    }
    await page.screenshot({ path: path.join(OUTPUT_DIR, '11-skills-checked.png'), fullPage: true });
    console.log(`✅ Checked ${skills.length} skills\n`);

    // Step 12: Signatures
    console.log('✍️  Step 12: Adding signatures...');

    const canvases = await page.locator('canvas').all();
    console.log(`Found ${canvases.length} canvas elements`);

    // Conductor signature
    const canvas1 = await canvases[0].boundingBox();
    if (canvas1) {
      await page.mouse.move(canvas1.x + 50, canvas1.y + 50);
      await page.mouse.down();
      await page.mouse.move(canvas1.x + 200, canvas1.y + 70);
      await page.mouse.up();
    }

    // Student signature
    const canvas2 = await canvases[1].boundingBox();
    if (canvas2) {
      await page.mouse.move(canvas2.x + 60, canvas2.y + 60);
      await page.mouse.down();
      await page.mouse.move(canvas2.x + 220, canvas2.y + 80);
      await page.mouse.up();
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, '12-signatures-added.png'), fullPage: true });
    console.log('✅ Signatures added\n');

    // Step 13: Save
    console.log('💾 Step 13: Saving record...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const saveButton = page.locator('button:has-text("Save Record")');

    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/record-of-discussion'),
      { timeout: 10000 }
    );

    await saveButton.click();
    const response = await responsePromise;
    const data = await response.json();

    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '13-record-saved.png'), fullPage: true });
    console.log('✅ Record saved! ID:', data.id, '\n');

    // Step 14: Download PDF
    console.log('📄 Step 14: Generating PDF...');

    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Generate PDF")');
    const download = await downloadPromise;

    const pdfPath = path.join(OUTPUT_DIR, await download.suggestedFilename());
    await download.saveAs(pdfPath);

    const stats = fs.statSync(pdfPath);
    console.log('✅ PDF downloaded!');
    console.log(`   File: ${await download.suggestedFilename()}`);
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB\n`);

    // Step 15: Close and verify
    console.log('📋 Step 15: Verifying record list...');
    await page.click('button:has-text("Cancel")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '14-final-list.png'), fullPage: true });

    const recordCards = await page.locator('.space-y-4 > div').count();
    console.log(`✅ Records in list: ${recordCards}\n`);

    // Success!
    console.log('\n==================================================');
    console.log('✅ TEST COMPLETED SUCCESSFULLY!');
    console.log('==================================================\n');
    console.log('Summary:');
    console.log(`  ✅ Login: Success`);
    console.log(`  ✅ Navigation: Success`);
    console.log(`  ✅ Form Fill: Complete`);
    console.log(`  ✅ Database Save: ${data.id}`);
    console.log(`  ✅ PDF Download: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`  ✅ Records Listed: ${recordCards}`);
    console.log(`\n📁 Output: ${OUTPUT_DIR}\n`);

    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'ERROR.png'), fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

main();
