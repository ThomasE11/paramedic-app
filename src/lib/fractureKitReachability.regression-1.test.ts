import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import { TREATMENTS } from '@/data/enhancedTreatmentEffects';
import { buildInitialVitalsFromCase } from '@/data/treatmentEffects';
import {
  bagKeyForTreatment,
  recommendedManagementTabForCase,
  suggestedTreatmentIdsForCase,
} from '@/components/TreatmentJumpBagPanel';

describe('regression: fracture cases expose the physical splint kit', () => {
  it('opens transport and surfaces splinting without misreading an ice pack as systemic cooling', () => {
    const fractureCase = allCases.find(candidate => candidate.id === 'y1-010')!;
    const suggestions = suggestedTreatmentIdsForCase(
      fractureCase,
      buildInitialVitalsFromCase(fractureCase),
    );

    expect(recommendedManagementTabForCase(fractureCase)).toBe('transport');
    expect(suggestions).toContain('splinting');
    expect(suggestions).not.toContain('active_cooling');
  });

  it('keeps every supported limb immobilisation device in transport', () => {
    const splintIds = [
      'splinting',
      'sam_splint',
      'box_splint',
      'vacuum_limb_splint',
      'air_splint',
      'traction_splint',
    ];

    for (const id of splintIds) {
      const treatment = TREATMENTS.find(candidate => candidate.id === id);
      expect(treatment, `${id} exists`).toBeDefined();
      expect(bagKeyForTreatment(treatment!), `${id} bag`).toBe('transport');
    }
  });

  it('still suggests systemic cooling for true hyperthermia', () => {
    const heatStrokeCase = allCases.find(candidate => candidate.id === 'env-002')!;
    expect(suggestedTreatmentIdsForCase(
      heatStrokeCase,
      buildInitialVitalsFromCase(heatStrokeCase),
    )).toContain('active_cooling');
  });
});
