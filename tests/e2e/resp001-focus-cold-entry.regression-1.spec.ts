import { expect, test } from '@playwright/test';
import { renderedSceneFraction } from './helpers/renderedScene';

test.use({ deviceScaleFactor: 2 });
test('entering dialogue during a cold scene load never reuses a disposed composer', async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('capturePinQuality', '1');
  });
  // Routing disables the browser cache; no artificial wait for full scene load
  // before History, matching the user action that exposed the lifecycle crash.
  await page.route('**/models/**', route => route.continue());
  for (let visit = 0; visit < 3; visit++) {
    await page.goto('/?devLiveCase=resp-001');
    await page.getByRole('tab', { name: 'History', exact: true }).click();
    await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
    await page.waitForTimeout(1000);
    await expect(page.getByRole('complementary', { name: 'Bedside conversation' })).toBeVisible();
    expect(errors).toEqual([]);
    await page.getByRole('tab', { name: 'Assess', exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.__r3f!.gl.autoClear)).toBe(true);
    await expect.poll(() => renderedSceneFraction(page)).toBeGreaterThan(.25);
  }
  expect(errors).toEqual([]);
});
