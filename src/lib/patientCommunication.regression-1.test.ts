import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import { derivePatientCommunication } from './patientCommunication';
import { generateCollateralResponse, generatePatientResponse, historyAnswerCanBeObtained } from './historyTaking';

function scenario(overrides: Partial<CaseScenario> = {}): CaseScenario {
  return {
    patientInfo: { age: 58, gender: 'male' },
    initialPresentation: { consciousness: 'Alert', appearance: 'Breathless, speaking single words' },
    vitalSignsProgression: {
      initial: { bp: '120/80', pulse: 110, respiration: 32, spo2: 88, gcs: 15, painScore: 8 },
    },
    history: { allergies: [], medications: [], medicalConditions: [], eventsLeading: 'Sudden breathlessness.' },
    sceneInfo: { bystanders: 'Wife present' },
    ...overrides,
  } as unknown as CaseScenario;
}

// Regression: history and examination used arrival physiology after the
// live patient had recovered, deteriorated, or received an advanced airway.
describe('live patient communication', () => {
  it('stops speech after deterioration, including explicit zero measurements', () => {
    const patient = scenario();
    expect(derivePatientCommunication(patient).canVocalize).toBe(true);
    for (const live of [
      { vitals: { gcs: 3 } },
      { vitals: { respiration: 0 } },
      { vitals: { pulse: 0 } },
      { isInArrest: true },
      { appliedTreatmentIds: ['intubation'] },
      { appliedTreatmentIds: ['rsi_intubation'] },
      { appliedTreatmentIds: ['surgical_cric'] },
    ]) {
      expect(derivePatientCommunication(patient, live).canVocalize).toBe(false);
    }
  });

  it('allows recovered patients to answer despite the initial unresponsive description', () => {
    const patient = scenario({
      initialPresentation: { consciousness: 'Unresponsive', appearance: 'Unconscious' },
      abcde: { disability: { avpu: 'U', gcs: { total: 3 } } },
    } as unknown as Partial<CaseScenario>);
    expect(derivePatientCommunication(patient).canVocalize).toBe(false);
    const recovered = derivePatientCommunication(patient, {
      vitals: { gcs: 15, respiration: 18, spo2: 96, pulse: 85 }, isInArrest: false,
    });
    expect(recovered.canVocalize).toBe(true);
    expect(recovered.isAwake).toBe(true);
  });

  it('reassesses breathlessness and answers using the current pain score', () => {
    const patient = scenario();
    expect(derivePatientCommunication(patient).responseContext.breathless).toBe(true);
    const { responseContext } = derivePatientCommunication(patient, {
      vitals: { respiration: 18, spo2: 96, bp: '120/80', painScore: 2 },
    });
    expect(responseContext.breathless).toBe(false);
    expect(responseContext.breathingImproved).toBe(true);
    expect(generatePatientResponse(patient, 'opqrst-severity', responseContext)).toBe("It's about 2 out of 10.");
    expect(generatePatientResponse(patient, 'signs-symptoms', responseContext)).toContain('Breathing feels easier');
    expect(generatePatientResponse(patient, 'pain-current', { ...responseContext, painScore: 0 })).toBe('No pain at the moment.');
  });

  it('does not suppress confused but verbal patients or fabricate fluent infant history', () => {
    const confused = derivePatientCommunication(scenario(), { vitals: { gcs: 11 } });
    expect(confused.canVocalize).toBe(true);
    expect(confused.responseContext.altered).toBe(true);
    expect(confused.isAwake).toBe(false);
    const infant = scenario({ patientInfo: { age: 0.5, gender: 'female' } } as Partial<CaseScenario>);
    expect(derivePatientCommunication(infant).canVocalize).toBe(false);
    expect(derivePatientCommunication(infant).status).toContain('parent or caregiver');
  });
});

describe('obtained history, not just recognised questions', () => {
  it('does not credit an absent witness or unavailable last meal', () => {
    expect(historyAnswerCanBeObtained(scenario(), 'last-meal', 'patient')).toBe(false);
    const alone = scenario({ sceneInfo: { bystanders: 'None' } } as Partial<CaseScenario>);
    expect(historyAnswerCanBeObtained(alone, 'allergies', 'bystander')).toBe(false);
    expect(historyAnswerCanBeObtained(scenario(), 'unknown', 'patient')).toBe(false);
  });

  it('distinguishes documented negative history from missing data', () => {
    expect(historyAnswerCanBeObtained(scenario(), 'allergies', 'patient')).toBe(true);
    const missing = scenario({ history: undefined });
    for (const category of ['allergies', 'medications', 'past-medical'] as const) {
      expect(historyAnswerCanBeObtained(missing, category, 'patient')).toBe(false);
      expect(generatePatientResponse(missing, category, { severity: 'mild', altered: false })).toContain("can't confirm");
      expect(generateCollateralResponse(missing, category)).toContain('cannot confirm');
    }
  });

  it('does not credit subjective pain history when a witness cannot answer it', () => {
    expect(historyAnswerCanBeObtained(scenario(), 'events', 'bystander')).toBe(true);
    expect(historyAnswerCanBeObtained(scenario(), 'opqrst-severity', 'bystander')).toBe(false);
  });
});
