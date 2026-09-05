import { chromium } from 'playwright';

async function dumpBody() {
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

    const largeMeshes = [];
    state.scene.traverse((o) => {
      if (o.isMesh && o.geometry?.attributes?.position?.count > 500) {
        largeMeshes.push({
          name: o.name,
          posCount: o.geometry.attributes.position.count,
          ud: o.userData,
          matName: Array.isArray(o.material) ? o.material[0]?.name : o.material?.name,
          matMapName: Array.isArray(o.material) ? o.material[0]?.map?.name : o.material?.map?.name,
        });
      }
    });

    return largeMeshes;
  });

  await browser.close();
  console.log(JSON.stringify(result, null, 2));
}

await dumpBody();
