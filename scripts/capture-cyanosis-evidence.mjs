import { chromium } from 'playwright';

const outDir = '/Users/eliastlcthomas/Projects/app/test-results';

async function capture(outName, spo2) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
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
    if (!state) return { found: false };

    const root = state.scene;
    let body = null;
    let cyanosisCanvas = null;

    root.traverse((o) => {
      if (!body && o.isMesh && o.userData?.eyesOpenTex && o.userData.cyanosisOpenTex) {
        body = o;
        const tex = o.userData.cyanosisOpenTex;
        if (tex?.image) cyanosisCanvas = tex.image;
      }
    });

    if (!body || !cyanosisCanvas) return { found: false, hasBody: !!body, hasCyanosisCanvas: !!cyanosisCanvas };

    const pos = body.geometry.attributes.position;
    const counts = { lip: 0, nail: 0 };
    const mat = Array.isArray(body.material) ? body.material[0] : body.material;

    const sample = (x, y) => {
      const ctx = cyanosisCanvas.getContext('2d');
      if (!ctx) return null;
      const px = Math.max(0, Math.min(cyanosisCanvas.width - 1, Math.round(x)));
      const py = Math.max(0, Math.min(cyanosisCanvas.height - 1, Math.round(y)));
      const d = ctx.getImageData(px, py, 1, 1).data;
      return { px, py, r: d[0], g: d[1], b: d[2], a: d[3] };
    };

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const isLip = y >= 1.56 && y <= 1.59 && Math.abs(x) < 0.06 && z >= 0.08;
      const isNail = y >= 0.75 && y <= 0.85 && Math.abs(x) >= 0.08 && Math.abs(x) <= 0.22 && z >= 0.08;
      if (isLip) counts.lip++;
      if (isNail) counts.nail++;
    }

    const w = cyanosisCanvas.width;
    const h = cyanosisCanvas.height;
    const samples = {
      lipCenter: sample(w * 0.45, h * 0.88),
      lipCorner: sample(w * 0.38, h * 0.86),
      nailLeft: sample(w * 0.13, h * 0.22),
      nailRight: sample(w * 0.87, h * 0.22),
      farForehead: sample(w * 0.5, h * 0.75),
    };

    return {
      found: true,
      mapSize: { w, h },
      counts,
      cyanosisMapApplied: mat.map === body.userData.cyanosisOpenTex || mat.map === body.userData.cyanosisClosedTex,
      activeMapIsCyanosis: mat.map === body.userData.cyanosisOpenTex,
      activeMapIsClean: mat.map === body.userData.eyesOpenTex,
      samples,
      cyanosisOpenTexSize: cyanosisCanvas.width + 'x' + cyanosisCanvas.height,
    };
  });

  await canvas.screenshot({ path: `${outDir}/${outName}` });
  await browser.close();
  console.log(`=== SPO2 ${spo2} ===`);
  console.log(JSON.stringify(result, null, 2));
}

await capture(`resp001-cyanosis-85-evidence.png`, 85);
await capture(`resp001-cyanosis-94-evidence.png`, 94);
