import { describe, expect, it } from 'vitest';

import {
  ADOLESCENT_FEMALE_GARMENT_GLBS,
  ADOLESCENT_MALE_GARMENT_GLBS,
  adolescentGarmentGlbsForModel,
} from './ClothingLayer';

// Regression: ISSUE-019 — seated adolescent procedural trousers exposed torn skin triangles
// Found by /qa on 2026-09-01
// Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-08-30.md
describe('adolescent garment routing', () => {
  it('uses only the fitted male trouser shell so the shirt stays body-derived', () => {
    const garments = adolescentGarmentGlbsForModel('/models/patient-adolescent-male.glb');

    expect(garments).toBe(ADOLESCENT_MALE_GARMENT_GLBS);
    expect(garments.map(garment => garment.name)).toEqual(['scrub-trousers']);
  });

  it('uses the sex-matched female trouser shell and excludes younger patients', () => {
    expect(
      adolescentGarmentGlbsForModel('/models/patient-adolescent-female.glb'),
    ).toBe(ADOLESCENT_FEMALE_GARMENT_GLBS);
    expect(adolescentGarmentGlbsForModel('/models/patient-child-female.glb')).toEqual([]);
    expect(adolescentGarmentGlbsForModel('/models/patient-male.glb')).toEqual([]);
  });
});
