import { describe, expect, it } from 'vitest';
import {
  deriveClinicalManagementDebrief,
  deriveTreatmentReassessmentMatches,
  deriveReassessmentStepForTreatment,
  deriveFindingTreatmentSuggestions,
} from './caseManagementRealism';
import type { TreatmentLoopState } from './patientRealismDirector';
import type { TreatmentResponseRule } from './patientRealismScenarios';

describe('deriveTreatmentReassessmentMatches', () => {
  it('marks oxygen, nebuliser, CPAP, and BVM as reassessed by respiratory checks', () => {
    const applied = ['oxygen_nonrebreather', 'nebulizer_salbutamol', 'cpap_niv', 'bvm_ventilation'];

    expect(deriveTreatmentReassessmentMatches('breathing', applied)).toEqual(applied);
    expect(deriveTreatmentReassessmentMatches('chest', applied)).toEqual(applied);
    expect(deriveTreatmentReassessmentMatches('pain-assessment', applied)).toEqual([]);
  });

  it('marks vascular access, fluids, and TXA as reassessed by circulation checks', () => {
    const applied = ['iv_access', 'io_access', 'fluids_500ml', 'txa_1g'];

    expect(deriveTreatmentReassessmentMatches('circulation', applied)).toEqual(applied);
    expect(deriveTreatmentReassessmentMatches('12-lead-ecg', applied)).toEqual([]);
  });

  it('marks glucose and dextrose as reassessed by BGL or disability checks', () => {
    const applied = ['glucose_10g', 'dextrose_10'];

    expect(deriveTreatmentReassessmentMatches('blood-glucose', applied)).toEqual(applied);
    expect(deriveTreatmentReassessmentMatches('disability', applied)).toEqual(applied);
    expect(deriveTreatmentReassessmentMatches('chest', applied)).toEqual([]);
  });

  it('marks cardiac medications as reassessed by pain, ECG, circulation, or chest checks', () => {
    const applied = ['aspirin', 'gtn_spray'];

    expect(deriveTreatmentReassessmentMatches('pain-assessment', applied)).toEqual(applied);
    expect(deriveTreatmentReassessmentMatches('12-lead-ecg', applied)).toEqual(applied);
    expect(deriveTreatmentReassessmentMatches('circulation', applied)).toEqual(applied);
  });

  it('marks wound control and chest seals with anatomically relevant checks', () => {
    const applied = ['chest_seal_vented', 'occlusive_dressing_3sided', 'bleeding_control', 'tourniquet'];

    expect(deriveTreatmentReassessmentMatches('chest', applied)).toEqual(applied);
    expect(deriveTreatmentReassessmentMatches('right-leg', applied)).toEqual(['bleeding_control', 'tourniquet']);
  });

  it('marks splints, spinal devices, pelvic binders, and temperature care by matching follow-up exams', () => {
    const applied = ['splinting', 'sam_splint', 'cervical_collar', 'pelvic_binder', 'warming_blanket', 'active_cooling'];

    expect(deriveTreatmentReassessmentMatches('extremities', applied)).toEqual([
      'splinting',
      'sam_splint',
      'cervical_collar',
      'pelvic_binder',
    ]);
    expect(deriveTreatmentReassessmentMatches('pelvis', applied)).toEqual(['pelvic_binder']);
    expect(deriveTreatmentReassessmentMatches('temperature', applied)).toEqual(['warming_blanket', 'active_cooling']);
  });
});

describe('deriveReassessmentStepForTreatment', () => {
  it('returns a step that actually closes the loop for every high-impact family', () => {
    const cases: Array<[string, string]> = [
      ['oxygen_nonrebreather', 'breathing'],
      ['iv_access', 'circulation'],
      ['glucose_10g', 'blood-glucose'],
      ['tourniquet', 'extremities'],
      ['splinting', 'extremities'],
      ['gtn_spray', 'circulation'],
      ['warming_blanket', 'temperature'],
      ['pelvic_binder', 'extremities'],
    ];
    for (const [treatmentId, expectedStep] of cases) {
      const step = deriveReassessmentStepForTreatment(treatmentId);
      expect(step).toBe(expectedStep);
      // Contract: whatever step we suggest must genuinely close the loop.
      expect(deriveTreatmentReassessmentMatches(step!, [treatmentId])).toEqual([treatmentId]);
    }
  });

  it('returns null for treatments with no reassessment loop', () => {
    expect(deriveReassessmentStepForTreatment('paracetamol')).toBeNull();
  });
});

describe('deriveFindingTreatmentSuggestions', () => {
  const nebRule: TreatmentResponseRule = {
    treatmentIdFragments: ['nebulizer', 'salbutamol'],
    expectedFit: 'matched',
    visualResult: ['nebulizer mist visible'],
    vitalTrajectory: ['wheeze and work of breathing may improve gradually'],
    reassessment: ['air entry', 'wheeze', 'SpO2'],
    patientBehavior: ['patient may report easier breathing'],
    debriefSignal: 'bronchodilator matched to bronchospasm',
  };
  const bvmRule: TreatmentResponseRule = {
    ...nebRule,
    treatmentIdFragments: ['bvm'],
    expectedFit: 'harmful',
  };
  const treatments = [
    { id: 'nebulizer_salbutamol', name: 'Salbutamol nebuliser' },
    { id: 'bvm_ventilation', name: 'BVM ventilation' },
  ];

  it('suggests the matched treatment for a relevant abnormal finding', () => {
    const suggestions = deriveFindingTreatmentSuggestions({
      findingTexts: ['Auscultation bilateral expiratory wheeze'],
      treatmentResponses: [bvmRule, nebRule],
      appliedTreatmentIds: [],
      availableTreatments: treatments,
    });

    expect(suggestions).toEqual([
      expect.objectContaining({ treatmentId: 'nebulizer_salbutamol', treatmentName: 'Salbutamol nebuliser' }),
    ]);
  });

  it('never suggests harmful-fit rules or already-applied treatments', () => {
    expect(deriveFindingTreatmentSuggestions({
      findingTexts: ['Auscultation bilateral expiratory wheeze'],
      treatmentResponses: [bvmRule],
      appliedTreatmentIds: [],
      availableTreatments: treatments,
    })).toEqual([]);

    expect(deriveFindingTreatmentSuggestions({
      findingTexts: ['Auscultation bilateral expiratory wheeze'],
      treatmentResponses: [nebRule],
      appliedTreatmentIds: ['nebulizer_salbutamol'],
      availableTreatments: treatments,
    })).toEqual([]);
  });

  it('stays silent for unrelated findings', () => {
    expect(deriveFindingTreatmentSuggestions({
      findingTexts: ['Pelvis stable, no tenderness'],
      treatmentResponses: [nebRule],
      appliedTreatmentIds: [],
      availableTreatments: treatments,
    })).toEqual([]);
  });

  it('maps haemorrhage findings onto bleeding-control rules via synonyms', () => {
    const tourniquetRule: TreatmentResponseRule = {
      treatmentIdFragments: ['tourniquet'],
      expectedFit: 'matched',
      visualResult: ['bleeding stops at the wound'],
      vitalTrajectory: ['shock trend stabilises with source control'],
      reassessment: ['bleeding control', 'distal pulse'],
      patientBehavior: ['pain rises with application'],
      debriefSignal: 'time to hemorrhage control',
    };
    const suggestions = deriveFindingTreatmentSuggestions({
      findingTexts: ['Active external haemorrhage left thigh'],
      treatmentResponses: [tourniquetRule],
      appliedTreatmentIds: [],
      availableTreatments: [{ id: 'tourniquet', name: 'CAT tourniquet' }],
    });

    expect(suggestions).toEqual([
      expect.objectContaining({ treatmentId: 'tourniquet' }),
    ]);
  });
});

describe('deriveClinicalManagementDebrief', () => {
  const loops: TreatmentLoopState[] = [
    {
      treatmentId: 'oxygen_nonrebreather',
      state: 'applied',
      categoryLabel: 'Oxygen',
      reassessmentPrompt: 'Recheck RR, SpO2, work of breathing, and speech tolerance',
      pendingNote: 'Oxygen applied - reassess SpO2 and work of breathing for full credit',
    },
    {
      treatmentId: 'iv_access',
      state: 'reassessed',
      categoryLabel: 'IV access',
      reassessmentPrompt: 'Recheck site patency, BP, pulse quality, and lungs',
      pendingNote: 'IV access established - reassess BP, pulse, and lungs for full credit',
    },
    {
      treatmentId: 'tourniquet',
      state: 'applied',
      categoryLabel: 'Tourniquet',
      reassessmentPrompt: 'Recheck bleeding, distal pulse, pain, and time applied',
      pendingNote: 'Tourniquet applied - reassess bleeding control and distal pulse',
    },
  ];

  it('summarises pending and reassessed treatment loops', () => {
    const debrief = deriveClinicalManagementDebrief(loops);

    expect(debrief.totalCount).toBe(3);
    expect(debrief.pendingCount).toBe(2);
    expect(debrief.reassessedCount).toBe(1);
    expect(debrief.pendingItems.map(item => item.treatmentId)).toEqual(['oxygen_nonrebreather', 'tourniquet']);
    expect(debrief.reassessedItems.map(item => item.treatmentId)).toEqual(['iv_access']);
    expect(debrief.summary).toContain('2 high-impact treatments');
  });

  it('applies a capped reassessment penalty', () => {
    const manyPending = Array.from({ length: 8 }, (_, index): TreatmentLoopState => ({
      treatmentId: `tx_${index}`,
      state: 'applied',
      categoryLabel: `Treatment ${index}`,
      reassessmentPrompt: 'Recheck response',
      pendingNote: 'Pending reassessment',
    }));

    const debrief = deriveClinicalManagementDebrief(manyPending);

    expect(debrief.penaltyAmount).toBe(20);
    expect(debrief.penaltyReasons).toEqual([
      expect.objectContaining({
        label: expect.stringContaining('Treatment follow-up incomplete'),
        amount: 20,
      }),
    ]);
  });

  it('does not penalise fully reassessed treatment loops', () => {
    const debrief = deriveClinicalManagementDebrief(loops.map(loop => ({ ...loop, state: 'reassessed' })));

    expect(debrief.pendingCount).toBe(0);
    expect(debrief.penaltyAmount).toBe(0);
    expect(debrief.penaltyReasons).toEqual([]);
    expect(debrief.summary).toContain('All 3 high-impact treatments');
  });
});
