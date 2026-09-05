/**
 * Criterion 7 proof: composerEnabled + perceptible post-FX on resp-001.
 * Usage: node scripts/prove-composer.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.argv[2] ?? 'http://localhost:5173';
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(repoRoot, 'test-results/review-2026-09-04/fix-composer');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true, channel: 'chrome' }).catch(() =>
  chromium.launch({ headless: true }),
);
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(45_000);

await page.addInitScript(() => {
  try { window.sessionStorage.setItem('capturePinQuality', '1'); } catch { /* ignore */ }
});

const evidence = { ok: false, steps: [] };
function note(msg, extra) {
  evidence.steps.push({ t: new Date().toISOString(), msg, ...(extra ? { extra } : {}) });
  console.log(msg, extra ? JSON.stringify(extra) : '');
}

try {
  // Same path as capture-model: capture pin + live case skips random case.
  await page.goto(`${base}/?capture&devLiveCase=resp-001&model=male`, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Start Training/i }).first().click({ timeout: 15_000 }).catch(() => {});
  await page.getByRole('button', { name: /Skip Tour/i }).click({ timeout: 5_000 }).catch(() => {});
  // If already in live case, canvas may appear without survey.
  let canvasReady = await page.locator('canvas').first().isVisible().catch(() => false);
  if (!canvasReady) {
    await page.getByRole('button', { name: /Launch smart case|Generate Case/i }).first().click({ timeout: 15_000 }).catch(() => {});
    await page.getByRole('button', { name: /Begin Scene Survey/i }).click();
    await page.getByRole('button', { name: /^Next$/i }).click();
    await page.getByRole('button', { name: /None identified/i }).click();
    await page.getByRole('button', { name: /Scene is safe/i }).click();
    await page.getByRole('button', { name: /Enter Scene/i }).click();
  }
  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ state: 'visible', timeout: 45_000 });
  await canvas.scrollIntoViewIfNeeded();
  await page.waitForTimeout(9000);

  const quality = await page.waitForFunction(() => window.__adaptiveQuality ?? null, null, { timeout: 25_000 })
    .then((h) => h.jsonValue())
    .catch(() => null);
  note('adaptiveQuality', quality);
  evidence.quality = quality;

  if (!quality || quality.composerEnabled !== true) {
    evidence.blocker = 'window.__adaptiveQuality.composerEnabled is not true after settle';
    await page.screenshot({ path: resolve(outDir, '00-blocker-overview.png'), fullPage: true });
    throw new Error(evidence.blocker);
  }

  await page.evaluate(() => {
    const state = window.__r3f;
    if (!state) throw new Error('no __r3f');
    const { camera, scene } = state;
    const V = scene.position.constructor;
    camera.position.set(0.55, 1.35, 1.55);
    camera.up.set(0, 1, 0);
    camera.lookAt(new V(0.05, 0.95, -0.35));
    camera.fov = 28;
    camera.updateProjectionMatrix();
    if (state.controls) {
      state.controls.target.set(0.05, 0.95, -0.35);
      state.controls.update();
    }
    if (typeof state.advance === 'function') {
      for (let i = 0; i < 8; i++) state.advance(performance.now() + i * 16, true);
    }
  });
  await page.waitForTimeout(700);
  await canvas.screenshot({ path: resolve(outDir, '01-composer-on-portrait.png') });
  note('saved 01-composer-on-portrait.png');

  await page.evaluate(() => {
    const state = window.__r3f;
    const { camera, scene } = state;
    const V = scene.position.constructor;
    camera.position.set(2.4, 1.6, 2.8);
    camera.lookAt(new V(0, 0.9, -0.4));
    camera.fov = 42;
    camera.updateProjectionMatrix();
    if (state.controls) {
      state.controls.target.set(0, 0.9, -0.4);
      state.controls.update();
    }
    if (typeof state.advance === 'function') {
      for (let i = 0; i < 6; i++) state.advance(performance.now() + i * 16, true);
    }
  });
  await page.waitForTimeout(500);
  await canvas.screenshot({ path: resolve(outDir, '02-composer-on-villa.png') });
  note('saved 02-composer-on-villa.png');

  await page.evaluate(() => {
    const state = window.__r3f;
    const { camera, scene } = state;
    const V = scene.position.constructor;
    camera.position.set(0.12, 1.15, 0.55);
    camera.lookAt(new V(0.02, 1.05, -0.55));
    camera.fov = 24;
    camera.updateProjectionMatrix();
    if (state.controls) {
      state.controls.target.set(0.02, 1.05, -0.55);
      state.controls.update();
    }
    if (typeof state.advance === 'function') {
      for (let i = 0; i < 10; i++) state.advance(performance.now() + i * 16, true);
    }
  });
  await page.waitForTimeout(500);
  await canvas.screenshot({ path: resolve(outDir, '03-composer-on-face-dof.png') });
  note('saved 03-composer-on-face-dof.png');

  // Exam-camera resize stress: the historical empty-buffer twitch trigger.
  const flicker = await page.evaluate(async () => {
    const canvasEl = document.querySelector('canvas');
    if (!canvasEl) return { error: 'no canvas' };
    const state = window.__r3f;
    const samples = [];
    for (let i = 0; i < 60; i++) {
      if (state?.camera && i % 10 === 0) {
        // Alternate fov to force projection/size churn similar to focused exam.
        state.camera.fov = i % 20 === 0 ? 24 : 38;
        state.camera.updateProjectionMatrix();
      }
      await new Promise((r) => requestAnimationFrame(r));
      const off = document.createElement('canvas');
      off.width = 64; off.height = 36;
      const c2 = off.getContext('2d');
      c2.drawImage(canvasEl, 0, 0, 64, 36);
      const data = c2.getImageData(0, 0, 64, 36).data;
      let sum = 0, nonzero = 0;
      for (let p = 0; p < data.length; p += 4) {
        const y = 0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2];
        sum += y;
        if (y > 8) nonzero++;
      }
      samples.push({ mean: Number((sum / (64 * 36)).toFixed(2)), nonzero });
    }
    const empty = samples.filter((s) => s.nonzero < 40 || s.mean < 2).length;
    const means = samples.map((s) => s.mean);
    return {
      frames: samples.length,
      emptyFrames: empty,
      meanMin: Math.min(...means),
      meanMax: Math.max(...means),
      samples: samples.slice(0, 5),
    };
  });
  note('flickerProbe', flicker);
  evidence.flicker = flicker;

  const composerPresence = await page.evaluate(() => {
    const q = window.__adaptiveQuality;
    const state = window.__r3f;
    return {
      composerEnabled: q?.composerEnabled ?? null,
      tier: q?.tier ?? null,
      toneMapping: state?.gl?.toneMapping,
      hasR3f: !!state,
    };
  });
  note('composerPresence', composerPresence);
  evidence.composerPresence = composerPresence;

  await page.screenshot({ path: resolve(outDir, '04-page-overview.png') });

  const gradeStats = await page.evaluate(() => {
    const canvasEl = document.querySelector('canvas');
    const off = document.createElement('canvas');
    off.width = 160; off.height = 90;
    const c2 = off.getContext('2d');
    c2.drawImage(canvasEl, 0, 0, 160, 90);
    const data = c2.getImageData(0, 0, 160, 90).data;
    const sample = (x, y) => {
      const i = (y * 160 + x) * 4;
      return [data[i], data[i + 1], data[i + 2]];
    };
    const center = sample(80, 45);
    const corner = sample(4, 4);
    const centerLum = 0.2126 * center[0] + 0.7152 * center[1] + 0.0722 * center[2];
    const cornerLum = 0.2126 * corner[0] + 0.7152 * corner[1] + 0.0722 * corner[2];
    const mid = sample(70, 40);
    return {
      center, corner,
      centerLum: Number(centerLum.toFixed(1)),
      cornerLum: Number(cornerLum.toFixed(1)),
      vignetteDelta: Number((centerLum - cornerLum).toFixed(1)),
      warmBiasRB: Number((mid[0] - mid[2]).toFixed(1)),
    };
  });
  note('gradeStats', gradeStats);
  evidence.gradeStats = gradeStats;

  evidence.ok =
    quality.composerEnabled === true &&
    (flicker.emptyFrames ?? 99) === 0 &&
    (gradeStats.centerLum ?? 0) > 5;

  if (!evidence.ok) {
    evidence.blocker = `proof thresholds failed: empty=${flicker.emptyFrames} centerLum=${gradeStats.centerLum}`;
  }
} catch (err) {
  evidence.error = String(err?.message ?? err);
  await page.screenshot({ path: resolve(outDir, '99-error.png'), fullPage: true }).catch(() => {});
  console.error(err);
  process.exitCode = 1;
} finally {
  writeFileSync(resolve(outDir, 'evidence.json'), JSON.stringify(evidence, null, 2));
  console.log(JSON.stringify({
    ok: evidence.ok,
    quality: evidence.quality,
    flicker: evidence.flicker,
    gradeStats: evidence.gradeStats,
    composerPresence: evidence.composerPresence,
    blocker: evidence.blocker,
    error: evidence.error,
  }, null, 2));
  await browser.close();
}
