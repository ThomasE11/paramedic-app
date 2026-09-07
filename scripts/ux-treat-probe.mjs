// UX probe: enter case, click a treatment, report result.
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(30_000);
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));

await page.goto('http://localhost:5173/?devLiveCase=resp-001', { waitUntil: 'networkidle' });
await page.waitForTimeout(6000);

// Find apply buttons in the treatment panel
const applyButtons = page.locator('[data-equipment-inventory="true"] button:has-text("Apply"), .tactical-management-options button:has-text("Apply")');
const count = await applyButtons.count();
console.log('apply buttons:', count);
for (let i = 0; i < Math.min(count, 10); i++) {
  const b = applyButtons.nth(i);
  console.log(' -', (await b.innerText().catch(() => ''))?.slice(0, 60).replace(/\n/g, ' | '));
}
if (count > 0) {
  await applyButtons.first().click();
  await page.waitForTimeout(3000);
  // check for toast
  const toasts = await page.locator('[data-sonner-toast], .toast, [role="status"]').allInnerTexts().catch(() => []);
  console.log('toasts:', JSON.stringify(toasts).slice(0, 400));
  await page.screenshot({ path: '/tmp/pms-treat-probe.png' });
  console.log('saved /tmp/pms-treat-probe.png');
}
await browser.close();
