import { expect, test } from '@playwright/test';
import { renderedSceneFraction } from './helpers/renderedScene';

for (const caseId of ['resp-001', 'trauma-011']) {
  test(`${caseId} uses the intended face examination lighting`, async ({ page }, info) => {
    await page.addInitScript(() => {
      localStorage.setItem('paramedic-studio-voice-enabled', 'false');
      sessionStorage.setItem('capturePinQuality', '1');
    });
    await page.goto(`/?devLiveCase=${caseId}&spo2=85`);
    await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
    await page.getByRole('button', { name: 'Examine Face', exact: true }).click();
    await expect.poll(() => renderedSceneFraction(page)).toBeGreaterThan(.25);
    const lights = await page.evaluate(() => {
      const scene = window.__r3f!.scene;
      return { pupil: !!scene.getObjectByName('pupil-exam-light'), fill: !!scene.getObjectByName('exam-fill-light') };
    });
    expect(lights).toEqual({ pupil: caseId !== 'resp-001', fill: caseId !== 'resp-001' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: info.outputPath('face-lighting.png') });
  });
}
