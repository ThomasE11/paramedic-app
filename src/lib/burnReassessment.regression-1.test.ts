import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import { deriveTreatmentLoopStates } from '@/lib/patientRealismDirector';

describe('regression: burn cooling has case-specific reassessment', () => {
  it('reassesses the local burn instead of presenting a heat-stroke prompt', () => {
    const scaldCase = allCases.find(candidate => candidate.id === 'y1-004')!;
    const [loop] = deriveTreatmentLoopStates(['active_cooling'], [], scaldCase);

    expect(loop.categoryLabel).toBe('Burn dressing');
    expect(loop.reassessmentPrompt).toContain('burn depth/TBSA');
    expect(loop.reassessmentPrompt).toContain('core temperature');
    expect(loop.pendingNote).toContain('Burn cooled and covered');
  });

  it('retains neurological and temperature reassessment for heat stroke', () => {
    const heatStrokeCase = allCases.find(candidate => candidate.id === 'env-002')!;
    const [loop] = deriveTreatmentLoopStates(['active_cooling'], [], heatStrokeCase);

    expect(loop.categoryLabel).toBe('Cooling');
    expect(loop.reassessmentPrompt).toContain('mental status');
  });
});
