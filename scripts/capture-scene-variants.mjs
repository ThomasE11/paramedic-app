import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(40000);
await page.addInitScript(() => {
  try { window.sessionStorage.setItem('capturePinQuality', '1'); } catch {}
});
await page.goto('http://localhost:5173/?capture&devLiveCase=trauma-001', { waitUntil: 'networkidle' });
const canvas = page.locator('canvas').first();
await canvas.waitFor({ state: 'visible', timeout: 20000 });
await page.waitForTimeout(12000);

const diag = await page.evaluate(() => {
  // Read the live rendered DOM to find what TreatmentBayEnvironment actually mounted.
  // The 3D canvas is inside Body3DModel; the variant isn't in the DOM directly,
  // but the scene image + title text tells us the case.
  const title = document.title;
  const heading = document.body.innerText.slice(0, 300).replace(/\s+/g, ' ');
  return { title, heading };
});
console.log(JSON.stringify(diag));

// Also: force a full-page screenshot + a framebuffer render from behind the patient
const fb = await page.evaluate(() => {
  const state = window.__r3f;
  const glc = state.gl;
  glc.setAnimationLoop(null);
  const cam = state.camera;
  cam.position.set(0.4, 2.4, 4.2);
  const V = state.scene.position.constructor;
  cam.lookAt(new V(0.4, 0.4, 0));
  cam.fov = 50;
  cam.updateProjectionMatrix();
  glc.render(state.scene, cam);
  return glc.domElement.toDataURL('image/png');
});
const fs = await import('node:fs');
fs.writeFileSync('/Users/eliastlcthomas/Projects/app/test-results/scene-roadside-crash-render.png',
  Buffer.from(fb.replace(/^data:image\/png;base64,/, ''), 'base64'));
console.log('wrote scene-roadside-crash-render.png');
await browser.close();
