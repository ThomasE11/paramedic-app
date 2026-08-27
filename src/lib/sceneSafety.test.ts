import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import { dispatchAccessNotes, mandatoryScenePpe, visibleSceneHazards } from './sceneSafety';

describe('scene safety information boundaries', () => {
  const stemi = allCases.find(({ id }) => id === 'litfl-001')!;

  it('keeps non-visible access knowledge out of the image hotspot task', () => {
    expect(visibleSceneHazards(stemi)).toEqual(['Active construction site — hard hat zone']);
    expect(dispatchAccessNotes(stemi)).toEqual([
      'Security gate requires badge',
      'Narrow corridors in portacabin',
    ]);
  });

  it('requires worksite PPE for a cardiac call inside an active construction site', () => {
    expect(mandatoryScenePpe(stemi)).toEqual(expect.arrayContaining(['gloves', 'helmet', 'hivis']));
  });

  it('never duplicates access notes as visible hazards across the case library', () => {
    for (const caseData of allCases) {
      const access = new Set(dispatchAccessNotes(caseData).map((value) => value.toLowerCase()));
      expect(visibleSceneHazards(caseData).filter((value) => access.has(value.toLowerCase()))).toEqual([]);
    }
  });
});
