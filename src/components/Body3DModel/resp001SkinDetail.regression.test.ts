import { describe, expect, it } from 'vitest';
import {
  RESP001_SKIN_DETAIL_PROFILE,
  skinDetailProfileForPilot,
} from './resp001SkinDetail';

describe('resp-001 pore-detail profile', () => {
  it('is opt-in so generic patients retain the existing skin detail map', () => {
    expect(skinDetailProfileForPilot(false)).toBeUndefined();
    expect(skinDetailProfileForPilot(true)).toBe(RESP001_SKIN_DETAIL_PROFILE);
  });

  it('uses the isolated baked asset with provisional bounded sampling values', () => {
    expect(RESP001_SKIN_DETAIL_PROFILE).toEqual({
      url: '/models/patient-male-skin-resp001-pore-detail-normal.png',
      tiles: 28,
      scale: 5,
    });
    expect(Object.isFrozen(RESP001_SKIN_DETAIL_PROFILE)).toBe(true);
    // Measured current face UV density, not a full-body atlas assumption.
    const medianPoreSpacingMm = 1000 / (52 * RESP001_SKIN_DETAIL_PROFILE.tiles * .896);
    expect(medianPoreSpacingMm).toBeGreaterThan(.6);
    expect(medianPoreSpacingMm).toBeLessThan(.9);
    expect(RESP001_SKIN_DETAIL_PROFILE.scale).toBeGreaterThan(1);
    expect(RESP001_SKIN_DETAIL_PROFILE.scale).toBeLessThanOrEqual(5);
  });
});
