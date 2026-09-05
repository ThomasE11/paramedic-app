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
  await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 45_000 });
  await page.waitForTimeout(13000);
}

function writeDataUrl(dataUrl, path) {
  if (!dataUrl?.startsWith('data:image')) return false;
  writeFileSync(path, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
  return true;
}

async function renderShot(page, mode) {
  return page.evaluate((mode) => {
    const state = window.__r3f;
    if (!state?.gl || !state?.scene) return { error: 'no r3f' };
    const V = state.scene.position.constructor;
    let skinned = null;
    state.scene.traverse((o) => {
      if (!skinned && o.isSkinnedMesh && (o.userData?.cyanosisOpenTex || o.userData?.eyesOpenTex || o.name === 'Patient')) skinned = o;
    });
    if (!skinned?.skeleton) return { error: 'no skinned' };
    skinned.updateMatrixWorld(true);
    const tips = [];
    for (const b of skinned.skeleton.bones) {
      if (!/Hand(Index|Middle|Ring|Pinky)3$/i.test(b.name)) continue; // skip thumb for framing
      const p = new V();
      b.getWorldPosition(p);
      tips.push({ name: b.name, x: p.x, y: p.y, z: p.z, right: /RightHand/i.test(b.name) });
    }
    const right = tips.filter((t) => t.right);
    const use = right.length ? right : tips;
    const focus = {
      x: use.reduce((s, t) => s + t.x, 0) / use.length,
      y: use.reduce((s, t) => s + t.y, 0) / use.length,
      z: use.reduce((s, t) => s + t.z, 0) / use.length,
    };

    const glc = state.gl;
    glc.setAnimationLoop(null);
    const c = glc.domElement;
    if (c?.parentElement) {
      for (const sib of c.parentElement.children) if (sib !== c) sib.style.visibility = 'hidden';
    }

    // Build a disposable camera so OrbitControls cannot fight us.
    const cam = state.camera.clone();
    let pos, fov;
    if (mode === 'dorsal') {
      // Above dorsal aspect of fingers
      pos = [focus.x + 0.05, focus.y + 0.18, focus.z + 0.22];
      fov = 20;
    } else if (mode === 'pad') {
      pos = [focus.x - 0.02, focus.y - 0.12, focus.z + 0.18];
      fov = 22;
    } else if (mode === 'close') {
      pos = [focus.x + 0.02, focus.y + 0.08, focus.z + 0.14];
      fov = 18;
    } else {
      pos = [focus.x + 0.08, focus.y + 0.14, focus.z + 0.32];
      fov = 28;
    }
    cam.position.set(...pos);
    cam.lookAt(new V(focus.x, focus.y, focus.z));
    cam.fov = fov;
    cam.near = 0.02;
    cam.far = 50;
    cam.aspect = c.width / c.height;
    cam.updateProjectionMatrix();
    glc.render(state.scene, cam);
    return {
      dataUrl: c.toDataURL('image/png'),
      focus,
      pos,
      fov,
      tipCount: use.length,
    };
  }, mode);
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' }).catch(() => chromium.launch({ headless: true }));
const meta = {};

async function one(spo2) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.setDefaultTimeout(45_000);
  await enter(page, spo2);
  meta[spo2] = {};
  for (const mode of ['wide', 'dorsal', 'pad', 'close']) {
    const shot = await renderShot(page, mode);
    meta[spo2][mode] = { focus: shot.focus, pos: shot.pos, fov: shot.fov, tipCount: shot.tipCount, error: shot.error };
    if (shot.dataUrl) {
      writeDataUrl(shot.dataUrl, resolve(outDir, `nail-plate-${mode}-${spo2}.png`));
    }
  }
  // Canonical brief names = dorsal close framing (nail plates facing camera)
  const canon = await renderShot(page, 'dorsal');
  if (canon.dataUrl) writeDataUrl(canon.dataUrl, resolve(outDir, `nail-plate-${spo2}.png`));
  // Refresh after-hand-bone for Track A compare
  const bone = await renderShot(page, 'wide');
  if (bone.dataUrl) writeDataUrl(bone.dataUrl, resolve(outDir, `after-hand-bone-spo2-${spo2}.png`));
  await page.close();
}

await one(85);
await one(94);
writeFileSync(resolve(outDir, 'nail-plate-render-meta.json'), JSON.stringify(meta, null, 2));
console.log(JSON.stringify(meta, null, 2));
await browser.close();
