import { describe, expect, it } from 'vitest';
import { qualityForTier, type QualityTier } from './AdaptiveQuality';

describe('patient render quality ladder', () => {
  it('enables the full-screen composer only on the top quality rung', () => {
    expect(qualityForTier(0, 2).composerEnabled).toBe(true);
    for (const tier of [1, 2, 3, 4] satisfies QualityTier[]) {
      expect(qualityForTier(tier, 2).composerEnabled).toBe(false);
    }
  });

  it('still degrades pixel ratio and contact shadows independently', () => {
    expect(qualityForTier(0, 2)).toMatchObject({ dpr: 2, contactShadows: true });
    expect(qualityForTier(2, 2)).toMatchObject({ dpr: 1.5, contactShadows: true });
    expect(qualityForTier(4, 2)).toMatchObject({ dpr: 1, contactShadows: false });
  });
});
