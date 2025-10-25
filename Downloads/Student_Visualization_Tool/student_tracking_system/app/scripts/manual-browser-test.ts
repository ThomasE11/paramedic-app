#!/usr/bin/env tsx

import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:3003';
const DESKTOP = '/Users/eliastlcthomas/Desktop';
const OUTPUT_DIR = path.join(DESKTOP, 'site-visit-test');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function main() {
  console.log('\n🎭 MANUAL BROWSER TEST - BROWSER WILL STAY OPEN\n');
  console.log('I will open the browser and navigate to the login page.');
  console.log('Please MANUALLY log in, then I will continue the test.\n');
  console.log('Screenshots will be saved to:', OUTPUT_DIR, '\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
    devtools: true
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // Step 1: Navigate to login
    console.log('📱 Step 1: Opening login page...');
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '01-initial-page.png'), fullPage: true });

    console.log('\n⏸️  PAUSED - Please log in manually now...');
    console.log('   Username: elias@twetemo.com');
    console.log('   Password: test123');
    console.log('\n   Waiting 30 seconds for you to log in...\n');

    // Wait 30 seconds for manual login
    await page.waitForTimeout(30000);

    await page.screenshot({ path: path.join(OUTPUT_DIR, '02-after-manual-login.png'), fullPage: true });
    console.log('✅ Continuing after manual login\n');

    // Step 2: Navigate to Classes
    console.log('📚 Step 2: Navigating to Classes page...');
    await page.goto(`${BASE_URL}/classes`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '03-classes-page.png'), fullPage: true });

    // Check what's on the page
    const bodyText = await page.textContent('body');
    console.log('  Page contains "Classes":', bodyText?.includes('Classes'));
    console.log('  Page contains "Site Visits":', bodyText?.includes('Site Visits'));
    console.log('  Page contains "Login":', bodyText?.includes('Login'));

    // Step 3: Find Site Visits tab
    console.log('\n🏥 Step 3: Looking for Site Visits tab...');
    const tabs = await page.locator('[role="tab"]').all();
    console.log(`  Found ${tabs.length} tabs`);

    if (tabs.length > 0) {
      for (let i = 0; i < tabs.length; i++) {
        const text = await tabs[i].textContent();
        console.log(`    Tab ${i + 1}: "${text?.trim()}"`);
      }

      // Click Site Visits tab
      for (const tab of tabs) {
        const text = await tab.textContent();
        if (text?.includes('Site Visits')) {
          console.log('\n  Clicking Site Visits tab...');
          await tab.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: path.join(OUTPUT_DIR, '04-site-visits-tab.png'), fullPage: true });
          console.log('  ✅ Site Visits tab clicked\n');
          break;
        }
      }

      // Step 4: Click New Record
      console.log('➕ Step 4: Looking for New Record button...');
      const newRecordBtn = await page.locator('button:has-text("New Record")').count();
      console.log(`  New Record buttons found: ${newRecordBtn}`);

      if (newRecordBtn > 0) {
        await page.click('button:has-text("New Record")');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, '05-dialog-opened.png'), fullPage: true });
        console.log('  ✅ Dialog opened\n');

        // Step 5: Check for students
        console.log('👤 Step 5: Checking for student dropdown...');
        const dialogText = await page.textContent('[role="dialog"]');
        console.log('  Dialog contains "No students":', dialogText?.includes('No students'));
        console.log('  Dialog contains "Select a student":', dialogText?.includes('Select a student'));

        const comboboxes = await page.locator('[role="combobox"]').count();
        console.log(`  Comboboxes found: ${comboboxes}`);

        if (comboboxes > 0) {
          await page.click('[role="combobox"]');
          await page.waitForTimeout(1500);
          await page.screenshot({ path: path.join(OUTPUT_DIR, '06-dropdown-opened.png'), fullPage: true });

          const options = await page.locator('[role="option"]').count();
          console.log(`  Student options: ${options}\n`);

          if (options > 0) {
            console.log('✅ SUCCESS! Students are appearing in the dropdown!');
            console.log('The fix worked - students prop is being passed correctly.\n');

            // List all students
            const allOptions = await page.locator('[role="option"]').all();
            console.log('Available students:');
            for (let i = 0; i < allOptions.length; i++) {
              const studentName = await allOptions[i].textContent();
              console.log(`  ${i + 1}. ${studentName}`);
            }
          } else {
            console.log('❌ ERROR: No students in dropdown!');
            console.log('The students prop fix did not work.\n');
          }
        } else {
          console.log('❌ ERROR: No student dropdown found!');
          console.log('The dialog is not showing the student selection field.\n');
        }

        // Keep browser open
        console.log('\n📸 All screenshots saved to:', OUTPUT_DIR);
        console.log('🔍 Keeping browser open for 60 seconds for manual inspection...\n');
        await page.waitForTimeout(60000);

      } else {
        console.log('❌ ERROR: No "New Record" button found!');
      }
    } else {
      console.log('❌ ERROR: No tabs found - might not be logged in or on wrong page');
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'ERROR.png'), fullPage: true });
  } finally {
    console.log('\n✅ Test complete. Closing browser...\n');
    await browser.close();
  }
}

main().catch(console.error);
