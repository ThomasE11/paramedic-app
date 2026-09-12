import { expect, test, type Page } from '@playwright/test';
import { renderedSceneFraction } from './helpers/renderedScene';

async function irisBrightness(page: Page) {
  const centres = await page.evaluate(() => {
    const state = window.__r3f!.get();
    const rect = document.querySelector('.patient-model-canvas-stage canvas')!.getBoundingClientRect();
    return ['irisL', 'irisR'].map(name => {
      const p = state.scene.getObjectByName(name)!.getWorldPosition(state.camera.position.clone()).project(state.camera);
      return { x: rect.x + (p.x + 1) * rect.width / 2, y: rect.y + (1 - p.y) * rect.height / 2 };
    });
  });
  const png = (await page.screenshot()).toString('base64');
  return page.evaluate(async ({ png, centres }) => {
    const image = new Image(); image.src = `data:image/png;base64,${png}`; await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext('2d')!; ctx.drawImage(image, 0, 0);
    const ratio = image.width / window.innerWidth;
    return centres.map(({ x, y }) => {
      const pixels = ctx.getImageData(Math.round((x - 5) * ratio), Math.round((y - 5) * ratio), Math.round(10 * ratio), Math.round(10 * ratio)).data;
      let sum = 0;
      for (let i = 0; i < pixels.length; i += 4) sum += .2126 * pixels[i] + .7152 * pixels[i + 1] + .0722 * pixels[i + 2];
      return sum / (pixels.length / 4);
    });
  }, { png, centres });
}

test('pilot penlight drives direct and consensual pupils on the patient, then releases', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'false'));
  await page.goto('/?devLiveCase=resp-001');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  const originalIrisGeometry = await page.evaluate(() => (window.__r3f!.get().scene.getObjectByName('irisL') as import('three').Mesh).geometry.uuid);
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
  const ambientBrightness = await irisBrightness(page);
  const pupils = () => page.evaluate(() => {
    const scene = window.__r3f!.get().scene;
    return ['pupilL', 'pupilR'].map(name => scene.getObjectByName(name)!.scale.x);
  });
  const baseline = await pupils();
  await page.getByRole('button', { name: "Shine light: patient's left eye", exact: true }).click();
  await expect.poll(async () => (await pupils())[0]).toBeLessThan(baseline[0] * .85);
  await expect.poll(async () => (await pupils())[1]).toBeLessThan(baseline[1] * .85);
  await page.screenshot({ path: info.outputPath('eyes-left-light.png') });
  const leftBrightness = await irisBrightness(page);
  expect(leftBrightness[0] - ambientBrightness[0]).toBeGreaterThan(15);
  const lightPlacement = await page.evaluate(() => {
    const state = window.__r3f!.get();
    const light = state.scene.getObjectByName('pilot-penlight-illumination') as import('three').SpotLight;
    const eye = state.scene.getObjectByName('irisL')!;
    const tool = state.scene.getObjectByName('pilot-penlight')!;
    const projected = tool.getWorldPosition(state.camera.position.clone()).project(state.camera);
    return { focused: light.isSpotLight === true,
      targetError: light.target?.getWorldPosition(state.camera.position.clone()).distanceTo(eye.getWorldPosition(state.camera.position.clone())) ?? 1,
      x: projected.x, y: projected.y };
  });
  expect(lightPlacement.focused).toBe(true);
  expect(lightPlacement.targetError).toBeLessThan(.001);
  expect(Math.abs(lightPlacement.x)).toBeLessThan(.9);
  expect(Math.abs(lightPlacement.y)).toBeLessThan(.9);
  await page.getByRole('button', { name: "Shine light: patient's right eye", exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: info.outputPath('eyes-right-light.png') });
  const rightBrightness = await irisBrightness(page);
  expect(rightBrightness[1] - ambientBrightness[1]).toBeGreaterThan(15);
  expect(rightBrightness[0]).toBeLessThan(leftBrightness[0] - 15);
  await page.getByRole('button', { name: 'Penlight off', exact: true }).click();
  await expect.poll(async () => (await pupils())[0]).toBeGreaterThan(baseline[0] * .97);
  await expect.poll(async () => (await pupils())[1]).toBeGreaterThan(baseline[1] * .97);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Penlight off', exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => !!window.__r3f!.get().scene.getObjectByName('pilot-penlight'))).toBe(false);
  expect(await page.evaluate(() => (window.__r3f!.get().scene.getObjectByName('irisL') as import('three').Mesh).geometry.uuid)).toBe(originalIrisGeometry);
  expect(errors).toEqual([]);
});
