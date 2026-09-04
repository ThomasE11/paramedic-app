import { describe, expect, it } from 'vitest';
import {
  getCyanosisBlotchAppearance,
  isCyanoticLipVertex,
  isCyanoticNailPlateSample,
} from './MottlingLayer';

// Regression: ISSUE-023 — hypoxia was technically painted but unreadable,
// and the historical lip band sat over the nose/philtrum instead of the lips.
// Found by /qa on 2026-09-04.
// Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-09-04.md
describe('ISSUE-023 local cyanosis realism', () => {
  it('targets the rendered vermilion band and rejects the old upper-face band', () => {
    expect(isCyanoticLipVertex(0, 1.545, 0.15)).toBe(true);
    expect(isCyanoticLipVertex(0.04, 1.54, 0.14)).toBe(true);
    expect(isCyanoticLipVertex(0, 1.57, 0.15)).toBe(false);
  });

  it('limits peripheral cyanosis to the dorsal nail cap', () => {
    expect(isCyanoticNailPlateSample(0.98, 0.78)).toBe(true);
    expect(isCyanoticNailPlateSample(0.97, 0.78)).toBe(false);
    expect(isCyanoticNailPlateSample(0.98, 0.6)).toBe(false);
  });

  it('keeps moderate hypoxia legible and clears the overlay completely at zero', () => {
    const moderateLip = getCyanosisBlotchAppearance('lip', 0.5);
    const severeNail = getCyanosisBlotchAppearance('nail', 0.75);

    expect(moderateLip.alpha).toBeGreaterThan(0.3);
    expect(severeNail.alpha).toBeGreaterThan(0.4);
    expect(getCyanosisBlotchAppearance('lip', 0).alpha).toBe(0);
    expect(getCyanosisBlotchAppearance('nail', 0).alpha).toBe(0);
  });
});
