import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.setDefaultTimeout(40000);
await page.addInitScript(() => {
  try { window.sessionStorage.setItem('capturePinQuality', '1'); } catch {}
});
await page.goto('http://localhost:5173/?capture&devLiveCase=trauma-001', { waitUntil: 'networkidle' });
const canvas = page.locator('canvas').first();
await canvas.waitFor({ state: 'visible', timeout: 20000 });
await page.waitForTimeout(12000);

const diag = await page.evaluate(() => {
  const state = window.__r3f;
  const cam = state.camera;
  const V = state.scene.position.constructor;
  const meshes = [];
  let road = null, car = null, cone = null, wreck = null;
  state.scene.traverse((o) => {
    if (o.isMesh) {
      const mat = Array.isArray(o.material) ? o.material[0] : o.material;
      const w = o.getWorldPosition(new V());
      const entry = {
        g: o.geometry?.type,
        c: mat?.color ? '#' + mat.color.getHexString() : '?',
        x: +w.x.toFixed(2), y: +w.y.toFixed(2), z: +w.z.toFixed(2),
      };
      meshes.push(entry);
      if (o.geometry?.type === 'PlaneGeometry' && entry.c === '#2c2e33') road = entry;
      if (!car && entry.c === '#5a6068' && o.geometry?.type === 'BoxGeometry') car = entry;
      if (!cone && entry.c === '#e05a1e') cone = entry;
    }
  });
  // Filter to the unique-ish props
  return {
    camera: [+cam.position.x.toFixed(2), +cam.position.y.toFixed(2), +cam.position.z.toFixed(2)],
    fov: cam.fov,
    road: road ?? null,
    car: car ?? null,
    cone: cone ?? null,
    planeCount: meshes.filter(m => m.g === 'PlaneGeometry').length,
    boxCount: meshes.filter(m => m.g === 'BoxGeometry').length,
    cylCount: meshes.filter(m => m.g === 'CylinderGeometry').length,
    torusCount: meshes.filter(m => m.g === 'TorusGeometry').length,
    circleCount: meshes.filter(m => m.g === 'CircleGeometry').length,
    sample: meshes.filter(m => ['#2c2e33', '#5a6068', '#e05a1e', '#f2662a', '#f8fafc', '#1a1a1a', '#a8c0d8', '#bcd7ff', '#fffbe8'].includes(m.c)).slice(0, 30),
  };
});
console.log(JSON.stringify(diag, null, 1));
await browser.close();