import { expect, test } from '@playwright/test';
import { renderedSceneFraction } from './helpers/renderedScene';

test.use({ deviceScaleFactor: 2 });

test('pore detail has a matching face examination before and after capture', async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('capturePinQuality', '1');
    sessionStorage.setItem('captureSpo2', '85');
  });
  for (const profile of ['original', 'corrected']) {
    if (profile === 'original') {
      await page.route('**/resp001SkinDetail.ts*', async route => {
        const response = await route.fetch();
        const source = await response.text();
        expect(source).toContain('enabled ? RESP001_SKIN_DETAIL_PROFILE');
        await route.fulfill({ response, body: source.replace('enabled ? RESP001_SKIN_DETAIL_PROFILE', 'false ? RESP001_SKIN_DETAIL_PROFILE') });
      });
    }
    await page.goto('/?devLiveCase=resp-001&spo2=85');
    await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
    await page.getByRole('button', { name: 'Examine Face', exact: true }).click();
    await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
    await page.locator('.patient-model-canvas-stage canvas').scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
    await expect(page.getByText('StudentPanel Error', { exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => window.__r3f!.gl.getContext().isContextLost())).toBe(false);
    await page.screenshot({ path: info.outputPath(`skin-${profile}.png`) });
    await page.unroute('**/resp001SkinDetail.ts*');
  }
  expect(errors).toEqual([]);
});

test('reference skin uses the dedicated pore map in a compiled GPU shader', async ({ page }, info) => {
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('capturePinQuality', '1');
    sessionStorage.setItem('captureSpo2', '85');
  });
  const textureResponse = page.waitForResponse(response => response.url().endsWith('patient-male-skin-resp001-pore-detail-normal.png'));
  await page.goto('/?devLiveCase=resp-001&spo2=85');
  expect((await textureResponse).ok()).toBe(true);
  await page.getByRole('tab', { name: 'History', exact: true }).click();
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  await expect.poll(() => page.evaluate(() => {
    const renderer = window.__r3f!.gl;
    const context = renderer.getContext();
    const programs = renderer.info.programs as Array<{ program: WebGLProgram }>;
    return programs.some(({ program }) => {
      const tiles = context.getUniformLocation(program, 'detailNormalTiles');
      const scale = context.getUniformLocation(program, 'detailNormalScale');
      return tiles !== null && scale !== null && context.getUniform(program, tiles) === 28
        && Math.abs(context.getUniform(program, scale) - .8) < .001;
    });
  })).toBe(true);
  await page.locator('.patient-model-canvas-stage canvas').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: info.outputPath('patient-pore-detail.png') });
});

test('other cases retain their existing skin map', async ({ page }) => {
  const pilotRequests: string[] = [];
  page.on('request', request => {
    if (request.url().includes('patient-male-skin-resp001-pore-detail-normal.png')) pilotRequests.push(request.url());
  });
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'false'));
  await page.goto('/?devLiveCase=trauma-011');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  expect(pilotRequests).toEqual([]);
});
