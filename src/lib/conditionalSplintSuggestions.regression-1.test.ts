import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import { buildInitialVitalsFromCase } from '@/data/treatmentEffects';
import { suggestedTreatmentIdsForCase } from '@/components/TreatmentJumpBagPanel';

function suggestions(caseId: string): string[] {
  const caseData = allCases.find(candidate => candidate.id === caseId)!;
  return suggestedTreatmentIdsForCase(caseData, buildInitialVitalsFromCase(caseData));
}

describe('regression: conditional splint instructions are not promoted as actions', () => {
  it('does not suggest traction from an if-femur-fracture equipment note', () => {
    expect(suggestions('trauma-008')).not.toContain('traction_splint');
  });

  it('respects an explicit traction-splint contraindication for a neck-of-femur fracture', () => {
    const nofSuggestions = suggestions('fall-001');
    expect(nofSuggestions).not.toContain('traction_splint');
    expect(nofSuggestions).toContain('splinting');
  });

  it('surfaces a named SAM splint without adding a duplicate generic splint', () => {
    const limbSuggestions = suggestions('y1-020');
    expect(limbSuggestions).toContain('sam_splint');
    expect(limbSuggestions).not.toContain('splinting');
  });
});
