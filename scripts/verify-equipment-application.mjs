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
  await page.getByRole('heading', { name: title }).waitFor({ timeout: 6000 });
  let steps = 0;
  console.log(`Verifying procedure: ${title}`);

  if (target) {
    const targetButton = page.getByRole('button', { name: new RegExp(target, 'i') }).first();
    if (!await targetButton.isVisible().catch(() => false)) {
      // Wound-care sites deliberately remain hidden until the learner exposes
      // the injury. Follow that sequence before choosing the anatomical site.
      const expose = page.getByRole('button', { name: /^Perform: Expose/i });
      if (!await expose.count()) throw new Error(`${target} was not selectable and no exposure step was available`);
      await expose.click();
      await page.waitForTimeout(1550);
      steps += 1;
      await targetButton.waitFor({ state: 'visible', timeout: 6000 });
    }
    await targetButton.click();
  }

  while (steps < 10) {
    const perform = page.getByRole('button', { name: /^Perform:/i }).first();
    if (!await perform.isVisible().catch(() => false)) break;
    await perform.click();
    await page.waitForTimeout(1550);
    steps += 1;
  }
  const finish = page.getByRole('button', { name: /reassess|monitor|documented|ventilation|secured|running/i }).last();
  await finish.waitFor({ timeout: 5000 });
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
