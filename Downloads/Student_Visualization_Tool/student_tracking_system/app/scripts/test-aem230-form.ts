/**
 * Test script to fill out and download AEM230 Clinical Visit form
 */

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function testAEM230Form() {
  console.log('🚀 Starting AEM230 form test...');

  const browser = await chromium.launch({
    headless: false,
    downloadsPath: path.join(process.env.HOME!, 'Desktop')
  });

  const context = await browser.newContext({
    acceptDownloads: true
  });

  const page = await context.newPage();

  try {
    // NOTE: Please log in manually at http://localhost:3005 before running this script
    console.log('⚠️  IMPORTANT: Please ensure you are logged in at localhost:3005 first!');
    console.log('⏳ Waiting 5 seconds for you to log in...');
    await page.waitForTimeout(5000);

    // Navigate to the form
    console.log('📄 Navigating to form...');
    await page.goto('http://localhost:3005/modules/aem230-site-visit', {
      waitUntil: 'networkidle'
    });

    // Wait for form to load
    await page.waitForTimeout(3000);

    // Select a student
    console.log('👤 Selecting student...');
    await page.click('button:has-text("Select student")');
    await page.waitForTimeout(1000);
    // Click the second option (first is disabled "No students available")
    const options = await page.locator('[role="option"]').all();
    if (options.length > 1) {
      await options[1].click();
    } else {
      await options[0].click();
    }
    await page.waitForTimeout(1000);

    // Fill discussion details
    console.log('📝 Filling discussion details...');

    // Discussion Time
    await page.fill('input[type="time"]', '14:30');

    // Company Name
    await page.fill('input[placeholder*="SSMC"]', 'Sheikh Khalifa Medical City');

    // Workplace Location
    await page.click('button:has-text("Select location")');
    await page.waitForTimeout(500);
    await page.click('[role="option"]:first-child');
    await page.waitForTimeout(500);

    // Conductor Name
    await page.fill('input[placeholder*="supervisor"]', 'Dr. Ahmed Al Mansouri');

    // Conductor Role - already defaults to "Work Supervisor"

    // Fill Record of Discussion
    console.log('📋 Filling record of discussion...');

    const textareas = await page.locator('textarea').all();

    // People Present
    await textareas[0].fill('Dr. Ahmed Al Mansouri (Clinical Supervisor), Student Paramedic, Emergency Department Nursing Staff');

    // Attendance
    await textareas[1].fill('Student attended all scheduled clinical sessions. Perfect attendance record maintained throughout the rotation.');

    // Challenges
    await textareas[2].fill('Initial difficulty with Arabic-speaking patients. Overcame language barrier through use of medical translator app and basic Arabic medical terminology study.');

    // Interesting Cases
    await textareas[3].fill('Responded to multiple trauma cases including:\n- MVA with chest trauma requiring chest tube insertion (observed)\n- Acute MI patient with successful STEMI protocol activation\n- Pediatric febrile seizure case demonstrating proper seizure management');

    // Select some skills
    console.log('✅ Selecting completed skills...');
    const skillsToCheck = [
      'bloodPressure',
      'temperature',
      'respiratoryRate',
      'heartRate',
      'woundCare',
      'ecg',
      'lucas',
      'theatre',
      'communication'
    ];

    for (const skill of skillsToCheck) {
      await page.check(`#${skill}`);
      await page.waitForTimeout(200);
    }

    // SA2 Discussion
    await textareas[4].fill('Student demonstrated excellent understanding of Professional Practice requirements. Discussed case studies for SA2 presentation including ethical considerations in emergency care, patient autonomy in critical situations, and interprofessional collaboration in trauma management.');

    // Assessment Criteria Met
    await textareas[5].fill('- Demonstrates professional behavior and communication\n- Applies theoretical knowledge to clinical practice\n- Performs clinical skills safely and competently\n- Works effectively within the healthcare team\n- Maintains patient confidentiality and dignity');

    // Draw signatures
    console.log('✍️ Adding signatures...');

    // Get both signature canvases
    const canvases = await page.locator('canvas').all();

    // Draw conductor signature
    await canvases[0].hover();
    await page.mouse.down();
    await page.mouse.move(50, 30);
    await page.mouse.move(100, 25);
    await page.mouse.move(150, 35);
    await page.mouse.up();
    await page.waitForTimeout(500);

    // Draw student signature
    await canvases[1].hover();
    await page.mouse.down();
    await page.mouse.move(50, 30);
    await page.mouse.move(100, 20);
    await page.mouse.move(150, 30);
    await page.mouse.up();
    await page.waitForTimeout(500);

    // Save the form first
    console.log('💾 Saving form...');
    await page.click('button:has-text("Save Site Visit")');
    await page.waitForTimeout(2000);

    // Download PDF
    console.log('📥 Downloading PDF...');

    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download PDF")');
    const download = await downloadPromise;

    // Save to Desktop
    const desktopPath = path.join(process.env.HOME!, 'Desktop', 'Clinical_Visit_Record.pdf');
    await download.saveAs(desktopPath);

    console.log('✅ PDF downloaded to Desktop as: Clinical_Visit_Record.pdf');

    // Wait a bit to see the result
    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('❌ Error during form test:', error);
  } finally {
    await browser.close();
    console.log('🏁 Test completed!');
  }
}

testAEM230Form();
