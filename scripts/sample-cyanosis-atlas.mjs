import { chromium } from 'playwright';

async function sampleAtlas(spo2) {
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
    if (!state) return { noR3f: true };
    let body = null;
    state.scene.traverse((o) => {
      if (!body && o.isMesh && o.userData?.eyesOpenTex) body = o;
    });
    if (!body) return { noBody: true };

    const mat = Array.isArray(body.material) ? body.material[0] : body.material;
    const cleanTex = body.userData.cleanOpenTex;
    const cyanTex = body.userData.cyanosisOpenTex;
    const eyesTex = body.userData.eyesOpenTex;

    return {
      spo2: window.sessionStorage.getItem('captureSpo2'),
      identity: {
        matIsCyan: mat.map === cyanTex,
        matIsClean: mat.map === cleanTex,
        matIsEyes: mat.map === eyesTex,
        cleanTexExists: !!cleanTex,
        cyanTexExists: !!cyanTex,
      },
    };
  });

  await browser.close();
  console.log(`--- SpO2 ${spo2} ---`);
  console.log(JSON.stringify(result, null, 2));
}

await sampleAtlas(85);
await sampleAtlas(94);
