import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import { buildArrivalSentence } from './SceneSurveyPanel';

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
