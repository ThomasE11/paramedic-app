import { chromium } from 'playwright';

// Render a probe grid: 9 candidate camera poses around the measured head
// centre [0.02, 0.75, -0.28], tile them into one contact sheet so we can pick
// the winner in ONE vision call instead of iterating blind.
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(40_000);
await page.addInitScript(() => { try { sessionStorage.setItem('capturePinQuality', '1'); } catch {} });
await page.goto('http://localhost:5173/?capture&devLiveCase=resp-001&model=male', { waitUntil: 'networkidle' });
await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 25_000 });
await page.waitForFunction(() => window.__r3f?.gl && window.__r3f?.scene);
await page.waitForTimeout(12_000);

const head = [0.02, 0.75, -0.28];
const poses = [
  { name: 'A front-high',   pos: [0.0, 1.35, 0.35] },
  { name: 'B front-level',  pos: [0.0, 0.85, 0.45] },
  { name: 'C right-high',   pos: [0.9, 1.25, 0.2] },
  { name: 'D right-level',  pos: [0.9, 0.8, 0.15] },
  { name: 'E left-high',    pos: [-0.9, 1.25, 0.2] },
  { name: 'F left-level',   pos: [-0.9, 0.8, 0.15] },
  { name: 'G above',        pos: [0.05, 1.9, -0.25] },
  { name: 'H feet-look',    pos: [0.0, 1.5, 1.4] },
  { name: 'I side-feet',    pos: [1.6, 1.1, 1.1] },
];

const shots = [];
for (const p of poses) {
  const dataUrl = await page.evaluate(({ p, head }) => {
    const state = window.__r3f;
    const { gl, scene, camera } = state;
    const V = scene.position.constructor;
    gl.setAnimationLoop(null);
    camera.position.set(...p.pos);
    camera.up.set(0, 1, 0);
    camera.lookAt(new V(...head));
    camera.fov = 30;
    camera.near = 0.02; camera.far = 100;
    camera.aspect = gl.domElement.width / gl.domElement.height;
    camera.updateProjectionMatrix();
    gl.render(scene, camera);
    return gl.domElement.toDataURL('image/png');
  }, { p, head });
  shots.push({ name: p.name, dataUrl });
}

// Tile into a 3x3 contact sheet
const sheet = await page.evaluate(async (shots) => {
  const load = (src) => new Promise((res, rej) => {
    const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = src;
  });
  const imgs = await Promise.all(shots.map(s => load(s.dataUrl)));
  const W = 480, H = 320;
  const canvas = document.createElement('canvas');
  canvas.width = W * 3; canvas.height = H * 3 + 60;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#111'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  imgs.forEach((img, i) => {
    const x = (i % 3) * W, y = Math.floor(i / 3) * H;
    ctx.drawImage(img, x, y, W, H);
    ctx.fillStyle = '#ff0'; ctx.font = 'bold 22px monospace';
    ctx.fillText(shots[i].name, x + 8, y + 26);
  });
  return canvas.toDataURL('image/png');
}, shots);

const fs = await import('node:fs');
fs.writeFileSync('/Users/eliastlcthomas/Projects/app/test-results/head-pose-grid.png',
  Buffer.from(sheet.replace(/^data:image\/png;base64,/, ''), 'base64'));
console.log('wrote test-results/head-pose-grid.png');
await browser.close();
