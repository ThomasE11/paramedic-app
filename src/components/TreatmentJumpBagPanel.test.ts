import { describe, expect, it } from 'vitest';
import { TREATMENTS } from '@/data/enhancedTreatmentEffects';
import type { CaseScenario } from '@/types';
import {
  bagKeyForTreatment,
  latestUniqueAppliedTreatments,
  managementTabForBayEquipment,
  recommendedManagementTabForCase,
  searchHintForBayEquipment,
  suggestedTreatmentIdsForCase,
} from '@/components/TreatmentJumpBagPanel';

describe('treatment jump-bag routing', () => {
  it('keeps assisted ambulation in the exposure/positioning pack', () => {
    const treatment = TREATMENTS.find(item => item.id === 'assisted_ambulation');
    expect(treatment).toBeDefined();
    expect(bagKeyForTreatment(treatment!)).toBe('exposure');
  });

  it('routes oxygen and nebulisers to the Breathing bag for find→bag→treat', () => {
    const nrb = TREATMENTS.find(item => item.id === 'oxygen_nonrebreather');
    const neb = TREATMENTS.find(item => item.id === 'nebulizer_salbutamol');
    expect(nrb).toBeDefined();
    expect(neb).toBeDefined();
    expect(bagKeyForTreatment(nrb!)).toBe('breathing');
    expect(bagKeyForTreatment(neb!)).toBe('breathing');
  });

  it('still opens airway for true airway interventions', () => {
    const opa = TREATMENTS.find(item => item.id === 'opa_insert');
    const suction = TREATMENTS.find(item => item.id === 'suction');
    expect(opa).toBeDefined();
    expect(suction).toBeDefined();
    expect(bagKeyForTreatment(opa!)).toBe('airway');
    expect(bagKeyForTreatment(suction!)).toBe('airway');
  });
});

describe('compact treatment presentation', () => {
  it('shows one latest row per intervention while preserving most-recent order', () => {
    const application = (id: string, appliedAt: string) => ({
      id,
      name: id,
      description: id,
      appliedAt,
      effects: [],
      category: 'breathing' as const,
      isActive: true,
    });
    const treatments = [
      application('nebulizer_salbutamol', '2026-08-30T00:00:00.000Z'),
      application('nebulizer_ipratropium', '2026-08-30T00:01:00.000Z'),
      application('nebulizer_ipratropium', '2026-08-30T00:02:00.000Z'),
    ];

    expect(latestUniqueAppliedTreatments(treatments, 4).map(treatment => [treatment.id, treatment.appliedAt])).toEqual([
      ['nebulizer_ipratropium', '2026-08-30T00:02:00.000Z'],
      ['nebulizer_salbutamol', '2026-08-30T00:00:00.000Z'],
    ]);
  });
});

function caseFor(overrides: Partial<CaseScenario>): CaseScenario {
  return {
    id: 'test-case',
    title: 'Test patient',
    category: 'general',
    priority: 'moderate',
    complexity: 'basic',
    yearLevels: ['1st-year'],
    dispatchInfo: { callReason: 'Unwell patient', timeOfDay: 'afternoon', location: 'Test scene', callerInfo: 'Bystander' },
    patientInfo: { age: 40, gender: 'male', weight: 75, language: 'English' },
    sceneInfo: { description: 'Safe scene', hazards: [], bystanders: 'None', environment: 'Indoors' },
    initialPresentation: { generalImpression: 'Unwell', position: 'Seated', appearance: 'Pale', consciousness: 'Alert' },
    abcde: {
      airway: { patent: true, findings: [], interventions: [] },
      breathing: { rate: 18, rhythm: 'Regular', depth: 'Normal', spo2: 98, findings: [], interventions: [] },
      circulation: { pulseRate: 80, pulseQuality: 'Normal', bp: { systolic: 120, diastolic: 80 }, capillaryRefill: 2, skin: 'Normal', findings: [], interventions: [] },
      disability: { avpu: 'A', gcs: { eye: 4, verbal: 5, motor: 6, total: 15 }, pupils: 'Equal and reactive', findings: [], interventions: [] },
      exposure: { findings: [], interventions: [] },
    },
    secondarySurvey: { head: [], neck: [], chest: [], abdomen: [], pelvis: [], extremities: [], posterior: [], neurological: [] },
    history: { medications: [], allergies: [], medicalConditions: [], surgicalHistory: [], lastMeal: '', eventsLeading: '' },
    vitalSignsProgression: { initial: { bp: '120/80', pulse: 80, respiration: 18, spo2: 98, gcs: 15 } },
    expectedFindings: { keyObservations: [], redFlags: [], differentialDiagnoses: [], mostLikelyDiagnosis: 'Undifferentiated illness' },
    studentChecklist: [],
    teachingPoints: [],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    version: 1,
    ...overrides,
  };
}

describe('initial treatment-kit recommendation', () => {
  it('opens temperature management for heat illness instead of unrelated airway actions', () => {
    const heatCase = caseFor({
      title: 'Heat Exhaustion',
      category: 'environmental',
      subcategory: 'heat-exhaustion',
      managementPathway: {
        immediate: ['Move to shade', 'Active cooling', 'Establish IV access', 'Normal Saline fluid bolus'],
        definitive: [],
        monitoring: [],
      },
      vitalSignsProgression: { initial: { bp: '100/65', pulse: 110, respiration: 22, spo2: 97, temperature: 38.2, gcs: 15 } },
    });
    expect(recommendedManagementTabForCase(heatCase)).toBe('exposure');
    expect(suggestedTreatmentIdsForCase(heatCase, heatCase.vitalSignsProgression.initial)).toEqual(
      expect.arrayContaining(['active_cooling', 'iv_access', 'fluids_250ml']),
    );
  });

  it('keeps immediate ABC threats ahead of the broader case category', () => {
    const obstructedAirway = caseFor({
      category: 'environmental',
      abcde: {
        ...caseFor({}).abcde,
        airway: { patent: false, findings: ['Airway obstruction'], interventions: ['Open airway'] },
      },
    });
    expect(recommendedManagementTabForCase(obstructedAirway)).toBe('airway');

    const arrest = caseFor({
      category: 'neurological',
      initialRhythm: 'Ventricular Fibrillation',
      vitalSignsProgression: { initial: { bp: '0/0', pulse: 0, respiration: 0, spo2: 70, gcs: 3 } },
    });
    expect(recommendedManagementTabForCase(arrest)).toBe('circulation');
  });

  it('keeps arrest actions device-led and withholds shock until pads are attached', () => {
    const arrest = caseFor({
      title: 'Witnessed cardiac arrest',
      category: 'cardiac',
      subcategory: 'cardiac-arrest',
      initialRhythm: 'Ventricular Fibrillation',
      vitalSignsProgression: { initial: { bp: '0/0', pulse: 0, respiration: 0, spo2: 0, gcs: 3 } },
      managementPathway: {
        immediate: ['Start CPR', 'Apply AED and defibrillate if advised', 'Ventilate with a BVM'],
        definitive: [],
        monitoring: [],
      },
    });

    expect(suggestedTreatmentIdsForCase(arrest, arrest.vitalSignsProgression.initial, true)).toEqual([
      'cpr',
      'monitor_pads',
      'bvm_ventilation',
      'iv_access',
    ]);
    expect(suggestedTreatmentIdsForCase(
      arrest,
      arrest.vitalSignsProgression.initial,
      true,
      ['monitor_pads'],
      'Ventricular Fibrillation',
    )).toEqual([
      'cpr',
      'defibrillation',
      'bvm_ventilation',
      'iv_access',
    ]);

    expect(suggestedTreatmentIdsForCase(
      arrest,
      arrest.vitalSignsProgression.initial,
      true,
      ['monitor_pads'],
      'Asystole',
    )).not.toContain('defibrillation');

    expect(suggestedTreatmentIdsForCase(
      arrest,
      { bp: '100/65', pulse: 80, respiration: 0, spo2: 90, gcs: 3 },
      false,
      ['monitor_pads', 'defibrillation'],
      'Sinus Rhythm',
    )).toEqual(['bvm_ventilation', 'iv_access']);
  });

  it('opens immobilisation equipment for an isolated fracture presentation', () => {
    const fracture = caseFor({
      title: 'Closed femur fracture',
      category: 'trauma',
      managementPathway: { immediate: ['Apply traction splint and reassess distal pulses'], definitive: [], monitoring: [] },
    });
    expect(recommendedManagementTabForCase(fracture)).toBe('transport');
  });

  it('keeps severe-asthma priorities on first-line respiratory care', () => {
    const asthma = caseFor({
      title: 'Life-threatening asthma attack',
      category: 'respiratory',
      subcategory: 'asthma',
      initialPresentation: {
        generalImpression: 'Tripod position with severe respiratory distress',
        position: 'Sitting upright',
        appearance: 'Diaphoretic and unable to speak in sentences',
        consciousness: 'Alert but distressed',
      },
      vitalSignsProgression: { initial: { bp: '130/80', pulse: 120, respiration: 32, spo2: 88, gcs: 14 } },
      managementPathway: {
        immediate: [
          'High-flow oxygen via non-rebreather',
          'Continuous salbutamol nebulizer',
          'Ipratropium bromide 500mcg nebulizer',
          'IV hydrocortisone 200mg early',
          'IV access establishment',
          'Magnesium sulfate 2g IV for life-threatening features',
          'IM adrenaline if peri-arrest or not responding',
        ],
        definitive: [],
        monitoring: [],
      },
    });

    expect(suggestedTreatmentIdsForCase(asthma, asthma.vitalSignsProgression.initial)).toEqual([
      'oxygen_nonrebreather',
      'nebulizer_salbutamol',
      'nebulizer_ipratropium',
      'hydrocortisone_200mg',
      'iv_access',
      'magnesium_2g',
    ]);
    expect(suggestedTreatmentIdsForCase(asthma, asthma.vitalSignsProgression.initial)).not.toContain('adrenaline_im');
    expect(suggestedTreatmentIdsForCase(asthma, asthma.vitalSignsProgression.initial)).not.toContain('cpap_niv');
  });

  it('still promotes IM adrenaline when anaphylaxis is the active presentation', () => {
    const anaphylaxis = caseFor({
      title: 'Anaphylaxis after a bee sting',
      category: 'respiratory',
      subcategory: 'anaphylaxis',
      initialPresentation: {
        generalImpression: 'Rapid allergic reaction',
        position: 'Supine',
        appearance: 'Widespread hives and facial swelling',
        consciousness: 'Alert',
      },
      managementPathway: {
        immediate: ['Give IM adrenaline immediately', 'Give high-flow oxygen', 'Establish IV access'],
        definitive: [],
        monitoring: [],
      },
    });

    expect(suggestedTreatmentIdsForCase(anaphylaxis, anaphylaxis.vitalSignsProgression.initial)).toEqual([
      'adrenaline_im',
      'oxygen_nonrebreather',
      'iv_access',
    ]);
  });

  it('prioritises catastrophic haemorrhage before airway support and later splinting', () => {
    const polytrauma = caseFor({
      title: 'Motorcycle collision with open femur fracture',
      category: 'trauma',
      initialPresentation: { generalImpression: 'Shocked trauma patient', position: 'Supine', appearance: 'Open femur wound with active bleeding', consciousness: 'Unresponsive' },
      abcde: {
        ...caseFor({}).abcde,
        disability: { ...caseFor({}).abcde.disability, gcs: { eye: 1, verbal: 1, motor: 3, total: 5 } },
      },
      vitalSignsProgression: { initial: { bp: '80/50', pulse: 125, respiration: 8, spo2: 85, gcs: 5 } },
      managementPathway: {
        immediate: [
          'Catastrophic haemorrhage first — apply a tourniquet and control major bleeding',
          'High-flow oxygen and BVM if needed',
          'Establish IV access and give a small fluid bolus',
          'Apply a traction splint to the femur fracture',
        ],
        definitive: [],
        monitoring: [],
      },
    });

    expect(recommendedManagementTabForCase(polytrauma)).toBe('circulation');
    expect(suggestedTreatmentIdsForCase(polytrauma, polytrauma.vitalSignsProgression.initial)).toEqual([
      'tourniquet',
      'bleeding_control',
      'oxygen_nonrebreather',
      'bvm_ventilation',
      'iv_access',
      'fluids_250ml',
    ]);
  });
});

describe('bay equipment kit discovery', () => {
  it('maps scene gear hotspots to the jump bag a paramedic would open', () => {
    expect(managementTabForBayEquipment('oxygen')).toBe('breathing');
    expect(managementTabForBayEquipment('breathing-bag')).toBe('breathing');
    expect(managementTabForBayEquipment('airway-bag')).toBe('airway');
    expect(managementTabForBayEquipment('circulation-kit')).toBe('circulation');
    expect(managementTabForBayEquipment('monitor')).toBe('circulation');
    expect(managementTabForBayEquipment('medications')).toBe('medications');
  });

  it('prefills oxygen search when the scene O₂ cylinder is tapped', () => {
    expect(searchHintForBayEquipment('oxygen')).toMatch(/rebreather/i);
    expect(searchHintForBayEquipment('breathing-bag')).toBe('');
  });

  it('opens Breathing as the start-here kit for severe asthma (resp-001 shape)', () => {
    const caseData = {
      id: 'resp-001',
      title: 'Severe Asthma',
      category: 'respiratory',
      subcategory: 'asthma',
      dispatchInfo: { callReason: 'Son cannot breathe, using inhaler repeatedly' },
      vitalSignsProgression: { initial: { pulse: 120, bp: '130/80', spo2: 88, respiration: 32, gcs: 15 } },
      equipmentNeeded: ['oxygen', 'nebuliser'],
      managementPathway: { immediate: ['high-flow oxygen', 'salbutamol nebuliser'] },
    } as any;
    expect(recommendedManagementTabForCase(caseData)).toBe('breathing');
  });
});
