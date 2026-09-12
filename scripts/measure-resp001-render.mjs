/** Real-renderer benchmark for the reference slice, without capture-mode pins.
 * `node scripts/measure-resp001-render.mjs [baseURL] [--tablet-proxy]`
 * A tablet viewport is NOT physical iPad acceptance; output labels it explicitly.
 */
import { chromium } from 'playwright';

const tablet = process.argv.includes('--tablet-proxy');
const base = process.argv.slice(2).find(value => !value.startsWith('--')) ?? 'http://127.0.0.1:5174';
const browser = await chromium.launch({ channel: 'chrome', headless: false });
try {
  const page = await browser.newPage(tablet
    ? { viewport: { width: 1180, height: 820 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }
    : { viewport: { width: 1440, height: 960 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'false'));
  await page.goto(`${base}/?devLiveCase=resp-001`);
  await page.waitForFunction(() => window.__r3f?.scene.getObjectByName('Patient'));
  await page.locator('.patient-model-canvas-stage canvas').scrollIntoViewIfNeeded();
  await page.waitForTimeout(6000);
  const measurements = [];
  for (const mode of ['Assess', 'History']) {
    await page.getByRole('tab', { name: mode, exact: true }).click();
    await page.locator('.patient-model-canvas-stage canvas').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    measurements.push(await page.evaluate(async mode => {
      const state = window.__r3f;
      const startFrame = state.gl.info.render.frame;
      const deltas = [];
      const start = performance.now();
      let last = start;
      await new Promise(resolve => {
        function sample(now) {
          deltas.push(now - last);
          last = now;
          if (now - start >= 8000) resolve();
          else requestAnimationFrame(sample);
        }
        requestAnimationFrame(sample);
      });
      deltas.shift();
      deltas.sort((a, b) => a - b);
      return {
        mode,
        averageFps: +(1000 * deltas.length / deltas.reduce((a, b) => a + b, 0)).toFixed(1),
        p5Fps: +(1000 / deltas[Math.floor(deltas.length * .95)]).toFixed(1),
        actualRenderPasses: state.gl.info.render.frame - startFrame,
        quality: window.__adaptiveQuality,
        focus: state.scene.userData.conversationFocus ?? null,
        renderSize: [state.gl.domElement.width, state.gl.domElement.height],
      };
    }, mode));
  }
  console.log(JSON.stringify({ profile: tablet ? 'desktop-GPU-tablet-viewport-proxy' : 'desktop-Chrome-hardware', measurements, errors }, null, 2));
  if (errors.length || measurements.some(value => value.actualRenderPasses < 1)) process.exitCode = 1;
} finally {
  await browser.close();
}
