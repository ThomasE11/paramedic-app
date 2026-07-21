import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(30_000);
await page.goto('http://localhost:5173/?capture', { waitUntil: 'networkidle' });
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
await page.waitForTimeout(8000);
const info = await page.evaluate(() => {
  const state = window.__r3f;
  if (!state) return { r3f: false };
  const cam = state.camera;
  const V = state.scene.position.constructor;
  const vec = new V(0, 1.64, 0.16);
  vec.project(cam);
  let modelPath = 'unknown';
  state.scene.traverse((o) => { if (o.isMesh && o.name === 'Patient') modelPath = 'found-patient-mesh'; });
  return { r3f: true, ndc: { x: vec.x, y: vec.y }, camPos: cam.position.toArray(), mesh: modelPath };
});
console.log('info:', JSON.stringify(info));
const box = await canvas.boundingBox();
console.log('canvas box:', JSON.stringify(box));
if (info.ndc) {
  const px = box.x + ((info.ndc.x + 1) / 2) * box.width;
  const py = box.y + ((1 - info.ndc.y) / 2) * box.height;
  console.log('clicking', px, py);
  await page.mouse.click(px, py);
  await page.waitForTimeout(2000);
  const after = await page.evaluate(() => {
    const state = window.__r3f;
    return { camPos: state.camera.position.toArray() };
  });
  console.log('after click cam:', JSON.stringify(after));
  await page.screenshot({ path: '/tmp/probe-face.png' });
}
await browser.close();
