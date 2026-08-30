import { describe, expect, it } from 'vitest';
import {
  patientAgeBand,
  patientAgeScale,
  patientExpectedHeightMetres,
  patientModelPath,
} from './patientAgePresentation';

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

  it.each([
    [0.67, 0.6876],
    [3, 0.915],
    [8, 1.275],
    [14, 1.63],
    [17, 1.72],
    [35, 1.8],
  ] as const)('keeps age %s near a realistic physical height', (age, expectedHeight) => {
    expect(patientExpectedHeightMetres(age)).toBeCloseTo(expectedHeight, 3);
  });

  it.each([
    ['female', 0.67, '/models/patient-infant-female.glb'],
    ['female', 3, '/models/patient-toddler-female.glb'],
    ['male', 3, '/models/patient-toddler-male.glb'],
    ['male', 8, '/models/patient-child-male.glb'],
    ['male', 14, '/models/patient-adolescent-male.glb'],
    ['female', 8, '/models/patient-child-female.glb'],
    ['female', 14, '/models/patient-adolescent-female.glb'],
    ['male', 0, '/models/patient-infant-male.glb'],
    ['male', 35, '/models/patient-male.glb'],
  ] as const)('routes a %s patient aged %s to %s', (gender, age, expectedPath) => {
    expect(patientModelPath(gender, age)).toBe(expectedPath);
  });
});
