import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import { buildInitialVitalsFromCase } from '@/data/treatmentEffects';
import { suggestedTreatmentIdsForCase } from '@/components/TreatmentJumpBagPanel';

function suggestions(caseId: string): string[] {
  const caseData = allCases.find(candidate => candidate.id === caseId)!;
  return suggestedTreatmentIdsForCase(caseData, buildInitialVitalsFromCase(caseData));
}

describe('regression: every scenario has an executable first action', () => {
  it('leaves no authored case with an empty priority pathway', () => {
    const empty = allCases
      .map(caseData => ({
        id: caseData.id,
        suggestions: suggestedTreatmentIdsForCase(caseData, buildInitialVitalsFromCase(caseData)),
      }))
      .filter(candidate => candidate.suggestions.length === 0)
      .map(candidate => candidate.id);

    expect(empty).toEqual([]);
  });

  it.each(['y1-001', 'y1-019'])('uses trolley transfer rather than unsafe ambulation for hip-injury fall %s', caseId => {
    expect(suggestions(caseId)).toContain('main_stretcher');
    expect(suggestions(caseId)).not.toContain('assisted_ambulation');
  });

  it('treats stable sinus tachycardia supportively rather than as SVT', () => {
    const sinusSuggestions = suggestions('y1-013');
    expect(sinusSuggestions).toContain('reassurance');
    expect(sinusSuggestions).not.toEqual(expect.arrayContaining([
      'adenosine_6mg',
      'adenosine_12mg',
      'metoprolol_5mg',
    ]));
  });
});
