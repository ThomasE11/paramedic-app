import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.argv[2] ?? 'http://localhost:5173';
const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'test-results/review-2026-09-04/fix-nailbeds');
mkdirSync(outDir, { recursive: true });

// Keep Track-A pad-bleed baselines as before-* for visual compare.
for (const name of [
  'after-atlas-hands-strip-spo2-85.png',
  'after-atlas-hands-strip-spo2-94.png',
  'after-crop-tipMid-spo2-85.png',
  'after-crop-tipMid-spo2-94.png',
  'after-hand-bone-spo2-85.png',
  'after-hand-bone-spo2-94.png',
]) {
  const src = resolve(outDir, name);
  const dst = resolve(outDir, name.replace(/^after-/, 'before-pad-'));
  if (existsSync(src) && !existsSync(dst)) copyFileSync(src, dst);
}

async function enter(page, spo2) {
  await page.addInitScript((seed) => {
    try { sessionStorage.setItem('capturePinQuality', '1'); } catch {}
    try { sessionStorage.setItem('captureSpo2', String(seed)); } catch {}
  }, spo2);
  await page.goto(`${base}/?capture&devLiveCase=resp-001&model=male&spo2=${spo2}`, { waitUntil: 'domcontentloaded' });
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
  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ state: 'visible', timeout: 45_000 });
  await page.waitForTimeout(12000);
  return canvas;
}

async function probeAndAtlas(page) {
  return page.evaluate(() => {
    const scene = window.__r3f?.scene;
    if (!scene) return { error: 'no scene' };
    let body = null;
    scene.traverse((o) => {
      if (!body && o.isMesh && (o.userData?.cyanosisOpenTex || o.userData?.eyesOpenTex)) body = o;
    });
    if (!body) return { error: 'no body' };
    const mat = Array.isArray(body.material) ? body.material[0] : body.material;
    const cyan = body.userData.cyanosisOpenTex;
    const activeIsCyanosis = !!(cyan && mat?.map === cyan);
    const tex = activeIsCyanosis ? cyan : (mat?.map || cyan || body.userData.cleanOpenTex);
    const img = tex?.image;
    if (!img?.width) return { error: 'no atlas', activeIsCyanosis };

    const pos = body.geometry.attributes.position;
    const uv = body.geometry.attributes.uv;
    const nrm = body.geometry.attributes.normal;
    const w = img.width, h = img.height;
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const ctx = off.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, w, h).data;

    const isLip = (x, y, z) => y >= 1.56 && y <= 1.59 && Math.abs(x) < 0.06 && z >= 0.08;
    const isNailGeom = (x, y, z) => {
      const lateralTip = Math.abs(x) >= 0.53 && y >= 0.915 && y <= 0.96 && z >= 0.30;
      const forwardTip = Math.abs(x) >= 0.49 && y >= 0.95 && y <= 0.985 && z >= 0.34;
      return lateralTip || forwardTip;
    };
    const isPlate = (v, nz) => v >= 0.945 && nz >= 0.15;

    const avg = (list) => {
      if (!list.length) return [0, 0, 0];
      const s = [0, 0, 0];
      for (const c of list) { s[0] += c[0]; s[1] += c[1]; s[2] += c[2]; }
      return s.map((v) => Number((v / list.length).toFixed(1)));
    };

    const lips = [], plates = [], pads = [], forehead = [];
    const seenP = new Set(), seenPad = new Set(), seenL = new Set();
    let plateN = 0, padN = 0, legacyV935 = 0;
    const platePx = [];

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const u = uv.getX(i), v = uv.getY(i);
      const nz = nrm ? nrm.getZ(i) : 1;
      if (y >= 1.62 && y <= 1.68 && Math.abs(x) < 0.05 && z > 0.05) {
        const px = Math.min(w - 1, Math.max(0, Math.floor(u * w)));
        const py = Math.min(h - 1, Math.max(0, Math.floor(v * h)));
        const idx = (py * w + px) * 4;
        forehead.push([data[idx], data[idx + 1], data[idx + 2]]);
      }
      if (isLip(x, y, z)) {
        const key = `${(u * 200) | 0}:${(v * 200) | 0}`;
        if (seenL.has(key)) continue; seenL.add(key);
        const px = Math.min(w - 1, Math.max(0, Math.floor(u * w)));
        const py = Math.min(h - 1, Math.max(0, Math.floor(v * h)));
        const idx = (py * w + px) * 4;
        lips.push([data[idx], data[idx + 1], data[idx + 2]]);
      } else if (isNailGeom(x, y, z)) {
        if (v >= 0.935) legacyV935++;
        const px = Math.min(w - 1, Math.max(0, Math.floor(u * w)));
        const py = Math.min(h - 1, Math.max(0, Math.floor(v * h)));
        const idx = (py * w + px) * 4;
        const rgb = [data[idx], data[idx + 1], data[idx + 2]];
        if (isPlate(v, nz)) {
          plateN++;
          const key = `${(u * 200) | 0}:${(v * 200) | 0}`;
          if (!seenP.has(key)) {
            seenP.add(key);
            plates.push(rgb);
            platePx.push({ px, py, u, v, nz });
          }
        } else if (v >= 0.945 && nz < 0.15) {
          padN++;
          const key = `${(u * 200) | 0}:${(v * 200) | 0}`;
          if (!seenPad.has(key)) {
            seenPad.add(key);
            pads.push(rgb);
          }
        }
      }
    }

    const crop = (x, y, cw, ch, scale = 4) => {
      const c = document.createElement('canvas');
      c.width = cw * scale; c.height = ch * scale;
      const cctx = c.getContext('2d');
      cctx.imageSmoothingEnabled = false;
      cctx.drawImage(img, x, y, cw, ch, 0, 0, cw * scale, ch * scale);
      return c.toDataURL('image/png');
    };

    // Hands strip from tip UV bounds (left+right distal islands).
    const hsX = Math.floor(0.36 * w), hsY = Math.floor(0.86 * h);
    const hsW = Math.floor(0.40 * w), hsH = Math.floor(0.14 * h);
    // Mid tip island (left forward tips ~ u 0.49-0.51, v 0.97-0.99)
    const tipX = Math.floor(0.48 * w) - 40, tipY = Math.floor(0.96 * h) - 40;
    // Left pinky tip ~ u 0.41, v 0.95
    const tipLX = Math.floor(0.405 * w) - 30, tipLY = Math.floor(0.945 * h) - 30;
    // Lips
    const lipX = 1740, lipY = 1020;

    return {
      spo2Seed: sessionStorage.getItem('captureSpo2'),
      meshName: body.name,
      activeIsCyanosis,
      hasCyanosisOpenTex: !!cyan,
      plateN,
      padN,
      legacyV935,
      lipN: lips.length,
      plateUnique: plates.length,
      padUnique: pads.length,
      plateAvgRgb: avg(plates),
      padAvgRgb: avg(pads),
      lipAvgRgb: avg(lips),
      foreheadAvgRgb: avg(forehead.slice(0, 200)),
      atlas: {
        handsStrip: crop(hsX, hsY, hsW, hsH, 2),
        tipMid: crop(tipX, tipY, 100, 100, 6),
        tipL: crop(tipLX, tipLY, 80, 80, 6),
        lips: crop(lipX, lipY, 120, 120, 4),
        fullHandsMeta: { hsX, hsY, hsW, hsH, tipX, tipY, tipLX, tipLY },
      },
    };
  });
}

async function handCam(page) {
  await page.evaluate(() => {
    const state = window.__r3f;
    const { camera, scene } = state;
    const V = scene.position.constructor;
    camera.position.set(0.35, 1.05, 0.85);
    camera.lookAt(new V(0.45, 0.95, 0.05));
    camera.fov = 28;
    camera.updateProjectionMatrix();
    if (state.controls) { state.controls.target.set(0.45, 0.95, 0.05); state.controls.update(); }
    if (typeof state.advance === 'function') for (let i = 0; i < 8; i++) state.advance(performance.now() + i * 16, true);
  });
  await page.waitForTimeout(500);
}

async function dorsalNailCam(page) {
  // Slightly above/back of right hand so nail plates face camera more than pads.
  await page.evaluate(() => {
    const state = window.__r3f;
    const { camera, scene } = state;
    const V = scene.position.constructor;
    camera.position.set(0.55, 1.15, 0.55);
    camera.lookAt(new V(0.42, 0.92, 0.15));
    camera.fov = 24;
    camera.updateProjectionMatrix();
    if (state.controls) { state.controls.target.set(0.42, 0.92, 0.15); state.controls.update(); }
    if (typeof state.advance === 'function') for (let i = 0; i < 8; i++) state.advance(performance.now() + i * 16, true);
  });
  await page.waitForTimeout(500);
}

function writeDataUrl(dataUrl, path) {
  if (!dataUrl) return;
  const b64 = dataUrl.replace(/^data:image\/png;base64,/, '');
  writeFileSync(path, Buffer.from(b64, 'base64'));
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' }).catch(() => chromium.launch({ headless: true }));

async function one(spo2) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.setDefaultTimeout(45_000);
  const canvas = await enter(page, spo2);
  await page.waitForTimeout(1500);
  const p = await probeAndAtlas(page);

  writeDataUrl(p.atlas?.handsStrip, resolve(outDir, `nail-plate-atlas-hands-spo2-${spo2}.png`));
  writeDataUrl(p.atlas?.tipMid, resolve(outDir, `nail-plate-crop-tipMid-spo2-${spo2}.png`));
  writeDataUrl(p.atlas?.tipL, resolve(outDir, `nail-plate-crop-tipL-spo2-${spo2}.png`));
  writeDataUrl(p.atlas?.lips, resolve(outDir, `nail-plate-crop-lips-spo2-${spo2}.png`));

  await handCam(page);
  await canvas.screenshot({ path: resolve(outDir, `nail-plate-${spo2}.png`) });
  await dorsalNailCam(page);
  await canvas.screenshot({ path: resolve(outDir, `nail-plate-dorsal-${spo2}.png`) });

  // Also refresh after-* names used in Track A so after/before compare stays current.
  writeDataUrl(p.atlas?.handsStrip, resolve(outDir, `after-atlas-hands-strip-spo2-${spo2}.png`));
  writeDataUrl(p.atlas?.tipMid, resolve(outDir, `after-crop-tipMid-spo2-${spo2}.png`));
  await handCam(page);
  await canvas.screenshot({ path: resolve(outDir, `after-hand-bone-spo2-${spo2}.png`) });

  delete p.atlas;
  await page.close();
  return p;
}

const p85 = await one(85);
const p94 = await one(94);
const plate85 = p85.plateAvgRgb || [0, 0, 0];
const plate94 = p94.plateAvgRgb || [0, 0, 0];
const pad85 = p85.padAvgRgb || [0, 0, 0];
const lip85 = p85.lipAvgRgb || [0, 0, 0];
const lip94 = p94.lipAvgRgb || [0, 0, 0];
const deltaPlate = plate85.map((v, i) => Number((v - plate94[i]).toFixed(1)));
const deltaLip = lip85.map((v, i) => Number((v - lip94[i]).toFixed(1)));

const nailsDusky = p85.activeIsCyanosis === true && p94.activeIsCyanosis === false
  && (deltaPlate[0] < -1 || (plate85[2] - plate85[0]) > (plate94[2] - plate94[0] + 0.5));
const lipsOk = (p85.lipN || 0) > 0 && (p94.lipN || 0) > 0 && deltaLip[0] < 0;
const padClearerThanPlate = (pad85[0] - plate85[0]) > 2; // pad should stay warmer/pinker than tinted plate @85
const pass = nailsDusky && lipsOk && (p85.plateN || 0) > 20 && (p85.padN || 0) > 0;

const report = {
  goal: 'Nail-plate cyanosis SpO2 85 dusky / 94 clear; less fingertip-pad bleed; lips OK',
  pass,
  files_changed: [
    'src/components/Body3DModel/MottlingLayer.ts',
    'src/components/Body3DModel/skinTint.test.ts',
  ],
  fix: 'isCyanoticNailPlateSample(V>=0.945 && nz>=0.15); smaller nail radius; 10px UV cells',
  unit_tests: 'vitest skinTint.test.ts — 9/9 passed',
  spo285: p85,
  spo294: p94,
  deltaPlate_85_minus_94: deltaPlate,
  deltaLip_85_minus_94: deltaLip,
  pad_vs_plate_R_at_85: Number(((pad85[0] || 0) - (plate85[0] || 0)).toFixed(1)),
  interpretation: {
    nailsDusky,
    lipsOk,
    padClearerThanPlate,
    gate: `active@85=${p85.activeIsCyanosis} cleared@94=${p94.activeIsCyanosis === false}`,
  },
  key_screenshots: [
    'nail-plate-85.png',
    'nail-plate-94.png',
    'nail-plate-atlas-hands-spo2-85.png',
    'nail-plate-atlas-hands-spo2-94.png',
    'nail-plate-crop-tipMid-spo2-85.png',
    'nail-plate-crop-tipMid-spo2-94.png',
    'before-pad-after-atlas-hands-strip-spo2-85.png',
    'before-pad-after-crop-tipMid-spo2-85.png',
  ],
};
// Fix before names - we copied after-* to before-pad-*
report.key_screenshots = [
  'nail-plate-85.png',
  'nail-plate-94.png',
  'nail-plate-atlas-hands-spo2-85.png',
  'nail-plate-atlas-hands-spo2-94.png',
  'nail-plate-crop-tipMid-spo2-85.png',
  'nail-plate-crop-tipMid-spo2-94.png',
  'before-pad-atlas-hands-strip-spo2-85.png',
  'before-pad-crop-tipMid-spo2-85.png',
  'before-pad-hand-bone-spo2-85.png',
];

writeFileSync(resolve(outDir, 'NAIL_PLATE_TIGHTEN_REPORT.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
process.exitCode = pass ? 0 : 1;
