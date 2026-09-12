import { expect, test } from '@playwright/test';
import type * as THREE from 'three';

// Exercise the real mounted BodyMesh with independent presentation inputs.
// This fixture does not change any case, vitals, treatment or scoring rules.
const fixture = `<!doctype html><html><body style="margin:0"><div id="root" style="height:100vh"></div>
<script type="module">
import RefreshRuntime from '/@react-refresh';
RefreshRuntime.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => type => type;
window.__vite_plugin_react_preamble_installed__ = true;
</script><script type="module" src="/tests/e2e/fixtures/skinSheen.tsx"></script></body></html>`;

declare global {
  interface Window {
    skinScene?: THREE.Scene;
    setSkinAppearance?: (patch: { diaphoresis?: number; skinTint?: string; skinDiaphoretic?: boolean; patientGender?: 'male' | 'female' }) => void;
  }
}

test('settled sweat survives a perfusion-colour update and dries to its original material', async ({ page }, info) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/__skin-fixture', route => route.fulfill({ contentType: 'text/html', body: fixture }));
  await page.goto('/__skin-fixture');
  const material = () => page.evaluate(() => {
    const mesh = window.skinScene?.getObjectByName('Patient') as THREE.Mesh | undefined;
    if (!mesh) return null;
    const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
    return { id: mesh.uuid, roughness: mat.roughness, env: mat.envMapIntensity, colour: mat.color.getHexString() };
  });
  await expect.poll(material, { timeout: 30_000 }).not.toBeNull();
  await expect.poll(async () => (await material())!.roughness, { timeout: 15_000 }).toBeCloseTo(.34, 4);
  // Wait beyond convergence: the bug occurs when the sheen frame loop is idle.
  await page.waitForTimeout(500);
  const wet = await material();
  await page.screenshot({ path: info.outputPath('wet-before-colour.png') });
  await page.evaluate(() => window.setSkinAppearance!({ skinTint: '#d4e0e8' }));
  await expect.poll(async () => (await material())!.colour).toBe('d4e0e8');
  await page.waitForTimeout(300);
  const retinted = await material();
  await page.screenshot({ path: info.outputPath('wet-after-colour.png') });
  await info.attach('wet-materials', { body: JSON.stringify({ wet, retinted }), contentType: 'application/json' });
  expect(retinted!.roughness).toBeCloseTo(wet!.roughness, 4);
  expect(retinted!.env).toBeCloseTo(wet!.env, 4);
  // The legacy binary channel remains immediate without replacing the
  // independently eased continuous channel or its original dry baseline.
  await page.evaluate(() => window.setSkinAppearance!({ skinDiaphoretic: true }));
  await expect.poll(async () => (await material())!.roughness).toBeCloseTo(.32, 4);
  // Swapping the model must resolve the new clone's dry baseline, not cache
  // the previous clone's transient .32 override as its permanent roughness.
  const maleId = (await material())!.id;
  await page.evaluate(() => window.setSkinAppearance!({ patientGender: 'female' }));
  await expect.poll(async () => (await material())?.id, { timeout: 15_000 }).not.toBe(maleId);
  await expect.poll(async () => (await material())?.roughness).toBeCloseTo(.32, 4);
  const femaleId = (await material())!.id;
  await page.evaluate(() => window.setSkinAppearance!({ skinDiaphoretic: false }));
  await expect.poll(async () => (await material())!.roughness).toBeCloseTo(.34, 4);
  await page.evaluate(() => window.setSkinAppearance!({ patientGender: 'male' }));
  await expect.poll(async () => (await material())?.id, { timeout: 15_000 }).not.toBe(femaleId);
  await expect.poll(async () => (await material())?.roughness).toBeCloseTo(.34, 4);

  await page.evaluate(() => window.setSkinAppearance!({ diaphoresis: 0 }));
  await page.waitForTimeout(1500);
  const drying = await material();
  expect(drying!.roughness).toBeGreaterThan(.34);
  expect(drying!.roughness).toBeLessThan(.36); // no immediate dry snap
  await expect.poll(async () => (await material())!.roughness, { timeout: 65_000, intervals: [1000] }).toBeCloseTo(.5, 4);
  expect((await material())!.env).toBeCloseTo(.65, 4);
  await page.screenshot({ path: info.outputPath('dry-after-recovery.png') });
  // The retained boolean API shares the same writer, including return to dry.
  await page.evaluate(() => window.setSkinAppearance!({ skinDiaphoretic: true }));
  await expect.poll(async () => (await material())!.roughness).toBeCloseTo(.32, 4);
  await page.evaluate(() => window.setSkinAppearance!({ skinTint: '#ffffff' }));
  await page.waitForTimeout(300);
  expect((await material())!.roughness).toBeCloseTo(.32, 4);
  await page.evaluate(() => window.setSkinAppearance!({ skinDiaphoretic: false }));
  await expect.poll(async () => (await material())!.roughness).toBeCloseTo(.5, 4);
  expect(errors).toEqual([]);
});
