import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(40_000);
await page.addInitScript(() => { try { sessionStorage.setItem('capturePinQuality', '1'); } catch {} });
await page.goto('http://localhost:5173/?capture&devLiveCase=resp-001&model=male', { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__r3f?.gl && window.__r3f?.scene, { timeout: 45_000 });
await page.waitForTimeout(14_000);

const info = await page.evaluate(() => {
  const state = window.__r3f;
  let patient = null;
  state.scene.traverse((o) => { if (o.name === 'Patient' && o.isMesh) patient = o; });
  if (!patient) return { error: 'no patient' };
  patient.updateWorldMatrix(true, false);
  const box = new (patient.geometry.boundingBox?.constructor ?? Object)();
  // compute via vertices
  const pos = patient.geometry.attributes.position;
  const V = state.scene.position.constructor;
  const v = new V();
  let min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.count; i += 11) {
    v.fromBufferAttribute(pos, i).applyMatrix4(patient.matrixWorld);
    if (v.x < min[0]) min[0] = v.x; if (v.y < min[1]) min[1] = v.y; if (v.z < min[2]) min[2] = v.z;
    if (v.x > max[0]) max[0] = v.x; if (v.y > max[1]) max[1] = v.y; if (v.z > max[2]) max[2] = v.z;
  }
  const centre = min.map((n, i) => (n + max[i]) / 2);
  return {
    min: min.map(n => +n.toFixed(3)),
    max: max.map(n => +n.toFixed(3)),
    centre: centre.map(n => +n.toFixed(3)),
    groupPos: patient.parent ? [patient.parent.position.x, patient.parent.position.y, patient.parent.position.z].map(n => +n.toFixed(3)) : null,
    groupRot: patient.parent ? [patient.parent.rotation.x, patient.parent.rotation.y, patient.parent.rotation.z].map(n => +n.toFixed(3)) : null,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
