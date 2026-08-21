import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
page.setDefaultTimeout(40000);
await page.addInitScript(() => {
  try { window.sessionStorage.setItem('captureSpo2', '85'); } catch {}
  try { window.sessionStorage.setItem('capturePinQuality', '1'); } catch {}
});
await page.goto('http://localhost:5173/?capture&devLiveCase=resp-001&spo2=85', { waitUntil: 'networkidle' });
const startBtn = page.getByRole('button', { name: /Start Training/i }).first();
if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
  await startBtn.click();
  await page.getByRole('button', { name: /Skip Tour/i }).click({ timeout: 5000 }).catch(() => {});
  await page.getByRole('button', { name: /Launch smart case|Generate Case/i }).first().click();
  await page.getByRole('button', { name: /Begin Scene Survey/i }).click();
  await page.getByRole('button', { name: /^Next$/i }).click();
  await page.getByRole('button', { name: /None identified/i }).click();
  await page.getByRole('button', { name: /Scene is safe/i }).click();
  await page.getByRole('button', { name: /Enter Scene/i }).click();
}
await page.locator('canvas').first().waitFor({ state: 'visible' });
await page.waitForTimeout(12000);
const info = await page.evaluate(() => {
  const state = window.__r3f;
  state.gl.setAnimationLoop(null);
  const cam = state.camera;
  cam.position.set(0.02, 1.10, -0.80);
  const V = state.scene.position.constructor;
  cam.lookAt(new V(0, 0.56, -0.93));
  cam.fov = 34;
  cam.updateProjectionMatrix();
  state.gl.render(state.scene, cam);
  const gl = state.gl.getContext();
  const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
  const px = new Uint8Array(w * h * 4);
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
  const samples = [];
  for (const [fx, fy] of [[0.5,0.5],[0.5,0.4],[0.45,0.6],[0.55,0.6],[0.5,0.3],[0.5,0.7]]) {
    const x = Math.floor(fx*w), y = Math.floor(fy*h);
    const i = (y*w+x)*4;
    samples.push({ fx, fy, r: px[i], g: px[i+1], b: px[i+2] });
  }
  // where is the head in world? project it to NDC for ground truth
  const V3 = V;
  const eyeL = state.scene.getObjectByName('eyeL');
  const e = new V3(); eyeL.getWorldPosition(e);
  const ndc = e.clone().project(cam);
  return { size: [w,h], samples, eyeWorld: [+e.x.toFixed(2),+e.y.toFixed(2),+e.z.toFixed(2)], eyeNdc: [+ndc.x.toFixed(2),+ndc.y.toFixed(2),+ndc.z.toFixed(2)], camPos: [+cam.position.x.toFixed(2),+cam.position.y.toFixed(2),+cam.position.z.toFixed(2)] };
});
console.log(JSON.stringify(info, null, 1));
await page.screenshot({ path: '/Users/eliastlcthomas/Projects/app/test-results/resp001-b4-85-fullpage.png' });
console.log('fullpage saved');
await browser.close();
