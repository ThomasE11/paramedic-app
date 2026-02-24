/**
 * Complication Scenarios System
 * 
 * Unexpected events that require problem-solving and adaptation
 */

import type { VitalSigns } from '@/types';

export type ComplicationSeverity = 'minor' | 'moderate' | 'major' | 'critical';
export type ComplicationTiming = 'immediate' | 'early' | 'mid' | 'late';

export interface Complication {
  id: string;
  name: string;
  description: string;
  severity: ComplicationSeverity;
  timing: ComplicationTiming;
  triggerCondition: string;
  effect: string;
  requiredAction: string;
  consequencesIfIgnored: string[];
}

export const COMPLICATIONS: Complication[] = [
  // EQUIPMENT FAILURES
  {
    id: 'pulse_ox_dislodged',
    name: 'Pulse Oximeter Dislodged',
    description: 'Patient movement caused SpO2 probe to fall off',
    severity: 'minor',
    timing: 'immediate',
    triggerCondition: 'Any patient movement',
    effect: 'Loss of SpO2 monitoring',
    requiredAction: 'Reapply probe',
    consequencesIfIgnored: ['No continuous SpO2 monitoring', 'Delayed hypoxia detection'],
  },
  {
    id: 'bp_cuff_leak',
    name: 'BP Cuff Leak',
    description: 'Slow leak preventing accurate BP measurement',
    severity: 'minor',
    timing: 'early',
    triggerCondition: 'Using manual BP cuff',
    effect: 'Cannot obtain accurate blood pressure',
    requiredAction: 'Replace cuff or switch to manual palpation',
    consequencesIfIgnored: ['No BP monitoring', 'Undetected shock'],
  },
  {
    id: 'iv_infiltrated',
    name: 'IV Infiltration',
    description: 'IV catheter has moved out of vein, fluid in tissue',
    severity: 'moderate',
    timing: 'mid',
    triggerCondition: 'IV fluids running',
    effect: 'Swelling at site, medication not reaching circulation',
    requiredAction: 'Remove IV, apply warm compress, re-site IV',
    consequencesIfIgnored: ['Tissue necrosis', 'Compartment syndrome', 'Ineffective medications'],
  },
  {
    id: 'suction_failure',
    name: 'Suction Unit Failure',
    description: 'Portable suction not generating adequate pressure',
    severity: 'major',
    timing: 'immediate',
    triggerCondition: 'Attempting suctioning',
    effect: 'Cannot clear airway',
    requiredAction: 'Clear tubing, check battery, manual suction backup',
    consequencesIfIgnored: ['Airway obstruction', 'Aspiration', 'Respiratory arrest'],
  },
  
  // PATIENT COMPLICATIONS
  {
    id: 'patient_agitated',
    name: 'Patient Becomes Agitated',
    description: 'Patient becomes combative and uncooperative',
    severity: 'moderate',
    timing: 'mid',
    triggerCondition: 'Head injury, hypoxia, or intoxication',
    effect: 'Cannot assess or treat patient safely',
    requiredAction: 'Verbal de-escalation, consider sedation, protect patient and staff',
    consequencesIfIgnored: ['Staff injury', 'Patient injury', 'Treatment delays', 'Scene safety compromised'],
  },
  {
    id: 'allergic_reaction',
    name: 'Allergic Reaction to Medication',
    description: 'Patient develops hives, bronchospasm after medication',
    severity: 'critical',
    timing: 'immediate',
    triggerCondition: 'Administering any medication',
    effect: 'Anaphylaxis, respiratory distress, hypotension',
    requiredAction: 'Stop medication, adrenaline 0.5mg IM, IV fluids, prepare for intubation',
    consequencesIfIgnored: ['Anaphylactic shock', 'Respiratory arrest', 'Cardiac arrest', 'Death'],
  },
  {
    id: 'seizure',
    name: 'Seizure Activity',
    description: 'Patient begins tonic-clonic seizure',
    severity: 'major',
    timing: 'mid',
    triggerCondition: 'Head injury, hypoglycemia, fever',
    effect: 'Uncontrolled movements, airway compromise',
    requiredAction: 'Protect airway, suction, position laterally, midazolam if >5min',
    consequencesIfIgnored: ['Status epilepticus', 'Hypoxic brain injury', 'Trauma from movements'],
  },
  {
    id: 'vomiting',
    name: 'Projectile Vomiting',
    description: 'Patient vomits without warning',
    severity: 'major',
    timing: 'immediate',
    triggerCondition: 'Head injury, GI bleed, intoxication',
    effect: 'Airway aspiration risk',
    requiredAction: 'Turn patient lateral, suction, protect airway',
    consequencesIfIgnored: ['Aspiration pneumonia', 'Airway obstruction', 'Hypoxia'],
  },
  
  // PROCEDURAL COMPLICATIONS
  {
    id: 'difficult_airway',
    name: 'Difficult Airway',
    description: 'Cannot visualize cords during intubation',
    severity: 'critical',
    timing: 'immediate',
    triggerCondition: 'Attempting intubation',
    effect: 'Failed intubation, hypoxia',
    requiredAction: 'BVM ventilation, call for backup, consider LMA/surgical airway',
    consequencesIfIgnored: ['Hypoxic brain injury', 'Cardiac arrest', 'Death'],
  },
  {
    id: 'difficult_iv',
    name: 'Failed IV Access',
    description: 'Unable to obtain IV access after 2 attempts',
    severity: 'moderate',
    timing: 'mid',
    triggerCondition: 'Attempting IV cannulation',
    effect: 'No vascular access for medications',
    requiredAction: 'IO access, external jugular, or use IM route',
    consequencesIfIgnored: ['Delayed medications', 'Fluid resuscitation impossible'],
  },
  {
    id: 'tension_pneumothorax',
    name: 'Tension Pneumothorax',
    description: 'Chest trauma patient develops tension pneumothorax',
    severity: 'critical',
    timing: 'late',
    triggerCondition: 'Chest trauma, positive pressure ventilation',
    effect: 'Hypotension, JVD, tracheal deviation',
    requiredAction: 'Immediate needle decompression',
    consequencesIfIgnored: ['Cardiac arrest', 'Death within minutes'],
  },
  {
    id: 'rebleed',
    name: 'Wound Rebleeding',
    description: 'Controlled bleeding restarts',
    severity: 'major',
    timing: 'mid',
    triggerCondition: 'Wound packing or tourniquet',
    effect: 'Hemorrhage resumes',
    requiredAction: 'Reapply direct pressure, tighten tourniquet, TXA if available',
    consequencesIfIgnored: ['Hemorrhagic shock', 'Cardiac arrest'],
  },
];

// Random complication generator
export function generateRandomComplication(
  severity?: ComplicationSeverity
): Complication {
  let pool = COMPLICATIONS;
  if (severity) {
    pool = COMPLICATIONS.filter(c => c.severity === severity);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Scene Safety Evolution System
 * 
 * Dynamic hazards that change over time
 */

export type HazardLevel = 'low' | 'moderate' | 'high' | 'extreme';
export type HazardType = 'traffic' | 'fire' | 'structural' | 'chemical' | 'electrical' | 'environmental' | 'violence';

export interface SceneHazard {
  id: string;
  type: HazardType;
  name: string;
  description: string;
  initialLevel: HazardLevel;
  evolution: {
    timeMinutes: number;
    newLevel: HazardLevel;
    description: string;
  }[];
  requiredPPE: string[];
  evacuationTrigger?: string;
}

export const DYNAMIC_HAZARDS: SceneHazard[] = [
  {
    id: 'traffic_rtc',
    type: 'traffic',
    name: 'High-Speed Traffic',
    description: 'Vehicles passing close to scene',
    initialLevel: 'high',
    evolution: [
      { timeMinutes: 0, newLevel: 'high', description: 'Active traffic, no lane closure' },
      { timeMinutes: 10, newLevel: 'moderate', description: 'Police on scene, one lane closed' },
      { timeMinutes: 20, newLevel: 'low', description: 'Road fully blocked by emergency vehicles' },
    ],
    requiredPPE: ['High-vis vest', 'Helmet'],
  },
  {
    id: 'structure_fire',
    type: 'structural',
    name: 'Unstable Building',
    description: 'Post-fire structural collapse risk',
    initialLevel: 'moderate',
    evolution: [
      { timeMinutes: 0, newLevel: 'moderate', description: 'Fire extinguished, cooling phase' },
      { timeMinutes: 30, newLevel: 'high', description: 'Floor sagging observed' },
      { timeMinutes: 45, newLevel: 'extreme', description: 'Cracking sounds - imminent collapse' },
    ],
    requiredPPE: ['Hard hat', 'Steel-toe boots'],
    evacuationTrigger: 'Cracking sounds heard',
  },
  {
    id: 'chemical_spill',
    type: 'chemical',
    name: 'Unknown Chemical Spill',
    description: 'Liquid spill with unknown substance',
    initialLevel: 'extreme',
    evolution: [
      { timeMinutes: 0, newLevel: 'extreme', description: 'Unknown substance, full PPE required' },
      { timeMinutes: 15, newLevel: 'high', description: 'HazMat identified substance as solvent' },
      { timeMinutes: 30, newLevel: 'moderate', description: 'Containment established' },
    ],
    requiredPPE: ['Level B PPE', 'SCBA'],
  },
  {
    id: 'electrical_storm',
    type: 'electrical',
    name: 'Downed Power Lines',
    description: 'High-voltage lines on vehicle',
    initialLevel: 'extreme',
    evolution: [
      { timeMinutes: 0, newLevel: 'extreme', description: 'Active power lines on ground' },
      { timeMinutes: 25, newLevel: 'high', description: 'Utility company en route' },
      { timeMinutes: 40, newLevel: 'moderate', description: 'Power isolated, lines secured' },
    ],
    requiredPPE: ['Electrical-rated gloves', 'Non-conductive boots'],
    evacuationTrigger: 'Sparking or arcing observed',
  },
  {
    id: 'violent_scene',
    type: 'violence',
    name: 'Active Violence Scene',
    description: 'Potentially unsafe scene',
    initialLevel: 'extreme',
    evolution: [
      { timeMinutes: 0, newLevel: 'extreme', description: 'Wait for police to clear scene' },
      { timeMinutes: 15, newLevel: 'high', description: 'Police on scene, suspect detained' },
      { timeMinutes: 25, newLevel: 'moderate', description: 'Scene secured by law enforcement' },
    ],
    requiredPPE: ['Ballistic vest'],
    evacuationTrigger: 'Suspect not located or multiple threats',
  },
  {
    id: 'water_rescue',
    type: 'environmental',
    name: 'Swift Water',
    description: 'Patient in fast-flowing water',
    initialLevel: 'high',
    evolution: [
      { timeMinutes: 0, newLevel: 'high', description: 'Current 15 knots, difficult extraction' },
      { timeMinutes: 20, newLevel: 'extreme', description: 'Water rising 2 feet, current increasing' },
      { timeMinutes: 45, newLevel: 'high', description: 'Rescue boat on scene' },
    ],
    requiredPPE: ['Water rescue PFD', 'Helmet', 'Throw rope'],
    evacuationTrigger: 'Water level rises above safe level',
  },
];

// Calculate current hazard level based on time
export function getCurrentHazardLevel(
  hazard: SceneHazard,
  elapsedMinutes: number
): HazardLevel {
  let currentLevel = hazard.initialLevel;
  
  for (const evolution of hazard.evolution) {
    if (elapsedMinutes >= evolution.timeMinutes) {
      currentLevel = evolution.newLevel;
    }
  }
  
  return currentLevel;
}

// Scene safety checklist
export const SCENE_SAFETY_CHECKS = [
  { category: 'Environmental', items: ['Safe parking', 'Traffic control', 'Lighting', 'Weather'] },
  { category: 'Scene', items: ['Power lines', 'Fire/smoke', 'Structure stability', 'Chemicals', 'Animals'] },
  { category: 'People', items: ['Bystanders secured', 'Violence risk', 'Family managed', 'Police present if needed'] },
  { category: 'Equipment', items: ['PPE available', 'Vehicle secured', 'Exit routes clear'] },
];

export type { Complication, ComplicationSeverity, ComplicationTiming, SceneHazard, HazardLevel, HazardType };
