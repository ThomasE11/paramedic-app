import { expect, test } from '@playwright/test';
import { renderedSceneFraction } from './helpers/renderedScene';

test('assessment tools identify the selected anatomical contact and clear on exit', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'false'));
  await page.goto('/?devLiveCase=resp-001');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  await page.getByRole('button', { name: 'Examine Chest', exact: true }).click();
  await page.getByRole('button', { name: 'Expose', exact: true }).click();
  const dock = page.locator('.patient-first-exam-dock');
  await dock.getByRole('button', { name: 'Listen', exact: true }).click();
  const contact = page.getByTestId('assessment-contact-label');
  await expect(contact).toHaveCount(0);
  await page.getByRole('button', { name: 'R upper zone: right apex / upper field', exact: true }).click();
  await expect(contact).toContainText('R upper zone');
  await dock.getByRole('button', { name: 'Listen', exact: true }).click();
  await expect(contact).toHaveCount(0);
  for (const [target, site] of [['Auscultate right upper zone', 'R upper zone'], ['Auscultate left base', 'L lower zone']]) {
    await dock.getByRole('button', { name: new RegExp(target) }).click();
    await expect(contact).toContainText(site);
    await expect(contact).toContainText('Stethoscope');
    await page.waitForTimeout(700);
    await page.locator('.patient-model-canvas-stage').scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`${site.replaceAll(' ', '-')}.png`) });
  }
  await page.evaluate(() => {
    const state = window.__r3f!.get();
    const controls = state.controls as unknown as { target: { x: number; y: number; z: number }; update: () => void };
    const { x, y, z } = controls.target;
    const dx = state.camera.position.x - x, dz = state.camera.position.z - z;
    state.camera.position.set(x + (dx + dz) / Math.sqrt(2), y + .1, z + (dz - dx) / Math.sqrt(2));
    controls.update();
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: info.outputPath('oblique-contact.png') });
  const motion = await page.evaluate(async () => {
    const tool = window.__r3f!.get().scene.getObjectByName('assessment-contact-tool')!;
    const points: number[][] = [];
    for (let frame = 0; frame < 60; frame++) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      points.push(tool.position.toArray());
    }
    return points.slice(1).map((p, i) => Math.hypot(...p.map((v, axis) => v - points[i][axis])));
  });
  expect(Math.max(...motion)).toBeLessThan(.015);
  expect(Math.max(...motion)).toBeGreaterThan(0);
  await dock.getByRole('button', { name: 'Palpate', exact: true }).click();
  await expect(contact).toHaveCount(0);
  await dock.getByRole('button', { name: /Palpate expansion/ }).click();
  await expect(contact).toContainText('Palpation');
  await page.waitForTimeout(700);
  await page.screenshot({ path: info.outputPath('palpation.png') });
  await dock.getByRole('button', { name: 'Percuss', exact: true }).click();
  await expect(contact).toHaveCount(0);
  await dock.getByRole('button', { name: /Percuss right and left/ }).click();
  await expect(contact).toContainText('Percussion');
  await page.waitForTimeout(700);
  await page.screenshot({ path: info.outputPath('percussion.png') });
  await expect(contact).toContainText('Bilateral contact sequence');
  await expect(contact).toContainText('L upper zone', { timeout: 5000 });
  await page.keyboard.press('Escape');
  await expect(contact).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('abdominal contact follows the chosen quadrant and technique with exposure guidance', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'false'));
  await page.goto('/?devLiveCase=resp-001');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  await page.getByRole('button', { name: 'Examine Abdomen', exact: true }).click();
  const dock = page.locator('.patient-first-exam-dock');
  const contact = page.getByTestId('assessment-contact-label');
  await dock.getByRole('button', { name: 'Listen', exact: true }).click();
  await dock.getByRole('button', { name: /RUQ bowel sounds and bruits/ }).click();
  await expect(contact).toContainText('Expose this region');
  await page.getByRole('button', { name: 'Expose', exact: true }).click();
  await expect(contact).not.toContainText('Expose this region');
  for (const quadrant of ['RUQ', 'LUQ', 'RLQ', 'LLQ']) {
    for (const [technique, target, label] of [
      ['Listen', 'bowel sounds and bruits', 'Stethoscope'],
      ['Percuss', 'percussion note', 'Percussion'],
      ['Palpate', 'light/deep palpation', 'Palpation'],
    ]) {
      await dock.getByRole('button', { name: technique, exact: true }).click();
      await expect(contact).toHaveCount(0);
      await dock.getByRole('button', { name: new RegExp(`${quadrant} ${target}`) }).click();
      await expect(contact).toContainText(`${label} · ${quadrant}`);
    }
    await page.waitForTimeout(600);
    await page.screenshot({ path: info.outputPath(`${quadrant}-contact.png`) });
  }
});
