import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const base = process.argv[2] ?? 'http://localhost:5173';
const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'test-results/review-2026-09-04/fix-nailbeds');
mkdirSync(outDir, { recursive: true });

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
  await page.waitForTimeout(13000);
  return canvas;
}

async function aimHands(page, mode) {
  return page.evaluate((mode) => {
    const state = window.__r3f;
    const { camera, scene } = state;
    const V = scene.position.constructor;
    let skinned = null;
    scene.traverse((o) => {
      if (!skinned && o.isSkinnedMesh && (o.userData?.cyanosisOpenTex || o.userData?.eyesOpenTex || o.name === 'Patient')) skinned = o;
    });
    if (!skinned?.skeleton) return { error: 'no skinned' };
    skinned.updateMatrixWorld(true);
    const tips = [];
    for (const b of skinned.skeleton.bones) {
      if (!/Hand(Index|Middle|Ring|Pinky|Thumb)3$/i.test(b.name)) continue;
      const p = new V();
      b.getWorldPosition(p);
      tips.push({ name: b.name, x: p.x, y: p.y, z: p.z });
    }
    if (!tips.length) return { error: 'no tip bones' };
    const cx = tips.reduce((s, t) => s + t.x, 0) / tips.length;
    const cy = tips.reduce((s, t) => s + t.y, 0) / tips.length;
    const cz = tips.reduce((s, t) => s + t.z, 0) / tips.length;
    // Prefer right-hand tips for a readable nail plate framing.
    const right = tips.filter((t) => /RightHand/i.test(t.name));
    const focus = right.length ? {
      x: right.reduce((s, t) => s + t.x, 0) / right.length,
      y: right.reduce((s, t) => s + t.y, 0) / right.length,
      z: right.reduce((s, t) => s + t.z, 0) / right.length,
    } : { x: cx, y: cy, z: cz };

    if (mode === 'dorsal') {
      // Above and slightly toward camera so dorsal nail plates face us.
      camera.position.set(focus.x + 0.12, focus.y + 0.22, focus.z + 0.28);
      camera.lookAt(new V(focus.x, focus.y, focus.z));
      camera.fov = 22;
    } else if (mode === 'pad') {
      // From below / palm side to check pad bleed.
      camera.position.set(focus.x - 0.05, focus.y - 0.08, focus.z + 0.22);
      camera.lookAt(new V(focus.x, focus.y + 0.02, focus.z));
      camera.fov = 24;
    } else {
      camera.position.set(focus.x + 0.05, focus.y + 0.12, focus.z + 0.35);
      camera.lookAt(new V(focus.x, focus.y, focus.z));
      camera.fov = 26;
    }
    camera.updateProjectionMatrix();
    if (state.controls) {
      state.controls.target.set(focus.x, focus.y, focus.z);
      state.controls.update();
    }
    if (typeof state.advance === 'function') for (let i = 0; i < 10; i++) state.advance(performance.now() + i * 16, true);
    return { focus, tips: tips.slice(0, 6), mode, cam: [camera.position.x, camera.position.y, camera.position.z] };
  }, mode);
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' }).catch(() => chromium.launch({ headless: true }));
const cams = {};

async function one(spo2) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.setDefaultTimeout(45_000);
  const canvas = await enter(page, spo2);
  await page.waitForTimeout(1000);

  cams[spo2] = {};
  for (const mode of ['wide', 'dorsal', 'pad']) {
    const info = await aimHands(page, mode);
    cams[spo2][mode] = info;
    await page.waitForTimeout(400);
    await canvas.screenshot({ path: resolve(outDir, `nail-plate-${mode}-${spo2}.png`) });
  }
  // Canonical names requested in the task brief.
  await aimHands(page, 'dorsal');
  await page.waitForTimeout(400);
  await canvas.screenshot({ path: resolve(outDir, `nail-plate-${spo2}.png`) });
  await page.close();
}

await one(85);
await one(94);
writeFileSync(resolve(outDir, 'nail-plate-handcam.json'), JSON.stringify(cams, null, 2));
console.log(JSON.stringify(cams, null, 2));
await browser.close();
