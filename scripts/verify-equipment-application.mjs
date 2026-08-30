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
  const completionName = /reassess|monitor|documented|ventilation|secured|running|fitted/i;
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
await openKit('Breathing Bag');
const cpapTile = page.getByRole('button', { name: /^Select CPAP Circuit$/i }).first();
results.cpapBagUsesFittedAsset = (await cpapTile.locator('img').getAttribute('src')) === '/equipment-assets/cpap-mask-front-v2.png';
await cpapTile.click();
results.cpapSteps = await completeProcedure(/Apply CPAP circuit/i);
const cpapOnFace = page.locator('[data-applied-equipment="cpap"][data-airway-connection="face"]');
results.cpapSealedOnFace = await cpapOnFace.count() > 0;
results.cpapHarnessLabelVisible = /four-point harness/i.test(await cpapOnFace.first().getAttribute('aria-label') ?? '');
await page.getByRole('button', { name: 'Examine Face' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: 'test-results/cpap-face-closeup-verified.png' });

await openCase('cardiac-002');
await page.getByRole('button', { name: 'BVM Ventilation', exact: true }).click();
results.bvmSteps = await completeProcedure(/Apply bag-valve-mask ventilation/i);
const ventilationRateDialog = page.getByRole('dialog').filter({ hasText: 'BVM ventilation rate' }).last();
await ventilationRateDialog.getByRole('button', { name: /10 \/ min — arrest/i }).click();
await page.waitForTimeout(700);
const bvmOnFace = page.locator('[data-applied-equipment="bvm"][data-airway-connection="face"]');
results.bvmHeldOnFace = await bvmOnFace.count() > 0;
results.bvmSealLabelVisible = /two-handed face seal/i.test(await bvmOnFace.first().getAttribute('aria-label') ?? '');
await page.screenshot({ path: 'test-results/bvm-connected-verified.png' });
await page.getByRole('button', { name: 'Examine Face' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: 'test-results/bvm-face-closeup-verified.png' });

await openCase('cardiac-002');
await openKit('Airway Bag');
await selectEquipment('OPA Set');
results.opaSteps = await completeProcedure(/oropharyngeal airway/i);
const opaAtLips = page.locator('[data-applied-equipment="oropharyngeal-airway"][data-airway-connection="oral"]');
results.opaAtLips = await opaAtLips.count() > 0;
results.opaFlangeLabelVisible = /flange seated at the lips/i.test(await opaAtLips.first().getAttribute('aria-label') ?? '');
results.opaUsesFittedAsset = (await opaAtLips.first().locator('img').getAttribute('src')) === '/equipment-assets/opa-flange-front-v2.png';
results.noDiagramOpa = await page.locator('img[src="/treatment-assets/opa.svg"]').count() === 0;
await page.getByRole('button', { name: 'Examine Face' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: 'test-results/opa-face-closeup-verified.png' });

await openCase('resp-001');
await openKit('Airway Bag');
await selectEquipment('ET Tube');
results.intubationSteps = await completeProcedure(/Endotracheal intubation/i);
const securedEtTube = page.locator('[data-applied-equipment="endotracheal-tube"]');
results.etTubeSecuredAtMouth = await securedEtTube.count() > 0;
results.etTubePilotBalloonVisible = /pilot balloon visible/i.test(await securedEtTube.first().getAttribute('aria-label') ?? '');
results.noDiagramEtTube = await page.locator('img[src="/treatment-assets/et-tube.svg"]').count() === 0;
await page.getByRole('button', { name: 'Examine Face' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: 'test-results/ett-face-closeup-verified.png' });
await page.getByRole('button', { name: /Back to full body/i }).click();
await page.waitForTimeout(500);
await openKit('Breathing Bag');
await selectEquipment('Ventilator Circuit');
results.ventilatorSteps = await completeProcedure(/ventilator circuit/i);
const connectedVentilator = page.locator('[data-applied-equipment="ventilator-circuit"][data-airway-connection="ett"]');
results.ventilatorConnectedToEtTube = await connectedVentilator.count() > 0;
results.ventilatorConnectionLabelVisible = /HME and capnography elbow/i.test(await connectedVentilator.first().getAttribute('aria-label') ?? '');
await page.getByRole('button', { name: 'Examine Face' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: 'test-results/ett-ventilator-face-closeup-verified.png' });

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
await openKit('Exposure Pack');
await selectEquipment('Cervical Collar');
results.collarSteps = await completeProcedure(/Apply a cervical collar/i);
const fittedCollar = page.locator('[data-applied-equipment="cervical-collar"][data-spinal-support="sized-and-fitted"]');
results.collarFittedAtNeck = await fittedCollar.count() > 0;
results.collarFitLabelVisible = /chin centred and tracheal opening visible/i.test(await fittedCollar.first().getAttribute('aria-label') ?? '');
results.collarUsesFittedAsset = (await fittedCollar.first().locator('img').getAttribute('src')) === '/equipment-assets/cervical-collar-fitted-front-v2.png';
await page.getByRole('button', { name: 'Examine Neck' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: 'test-results/cervical-collar-neck-closeup-verified.png' });
results.errors = errors;

if (results.maskSteps < 4 || !results.maskFittedToPatient
  || results.cpapSteps < 5 || !results.cpapBagUsesFittedAsset || !results.cpapSealedOnFace || !results.cpapHarnessLabelVisible
  || results.bvmSteps < 5 || !results.bvmHeldOnFace || !results.bvmSealLabelVisible
  || results.opaSteps < 5 || !results.opaAtLips || !results.opaFlangeLabelVisible || !results.opaUsesFittedAsset || !results.noDiagramOpa
  || results.intubationSteps < 6 || !results.etTubeSecuredAtMouth || !results.etTubePilotBalloonVisible || !results.noDiagramEtTube
  || results.ventilatorSteps < 5 || !results.ventilatorConnectedToEtTube || !results.ventilatorConnectionLabelVisible
  || results.haemorrhageSteps < 5 || !results.pressureDressingOnInjuredLimb
  || results.tractionSteps < 6
  || !results.tractionSplintOnInjuredLimb || !results.siteLabelVisible
  || results.collarSteps < 5 || !results.collarFittedAtNeck || !results.collarFitLabelVisible || !results.collarUsesFittedAsset
  || errors.length) {
  console.error(JSON.stringify(results, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(results, null, 2));
}

await browser.close();
