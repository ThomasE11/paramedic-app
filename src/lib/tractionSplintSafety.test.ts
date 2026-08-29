import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import { assessTractionSplintSafety } from '@/lib/tractionSplintSafety';

function fractureCase(extremities: string[], exposure: string[] = []): CaseScenario {
  return {
    id: 'test-fracture',
    title: 'Limb injury',
    patientInfo: { age: 32, gender: 'male', weight: 80 },
    abcde: {
      circulation: { findings: [], interventions: [] },
      exposure: { findings: exposure, interventions: [] },
    },
    secondarySurvey: { extremities, pelvis: ['Stable pelvis'] },
  } as unknown as CaseScenario;
}

describe('traction splint safety', () => {
  it('allows the correct leg for a femoral-shaft injury', () => {
    const decision = assessTractionSplintSafety(fractureCase([
      'Closed mid-shaft right femur fracture with deformity',
      'Right foot warm with dorsalis pedis pulse present',
      'No other limb injury',
    ]));
    expect(decision).toMatchObject({ allowed: true, code: 'eligible', target: 'right-leg' });
  });

  it('rejects tibial and wrist fractures', () => {
    expect(assessTractionSplintSafety(fractureCase(['Closed right tibial shaft fracture'])).code)
      .toBe('no-femoral-shaft-injury');
    expect(assessTractionSplintSafety(fractureCase(['Left distal radius fracture'])).code)
      .toBe('no-femoral-shaft-injury');
  });

  it('rejects proximal femur and pelvic injuries', () => {
    expect(assessTractionSplintSafety(fractureCase(['Shortened left leg', 'Left neck of femur fracture'])).code)
      .toBe('proximal-femur-injury');
    expect(assessTractionSplintSafety(fractureCase(['Right femoral shaft fracture', 'Unstable pelvic fracture'])).code)
      .toBe('pelvic-injury');
  });

  it('rejects an associated injury below the femur on the same side', () => {
    const decision = assessTractionSplintSafety(fractureCase([
      'Right femoral shaft fracture',
      'Right ankle fracture and deformity',
    ]));
    expect(decision.code).toBe('associated-lower-limb-injury');
  });

  it('requires site-specific control of active femur haemorrhage', () => {
    const caseData = fractureCase(
      ['Open right femur fracture with deformity'],
      ['Active bleeding from open right femur fracture'],
    );
    expect(assessTractionSplintSafety(caseData).code).toBe('uncontrolled-haemorrhage');
    expect(assessTractionSplintSafety(caseData, ['site:tourniquet:right-leg'])).toMatchObject({
      allowed: true,
      target: 'right-leg',
    });
  });

  it('does not turn a negated or differential finding into a contraindication', () => {
    const caseData = {
      ...fractureCase(['Closed left mid-shaft femur fracture', 'No pelvic fracture', 'No lower-leg fracture']),
      expectedFindings: {
        differentialDiagnoses: ['Pelvic fracture'],
        redFlags: ['Absent distal pulse'],
      },
    } as CaseScenario;
    expect(assessTractionSplintSafety(caseData)).toMatchObject({ allowed: true, target: 'left-leg' });
  });
});
