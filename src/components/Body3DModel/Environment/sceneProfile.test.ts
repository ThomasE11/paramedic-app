import { describe, expect, it } from 'vitest';
import { isResp001VillaProfile, resp001VillaMeshVisible, type SceneProfile } from './sceneProfile';

describe('scene profile gating', () => {
  it('activates the authored villa dressing only for its explicit profile', () => {
    const profile: SceneProfile = 'resp-001-villa';
    expect(isResp001VillaProfile(profile)).toBe(true);
    expect(isResp001VillaProfile(undefined)).toBe(false);
  });

  it('hides only the authored chair after transfer to another support surface', () => {
    expect(resp001VillaMeshVisible('asthma_chair_seat_cushion', false)).toBe(false);
    expect(resp001VillaMeshVisible('asthma_chair_back_frame', false)).toBe(false);
    expect(resp001VillaMeshVisible('side_table_top', false)).toBe(true);
    expect(resp001VillaMeshVisible('villa_sofa_plinth', false)).toBe(true);
    expect(resp001VillaMeshVisible('asthma_chair_seat_cushion', true)).toBe(true);
  });
});
