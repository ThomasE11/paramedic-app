import { describe, expect, it } from 'vitest';
import { patientAgeBand, patientAgeScale } from './patientAgePresentation';

describe('patient age presentation', () => {
  it.each([
    [0.67, 'infant', 0.38],
    [4, 'toddler', 0.56],
    [8, 'child', 0.72],
    [14, 'adolescent', 0.86],
    [35, 'adult', 1],
  ] as const)('renders age %s as a %s rather than an adult', (age, expectedBand, expectedScale) => {
    expect(patientAgeBand(age)).toBe(expectedBand);
    expect(patientAgeScale(age)).toBe(expectedScale);
  });
});
