import { expect, test } from '@playwright/test';
import type * as THREE from 'three';

test('head-mounted equipment follows the same transform as the facial skin', async ({ page }, testInfo) => {
  await page.goto('/?devLiveCase=resp-001');
  await page.waitForFunction(() => {
    const state = (window as unknown as { __r3f?: { scene: THREE.Scene } }).__r3f;
    const patient = state?.scene.getObjectByName('Patient') as THREE.SkinnedMesh | undefined;
    const pose = patient?.morphTargetDictionary?.pose_tripod;
    return !!state?.scene.getObjectByName('PatientFaceAttachment')
      && pose !== undefined && (patient?.morphTargetInfluences?.[pose] ?? 0) > 0.99;
  });
  const measurement = await page.evaluate(() => {
    const scene = (window as unknown as { __r3f: { scene: THREE.Scene } }).__r3f.scene;
    scene.updateMatrixWorld(true);
    const root = scene.getObjectByName('TreatmentBayPatientRoot')!;
    const frame = scene.getObjectByName('PatientFaceAttachment')!;
    const patient = scene.getObjectByName('Patient') as THREE.SkinnedMesh;
    patient.skeleton.update();
    const inverseRoot = root.matrixWorld.clone().invert();
    const pos = patient.geometry.attributes.position;
    const point = scene.position.clone();
    let index = 0;
    let closest = Infinity;
    for (let i = 0; i < pos.count; i++) {
      point.fromBufferAttribute(pos, i).applyMatrix4(patient.matrixWorld).applyMatrix4(inverseRoot);
      const distance = point.distanceToSquared(scene.position.clone().set(0, 1.63, 0.13));
      if (distance < closest) { closest = distance; index = i; }
    }
    const base = point.fromBufferAttribute(pos, index).applyMatrix4(patient.matrixWorld).applyMatrix4(inverseRoot).clone();
    const skin = patient.getVertexPosition(index, point).applyMatrix4(patient.matrixWorld).clone();
    const attachment = base.clone().applyMatrix4(frame.matrixWorld);
    const weights = patient.geometry.attributes.skinWeight;
    const bones = patient.geometry.attributes.skinIndex;
    return {
      index, base: base.toArray(), skin: skin.toArray(), attachment: attachment.toArray(),
      errorMetres: skin.distanceTo(attachment),
      weights: [0, 1, 2, 3].map(c => [patient.skeleton.bones[bones.getComponent(index, c)].name, weights.getComponent(index, c)]),
      morphs: patient.morphTargetInfluences,
    };
  });
  await testInfo.attach('head-frame-measurement', { body: JSON.stringify(measurement, null, 2), contentType: 'application/json' });
  expect(measurement.errorMetres).toBeLessThan(0.02);
});
