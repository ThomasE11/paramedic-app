import { chromium } from 'playwright';

const base = 'http://localhost:5173';
const outDir = '/Users/eliastlcthomas/Projects/app/test-results';

async function capture(spo2, tag) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  page.setDefaultTimeout(40000);

  await page.addInitScript((val) => {
    try { window.sessionStorage.setItem('captureSpo2', String(val)); } catch {}
    try { window.sessionStorage.setItem('capturePinQuality', '1'); } catch {}
  }, spo2);

  await page.goto(`${base}/?capture&devLiveCase=resp-001&spo2=${spo2}`, { waitUntil: 'networkidle' });

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

  await page.locator('canvas').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(12000);

  // Project the posed hand into screen space using the LIVE skinned position:
  // raycast-free — use the surface sampler if exposed, else scan rendered depth.
  // Simpler: the pose is deterministic (pose_tripod). Aim a WIDE shot covering
  // both hands region (world y 0.55-0.75, x -0.5..0.5, z -0.4..0.1) and let the
  // vision model find the hands.
  const shots = [
    // wide hands region from above-front
    { name: `resp001-b4-${tag}-fb-hand.png`, cam: [0.0, 1.45, 0.55], target: [0.0, 0.62, -0.10], fov: 40 },
  ];
  for (const s of shots) {
    const dataUrl = await page.evaluate(({ cam, target, fov }) => {
      const state = window.__r3f;
      const V = state.scene.position.constructor;
      const glc = state.gl;
      glc.setAnimationLoop(null);
      const c = glc.domElement;
      if (c && c.parentElement) {
        for (const sib of c.parentElement.children) if (sib !== c) sib.style.visibility = 'hidden';
      }
      const camera = state.camera;
      camera.position.set(...cam);
      camera.lookAt(new V(...target));
      camera.fov = fov;
      camera.near = 0.02;
      camera.aspect = c.width / c.height;
      camera.updateProjectionMatrix();
      glc.render(state.scene, camera);
      return glc.domElement.toDataURL('image/png');
    }, s);
    const b64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    const fs = await import('node:fs');
    fs.writeFileSync(`${outDir}/${s.name}`, Buffer.from(b64, 'base64'));
    console.log(`[${tag}] wrote ${s.name}`);
  }

  await browser.close();
}

await capture(85, '85');
await capture(94, '94');
