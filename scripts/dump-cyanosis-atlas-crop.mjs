import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

async function dump(spo2) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  page.setDefaultTimeout(40000);

  await page.addInitScript((val) => {
    try { window.sessionStorage.setItem('captureSpo2', String(val)); } catch {}
    try { window.sessionStorage.setItem('capturePinQuality', '1'); } catch {}
  }, spo2);

  await page.goto(`http://localhost:5173/?capture&devLiveCase=resp-001&spo2=${spo2}`, { waitUntil: 'networkidle' });

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
    if (!state) return { error: 'no r3f' };
    let body = null;
    state.scene.traverse((o) => {
      if (!body && o.isMesh && o.userData?.eyesOpenTex) body = o;
    });
    if (!body) return { error: 'no body' };

    const mat = Array.isArray(body.material) ? body.material[0] : body.material;
    const ud = body.userData;
    const active = mat.map?.image;
    const cyan = ud.cyanosisOpenTex?.image;
    const clean = ud.cleanOpenTex?.image ?? ud.eyesOpenTex?.image;
    const src = cyan ?? active;
    if (!src?.width) return { error: 'no canvas', w: src?.width };

    const crop = (img, x, y, w, h, scale) => {
      const c = document.createElement('canvas');
      c.width = w * scale;
      c.height = h * scale;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, x, y, w, h, 0, 0, w * scale, h * scale);
      return c.toDataURL('image/png');
    };

    // Lip UV island ≈ u 0.86–0.89, v 0.51–0.54 on 2048 atlas → px 1760–1825, py 1045–1110
    const lipX = 1740, lipY = 1020, lipW = 120, lipH = 120;
    const nailX = 240, nailY = 420, nailW = 80, nailH = 80;

    const sample = (img, x, y) => {
      if (!img) return null;
      const ctx = img.getContext('2d');
      const d = ctx.getImageData(x, y, 1, 1).data;
      return { x, y, r: d[0], g: d[1], b: d[2] };
    };

    return {
      spo2: window.sessionStorage.getItem('captureSpo2'),
      activeIs: mat.map === ud.cyanosisOpenTex ? 'cyanosis'
        : mat.map === ud.eyesOpenTex ? 'clean-open' : 'other',
      sizes: { src: src.width, cyan: cyan?.width ?? 0, clean: clean?.width ?? 0 },
      lipSample: {
        active: sample(src, 1773, 1058),
        clean: clean ? sample(clean, 1773, 1058) : null,
        cyan: cyan ? sample(cyan, 1773, 1058) : null,
      },
      lipCrop: crop(src, lipX, lipY, lipW, lipH, 8),
      cleanLipCrop: clean ? crop(clean, lipX, lipY, lipW, lipH, 8) : null,
      nailCrop: crop(src, nailX, nailY, nailW, nailH, 8),
    };
  });

  if (result.error) {
    console.log(JSON.stringify(result));
    await browser.close();
    return;
  }

  const writeDataUrl = (dataUrl, path) => {
    if (!dataUrl) return;
    const b64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    writeFileSync(path, Buffer.from(b64, 'base64'));
    console.log(`wrote ${path}`);
  };

  writeDataUrl(result.lipCrop, `test-results/resp001-atlas-lip-${spo2}.png`);
  writeDataUrl(result.cleanLipCrop, `test-results/resp001-atlas-lip-clean-${spo2}.png`);
  writeDataUrl(result.nailCrop, `test-results/resp001-atlas-nail-${spo2}.png`);
  console.log(JSON.stringify({
    spo2: result.spo2,
    activeIs: result.activeIs,
    sizes: result.sizes,
    lipSample: result.lipSample,
  }, null, 2));

  // Disable OrbitControls, pin camera on mouth, screenshot WebGL
  await page.evaluate(() => {
    const state = window.__r3f;
    const cam = state.camera;
    const controls = state.controls;
    if (controls) {
      controls.enabled = false;
      controls.minDistance = 0.05;
      controls.maxDistance = 20;
      controls.target.set(0, 1.58, 0.16);
      controls.update();
    }
    cam.position.set(0, 1.59, 0.38);
    cam.lookAt(0, 1.58, 0.16);
    cam.fov = 24;
    cam.near = 0.01;
    cam.updateProjectionMatrix();
    const canvasEl = state.gl.domElement;
    if (canvasEl?.parentElement) {
      for (const sib of canvasEl.parentElement.children) {
        if (sib !== canvasEl) sib.style.visibility = 'hidden';
      }
    }
  });
  await page.waitForTimeout(400);
  await canvas.screenshot({ path: `test-results/resp001-mouth-pin-${spo2}.png` });
  console.log(`saved test-results/resp001-mouth-pin-${spo2}.png`);

  await browser.close();
}

await dump(85);
await dump(94);
