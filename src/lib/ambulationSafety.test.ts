import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import { firstYearCases } from '@/data/firstYearCases';
import { assessAmbulationSafety } from '@/lib/ambulationSafety';

const fallWithHipPain = firstYearCases.find(caseData => caseData.id === 'y1-001')!;
const stableCase = {
  id: 'stable-gait',
  title: 'Stable gait observation',
  initialPresentation: { position: 'Seated, alert and comfortable' },
  abcde: { disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, findings: [], interventions: [] } },
} as unknown as CaseScenario;

const stableVitals = { bp: '124/76', pulse: 82, respiration: 16, spo2: 98, gcs: 15 };

describe('assisted ambulation safety', () => {
  it('allows an alert, stable patient without a weight-bearing contraindication', () => {
    expect(assessAmbulationSafety({ caseData: stableCase, vitals: stableVitals })).toMatchObject({ allowed: true, code: 'allowed' });
  });

  it('blocks the fall patient who has hip pain and cannot get up', () => {
    expect(assessAmbulationSafety({ caseData: fallWithHipPain, vitals: stableVitals })).toMatchObject({ allowed: false, code: 'weight-bearing-injury' });
  });

  it('recognises ordinary lower-limb injury wording', () => {
    const ankleInjury = { ...stableCase, secondarySurvey: { extremities: ['Left ankle injury with swelling'] } } as CaseScenario;
    expect(assessAmbulationSafety({ caseData: ankleInjury, vitals: stableVitals })).toMatchObject({ allowed: false, code: 'weight-bearing-injury' });
  });

  it('blocks a hypoxic patient even when other observations are normal', () => {
    expect(assessAmbulationSafety({ caseData: stableCase, vitals: { ...stableVitals, spo2: 90 } })).toMatchObject({ allowed: false, code: 'hypoxia' });
  });

  it('blocks tachypnoea and tachycardia independently', () => {
    expect(assessAmbulationSafety({ caseData: stableCase, vitals: { ...stableVitals, respiration: 30 } }).code).toBe('respiratory-instability');
    expect(assessAmbulationSafety({ caseData: stableCase, vitals: { ...stableVitals, pulse: 132 } }).code).toBe('pulse-instability');
  });
});
