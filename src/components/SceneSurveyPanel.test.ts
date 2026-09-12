import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import { buildArrivalSentence, hasReviewedEveryHazard, sceneSurveySetting } from './SceneSurveyPanel';

function caseWith(callReason: string): CaseScenario {
  return {
    patientInfo: { age: 79, gender: 'female' },
    dispatchInfo: { callReason },
  } as CaseScenario;
}

describe('scene arrival sentence', () => {
  it('uses a dash for state-led dispatch descriptions', () => {
    expect(buildArrivalSentence(caseWith('79-year-old female, increasingly confused and unwell for 2 days')))
      .toBe('On arrival, you find a 79-year-old female — increasingly confused and unwell for 2 days.');
  });

  it('keeps symptom noun phrases after “with”', () => {
    expect(buildArrivalSentence(caseWith('79-year-old female, severe allergic reaction after eating')))
      .toBe('On arrival, you find a 79-year-old female with severe allergic reaction.');
  });

  it('uses a dash for negative ability descriptions', () => {
    const pilot = {
      ...caseWith('Son cannot breathe, using inhaler repeatedly'),
      patientInfo: { age: 19, gender: 'male' },
    } as CaseScenario;
    expect(buildArrivalSentence(pilot))
      .toBe('On arrival, you find a 19-year-old male who cannot breathe.');
  });
});

describe('hasReviewedEveryHazard', () => {
  it('requires every authored hotspot before the survey is complete', () => {
    expect(hasReviewedEveryHazard(['chemical-1', 'access-2'], [])).toBe(false);
    expect(hasReviewedEveryHazard(['chemical-1', 'access-2'], ['chemical-1'])).toBe(false);
    expect(hasReviewedEveryHazard(['chemical-1', 'access-2'], ['chemical-1', 'access-2'])).toBe(true);
  });

  it('requires an explicit clear-scene sweep when no hotspot is authored', () => {
    expect(hasReviewedEveryHazard([], [])).toBe(false);
    expect(hasReviewedEveryHazard([], ['none'])).toBe(true);
  });
});

describe('sceneSurveySetting', () => {
  it.each([
    ['roadside', 'road'],
    ['industrial', 'industrial'],
    ['agricultural', 'agricultural'],
    ['home', 'home'],
    ['fire', 'fire'],
    ['heat', 'heat'],
    ['public', 'public'],
    ['water', 'water'],
    ['clinic', 'medical'],
  ] as const)('maps authored %s scenes to %s survey dressing', (environmentVariant, expected) => {
    const sceneCase = {
      ...caseWith('Patient unresponsive after collapse'),
      sceneInfo: { environmentVariant },
    } as CaseScenario;

    expect(sceneSurveySetting(sceneCase)).toBe(expected);
  });

  it('leaves legacy scenes to the text fallback', () => {
    expect(sceneSurveySetting(caseWith('Motorcycle collision'))).toBeNull();
  });
});
