import { chromium } from 'playwright';

// Probe v2: render ONE wide frame with 3D coordinate axes + labelled markers
// dropped at key world positions so we can see exactly where the head is
// relative to my camera assumptions.
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
  const { gl, scene, camera } = state;
  const THREE = state.THREE ?? null;
  const V = scene.position.constructor;

  // Find patient mesh and drop a marker at its measured head centre
  let patient = null;
  scene.traverse((o) => { if (o.name === 'Patient' && o.isMesh) patient = o; });
  patient.updateWorldMatrix(true, false);
  const pos = patient.geometry.attributes.position;
  const v = new V();
  let minY = Infinity, maxY = -Infinity, headSamples = [], all = [];
  for (let i = 0; i < pos.count; i += 17) {
    v.fromBufferAttribute(pos, i).applyMatrix4(patient.matrixWorld);
    all.push([v.x, v.y, v.z]);
    if (v.y < minY) minY = v.y;
    if (v.y > maxY) maxY = v.y;
  }
  const headCluster = all.filter(s => s[1] > maxY - 0.1);
  const avg = k => headCluster.reduce((a, s) => a + s[k], 0) / headCluster.length;
  const head = [avg(0), avg(1), avg(2)];
  // Extremes: top of head, toes
  let top = all[0], toe = all[0];
  for (const s of all) { if (s[1] > top[1]) top = s; if (s[1] < toe[1]) toe = s; }

  // Add debug markers into the scene
  const mk = (position, color, size = 0.06) => {
    const m = new (patient.constructor.prototype.mesh?.constructor ?? Object)();
    // Fallback: use raw three via scene children constructor chain
    return null;
  };
  // Simpler: use the app's own THREE from a mesh's material constructor chain
  const three = patient.geometry.constructor; // BufferGeometry
  // We can't easily import THREE here; instead draw debug by moving camera and
  // printing coordinates. Render from a diagnostic wide angle instead.
  gl.setAnimationLoop(null);
  camera.position.set(3.2, 2.2, 2.6);
  camera.up.set(0, 1, 0);
  camera.lookAt(new V(0, 0.5, 0));
  camera.fov = 45;
  camera.updateProjectionMatrix();
  gl.render(scene, camera);
  return {
    headCentre: head.map(n => +n.toFixed(3)),
    topOfHead: top.map(n => +n.toFixed(3)),
    toe: toe.map(n => +n.toFixed(3)),
    yRange: [+minY.toFixed(2), +maxY.toFixed(2)],
    dataUrl: gl.domElement.toDataURL('image/png'),
  };
});

console.log('headCentre:', info.headCentre);
console.log('topOfHead:', info.topOfHead);
console.log('toe:', info.toe);
console.log('yRange:', info.yRange);
const fs = await import('node:fs');
fs.writeFileSync('/Users/eliastlcthomas/Projects/app/test-results/diag-wide.png',
  Buffer.from(info.dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
console.log('wrote test-results/diag-wide.png');
await browser.close();
