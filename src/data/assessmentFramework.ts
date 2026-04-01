/**
 * Assessment Framework
 *
 * Defines structured clinical assessments that students must perform during cases.
 * Each case type has specific required and optional assessments.
 * Findings are pulled from the actual case data (ABCDE, secondary survey, history).
 *
 * Assessment flow:
 * 1. Primary Survey (ABCDE) — always required
 * 2. Secondary Survey — case-dependent (full for trauma, focused for medical)
 * 3. History Taking (SAMPLE/AMPLE) — always required
 * 4. Special Assessments — case-specific (stroke screen, obstetric, burns, etc.)
 */

import type { CaseScenario, CaseCategory } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export type AssessmentPhase = 'primary' | 'secondary' | 'history' | 'special';

export type PrimaryAssessmentStep =
  | 'scene-safety'
  | 'airway'
  | 'breathing'
  | 'circulation'
  | 'disability'
  | 'exposure';

export type SecondaryAssessmentStep =
  | 'head'
  | 'face'
  | 'neck-cspine'
  | 'chest'
  | 'abdomen'
  | 'pelvis'
  | 'extremities'
  | 'right-arm'
  | 'left-arm'
  | 'right-leg'
  | 'left-leg'
  | 'posterior-logroll';

export type HistoryStep =
  | 'signs-symptoms'
  | 'allergies'
  | 'medications'
  | 'past-medical'
  | 'last-meal'
  | 'events-leading';

export type SpecialAssessmentStep =
  | 'stroke-screen'
  | 'trauma-score'
  | 'burns-assessment'
  | 'obstetric-assessment'
  | 'pediatric-assessment'
  | 'psychiatric-assessment'
  | 'toxicology-screen'
  | 'pain-assessment'
  | '12-lead-ecg'
  | 'blood-glucose'
  | 'temperature'
  | 'reversible-causes';

export type AssessmentStepId =
  | PrimaryAssessmentStep
  | SecondaryAssessmentStep
  | HistoryStep
  | SpecialAssessmentStep;

export interface AssessmentFinding {
  label: string;
  value: string;
  severity: 'normal' | 'abnormal' | 'critical';
  /** Clinical significance hint shown after assessment */
  significance?: string;
}

export interface AssessmentStepDefinition {
  id: AssessmentStepId;
  phase: AssessmentPhase;
  label: string;
  shortLabel: string;
  icon: string; // lucide icon name
  description: string;
  /** Points for performing this assessment */
  points: number;
  /** If true, failure to perform is flagged in debrief */
  required: boolean;
  /** If true, missing this is a critical error */
  critical: boolean;
  /** Time limit suggestion (seconds) */
  suggestedTimeLimit?: number;
  /** Clinical rationale for performing this assessment */
  rationale: string;
}

export interface PerformedAssessment {
  stepId: AssessmentStepId;
  phase: AssessmentPhase;
  performedAt: string; // ISO timestamp
  elapsedSeconds: number; // seconds since case start
  findings: AssessmentFinding[];
  /** Order in which this was performed (1-indexed) */
  order: number;
}

export interface AssessmentTracker {
  /** All assessments performed by the student */
  performed: PerformedAssessment[];
  /** Which steps are required for this case */
  required: AssessmentStepId[];
  /** Which steps are optional but recommended */
  recommended: AssessmentStepId[];
  /** Total possible assessment points */
  totalPoints: number;
  /** Points earned from assessments performed */
  earnedPoints: number;
}

// ============================================================================
// STEP DEFINITIONS
// ============================================================================

export const PRIMARY_STEPS: AssessmentStepDefinition[] = [
  {
    id: 'scene-safety',
    phase: 'primary',
    label: 'Scene Safety & BSI',
    shortLabel: 'Scene',
    icon: 'Shield',
    description: 'Assess scene safety, don BSI/PPE, determine mechanism of injury or nature of illness',
    points: 5,
    required: true,
    critical: true,
    suggestedTimeLimit: 15,
    rationale: 'Scene safety is always the first priority. Failure to assess can endanger both crew and patient.',
  },
  {
    id: 'airway',
    phase: 'primary',
    label: 'Airway Assessment',
    shortLabel: 'Airway',
    icon: 'Wind',
    description: 'Assess airway patency, look for obstruction, consider adjuncts',
    points: 10,
    required: true,
    critical: true,
    suggestedTimeLimit: 30,
    rationale: 'Airway compromise is immediately life-threatening. Must be assessed and managed before proceeding.',
  },
  {
    id: 'breathing',
    phase: 'primary',
    label: 'Breathing Assessment',
    shortLabel: 'Breathing',
    icon: 'Stethoscope',
    description: 'Rate, rhythm, depth, SpO2, auscultation, chest movement, work of breathing',
    points: 10,
    required: true,
    critical: true,
    suggestedTimeLimit: 60,
    rationale: 'Breathing assessment includes rate, quality, and auscultation. Identifies respiratory emergencies.',
  },
  {
    id: 'circulation',
    phase: 'primary',
    label: 'Circulation Assessment',
    shortLabel: 'Circulation',
    icon: 'Heart',
    description: 'Pulse rate & quality, blood pressure, capillary refill, skin colour/temp, bleeding control',
    points: 10,
    required: true,
    critical: true,
    suggestedTimeLimit: 60,
    rationale: 'Circulatory assessment identifies shock, hemorrhage, and cardiac compromise.',
  },
  {
    id: 'disability',
    phase: 'primary',
    label: 'Disability / Neuro',
    shortLabel: 'Disability',
    icon: 'Brain',
    description: 'AVPU/GCS, pupils, blood glucose, focal deficits, posturing',
    points: 10,
    required: true,
    critical: false,
    suggestedTimeLimit: 45,
    rationale: 'Neurological status determines urgency and guides management. GCS is key for decision-making.',
  },
  {
    id: 'exposure',
    phase: 'primary',
    label: 'Exposure / Environment',
    shortLabel: 'Exposure',
    icon: 'Thermometer',
    description: 'Temperature, head-to-toe visual inspection, environmental factors, dignity preservation',
    points: 5,
    required: true,
    critical: false,
    suggestedTimeLimit: 30,
    rationale: 'Exposure reveals hidden injuries, rashes, and environmental factors. Maintain patient dignity.',
  },
];

export const SECONDARY_STEPS: AssessmentStepDefinition[] = [
  {
    id: 'head',
    phase: 'secondary',
    label: 'Head Examination',
    shortLabel: 'Head',
    icon: 'Scan',
    description: 'Scalp lacerations, depressions, Battle\'s sign, raccoon eyes, CSF leak',
    points: 5,
    required: false,
    critical: false,
    rationale: 'Head injuries may be occult. Palpate entire scalp and inspect for signs of base of skull fracture.',
  },
  {
    id: 'face',
    phase: 'secondary',
    label: 'Face Examination',
    shortLabel: 'Face',
    icon: 'User',
    description: 'Facial bones stability, dental trauma, nasal deformity, periorbital swelling',
    points: 3,
    required: false,
    critical: false,
    rationale: 'Facial fractures can compromise airway. Check for instability and dental avulsions.',
  },
  {
    id: 'neck-cspine',
    phase: 'secondary',
    label: 'Neck & C-Spine',
    shortLabel: 'Neck',
    icon: 'ArrowUpDown',
    description: 'C-spine tenderness, tracheal position, JVD, subcutaneous emphysema, carotid pulses',
    points: 8,
    required: false,
    critical: false,
    rationale: 'Neck assessment reveals tension pneumothorax signs, vascular injury, and spinal compromise.',
  },
  {
    id: 'chest',
    phase: 'secondary',
    label: 'Chest Examination',
    shortLabel: 'Chest',
    icon: 'Stethoscope',
    description: 'Inspect, palpate, percuss, auscultate. Symmetry, crepitus, flail segments, breath sounds',
    points: 8,
    required: false,
    critical: false,
    rationale: 'Thoracic injuries are the second most common cause of trauma death. Systematic exam is essential.',
  },
  {
    id: 'abdomen',
    phase: 'secondary',
    label: 'Abdominal Examination',
    shortLabel: 'Abdomen',
    icon: 'Circle',
    description: 'Inspect, palpate all four quadrants. Guarding, rigidity, distension, tenderness',
    points: 5,
    required: false,
    critical: false,
    rationale: 'Abdominal injuries can be occult. Serial assessment is important — initial exam may be unreliable.',
  },
  {
    id: 'pelvis',
    phase: 'secondary',
    label: 'Pelvis Assessment',
    shortLabel: 'Pelvis',
    icon: 'Bone',
    description: 'Single gentle AP compression. Do NOT rock. Assess stability, perineal injury',
    points: 5,
    required: false,
    critical: false,
    rationale: 'Pelvic fractures can cause massive hemorrhage. Only compress ONCE — repeated assessment causes harm.',
  },
  {
    id: 'extremities',
    phase: 'secondary',
    label: 'Extremities (All 4)',
    shortLabel: 'Limbs',
    icon: 'Hand',
    description: 'PMS (pulses, motor, sensation) all limbs. Deformity, swelling, crepitus, open fractures',
    points: 5,
    required: false,
    critical: false,
    rationale: 'Check PMS before and after any splinting. Document neurovascular status of injured limbs.',
  },
  {
    id: 'posterior-logroll',
    phase: 'secondary',
    label: 'Posterior / Log Roll',
    shortLabel: 'Posterior',
    icon: 'RotateCcw',
    description: 'Log roll with C-spine protection. Inspect and palpate spine, flanks, buttocks',
    points: 8,
    required: false,
    critical: false,
    rationale: 'Posterior injuries are commonly missed. Log roll requires team coordination and C-spine control.',
  },
];

export const HISTORY_STEPS: AssessmentStepDefinition[] = [
  {
    id: 'signs-symptoms',
    phase: 'history',
    label: 'Signs & Symptoms (OPQRST)',
    shortLabel: 'S&S',
    icon: 'MessageCircle',
    description: 'Onset, Provocation, Quality, Radiation, Severity, Time. Chief complaint characterisation.',
    points: 8,
    required: true,
    critical: false,
    rationale: 'Detailed symptom characterisation is essential for forming differential diagnoses.',
  },
  {
    id: 'allergies',
    phase: 'history',
    label: 'Allergies',
    shortLabel: 'Allergies',
    icon: 'AlertCircle',
    description: 'Drug allergies, environmental allergies, food allergies. Type of reaction.',
    points: 5,
    required: true,
    critical: true,
    rationale: 'Allergy status must be checked BEFORE administering any medication. Anaphylaxis risk.',
  },
  {
    id: 'medications',
    phase: 'history',
    label: 'Current Medications',
    shortLabel: 'Meds',
    icon: 'Pill',
    description: 'Prescription, OTC, herbal, recreational. Dose, frequency, compliance.',
    points: 5,
    required: true,
    critical: false,
    rationale: 'Medications reveal underlying conditions and potential drug interactions with treatments.',
  },
  {
    id: 'past-medical',
    phase: 'history',
    label: 'Past Medical History',
    shortLabel: 'PMHx',
    icon: 'FileText',
    description: 'Medical conditions, surgical history, previous similar episodes, hospitalisations.',
    points: 5,
    required: true,
    critical: false,
    rationale: 'Past history contextualises the current presentation and guides management.',
  },
  {
    id: 'last-meal',
    phase: 'history',
    label: 'Last Oral Intake',
    shortLabel: 'Last Meal',
    icon: 'Coffee',
    description: 'Time of last food and drink. Important for anaesthesia risk and diabetic assessment.',
    points: 3,
    required: true,
    critical: false,
    rationale: 'Last intake is relevant if the patient may need anaesthesia or has altered glucose.',
  },
  {
    id: 'events-leading',
    phase: 'history',
    label: 'Events Leading Up',
    shortLabel: 'Events',
    icon: 'Clock',
    description: 'What happened? Timeline of events, mechanism of injury, witnesses, prior to EMS arrival.',
    points: 5,
    required: true,
    critical: false,
    rationale: 'Understanding the timeline and mechanism helps determine injury patterns and severity.',
  },
];

export const SPECIAL_STEPS: AssessmentStepDefinition[] = [
  {
    id: 'stroke-screen',
    phase: 'special',
    label: 'Stroke Screening (FAST/BEFAST)',
    shortLabel: 'Stroke',
    icon: 'Brain',
    description: 'Balance, Eyes, Face droop, Arm drift, Speech, Time of onset. Cincinnati or LAMS scale.',
    points: 10,
    required: false,
    critical: false,
    rationale: 'Rapid stroke identification enables activation of stroke pathway and time-critical intervention.',
  },
  {
    id: 'trauma-score',
    phase: 'special',
    label: 'Trauma Score / ISS',
    shortLabel: 'Trauma Score',
    icon: 'Calculator',
    description: 'Revised Trauma Score (GCS + RR + SBP). Guides triage decisions and destination.',
    points: 5,
    required: false,
    critical: false,
    rationale: 'Trauma scoring assists in triage decisions and trauma center activation criteria.',
  },
  {
    id: 'burns-assessment',
    phase: 'special',
    label: 'Burns Assessment (Rule of 9s)',
    shortLabel: 'Burns',
    icon: 'Flame',
    description: 'TBSA calculation using Rule of 9s or Lund-Browder. Depth assessment. Inhalation injury signs.',
    points: 10,
    required: false,
    critical: false,
    rationale: 'Accurate TBSA determines fluid resuscitation requirements. Inhalation injury changes airway management.',
  },
  {
    id: 'obstetric-assessment',
    phase: 'special',
    label: 'Obstetric Assessment',
    shortLabel: 'OB Assessment',
    icon: 'Baby',
    description: 'Fundal height, contractions, vaginal bleeding/show, membrane status, urge to push, foetal HR.',
    points: 10,
    required: false,
    critical: false,
    rationale: 'Obstetric emergencies require specific assessment to determine imminent delivery or complications.',
  },
  {
    id: 'pediatric-assessment',
    phase: 'special',
    label: 'Pediatric Assessment Triangle',
    shortLabel: 'PAT',
    icon: 'Baby',
    description: 'Appearance (TICLS), Work of Breathing, Circulation to Skin. Across-the-room assessment.',
    points: 8,
    required: false,
    critical: false,
    rationale: 'PAT provides rapid paediatric status assessment before hands-on exam.',
  },
  {
    id: 'psychiatric-assessment',
    phase: 'special',
    label: 'Mental Health Assessment',
    shortLabel: 'Psych',
    icon: 'Brain',
    description: 'Risk assessment (self-harm, harm to others), mental state exam, capacity assessment.',
    points: 8,
    required: false,
    critical: false,
    rationale: 'Mental health assessment ensures patient safety and determines appropriate care pathway.',
  },
  {
    id: 'toxicology-screen',
    phase: 'special',
    label: 'Toxicology Assessment',
    shortLabel: 'Tox Screen',
    icon: 'Flask',
    description: 'Substance identification, quantity, time of ingestion, toxidrome recognition, antidote indication.',
    points: 10,
    required: false,
    critical: false,
    rationale: 'Toxicological assessment determines decontamination needs and specific antidote administration.',
  },
  {
    id: 'pain-assessment',
    phase: 'special',
    label: 'Pain Assessment (0-10)',
    shortLabel: 'Pain',
    icon: 'Gauge',
    description: 'Numeric rating scale or Wong-Baker faces. Location, character, radiation, aggravating/relieving.',
    points: 3,
    required: false,
    critical: false,
    rationale: 'Pain assessment guides analgesia requirements and is a key quality indicator.',
  },
  {
    id: '12-lead-ecg',
    phase: 'special',
    label: '12-Lead ECG',
    shortLabel: '12-Lead',
    icon: 'Activity',
    description: 'Acquire and interpret 12-lead ECG. Rate, rhythm, axis, ST changes, intervals.',
    points: 10,
    required: false,
    critical: false,
    rationale: '12-lead ECG is essential for identifying STEMI, arrhythmias, and other cardiac emergencies.',
  },
  {
    id: 'blood-glucose',
    phase: 'special',
    label: 'Blood Glucose Level',
    shortLabel: 'BGL',
    icon: 'Droplet',
    description: 'Capillary blood glucose measurement. Normal range 4.0-7.8 mmol/L.',
    points: 5,
    required: false,
    critical: false,
    rationale: 'BGL should be checked in any patient with altered consciousness, seizure, or diabetic history.',
  },
  {
    id: 'temperature',
    phase: 'special',
    label: 'Temperature',
    shortLabel: 'Temp',
    icon: 'Thermometer',
    description: 'Core or tympanic temperature. Identifies hypothermia, hyperthermia, and fever.',
    points: 3,
    required: false,
    critical: false,
    rationale: 'Temperature abnormalities guide management in environmental, infectious, and post-cardiac arrest care.',
  },
  {
    id: 'reversible-causes',
    phase: 'special',
    label: "H's and T's (Reversible Causes)",
    shortLabel: "H's & T's",
    icon: 'Search',
    description: "Systematic review of reversible causes of cardiac arrest: Hypovolaemia, Hypoxia, Hydrogen ions (acidosis), Hypo/Hyperkalaemia, Hypothermia, Tension pneumothorax, Tamponade, Toxins, Thrombosis (coronary & pulmonary).",
    points: 10,
    required: false,
    critical: true,
    rationale: "Identifying and treating reversible causes is the only way to achieve ROSC in non-shockable arrest and improves outcomes in all arrest rhythms.",
  },
];

/** All step definitions indexed by ID */
export const ALL_STEPS: Record<AssessmentStepId, AssessmentStepDefinition> = {
  ...Object.fromEntries(PRIMARY_STEPS.map(s => [s.id, s])),
  ...Object.fromEntries(SECONDARY_STEPS.map(s => [s.id, s])),
  ...Object.fromEntries(HISTORY_STEPS.map(s => [s.id, s])),
  ...Object.fromEntries(SPECIAL_STEPS.map(s => [s.id, s])),
} as Record<AssessmentStepId, AssessmentStepDefinition>;

// ============================================================================
// CASE-SPECIFIC ASSESSMENT REQUIREMENTS
// ============================================================================

interface CaseAssessmentProfile {
  /** Which secondary survey steps are required (not just recommended) */
  requiredSecondary: SecondaryAssessmentStep[];
  /** Which secondary survey steps are recommended but not required */
  recommendedSecondary: SecondaryAssessmentStep[];
  /** Which special assessments are required */
  requiredSpecial: SpecialAssessmentStep[];
  /** Which special assessments are recommended */
  recommendedSpecial: SpecialAssessmentStep[];
  /** Label for the secondary survey approach */
  secondarySurveyLabel: string;
  /** Description of what secondary survey approach to use */
  secondarySurveyDescription: string;
}

const TRAUMA_PROFILE: CaseAssessmentProfile = {
  requiredSecondary: ['head', 'neck-cspine', 'chest', 'abdomen', 'pelvis', 'extremities', 'posterior-logroll'],
  recommendedSecondary: ['face'],
  requiredSpecial: ['pain-assessment'],
  recommendedSpecial: ['trauma-score', 'blood-glucose'],
  secondarySurveyLabel: 'Full Trauma Secondary Survey',
  secondarySurveyDescription: 'Systematic head-to-toe examination with log roll. All regions must be assessed.',
};

const CARDIAC_PROFILE: CaseAssessmentProfile = {
  requiredSecondary: ['chest', 'neck-cspine'],
  recommendedSecondary: ['abdomen', 'extremities'],
  requiredSpecial: ['12-lead-ecg', 'pain-assessment'],
  recommendedSpecial: ['blood-glucose'],
  secondarySurveyLabel: 'Focused Cardiac Assessment',
  secondarySurveyDescription: 'Focused chest and cardiovascular examination. 12-lead ECG is critical.',
};

const RESPIRATORY_PROFILE: CaseAssessmentProfile = {
  requiredSecondary: ['chest', 'neck-cspine'],
  recommendedSecondary: ['abdomen'],
  requiredSpecial: ['pain-assessment'],
  recommendedSpecial: ['blood-glucose', 'temperature'],
  secondarySurveyLabel: 'Focused Respiratory Assessment',
  secondarySurveyDescription: 'Detailed chest examination with auscultation, percussion, and work of breathing assessment.',
};

const NEUROLOGICAL_PROFILE: CaseAssessmentProfile = {
  requiredSecondary: ['head', 'neck-cspine', 'extremities'],
  recommendedSecondary: ['face'],
  requiredSpecial: ['stroke-screen', 'blood-glucose'],
  recommendedSpecial: ['temperature'],
  secondarySurveyLabel: 'Focused Neurological Assessment',
  secondarySurveyDescription: 'Detailed neurological exam with stroke screening. BGL is essential to exclude hypoglycaemia.',
};

const TOXICOLOGY_PROFILE: CaseAssessmentProfile = {
  requiredSecondary: ['head', 'abdomen'],
  recommendedSecondary: ['chest', 'extremities'],
  requiredSpecial: ['toxicology-screen', 'blood-glucose'],
  recommendedSpecial: ['12-lead-ecg', 'temperature'],
  secondarySurveyLabel: 'Toxicology-Focused Assessment',
  secondarySurveyDescription: 'Identify substance, quantity, and time. Recognise toxidromes. Check BGL and ECG.',
};

const OBSTETRIC_PROFILE: CaseAssessmentProfile = {
  requiredSecondary: ['abdomen'],
  recommendedSecondary: ['chest', 'extremities'],
  requiredSpecial: ['obstetric-assessment', 'pain-assessment'],
  recommendedSpecial: ['blood-glucose', 'temperature'],
  secondarySurveyLabel: 'Obstetric Assessment',
  secondarySurveyDescription: 'Focused obstetric assessment including fundal height, contractions, and foetal status.',
};

const PEDIATRIC_PROFILE: CaseAssessmentProfile = {
  requiredSecondary: ['head', 'chest', 'abdomen'],
  recommendedSecondary: ['neck-cspine', 'extremities'],
  requiredSpecial: ['pediatric-assessment', 'blood-glucose', 'temperature'],
  recommendedSpecial: ['pain-assessment'],
  secondarySurveyLabel: 'Paediatric Assessment',
  secondarySurveyDescription: 'Start with Paediatric Assessment Triangle. Weight-based calculations for all medications.',
};

const PSYCHIATRIC_PROFILE: CaseAssessmentProfile = {
  requiredSecondary: [],
  recommendedSecondary: ['head', 'extremities'],
  requiredSpecial: ['psychiatric-assessment', 'blood-glucose'],
  recommendedSpecial: ['temperature'],
  secondarySurveyLabel: 'Mental Health Assessment',
  secondarySurveyDescription: 'Safety-first approach. Risk assessment, mental state exam, and capacity evaluation.',
};

const ENVIRONMENTAL_PROFILE: CaseAssessmentProfile = {
  requiredSecondary: ['head', 'chest', 'extremities'],
  recommendedSecondary: ['abdomen', 'neck-cspine'],
  requiredSpecial: ['temperature'],
  recommendedSpecial: ['blood-glucose', 'pain-assessment'],
  secondarySurveyLabel: 'Environmental Exposure Assessment',
  secondarySurveyDescription: 'Core temperature is critical. Assess for heat/cold injuries, exposure time, and environmental factors.',
};

const BURNS_PROFILE: CaseAssessmentProfile = {
  requiredSecondary: ['head', 'chest', 'abdomen', 'extremities'],
  recommendedSecondary: ['face', 'neck-cspine', 'posterior-logroll'],
  requiredSpecial: ['burns-assessment', 'pain-assessment'],
  recommendedSpecial: ['blood-glucose', 'temperature'],
  secondarySurveyLabel: 'Burns Assessment',
  secondarySurveyDescription: 'TBSA calculation with Rule of 9s. Assess depth, circumferential burns, and inhalation injury.',
};

const GENERAL_PROFILE: CaseAssessmentProfile = {
  requiredSecondary: [],
  recommendedSecondary: ['chest', 'abdomen', 'extremities'],
  requiredSpecial: ['pain-assessment'],
  recommendedSpecial: ['blood-glucose', 'temperature'],
  secondarySurveyLabel: 'Focused Assessment',
  secondarySurveyDescription: 'Conduct a focused assessment based on the chief complaint.',
};

/** Map case categories to assessment profiles */
const CATEGORY_PROFILES: Record<string, CaseAssessmentProfile> = {
  'trauma': TRAUMA_PROFILE,
  'cardiac': CARDIAC_PROFILE,
  'cardiac-ecg': CARDIAC_PROFILE,
  'respiratory': RESPIRATORY_PROFILE,
  'thoracic': TRAUMA_PROFILE, // thoracic trauma uses full trauma secondary
  'neurological': NEUROLOGICAL_PROFILE,
  'toxicology': TOXICOLOGY_PROFILE,
  'toxicological': TOXICOLOGY_PROFILE,
  'obstetric': OBSTETRIC_PROFILE,
  'obstetrics-gynecology': OBSTETRIC_PROFILE,
  'pediatric': PEDIATRIC_PROFILE,
  'psychiatric': PSYCHIATRIC_PROFILE,
  'environmental': ENVIRONMENTAL_PROFILE,
  'burns': BURNS_PROFILE,
  'metabolic': { ...GENERAL_PROFILE, requiredSpecial: ['blood-glucose'], recommendedSpecial: ['temperature', '12-lead-ecg'] },
  'general': GENERAL_PROFILE,
  'post-discharge': GENERAL_PROFILE,
  'anxiety-related': PSYCHIATRIC_PROFILE,
  'rule-out': GENERAL_PROFILE,
  'elderly-fall': { ...TRAUMA_PROFILE, recommendedSpecial: ['blood-glucose', 'pain-assessment', '12-lead-ecg'] },
  'critical-care': CARDIAC_PROFILE,
  'clinical-procedures': GENERAL_PROFILE,
  'procedural': GENERAL_PROFILE,
  'multiple-patients': TRAUMA_PROFILE,
  'disaster': TRAUMA_PROFILE,
};

// ============================================================================
// FINDING EXTRACTION — pulls findings from case data
// ============================================================================

/**
 * Get the assessment profile for a given case
 */
export function getAssessmentProfile(category: CaseCategory): CaseAssessmentProfile {
  return CATEGORY_PROFILES[category] || GENERAL_PROFILE;
}

/**
 * Get all required and recommended steps for a case.
 * @param yearLevel Optional student year level — used to gate advanced steps like H's & T's
 */
export function getRequiredSteps(caseData: CaseScenario, yearLevel?: string): {
  required: AssessmentStepId[];
  recommended: AssessmentStepId[];
} {
  const profile = getAssessmentProfile(caseData.category);

  // Primary survey is always fully required
  const required: AssessmentStepId[] = [
    ...PRIMARY_STEPS.map(s => s.id),
    ...HISTORY_STEPS.map(s => s.id),
    ...profile.requiredSecondary,
    ...profile.requiredSpecial,
  ];

  const recommended: AssessmentStepId[] = [
    ...profile.recommendedSecondary,
    ...profile.recommendedSpecial,
  ];

  // H's and T's (reversible causes) for cardiac arrest cases.
  // For 1st-year students this is recommended (not required) — it's a 2nd-year+ curriculum topic.
  const sub = (caseData.subcategory || '').toLowerCase();
  const isArrestCase = sub.includes('cardiac-arrest') || sub.includes('arrest') || sub.includes('vfib') || sub.includes('asystole');
  if (isArrestCase) {
    if (yearLevel === '1st-year') {
      recommended.push('reversible-causes');
    } else {
      required.push('reversible-causes');
    }
  }

  // Pediatric Assessment Triangle (PAT) for any pediatric patient regardless of category
  const patientAge = caseData.patientInfo?.age;
  const isPediatric = patientAge !== undefined && patientAge < 16;
  if (isPediatric && !required.includes('pediatric-assessment') && !recommended.includes('pediatric-assessment')) {
    recommended.push('pediatric-assessment');
  }

  return { required, recommended };
}

/**
 * Extract findings for a specific assessment step from case data.
 *
 * KNOWN LIMITATION: Findings are always derived from the static initial case
 * data (caseData.abcde, caseData.secondarySurvey, etc.). They do NOT update
 * dynamically based on treatment effects or current vital signs. For example,
 * if treatment improves SpO2 from 82% to 92%, auscultation findings will still
 * reflect the initial presentation (e.g., "silent chest"). Implementing
 * dynamic findings would require a significant refactor to pass current
 * patient state into this function and define state-dependent finding rules
 * for each case.
 */
export function getStepFindings(stepId: AssessmentStepId, caseData: CaseScenario): AssessmentFinding[] {
  const findings: AssessmentFinding[] = [];

  switch (stepId) {
    // ---- PRIMARY SURVEY ----
    case 'scene-safety': {
      const scene = caseData.sceneInfo;
      findings.push({
        label: 'Scene Description',
        value: scene.description,
        severity: 'normal',
      });
      if (scene.hazards.length > 0) {
        findings.push({
          label: 'Hazards',
          value: scene.hazards.join('; '),
          severity: 'critical',
          significance: 'Address hazards before approaching patient.',
        });
      } else {
        findings.push({
          label: 'Hazards',
          value: 'No hazards identified — scene safe',
          severity: 'normal',
        });
      }
      if (scene.bystanders) {
        findings.push({
          label: 'Bystanders',
          value: scene.bystanders,
          severity: 'normal',
        });
      }
      if (scene.extricationNeeded) {
        findings.push({
          label: 'Extrication',
          value: 'Extrication required',
          severity: 'abnormal',
          significance: 'Plan extrication early. May need fire rescue assistance.',
        });
      }
      break;
    }

    case 'airway': {
      const airway = caseData.abcde.airway;
      findings.push({
        label: 'Airway Status',
        value: airway.patent ? 'Patent' : 'COMPROMISED',
        severity: airway.patent ? 'normal' : 'critical',
        significance: airway.patent ? undefined : 'Immediate airway management required.',
      });
      airway.findings.forEach(f => {
        const sev = f.toLowerCase().includes('obstruct') || f.toLowerCase().includes('stridor') || f.toLowerCase().includes('snoring')
          ? 'critical' as const
          : f.toLowerCase().includes('short sentence') || f.toLowerCase().includes('gurgling')
            ? 'abnormal' as const
            : 'normal' as const;
        findings.push({ label: 'Finding', value: f, severity: sev });
      });
      if (airway.adjunctsNeeded && airway.adjunctsNeeded.length > 0) {
        findings.push({
          label: 'Adjuncts Needed',
          value: airway.adjunctsNeeded.join(', '),
          severity: 'abnormal',
          significance: 'Consider inserting airway adjuncts.',
        });
      }
      break;
    }

    case 'breathing': {
      const breathing = caseData.abcde.breathing;
      // RR is a dynamic vital — student must count or use monitor
      findings.push({
        label: 'Respiratory Rate',
        value: 'Count the respiratory rate on the patient monitor or by observing chest rise',
        severity: 'normal',
      });
      findings.push({
        label: 'Rhythm & Depth',
        value: `${breathing.rhythm}, ${breathing.depth}`,
        severity: 'normal',
      });
      findings.push({
        label: 'SpO2',
        value: 'Check the patient monitor for current SpO2 reading',
        severity: 'normal',
      });
      // Work of breathing / visual observations (not auscultation)
      breathing.findings.forEach(f => {
        const lower = f.toLowerCase();
        // Filter out auscultation findings — student must listen via panel
        const isAuscultation = lower.includes('wheez') || lower.includes('crackle') ||
          lower.includes('diminished') || lower.includes('absent breath') ||
          lower.includes('air entry') || lower.includes('rhonchi') ||
          lower.includes('stridor') || lower.includes('rales') ||
          lower.includes('clear lung') || lower.includes('lung sounds') ||
          lower.includes('breath sounds') || (lower.includes('bilateral') && lower.includes('clear')) ||
          lower.includes('vesicular') || lower.includes('bronchial breath');
        // Filter out vital sign values — student must check monitor
        const isVitalValue = lower.includes('spo2') || lower.includes('saturation') ||
          lower.includes('respiratory rate') || /\d+\/min/.test(lower) ||
          /\d+\s*%/.test(lower) || lower.includes('room air') ||
          lower.includes('heart rate') || lower.includes('blood pressure') ||
          lower.includes('pulse rate') || lower.includes('bp ');
        if (!isAuscultation && !isVitalValue) {
          findings.push({ label: 'Finding', value: f, severity: 'normal' });
        }
      });
      // Direct student to auscultation panel instead of showing text
      findings.push({
        label: 'Auscultation',
        value: 'Use the Chest Auscultation panel to listen to lung sounds',
        severity: 'normal',
      });
      break;
    }

    case 'circulation': {
      const circ = caseData.abcde.circulation;
      // Pulse and BP are dynamic vitals — direct student to the monitor
      findings.push({
        label: 'Pulse',
        value: `Check the patient monitor — quality: ${circ.pulseQuality}`,
        severity: 'normal',
      });
      findings.push({
        label: 'Blood Pressure',
        value: 'Check the patient monitor for current BP reading',
        severity: 'normal',
      });
      // Physical exam findings — these are found by assessment
      findings.push({
        label: 'Capillary Refill',
        value: `${circ.capillaryRefill} seconds`,
        severity: circ.capillaryRefill > 4 ? 'critical' : circ.capillaryRefill > 2 ? 'abnormal' : 'normal',
      });
      findings.push({
        label: 'Skin',
        value: circ.skin,
        severity: circ.skin.toLowerCase().includes('pale') || circ.skin.toLowerCase().includes('clammy') || circ.skin.toLowerCase().includes('mottled') ? 'abnormal' : 'normal',
      });
      circ.findings.forEach(f => {
        const lower = f.toLowerCase();
        // Filter out vital sign values — student must check monitor
        const isVitalValue = lower.includes('heart rate') || lower.includes('pulse rate') ||
          lower.includes('blood pressure') || /\b\d+\/\d+\b/.test(lower) ||
          /\b\d+\s*bpm\b/.test(lower) || /\bbp\s*\d/.test(lower) ||
          (lower.includes('rate') && /\d+\/min/.test(lower));
        if (isVitalValue) return;
        const sev = lower.includes('shock') || lower.includes('haemorrhag') || lower.includes('hemorrhag')
          ? 'critical' as const
          : lower.includes('tachycard') || lower.includes('hypotens')
            ? 'abnormal' as const
            : 'normal' as const;
        findings.push({ label: 'Finding', value: f, severity: sev });
      });
      // ECG interpretation — student should interpret from ECG display
      if (circ.ecgFindings && circ.ecgFindings.length > 0) {
        findings.push({
          label: 'ECG',
          value: 'Obtain and interpret the ECG from the patient monitor',
          severity: 'normal',
        });
      }
      break;
    }

    case 'disability': {
      const dis = caseData.abcde.disability;
      findings.push({
        label: 'AVPU',
        value: dis.avpu,
        severity: dis.avpu === 'A' ? 'normal' : dis.avpu === 'V' ? 'abnormal' : 'critical',
      });
      findings.push({
        label: 'GCS',
        value: `E${dis.gcs.eye} V${dis.gcs.verbal} M${dis.gcs.motor} = ${dis.gcs.total}/15`,
        severity: dis.gcs.total <= 8 ? 'critical' : dis.gcs.total <= 12 ? 'abnormal' : 'normal',
        significance: dis.gcs.total <= 8 ? 'GCS <= 8: Consider intubation/advanced airway.' : undefined,
      });
      findings.push({
        label: 'Pupils',
        value: Array.isArray(dis.pupils) ? dis.pupils.join('; ') : dis.pupils,
        severity: (Array.isArray(dis.pupils) ? dis.pupils.join(' ') : dis.pupils).toLowerCase().includes('unequal') ||
          (Array.isArray(dis.pupils) ? dis.pupils.join(' ') : dis.pupils).toLowerCase().includes('fixed')
          ? 'critical' : 'normal',
      });
      if (dis.bloodGlucose !== undefined) {
        findings.push({
          label: 'Blood Glucose',
          value: `${dis.bloodGlucose} mmol/L`,
          severity: dis.bloodGlucose < 3.5 ? 'critical' : dis.bloodGlucose < 4.0 || dis.bloodGlucose > 15 ? 'abnormal' : 'normal',
          significance: dis.bloodGlucose < 3.5 ? 'Hypoglycaemia — treat immediately.' : undefined,
        });
      }
      dis.findings.forEach(f => findings.push({ label: 'Finding', value: f, severity: 'normal' }));
      break;
    }

    case 'exposure': {
      const exp = caseData.abcde.exposure;
      if (exp.temperature !== undefined) {
        findings.push({
          label: 'Temperature',
          value: `${exp.temperature} C`,
          severity: exp.temperature < 35 || exp.temperature > 39 ? 'critical' : exp.temperature < 36 || exp.temperature > 38 ? 'abnormal' : 'normal',
        });
      }
      exp.findings.forEach(f => {
        const sev = f.toLowerCase().includes('burn') || f.toLowerCase().includes('wound') || f.toLowerCase().includes('bleeding')
          ? 'abnormal' as const : 'normal' as const;
        findings.push({ label: 'Finding', value: f, severity: sev });
      });
      if (exp.wounds && exp.wounds.length > 0) {
        findings.push({ label: 'Wounds', value: exp.wounds.join('; '), severity: 'abnormal' });
      }
      if (exp.deformities && exp.deformities.length > 0) {
        findings.push({ label: 'Deformities', value: exp.deformities.join('; '), severity: 'abnormal' });
      }
      if (exp.rashes && exp.rashes.length > 0) {
        findings.push({ label: 'Rashes', value: exp.rashes.join('; '), severity: 'abnormal' });
      }
      break;
    }

    // ---- SECONDARY SURVEY ----
    case 'head': {
      const headData = caseData.secondarySurvey?.head || [];
      if (headData.length > 0) {
        headData.forEach(f => {
          const sev = f.toLowerCase().includes('laceration') || f.toLowerCase().includes('depress') || f.toLowerCase().includes('battle') || f.toLowerCase().includes('raccoon')
            ? 'critical' as const
            : f.toLowerCase().includes('tender') || f.toLowerCase().includes('swelling') || f.toLowerCase().includes('haematoma')
              ? 'abnormal' as const
              : 'normal' as const;
          findings.push({ label: 'Head', value: f, severity: sev });
        });
      } else {
        findings.push({ label: 'Head', value: 'No abnormalities detected', severity: 'normal' });
      }
      // Include detailed head if available
      const detailed = caseData.secondarySurvey?.headDetailed;
      if (detailed) {
        if (detailed.scalp?.length) detailed.scalp.forEach(f => findings.push({ label: 'Scalp', value: f, severity: 'normal' }));
        if (detailed.eyes?.length) detailed.eyes.forEach(f => findings.push({ label: 'Eyes', value: f, severity: 'normal' }));
        if (detailed.ears?.length) detailed.ears.forEach(f => findings.push({ label: 'Ears', value: f, severity: 'normal' }));
      }
      break;
    }

    case 'face': {
      const faceData = caseData.secondarySurvey?.headDetailed?.face || [];
      if (faceData.length > 0) {
        faceData.forEach(f => {
          const sev = f.toLowerCase().includes('fracture') || f.toLowerCase().includes('unstable')
            ? 'critical' as const : 'normal' as const;
          findings.push({ label: 'Face', value: f, severity: sev });
        });
      } else {
        findings.push({ label: 'Face', value: 'No facial abnormalities', severity: 'normal' });
      }
      break;
    }

    case 'neck-cspine': {
      const neckData = caseData.secondarySurvey?.neck || [];
      if (neckData.length > 0) {
        neckData.forEach(f => {
          const sev = f.toLowerCase().includes('jvd') || f.toLowerCase().includes('tracheal deviation') || f.toLowerCase().includes('emphysema')
            ? 'critical' as const
            : f.toLowerCase().includes('tender') || f.toLowerCase().includes('midline')
              ? 'abnormal' as const
              : 'normal' as const;
          findings.push({ label: 'Neck/C-Spine', value: f, severity: sev });
        });
      } else {
        findings.push({ label: 'Neck/C-Spine', value: 'Trachea central, no JVD, non-tender', severity: 'normal' });
      }
      break;
    }

    case 'chest': {
      const chestData = caseData.secondarySurvey?.chest || [];
      // Filter out auscultation findings — student must use Chest Auscultation panel
      const auscultationTerms = /clear|wheeze|crackle|rhonchi|breath sounds|air entry|diminished|absent breath/i;
      const inspectionPalpationFindings = chestData.filter(f => !auscultationTerms.test(f));
      if (inspectionPalpationFindings.length > 0) {
        inspectionPalpationFindings.forEach(f => {
          const sev = f.toLowerCase().includes('flail') || f.toLowerCase().includes('crepitus') || f.toLowerCase().includes('open wound') || f.toLowerCase().includes('sucking')
            ? 'critical' as const
            : f.toLowerCase().includes('tender') || f.toLowerCase().includes('decreased') || f.toLowerCase().includes('asymmetr')
              ? 'abnormal' as const
              : 'normal' as const;
          findings.push({ label: 'Chest', value: f, severity: sev });
        });
      } else {
        findings.push({ label: 'Chest', value: 'Equal chest expansion, no tenderness, no crepitus', severity: 'normal' });
      }
      findings.push({ label: 'Note', value: 'Auscultate using the Chest Auscultation panel to assess breath sounds', severity: 'normal' });
      break;
    }

    case 'abdomen': {
      const abdData = caseData.secondarySurvey?.abdomen || [];
      // Filter out bowel sound findings — student must use auscultation panel
      const bowelSoundTerms = /bowel sounds|bowel sound|hyperactive|hypoactive|absent bowel|tinkling|borborygmi/i;
      const abdInspectionPalpation = abdData.filter(f => !bowelSoundTerms.test(f));
      if (abdInspectionPalpation.length > 0) {
        abdInspectionPalpation.forEach(f => {
          const sev = f.toLowerCase().includes('rigid') || f.toLowerCase().includes('guarding') || f.toLowerCase().includes('distended')
            ? 'critical' as const
            : f.toLowerCase().includes('tender')
              ? 'abnormal' as const
              : 'normal' as const;
          findings.push({ label: 'Abdomen', value: f, severity: sev });
        });
      } else {
        findings.push({ label: 'Abdomen', value: 'Soft, non-tender, non-distended', severity: 'normal' });
      }
      findings.push({ label: 'Note', value: 'Auscultate the abdomen to assess bowel sounds', severity: 'normal' });
      break;
    }

    case 'pelvis': {
      const pelvData = caseData.secondarySurvey?.pelvis || [];
      if (pelvData.length > 0) {
        pelvData.forEach(f => {
          const sev = f.toLowerCase().includes('unstable') || f.toLowerCase().includes('crepitus') || f.toLowerCase().includes('open book')
            ? 'critical' as const
            : f.toLowerCase().includes('tender')
              ? 'abnormal' as const
              : 'normal' as const;
          findings.push({ label: 'Pelvis', value: f, severity: sev });
        });
      } else {
        findings.push({ label: 'Pelvis', value: 'Stable, non-tender', severity: 'normal' });
      }
      break;
    }

    case 'extremities': {
      const extData = caseData.secondarySurvey?.extremities || [];
      if (extData.length > 0) {
        extData.forEach(f => {
          const sev = f.toLowerCase().includes('open fracture') || f.toLowerCase().includes('absent pulse') || f.toLowerCase().includes('amputation')
            ? 'critical' as const
            : f.toLowerCase().includes('deform') || f.toLowerCase().includes('swelling') || f.toLowerCase().includes('fracture')
              ? 'abnormal' as const
              : 'normal' as const;
          findings.push({ label: 'Extremities', value: f, severity: sev });
        });
      } else {
        findings.push({ label: 'Extremities', value: 'No deformity, PMS intact all limbs', severity: 'normal' });
      }
      break;
    }

    case 'posterior-logroll': {
      const postData = caseData.secondarySurvey?.posterior || [];
      const spineData = caseData.secondarySurvey?.spine || [];
      if (postData.length > 0) {
        postData.forEach(f => {
          const sev = f.toLowerCase().includes('step') || f.toLowerCase().includes('deformity')
            ? 'critical' as const
            : f.toLowerCase().includes('tender') || f.toLowerCase().includes('bruising')
              ? 'abnormal' as const
              : 'normal' as const;
          findings.push({ label: 'Posterior', value: f, severity: sev });
        });
      } else {
        findings.push({ label: 'Posterior', value: 'No spinal tenderness, no bruising', severity: 'normal' });
      }
      if (spineData.length > 0) {
        spineData.forEach(f => findings.push({ label: 'Spine', value: f, severity: f.toLowerCase().includes('tender') ? 'abnormal' : 'normal' }));
      }
      break;
    }

    // ---- HISTORY (SAMPLE) ----
    case 'signs-symptoms': {
      const presentation = caseData.initialPresentation;
      findings.push({ label: 'Chief Complaint', value: caseData.dispatchInfo.callReason, severity: 'normal' });
      if (presentation.generalImpression) {
        findings.push({ label: 'General Impression', value: presentation.generalImpression, severity: 'normal' });
      }
      if (presentation.sounds && presentation.sounds.length > 0) {
        findings.push({ label: 'Sounds', value: presentation.sounds.join('; '), severity: 'normal' });
      }
      findings.push({
        label: 'Events Leading',
        value: caseData.history.eventsLeading,
        severity: 'normal',
      });
      break;
    }

    case 'allergies': {
      const allergies = caseData.history.allergies;
      findings.push({
        label: 'Allergies',
        value: allergies.length > 0 ? allergies.join(', ') : 'No known allergies (NKDA)',
        severity: allergies.some(a => !['none known', 'nkda', 'nil', 'none', 'no known allergies', 'no known drug allergies', 'nil known'].includes(a.toLowerCase().trim())) ? 'abnormal' : 'normal',
        significance: allergies.some(a => !['none known', 'nkda', 'nil', 'none', 'no known allergies', 'no known drug allergies', 'nil known'].includes(a.toLowerCase().trim()))
          ? 'Check for cross-reactivity with planned treatments.'
          : undefined,
      });
      break;
    }

    case 'medications': {
      const meds = caseData.history.medications;
      if (meds.length > 0) {
        meds.forEach(m => {
          const details = [m.dose, m.frequency, m.route].filter(Boolean).join(', ');
          findings.push({
            label: m.name,
            value: details || m.indication || 'No details',
            severity: 'normal',
          });
        });
      } else {
        findings.push({ label: 'Medications', value: 'No current medications', severity: 'normal' });
      }
      break;
    }

    case 'past-medical': {
      const conditions = caseData.history.medicalConditions;
      const surgical = caseData.history.surgicalHistory;
      if (conditions.length > 0) {
        findings.push({ label: 'Medical Conditions', value: conditions.join(', '), severity: 'normal' });
      } else {
        findings.push({ label: 'Medical Conditions', value: 'Nil significant', severity: 'normal' });
      }
      if (surgical.length > 0) {
        findings.push({ label: 'Surgical History', value: surgical.join(', '), severity: 'normal' });
      }
      if (caseData.history.socialHistory) {
        const social = caseData.history.socialHistory;
        if (social.smoking) findings.push({ label: 'Smoking', value: social.smoking, severity: 'normal' });
        if (social.alcohol) findings.push({ label: 'Alcohol', value: social.alcohol, severity: 'normal' });
        if (social.drugs) findings.push({ label: 'Substances', value: social.drugs, severity: social.drugs.toLowerCase().includes('none') ? 'normal' : 'abnormal' });
      }
      break;
    }

    case 'last-meal': {
      findings.push({
        label: 'Last Oral Intake',
        value: caseData.history.lastMeal,
        severity: 'normal',
      });
      break;
    }

    case 'events-leading': {
      findings.push({
        label: 'Events',
        value: caseData.history.eventsLeading,
        severity: 'normal',
      });
      if (caseData.history.previousSimilarEpisodes && caseData.history.previousSimilarEpisodes.length > 0) {
        findings.push({
          label: 'Previous Episodes',
          value: caseData.history.previousSimilarEpisodes.join('; '),
          severity: 'normal',
        });
      }
      break;
    }

    // ---- SPECIAL ASSESSMENTS ----
    case 'stroke-screen': {
      const neuro = caseData.secondarySurvey?.neurological || [];
      const dis = caseData.abcde.disability;
      findings.push({
        label: 'GCS',
        value: `E${dis.gcs.eye} V${dis.gcs.verbal} M${dis.gcs.motor} = ${dis.gcs.total}/15`,
        severity: dis.gcs.total <= 12 ? 'critical' : 'normal',
      });
      if (dis.focalDeficits && dis.focalDeficits.length > 0) {
        dis.focalDeficits.forEach(f => {
          findings.push({ label: 'Focal Deficit', value: f, severity: 'critical' });
        });
      }
      neuro.forEach(f => {
        const sev = f.toLowerCase().includes('weakness') || f.toLowerCase().includes('droop') || f.toLowerCase().includes('slur')
          ? 'critical' as const : 'normal' as const;
        findings.push({ label: 'Neuro', value: f, severity: sev });
      });
      if (findings.length <= 1) {
        findings.push({ label: 'Stroke Screen', value: 'No focal deficits — FAST negative', severity: 'normal' });
      }
      break;
    }

    case 'trauma-score': {
      const dis = caseData.abcde.disability;
      const breathing = caseData.abcde.breathing;
      const circ = caseData.abcde.circulation;
      // Revised Trauma Score components
      const gcsScore = dis.gcs.total >= 13 ? 4 : dis.gcs.total >= 9 ? 3 : dis.gcs.total >= 6 ? 2 : dis.gcs.total >= 4 ? 1 : 0;
      const rrScore = breathing.rate >= 10 && breathing.rate <= 29 ? 4 : breathing.rate > 29 ? 3 : breathing.rate >= 6 ? 2 : breathing.rate >= 1 ? 1 : 0;
      const sbpScore = circ.bp.systolic > 89 ? 4 : circ.bp.systolic >= 76 ? 3 : circ.bp.systolic >= 50 ? 2 : circ.bp.systolic > 0 ? 1 : 0;
      const rts = gcsScore + rrScore + sbpScore;
      findings.push({
        label: 'Revised Trauma Score',
        value: `${rts}/12 (GCS=${gcsScore}, RR=${rrScore}, SBP=${sbpScore})`,
        severity: rts <= 8 ? 'critical' : rts <= 10 ? 'abnormal' : 'normal',
        significance: rts <= 10 ? 'Consider trauma centre activation.' : undefined,
      });
      break;
    }

    case 'burns-assessment': {
      // Burns data would be in exposure findings
      const exp = caseData.abcde.exposure;
      if (exp.wounds && exp.wounds.length > 0) {
        exp.wounds.forEach(w => findings.push({ label: 'Burn/Wound', value: w, severity: 'critical' }));
      }
      exp.findings.forEach(f => {
        if (f.toLowerCase().includes('burn')) {
          findings.push({ label: 'Burns Finding', value: f, severity: 'critical' });
        }
      });
      if (findings.length === 0) {
        findings.push({ label: 'Burns Assessment', value: 'No burns identified', severity: 'normal' });
      }
      break;
    }

    case 'obstetric-assessment':
      findings.push({ label: 'Assessment', value: 'Obstetric assessment performed — see case-specific findings', severity: 'normal' });
      break;

    case 'pediatric-assessment':
      findings.push({ label: 'PAT', value: 'Paediatric Assessment Triangle performed', severity: 'normal' });
      break;

    case 'psychiatric-assessment':
      findings.push({ label: 'Risk Assessment', value: 'Mental health risk assessment performed', severity: 'normal' });
      break;

    case 'toxicology-screen': {
      const events = caseData.history.eventsLeading;
      findings.push({ label: 'History of Event', value: events, severity: 'normal' });
      if (caseData.history.socialHistory?.drugs) {
        findings.push({ label: 'Substance History', value: caseData.history.socialHistory.drugs, severity: 'abnormal' });
      }
      break;
    }

    case 'pain-assessment': {
      const vitals = caseData.vitalSignsProgression.initial;
      findings.push({
        label: 'Pain Score',
        value: vitals.painScore !== undefined ? `${vitals.painScore}/10` : 'Not documented — ask patient',
        severity: vitals.painScore !== undefined && vitals.painScore >= 7 ? 'abnormal' : 'normal',
      });
      break;
    }

    case '12-lead-ecg': {
      const ecg = caseData.abcde.circulation.ecgFindings || [];
      if (ecg.length > 0) {
        ecg.forEach(e => {
          const sev = e.toLowerCase().includes('st elevation') || e.toLowerCase().includes('vt') || e.toLowerCase().includes('vf')
            ? 'critical' as const
            : e.toLowerCase().includes('st depression') || e.toLowerCase().includes('abnormal')
              ? 'abnormal' as const
              : 'normal' as const;
          findings.push({ label: 'ECG', value: e, severity: sev });
        });
      } else {
        findings.push({ label: 'ECG', value: 'Normal sinus rhythm, no acute changes', severity: 'normal' });
      }
      if (caseData.investigations) {
        const ecgInv = caseData.investigations.find(i => i.name.toLowerCase().includes('ecg'));
        if (ecgInv && ecgInv.interpretation) {
          findings.push({ label: 'Interpretation', value: ecgInv.interpretation, severity: 'abnormal' });
        }
      }
      break;
    }

    case 'blood-glucose': {
      const bgl = caseData.abcde.disability.bloodGlucose;
      if (bgl !== undefined) {
        findings.push({
          label: 'Blood Glucose',
          value: `${bgl} mmol/L`,
          severity: bgl < 3.5 ? 'critical' : bgl < 4.0 || bgl > 15 ? 'abnormal' : 'normal',
          significance: bgl < 3.5 ? 'Treat hypoglycaemia immediately — IV glucose or IM glucagon.' : undefined,
        });
      } else {
        findings.push({ label: 'Blood Glucose', value: '5.5 mmol/L (normal)', severity: 'normal' });
      }
      break;
    }

    case 'temperature': {
      const temp = caseData.abcde.exposure.temperature;
      if (temp !== undefined) {
        findings.push({
          label: 'Temperature',
          value: `${temp} C`,
          severity: temp < 35 || temp > 39 ? 'critical' : temp < 36 || temp > 38 ? 'abnormal' : 'normal',
        });
      } else {
        findings.push({ label: 'Temperature', value: '36.8 C (normal)', severity: 'normal' });
      }
      break;
    }

    case 'reversible-causes': {
      // H's and T's — reversible causes of cardiac arrest
      const hsAndTs = [
        { label: 'Hypovolaemia', hint: 'Check for blood loss, dehydration, fluid status' },
        { label: 'Hypoxia', hint: 'Check SpO2, airway patency, ventilation adequacy' },
        { label: 'Hydrogen ions (Acidosis)', hint: 'Consider DKA, renal failure, prolonged arrest' },
        { label: 'Hypo/Hyperkalaemia', hint: 'Consider renal failure, medications, dialysis history' },
        { label: 'Hypothermia', hint: 'Check core temperature, environmental exposure, drowning' },
        { label: 'Tension Pneumothorax', hint: 'Unilateral absent breath sounds, tracheal deviation, JVD' },
        { label: 'Tamponade (Cardiac)', hint: 'Beck\'s triad: hypotension, muffled heart sounds, JVD' },
        { label: 'Toxins / Drugs', hint: 'Medication history, drug paraphernalia, needle marks, pupils' },
        { label: 'Thrombosis — Coronary', hint: '12-lead ECG, chest pain history, risk factors' },
        { label: 'Thrombosis — Pulmonary', hint: 'Recent surgery, immobilisation, DVT signs, pregnancy' },
      ];
      hsAndTs.forEach(item => {
        findings.push({
          label: item.label,
          value: item.hint,
          severity: 'normal',
        });
      });
      // Add case-specific prompts based on findings
      const circ = caseData.abcde.circulation;
      if (circ.bp.systolic < 90) {
        findings.push({ label: 'ALERT', value: 'Hypotension present — consider hypovolaemia, tamponade, tension PTX', severity: 'critical' });
      }
      const breathing = caseData.abcde.breathing;
      if (breathing.spo2 < 90) {
        findings.push({ label: 'ALERT', value: 'Hypoxia present — address oxygenation and ventilation', severity: 'critical' });
      }
      const exp = caseData.abcde.exposure;
      if (exp.temperature !== undefined && exp.temperature < 35) {
        findings.push({ label: 'ALERT', value: `Hypothermia detected (${exp.temperature}°C) — prolonged resuscitation indicated`, severity: 'critical' });
      }
      break;
    }
  }

  return findings;
}

// ============================================================================
// ASSESSMENT TRACKER
// ============================================================================

/**
 * Create a fresh assessment tracker for a case
 */
export function createAssessmentTracker(caseData: CaseScenario, yearLevel?: string): AssessmentTracker {
  const { required, recommended } = getRequiredSteps(caseData, yearLevel);

  let totalPoints = 0;
  required.forEach(stepId => {
    const step = ALL_STEPS[stepId];
    if (step) totalPoints += step.points;
  });
  recommended.forEach(stepId => {
    const step = ALL_STEPS[stepId];
    if (step) totalPoints += Math.floor(step.points * 0.4); // recommended steps worth 40%
  });

  return {
    performed: [],
    required,
    recommended,
    totalPoints,
    earnedPoints: 0,
  };
}

/** Map individual limb region IDs to the parent 'extremities' assessment step */
const LIMB_TO_EXTREMITIES: Record<string, AssessmentStepId> = {
  'right-arm': 'extremities',
  'left-arm': 'extremities',
  'right-leg': 'extremities',
  'left-leg': 'extremities',
};

/**
 * Record an assessment being performed
 */
export function performAssessment(
  tracker: AssessmentTracker,
  stepId: AssessmentStepId,
  caseData: CaseScenario,
  caseStartTime: number,
): { tracker: AssessmentTracker; findings: AssessmentFinding[] } {
  // Map individual limb IDs to the 'extremities' step for scoring purposes
  const effectiveStepId = LIMB_TO_EXTREMITIES[stepId] || stepId;

  // Don't record duplicates (check both the specific limb and the effective step)
  if (tracker.performed.some(p => p.stepId === stepId || p.stepId === effectiveStepId)) {
    return { tracker, findings: getStepFindings(effectiveStepId, caseData) };
  }

  const step = ALL_STEPS[effectiveStepId];
  if (!step) return { tracker, findings: [] };

  const findings = getStepFindings(effectiveStepId, caseData);
  const now = Date.now();

  // Record the effective step ID so that 'extremities' shows as performed
  // even when clicked via a specific limb
  const performed: PerformedAssessment = {
    stepId: effectiveStepId,
    phase: step.phase,
    performedAt: new Date(now).toISOString(),
    elapsedSeconds: Math.floor((now - caseStartTime) / 1000),
    findings,
    order: tracker.performed.length + 1,
  };

  // Calculate points using effective step ID (required/recommended lists use 'extremities')
  let earnedPoints = tracker.earnedPoints;
  if (tracker.required.includes(effectiveStepId)) {
    earnedPoints += step.points;
  } else if (tracker.recommended.includes(effectiveStepId)) {
    earnedPoints += Math.floor(step.points * 0.4); // recommended steps worth 40%
  } else {
    // No points for extra assessments — score is driven by doing the RIGHT assessments
  }

  return {
    tracker: {
      ...tracker,
      performed: [...tracker.performed, performed],
      earnedPoints,
    },
    findings,
  };
}

// ============================================================================
// DEBRIEF ANALYSIS
// ============================================================================

export interface AssessmentDebriefItem {
  stepId: AssessmentStepId;
  label: string;
  phase: AssessmentPhase;
  status: 'completed' | 'missed-required' | 'missed-recommended' | 'bonus';
  /** Timestamp (seconds from case start) when performed */
  performedAt?: number;
  /** Order in which performed */
  order?: number;
  /** Points earned (or missed) */
  points: number;
  /** Why this matters */
  rationale: string;
  /** Was this critical? */
  critical: boolean;
}

/**
 * Generate debrief analysis of what was done and what was missed
 */
export function generateAssessmentDebrief(tracker: AssessmentTracker): {
  items: AssessmentDebriefItem[];
  score: number;
  totalPossible: number;
  criticalMissed: AssessmentDebriefItem[];
  assessmentOrder: string[];
  abcdeCompleted: boolean;
  secondarySurveyCompleted: boolean;
  historyTaken: boolean;
  timingIssues: string[];
} {
  const items: AssessmentDebriefItem[] = [];
  const performedIds = new Set(tracker.performed.map(p => p.stepId));

  // Check all required steps
  tracker.required.forEach(stepId => {
    const step = ALL_STEPS[stepId];
    if (!step) return;
    const performed = tracker.performed.find(p => p.stepId === stepId);
    items.push({
      stepId,
      label: step.label,
      phase: step.phase,
      status: performed ? 'completed' : 'missed-required',
      performedAt: performed?.elapsedSeconds,
      order: performed?.order,
      points: performed ? step.points : -step.points,
      rationale: step.rationale,
      critical: step.critical,
    });
  });

  // Check recommended steps
  tracker.recommended.forEach(stepId => {
    const step = ALL_STEPS[stepId];
    if (!step) return;
    const performed = tracker.performed.find(p => p.stepId === stepId);
    items.push({
      stepId,
      label: step.label,
      phase: step.phase,
      status: performed ? 'completed' : 'missed-recommended',
      performedAt: performed?.elapsedSeconds,
      order: performed?.order,
      points: performed ? Math.floor(step.points * 0.4) : 0, // 40% — matches actual scoring in createAssessmentTracker
      rationale: step.rationale,
      critical: false,
    });
  });

  // Bonus for any extra assessments not in required/recommended
  tracker.performed.forEach(p => {
    if (!tracker.required.includes(p.stepId) && !tracker.recommended.includes(p.stepId)) {
      const step = ALL_STEPS[p.stepId];
      if (step) {
        items.push({
          stepId: p.stepId,
          label: step.label,
          phase: step.phase,
          status: 'bonus',
          performedAt: p.elapsedSeconds,
          order: p.order,
          points: 1,
          rationale: step.rationale,
          critical: false,
        });
      }
    }
  });

  const criticalMissed = items.filter(i => i.status === 'missed-required' && i.critical);

  // Check if ABCDE was completed in order
  const primaryStepIds: PrimaryAssessmentStep[] = ['scene-safety', 'airway', 'breathing', 'circulation', 'disability', 'exposure'];
  const abcdeCompleted = primaryStepIds.every(id => performedIds.has(id));

  // Check secondary survey completion — profile-aware
  // Trauma profiles require all 8 regions; focused medical profiles require only their specific steps
  const requiredSecondaryIds = tracker.required.filter(id => SECONDARY_STEPS.some(s => s.id === id));
  const recommendedSecondaryIds = tracker.recommended.filter(id => SECONDARY_STEPS.some(s => s.id === id));
  const secondarySurveyCompleted = requiredSecondaryIds.length > 0
    ? requiredSecondaryIds.every(id => performedIds.has(id)) // all required secondary steps done
    : recommendedSecondaryIds.some(id => performedIds.has(id)); // at least 1 recommended secondary done

  // History taken
  const historyStepIds: HistoryStep[] = ['signs-symptoms', 'allergies', 'medications', 'past-medical', 'last-meal', 'events-leading'];
  const historyTaken = historyStepIds.filter(id => performedIds.has(id)).length >= 4; // at least 4 of 6

  // Timing issues
  const timingIssues: string[] = [];
  const abcdePerformed = tracker.performed.filter(p => primaryStepIds.includes(p.stepId as PrimaryAssessmentStep));
  if (abcdePerformed.length > 0) {
    // Check if ABCDE was done in order
    const abcdeOrder = abcdePerformed.sort((a, b) => a.order - b.order).map(p => p.stepId);
    const expectedOrder = primaryStepIds.filter(id => abcdeOrder.includes(id));
    if (JSON.stringify(abcdeOrder) !== JSON.stringify(expectedOrder)) {
      timingIssues.push('ABCDE was not performed in the correct order. Follow the systematic A-B-C-D-E sequence.');
    }
    // Check if scene safety was first
    if (abcdePerformed[0]?.stepId !== 'scene-safety' && performedIds.has('scene-safety')) {
      timingIssues.push('Scene safety should be assessed FIRST before approaching the patient.');
    }
  }

  // Check if treatments were applied before primary survey
  if (abcdePerformed.length > 0 && abcdePerformed[0].elapsedSeconds > 120) {
    timingIssues.push('Primary survey was delayed. Begin ABCDE assessment within the first 2 minutes.');
  }

  const assessmentOrder = tracker.performed
    .sort((a, b) => a.order - b.order)
    .map(p => ALL_STEPS[p.stepId]?.shortLabel || p.stepId);

  return {
    items,
    score: tracker.earnedPoints,
    totalPossible: tracker.totalPoints,
    criticalMissed,
    assessmentOrder,
    abcdeCompleted,
    secondarySurveyCompleted,
    historyTaken,
    timingIssues,
  };
}
