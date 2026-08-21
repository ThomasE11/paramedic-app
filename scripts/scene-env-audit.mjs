import { chromium } from 'playwright';

// Classify every case in the live registry using the app's own module.
const browser = await chromium.launch();
const page = await browser.newPage();
page.setDefaultTimeout(60000);
await page.goto('http://localhost:5173/?capture', { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Start Training/i }).first().click().catch(() => {});
await page.waitForTimeout(3000);

const result = await page.evaluate(async () => {
  const mod = await import('/src/lib/sceneEnvironment.ts');
  const casesMod = await import('/src/data/extendedCases.ts').catch(() => null);
  // The registry lives in the case export endpoint used by SmartSearch; try the
  // canonical aggregator first.
  let all = null;
  for (const path of ['/src/data/cases.ts']) {
    const m = await import(path).catch(() => null);
    if (m?.allCases) { all = m.allCases; break; }
  }
  if (!all) return { error: 'no registry module found' };
  const rows = all.map(c => {
    const v = mod.deriveSceneEnvironment(c);
    return {
      id: c.id,
      title: (c.title ?? '').slice(0, 60),
      variant: v,
      location: c.dispatchInfo?.location ?? '',
      env: (c.sceneInfo?.environment ?? '').slice(0, 50),
    };
  });
  return { count: rows.length, rows };
});
console.log(JSON.stringify(result).slice(0, 200));
if (result.rows) {
  const dist = {};
  for (const r of result.rows) dist[r.variant] = (dist[r.variant] ?? 0) + 1;
  console.log('count:', result.count, 'distribution:', JSON.stringify(dist));
  // crash-flavoured cases NOT classified roadside
  const crash = /crash|collision|\brta\b|\bmvc\b|vehicle|motorcycle|pedestrian/i;
  const mismatches = result.rows.filter(r =>
    r.variant !== 'roadside' &&
    crash.test(`${r.title} ${r.location} ${r.env}`)
  );
  console.log('\nCRASH-FLAVOURED BUT NOT ROADSIDE:', mismatches.length);
  for (const m of mismatches.slice(0, 30)) console.log(` ${m.id} [${m.variant}] ${m.title} | loc: ${m.location}`);
  // sample per variant
  for (const v of ['roadside', 'home', 'public', 'clinic']) {
    const sample = result.rows.filter(r => r.variant === v).slice(0, 6);
    console.log(`\n--- ${v} (${result.rows.filter(r=>r.variant===v).length}) ---`);
    for (const s of sample) console.log(` ${s.id} ${s.title} | ${s.location}`);
  }
}
await browser.close();
