import { chromium } from 'playwright';

const baseUrl = process.argv[2] ?? process.env.APP_URL ?? 'http://localhost:5173';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => {
  if (message.type() !== 'error') return;
  const source = message.location().url;
  errors.push(`console: ${message.text()}${source ? ` (${source})` : ''}`);
});

async function openCase(caseId) {
  await page.goto(`${baseUrl}/?devLiveCase=${caseId}&capture`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
}

async function openKit(name) {
  // Priority-action chips can repeat an equipment name above the bag grid.
  // Always open the named bag explicitly so the next click reaches the real
  // inventory tile rather than bypassing kit selection through a shortcut.
  const kit = page.getByRole('button', { name: new RegExp(`^Open ${name}$`, 'i') }).first();
  if (!await kit.count()) throw new Error(`${name} was not available`);
  await kit.click();
  await page.waitForTimeout(500);
}

async function selectEquipment(name) {
  const item = page.getByRole('button', { name: new RegExp(`^Select ${name}$`, 'i') }).first();
  if (!await item.count()) throw new Error(`${name} was not available`);
  await item.click();
}

async function completeProcedure(title, target) {
  const dialog = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: title }) }).last();
  const completionName = /reassess|monitor|documented|ventilation|secured|running/i;
  await dialog.waitFor({ timeout: 6000 });
  let steps = 0;
  console.log(`Verifying procedure: ${title}`);

  const advance = async perform => {
    const previousLabel = (await perform.textContent())?.trim() ?? '';
    await perform.click();
    // Procedure timing is deliberately animated. Wait for the active step to
    // advance instead of assuming a fixed wall-clock duration, because the
    // WebGL scene can make timers settle later on slower CI machines.
    for (let attempt = 0; attempt < 60; attempt += 1) {
      await page.waitForTimeout(100);
      const next = dialog.getByRole('button', { name: /^Perform:/i }).first();
      if (await next.isVisible().catch(() => false)) {
        if ((await next.textContent())?.trim() !== previousLabel) return;
      } else if (await dialog.getByRole('button', { name: completionName }).last().isVisible().catch(() => false)) {
        return;
      }
    }
    throw new Error(`Procedure step did not advance from “${previousLabel}”`);
  };

  if (target) {
    const targetButton = dialog.getByRole('button', { name: new RegExp(target, 'i') }).first();
    if (!await targetButton.isVisible().catch(() => false)) {
      // Wound-care sites deliberately remain hidden until the learner exposes
      // the injury. Follow that sequence before choosing the anatomical site.
      const expose = dialog.getByRole('button', { name: /^Perform: Expose/i });
      if (!await expose.count()) throw new Error(`${target} was not selectable and no exposure step was available`);
      await advance(expose);
      steps += 1;
      await targetButton.waitFor({ state: 'visible', timeout: 6000 });
    }
    await targetButton.click();
  }

  while (steps < 10) {
    const perform = dialog.getByRole('button', { name: /^Perform:/i }).first();
    if (!await perform.isVisible().catch(() => false)) break;
    await advance(perform);
    steps += 1;
  }
  const finish = dialog.getByRole('button', { name: completionName }).last();
  await finish.waitFor({ timeout: 15000 });
  await finish.click();
  await page.waitForTimeout(1000);
  return steps;
}

const results = {};

await openCase('resp-001');
await openKit('Airway Bag');
await selectEquipment('Oxygen Mask');
results.maskSteps = await completeProcedure(/Apply oxygen mask/i);
results.maskFittedToPatient = await page.locator('[data-applied-equipment="simple-mask"]').count() > 0;
await page.screenshot({ path: 'test-results/oxygen-mask-connected-verified.png' });
await page.getByRole('button', { name: 'Examine Face' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: 'test-results/oxygen-mask-face-closeup-verified.png' });
await page.getByRole('button', { name: /Back to full body/i }).click();
await page.waitForTimeout(500);

await openCase('trauma-001');
await openKit('Exposure Pack');
await selectEquipment('Bandages');
results.haemorrhageSteps = await completeProcedure(/Control external haemorrhage/i, 'right leg');
results.pressureDressingOnInjuredLimb = await page.locator('[data-applied-equipment="pressure-dressing"]').count() > 0;
await openKit('Exposure Pack');
await selectEquipment('Traction Splint');
results.tractionSteps = await completeProcedure(/Apply a traction splint/i, 'right leg');
results.tractionSplintOnInjuredLimb = await page.locator('[data-applied-equipment="traction-splint"]').count() > 0;
results.siteLabelVisible = /Traction splint · right leg/i.test(await page.locator('body').innerText());
results.errors = errors;

if (results.maskSteps < 4 || !results.maskFittedToPatient
  || results.haemorrhageSteps < 5 || !results.pressureDressingOnInjuredLimb
  || results.tractionSteps < 6
  || !results.tractionSplintOnInjuredLimb || !results.siteLabelVisible || errors.length) {
  console.error(JSON.stringify(results, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(results, null, 2));
}

await browser.close();
