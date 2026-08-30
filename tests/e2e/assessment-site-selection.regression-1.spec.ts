import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('paramedic-studio-tour-completed', 'true');
  });
});

// Regression: ISSUE-001 — selecting Listen recorded the first target without a site click
// Found by /qa on 2026-08-30
// Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-08-30.md
test('assessment technique selection waits for an anatomical target', async ({ page }) => {
  await page.goto('/?devLiveCase=litfl-001&qa=assessment-site-selection');

  await page.getByRole('tab', { name: 'Assess' }).click();
  await page.getByRole('button', { name: 'Examine Chest' }).click();

  const assessmentBay = page.getByText('Hands-on assessment bay').locator('..').locator('..');
  await expect(assessmentBay.getByText('0/9', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Listen' }).click();

  await expect(page.getByRole('button', { name: 'Auscultate apices, mid-zones, bases' })).toBeVisible();
  await expect(assessmentBay.getByText('0/9', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Auscultate apices, mid-zones, bases ✓/ })).toHaveCount(0);
  await expect(page.getByText('Auscultating lung fields — listen carefully.')).toHaveCount(0);
});
