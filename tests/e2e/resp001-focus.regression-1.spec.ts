import { expect, test } from '@playwright/test';
import { renderedSceneFraction } from './helpers/renderedScene';

// Regression: dialogue never mounted its focus effect; the quality probe
// nevertheless reported a composer. Exercise real render output on Retina
// dock resizes, not just a mounted canvas or an allowed quality setting.
test.use({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 2 });
test('reference conversation keeps the face in focus and assessment sharp through repeated resizes', async ({ page }, info) => {
  test.setTimeout(150_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('capturePinQuality', '1');
  });
  await page.goto('/?devLiveCase=resp-001');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  const focus = () => page.evaluate(() => {
    const state = (window as unknown as { __r3f: { scene: import('three').Scene; camera: import('three').Camera } }).__r3f;
    return state.scene.userData.conversationFocus;
  });
  for (let cycle = 0; cycle < 4; cycle++) {
    await page.getByRole('tab', { name: 'History', exact: true }).click();
    await expect.poll(focus).toMatchObject({ active: true, bokeh: 1.4 });
    await expect.poll(() => renderedSceneFraction(page)).toBeGreaterThan(.25);
    const cameraFocus = await focus();
    expect(cameraFocus.distance).toBeGreaterThan(.7);
    expect(cameraFocus.distance).toBeLessThan(6);
    if (cycle === 0) await page.screenshot({ path: info.outputPath('conversation-focus.png') });
    await page.getByRole('tab', { name: 'Assess', exact: true }).click();
    await expect.poll(focus).toBeUndefined();
    await expect.poll(() => page.evaluate(() => (window as unknown as {
      __r3f: { gl: { autoClear: boolean } };
    }).__r3f.gl.autoClear)).toBe(true);
    await page.getByRole('button', { name: 'Examine Chest', exact: true }).click();
    await expect.poll(() => renderedSceneFraction(page)).toBeGreaterThan(.25);
    if (cycle === 0) await page.screenshot({ path: info.outputPath('assessment-sharp.png') });
  }
  expect(errors).toEqual([]);
});

test('the real adaptive ladder sheds dialogue focus under sustained load', async ({ page }, info) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('captureForceDegrade', '1');
  });
  await page.goto('/?devLiveCase=resp-001');
  await page.getByRole('tab', { name: 'History', exact: true }).click();
  const probe = () => page.evaluate(() => {
    const app = window as unknown as {
      __adaptiveQuality?: { tier: number; composerEnabled: boolean };
      __r3f?: { scene: import('three').Scene };
    };
    return { quality: app.__adaptiveQuality, mounted: !!app.__r3f?.scene.userData.conversationFocus };
  });
  await expect.poll(async () => (await probe()).quality?.tier, { timeout: 35_000 }).toBeGreaterThanOrEqual(1);
  await expect.poll(probe).toMatchObject({ quality: { composerEnabled: false }, mounted: false });
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  await info.attach('adaptive-focus-shedding.json', { body: JSON.stringify(await probe()), contentType: 'application/json' });
});
