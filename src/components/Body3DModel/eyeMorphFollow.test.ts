import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createEyeMorphFollower } from './eyeMorphFollow';

function fixture(relative = true) {
  const root = new THREE.Group(), head = new THREE.Bone();
  head.position.set(0, 1, 0);
  root.add(head);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([-.03, 1, 0, .03, 1, 0], 3));
  geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(new Array(8).fill(0), 4));
  geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute([1, 0, 0, 0, 1, 0, 0, 0], 4));
  const deltas = [[0, .008, 0], [0, .03, 0], [.02, .012, 0], [.09, 0, 0]];
  geometry.morphTargetsRelative = relative;
  geometry.morphAttributes.position = deltas.map(delta => new THREE.Float32BufferAttribute(
    [-1, 1].flatMap(sign => delta.map((v, axis) => v + (relative ? 0 : axis === 0 ? sign * .03 : axis === 1 ? 1 : 0))), 3));
  const body = new THREE.SkinnedMesh(geometry);
  root.add(body);
  root.updateMatrixWorld(true);
  body.bind(new THREE.Skeleton([head]));
  body.morphTargetDictionary = { motion_gasp: 0, motion_wince: 1, motion_agitation: 2, facial_droop: 3 };
  const lids = new THREE.SkinnedMesh(geometry);
  lids.morphTargetDictionary = { ...body.morphTargetDictionary };
  lids.bind(body.skeleton, body.bindMatrix);
  body.add(lids);
  const eyes = ['L', 'R'].map((side, i) => {
    const eye = new THREE.Group(); eye.name = `eye${side}`;
    eye.position.set(i ? -.03 : .03, 0, .01); head.add(eye);
    const pupil = new THREE.Group(); pupil.name = `pupil${side}`;
    pupil.scale.setScalar(.4); eye.add(pupil);
    return eye;
  });
  root.updateMatrixWorld(true);
  const update = createEyeMorphFollower(root, body, lids);
  return { root, head, body, eyes, update };
}

describe('pilot rigid eye morph follower', () => {
  it.each([true, false])('follows combined morphs without drift (relative=%s)', relative => {
    const { body, eyes, update } = fixture(relative);
    const neutral = eyes.map(eye => eye.position.clone());
    eyes[0].rotation.set(.02, -.04, 0);
    const gaze = eyes[0].quaternion.clone();
    for (let cycle = 0; cycle < 100; cycle++) {
      body.morphTargetInfluences = [.5, .2, .08, 1];
      update(); update();
      eyes.forEach((eye, i) => {
        expect(eye.position.x - neutral[i].x).toBeCloseTo(.0016, 7);
        expect(eye.position.y - neutral[i].y).toBeCloseTo(.01096, 7);
        expect(eye.position.z).toBeCloseTo(neutral[i].z, 7);
      });
      body.morphTargetInfluences.fill(0); update();
      eyes.forEach((eye, i) => expect(eye.position.equals(neutral[i])).toBe(true));
    }
    expect(eyes[0].quaternion.equals(gaze)).toBe(true);
    expect(eyes[0].children[0].scale.toArray()).toEqual([.4, .4, .4]);
  });

  it('matches skinned displacement under translated, rotated and scaled parents', () => {
    const { root, head, body, eyes, update } = fixture();
    root.position.set(10, -2, 4); root.rotation.set(.2, -.4, .3); root.scale.set(1.2, .8, 1.4);
    head.rotation.set(.3, .4, -.2);
    root.updateMatrixWorld(true);
    const before = eyes[0].getWorldPosition(new THREE.Vector3());
    const neutralSkin = body.localToWorld(body.getVertexPosition(1, new THREE.Vector3()));
    body.morphTargetInfluences = [1, .5, .08, 0];
    const movedSkin = body.localToWorld(body.getVertexPosition(1, new THREE.Vector3()));
    update();
    const actual = eyes[0].getWorldPosition(new THREE.Vector3()).sub(before);
    expect(actual.distanceTo(movedSkin.sub(neutralSkin))).toBeLessThan(1e-7);
  });
});
