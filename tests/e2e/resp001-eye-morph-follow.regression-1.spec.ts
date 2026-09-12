import { expect, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import type * as THREE from 'three';

test('pilot closed eyelids remain over the eyes during distress morphs', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => localStorage.setItem('paramedic-studio-voice-enabled', 'false'));
  await page.goto('/?devLiveCase=resp-001');
  await expect.poll(() => page.evaluate(() => !!window.__r3f?.get().scene.getObjectByName('PilotEyelids')), { timeout: 30000 }).toBe(true);
  await page.getByRole('button', { name: 'Examine Face', exact: true }).click();
  await page.waitForTimeout(800);
  // Controlled geometry probe: exercise actual authored clinical morphs at
  // exact weights in one render transaction, without changing clinical state.
  const result = await page.evaluate(() => {
    const state = window.__r3f!.get();
    const body = state.scene.getObjectByName('Patient') as THREE.SkinnedMesh;
    const lids = state.scene.getObjectByName('PilotEyelids') as THREE.SkinnedMesh;
    const saved = [...body.morphTargetInfluences!];
    const blinkIndex = lids.morphTargetDictionary!.eyelids_closed;
    const savedBlink = lids.morphTargetInfluences![blinkIndex];
    const captures: Record<string, string> = {};
    const frames: Array<{ name: string; closure: number; covered: number; total: number; misses: string[]; openCentres: number }> = [];
    const Raycaster = state.raycaster.constructor as typeof THREE.Raycaster;
    const ray = new Raycaster();
    const variants = [
      { name: 'neutral', weights: [0, 0, 0] },
      ...['motion_gasp', 'motion_wince', 'motion_agitation'].flatMap((name, i) => [.5, 1].map(weight => ({
        name: `${name}-${weight}`, weights: [0, 0, 0].map((_, j) => i === j ? weight : 0),
      }))),
      { name: 'combined', weights: [.5, .2, .08] },
      { name: 'returned-neutral', weights: [0, 0, 0] },
    ];
    for (const { name, weights } of variants) {
      body.morphTargetInfluences!.splice(0, saved.length, ...saved);
      ['motion_gasp', 'motion_wince', 'motion_agitation'].forEach((motion, i) => {
        body.morphTargetInfluences![body.morphTargetDictionary![motion]] = weights[i];
      });
      lids.morphTargetInfluences![blinkIndex] = 1;
      state.gl.render(state.scene, state.camera);
      captures[`${name}-closed`] = state.gl.domElement.toDataURL('image/png');
      for (const mesh of [body, lids]) { mesh.computeBoundingSphere(); mesh.computeBoundingBox(); }
      let covered = 0, total = 0;
      const misses: string[] = [];
      for (const eye of ['irisL', 'irisR']) for (const x of [-.004, 0, .004]) for (const y of [-.0015, 0, .0015]) {
        const iris = state.scene.getObjectByName(eye)!;
        const target = iris.localToWorld(state.camera.position.clone().set(x, y, 0));
        ray.set(state.camera.position, target.sub(state.camera.position).normalize());
        const irisHits: THREE.Intersection[] = [], hits: THREE.Intersection[] = [];
        Object.getPrototypeOf(iris).raycast.call(iris, ray, irisHits);
        const distance = Math.min(...irisHits.map(hit => hit.distance));
        for (const mesh of [body, lids]) Object.getPrototypeOf(mesh).raycast.call(mesh, ray, hits);
        if (Number.isFinite(distance) && hits.some(hit => hit.distance < distance)) covered++;
        else misses.push(`${eye}:${x}:${y}`);
        total++;
      }
      const closure = lids.morphTargetInfluences![blinkIndex];
      lids.morphTargetInfluences![blinkIndex] = 0;
      state.gl.render(state.scene, state.camera);
      captures[`${name}-open`] = state.gl.domElement.toDataURL('image/png');
      lids.computeBoundingSphere(); lids.computeBoundingBox();
      let openCentres = 0;
      for (const eye of ['irisL', 'irisR']) {
        const iris = state.scene.getObjectByName(eye)!;
        const target = iris.getWorldPosition(state.camera.position.clone());
        ray.set(state.camera.position, target.sub(state.camera.position).normalize());
        const irisHits: THREE.Intersection[] = [], hits: THREE.Intersection[] = [];
        Object.getPrototypeOf(iris).raycast.call(iris, ray, irisHits);
        const distance = Math.min(...irisHits.map(hit => hit.distance));
        for (const mesh of [body, lids]) Object.getPrototypeOf(mesh).raycast.call(mesh, ray, hits);
        if (Number.isFinite(distance) && !hits.some(hit => hit.distance < distance)) openCentres++;
      }
      frames.push({ name, closure, covered, total, misses, openCentres });
    }
    body.morphTargetInfluences!.splice(0, saved.length, ...saved);
    lids.morphTargetInfluences![blinkIndex] = savedBlink;
    state.gl.render(state.scene, state.camera);
    return { captures, frames };
  });
  for (const [name, data] of Object.entries(result.captures)) await writeFile(info.outputPath(`diagnostic-${name}.png`), Buffer.from(data.split(',')[1], 'base64'));
  await writeFile(info.outputPath('eye-morph-follow.json'), JSON.stringify(result.frames, null, 2));
  for (const frame of result.frames) {
    expect(frame.closure).toBe(1);
    expect(frame.covered, `${frame.name}: ${frame.misses.join(', ')}`).toBe(frame.total);
    expect(frame.openCentres, `${frame.name}: open pupils must remain visible`).toBe(2);
  }
});
