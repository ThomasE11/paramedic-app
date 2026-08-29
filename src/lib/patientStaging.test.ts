import { describe, expect, it } from 'vitest';
import {
  derivePatientMobility,
  deriveScenePatientStage,
  deriveTreatmentPositioningOverride,
  patientSkeletalAction,
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
