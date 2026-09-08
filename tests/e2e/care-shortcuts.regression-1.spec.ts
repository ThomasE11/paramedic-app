import { expect, test } from '@playwright/test';

test('a revealed breathing finding opens its suggested treatment bag', async ({ page }) => {
  await page.goto('/?devLiveCase=resp-001');
  await page.getByRole('button', { name: 'B Breathing', exact: true }).click();
  const shortcut = page.locator('.tactical-care-feed-action').filter({ hasText: 'Treat:' }).first();
  await expect(shortcut).toBeVisible();
  await shortcut.click();
  await expect(page.getByRole('tab', { name: 'Treat', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.tactical-management-options')).toBeInViewport();
});

test('scene equipment opens treatment without applying it automatically', async ({ page }) => {
  await page.goto('/?devLiveCase=resp-001');
  await page.getByRole('button', { name: 'Open Oxygen kit from scene', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Treat', exact: true })).toHaveAttribute('aria-selected', 'true');
  const bag = page.getByRole('region', { name: 'Treatment jump bags', exact: true });
  await expect(bag.getByRole('textbox')).toHaveValue('Non-Rebreather');
  await expect(bag.getByRole('button', { name: 'Apply', exact: true })).toBeVisible();
  await expect(page.locator('[data-applied-equipment="nonrebreather"]')).toHaveCount(0);
});
