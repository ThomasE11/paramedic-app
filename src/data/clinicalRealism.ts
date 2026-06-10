/**
 * Clinical Realism Engine
 *
 * Provides year-level treatment gating, pathology-aware treatment modifiers,
 * case-specific staged deterioration, treatment quality scoring, and
 * enhanced year-aware/case-aware feedback.
 *
 * This module sits between the case data and the treatment engine to ensure
 * that treatment responses, available options, and feedback all behave the
 * way a real patient and a real clinical educator would expect.
 */

import type { StudentYear, CaseScenario, VitalSigns } from '@/types';

// ============================================================================
// PHASE 1: YEAR-LEVEL TREATMENT GATING
// ============================================================================

/**
 * Defines which treatments are available at each year level.
 * Year 1-2: Foundation — assessment & basic treatment
 * Year 3: Intermediate — IV meds, cardiac monitoring, clinical reasoning
 * Year 4 + Diploma: Advanced — complex pharmacology, advanced procedures
 */
// Diploma = EMT level = equivalent to 1st Year (basic skills only)
export const TREATMENT_YEAR_ACCESS: Record<string, StudentYear[]> = {
  // ----- AIRWAY (Basic — all years) -----
  airway_open:          ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  suction:              ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  opa_insert:           ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  back_blows:           ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  abdominal_thrusts:    ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],

  // ----- AIRWAY (Advanced) -----
  intubation:           ['4th-year'],
  rsi_intubation:       ['4th-year'],
  surgical_cric:        ['4th-year'],
  magill_forceps:       ['4th-year'],

  // ----- BREATHING (O2 devices — all years) -----
  oxygen_nasal:         ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  oxygen_mask:          ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  oxygen_nonrebreather: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],

  // ----- BREATHING (BVM — all years, core CPR skill taught in Year 1) -----
  bvm_ventilation:      ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  nebulizer_salbutamol: ['2nd-year', '3rd-year', '4th-year'],
  nebulizer_ipratropium:['2nd-year', '3rd-year', '4th-year'],
  nebulised_adrenaline: ['2nd-year', '3rd-year', '4th-year'],

  // ----- BREATHING (Year 2+ — chest wound management) -----
  chest_seal_vented:          ['2nd-year', '3rd-year', '4th-year', 'diploma'],
  occlusive_dressing_3sided:  ['2nd-year', '3rd-year', '4th-year', 'diploma'],

  // ----- BREATHING (Year 3+) -----
  needle_decompression: ['3rd-year', '4th-year'],
  cpap_niv:             ['3rd-year', '4th-year'],

  // ----- CIRCULATION (Basic — all years) -----
  bleeding_control:     ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  tourniquet:           ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  cpr:                  ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  defibrillation:       ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  aed:                  ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],

  // ----- CIRCULATION (Year 2+) -----
  iv_access:            ['2nd-year', '3rd-year', '4th-year'],
  fluids_250ml:         ['2nd-year', '3rd-year', '4th-year'],
  fluids_500ml:         ['2nd-year', '3rd-year', '4th-year'],
  fluids_1000ml:        ['2nd-year', '3rd-year', '4th-year'],
  pelvic_binder:        ['diploma', '1st-year', '2nd-year', '3rd-year', '4th-year'],
  io_access:            ['2nd-year', '3rd-year', '4th-year'],

  // ----- MEDICATIONS (Year 1 / Diploma — basic meds) -----
  paracetamol_oral:     ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  ibuprofen_oral:       ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  glucose_10g:          ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  aspirin:              ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  adrenaline_im:        ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],

  // ----- MEDICATIONS (Year 2+ — bridging) -----
  glucagon_1mg:         ['2nd-year', '3rd-year', '4th-year'],
  activated_charcoal:   ['2nd-year', '3rd-year', '4th-year'],
  gtn_spray:            ['2nd-year', '3rd-year', '4th-year'],

  // ----- MEDICATIONS (Year 3+) -----
  morphine_5mg:         ['3rd-year', '4th-year'],
  fentanyl_50mcg:       ['3rd-year', '4th-year'],
  midazolam_5mg:        ['3rd-year', '4th-year'],
  midazolam_buccal:     ['3rd-year', '4th-year'],
  buccal_midazolam:     ['3rd-year', '4th-year'],
  adenosine_6mg:        ['3rd-year', '4th-year'],
  atropine_05mg:        ['3rd-year', '4th-year'],
  amiodarone_300mg:     ['3rd-year', '4th-year'],
  amiodarone_150mg:     ['3rd-year', '4th-year'],
  adrenaline_1mg:       ['3rd-year', '4th-year'],
  hydrocortisone_200mg: ['3rd-year', '4th-year'],
  txa_1g:               ['3rd-year', '4th-year'],
  magnesium_2g:         ['3rd-year', '4th-year'],
  ondansetron_4mg:      ['3rd-year', '4th-year'],
  metoclopramide_10mg:  ['3rd-year', '4th-year'],
  sodium_bicarbonate:   ['3rd-year', '4th-year'],
  calcium_chloride:     ['3rd-year', '4th-year'],
  dextrose_10:          ['3rd-year', '4th-year'],
  naloxone_04mg:        ['3rd-year', '4th-year'],
  salbutamol_iv:        ['3rd-year', '4th-year'],
  intralipid:           ['3rd-year', '4th-year'],

  // ----- MEDICATIONS (Year 4 — critical care) -----
  ketamine_iv:          ['4th-year'],
  suxamethonium:        ['4th-year'],
  rocuronium:           ['4th-year'],
  mannitol_20:          ['4th-year'],
  hypertonic_saline:    ['4th-year'],

  // ----- INFUSIONS (Year 4 only) -----
  adrenaline_infusion:  ['4th-year'],
  noradrenaline_infusion: ['4th-year'],
  dopamine_infusion:    ['4th-year'],
  propofol_infusion:    ['4th-year'],
  midazolam_infusion:   ['4th-year'],
  fentanyl_infusion:    ['4th-year'],

  // ----- DEVICES (Year 4) -----
  lucas_device:         ['4th-year'],

  // ----- POSITIONING (all years) -----
  supine_position:      ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  recovery_position:    ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  fowlers_position:     ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  left_lateral_tilt:    ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  leg_elevation:        ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],

  // ----- COMFORT/OTHER (all years) -----
  warming_blanket:      ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  active_cooling:       ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  splinting:            ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  sam_splint:           ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  box_splint:           ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  vacuum_limb_splint:   ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  air_splint:           ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  reassurance:          ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  calm_environment:     ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  family_presence:      ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],

  // ----- PEDIATRIC MEDICATIONS -----
  rectal_diazepam:      ['2nd-year', '3rd-year', '4th-year'],
  diazepam_rectal:      ['2nd-year', '3rd-year', '4th-year'],
  paracetamol_iv:       ['3rd-year', '4th-year'],

  // ----- ADDITIONAL MEDICATIONS -----
  adenosine_12mg:       ['3rd-year', '4th-year'],
  diltiazem_20mg:       ['4th-year'],
  metoprolol_5mg:       ['4th-year'],
  flumazenil_02mg:      ['3rd-year', '4th-year'],
  labetalol_20mg:       ['4th-year'],
  lorazepam_4mg:        ['3rd-year', '4th-year'],
  sugammadex:           ['4th-year'],
  adrenaline_im_child:  ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  adrenaline_im_infant: ['2nd-year', '3rd-year', '4th-year', 'diploma'],
  adrenaline_im_older:  ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  dextrose_10_250ml:    ['2nd-year', '3rd-year', '4th-year'],

  // ----- IMMOBILISATION DEVICES -----
  cervical_collar:      ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  head_blocks:          ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  spinal_board:         ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  scoop_stretcher:      ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  vacuum_mattress:      ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  ked:                  ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  traction_splint:      ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],

  // ----- POST-RSI & VENTILATOR MANAGEMENT (4th Year Critical Care) -----
  ett_confirmation:     ['3rd-year', '4th-year'],
  ventilator_setup:     ['4th-year'],
  post_rsi_sedation:    ['4th-year'],
  post_rsi_paralysis:   ['4th-year'],
  post_rosc_bundle:     ['3rd-year', '4th-year'],
  targeted_temp_mgmt:   ['4th-year'],
  vasopressor_norad:    ['4th-year'],
  orogastric_tube:      ['3rd-year', '4th-year'],

  // ----- KETAMINE VARIANTS & SEDATION -----
  ketamine_analgesic:   ['3rd-year', '4th-year'],
  ketamine_sedation:    ['4th-year'],
  droperidol_5mg:       ['3rd-year', '4th-year'],

  // ----- MENTAL HEALTH INTERVENTIONS -----
  verbal_deescalation:  ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  therapeutic_rapport:  ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  suicide_risk_assessment: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  mental_health_act:    ['2nd-year', '3rd-year', '4th-year'],

  // ----- NAME ALIASES -----
  chlorphenamine_10mg:  ['3rd-year', '4th-year'],
  clopidogrel_300mg:    ['3rd-year', '4th-year'],
  enoxaparin_1mg:       ['3rd-year', '4th-year'],
  // ----- ADVANCED / ANTIDOTE drugs (added 2026-06-10) -----
  insulin_actrapid:      ['3rd-year', '4th-year'],
  antibiotics_iv:        ['3rd-year', '4th-year'],
  dexamethasone:         ['2nd-year', '3rd-year', '4th-year'],
  acetylcysteine:        ['4th-year'],
  pralidoxime:           ['4th-year'],
  pacing_transcutaneous: ['3rd-year', '4th-year'],
  calcium_gluconate:     ['3rd-year', '4th-year'],
  furosemide_40mg:       ['3rd-year', '4th-year'],
  pericardiocentesis:    ['4th-year'],
};

/**
 * Check if a treatment is available for a given year level
 */
export function isTreatmentAvailableForYear(treatmentId: string, year: StudentYear): boolean {
  const allowed = TREATMENT_YEAR_ACCESS[treatmentId];
  if (!allowed) return true; // Unknown treatments are available to all (future-proof)
  return allowed.includes(year);
}

/**
 * Filter an array of treatments to only those available for a year level
 */
export function filterTreatmentsForYear<T extends { id: string }>(
  treatments: T[],
  year: StudentYear,
): T[] {
  return treatments.filter(t => isTreatmentAvailableForYear(t.id, year));
}


// ============================================================================
// PHASE 2: PATHOLOGY-AWARE TREATMENT RESPONSE MODIFIERS
// ============================================================================

/**
 * Per-case modifiers that scale how effective treatments are based on
 * the underlying pathology and whether prerequisite treatments have been applied.
 *
 * For example: giving oxygen to a tension pneumothorax patient has minimal effect
 * until the chest is decompressed. Giving fluids to a hemorrhaging patient only
 * transiently improves BP if bleeding isn't controlled.
 */
export interface PathologyModifier {
  /** Treatment ID this modifier applies to */
  treatmentId: string;
  /** Effectiveness multiplier (0.0 = no effect, 1.0 = full, >1.0 = enhanced) */
  effectivenessMultiplier: number;
  /** If these treatments have been applied first, use this multiplier instead */
  prerequisiteTreatments?: {
    treatmentIds: string[];
    multiplierWithPrereqs: number;
  };
  /** Maximum SpO2 achievable with this treatment for this condition */
  spo2Ceiling?: number;
  /** Clinical explanation for why this modifier exists */
  rationale: string;
}

/**
 * Maps case subcategory/category to pathology modifiers.
 * The dynamic treatment engine uses these to adjust effect magnitude.
 */
export const PATHOLOGY_MODIFIERS: Record<string, PathologyModifier[]> = {
  // --- TENSION PNEUMOTHORAX ---
  'pneumothorax-tension': [
    {
      treatmentId: 'oxygen_nasal',
      effectivenessMultiplier: 0.15,
      prerequisiteTreatments: {
        treatmentIds: ['needle_decompression'],
        multiplierWithPrereqs: 1.0,
      },
      spo2Ceiling: 88,
      rationale: 'Oxygen cannot reach alveoli in a collapsed lung. Decompression must come first.',
    },
    {
      treatmentId: 'oxygen_mask',
      effectivenessMultiplier: 0.15,
      prerequisiteTreatments: {
        treatmentIds: ['needle_decompression'],
        multiplierWithPrereqs: 1.0,
      },
      spo2Ceiling: 88,
      rationale: 'Oxygen cannot reach alveoli in a collapsed lung.',
    },
    {
      treatmentId: 'oxygen_nonrebreather',
      effectivenessMultiplier: 0.2,
      prerequisiteTreatments: {
        treatmentIds: ['needle_decompression'],
        multiplierWithPrereqs: 1.0,
      },
      spo2Ceiling: 90,
      rationale: 'High-flow O2 provides marginal benefit without chest decompression.',
    },
    {
      treatmentId: 'fluids_250ml',
      effectivenessMultiplier: 0.3,
      prerequisiteTreatments: {
        treatmentIds: ['needle_decompression'],
        multiplierWithPrereqs: 0.9,
      },
      rationale: 'Obstructive shock from tension PTX — fluids alone cannot overcome mediastinal compression.',
    },
    {
      treatmentId: 'fluids_500ml',
      effectivenessMultiplier: 0.3,
      prerequisiteTreatments: {
        treatmentIds: ['needle_decompression'],
        multiplierWithPrereqs: 0.9,
      },
      rationale: 'Obstructive shock — decompress first, then fluid resuscitate.',
    },
  ],

  // --- HEMORRHAGIC SHOCK (massive hemorrhage, pelvic fracture, polytrauma) ---
  'massive-hemorrhage': [
    {
      treatmentId: 'fluids_250ml',
      effectivenessMultiplier: 0.4,
      prerequisiteTreatments: {
        treatmentIds: ['bleeding_control', 'tourniquet'],
        multiplierWithPrereqs: 0.8,
      },
      rationale: 'Fluid without hemorrhage control is filling a leaking bucket. Transient BP rise then continued drop.',
    },
    {
      treatmentId: 'fluids_500ml',
      effectivenessMultiplier: 0.4,
      prerequisiteTreatments: {
        treatmentIds: ['bleeding_control', 'tourniquet'],
        multiplierWithPrereqs: 0.85,
      },
      rationale: 'Large volume resuscitation without source control dilutes clotting factors and worsens hemorrhage.',
    },
    {
      treatmentId: 'fluids_1000ml',
      effectivenessMultiplier: 0.35,
      prerequisiteTreatments: {
        treatmentIds: ['bleeding_control', 'tourniquet'],
        multiplierWithPrereqs: 0.8,
      },
      rationale: 'Aggressive crystalloid without hemorrhage control risks dilutional coagulopathy and popping the clot.',
    },
  ],

  // --- ACUTE STEMI ---
  'stem-anterior': [
    {
      treatmentId: 'oxygen_nonrebreather',
      effectivenessMultiplier: 0.6,
      spo2Ceiling: 98,
      rationale: 'Hyperoxia in AMI may increase infarct size via coronary vasoconstriction and ROS generation. Titrate to 94-98%.',
    },
    {
      treatmentId: 'oxygen_mask',
      effectivenessMultiplier: 0.8,
      spo2Ceiling: 98,
      rationale: 'Moderate-flow O2 appropriate if SpO2 < 94%. Monitor for overcorrection.',
    },
    {
      treatmentId: 'oxygen_nasal',
      effectivenessMultiplier: 1.0,
      spo2Ceiling: 98,
      rationale: 'Low-flow nasal cannula is appropriate for mild hypoxia in AMI. Titrate to 94-98%.',
    },
    {
      treatmentId: 'fluids_1000ml',
      effectivenessMultiplier: 0.5,
      rationale: 'Large-volume fluid bolus in cardiogenic shock risks pulmonary edema. Use cautious 250ml boluses.',
    },
    {
      treatmentId: 'gtn_spray',
      effectivenessMultiplier: 0.0,
      rationale: 'GTN is CONTRAINDICATED in hypotensive STEMI. Risk of further BP drop and cardiogenic collapse.',
    },
  ],
  'stem-inferior': [
    {
      treatmentId: 'oxygen_nonrebreather',
      effectivenessMultiplier: 0.6,
      spo2Ceiling: 98,
      rationale: 'Hyperoxia in AMI increases oxidative stress. Target SpO2 94-98%.',
    },
    {
      treatmentId: 'oxygen_nasal',
      effectivenessMultiplier: 1.0,
      spo2Ceiling: 98,
      rationale: 'Low-flow nasal cannula appropriate for mild hypoxia. Titrate to 94-98%.',
    },
    {
      treatmentId: 'gtn_spray',
      effectivenessMultiplier: 0.3,
      rationale: 'GTN in inferior STEMI may cause severe hypotension due to RV involvement and preload dependence.',
    },
    {
      treatmentId: 'fluids_250ml',
      effectivenessMultiplier: 1.2,
      rationale: 'RV infarction is preload-dependent. Cautious fluid bolus can significantly improve haemodynamics.',
    },
    {
      treatmentId: 'morphine_5mg',
      effectivenessMultiplier: 0.6,
      rationale: 'Morphine causes vasodilation and further hypotension in preload-dependent states. Use with extreme caution.',
    },
  ],

  // --- COPD EXACERBATION ---
  'copd': [
    {
      treatmentId: 'oxygen_nonrebreather',
      effectivenessMultiplier: 0.5,
      spo2Ceiling: 92,
      rationale: 'High-flow O2 in COPD risks abolishing hypoxic drive, causing CO2 retention and narcosis. Target 88-92%.',
    },
    {
      treatmentId: 'oxygen_mask',
      effectivenessMultiplier: 0.6,
      spo2Ceiling: 92,
      rationale: 'Medium-flow O2 may exceed target SpO2 in COPD. Monitor closely. Use controlled O2 delivery.',
    },
    {
      treatmentId: 'oxygen_nasal',
      effectivenessMultiplier: 1.0,
      spo2Ceiling: 92,
      rationale: 'Low-flow nasal cannula is first-line for COPD. Titrate to 88-92% — avoid overcorrection.',
    },
  ],

  // --- SEVERE ASTHMA ---
  'asthma': [
    {
      treatmentId: 'oxygen_nonrebreather',
      effectivenessMultiplier: 0.7,
      prerequisiteTreatments: {
        treatmentIds: ['nebulizer_salbutamol'],
        multiplierWithPrereqs: 1.0,
      },
      rationale: 'O2 alone cannot fix bronchospasm. Bronchodilation + oxygen together provides optimal improvement.',
    },
    {
      treatmentId: 'nebulizer_salbutamol',
      effectivenessMultiplier: 1.3,
      rationale: 'Beta-2 agonist is the cornerstone of acute asthma management. High effectiveness.',
    },
    {
      treatmentId: 'nebulizer_ipratropium',
      effectivenessMultiplier: 1.2,
      prerequisiteTreatments: {
        treatmentIds: ['nebulizer_salbutamol'],
        multiplierWithPrereqs: 1.5,
      },
      rationale: 'Ipratropium adds synergistic bronchodilation when combined with salbutamol in severe asthma.',
    },
  ],

  // --- ANAPHYLAXIS ---
  'anaphylaxis': [
    {
      treatmentId: 'adrenaline_1mg',
      effectivenessMultiplier: 2.0,
      rationale: 'IM adrenaline is the single most important treatment. Dramatically reverses bronchospasm and vasodilation.',
    },
    {
      treatmentId: 'adrenaline_im',
      effectivenessMultiplier: 2.0,
      rationale: 'IM adrenaline 0.5mg (1:1000) is first-line. Life-saving intervention.',
    },
    {
      treatmentId: 'nebulizer_salbutamol',
      effectivenessMultiplier: 0.5,
      prerequisiteTreatments: {
        treatmentIds: ['adrenaline_1mg', 'adrenaline_im'],
        multiplierWithPrereqs: 1.0,
      },
      rationale: 'Nebulized salbutamol treats residual bronchospasm but does NOT address systemic anaphylaxis. Adrenaline first.',
    },
    {
      treatmentId: 'fluids_500ml',
      effectivenessMultiplier: 0.6,
      prerequisiteTreatments: {
        treatmentIds: ['adrenaline_1mg', 'adrenaline_im'],
        multiplierWithPrereqs: 1.0,
      },
      rationale: 'Fluids treat distributive shock but do not reverse the underlying mast cell degranulation. Adrenaline first.',
    },
  ],

  // --- PULMONARY EMBOLISM ---
  'pulmonary-embolism': [
    {
      treatmentId: 'oxygen_nonrebreather',
      effectivenessMultiplier: 0.4,
      spo2Ceiling: 92,
      rationale: 'O2 has limited effect when perfusion to ventilated alveoli is blocked by thrombus. Dead space ventilation.',
    },
    {
      treatmentId: 'oxygen_nasal',
      effectivenessMultiplier: 0.3,
      spo2Ceiling: 90,
      rationale: 'Low-flow O2 unlikely to correct significant V/Q mismatch from PE.',
    },
    {
      treatmentId: 'fluids_500ml',
      effectivenessMultiplier: 0.5,
      rationale: 'Cautious fluids may improve RV preload but excessive volume worsens RV dilation.',
    },
    {
      treatmentId: 'fluids_1000ml',
      effectivenessMultiplier: 0.3,
      rationale: 'Large-volume resuscitation in massive PE risks RV overdistension and cardiovascular collapse.',
    },
  ],

  // --- HEAD INJURY (TBI) ---
  'traumatic-brain-injury': [
    {
      treatmentId: 'oxygen_nonrebreather',
      effectivenessMultiplier: 1.2,
      rationale: 'Avoid secondary brain injury from hypoxia. Target SpO2 > 94%. High-flow O2 appropriate.',
    },
    {
      treatmentId: 'fluids_1000ml',
      effectivenessMultiplier: 0.5,
      rationale: 'Avoid excessive fluid in TBI — risk of cerebral edema. Target SBP > 90mmHg, not normotension.',
    },
    {
      treatmentId: 'morphine_5mg',
      effectivenessMultiplier: 0.4,
      rationale: 'Opioids depress consciousness and respiration. Difficult to monitor neurological status. Use with extreme caution.',
    },
    {
      treatmentId: 'midazolam_5mg',
      effectivenessMultiplier: 0.3,
      rationale: 'Benzodiazepines obscure GCS assessment. Only use if actively seizing.',
    },
  ],

  // --- CARDIOGENIC SHOCK / HEART FAILURE ---
  'heart-failure': [
    {
      treatmentId: 'fluids_250ml',
      effectivenessMultiplier: 0.2,
      rationale: 'Fluids in heart failure worsen pulmonary congestion. Volume is the problem, not the solution.',
    },
    {
      treatmentId: 'fluids_500ml',
      effectivenessMultiplier: 0.1,
      rationale: 'CONTRAINDICATED: Fluid loading in acute heart failure causes flash pulmonary edema.',
    },
    {
      treatmentId: 'fluids_1000ml',
      effectivenessMultiplier: 0.05,
      rationale: 'DANGEROUS: Large-volume resuscitation in heart failure causes respiratory failure.',
    },
    {
      treatmentId: 'gtn_spray',
      effectivenessMultiplier: 1.5,
      rationale: 'GTN reduces preload and afterload — first-line for acute cardiogenic pulmonary edema if SBP > 90.',
    },
  ],

  // --- OPIOID OVERDOSE ---
  'overdose': [
    {
      treatmentId: 'naloxone_04mg',
      effectivenessMultiplier: 2.0,
      rationale: 'Naloxone is the specific antidote. Titrate to respiratory effort, NOT full consciousness.',
    },
    {
      treatmentId: 'bvm_ventilation',
      effectivenessMultiplier: 1.5,
      rationale: 'BVM ventilation is critical if RR < 8. Supports oxygenation while naloxone takes effect.',
    },
  ],

  // --- HYPOGLYCEMIA ---
  'hypoglycemia': [
    {
      treatmentId: 'glucose_10g',
      effectivenessMultiplier: 1.5,
      rationale: 'Oral glucose is first-line for conscious, cooperative patients. Fast-acting, readily available.',
    },
    {
      treatmentId: 'glucagon_1mg',
      effectivenessMultiplier: 1.3,
      rationale: 'Glucagon is effective IM alternative when IV unavailable or patient unconscious.',
    },
    {
      treatmentId: 'dextrose_10',
      effectivenessMultiplier: 1.8,
      rationale: 'IV dextrose provides fastest glucose correction. D10% preferred for controlled correction.',
    },
  ],

  // --- STROKE ---
  'stroke': [
    {
      treatmentId: 'oxygen_nonrebreather',
      effectivenessMultiplier: 0.8,
      spo2Ceiling: 98,
      rationale: 'Avoid hyperoxia in stroke — target SpO2 94-98%. Evidence suggests high-flow O2 may worsen ischemic injury.',
    },
    {
      treatmentId: 'fluids_1000ml',
      effectivenessMultiplier: 0.4,
      rationale: 'Avoid excessive fluid — risk of cerebral edema. Maintain euvolemia only.',
    },
    {
      treatmentId: 'gtn_spray',
      effectivenessMultiplier: 0.0,
      rationale: 'GTN is generally AVOIDED in acute stroke — rapid BP lowering can worsen ischemic penumbra. Permissive hypertension unless SBP > 220.',
    },
    {
      treatmentId: 'morphine_5mg',
      effectivenessMultiplier: 0.3,
      rationale: 'Opioids obscure neurological assessment and depress consciousness. Avoid unless compelling need.',
    },
  ],

  // --- SPINAL INJURY (neurogenic shock) ---
  'spinal-injury': [
    {
      treatmentId: 'fluids_500ml',
      effectivenessMultiplier: 0.7,
      rationale: 'Fluids can partially treat neurogenic hypotension but vasopressors may be needed. Volume alone rarely corrects neurogenic shock.',
    },
    {
      treatmentId: 'fluids_1000ml',
      effectivenessMultiplier: 0.5,
      rationale: 'Excessive fluid in neurogenic shock risks pulmonary edema without fixing the vasodilation. Cautious volume + vasopressors.',
    },
    {
      treatmentId: 'morphine_5mg',
      effectivenessMultiplier: 0.4,
      rationale: 'Opioids worsen hypotension in neurogenic shock and impair neurological assessment.',
    },
  ],

  // --- ELECTROLYTE EMERGENCY (hyperkalemia) ---
  'electrolyte': [
    {
      treatmentId: 'calcium_chloride',
      effectivenessMultiplier: 2.0,
      rationale: 'Calcium chloride is the first-line cardiac membrane stabilizer in hyperkalemia. Immediate cardioprotection.',
    },
    {
      treatmentId: 'nebulizer_salbutamol',
      effectivenessMultiplier: 1.3,
      rationale: 'Salbutamol drives potassium intracellularly. Effective adjunct to calcium in hyperkalemia.',
    },
  ],

  // --- HYPOTHERMIA ---
  'hypothermia': [
    {
      treatmentId: 'fluids_500ml',
      effectivenessMultiplier: 0.6,
      rationale: 'Cold fluids worsen hypothermia. Only use warmed IV fluids (38-42°C). Standard room-temperature crystalloid has limited benefit.',
    },
    {
      treatmentId: 'adrenaline_1mg',
      effectivenessMultiplier: 0.3,
      rationale: 'Adrenaline is less effective in severe hypothermia (< 30°C). Drug metabolism is impaired. Consider withholding until rewarmed.',
    },
  ],

  // --- CARDIAC ARREST ---
  'cardiac-arrest': [
    {
      treatmentId: 'adrenaline_1mg',
      effectivenessMultiplier: 1.0,
      prerequisiteTreatments: {
        treatmentIds: ['cpr'],
        multiplierWithPrereqs: 1.5,
      },
      rationale: 'Adrenaline improves coronary perfusion pressure during CPR. CPR must be ongoing for drug delivery.',
    },
    {
      treatmentId: 'amiodarone_300mg',
      effectivenessMultiplier: 1.0,
      prerequisiteTreatments: {
        treatmentIds: ['defibrillation'],
        multiplierWithPrereqs: 1.3,
      },
      rationale: 'Amiodarone is given after 3rd shock in shockable arrest. No role without defibrillation attempts.',
    },
  ],

  // --- NSTEMI ---
  'nstemi': [
    {
      treatmentId: 'oxygen_nonrebreather',
      effectivenessMultiplier: 0.7,
      spo2Ceiling: 98,
      rationale: 'Avoid hyperoxia in ACS — titrate to 94-98%. NSTEMI less acutely unstable but same O2 principles apply.',
    },
    {
      treatmentId: 'oxygen_nasal',
      effectivenessMultiplier: 1.0,
      spo2Ceiling: 98,
      rationale: 'Low-flow nasal cannula appropriate for mild hypoxia in NSTEMI. Target SpO2 94-98%.',
    },
    {
      treatmentId: 'gtn_spray',
      effectivenessMultiplier: 1.2,
      rationale: 'GTN is appropriate in NSTEMI if SBP > 90mmHg. Reduces preload, improves myocardial oxygen supply-demand.',
    },
    {
      treatmentId: 'morphine_5mg',
      effectivenessMultiplier: 0.8,
      rationale: 'Morphine for refractory chest pain but evidence suggests potential harm — use cautiously and only if GTN fails.',
    },
  ],

  // --- ATRIAL FIBRILLATION (rapid ventricular response) ---
  'afib': [
    {
      treatmentId: 'oxygen_nonrebreather',
      effectivenessMultiplier: 0.5,
      spo2Ceiling: 98,
      rationale: 'High-flow O2 rarely needed in AF unless concurrent cardiac failure. Target SpO2 94-98%.',
    },
    {
      treatmentId: 'fluids_500ml',
      effectivenessMultiplier: 0.6,
      rationale: 'Cautious fluids may be appropriate if dehydration triggered the AF, but excess volume risks pulmonary edema in compromised LV.',
    },
    {
      treatmentId: 'fluids_1000ml',
      effectivenessMultiplier: 0.3,
      rationale: 'Large-volume resuscitation in AF with RVR risks fluid overload and worsening heart failure.',
    },
    {
      treatmentId: 'amiodarone_300mg',
      effectivenessMultiplier: 1.3,
      rationale: 'Amiodarone is effective for rate/rhythm control in hemodynamically unstable AF. IV loading over 20-60 minutes.',
    },
  ],

  // --- CHEST TRAUMA (flail chest, hemothorax, cardiac tamponade) ---
  'chest-trauma': [
    {
      treatmentId: 'oxygen_nonrebreather',
      effectivenessMultiplier: 0.8,
      spo2Ceiling: 96,
      rationale: 'High-flow O2 beneficial but limited by mechanical ventilation impairment (flail, pain). Splinting and analgesia improve oxygenation.',
    },
    {
      treatmentId: 'fluids_500ml',
      effectivenessMultiplier: 0.7,
      prerequisiteTreatments: {
        treatmentIds: ['bleeding_control'],
        multiplierWithPrereqs: 1.0,
      },
      rationale: 'Cautious fluid for hemorrhagic shock from hemothorax. Excessive volume without hemorrhage control worsens bleeding.',
    },
    {
      treatmentId: 'fluids_1000ml',
      effectivenessMultiplier: 0.4,
      rationale: 'Large-volume resuscitation risks re-bleeding in chest trauma. Permissive hypotension (SBP 80-90) until surgical control.',
    },
    {
      treatmentId: 'needle_decompression',
      effectivenessMultiplier: 1.8,
      rationale: 'Critical intervention for tension pneumothorax component. Immediate life-saving if tension physiology present.',
    },
    {
      treatmentId: 'morphine_5mg',
      effectivenessMultiplier: 1.0,
      rationale: 'Adequate analgesia in chest trauma improves ventilation by allowing deeper breathing. Pain splinting worsens hypoxia.',
    },
  ],

  // --- ABDOMINAL TRAUMA ---
  'abdominal-trauma': [
    {
      treatmentId: 'fluids_250ml',
      effectivenessMultiplier: 0.5,
      prerequisiteTreatments: {
        treatmentIds: ['bleeding_control'],
        multiplierWithPrereqs: 0.8,
      },
      rationale: 'Intra-abdominal hemorrhage is not externally controllable. Cautious fluids — permissive hypotension (SBP 80-90) until surgery.',
    },
    {
      treatmentId: 'fluids_500ml',
      effectivenessMultiplier: 0.4,
      rationale: 'Moderate fluid resuscitation provides transient hemodynamic support. Risk of dilutional coagulopathy.',
    },
    {
      treatmentId: 'fluids_1000ml',
      effectivenessMultiplier: 0.3,
      rationale: 'Aggressive crystalloid in abdominal trauma worsens coagulopathy and re-bleeding. Rapid surgical transfer is the definitive treatment.',
    },
    {
      treatmentId: 'morphine_5mg',
      effectivenessMultiplier: 0.7,
      rationale: 'Analgesia is appropriate but opioids can mask abdominal signs. Document exam findings BEFORE administering.',
    },
  ],

  // --- HYPERTENSIVE EMERGENCY ---
  'hypertensive-emergency': [
    {
      treatmentId: 'gtn_spray',
      effectivenessMultiplier: 1.4,
      rationale: 'GTN provides controlled BP reduction. Target 20-25% reduction in first hour. Avoid precipitous drops.',
    },
    {
      treatmentId: 'fluids_250ml',
      effectivenessMultiplier: 0.3,
      rationale: 'Volume loading is inappropriate in hypertensive emergency — increases afterload and worsens end-organ damage.',
    },
    {
      treatmentId: 'fluids_500ml',
      effectivenessMultiplier: 0.2,
      rationale: 'Fluids are CONTRAINDICATED unless concurrent hypovolemia. Increases cardiac workload.',
    },
    {
      treatmentId: 'morphine_5mg',
      effectivenessMultiplier: 0.6,
      rationale: 'Morphine may help with anxiety-driven hypertension but respiratory depression risk. Not first-line.',
    },
  ],

  // --- SEIZURE / STATUS EPILEPTICUS ---
  'seizure': [
    {
      treatmentId: 'midazolam_5mg',
      effectivenessMultiplier: 1.8,
      rationale: 'IM/buccal midazolam is first-line for prolonged seizures. Rapid onset anticonvulsant.',
    },
    {
      treatmentId: 'oxygen_nonrebreather',
      effectivenessMultiplier: 0.8,
      rationale: 'High-flow O2 beneficial during post-ictal period. Difficult to apply during active seizure — use NRB once seizure terminates.',
    },
    {
      treatmentId: 'glucose_10g',
      effectivenessMultiplier: 0.5,
      rationale: 'Oral glucose only if hypoglycemia confirmed AND patient conscious with intact gag reflex. Check BGL first.',
    },
    {
      treatmentId: 'dextrose_10',
      effectivenessMultiplier: 1.5,
      rationale: 'IV dextrose is critical if seizure caused by hypoglycemia. Must check blood glucose to guide treatment.',
    },
  ],

  // --- PELVIC FRACTURE ---
  'pelvic-fracture': [
    {
      treatmentId: 'fluids_250ml',
      effectivenessMultiplier: 0.5,
      prerequisiteTreatments: {
        treatmentIds: ['bleeding_control'],
        multiplierWithPrereqs: 0.8,
      },
      rationale: 'Retroperitoneal hemorrhage is not externally controllable. Pelvic binder + permissive hypotension (SBP 80-90). Small boluses only.',
    },
    {
      treatmentId: 'fluids_500ml',
      effectivenessMultiplier: 0.4,
      prerequisiteTreatments: {
        treatmentIds: ['bleeding_control'],
        multiplierWithPrereqs: 0.75,
      },
      rationale: 'Moderate fluid risks diluting clotting factors. Pelvic fractures can lose 2-4 units into retroperitoneum.',
    },
    {
      treatmentId: 'fluids_1000ml',
      effectivenessMultiplier: 0.3,
      rationale: 'Aggressive crystalloid in pelvic hemorrhage worsens coagulopathy. Risk of "popping the clot" and re-bleeding.',
    },
    {
      treatmentId: 'fentanyl_50mcg',
      effectivenessMultiplier: 1.0,
      rationale: 'Fentanyl is appropriate for pelvic fracture pain. Shorter acting and less histamine release than morphine.',
    },
  ],

  // --- SVT / SUPRAVENTRICULAR TACHYCARDIA ---
  'svt': [
    {
      treatmentId: 'adenosine_6mg',
      effectivenessMultiplier: 1.8,
      rationale: 'Adenosine is first-line pharmacological treatment for stable SVT. Rapid IV push with flush. Warn patient of transient chest tightness.',
    },
    {
      treatmentId: 'fluids_500ml',
      effectivenessMultiplier: 0.4,
      rationale: 'Fluids do not treat SVT. The problem is a re-entrant circuit, not volume depletion. May worsen heart failure if LV compromised.',
    },
    {
      treatmentId: 'amiodarone_300mg',
      effectivenessMultiplier: 1.0,
      prerequisiteTreatments: {
        treatmentIds: ['adenosine_6mg'],
        multiplierWithPrereqs: 1.3,
      },
      rationale: 'Amiodarone is second-line for refractory SVT after adenosine failure. Consider synchronized cardioversion if hemodynamically unstable.',
    },
  ],

  // --- MULTI-TRAUMA / POLYTRAUMA ---
  'multi-trauma': [
    {
      treatmentId: 'oxygen_nonrebreather',
      effectivenessMultiplier: 1.0,
      rationale: 'High-flow O2 is standard in polytrauma. Multiple injury sites increase oxygen demand.',
    },
    {
      treatmentId: 'fluids_500ml',
      effectivenessMultiplier: 0.6,
      prerequisiteTreatments: {
        treatmentIds: ['bleeding_control', 'tourniquet'],
        multiplierWithPrereqs: 0.9,
      },
      rationale: 'Cautious fluid resuscitation with hemorrhage control. Permissive hypotension SBP 80-90 in penetrating trauma.',
    },
    {
      treatmentId: 'fluids_1000ml',
      effectivenessMultiplier: 0.4,
      prerequisiteTreatments: {
        treatmentIds: ['bleeding_control', 'tourniquet'],
        multiplierWithPrereqs: 0.7,
      },
      rationale: 'Aggressive crystalloid without hemorrhage control dilutes clotting factors. Use only with active bleeding control.',
    },
    {
      treatmentId: 'morphine_5mg',
      effectivenessMultiplier: 0.6,
      rationale: 'Analgesia important but opioids risk respiratory depression and hypotension in shocked patients. Titrate carefully.',
    },
    {
      treatmentId: 'fentanyl_50mcg',
      effectivenessMultiplier: 0.8,
      rationale: 'Fentanyl preferred over morphine in trauma — shorter acting, less histamine release, less hemodynamic impact.',
    },
  ],
};

/**
 * Maps case subcategory values to their canonical PATHOLOGY_MODIFIERS / DETERIORATION key.
 * This resolves the mismatch between case file subcategories (e.g. 'head-injury')
 * and the clinicalRealism keys (e.g. 'traumatic-brain-injury').
 */
const SUBCATEGORY_ALIAS: Record<string, string> = {
  'head-injury':              'traumatic-brain-injury',
  'vfib':                     'cardiac-arrest',
  'acute-coronary-syndrome':  'stem-anterior',
  'cerebrovascular-emergency':'stroke',
  'electrolyte-emergency':    'electrolyte',
  'aflutter':                 'afib',        // atrial flutter — similar rate-control management
  'extremity-trauma':         'multi-trauma',
  'heat-exhaustion':          'heat-stroke',
  'post-surgical':            'sepsis',
  'junctional':               'bradycardia',
  'acute-psychosis':          'psychosis',
  'panic-attack':             'panic',
  'hyperventilation-syndrome':'panic',
  'febrile-seizure':          'seizure',
};

/** Resolve a subcategory to its canonical key for modifier/timeline lookup */
function resolveSubcategory(subcategory: string): string {
  return SUBCATEGORY_ALIAS[subcategory] || subcategory;
}

/**
 * Get pathology modifiers for a specific case
 */
export function getPathologyModifiers(caseData: CaseScenario): PathologyModifier[] {
  const subcategory = (caseData.subcategory || '').toLowerCase();
  const category = caseData.category.toLowerCase();
  const resolved = resolveSubcategory(subcategory);

  // Check resolved subcategory first (most specific), then raw subcategory, then category
  if (resolved && PATHOLOGY_MODIFIERS[resolved]) {
    return PATHOLOGY_MODIFIERS[resolved];
  }
  if (subcategory && PATHOLOGY_MODIFIERS[subcategory]) {
    return PATHOLOGY_MODIFIERS[subcategory];
  }
  if (PATHOLOGY_MODIFIERS[category]) {
    return PATHOLOGY_MODIFIERS[category];
  }
  return [];
}

/**
 * Get the effective multiplier for a specific treatment in a specific case,
 * considering which prerequisite treatments have already been applied.
 */
export function getTreatmentEffectivenessMultiplier(
  treatmentId: string,
  caseData: CaseScenario,
  appliedTreatmentIds: string[],
): { multiplier: number; spo2Ceiling?: number; rationale?: string } {
  const modifiers = getPathologyModifiers(caseData);
  const modifier = modifiers.find(m => m.treatmentId === treatmentId);

  if (!modifier) {
    return { multiplier: 1.0 }; // No modifier — full standard effect
  }

  // Check if prerequisite treatments have been applied
  if (modifier.prerequisiteTreatments) {
    const prereqsMet = modifier.prerequisiteTreatments.treatmentIds.some(
      prereqId => appliedTreatmentIds.includes(prereqId),
    );
    if (prereqsMet) {
      return {
        multiplier: modifier.prerequisiteTreatments.multiplierWithPrereqs,
        spo2Ceiling: modifier.spo2Ceiling,
        rationale: modifier.rationale,
      };
    }
  }

  return {
    multiplier: modifier.effectivenessMultiplier,
    spo2Ceiling: modifier.spo2Ceiling,
    rationale: modifier.rationale,
  };
}


// ============================================================================
// PHASE 3: CASE-SPECIFIC STAGED DETERIORATION
// ============================================================================

export interface DeteriorationStage {
  /** Minutes into the case when this stage triggers (if untreated) */
  triggerMinutes: number;
  /** Vital sign changes at this stage */
  vitalChanges: Partial<VitalSigns> & { bpSystolicDelta?: number; bpDiastolicDelta?: number };
  /** Clinical signs/description at this stage */
  clinicalSigns: string;
  /** ECG rhythm at this stage (if changed) */
  rhythm?: string;
  /** Is this a critical/arrest event? */
  isCritical?: boolean;
}

/**
 * Case-specific deterioration timelines.
 * Each array describes staged deterioration if the patient is NOT treated.
 */
export const CASE_DETERIORATION_TIMELINES: Record<string, DeteriorationStage[]> = {
  'stem-anterior': [
    {
      triggerMinutes: 3,
      vitalChanges: { pulse: 120, spo2: 92, bpSystolicDelta: -5 },
      clinicalSigns: 'Increasing diaphoresis, worsening chest pain, patient becoming more anxious',
    },
    {
      triggerMinutes: 7,
      vitalChanges: { pulse: 135, spo2: 89, bpSystolicDelta: -15 },
      clinicalSigns: 'PVCs on monitor, BP dropping, skin cool and mottled, pain 9/10',
      rhythm: 'Normal Sinus Rhythm',
    },
    {
      triggerMinutes: 12,
      vitalChanges: { pulse: 150, spo2: 85, bpSystolicDelta: -25, respiration: 30 },
      clinicalSigns: 'Runs of VT on monitor, cardiogenic shock developing, crackles in lung bases',
      rhythm: 'Ventricular Tachycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 18,
      vitalChanges: { pulse: 0, spo2: 60, bpSystolicDelta: -90 },
      clinicalSigns: 'VF arrest! No pulse. Begin CPR immediately.',
      rhythm: 'Ventricular Fibrillation',
      isCritical: true,
    },
  ],


  'asthma': [
    {
      triggerMinutes: 3,
      vitalChanges: { respiration: 36, spo2: 84, pulse: 130 },
      clinicalSigns: 'Accessory muscle use, intercostal recession, audible wheeze, tripod positioning',
    },
    {
      triggerMinutes: 8,
      vitalChanges: { respiration: 40, spo2: 78, pulse: 140, bpSystolicDelta: -10 },
      clinicalSigns: 'Silent chest developing — OMINOUS sign. Air entry minimal. Unable to speak.',
      isCritical: true,
    },
    {
      triggerMinutes: 13,
      vitalChanges: { respiration: 12, spo2: 65, pulse: 50, bpSystolicDelta: -30 },
      clinicalSigns: 'EXHAUSTION — respiratory rate paradoxically dropping. Bradycardia. Peri-arrest.',
      rhythm: 'Sinus Bradycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 16,
      vitalChanges: { respiration: 4, spo2: 40, pulse: 0 },
      clinicalSigns: 'Respiratory arrest progressing to cardiac arrest. PEA/Asystole.',
      rhythm: 'PEA',
      isCritical: true,
    },
  ],

  'copd': [
    {
      triggerMinutes: 5,
      vitalChanges: { respiration: 34, spo2: 75, pulse: 115 },
      clinicalSigns: 'Pursed lip breathing, barrel chest, prolonged expiration, use of accessory muscles',
    },
    {
      triggerMinutes: 12,
      vitalChanges: { respiration: 38, spo2: 70, pulse: 125, bpSystolicDelta: 10 },
      clinicalSigns: 'CO2 retention — drowsiness, confusion, flapping tremor (asterixis)',
      isCritical: true,
    },
    {
      triggerMinutes: 20,
      vitalChanges: { respiration: 10, spo2: 60, gcs: 8, bpSystolicDelta: 20 },
      clinicalSigns: 'CO2 narcosis — GCS dropping, hypertension from hypercapnia, apneic episodes',
      isCritical: true,
    },
  ],

  'pneumothorax-tension': [
    {
      triggerMinutes: 2,
      vitalChanges: { spo2: 78, pulse: 140, bpSystolicDelta: -15, respiration: 38 },
      clinicalSigns: 'Tracheal deviation, distended neck veins, absent breath sounds on affected side',
    },
    {
      triggerMinutes: 5,
      vitalChanges: { spo2: 65, pulse: 160, bpSystolicDelta: -35, respiration: 42 },
      clinicalSigns: 'Severe respiratory distress, pulsus paradoxus, mediastinal shift',
      isCritical: true,
    },
    {
      triggerMinutes: 8,
      vitalChanges: { spo2: 40, pulse: 30, bpSystolicDelta: -60 },
      clinicalSigns: 'PEA arrest imminent — obstructive shock. Decompress NOW or patient dies.',
      rhythm: 'PEA',
      isCritical: true,
    },
  ],

  'cardiac-arrest': [
    {
      triggerMinutes: 1,
      vitalChanges: { spo2: 50, gcs: 3 },
      clinicalSigns: 'No pulse, no breathing. Brain damage begins within 4-6 minutes without CPR.',
    },
    {
      triggerMinutes: 4,
      vitalChanges: { spo2: 20 },
      clinicalSigns: 'Irreversible brain damage imminent. Fixed dilated pupils developing.',
      isCritical: true,
    },
    {
      triggerMinutes: 10,
      vitalChanges: { spo2: 0 },
      clinicalSigns: 'Prolonged arrest without intervention. Survival unlikely.',
      rhythm: 'Asystole',
      isCritical: true,
    },
  ],

  'anaphylaxis': [
    {
      triggerMinutes: 2,
      vitalChanges: { pulse: 130, bpSystolicDelta: -20, respiration: 30, spo2: 90 },
      clinicalSigns: 'Urticaria spreading, facial swelling, stridor developing, tachycardia',
    },
    {
      triggerMinutes: 5,
      vitalChanges: { pulse: 150, bpSystolicDelta: -40, respiration: 36, spo2: 80 },
      clinicalSigns: 'Severe angioedema, audible stridor, wheeze, distributive shock',
      isCritical: true,
    },
    {
      triggerMinutes: 8,
      vitalChanges: { pulse: 160, bpSystolicDelta: -60, respiration: 8, spo2: 60 },
      clinicalSigns: 'Complete airway obstruction, cardiovascular collapse, peri-arrest',
      isCritical: true,
    },
  ],

  'massive-hemorrhage': [
    {
      triggerMinutes: 2,
      vitalChanges: { pulse: 120, bpSystolicDelta: -15, spo2: 95 },
      clinicalSigns: 'Class II hemorrhage: tachycardia, cool extremities, narrowing pulse pressure',
    },
    {
      triggerMinutes: 5,
      vitalChanges: { pulse: 140, bpSystolicDelta: -35, spo2: 92, respiration: 28 },
      clinicalSigns: 'Class III hemorrhage: confused, markedly tachycardic, cold/clammy, SBP dropping',
      isCritical: true,
    },
    {
      triggerMinutes: 10,
      vitalChanges: { pulse: 150, bpSystolicDelta: -55, spo2: 85, gcs: 10, respiration: 35 },
      clinicalSigns: 'Class IV hemorrhage: moribund, obtunded, thread pulse, imminent arrest',
      isCritical: true,
    },
  ],

  'traumatic-brain-injury': [
    {
      triggerMinutes: 5,
      vitalChanges: { gcs: 12, pulse: 65, bpSystolicDelta: 15 },
      clinicalSigns: 'GCS declining, unilateral pupil dilation, vomiting',
    },
    {
      triggerMinutes: 10,
      vitalChanges: { gcs: 8, pulse: 55, bpSystolicDelta: 30, respiration: 10 },
      clinicalSigns: 'Cushing triad developing: hypertension, bradycardia, irregular respirations. Rising ICP.',
      isCritical: true,
    },
    {
      triggerMinutes: 15,
      vitalChanges: { gcs: 5, pulse: 40, bpSystolicDelta: 50, respiration: 6 },
      clinicalSigns: 'Bilateral fixed dilated pupils, decorticate posturing, Cheyne-Stokes breathing',
      isCritical: true,
    },
  ],


  'hypoglycemia': [
    {
      triggerMinutes: 5,
      vitalChanges: { gcs: 12, pulse: 110, bloodGlucose: 2.5 },
      clinicalSigns: 'Diaphoresis, tremor, confusion, slurred speech, combative behavior',
    },
    {
      triggerMinutes: 10,
      vitalChanges: { gcs: 8, pulse: 120, bloodGlucose: 1.8 },
      clinicalSigns: 'Seizure risk increasing, obtundation, unable to protect airway',
      isCritical: true,
    },
    {
      triggerMinutes: 15,
      vitalChanges: { gcs: 4, pulse: 55, bloodGlucose: 1.0 },
      clinicalSigns: 'Hypoglycemic coma, seizures, bradycardia, brain damage risk',
      isCritical: true,
    },
  ],

  // --- STROKE (cerebrovascular emergency) ---
  'stroke': [
    {
      triggerMinutes: 5,
      vitalChanges: { bpSystolicDelta: 15, pulse: 90, gcs: 13 },
      clinicalSigns: 'Worsening focal deficits, hypertension developing, patient becoming more confused',
    },
    {
      triggerMinutes: 15,
      vitalChanges: { bpSystolicDelta: 30, gcs: 10, respiration: 22, pulse: 85 },
      clinicalSigns: 'Significant neurological deterioration, gaze deviation, increasing obtundation',
      isCritical: true,
    },
    {
      triggerMinutes: 25,
      vitalChanges: { bpSystolicDelta: 40, gcs: 7, respiration: 10, pulse: 60 },
      clinicalSigns: 'Herniation signs — fixed dilated pupil, decerebrate posturing, Cushing response',
      isCritical: true,
    },
  ],

  // --- SPINAL INJURY (neurogenic shock) ---
  'spinal-injury': [
    {
      triggerMinutes: 5,
      vitalChanges: { pulse: 50, bpSystolicDelta: -20, spo2: 94 },
      clinicalSigns: 'Neurogenic shock developing — bradycardia, hypotension, warm dry skin below injury level',
    },
    {
      triggerMinutes: 10,
      vitalChanges: { pulse: 42, bpSystolicDelta: -35, spo2: 90, respiration: 24 },
      clinicalSigns: 'Worsening neurogenic shock, loss of motor function progressing, diaphragmatic breathing if high cervical',
      isCritical: true,
    },
    {
      triggerMinutes: 18,
      vitalChanges: { pulse: 35, bpSystolicDelta: -50, spo2: 82, respiration: 10 },
      clinicalSigns: 'High cervical injury: respiratory failure from phrenic nerve involvement, severe bradycardia',
      isCritical: true,
    },
  ],

  // --- ABDOMINAL TRAUMA ---
  'abdominal-trauma': [
    {
      triggerMinutes: 5,
      vitalChanges: { pulse: 110, bpSystolicDelta: -10, spo2: 96 },
      clinicalSigns: 'Guarding, increasing abdominal tenderness, tachycardia — concealed hemorrhage suspected',
    },
    {
      triggerMinutes: 10,
      vitalChanges: { pulse: 130, bpSystolicDelta: -25, spo2: 94, respiration: 26 },
      clinicalSigns: 'Rigid abdomen, rebound tenderness, hemodynamic instability, peritonism signs',
      isCritical: true,
    },
    {
      triggerMinutes: 18,
      vitalChanges: { pulse: 145, bpSystolicDelta: -45, spo2: 88, gcs: 12 },
      clinicalSigns: 'Hemorrhagic shock from intra-abdominal bleeding, altered mental status, thready pulse',
      isCritical: true,
    },
  ],

  // --- SVT / RAPID ARRHYTHMIAS ---
  'svt': [
    {
      triggerMinutes: 5,
      vitalChanges: { pulse: 180, bpSystolicDelta: -10, spo2: 95 },
      clinicalSigns: 'Palpitations, dizziness, chest tightness, anxiety',
    },
    {
      triggerMinutes: 12,
      vitalChanges: { pulse: 200, bpSystolicDelta: -25, spo2: 92, respiration: 26 },
      clinicalSigns: 'Hemodynamic compromise developing — hypotension, pallor, near-syncope',
      isCritical: true,
    },
    {
      triggerMinutes: 20,
      vitalChanges: { pulse: 220, bpSystolicDelta: -40, spo2: 88 },
      clinicalSigns: 'Cardiogenic shock from prolonged SVT, altered consciousness, signs of heart failure',
      isCritical: true,
    },
  ],

  // --- ATRIAL FIBRILLATION (rapid) ---
  'afib': [
    {
      triggerMinutes: 8,
      vitalChanges: { pulse: 150, bpSystolicDelta: -10, spo2: 94 },
      clinicalSigns: 'Irregularly irregular pulse, patient symptomatic with palpitations and dyspnea',
    },
    {
      triggerMinutes: 18,
      vitalChanges: { pulse: 165, bpSystolicDelta: -20, spo2: 91, respiration: 24 },
      clinicalSigns: 'Worsening hemodynamic instability, pulmonary edema risk in patients with LV dysfunction',
      isCritical: true,
    },
  ],

  // --- HYPOTHERMIA ---
  'hypothermia': [
    {
      triggerMinutes: 10,
      vitalChanges: { pulse: 50, bpSystolicDelta: -10, respiration: 10, gcs: 13 },
      clinicalSigns: 'Shivering stopped (ominous), bradycardia, confusion, clumsy movements',
    },
    {
      triggerMinutes: 20,
      vitalChanges: { pulse: 40, bpSystolicDelta: -20, respiration: 8, gcs: 8 },
      clinicalSigns: 'Severe hypothermia — muscle rigidity, fixed dilated pupils (may mimic death), Osborn J-waves on ECG',
      rhythm: 'Sinus Bradycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 30,
      vitalChanges: { pulse: 0, spo2: 50 },
      clinicalSigns: 'VF arrest from severe hypothermia. "Not dead until warm and dead." Begin rewarming + CPR.',
      rhythm: 'Ventricular Fibrillation',
      isCritical: true,
    },
  ],

  // --- ELECTROLYTE EMERGENCY (hyperkalemia) ---

  // --- OVERDOSE / TOXICOLOGY ---
  'overdose': [
    {
      triggerMinutes: 3,
      vitalChanges: { respiration: 8, spo2: 88, gcs: 10, pulse: 55 },
      clinicalSigns: 'Respiratory depression, miosis (pinpoint pupils), decreased consciousness',
    },
    {
      triggerMinutes: 8,
      vitalChanges: { respiration: 4, spo2: 75, gcs: 5, pulse: 50 },
      clinicalSigns: 'Severe respiratory failure, cyanosis, barely rousable, aspiration risk',
      isCritical: true,
    },
    {
      triggerMinutes: 12,
      vitalChanges: { respiration: 0, spo2: 40, gcs: 3, pulse: 30 },
      clinicalSigns: 'Respiratory arrest → hypoxic cardiac arrest. BVM ventilation + naloxone urgently needed.',
      isCritical: true,
    },
  ],

  // --- NSTEMI ---
  'nstemi': [
    {
      triggerMinutes: 10,
      vitalChanges: { pulse: 105, spo2: 93, bpSystolicDelta: -5 },
      clinicalSigns: 'Ongoing chest pain, mild tachycardia, diaphoresis — slower progression than STEMI',
    },
    {
      triggerMinutes: 20,
      vitalChanges: { pulse: 115, spo2: 90, bpSystolicDelta: -15 },
      clinicalSigns: 'Pain worsening, dynamic ECG changes (ST depression deepening), nausea, anxiety increasing',
      isCritical: true,
    },
    {
      triggerMinutes: 35,
      vitalChanges: { pulse: 130, spo2: 85, bpSystolicDelta: -30, respiration: 26 },
      clinicalSigns: 'Evolving to STEMI or cardiogenic shock — new ST elevation, crackles in bases, hypotension',
      rhythm: 'Sinus Tachycardia with ST changes',
      isCritical: true,
    },
  ],

  // --- HYPERTENSIVE EMERGENCY ---
  'hypertensive-emergency': [
    {
      triggerMinutes: 8,
      vitalChanges: { bpSystolicDelta: 20, pulse: 100, respiration: 22 },
      clinicalSigns: 'Severe headache worsening, visual disturbances, nausea — end-organ damage developing',
    },
    {
      triggerMinutes: 15,
      vitalChanges: { bpSystolicDelta: 35, pulse: 110, gcs: 13, respiration: 26 },
      clinicalSigns: 'Hypertensive encephalopathy — confusion, papilledema, focal neurological signs emerging',
      isCritical: true,
    },
    {
      triggerMinutes: 25,
      vitalChanges: { bpSystolicDelta: 50, pulse: 55, gcs: 9, respiration: 12 },
      clinicalSigns: 'Intracerebral hemorrhage or aortic dissection risk — Cushing response, obtundation, seizure risk',
      isCritical: true,
    },
  ],

  // --- SEIZURE / STATUS EPILEPTICUS ---
  'seizure': [
    {
      triggerMinutes: 5,
      vitalChanges: { pulse: 130, spo2: 85, respiration: 8, gcs: 3 },
      clinicalSigns: 'Ongoing generalized seizure > 5 minutes — status epilepticus. Hypoxia from airway compromise and apnea.',
    },
    {
      triggerMinutes: 10,
      vitalChanges: { pulse: 140, spo2: 75, respiration: 6, gcs: 3 },
      clinicalSigns: 'Refractory status — prolonged seizure causing metabolic acidosis, hyperthermia, rhabdomyolysis risk',
      isCritical: true,
    },
    {
      triggerMinutes: 20,
      vitalChanges: { pulse: 50, spo2: 60, respiration: 4, gcs: 3 },
      clinicalSigns: 'Cardiorespiratory collapse from prolonged status — bradycardia, severe hypoxia, brain damage imminent',
      isCritical: true,
    },
  ],

  // --- MULTI-TRAUMA / POLYTRAUMA ---
  'multi-trauma': [
    {
      triggerMinutes: 3,
      vitalChanges: { pulse: 120, bpSystolicDelta: -15, spo2: 92, respiration: 28 },
      clinicalSigns: 'Multiple injury sites bleeding, tachycardia developing, patient becoming restless and anxious',
    },
    {
      triggerMinutes: 8,
      vitalChanges: { pulse: 140, bpSystolicDelta: -30, spo2: 85, gcs: 12, respiration: 32 },
      clinicalSigns: 'Hemorrhagic shock Class III — confused, cold/clammy, weak radial pulse, distended abdomen or hemothorax',
      isCritical: true,
    },
    {
      triggerMinutes: 15,
      vitalChanges: { pulse: 155, bpSystolicDelta: -50, spo2: 75, gcs: 8, respiration: 36 },
      clinicalSigns: 'Decompensated shock — moribund, obtunded, imminent cardiac arrest without immediate intervention',
      isCritical: true,
    },
  ],

  // --- CHEST TRAUMA ---
  'chest-trauma': [
    {
      triggerMinutes: 3,
      vitalChanges: { spo2: 90, pulse: 115, bpSystolicDelta: -10, respiration: 28 },
      clinicalSigns: 'Increasing respiratory distress, paradoxical chest wall movement (flail), subcutaneous emphysema',
    },
    {
      triggerMinutes: 8,
      vitalChanges: { spo2: 80, pulse: 135, bpSystolicDelta: -25, respiration: 36 },
      clinicalSigns: 'Tension physiology developing — tracheal deviation, absent breath sounds, JVD, hemodynamic instability',
      isCritical: true,
    },
    {
      triggerMinutes: 14,
      vitalChanges: { spo2: 65, pulse: 40, bpSystolicDelta: -50, respiration: 8 },
      clinicalSigns: 'Cardiac tamponade or massive hemothorax — pulseless electrical activity, obstructive shock',
      rhythm: 'PEA',
      isCritical: true,
    },
  ],

  // --- PELVIC FRACTURE ---
  'pelvic-fracture': [
    {
      triggerMinutes: 3,
      vitalChanges: { pulse: 115, bpSystolicDelta: -10, spo2: 96 },
      clinicalSigns: 'Pelvic instability on gentle compression, perineal bruising, tachycardia — occult hemorrhage',
    },
    {
      triggerMinutes: 8,
      vitalChanges: { pulse: 135, bpSystolicDelta: -30, spo2: 93, respiration: 26 },
      clinicalSigns: 'Class III hemorrhage — retroperitoneal bleeding, cold/clammy, pelvic binder urgently needed',
      isCritical: true,
    },
    {
      triggerMinutes: 15,
      vitalChanges: { pulse: 150, bpSystolicDelta: -50, spo2: 86, gcs: 10 },
      clinicalSigns: 'Massive hemorrhage — exsanguination risk, altered consciousness, thready pulse, imminent arrest',
      isCritical: true,
    },
  ],

  // ===========================================================================
  // ACUTE HEART FAILURE / CARDIOGENIC PULMONARY OEDEMA — untreated decline
  // Cases: cardiac-011, resp-008 (both subcategory 'heart-failure').
  // Story: hypertensive APO → progressive flooding → rising RR + falling SpO2
  // → frothy sputum → respiratory exhaustion (RR paradoxically falls) → PEA.
  // bpSystolicDelta: starts hypertensive, climbs further with sympathetic surge,
  // then collapses as the exhausted LV fails into cardiogenic shock.
  // This is a NEW key (no 'heart-failure' entry currently exists in
  // CASE_DETERIORATION_TIMELINES) — safe to add.
  // ===========================================================================
  'heart-failure': [
    {
      triggerMinutes: 3,
      vitalChanges: { respiration: 38, spo2: 84, pulse: 130, bpSystolicDelta: 15 },
      clinicalSigns: 'Crackles climbing from the bases toward the mid-zones, louder cardiac wheeze, rising sympathetic surge — BP climbing, diaphoresis worsening, increasing air hunger',
    },
    {
      triggerMinutes: 7,
      vitalChanges: { respiration: 42, spo2: 76, pulse: 140, bpSystolicDelta: 25 },
      clinicalSigns: 'Pink frothy sputum appearing, coarse crackles throughout all zones, orthopnoea severe — the alveoli are flooding. Hypertensive crisis (SCAPE) driving the oedema.',
      isCritical: true,
    },
    {
      triggerMinutes: 12,
      vitalChanges: { respiration: 12, spo2: 66, pulse: 120, bpSystolicDelta: -40, gcs: 11 },
      clinicalSigns: 'Respiratory EXHAUSTION — rate paradoxically falling, GCS dropping, secretions gurgling in the airway. LV now failing: BP collapsing into cardiogenic shock. Peri-arrest.',
      rhythm: 'Sinus Tachycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 16,
      vitalChanges: { respiration: 4, spo2: 45, pulse: 0, bpSystolicDelta: -90 },
      clinicalSigns: 'Hypoxic respiratory arrest progressing to cardiac arrest — PEA. Airway full of frothy oedema fluid. Begin CPR.',
      rhythm: 'PEA',
      isCritical: true,
    },
  ],

  // ===========================================================================
  // PULMONARY EMBOLISM — untreated massive-PE decline
  // Cases: resp-004 (submassive, will progress), litfl-007 (already massive).
  // Story: tachycardia + O2-resistant hypoxia → RV strain (raised JVP, S1Q3T3)
  // → obstructive shock (BP collapse) → PEA arrest. Chest stays CLEAR throughout
  // (shunt/dead-space physiology) — saturations fall despite oxygen.
  // NOTE: a 'pulmonary-embolism' key ALREADY EXISTS in CASE_DETERIORATION_TIMELINES
  // (a basic 3-stage version). This is a clinically-staged REPLACEMENT, not an
  // addition — drop it IN PLACE of the existing entry to avoid a duplicate key.
  // ===========================================================================
  'pulmonary-embolism': [
    {
      triggerMinutes: 4,
      vitalChanges: { pulse: 130, spo2: 84, respiration: 32, bpSystolicDelta: -10 },
      clinicalSigns: 'Worsening tachypnoea and pleuritic pain, rising tachycardia, hypoxia creeping down despite high-flow oxygen — chest still clear. Anxiety mounting.',
    },
    {
      triggerMinutes: 8,
      vitalChanges: { pulse: 142, spo2: 76, respiration: 38, bpSystolicDelta: -22 },
      clinicalSigns: 'Acute RV strain — distended neck veins, RV heave, S1Q3T3 and right-axis shift on the monitor, accentuated P2. Clot burden shifting, BP starting to give way.',
      isCritical: true,
    },
    {
      triggerMinutes: 13,
      vitalChanges: { pulse: 155, spo2: 64, respiration: 40, bpSystolicDelta: -38 },
      clinicalSigns: 'Obstructive shock — profound O2-resistant hypoxia, hypotension, central cyanosis, cool peripheries. Right heart failing against fixed outflow obstruction. PEA arrest imminent.',
      rhythm: 'Sinus Tachycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 17,
      vitalChanges: { pulse: 0, spo2: 45, respiration: 0, bpSystolicDelta: -70 },
      clinicalSigns: 'Cardiac arrest — PEA, the classic arrest rhythm of massive PE. No output against the obstructed pulmonary circulation. Begin CPR; consider thrombolysis in arrest.',
      rhythm: 'PEA',
      isCritical: true,
    },
  ],

  // --- HEAT STROKE / HEAT ILLNESS ---
  // Untreated hyperthermia: rising core temp + tachycardia + falling GCS -> heat-induced seizures -> VF/arrest.
  // Routes from subcategory 'heat-stroke' (env-002) and via alias 'heat-exhaustion' -> 'heat-stroke' (env-001).
  'heat-stroke': [
    {
      triggerMinutes: 5,
      vitalChanges: { pulse: 140, respiration: 28, bpSystolicDelta: -10, gcs: 13, temperature: 40 },
      clinicalSigns: 'Core temperature climbing past 40°C. Sweating stops (anhidrosis) — skin now hot and dry. Confusion and agitation developing. Tachycardia worsening.',
    },
    {
      triggerMinutes: 12,
      vitalChanges: { pulse: 160, respiration: 34, bpSystolicDelta: -25, gcs: 9, spo2: 92, temperature: 41.5 },
      clinicalSigns: 'Hyperthermia 41-42°C with obtundation. Hypotension from vasodilation. Muscle rigidity and twitching — heat-induced seizures beginning. Metabolic acidosis (tachypnoea).',
      isCritical: true,
    },
    {
      triggerMinutes: 18,
      vitalChanges: { pulse: 0, spo2: 60, bpSystolicDelta: -90, gcs: 3, temperature: 42 },
      clinicalSigns: 'Hyperthermic VF/arrest following sustained seizures and multi-organ failure (rhabdomyolysis, DIC). "Cool and resuscitate." Begin aggressive cooling + CPR.',
      rhythm: 'Ventricular Fibrillation',
      isCritical: true,
    },
  ],

  // --- DROWNING (ASPHYXIAL) ---
  // Untreated submersion injury: hypoxia -> bradycardia -> asphyxial (hypoxic) cardiac arrest.
  // Routes from subcategory 'drowning' (trauma-012). NOTE: cardiac-014 has subcategory 'cardiac-arrest'
  // and therefore routes to the EXISTING 'cardiac-arrest' timeline, NOT this one (see notes.md).
  'drowning': [
    {
      triggerMinutes: 2,
      vitalChanges: { spo2: 78, respiration: 6, pulse: 60, gcs: 9 },
      clinicalSigns: 'Worsening hypoxia from aspirated water and laryngospasm. Agonal/ineffective breathing. Cyanosis deepening, level of consciousness dropping.',
    },
    {
      triggerMinutes: 5,
      vitalChanges: { spo2: 65, respiration: 2, pulse: 45, gcs: 3, bpSystolicDelta: -20 },
      clinicalSigns: 'Profound hypoxia driving hypoxic bradycardia. Near-apnoeic. Pulse weak and slow — peri-arrest. Ventilation is the priority.',
      isCritical: true,
    },
    {
      triggerMinutes: 8,
      vitalChanges: { pulse: 0, spo2: 50, respiration: 0, gcs: 3 },
      clinicalSigns: 'Asphyxial (hypoxic) cardiac arrest. Give 5 rescue breaths FIRST, then compressions. Often hypothermic — "not dead until warm and dead."',
      rhythm: 'Asystole',
      isCritical: true,
    },
  ],

  // --- ECLAMPSIA ---
  // Untreated eclampsia: recurrent seizures -> hypoxia -> maternal/fetal compromise -> arrest.
  // Routes from subcategory 'eclampsia' (obs-002).
  'eclampsia': [
    {
      triggerMinutes: 4,
      vitalChanges: { pulse: 125, spo2: 88, respiration: 8, gcs: 3, bpSystolicDelta: 20 },
      clinicalSigns: 'Recurrent tonic-clonic seizure without magnesium. Apnoea during seizure causing hypoxia. BP climbing — risk of intracerebral haemorrhage. Fetal bradycardia likely.',
    },
    {
      triggerMinutes: 10,
      vitalChanges: { pulse: 140, spo2: 78, respiration: 6, gcs: 3, bpSystolicDelta: 35 },
      clinicalSigns: 'Status eclampticus — repeated seizures, severe hypoxia, aspiration risk. Maternal and fetal compromise. Placental abruption / HELLP risk rising.',
      isCritical: true,
    },
    {
      triggerMinutes: 18,
      vitalChanges: { pulse: 45, spo2: 60, respiration: 4, gcs: 3, bpSystolicDelta: -40 },
      clinicalSigns: 'Maternal cardiorespiratory collapse from prolonged seizures and hypoxia (or intracerebral haemorrhage). Imminent maternal + fetal arrest. Magnesium + delivery are the cure.',
      rhythm: 'Sinus Bradycardia',
      isCritical: true,
    },
  ],

// ===========================================================================
// REPLACEMENT 'electrolyte' deterioration timeline.
// In src/data/clinicalRealism.ts, REPLACE the existing CASE_DETERIORATION_TIMELINES
// entry keyed 'electrolyte' (currently ~lines 1397-1418, the 3-stage version) with
// the 4-stage version below. This makes the untreated hyperkalaemic decline explicit:
//   peaked T waves -> widening QRS -> sine wave -> VF/asystole, with a rhythm label
//   at every stage. Field shape = DeteriorationStage (triggerMinutes, vitalChanges,
//   clinicalSigns, rhythm?, isCritical?). vitalChanges supports bpSystolicDelta.
// Anchored to metab-003 / litfl-003 (bradycardic, wide-QRS, pre-arrest dialysis pts).
// ===========================================================================

  // --- ELECTROLYTE EMERGENCY (hyperkalaemia) ---
  'electrolyte': [
    {
      triggerMinutes: 4,
      vitalChanges: { pulse: 52, bpSystolicDelta: -5 },
      clinicalSigns:
        'Generalised muscle weakness and paraesthesias. Monitor shows tall, peaked, tented T waves (V2-V5). Early bradycardia.',
      rhythm: 'Sinus Bradycardia (peaked T waves)',
    },
    {
      triggerMinutes: 9,
      vitalChanges: { pulse: 44, bpSystolicDelta: -12 },
      clinicalSigns:
        'QRS broadening (>120ms), P waves flattening/lost, PR prolonging. Worsening bradycardia. Membrane stabilisation (calcium chloride) needed NOW.',
      rhythm: 'Wide-complex bradycardia (broadened QRS, loss of P waves)',
      isCritical: true,
    },
    {
      triggerMinutes: 14,
      vitalChanges: { pulse: 32, bpSystolicDelta: -25, spo2: 86 },
      clinicalSigns:
        'QRS and T waves merging into a sine-wave pattern — immediate pre-arrest. Calcium chloride STAT or the patient will arrest.',
      rhythm: 'Sine-wave pattern (pre-arrest)',
      isCritical: true,
    },
    {
      triggerMinutes: 18,
      vitalChanges: { pulse: 0, spo2: 55 },
      clinicalSigns:
        'Hyperkalaemic cardiac arrest — sine wave has degenerated to VF then asystole. Calcium chloride + bicarbonate during CPR; this rhythm is refractory to defibrillation until the potassium is treated.',
      rhythm: 'Ventricular Fibrillation -> Asystole',
      isCritical: true,
    },
  ],

  // Untreated inferior/RV STEMI: RCA territory → vagal/nodal bradycardia + a
  // preload-dependent RV that fails into cardiogenic shock, then high-grade AV
  // block, then PEA/asystolic arrest. (Note: the existing 3-stage entry ends at
  // heart block; this replacement extends the course through to arrest and adds
  // the RV-shock stage. Replace the current 'stem-inferior' key with this.)
  'stem-inferior': [
    {
      triggerMinutes: 4,
      vitalChanges: { pulse: 50, spo2: 93, bpSystolicDelta: -10 },
      clinicalSigns: 'Vagal/nodal response from RCA occlusion — sinus bradycardia, nausea, increasing diaphoresis. Chest stays clear.',
      rhythm: 'Sinus Bradycardia',
    },
    {
      triggerMinutes: 9,
      vitalChanges: { pulse: 44, spo2: 90, bpSystolicDelta: -25, respiration: 26 },
      clinicalSigns: 'RV failure declaring itself — hypotension worsening, raised JVP with clear lungs, cool peripheries. Preload-dependent shock developing.',
      rhythm: 'Sinus Bradycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 14,
      vitalChanges: { pulse: 36, spo2: 85, bpSystolicDelta: -42, respiration: 30 },
      clinicalSigns: 'High-grade/complete AV block, profound RV cardiogenic shock, altered mental status. Atropine/fluids/pacing territory.',
      rhythm: 'Third Degree Heart Block',
      isCritical: true,
    },
    {
      triggerMinutes: 19,
      vitalChanges: { pulse: 0, spo2: 55, bpSystolicDelta: -75 },
      clinicalSigns: 'Cardiac arrest — bradyasystolic / PEA from RV pump failure and AV block. No output. Begin CPR.',
      rhythm: 'Asystole',
      isCritical: true,
    },
  ],

// ============================================================================
// PASTE-READY DeteriorationStage TIMELINES
// Insert into CASE_DETERIORATION_TIMELINES in src/data/clinicalRealism.ts
// (the object that closes at line ~1568).
//
// DeteriorationStage shape (clinicalRealism.ts ~1015):
//   triggerMinutes: number
//   vitalChanges: Partial<VitalSigns> & { bpSystolicDelta?, bpDiastolicDelta? }
//   clinicalSigns: string
//   rhythm?: string
//   isCritical?: boolean
// ============================================================================


  // ===========================================================================
  // NEW — CARDIAC TAMPONADE (obstructive shock → PEA)
  // ---------------------------------------------------------------------------
  // Untreated natural history of an unrelieved pericardial tamponade:
  //   compensation (narrowing pulse pressure, rising HR) → falling SBP / pulsus
  //   paradoxus → loss of cardiac output → PEA arrest.
  // Note `bpDiastolicDelta` RISES while `bpSystolicDelta` FALLS in the early
  // stage — that is the narrowing pulse pressure that is the hallmark of
  // tamponade compensation. Baseline trauma-004 vitals: HR 140, SpO2 88,
  // BP 70/50 — so deltas are deliberately modest before the terminal collapse.
  //
  // REQUIRES routing: this timeline only fires if the case subcategory resolves
  // to 'tamponade'. trauma-004 is currently 'chest-trauma' (which has its own,
  // more generic chest-trauma timeline). Set trauma-004.subcategory = 'tamponade'
  // (preferred) or alias 'chest-trauma' → 'tamponade'. See trauma.notes.md.
  // ===========================================================================
  'tamponade': [
    {
      triggerMinutes: 3,
      vitalChanges: { pulse: 150, bpSystolicDelta: -8, bpDiastolicDelta: 6, spo2: 86, respiration: 36 },
      clinicalSigns: 'Compensating obstructive shock — pulse pressure narrowing (SBP falling, DBP rising), tachycardia climbing, muffled heart sounds, rising JVP. Pulsus paradoxus palpable.',
    },
    {
      triggerMinutes: 7,
      vitalChanges: { pulse: 160, bpSystolicDelta: -22, spo2: 80, respiration: 40, gcs: 12 },
      clinicalSigns: 'Decompensating — pulse pressure critically narrow, SBP dropping, thready central pulse, increasingly obtunded. Diastolic filling failing against pericardial pressure.',
      isCritical: true,
    },
    {
      triggerMinutes: 11,
      vitalChanges: { pulse: 40, bpSystolicDelta: -55, spo2: 60, respiration: 6, gcs: 4 },
      clinicalSigns: 'Cardiac output lost — PEA arrest. Organised electrical activity on the monitor but no palpable output (obstruction not perfusion). Needs decompression + CPR.',
      rhythm: 'PEA',
      isCritical: true,
    },
  ],


  // ===========================================================================
  // EXISTING TIMELINES — REUSED, NOT REPLACED  (informational; do not paste)
  // ---------------------------------------------------------------------------
  // 'abdominal-trauma'  (clinicalRealism.ts ~1318)  → trauma-007
  //     Existing 3-stage timeline (guarding → rigid/peritonism → haemorrhagic
  //     shock, SBP -10/-25/-45, HR 110/130/145) is clinically sound and already
  //     matched to the splenic-laceration presentation. REUSE AS-IS.
  //
  // 'pelvic-fracture'   (clinicalRealism.ts ~1549)  → trauma-008
  //     Existing 3-stage timeline (instability/occult bleed → Class III
  //     retroperitoneal, "pelvic binder urgently needed" → massive haemorrhage,
  //     SBP -10/-30/-50) is excellent and references the binder. REUSE AS-IS.
  //
  // 'multi-trauma'      (clinicalRealism.ts ~1506)  → trauma-011 (via alias)
  //     Strong Class II→III→IV polytrauma haemorrhage model. REUSE AS-IS; once
  //     'extremity-trauma' is aliased to 'multi-trauma' (see notes), trauma-011
  //     inherits this timeline. (The 'massive-hemorrhage' timeline ~1194 is an
  //     equally good alternative target if a limb-specific feel is preferred.)
  //
  // No replacements proposed — the authored protocols above are consistent with
  // these existing timelines (permissive hypotension, lethal-triad framing).
  // ===========================================================================

// ============================================================================
// DKA deterioration timeline.
// ADD this entry to CASE_DETERIORATION_TIMELINES in src/data/clinicalRealism.ts
// (no 'dka' key currently exists — safe to ADD, not replace).
// Routes from subcategory 'dka' (case metab-002): getCaseDeteriorationTimeline()
// calls resolveSubcategory('dka') → no alias → 'dka' → direct key match.
// Field shape = DeteriorationStage (triggerMinutes, vitalChanges, clinicalSigns,
// rhythm?, isCritical?). vitalChanges supports bpSystolicDelta + bloodGlucose.
//
// Untreated DKA: rising HR + deepening/quickening Kussmaul RR + falling BP & GCS
// from worsening dehydration and acidosis → obtunded, exhausted (RR paradoxically
// drops as compensation fails) → bradycardic peri-arrest → arrest. BGL keeps
// climbing throughout (osmotic diuresis). Lungs stay clear; this is a metabolic,
// not respiratory, death. Anchored to metab-002 (HR 110, BP 95/60, RR 30, GCS 14,
// BGL 28.5).
// ============================================================================

  // --- DIABETIC KETOACIDOSIS (DKA) ---
  'dka': [
    {
      triggerMinutes: 5,
      vitalChanges: { pulse: 124, respiration: 34, bpSystolicDelta: -8, gcs: 13, bloodGlucose: 31 },
      clinicalSigns:
        'Worsening dehydration — Kussmaul breathing deepening and quickening to blow off more acid, tachycardia climbing, BP creeping down, increasingly drowsy. Acetone breath stronger. BGL still rising.',
    },
    {
      triggerMinutes: 11,
      vitalChanges: { pulse: 138, respiration: 38, bpSystolicDelta: -18, gcs: 9, bloodGlucose: 34 },
      clinicalSigns:
        'Decompensating — hypovolaemic shock developing (thready pulse, cold mottled peripheries, prolonged cap refill). Obtunded and vomiting with aspiration risk. Severe acidosis. Watch the monitor for peaked T waves (hyperkalaemia).',
      rhythm: 'Sinus Tachycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 17,
      vitalChanges: { pulse: 50, respiration: 8, bpSystolicDelta: -32, gcs: 5, spo2: 88, bloodGlucose: 36 },
      clinicalSigns:
        'Exhaustion and pre-terminal collapse — Kussmaul effort failing (RR paradoxically falling), profound dehydration and acidosis driving bradycardia and unconsciousness. Peri-arrest. Fluids first, then insulin in hospital.',
      rhythm: 'Sinus Bradycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 22,
      vitalChanges: { pulse: 0, respiration: 0, bpSystolicDelta: -60, gcs: 3, spo2: 60 },
      clinicalSigns:
        'Cardiac arrest from uncorrected hypovolaemia, profound acidosis and electrolyte derangement (hyperkalaemia). PEA the likely rhythm. Begin CPR; this arrest is the end-stage of untreated DKA.',
      rhythm: 'PEA',
      isCritical: true,
    },
  ],

// ============================================================================
// INFECTION / SEPSIS-SOURCE DETERIORATION TIMELINES
// Insert these three entries into CASE_DETERIORATION_TIMELINES in
// src/data/clinicalRealism.ts (the Record<string, DeteriorationStage[]>).
//
// DeteriorationStage shape (clinicalRealism.ts ~1027):
//   { triggerMinutes: number;
//     vitalChanges: Partial<VitalSigns> & { bpSystolicDelta?: number; bpDiastolicDelta?: number };
//     clinicalSigns: string;
//     rhythm?: string;
//     isCritical?: boolean; }
//
// vitalChanges sets ABSOLUTE values for pulse/respiration/spo2/gcs, and a DELTA
// for systolic BP (bpSystolicDelta), matching every existing timeline in the file.
//
// Lookup: getCaseDeteriorationTimeline() resolves via SUBCATEGORY_ALIAS → then
// raw subcategory → then category. So:
//   'sepsis'      ← cardiac-017 (subcategory 'sepsis')  AND
//                   postd-001  (subcategory 'post-surgical' VIA the alias in notes)
//   'meningitis'  ← neuro-003, neuro-004 (subcategory 'meningitis')
//   'pneumonia'   ← resp-011 (subcategory 'pneumonia')
// Add 'post-surgical': 'sepsis' to SUBCATEGORY_ALIAS so postd-001 inherits this
// septic timeline (see infection.notes.md).
// ============================================================================

  // Untreated sepsis → compensated tachycardia/tachypnoea → falling BP and rising
  // RR as compensation fails → falling GCS and "cold shock" → refractory septic
  // shock → arrest. (Covers the compensated postd-001 start AND the already-
  // decompensated paediatric cardiac-017 picture as the same physiological arc.)
  'sepsis': [
    {
      triggerMinutes: 5,
      vitalChanges: { pulse: 125, respiration: 26, spo2: 94 },
      clinicalSigns: 'Worsening hyperdynamic sepsis — climbing tachycardia and tachypnoea, warm flushed peripheries, rising temperature. Blood pressure still compensated but lactate rising.',
    },
    {
      triggerMinutes: 12,
      vitalChanges: { pulse: 140, respiration: 32, spo2: 90, bpSystolicDelta: -25 },
      clinicalSigns: 'Compensation failing — blood pressure now falling, respiratory rate climbing, urine output dropping. Peripheries cooling as "warm shock" turns "cold". Mottling appears.',
    },
    {
      triggerMinutes: 18,
      vitalChanges: { pulse: 150, respiration: 36, spo2: 86, bpSystolicDelta: -45, gcs: 12 },
      clinicalSigns: 'Decompensated septic shock — hypotension refractory to compensation, capillary refill >4 s, GCS falling, non-blanching petechiae may appear (meningococcaemia). Lactic acidosis.',
      isCritical: true,
    },
    {
      triggerMinutes: 25,
      vitalChanges: { pulse: 160, respiration: 40, spo2: 80, bpSystolicDelta: -65, gcs: 8 },
      clinicalSigns: 'Refractory shock — profound hypotension, obtundation, anuria, multi-organ failure. In children, heart rate and respiratory effort now begin to FALL (pre-arrest). Peri-arrest.',
      rhythm: 'Sinus Tachycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 32,
      vitalChanges: { pulse: 0, respiration: 0, spo2: 50, bpSystolicDelta: -90, gcs: 3 },
      clinicalSigns: 'Cardiac arrest from refractory septic shock / hypoxia. Pulseless electrical activity. Begin CPR.',
      rhythm: 'PEA',
      isCritical: true,
    },
  ],

  // Untreated meningococcal disease → sepsis with spreading petechiae/purpura →
  // distributive shock → falling GCS → arrest. (Raised-ICP phenotype runs in
  // parallel: Cushing response then coning — captured in the clinicalSigns.)
  'meningitis': [
    {
      triggerMinutes: 5,
      vitalChanges: { pulse: 120, respiration: 24, spo2: 96 },
      clinicalSigns: 'Worsening systemic infection — rising fever and tachycardia, increasing headache and photophobia, new irritability/agitation. First sparse non-blanching petechiae may appear.',
    },
    {
      triggerMinutes: 11,
      vitalChanges: { pulse: 135, respiration: 30, spo2: 93, bpSystolicDelta: -20 },
      clinicalSigns: 'Meningococcal sepsis declaring — purpuric rash spreading, blood pressure falling, peripheries cooling with prolonged capillary refill. GCS beginning to drift.',
      isCritical: true,
    },
    {
      triggerMinutes: 17,
      vitalChanges: { pulse: 145, respiration: 34, spo2: 88, bpSystolicDelta: -40, gcs: 10 },
      clinicalSigns: 'Distributive (septic) shock with widespread purpura, OR — if ICP-driven — falling GCS with the Cushing response (relative bradycardia, hypertension, irregular respiration). Seizures possible.',
      isCritical: true,
    },
    {
      triggerMinutes: 24,
      vitalChanges: { pulse: 155, respiration: 36, spo2: 82, bpSystolicDelta: -55, gcs: 6 },
      clinicalSigns: 'Decompensation — refractory shock with mottled, cold skin, or progressive brainstem compromise from rising ICP. Obtunded, peri-arrest.',
      rhythm: 'Sinus Tachycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 30,
      vitalChanges: { pulse: 0, respiration: 0, spo2: 48, bpSystolicDelta: -80, gcs: 3 },
      clinicalSigns: 'Cardiac arrest from fulminant meningococcal septic shock (or coning from raised ICP). Pulseless electrical activity. Begin CPR.',
      rhythm: 'PEA',
      isCritical: true,
    },
  ],

  // Untreated pneumonia → worsening V/Q-mismatch hypoxia + sepsis physiology →
  // exhaustion → type-1 respiratory failure → hypoxic arrest.
  'pneumonia': [
    {
      triggerMinutes: 5,
      vitalChanges: { pulse: 120, respiration: 32, spo2: 85 },
      clinicalSigns: 'Worsening hypoxia and tachypnoea — consolidation extending, increasing work of breathing, accessory muscle use. Febrile and rigoring.',
    },
    {
      triggerMinutes: 12,
      vitalChanges: { pulse: 130, respiration: 38, spo2: 80, bpSystolicDelta: -15 },
      clinicalSigns: 'Hypoxia poorly responsive to effort — crackles now multi-lobar, early cyanosis, blood pressure beginning to fall as CAP-sepsis develops. New confusion (CURB-65).',
      isCritical: true,
    },
    {
      triggerMinutes: 19,
      vitalChanges: { pulse: 140, respiration: 42, spo2: 72, bpSystolicDelta: -30, gcs: 12 },
      clinicalSigns: 'Type-1 respiratory failure with septic shock — refractory hypoxaemia, central cyanosis, hypotension, falling GCS. Patient visibly tiring.',
      isCritical: true,
    },
    {
      triggerMinutes: 25,
      vitalChanges: { pulse: 130, respiration: 8, spo2: 60, bpSystolicDelta: -45, gcs: 8 },
      clinicalSigns: 'EXHAUSTION — respiratory rate paradoxically falling as the patient tires, profound hypoxia, deepening shock. Imminent respiratory arrest.',
      rhythm: 'Sinus Tachycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 30,
      vitalChanges: { pulse: 0, respiration: 0, spo2: 45, bpSystolicDelta: -60, gcs: 3 },
      clinicalSigns: 'Hypoxic cardiac arrest from respiratory failure. Pulseless electrical activity / asystole. Begin CPR.',
      rhythm: 'PEA',
      isCritical: true,
    },
  ],

// ============================================================================
// TWO NEW DeteriorationStage TIMELINES — paste into the
// CASE_DETERIORATION_TIMELINES object in src/data/clinicalRealism.ts
// (the Record that closes at ~line 1823, just before the closing `};`).
//
// DeteriorationStage shape (clinicalRealism.ts ~1027):
//   triggerMinutes: number
//   vitalChanges: Partial<VitalSigns> & { bpSystolicDelta?, bpDiastolicDelta? }
//   clinicalSigns: string
//   rhythm?: string
//   isCritical?: boolean
//
// vitalChanges set ABSOLUTE values for pulse/respiration/spo2/gcs and use
// bpSystolicDelta for BP (matching every existing entry in this file).
// Both keys ('paracetamol-overdose', 'organophosphate') are the case
// subcategories — no alias needed (y2-007 / tox-001 already use them).
// ============================================================================

  // ===========================================================================
  // NEW — PARACETAMOL OVERDOSE (DELAYED HEPATIC CLOCK)
  // ---------------------------------------------------------------------------
  // The pedagogically important shape: the patient is RELATIVELY STABLE early
  // (the deceptive window — this is the whole teaching point of y2-007), then,
  // if untreated, fulminant hepatic failure declares LATE — rising HR, falling
  // BP and GCS, compensatory tachypnoea (metabolic acidosis), hypoglycaemia.
  // triggerMinutes are stretched deliberately long: paracetamol toxicity is a
  // clock measured in hours/days, not minutes. Baseline y2-007 vitals: HR 85,
  // RR 16, SpO2 99, BP 115/70, GCS 15. Early stages barely move — that is the
  // trap. The terminal stage is hepatic encephalopathy → coma, NOT a sudden
  // primary cardiac arrest.
  // ===========================================================================
  'paracetamol-overdose': [
    {
      triggerMinutes: 8,
      vitalChanges: { pulse: 92, respiration: 18, spo2: 99, bpSystolicDelta: -3 },
      clinicalSigns:
        'Still looks well — mild nausea, maybe one vomit. Obs essentially normal. THIS IS THE TRAP: normal vitals do not exclude a lethal ingestion. A timed paracetamol level and timely N-acetylcysteine are what matter now.',
    },
    {
      triggerMinutes: 16,
      vitalChanges: { pulse: 104, respiration: 20, spo2: 98, bpSystolicDelta: -6 },
      clinicalSigns:
        'Persistent vomiting, mild malaise and right-upper-quadrant discomfort beginning. Vitals only slightly off. Biochemically the hepatocyte injury is already underway even though the patient looks deceptively stable.',
    },
    {
      triggerMinutes: 24,
      vitalChanges: { pulse: 120, respiration: 26, spo2: 95, bpSystolicDelta: -18, gcs: 12 },
      clinicalSigns:
        'Hepatotoxicity declaring — RUQ pain, jaundice, tender liver, deepening (Kussmaul) breathing from metabolic/lactic acidosis, early hepatic encephalopathy and hypoglycaemia. Tachycardic and hypotensive. This is fulminant hepatic failure developing.',
      isCritical: true,
    },
    {
      triggerMinutes: 32,
      vitalChanges: { pulse: 135, respiration: 30, spo2: 92, bpSystolicDelta: -32, gcs: 6 },
      clinicalSigns:
        'Fulminant hepatic failure — Grade III–IV encephalopathy / coma, coagulopathy, profound hypoglycaemia, lactic acidosis and worsening shock. Airway no longer protected. Transplant-pathway patient; without antidote and a liver unit this is fatal.',
      isCritical: true,
    },
  ],


  // ===========================================================================
  // NEW — ORGANOPHOSPHATE POISONING (CHOLINERGIC CRISIS → RESP FAILURE → ARREST)
  // ---------------------------------------------------------------------------
  // Untreated natural history of a cholinergic crisis: worsening bronchorrhoea
  // and bradycardia → respiratory failure from secretions + nicotinic muscle
  // weakness → bradyasystolic / hypoxic arrest. Baseline tox-001 vitals: HR 45,
  // RR 32, SpO2 88, BP 75/45, GCS 8, pinpoint pupils, fasciculations. The chest
  // gets WETTER and the respiratory effort FAILS as muscle weakness sets in
  // (RR paradoxically falls toward the end — exhaustion + paralysis). Death is
  // bradyasystolic from hypoxia and unopposed vagal/muscarinic tone.
  // ===========================================================================
  'organophosphate': [
    {
      triggerMinutes: 3,
      vitalChanges: { pulse: 42, respiration: 34, spo2: 84, bpSystolicDelta: -6 },
      clinicalSigns:
        'Worsening cholinergic crisis — increasing bronchorrhoea (airway filling with secretions), profuse salivation/lacrimation, bradycardia deepening, pinpoint pupils, generalised fasciculations. The patient is drowning in their own secretions.',
      rhythm: 'Sinus Bradycardia',
    },
    {
      triggerMinutes: 7,
      vitalChanges: { pulse: 38, respiration: 26, spo2: 76, bpSystolicDelta: -12, gcs: 6 },
      clinicalSigns:
        'Respiratory failure declaring — torrential secretions plus nicotinic respiratory-muscle weakness; effort beginning to fail. Hypoxia worsening despite oxygen, GCS dropping. Needs escalating atropine (to a dry chest) + pralidoxime + suction + assisted ventilation NOW.',
      rhythm: 'Sinus Bradycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 11,
      vitalChanges: { pulse: 30, respiration: 8, spo2: 60, bpSystolicDelta: -25, gcs: 3 },
      clinicalSigns:
        'Near-terminal — respiratory muscles failing/paralysed, RR collapsing, airway flooded, profound hypoxia and bradycardia. Unopposed muscarinic/vagal tone. Pre-arrest: this is the last window for aggressive antidote + ventilation.',
      rhythm: 'Severe Sinus Bradycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 15,
      vitalChanges: { pulse: 0, respiration: 0, spo2: 40 },
      clinicalSigns:
        'Hypoxic bradyasystolic arrest from respiratory failure and unopposed cholinergic tone. No output. Begin CPR; continue atropine and pralidoxime — the rhythm will not recover until the cholinergic crisis is treated and the patient is oxygenated.',
      rhythm: 'Asystole',
      isCritical: true,
    },
  ],

  // --- SYMPTOMATIC BRADYCARDIA ---
  // Untreated symptomatic bradycardia (and medication-induced BB/CCB toxicity)
  // drifts down: the rate falls further, BP follows, GCS clouds, and the escape
  // rhythm fails into ventricular standstill / PEA arrest. Mirrors cardiac-015
  // (HR 32, 75/45, GCS 13) and cardiac-012 (HR 42, 88/55) as starting points.
  'bradycardia': [
    {
      triggerMinutes: 4,
      vitalChanges: { pulse: 36, bpSystolicDelta: -10, gcs: 13 },
      clinicalSigns: 'Rate slipping further, BP sagging, increasingly drowsy and confused. Peripheries cold, cap refill lengthening.',
      rhythm: 'Sinus Bradycardia',
    },
    {
      triggerMinutes: 10,
      vitalChanges: { pulse: 30, bpSystolicDelta: -20, spo2: 90, gcs: 10 },
      clinicalSigns: 'Decompensating — profound bradycardia with hypotension and poor perfusion. Pre-syncopal, barely rousable. Atropine alone failing against the medication blockade.',
      rhythm: 'Junctional Bradycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 16,
      vitalChanges: { pulse: 20, bpSystolicDelta: -35, spo2: 85, gcs: 6 },
      clinicalSigns: 'Agonal slow rhythm, unrecordable BP, near-arrest. Escape rhythm failing.',
      rhythm: 'Idioventricular',
      isCritical: true,
    },
    {
      triggerMinutes: 21,
      vitalChanges: { pulse: 0, bpSystolicDelta: -55, spo2: 70 },
      clinicalSigns: 'Ventricular standstill → PEA arrest. No palpable output. Start CPR; pace, adrenaline, and treat the cause (glucagon / calcium for BB-CCB toxicity).',
      rhythm: 'PEA',
      isCritical: true,
    },
  ],

  // --- COMPLETE (THIRD-DEGREE) HEART BLOCK ---
  // Untreated complete heart block (case cardiac-016: HR 28, 82/50, GCS 14) is one
  // failed escape beat from disaster: recurrent syncope as the escape rate falls,
  // then a ventricular pause that does not recover → asystole. Pacing is the only
  // reliable rescue — atropine does not capture an infranodal block.
  'heart-block': [
    {
      triggerMinutes: 3,
      vitalChanges: { pulse: 25, bpSystolicDelta: -12, gcs: 13 },
      clinicalSigns: 'Escape rate falling, BP dropping. Another syncopal episode — pale, sweaty, briefly unresponsive then rouses. Cannon A waves persist.',
      rhythm: 'Complete Heart Block',
      isCritical: true,
    },
    {
      triggerMinutes: 8,
      vitalChanges: { pulse: 18, bpSystolicDelta: -25, spo2: 86, gcs: 9 },
      clinicalSigns: 'Profound, broad-complex ventricular escape failing to perfuse. Recurrent syncope, hypotension, clouding consciousness. Atropine ineffective — capture with pacing NOW.',
      rhythm: 'Complete Heart Block',
      isCritical: true,
    },
    {
      triggerMinutes: 13,
      vitalChanges: { pulse: 0, bpSystolicDelta: -50, spo2: 65, gcs: 3 },
      clinicalSigns: 'Ventricular escape fails — asystolic arrest. No output. Begin CPR; transcutaneous pacing, adrenaline, urgent transvenous pacing.',
      rhythm: 'Asystole',
      isCritical: true,
    },
  ],

// ============================================================================
// PASTE-READY DeteriorationStage TIMELINES
// Insert into CASE_DETERIORATION_TIMELINES in src/data/clinicalRealism.ts
//
// DeteriorationStage shape (clinicalRealism.ts ~1027):
//   { triggerMinutes, vitalChanges: Partial<VitalSigns> & { bpSystolicDelta?, bpDiastolicDelta? },
//     clinicalSigns, rhythm?, isCritical? }
//
// Lookup (getCaseDeteriorationTimeline): resolves subcategory via SUBCATEGORY_ALIAS,
// then raw subcategory, then CATEGORY.
//   * Croup cases: subcategory 'croup' -> direct key 'croup'. OK.
//   * Burns cases: subcategories 'thermal-burns' / 'flash-burn' / 'scald' are NOT
//     in SUBCATEGORY_ALIAS, so lookup falls through to the CATEGORY key 'burns'.
//     One 'burns' timeline therefore serves ALL three burns cases. (The shared
//     untreated trajectory = burn shock ± inhalation airway loss, which is correct
//     for the worst-case of each.) No timeline-side alias entries are required.
//
// These describe the UNTREATED decline only.
// ============================================================================

  'croup': [
    {
      triggerMinutes: 4,
      vitalChanges: { respiration: 48, spo2: 90, pulse: 150 },
      clinicalSigns:
        'Child increasingly distressed and agitated — agitation worsens the dynamic upper-airway obstruction. Louder biphasic stridor, increasing sternal recession and tracheal tug. Keep calm: handling and crying are making it worse.',
    },
    {
      triggerMinutes: 9,
      vitalChanges: { respiration: 54, spo2: 84, pulse: 165, bpSystolicDelta: 5 },
      clinicalSigns:
        'Severe rising work of breathing — marked recession, head-bobbing, nasal flaring, air entry now reducing despite loud stridor (ominous). Pallor and early cyanosis. Needs nebulised adrenaline + steroid NOW.',
      isCritical: true,
    },
    {
      triggerMinutes: 14,
      vitalChanges: { respiration: 16, spo2: 74, pulse: 80, bpSystolicDelta: -10 },
      clinicalSigns:
        'EXHAUSTION — the child tires, stridor paradoxically quietens as air movement fails, respiratory rate and effort falling, becoming lethargic/obtunded. This quiet chest is pre-terminal, not improvement. Bradycardia developing.',
      rhythm: 'Sinus Bradycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 18,
      vitalChanges: { respiration: 4, spo2: 50, pulse: 0 },
      clinicalSigns:
        'Complete airway obstruction — respiratory arrest progressing to hypoxic cardiac arrest. PEA/asystole.',
      rhythm: 'PEA',
      isCritical: true,
    },
  ],

  'burns': [
    {
      triggerMinutes: 5,
      vitalChanges: { respiration: 30, spo2: 90, pulse: 130, bpSystolicDelta: -10 },
      clinicalSigns:
        'Burn shock beginning — plasma leaking into burned/interstitial tissue. Rising tachycardia, BP starting to drift down, cap refill prolonging. If inhalation injury: voice increasingly hoarse, soot in sputum, early inspiratory stridor as laryngeal oedema develops.',
    },
    {
      triggerMinutes: 12,
      vitalChanges: { respiration: 36, spo2: 84, pulse: 145, bpSystolicDelta: -25 },
      clinicalSigns:
        'Decompensating burn shock — hypotension, cool clammy non-burned skin, agitation. With inhalation injury the airway is critically narrowing (stridor at rest, swelling lips/tongue): the intubation window is closing. Aggressive Parkland fluids + early airway needed.',
      isCritical: true,
    },
    {
      triggerMinutes: 20,
      vitalChanges: { respiration: 8, spo2: 70, pulse: 160, bpSystolicDelta: -45, gcs: 8 },
      clinicalSigns:
        'Profound hypovolaemic shock and (if inhalation) near-complete airway obstruction with falling consciousness. Hypoxia + uncorrected volume loss — peri-arrest.',
      isCritical: true,
    },
    {
      triggerMinutes: 26,
      vitalChanges: { respiration: 0, spo2: 45, pulse: 0, bpSystolicDelta: -70 },
      clinicalSigns:
        'Cardiac arrest from combined airway loss (inhalation injury) and irreversible hypovolaemic burn shock. PEA/asystole.',
      rhythm: 'PEA',
      isCritical: true,
    },
  ],

// ============================================================================
// PASTE-READY DeteriorationStage TIMELINES
// Insert into CASE_DETERIORATION_TIMELINES in src/data/clinicalRealism.ts.
//
// DeteriorationStage shape (clinicalRealism.ts ~1027):
//   { triggerMinutes: number;
//     vitalChanges: Partial<VitalSigns> & { bpSystolicDelta?; bpDiastolicDelta? };
//     clinicalSigns: string; rhythm?: string; isCritical?: boolean }
// VitalSigns keys usable in vitalChanges: pulse, respiration, spo2, temperature,
//   gcs, bloodGlucose, etco2, painScore (+ bpSystolicDelta). (temperature used below
//   for the stimulant-toxidrome hyperthermia stage — same pattern as 'heat-stroke'.)
//
// Lookup: getCaseDeteriorationTimeline → resolveSubcategory(SUBCATEGORY_ALIAS) → exact
//   key on subcategory, else category. So:
//     'psychosis' ← psych-002, psych-003 (sub 'psychosis'); y2-008 via alias
//                   'acute-psychosis'→'psychosis'.
//     'panic'     ← y1-008 via alias 'panic-attack'→'panic'; y1-012 via alias
//                   'hyperventilation-syndrome'→'panic'. psych-001 has NO subcategory
//                   (category 'anxiety-related') → also key 'anxiety-related' below so
//                   the category-fallback lands on the benign panic course. (See notes.md.)
//     'choking'   ← resp-009 (sub 'choking').
// ============================================================================


  // --- ACUTE BEHAVIOURAL DISTURBANCE / PSYCHOSIS ---
  // Behavioural emergency: this is NOT a vital-collapse condition. Untreated SEVERE
  // agitation harms via sustained exertion → exhaustion, hyperthermia and rhabdo, not
  // via primary cardiorespiratory failure. Vitals drift MODESTLY (catecholamine
  // tachycardia/hypertension, gradual temp rise). The terminal stage models the
  // stimulant-toxidrome / excited-delirium branch where hyperthermia + acidosis tip
  // into arrest — kept LATE (15+ min) and explicitly flagged. GCS held high until the
  // pre-arrest stage (the patient is agitated-but-alert, not obtunded).
  'psychosis': [
    {
      triggerMinutes: 6,
      vitalChanges: { pulse: 140, respiration: 26, bpSystolicDelta: 15, temperature: 37.8 },
      clinicalSigns: 'Escalating agitation — pacing, shouting, sustained struggling. Catecholamine surge: tachycardia and BP climbing, diaphoresis worsening, core temperature beginning to rise. Still alert. De-escalation (and, if dangerous, single-agent sedation) needed before exhaustion sets in.',
    },
    {
      triggerMinutes: 12,
      vitalChanges: { pulse: 155, respiration: 30, bpSystolicDelta: 10, temperature: 39.2 },
      clinicalSigns: 'Sustained psychomotor exertion causing hyperthermia (>39°C), profuse sweating and early exhaustion. Metabolic acidosis from prolonged struggling; rhabdomyolysis risk rising (consider IV fluids). If this is a stimulant toxidrome / excited delirium, this is the pre-arrest window.',
      isCritical: true,
    },
    {
      triggerMinutes: 18,
      vitalChanges: { pulse: 170, respiration: 34, bpSystolicDelta: -20, temperature: 40.5, gcs: 11, spo2: 92 },
      clinicalSigns: 'Excited delirium / stimulant toxidrome decompensating — extreme hyperthermia (>40°C), exhaustion, sudden quieting and falling GCS (an OMINOUS sign), acidosis. This is the classic pre-arrest collapse: catecholamine storm + hyperthermia + acidosis. Aggressive cooling, fluids and airway support now.',
      rhythm: 'Sinus Tachycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 22,
      vitalChanges: { pulse: 0, spo2: 55, respiration: 0, bpSystolicDelta: -80, temperature: 40.5, gcs: 3 },
      clinicalSigns: 'Sudden cardiac arrest following excited-delirium hyperthermia and metabolic acidosis (the classic "sudden death" of restraint/stimulant agitation). Rhythm often PEA/asystole. Begin CPR, cool aggressively, correct acidosis. NEVER leave a struggling patient prone — positional asphyxia compounds this.',
      rhythm: 'PEA',
      isCritical: true,
    },
  ],

  // --- PANIC ATTACK / HYPERVENTILATION SYNDROME ---
  // BENIGN by design. A panic patient must NOT be destabilised by the generic clock —
  // so this timeline asserts a deliberately minimal, self-limiting course. The single
  // stage describes the EXPECTED settling/tiring of hyperventilation: numbers barely
  // move (SpO2 stays high-normal, mild tachy/tachypnoea persists or eases). Nothing is
  // marked isCritical; there is no decline to arrest. Keyed under 'panic' (via aliases)
  // AND 'anxiety-related' (psych-001's category, no subcategory → category fallback).
  'panic': [
    {
      triggerMinutes: 10,
      vitalChanges: { pulse: 105, respiration: 26, spo2: 99 },
      clinicalSigns: 'Symptoms persist but do NOT progress — this is a benign, self-limiting episode. Tachypnoea and tachycardia gradually ease as the panic peaks and settles; paraesthesia/carpopedal spasm resolve as breathing normalises. SpO2 remains high-normal throughout. No organic deterioration. Reassurance and coached breathing remain the treatment; exclude organic mimics but do not over-investigate.',
    },
  ],

  // psych-001 has category 'anxiety-related' with NO subcategory, so the timeline
  // lookup falls through to the CATEGORY key. Mirror the benign 'panic' course here so
  // psych-001 cannot be destabilised by a missing-key fallthrough. (Identical content.)
  'anxiety-related': [
    {
      triggerMinutes: 10,
      vitalChanges: { pulse: 105, respiration: 26, spo2: 99 },
      clinicalSigns: 'Symptoms persist but do NOT progress — benign, self-limiting panic/hyperventilation. Tachypnoea and tachycardia ease as the episode settles; perioral/peripheral tingling resolves as breathing normalises. SpO2 stays high-normal. No organic deterioration. Treat with reassurance and coached breathing; avoid high-flow oxygen and over-investigation.',
    },
  ],

  // --- CHOKING / FOREIGN BODY AIRWAY OBSTRUCTION (FBAO) ---
  // Untreated COMPLETE obstruction is FAST and lethal: no air entry → precipitous
  // hypoxia → loss of consciousness (the relax of muscle tone can itself help, but
  // physiologically the patient is now peri-arrest) → hypoxic cardiac arrest within a
  // few minutes. Chest stays ABSENT/silent throughout (nothing moves past the FB).
  // SpO2 and GCS crash; pulse rises briefly (hypoxic stress) then collapses.
  'choking': [
    {
      triggerMinutes: 1,
      vitalChanges: { spo2: 70, pulse: 140, respiration: 0, gcs: 13 },
      clinicalSigns: 'Complete obstruction — no air movement despite maximal effort. Universal choking sign, silent/absent cough, rapidly deepening cyanosis. Hypoxic tachycardia. Back blows then abdominal thrusts NOW; every second of delay costs oxygenation.',
    },
    {
      triggerMinutes: 2,
      vitalChanges: { spo2: 55, pulse: 150, respiration: 0, gcs: 7 },
      clinicalSigns: 'Profound hypoxia — patient losing consciousness and slumping. As tone is lost, lower to the ground, START CPR, look in the mouth and remove a VISIBLE foreign body with Magill forceps under laryngoscopy. Surgical airway if unrelievable.',
      isCritical: true,
    },
    {
      triggerMinutes: 3,
      vitalChanges: { spo2: 35, pulse: 40, respiration: 0, gcs: 3, bpSystolicDelta: -30 },
      clinicalSigns: 'Hypoxic bradycardia → peri-arrest. The airway is still obstructed. CPR ongoing, continue attempts to remove the FB; this is the final window before arrest.',
      rhythm: 'Sinus Bradycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 4,
      vitalChanges: { pulse: 0, spo2: 20, respiration: 0, gcs: 3 },
      clinicalSigns: 'Hypoxic cardiac arrest from unrelieved complete FBAO. Rhythm typically PEA → asystole. CPR (compressions help generate airway pressure), remove the FB (Magill/laryngoscopy) and oxygenate the instant the airway is clear; surgical cricothyroidotomy if it cannot be cleared.',
      rhythm: 'PEA',
      isCritical: true,
    },
  ],

};

/**
 * Get the deterioration timeline for a specific case
 */
export function getCaseDeteriorationTimeline(caseData: CaseScenario): DeteriorationStage[] {
  const subcategory = (caseData.subcategory || '').toLowerCase();
  const category = caseData.category.toLowerCase();
  const resolved = resolveSubcategory(subcategory);

  if (resolved && CASE_DETERIORATION_TIMELINES[resolved]) {
    return CASE_DETERIORATION_TIMELINES[resolved];
  }
  if (subcategory && CASE_DETERIORATION_TIMELINES[subcategory]) {
    return CASE_DETERIORATION_TIMELINES[subcategory];
  }
  if (CASE_DETERIORATION_TIMELINES[category]) {
    return CASE_DETERIORATION_TIMELINES[category];
  }
  return [];
}


// ============================================================================
// PHASE 4: TREATMENT QUALITY SCORING
// ============================================================================

/**
 * Evaluates the QUALITY of a treatment decision, not just whether it was done.
 * Returns a score from 0-100 and contextual feedback.
 */
export interface TreatmentQualityResult {
  score: number; // 0-100
  level: 'optimal' | 'acceptable' | 'suboptimal' | 'inappropriate' | 'harmful';
  feedback: string;
  yearLevelNote?: string; // Year-specific context
}

interface TreatmentQualityRule {
  treatmentId: string;
  /** Condition on current vitals that triggers this rule */
  condition: (vitals: VitalSigns, caseCategory: string, caseSubcategory: string) => boolean;
  /** Scoring result if condition is met */
  result: (year: StudentYear) => TreatmentQualityResult;
}

const TREATMENT_QUALITY_RULES: TreatmentQualityRule[] = [
  // --- OXYGEN THERAPY APPROPRIATENESS ---
  {
    treatmentId: 'oxygen_nonrebreather',
    condition: (vitals, _cat, sub) => vitals.spo2 >= 94 && (sub.includes('stem') || sub.includes('nstemi') || sub.includes('angina')),
    result: (year) => ({
      score: year === '1st-year' || year === '2nd-year' ? 70 : year === '3rd-year' ? 45 : 25,
      level: year === '1st-year' || year === '2nd-year' ? 'acceptable' : 'suboptimal',
      feedback: 'Patient SpO2 is >= 94%. High-flow O2 via NRB is not indicated for AMI with adequate saturation. Evidence shows hyperoxia in acute MI increases infarct size (AVOID-2, DETO2X-AMI trials). Nasal prongs titrated to 94-98% is the appropriate choice.',
      yearLevelNote: year === '1st-year'
        ? 'At your level, recognizing chest pain needs oxygen is good. As you progress, you will learn to titrate oxygen to target ranges.'
        : year === '4th-year' || year === 'diploma'
          ? 'At your level, you are expected to know that hyperoxia in AMI increases mortality. This is a significant clinical reasoning gap.'
          : undefined,
    }),
  },
  {
    treatmentId: 'oxygen_nonrebreather',
    condition: (vitals, _cat, sub) => vitals.spo2 >= 92 && sub.includes('copd'),
    result: (year) => ({
      score: year === '1st-year' ? 60 : year === '2nd-year' ? 40 : 20,
      level: year === '1st-year' ? 'acceptable' : 'inappropriate',
      feedback: 'COPD patient already at SpO2 >= 92%. High-flow O2 risks CO2 retention and narcosis. Target SpO2 88-92% with controlled oxygen delivery (nasal cannula 1-2L/min or Venturi mask 24-28%).',
      yearLevelNote: year === '1st-year'
        ? 'Oxygen management in COPD is a concept you will learn in Year 2. The key principle: some patients can be harmed by too much oxygen.'
        : year === '3rd-year' || year === '4th-year' || year === 'diploma'
          ? 'You should know the target SpO2 for COPD patients (88-92%) and the pathophysiology of hypoxic drive. This is a critical knowledge gap.'
          : undefined,
    }),
  },
  {
    treatmentId: 'oxygen_nasal',
    condition: (vitals, _cat, sub) => vitals.spo2 >= 94 && (sub.includes('stem') || sub.includes('nstemi')),
    result: (year) => ({
      score: year === '1st-year' || year === '2nd-year' ? 85 : 60,
      level: year === '1st-year' || year === '2nd-year' ? 'acceptable' : 'suboptimal',
      feedback: 'Patient SpO2 is already >= 94%. Current evidence does not support supplemental oxygen in AMI with adequate saturation. Monitor SpO2 and apply only if it drops below 94%.',
      yearLevelNote: year === '4th-year' || year === 'diploma'
        ? 'Evidence-based practice: withhold supplemental O2 if SpO2 >= 94% in AMI (AVOID, DETO2X-AMI). Monitor and apply only if saturation drops.'
        : undefined,
    }),
  },

  // --- GTN IN HYPOTENSION ---
  {
    treatmentId: 'gtn_spray',
    condition: (vitals) => parseInt(vitals.bp.split('/')[0]) < 90,
    result: () => ({
      score: 0,
      level: 'harmful',
      feedback: 'GTN is CONTRAINDICATED when systolic BP < 90mmHg. GTN causes vasodilation and further drops BP, potentially causing cardiovascular collapse. Always check BP before administering GTN.',
    }),
  },
  {
    treatmentId: 'gtn_spray',
    condition: (vitals, _cat, sub) => sub.includes('stem-inferior'),
    result: (year) => ({
      score: year === '3rd-year' ? 30 : 15,
      level: 'inappropriate',
      feedback: 'GTN in inferior STEMI is high-risk due to RV involvement. These patients are preload-dependent — GTN reduces preload and can cause severe hypotension. Check V4R first to rule out RV infarct.',
      yearLevelNote: year === '4th-year' || year === 'diploma'
        ? 'You are expected to know the association between inferior STEMI and RV involvement, and the risk of preload-reducing agents.'
        : undefined,
    }),
  },

  // --- FLUIDS IN HEART FAILURE ---
  {
    treatmentId: 'fluids_500ml',
    condition: (_vitals, _cat, sub) => sub.includes('heart-failure'),
    result: (year) => ({
      score: year === '3rd-year' ? 20 : 5,
      level: 'harmful',
      feedback: 'IV fluid bolus in acute heart failure worsens pulmonary congestion. The patient is already fluid-overloaded. This will cause flash pulmonary edema and respiratory failure.',
      yearLevelNote: year === '4th-year' || year === 'diploma'
        ? 'Understanding fluid status assessment is critical. Heart failure = too much fluid. Adding more is directly harmful.'
        : undefined,
    }),
  },
  {
    treatmentId: 'fluids_1000ml',
    condition: (_vitals, _cat, sub) => sub.includes('heart-failure'),
    result: () => ({
      score: 0,
      level: 'harmful',
      feedback: 'Large-volume fluid resuscitation in heart failure is DANGEROUS. This will cause acute pulmonary edema, respiratory failure, and potentially death.',
    }),
  },

  // --- OPIOIDS WITH RESPIRATORY DEPRESSION ---
  {
    treatmentId: 'morphine_5mg',
    condition: (vitals) => vitals.respiration <= 12,
    result: () => ({
      score: 10,
      level: 'harmful',
      feedback: 'Morphine given to patient with RR <= 12. This risks respiratory arrest. Opioids are contraindicated in respiratory depression. Have naloxone ready and prepare for BVM ventilation.',
    }),
  },
  {
    treatmentId: 'fentanyl_50mcg',
    condition: (vitals) => vitals.respiration <= 12,
    result: () => ({
      score: 10,
      level: 'harmful',
      feedback: 'Fentanyl given with RR <= 12. Risk of respiratory arrest. Monitor closely and prepare naloxone.',
    }),
  },

  // --- APPROPRIATE FLUID CHALLENGE IN HEMORRHAGE ---
  {
    treatmentId: 'fluids_250ml',
    condition: (_vitals, cat, sub) => cat === 'trauma' || sub.includes('hemorrhage') || sub.includes('pelvic'),
    result: (year) => ({
      score: year === '3rd-year' || year === '4th-year' ? 90 : 80,
      level: 'optimal',
      feedback: 'Cautious 250ml fluid bolus is the correct approach in hemorrhagic shock. Assess response before repeating. Permissive hypotension (SBP 80-90) may be appropriate in uncontrolled hemorrhage.',
      yearLevelNote: year === '4th-year' || year === 'diploma'
        ? 'Good clinical reasoning. Small-volume resuscitation reduces dilutional coagulopathy risk.'
        : undefined,
    }),
  },

  // --- GTN IN STROKE ---
  {
    treatmentId: 'gtn_spray',
    condition: (_vitals, _cat, sub) => sub.includes('cerebrovascular') || sub.includes('stroke'),
    result: (year) => ({
      score: year === '3rd-year' ? 25 : 10,
      level: 'harmful',
      feedback: 'GTN is generally AVOIDED in acute stroke. Rapid BP lowering can extend the ischemic penumbra and worsen outcomes. Permissive hypertension up to SBP 220 is the current standard.',
      yearLevelNote: year === '4th-year' || year === 'diploma'
        ? 'BP management in stroke is nuanced. You must understand permissive hypertension and the only role for acute BP lowering (thrombolysis threshold).'
        : undefined,
    }),
  },

  // --- EXCESSIVE O2 IN COPD (nasal cannula at high SpO2 still suboptimal) ---
  {
    treatmentId: 'oxygen_mask',
    condition: (vitals, _cat, sub) => vitals.spo2 >= 92 && sub.includes('copd'),
    result: (year) => ({
      score: year === '1st-year' ? 55 : year === '2nd-year' ? 35 : 15,
      level: year === '1st-year' ? 'acceptable' : 'suboptimal',
      feedback: 'COPD patient SpO2 >= 92%. Even a simple face mask delivers uncontrolled FiO2 (40-60%). Use nasal cannula at 1-2L/min or Venturi mask 24-28% to target 88-92%.',
    }),
  },

  // --- CALCIUM IN HYPERKALEMIA ---
  {
    treatmentId: 'calcium_chloride',
    condition: (_vitals, _cat, sub) => sub.includes('electrolyte') || sub.includes('hyperkal'),
    result: () => ({
      score: 95,
      level: 'optimal',
      feedback: 'Excellent: Calcium chloride is the correct first-line treatment for hyperkalemia with ECG changes. It stabilizes the cardiac membrane within minutes.',
    }),
  },

  // --- ADRENALINE TIMING IN ANAPHYLAXIS ---
  {
    treatmentId: 'adrenaline_im',
    condition: (_vitals, _cat, sub) => sub.includes('anaphylaxis'),
    result: () => ({
      score: 95,
      level: 'optimal',
      feedback: 'IM adrenaline 0.5mg is the single most important intervention in anaphylaxis. This should be given as early as possible. Well done.',
    }),
  },

  // --- FLUIDS IN SPINAL INJURY ---
  {
    treatmentId: 'fluids_1000ml',
    condition: (_vitals, _cat, sub) => sub.includes('spinal'),
    result: (year) => ({
      score: year === '3rd-year' ? 40 : 25,
      level: 'suboptimal',
      feedback: 'Large-volume fluid in neurogenic shock has limited effectiveness. The hypotension is from loss of sympathetic tone, not volume depletion. Vasopressors are the definitive treatment.',
      yearLevelNote: year === '4th-year' || year === 'diploma'
        ? 'Distinguishing neurogenic from hypovolemic shock is a key clinical reasoning skill at your level.'
        : undefined,
    }),
  },

  // --- NALOXONE IN OVERDOSE ---
  {
    treatmentId: 'naloxone_04mg',
    condition: (_vitals, _cat, sub) => sub.includes('overdose') || sub.includes('opioid'),
    result: () => ({
      score: 90,
      level: 'optimal',
      feedback: 'Naloxone is the specific antidote for opioid toxicity. Remember to titrate to respiratory effort (RR > 12), NOT full consciousness. Over-reversal causes acute withdrawal, agitation, and vomiting with aspiration risk.',
    }),
  },

  // --- MIDAZOLAM IN SEIZURE ---
  {
    treatmentId: 'midazolam_5mg',
    condition: (_vitals, _cat, sub) => sub.includes('seizure'),
    result: (year) => ({
      score: 95,
      level: 'optimal',
      feedback: 'Midazolam is first-line for prolonged seizures (> 5 minutes). IM or buccal route is appropriate prehospitally. Good decision.',
      yearLevelNote: year === '4th-year' || year === 'diploma'
        ? 'Excellent clinical reasoning. Remember: status epilepticus is defined as seizure > 5 minutes or two seizures without regaining consciousness.'
        : undefined,
    }),
  },

  // --- GTN IN HYPERTENSIVE EMERGENCY ---
  {
    treatmentId: 'gtn_spray',
    condition: (_vitals, _cat, sub) => sub.includes('hypertensive'),
    result: (year) => ({
      score: 85,
      level: 'optimal',
      feedback: 'GTN provides controlled BP reduction in hypertensive emergency. Target 20-25% reduction in first hour — avoid precipitous drops which risk cerebral hypoperfusion.',
      yearLevelNote: year === '4th-year' || year === 'diploma'
        ? 'Good: controlled reduction is key. Aggressive lowering risks watershed infarcts. Monitor BP every 5 minutes during treatment.'
        : undefined,
    }),
  },

  // --- FLUIDS IN HYPERTENSIVE EMERGENCY ---
  {
    treatmentId: 'fluids_500ml',
    condition: (_vitals, _cat, sub) => sub.includes('hypertensive'),
    result: (year) => ({
      score: year === '3rd-year' ? 30 : 15,
      level: 'inappropriate',
      feedback: 'IV fluid bolus in hypertensive emergency increases intravascular volume and worsens hypertension. The BP is already dangerously elevated — adding volume is counterproductive.',
      yearLevelNote: year === '4th-year' || year === 'diploma'
        ? 'Fluid management in hypertensive emergencies requires understanding that the problem is excessive afterload/pressure, not volume depletion.'
        : undefined,
    }),
  },

  // --- LARGE-VOLUME FLUIDS IN MULTI-TRAUMA WITHOUT HEMORRHAGE CONTROL ---
  {
    treatmentId: 'fluids_1000ml',
    condition: (_vitals, _cat, sub) => sub.includes('multi-trauma') || sub.includes('chest-trauma') || sub.includes('abdominal-trauma'),
    result: (year) => ({
      score: year === '3rd-year' ? 35 : 20,
      level: 'suboptimal',
      feedback: 'Large-volume crystalloid in trauma without hemorrhage control risks dilutional coagulopathy and "popping the clot." Use small-volume (250ml) boluses, assess response, and target permissive hypotension (SBP 80-90).',
      yearLevelNote: year === '4th-year' || year === 'diploma'
        ? 'Damage control resuscitation: permissive hypotension, minimal crystalloid, TXA, and rapid surgical transfer. This is core diploma-level knowledge.'
        : undefined,
    }),
  },

  // --- APPROPRIATE TXA IN HEMORRHAGE ---
  {
    treatmentId: 'txa_1g',
    condition: (_vitals, cat, sub) => cat === 'trauma' || sub.includes('hemorrhage') || sub.includes('pelvic'),
    result: () => ({
      score: 92,
      level: 'optimal',
      feedback: 'TXA within 3 hours of injury reduces mortality in hemorrhagic trauma (CRASH-2). Best given as early as possible. Well done.',
    }),
  },

  // --- DEFIBRILLATION IN CARDIAC ARREST ---
  {
    treatmentId: 'defibrillation',
    condition: (_vitals, _cat, sub) => sub.includes('vfib') || sub.includes('cardiac-arrest'),
    result: () => ({
      score: 95,
      level: 'optimal',
      feedback: 'Early defibrillation is the single most important intervention in VF/pulseless VT arrest. Every minute without defibrillation reduces survival by 7-10%.',
    }),
  },

  // --- ASPIRIN IN ACS ---
  {
    treatmentId: 'aspirin',
    condition: (_vitals, _cat, sub) => sub.includes('stem') || sub.includes('nstemi') || sub.includes('coronary') || sub.includes('afib'),
    result: () => ({
      score: 90,
      level: 'optimal',
      feedback: 'Aspirin 300mg is a cornerstone of ACS management. Inhibits platelet aggregation and reduces mortality. Should be given as early as possible.',
    }),
  },
];

/**
 * Evaluate the quality of a treatment decision
 */
export function evaluateTreatmentQuality(
  treatmentId: string,
  currentVitals: VitalSigns,
  caseData: CaseScenario,
  studentYear: StudentYear,
): TreatmentQualityResult | null {
  const caseCategory = caseData.category.toLowerCase();
  const caseSubcategory = (caseData.subcategory || '').toLowerCase();

  for (const rule of TREATMENT_QUALITY_RULES) {
    if (rule.treatmentId === treatmentId && rule.condition(currentVitals, caseCategory, caseSubcategory)) {
      return rule.result(studentYear);
    }
  }

  return null; // No specific quality rule applies — treatment is standard
}


// ============================================================================
// PHASE 5: ENHANCED YEAR-AWARE, CASE-AWARE FEEDBACK
// ============================================================================

export interface EnhancedFeedbackItem {
  /** The feedback message */
  message: string;
  /** Year-appropriate learning guidance */
  guidance: string;
  /** Severity of the gap */
  severity: 'critical' | 'important' | 'minor' | 'informational';
  /** Recommended learning resources */
  resources: FeedbackResource[];
  /** Case-specific context */
  caseContext?: string;
  /** Treatment timing assessment */
  timingNote?: string;
}

export interface FeedbackResource {
  title: string;
  type: 'guideline' | 'protocol' | 'article' | 'video' | 'textbook';
  description: string;
  /** Whether this is appropriate for the student's year level */
  yearLevels: StudentYear[];
}

/**
 * Common clinical resources mapped by topic for debrief
 */
const CLINICAL_RESOURCES: Record<string, FeedbackResource[]> = {
  'oxygen-therapy': [
    { title: 'BTS Guideline for Oxygen Use in Adults', type: 'guideline', description: 'British Thoracic Society guidelines on target SpO2 ranges and oxygen delivery devices', yearLevels: ['2nd-year', '3rd-year', '4th-year'] },
    { title: 'AVOID Trial (2015)', type: 'article', description: 'Supplemental O2 in AMI — showed increased infarct size with high-flow O2 in STEMI', yearLevels: ['3rd-year', '4th-year'] },
    { title: 'DETO2X-AMI Trial (2017)', type: 'article', description: 'No benefit of supplemental O2 in suspected MI with SpO2 >= 90%', yearLevels: ['4th-year'] },
    { title: 'Oxygen Delivery Devices - Basics', type: 'textbook', description: 'Nasal cannula, simple mask, NRB — FiO2 ranges and indications', yearLevels: ['1st-year', '2nd-year', 'diploma'] },
  ],
  'ami-management': [
    { title: 'AHA/ACC STEMI Guidelines', type: 'guideline', description: 'Door-to-balloon time targets, dual antiplatelet therapy, reperfusion strategy', yearLevels: ['3rd-year', '4th-year'] },
    { title: 'Prehospital STEMI Care Bundle', type: 'protocol', description: 'Aspirin, 12-lead ECG, pre-alert, pain management, oxygen titration', yearLevels: ['3rd-year', '4th-year'] },
    { title: 'Chest Pain Assessment (OPQRST)', type: 'textbook', description: 'Structured pain assessment for cardiac presentations', yearLevels: ['1st-year', '2nd-year', 'diploma'] },
  ],
  'airway-management': [
    { title: 'Basic Airway Management', type: 'textbook', description: 'Head tilt-chin lift, jaw thrust, recovery position, suction', yearLevels: ['1st-year', '2nd-year', 'diploma'] },
    { title: 'Airway Adjuncts and Advanced Airways', type: 'textbook', description: 'OPA, NPA, SGA, ETT selection and insertion', yearLevels: ['2nd-year', '3rd-year', '4th-year'] },
    { title: 'Difficult Airway Algorithm', type: 'protocol', description: 'Stepwise approach to unanticipated difficult intubation', yearLevels: ['4th-year'] },
  ],
  'hemorrhage-control': [
    { title: 'MARCH Algorithm', type: 'protocol', description: 'Massive hemorrhage, Airway, Respiration, Circulation, Hypothermia — trauma priorities', yearLevels: ['2nd-year', '3rd-year', '4th-year'] },
    { title: 'Tourniquet Application', type: 'textbook', description: 'Indications, high-and-tight placement, time documentation', yearLevels: ['2nd-year', '3rd-year', '4th-year'] },
    { title: 'Permissive Hypotension in Trauma', type: 'article', description: 'Evidence for SBP targets of 80-90mmHg in uncontrolled hemorrhage', yearLevels: ['4th-year'] },
  ],
  'respiratory-emergencies': [
    { title: 'BTS/SIGN Asthma Guideline', type: 'guideline', description: 'Severity scoring, step-up treatment, life-threatening features', yearLevels: ['2nd-year', '3rd-year', '4th-year'] },
    { title: 'GOLD COPD Guidelines', type: 'guideline', description: 'Acute exacerbation management, controlled O2, NIV criteria', yearLevels: ['3rd-year', '4th-year'] },
    { title: 'Pneumothorax Management', type: 'protocol', description: 'Tension pneumothorax recognition, needle decompression landmarks', yearLevels: ['2nd-year', '3rd-year', '4th-year'] },
  ],
  'anaphylaxis': [
    { title: 'Resuscitation Council UK Anaphylaxis Algorithm', type: 'guideline', description: 'IM adrenaline 0.5mg, positioning, fluid resuscitation, second-line agents', yearLevels: ['2nd-year', '3rd-year', '4th-year'] },
    { title: 'Anaphylaxis vs Allergic Reaction', type: 'textbook', description: 'Differentiation, grading severity, when to give adrenaline', yearLevels: ['1st-year', '2nd-year', 'diploma'] },
  ],
  'cardiac-arrest': [
    { title: 'ALS Algorithm', type: 'guideline', description: 'Shockable vs non-shockable rhythms, drug timings, reversible causes (4Hs/4Ts)', yearLevels: ['3rd-year', '4th-year'] },
    { title: 'BLS Algorithm', type: 'guideline', description: 'CPR quality, ratio 30:2, AED use, chain of survival', yearLevels: ['1st-year', '2nd-year', 'diploma'] },
    { title: 'Post-ROSC Care Bundle', type: 'protocol', description: 'Targeted temperature management, coronary angiography, neuroprotection', yearLevels: ['4th-year'] },
  ],
  'fluid-resuscitation': [
    { title: 'IV Fluid Therapy in Adults', type: 'guideline', description: 'Crystalloid selection, bolus volumes, reassessment after each bolus', yearLevels: ['3rd-year', '4th-year'] },
    { title: 'Fluid Challenge Technique', type: 'textbook', description: '250ml over 10-15 min, assess response before repeating', yearLevels: ['3rd-year', '4th-year'] },
  ],
  'neurological': [
    { title: 'GCS Assessment', type: 'textbook', description: 'Eye, Verbal, Motor scoring with common pitfalls', yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'] },
    { title: 'FAST Stroke Assessment', type: 'protocol', description: 'Face, Arms, Speech, Time — rapid stroke screening', yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'] },
    { title: 'Raised ICP Management', type: 'guideline', description: 'Head elevation, avoid hypotension, osmotic therapy, hyperventilation (short-term)', yearLevels: ['4th-year'] },
  ],
  'pain-management': [
    { title: 'WHO Pain Ladder - Prehospital Adaptation', type: 'guideline', description: 'Paracetamol, NSAIDs, opioids — stepwise approach to analgesia', yearLevels: ['2nd-year', '3rd-year', '4th-year'] },
    { title: 'Intranasal Fentanyl', type: 'protocol', description: 'Non-IV opioid option, rapid onset, dose titration', yearLevels: ['3rd-year', '4th-year'] },
  ],
  'scene-safety': [
    { title: 'Scene Safety Assessment Framework', type: 'textbook', description: 'Hazards, resources, mechanism, patient count — systematic approach', yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'] },
    { title: 'PPE Selection Guide', type: 'protocol', description: 'Gloves, masks, eye protection — when and what', yearLevels: ['1st-year', '2nd-year', 'diploma'] },
  ],
  'stroke': [
    { title: 'FAST Stroke Assessment', type: 'protocol', description: 'Face drooping, Arm weakness, Speech difficulty, Time to call — rapid screening', yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'] },
    { title: 'Prehospital Stroke Pathway', type: 'guideline', description: 'Time-critical pathway: recognition, pre-alert, BP management, glucose check', yearLevels: ['3rd-year', '4th-year'] },
    { title: 'BP Management in Stroke', type: 'article', description: 'Permissive hypertension, thrombolysis thresholds, when to treat acutely', yearLevels: ['4th-year'] },
  ],
  'spinal-injury': [
    { title: 'Spinal Motion Restriction Guidelines', type: 'guideline', description: 'NEXUS/Canadian C-Spine rules, selective immobilisation, vacuum mattress', yearLevels: ['2nd-year', '3rd-year', '4th-year'] },
    { title: 'Neurogenic vs Hypovolemic Shock', type: 'textbook', description: 'Differentiating shock types: warm/dry vs cold/clammy, HR patterns, treatment differences', yearLevels: ['3rd-year', '4th-year'] },
  ],
  'toxicology': [
    { title: 'Toxidromes Recognition', type: 'textbook', description: 'Opioid, sympathomimetic, anticholinergic, cholinergic — pattern recognition', yearLevels: ['3rd-year', '4th-year'] },
    { title: 'Naloxone Administration Protocol', type: 'protocol', description: 'Titrate to respiratory effort, IM/IV/IN routes, repeat dosing intervals', yearLevels: ['2nd-year', '3rd-year', '4th-year'] },
  ],
  'electrolyte': [
    { title: 'Hyperkalemia Emergency Protocol', type: 'guideline', description: 'Calcium chloride → insulin/dextrose → salbutamol → sodium bicarbonate pathway', yearLevels: ['4th-year'] },
    { title: 'ECG Changes in Electrolyte Disorders', type: 'textbook', description: 'Peaked T-waves, wide QRS, sine wave — recognizing life-threatening patterns', yearLevels: ['3rd-year', '4th-year'] },
  ],
  'hypothermia': [
    { title: 'Hypothermia Classification and Management', type: 'guideline', description: 'Swiss staging system, rewarming strategies, cardiac arrest in hypothermia', yearLevels: ['3rd-year', '4th-year'] },
    { title: 'Avalanche Victim Protocol', type: 'protocol', description: 'Burial time, airway patency, core temperature — triage and rewarming', yearLevels: ['4th-year'] },
  ],
};

/**
 * Get relevant resources for a case based on category and missed checklist items
 */
export function getResourcesForCase(
  caseData: CaseScenario,
  missedCategories: string[],
  studentYear: StudentYear,
): FeedbackResource[] {
  const resources: FeedbackResource[] = [];
  const category = caseData.category.toLowerCase();
  const subcategory = (caseData.subcategory || '').toLowerCase();

  // Map case characteristics to resource topics
  const topicMap: Record<string, string[]> = {
    'cardiac': ['ami-management', 'pain-management'],
    'cardiac-ecg': ['ami-management'],
    'respiratory': ['respiratory-emergencies', 'oxygen-therapy'],
    'trauma': ['hemorrhage-control', 'pain-management'],
    'neurological': ['neurological', 'stroke'],
    'environmental': ['anaphylaxis'],
    'toxicology': ['toxicology'],
    'metabolic': ['neurological'],
  };

  // Add category-specific resources
  const topics = topicMap[category] || [];
  if (subcategory.includes('stem') || subcategory.includes('nstemi') || subcategory.includes('coronary')) topics.push('ami-management', 'oxygen-therapy');
  if (subcategory.includes('asthma') || subcategory.includes('copd')) topics.push('respiratory-emergencies', 'oxygen-therapy');
  if (subcategory.includes('arrest') || subcategory.includes('vfib')) topics.push('cardiac-arrest');
  if (subcategory.includes('anaphylaxis')) topics.push('anaphylaxis');
  if (subcategory.includes('hemorrhage') || subcategory.includes('pelvic')) topics.push('hemorrhage-control', 'fluid-resuscitation');
  if (subcategory.includes('cerebrovascular') || subcategory.includes('stroke')) topics.push('stroke', 'neurological');
  if (subcategory.includes('spinal')) topics.push('spinal-injury');
  if (subcategory.includes('overdose') || subcategory.includes('opioid')) topics.push('toxicology');
  if (subcategory.includes('electrolyte') || subcategory.includes('hyperkal')) topics.push('electrolyte');
  if (subcategory.includes('hypothermia')) topics.push('hypothermia');
  if (subcategory.includes('head-injury')) topics.push('neurological');
  if (subcategory.includes('chest-trauma')) topics.push('hemorrhage-control', 'respiratory-emergencies');
  if (subcategory.includes('abdominal-trauma')) topics.push('hemorrhage-control', 'fluid-resuscitation');
  if (subcategory.includes('multi-trauma')) topics.push('hemorrhage-control', 'fluid-resuscitation', 'pain-management');
  if (subcategory.includes('seizure')) topics.push('neurological');
  if (subcategory.includes('hypertensive')) topics.push('ami-management');
  if (subcategory.includes('afib') || subcategory.includes('aflutter')) topics.push('ami-management');
  if (subcategory.includes('hypoglycemia')) topics.push('neurological');
  if (subcategory.includes('pulmonary-embolism')) topics.push('respiratory-emergencies', 'fluid-resuscitation');

  // Add resources based on what was missed
  if (missedCategories.includes('safety')) topics.push('scene-safety');
  if (missedCategories.includes('airway')) topics.push('airway-management');
  if (missedCategories.includes('intervention') || missedCategories.includes('medication')) topics.push('fluid-resuscitation');

  // Deduplicate and collect
  const uniqueTopics = [...new Set(topics)];
  for (const topic of uniqueTopics) {
    const topicResources = CLINICAL_RESOURCES[topic] || [];
    for (const resource of topicResources) {
      if (resource.yearLevels.includes(studentYear) && !resources.some(r => r.title === resource.title)) {
        resources.push(resource);
      }
    }
  }

  return resources;
}

/**
 * Generate year-aware guidance text for a specific gap
 */
export function generateYearAwareGuidance(
  gapDescription: string,
  category: string,
  studentYear: StudentYear,
): string {
  const yearGuidance: Record<StudentYear, (gap: string, cat: string) => string> = {
    '1st-year': (gap, cat) =>
      `Focus area: ${gap}. At this stage, the priority is building a safe, systematic approach. Practice your ${cat === 'safety' ? 'scene safety checklist' : cat === 'abcde' ? 'ABCDE sequence' : cat === 'history' ? 'SAMPLE/OPQRST history taking' : 'basic assessment skills'} until they become automatic.`,
    '2nd-year': (gap, cat) =>
      `Improvement area: ${gap}. You should be able to ${cat === 'abcde' ? 'complete a full ABCDE without prompting' : cat === 'secondary' ? 'perform a thorough secondary survey' : cat === 'intervention' ? 'identify when basic interventions are needed' : 'recognize key abnormalities and document them'}. Review the systematic approach and practice with peer assessment.`,
    '3rd-year': (gap, cat) =>
      `Clinical reasoning gap: ${gap}. At your level, you should ${cat === 'intervention' || cat === 'medication' ? 'identify time-critical treatments and initiate them without delay' : cat === 'clinical-reasoning' ? 'formulate a differential diagnosis and adjust your management accordingly' : 'integrate assessment findings with clinical decision-making'}. Consider why this step matters for patient outcome.`,
    '4th-year': (gap, cat) =>
      `Professional standard gap: ${gap}. As a near-independent practitioner, you are expected to ${cat === 'intervention' || cat === 'medication' ? 'manage complex pharmacology including contraindications, dose adjustment, and anticipating complications' : cat === 'team-lead' || cat === 'communication' ? 'lead the team effectively, delegate tasks, and communicate clearly with receiving facilities' : 'demonstrate expert-level clinical reasoning with justification for all decisions'}.`,
    'diploma': (gap, cat) =>
      `Practice-readiness concern: ${gap}. At diploma level, this represents a ${cat === 'safety' || cat === 'airway' ? 'fundamental gap that must be addressed before independent practice' : 'gap in clinical competency that requires focused revision and supervised practice'}. Seek mentorship and additional clinical exposure in this area.`,
  };

  return yearGuidance[studentYear](gapDescription, category);
}

/**
 * Assess treatment timing — was this intervention given within the expected timeframe?
 */
export function assessTreatmentTiming(
  treatmentId: string,
  timeGivenSeconds: number,
  caseData: CaseScenario,
): { isOnTime: boolean; expectedSeconds: number; feedback: string } | null {
  // Critical treatment timing expectations (seconds from case start)
  const timingExpectations: Record<string, { maxSeconds: number; description: string }> = {
    aspirin: { maxSeconds: 300, description: 'Aspirin should be given within 5 minutes for suspected ACS' },
    adrenaline_1mg: { maxSeconds: 180, description: 'Adrenaline should be given as soon as cardiac arrest or anaphylaxis is identified' },
    adrenaline_im: { maxSeconds: 120, description: 'IM adrenaline in anaphylaxis should be given within 2 minutes of recognition' },
    needle_decompression: { maxSeconds: 120, description: 'Needle decompression for tension PTX is immediately life-saving — within 2 minutes' },
    defibrillation: { maxSeconds: 120, description: 'First shock for VF/pVT should be delivered within 2 minutes' },
    cpr: { maxSeconds: 60, description: 'CPR must begin within 1 minute of recognizing cardiac arrest' },
    glucose_10g: { maxSeconds: 300, description: 'Glucose correction should begin within 5 minutes of identifying hypoglycemia' },
    glucagon_1mg: { maxSeconds: 300, description: 'Glucagon should be given within 5 minutes if IV access unavailable' },
    dextrose_10: { maxSeconds: 300, description: 'IV dextrose should be given within 5 minutes for severe hypoglycemia' },
    naloxone_04mg: { maxSeconds: 180, description: 'Naloxone should be given within 3 minutes for opioid overdose with respiratory depression' },
    calcium_chloride: { maxSeconds: 180, description: 'Calcium chloride for hyperkalemia with ECG changes should be given within 3 minutes' },
    bleeding_control: { maxSeconds: 120, description: 'Direct pressure on life-threatening hemorrhage should be applied within 2 minutes' },
    tourniquet: { maxSeconds: 120, description: 'Tourniquet for uncontrollable limb hemorrhage should be applied within 2 minutes' },
    midazolam_5mg: { maxSeconds: 300, description: 'Midazolam for status epilepticus should be given within 5 minutes of identifying prolonged seizure' },
    gtn_spray: { maxSeconds: 300, description: 'GTN should be given within 5 minutes for ACS or hypertensive emergency (after BP check)' },
    txa_1g: { maxSeconds: 600, description: 'TXA should be given within 10 minutes for major hemorrhage — most effective within first 3 hours post-injury' },
    amiodarone_300mg: { maxSeconds: 300, description: 'Amiodarone should be given after 3rd shock in shockable arrest or within 5 minutes for unstable arrhythmia' },
  };

  const expectation = timingExpectations[treatmentId];
  if (!expectation) return null;

  // Check if this treatment is relevant to the case
  const sub = (caseData.subcategory || '').toLowerCase();
  const cat = caseData.category.toLowerCase();
  const isRelevant =
    (treatmentId === 'aspirin' && (sub.includes('stem') || sub.includes('nstemi') || sub.includes('coronary') || cat === 'cardiac')) ||
    (treatmentId.includes('adrenaline') && (sub.includes('anaphylaxis') || sub.includes('arrest') || sub.includes('vfib'))) ||
    (treatmentId === 'needle_decompression' && sub.includes('pneumothorax')) ||
    (treatmentId === 'defibrillation' && (sub.includes('arrest') || sub.includes('vfib'))) ||
    (treatmentId === 'cpr' && (sub.includes('arrest') || sub.includes('vfib'))) ||
    ((treatmentId.includes('glucose') || treatmentId.includes('dextrose')) && sub.includes('hypoglycemia')) ||
    (treatmentId === 'glucagon_1mg' && sub.includes('hypoglycemia')) ||
    (treatmentId === 'naloxone_04mg' && (sub.includes('overdose') || sub.includes('opioid') || cat === 'toxicology')) ||
    (treatmentId === 'calcium_chloride' && (sub.includes('electrolyte') || sub.includes('hyperkal'))) ||
    ((treatmentId === 'bleeding_control' || treatmentId === 'tourniquet') && (sub.includes('hemorrhage') || sub.includes('pelvic') || cat === 'trauma')) ||
    (treatmentId === 'midazolam_5mg' && sub.includes('seizure')) ||
    (treatmentId === 'gtn_spray' && (sub.includes('stem') || sub.includes('nstemi') || sub.includes('coronary') || sub.includes('hypertensive'))) ||
    (treatmentId === 'txa_1g' && (cat === 'trauma' || sub.includes('hemorrhage') || sub.includes('pelvic'))) ||
    (treatmentId === 'amiodarone_300mg' && (sub.includes('arrest') || sub.includes('vfib') || sub.includes('afib') || sub.includes('svt')));

  if (!isRelevant) return null;

  const isOnTime = timeGivenSeconds <= expectation.maxSeconds;
  const feedback = isOnTime
    ? `Good timing: ${expectation.description}. You achieved this in ${Math.round(timeGivenSeconds / 60)} min ${timeGivenSeconds % 60}s.`
    : `Delayed: ${expectation.description}. You gave this at ${Math.round(timeGivenSeconds / 60)} min ${timeGivenSeconds % 60}s — ${Math.round((timeGivenSeconds - expectation.maxSeconds) / 60)} minutes late. Earlier intervention improves outcomes.`;

  return { isOnTime, expectedSeconds: expectation.maxSeconds, feedback };
}
