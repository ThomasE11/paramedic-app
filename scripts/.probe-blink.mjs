import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(30_000);
await page.goto('http://localhost:5173/?capture&model=male', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Start Training/i }).first().click();
await page.getByRole('button', { name: /Skip Tour/i }).click({ timeout: 5000 }).catch(() => {});
await page.getByRole('button', { name: /Generate Case/i }).first().click();
await page.getByRole('button', { name: /Begin Scene Survey/i }).click();
await page.getByRole('button', { name: /^Next$/i }).click();
await page.getByRole('button', { name: /None identified/i }).click();
await page.getByRole('button', { name: /Scene is safe/i }).click();
await page.getByRole('button', { name: /Enter Scene/i }).click();
await page.locator('canvas').first().waitFor({ state: 'visible' });
await page.waitForTimeout(9000);
const result = await page.evaluate(async () => {
  const state = window.__r3f;
  if (!state) return { error: 'no __r3f' };
  const eyeL = state.scene.getObjectByName('eyeL');
  const eyeR = state.scene.getObjectByName('eyeR');
  const pupilL = state.scene.getObjectByName('pupilL');
  const pupilR = state.scene.getObjectByName('pupilR');
  if (!eyeL || !eyeR) return { error: 'eye nodes missing in scene' };
  let bodyMesh = null;
  state.scene.traverse((o) => { if (!bodyMesh && o.isMesh && o.userData.eyesOpenTex) bodyMesh = o; });
  const openTex = bodyMesh?.userData.eyesOpenTex;
  const closedTex = bodyMesh?.userData.eyesClosedTex;
  const obs = { hides: 0, shows: 0, mapSwaps: 0, rotSamples: new Set(), visSeen: new Set() };
  let lastVis = eyeL.visible;
  let lastMap = bodyMesh ? (Array.isArray(bodyMesh.material) ? bodyMesh.material[0] : bodyMesh.material).map : null;
  const t0 = performance.now();
  while (performance.now() - t0 < 12000) {
    await new Promise((r) => setTimeout(r, 30));
    obs.visSeen.add(eyeL.visible);
    if (eyeL.visible !== lastVis) {
      if (eyeL.visible) obs.shows += 1; else obs.hides += 1;
      lastVis = eyeL.visible;
    }
    const m = (Array.isArray(bodyMesh.material) ? bodyMesh.material[0] : bodyMesh.material).map;
    if (m !== lastMap) { obs.mapSwaps += 1; lastMap = m; }
    obs.rotSamples.add(Math.round(eyeL.rotation.y * 1000));
  }
  return {
    eyeNodes: true,
    bothTexturesBuilt: !!openTex && !!closedTex,
    blinkHides: obs.hides,
    blinkShows: obs.shows,
    lidTextureSwaps: obs.mapSwaps,
    distinctYawSamples: obs.rotSamples.size,
    eyeRMirrorsL: eyeL.rotation.y === eyeR.rotation.y,
    pupilScales: { L: pupilL?.scale.x, R: pupilR?.scale.x },
    eyeLVisibleStates: [...obs.visSeen],
  };
});
console.log(JSON.stringify(result, null, 1));
await browser.close();
