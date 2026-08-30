import { chromium } from 'playwright';

const baseUrl = process.argv[2] ?? process.env.APP_URL ?? 'http://localhost:5173';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});

async function openCirculationBag() {
  const button = page.locator('.tactical-assessment-rail button').filter({ hasText: /Circulation Kit/i }).first();
  if (!await button.count()) throw new Error('Circulation Kit was not available');
  await button.click();
  await page.waitForTimeout(500);
}

async function completeProcedure(expectedTitle, targetName) {
  await page.getByRole('heading', { name: expectedTitle }).waitFor({ timeout: 5000 });
  let performed = 0;
  if (targetName) {
    const target = page.getByRole('button', { name: new RegExp(targetName, 'i') }).first();
    if (!await target.isVisible().catch(() => false)) {
      // Injury sites remain hidden until the clothing/exposure step is
      // completed. Follow the learner's real sequence before selecting a site.
      const expose = page.getByRole('button', { name: /^Perform: Expose/i }).first();
      await expose.waitFor({ state: 'visible', timeout: 5000 });
      await expose.click();
      await page.waitForTimeout(1550);
      performed += 1;
      await target.waitFor({ state: 'visible', timeout: 5000 });
    }
    await target.click();
  }
  while (performed < 8) {
    const perform = page.getByRole('button', { name: /^Perform:/i });
    if (!await perform.count()) break;
    await perform.click();
    await page.waitForTimeout(1550);
    performed += 1;
  }
  const completion = page.getByRole('button', { name: /reassess|record time|analyse rhythm|oxygen running|tube secured/i }).last();
  await completion.waitFor({ timeout: 4000 });
  await completion.click();
  return performed;
}

const results = {};

await page.goto(`${baseUrl}/?devLiveCase=trauma-001&capture`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);
await openCirculationBag();
const tourniquet = page.locator('.tactical-assessment-rail button').filter({ hasText: /Tourniquet/i }).first();
if (!await tourniquet.count()) throw new Error('Tourniquet treatment was not available');
await tourniquet.click();
results.tourniquetSteps = await completeProcedure(/Apply windlass tourniquet/i, 'right leg');
results.siteSpecificDressingVisible = /Tourniquet · right leg/i.test(await page.locator('body').innerText());

await page.goto(`${baseUrl}/?devLiveCase=cardiac-002&capture`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);
const monitor = page.getByRole('region', { name: 'Vital signs monitor' });
await monitor.getByRole('button', { name: 'DEFIB', exact: true }).click();
const monitorCharge = monitor.getByRole('button', { name: 'CHARGE', exact: true });
const monitorShock = monitor.getByRole('button', { name: 'SHOCK', exact: true });
results.monitorChargeLockedWithoutPads = await monitorCharge.isDisabled();
results.monitorShockLockedWithoutPads = await monitorShock.isDisabled();
results.monitorReportsPadsOff = await monitor.locator('[data-defibrillator-pad-status="disconnected"]').count() > 0;

await openCirculationBag();
const pads = page.locator('.tactical-assessment-rail button').filter({ hasText: /Defib Pads/i }).first();
if (!await pads.count()) throw new Error('Defibrillator pads were not available');
await pads.click();
results.padSteps = await completeProcedure(/Attach defibrillator pads/i);
results.defibrillatorPadsVisibleOnChest = await page.locator('[data-applied-equipment="defibrillator-pads"]').count() >= 2;
results.monitorReportsPadsConnected = await monitor.locator('[data-defibrillator-pad-status="connected"]').count() > 0;
await page.screenshot({ path: 'test-results/defibrillator-pads-connected-verified.png' });
await page.getByRole('button', { name: 'Examine Chest' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: 'test-results/defibrillator-pads-chest-closeup-verified.png' });
await page.getByRole('button', { name: /Back to full body/i }).click();
await page.waitForTimeout(500);

const defib = page.locator('.tactical-assessment-rail button').filter({ hasText: /AED \/ Defib/i }).first();
if (!await defib.count()) throw new Error('Defibrillator action was not available');
await defib.click();
const shock = page.getByRole('button', { name: /^Shock /i });
await shock.waitFor({ timeout: 5000 });
results.shockDisabledBeforeCharge = await shock.isDisabled();
await page.getByRole('button', { name: /^Charge$/i }).click();
results.shockDisabledBeforeClear = await shock.isDisabled();
await page.getByRole('button', { name: /ALL CLEAR confirmed/i }).click();
results.shockEnabledAfterSequence = !(await shock.isDisabled());
await page.screenshot({ path: 'test-results/defibrillator-safety-sequence-verified.png' });
results.errors = errors;

if (results.tourniquetSteps < 5 || !results.siteSpecificDressingVisible || results.padSteps < 5
  || !results.monitorChargeLockedWithoutPads || !results.monitorShockLockedWithoutPads
  || !results.monitorReportsPadsOff || !results.defibrillatorPadsVisibleOnChest
  || !results.monitorReportsPadsConnected
  || !results.shockDisabledBeforeCharge || !results.shockDisabledBeforeClear
  || !results.shockEnabledAfterSequence || errors.length) {
  console.error(JSON.stringify(results, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(results, null, 2));
}

await browser.close();
