import { describe, expect, it } from 'vitest';
import { deriveCaseRealismProfile } from '@/data/clinicalRealism';
import { firstYearCases } from '@/data/firstYearCases';

function caseById(id: string) {
  const caseData = firstYearCases.find(item => item.id === id);
  if (!caseData) throw new Error(`Missing test case ${id}`);
  return caseData;
}

describe('clinical realism profile classification', () => {
  it('does not turn pertinent negatives or McBurney’s point into injuries', () => {
    const abdominalPain = deriveCaseRealismProfile(caseById('y1-002'));

    expect(abdominalPain.observableCues.map(cue => cue.id)).not.toContain('burn-pattern');
    expect(abdominalPain.observableCues.some(cue => cue.id.startsWith('injury-'))).toBe(false);
    expect(abdominalPain.caseFamily).toBe('general');
  });

  it('keeps a simple scald visible without inventing inhalation injury', () => {
    const scald = deriveCaseRealismProfile(caseById('y1-004'));
    const cueIds = scald.observableCues.map(cue => cue.id);

    expect(cueIds).toContain('burn-pattern');
    expect(cueIds).not.toContain('burn-airway');
  });

  it('retains inhalation-risk cues when positive soot evidence is authored', () => {
    const simpleScald = caseById('y1-004');
    const inhalationBurn = {
      ...simpleScald,
      abcde: {
        ...simpleScald.abcde,
        exposure: {
          ...simpleScald.abcde.exposure,
          findings: [...simpleScald.abcde.exposure.findings, 'Soot around nostrils after smoke inhalation'],
        },
      },
    };

    expect(deriveCaseRealismProfile(inhalationBurn).observableCues.map(cue => cue.id)).toContain('burn-airway');
  });

  it('does not classify pain-related pallor as haemorrhagic shock', () => {
    const closedTibialFracture = deriveCaseRealismProfile(caseById('y1-020'));
    expect(closedTibialFracture.observableCues.map(cue => cue.id)).not.toContain('trauma-shock');
    expect(closedTibialFracture.observableCues.map(cue => cue.label)).toContain('Deformity / fracture');
  });
});
