import { expect, test } from '@playwright/test';

// Regression: ISSUE-023 — bedside equipment did not open the matching kit
// Found by /qa on 2026-09-04
// Report: .gstack/qa-reports/qa-report-localhost-2026-09-04.md
test('scene gear opens the matching jump bag and leaves the selected device fitted', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/?devLiveCase=resp-001');

  const airwayHotspot = page.getByRole('button', { name: 'Open Airway kit from scene' });
  const breathingHotspot = page.getByRole('button', { name: 'Open Breathing kit from scene' });
  await expect(breathingHotspot).toBeVisible({ timeout: 30_000 });

  await airwayHotspot.click();
  await expect(page.locator('[data-bag-key="airway"]')).toContainText('Open');

  await breathingHotspot.click();
  await expect(page.locator('[data-bag-key="breathing"]')).toContainText('Open');
  await expect(page.locator('[data-equipment-inventory="true"]')).toContainText('Non-rebreather');

  await page.getByRole('button', { name: 'Select Non-rebreather' }).click();

  const procedure = page.getByRole('dialog', { name: /Apply non-rebreather mask/i });
  await expect(procedure).toBeVisible();

  for (const step of [
    'Connect oxygen tubing',
    'Pre-inflate reservoir',
    'Seat the mask',
    'Set prescribed flow',
    'Confirm response',
  ]) {
    const action = procedure.getByRole('button', { name: `Perform: ${step}` });
    await expect(action).toBeEnabled();
    await action.click();
  }

  await procedure.getByRole('button', { name: /Oxygen running — reassess SpO₂/i }).click();

  await expect(procedure).toBeHidden();
  const fittedNrb = page.locator(
    '[data-applied-equipment="nonrebreather"]'
      + '[data-airway-connection="face"]'
      + '[data-oxygen-connected="true"]'
      + '[data-patient-anchored="true"]',
  );
  await expect(fittedNrb).toBeVisible();
  await expect(page.getByText('1 deployed', { exact: true })).toBeVisible();
});
