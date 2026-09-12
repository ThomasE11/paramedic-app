import { afterEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { createAssessmentContactSampler, getPilotAuscultationSteps, resolveAssessmentContact, startAuscultationSequence, type AuscultationStep } from './assessmentContact';

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
  it('visits six paired lung fields and all four cardiac areas without wrapping after completion', () => {
    const sites = [...landmarks,
      { region: 'chest', label: 'Right lower', position: [-.12, 1.22, .2] as [number, number, number], actionId: 'chest-auscultate-rl' },
      { region: 'chest', label: 'Left lower', position: [.12, 1.22, .2] as [number, number, number], actionId: 'chest-auscultate-ll' },
      { region: 'chest', label: 'Heart', position: [.06, 1.24, .2] as [number, number, number], actionId: 'chest-auscultate-heart' },
    ];
    const lungs = Array.from({length: 6}, (_, i) => resolveAssessmentContact('chest-auscultate-lungs', 'chest', sites, i)!);
    expect(lungs.map(site => site.label)).toEqual(['Right upper', 'Left upper', 'R mid-zone', 'L mid-zone', 'Right lower', 'Left lower']);
    expect(lungs.map(site => Math.sign(site.position[0]))).toEqual([-1, 1, -1, 1, -1, 1]);
    const heart = Array.from({length: 4}, (_, i) => resolveAssessmentContact('chest-auscultate-heart', 'chest', sites, i)!);
    expect(heart.map(site => site.label)).toEqual(['Aortic area', 'Pulmonic area', 'Tricuspid area', 'Mitral / apex']);
    expect(new Set(heart.map(site => site.position.join(':'))).size).toBe(4);
    expect(resolveAssessmentContact('chest-auscultate-lungs', 'chest', sites, 6)!.label).toBe('Left lower');
  });
});

describe('finite auscultation sequence lifecycle', () => {
  afterEach(() => vi.useRealTimers());
  const steps: AuscultationStep[] = ['right', 'left'].map((sound, index) => ({
    region: 'chest', label: sound, position: [index, 0, 0], sound: sound as 'right' | 'left', durationMs: 4000,
  }));
  it('starts each audio/visual pair together and completes exactly once', () => {
    vi.useFakeTimers();
    const visit = vi.fn(), complete = vi.fn();
    startAuscultationSequence(steps, visit, complete);
    expect(visit).toHaveBeenLastCalledWith(steps[0], 0);
    vi.advanceTimersByTime(3999); expect(visit).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1); expect(visit).toHaveBeenLastCalledWith(steps[1], 1);
    vi.advanceTimersByTime(4000); expect(complete).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(40000); expect(visit).toHaveBeenCalledTimes(2);
    expect(complete).toHaveBeenCalledTimes(1);
  });
  it('cancels delayed sites and completion, including a restarted assessment', () => {
    vi.useFakeTimers();
    const visit = vi.fn(), complete = vi.fn();
    const cancel = startAuscultationSequence(steps, visit, complete);
    vi.advanceTimersByTime(500); cancel(); cancel();
    const cancelReplacement = startAuscultationSequence(steps, visit, complete);
    vi.advanceTimersByTime(500); cancelReplacement();
    vi.advanceTimersByTime(20000);
    expect(visit).toHaveBeenCalledTimes(2);
    expect(visit.mock.calls.every(call => call[1] === 0)).toBe(true);
    expect(complete).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('keeps middle-field sounds side-specific and gives slow breathing a complete cycle', () => {
    const landmarks = ['ru', 'lu', 'rl', 'll'].map((suffix, index) => ({
      region: 'chest', actionId: `chest-auscultate-${suffix}`, label: suffix,
      position: [index % 2 ? .1 : -.1, index < 2 ? 1.4 : 1.3, .2] as [number, number, number],
    }));
    const tour = getPilotAuscultationSteps('chest-auscultate-lungs', landmarks, 14);
    expect(tour.map(step => step.sound)).toEqual(['right-upper', 'left-upper', 'right', 'left', 'right-lower', 'left-lower']);
    expect(tour.every(step => step.durationMs > 60000 / 14)).toBe(true);
    expect(tour[2].position[1]).toBeCloseTo(1.35);
    expect(getPilotAuscultationSteps('chest-auscultate-lungs', [], 14)).toEqual([]);
    expect(getPilotAuscultationSteps('chest-inspect', landmarks)).toEqual([]);
  });
});
