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

// Histogram the head region in BOTH candidate frames to find where the lips
// actually live, plus their UVs.
const report = await page.evaluate(() => {
  const state = window.__r3f;
  let body = null;
  state.scene.traverse((o) => { if (!body && o.isMesh && o.userData?.eyesOpenTex) body = o; });
  const geom = body.geometry;
  const pos = geom.attributes.position;
  const uv = geom.attributes.uv;

  let root = body;
  while (root.parent && root.parent.type !== 'Scene') root = root.parent;
  root.updateMatrixWorld(true);
  body.updateMatrixWorld(true);
  const mwInv = root.matrixWorld.clone().invert();
  const v = new (state.scene.position.constructor)();

  // Collect head-region verts in both frames
  const rawHead = [];    // y 1.50-1.65 (standing frame)
  const presentHead = []; // y 0.50-0.68
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(body.matrixWorld).applyMatrix4(mwInv);
    const { x, y, z } = v;
    if (y >= 1.50 && y <= 1.66 && Math.abs(x) < 0.12) {
      rawHead.push({ u: uv.getX(i), vv: uv.getY(i), x: +x.toFixed(3), y: +y.toFixed(3), z: +z.toFixed(3) });
    }
    if (y >= 0.50 && y <= 0.70 && Math.abs(x) < 0.12) {
      presentHead.push({ u: uv.getX(i), vv: uv.getY(i), x: +x.toFixed(3), y: +y.toFixed(3), z: +z.toFixed(3) });
    }
  }

  // The eyes are known-good anchors — find their root-frame coords too
  const eyeL = state.scene.getObjectByName('eyeL');
  const eWorld = new (state.scene.position.constructor)();
  eyeL.getWorldPosition(eWorld);
  const eRoot = eWorld.clone().applyMatrix4(mwInv);

  return {
    rawHeadCount: rawHead.length,
    presentHeadCount: presentHead.length,
    sampleRaw: rawHead.slice(0, 15),
    samplePresent: presentHead.slice(0, 15),
    eyeRootFrame: [+eRoot.x.toFixed(3), +eRoot.y.toFixed(3), +eRoot.z.toFixed(3)],
    eyeWorld: [+eWorld.x.toFixed(3), +eWorld.y.toFixed(3), +eWorld.z.toFixed(3)],
    hasSkinning: !!geom.attributes.skinIndex,
  };
});
console.log(JSON.stringify(report, null, 1));
await browser.close();
