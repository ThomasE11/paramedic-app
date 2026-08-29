import { describe, expect, it } from 'vitest';
import {
  getHandsOnProcedurePlan,
  isHandsOnTreatment,
  parseProcedureSiteToken,
  procedureIncludesIntegratedReassessment,
  procedureSiteToken,
} from '@/lib/handsOnProcedures';
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

  it('makes patient repositioning a physical, reassessed procedure', () => {
    for (const treatmentId of ['supine_position', 'recovery_position', 'fowlers_position', 'assisted_ambulation']) {
      const plan = getHandsOnProcedurePlan(treatmentId, caseData);
      expect(isHandsOnTreatment(treatmentId)).toBe(true);
      expect(plan?.steps.map(step => step.id)).toEqual(['safety', 'prepare', 'move', 'settle', 'confirm']);
    }
  });

  it('provides physical application workflows for reusable patient equipment', () => {
    const equipmentTreatments = [
      'bvm_ventilation', 'suction', 'opa_insert', 'nebulizer_salbutamol', 'cpap_niv',
      'iv_access', 'io_access', 'fluids_250ml', 'chest_seal_vented', 'needle_decompression',
      'sam_splint', 'box_splint', 'vacuum_limb_splint', 'air_splint', 'traction_splint',
      'cervical_collar', 'warming_blanket', 'active_cooling', 'spinal_board',
      'scoop_stretcher', 'vacuum_mattress', 'head_blocks', 'ked', 'lucas_device',
      'ventilator_setup',
    ];
    for (const treatmentId of equipmentTreatments) {
      const plan = getHandsOnProcedurePlan(treatmentId, caseData);
      expect(plan?.steps.length, `${treatmentId} should have a complete application workflow`).toBeGreaterThanOrEqual(4);
      expect(plan?.equipmentAsset, `${treatmentId} should identify its real equipment`).toMatch(/^\/equipment-assets\//);
    }
  });

  it('binds fracture immobilisation to the injured limb', () => {
    const fractureCase = {
      ...caseData,
      secondarySurvey: { extremities: ['Right femur deformity and shortening'] },
    } as CaseScenario;
    const plan = getHandsOnProcedurePlan('traction_splint', fractureCase);
    expect(plan?.requiresTarget).toBe(true);
    expect(plan?.targets[0]).toMatchObject({ id: 'right-leg', priority: 'injury' });
  });

  it('credits the mandatory CSM-after step for every limb splint procedure', () => {
    for (const treatmentId of ['splinting', 'sam_splint', 'box_splint', 'vacuum_limb_splint', 'air_splint', 'traction_splint']) {
      expect(getHandsOnProcedurePlan(treatmentId, caseData)?.steps.at(-1)?.id).toBe('csm-after');
      expect(procedureIncludesIntegratedReassessment(treatmentId)).toBe(true);
    }
    expect(procedureIncludesIntegratedReassessment('tourniquet')).toBe(false);
  });
});
