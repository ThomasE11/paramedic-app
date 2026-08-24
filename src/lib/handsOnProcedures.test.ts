import { describe, expect, it } from 'vitest';
import { getHandsOnProcedurePlan, parseProcedureSiteToken, procedureSiteToken } from '@/lib/handsOnProcedures';
import type { CaseScenario } from '@/types';

const caseData = {
  patientInfo: { age: 28, gender: 'male', weight: 80 },
  sceneInfo: { description: 'Motorcycle collision. Active bleeding from the right leg.' },
  abcde: {
    exposure: { findings: ['Active bleeding right leg'], interventions: [] },
    circulation: { findings: ['Right leg haemorrhage'], interventions: [] },
  },
  secondarySurvey: { extremities: ['Right leg open wound with active bleeding'] },
} as unknown as CaseScenario;

describe('hands-on treatment procedures', () => {
  it('requires deliberate pad placement before a shock workflow', () => {
    const plan = getHandsOnProcedurePlan('monitor_pads', caseData);
    expect(plan?.steps.map(step => step.id)).toEqual(['expose', 'prepare', 'sternal', 'apical', 'connect']);
  });

  it('prioritises the actual bleeding limb as the tourniquet target', () => {
    const plan = getHandsOnProcedurePlan('tourniquet', caseData);
    expect(plan?.targets[0]).toMatchObject({ id: 'right-leg', priority: 'injury' });
  });

  it('round-trips site-specific treatment tokens', () => {
    const token = procedureSiteToken('bleeding_control', 'right-leg');
    expect(parseProcedureSiteToken(token)).toEqual({ treatmentId: 'bleeding_control', target: 'right-leg' });
  });

  it('makes capnography part of intubation completion', () => {
    const plan = getHandsOnProcedurePlan('rsi_intubation', caseData);
    expect(plan?.steps.some(step => step.id === 'capnography')).toBe(true);
  });
});
