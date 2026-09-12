import { expect, test } from '@playwright/test';
import type * as THREE from 'three';
import { renderedSceneFraction } from './helpers/renderedScene';

test('pilot feet meet the rug instead of disappearing beneath it', async ({ page }, info) => {
  await page.addInitScript(() => {
    localStorage.setItem('paramedic-studio-voice-enabled', 'false');
    sessionStorage.setItem('capturePinQuality', '1');
  });
  await page.goto('/?devLiveCase=resp-001');
  await expect.poll(() => renderedSceneFraction(page), { timeout: 30_000 }).toBeGreaterThan(.25);
  const canvas = page.locator('.patient-model-canvas-stage canvas');
  await canvas.scrollIntoViewIfNeeded();
  await canvas.click({ position: { x: 20, y: 20 } });
  await page.waitForTimeout(1500);
  const measureContact = () => page.evaluate(() => {
    const state = window.__r3f!.get();
    const body = state.scene.getObjectByName('Patient') as THREE.SkinnedMesh;
    body.skeleton.update();
    const rug = state.scene.getObjectByName('villa_woven_rug') as THREE.Mesh;
    const positions = body.geometry.getAttribute('position');
    const point = state.camera.position.clone();
    const feet = [Infinity, Infinity];
    const pelvisPoints: number[][] = [];
    for (let i = 0; i < positions.count; i++) {
      body.getVertexPosition(i, point);
      body.localToWorld(point);
      if (positions.getY(i) > .8 && positions.getY(i) < 1.05 && Math.abs(positions.getX(i)) < .16 && positions.getZ(i) < 0) pelvisPoints.push(point.toArray());
      if (positions.getY(i) > .13) continue;
      const side = positions.getX(i) > 0 ? 0 : 1;
      feet[side] = Math.min(feet[side], point.y);
    }
    const rugPosition = rug.geometry.getAttribute('position');
    let top = -Infinity;
    for (let i = 0; i < rugPosition.count; i++) {
      point.fromBufferAttribute(rugPosition, i);
      rug.localToWorld(point);
      top = Math.max(top, point.y);
    }
    const cushion = state.scene.getObjectByName('asthma_chair_seat_cushion') as THREE.Mesh;
    const cushionPositions = cushion.geometry.getAttribute('position');
    const seatMin = [Infinity, Infinity, Infinity], seatMax = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < cushionPositions.count; i++) {
      point.fromBufferAttribute(cushionPositions, i);
      cushion.localToWorld(point);
      point.toArray().forEach((v, axis) => { seatMin[axis] = Math.min(seatMin[axis], v); seatMax[axis] = Math.max(seatMax[axis], v); });
    }
    return { feet, pelvisPoints: pelvisPoints.sort((a,b) => a[1]-b[1]).slice(0, 8), seatMin, seatMax, rugTop: top, gaps: feet.map(y => y - top), skeletonLift: state.scene.getObjectByName('anatomy-support-offset')?.position.y };
  });
  const contact = await measureContact();
  await info.attach('contact-measurements', { body: JSON.stringify(contact), contentType: 'application/json' });
  console.log('Pilot contact', contact);
  for (const side of [-1, 1]) {
    await page.evaluate(side => {
      const state = window.__r3f!.get();
      const controls = state.controls as unknown as { target: THREE.Vector3; update: () => void };
      state.camera.position.set(side * 1.1, .65, 2.5);
      controls.target.set(0, .30, .8);
      controls.update();
    }, side);
    await page.waitForTimeout(500);
    await canvas.screenshot({ path: info.outputPath(`feet-${side < 0 ? 'left' : 'right'}.png`) });
  }
  for (const gap of contact.gaps) {
    expect(gap).toBeGreaterThan(-.008);
    expect(gap).toBeLessThan(.012);
  }
  expect(contact.skeletonLift).toBeCloseTo(.051, 5);
  const later = await measureContact();
  later.feet.forEach((height, side) => expect(height).toBeCloseTo(contact.feet[side], 3));
  expect(contact.pelvisPoints).toHaveLength(8);
  for (const [x, y, z] of contact.pelvisPoints) {
    expect(x).toBeGreaterThan(contact.seatMin[0]);
    expect(x).toBeLessThan(contact.seatMax[0]);
    expect(z).toBeGreaterThan(contact.seatMin[2]);
    expect(z).toBeLessThan(contact.seatMax[2]);
    expect(y - contact.seatMax[1]).toBeGreaterThan(-.015);
    expect(y - contact.seatMax[1]).toBeLessThan(.015);
  }
});
