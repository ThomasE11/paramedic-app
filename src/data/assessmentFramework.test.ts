import { describe, expect, it } from 'vitest';

import { getStepFindings } from '@/data/assessmentFramework';
import { litflCaseDatabase } from '@/data/litflCases';

const baseCase = litflCaseDatabase.find(caseItem => caseItem.id === 'litfl-001')!;

describe('assessment finding severity', () => {
  it('keeps reassuring airway and abdominal observations normal', () => {
    const airway = getStepFindings('airway', baseCase);
    const abdomen = getStepFindings('abdomen', baseCase);

    expect(airway.find(finding => finding.value === 'No stridor or gurgling')?.severity).toBe('normal');
    expect(abdomen.find(finding => finding.value === 'Soft, non-tender')?.severity).toBe('normal');
  });

  it('recognises common leading, inline and trailing negations', () => {
    const caseData = structuredClone(baseCase);
    caseData.secondarySurvey = {
      ...caseData.secondarySurvey,
      head: ['No laceration, swelling or haematoma'],
      neck: ['Midline tenderness absent'],
      chest: ['Equal expansion, non-tender, no crepitus'],
      abdomen: ['Soft, non-tender, non-distended', 'No guarding, rigidity or rebound tenderness'],
      pelvis: ['Stable and non-tender'],
      extremities: ['No deformity, swelling or fracture'],
      posterior: ['No bruising or tenderness'],
      spine: ['Tenderness not present'],
    };

    const falseAlarms = (['head', 'neck-cspine', 'chest', 'abdomen', 'pelvis', 'extremities', 'posterior-logroll'] as const)
      .flatMap(stepId => getStepFindings(stepId, caseData)
        .filter(finding => finding.severity !== 'normal')
        .map(finding => `${stepId}: ${finding.value}`));

    expect(falseAlarms).toEqual([]);
  });

  it('continues to flag affirmed pathology after a contrasting negative statement', () => {
    const caseData = structuredClone(baseCase);
    caseData.abcde.airway.findings = ['No snoring, but inspiratory stridor is present'];
    caseData.secondarySurvey = {
      ...caseData.secondarySurvey,
      abdomen: ['No guarding, but focal tenderness is present'],
    };

    expect(getStepFindings('airway', caseData).find(finding => finding.label === 'Finding')?.severity).toBe('critical');
    expect(getStepFindings('abdomen', caseData).find(finding => finding.label === 'Abdomen')?.severity).toBe('abnormal');
  });

  it('does not turn explicitly absent burns or ECG changes into critical findings', () => {
    const caseData = structuredClone(baseCase);
    caseData.abcde.exposure.findings = ['No burns or bleeding identified'];
    caseData.abcde.circulation.ecgFindings = ['No ST elevation or ventricular fibrillation'];

    expect(getStepFindings('exposure', caseData).find(finding => finding.label === 'Finding')?.severity).toBe('normal');
    expect(getStepFindings('burns-assessment', caseData)).toEqual([
      expect.objectContaining({ severity: 'normal', value: 'No burns identified' }),
    ]);
    expect(getStepFindings('12-lead-ecg', caseData).find(finding => finding.label === 'ECG')?.severity).toBe('normal');
  });
});
