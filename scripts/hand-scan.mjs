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

const report = await page.evaluate(() => {
  const state = window.__r3f;
  let body = null;
  state.scene.traverse((o) => { if (!body && o.isMesh && o.userData?.eyesOpenTex) body = o; });
  const geom = body.geometry;
  const pos = geom.attributes.position;

  // Nailbed band in raw frame per isCyanoticNailVertex:
  //   raw: y 0.75-0.85, |x| 0.08-0.22, z>=0.08
  //   present: y 0.90-1.02, |x|>=0.40
  // Find verts matching the RAW band and report their centroid + world pos.
  const hits = [];
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    if (y >= 0.75 && y <= 0.85 && Math.abs(x) >= 0.08 && Math.abs(x) <= 0.22 && z >= 0.08) {
      hits.push([x, y, z]);
    }
  }
  const n = hits.length;
  const c = n ? [0, 1, 2].map(k => hits.reduce((a, h) => a + h[k], 0) / n) : null;

  // Also: world-space AABB of the whole mesh to locate hands by extremity.
  body.updateMatrixWorld(true);
  let minW = null, maxW = null;
  const v = new (state.scene.position.constructor)();
  const xs = [], ys = [], zs = [];
  for (let i = 0; i < pos.count; i += 7) {
    v.fromBufferAttribute(pos, i).applyMatrix4(body.matrixWorld);
    xs.push(v.x); ys.push(v.y); zs.push(v.z);
  }
  return {
    nailBandCount: n,
    nailCentroidRaw: c ? [+c[0].toFixed(3), +c[1].toFixed(3), +c[2].toFixed(3)] : null,
    worldAABB: {
      x: [Math.min(...xs).toFixed(2), Math.max(...xs).toFixed(2)],
      y: [Math.min(...ys).toFixed(2), Math.max(...ys).toFixed(2)],
      z: [Math.min(...zs).toFixed(2), Math.max(...zs).toFixed(2)],
    },
    hasSkinning: !!geom.attributes.skinIndex,
  };
});
console.log(JSON.stringify(report, null, 1));
await browser.close();
