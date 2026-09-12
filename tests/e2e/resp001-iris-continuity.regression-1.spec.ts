import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import type * as THREE from 'three';

test('pilot iris detail persists from conversation through pupil assessment and back', async ({ page }, info) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'false'));
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?devLiveCase=resp-001');
  await expect.poll(() => page.evaluate(() => !!window.__r3f?.get().scene.getObjectByName('PilotEyelids')), { timeout: 30000 }).toBe(true);
  await page.getByRole('tab', { name: 'History', exact: true }).click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: info.outputPath('conversation-production.png') });
  // A labelled diagnostic close-up supplements the unmodified UI framing.
  await page.evaluate(() => {
    const state = window.__r3f!.get(), face = state.scene.getObjectByName('PatientFaceAttachment')!;
    const centre = state.scene.getObjectByName('eyeL')!.getWorldPosition(state.camera.position.clone())
      .add(state.scene.getObjectByName('eyeR')!.getWorldPosition(state.camera.position.clone())).multiplyScalar(.5);
    const controls = state.controls as unknown as { target: THREE.Vector3; minDistance: number; maxPolarAngle: number; update: () => void };
    controls.minDistance = .15; controls.maxPolarAngle = Math.PI * .7; controls.target.copy(centre);
    state.camera.position.copy(centre).addScaledVector(face.getWorldDirection(state.camera.position.clone()), .4);
    state.camera.lookAt(centre); controls.update();
  });
  await page.waitForTimeout(250);
  await page.locator('.patient-model-canvas-stage canvas').screenshot({ path: info.outputPath('conversation-eyes-diagnostic.png') });
  const appearance = () => page.evaluate(() => ['irisL', 'irisR'].map(name => {
    const mesh = window.__r3f!.get().scene.getObjectByName(name) as THREE.Mesh;
    const material = mesh.material as THREE.MeshPhysicalMaterial;
    const uv = mesh.geometry.getAttribute('uv');
    const map = material.map as THREE.CanvasTexture | null;
    let textureRange = 0;
    if (map?.image instanceof HTMLCanvasElement) {
      const image = map.image, pixels = image.getContext('2d')!.getImageData(0, 0, image.width, image.height).data;
      const samples: number[] = [];
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 32) {
        const x = Math.round(image.width * (.5 + .32 * Math.cos(angle)));
        const y = Math.round(image.height * (.5 + .32 * Math.sin(angle)));
        samples.push(pixels[(y * image.width + x) * 4]);
      }
      textureRange = Math.max(...samples) - Math.min(...samples);
    }
    return { name, geometry: mesh.geometry.uuid, material: material.uuid, texture: map?.uuid ?? null, textureRange,
      uvRange: uv ? [Math.min(...Array.from({ length: uv.count }, (_, i) => uv.getX(i))), Math.max(...Array.from({ length: uv.count }, (_, i) => uv.getX(i)))] : [],
      pupilScale: window.__r3f!.get().scene.getObjectByName(name === 'irisL' ? 'pupilL' : 'pupilR')!.scale.x };
  }));
  const before = await appearance();
  await writeFile(info.outputPath('iris-before.json'), JSON.stringify(before, null, 2));
  for (const eye of before) {
    expect(eye.texture).not.toBeNull();
    expect(eye.textureRange).toBeGreaterThan(20);
    expect(eye.uvRange[0]).toBeCloseTo(0);
    expect(eye.uvRange[1]).toBeCloseTo(1);
  }
  await page.getByRole('tab', { name: 'Assess', exact: true }).click();
  await page.getByRole('button', { name: 'Examine Face', exact: true }).click();
  await page.locator('.patient-first-exam-dock').getByRole('button', { name: /Pupil Reactivity/ }).click();
  await page.getByRole('button', { name: "Shine light: patient's left eye", exact: true }).click();
  await expect.poll(async () => (await appearance())[0].pupilScale).toBeLessThan(before[0].pupilScale * .85);
  await expect.poll(async () => (await appearance())[1].pupilScale).toBeLessThan(before[1].pupilScale * .85);
  const during = await appearance();
  expect(during.map(({ geometry, material, texture }) => [geometry, material, texture]))
    .toEqual(before.map(({ geometry, material, texture }) => [geometry, material, texture]));
  await page.keyboard.press('Escape');
  await page.getByRole('tab', { name: 'History', exact: true }).click();
  await expect.poll(async () => (await appearance())[0].pupilScale).toBeCloseTo(before[0].pupilScale, 4);
  const after = await appearance();
  expect(after).toEqual(before);
  expect(await page.evaluate(() => !!window.__r3f!.get().scene.getObjectByName('pilot-penlight'))).toBe(false);
  await page.screenshot({ path: info.outputPath('conversation-return.png') });
  expect(errors).toEqual([]);
});

test('non-pilot eyes retain their authored iris materials', async ({ page }) => {
  await page.goto('/?devLiveCase=resp-003');
  await expect.poll(() => page.evaluate(() => !!window.__r3f?.get().scene.getObjectByName('irisR')), { timeout: 30000 }).toBe(true);
  expect(await page.evaluate(() => ['irisL', 'irisR'].map(name => {
    const mesh = window.__r3f!.get().scene.getObjectByName(name) as THREE.Mesh;
    return (mesh.material as THREE.MeshStandardMaterial).map;
  }))).toEqual([null, null]);
});
