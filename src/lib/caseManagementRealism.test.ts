import { describe, expect, it } from 'vitest';
import { deriveClinicalManagementDebrief, deriveTreatmentReassessmentMatches } from './caseManagementRealism';
import type { TreatmentLoopState } from './patientRealismDirector';

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
