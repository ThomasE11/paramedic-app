import { describe, expect, it } from 'vitest';
import { allCases } from '@/data/cases';
import { buildInitialVitalsFromCase } from '@/data/treatmentEffects';
import { assessAmbulationSafety } from '@/lib/ambulationSafety';

function decisionFor(caseId: string) {
  const caseData = allCases.find(candidate => candidate.id === caseId);
  expect(caseData, `case ${caseId} should exist`).toBeDefined();
  return assessAmbulationSafety({
    caseData: caseData!,
    vitals: buildInitialVitalsFromCase(caseData!),
  });
}

describe('regression: assisted walking respects time-critical conditions', () => {
  it('blocks internal bleeding and active second-stage labour', () => {
    expect(decisionFor('trauma-007')).toMatchObject({ allowed: false, code: 'internal-bleeding' });
    expect(decisionFor('y1-006')).toMatchObject({ allowed: false, code: 'active-labour' });
  });

  it('blocks acute stroke, TIA and myocardial ischaemia', () => {
    expect(decisionFor('y1-016')).toMatchObject({ allowed: false, code: 'acute-neurological' });
    expect(decisionFor('y2-006')).toMatchObject({ allowed: false, code: 'acute-neurological' });
    expect(decisionFor('cardiac-005')).toMatchObject({ allowed: false, code: 'cardiac-ischaemia' });
    expect(decisionFor('cardiac-ecg-002')).toMatchObject({ allowed: false, code: 'cardiac-ischaemia' });
  });

  it('still permits an alert stable patient with an isolated wrist injury', () => {
    expect(decisionFor('y1-010')).toMatchObject({ allowed: true, code: 'allowed' });
  });
});
