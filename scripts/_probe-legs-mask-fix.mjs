import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const outDir = resolve('test-results/review-2026-09-04/legs-mask');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(60000);

await page.addInitScript(() => {
  try { window.sessionStorage.setItem('capturePinQuality', '1'); } catch {}
});

await page.goto('http://localhost:5173/?capture&devLiveCase=resp-001', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Skip Tour/i }).click({ timeout: 4000 }).catch(() => {});
await page.locator('canvas').first().waitFor({ state: 'visible' });
await page.waitForTimeout(10000);

const metrics = await page.evaluate(async () => {
  const THREE = await import('/node_modules/.vite/deps/three.js');
  const state = window.__r3f;
  if (!state?.scene) return { error: 'no r3f' };
  const scene = state.scene;

  const clothing = [];
  const seats = [];
  let patient = null;
  scene.traverse((o) => {
    if (o.name === 'clothing-layer' || o.parent?.name === 'clothing-layer' || o.name?.startsWith('scrub-')) {
      clothing.push({
        name: o.name,
        type: o.type,
        visible: o.visible,
        parent: o.parent?.name,
        underlay: !!o.userData?.garmentUnderlay,
        morphs: o.morphTargetDictionary ? Object.keys(o.morphTargetDictionary) : [],
        poseTripod: o.morphTargetDictionary?.pose_tripod,
        poseTripodInfl: o.morphTargetInfluences?.[o.morphTargetDictionary?.pose_tripod],
        verts: o.geometry?.attributes?.position?.count,
        isSkinned: o.isSkinnedMesh,
      });
    }
    if (/seat|chair|bench|patient-chair|clinical-patient-seat/i.test(o.name || '')) {
      const box = new THREE.Box3().setFromObject(o);
      if (!box.isEmpty()) seats.push({ name: o.name, min: box.min.toArray(), max: box.max.toArray() });
    }
    if (o.name === 'Patient' || o.name === 'patient' || (o.isSkinnedMesh && o.morphTargetDictionary?.pose_tripod && (o.geometry?.attributes?.position?.count||0) > 5000)) {
      if (!patient || (o.geometry?.attributes?.position?.count||0) > (patient.verts||0)) {
        const box = new THREE.Box3().setFromObject(o);
        patient = {
          name: o.name,
          type: o.type,
          verts: o.geometry?.attributes?.position?.count,
          poseTripodInfl: o.morphTargetInfluences?.[o.morphTargetDictionary?.pose_tripod],
          box: { min: box.min.toArray(), max: box.max.toArray() },
          worldPos: o.getWorldPosition(new THREE.Vector3()).toArray(),
        };
      }
    }
  });

  // Bounds of scrub-trousers pieces
  const trouserBounds = [];
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (o.name !== 'scrub-trousers' && o.name !== 'scrub-trousers-lining') return;
    const box = new THREE.Box3().setFromObject(o);
    trouserBounds.push({
      name: o.name,
      underlay: !!o.userData?.garmentUnderlay,
      parentUnderlay: !!o.parent?.userData?.garmentUnderlay,
      min: box.min.toArray(),
      max: box.max.toArray(),
      size: box.getSize(new THREE.Vector3()).toArray(),
    });
  });

  // Green seat-ish meshes by material color
  const greenish = [];
  scene.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of mats) {
      const c = m.color;
      if (!c) continue;
      // #68745a-ish olive/green
      if (c.g > 0.35 && c.r > 0.25 && c.r < 0.55 && c.b < 0.45) {
        const box = new THREE.Box3().setFromObject(o);
        greenish.push({ name: o.name, color: c.getHexString(), min: box.min.toArray(), max: box.max.toArray() });
      }
    }
  });

  return { clothing, seats, patient, trouserBounds, greenish, camera: state.camera.position.toArray() };
});

writeFileSync(resolve(outDir, 'probe-metrics.json'), JSON.stringify(metrics, null, 2));
console.log(JSON.stringify(metrics, null, 2));

async function shot(name, cam, target, fov = 35) {
  const dataUrl = await page.evaluate(({ cam, target, fov }) => {
    const state = window.__r3f;
    const V = state.scene.position.constructor;
    const glc = state.gl;
    glc.setAnimationLoop(null);
    const c = glc.domElement;
    if (c?.parentElement) {
      for (const sib of c.parentElement.children) if (sib !== c) sib.style.visibility = 'hidden';
    }
    const camera = state.camera;
    camera.position.set(...cam);
    camera.lookAt(new V(...target));
    camera.fov = fov;
    camera.near = 0.02;
    camera.aspect = c.width / c.height;
    camera.updateProjectionMatrix();
    glc.render(state.scene, camera);
    return glc.domElement.toDataURL('image/png');
  }, { cam, target, fov });
  writeFileSync(resolve(outDir, name), Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
  console.log('wrote', name);
}

await shot('01-full-side-legs.png', [1.6, 0.85, 1.1], [0, 0.55, 0.5], 40);
await shot('02-hips-close.png', [1.1, 0.7, 1.0], [0, 0.55, 0.55], 32);
await shot('03-legs-front.png', [0.1, 0.9, 2.2], [0, 0.5, 0.5], 35);

// Apply NRB via React state if possible — click jump bag
const bagBtn = page.getByRole('button', { name: /Breathing|Oxygen|Spot gear/i }).first();
if (await bagBtn.count()) {
  await bagBtn.click().catch(() => {});
  await page.waitForTimeout(800);
}
const nrb = page.getByRole('button', { name: /Non-rebreather|Non-Rebreather/i }).first();
if (await nrb.count()) {
  await nrb.click().catch(() => {});
  await page.waitForTimeout(500);
  const apply = page.getByRole('button', { name: /^Apply$/i }).first();
  if (await apply.count()) await apply.click().catch(() => {});
  await page.waitForTimeout(2000);
}

// Force treatment id into UI by finding apply path
const applied = await page.evaluate(() => {
  // Try clicking any Apply near Non-rebreather text
  return {
    hasMask: !!document.querySelector('[data-applied-equipment="nonrebreather"], [data-applied-equipment="simple-mask"], [data-applied-equipment="bvm"]'),
    equip: [...document.querySelectorAll('[data-applied-equipment]')].map(e => e.getAttribute('data-applied-equipment')),
  };
});
console.log('equipment', applied);

// Face close-up
const faceBtn = page.locator('.patient-region-selector').getByRole('button', { name: /Face/i }).first();
if (await faceBtn.count()) {
  await faceBtn.click();
  await page.waitForTimeout(1500);
}
await shot('04-face-overview.png', [0.05, 1.55, 1.35], [0.0, 1.45, 0.55], 28);
await shot('05-face-mask-close.png', [0.02, 1.52, 1.05], [0.0, 1.48, 0.55], 22);

await page.screenshot({ path: resolve(outDir, '06-ui-full.png') });
await browser.close();
