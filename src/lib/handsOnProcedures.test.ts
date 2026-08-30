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

  it('uses the same front-facing oxygen interfaces shown on the patient', () => {
    expect(getHandsOnProcedurePlan('oxygen_mask', caseData)?.equipmentAsset).toBe('/equipment-assets/oxygen-mask-front.webp');
    expect(getHandsOnProcedurePlan('oxygen_nonrebreather', caseData)?.equipmentAsset).toBe('/equipment-assets/nonrebreather-mask-v2.webp');
    expect(getHandsOnProcedurePlan('nebulizer_salbutamol', caseData)?.equipmentAsset).toBe('/equipment-assets/nebulizer-mask-v2.webp');
    expect(getHandsOnProcedurePlan('bvm_ventilation', caseData)?.equipmentAsset).toBe('/equipment-assets/bvm-face-seal-v2.png');
  });

  it('prioritises the actual bleeding limb as the tourniquet target', () => {
    const plan = getHandsOnProcedurePlan('tourniquet', caseData);
    expect(plan?.targets[0]).toMatchObject({ id: 'right-leg', priority: 'injury' });
  });

  it('round-trips site-specific treatment tokens', () => {
    const token = procedureSiteToken('bleeding_control', 'right-leg');
    expect(parseProcedureSiteToken(token)).toEqual({ treatmentId: 'bleeding_control', target: 'right-leg' });
  });

  it('localises thoracic procedures to the affected side', () => {
    const thoracicCase = {
      ...caseData,
      dispatchInfo: { callReason: 'Penetrating injury to left chest' },
      abcde: {
        ...caseData.abcde,
        breathing: { findings: ['Absent breath sounds on left with tension pneumothorax'] },
        exposure: { findings: ['Sucking wound left chest'], interventions: [] },
      },
      secondarySurvey: { chest: ['Open wound over left lateral chest'] },
    } as unknown as CaseScenario;

    const seal = getHandsOnProcedurePlan('chest_seal_vented', thoracicCase);
    const decompression = getHandsOnProcedurePlan('needle_decompression', thoracicCase);

    expect(seal?.requiresTarget).toBe(true);
    expect(seal?.targets).toEqual([expect.objectContaining({ id: 'left-chest', priority: 'injury' })]);
    expect(decompression?.targets).toEqual([expect.objectContaining({ id: 'left-chest', priority: 'injury' })]);
    expect(parseProcedureSiteToken(procedureSiteToken('chest_seal_vented', 'left-chest'))).toEqual({
      treatmentId: 'chest_seal_vented',
      target: 'left-chest',
    });
  });

  it('makes capnography part of intubation completion', () => {
    const plan = getHandsOnProcedurePlan('rsi_intubation', caseData);
    expect(plan?.steps.some(step => step.id === 'capnography')).toBe(true);
    expect(plan?.steps.at(-1)?.id).toBe('secure');
    expect(procedureIncludesIntegratedReassessment('rsi_intubation')).toBe(true);
    expect(procedureIncludesIntegratedReassessment('intubation')).toBe(true);
  });

  it('turns airway opening into a maintained, trauma-aware physical manoeuvre', () => {
    const medicalCase = {
      ...caseData,
      category: 'neurological',
      dispatchInfo: { callReason: 'Reduced consciousness after a seizure' },
      sceneInfo: { description: 'Patient found unresponsive in bed' },
      initialPresentation: { generalImpression: 'Post-ictal', position: 'Supine' },
      abcde: { airway: { patent: false, findings: ['Snoring'] }, exposure: { findings: [], interventions: [] } },
      secondarySurvey: { head: [], neck: [], posterior: [] },
    } as unknown as CaseScenario;
    const medicalPlan = getHandsOnProcedurePlan('airway_open', medicalCase);
    const traumaPlan = getHandsOnProcedurePlan('airway_open', {
      ...caseData,
      category: 'trauma',
      dispatchInfo: { ...caseData.dispatchInfo, callReason: 'Motorcycle collision with reduced consciousness' },
    } as CaseScenario);

    expect(medicalPlan?.id).toBe('airway-head-tilt-chin-lift');
    expect(medicalPlan?.steps.map(step => step.id)).toEqual(['assess', 'position', 'manoeuvre', 'clear', 'confirm']);
    expect(traumaPlan?.id).toBe('airway-jaw-thrust');
    expect(traumaPlan?.steps.map(step => step.id)).toEqual(['assess', 'align', 'manoeuvre', 'clear', 'confirm']);
    expect(traumaPlan?.steps.find(step => step.id === 'manoeuvre')?.instruction).toContain('mandibular angles');
    expect(isHandsOnTreatment('airway_open')).toBe(true);
    expect(procedureIncludesIntegratedReassessment('airway_open')).toBe(true);
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
      'nebulised_adrenaline',
      'iv_access', 'io_access', 'fluids_250ml', 'chest_seal_vented', 'needle_decompression',
      'sam_splint', 'box_splint', 'vacuum_limb_splint', 'air_splint', 'traction_splint',
      'cervical_collar', 'warming_blanket', 'active_cooling', 'spinal_board',
      'scoop_stretcher', 'vacuum_mattress', 'head_blocks', 'ked', 'lucas_device',
      'ventilator_setup', 'mechanical_ventilation', 'pelvic_binder', 'surgical_cric', 'magill_forceps',
      'orogastric_tube',
      'airway_open',
      'pericardiocentesis',
      'targeted_temp_mgmt',
      'post_rosc_bundle',
    ];
    for (const treatmentId of equipmentTreatments) {
      const plan = getHandsOnProcedurePlan(treatmentId, caseData);
      expect(plan?.steps.length, `${treatmentId} should have a complete application workflow`).toBeGreaterThanOrEqual(4);
      expect(plan?.equipmentAsset, `${treatmentId} should identify its real equipment`).toMatch(/^\/equipment-assets\//);
    }
  });

  it('routes the transport ventilator through physical circuit setup', () => {
    const plan = getHandsOnProcedurePlan('mechanical_ventilation', caseData);

    expect(isHandsOnTreatment('mechanical_ventilation')).toBe(true);
    expect(plan?.title).toBe('Prepare the transport ventilator');
    expect(plan?.steps.map(step => step.id)).toEqual(['assemble', 'test', 'airway', 'connect', 'confirm']);
  });

  it('positions a pelvic binder at the greater trochanters and reassesses perfusion', () => {
    const plan = getHandsOnProcedurePlan('pelvic_binder', caseData);

    expect(isHandsOnTreatment('pelvic_binder')).toBe(true);
    expect(plan?.steps.map(step => step.id)).toEqual(['assess', 'prepare', 'position', 'close', 'reassess']);
    expect(plan?.steps.find(step => step.id === 'position')?.instruction).toContain('greater trochanters');
    expect(plan?.steps.find(step => step.id === 'assess')?.clinicalCue).toContain('Do not repeatedly spring');
    expect(procedureIncludesIntegratedReassessment('pelvic_binder')).toBe(true);
  });

  it('turns adult choking care into alternating, counted physical manoeuvres', () => {
    const backBlows = getHandsOnProcedurePlan('back_blows', caseData);
    const abdominalThrusts = getHandsOnProcedurePlan('abdominal_thrusts', caseData, ['back_blows']);

    expect(backBlows?.steps.map(step => step.id)).toEqual(['recognise', 'position', 'blow-1-2', 'blow-3-5', 'reassess']);
    expect(backBlows?.steps.find(step => step.id === 'blow-3-5')?.instruction).toContain('up to five total');
    expect(abdominalThrusts?.steps.map(step => step.id)).toEqual(['recheck', 'position', 'hands', 'thrusts', 'reassess']);
    expect(abdominalThrusts?.steps.find(step => step.id === 'hands')?.instruction).toContain('between the umbilicus and lower end of the sternum');
    expect(isHandsOnTreatment('back_blows')).toBe(true);
    expect(isHandsOnTreatment('abdominal_thrusts')).toBe(true);
    expect(procedureIncludesIntegratedReassessment('back_blows')).toBe(true);
    expect(procedureIncludesIntegratedReassessment('abdominal_thrusts')).toBe(true);
  });

  it('makes emergency front-of-neck access a confirmed scalpel-bougie-tube sequence', () => {
    const plan = getHandsOnProcedurePlan('surgical_cric', caseData);

    expect(plan?.steps.map(step => step.id)).toEqual(['declare', 'position', 'prepare', 'incise', 'bougie', 'tube', 'confirm']);
    expect(plan?.steps.find(step => step.id === 'prepare')?.instruction).toContain('6.0 mm');
    expect(plan?.steps.at(-1)?.instruction).toContain('sustained waveform EtCO₂');
    expect(isHandsOnTreatment('surgical_cric')).toBe(true);
    expect(procedureIncludesIntegratedReassessment('surgical_cric')).toBe(true);
  });

  it('requires direct vision throughout Magill forceps foreign-body removal', () => {
    const plan = getHandsOnProcedurePlan('magill_forceps', caseData);

    expect(plan?.steps.map(step => step.id)).toEqual(['prepare', 'position', 'visualise', 'insert', 'remove', 'confirm']);
    expect(plan?.steps.find(step => step.id === 'visualise')?.clinicalCue).toContain('directly seen');
    expect(plan?.steps.find(step => step.id === 'insert')?.instruction).toContain('continuously visible');
    expect(isHandsOnTreatment('magill_forceps')).toBe(true);
    expect(procedureIncludesIntegratedReassessment('magill_forceps')).toBe(true);
  });

  it('uses pH or X-ray rather than auscultation to confirm gastric tube placement', () => {
    const plan = getHandsOnProcedurePlan('orogastric_tube', caseData, ['intubation']);

    expect(plan?.steps.map(step => step.id)).toEqual(['indication', 'measure', 'prepare', 'insert', 'secure', 'confirm', 'decompress']);
    expect(plan?.steps.find(step => step.id === 'confirm')?.instruction).toContain('pH 1–5.5');
    expect(plan?.steps.find(step => step.id === 'confirm')?.clinicalCue).toContain('Do not use air insufflation');
    expect(isHandsOnTreatment('orogastric_tube')).toBe(true);
    expect(procedureIncludesIntegratedReassessment('orogastric_tube')).toBe(true);
  });

  it('requires sustained capnography and bilateral checks for ETT confirmation', () => {
    const plan = getHandsOnProcedurePlan('ett_confirmation', caseData, ['intubation']);

    expect(plan?.steps.map(step => step.id)).toEqual(['depth', 'capnography', 'chest', 'auscultate', 'secure', 'trend']);
    expect(plan?.steps.find(step => step.id === 'capnography')?.clinicalCue).toContain('sustained EtCO₂ waveform');
    expect(plan?.steps.find(step => step.id === 'auscultate')?.instruction).toContain('both upper and lower lateral chest fields');
    expect(isHandsOnTreatment('ett_confirmation')).toBe(true);
    expect(procedureIncludesIntegratedReassessment('ett_confirmation')).toBe(true);
  });

  it('requires image-guided access, controlled drainage and reassessment for pericardiocentesis', () => {
    const plan = getHandsOnProcedurePlan('pericardiocentesis', caseData);

    expect(plan?.steps.map(step => step.id)).toEqual(['confirm', 'prepare', 'window', 'sterile', 'needle', 'confirm-space', 'catheter', 'drain', 'secure']);
    expect(plan?.steps.find(step => step.id === 'window')?.clinicalCue).toContain('Do not default blindly');
    expect(plan?.steps.find(step => step.id === 'needle')?.instruction).toContain('continuously tracking the needle tip');
    expect(plan?.steps.find(step => step.id === 'drain')?.instruction).toContain('measured aliquots');
    expect(isHandsOnTreatment('pericardiocentesis')).toBe(true);
    expect(procedureIncludesIntegratedReassessment('pericardiocentesis')).toBe(true);
  });

  it('uses feedback-controlled fever prevention rather than cold-fluid loading after ROSC', () => {
    const plan = getHandsOnProcedurePlan('targeted_temp_mgmt', caseData);

    expect(plan?.steps.map(step => step.id)).toEqual(['confirm', 'measure', 'target', 'apply', 'connect', 'shivering', 'trend']);
    expect(plan?.steps.find(step => step.id === 'target')?.instruction).toContain('no higher than 37.5°C');
    expect(plan?.steps.find(step => step.id === 'apply')?.clinicalCue).toContain('Do not routinely give a large rapid bolus of ice-cold IV fluid');
    expect(isHandsOnTreatment('targeted_temp_mgmt')).toBe(true);
    expect(procedureIncludesIntegratedReassessment('targeted_temp_mgmt')).toBe(true);
  });

  it('requires every physiological target in the structured post-ROSC bundle', () => {
    const plan = getHandsOnProcedurePlan('post_rosc_bundle', caseData);

    expect(plan?.steps.map(step => step.id)).toEqual(['rosc', 'airway', 'oxygen', 'ventilation', 'circulation', 'ecg', 'disability', 'temperature', 'transfer']);
    expect(plan?.steps.find(step => step.id === 'oxygen')?.instruction).toContain('94–98%');
    expect(plan?.steps.find(step => step.id === 'ventilation')?.instruction).toContain('35–45 mmHg');
    expect(plan?.steps.find(step => step.id === 'circulation')?.instruction).toContain('SBP above 100 mmHg or MAP 60–65 mmHg');
    expect(isHandsOnTreatment('post_rosc_bundle')).toBe(true);
    expect(procedureIncludesIntegratedReassessment('post_rosc_bundle')).toBe(true);
  });

  it('reuses an already fitted nebuliser when adding the second bronchodilator', () => {
    const initial = getHandsOnProcedurePlan('nebulizer_ipratropium', caseData);
    expect(initial?.steps.map(step => step.label)).toContain('Fit the mask');

    const combined = getHandsOnProcedurePlan(
      'nebulizer_ipratropium',
      caseData,
      ['nebulizer_salbutamol'],
    );

    expect(combined?.title).toBe('Add ipratropium to connected nebuliser');
    expect(combined?.steps.map(step => step.label)).toEqual([
      'Pause and isolate the chamber',
      'Verify ipratropium 500 mcg',
      'Load and reconnect',
      'Restart aerosol flow',
      'Reassess combined response',
    ]);
    expect(combined?.steps.map(step => step.label)).not.toContain('Fit the mask');
  });

  it('routes nebulised adrenaline through the fitted chamber and mask', () => {
    const initial = getHandsOnProcedurePlan('nebulised_adrenaline', caseData);
    const connected = getHandsOnProcedurePlan('nebulised_adrenaline', caseData, ['nebulizer_salbutamol']);

    expect(isHandsOnTreatment('nebulised_adrenaline')).toBe(true);
    expect(initial?.steps.map(step => step.label)).toContain('Fit the mask');
    expect(initial?.completionLabel).toContain('stridor');
    expect(connected?.title).toBe('Load adrenaline into connected nebuliser');
    expect(connected?.steps.find(step => step.id === 'verify')?.label).toContain('adrenaline 5 mg/5 mL');
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
