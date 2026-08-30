import { describe, expect, it } from 'vitest';
import {
  derivePatientMobility,
  deriveScenePatientStage,
  deriveTreatmentPositioningOverride,
  patientPacingTransform,
  patientSkeletalAction,
  standingArmRelaxationRadians,
} from './patientStaging';
import type { CaseScenario } from '@/types';

function fakeCase(position: string, callReason = 'Emergency call'): CaseScenario {
  return {
    initialPresentation: { generalImpression: '', position, appearance: '' },
    dispatchInfo: { callReason },
  } as unknown as CaseScenario;
}

describe('deriveScenePatientStage', () => {
  it('stages explicit ground scenes on the floor', () => {
    expect(deriveScenePatientStage(fakeCase('Supine on the floor'))).toBe('floor');
    expect(deriveScenePatientStage(fakeCase('Sitting on floor, leaning against bed'))).toBe('floor');
    expect(deriveScenePatientStage(fakeCase('Supine', 'Male collapsed at the mall'))).toBe('floor');
    expect(deriveScenePatientStage(fakeCase('Lying on side', 'Motorcyclist down at roadside'))).toBe('floor');
  });

  it('keeps ambiguous or seated scenes on the stretcher', () => {
    expect(deriveScenePatientStage(fakeCase('Sitting upright, leaning forward (tripod)'))).toBe('stretcher');
    expect(deriveScenePatientStage(fakeCase('Supine'))).toBe('stretcher');
    expect(deriveScenePatientStage(fakeCase('Semi-recumbent', 'Chest pain at home'))).toBe('stretcher');
  });

  it('never crashes on missing scene fields', () => {
    expect(deriveScenePatientStage({} as CaseScenario)).toBe('stretcher');
  });
});

describe('derivePatientMobility', () => {
  it('distinguishes recumbent, seated, standing and pacing presentations', () => {
    expect(derivePatientMobility(fakeCase('Supine on hard floor'))).toBe('recumbent');
    expect(derivePatientMobility(fakeCase('Sitting in office chair, leaning forward'))).toBe('seated');
    expect(derivePatientMobility(fakeCase('Standing near kitchen sink'))).toBe('standing');
    expect(derivePatientMobility(fakeCase('Pacing around the room'))).toBe('pacing');
  });

  it('keeps an unconscious patient recumbent regardless of narrative wording', () => {
    expect(derivePatientMobility(fakeCase('Standing at the counter'), true)).toBe('recumbent');
  });
});

describe('patientSkeletalAction', () => {
  it('animates only genuinely ambulatory presentations', () => {
    expect(patientSkeletalAction('pacing')).toBe('walk');
    expect(patientSkeletalAction('standing')).toBe('idle');
    expect(patientSkeletalAction('seated')).toBeNull();
    expect(patientSkeletalAction('recumbent')).toBeNull();
    expect(patientSkeletalAction('pacing', true)).toBeNull();
  });

  it('relaxes only a conscious stationary patient out of the donor A-pose', () => {
    expect(standingArmRelaxationRadians('standing')).toBeCloseTo(0.65);
    expect(standingArmRelaxationRadians('pacing')).toBe(0);
    expect(standingArmRelaxationRadians('recumbent')).toBe(0);
    expect(standingArmRelaxationRadians('standing', true)).toBe(0);
  });
});

describe('patientPacingTransform', () => {
  it('moves through a bounded examination-zone path', () => {
    const samples = Array.from({ length: 65 }, (_, index) => patientPacingTransform(index * 0.05));

    expect(Math.max(...samples.map(sample => Math.abs(sample.x)))).toBeLessThanOrEqual(0.32);
    expect(Math.max(...samples.map(sample => sample.z))).toBeLessThanOrEqual(0.05);
    expect(Math.max(...samples.map(sample => Math.abs(sample.yaw)))).toBeLessThan(0.4);
    expect(samples.some(sample => sample.x > 0.25)).toBe(true);
    expect(samples.some(sample => sample.x < -0.25)).toBe(true);
  });

  it('loops without a root-position snap and rejects invalid time', () => {
    const start = patientPacingTransform(0);
    const end = patientPacingTransform(3.2);

    expect(end.x).toBeCloseTo(start.x, 8);
    expect(end.z).toBeCloseTo(start.z, 8);
    expect(end.yaw).toBeCloseTo(start.yaw, 8);
    expect(patientPacingTransform(Number.NaN)).toEqual(start);
  });
});

describe('deriveTreatmentPositioningOverride', () => {
  it('uses the latest positioning intervention as the visible patient state', () => {
    expect(deriveTreatmentPositioningOverride([])).toBeNull();
    expect(deriveTreatmentPositioningOverride(['recovery_position'])).toMatchObject({
      mobility: 'recumbent',
      posture: 'recovery',
    });
    expect(deriveTreatmentPositioningOverride(['recovery_position', 'oxygen_mask', 'fowlers_position'])).toMatchObject({
      mobility: 'seated',
      posture: 'tripod',
      treatmentId: 'fowlers_position',
    });
  });

  it('turns assisted ambulation into a walk-capable mobility state', () => {
    expect(deriveTreatmentPositioningOverride(['assisted_ambulation'])).toEqual({
      mobility: 'pacing',
      posture: null,
      treatmentId: 'assisted_ambulation',
    });
  });
});
