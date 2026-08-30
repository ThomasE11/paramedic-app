import { describe, expect, it } from 'vitest';
import {
  deriveAppliedPatientStage,
  derivePatientMobility,
  derivePatientPosture,
  deriveScenePatientStage,
  deriveTreatmentPositioningOverride,
  patientLoadedOnStretcher,
  patientPacingTransform,
  patientSkeletalAction,
  patientArmRestRadians,
  shouldHideTreatmentStretcher,
  shouldShowPatientSeat,
  patientForearmRestRadians,
  patientForearmSweepRadians,
  patientSpineLeanRadians,
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

describe('derivePatientPosture', () => {
  it('keeps a stable seated heat-exhaustion patient neutral', () => {
    const heatCase = fakeCase('Sitting in shade', 'Heat exhaustion after outdoor work');
    expect(derivePatientPosture(heatCase, {
      mobility: 'seated',
      respiration: 22,
    })).toBe('seated');
  });

  it('reserves tripod for explicit or physiological respiratory distress', () => {
    expect(derivePatientPosture(fakeCase('Sitting upright in tripod position'), {
      mobility: 'seated',
      respiration: 20,
    })).toBe('tripod');
    expect(derivePatientPosture(fakeCase('Sitting upright', 'Severe asthma attack'), {
      mobility: 'seated',
      respiration: 30,
    })).toBe('tripod');
  });

  it('keeps recumbent, arrest and positioning overrides authoritative', () => {
    const scenario = fakeCase('Supine on the floor');
    expect(derivePatientPosture(scenario, { mobility: 'recumbent', respiration: 32 })).toBe('supine');
    expect(derivePatientPosture(fakeCase('Standing'), { mobility: 'standing' })).toBeNull();
    expect(derivePatientPosture(fakeCase('Sitting'), {
      mobility: 'seated',
      isInArrest: true,
    })).toBe('supine');
    expect(derivePatientPosture(fakeCase('Supine'), {
      mobility: 'recumbent',
      positioningOverride: {
        mobility: 'recumbent',
        posture: 'recovery',
        treatmentId: 'recovery_position',
      },
    })).toBe('recovery');
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

  it('uses a stable arm rest appropriate to each mobility state', () => {
    expect(patientArmRestRadians('standing')).toBeCloseTo(0.65);
    expect(patientArmRestRadians('seated')).toBeCloseTo(0.72);
    expect(patientArmRestRadians('recumbent')).toBeCloseTo(0.58);
    expect(patientArmRestRadians('recumbent', true)).toBeCloseTo(0.58);
    expect(patientArmRestRadians('pacing')).toBeCloseTo(0.42);
    expect(patientArmRestRadians('pacing', false, 4)).toBeCloseTo(0.2646);
    expect(patientArmRestRadians('standing', true)).toBe(0);
    expect(patientArmRestRadians('seated', false, 0.5)).toBeCloseTo(0.3528);
    expect(patientArmRestRadians('seated', false, 4)).toBeCloseTo(0.4536);
  });

  it('settles recumbent forearms onto the support plane without altering ambulatory poses', () => {
    expect(patientForearmRestRadians('recumbent')).toBeCloseTo(-1.4);
    expect(patientForearmRestRadians('recumbent', 8)).toBeCloseTo(-1.3);
    expect(patientForearmRestRadians('recumbent', 4)).toBeCloseTo(-1.2);
    expect(patientForearmRestRadians('recumbent', 0.5)).toBeCloseTo(-1.1);
    expect(patientForearmRestRadians('seated')).toBe(0);
    expect(patientForearmRestRadians('standing')).toBe(0);
    expect(patientForearmRestRadians('pacing')).toBe(0);
    expect(patientForearmSweepRadians('recumbent', 'left')).toBeCloseTo(-1);
    expect(patientForearmSweepRadians('recumbent', 'right')).toBeCloseTo(1);
    expect(patientForearmSweepRadians('recumbent', 'left', 4)).toBeCloseTo(-0.8);
    expect(patientForearmSweepRadians('standing', 'right')).toBe(0);
  });

  it('leans only a respiratory tripod posture through the fitted spine', () => {
    expect(patientSpineLeanRadians('tripod')).toBeCloseTo(0.13);
    expect(patientSpineLeanRadians('seated')).toBe(0);
    expect(patientSpineLeanRadians('supine')).toBe(0);
    expect(patientSpineLeanRadians(null)).toBe(0);
    expect(patientSpineLeanRadians('tripod', 0.5)).toBeCloseTo(0.08);
    expect(patientSpineLeanRadians('tripod', 4)).toBeCloseTo(0.1);
  });
});

describe('mobility-aware scene support', () => {
  it('shows a patient seat only for a seated presentation', () => {
    expect(shouldShowPatientSeat('seated')).toBe(true);
    expect(shouldShowPatientSeat('standing')).toBe(false);
    expect(shouldShowPatientSeat('pacing')).toBe(false);
    expect(shouldShowPatientSeat('recumbent')).toBe(false);
  });

  it('keeps the stretcher only for a recumbent patient staged on it', () => {
    expect(shouldHideTreatmentStretcher('stretcher', 'recumbent')).toBe(false);
    expect(shouldHideTreatmentStretcher('floor', 'recumbent')).toBe(true);
    expect(shouldHideTreatmentStretcher('stretcher', 'seated')).toBe(true);
    expect(shouldHideTreatmentStretcher('stretcher', 'standing')).toBe(true);
    expect(shouldHideTreatmentStretcher('stretcher', 'pacing')).toBe(true);
  });

  it('shows the trolley after the crew loads a floor-found patient', () => {
    expect(shouldHideTreatmentStretcher('floor', 'recumbent', true)).toBe(false);
    expect(shouldHideTreatmentStretcher('floor', 'seated', true)).toBe(false);
    expect(shouldShowPatientSeat('seated', true)).toBe(false);
    expect(shouldHideTreatmentStretcher('floor', 'standing', true)).toBe(true);
  });
});

describe('stretcher loading', () => {
  it('treats main stretcher, scoop, board and vacuum mattress as load devices', () => {
    expect(patientLoadedOnStretcher([])).toBe(false);
    expect(patientLoadedOnStretcher(['oxygen_mask'])).toBe(false);
    expect(patientLoadedOnStretcher(['main_stretcher'])).toBe(true);
    expect(patientLoadedOnStretcher(['oxygen_mask', 'scoop_stretcher'])).toBe(true);
  });

  it('lifts a floor-staged patient onto the trolley once loaded', () => {
    expect(deriveAppliedPatientStage('floor', [])).toBe('floor');
    expect(deriveAppliedPatientStage('floor', ['main_stretcher'])).toBe('stretcher');
    expect(deriveAppliedPatientStage('stretcher', ['main_stretcher'])).toBe('stretcher');
  });

  it('turns stretcher load into a recumbent visual override', () => {
    expect(deriveTreatmentPositioningOverride(['main_stretcher'])).toMatchObject({
      mobility: 'recumbent',
      posture: 'supine',
      treatmentId: 'main_stretcher',
    });
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
