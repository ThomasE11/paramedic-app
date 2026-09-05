import { chromium } from 'playwright';

// Probe: what does the mouth region actually look like with viseme_open=0.78?
// Render tight on the mouth from directly in front, and list all morph targets
// available so we can pick the right jaw/mouth combination.
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(40_000);
await page.addInitScript(() => { try { sessionStorage.setItem('capturePinQuality', '1'); } catch {} });
await page.goto('http://localhost:5173/?capture&devLiveCase=resp-001&model=male', { waitUntil: 'networkidle' });
await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 25_000 });
await page.waitForFunction(() => window.__r3f?.gl && window.__r3f?.scene);
await page.waitForTimeout(12_000);

const result = await page.evaluate(() => {
  const state = window.__r3f;
  const { gl, scene, camera } = state;
  const V = scene.position.constructor;
  gl.setAnimationLoop(null);

  const morphNames = new Set();
  let patient = null;
  scene.traverse((o) => {
    if (o.isMesh && o.morphTargetDictionary) {
      Object.keys(o.morphTargetDictionary).forEach(k => morphNames.add(k));
      if (o.name === 'Patient') patient = o;
    }
  });

  // Apply a strong open-mouth set
  const open = {};
  for (const k of ['viseme_open', 'viseme_aa', 'jaw_open', 'mouth_open']) {
    if (morphNames.has(k)) open[k] = 0.85;
  }
  if (patient) {
    for (const [k, v] of Object.entries(open)) {
      const idx = patient.morphTargetDictionary[k];
      patient.morphTargetInfluences[idx] = v;
    }
  }

  // Camera straight at the face from above-front
  camera.position.set(-0.1, 1.7, 0.25);
  camera.up.set(0, 1, 0);
  camera.lookAt(new V(0.05, 0.92, -0.28));
  camera.fov = 26;
  camera.near = 0.02; camera.far = 100;
  camera.aspect = gl.domElement.width / gl.domElement.height;
  camera.updateProjectionMatrix();
  gl.render(scene, camera);
  return { shot: gl.domElement.toDataURL('image/png'), appliedMorphs: open, allMorphs: [...morphNames] };
});

console.log('morphs:', JSON.stringify(result.allMorphs));
console.log('applied:', JSON.stringify(result.appliedMorphs));
if (result.shot) {
  const fs = await import('node:fs');
  fs.writeFileSync('/Users/eliastlcthomas/Projects/app/test-results/viseme-probe.png',
    Buffer.from(result.shot.replace(/^data:image\/png;base64,/, ''), 'base64'));
  console.log('wrote test-results/viseme-probe.png');
}
await browser.close();
