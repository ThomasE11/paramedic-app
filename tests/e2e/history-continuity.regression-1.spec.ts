import { expect, test } from '@playwright/test';

// Regression: switching care tools unmounted the interview and erased both
// the conversation and SAMPLE progress during the same patient encounter.
test('history and SAMPLE coverage survive examination and treatment tabs', async ({ page }) => {
  await page.goto('/?devLiveCase=y1-001&capture');
  await page.getByRole('tab', { name: /^History$/i }).click();
  const panel = page.locator('[data-history-panel="true"]');
  const question = 'Do you have any allergies?';
  await panel.getByPlaceholder(/Any allergies/i).fill(question);
  await panel.getByPlaceholder(/Any allergies/i).press('Enter');
  await expect(panel.getByRole('log')).toContainText(question);
  await expect(panel).toContainText('1/6');
  const conversation = await panel.getByRole('log').innerText();

  await page.getByRole('tab', { name: /^Treat$/i }).click();
  await expect(panel).toBeHidden();
  await page.getByRole('tab', { name: /^History$/i }).click();
  await expect(panel.getByRole('log')).toHaveText(conversation, { useInnerText: true });
  await expect(panel).toContainText('1/6');

  await page.getByRole('tab', { name: /^Assess$/i }).click();
  await expect(panel).toBeHidden();
  await page.getByRole('tab', { name: /^History$/i }).click();
  await expect(panel.getByRole('log')).toHaveText(conversation, { useInnerText: true });
  await expect(panel).toContainText('1/6');
});
