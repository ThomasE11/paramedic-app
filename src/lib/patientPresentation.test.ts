/**
 * Spec-as-tests for src/lib/patientPresentation.ts — the pure mapper that turns
 * a case's found-position text into how the 3D patient should be presented
 * (PREMIUM_SIMULATOR_ROADMAP.md "position on floor/bed/chair"). The student
 * should find the patient AS THEY ARE, then reposition as a clinical step.
 *
 * The 3D patient is a straight A-pose mesh, so only rigid presentations are
 * honest: standing (upright) or lying flat (supine). Seated/tripod/slumped
 * can't be truly posed without joint bending, so they stay UPRIGHT for now —
 * a standing stand-in reads better than laying a sitting patient flat.
 *
 * Contract:
 *   export type Posture = 'upright' | 'supine'
 *   export type Surface = 'none' | 'floor' | 'bed'
 *   export interface PatientPresentation { posture: Posture; surface: Surface }
 *   export function patientPresentationFor(positionText: string | undefined): PatientPresentation
 */
import { describe, it, expect } from 'vitest';
import { patientPresentationFor } from './patientPresentation';

describe('patientPresentationFor — supine (found lying)', () => {
  it('bare supine / lying → supine on the floor', () => {
    expect(patientPresentationFor('Supine')).toEqual({ posture: 'supine', surface: 'floor' });
    expect(patientPresentationFor('Lying still')).toEqual({ posture: 'supine', surface: 'floor' });
  });

  it('supine on a hard surface → floor', () => {
    for (const t of ['Supine on floor', 'Supine on ground', 'Supine on pool deck', 'Supine on gym floor', 'Supine at base of steps', 'Supine, extricated from bus']) {
      expect(patientPresentationFor(t)).toEqual({ posture: 'supine', surface: 'floor' });
    }
  });

  it('supine on a bed/bunk → bed', () => {
    expect(patientPresentationFor('Lying in bed')).toEqual({ posture: 'supine', surface: 'bed' });
    expect(patientPresentationFor('Supine on bunk')).toEqual({ posture: 'supine', surface: 'bed' });
  });

  it('supine with clinical qualifiers still reads supine', () => {
    expect(patientPresentationFor('Supine, left leg externally rotated and shortened').posture).toBe('supine');
    expect(patientPresentationFor('Supine on floor, coat under head as pillow').surface).toBe('floor');
  });

  it('is case-insensitive', () => {
    expect(patientPresentationFor('SUPINE ON FLOOR').posture).toBe('supine');
  });
});

describe('patientPresentationFor — upright (seated/standing/unposeable)', () => {
  it('sitting / tripod / slumped stay upright (cannot rigidly pose seated)', () => {
    for (const t of ['Sitting', 'Sitting upright', 'Sitting, leaning forward', 'Tripod position, sitting forward', 'Slumped in driver seat', 'Standing', 'Standing, pacing back and forth, will not sit']) {
      expect(patientPresentationFor(t)).toEqual({ posture: 'upright', surface: 'none' });
    }
  });

  it('multi-patient / ambiguous ("various") stays upright', () => {
    expect(patientPresentationFor('Various - some ambulatory, some seated, some supine').posture).toBe('upright');
  });

  it('missing / empty position defaults to upright', () => {
    expect(patientPresentationFor(undefined)).toEqual({ posture: 'upright', surface: 'none' });
    expect(patientPresentationFor('')).toEqual({ posture: 'upright', surface: 'none' });
  });
});
