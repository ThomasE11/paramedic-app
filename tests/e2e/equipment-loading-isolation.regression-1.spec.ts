import { expect, test } from '@playwright/test';

// Regression: a new useTexture request in the equipment layer suspended the
// complete patient view, hiding controls and applied-equipment confirmation.
test('a slow device texture does not hide the patient or bedside controls', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/?devLiveCase=resp-001&capture');
  await page.getByRole('button', { name: 'Select Non-rebreather', exact: true }).click();
  const procedure = page.getByRole('dialog', { name: /Apply non-rebreather mask/i });
  for (const step of [
    'Connect oxygen tubing', 'Pre-inflate reservoir', 'Seat the mask',
    'Set prescribed flow', 'Confirm response',
  ]) {
    await procedure.getByRole('button', { name: `Perform: ${step}` }).click();
  }
  const confirm = procedure.getByRole('button', { name: /Oxygen running — reassess SpO₂/i });
  await expect(confirm).toBeEnabled();

  let assetRequested = false;
  let releaseTexture = () => {};
  const textureGate = new Promise<void>(resolve => { releaseTexture = resolve; });
  await page.route('**/equipment-assets/nonrebreather-mask-v2.webp', async route => {
    assetRequested = true;
    await textureGate;
    await route.continue();
  });

  try {
    await confirm.click();
    await expect.poll(() => assetRequested).toBe(true);
    await expect(procedure).toBeHidden();
    await expect(page.locator('.patient-model-canvas-stage')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open Airway kit from scene' })).toBeVisible();
    await expect(page.getByText('1 deployed', { exact: true })).toBeVisible();
  } finally {
    releaseTexture();
    await page.unrouteAll({ behavior: 'wait' });
  }
});
