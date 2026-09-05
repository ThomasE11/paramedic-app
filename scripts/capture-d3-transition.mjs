import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(40000);
await page.addInitScript(() => {
  try { window.sessionStorage.setItem('capturePinQuality', '1'); } catch {}
});
await page.goto('http://localhost:5173/?capture', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Start Training/i }).first().click();
await page.getByRole('button', { name: /Skip Tour/i }).click({ timeout: 5000 }).catch(() => {});

// Case library — launch first case, land on BRIEFING phase
await page.getByRole('button', { name: /Launch smart case|Generate Case/i }).first().click();
await page.waitForTimeout(1500);
await page.screenshot({ path: 'test-results/d3-phase-briefing.png' });
console.log('briefing shot');

// Briefing → scene survey: grab a frame mid-crossfade
await page.getByRole('button', { name: /Begin Scene Survey/i }).click();
await page.waitForTimeout(250);
await page.screenshot({ path: 'test-results/d3-mid-crossfade-1.png' });
console.log('mid-crossfade 1');

// gauntlet
await page.getByRole('button', { name: /^Next$/i }).click();
await page.getByRole('button', { name: /None identified/i }).click();
await page.getByRole('button', { name: /Scene is safe/i }).click();

// Survey → treat: mid-crossfade + villa dolly mid-flight
await page.getByRole('button', { name: /Enter Scene/i }).click();
await page.waitForTimeout(250);
await page.screenshot({ path: 'test-results/d3-mid-crossfade-2.png' });
console.log('mid-crossfade 2');
await page.waitForTimeout(1300);
await page.screenshot({ path: 'test-results/d3-mid-dolly.png' });
console.log('mid-dolly');
await browser.close();
