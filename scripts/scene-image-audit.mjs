import { chromium } from 'playwright';

// Which cases lack a sceneImagePath, grouped by variant — those render no
// scene-overview tile in the briefing.
const browser = await chromium.launch();
const page = await browser.newPage();
page.setDefaultTimeout(60000);
await page.goto('http://localhost:5173/?capture', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const result = await page.evaluate(async () => {
  const mod = await import('/src/lib/sceneEnvironment.ts');
  const { allCases } = await import('/src/data/cases.ts');
  const rows = allCases.map(c => ({
    id: c.id,
    variant: mod.deriveSceneEnvironment(c),
    hasImage: !!c.sceneInfo?.sceneImagePath,
    img: c.sceneInfo?.sceneImagePath ?? '',
  }));
  const missing = rows.filter(r => !r.hasImage);
  const byVariant = {};
  for (const r of missing) byVariant[r.variant] = (byVariant[r.variant] ?? 0) + 1;
  return { total: rows.length, missingCount: missing.length, byVariant, missing: missing.map(m => `${m.id}[${m.variant}]`) };
});
console.log(JSON.stringify(result, null, 1));
await browser.close();
