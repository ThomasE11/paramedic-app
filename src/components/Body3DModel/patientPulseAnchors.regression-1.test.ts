import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createPatientPulseAnchors } from './patientPulseAnchors';

describe('pulse targets follow the patient surface', () => {
  it('follows both an arm bend and a posture morph instead of retaining a static wrist position', () => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, .025, 0, .2, .025, .1, 0, .025], 3));
    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(new Array(12).fill(0), 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], 4));
    geometry.morphAttributes.position = [new THREE.Float32BufferAttribute([0, .3, 0, 0, .3, 0, 0, .3, 0], 3)];
    geometry.morphTargetsRelative = true;
    const body = new THREE.SkinnedMesh(geometry, new THREE.MeshBasicMaterial());
    const hand = new THREE.Bone();
    hand.name = 'mixamorigRightHand';
    body.add(hand);
    body.bind(new THREE.Skeleton([hand]));
    const sample = createPatientPulseAnchors(body);
    expect(sample('pulse-radial-right')![1]).toBeCloseTo(0);
    body.morphTargetInfluences![0] = 1;
    hand.position.x = .4;
    body.updateMatrixWorld(true);
    const moved = sample('pulse-radial-right')!;
    expect(moved[0]).toBeCloseTo(.4);
    expect(moved[1]).toBeCloseTo(.3);
    expect(sample('not-a-pulse')).toBeNull();
    expect(sample('pulse-radial-left')).toBeNull();
  });
});
