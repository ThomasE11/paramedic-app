import { expect, test } from '@playwright/test';
import type * as THREE from 'three';

for (const caseId of ['resp-001', 'resp-004']) {
test(`dressed trousers follow the seated patient in ${caseId}`, async ({ page }, testInfo) => {
  await page.goto(`/?devLiveCase=${caseId}`);
  await page.waitForFunction(() => {
    const scene = (window as unknown as { __r3f?: { scene: THREE.Scene } }).__r3f?.scene;
    const body = scene?.getObjectByName('Patient') as THREE.Mesh | undefined;
    return ['pose_tripod', 'pose_seated'].some(name => {
      const pose = body?.morphTargetDictionary?.[name];
      return pose !== undefined && (body?.morphTargetInfluences?.[pose] ?? 0) > 0.99;
    });
  });
  const measurements = await page.evaluate(() => {
    const scene = (window as unknown as { __r3f: { scene: THREE.Scene } }).__r3f.scene;
    const body = scene.getObjectByName('Patient') as THREE.SkinnedMesh;
    scene.updateMatrixWorld(true);
    body.skeleton.update();
    const base = body.geometry.attributes.position;
    const results: object[] = [];
    body.traverse(object => {
      if (object.name !== 'scrub-trousers') return;
      const garment = object as THREE.SkinnedMesh;
      const pos = garment.geometry.attributes.position;
      const distances: number[] = [];
      let worst = {};
      let max = 0;
      for (let i = 0; i < pos.count; i += 4) {
        const rest = scene.position.clone().fromBufferAttribute(pos, i);
        let nearest = 0;
        let squared = Infinity;
        for (let j = 0; j < base.count; j++) {
          const d = (base.getX(j) - rest.x) ** 2 + (base.getY(j) - rest.y) ** 2 + (base.getZ(j) - rest.z) ** 2;
          if (d < squared) { squared = d; nearest = j; }
        }
        const skin = body.getVertexPosition(nearest, scene.position.clone()).applyMatrix4(body.matrixWorld);
        const cloth = garment.getVertexPosition(i, scene.position.clone()).applyMatrix4(garment.matrixWorld);
        const distance = skin.distanceTo(cloth);
        distances.push(distance);
        if (distance > max) {
          max = distance;
          worst = { vertex: i, nearest, rest: rest.toArray(), baseError: Math.sqrt(squared), skin: skin.toArray(), cloth: cloth.toArray() };
        }
      }
      distances.sort((a, b) => a - b);
      results.push({ underlay: !!garment.userData.garmentUnderlay, max, p95: distances[Math.floor(distances.length * 0.95)], worst });
    });
    return results as Array<{ underlay: boolean; max: number; p95: number }>;
  });
  await testInfo.attach('garment-fit-measurements', { body: JSON.stringify(measurements, null, 2), contentType: 'application/json' });
  expect(measurements.length).toBeGreaterThan(0);
  for (const garment of measurements) {
    expect(garment.p95).toBeLessThan(0.04);
    expect(garment.max).toBeLessThan(0.08);
  }
});
}
