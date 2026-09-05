import { chromium } from 'playwright';

// Find the head: scan the Patient mesh vertices for the topmost cluster and
// report its world position, plus ear-level landmarks.
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(40_000);
await page.addInitScript(() => { try { sessionStorage.setItem('capturePinQuality', '1'); } catch {} });
await page.goto('http://localhost:5173/?capture&devLiveCase=resp-001&model=male', { waitUntil: 'networkidle' });
await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 25_000 });
await page.waitForFunction(() => window.__r3f?.gl && window.__r3f?.scene);
await page.waitForTimeout(12_000);

const info = await page.evaluate(() => {
  const state = window.__r3f;
  let patient = null;
  state.scene.traverse((o) => { if (o.name === 'Patient' && o.isMesh) patient = o; });
  if (!patient) return 'no patient mesh';
  patient.updateWorldMatrix(true, false);
  const pos = patient.geometry.attributes.position;
  const V = new (state.scene.position.constructor)();
  // Sample every Nth vertex, transform to world, bucket by y to find the head
  const samples = [];
  for (let i = 0; i < pos.count; i += 37) {
    V.fromBufferAttribute(pos, i).applyMatrix4(patient.matrixWorld);
    samples.push([V.x, V.y, V.z]);
  }
  const maxY = Math.max(...samples.map(s => s[1]));
  const headCluster = samples.filter(s => s[1] > maxY - 0.12);
  const avg = (arr, k) => arr.reduce((a, s) => a + s[k], 0) / arr.length;
  return {
    vertexCount: pos.count,
    sampled: samples.length,
    maxY: +maxY.toFixed(3),
    headCentre: [+avg(headCluster, 0).toFixed(3), +avg(headCluster, 1).toFixed(3), +avg(headCluster, 2).toFixed(3)],
    headZrange: [Math.min(...headCluster.map(s => s[2])), Math.max(...headCluster.map(s => s[2]))].map(n => +n.toFixed(3)),
  };
});
console.log(JSON.stringify(info));
await browser.close();
