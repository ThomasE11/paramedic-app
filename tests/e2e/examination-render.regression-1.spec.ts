import { expect, test } from '@playwright/test';
import { renderedSceneFraction } from './helpers/renderedScene';

test.use({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, screenshot: 'only-on-failure' });

test('opening and closing the assessment dock never leaves the resized patient canvas black', async ({ page }, testInfo) => {
  test.setTimeout(120_000);
  await page.goto('/?devLiveCase=resp-001&capture');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(0.25);
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: 'Examine Face', exact: true }).click();
    await expect(page.locator('.patient-first-exam-dock')).toBeVisible();
    // Clinical rendering must clear each frame. Optional composers disable
    // this flag and can leave old head/limb frames as ghost silhouettes.
    await expect.poll(() => page.evaluate(() => (
      window as unknown as { __r3f?: { gl: { autoClear: boolean } } }
    ).__r3f?.gl.autoClear)).toBe(true);
    // Wait for the 460 ms camera preset AND dock resize before judging pixels.
    await page.waitForTimeout(1_000);
    await expect.poll(() => renderedSceneFraction(page), { timeout: 5_000 }).toBeGreaterThan(0.25);
    await page.screenshot({ path: testInfo.outputPath(`face-close-up-${i}.png`) });
    await page.getByRole('button', { name: 'Back to full body', exact: true }).click();
    await page.waitForTimeout(1_000);
    await expect.poll(() => renderedSceneFraction(page), { timeout: 5_000 }).toBeGreaterThan(0.25);
    await page.screenshot({ path: testInfo.outputPath(`full-body-${i}.png`) });
  }
});
