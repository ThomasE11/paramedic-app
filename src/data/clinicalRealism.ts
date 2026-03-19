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
export const TREATMENT_YEAR_ACCESS: Record<string, StudentYear[]> = {
  // ----- AIRWAY -----
  airway_open:          ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  suction:              ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  opa_insert:           ['2nd-year', '3rd-year', '4th-year', 'diploma'],
  intubation:           ['4th-year', 'diploma'],

  // ----- BREATHING -----
  oxygen_nasal:         ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  oxygen_mask:          ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  oxygen_nonrebreather: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  bvm_ventilation:      ['2nd-year', '3rd-year', '4th-year', 'diploma'],
  nebulizer_salbutamol: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  nebulizer_ipratropium:['3rd-year', '4th-year', 'diploma'],
  cpap_niv:             ['4th-year', 'diploma'],
  needle_decompression: ['3rd-year', '4th-year', 'diploma'],

  // ----- CIRCULATION -----
  iv_access:            ['3rd-year', '4th-year', 'diploma'],
  fluids_250ml:         ['3rd-year', '4th-year', 'diploma'],
  fluids_500ml:         ['3rd-year', '4th-year', 'diploma'],
  fluids_1000ml:        ['4th-year', 'diploma'],
  bleeding_control:     ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  tourniquet:           ['2nd-year', '3rd-year', '4th-year', 'diploma'],
  cpr:                  ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  defibrillation:       ['3rd-year', '4th-year', 'diploma'],

  // ----- MEDICATIONS -----
  aspirin:              ['3rd-year', '4th-year', 'diploma'],
  gtn_spray:            ['3rd-year', '4th-year', 'diploma'],
  morphine_5mg:         ['4th-year', 'diploma'],
  fentanyl_50mcg:       ['4th-year', 'diploma'],
  adrenaline_1mg:       ['3rd-year', '4th-year', 'diploma'],
  adrenaline_im:        ['3rd-year', '4th-year', 'diploma'],
  atropine_05mg:        ['4th-year', 'diploma'],
  adenosine_6mg:        ['4th-year', 'diploma'],
  amiodarone_300mg:     ['4th-year', 'diploma'],
  glucose_10g:          ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  glucagon_1mg:         ['2nd-year', '3rd-year', '4th-year', 'diploma'],
  dextrose_10:          ['3rd-year', '4th-year', 'diploma'],
  midazolam_5mg:        ['4th-year', 'diploma'],
  naloxone_04mg:        ['3rd-year', '4th-year', 'diploma'],
  txa_1g:               ['3rd-year', '4th-year', 'diploma'],
  hydrocortisone_200mg: ['4th-year', 'diploma'],
  magnesium_2g:         ['4th-year', 'diploma'],
  ondansetron_4mg:      ['3rd-year', '4th-year', 'diploma'],
  calcium_chloride_10:  ['4th-year', 'diploma'],

  // ----- POSITIONING -----
  supine_position:      ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  recovery_position:    ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  fowlers_position:     ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  left_lateral_tilt:    ['2nd-year', '3rd-year', '4th-year', 'diploma'],
  leg_elevation:        ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],

  // ----- COMFORT/OTHER -----
  warming_blanket:      ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  active_cooling:       ['2nd-year', '3rd-year', '4th-year', 'diploma'],
  splinting:            ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  reassurance:          ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  calm_environment:     ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
  family_presence:      ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'],
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
      spo2Ceiling: 99,
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
      spo2Ceiling: 99,
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
      treatmentId: 'calcium_chloride_10',
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
      rhythm: 'Sinus Tachycardia with PVCs',
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

  'stem-inferior': [
    {
      triggerMinutes: 5,
      vitalChanges: { pulse: 50, spo2: 93, bpSystolicDelta: -10 },
      clinicalSigns: 'Vagal response — bradycardia developing, nausea, diaphoresis',
      rhythm: 'Sinus Bradycardia',
    },
    {
      triggerMinutes: 10,
      vitalChanges: { pulse: 42, spo2: 90, bpSystolicDelta: -25 },
      clinicalSigns: 'Significant bradycardia, JVD if RV involvement, hypotension worsening',
      rhythm: 'Sinus Bradycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 15,
      vitalChanges: { pulse: 35, spo2: 85, bpSystolicDelta: -40, respiration: 28 },
      clinicalSigns: 'Complete heart block developing, profound hypotension, altered mental status',
      rhythm: 'Third Degree Heart Block',
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

  'pulmonary-embolism': [
    {
      triggerMinutes: 5,
      vitalChanges: { pulse: 130, spo2: 85, bpSystolicDelta: -10, respiration: 30 },
      clinicalSigns: 'Increasing dyspnea, pleuritic chest pain, tachycardia, anxiety',
    },
    {
      triggerMinutes: 10,
      vitalChanges: { pulse: 145, spo2: 75, bpSystolicDelta: -25, respiration: 35 },
      clinicalSigns: 'RV strain — distended neck veins, S1Q3T3 on ECG, worsening hypoxia',
      isCritical: true,
    },
    {
      triggerMinutes: 15,
      vitalChanges: { pulse: 160, spo2: 60, bpSystolicDelta: -45 },
      clinicalSigns: 'Massive PE — obstructive shock, PEA arrest imminent',
      rhythm: 'Sinus Tachycardia',
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
  'electrolyte': [
    {
      triggerMinutes: 5,
      vitalChanges: { pulse: 55, bpSystolicDelta: -5 },
      clinicalSigns: 'Muscle weakness, paresthesias, peaked T-waves on monitor, mild bradycardia',
    },
    {
      triggerMinutes: 12,
      vitalChanges: { pulse: 45, bpSystolicDelta: -15 },
      clinicalSigns: 'Widening QRS, bradycardia worsening, risk of sine-wave pattern',
      rhythm: 'Sinus Bradycardia',
      isCritical: true,
    },
    {
      triggerMinutes: 18,
      vitalChanges: { pulse: 0, spo2: 60 },
      clinicalSigns: 'Cardiac arrest from hyperkalemia — sine-wave → VF/asystole. Give calcium chloride STAT.',
      rhythm: 'Ventricular Fibrillation',
      isCritical: true,
    },
  ],

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
    treatmentId: 'calcium_chloride_10',
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
    { title: 'BTS Guideline for Oxygen Use in Adults', type: 'guideline', description: 'British Thoracic Society guidelines on target SpO2 ranges and oxygen delivery devices', yearLevels: ['2nd-year', '3rd-year', '4th-year', 'diploma'] },
    { title: 'AVOID Trial (2015)', type: 'article', description: 'Supplemental O2 in AMI — showed increased infarct size with high-flow O2 in STEMI', yearLevels: ['3rd-year', '4th-year', 'diploma'] },
    { title: 'DETO2X-AMI Trial (2017)', type: 'article', description: 'No benefit of supplemental O2 in suspected MI with SpO2 >= 90%', yearLevels: ['4th-year', 'diploma'] },
    { title: 'Oxygen Delivery Devices - Basics', type: 'textbook', description: 'Nasal cannula, simple mask, NRB — FiO2 ranges and indications', yearLevels: ['1st-year', '2nd-year'] },
  ],
  'ami-management': [
    { title: 'AHA/ACC STEMI Guidelines', type: 'guideline', description: 'Door-to-balloon time targets, dual antiplatelet therapy, reperfusion strategy', yearLevels: ['3rd-year', '4th-year', 'diploma'] },
    { title: 'Prehospital STEMI Care Bundle', type: 'protocol', description: 'Aspirin, 12-lead ECG, pre-alert, pain management, oxygen titration', yearLevels: ['3rd-year', '4th-year', 'diploma'] },
    { title: 'Chest Pain Assessment (OPQRST)', type: 'textbook', description: 'Structured pain assessment for cardiac presentations', yearLevels: ['1st-year', '2nd-year'] },
  ],
  'airway-management': [
    { title: 'Basic Airway Management', type: 'textbook', description: 'Head tilt-chin lift, jaw thrust, recovery position, suction', yearLevels: ['1st-year', '2nd-year'] },
    { title: 'Airway Adjuncts and Advanced Airways', type: 'textbook', description: 'OPA, NPA, SGA, ETT selection and insertion', yearLevels: ['2nd-year', '3rd-year', '4th-year', 'diploma'] },
    { title: 'Difficult Airway Algorithm', type: 'protocol', description: 'Stepwise approach to unanticipated difficult intubation', yearLevels: ['4th-year', 'diploma'] },
  ],
  'hemorrhage-control': [
    { title: 'MARCH Algorithm', type: 'protocol', description: 'Massive hemorrhage, Airway, Respiration, Circulation, Hypothermia — trauma priorities', yearLevels: ['2nd-year', '3rd-year', '4th-year', 'diploma'] },
    { title: 'Tourniquet Application', type: 'textbook', description: 'Indications, high-and-tight placement, time documentation', yearLevels: ['2nd-year', '3rd-year', '4th-year', 'diploma'] },
    { title: 'Permissive Hypotension in Trauma', type: 'article', description: 'Evidence for SBP targets of 80-90mmHg in uncontrolled hemorrhage', yearLevels: ['4th-year', 'diploma'] },
  ],
  'respiratory-emergencies': [
    { title: 'BTS/SIGN Asthma Guideline', type: 'guideline', description: 'Severity scoring, step-up treatment, life-threatening features', yearLevels: ['2nd-year', '3rd-year', '4th-year', 'diploma'] },
    { title: 'GOLD COPD Guidelines', type: 'guideline', description: 'Acute exacerbation management, controlled O2, NIV criteria', yearLevels: ['3rd-year', '4th-year', 'diploma'] },
    { title: 'Pneumothorax Management', type: 'protocol', description: 'Tension pneumothorax recognition, needle decompression landmarks', yearLevels: ['2nd-year', '3rd-year', '4th-year', 'diploma'] },
  ],
  'anaphylaxis': [
    { title: 'Resuscitation Council UK Anaphylaxis Algorithm', type: 'guideline', description: 'IM adrenaline 0.5mg, positioning, fluid resuscitation, second-line agents', yearLevels: ['2nd-year', '3rd-year', '4th-year', 'diploma'] },
    { title: 'Anaphylaxis vs Allergic Reaction', type: 'textbook', description: 'Differentiation, grading severity, when to give adrenaline', yearLevels: ['1st-year', '2nd-year'] },
  ],
  'cardiac-arrest': [
    { title: 'ALS Algorithm', type: 'guideline', description: 'Shockable vs non-shockable rhythms, drug timings, reversible causes (4Hs/4Ts)', yearLevels: ['3rd-year', '4th-year', 'diploma'] },
    { title: 'BLS Algorithm', type: 'guideline', description: 'CPR quality, ratio 30:2, AED use, chain of survival', yearLevels: ['1st-year', '2nd-year'] },
    { title: 'Post-ROSC Care Bundle', type: 'protocol', description: 'Targeted temperature management, coronary angiography, neuroprotection', yearLevels: ['4th-year', 'diploma'] },
  ],
  'fluid-resuscitation': [
    { title: 'IV Fluid Therapy in Adults', type: 'guideline', description: 'Crystalloid selection, bolus volumes, reassessment after each bolus', yearLevels: ['3rd-year', '4th-year', 'diploma'] },
    { title: 'Fluid Challenge Technique', type: 'textbook', description: '250ml over 10-15 min, assess response before repeating', yearLevels: ['3rd-year', '4th-year', 'diploma'] },
  ],
  'neurological': [
    { title: 'GCS Assessment', type: 'textbook', description: 'Eye, Verbal, Motor scoring with common pitfalls', yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'] },
    { title: 'FAST Stroke Assessment', type: 'protocol', description: 'Face, Arms, Speech, Time — rapid stroke screening', yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'] },
    { title: 'Raised ICP Management', type: 'guideline', description: 'Head elevation, avoid hypotension, osmotic therapy, hyperventilation (short-term)', yearLevels: ['4th-year', 'diploma'] },
  ],
  'pain-management': [
    { title: 'WHO Pain Ladder - Prehospital Adaptation', type: 'guideline', description: 'Paracetamol, NSAIDs, opioids — stepwise approach to analgesia', yearLevels: ['2nd-year', '3rd-year', '4th-year', 'diploma'] },
    { title: 'Intranasal Fentanyl', type: 'protocol', description: 'Non-IV opioid option, rapid onset, dose titration', yearLevels: ['3rd-year', '4th-year', 'diploma'] },
  ],
  'scene-safety': [
    { title: 'Scene Safety Assessment Framework', type: 'textbook', description: 'Hazards, resources, mechanism, patient count — systematic approach', yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'] },
    { title: 'PPE Selection Guide', type: 'protocol', description: 'Gloves, masks, eye protection — when and what', yearLevels: ['1st-year', '2nd-year'] },
  ],
  'stroke': [
    { title: 'FAST Stroke Assessment', type: 'protocol', description: 'Face drooping, Arm weakness, Speech difficulty, Time to call — rapid screening', yearLevels: ['1st-year', '2nd-year', '3rd-year', '4th-year', 'diploma'] },
    { title: 'Prehospital Stroke Pathway', type: 'guideline', description: 'Time-critical pathway: recognition, pre-alert, BP management, glucose check', yearLevels: ['3rd-year', '4th-year', 'diploma'] },
    { title: 'BP Management in Stroke', type: 'article', description: 'Permissive hypertension, thrombolysis thresholds, when to treat acutely', yearLevels: ['4th-year', 'diploma'] },
  ],
  'spinal-injury': [
    { title: 'Spinal Motion Restriction Guidelines', type: 'guideline', description: 'NEXUS/Canadian C-Spine rules, selective immobilisation, vacuum mattress', yearLevels: ['2nd-year', '3rd-year', '4th-year', 'diploma'] },
    { title: 'Neurogenic vs Hypovolemic Shock', type: 'textbook', description: 'Differentiating shock types: warm/dry vs cold/clammy, HR patterns, treatment differences', yearLevels: ['3rd-year', '4th-year', 'diploma'] },
  ],
  'toxicology': [
    { title: 'Toxidromes Recognition', type: 'textbook', description: 'Opioid, sympathomimetic, anticholinergic, cholinergic — pattern recognition', yearLevels: ['3rd-year', '4th-year', 'diploma'] },
    { title: 'Naloxone Administration Protocol', type: 'protocol', description: 'Titrate to respiratory effort, IM/IV/IN routes, repeat dosing intervals', yearLevels: ['2nd-year', '3rd-year', '4th-year', 'diploma'] },
  ],
  'electrolyte': [
    { title: 'Hyperkalemia Emergency Protocol', type: 'guideline', description: 'Calcium chloride → insulin/dextrose → salbutamol → sodium bicarbonate pathway', yearLevels: ['4th-year', 'diploma'] },
    { title: 'ECG Changes in Electrolyte Disorders', type: 'textbook', description: 'Peaked T-waves, wide QRS, sine wave — recognizing life-threatening patterns', yearLevels: ['3rd-year', '4th-year', 'diploma'] },
  ],
  'hypothermia': [
    { title: 'Hypothermia Classification and Management', type: 'guideline', description: 'Swiss staging system, rewarming strategies, cardiac arrest in hypothermia', yearLevels: ['3rd-year', '4th-year', 'diploma'] },
    { title: 'Avalanche Victim Protocol', type: 'protocol', description: 'Burial time, airway patency, core temperature — triage and rewarming', yearLevels: ['4th-year', 'diploma'] },
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
    calcium_chloride_10: { maxSeconds: 180, description: 'Calcium chloride for hyperkalemia with ECG changes should be given within 3 minutes' },
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
    (treatmentId === 'calcium_chloride_10' && (sub.includes('electrolyte') || sub.includes('hyperkal'))) ||
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
