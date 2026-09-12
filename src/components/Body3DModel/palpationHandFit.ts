import * as THREE from 'three';
import type { AssessmentContactFrame } from './assessmentContact';

export const PALPATION_FINGERS = [-.020, -.007, .007, .020].map((x, i) => ({
  x, y: .038 - Math.abs(i - 1.5) * .005, length: .032 - Math.abs(i - 1.5) * .005,
}));

/** Seat the contact pads on separate cached skin triangles. The parent's
 * release animation is deliberately applied AFTER this baseline fit; labels
 * and the site ring retain their independent, proud-of-skin placement.
 */
export function createPalpationHandFit() {
  const point = new THREE.Vector3(), normal = new THREE.Vector3();
  const z = new THREE.Vector3(0, 0, 1), y = new THREE.Vector3(0, 1, 0);
  const tangent = new THREE.Vector3(), inverse = new THREE.Quaternion();
  const thumbRotation = new THREE.Quaternion().setFromAxisAngle(z, -.65);
  const specs = [
    { name: 'assessment-palm', x: 0, y: 0, radius: .009, halfLength: 0 },
    ...PALPATION_FINGERS.map((finger, i) => ({
      name: `assessment-finger-${i}`, x: finger.x,
      y: finger.y + finger.length / 2, radius: .006, halfLength: finger.length / 2,
    })),
  ];
  return (root: THREE.Group, hand: THREE.Group, sample: (x: number, y: number) => AssessmentContactFrame | null,
    site: readonly number[], scale: number) => {
    root.updateWorldMatrix(true, false);
    root.getWorldQuaternion(inverse).invert();
    for (const spec of specs) {
      const mesh = hand.getObjectByName(spec.name);
      const frame = sample(site[0] + spec.x, site[1] + spec.y);
      if (!mesh) continue;
      mesh.visible = !!frame;
      if (!frame) continue;
      normal.fromArray(frame.normal);
      point.fromArray(frame.position).addScaledVector(normal, (spec.radius + .0005) * scale);
      // Convert the surface contact into the unanimated root, not the gesture
      // parent, otherwise the fitting pass would cancel the release motion.
      root.worldToLocal(point);
      normal.applyQuaternion(inverse).normalize();
      mesh.quaternion.setFromUnitVectors(z, normal);
      tangent.copy(y).applyQuaternion(mesh.quaternion);
      mesh.position.copy(point).addScaledVector(tangent, -spec.halfLength);
    }
    // Keep the thumb joined to the palm, with the same orientation/depth.
    const palm = hand.getObjectByName('assessment-palm');
    const thumb = hand.getObjectByName('assessment-thumb');
    if (palm && thumb) {
      thumb.visible = palm.visible;
      thumb.position.set(-.031, .002, .003).applyQuaternion(palm.quaternion).add(palm.position);
      thumb.quaternion.copy(palm.quaternion).multiply(thumbRotation);
    }
  };
}
