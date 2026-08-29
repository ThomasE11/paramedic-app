import { describe, expect, it } from 'vitest';
import { firstYearCases } from '@/data/firstYearCases';
import type { CaseScenario } from '@/types';
import { assessLimbSplintSafety } from '@/lib/limbSplintSafety';

const wristCase = firstYearCases.find(caseData => caseData.id === 'y1-010')!;
const tibiaCase = firstYearCases.find(caseData => caseData.id === 'y1-020')!;

describe('limb splint safety', () => {
  it('binds a SAM splint to the actual fractured wrist', () => {
    expect(assessLimbSplintSafety(wristCase, 'sam_splint')).toMatchObject({
      allowed: true,
      eligibleTargets: ['left-arm'],
    });
  });

  it('binds a box splint to the actual tibial injury', () => {
    expect(assessLimbSplintSafety(tibiaCase, 'box_splint')).toMatchObject({
      allowed: true,
      eligibleTargets: ['right-leg'],
    });
  });

  it('does not treat a femur with a distal SAM, box or air device', () => {
    const femurCase = {
      ...tibiaCase,
      secondarySurvey: { extremities: ['Closed right mid-shaft femur fracture with deformity'] },
      abcde: { ...tibiaCase.abcde, exposure: { findings: ['Closed right femoral shaft deformity'], interventions: [] } },
    } as unknown as CaseScenario;
    for (const treatmentId of ['sam_splint', 'box_splint', 'air_splint'] as const) {
      expect(assessLimbSplintSafety(femurCase, treatmentId).code).toBe('device-mismatch');
    }
    expect(assessLimbSplintSafety(femurCase, 'vacuum_limb_splint')).toMatchObject({ allowed: true, eligibleTargets: ['right-leg'] });
  });

  it('rejects an air sleeve over an open limb injury', () => {
    const openCase = {
      ...tibiaCase,
      abcde: { ...tibiaCase.abcde, exposure: { findings: ['Open right tibial fracture with active bleeding'], interventions: [] } },
      secondarySurvey: { extremities: ['Open right tibial fracture and deformity'] },
    } as unknown as CaseScenario;
    expect(assessLimbSplintSafety(openCase, 'air_splint').code).toBe('open-injury');
  });

  it('requires exact-site haemorrhage control before wrapping a bleeding limb', () => {
    const bleedingCase = {
      ...tibiaCase,
      abcde: { ...tibiaCase.abcde, exposure: { findings: ['Right tibial deformity with active bleeding'], interventions: [] } },
      secondarySurvey: { extremities: ['Right tibial deformity with active bleeding'] },
    } as unknown as CaseScenario;
    expect(assessLimbSplintSafety(bleedingCase, 'vacuum_limb_splint').code).toBe('uncontrolled-haemorrhage');
    expect(assessLimbSplintSafety(bleedingCase, 'vacuum_limb_splint', ['site:bleeding_control:right-leg']))
      .toMatchObject({ allowed: true, eligibleTargets: ['right-leg'] });
  });
});
