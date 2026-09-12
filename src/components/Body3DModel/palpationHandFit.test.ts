import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createPalpationHandFit, PALPATION_FINGERS } from './palpationHandFit';

function fixture() {
  const root = new THREE.Group(), release = new THREE.Group(), hand = new THREE.Group();
  root.add(release); release.add(hand);
  root.position.set(.3, 1, -.2); root.rotation.set(.2, -.4, .1); root.scale.setScalar(1.2);
  const palm = new THREE.Mesh(); palm.name = 'assessment-palm'; palm.scale.set(.027, .034, .009); hand.add(palm);
  PALPATION_FINGERS.forEach((_, i) => { const finger = new THREE.Mesh(); finger.name = `assessment-finger-${i}`; hand.add(finger); });
  const thumb = new THREE.Mesh(); thumb.name = 'assessment-thumb'; hand.add(thumb);
  root.updateMatrixWorld(true);
  const sample = (x: number, y: number) => {
    const position = root.localToWorld(new THREE.Vector3(x, y, -.002 + x * x + y * y));
    const normal = new THREE.Vector3(-2 * x, -2 * y, 1).normalize().transformDirection(root.matrixWorld);
    return { position: position.toArray(), normal: normal.toArray() };
  };
  return { root, release, hand, sample, fit: createPalpationHandFit() };
}

describe('palpation hand surface fitting', () => {
  it('seats the real palm and distal pads on their separate curved contacts under rotated/scaled roots', () => {
    const { root, release, hand, sample, fit } = fixture();
    const site = [.02, .01];
    for (let cycle = 0; cycle < 100; cycle++) {
      release.position.z = cycle % 2 ? .004 : 0;
      fit(root, hand, sample, site, 1.2);
      root.updateMatrixWorld(true);
      const releaseWorld = new THREE.Vector3(0, 0, release.position.z * 1.2).applyQuaternion(root.quaternion);
      for (let i = 0; i < 5; i++) {
        const finger = PALPATION_FINGERS[i - 1];
        const pad = new THREE.Vector3(0, i === 0 ? 0 : finger.length / 2, i === 0 ? -1 : -.006);
        hand.children[i].localToWorld(pad);
        const frame = sample(site[0] + (finger?.x ?? 0), site[1] + (finger ? finger.y + finger.length / 2 : 0));
        const expected = new THREE.Vector3().fromArray(frame.position)
          .addScaledVector(new THREE.Vector3().fromArray(frame.normal), .0005 * 1.2).add(releaseWorld);
        expect(pad.distanceTo(expected)).toBeLessThan(1e-10);
      }
    }
  });

  it('hides an unavailable contact instead of leaving a stale floating pad', () => {
    const { root, hand, fit, sample } = fixture();
    fit(root, hand, sample, [0, 0], 1.2);
    fit(root, hand, () => null, [0, 0], 1.2);
    expect(hand.children.slice(0, 5).every(part => !part.visible)).toBe(true);
    fit(root, hand, sample, [0, 0], 1.2);
    expect(hand.children.slice(0, 5).every(part => part.visible)).toBe(true);
  });
});
