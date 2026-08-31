import { describe, expect, it } from 'vitest';
import { getHandsOnProcedurePlan } from '@/lib/handsOnProcedures';
import type { CaseScenario } from '@/types';

// Regression: ISSUE-009 — bandage and tourniquet procedures invented bleeding sites in a non-trauma case
// Found by /qa on 2026-08-31
// Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-08-30.md
describe('regression: haemorrhage procedures require an authored bleeding site', () => {
  it('does not offer body regions when the scenario contains no external haemorrhage', () => {
    const heatExposureCase = {
      category: 'environmental',
      subcategory: 'Heat exposure',
      patientInfo: { age: 35, gender: 'male', weight: 82 },
      dispatchInfo: { callReason: 'Worker dizzy and nauseated at construction site' },
      sceneInfo: { description: 'Construction site in Dubai' },
      initialPresentation: { appearance: 'Pale, profuse sweating, fatigued', position: 'Seated with support' },
      abcde: {
        circulation: { findings: ['Tachycardia with warm peripheries'], interventions: [] },
        exposure: { findings: ['Profuse sweating without injury'], interventions: [] },
      },
      secondarySurvey: { extremities: ['No wounds or deformity identified'] },
    } as unknown as CaseScenario;

    const pressureDressing = getHandsOnProcedurePlan('bleeding_control', heatExposureCase);
    const tourniquet = getHandsOnProcedurePlan('tourniquet', heatExposureCase);

    expect(pressureDressing?.requiresTarget).toBe(true);
    expect(pressureDressing?.targets).toEqual([]);
    expect(tourniquet?.requiresTarget).toBe(true);
    expect(tourniquet?.targets).toEqual([]);
  });
});
