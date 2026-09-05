// Slice-acceptance capture: resp-001, treatment-bay presentation, posture state.
// Extends capture-model.mjs's flow but also dumps the live morph influences so
// we can PROVE the tripod pose is applied, not just eyeball it.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const out = resolve(process.argv[2] ?? 'test-results/acc-posture.png');
const base = process.argv[3] ?? 'http://localhost:5173';
mkdirSync(dirname(out), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(30_000);
await page.addInitScript(() => {
  try { window.sessionStorage.setItem('capturePinQuality', '1'); } catch { /* ignore */ }
});

try {
  await page.goto(`${base}/?capture&model=male&devLiveCase=resp-001`, { waitUntil: 'networkidle' });
  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ state: 'visible' });
  await page.waitForTimeout(9000);

  const evidence = await page.evaluate(() => {
    const state = window.__r3f;
    if (!state) return { hook: false };
    const found = { hook: true, meshes: [] };
    state.scene.traverse((o) => {
      if (o.isMesh && o.morphTargetDictionary && o.morphTargetInfluences) {
        const dict = o.morphTargetDictionary;
        const infl = o.morphTargetInfluences;
        const m = { name: o.name, influences: {} };
        for (const [k, i] of Object.entries(dict)) m.influences[k] = Number(infl[i].toFixed(3));
        found.meshes.push(m);
      }
    });
    return found;
  });
  console.log(JSON.stringify(evidence, null, 2));

  await canvas.screenshot({ path: out });
  console.log(`saved ${out}`);
} catch (err) {
  const debugPath = out.replace(/\.png$/, '.debug.png');
  await page.screenshot({ path: debugPath, fullPage: true }).catch(() => {});
  console.error('capture failed (debug:', debugPath, '):', err.message ?? err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
