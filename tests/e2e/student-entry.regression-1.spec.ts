import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-tour-completed', 'true'));
});

// Regression: student entry was buried below educator cards and retained the
// library scroll position on entering the encounter setup.
test('student-first landing preserves category selection and starts setup at the top', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start training', exact: true })).toBeInViewport();
  await page.getByRole('button', { name: 'Start Trauma training cases' }).click();
  await expect(page.getByRole('heading', { name: 'Choose the next patient encounter' })).toBeInViewport();
  await expect(page.getByRole('button', { name: /^Trauma \d/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '15 min standard' })).not.toBeVisible();
  await page.getByText('Customise practice', { exact: false }).click();
  await expect(page.getByRole('button', { name: '15 min standard' })).toBeVisible();
  await expect(page.getByRole('button', { name: '15 min standard' })).toHaveAttribute('aria-pressed', 'true');
});

test('small-screen landing keeps the student CTA and teaching routes reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start training', exact: true })).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Join a classroom', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open educator panel', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
