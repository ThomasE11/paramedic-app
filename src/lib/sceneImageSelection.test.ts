import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import { inferSceneImage, sceneImagePatientGender } from './sceneImageSelection';

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
    expect(image).toBe('/scene-assets/office-medical-dubai.png');
    expect(sceneImagePatientGender(image)).toBe('male');
  });
});
