import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
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
      // The local support band starts at 1.518; test the distant chin below it.
      if (y > 1.49 && y < 1.510) {
        chin = Math.max(chin, Math.abs(deltas.getY(i)));
        if (normalDeltas) chinNormal = Math.max(chinNormal, Math.hypot(normalDeltas.getX(i), normalDeltas.getY(i), normalDeltas.getZ(i)));
      }
    }
    const indices = mesh.geometry.getIndex()!;
    const vector = (i: number, influence = 0) => window.__r3f!.get().camera.position.clone().set(
      positions.getX(i) + deltas.getX(i) * influence,
      positions.getY(i) + deltas.getY(i) * influence,
      positions.getZ(i) + deltas.getZ(i) * influence,
    );
    let minNormalDot = 1, minAreaRatio = 1, maxEdgeStretch = 1, supportTriangles = 0;
    let worstTriangle: { influence: number; vertices: number[][] } | null = null;
    let worstEdge: { influence: number; vertices: number[][] } | null = null;
    for (let offset = 0; offset < indices.count; offset += 3) {
      const vertices = [indices.getX(offset), indices.getX(offset + 1), indices.getX(offset + 2)];
      if (!vertices.every(i => Math.abs(positions.getX(i)) < .031
        && positions.getY(i) > 1.510 && positions.getY(i) < 1.565 && positions.getZ(i) > .13)) continue;
      const [a, b, c] = vertices.map(i => vector(i));
      const normal = b.clone().sub(a).cross(c.clone().sub(a));
      const area = normal.length();
      if (area < 1e-10) continue;
      supportTriangles++;
      for (const influence of [.25, .5, .75, 1]) {
        const [aa, bb, cc] = vertices.map(i => vector(i, influence));
        const changed = bb.clone().sub(aa).cross(cc.clone().sub(aa));
        const dot = normal.clone().normalize().dot(changed.clone().normalize());
        if (dot < minNormalDot) {
          minNormalDot = dot;
          worstTriangle = { influence, vertices: vertices.map(i => [i, positions.getX(i), positions.getY(i), positions.getZ(i), deltas.getY(i), deltas.getZ(i)]) };
        }
        minAreaRatio = Math.min(minAreaRatio, changed.length() / area);
        for (const [u, v] of [[0, 1], [1, 2], [2, 0]]) {
          const before = vector(vertices[u]).distanceTo(vector(vertices[v]));
          const after = vector(vertices[u], influence).distanceTo(vector(vertices[v], influence));
          if (before > 1e-6 && after / before > maxEdgeStretch) {
            maxEdgeStretch = after / before;
            worstEdge = { influence, vertices: [vertices[u], vertices[v]].map(i => [i, positions.getX(i), positions.getY(i), positions.getZ(i), deltas.getY(i), deltas.getZ(i)]) };
          }
        }
      }
    }
    return { upper, lower, chin, chinNormal, minNormalDot, minAreaRatio, maxEdgeStretch, supportTriangles, worstTriangle, worstEdge,
      weight: mesh.morphTargetInfluences![morphIndex] };
  });
  await expect.poll(shape, { timeout: 30_000 }).not.toBeNull();
  const geometry = (await shape())!;
  await writeFile(info.outputPath('mouth-deformation.json'), JSON.stringify(geometry, null, 2));
  await info.attach('mouth-deformation.json', { body: JSON.stringify(geometry, null, 2), contentType: 'application/json' });
  expect(geometry.supportTriangles).toBeGreaterThan(50);
  expect(geometry.minNormalDot).toBeGreaterThan(0);
  expect(geometry.minAreaRatio).toBeGreaterThan(.25);
  expect(geometry.maxEdgeStretch).toBeLessThan(2.5);
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
