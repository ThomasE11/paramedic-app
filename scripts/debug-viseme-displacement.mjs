import { chromium } from 'playwright';

// Which meshes have viseme_open, and what does the morph actually displace?
// Dump per-mesh morph presence + the max vertex displacement of viseme_open.
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(40_000);
await page.addInitScript(() => { try { sessionStorage.setItem('capturePinQuality', '1'); } catch {} });
await page.goto('http://localhost:5173/?capture&devLiveCase=resp-001&model=male', { waitUntil: 'networkidle' });
await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 25_000 });
await page.waitForFunction(() => window.__r3f?.gl && window.__r3f?.scene);
await page.waitForTimeout(12_000);

const result = await page.evaluate(() => {
  const out = [];
  window.__r3f.scene.traverse((o) => {
    if (o.isMesh && o.morphTargetDictionary?.viseme_open !== undefined) {
      const idx = o.morphTargetDictionary.viseme_open;
      const attr = o.geometry.morphAttributes?.position?.[idx];
      let maxDisp = 0, atVertex = null;
      if (attr) {
        for (let i = 0; i < attr.count; i++) {
          const dx = attr.getX(i), dy = attr.getY(i), dz = attr.getZ(i);
          const d = Math.hypot(dx, dy, dz);
          if (d > maxDisp) { maxDisp = d; atVertex = [dx, dy, dz].map(n => +n.toFixed(4)); }
        }
      }
      out.push({
        mesh: o.name || o.parent?.name || o.type,
        influenceNow: +o.morphTargetInfluences[idx].toFixed(3),
        morphTargets: attr ? attr.count : 0,
        maxDisplacement: +maxDisp.toFixed(4),
        displacementVector: atVertex,
      });
    }
  });
  return out;
});
console.log(JSON.stringify(result, null, 1));
await browser.close();
