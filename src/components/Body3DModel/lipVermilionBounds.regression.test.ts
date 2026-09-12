import { describe, expect, it } from 'vitest';
import { referenceVermilionCoverage } from './lipCyanosisMask';

describe('reference atlas vermilion rather than peri-oral skin', () => {
  it('keeps central lips fully tinted with a soft mouth-corner boundary', () => {
    expect(referenceVermilionCoverage(0, 1.545, .15)).toBe(1);
    expect(referenceVermilionCoverage(.025, 1.545, .15)).toBeGreaterThan(0);
    expect(referenceVermilionCoverage(.025, 1.545, .15)).toBeLessThan(1);
  });
  it('excludes the cheek faces formerly admitted by the broad candidate band', () => {
    for (const x of [-.043, -.032, .032, .043]) {
      expect(referenceVermilionCoverage(x, 1.545, .15)).toBe(0);
    }
    expect(referenceVermilionCoverage(0, 1.554, .15)).toBe(0);
    expect(referenceVermilionCoverage(0, 1.545, .13)).toBe(0);
  });
});
