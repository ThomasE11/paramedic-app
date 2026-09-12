import { expect, test } from '@playwright/test';
import { renderedSceneFraction } from './helpers/renderedScene';

for (const width of [890, 1440]) {
  test(`villa observation actions remain readable and reachable at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'false'));
    await page.goto('/?devLiveCase=resp-001');
    await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
    const strip = page.getByRole('group', { name: 'Observe the patient — Look, Listen, Feel' });
    const paint = await strip.evaluate(el => getComputedStyle(el).backgroundColor);
    // Tailwind 3 does not generate the old /72 utility: it left this panel
    // transparent over the bright window despite its blur and border.
    expect(paint).toBe('rgba(2, 6, 23, 0.95)');
    const bounds = (await strip.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    for (const cue of ['Look: Chest rise & colour', 'Listen: Auscultate lungs', 'Feel: Chest wall & pulse']) {
      await strip.getByRole('button', { name: cue, exact: true }).click({ trial: true });
    }
    await page.screenshot({ path: info.outputPath('observation-controls.png') });
    await strip.getByRole('button', { name: 'Look: Chest rise & colour', exact: true }).click();
    await expect(page.locator('.patient-first-exam-dock')).toBeVisible();
  });
}
