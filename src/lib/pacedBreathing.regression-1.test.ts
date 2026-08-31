import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import { TREATMENTS } from '@/data/enhancedTreatmentEffects';
import { applyDynamicTreatment, createInitialPatientState } from '@/data/dynamicTreatmentEngine';
import { buildInitialVitalsFromCase } from '@/data/treatmentEffects';
import { suggestedTreatmentIdsForCase } from '@/components/TreatmentJumpBagPanel';
import { getHandsOnProcedurePlan, isHandsOnTreatment } from '@/lib/handsOnProcedures';
import { derivePatientMobility, derivePatientPosture } from '@/lib/patientStaging';

describe('regression: panic and hyperventilation use paced breathing', () => {
  const panicCase = allCases.find(candidate => candidate.id === 'y1-008')!;
  const hyperventilationCase = allCases.find(candidate => candidate.id === 'y1-012')!;
  const treatment = TREATMENTS.find(candidate => candidate.id === 'paced_breathing')!;

  it.each([panicCase, hyperventilationCase])('surfaces coaching without unnecessary oxygen for $id', caseData => {
    const vitals = buildInitialVitalsFromCase(caseData);
    const suggestions = suggestedTreatmentIdsForCase(caseData, vitals);

    expect(suggestions).toContain('paced_breathing');
    expect(suggestions).not.toEqual(expect.arrayContaining([
      'oxygen_nasal',
      'oxygen_mask',
      'oxygen_nonrebreather',
    ]));
    expect(suggestedTreatmentIdsForCase(caseData, vitals, false, ['paced_breathing']))
      .not.toContain('paced_breathing');
  });

  it('requires exclusion, coaching cycles and monitored reassessment', () => {
    const plan = getHandsOnProcedurePlan('paced_breathing', panicCase);

    expect(isHandsOnTreatment('paced_breathing')).toBe(true);
    expect(plan?.steps.map(step => step.id)).toEqual([
      'exclude',
      'engage',
      'inhale',
      'exhale',
      'cycles',
      'reassess',
    ]);
    expect(plan?.steps.find(step => step.id === 'exhale')?.clinicalCue).toContain('Never use paper-bag');
  });

  it('settles respiratory rate and pulse while retaining a normal floor', () => {
    const initial = createInitialPatientState(panicCase);
    const { newState } = applyDynamicTreatment(treatment, initial, panicCase);

    expect(newState.vitals.respiration).toBe(20);
    expect(newState.vitals.pulse).toBe(101);
    expect(newState.vitals.spo2).toBe(initial.vitals.spo2);
  });

  it.each([panicCase, hyperventilationCase])('does not turn non-organic tachypnoea into a tripod pose for $id', caseData => {
    const mobility = derivePatientMobility(caseData);
    const posture = derivePatientPosture(caseData, {
      mobility,
      respiration: buildInitialVitalsFromCase(caseData).respiration,
    });

    expect(mobility).toBe('seated');
    expect(posture).toBe('seated');
  });
});
