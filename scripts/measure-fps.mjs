/**
 * Measure real rendering FPS of the 3D patient view via rAF deltas.
 *
 * Usage:  node scripts/measure-fps.mjs [baseUrl] [--seconds=10] [--headless]
 *                                      [--force-degrade] [--model=male|female]
 *   e.g.  node scripts/measure-fps.mjs http://localhost:5173 --seconds=10
 *
 * Drives the same student flow as capture-model.mjs (Start Training → Generate
 * Case → Scene Survey → Enter Scene), lets the GLB/HDRI settle, then samples
 * requestAnimationFrame deltas for N seconds and prints avg / p5-low / min FPS.
 *
 * Runs HEADED by default — headless Chromium is not vsync-tied the same way,
 * so headed numbers are the honest ones. Pass --headless for CI smoke only.
 *
 * --force-degrade seeds sessionStorage BEFORE any app script runs (the app
 * strips query params on mount and the patient view is a lazy chunk — same
 * timing trap capture-model.mjs documents), which makes the dev-only
 * AdaptiveQuality override report ~10fps to the PerformanceMonitor so the
 * degrade ladder demonstrably trips. The script then polls the dev hook
 * window.__adaptiveQuality and prints each tier transition it observes.
 */
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const base = args.find((a) => !a.startsWith('--')) ?? 'http://localhost:5173';
const seconds = Number((args.find((a) => a.startsWith('--seconds=')) ?? '--seconds=10').split('=')[1]);
const headless = args.includes('--headless');
const forceDegrade = args.includes('--force-degrade');
const modelArg = args.find((a) => a.startsWith('--model='));
const modelQuery = modelArg ? `&model=${modelArg.split('=')[1]}` : '';

const browser = await chromium.launch({ headless });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(30_000);

if (forceDegrade) {
  await page.addInitScript(() => {
    try { window.sessionStorage.setItem('captureForceDegrade', '1'); } catch { /* ignore */ }
  });
}

try {
  await page.goto(`${base}/?capture${modelQuery}`, { waitUntil: 'networkidle' });
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
  await page.waitForTimeout(9000); // GLB + HDRI decode + texture repaint settle

  if (forceDegrade) {
    // Poll the dev hook for tier transitions while the ladder walks down.
    const transitions = await page.evaluate(async () => {
      const seen = [];
      const t0 = performance.now();
      // Long window: the burner holds ~25 fps for 18 s (walking the ladder
      // down), then releases — the tail of the window films the recovery
      // climb back to tier 0.
      while (performance.now() - t0 < 40_000) {
        const q = window.__adaptiveQuality;
        if (q) {
          const label = `tier=${q.tier} composer=${q.composerEnabled} dpr=${q.dpr} contactShadows=${q.contactShadows}`;
          if (seen[seen.length - 1] !== label) seen.push(label);
        }
        await new Promise((r) => setTimeout(r, 250));
      }
      return seen;
    });
    console.log('degrade ladder transitions observed:');
    for (const t of transitions) console.log('  ' + t);
  }

  const result = await page.evaluate(async (secs) => {
    const deltas = [];
    let last = performance.now();
    await new Promise((resolve) => {
      const tick = (now) => {
        deltas.push(now - last);
        last = now;
        if (now - deltas.t0 > secs * 1000) return resolve();
        requestAnimationFrame(tick);
      };
      deltas.t0 = performance.now();
      requestAnimationFrame((now) => { last = now; requestAnimationFrame(tick); });
    });
    deltas.sort((a, b) => a - b);
    const sum = deltas.reduce((s, d) => s + d, 0);
    const avg = 1000 / (sum / deltas.length);
    const p95Delta = deltas[Math.floor(deltas.length * 0.95)]; // slowest 5% boundary
    const worst = deltas[deltas.length - 1];
    return {
      frames: deltas.length,
      avgFps: Number(avg.toFixed(1)),
      p5LowFps: Number((1000 / p95Delta).toFixed(1)),
      minFps: Number((1000 / worst).toFixed(1)),
    };
  }, seconds);

  console.log(JSON.stringify(result));
} catch (err) {
  console.error('measure failed:', err.message ?? err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
