import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('paramedic-studio-tour-completed', 'true');
  });
});

// Regression: ISSUE-007 — adult-sized pulse labels obscured the infant patient
// Found by /qa on 2026-08-30
// Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-08-30.md
test('infant pulse controls stay discoverable without covering the patient', async ({ page }) => {
  await page.goto('/?devLiveCase=cardiac-017&qa=infant-pulse-cues');

  const pulseControls = page.locator('button[data-compact-patient="true"][aria-label^="Check"]');
  await expect(pulseControls.first()).toBeVisible({ timeout: 20_000 });
  await expect(pulseControls).toHaveCount(5);

  await expect(page.getByText('Right carotid', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Right radial', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Left radial', { exact: true })).toHaveCount(0);
});
