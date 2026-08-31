import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('paramedic-studio-tour-completed', 'true');
  });
});

// Regression: ISSUE-008 — infant BVM treatment left only a floating oxygen line
// Found by /qa on 2026-08-30
// Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-08-30.md
test('infant BVM workflow leaves a visible fitted and connected device', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/?devLiveCase=cardiac-017&qa=infant-bvm-visibility');

  await page.getByRole('button', { name: 'BVM Ventilation', exact: true }).first().click();
  await page.clock.install();

  for (const step of [
    'Prepare the circuit',
    'Position the airway',
    'Create a two-handed seal',
    'Deliver a test breath',
    'Reassess ventilation',
  ]) {
    const action = page.getByRole('button', { name: `Perform: ${step}` });
    await expect(action).toBeEnabled();
    // The animated patient preview continuously changes the dialog's visual
    // bounding box; force targets the already-visible, enabled semantic button.
    await action.click({ force: true });
    await page.clock.fastForward(1_600);
  }

  await page.getByRole('button', { name: /Seal confirmed — begin timed ventilation/i }).click();
  await page.getByRole('button', { name: /20 \/ min — paediatric/i }).click();

  const fittedBvm = page.locator('[data-applied-equipment="bvm"][data-airway-connection="face"][data-oxygen-connected="true"]');
  await expect(fittedBvm).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('1 deployed', { exact: true })).toBeVisible();
});
