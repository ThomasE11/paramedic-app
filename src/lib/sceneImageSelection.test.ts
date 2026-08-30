import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import { inferSceneImage, sceneImageNeedsPatientOverlay, sceneImagePatientGender } from './sceneImageSelection';

describe('scene image demographic consistency', () => {
  it('never selects a visibly gendered patient who contradicts the case', () => {
    const mismatches: string[] = [];

    for (const caseData of allCases) {
      const expected = caseData.patientInfo?.gender;
      const image = inferSceneImage(caseData);
      const visible = sceneImagePatientGender(image);
      if (visible && expected && visible !== expected) {
        mismatches.push(`${caseData.id}: ${expected} patient resolved to ${visible} asset ${image}`);
      }
    }

    expect(mismatches, mismatches.join('\n')).toEqual([]);
  });

  it('keeps the LITFL STEMI pre-brief and survey on the same male scene', () => {
    const caseData = allCases.find(({ id }) => id === 'litfl-001');
    expect(caseData).toBeDefined();
    const image = inferSceneImage(caseData!);
    expect(image).toBe('/scene-assets/y2-009-construction-office-arrest.png');
    expect(sceneImagePatientGender(image)).toBe('male');
  });

  it.each([
    ['y1-010', '/scene-assets/y1-010-park-bicycle-wrist-fall.png'],
    ['cardiac-014', '/scene-assets/paediatric-pool-rescue-environment.png'],
    ['trauma-012', '/scene-assets/paediatric-pool-rescue-environment.png'],
    ['cardiac-017', '/scene-assets/infant-nursery-environment.png'],
  ])('uses an age-safe scene plate for %s', (caseId, expectedImage) => {
    const caseData = allCases.find(({ id }) => id === caseId);
    expect(caseData).toBeDefined();

    const image = inferSceneImage(caseData!);
    expect(image).toBe(expectedImage);
    expect(sceneImageNeedsPatientOverlay(image)).toBe(true);
  });
});
