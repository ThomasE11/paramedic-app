import { expect, test } from '@playwright/test';

// Regression: ISSUE-024 — critical asthma fabricated a severe pain score
// when illness severity was mistaken for pain severity.
test('a breathless asthma patient answers without inventing pain', async ({ page }) => {
  await page.goto('/?devLiveCase=resp-001&capture');

  const historyTab = page.getByRole('tab', { name: /^History$/i });
  await expect(historyTab).toBeVisible({ timeout: 20_000 });
  await historyTab.click();

  const input = page.getByPlaceholder(/Any allergies/i);
  await input.fill('What is your pain out of 10?');
  await input.press('Enter');

  await expect(page.getByText('What is your pain out of 10?', { exact: true })).toBeVisible();
  const answer = page.getByText("No pain... I just... can't get enough air.", { exact: true });
  await expect(answer).toBeVisible();
  await expect(answer).not.toContainText(/eight|nine|\b[2-9]\s*out of 10/i);
});
