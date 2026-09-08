import { expect, test } from '@playwright/test';
import type * as THREE from 'three';

test('pacing traverses the scene and turns into the direction of travel', async ({ page }, testInfo) => {
  await page.goto('/?devLiveCase=psych-001');
  await page.waitForFunction(() => window.__r3f?.scene?.getObjectByName('TreatmentBayPatientRoot'));
  await page.waitForTimeout(1800);
  const samples = [];
  for (let i = 0; i < 22; i++) {
    await page.waitForTimeout(400);
    samples.push(await page.evaluate(() => {
      const root = window.__r3f.scene.getObjectByName('TreatmentBayPatientRoot');
      const state = window.__r3f.get?.() ?? window.__r3f;
      const body = state.scene.getObjectByName('Patient') as THREE.SkinnedMesh;
      body.updateWorldMatrix(true, false);
      body.skeleton.update();
      let top = -Infinity, bottom = Infinity;
      for (let j = 0; j < body.geometry.attributes.position.count; j += 8) {
        const p = body.getVertexPosition(j, body.position.clone()).applyMatrix4(body.matrixWorld).project(state.camera);
        top = Math.max(top, p.y);
        bottom = Math.min(bottom, p.y);
      }
      return { x: root.position.x, z: root.position.z, yaw: root.rotation.y, top, bottom };
    }));
    if (i === 0 || i === 10 || i === 21) {
      await page.locator('.tactical-patient-viewport').screenshot({ path: testInfo.outputPath(`walking-${i}.png`) });
    }
  }
  expect(Math.max(...samples.map(p => p.z)) - Math.min(...samples.map(p => p.z))).toBeGreaterThan(.8);
  expect(samples.some(p => p.yaw > Math.PI * .8)).toBe(true);
  for (const p of samples) {
    expect(p.top, 'head stays inside the overview').toBeLessThan(.95);
    expect(p.bottom, `feet stay inside the overview: ${JSON.stringify(p)}`).toBeGreaterThan(-.95);
  }
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1], b = samples[i];
    const distance = Math.hypot(b.x - a.x, b.z - a.z);
    const facing = (b.x - a.x) * Math.sin(a.yaw) + (b.z - a.z) * Math.cos(a.yaw);
    expect(facing / distance).toBeGreaterThan(.65);
    expect(distance).toBeLessThan(.5);
  }
});
