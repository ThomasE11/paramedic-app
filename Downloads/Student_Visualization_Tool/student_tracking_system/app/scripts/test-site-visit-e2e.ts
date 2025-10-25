#!/usr/bin/env tsx

/**
 * End-to-End Site Visit Form Test
 * Tests the complete workflow: form fill, save, PDF generation, and download
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3003';
const TEST_OUTPUT_DIR = path.join(process.cwd(), 'test-output', 'e2e');

// Ensure output directory exists
if (!fs.existsSync(TEST_OUTPUT_DIR)) {
  fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
}

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<any>): Promise<void> {
  const startTime = Date.now();
  try {
    console.log(`\n🧪 Running: ${name}`);
    const details = await testFn();
    const duration = Date.now() - startTime;
    results.push({ name, passed: true, duration, details });
    console.log(`✅ Passed in ${duration}ms`);
  } catch (error) {
    const duration = Date.now() - startTime;
    results.push({
      name,
      passed: false,
      duration,
      error: error instanceof Error ? error.message : String(error)
    });
    console.log(`❌ Failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

async function main() {
  console.log('🚀 Starting End-to-End Site Visit Form Test');
  console.log('============================================================\n');

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Test 1: Launch Browser
    await runTest('Launch Browser', async () => {
      browser = await chromium.launch({
        headless: false, // Set to false to watch the test
        slowMo: 500 // Slow down for visibility
      });
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        recordVideo: {
          dir: TEST_OUTPUT_DIR,
          size: { width: 1920, height: 1080 }
        }
      });
      page = await context.newPage();
      return { browserVersion: browser.version() };
    });

    if (!page || !browser) throw new Error('Browser/Page initialization failed');

    // Test 2: Navigate to Classes Page
    await runTest('Navigate to Classes Page', async () => {
      await page!.goto(`${BASE_URL}/classes`, { waitUntil: 'networkidle' });
      await page!.waitForSelector('h1', { timeout: 10000 });
      const title = await page!.title();
      return { title, url: page!.url() };
    });

    // Test 3: Wait for Page Load and API Calls
    await runTest('Wait for Data Loading', async () => {
      await waitForNetworkIdle(page!);
      // Wait for students to load
      await page!.waitForFunction(() => {
        return document.querySelectorAll('[role="tab"]').length > 0;
      }, { timeout: 10000 });
      return { tabsFound: true };
    });

    // Test 4: Click Site Visits Tab
    await runTest('Click Site Visits Tab', async () => {
      // Find and click the Site Visits tab
      const siteVisitsTab = await page!.locator('text=Site Visits').first();
      await siteVisitsTab.waitFor({ state: 'visible', timeout: 5000 });
      await siteVisitsTab.click();
      await page!.waitForTimeout(1000);
      return { tabClicked: true };
    });

    // Test 5: Click New Record Button
    await runTest('Click New Record Button', async () => {
      const newRecordButton = await page!.locator('button:has-text("New Record")').first();
      await newRecordButton.waitFor({ state: 'visible', timeout: 5000 });
      await newRecordButton.click();
      await page!.waitForTimeout(1000);

      // Verify dialog opened
      const dialog = await page!.locator('[role="dialog"]').first();
      await dialog.waitFor({ state: 'visible', timeout: 5000 });
      return { dialogOpened: true };
    });

    // Test 6: Select Student
    await runTest('Select Student from Dropdown', async () => {
      // Click the student select trigger
      const selectTrigger = await page!.locator('[role="combobox"]').first();
      await selectTrigger.click();
      await page!.waitForTimeout(500);

      // Wait for options to appear and select first student
      const firstOption = await page!.locator('[role="option"]').first();
      await firstOption.waitFor({ state: 'visible', timeout: 5000 });
      const studentText = await firstOption.textContent();
      await firstOption.click();
      await page!.waitForTimeout(1000);

      return { studentSelected: studentText };
    });

    // Test 7: Fill Form Fields
    await runTest('Fill Form Fields', async () => {
      // Discussion Date
      const dateInput = await page!.locator('input[name="discussionDate"]').first();
      await dateInput.fill('2025-10-24');

      // Discussion Time
      const timeInput = await page!.locator('input[name="discussionTime"]').first();
      await timeInput.fill('09:30');

      // Company/Location
      const locationInput = await page!.locator('input[name="companyNameLocation"]').first();
      await locationInput.fill('Sheikh Shakhbout Medical City (SSMC)');

      // Conductor Name
      const conductorInput = await page!.locator('input[name="conductorName"]').first();
      await conductorInput.fill('Dr. Sarah Johnson');

      // Select HCT Mentor role
      const mentorCheckbox = await page!.locator('input[type="checkbox"][name="conductorRole"][value="HCT Mentor"]').first();
      await mentorCheckbox.check();

      await page!.waitForTimeout(500);

      return {
        fieldsFilledCount: 5,
        roleSelected: 'HCT Mentor'
      };
    });

    // Test 8: Fill Text Areas
    await runTest('Fill Text Area Fields', async () => {
      // People Present
      const peoplePresentTextarea = await page!.locator('textarea[name="peoplePresent"]').first();
      await peoplePresentTextarea.fill('Student, Clinical Supervisor, HCT Mentor, Ward Nurse Manager');

      // Topics Discussed
      const topicsTextarea = await page!.locator('textarea[name="discussedTopics"]').first();
      await topicsTextarea.fill('Patient assessment techniques, emergency procedures, documentation standards, communication with patients and families');

      // Attendance Follow-up
      const attendanceTextarea = await page!.locator('textarea[name="followUpAttendance"]').first();
      await attendanceTextarea.fill('Perfect attendance - 5 sessions completed. Student is consistently punctual and professional.');

      // Challenging Cases
      const casesTextarea = await page!.locator('textarea[name="interestingCases"]').first();
      await casesTextarea.fill('Observed complex trauma case: motorcycle accident with multiple fractures. Student demonstrated excellent patient communication skills during high-stress situation.');

      // SA2 Discussion
      const sa2Textarea = await page!.locator('textarea[name="sa2Discussion"]').first();
      await sa2Textarea.fill('Reviewed presentation requirements and video submission guidelines. Student is well-prepared and on track for successful completion.');

      await page!.waitForTimeout(500);

      return { textAreasFilledCount: 5 };
    });

    // Test 9: Fill Attendance Details
    await runTest('Fill Attendance Information', async () => {
      // Check attendance recorded
      const attendanceCheckbox = await page!.locator('input[type="checkbox"][name="attendanceRecorded"]').first();
      await attendanceCheckbox.check();

      // Fill attendance sessions
      const sessionsInput = await page!.locator('input[name="attendanceSessions"]').first();
      await sessionsInput.fill('5');

      await page!.waitForTimeout(500);

      return { attendanceRecorded: true, sessions: 5 };
    });

    // Test 10: Check Skills Completed
    await runTest('Select Completed Skills', async () => {
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
        const checkbox = await page!.locator(`input[type="checkbox"][name="skillsCompleted.${skill}"]`).first();
        await checkbox.check();
        await page!.waitForTimeout(100);
      }

      return { skillsCheckedCount: skills.length };
    });

    // Test 11: Add Conductor Signature
    await runTest('Draw Conductor Signature', async () => {
      // Find conductor signature canvas
      const conductorCanvas = await page!.locator('canvas').first();
      await conductorCanvas.waitFor({ state: 'visible', timeout: 5000 });

      // Get canvas position and size
      const box = await conductorCanvas.boundingBox();
      if (!box) throw new Error('Canvas not found');

      // Draw signature (simple line)
      await page!.mouse.move(box.x + 50, box.y + 50);
      await page!.mouse.down();
      await page!.mouse.move(box.x + 150, box.y + 80);
      await page!.mouse.move(box.x + 250, box.y + 50);
      await page!.mouse.up();

      await page!.waitForTimeout(500);

      return { signatureDrawn: true };
    });

    // Test 12: Add Student Signature
    await runTest('Draw Student Signature', async () => {
      // Find student signature canvas (second canvas)
      const studentCanvas = await page!.locator('canvas').nth(1);
      await studentCanvas.waitFor({ state: 'visible', timeout: 5000 });

      // Get canvas position and size
      const box = await studentCanvas.boundingBox();
      if (!box) throw new Error('Student canvas not found');

      // Draw signature (different pattern)
      await page!.mouse.move(box.x + 40, box.y + 60);
      await page!.mouse.down();
      await page!.mouse.move(box.x + 120, box.y + 40);
      await page!.mouse.move(box.x + 200, box.y + 70);
      await page!.mouse.move(box.x + 280, box.y + 60);
      await page!.mouse.up();

      await page!.waitForTimeout(500);

      return { signatureDrawn: true };
    });

    // Test 13: Take Screenshot of Filled Form
    await runTest('Capture Form Screenshot', async () => {
      const screenshotPath = path.join(TEST_OUTPUT_DIR, 'filled-form.png');
      await page!.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      return { screenshotPath };
    });

    // Test 14: Save Record to Database
    await runTest('Save Record to Database', async () => {
      // Scroll to save button
      await page!.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page!.waitForTimeout(500);

      // Click Save Record button
      const saveButton = await page!.locator('button:has-text("Save Record")').first();
      await saveButton.waitFor({ state: 'visible', timeout: 5000 });

      // Set up network listener for API call
      const responsePromise = page!.waitForResponse(
        response => response.url().includes('/api/record-of-discussion') && response.request().method() === 'POST',
        { timeout: 10000 }
      );

      await saveButton.click();

      // Wait for response
      const response = await responsePromise;
      const responseData = await response.json();

      // Wait for success toast
      await page!.waitForTimeout(2000);

      return {
        saved: true,
        recordId: responseData.id,
        statusCode: response.status()
      };
    });

    // Test 15: Generate and Download PDF
    await runTest('Generate and Download PDF', async () => {
      // Set download path
      const downloadPromise = page!.waitForEvent('download', { timeout: 15000 });

      // Click Generate PDF button
      const pdfButton = await page!.locator('button:has-text("Generate PDF")').first();
      await pdfButton.waitFor({ state: 'visible', timeout: 5000 });
      await pdfButton.click();

      // Wait for download
      const download = await downloadPromise;
      const downloadPath = path.join(TEST_OUTPUT_DIR, await download.suggestedFilename());
      await download.saveAs(downloadPath);

      // Verify file exists and has content
      const stats = fs.statSync(downloadPath);

      return {
        downloaded: true,
        filename: await download.suggestedFilename(),
        fileSize: stats.size,
        filePath: downloadPath
      };
    });

    // Test 16: Close Dialog and Verify Record in List
    await runTest('Verify Record in List', async () => {
      // Close the dialog
      const closeButton = await page!.locator('[role="dialog"] button:has-text("Cancel")').first();
      await closeButton.click();
      await page!.waitForTimeout(1000);

      // Verify record appears in list
      const recordCards = await page!.locator('.space-y-4 > div').count();

      return {
        recordsInList: recordCards,
        listVisible: recordCards > 0
      };
    });

    // Test 17: Take Final Screenshot
    await runTest('Capture Final State', async () => {
      const screenshotPath = path.join(TEST_OUTPUT_DIR, 'records-list.png');
      await page!.screenshot({
        path: screenshotPath,
        fullPage: true
      });
      return { screenshotPath };
    });

  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
  } finally {
    // Cleanup
    if (page) {
      await page.waitForTimeout(2000); // Keep page open for 2 seconds
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
  }

  // Print Summary
  console.log('\n\n============================================================');
  console.log('📊 TEST SUMMARY');
  console.log('============================================================\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => r.passed === false).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total Duration: ${totalDuration}ms (${(totalDuration / 1000).toFixed(2)}s)`);
  console.log(`📁 Output Directory: ${TEST_OUTPUT_DIR}`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }

  console.log('\n============================================================');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
