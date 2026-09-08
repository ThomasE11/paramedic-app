import { expect, test } from '@playwright/test';
import type * as THREE from 'three';

for (const caseId of ['y1-011', 'trauma-011', 'psych-001']) {
  test(`patient and camera stay above scene floor in ${caseId}`, async ({ page }, testInfo) => {
    await page.goto(`/?devLiveCase=${caseId}`);
    await page.waitForFunction(() => window.__r3f?.scene?.getObjectByName('Patient'));
    await page.waitForTimeout(1500);
    const result = await page.evaluate(() => {
      const state = window.__r3f.get?.() ?? window.__r3f;
      const body = state.scene.getObjectByName('Patient') as THREE.SkinnedMesh;
      state.scene.updateMatrixWorld(true);
      body.skeleton.update();
      let minY = Infinity;
      for (let i = 0; i < body.geometry.attributes.position.count; i++) {
        const p = body.getVertexPosition(i, state.scene.position.clone()).applyMatrix4(body.matrixWorld);
        minY = Math.min(minY, p.y);
      }
      const c = state.controls;
      state.camera.position.set(c.target.x + 1, -3, c.target.z + 1);
      c.update();
      return { minY, cameraY: state.camera.position.y, seat: !!state.scene.getObjectByName('vehicle-patient-seat'), clinicalSeat: !!state.scene.getObjectByName('clinical-patient-seat') };
    });
    expect(result.cameraY).toBeGreaterThan(-.04);
    expect(result.minY).toBeGreaterThan(-.15);
    expect(result.minY).toBeLessThan(.12);
    if (caseId === 'y1-011') expect(result.seat).toBe(true);
    if (caseId === 'trauma-011') expect(result.clinicalSeat).toBe(true);
    await page.locator('.tactical-patient-viewport').screenshot({ path: testInfo.outputPath(`${caseId}-grounded.png`) });
  });
}
