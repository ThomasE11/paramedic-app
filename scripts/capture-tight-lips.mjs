import { chromium } from 'playwright';

async function captureMouth(outName, spo2) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
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
  await page.waitForTimeout(10000);

  // Position camera directly in front of the mouth
  await page.evaluate(() => {
    const state = window.__r3f;
    if (!state) return;
    const cam = state.camera;
    const controls = state.controls;

    // Head is at y≈1.64, z≈0.15, mouth at y≈1.58, z≈0.16
    const mouthTarget = [0.0, 1.58, 0.16];
    const mouthCamPos = [0.0, 1.59, 0.45]; // 29cm away on +Z

    if (controls) {
      controls.target.set(...mouthTarget);
      controls.update();
    }
    cam.position.set(...mouthCamPos);
    cam.lookAt(...mouthTarget);
    cam.fov = 28;
    cam.updateProjectionMatrix();

    // Hide HTML labels/dots
    const canvasEl = state.gl.domElement;
    if (canvasEl?.parentElement) {
      for (const sib of canvasEl.parentElement.children) {
        if (sib !== canvasEl) sib.style.visibility = 'hidden';
      }
    }
  });

  await page.waitForTimeout(1000);
  await canvas.screenshot({ path: outName });
  console.log(`saved ${outName}`);
  await browser.close();
}

await captureMouth('test-results/resp001-tight-lips-85.png', 85);
await captureMouth('test-results/resp001-tight-lips-94.png', 94);
