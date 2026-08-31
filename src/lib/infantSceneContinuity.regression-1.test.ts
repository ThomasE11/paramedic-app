import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import { buildArrivalSentence } from '@/components/SceneSurveyPanel';
import { caseSceneNeedsPatientOverlay, inferSceneImage } from './sceneImageSelection';

// Regression: ISSUE-006 — cardiac-017 used an empty cot plus a duplicate blue infant overlay
// Found by /qa on 2026-08-30
// Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-08-30.md
describe('infant arrival scene continuity', () => {
  const infantCase = allCases.find(({ id }) => id === 'cardiac-017');

  it('uses the patient-composed nursery plate without a procedural duplicate', () => {
    expect(infantCase).toBeDefined();
    const sceneImage = inferSceneImage(infantCase!);

    expect(sceneImage).toBe('/scene-assets/infant-nursery-environment.png');
    expect(caseSceneNeedsPatientOverlay(infantCase!, sceneImage)).toBe(false);
  });

  it('turns caller wording into a readable on-arrival observation', () => {
    expect(buildArrivalSentence(infantCase!)).toBe(
      'On arrival, you find a female infant — not breathing properly and very floppy.',
    );
  });
});
