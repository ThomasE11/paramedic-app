import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import { patientAgeLongLabel } from './patientAgePresentation';
import { getScenePatientDescriptor } from './sceneNarrative';
import { callMedicalControl } from './medicalControl';
import { generateEDOutcome } from './edOutcome';

const infantCase = allCases.find(({ id }) => id === 'cardiac-017');

describe('infant handover age regression', () => {
  it('uses months in narrative, radio and ED handover surfaces', () => {
    expect(infantCase).toBeDefined();
    const caseData = infantCase!;
    const vitals = caseData.vitalSignsProgression.initial;

    expect(patientAgeLongLabel(caseData.patientInfo.age)).toBe('8-month-old');
    expect(getScenePatientDescriptor(caseData)).toContain('8-month-old female infant');

    const advice = callMedicalControl({
      caseData,
      currentVitals: vitals,
      appliedTreatmentIds: [],
      isInArrest: false,
    });
    expect(advice.sitrep).toContain('8-month-old female');
    expect(advice.sitrep).not.toContain('0.67-year-old');

    const outcome = generateEDOutcome({
      caseData,
      finalVitals: vitals,
      appliedTreatmentIds: [],
      totalScore: 80,
      transportPreAlert: true,
    });
    expect(outcome.arrivalHandover).toContain('8-month-old female');
    expect(outcome.arrivalHandover).not.toContain('0.67-year-old');
  });
});
