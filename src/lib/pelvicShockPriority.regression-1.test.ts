import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import { buildInitialVitalsFromCase } from '@/data/treatmentEffects';
import {
  recommendedManagementTabForCase,
  suggestedTreatmentIdsForCase,
} from '@/components/TreatmentJumpBagPanel';

describe('regression: shocked pelvic trauma follows haemorrhage priorities', () => {
  it('opens circulation and puts the pelvic binder first', () => {
    const pelvicTrauma = allCases.find(candidate => candidate.id === 'trauma-008')!;
    const suggestions = suggestedTreatmentIdsForCase(
      pelvicTrauma,
      buildInitialVitalsFromCase(pelvicTrauma),
    );

    expect(recommendedManagementTabForCase(pelvicTrauma)).toBe('circulation');
    expect(suggestions[0]).toBe('pelvic_binder');
    expect(suggestions).toContain('iv_access');
  });
});
