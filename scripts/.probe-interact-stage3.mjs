import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(30_000);
await page.addInitScript(() => { try { window.sessionStorage.setItem('capturePinQuality', '1'); } catch {} });
await page.goto('http://localhost:5173/?capture&model=male', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Start Training/i }).first().click();
await page.getByRole('button', { name: /Skip Tour/i }).click({ timeout: 5000 }).catch(() => {});
await page.getByRole('button', { name: /Generate Case/i }).first().click();
await page.getByRole('button', { name: /Begin Scene Survey/i }).click();
await page.getByRole('button', { name: /^Next$/i }).click();
await page.getByRole('button', { name: /None identified/i }).click();
await page.getByRole('button', { name: /Scene is safe/i }).click();
await page.getByRole('button', { name: /Enter Scene/i }).click();
const canvas = page.locator('canvas').first();
await canvas.waitFor({ state: 'visible' });
await page.waitForTimeout(9000);

const out = {};
// 1. drei <Html> marker must be clickable ABOVE the composer canvas.
const chestMarker = page.locator('button[title^="Chest"]').first();
await chestMarker.click();
await page.waitForTimeout(2500); // camera animation + cockpit mount
out.htmlMarkerClick = await page.getByRole('button', { name: /Back to full body/i }).isVisible();

// 2. Material colour mutation must propagate through the composer to pixels.
out.tintPixels = await page.evaluate(async () => {
  const state = window.__r3f;
  if (!state) return { error: 'no __r3f' };
  const read = () => {
    const gl = state.gl.getContext();
    const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
    const px = new Uint8Array(4);
    gl.readPixels(Math.floor(w / 2), Math.floor(h * 0.45), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    return [px[0], px[1], px[2]];
  };
  const before = read();
  state.scene.traverse((o) => {
    if (o.isMesh && o.name === 'Patient') {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) if (m && m.color) m.color.set('#6fa8c8'); // cyanotic cast
      o.userData.skipRecolor = true; // stop the live lerp fighting the probe
    }
  });
  await new Promise((r) => setTimeout(r, 500));
  const after = read();
  return { before, after, changed: before.join() !== after.join() };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
