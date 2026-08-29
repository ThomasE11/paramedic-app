import { describe, expect, it } from 'vitest';
import { TREATMENTS } from '@/data/enhancedTreatmentEffects';
import { bagKeyForTreatment } from '@/components/TreatmentJumpBagPanel';

describe('treatment jump-bag routing', () => {
  it('keeps assisted ambulation in the exposure/positioning pack', () => {
    const treatment = TREATMENTS.find(item => item.id === 'assisted_ambulation');
    expect(treatment).toBeDefined();
    expect(bagKeyForTreatment(treatment!)).toBe('exposure');
  });
});
