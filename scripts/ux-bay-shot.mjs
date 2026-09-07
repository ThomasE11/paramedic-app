// UX smoke capture for the treatment bay. Usage:
//   node scripts/ux-bay-shot.mjs <out.png> [clickText] [extraWaitMs]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const out = resolve(process.argv[2] ?? '/tmp/pms-bay.png');
const clickText = process.argv[3] ?? '';
const extraWait = Number(process.argv[4] ?? 0);
mkdirSync(dirname(out), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(30_000);
page.on('console', (m) => { if (m.type() === 'error') console.log('[console.error]', m.text().slice(0, 200)); });
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));

try {
  await page.goto('http://localhost:5173/?devLiveCase=resp-001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(6000);
  if (clickText) {
    await page.locator(`button:has-text("${clickText}")`).first().click();
    await page.waitForTimeout(2500);
  }
  if (extraWait) await page.waitForTimeout(extraWait);
  await page.screenshot({ path: out, fullPage: false });
  console.log('saved', out);
} catch (err) {
  const debugPath = out.replace(/\.png$/, '.debug.png');
  await page.screenshot({ path: debugPath, fullPage: true }).catch(() => {});
  console.error('capture failed (debug:', debugPath, '):', err.message ?? err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
