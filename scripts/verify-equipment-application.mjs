import { chromium } from 'playwright';

const baseUrl = process.env.APP_URL ?? 'http://localhost:5173';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });

async function openCase(caseId) {
  await page.goto(`${baseUrl}/?devLiveCase=${caseId}&capture`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
}

async function openKit(name, expectedItem) {
  if (await page.locator('.tactical-assessment-rail button').filter({ hasText: new RegExp(expectedItem, 'i') }).count()) return;
  const kit = page.locator('.tactical-assessment-rail button').filter({ hasText: new RegExp(name, 'i') }).first();
  if (!await kit.count()) throw new Error(`${name} was not available`);
  await kit.click();
  await page.waitForTimeout(500);
}

async function selectEquipment(name) {
  const item = page.locator('.tactical-assessment-rail button').filter({ hasText: new RegExp(name, 'i') }).first();
  if (!await item.count()) throw new Error(`${name} was not available`);
  await item.click();
}

async function completeProcedure(title, target) {
  await page.getByRole('heading', { name: title }).waitFor({ timeout: 6000 });
  if (target) await page.getByRole('button', { name: new RegExp(target, 'i') }).first().click();
  let steps = 0;
  while (steps < 8) {
    const perform = page.getByRole('button', { name: /^Perform:/i });
    if (!await perform.count()) break;
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
await openKit('Airway Bag', 'Oxygen Mask');
await selectEquipment('Oxygen Mask');
results.maskSteps = await completeProcedure(/Apply oxygen mask/i);
results.maskFittedToPatient = await page.locator('[data-applied-equipment="simple-mask"]').count() > 0;

await openCase('trauma-001');
await openKit('Exposure Pack', 'Traction Splint');
await selectEquipment('Traction Splint');
results.tractionSteps = await completeProcedure(/Apply a traction splint/i, 'right leg');
results.tractionSplintOnInjuredLimb = await page.locator('[data-applied-equipment="traction-splint"]').count() > 0;
results.siteLabelVisible = /Traction splint · right leg/i.test(await page.locator('body').innerText());
results.errors = errors;

if (results.maskSteps < 4 || !results.maskFittedToPatient || results.tractionSteps < 6
  || !results.tractionSplintOnInjuredLimb || !results.siteLabelVisible || errors.length) {
  console.error(JSON.stringify(results, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(results, null, 2));
}

await browser.close();
