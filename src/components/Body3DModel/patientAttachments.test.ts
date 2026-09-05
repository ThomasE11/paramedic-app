import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createFaceAttachment } from './patientAttachments';

describe('head-mounted patient equipment', () => {
  it.each([1, 0.55])('preserves clinical size and follows head motion at scale %s', scale => {
    const root = new THREE.Group();
    const head = new THREE.Bone();
    head.name = 'mixamorigHead';
    head.position.set(0, 1.65 * scale, 0);
    root.add(head);
    const frame = createFaceAttachment(root, scale)!;
    const centre = new THREE.Vector3(0, 1.63, 0.13);
    root.updateMatrixWorld(true);
    const initial = centre.clone().applyMatrix4(frame.matrixWorld);
    expect(initial.distanceTo(centre.clone().multiplyScalar(scale))).toBeLessThan(1e-8);
    head.rotateX(0.3);
    root.position.set(0.4, -0.3, 0.8);
    root.updateMatrixWorld(true);
    const expected = centre.clone().multiplyScalar(scale).sub(head.position)
      .applyQuaternion(head.quaternion).add(head.position).add(root.position);
    expect(centre.clone().applyMatrix4(frame.matrixWorld).distanceTo(expected)).toBeLessThan(1e-8);
  });

  it('handles an unrigged fallback without inventing a head transform', () => {
    expect(createFaceAttachment(new THREE.Group(), 1)).toBeNull();
  });
});
