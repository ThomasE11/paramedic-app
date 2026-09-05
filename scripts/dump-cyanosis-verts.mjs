import { chromium } from 'playwright';

async function dumpVerts() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.setDefaultTimeout(40000);

  await page.addInitScript((val) => {
    try { window.sessionStorage.setItem('captureSpo2', String(val)); } catch {}
    try { window.sessionStorage.setItem('capturePinQuality', '1'); } catch {}
  }, 85);

  await page.goto(`http://localhost:5173/?capture&devLiveCase=resp-001&spo2=85`, { waitUntil: 'networkidle' });

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

  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ state: 'visible' });
  await page.waitForTimeout(12000);

  const result = await page.evaluate(() => {
    const state = window.__r3f;
    if (!state) return null;
    let body = null;
    state.scene.traverse((o) => {
      if (!body && o.isMesh && o.name === 'Patient') body = o;
    });
    if (!body) return { noBody: true };

    const pos = body.geometry.attributes.position;
    const uv = body.geometry.attributes.uv;
    body.updateWorldMatrix(true, false);

    // Walk up to root like buildCyanosisLocalTwin
    let root = body;
    while (root.parent && root.parent.type !== 'Scene') root = root.parent;
    root.updateMatrixWorld(true);
    body.updateMatrixWorld(true);

    const THREE = window.THREE || {};
    // Reconstruct Vector3-like without THREE if needed
    const mw = body.matrixWorld.elements;
    const rootInv = root.matrixWorld.clone().invert();

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    let lipLocal = 0, nailLocal = 0, lipWorld = 0, nailWorld = 0;
    const faceSamples = [];
    const handSamples = [];
    const yHist = {};

    const applyMat4 = (x, y, z, e) => {
      const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
      return {
        x: (e[0] * x + e[4] * y + e[8] * z + e[12]) * w,
        y: (e[1] * x + e[5] * y + e[9] * z + e[13]) * w,
        z: (e[2] * x + e[6] * y + e[10] * z + e[14]) * w,
      };
    };

    for (let i = 0; i < pos.count; i++) {
      const lx = pos.getX(i), ly = pos.getY(i), lz = pos.getZ(i);
      if (lx < minX) minX = lx; if (lx > maxX) maxX = lx;
      if (ly < minY) minY = ly; if (ly > maxY) maxY = ly;
      if (lz < minZ) minZ = lz; if (lz > maxZ) maxZ = lz;

      const bucket = Math.floor(ly * 10) / 10;
      yHist[bucket] = (yHist[bucket] || 0) + 1;

      const isLipL = ly >= 1.56 && ly <= 1.59 && Math.abs(lx) < 0.06 && lz >= 0.08;
      const isNailL = ly >= 0.75 && ly <= 0.85 && Math.abs(lx) >= 0.08 && Math.abs(lx) <= 0.22 && lz >= 0.08;
      if (isLipL) lipLocal++;
      if (isNailL) nailLocal++;

      // world then root-local (what the runtime actually uses)
      const world = applyMat4(lx, ly, lz, mw);
      const localV = applyMat4(world.x, world.y, world.z, rootInv.elements);
      const isLip = localV.y >= 1.56 && localV.y <= 1.59 && Math.abs(localV.x) < 0.06 && localV.z >= 0.08;
      const isNail = localV.y >= 0.75 && localV.y <= 0.85 && Math.abs(localV.x) >= 0.08 && Math.abs(localV.x) <= 0.22 && localV.z >= 0.08;
      if (isLip) lipWorld++;
      if (isNail) nailWorld++;

      if (ly > 1.50 && lz > 0.05 && Math.abs(lx) < 0.12 && faceSamples.length < 12) {
        faceSamples.push({ i, lx: +lx.toFixed(3), ly: +ly.toFixed(3), lz: +lz.toFixed(3), wx: +world.x.toFixed(3), wy: +world.y.toFixed(3), wz: +world.z.toFixed(3), rx: +localV.x.toFixed(3), ry: +localV.y.toFixed(3), rz: +localV.z.toFixed(3) });
      }
      if (ly > 0.7 && ly < 0.95 && Math.abs(lx) > 0.1 && handSamples.length < 12) {
        handSamples.push({ i, lx: +lx.toFixed(3), ly: +ly.toFixed(3), lz: +lz.toFixed(3), rx: +localV.x.toFixed(3), ry: +localV.y.toFixed(3), rz: +localV.z.toFixed(3) });
      }
    }

    // highest-Y verts (crown) and most-forward-Z verts around head
    let crownY = -Infinity, forwardZ = -Infinity;
    let crown = null, forward = null;
    for (let i = 0; i < pos.count; i++) {
      const lx = pos.getX(i), ly = pos.getY(i), lz = pos.getZ(i);
      if (ly > crownY) { crownY = ly; crown = { lx, ly, lz }; }
      if (lz > forwardZ && ly > 1.4) { forwardZ = lz; forward = { lx, ly, lz }; }
    }

    return {
      posCount: pos.count,
      localBounds: { minX, maxX, minY, maxY, minZ, maxZ },
      lipLocal, nailLocal, lipWorld, nailWorld,
      crown, forward,
      faceSamples,
      handSamples,
      yHistKeys: Object.keys(yHist).sort((a,b)=>Number(a)-Number(b)),
      yHistHead: Object.fromEntries(Object.entries(yHist).filter(([k]) => Number(k) >= 1.4)),
      yHistHands: Object.fromEntries(Object.entries(yHist).filter(([k]) => Number(k) >= 0.6 && Number(k) <= 1.0)),
      hasCyanosisOpen: !!body.userData.cyanosisOpenTex,
      hasEyesOpen: !!body.userData.eyesOpenTex,
      parentType: body.parent?.type,
      parentName: body.parent?.name,
      rootType: root.type,
      rootName: root.name,
    };
  });

  await browser.close();
  console.log(JSON.stringify(result, null, 2));
}

await dumpVerts();
