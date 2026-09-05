import { chromium } from 'playwright';

// Probe v3b: build the marker sphere without importing THREE — use the
// patient mesh's own geometry/material constructor chain to reach three's
// classes via r3f's internal extend registry.
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
  const V = scene.position.constructor; // Vector3!

  let patient = null;
  scene.traverse((o) => { if (o.name === 'Patient' && o.isMesh) patient = o; });

  // Reach THREE classes through the patient's material/geometry prototypes
  const MeshCtor = patient.constructor;
  const SphereGeom = patient.geometry.constructor; // wrong type but same lib
  // Better: find any SphereGeometry in the scene
  let sphereGeomCtor = null, meshBasicCtor = null;
  scene.traverse((o) => {
    if (!sphereGeomCtor && o.geometry?.type === 'SphereGeometry') sphereGeomCtor = o.geometry.constructor;
    if (!meshBasicCtor && o.material?.type === 'MeshBasicMaterial') meshBasicCtor = o.material.constructor;
  });

  const head = new V(0.02, 0.76, -0.28);
  let marker = null;
  if (sphereGeomCtor && meshBasicCtor && MeshCtor) {
    try {
      const mat = new meshBasicCtor({ color: 0xff0000 });
      marker = new MeshCtor(new sphereGeomCtor(0.07, 16, 16), mat);
      marker.position.copy(head);
      scene.add(marker);
    } catch (e) { return { error: 'marker build failed: ' + e.message }; }
  }

  gl.setAnimationLoop(null);
  camera.position.set(-0.35, 1.6, -0.05);
  camera.up.set(0, 1, 0);
  camera.lookAt(head);
  camera.fov = 28;
  camera.near = 0.02; camera.far = 100;
  camera.aspect = gl.domElement.width / gl.domElement.height;
  camera.updateProjectionMatrix();
  gl.render(scene, camera);
  const shot = gl.domElement.toDataURL('image/png');
  if (marker) scene.remove(marker);
  return {
    shot,
    camAfterRender: [camera.position.x.toFixed(2), camera.position.y.toFixed(2), camera.position.z.toFixed(2)],
    hadMarker: Boolean(marker),
  };
});

console.log('camAfter:', result.camAfterRender, 'marker:', result.hadMarker, 'err:', result.error ?? 'none');
if (result.shot) {
  const fs = await import('node:fs');
  fs.writeFileSync('/Users/eliastlcthomas/Projects/app/test-results/head-marker.png',
    Buffer.from(result.shot.replace(/^data:image\/png;base64,/, ''), 'base64'));
  console.log('wrote test-results/head-marker.png');
}
await browser.close();
