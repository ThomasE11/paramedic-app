import { expect, test } from '@playwright/test';

// Regression: ISSUE-025 — free orbit and the raw Posterior toggle could move
// the camera through the villa walls and show the room from outside.
test('the home-scene camera cannot orbit behind or beyond the side walls', async ({ page }) => {
  await page.goto('/?devLiveCase=resp-001&capture');
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 30_000 });
  const logRoll = page.getByRole('button', { name: 'Log Roll', exact: true });
  await expect(logRoll).toBeVisible({ timeout: 30_000 });

  const result = await page.waitForFunction(() => {
    const rootState = window.__r3f;
    const state = rootState?.get?.() ?? rootState;
    const controls = state?.controls;
    if (!state?.camera || !controls?.target) return null;

    // Reproduce the old escape: place the camera seven metres behind the
    // patient, then let OrbitControls reconcile its spherical constraints.
    state.camera.position.set(controls.target.x, controls.target.y, controls.target.z - 7);
    controls.update();
    return {
      angle: controls.getAzimuthalAngle(),
      distance: state.camera.position.distanceTo(controls.target),
      cameraZ: state.camera.position.z,
      targetZ: controls.target.z,
    };
  }, null, { timeout: 30_000 }).then(handle => handle.jsonValue());

  expect(Math.abs(result.angle)).toBeLessThanOrEqual(Math.PI / 4 + 0.001);
  expect(result.distance).toBeLessThanOrEqual(4.3 + 0.001);
  expect(result.cameraZ).toBeGreaterThan(result.targetZ);
  await expect(page.getByRole('button', { name: 'Posterior', exact: true })).toHaveCount(0);
  await expect(logRoll).toBeVisible();

  await logRoll.click();
  await page.waitForTimeout(700);
  const afterLogRoll = await page.evaluate(() => {
    const rootState = window.__r3f;
    const state = rootState?.get?.() ?? rootState;
    return {
      angle: state.controls.getAzimuthalAngle(),
      cameraZ: state.camera.position.z,
      targetZ: state.controls.target.z,
    };
  });
  expect(Math.abs(afterLogRoll.angle)).toBeLessThanOrEqual(Math.PI / 4 + 0.001);
  expect(afterLogRoll.cameraZ).toBeGreaterThan(afterLogRoll.targetZ);
});
