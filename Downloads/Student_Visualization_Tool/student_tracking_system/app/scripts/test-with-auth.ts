#!/usr/bin/env tsx

import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:3003';
const OUTPUT_DIR = path.join(process.cwd(), 'test-output', 'auth-test');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function main() {
  console.log('\n🧪 Testing Site Visit Form with Authentication\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 800
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // Login
    console.log('1. Logging in...');
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.waitForSelector('input[type="email"]');

    await page.fill('input[type="email"]', 'elias@twetemo.com');
    await page.fill('input[type="password"]', 'test123');

    await page.screenshot({ path: path.join(OUTPUT_DIR, '01-before-login.png') });

    await page.click('button[type="submit"]');

    // Wait for redirect after login
    await page.waitForURL(/\/(dashboard|classes)/, { timeout: 10000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(OUTPUT_DIR, '02-after-login.png') });
    console.log('✅ Logged in\n');

    // Navigate to Classes
    console.log('2. Going to Classes page...');
    await page.goto(`${BASE_URL}/classes`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: path.join(OUTPUT_DIR, '03-classes-page.png'), fullPage: true });
    console.log('✅ Classes page loaded\n');

    // Check what's on the page
    const pageText = await page.textContent('body');
    console.log('Page contains "Classes":', pageText?.includes('Classes'));
    console.log('Page contains "Site Visits":', pageText?.includes('Site Visits'));
    console.log('Page contains "Login":', pageText?.includes('Login'));

    // Try to find tabs
    console.log('\n3. Looking for tabs...');
    const tabList = await page.locator('[role="tablist"]').count();
    console.log(`TabLists found: ${tabList}`);

    if (tabList > 0) {
      const tabs = await page.locator('[role="tab"]').all();
      console.log(`Tabs found: ${tabs.length}`);

      for (let i = 0; i < tabs.length; i++) {
        const tabText = await tabs[i].textContent();
        console.log(`  Tab ${i + 1}: "${tabText?.trim()}"`);
      }

      // Click Site Visits tab
      console.log('\n4. Clicking Site Visits tab...');
      for (const tab of tabs) {
        const text = await tab.textContent();
        if (text?.includes('Site Visits')) {
          await tab.click();
          console.log('✅ Clicked Site Visits tab');
          await page.waitForTimeout(2000);
          await page.screenshot({ path: path.join(OUTPUT_DIR, '04-site-visits-tab.png'), fullPage: true });
          break;
        }
      }

      // Look for New Record button
      console.log('\n5. Looking for New Record button...');
      const newRecordBtn = await page.locator('button:has-text("New Record")').count();
      console.log(`New Record buttons found: ${newRecordBtn}`);

      if (newRecordBtn > 0) {
        await page.click('button:has-text("New Record")');
        console.log('✅ Clicked New Record');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(OUTPUT_DIR, '05-dialog-opened.png'), fullPage: true });

        // Check for student select
        const selectCount = await page.locator('[role="combobox"]').count();
        console.log(`\n6. Student selects found: ${selectCount}`);

        if (selectCount > 0) {
          await page.click('[role="combobox"]');
          await page.waitForTimeout(1000);
          await page.screenshot({ path: path.join(OUTPUT_DIR, '06-dropdown-opened.png'), fullPage: true });

          const options = await page.locator('[role="option"]').count();
          console.log(`Student options: ${options}`);

          if (options > 0) {
            await page.click('[role="option"]');
            console.log('✅ Selected student');
            await page.waitForTimeout(2000);
            await page.screenshot({ path: path.join(OUTPUT_DIR, '07-student-selected.png'), fullPage: true });

            // NOW WE CAN FILL THE FORM!
            console.log('\n📝 FORM IS READY TO FILL!\n');

            // Keep browser open
            console.log('Keeping browser open for manual inspection...');
            console.log(`Screenshots saved to: ${OUTPUT_DIR}`);
            await page.waitForTimeout(30000); // Wait 30 seconds
          } else {
            console.log('❌ NO STUDENTS FOUND IN DROPDOWN');
          }
        } else {
          console.log('❌ NO STUDENT SELECT FOUND');
        }
      } else {
        console.log('❌ NO NEW RECORD BUTTON FOUND');
        const bodyHtml = await page.content();
        fs.writeFileSync(path.join(OUTPUT_DIR, 'page-content.html'), bodyHtml);
      }
    } else {
      console.log('❌ NO TABS FOUND - Page might not have loaded correctly');
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'error.png'), fullPage: true });
  } finally {
    await browser.close();
  }
}

main();
