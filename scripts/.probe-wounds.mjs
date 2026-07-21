// One-off: start a TRAUMA case from the landing library and screenshot the
// patient — trauma cases carry skin-visible injuries for the WoundLayer.
import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.addInitScript(() => localStorage.setItem('paramedic-studio-tour-completed', 'true'));
await page.goto('http://localhost:5173/?capture');
await page.waitForTimeout(2500);
const clickIf = async (re) => { const b = page.getByRole('button', { name: re }).first(); if (await b.count()) { try { await b.click({ timeout: 2500 }); } catch {} } };
await page.getByRole('button', { name: /Start Trauma training cases/i }).click();
await page.waitForTimeout(2000);
await clickIf(/Random by Category/i); await page.waitForTimeout(600);
await clickIf(/^Trauma$/i); await page.waitForTimeout(600);
await clickIf(/Generate Case/i); await page.waitForTimeout(3800);
// scene survey flow
await clickIf(/Begin Scene Survey/i); await page.waitForTimeout(1200);
await clickIf(/^Next/i); await page.waitForTimeout(800);
await clickIf(/None identified/i); await page.waitForTimeout(400);
await clickIf(/Scene is safe/i); await page.waitForTimeout(400);
for (let i = 0; i < 5; i++) { const e = page.getByRole('button', { name: /Enter Scene/i }); if (await e.count() && await e.isEnabled()) { await e.click(); break; } await page.waitForTimeout(500); }
await page.waitForTimeout(6000);
const title = await page.locator('h1,h2,h3,p').filter({ hasText: /yo |Male|Female/ }).first().textContent().catch(() => '?');
console.log('case:', (title || '').slice(0, 80));
await page.screenshot({ path: "test-results/wounds-probe-debug.png", fullPage: false });
await clickIf(/^Chest$/); await page.waitForTimeout(2500);
await page.screenshot({ path: 'test-results/consent-beat.png' });
await page.evaluate(() => {
  const state = window.__r3f; if (!state) return;
  state.scene.traverse((o) => {
    if (o.isMesh) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) { if (m && m.color && !o.userData?.skipRecolor) { m.color.setRGB(1,1,1); } }
    }
  });
  if (state.setFrameloop) state.setFrameloop('always');
});
await page.waitForTimeout(800);
const canvas = page.locator("canvas").last();
await canvas.scrollIntoViewIfNeeded(); await page.waitForTimeout(2500);
await canvas.screenshot({ path: 'test-results/wounds-trauma-case.png' });
console.log('saved test-results/wounds-trauma-case.png');
await browser.close();
