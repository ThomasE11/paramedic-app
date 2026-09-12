import { expect, test } from '@playwright/test';
import { renderedSceneFraction } from './helpers/renderedScene';

for (const [caseId, wallMonitor] of [['resp-001', false], ['trauma-011', true]] as const) {
  test(`${caseId} preserves the intended scene monitor fixtures`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'false'));
    await page.goto(`/?devLiveCase=${caseId}`);
    await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
    expect(await page.evaluate(() => !!window.__r3f!.scene.getObjectByName('legacy-wall-monitor')))
      .toBe(wallMonitor);
    // Removing a stray 3D clinic prop must not remove the student's real
    // monitor controls, power sequencing, or deliberate measurement workflow.
    const monitor = page.getByRole('region', { name: 'Vital signs monitor', exact: true });
    await expect(monitor.getByText('MONITOR OFF', { exact: true })).toBeVisible();
    await expect(monitor.getByRole('button', { name: 'Press ON to power the monitor' })).toBeVisible();
  });
}
