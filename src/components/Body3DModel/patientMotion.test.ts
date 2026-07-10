import { describe, expect, it } from 'vitest';
import { chestRiseAmplitude } from './patientMotion';

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
