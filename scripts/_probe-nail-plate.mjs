import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const outDir = resolve('/Users/eliastlcthomas/Projects/app/test-results/review-2026-09-04/fix-nailbeds');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true, channel: 'chrome' }).catch(() => chromium.launch({ headless: true }));
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(45000);
await page.addInitScript(() => {
  try { sessionStorage.setItem('capturePinQuality', '1'); } catch {}
  try { sessionStorage.setItem('captureSpo2', '85'); } catch {}
});
await page.goto('http://localhost:5173/?capture&devLiveCase=resp-001&model=male&spo2=85', { waitUntil: 'domcontentloaded' });
await page.getByRole('button', { name: /Start Training/i }).first().click({ timeout: 12_000 }).catch(() => {});
await page.getByRole('button', { name: /Skip Tour/i }).click({ timeout: 4_000 }).catch(() => {});
let ready = await page.locator('canvas').first().isVisible().catch(() => false);
if (!ready) {
  await page.getByRole('button', { name: /Launch smart case|Generate Case/i }).first().click({ timeout: 15_000 }).catch(() => {});
  await page.getByRole('button', { name: /Begin Scene Survey/i }).click();
  await page.getByRole('button', { name: /^Next$/i }).click();
  await page.getByRole('button', { name: /None identified/i }).click();
  await page.getByRole('button', { name: /Scene is safe/i }).click();
  await page.getByRole('button', { name: /Enter Scene/i }).click();
}
await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 45000 });
await page.waitForTimeout(12000);

const report = await page.evaluate(() => {
  const scene = window.__r3f?.scene;
  if (!scene) return { error: 'no scene' };
  let body = null;
  scene.traverse((o) => {
    if (!body && o.isMesh && (o.userData?.cyanosisOpenTex || o.userData?.eyesOpenTex)) body = o;
  });
  if (!body) return { error: 'no body' };
  const geom = body.geometry;
  const pos = geom.attributes.position;
  const uv = geom.attributes.uv;
  const nrm = geom.attributes.normal;
  const skinIndex = geom.attributes.skinIndex;
  const skinWeight = geom.attributes.skinWeight;
  const bones = body.skeleton?.bones?.map((b) => b.name) || [];
  const distalBoneIdx = new Set();
  bones.forEach((name, i) => {
    if (/Hand(Index|Middle|Ring|Pinky|Thumb)3$/i.test(name)) distalBoneIdx.add(i);
  });

  const isNailGeom = (x, y, z) => {
    const lateralTip = Math.abs(x) >= 0.53 && y >= 0.915 && y <= 0.96 && z >= 0.30;
    const forwardTip = Math.abs(x) >= 0.49 && y >= 0.95 && y <= 0.985 && z >= 0.34;
    return lateralTip || forwardTip;
  };

  const samples = [];
  const buckets = {
    v935: { n: 0, nzSum: 0, nySum: 0, zSum: 0, distalW: 0 },
    v95: { n: 0, nzSum: 0, nySum: 0, zSum: 0, distalW: 0 },
    v96: { n: 0, nzSum: 0, nySum: 0, zSum: 0, distalW: 0 },
    v97: { n: 0, nzSum: 0, nySum: 0, zSum: 0, distalW: 0 },
    dorsalNz: { n: 0, vMin: 1, vMax: 0, u: [] },
    padNz: { n: 0, vMin: 1, vMax: 0, u: [] },
  };

  const uByFinger = {};

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    if (!isNailGeom(x, y, z)) continue;
    const u = uv.getX(i), v = uv.getY(i);
    const nx = nrm ? nrm.getX(i) : 0;
    const ny = nrm ? nrm.getY(i) : 0;
    const nz = nrm ? nrm.getZ(i) : 0;
    let distalW = 0;
    if (skinIndex && skinWeight) {
      const idxs = [skinIndex.getX(i), skinIndex.getY(i), skinIndex.getZ(i), skinIndex.getW(i)];
      const ws = [skinWeight.getX(i), skinWeight.getY(i), skinWeight.getZ(i), skinWeight.getW(i)];
      for (let k = 0; k < 4; k++) if (distalBoneIdx.has(idxs[k])) distalW += ws[k];
    }
    const side = x < 0 ? 'L' : 'R';
    const fingerKey = `${side}:${(Math.abs(x) * 20 | 0) / 20}`;
    if (!uByFinger[fingerKey]) uByFinger[fingerKey] = [];
    if (v >= 0.935) uByFinger[fingerKey].push({ u, v, nx, ny, nz, z, y, distalW });

    const pushBucket = (name, ok) => {
      if (!ok) return;
      const b = buckets[name];
      b.n++; b.nzSum += nz; b.nySum += ny; b.zSum += z; b.distalW += distalW;
    };
    pushBucket('v935', v >= 0.935);
    pushBucket('v95', v >= 0.95);
    pushBucket('v96', v >= 0.96);
    pushBucket('v97', v >= 0.97);

    if (v >= 0.935) {
      if (nz >= 0.15) {
        buckets.dorsalNz.n++;
        buckets.dorsalNz.vMin = Math.min(buckets.dorsalNz.vMin, v);
        buckets.dorsalNz.vMax = Math.max(buckets.dorsalNz.vMax, v);
        if (buckets.dorsalNz.u.length < 12) buckets.dorsalNz.u.push({ u:+u.toFixed(4), v:+v.toFixed(4), nz:+nz.toFixed(3), ny:+ny.toFixed(3), z:+z.toFixed(3), distalW:+distalW.toFixed(2), side });
      }
      if (nz < 0) {
        buckets.padNz.n++;
        buckets.padNz.vMin = Math.min(buckets.padNz.vMin, v);
        buckets.padNz.vMax = Math.max(buckets.padNz.vMax, v);
        if (buckets.padNz.u.length < 12) buckets.padNz.u.push({ u:+u.toFixed(4), v:+v.toFixed(4), nz:+nz.toFixed(3), ny:+ny.toFixed(3), z:+z.toFixed(3), distalW:+distalW.toFixed(2), side });
      }
    }

    if (samples.length < 40 && v >= 0.935) {
      samples.push({
        i, x:+x.toFixed(3), y:+y.toFixed(3), z:+z.toFixed(3),
        u:+u.toFixed(4), v:+v.toFixed(4),
        nx:+nx.toFixed(3), ny:+ny.toFixed(3), nz:+nz.toFixed(3),
        distalW:+distalW.toFixed(2),
      });
    }
  }

  const avg = (b) => b.n ? {
    n: b.n,
    nz: +(b.nzSum / b.n).toFixed(3),
    ny: +(b.nySum / b.n).toFixed(3),
    z: +(b.zSum / b.n).toFixed(3),
    distalW: +(b.distalW / b.n).toFixed(3),
  } : { n: 0 };

  // Propose nail-plate selection counts under various gates
  const gates = {};
  const testGates = [
    ['cur_v935', (p) => p.v >= 0.935],
    ['v95', (p) => p.v >= 0.95],
    ['v96', (p) => p.v >= 0.96],
    ['v935_nz015', (p) => p.v >= 0.935 && p.nz >= 0.15],
    ['v935_nz025', (p) => p.v >= 0.935 && p.nz >= 0.25],
    ['v95_nz015', (p) => p.v >= 0.95 && p.nz >= 0.15],
    ['v95_nz0', (p) => p.v >= 0.95 && p.nz >= 0],
    ['v935_nz0_dw05', (p) => p.v >= 0.935 && p.nz >= 0 && p.distalW >= 0.5],
    ['v948_nz02', (p) => p.v >= 0.948 && p.nz >= 0.2],
    ['v94_nz02_z032', (p) => p.v >= 0.94 && p.nz >= 0.2 && p.z >= 0.32],
  ];
  for (const [name] of testGates) gates[name] = { n: 0, nz: 0, padish: 0, dorsalish: 0 };

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    if (!isNailGeom(x, y, z)) continue;
    const u = uv.getX(i), v = uv.getY(i);
    const nz = nrm ? nrm.getZ(i) : 0;
    const ny = nrm ? nrm.getY(i) : 0;
    let distalW = 0;
    if (skinIndex && skinWeight) {
      const idxs = [skinIndex.getX(i), skinIndex.getY(i), skinIndex.getZ(i), skinIndex.getW(i)];
      const ws = [skinWeight.getX(i), skinWeight.getY(i), skinWeight.getZ(i), skinWeight.getW(i)];
      for (let k = 0; k < 4; k++) if (distalBoneIdx.has(idxs[k])) distalW += ws[k];
    }
    const p = { u, v, nz, ny, z, distalW };
    for (const [name, fn] of testGates) {
      if (!fn(p)) continue;
      gates[name].n++;
      gates[name].nz += nz;
      if (nz < 0.05) gates[name].padish++;
      if (nz >= 0.2) gates[name].dorsalish++;
    }
  }
  for (const g of Object.values(gates)) {
    if (g.n) g.nzAvg = +(g.nz / g.n).toFixed(3);
    delete g.nz;
  }

  const fingerSummary = {};
  for (const [k, arr] of Object.entries(uByFinger)) {
    if (!arr.length) continue;
    const us = arr.map((a) => a.u).sort((a, b) => a - b);
    const vs = arr.map((a) => a.v).sort((a, b) => a - b);
    const nzs = arr.map((a) => a.nz);
    fingerSummary[k] = {
      n: arr.length,
      u: [+us[0].toFixed(4), +us[us.length - 1].toFixed(4)],
      v: [+vs[0].toFixed(4), +vs[vs.length - 1].toFixed(4)],
      nzAvg: +(nzs.reduce((a, b) => a + b, 0) / nzs.length).toFixed(3),
      nzNeg: nzs.filter((z) => z < 0).length,
      nzPos: nzs.filter((z) => z >= 0.15).length,
    };
  }

  return {
    boneCount: bones.length,
    distalBones: bones.filter((n) => /Hand(Index|Middle|Ring|Pinky|Thumb)3$/i.test(n)),
    buckets: {
      v935: avg(buckets.v935),
      v95: avg(buckets.v95),
      v96: avg(buckets.v96),
      v97: avg(buckets.v97),
      dorsalNz: { n: buckets.dorsalNz.n, v: [buckets.dorsalNz.vMin, buckets.dorsalNz.vMax], samples: buckets.dorsalNz.u },
      padNz: { n: buckets.padNz.n, v: [buckets.padNz.vMin, buckets.padNz.vMax], samples: buckets.padNz.u },
    },
    gates,
    fingerSummary,
    samples,
  };
});

writeFileSync(resolve(outDir, 'nail-plate-uv-normal-probe.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
