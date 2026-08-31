import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import { TREATMENTS } from '@/data/enhancedTreatmentEffects';
import { applyDynamicTreatment, createInitialPatientState } from '@/data/dynamicTreatmentEngine';
import { buildInitialVitalsFromCase } from '@/data/treatmentEffects';
import { suggestedTreatmentIdsForCase } from '@/components/TreatmentJumpBagPanel';
import { getHandsOnProcedurePlan } from '@/lib/handsOnProcedures';

describe('regression: burn cooling is local and site-specific', () => {
  const scaldCase = allCases.find(candidate => candidate.id === 'y1-004')!;
  const heatStrokeCase = allCases.find(candidate => candidate.id === 'env-002')!;
  const cooling = TREATMENTS.find(treatment => treatment.id === 'active_cooling')!;

  it('surfaces a left-arm burn workflow with irrigation and loose covering', () => {
    const suggestions = suggestedTreatmentIdsForCase(
      scaldCase,
      buildInitialVitalsFromCase(scaldCase),
    );
    const plan = getHandsOnProcedurePlan('active_cooling', scaldCase);

    expect(suggestions).toContain('active_cooling');
    expect(plan?.id).toBe('burn-cooling');
    expect(plan?.requiresTarget).toBe(true);
    expect(plan?.targets.map(target => target.id)).toContain('left-arm');
    expect(plan?.steps.map(step => step.id)).toEqual([
      'expose',
      'irrigate',
      'protect',
      'cover',
      'confirm',
    ]);
  });

  it('relieves burn pain without applying whole-body heat-stroke physiology', () => {
    const initial = createInitialPatientState(scaldCase);
    const before = { ...initial.vitals };
    const { newState } = applyDynamicTreatment(cooling, initial, scaldCase);

    expect(newState.vitals.bp).toBe(before.bp);
    expect(newState.vitals.temperature).toBe(before.temperature);
    expect(newState.vitals.painScore).toBeLessThan(before.painScore!);
  });

  it('retains systemic cooling for a true heat-stroke scenario', () => {
    const initial = createInitialPatientState(heatStrokeCase);
    const beforeTemperature = initial.vitals.temperature!;
    const { newState } = applyDynamicTreatment(cooling, initial, heatStrokeCase);

    expect(getHandsOnProcedurePlan('active_cooling', heatStrokeCase)?.id).toBe('active_cooling');
    expect(newState.vitals.temperature).toBeLessThan(beforeTemperature);
  });
});
