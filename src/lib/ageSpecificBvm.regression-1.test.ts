import { describe, expect, it } from 'vitest';
import type { CaseScenario } from '@/types';
import { getHandsOnProcedurePlan } from './handsOnProcedures';

function patientCase(age: number, weight: number): CaseScenario {
  return {
    id: `bvm-${age}-${weight}`,
    title: 'Ventilation training patient',
    patientInfo: { age, weight, gender: 'female' },
  } as unknown as CaseScenario;
}

describe('age-specific BVM procedure regression', () => {
  it('uses an infant mask and neutral airway position for an 8-month-old', () => {
    const plan = getHandsOnProcedurePlan('bvm_ventilation', patientCase(0.67, 8));

    expect(plan?.title).toContain('infant');
    expect(plan?.steps.find(step => step.id === 'prepare')?.instruction).toContain('infant mask');
    expect(plan?.steps.find(step => step.id === 'position')?.instruction).toContain('neutral position');
    expect(plan?.steps.find(step => step.id === 'confirm')?.clinicalCue).toContain('20–30 breaths/min');
  });

  it('uses a paediatric circuit and cadence for a young child', () => {
    const plan = getHandsOnProcedurePlan('bvm_ventilation', patientCase(4, 18));

    expect(plan?.title).toContain('child');
    expect(plan?.steps.find(step => step.id === 'prepare')?.instruction).toContain('paediatric bag');
    expect(plan?.steps.find(step => step.id === 'confirm')?.clinicalCue).toContain('20–30 breaths/min');
  });

  it('uses newborn equipment and inflation cadence for a neonate', () => {
    const plan = getHandsOnProcedurePlan('bvm_ventilation', patientCase(0.02, 3.5));

    expect(plan?.title).toContain('newborn');
    expect(plan?.steps.find(step => step.id === 'prepare')?.instruction).toContain('neonatal bag or T-piece');
    expect(plan?.steps.find(step => step.id === 'confirm')?.clinicalCue).toContain('30–60 inflations/min');
  });

  it('does not mistake an aggregate MCI sentinel for a newborn', () => {
    const aggregate = {
      ...patientCase(0, 0),
      mci: { isMCI: true },
    } as unknown as CaseScenario;

    expect(getHandsOnProcedurePlan('bvm_ventilation', aggregate)?.title).toBe('Apply bag-valve-mask ventilation');
  });
});
