import { describe, expect, it } from 'vitest';
import {
  FEMALE_GARMENT_GLBS,
  GARMENT_GLBS,
  garmentGlbsForModel,
} from './ClothingLayer';

describe('garmentGlbsForModel', () => {
  it('uses the fitted Blender garment only for its matching adult shell', () => {
    expect(garmentGlbsForModel('/models/patient-male.glb')).toBe(GARMENT_GLBS);
    expect(garmentGlbsForModel('/models/patient-female.glb')).toBe(FEMALE_GARMENT_GLBS);
  });

  it.each([
    '/models/patient-infant-male.glb',
    '/models/patient-toddler-female.glb',
    '/models/patient-child-male.glb',
    '/models/patient-adolescent-female.glb',
  ])('falls back to body-derived clothing for %s', modelPath => {
    expect(garmentGlbsForModel(modelPath)).toEqual([]);
  });
});
