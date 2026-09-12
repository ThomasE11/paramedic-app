import { expect, test } from '@playwright/test';
import type * as THREE from 'three';

// Deliberately synthetic audio tests the real analyser without a cloud voice call.
function audioFixture() {
  const rate = 16000, seconds = 7;
  const out = Buffer.alloc(44 + rate * seconds * 2);
  out.write('RIFF'); out.writeUInt32LE(out.length - 8, 4); out.write('WAVEfmt ', 8);
  out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22);
  out.writeUInt32LE(rate, 24); out.writeUInt32LE(rate * 2, 28);
  out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34);
  out.write('data', 36); out.writeUInt32LE(out.length - 44, 40);
  for (let i = 0; i < rate * seconds; i++) {
    const t = i / rate;
    out.writeInt16LE(t >= 1 && t < 5 ? Math.round(Math.sin(t * Math.PI * 360) * 12000) : 0, 44 + i * 2);
  }
  return out;
}

test('pilot speech opens opposed lips without translating the entire lower face', async ({ page }, info) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/tts/health', route => route.fulfill({ json: { ok: true } }));
  await page.route('**/api/tts', route => route.fulfill({ contentType: 'audio/wav', body: audioFixture() }));
  await page.goto('/?devLiveCase=resp-001');
  const shape = () => page.evaluate(() => {
    const mesh = window.__r3f?.get().scene.getObjectByName('Patient') as THREE.Mesh | undefined;
    const morphIndex = mesh?.morphTargetDictionary?.viseme_open;
    if (!mesh || morphIndex === undefined) return null;
    const positions = mesh.geometry.getAttribute('position');
    const deltas = mesh.geometry.morphAttributes.position[morphIndex];
    const normalDeltas = mesh.geometry.morphAttributes.normal?.[morphIndex];
    let upper = 0, lower = 0, chin = 0, chinNormal = 0;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
      if (Math.abs(x) > .02 || z < .138) continue;
      if (y > 1.538 && y < 1.551) {
        upper = Math.max(upper, deltas.getY(i));
        lower = Math.min(lower, deltas.getY(i));
      }
      if (y > 1.49 && y < 1.525) {
        chin = Math.max(chin, Math.abs(deltas.getY(i)));
        if (normalDeltas) chinNormal = Math.max(chinNormal, Math.hypot(normalDeltas.getX(i), normalDeltas.getY(i), normalDeltas.getZ(i)));
      }
    }
    return { upper, lower, chin, chinNormal, weight: mesh.morphTargetInfluences![morphIndex] };
  });
  await expect.poll(shape, { timeout: 30_000 }).not.toBeNull();
  const geometry = (await shape())!;
  expect(geometry.upper).toBeGreaterThan(.001);
  expect(geometry.lower).toBeLessThan(-.003);
  expect(geometry.chin).toBeLessThan(.001);
  expect(geometry.chinNormal).toBeLessThan(.001);
  await page.getByRole('tab', { name: 'History', exact: true }).click();
  const panel = page.locator('.bedside-history-panel');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: info.outputPath('lips-rest.png') });
  await panel.getByRole('textbox').fill('What happened?');
  await panel.getByRole('button', { name: 'Send question', exact: true }).click();
  await expect.poll(async () => (await shape())?.weight).toBeGreaterThan(.3);
  await page.screenshot({ path: info.outputPath('lips-speaking.png') });
  await expect.poll(async () => (await shape())?.weight, { timeout: 12_000 }).toBeLessThan(.01);
  await page.screenshot({ path: info.outputPath('lips-recovered.png') });
  // Diagnostic close-up supplements the unmodified conversation framing above.
  await page.evaluate(() => {
    const state = window.__r3f!.get();
    const face = state.scene.getObjectByName('PatientFaceAttachment')!;
    const eye = state.scene.getObjectByName('eyeL')!;
    const other = state.scene.getObjectByName('eyeR')!;
    const target = eye.getWorldPosition(state.camera.position.clone())
      .add(other.getWorldPosition(state.camera.position.clone())).multiplyScalar(.5);
    const front = face.getWorldDirection(state.camera.position.clone());
    target.y -= .055;
    const controls = state.controls as unknown as { target: THREE.Vector3; minDistance: number; maxPolarAngle: number; update: () => void };
    controls.minDistance = .2;
    controls.maxPolarAngle = Math.PI * .7;
    controls.target.copy(target);
    state.camera.position.copy(target).addScaledVector(front, .4);
    state.camera.lookAt(target);
    controls.update();
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: info.outputPath('lips-close-rest.png') });
  await expect(panel.getByRole('status')).toContainText('Ready for a question');
  await panel.getByRole('button', { name: 'Replay last answer', exact: true }).click();
  await expect.poll(async () => (await shape())?.weight).toBeGreaterThan(.3);
  await page.screenshot({ path: info.outputPath('lips-close-speaking.png') });
  expect(errors).toEqual([]);
});
