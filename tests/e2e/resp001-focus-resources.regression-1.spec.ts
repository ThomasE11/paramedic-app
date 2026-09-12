import { expect, test } from '@playwright/test';
import { renderedSceneFraction } from './helpers/renderedScene';

test('dialogue focus releases GPU textures when returning to assessment', async ({ page }) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('capturePinQuality', '1');
    sessionStorage.setItem('captureSpo2', '85');
  });
  await page.goto('/?devLiveCase=resp-001&spo2=85');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  const counts: number[] = [];
  for (let cycle = 0; cycle < 4; cycle++) {
    await page.getByRole('tab', { name: 'History', exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.__r3f?.scene.userData.conversationFocus?.active)).toBe(true);
    await expect.poll(() => renderedSceneFraction(page)).toBeGreaterThan(.25);
    await page.getByRole('tab', { name: 'Assess', exact: true }).click();
    await expect.poll(() => page.evaluate(() => window.__r3f?.scene.userData.conversationFocus)).toBeUndefined();
    await page.waitForTimeout(1500); // R3F schedules disposals on idle work.
    counts.push(await page.evaluate(() => window.__r3f!.gl.info.memory.textures));
  }
  console.log(`dialogue texture counts ${JSON.stringify(counts)}`);
  // Warm the scene during cycle one; subsequent visits must not retain a new
  // set of compositor buffers. Two textures allow the live blink atlas swap.
  expect(Math.max(...counts.slice(1))).toBeLessThanOrEqual(counts[0] + 2);
});
