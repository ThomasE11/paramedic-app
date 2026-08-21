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

// Ground truth: sample the ACTIVE map at the TRUE lip UV cluster (u≈0.866)
// and compare clean vs cyanosis atlas there.
const report = await page.evaluate(() => {
  const state = window.__r3f;
  let body = null;
  state.scene.traverse((o) => { if (!body && o.isMesh && o.userData?.eyesOpenTex) body = o; });
  const geom = body.geometry;
  const pos = geom.attributes.position;
  const uv = geom.attributes.uv;
  const viseme = geom.morphAttributes.position[3];

  const lips = [];
  for (let i = 0; i < viseme.count; i++) {
    const y0 = pos.getY(i);
    if (y0 >= 1.555 && y0 <= 1.592 && Math.abs(pos.getX(i)) < 0.07 && pos.getZ(i) > 0.05) {
      lips.push({ u: uv.getX(i), v: uv.getY(i) });
    }
  }
  const us = lips.map(p => p.u), vs = lips.map(p => p.v);
  const uC = us.reduce((a,b)=>a+b,0)/lips.length;
  // use the MEDIAN v of the central lip band (avoid beard stragglers): take verts
  // with u within ±0.03 of uC, then median v
  const central = lips.filter(p => Math.abs(p.u - uC) < 0.03).map(p => p.v).sort((a,b)=>a-b);
  const vC = central[Math.floor(central.length/2)];

  const sampleCanvas = (canvas, u, v) => {
    if (!canvas || !canvas.getContext) return null;
    const ctx = canvas.getContext('2d');
    const px = Math.round(u * canvas.width), py = Math.round((1 - v) * canvas.height);
    const d = ctx.getImageData(px, py, 1, 1).data;
    return [d[0], d[1], d[2]];
  };

  const ud = body.userData;
  const mat = Array.isArray(body.material) ? body.material[0] : body.material;
  const cleanImg = (ud.cleanOpenTex ?? ud.eyesOpenTex)?.image;
  const cyanImg = ud.cyanosisOpenTex?.image;
  const activeImg = mat.map?.image;

  const spots = [];
  for (const du of [-0.02, -0.01, 0, 0.01, 0.02]) {
    for (const dv of [-0.008, 0, 0.008]) {
      spots.push([uC + du, vC + dv]);
    }
  }
  const rows = spots.map(([u, v]) => ({
    uv: [+u.toFixed(3), +v.toFixed(3)],
    clean: sampleCanvas(cleanImg, u, v),
    cyan: sampleCanvas(cyanImg, u, v),
    active: sampleCanvas(activeImg, u, v),
  }));
  const diffs = rows.filter(r => r.cyan && r.clean && (r.cyan[0] !== r.clean[0])).length;
  return { lipUV: [+uC.toFixed(4), +vC.toFixed(4)], sampledRows: rows.length, rowsWithDiff: diffs, rows };
});
console.log(JSON.stringify(report, null, 1));
await browser.close();
