import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(30_000);

for (let attempt = 1; attempt <= 8; attempt++) {
  await page.goto('http://localhost:5173/?capture&model=male', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Start Training/i }).first().click();
  await page.getByRole('button', { name: /Skip Tour/i }).click({ timeout: 4000 }).catch(() => {});
  await page.getByRole('button', { name: /Generate Case/i }).first().click();
  await page.getByRole('button', { name: /Begin Scene Survey/i }).click();
  await page.getByRole('button', { name: /^Next$/i }).click();
  await page.getByRole('button', { name: /None identified/i }).click();
  await page.getByRole('button', { name: /Scene is safe/i }).click();
  await page.getByRole('button', { name: /Enter Scene/i }).click();
  await page.locator('canvas').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(8000);
  const res = await page.evaluate(async () => {
    const state = window.__r3f;
    if (!state) return { error: 'no r3f' };
    const eyeL = state.scene.getObjectByName('eyeL');
    if (!eyeL) return { error: 'no eyeL' };
    let bodyMesh = null;
    state.scene.traverse((o) => { if (!bodyMesh && o.isMesh && o.userData.eyesOpenTex) bodyMesh = o; });
    const closedTex = bodyMesh?.userData.eyesClosedTex;
    // sample 5s: unconscious = eyes never visible + closed lids the whole time
    let everVisible = false; let alwaysClosedTex = true;
    const t0 = performance.now();
    while (performance.now() - t0 < 5000) {
      await new Promise((r) => setTimeout(r, 50));
      if (eyeL.visible) everVisible = true;
      const m = (Array.isArray(bodyMesh.material) ? bodyMesh.material[0] : bodyMesh.material).map;
      if (m !== closedTex) alwaysClosedTex = false;
    }
    return { unconsciousBehaviour: !everVisible && alwaysClosedTex, everVisible, alwaysClosedTex };
  });
  const caseTitle = await page.locator('h1, h2').first().textContent().catch(() => '?');
  console.log(`attempt ${attempt}: ${JSON.stringify(res)} case="${(caseTitle ?? '').trim().slice(0, 60)}"`);
  if (res.unconsciousBehaviour) {
    await page.locator('canvas').first().screenshot({ path: 'test-results/stage2-unconscious-eyes-closed.png' });
    console.log('UNCONSCIOUS CASE VERIFIED: eyes hidden + lids closed for 5s. Screenshot saved.');
    break;
  }
}
await browser.close();
