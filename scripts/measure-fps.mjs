import { chromium } from 'playwright';

const args = process.argv.slice(2);
const base = args.find((a) => !a.startsWith('--')) ?? 'http://localhost:5173';
const seconds = Number((args.find((a) => a.startsWith('--seconds=')) ?? '--seconds=10').split('=')[1]);
const headless = args.includes('--headless');
const ipad = args.includes('--ipad');
const forceDegrade = args.includes('--force-degrade');
const assertContract = args.includes('--assert-contract');
const modelArg = args.find((a) => a.startsWith('--model='));
const modelQuery = modelArg ? `&model=${modelArg.split('=')[1]}` : '';
const caseArg = args.find((a) => a.startsWith('--case='));
const caseId = caseArg?.split('=')[1]?.trim();
if (caseArg && !caseId) throw new Error('--case requires a case id, for example --case=resp-001');

// Playwright's lightweight headless shell is present in CI, while the full
// bundled Chromium may not be. Hardware desktop runs use the installed Chrome
// channel so the acceptance number reflects the real GPU path.
const browser = await chromium.launch(headless ? { headless: true } : { headless: false, channel: 'chrome' });
const page = await browser.newPage(ipad
  ? { viewport: { width: 1180, height: 820 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }
  : { viewport: { width: 1440, height: 960 } });
page.setDefaultTimeout(30_000);

// At forced ~10fps the UI animations never settle, so Playwright's default
// actionability checks ("element is not stable", overlay intercepts) time out.
// Force-click every step when degrading — the flow is already proven by the
// normal run; this run only exists to film the ladder.
async function clickStep(locator) {
  if (forceDegrade) await locator.click({ force: true, timeout: 60_000 });
  else await locator.click();
}

if (forceDegrade) {
  await page.addInitScript(() => {
    try { window.sessionStorage.setItem('captureForceDegrade', '1'); } catch { /* ignore */ }
  });
}

try {
  // FPS must be measured on the normal renderer path. `?capture` enables
  // preserveDrawingBuffer and deliberately pins AdaptiveQuality at tier 0 for
  // deterministic screenshots; measuring that path reported ~5 FPS and hid
  // whether the production degrade ladder was actually protecting devices.
  if (caseId) {
    const params = new URLSearchParams({ devLiveCase: caseId, fpsProbe: '1' });
    if (modelArg) params.set('model', modelArg.split('=')[1]);
    await page.goto(`${base}/?${params}`, { waitUntil: 'networkidle' });
  } else {
    await page.goto(`${base}/?fpsProbe=1${modelQuery}`, { waitUntil: 'networkidle' });
    await clickStep(page.getByRole('button', { name: /Start Training/i }).first());
    await page
      .getByRole('button', { name: /Skip Tour/i })
      .click({ force: forceDegrade, timeout: forceDegrade ? 60_000 : 5_000 })
      .catch(() => {});
    await clickStep(page.getByRole('button', { name: /Launch smart case|Generate Case/i }).first());
    await clickStep(page.getByRole('button', { name: /Begin Scene Survey/i }));
    await clickStep(page.getByRole('button', { name: /^Next$/i }));
    await clickStep(page.getByRole('button', { name: /None identified/i }));
    await clickStep(page.getByRole('button', { name: /Scene is safe/i }));
    await clickStep(page.getByRole('button', { name: /Enter Scene/i }));
  }

  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ state: 'visible' });
  await page.waitForTimeout(9000); // GLB + HDRI decode + texture repaint settle

  if (forceDegrade) {
    // Poll the dev hook for tier transitions while the ladder walks down.
    const transitions = await page.evaluate(async () => {
      const seen = [];
      const t0 = performance.now();
      // Long window: the burner holds ~25 fps for 18 s (walking the ladder
      // down), then releases — the tail of the window films the recovery
      // climb back to tier 0.
      while (performance.now() - t0 < 40_000) {
        const q = window.__adaptiveQuality;
        if (q) {
          const label = `tier=${q.tier} composer=${q.composerEnabled} dpr=${q.dpr} contactShadows=${q.contactShadows}`;
          if (seen[seen.length - 1] !== label) seen.push(label);
        }
        await new Promise((r) => setTimeout(r, 250));
      }
      return seen;
    });
    console.log('degrade ladder transitions observed:');
    for (const t of transitions) console.log('  ' + t);
  }

  const profile = ipad ? 'ipad-proxy' : headless ? 'headless-software' : 'desktop-hardware';
  const result = await page.evaluate(async ({ secs, profile: measuredProfile }) => {
    const deltas = [];
    let last = performance.now();
    await new Promise((resolve) => {
      const tick = (now) => {
        deltas.push(now - last);
        last = now;
        if (now - deltas.t0 > secs * 1000) return resolve();
        requestAnimationFrame(tick);
      };
      deltas.t0 = performance.now();
      requestAnimationFrame((now) => { last = now; requestAnimationFrame(tick); });
    });
    deltas.sort((a, b) => a - b);
    const sum = deltas.reduce((s, d) => s + d, 0);
    const avg = 1000 / (sum / deltas.length);
    const p95Delta = deltas[Math.floor(deltas.length * 0.95)]; // slowest 5% boundary
    const worst = deltas[deltas.length - 1];
    return {
      frames: deltas.length,
      avgFps: Number(avg.toFixed(1)),
      p5LowFps: Number((1000 / p95Delta).toFixed(1)),
      minFps: Number((1000 / worst).toFixed(1)),
      quality: window.__adaptiveQuality ?? null,
      profile: measuredProfile,
    };
  }, { secs: seconds, profile });

  console.log(JSON.stringify(result));
  if (assertContract) {
    if (headless) throw new Error('--assert-contract requires the hardware Chrome path; remove --headless');
    const minimumFps = ipad ? 30 : 60;
    if (result.avgFps < minimumFps) {
      throw new Error(`${profile} averaged ${result.avgFps} FPS; contract requires at least ${minimumFps} FPS`);
    }
    console.log(`contract pass: ${profile} average ${result.avgFps} FPS >= ${minimumFps} FPS`);
  }
} catch (err) {
  console.error('measure failed:', err.message ?? err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
