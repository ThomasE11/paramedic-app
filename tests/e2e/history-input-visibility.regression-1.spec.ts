import { expect, test } from '@playwright/test';

test('typed history questions remain readable against the input background', async ({ page }) => {
  await page.goto('/?devLiveCase=postd-001&capture');

  const historyTab = page.getByRole('tab', { name: /^History$/i });
  await expect(historyTab).toBeVisible({ timeout: 20_000 });
  await historyTab.click();

  const input = page.getByPlaceholder(/Any allergies/i);
  await expect(input).toBeVisible();
  await input.fill('Do you have any allergies?');
  await expect(input).toHaveValue('Do you have any allergies?');

  const contrast = await input.evaluate((element) => {
    const style = getComputedStyle(element);
    const rgb = (value: string) => {
      const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
      return channels.map(channel => {
        const normalized = channel / 255;
        return normalized <= 0.04045
          ? normalized / 12.92
          : ((normalized + 0.055) / 1.055) ** 2.4;
      });
    };
    const luminance = (channels: number[]) =>
      0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];

    const background = luminance(rgb(style.backgroundColor));
    const ratioAgainstBackground = (value: string) => {
      const foreground = luminance(rgb(value));
      const lighter = Math.max(foreground, background);
      const darker = Math.min(foreground, background);
      return (lighter + 0.05) / (darker + 0.05);
    };

    return {
      text: ratioAgainstBackground(style.color),
      caret: ratioAgainstBackground(style.caretColor),
    };
  });

  expect(contrast.text).toBeGreaterThanOrEqual(4.5);
  expect(contrast.caret).toBeGreaterThanOrEqual(4.5);
});
