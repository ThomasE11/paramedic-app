import { expect, test } from '@playwright/test';
import path from 'node:path';
import { renderedSceneFraction } from './helpers/renderedScene';

test('reference trouser correction renders in the same leg examination as the original', async ({ page }, info) => {
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('capturePinQuality', '1');
  });
  // A/B the assets through the same application and camera, without changing
  // the worktree or replacing the shared garment used by other patients.
  for (const profile of ['original', 'corrected']) {
    let requested = false;
    await page.route('**/models/garment-trousers-resp001.glb', async route => {
      requested = true;
      await route.fulfill({ contentType: 'model/gltf-binary', path: path.resolve('public/models',
        profile === 'original' ? 'garment-trousers.glb' : 'garment-trousers-resp001.glb') });
    });
    await page.goto('/?devLiveCase=resp-001');
    await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
    await page.getByRole('button', { name: 'Examine Limbs', exact: true }).click();
    await page.getByRole('button', { name: /R Leg.*Femoral/ }).click();
    const canvas = page.locator('.patient-model-canvas-stage canvas');
    await canvas.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    expect(requested).toBe(true);
    await expect.poll(() => renderedSceneFraction(page)).toBeGreaterThan(.25);
    await canvas.screenshot({ path: info.outputPath(`trousers-${profile}.png`) });
    await page.unroute('**/models/garment-trousers-resp001.glb');
  }
});

test('other cases do not request the pilot-specific trouser asset', async ({ page }) => {
  const pilotRequests: string[] = [];
  page.on('request', request => {
    if (request.url().includes('garment-trousers-resp001.glb')) pilotRequests.push(request.url());
  });
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'false'));
  await page.goto('/?devLiveCase=trauma-011');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  expect(pilotRequests).toEqual([]);
});
