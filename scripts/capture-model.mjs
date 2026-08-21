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
// --face: click the patient's face (through the real region-select flow) so
// the app's own camera animation zooms to its face close-up preset before the
// shot — the view used to judge eye/skin realism.
const face = process.argv.includes('--face');
// --model=male|female: force which GLB loads (see resolveModelPath hook) so
// before/after captures compare the same mesh regardless of the random case.
const modelArg = process.argv.find((a) => a.startsWith('--model='));
const modelQuery = modelArg ? `&model=${modelArg.split('=')[1]}` : '';
// --unwell=diaphoresis|jaundice|mottling: force an unwellness shader state on
// (dev-only override in Body3DModel) so each state can be screenshotted
// deterministically regardless of the random case that loads.
const unwellArg = process.argv.find((a) => a.startsWith('--unwell='));
const unwellQuery = unwellArg ? `&unwell=${unwellArg.split('=')[1]}` : '';
const spo2Arg = process.argv.find((a) => a.startsWith('--spo2='));
const spo2Query = spo2Arg ? `&spo2=${Number(spo2Arg.split('=')[1])}` : '';
const caseArg = process.argv.find((a) => a.startsWith('--case='));
const caseId = caseArg ? caseArg.split('=')[1] : (spo2Arg ? 'resp-001' : null);
const caseQuery = caseId ? `&devLiveCase=${caseId}` : '';
// --fov=N: narrow the camera fov before the shot (telephoto close-up without
// fighting OrbitControls' min-distance clamp). Default fov is 38.
const fovArg = process.argv.find((a) => a.startsWith('--fov='));
const fovOverride = fovArg ? Number(fovArg.split('=')[1]) : null;
// --viewport=WxH: override the browser viewport. A width < 640 keeps the app
// from Y-lifting the face-region camera target above the cockpit, so a
// telephoto --fov shot stays centred on the face rather than the neck.
const vpArg = process.argv.find((a) => a.startsWith('--viewport='));
const vp = vpArg
  ? { width: Number(vpArg.split('=')[1].split('x')[0]), height: Number(vpArg.split('=')[1].split('x')[1]) }
  : { width: 1440, height: 960 };
mkdirSync(dirname(out), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: vp });
page.setDefaultTimeout(30_000);

// The app strips the query string on mount and the patient view is a lazy
// chunk, so a `?unwell=` param is gone by the time it loads. Seed the forced
// unwellness state into sessionStorage BEFORE any app script runs (addInitScript
// executes on every navigation ahead of page scripts) so the dev-only override
// in Body3DModel can still read it. No-op when --unwell isn't passed.
if (unwellArg) {
  const forced = unwellArg.split('=')[1];
  await page.addInitScript((state) => {
    try { window.sessionStorage.setItem('captureUnwell', state); } catch { /* ignore */ }
  }, forced);
}
if (spo2Arg) {
  const forcedSpo2 = spo2Arg.split('=')[1];
  await page.addInitScript((val) => {
    try { window.sessionStorage.setItem('captureSpo2', val); } catch { /* ignore */ }
  }, forcedSpo2);
}

// Pin the Stage-3 adaptive-quality ladder at full quality for every capture:
// headless Chromium renders below the degrade threshold, so without the pin
// the ladder strips the composer/shadows DURING the settle wait and the shot
// photographs the degraded scene. Same addInitScript timing as above.
await page.addInitScript(() => {
  try { window.sessionStorage.setItem('capturePinQuality', '1'); } catch { /* ignore */ }
});

try {
  await page.goto(`${base}/?capture${modelQuery}${unwellQuery}${spo2Query}${caseQuery}`, { waitUntil: 'networkidle' });

  if (!caseId) {
    // Landing → training
    await page.getByRole('button', { name: /Start Training/i }).first().click();

    // First-run welcome tour modal — dismiss if it shows up
    const skipTour = page.getByRole('button', { name: /Skip Tour/i });
    await skipTour.click({ timeout: 5000 }).catch(() => {});

    // Generate a deterministic-ish case (first available). The primary CTA was
    // renamed "Launch smart case"; keep the old label as a fallback for older UI.
    await page
      .getByRole('button', { name: /Launch smart case|Generate Case/i })
      .first()
      .click();

    // Scene survey gauntlet
    await page.getByRole('button', { name: /Begin Scene Survey/i }).click();
    await page.getByRole('button', { name: /^Next$/i }).click();
    await page.getByRole('button', { name: /None identified/i }).click();
    await page.getByRole('button', { name: /Scene is safe/i }).click();
    // gloves are preselected on the PPE step
    await page.getByRole('button', { name: /Enter Scene/i }).click();
  }

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

  if (face) {
    // Select the Face region through the real student flow (the EXAMINE
    // REGION row) so the app's own camera animation zooms to its face
    // close-up preset — the view used to judge eye/skin realism.
    await page.getByText(/^Face$/).first().click();
    await page.waitForTimeout(2000); // camera animation + panel settle
  }

  if (fovOverride) {
    // Telephoto: narrow the fov, then pan the projection window (setViewOffset)
    // so the shot auto-centres on the model's eyes — the eye mesh nodes when
    // present, else the authored face point. OrbitControls never touches
    // either, so this cannot fight the app's camera logic.
    await page.evaluate((fov) => {
      const state = window.__r3f;
      if (!state) return;
      const cam = state.camera;
      cam.fov = fov;
      cam.clearViewOffset();
      cam.updateProjectionMatrix();
      const V = state.scene.position.constructor;
      const eyeL = state.scene.getObjectByName('eyeL');
      const eyeR = state.scene.getObjectByName('eyeR');
      const mid = new V();
      if (eyeL && eyeR) {
        const a = new V(); const b = new V();
        eyeL.getWorldPosition(a); eyeR.getWorldPosition(b);
        mid.copy(a).add(b).multiplyScalar(0.5);
      } else {
        mid.set(0, 1.64, 0.15);
      }
      const ndc = mid.clone().project(cam);
      const { width, height } = state.size;
      const panX = (ndc.x / 2) * width;
      const panY = (-ndc.y / 2) * height;
      cam.setViewOffset(width, height, panX, panY, width, height);
      cam.updateProjectionMatrix();
      // Telephoto shots are for judging mesh/texture realism — hide the DOM
      // overlays (landmark dots etc.) that drei <Html> pins over the canvas.
      const canvasEl = state.gl.domElement;
      if (canvasEl && canvasEl.parentElement) {
        for (const sib of canvasEl.parentElement.children) {
          if (sib !== canvasEl) sib.style.visibility = 'hidden';
        }
      }
    }, fovOverride);
    await page.waitForTimeout(300);
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
