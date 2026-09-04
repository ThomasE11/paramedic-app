import { expect, test } from '@playwright/test';

// Regression: OPQRST answers guessed from a diagnosis label, so a documented
// right-hip injury could answer "all over" and cardiac labels invented spread.
test('pain questions answer from this patient’s authored history and examination', async ({ page }) => {
  await page.goto('/?devLiveCase=y1-001&capture');

  const historyTab = page.getByRole('tab', { name: /^History$/i });
  await expect(historyTab).toBeVisible({ timeout: 20_000 });
  await historyTab.click();

  const input = page.getByPlaceholder(/Any allergies/i);
  await input.fill('Where exactly does it hurt?');
  await input.press('Enter');

  await expect(page.getByText('Where exactly does it hurt?', { exact: true })).toBeVisible();
  const locationAnswer = page.getByText(/It’s my right hip — right here\./i);
  await expect(locationAnswer).toBeVisible();
  await expect(locationAnswer).not.toContainText(/all over/i);

  await input.fill('Does the pain go anywhere else?');
  await input.press('Enter');
  const radiationAnswer = page.getByText('No — it stays in the one spot.', { exact: true });
  await expect(radiationAnswer).toBeVisible();
  await expect(radiationAnswer).not.toContainText(/left arm|jaw/i);
});
