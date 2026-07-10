import { describe, expect, it } from 'vitest';
import { ageStatureScale, chestRiseAmplitude } from './patientMotion';

describe('chestRiseAmplitude', () => {
  it('apnoea keeps the chest still', () => {
    expect(chestRiseAmplitude(0)).toBe(0);
    expect(chestRiseAmplitude(0, 1, true)).toBe(0);
  });

  it('normal rate breathes at full excursion', () => {
    expect(chestRiseAmplitude(14)).toBe(1.0);
  });

  it('tachypnoea reads fast and shallow', () => {
    expect(chestRiseAmplitude(32)).toBe(0.55);
  });

  it('breathing effort deepens a tachypnoeic chest, capped at full influence', () => {
    const laboured = chestRiseAmplitude(32, 1);
    expect(laboured).toBeGreaterThan(0.55);
    expect(chestRiseAmplitude(14, 1)).toBe(1); // already at cap
    expect(laboured).toBeLessThanOrEqual(1);
  });

  it('reduced chest rise stays shallow even with maximal effort', () => {
    const reduced = chestRiseAmplitude(14, 0, true);
    expect(reduced).toBeLessThan(0.5);
    expect(chestRiseAmplitude(14, 1, true)).toBe(reduced);
  });

  it('effort input is clamped to 0..1', () => {
    expect(chestRiseAmplitude(32, 5)).toBe(chestRiseAmplitude(32, 1));
    expect(chestRiseAmplitude(32, -1)).toBe(chestRiseAmplitude(32, 0));
  });
});

describe('ageStatureScale', () => {
  it('adults and teens 16+ are full stature', () => {
    expect(ageStatureScale(40)).toBe(1);
    expect(ageStatureScale(16)).toBe(1);
    expect(ageStatureScale(undefined)).toBe(1);
  });

  it('children scale down by age band', () => {
    expect(ageStatureScale(0.5)).toBe(0.42); // infant
    expect(ageStatureScale(3)).toBe(0.56);   // ped-001's febrile 3-year-old
    expect(ageStatureScale(9)).toBe(0.74);   // school age
    expect(ageStatureScale(14)).toBe(0.9);   // young teen
  });

  it('is monotonic — older is never smaller', () => {
    const ages = [0.5, 1, 3, 5, 8, 12, 14, 16, 30];
    const scales = ages.map(ageStatureScale);
    for (let i = 1; i < scales.length; i++) expect(scales[i]).toBeGreaterThanOrEqual(scales[i - 1]);
  });
});
