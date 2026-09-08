import { expect, test } from '@playwright/test';

test('survey sections never reveal unrequested monitor measurements', async ({ page }, testInfo) => {
  await page.clock.install();
  await page.goto('/?devLiveCase=y1-011');
  const monitor = page.getByRole('region', { name: 'Vital signs monitor', exact: true });
  await expect(page.getByRole('tab', { name: 'Assess', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(monitor.getByText('MONITOR OFF', { exact: true })).toBeVisible();
  await expect(page.locator('.roadmap-vitals-stack')).toHaveCount(0);
  await page.getByRole('button', { name: 'D Disability', exact: true }).click();
  await page.getByRole('button', { name: 'E Exposure', exact: true }).click();
  await monitor.getByRole('button', { name: 'Press ON to power the monitor' }).click();
  await page.clock.fastForward(4000);
  for (const name of ['heart rate', 'oxygen saturation', 'blood glucose', 'temperature']) {
    await expect(monitor.getByRole('button', { name: `Measure ${name}`, exact: true })).toContainText('--');
  }
  const spo2 = monitor.getByRole('button', { name: 'Measure oxygen saturation', exact: true });
  await spo2.press('Enter');
  await page.clock.fastForward(10_000);
  await expect(spo2).not.toContainText('--');
  await expect(monitor.getByRole('button', { name: 'Measure heart rate', exact: true })).toContainText('--');
  await monitor.screenshot({ path: testInfo.outputPath('requested-spo2-only.png') });
});

for (const width of [1280, 1728]) {
  test(`anatomy navigation does not overlap the footer at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto('/?devLiveCase=y1-011');
    await page.getByRole('button', { name: 'Examine Chest', exact: true }).click();
    const nav = page.locator('.patient-region-selector');
    const footer = page.locator('.patient-exam-footer');
    await expect(nav).toBeVisible();
    await expect(footer).toBeVisible();
    const a = await nav.boundingBox();
    const b = await footer.boundingBox();
    expect(a!.y + a!.height).toBeLessThan(b!.y);
    for (const label of ['A Airway', 'B Breathing', 'C Circulation', 'D Disability', 'E Exposure']) {
      await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible();
    }
    await page.locator('.tactical-patient-viewport').screenshot({ path: testInfo.outputPath('unclipped-anatomy.png') });
  });
}
