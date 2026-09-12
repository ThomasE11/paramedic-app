import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createAssessmentContactSampler, resolveAssessmentContact } from './assessmentContact';

describe('anatomical assessment contact', () => {
  it('follows morphs, bent bones and the patient root at the actual skin surface', () => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0], 3));
    geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(new Array(12).fill(0), 4));
    geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], 4));
    geometry.morphAttributes.position = [new THREE.Float32BufferAttribute([0, 0, .1, 0, 0, .1, 0, 0, .1], 3)];
    geometry.morphTargetsRelative = true;
    const mesh = new THREE.SkinnedMesh(geometry);
    const bone = new THREE.Bone();
    mesh.add(bone);
    mesh.bind(new THREE.Skeleton([bone]));
    const sample = createAssessmentContactSampler(mesh, [new Float32Array([0, 1, 0]), new Float32Array([0, 0, 1]), new Float32Array(3)]);
    expect(sample(.25, .25, 0)!.position).toEqual([.25, .25, 0]);
    mesh.morphTargetInfluences![0] = 1;
    bone.rotation.x = Math.PI / 2;
    mesh.position.x = 3;
    mesh.updateMatrixWorld(true);
    const frame = sample(.25, .25, 0)!;
    expect(frame.position[0]).toBeCloseTo(3.25);
    expect(frame.position[1]).toBeCloseTo(-.1);
    expect(frame.position[2]).toBeCloseTo(.25);
    expect(frame.normal[1]).toBeCloseTo(-1);
    geometry.dispose();
  });

  const landmarks = [
    { region: 'chest', label: 'Right upper', position: [-.09, 1.34, .2] as [number, number, number], actionId: 'chest-auscultate-ru' },
    { region: 'chest', label: 'Left upper', position: [.09, 1.34, .2] as [number, number, number], actionId: 'chest-auscultate-lu' },
    { region: 'abdomen', label: 'RUQ', position: [-.095, 1.085, .2] as [number, number, number], actionId: 'abd-ruq-auscultate' },
  ];
  it('keeps patient laterality and shares the quadrant for all three techniques', () => {
    expect(resolveAssessmentContact('chest-auscultate-ru', 'chest', landmarks)!.position[0]).toBeLessThan(0);
    for (const technique of ['auscultate', 'palpate', 'percuss']) {
      expect(resolveAssessmentContact(`abd-ruq-${technique}`, 'abdomen', landmarks)).toMatchObject({ label: 'RUQ', technique });
    }
  });
  it('does not invent a contact for inspection, unknown actions or another region', () => {
    for (const action of [null, 'chest-inspect', 'unknown-palpate']) expect(resolveAssessmentContact(action, 'chest', landmarks)).toBeNull();
    expect(resolveAssessmentContact('chest-auscultate-ru', 'abdomen', landmarks)).toBeNull();
  });
  it('demonstrates bilateral contacts sequentially without changing findings', () => {
    expect(resolveAssessmentContact('chest-percuss', 'chest', landmarks, 0)).toMatchObject({ label: 'Right upper', technique: 'percuss', bilateral: true });
    expect(resolveAssessmentContact('chest-percuss', 'chest', landmarks, 1)).toMatchObject({ label: 'Left upper', technique: 'percuss', bilateral: true });
  });
});
