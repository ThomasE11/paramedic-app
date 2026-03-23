/**
 * Enhanced Treatment Effects Module
 * 
 * Comprehensive treatment system with gradual, context-aware vital sign changes
 * Supports both immediate and progressive treatment effects
 */

import type { VitalSigns } from '@/types';

// Parse BP to get systolic/diastolic values
const parseBP = (bp: string): { systolic: number; diastolic: number } => {
  const parts = bp.split('/').map(p => parseInt(p.trim()));
  return { systolic: parts[0] || 120, diastolic: parts[1] || 80 };
};

// Format BP back to string
const formatBP = (systolic: number, diastolic: number): string => 
  `${Math.round(systolic)}/${Math.round(diastolic)}`;

// Treatment onset types
export type TreatmentOnset = 'immediate' | 'fast' | 'moderate' | 'gradual' | 'delayed';

// Treatment category
export type TreatmentCategory = 
  | 'airway' 
  | 'breathing' 
  | 'circulation' 
  | 'medication' 
  | 'procedure' 
  | 'comfort' 
  | 'positioning' 
  | 'psychological';

// Enhanced treatment definition
export interface Treatment {
  id: string;
  name: string;
  description: string;
  category: TreatmentCategory;
  onset: TreatmentOnset;
  onsetTimeSeconds: number; // Time to start seeing effects
  durationSeconds: number; // Time for full effect
  icon: string;
  color: string;
  effects: TreatmentEffect[];
  contraindications?: string[];
  requiresMonitoring?: boolean;
}

// Individual vital sign effect
export interface TreatmentEffect {
  vitalSign: keyof VitalSigns;
  changeType: 'increase' | 'decrease' | 'stabilize' | 'set';
  value: number; // Amount of change or target value
  minValue?: number;
  maxValue?: number;
  condition?: (vitals: VitalSigns) => boolean;
}

// Treatment application state
export interface TreatmentApplication {
  treatment: Treatment;
  startTime: number;
  progress: number; // 0-1
  currentEffects: Partial<VitalSigns>;
  isComplete: boolean;
}

// Onset timing configuration (in seconds) - exported for use in animation timing
export const ONSET_TIMES: Record<TreatmentOnset, { start: number; full: number }> = {
  immediate: { start: 0, full: 1 },      // Defibrillation, adenosine
  fast: { start: 2, full: 10 },          // Nebulizers, suction
  moderate: { start: 5, full: 30 },      // Most medications
  gradual: { start: 10, full: 60 },      // Oxygen, fluids
  delayed: { start: 30, full: 120 },     // Steroids, antibiotics
};

// Complete treatment database
export const TREATMENTS: Treatment[] = [
  // ===== AIRWAY TREATMENTS =====
  {
    id: 'airway_open',
    name: 'Open Airway',
    description: 'Head tilt-chin lift or jaw thrust maneuver',
    category: 'airway',
    onset: 'immediate',
    onsetTimeSeconds: 0,
    durationSeconds: 1,
    icon: 'Wind',
    color: 'blue',
    effects: [
      { vitalSign: 'spo2', changeType: 'increase', value: 2, minValue: 88, maxValue: 94 },
      { vitalSign: 'respiration', changeType: 'stabilize', value: 0 },
    ],
  },
  {
    id: 'suction',
    name: 'Suction Airways',
    description: 'Remove secretions and obstructions',
    category: 'airway',
    onset: 'fast',
    onsetTimeSeconds: 2,
    durationSeconds: 10,
    icon: 'Wind',
    color: 'blue',
    effects: [
      { vitalSign: 'spo2', changeType: 'increase', value: 5, minValue: 85, maxValue: 96 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 4, minValue: 12 },
    ],
  },
  {
    id: 'back_blows',
    name: 'Back Blows',
    description: '5 sharp back blows between scapulae — alternate with 5 abdominal thrusts (AHA 2025)',
    category: 'airway',
    onset: 'immediate',
    onsetTimeSeconds: 0,
    durationSeconds: 5,
    icon: 'Wind',
    color: 'blue',
    effects: [
      { vitalSign: 'spo2', changeType: 'increase', value: 8, minValue: 60, maxValue: 96 },
      { vitalSign: 'respiration', changeType: 'increase', value: 6, minValue: 0, maxValue: 18 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 10, minValue: 80 },
    ],
  },
  {
    id: 'abdominal_thrusts',
    name: 'Abdominal Thrusts (Heimlich)',
    description: '5 subdiaphragmatic thrusts — alternate with 5 back blows (AHA 2025)',
    category: 'airway',
    onset: 'immediate',
    onsetTimeSeconds: 0,
    durationSeconds: 5,
    icon: 'Wind',
    color: 'blue',
    effects: [
      { vitalSign: 'spo2', changeType: 'increase', value: 12, minValue: 60, maxValue: 98 },
      { vitalSign: 'respiration', changeType: 'increase', value: 8, minValue: 0, maxValue: 18 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 15, minValue: 70 },
    ],
  },
  {
    id: 'magill_forceps',
    name: 'Magill Forceps Removal',
    description: 'Direct laryngoscopy and foreign body removal',
    category: 'airway',
    onset: 'immediate',
    onsetTimeSeconds: 0,
    durationSeconds: 1,
    icon: 'Wind',
    color: 'blue',
    effects: [
      { vitalSign: 'spo2', changeType: 'increase', value: 15, minValue: 60, maxValue: 99 },
      { vitalSign: 'respiration', changeType: 'increase', value: 10, minValue: 0, maxValue: 16 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 20, minValue: 70 },
    ],
  },
  {
    id: 'opa_insert',
    name: 'Insert OPA',
    description: 'Oropharyngeal airway insertion',
    category: 'airway',
    onset: 'immediate',
    onsetTimeSeconds: 0,
    durationSeconds: 1,
    icon: 'Wind',
    color: 'blue',
    effects: [
      { vitalSign: 'spo2', changeType: 'increase', value: 3, minValue: 85, maxValue: 94 },
    ],
  },
  {
    id: 'intubation',
    name: 'Endotracheal Intubation',
    description: 'Definitive airway management',
    category: 'airway',
    onset: 'immediate',
    onsetTimeSeconds: 0,
    durationSeconds: 1,
    icon: 'Wind',
    color: 'blue',
    requiresMonitoring: true,
    effects: [
      { vitalSign: 'spo2', changeType: 'set', value: 98, minValue: 88 },
      { vitalSign: 'respiration', changeType: 'set', value: 16, minValue: 8, maxValue: 20 },
    ],
  },

  // ===== BREATHING TREATMENTS =====
  {
    id: 'oxygen_nasal',
    name: 'Nasal Cannula O2',
    description: 'Low-flow oxygen therapy (2-6L/min)',
    category: 'breathing',
    onset: 'gradual',
    onsetTimeSeconds: 10,
    durationSeconds: 60,
    icon: 'Droplets',
    color: 'cyan',
    effects: [
      { vitalSign: 'spo2', changeType: 'increase', value: 6, minValue: 88, maxValue: 96 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 2, minValue: 12 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 5, minValue: 60 },
    ],
  },
  {
    id: 'oxygen_mask',
    name: 'Simple Face Mask',
    description: 'Medium-flow oxygen (6-10L/min)',
    category: 'breathing',
    onset: 'gradual',
    onsetTimeSeconds: 10,
    durationSeconds: 60,
    icon: 'Droplets',
    color: 'cyan',
    effects: [
      { vitalSign: 'spo2', changeType: 'increase', value: 10, minValue: 85, maxValue: 98 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 4, minValue: 12 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 8, minValue: 60 },
    ],
  },
  {
    id: 'oxygen_nonrebreather',
    name: 'Non-Rebreather Mask',
    description: 'High-flow oxygen (10-15L/min)',
    category: 'breathing',
    onset: 'gradual',
    onsetTimeSeconds: 10,
    durationSeconds: 60,
    icon: 'Droplets',
    color: 'cyan',
    effects: [
      { vitalSign: 'spo2', changeType: 'increase', value: 15, minValue: 80, maxValue: 98 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 6, minValue: 12 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 12, minValue: 60 },
    ],
  },
  {
    id: 'nebulizer_salbutamol',
    name: 'Salbutamol Nebulizer',
    description: 'Bronchodilator therapy',
    category: 'breathing',
    onset: 'fast',
    onsetTimeSeconds: 2,
    durationSeconds: 15,
    icon: 'Wind',
    color: 'purple',
    effects: [
      { vitalSign: 'respiration', changeType: 'decrease', value: 8, minValue: 14 },
      { vitalSign: 'spo2', changeType: 'increase', value: 8, minValue: 85, maxValue: 96 },
      { vitalSign: 'pulse', changeType: 'increase', value: 10, maxValue: 140 }, // Beta agonist increases HR
    ],
  },
  {
    id: 'nebulizer_ipratropium',
    name: 'Ipratropium Nebulizer',
    description: 'Anticholinergic bronchodilator',
    category: 'breathing',
    onset: 'moderate',
    onsetTimeSeconds: 5,
    durationSeconds: 30,
    icon: 'Wind',
    color: 'purple',
    effects: [
      { vitalSign: 'respiration', changeType: 'decrease', value: 6, minValue: 14 },
      { vitalSign: 'spo2', changeType: 'increase', value: 6, minValue: 85, maxValue: 96 },
    ],
  },
  {
    id: 'needle_decompression',
    name: 'Needle Decompression',
    description: 'Emergency treatment for tension pneumothorax',
    category: 'breathing',
    onset: 'immediate',
    onsetTimeSeconds: 0,
    durationSeconds: 1,
    icon: 'AlertTriangle',
    color: 'red',
    effects: [
      { vitalSign: 'spo2', changeType: 'increase', value: 20, minValue: 70, maxValue: 96 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 15, minValue: 14 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 30, minValue: 60 },
      { vitalSign: 'bp', changeType: 'increase', value: 25 }, // Systolic
    ],
  },

  // ===== CIRCULATION TREATMENTS =====
  {
    id: 'iv_access',
    name: 'IV Access',
    description: 'Establish intravenous access',
    category: 'circulation',
    onset: 'immediate',
    onsetTimeSeconds: 0,
    durationSeconds: 1,
    icon: 'Droplets',
    color: 'cyan',
    effects: [], // Enables other treatments
  },
  {
    id: 'fluids_250ml',
    name: 'IV Fluids 250ml',
    description: 'Crystalloid fluid bolus',
    category: 'circulation',
    onset: 'moderate',
    onsetTimeSeconds: 5,
    durationSeconds: 30,
    icon: 'Droplets',
    color: 'cyan',
    effects: [
      { vitalSign: 'bp', changeType: 'increase', value: 10 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 8, minValue: 60 },
    ],
  },
  {
    id: 'fluids_500ml',
    name: 'IV Fluids 500ml',
    description: 'Crystalloid fluid bolus',
    category: 'circulation',
    onset: 'moderate',
    onsetTimeSeconds: 5,
    durationSeconds: 45,
    icon: 'Droplets',
    color: 'cyan',
    effects: [
      { vitalSign: 'bp', changeType: 'increase', value: 18 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 15, minValue: 60 },
    ],
  },
  {
    id: 'fluids_1000ml',
    name: 'IV Fluids 1000ml',
    description: 'Large volume fluid resuscitation',
    category: 'circulation',
    onset: 'moderate',
    onsetTimeSeconds: 5,
    durationSeconds: 60,
    icon: 'Droplets',
    color: 'cyan',
    effects: [
      { vitalSign: 'bp', changeType: 'increase', value: 30 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 25, minValue: 60 },
    ],
  },
  {
    id: 'bleeding_control',
    name: 'Control Bleeding',
    description: 'Direct pressure and wound management',
    category: 'circulation',
    onset: 'immediate',
    onsetTimeSeconds: 0,
    durationSeconds: 5,
    icon: 'Heart',
    color: 'red',
    effects: [
      { vitalSign: 'bp', changeType: 'stabilize', value: 0 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 10, minValue: 60 },
    ],
  },
  {
    id: 'tourniquet',
    name: 'Apply Tourniquet',
    description: 'Hemorrhage control for extremities',
    category: 'circulation',
    onset: 'immediate',
    onsetTimeSeconds: 0,
    durationSeconds: 1,
    icon: 'Heart',
    color: 'red',
    effects: [
      { vitalSign: 'bp', changeType: 'increase', value: 15 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 20, minValue: 60 },
    ],
  },
  {
    id: 'cpr',
    name: 'Chest Compressions',
    description: 'Cardiopulmonary resuscitation',
    category: 'circulation',
    onset: 'immediate',
    onsetTimeSeconds: 0,
    durationSeconds: 1,
    icon: 'Activity',
    color: 'red',
    effects: [
      { vitalSign: 'pulse', changeType: 'set', value: 60 },
      { vitalSign: 'bp', changeType: 'set', value: 60 }, // Systolic
      { vitalSign: 'spo2', changeType: 'set', value: 85 }, // CPR generates some oxygenation
      { vitalSign: 'respiration', changeType: 'set', value: 10 }, // With BVM ventilation
    ],
  },
  {
    id: 'defibrillation',
    name: 'Defibrillation',
    description: 'Synchronized electrical shock',
    category: 'circulation',
    onset: 'immediate',
    onsetTimeSeconds: 0,
    durationSeconds: 1,
    icon: 'Zap',
    color: 'yellow',
    effects: [
      { vitalSign: 'pulse', changeType: 'set', value: 80 },
      { vitalSign: 'bp', changeType: 'set', value: 100 }, // Systolic
      { vitalSign: 'spo2', changeType: 'increase', value: 10, minValue: 88, maxValue: 98 },
    ],
  },

  // ===== MEDICATIONS =====
  {
    id: 'aspirin',
    name: 'Aspirin 300mg',
    description: 'Antiplatelet for cardiac chest pain',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 5,
    durationSeconds: 20,
    icon: 'Pill',
    color: 'yellow',
    effects: [
      { vitalSign: 'pulse', changeType: 'decrease', value: 5, minValue: 60 },
    ],
    contraindications: ['Children under 16 (Reye syndrome risk)', 'Active GI bleeding', 'Aspirin allergy'],
  },
  {
    id: 'gtn_spray',
    name: 'GTN Spray',
    description: 'Nitroglycerin for angina',
    category: 'medication',
    onset: 'fast',
    onsetTimeSeconds: 2,
    durationSeconds: 10,
    icon: 'Pill',
    color: 'yellow',
    effects: [
      { vitalSign: 'bp', changeType: 'decrease', value: 20 },
      { vitalSign: 'pulse', changeType: 'increase', value: 10, maxValue: 130 },
    ],
    contraindications: ['Systolic BP < 90'],
  },
  {
    id: 'morphine_5mg',
    name: 'Morphine 5mg',
    description: 'Opioid analgesic',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 5,
    durationSeconds: 20,
    icon: 'Syringe',
    color: 'red',
    effects: [
      { vitalSign: 'pulse', changeType: 'decrease', value: 10, minValue: 55 },
      { vitalSign: 'bp', changeType: 'decrease', value: 15 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 2, minValue: 10 },
    ],
    requiresMonitoring: true,
  },
  {
    id: 'fentanyl_50mcg',
    name: 'Fentanyl 50mcg',
    description: 'Synthetic opioid analgesic',
    category: 'medication',
    onset: 'fast',
    onsetTimeSeconds: 3,
    durationSeconds: 15,
    icon: 'Syringe',
    color: 'red',
    effects: [
      { vitalSign: 'pulse', changeType: 'decrease', value: 8, minValue: 55 },
      { vitalSign: 'bp', changeType: 'decrease', value: 12 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 2, minValue: 10 },
    ],
    requiresMonitoring: true,
  },
  {
    id: 'adrenaline_1mg',
    name: 'Adrenaline 1mg IV',
    description: 'Cardiac arrest and anaphylaxis',
    category: 'medication',
    onset: 'immediate',
    onsetTimeSeconds: 0,
    durationSeconds: 3,
    icon: 'Activity',
    color: 'orange',
    effects: [
      { vitalSign: 'pulse', changeType: 'increase', value: 30, maxValue: 160 },
      { vitalSign: 'bp', changeType: 'increase', value: 30 },
    ],
  },
  {
    id: 'atropine_05mg',
    name: 'Atropine 0.5mg',
    description: 'For bradycardia and organophosphate poisoning',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 5,
    durationSeconds: 30,
    icon: 'Syringe',
    color: 'orange',
    effects: [
      { vitalSign: 'pulse', changeType: 'increase', value: 25, maxValue: 140 },
      { vitalSign: 'bp', changeType: 'increase', value: 15 },
    ],
  },
  {
    id: 'adenosine_6mg',
    name: 'Adenosine 6mg',
    description: 'For SVT - causes transient asystole',
    category: 'medication',
    onset: 'immediate',
    onsetTimeSeconds: 0,
    durationSeconds: 2,
    icon: 'Activity',
    color: 'yellow',
    effects: [
      { vitalSign: 'pulse', changeType: 'set', value: 80 },
    ],
  },
  {
    id: 'adenosine_12mg',
    name: 'Adenosine 12mg',
    description: 'Second dose for SVT if 6mg unsuccessful — rapid IV push with flush',
    category: 'medication',
    onset: 'immediate',
    onsetTimeSeconds: 0,
    durationSeconds: 2,
    icon: 'Activity',
    color: 'yellow',
    effects: [
      { vitalSign: 'pulse', changeType: 'set', value: 75 },
    ],
    contraindications: ['Asthma (severe bronchospasm risk)', '2nd/3rd degree heart block', 'Denervated transplant heart'],
  },
  {
    id: 'metoprolol_5mg',
    name: 'Metoprolol 5mg IV',
    description: 'Beta-blocker for rate control in AF, SVT, sinus tachycardia',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 5,
    durationSeconds: 30,
    icon: 'Activity',
    color: 'blue',
    effects: [
      { vitalSign: 'pulse', changeType: 'decrease', value: 20, minValue: 50 },
      { vitalSign: 'bp', changeType: 'decrease', value: 10 },
    ],
    contraindications: ['HR < 60', 'SBP < 100', 'Heart failure (acute decompensated)', 'Asthma', '2nd/3rd degree heart block'],
  },
  {
    id: 'diltiazem_20mg',
    name: 'Diltiazem 20mg IV',
    description: 'Calcium channel blocker for rate control in AF with rapid ventricular response',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 5,
    durationSeconds: 30,
    icon: 'Activity',
    color: 'blue',
    effects: [
      { vitalSign: 'pulse', changeType: 'decrease', value: 25, minValue: 55 },
      { vitalSign: 'bp', changeType: 'decrease', value: 12 },
    ],
    contraindications: ['HR < 60', 'SBP < 90', 'WPW/pre-excitation syndrome', 'Heart failure', 'Concurrent IV beta-blocker'],
  },
  {
    id: 'amiodarone_300mg',
    name: 'Amiodarone 300mg',
    description: 'Antiarrhythmic for VF/VT',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 10,
    durationSeconds: 60,
    icon: 'Activity',
    color: 'yellow',
    effects: [
      { vitalSign: 'pulse', changeType: 'decrease', value: 15, minValue: 60 },
      { vitalSign: 'bp', changeType: 'decrease', value: 10 },
    ],
  },
  {
    id: 'glucose_10g',
    name: 'Oral Glucose 10g',
    description: 'For conscious hypoglycemic patients',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 10,
    durationSeconds: 30,
    icon: 'Activity',
    color: 'green',
    effects: [
      { vitalSign: 'bloodGlucose', changeType: 'increase', value: 3, maxValue: 8 },
      { vitalSign: 'gcs', changeType: 'increase', value: 2, maxValue: 15 },
    ],
  },
  {
    id: 'glucagon_1mg',
    name: 'Glucagon 1mg IM',
    description: 'For unconscious hypoglycemia',
    category: 'medication',
    onset: 'fast',
    onsetTimeSeconds: 5,
    durationSeconds: 20,
    icon: 'Activity',
    color: 'green',
    effects: [
      { vitalSign: 'bloodGlucose', changeType: 'increase', value: 4, maxValue: 8 },
      { vitalSign: 'gcs', changeType: 'increase', value: 3, maxValue: 15 },
      { vitalSign: 'pulse', changeType: 'increase', value: 15, maxValue: 140 },
    ],
  },
  {
    id: 'midazolam_5mg',
    name: 'Midazolam 5mg',
    description: 'Benzodiazepine for seizures/agitation',
    category: 'medication',
    onset: 'fast',
    onsetTimeSeconds: 3,
    durationSeconds: 15,
    icon: 'Brain',
    color: 'purple',
    effects: [
      { vitalSign: 'gcs', changeType: 'decrease', value: 2, minValue: 8 }, // Sedation
      { vitalSign: 'pulse', changeType: 'decrease', value: 15, minValue: 55 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 3, minValue: 10 },
    ],
    requiresMonitoring: true,
  },
  {
    id: 'naloxone_04mg',
    name: 'Naloxone 0.4mg',
    description: 'Opioid antagonist',
    category: 'medication',
    onset: 'fast',
    onsetTimeSeconds: 2,
    durationSeconds: 10,
    icon: 'Syringe',
    color: 'blue',
    effects: [
      { vitalSign: 'respiration', changeType: 'increase', value: 8, maxValue: 20 },
      { vitalSign: 'pulse', changeType: 'increase', value: 20, maxValue: 140 },
      { vitalSign: 'gcs', changeType: 'increase', value: 4, maxValue: 15 },
    ],
  },
  {
    id: 'txa_1g',
    name: 'Tranexamic Acid 1g',
    description: 'Antifibrinolytic for trauma',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 10,
    durationSeconds: 60,
    icon: 'Droplets',
    color: 'red',
    effects: [
      { vitalSign: 'bp', changeType: 'increase', value: 10 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 8, minValue: 60 },
    ],
  },
  {
    id: 'hydrocortisone_200mg',
    name: 'Hydrocortisone 200mg',
    description: 'Corticosteroid for adrenal crisis/anaphylaxis',
    category: 'medication',
    onset: 'delayed',
    onsetTimeSeconds: 30,
    durationSeconds: 120,
    icon: 'Pill',
    color: 'green',
    effects: [
      { vitalSign: 'bp', changeType: 'increase', value: 15 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 10, minValue: 60 },
    ],
  },

  // ===== PSYCHOLOGICAL/COMFORT =====
  {
    id: 'reassurance',
    name: 'Reassurance',
    description: 'Calm verbal reassurance and explanation',
    category: 'psychological',
    onset: 'moderate',
    onsetTimeSeconds: 10,
    durationSeconds: 30,
    icon: 'Heart',
    color: 'pink',
    effects: [
      { vitalSign: 'pulse', changeType: 'decrease', value: 12, minValue: 60 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 3, minValue: 12 },
      { vitalSign: 'bp', changeType: 'decrease', value: 10 },
    ],
  },
  {
    id: 'calm_environment',
    name: 'Calm Environment',
    description: 'Reduce noise, lighting, stressors',
    category: 'psychological',
    onset: 'gradual',
    onsetTimeSeconds: 15,
    durationSeconds: 60,
    icon: 'Heart',
    color: 'pink',
    effects: [
      { vitalSign: 'pulse', changeType: 'decrease', value: 8, minValue: 60 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 2, minValue: 12 },
    ],
  },
  {
    id: 'family_presence',
    name: 'Allow Family Presence',
    description: 'Family support for patient comfort',
    category: 'psychological',
    onset: 'moderate',
    onsetTimeSeconds: 10,
    durationSeconds: 45,
    icon: 'Heart',
    color: 'pink',
    effects: [
      { vitalSign: 'pulse', changeType: 'decrease', value: 6, minValue: 60 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 2, minValue: 12 },
    ],
  },

  // ===== POSITIONING =====
  {
    id: 'supine_position',
    name: 'Supine Position',
    description: 'Flat on back',
    category: 'positioning',
    onset: 'immediate',
    onsetTimeSeconds: 0,
    durationSeconds: 5,
    icon: 'Move',
    color: 'gray',
    effects: [
      { vitalSign: 'bp', changeType: 'increase', value: 5 },
    ],
  },
  {
    id: 'recovery_position',
    name: 'Recovery Position',
    description: 'Lateral recumbent for airway protection',
    category: 'positioning',
    onset: 'immediate',
    onsetTimeSeconds: 0,
    durationSeconds: 5,
    icon: 'Move',
    color: 'gray',
    effects: [
      { vitalSign: 'spo2', changeType: 'increase', value: 3, minValue: 88, maxValue: 96 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 2, minValue: 12 },
    ],
  },
  {
    id: 'fowlers_position',
    name: "Fowler's Position",
    description: 'Semi-upright 45-60 degrees',
    category: 'positioning',
    onset: 'fast',
    onsetTimeSeconds: 5,
    durationSeconds: 15,
    icon: 'Move',
    color: 'gray',
    effects: [
      { vitalSign: 'respiration', changeType: 'decrease', value: 4, minValue: 12 },
      { vitalSign: 'spo2', changeType: 'increase', value: 5, minValue: 88, maxValue: 96 },
      { vitalSign: 'bp', changeType: 'decrease', value: 8 },
    ],
  },
  {
    id: 'left_lateral_tilt',
    name: 'Left Lateral Tilt',
    description: 'For pregnant patients - reduces IVC compression',
    category: 'positioning',
    onset: 'fast',
    onsetTimeSeconds: 5,
    durationSeconds: 15,
    icon: 'Move',
    color: 'gray',
    effects: [
      { vitalSign: 'bp', changeType: 'increase', value: 15 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 10, minValue: 60 },
    ],
  },
  {
    id: 'leg_elevation',
    name: 'Leg Elevation',
    description: 'For shock - increases venous return',
    category: 'positioning',
    onset: 'fast',
    onsetTimeSeconds: 5,
    durationSeconds: 20,
    icon: 'Move',
    color: 'gray',
    effects: [
      { vitalSign: 'bp', changeType: 'increase', value: 10 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 8, minValue: 60 },
    ],
  },

  // ===== COMFORT/OTHER =====
  {
    id: 'warming_blanket',
    name: 'Warming Blanket',
    description: 'Prevent hypothermia',
    category: 'comfort',
    onset: 'gradual',
    onsetTimeSeconds: 20,
    durationSeconds: 120,
    icon: 'Thermometer',
    color: 'orange',
    effects: [
      { vitalSign: 'temperature', changeType: 'increase', value: 1.5, maxValue: 37 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 8, minValue: 60 },
    ],
  },
  {
    id: 'active_cooling',
    name: 'Active Cooling',
    description: 'For heat stroke/hyperthermia',
    category: 'comfort',
    onset: 'moderate',
    onsetTimeSeconds: 10,
    durationSeconds: 60,
    icon: 'Thermometer',
    color: 'blue',
    effects: [
      { vitalSign: 'temperature', changeType: 'decrease', value: 2, minValue: 37 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 20, minValue: 60 },
      { vitalSign: 'bp', changeType: 'increase', value: 10 },
    ],
  },
  {
    id: 'splinting',
    name: 'Splint Fracture',
    description: 'Immobilize injured limb',
    category: 'comfort',
    onset: 'fast',
    onsetTimeSeconds: 5,
    durationSeconds: 15,
    icon: 'Move',
    color: 'gray',
    effects: [
      { vitalSign: 'pulse', changeType: 'decrease', value: 10, minValue: 60 },
      { vitalSign: 'bp', changeType: 'decrease', value: 8 }, // Reduced pain
    ],
  },

  // ===== ADDITIONAL TREATMENTS (Phase 6) =====
  {
    id: 'bvm_ventilation',
    name: 'BVM Ventilation',
    description: 'Bag-valve-mask assisted ventilation',
    category: 'airway',
    onset: 'immediate',
    onsetTimeSeconds: 0,
    durationSeconds: 1,
    icon: 'Wind',
    color: 'blue',
    effects: [
      { vitalSign: 'spo2', changeType: 'increase', value: 12, minValue: 70, maxValue: 98 },
      { vitalSign: 'respiration', changeType: 'set', value: 14, minValue: 10, maxValue: 18 },
    ],
  },
  {
    id: 'cpap_niv',
    name: 'CPAP / NIV',
    description: 'Non-invasive ventilation for respiratory failure',
    category: 'breathing',
    onset: 'fast',
    onsetTimeSeconds: 3,
    durationSeconds: 30,
    icon: 'Wind',
    color: 'cyan',
    effects: [
      { vitalSign: 'spo2', changeType: 'increase', value: 12, minValue: 80, maxValue: 98 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 8, minValue: 14 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 10, minValue: 60 },
    ],
  },
  {
    id: 'adrenaline_im',
    name: 'Adrenaline 0.5mg IM',
    description: 'IM adrenaline for anaphylaxis (1:1000)',
    category: 'medication',
    onset: 'fast',
    onsetTimeSeconds: 3,
    durationSeconds: 15,
    icon: 'Activity',
    color: 'orange',
    effects: [
      { vitalSign: 'pulse', changeType: 'increase', value: 20, maxValue: 140 },
      { vitalSign: 'bp', changeType: 'increase', value: 25 },
      { vitalSign: 'spo2', changeType: 'increase', value: 8, maxValue: 98 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 6, minValue: 14 },
    ],
  },
  {
    id: 'dextrose_10',
    name: 'Dextrose 10% IV',
    description: 'IV glucose for hypoglycemia',
    category: 'medication',
    onset: 'fast',
    onsetTimeSeconds: 2,
    durationSeconds: 10,
    icon: 'Activity',
    color: 'green',
    effects: [
      { vitalSign: 'bloodGlucose', changeType: 'increase', value: 5, maxValue: 10 },
      { vitalSign: 'gcs', changeType: 'increase', value: 4, maxValue: 15 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 10, minValue: 60 },
    ],
  },
  {
    id: 'magnesium_2g',
    name: 'Magnesium Sulfate 2g IV',
    description: 'For life-threatening asthma or eclampsia',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 10,
    durationSeconds: 45,
    icon: 'Syringe',
    color: 'purple',
    effects: [
      { vitalSign: 'respiration', changeType: 'decrease', value: 6, minValue: 14 },
      { vitalSign: 'spo2', changeType: 'increase', value: 6, maxValue: 96 },
      { vitalSign: 'bp', changeType: 'decrease', value: 10 },
    ],
  },
  {
    id: 'ondansetron_4mg',
    name: 'Ondansetron 4mg IV',
    description: 'Anti-emetic for nausea/vomiting',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 5,
    durationSeconds: 20,
    icon: 'Pill',
    color: 'green',
    effects: [
      { vitalSign: 'pulse', changeType: 'decrease', value: 5, minValue: 60 },
    ],
  },
  {
    id: 'calcium_chloride_10',
    name: 'Calcium Chloride 10% IV',
    description: 'For hyperkalemia cardiac protection',
    category: 'medication',
    onset: 'fast',
    onsetTimeSeconds: 2,
    durationSeconds: 10,
    icon: 'Activity',
    color: 'yellow',
    effects: [
      { vitalSign: 'pulse', changeType: 'decrease', value: 15, minValue: 55 },
      { vitalSign: 'bp', changeType: 'increase', value: 10 },
    ],
  },

  // ================================================================
  // PEDIATRIC-SPECIFIC TREATMENTS
  // ================================================================
  {
    id: 'midazolam_buccal',
    name: 'Buccal Midazolam',
    description: 'First-line anticonvulsant for pediatric seizures (0.3mg/kg buccal)',
    category: 'medication',
    onset: 'fast',
    onsetTimeSeconds: 3,
    durationSeconds: 15,
    icon: 'Brain',
    color: 'purple',
    effects: [
      { vitalSign: 'pulse', changeType: 'decrease', value: 10, minValue: 70 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 2, minValue: 12 },
    ],
    requiresMonitoring: true,
    contraindications: ['Respiratory depression', 'Known benzodiazepine allergy'],
  },
  {
    id: 'diazepam_rectal',
    name: 'Rectal Diazepam',
    description: 'Anticonvulsant for prolonged seizures (0.5mg/kg PR)',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 5,
    durationSeconds: 20,
    icon: 'Brain',
    color: 'purple',
    effects: [
      { vitalSign: 'pulse', changeType: 'decrease', value: 8, minValue: 70 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 2, minValue: 12 },
    ],
    requiresMonitoring: true,
    contraindications: ['Respiratory depression', 'Acute narrow-angle glaucoma'],
  },
  {
    id: 'paracetamol_oral',
    name: 'Paracetamol (Oral)',
    description: 'Antipyretic/analgesic (15mg/kg, max 1g)',
    category: 'medication',
    onset: 'gradual',
    onsetTimeSeconds: 15,
    durationSeconds: 30,
    icon: 'Thermometer',
    color: 'blue',
    effects: [
      { vitalSign: 'temperature', changeType: 'decrease', value: 1.0, minValue: 36.5 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 8, minValue: 60 },
    ],
  },
  {
    id: 'paracetamol_iv',
    name: 'Paracetamol IV (Perfalgan)',
    description: 'IV antipyretic/analgesic (15mg/kg over 15 min)',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 8,
    durationSeconds: 20,
    icon: 'Thermometer',
    color: 'blue',
    effects: [
      { vitalSign: 'temperature', changeType: 'decrease', value: 1.5, minValue: 36.5 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 10, minValue: 60 },
    ],
  },
  {
    id: 'ibuprofen_oral',
    name: 'Ibuprofen (Oral)',
    description: 'NSAID antipyretic/anti-inflammatory (10mg/kg)',
    category: 'medication',
    onset: 'gradual',
    onsetTimeSeconds: 15,
    durationSeconds: 30,
    icon: 'Thermometer',
    color: 'orange',
    effects: [
      { vitalSign: 'temperature', changeType: 'decrease', value: 1.2, minValue: 36.5 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 6, minValue: 60 },
    ],
    contraindications: ['Under 3 months old', 'Dehydration', 'Renal impairment', 'Active bleeding'],
  },
  // ===== CARDIAC ARREST SPECIFIC =====
  {
    id: 'amiodarone_150mg',
    name: 'Amiodarone 150mg',
    description: 'Second dose antiarrhythmic for refractory VF/pVT (after 5th shock)',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 10,
    durationSeconds: 60,
    icon: 'Activity',
    color: 'yellow',
    effects: [
      { vitalSign: 'pulse', changeType: 'decrease', value: 8, minValue: 60 },
      { vitalSign: 'bp', changeType: 'decrease', value: 5 },
    ],
    contraindications: ['Not given amiodarone 300mg first', 'Non-shockable rhythm'],
  },
  {
    id: 'lucas_device',
    name: 'LUCAS Mechanical CPR',
    description: 'Mechanical chest compression device — 30-45s setup pause required',
    category: 'circulation',
    onset: 'immediate',
    onsetTimeSeconds: 35, // Setup time — no compressions during this period
    durationSeconds: 1,
    icon: 'Cog',
    color: 'gray',
    effects: [
      { vitalSign: 'pulse', changeType: 'set', value: 55 },
      { vitalSign: 'bp', changeType: 'set', value: 50 },
      { vitalSign: 'spo2', changeType: 'set', value: 80 },
    ],
    contraindications: ['Patient too small (<45kg)', 'Traumatic arrest with chest injury'],
  },
  {
    id: 'sodium_bicarbonate',
    name: 'Sodium Bicarbonate 8.4%',
    description: 'For known or suspected severe metabolic acidosis, hyperkalaemia',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 10,
    durationSeconds: 60,
    icon: 'Droplets',
    color: 'blue',
    effects: [
      { vitalSign: 'bp', changeType: 'increase', value: 5 },
    ],
    contraindications: ['Routine use in cardiac arrest (not recommended)'],
  },
  {
    id: 'calcium_chloride',
    name: 'Calcium Chloride 10%',
    description: 'For hyperkalaemia, calcium channel blocker OD, hypermagnesaemia',
    category: 'medication',
    onset: 'fast',
    onsetTimeSeconds: 5,
    durationSeconds: 30,
    icon: 'Zap',
    color: 'orange',
    effects: [
      { vitalSign: 'pulse', changeType: 'increase', value: 10, maxValue: 120 },
      { vitalSign: 'bp', changeType: 'increase', value: 10 },
    ],
    contraindications: ['Digoxin toxicity (relative)', 'Concurrent sodium bicarbonate (precipitates)'],
  },

  // ================================================================
  // ADVANCED PARAMEDIC TREATMENTS (3rd/4th Year)
  // ================================================================
  {
    id: 'rsi_intubation',
    name: 'RSI — Rapid Sequence Intubation',
    description: 'Sedation + paralysis + endotracheal intubation for GCS ≤8 or airway compromise',
    category: 'airway',
    onset: 'fast',
    onsetTimeSeconds: 3,
    durationSeconds: 1,
    icon: 'Wind',
    color: 'red',
    effects: [
      { vitalSign: 'spo2', changeType: 'increase', value: 15, maxValue: 99 },
      { vitalSign: 'respiration', changeType: 'set', value: 12 },
    ],
    contraindications: ['GCS > 8 without airway compromise', 'Anticipated difficult airway without backup plan', 'Untrained provider'],
  },
  {
    id: 'ketamine_iv',
    name: 'Ketamine 2mg/kg IV',
    description: 'Dissociative anaesthetic for RSI induction — maintains airway reflexes and BP',
    category: 'medication',
    onset: 'fast',
    onsetTimeSeconds: 2,
    durationSeconds: 30,
    icon: 'Syringe',
    color: 'purple',
    effects: [
      { vitalSign: 'pulse', changeType: 'increase', value: 10, maxValue: 130 },
      { vitalSign: 'bp', changeType: 'increase', value: 10 },
    ],
    contraindications: ['Eclampsia', 'Severe hypertension (SBP >180)'],
  },
  {
    id: 'suxamethonium',
    name: 'Suxamethonium 1.5mg/kg IV',
    description: 'Depolarising neuromuscular blocker for RSI — onset 45-60 seconds, duration 5-10 min',
    category: 'medication',
    onset: 'fast',
    onsetTimeSeconds: 3,
    durationSeconds: 30,
    icon: 'Syringe',
    color: 'red',
    effects: [
      { vitalSign: 'respiration', changeType: 'set', value: 0 },
    ],
    contraindications: ['Known hyperkalaemia', 'Burns >24hrs old', 'Denervation injuries', 'Known malignant hyperthermia'],
  },
  {
    id: 'rocuronium',
    name: 'Rocuronium 1.2mg/kg IV',
    description: 'Non-depolarising neuromuscular blocker — onset 60-90 sec, longer duration than sux',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 5,
    durationSeconds: 60,
    icon: 'Syringe',
    color: 'red',
    effects: [
      { vitalSign: 'respiration', changeType: 'set', value: 0 },
    ],
    contraindications: ['No sugammadex available for reversal'],
  },
  {
    id: 'metoclopramide_10mg',
    name: 'Metoclopramide 10mg IV',
    description: 'Prokinetic antiemetic — promotes gastric emptying, reduces aspiration risk',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 10,
    durationSeconds: 30,
    icon: 'Pill',
    color: 'blue',
    effects: [
      { vitalSign: 'pulse', changeType: 'decrease', value: 3, minValue: 55 },
    ],
    contraindications: ['Bowel obstruction', 'Phaeochromocytoma', 'Under 20 years (dystonic reactions)'],
  },
  {
    id: 'mannitol_20',
    name: 'Mannitol 20% (0.5g/kg IV)',
    description: 'Osmotic diuretic for raised intracranial pressure — reduces cerebral oedema',
    category: 'medication',
    onset: 'gradual',
    onsetTimeSeconds: 15,
    durationSeconds: 60,
    icon: 'Droplets',
    color: 'blue',
    effects: [
      { vitalSign: 'bp', changeType: 'decrease', value: 10 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 5, minValue: 55 },
    ],
    contraindications: ['Hypovolaemia', 'Renal failure', 'Pulmonary oedema'],
  },
  {
    id: 'hypertonic_saline',
    name: 'Hypertonic Saline 3% (250ml)',
    description: 'For severe hyponatraemia or raised ICP — alternative to mannitol',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 10,
    durationSeconds: 30,
    icon: 'Droplets',
    color: 'blue',
    effects: [
      { vitalSign: 'bp', changeType: 'increase', value: 8 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 5, minValue: 55 },
    ],
    contraindications: ['Hypernatraemia', 'Dehydration'],
  },

  // ================================================================
  // INFUSIONS (4th Year Critical Care)
  // ================================================================
  {
    id: 'adrenaline_infusion',
    name: 'Adrenaline Infusion (1-10mcg/min)',
    description: 'Vasopressor/inotrope infusion for haemodynamic support in shock',
    category: 'medication',
    onset: 'fast',
    onsetTimeSeconds: 3,
    durationSeconds: 60,
    icon: 'Droplets',
    color: 'red',
    effects: [
      { vitalSign: 'pulse', changeType: 'increase', value: 20, maxValue: 150 },
      { vitalSign: 'bp', changeType: 'increase', value: 25 },
    ],
    contraindications: ['Tachyarrhythmias', 'Uncontrolled hypertension'],
  },
  {
    id: 'noradrenaline_infusion',
    name: 'Noradrenaline Infusion (0.05-0.5mcg/kg/min)',
    description: 'First-line vasopressor for septic shock and distributive shock',
    category: 'medication',
    onset: 'fast',
    onsetTimeSeconds: 5,
    durationSeconds: 60,
    icon: 'Droplets',
    color: 'red',
    effects: [
      { vitalSign: 'bp', changeType: 'increase', value: 30 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 5, minValue: 50 },
    ],
    contraindications: ['Peripheral vascular disease'],
  },
  {
    id: 'dopamine_infusion',
    name: 'Dopamine Infusion (5-20mcg/kg/min)',
    description: 'Inotrope/vasopressor — dose-dependent effects on cardiac output and SVR',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 10,
    durationSeconds: 60,
    icon: 'Droplets',
    color: 'red',
    effects: [
      { vitalSign: 'bp', changeType: 'increase', value: 20 },
      { vitalSign: 'pulse', changeType: 'increase', value: 15, maxValue: 140 },
    ],
    contraindications: ['Phaeochromocytoma', 'Tachyarrhythmias'],
  },
  {
    id: 'propofol_infusion',
    name: 'Propofol Infusion (1-4mg/kg/h)',
    description: 'Sedation infusion for intubated patients — titrate to RASS target',
    category: 'medication',
    onset: 'fast',
    onsetTimeSeconds: 2,
    durationSeconds: 60,
    icon: 'Syringe',
    color: 'purple',
    effects: [
      { vitalSign: 'bp', changeType: 'decrease', value: 15 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 8, minValue: 50 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 3, minValue: 8 },
    ],
    contraindications: ['Haemodynamic instability', 'Egg/soy allergy'],
  },
  {
    id: 'midazolam_infusion',
    name: 'Midazolam Infusion (0.03-0.2mg/kg/h)',
    description: 'Benzodiazepine sedation infusion — alternative to propofol',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 5,
    durationSeconds: 60,
    icon: 'Brain',
    color: 'purple',
    effects: [
      { vitalSign: 'bp', changeType: 'decrease', value: 8 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 2, minValue: 10 },
    ],
    contraindications: ['Respiratory depression', 'Severe hepatic impairment'],
  },
  {
    id: 'fentanyl_infusion',
    name: 'Fentanyl Infusion (0.7-2mcg/kg/h)',
    description: 'Opioid analgesic infusion for intubated patients — titrate to pain score',
    category: 'medication',
    onset: 'fast',
    onsetTimeSeconds: 3,
    durationSeconds: 60,
    icon: 'Syringe',
    color: 'purple',
    effects: [
      { vitalSign: 'bp', changeType: 'decrease', value: 10 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 8, minValue: 50 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 2, minValue: 8 },
    ],
    contraindications: ['Respiratory depression without ventilation'],
  },

  // ================================================================
  // ANAPHYLAXIS DRUGS
  // ================================================================
  {
    id: 'adrenaline_im_adult',
    name: 'Adrenaline 0.5mg IM (Anaphylaxis — Adult)',
    description: 'First-line treatment for anaphylaxis in adults >12 years',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 8,
    durationSeconds: 30,
    icon: 'Syringe',
    color: 'red',
    effects: [
      { vitalSign: 'bp', changeType: 'increase', value: 20 },
      { vitalSign: 'pulse', changeType: 'increase', value: 15, maxValue: 140 },
      { vitalSign: 'spo2', changeType: 'increase', value: 5, maxValue: 98 },
    ],
    contraindications: [],
  },
  {
    id: 'adrenaline_im_child',
    name: 'Adrenaline 0.15mg IM (Anaphylaxis — Child <6y)',
    description: 'First-line treatment for anaphylaxis in children under 6 years',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 8,
    durationSeconds: 30,
    icon: 'Syringe',
    color: 'red',
    effects: [
      { vitalSign: 'bp', changeType: 'increase', value: 15 },
      { vitalSign: 'pulse', changeType: 'increase', value: 10, maxValue: 150 },
      { vitalSign: 'spo2', changeType: 'increase', value: 4, maxValue: 98 },
    ],
    contraindications: [],
  },
  {
    id: 'adrenaline_im_older',
    name: 'Adrenaline 0.3mg IM (Anaphylaxis — Child 6-12y)',
    description: 'First-line treatment for anaphylaxis in children 6-12 years',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 8,
    durationSeconds: 30,
    icon: 'Syringe',
    color: 'red',
    effects: [
      { vitalSign: 'bp', changeType: 'increase', value: 18 },
      { vitalSign: 'pulse', changeType: 'increase', value: 12, maxValue: 145 },
      { vitalSign: 'spo2', changeType: 'increase', value: 5, maxValue: 98 },
    ],
    contraindications: [],
  },
  {
    id: 'chlorphenamine_10mg',
    name: 'Chlorphenamine 10mg IV (H1 blocker)',
    description: 'Antihistamine — adjunct in anaphylaxis, not first-line',
    category: 'medication',
    onset: 'gradual',
    onsetTimeSeconds: 15,
    durationSeconds: 60,
    icon: 'Pill',
    color: 'blue',
    effects: [
      { vitalSign: 'pulse', changeType: 'decrease', value: 5, minValue: 55 },
    ],
    contraindications: ['Severe hepatic impairment'],
  },

  // ================================================================
  // MISSING PROCEDURES & MEDICATIONS
  // ================================================================
  {
    id: 'io_access',
    name: 'IO Access (Intraosseous)',
    description: 'Vascular access via intraosseous needle — enables drug administration like IV',
    category: 'circulation',
    onset: 'fast',
    onsetTimeSeconds: 3,
    durationSeconds: 10,
    icon: 'Syringe',
    color: 'red',
    effects: [],
    contraindications: ['Fracture at insertion site', 'Previous IO in same bone'],
  },
  {
    id: 'pelvic_binder',
    name: 'Apply Pelvic Binder',
    description: 'Circumferential pelvic compression device for suspected pelvic fracture haemorrhage',
    category: 'circulation',
    onset: 'immediate',
    onsetTimeSeconds: 1,
    durationSeconds: 10,
    icon: 'Activity',
    color: 'red',
    effects: [
      { vitalSign: 'bp', changeType: 'increase', value: 10 },
      { vitalSign: 'pulse', changeType: 'decrease', value: 5, minValue: 55 },
    ],
    contraindications: ['No pelvic injury'],
  },
  {
    id: 'surgical_cric',
    name: 'Surgical Cricothyrotomy',
    description: 'Emergency surgical airway — CICV (can\'t intubate, can\'t ventilate) rescue',
    category: 'airway',
    onset: 'fast',
    onsetTimeSeconds: 5,
    durationSeconds: 10,
    icon: 'Wind',
    color: 'red',
    effects: [
      { vitalSign: 'spo2', changeType: 'increase', value: 15, maxValue: 95 },
      { vitalSign: 'respiration', changeType: 'set', value: 12 },
    ],
    contraindications: ['Under 12 years (use needle cric)', 'Anatomical distortion'],
  },
  {
    id: 'activated_charcoal',
    name: 'Activated Charcoal 50g',
    description: 'Gastrointestinal decontamination — adsorbs ingested toxins',
    category: 'medication',
    onset: 'gradual',
    onsetTimeSeconds: 15,
    durationSeconds: 60,
    icon: 'Pill',
    color: 'gray',
    effects: [],
    contraindications: ['Corrosive ingestion', 'Petroleum products', 'Reduced consciousness without protected airway', '>1 hour since ingestion'],
  },
  {
    id: 'intralipid',
    name: 'Intralipid 20% (Lipid Emulsion)',
    description: 'Lipid rescue therapy for local anaesthetic systemic toxicity (LAST)',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 10,
    durationSeconds: 30,
    icon: 'Droplets',
    color: 'yellow',
    effects: [
      { vitalSign: 'bp', changeType: 'increase', value: 10 },
      { vitalSign: 'pulse', changeType: 'increase', value: 5, maxValue: 120 },
    ],
    contraindications: ['No IV access'],
  },
  {
    id: 'clopidogrel_300mg',
    name: 'Clopidogrel 300mg (ACS Loading)',
    description: 'Antiplatelet loading dose for acute coronary syndrome',
    category: 'medication',
    onset: 'delayed',
    onsetTimeSeconds: 30,
    durationSeconds: 120,
    icon: 'Pill',
    color: 'red',
    effects: [],
    contraindications: ['Active bleeding', 'Recent surgery'],
  },
  {
    id: 'enoxaparin_1mg',
    name: 'Enoxaparin 1mg/kg SC (ACS/PE)',
    description: 'Low molecular weight heparin for ACS or pulmonary embolism',
    category: 'medication',
    onset: 'delayed',
    onsetTimeSeconds: 30,
    durationSeconds: 120,
    icon: 'Syringe',
    color: 'red',
    effects: [],
    contraindications: ['Active bleeding', 'HIT', 'Severe renal impairment'],
  },
  {
    id: 'dextrose_10_250ml',
    name: 'Dextrose 10% 250ml IV',
    description: 'For hypoglycaemia management — slower, safer correction than D50',
    category: 'medication',
    onset: 'moderate',
    onsetTimeSeconds: 10,
    durationSeconds: 30,
    icon: 'Droplets',
    color: 'yellow',
    effects: [
      { vitalSign: 'pulse', changeType: 'decrease', value: 5, minValue: 55 },
    ],
    contraindications: ['Hyperglycaemia'],
  },
  {
    id: 'salbutamol_iv',
    name: 'Salbutamol IV Infusion (5-20mcg/min)',
    description: 'IV beta-2 agonist for severe/life-threatening asthma not responding to nebulisers',
    category: 'medication',
    onset: 'fast',
    onsetTimeSeconds: 5,
    durationSeconds: 30,
    icon: 'Wind',
    color: 'blue',
    effects: [
      { vitalSign: 'spo2', changeType: 'increase', value: 10, maxValue: 97 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 8, minValue: 14 },
      { vitalSign: 'pulse', changeType: 'increase', value: 15, maxValue: 150 },
    ],
    contraindications: ['Significant tachycardia >160'],
  },
  {
    id: 'nebulised_adrenaline',
    name: 'Nebulised Adrenaline (5mg/5ml)',
    description: 'For croup, stridor, upper airway oedema',
    category: 'breathing',
    onset: 'moderate',
    onsetTimeSeconds: 10,
    durationSeconds: 30,
    icon: 'Wind',
    color: 'blue',
    effects: [
      { vitalSign: 'spo2', changeType: 'increase', value: 6, maxValue: 97 },
      { vitalSign: 'respiration', changeType: 'decrease', value: 4, minValue: 14 },
    ],
    contraindications: [],
  },
];

// Get treatments by category
export function getTreatmentsByCategory(category: TreatmentCategory): Treatment[] {
  return TREATMENTS.filter(t => t.category === category);
}

// Get all treatment categories with counts
export function getTreatmentCategories(): { category: TreatmentCategory; count: number; label: string }[] {
  const categories: TreatmentCategory[] = ['airway', 'breathing', 'circulation', 'medication', 'procedure', 'comfort', 'positioning', 'psychological'];
  const labels: Record<TreatmentCategory, string> = {
    airway: 'Airway',
    breathing: 'Breathing',
    circulation: 'Circulation',
    medication: 'Medications',
    procedure: 'Procedures',
    comfort: 'Comfort',
    positioning: 'Positioning',
    psychological: 'Psychological',
  };
  
  return categories.map(cat => ({
    category: cat,
    count: TREATMENTS.filter(t => t.category === cat).length,
    label: labels[cat],
  }));
}

// Calculate treatment progress (0-1)
export function calculateTreatmentProgress(
  application: TreatmentApplication,
  currentTime: number
): number {
  const elapsed = (currentTime - application.startTime) / 1000; // Convert to seconds
  const treatment = application.treatment;
  
  if (elapsed < treatment.onsetTimeSeconds) {
    return 0; // Not started yet
  }
  
  const effectiveDuration = treatment.durationSeconds - treatment.onsetTimeSeconds;
  const progress = (elapsed - treatment.onsetTimeSeconds) / effectiveDuration;
  
  return Math.min(1, Math.max(0, progress));
}

// Apply treatment effect with gradual progression
export function applyTreatmentEffectGradual(
  treatment: Treatment,
  currentVitals: VitalSigns,
  progress: number // 0-1
): { vitals: VitalSigns; hasChanges: boolean; changes: string[] } {
  const newVitals = { ...currentVitals };
  const changes: string[] = [];
  const bp = parseBP(newVitals.bp);
  
  // Apply each effect with partial progress
  treatment.effects.forEach(effect => {
    // Check condition if present
    if (effect.condition && !effect.condition(newVitals)) {
      return;
    }
    
    // Calculate partial effect based on progress
    const partialValue = effect.value * progress;
    
    switch (effect.vitalSign) {
      case 'bp': {
        const oldSystolic = bp.systolic;
        if (effect.changeType === 'increase') {
          const newSystolic = Math.min(
            effect.maxValue || 999,
            Math.max(effect.minValue || 60, bp.systolic + partialValue)
          );
          bp.systolic = newSystolic;
          if (progress >= 0.1) changes.push(`BP +${Math.round(partialValue)}`);
        } else if (effect.changeType === 'decrease') {
          const newSystolic = Math.max(
            effect.minValue || 60,
            Math.min(effect.maxValue || 999, bp.systolic - partialValue)
          );
          bp.systolic = newSystolic;
          if (progress >= 0.1) changes.push(`BP -${Math.round(partialValue)}`);
        } else if (effect.changeType === 'set') {
          const targetSystolic = effect.value;
          const diff = targetSystolic - bp.systolic;
          bp.systolic += diff * progress;
          if (progress >= 0.1) changes.push(`BP → ${Math.round(bp.systolic)}`);
        } else if (effect.changeType === 'stabilize') {
          // Stabilize: prevent further deterioration, nudge toward normal range
          if (bp.systolic < 90) {
            // If critically low, gradually bring up toward 90
            const correction = (90 - bp.systolic) * 0.3 * progress;
            bp.systolic += correction;
          } else if (bp.systolic > 180) {
            // If critically high, gradually bring down toward 180
            const correction = (bp.systolic - 180) * 0.3 * progress;
            bp.systolic -= correction;
          }
          if (progress >= 0.1) changes.push('BP stabilized');
        }
        // Adjust diastolic proportionally to systolic change
        const systolicDelta = bp.systolic - oldSystolic;
        if (Math.abs(systolicDelta) > 0.5) {
          bp.diastolic = Math.round(Math.max(30, Math.min(120, bp.diastolic + systolicDelta * 0.6)));
        }
        newVitals.bp = formatBP(Math.round(bp.systolic), bp.diastolic);
        break;
      }
        
      case 'pulse':
        if (effect.changeType === 'increase') {
          const newPulse = Math.min(
            effect.maxValue || 999,
            Math.max(effect.minValue || 40, newVitals.pulse + partialValue)
          );
          newVitals.pulse = Math.round(newPulse);
          if (progress >= 0.1) changes.push(`HR +${Math.round(partialValue)}`);
        } else if (effect.changeType === 'decrease') {
          const newPulse = Math.max(
            effect.minValue || 40,
            Math.min(effect.maxValue || 999, newVitals.pulse - partialValue)
          );
          newVitals.pulse = Math.round(newPulse);
          if (progress >= 0.1) changes.push(`HR -${Math.round(partialValue)}`);
        } else if (effect.changeType === 'set') {
          const diff = effect.value - newVitals.pulse;
          newVitals.pulse = Math.round(newVitals.pulse + (diff * progress));
          if (progress >= 0.1) changes.push(`HR → ${newVitals.pulse}`);
        }
        break;
        
      case 'respiration':
        if (effect.changeType === 'increase') {
          const newRR = Math.min(
            effect.maxValue || 60,
            Math.max(effect.minValue || 8, newVitals.respiration + partialValue)
          );
          newVitals.respiration = Math.round(newRR);
          if (progress >= 0.1) changes.push(`RR +${Math.round(partialValue)}`);
        } else if (effect.changeType === 'decrease') {
          const newRR = Math.max(
            effect.minValue || 8,
            Math.min(effect.maxValue || 60, newVitals.respiration - partialValue)
          );
          newVitals.respiration = Math.round(newRR);
          if (progress >= 0.1) changes.push(`RR -${Math.round(partialValue)}`);
        } else if (effect.changeType === 'set') {
          const diff = effect.value - newVitals.respiration;
          newVitals.respiration = Math.round(newVitals.respiration + (diff * progress));
          if (progress >= 0.1) changes.push(`RR → ${newVitals.respiration}`);
        } else if (effect.changeType === 'stabilize') {
          // Stabilize: normalize respiration rate toward 14-18 range
          if (newVitals.respiration > 24) {
            const correction = (newVitals.respiration - 20) * 0.3 * progress;
            newVitals.respiration = Math.round(newVitals.respiration - correction);
          } else if (newVitals.respiration < 10) {
            const correction = (12 - newVitals.respiration) * 0.3 * progress;
            newVitals.respiration = Math.round(newVitals.respiration + correction);
          }
          if (progress >= 0.1) changes.push('RR stabilized');
        }
        break;
        
      case 'spo2':
        if (effect.changeType === 'increase') {
          const newSpO2 = Math.min(
            effect.maxValue || 100,
            Math.max(effect.minValue || 70, newVitals.spo2 + partialValue)
          );
          newVitals.spo2 = Math.round(newSpO2);
          if (progress >= 0.1) changes.push(`SpO₂ +${Math.round(partialValue)}%`);
        } else if (effect.changeType === 'set') {
          const diff = effect.value - newVitals.spo2;
          newVitals.spo2 = Math.round(newVitals.spo2 + (diff * progress));
          if (progress >= 0.1) changes.push(`SpO₂ → ${newVitals.spo2}%`);
        }
        break;
        
      case 'gcs':
        if (effect.changeType === 'increase') {
          const newGCS = Math.min(
            effect.maxValue || 15,
            Math.max(effect.minValue || 3, (newVitals.gcs || 15) + partialValue)
          );
          newVitals.gcs = Math.round(newGCS);
          if (progress >= 0.1) changes.push(`GCS +${Math.round(partialValue)}`);
        } else if (effect.changeType === 'decrease') {
          const newGCS = Math.max(
            effect.minValue || 3,
            Math.min(effect.maxValue || 15, (newVitals.gcs || 15) - partialValue)
          );
          newVitals.gcs = Math.round(newGCS);
          if (progress >= 0.1) changes.push(`GCS -${Math.round(partialValue)}`);
        } else if (effect.changeType === 'set') {
          const currentGCS = newVitals.gcs || 15;
          const diff = effect.value - currentGCS;
          newVitals.gcs = Math.round(currentGCS + (diff * progress));
          if (progress >= 0.1) changes.push(`GCS → ${newVitals.gcs}`);
        }
        break;
        
      case 'bloodGlucose':
        if (effect.changeType === 'increase') {
          const newBG = Math.min(
            effect.maxValue || 30,
            Math.max(effect.minValue || 2, (newVitals.bloodGlucose || 5.5) + partialValue)
          );
          newVitals.bloodGlucose = Math.round(newBG * 10) / 10;
          if (progress >= 0.1) changes.push(`Glucose +${partialValue.toFixed(1)}`);
        } else if (effect.changeType === 'decrease') {
          const newBG = Math.max(
            effect.minValue || 2,
            Math.min(effect.maxValue || 30, (newVitals.bloodGlucose || 5.5) - partialValue)
          );
          newVitals.bloodGlucose = Math.round(newBG * 10) / 10;
          if (progress >= 0.1) changes.push(`Glucose -${partialValue.toFixed(1)}`);
        }
        break;
        
      case 'temperature':
        if (effect.changeType === 'increase') {
          const newTemp = Math.min(
            effect.maxValue || 42,
            Math.max(effect.minValue || 35, (newVitals.temperature || 36.5) + partialValue)
          );
          newVitals.temperature = Math.round(newTemp * 10) / 10;
          if (progress >= 0.1) changes.push(`Temp +${partialValue.toFixed(1)}°C`);
        } else if (effect.changeType === 'decrease') {
          const newTemp = Math.max(
            effect.minValue || 35,
            Math.min(effect.maxValue || 42, (newVitals.temperature || 36.5) - partialValue)
          );
          newVitals.temperature = Math.round(newTemp * 10) / 10;
          if (progress >= 0.1) changes.push(`Temp -${partialValue.toFixed(1)}°C`);
        }
        break;
    }
  });
  
  return {
    vitals: newVitals,
    hasChanges: changes.length > 0,
    changes,
  };
}

// Get human-readable onset description
export function getOnsetDescription(onset: TreatmentOnset): string {
  const descriptions: Record<TreatmentOnset, string> = {
    immediate: 'Immediate effect',
    fast: 'Seconds (2-10s)',
    moderate: 'Minutes (30s-2min)',
    gradual: 'Several minutes (1-2min)',
    delayed: 'Delayed (2+ minutes)',
  };
  return descriptions[onset];
}

// Export helper functions
export { parseBP, formatBP };
