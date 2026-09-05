import { chromium } from 'playwright';

async function dump() {
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
    if (!state) return { hasR3f: false, keys: Object.keys(window).filter(k => k.startsWith('__')) };

    const meshes = [];
    state.scene.traverse((o) => {
      if (!o.isMesh) return;
      const ud = o.userData || {};
      meshes.push({
        name: o.name,
        type: o.type,
        udKeys: Object.keys(ud),
        hasEyesOpen: !!ud.eyesOpenTex,
        hasCyanosisOpen: !!ud.cyanosisOpenTex,
        hasCleanOpen: !!ud.cleanOpenTex,
        matType: Array.isArray(o.material) ? o.material.map(m => m?.type) : o.material?.type,
        posCount: o.geometry?.attributes?.position?.count ?? 0,
      });
    });

    return {
      hasR3f: true,
      meshCount: meshes.length,
      meshes: meshes.slice(0, 40),
      sceneChildren: state.scene.children.map((c) => ({ name: c.name, type: c.type, childCount: c.children?.length })),
    };
  });

  await browser.close();
  console.log(JSON.stringify(result, null, 2));
}

await dump();
