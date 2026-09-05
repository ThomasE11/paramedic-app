import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
page.setDefaultTimeout(40000);
await page.addInitScript((val) => {
  try { window.sessionStorage.setItem('captureSpo2', String(val)); } catch {}
  try { window.sessionStorage.setItem('capturePinQuality', '1'); } catch {}
}, 97);
await page.goto('http://localhost:5173/?capture&devLiveCase=resp-001&spo2=97', { waitUntil: 'networkidle' });
await page.locator('canvas').first().waitFor({ state: 'visible' });
await page.waitForTimeout(12000);
const r = await page.evaluate(() => {
  const state = window.__r3f;
  const mesh = state.scene.getObjectByName('Patient');
  return {
    hasInfluences: !!mesh?.morphTargetInfluence,
    influences: mesh?.morphTargetInfluence ? Array.from(mesh.morphTargetInfluence).map(n => +n.toFixed(2)) : null,
    // also check the posture mixer on any child
    children: mesh ? mesh.children.map(c => c.name || c.type).slice(0, 8) : null,
  };
});
console.log(JSON.stringify(r));
await page.screenshot({ path: '/Users/eliastlcthomas/Projects/app/test-results/resp001-posture-97.png' });
await browser.close();
