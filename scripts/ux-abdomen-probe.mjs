// Probe: Abdomen region -> quadrant panel interactivity.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(30_000);
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));

await page.goto('http://localhost:5173/?devLiveCase=resp-001', { waitUntil: 'networkidle' });
await page.waitForTimeout(6000);

// Click the Abdomen region chip
await page.locator('.patient-region-selector button:has-text("Abdomen")').first().click();
await page.waitForTimeout(3500);
await page.screenshot({ path: '/tmp/pms-abdomen-1.png' });

// What did the dock show? dump buttons + quadrant panel text
const dock = page.locator('.patient-first-exam-dock');
console.log('dock visible:', await dock.count());
const texts = await dock.allInnerTexts().catch(() => []);
console.log('dock text (first 900 chars):', JSON.stringify(texts[0]?.slice(0, 900)));

// click a quadrant tile
const quad = page.locator('button:has-text("RUQ")').first();
console.log('RUQ buttons:', await page.locator('button:has-text("RUQ")').count());
if (await quad.count()) {
  await quad.click();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: '/tmp/pms-abdomen-2.png' });
  const texts2 = await dock.allInnerTexts().catch(() => []);
  console.log('after RUQ click (first 900):', JSON.stringify(texts2[0]?.slice(0, 900)));
}
await browser.close();
console.log('done');
