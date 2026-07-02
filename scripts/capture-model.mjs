/**
 * Capture a screenshot of the 3D patient model for visual-realism iteration.
 *
 * Usage:  node scripts/capture-model.mjs <out.png> [baseUrl]
 *   e.g.  node scripts/capture-model.mjs test-results/realism-before.png http://localhost:5173
 *
 * Drives the real student flow (Start Training → Generate Case → Scene Survey
 * → Enter Scene) and screenshots the WebGL canvas showing the patient.
 * The app must be running with ?capture so preserveDrawingBuffer is enabled
 * (otherwise the canvas screenshot comes back black).
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const out = resolve(process.argv[2] ?? 'test-results/realism-capture.png');
const base = process.argv[3] ?? 'http://localhost:5173';
// --neutral: disable the live perfusion tint before the shot so before/after
// captures compare LIGHTING/MATERIAL changes, not the random case's severity.
const neutral = process.argv.includes('--neutral');
mkdirSync(dirname(out), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(30_000);

try {
  await page.goto(`${base}/?capture`, { waitUntil: 'networkidle' });

  // Landing → training
  await page.getByRole('button', { name: /Start Training/i }).first().click();

  // First-run welcome tour modal — dismiss if it shows up
  const skipTour = page.getByRole('button', { name: /Skip Tour/i });
  await skipTour.click({ timeout: 5000 }).catch(() => {});

  // Generate a deterministic-ish case (first available)
  await page.getByRole('button', { name: /Generate Case/i }).first().click();

  // Scene survey gauntlet
  await page.getByRole('button', { name: /Begin Scene Survey/i }).click();
  await page.getByRole('button', { name: /^Next$/i }).click();
  await page.getByRole('button', { name: /None identified/i }).click();
  await page.getByRole('button', { name: /Scene is safe/i }).click();
  // gloves are preselected on the PPE step
  await page.getByRole('button', { name: /Enter Scene/i }).click();

  // Wait for the 3D canvas + GLB load + first frames
  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ state: 'visible' });
  await canvas.scrollIntoViewIfNeeded();
  await page.waitForTimeout(9000); // GLB + HDRI decode + texture repaint + tint settle

  if (neutral) {
    // Dev-only hook (window.__r3f) — reset the patient's material colour and
    // freeze the perfusion lerp so the shot shows the authored skin.
    await page.evaluate(() => {
      const state = window.__r3f;
      if (!state) return;
      state.scene.traverse((o) => {
        if (o.isMesh && o.name === 'Patient') {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          for (const m of mats) if (m && m.color) m.color.set('#ffffff');
          o.userData.skipRecolor = true;
        }
      });
    });
    await page.waitForTimeout(400);
  }

  await canvas.screenshot({ path: out });
  console.log(`saved ${out}`);
} catch (err) {
  // Dump a full-page screenshot to debug where the flow got stuck.
  const debugPath = out.replace(/\.png$/, '.debug.png');
  await page.screenshot({ path: debugPath, fullPage: true }).catch(() => {});
  console.error(`capture failed (debug: ${debugPath}):`, err.message ?? err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
