import { expect, test } from '@playwright/test';
import { renderedSceneFraction } from './helpers/renderedScene';

test('pilot penlight drives direct and consensual pupils on the patient, then releases', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'false'));
  await page.goto('/?devLiveCase=resp-001');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  await page.getByRole('button', { name: 'Examine Face', exact: true }).click();
  await page.locator('.patient-first-exam-dock').getByRole('button', { name: /Pupil Reactivity/ }).click();
  await page.waitForTimeout(1000);
  const framing = await page.evaluate(() => {
    const state = window.__r3f!.get();
    const face = state.scene.getObjectByName('PatientFaceAttachment')!;
    const left = state.scene.getObjectByName('eyeL')!;
    const right = state.scene.getObjectByName('eyeR')!;
    const centre = left.getWorldPosition(state.camera.position.clone()).add(right.getWorldPosition(state.camera.position.clone())).multiplyScalar(.5);
    const front = face.getWorldDirection(state.camera.position.clone());
    const direction = state.camera.position.clone().sub(centre).normalize();
    return { facing: front.dot(direction), height: state.camera.position.y };
  });
  expect(framing.facing).toBeGreaterThan(.95);
  expect(framing.height).toBeGreaterThan(.4);
  await page.locator('.patient-model-canvas-stage').scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('eyes-ambient.png') });
  const pupils = () => page.evaluate(() => {
    const scene = window.__r3f!.get().scene;
    return ['pupilL', 'pupilR'].map(name => scene.getObjectByName(name)!.scale.x);
  });
  const baseline = await pupils();
  await page.getByRole('button', { name: "Shine light: patient's left eye", exact: true }).click();
  await expect.poll(async () => (await pupils())[0]).toBeLessThan(baseline[0] * .85);
  await expect.poll(async () => (await pupils())[1]).toBeLessThan(baseline[1] * .85);
  await page.screenshot({ path: info.outputPath('eyes-left-light.png') });
  await page.getByRole('button', { name: "Shine light: patient's right eye", exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: info.outputPath('eyes-right-light.png') });
  await page.getByRole('button', { name: 'Penlight off', exact: true }).click();
  await expect.poll(async () => (await pupils())[0]).toBeGreaterThan(baseline[0] * .97);
  await expect.poll(async () => (await pupils())[1]).toBeGreaterThan(baseline[1] * .97);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Penlight off', exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => !!window.__r3f!.get().scene.getObjectByName('pilot-penlight'))).toBe(false);
  expect(errors).toEqual([]);
});
