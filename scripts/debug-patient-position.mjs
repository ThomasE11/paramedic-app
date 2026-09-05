import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(40_000);
await page.addInitScript(() => {
  try { sessionStorage.setItem('capturePinQuality', '1'); } catch {}
});
await page.goto('http://localhost:5173/?capture&devLiveCase=resp-001&model=male', { waitUntil: 'networkidle' });
await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 25_000 });
await page.waitForFunction(() => window.__r3f?.gl && window.__r3f?.scene && window.__r3f?.camera);
await page.waitForTimeout(12_000);

const info = await page.evaluate(() => {
  const state = window.__r3f;
  const V = state.scene.position.constructor;
  let patient = null;
  const boxes = [];
  state.scene.traverse((o) => {
    if (o.isMesh || o.isSkinnedMesh) {
      o.updateWorldMatrix(true, false);
      const bb = new (o.geometry?.boundingBox?.constructor ?? Object)();
      try { bb.setFromObject(o); } catch { return; }
      if (!isFinite(bb.min.x)) return;
      const entry = {
        name: o.name || o.parent?.name || o.type,
        kind: o.isSkinnedMesh ? 'skinned' : 'mesh',
        min: [bb.min.x, bb.min.y, bb.min.z].map(n => +n.toFixed(2)),
        max: [bb.max.x, bb.max.y, bb.max.z].map(n => +n.toFixed(2)),
      };
      if (/patient|body|skin/i.test(o.name || '')) patient = entry;
      else boxes.push(entry);
    }
  });
  // Also grab the default live camera pose as a hint of where the app looks
  const cam = state.camera;
  return {
    patient,
    camPos: [cam.position.x, cam.position.y, cam.position.z].map(n => +n.toFixed(2)),
    otherBoxes: boxes.slice(0, 15),
  };
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
