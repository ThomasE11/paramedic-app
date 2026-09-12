import { chromium } from 'playwright';

const base = 'http://localhost:5173';

async function inspect(caseId) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.setDefaultTimeout(60_000);
  await page.addInitScript(() => {
    try { sessionStorage.setItem('capturePinQuality', '1'); } catch {}
  });
  await page.goto(`${base}/?capture&devLiveCase=${caseId}&model=male`, { waitUntil: 'networkidle' });
  await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 45_000 });
  await page.waitForTimeout(9000);
  const result = await page.evaluate(async () => {
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const state = window.__r3f.get?.() ?? window.__r3f;
    if (!state?.scene) return { error: 'no r3f' };
    const scene = state.scene;
    scene.updateMatrixWorld(true);
    const names = [];
    const seats = [];
    scene.traverse(o => {
      if (o.name && /chair|seat|ottoman|stretcher|sofa|bed/i.test(o.name)) names.push(o.name);
      if (o.name && /chair|seat/i.test(o.name)) {
        const box = new THREE.Box3().setFromObject(o);
        if (!box.isEmpty()) {
          seats.push({
            name: o.name,
            min: box.min.toArray().map(n => +n.toFixed(3)),
            max: box.max.toArray().map(n => +n.toFixed(3)),
            size: box.getSize(new THREE.Vector3()).toArray().map(n => +n.toFixed(3)),
          });
        }
      }
    });
    let pelvisY = null;
    scene.traverse(o => {
      if (!o.isSkinnedMesh || o.name !== 'Patient' || !o.skeleton) return;
      const bone = o.skeleton.bones.find(b => /pelvis|hips/i.test(b.name || ''));
      if (bone) pelvisY = +bone.getWorldPosition(new THREE.Vector3()).y.toFixed(3);
    });
    return { names, seats, pelvisY };
  });
  await browser.close();
  return result;
}

for (const id of ['y1-013', 'resp-001', 'trauma-001']) {
  try {
    const r = await inspect(id);
    console.log('\n===', id);
    console.log(JSON.stringify(r, null, 2));
  } catch (err) {
    console.log('\n===', id, 'FAILED', err.message);
  }
}
