import type { CaseScenario, VitalSigns } from '@/types';
import { inferInjuries, type BodyRegion } from '@/lib/injuryMap';

export type ProblemFamily =
  | 'trauma'
  | 'respiratory'
  | 'cardiac'
  | 'toxicology'
  | 'metabolic'
  | 'neurology'
  | 'infection'
  | 'burns'
  | 'obstetric'
  | 'pediatric';

export type RealismVisualEffectKind =
  | 'cyanosis'
  | 'diaphoresis'
  | 'pallor'
  | 'mottling'
  | 'rash'
  | 'facial_swelling'
  | 'pinpoint_pupils'
  | 'dilated_pupils'
  | 'facial_droop'
  | 'tremor'
  | 'seizure_activity'
  | 'burn_pattern'
  | 'soot'
  | 'active_bleeding'
  | 'blood_pool'
  | 'open_wound'
  | 'deformity'
  | 'asymmetric_chest_rise'
  | 'accessory_muscle_use'
  | 'reduced_chest_rise'
  | 'vomit_risk';

export type EquipmentAnchorRegion =
  | 'face'
  | 'mouth'
  | 'nose'
  | 'neck'
  | 'chest'
  | 'left-arm'
  | 'right-arm'
  | 'left-leg'
  | 'right-leg'
  | 'abdomen'
  | 'pelvis'
  | 'posterior'
  | 'scene';

export interface RealismVisualEffect {
  id: string;
  kind: RealismVisualEffectKind;
  region: EquipmentAnchorRegion;
  intensity: 'subtle' | 'moderate' | 'severe';
  showWhen: 'immediate' | 'on-assessment' | 'after-treatment' | 'if-deteriorating';
  clearsWhen?: string[];
  detail: string;
}

export interface EquipmentAnchorSpec {
  treatmentIdFragments: string[];
  region: EquipmentAnchorRegion;
  appearance: string;
  fitRule: string;
  shouldNotBlock: string[];
  activeEffect?: string;
  reassess: string[];
}

export interface PatientBehaviorRule {
  id: string;
  when: string;
  responseType: 'cooperate' | 'refuse' | 'gag' | 'guard' | 'agitate' | 'improve' | 'deteriorate' | 'silent';
  quote?: string;
  debrief: string;
}

export interface TreatmentResponseRule {
  treatmentIdFragments: string[];
  expectedFit: 'matched' | 'partial' | 'mismatch' | 'harmful' | 'blocked';
  visualResult: string[];
  vitalTrajectory: string[];
  reassessment: string[];
  patientBehavior: string[];
  debriefSignal: string;
}

export interface RealismScenarioSpec {
  id: string;
  family: ProblemFamily;
  match: string[];
  priority: number;
  activeProblems: string[];
  immediateVisuals: RealismVisualEffect[];
  equipmentAnchors: EquipmentAnchorSpec[];
  patientBehavior: PatientBehaviorRule[];
  treatmentResponses: TreatmentResponseRule[];
  reassessmentRequirements: string[];
  debriefSignals: string[];
}

export interface ScenarioRealismState {
  matchedScenarioIds: string[];
  families: ProblemFamily[];
  activeProblems: string[];
  visualEffects: RealismVisualEffect[];
  equipmentAnchors: EquipmentAnchorSpec[];
  patientBehavior: PatientBehaviorRule[];
  treatmentResponses: TreatmentResponseRule[];
  reassessmentRequirements: string[];
  debriefSignals: string[];
}

export interface ScenarioRealismInput {
  caseData: CaseScenario;
  vitals?: VitalSigns | null;
  appliedTreatmentIds?: string[];
}

const unique = <T>(items: T[]): T[] => Array.from(new Set(items));

function list(value: string | string[] | undefined | null): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function collectCaseText(caseData: CaseScenario): string {
  return [
    caseData.id,
    caseData.title,
    caseData.category,
    caseData.subcategory,
    caseData.priority,
    caseData.complexity,
    caseData.dispatchInfo?.callReason,
    caseData.dispatchInfo?.location,
    caseData.sceneInfo?.description,
    caseData.sceneInfo?.environment,
    ...(caseData.sceneInfo?.hazards || []),
    ...(caseData.sceneInfo?.accessIssues || []),
    caseData.sceneInfo?.bystanders,
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.appearance,
    caseData.initialPresentation?.position,
    caseData.initialPresentation?.consciousness,
    ...(caseData.initialPresentation?.sounds || []),
    ...(caseData.abcde?.airway?.findings || []),
    ...(caseData.abcde?.breathing?.findings || []),
    ...(caseData.abcde?.breathing?.auscultation || []),
    ...(caseData.abcde?.breathing?.percussion || []),
    ...(caseData.abcde?.circulation?.findings || []),
    ...list(caseData.abcde?.disability?.pupils),
    ...(caseData.abcde?.disability?.findings || []),
    ...(caseData.abcde?.disability?.focalDeficits || []),
    caseData.abcde?.disability?.seizureActivity,
    ...(caseData.abcde?.exposure?.findings || []),
    ...(caseData.abcde?.exposure?.wounds || []),
    ...(caseData.abcde?.exposure?.rashes || []),
    ...(caseData.abcde?.exposure?.deformities || []),
    ...(caseData.secondarySurvey?.head || []),
    ...(caseData.secondarySurvey?.neck || []),
    ...(caseData.secondarySurvey?.chest || []),
    ...(caseData.secondarySurvey?.abdomen || []),
    ...(caseData.secondarySurvey?.pelvis || []),
    ...(caseData.secondarySurvey?.extremities || []),
    ...(caseData.secondarySurvey?.posterior || []),
    ...(caseData.secondarySurvey?.neurological || []),
    ...(caseData.expectedFindings?.keyObservations || []),
    // Red flags and differentials are teaching prompts, not active findings.
    // Matching them rendered complications that the current patient did not have.
    caseData.expectedFindings?.mostLikelyDiagnosis,
    caseData.history?.eventsLeading,
    ...(caseData.history?.medicalConditions || []),
  ]
    .filter(Boolean)
    .map(part => stripNegatedClauses(String(part)))
    .join(' ')
    .toLowerCase();
}

/**
 * Negative findings must not trigger scenarios: "No rashes", "No stridor or
 * gurgling", "No wheeze" are AUTHORED to rule conditions OUT, but substring
 * matching read them as rule-ins (a heart-block case was matching the
 * anaphylaxis scenario off its own pertinent negatives). Strip from the
 * negation word to the end of the clause.
 */
function stripNegatedClauses(part: string): string {
  return part.replace(/\b(?:no|denies|denying|without|nil)\b[^.;]*/gi, ' ');
}

const keywordPatternCache = new Map<string, RegExp>();

function matchesKeyword(text: string, keyword: string): boolean {
  const key = keyword.toLowerCase().trim();
  let pattern = keywordPatternCache.get(key);
  if (!pattern) {
    // Word-boundary match — plain includes() let 'stab' match "Stable" and
    // similar substrings inside unrelated words. Common inflections still
    // count ('rash' → "rashes", 'fall' → "falling").
    pattern = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:s|es|ed|ing)?\\b`);
    keywordPatternCache.set(key, pattern);
  }
  return pattern.test(text);
}

function hasTraumaOpenWoundContext(caseData: CaseScenario, text: string): boolean {
  const categoryText = [caseData.category, caseData.subcategory]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/\btrauma\b|injur|burn|fracture|wound|bleed|haemorrhage|hemorrhage/.test(categoryText)) {
    return true;
  }

  return Boolean(
    /\b(mvc|mva|rtc|collision|crash|fall|fell|stab|stabbing|gunshot|penetrating|blunt|crush|blast)\b/.test(text)
      || /\b(open|sucking|penetrating)\s+(chest\s+)?wound\b/.test(text)
      || /\b(bleeding|haemorrhage|hemorrhage)\s+(from|out of|at)\b/.test(text)
      || /\b(external|uncontrolled|catastrophic)\s+(bleeding|haemorrhage|hemorrhage)\b/.test(text)
      || /\b(amputation|tourniquet|chest seal|occlusive dressing|blood pool|deformity|pelvic|flail|pneumothorax)\b/.test(text)
  );
}

function scenarioMatchesCase(scenario: RealismScenarioSpec, caseData: CaseScenario, text: string): boolean {
  if (!scenario.match.some(keyword => matchesKeyword(text, keyword))) return false;

  if (scenario.id === 'trauma-haemorrhage-open-chest') {
    return hasTraumaOpenWoundContext(caseData, text);
  }

  if (scenario.id === 'anaphylaxis-systemic') {
    // Stridor, facial swelling, and rash are airway/skin signs SHARED with
    // burns/inhalation injury ("stridor possible", facial oedema). A burn-family
    // case must show a true allergic cue before it presents as anaphylaxis.
    const burnContext = /\bburn|thermal|scald|inhalation|smoke\b/.test(
      [caseData.category, caseData.subcategory].filter(Boolean).join(' ').toLowerCase(),
    );
    if (burnContext) {
      return /\b(anaphylaxis|anaphylactic|allerg\w*|urticaria|hives|sting)\b/.test(text);
    }
  }

  return true;
}

function hasTreatment(appliedTreatmentIds: string[], fragments: string[]): boolean {
  return appliedTreatmentIds.some(id =>
    fragments.some(fragment => id.toLowerCase().includes(fragment.toLowerCase())),
  );
}

function parseSystolic(bp: string | undefined): number | undefined {
  if (!bp) return undefined;
  const match = String(bp).match(/\d{2,3}/);
  return match ? Number(match[0]) : undefined;
}

function sourceVitals(caseData: CaseScenario, vitals?: VitalSigns | null): VitalSigns | undefined {
  return vitals ?? caseData.vitalSignsProgression?.initial;
}

function isPhysiologyDeteriorating(caseData: CaseScenario, vitals?: VitalSigns | null): boolean {
  const source = sourceVitals(caseData, vitals);
  const sbp = parseSystolic(source?.bp);
  return Boolean(
    (typeof source?.spo2 === 'number' && source.spo2 < 92)
      || (typeof source?.respiration === 'number' && (source.respiration < 10 || source.respiration > 30))
      || (typeof source?.pulse === 'number' && (source.pulse < 45 || source.pulse > 130))
      || (typeof source?.gcs === 'number' && source.gcs <= 8)
      || (typeof sbp === 'number' && sbp < 90),
  );
}

function shouldShowVisualEffect(
  effect: RealismVisualEffect,
  caseData: CaseScenario,
  vitals?: VitalSigns | null,
  appliedTreatmentIds: string[] = [],
): boolean {
  // Check clearing conditions first — if met, visual is suppressed
  if (effect.clearsWhen && effect.clearsWhen.length > 0) {
    if (isVisualCleared(effect, appliedTreatmentIds, caseData, vitals)) return false;
  }

  switch (effect.showWhen) {
    case 'immediate':
    case 'on-assessment':
      return true;
    case 'if-deteriorating':
      return isPhysiologyDeteriorating(caseData, vitals);
    case 'after-treatment':
      return appliedTreatmentIds.length > 0;
    default:
      return true;
  }
}

function shouldIncludeVisualContext(
  effect: RealismVisualEffect,
  caseData: CaseScenario,
  vitals?: VitalSigns | null,
  appliedTreatmentIds: string[] = [],
): boolean {
  switch (effect.showWhen) {
    case 'immediate':
    case 'on-assessment':
      return true;
    case 'if-deteriorating':
      return isPhysiologyDeteriorating(caseData, vitals);
    case 'after-treatment':
      return appliedTreatmentIds.length > 0;
    default:
      return true;
  }
}

/**
 * Check whether a visual effect's clearing conditions are met.
 *
 * clearsWhen rules use keywords that describe either:
 * - A treatment that has been applied (e.g. 'dressing or chest seal applied',
 *   'source control applied correctly', 'glucose corrected')
 * - A physiologic improvement that has occurred (e.g. 'oxygenation improves',
 *   'airway swelling improves')
 *
 * This implementation checks the applied treatments for a semantic match:
 * the clearing condition's key noun must appear in at least one applied treatment ID.
 * Physiologic improvement conditions (vitals-based) fall through as
 * "not yet cleared" — they'd need a vitals-trending-positive check added later.
 */
function isVisualCleared(
  effect: RealismVisualEffect,
  appliedTreatmentIds: string[],
  caseData: CaseScenario,
  vitals?: VitalSigns | null,
): boolean {
  const clearsWhen = effect.clearsWhen ?? [];
  if (clearsWhen.length === 0) return false;

  // Known treatment-to-keyword mapping for clearing conditions
  const CLEAR_TREATMENT_MAP: Record<string, string[]> = {
    'dressing': ['dressing', 'bleeding_control', 'chest_seal', 'occlusive'],
    'chest seal': ['chest_seal', 'occlusive_dressing', 'dressing'],
    'source control': ['bleeding_control', 'tourniquet', 'dressing', 'chest_seal', 'txa'],
    'oxygen': ['oxygen', 'nonrebreather', 'nasal_cannula', 'simple_mask'],
    'oxygenation': ['oxygen', 'nonrebreather', 'bvm', 'ventilat'],
    'ventilation': ['bvm', 'ventilat'],
    'respiratory drive': ['naloxone', 'bvm', 'ventilat'],
    'glucose': ['glucose', 'dextrose', 'glucagon'],
    'bronchodilator': ['nebulizer', 'salbutamol', 'ipratropium'],
    'adrenaline': ['adrenaline', 'epinephrine'],
    'systemic reaction': ['adrenaline', 'epinephrine'],
    'airway swelling': ['adrenaline', 'epinephrine'],
    'naloxone': ['naloxone'],
    'burn dressing': ['dressing', 'burn_dressing', 'cooling'],
    'cooling': ['cooling', 'burn_dressing'],
  };

  const text = appliedTreatmentIds.join(' ').toLowerCase();

  const treatmentMatchesCondition = (lower: string): boolean => {
    if (appliedTreatmentIds.some(id => lower.includes(id.toLowerCase().replace(/_/g, ' ')))) {
      return true;
    }

    return Object.entries(CLEAR_TREATMENT_MAP).some(([keyword, treatments]) =>
      lower.includes(keyword) && treatments.some(t => text.includes(t)),
    );
  };

  const physiologyHasImproved = (lower: string): boolean => {
    const source = sourceVitals(caseData, vitals);
    if (!source) return false;

    if (lower.includes('oxygenation')) {
      return typeof source.spo2 === 'number' && source.spo2 >= 94;
    }
    if (lower.includes('respiratory drive') || lower.includes('ventilation')) {
      return (
        typeof source.respiration === 'number'
        && source.respiration >= 10
        && source.respiration <= 24
        && typeof source.spo2 === 'number'
        && source.spo2 >= 94
      );
    }
    if (lower.includes('airway swelling') || lower.includes('systemic reaction')) {
      return true;
    }

    return false;
  };

  for (const condition of clearsWhen) {
    const lower = condition.toLowerCase();

    if (lower.includes('improves')) {
      if (treatmentMatchesCondition(lower) && physiologyHasImproved(lower)) {
        return true;
      }
      continue;
    }

    if (treatmentMatchesCondition(lower)) {
      return true;
    }
  }

  return false;
}

const oxygenFaceAnchor: EquipmentAnchorSpec = {
  treatmentIdFragments: ['oxygen_mask', 'oxygen_nonrebreather', 'nonrebreather', 'simple_mask'],
  region: 'face',
  appearance: 'Transparent oxygen mask sits over nose and mouth with tubing routed away from the eyes.',
  fitRule: 'Mask must seal around nose and mouth, leave eyes visible, and avoid covering neck landmarks.',
  shouldNotBlock: ['eye assessment', 'neck assessment', 'mouth opening assessment'],
  reassess: ['SpO2', 'respiratory rate', 'work of breathing', 'speech tolerance', 'mask tolerance'],
};

const nebulizerAnchor: EquipmentAnchorSpec = {
  treatmentIdFragments: ['nebulizer', 'salbutamol', 'ipratropium'],
  region: 'face',
  appearance: 'Nebulizer mask with medication chamber and visible mist over nose and mouth.',
  fitRule: 'Mask should sit snugly on the face without obscuring eye zoom or neck landmarks.',
  shouldNotBlock: ['eye assessment', 'neck assessment'],
  activeEffect: 'Visible mist while nebulization is running.',
  reassess: ['wheeze', 'air entry', 'SpO2', 'respiratory rate', 'work of breathing'],
};

const ivAnchor: EquipmentAnchorSpec = {
  treatmentIdFragments: ['iv', 'fluids', 'dextrose', 'txa'],
  region: 'right-arm',
  appearance: 'Cannula and transparent dressing on forearm or hand with line attached when fluids/drugs run.',
  fitRule: 'Tape and line must remain on the limb and not cover chest, face, or pulse landmarks.',
  shouldNotBlock: ['radial pulse', 'chest assessment', 'face assessment'],
  reassess: ['site patency', 'BP', 'pulse quality', 'capillary refill', 'lungs', 'mental status'],
};

export const REALISM_SCENARIOS: RealismScenarioSpec[] = [
  {
    id: 'respiratory-bronchospasm',
    family: 'respiratory',
    match: ['asthma', 'copd', 'wheeze', 'bronchospasm', 'respiratory distress', 'short of breath', 'accessory muscle', 'tripod', 'silent chest', 'hypoxia'],
    priority: 80,
    activeProblems: ['bronchospasm', 'increased work of breathing', 'oxygenation risk', 'fatigue risk'],
    immediateVisuals: [
      { id: 'resp-accessory-muscles', kind: 'accessory_muscle_use', region: 'chest', intensity: 'moderate', showWhen: 'immediate', detail: 'Neck/chest accessory muscle use should be visible before the student checks numbers.' },
      { id: 'resp-cyanosis-risk', kind: 'cyanosis', region: 'face', intensity: 'moderate', showWhen: 'if-deteriorating', clearsWhen: ['oxygenation improves'], detail: 'Dusky lips/skin appear when hypoxia persists.' },
      { id: 'resp-sweat-distress', kind: 'diaphoresis', region: 'face', intensity: 'subtle', showWhen: 'immediate', detail: 'Anxious respiratory distress can show sweat and restlessness.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor, nebulizerAnchor, {
      treatmentIdFragments: ['cpap', 'niv'],
      region: 'face',
      appearance: 'Large sealed NIV mask with straps and pressure tubing.',
      fitRule: 'Mask must be tight but should not cover eyes; tolerance must be reassessed.',
      shouldNotBlock: ['eye assessment', 'neck assessment'],
      activeEffect: 'Pressure support reduces effort only if physiology and tolerance fit.',
      reassess: ['SpO2', 'BP', 'work of breathing', 'mask tolerance', 'mental status'],
    }, {
      treatmentIdFragments: ['bvm', 'ventilation'],
      region: 'face',
      appearance: 'BVM mask appears only during active assisted breaths, with visible chest rise.',
      fitRule: 'Awake ventilating patients resist; do not leave BVM sealed to face unless ventilation is indicated.',
      shouldNotBlock: ['eye assessment', 'neck assessment'],
      activeEffect: 'Assisted chest rise synchronized with selected ventilation rate.',
      reassess: ['chest rise', 'SpO2', 'EtCO2', 'gastric inflation risk'],
    }],
    patientBehavior: [
      { id: 'resp-bvm-awake-refusal', when: 'BVM attempted while awake and ventilating', responseType: 'refuse', quote: 'Stop, I can breathe. What are you doing?', debrief: 'BVM requires ventilatory failure or inability to ventilate, not simple dyspnoea.' },
      { id: 'resp-neb-improves', when: 'bronchodilator matched to bronchospasm', responseType: 'improve', quote: 'It is a bit easier to breathe.', debrief: 'Bronchodilator response should be gradual and reassessed.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['oxygen'], expectedFit: 'matched', visualResult: ['oxygen device visible on face'], vitalTrajectory: ['SpO2 may improve gradually'], reassessment: ['RR', 'SpO2', 'work of breathing', 'speech tolerance'], patientBehavior: ['may tolerate if explained'], debriefSignal: 'oxygen started and reassessed' },
      { treatmentIdFragments: ['nebulizer', 'salbutamol', 'ipratropium'], expectedFit: 'matched', visualResult: ['nebulizer mist visible'], vitalTrajectory: ['wheeze and work of breathing may improve gradually'], reassessment: ['air entry', 'wheeze', 'SpO2'], patientBehavior: ['patient may report easier breathing'], debriefSignal: 'bronchodilator matched to bronchospasm' },
      { treatmentIdFragments: ['bvm'], expectedFit: 'harmful', visualResult: ['patient resists mask if awake'], vitalTrajectory: ['distress may worsen if not indicated'], reassessment: ['ventilatory drive', 'GCS', 'chest rise'], patientBehavior: ['refusal or panic'], debriefSignal: 'assisted ventilation attempted without clear indication' },
    ],
    reassessmentRequirements: ['RR', 'SpO2', 'speech tolerance', 'air entry', 'work of breathing', 'fatigue', 'mask tolerance'],
    debriefSignals: ['time to oxygen', 'time to bronchodilator', 'missed silent chest', 'inappropriate BVM or CPAP'],
  },
  {
    id: 'anaphylaxis-systemic',
    family: 'respiratory',
    match: ['anaphylaxis', 'allergic reaction', 'hives', 'urticaria', 'rash', 'facial swelling', 'lip swelling', 'tongue swelling', 'stridor', 'bee sting', 'peanuts', 'prawns'],
    priority: 95,
    activeProblems: ['anaphylaxis', 'airway swelling risk', 'bronchospasm or stridor', 'distributive shock risk'],
    immediateVisuals: [
      { id: 'ana-rash', kind: 'rash', region: 'chest', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['IM adrenaline improves systemic reaction'], detail: 'Urticaria/redness should be visible on skin surfaces.' },
      { id: 'ana-face-swelling', kind: 'facial_swelling', region: 'face', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['airway swelling improves'], detail: 'Lip/face swelling supports the airway-risk story.' },
      { id: 'ana-shock-look', kind: 'pallor', region: 'face', intensity: 'severe', showWhen: 'if-deteriorating', detail: 'Hypotension should look like poor perfusion, not just a number.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor, ivAnchor],
    patientBehavior: [
      { id: 'ana-airway-panic', when: 'airway manipulation attempted while awake and swollen', responseType: 'refuse', quote: 'I cannot breathe... please tell me what you are doing.', debrief: 'Airway risk needs calm explanation and rapid definitive treatment.' },
      { id: 'ana-adrenaline-improves', when: 'IM adrenaline given for true anaphylaxis', responseType: 'improve', quote: 'My throat feels a little less tight.', debrief: 'IM adrenaline is the decisive first-line intervention.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['adrenaline', 'epinephrine'], expectedFit: 'matched', visualResult: ['rash/swelling begins to settle gradually'], vitalTrajectory: ['BP and wheeze improve over reassessment cycles'], reassessment: ['airway swelling', 'wheeze/stridor', 'BP', 'repeat adrenaline timing'], patientBehavior: ['breathing and anxiety may improve'], debriefSignal: 'time to IM adrenaline' },
      { treatmentIdFragments: ['antihistamine', 'hydrocortisone', 'steroid'], expectedFit: 'partial', visualResult: ['no immediate reversal of shock'], vitalTrajectory: ['shock persists without adrenaline'], reassessment: ['BP', 'airway', 'wheeze'], patientBehavior: ['patient remains distressed'], debriefSignal: 'adjunct used without definitive adrenaline' },
      { treatmentIdFragments: ['fluids', 'iv'], expectedFit: 'partial', visualResult: ['line visible on arm'], vitalTrajectory: ['supports perfusion but does not replace adrenaline'], reassessment: ['BP', 'pulse', 'lungs', 'skin'], patientBehavior: ['may flinch with IV'], debriefSignal: 'fluids support anaphylactic shock after adrenaline priority' },
    ],
    reassessmentRequirements: ['airway swelling', 'voice change', 'wheeze/stridor', 'BP', 'pulse', 'skin', 'repeat adrenaline timing'],
    debriefSignals: ['time to IM adrenaline', 'over-reliance on antihistamine/steroid', 'failure to reassess airway'],
  },
  {
    id: 'toxicology-opioid-hypoventilation',
    family: 'toxicology',
    match: ['opioid', 'overdose', 'naloxone', 'pinpoint', 'slow respiration', 'slow respiratory rate', 'slow breathing', 'bradypnea', 'hypoventilation', 'respiratory depression', 'unconscious'],
    priority: 90,
    activeProblems: ['opioid toxidrome', 'hypoventilation', 'airway protection risk', 'vomiting risk after reversal'],
    immediateVisuals: [
      { id: 'tox-pinpoint-pupils', kind: 'pinpoint_pupils', region: 'face', intensity: 'severe', showWhen: 'on-assessment', detail: 'Eye zoom should reveal toxidrome-appropriate pupils.' },
      { id: 'tox-slow-chest', kind: 'reduced_chest_rise', region: 'chest', intensity: 'severe', showWhen: 'immediate', clearsWhen: ['ventilation or naloxone improves respiratory drive'], detail: 'Chest rise should be small and slow until ventilation improves.' },
      { id: 'tox-vomit-risk', kind: 'vomit_risk', region: 'mouth', intensity: 'moderate', showWhen: 'after-treatment', detail: 'Reversal may create vomiting/aspiration risk.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor, {
      treatmentIdFragments: ['bvm', 'ventilation'],
      region: 'face',
      appearance: 'BVM seal with assisted chest rise while ventilation is supported.',
      fitRule: 'Use when respiratory drive is inadequate; reassess mask seal and EtCO2.',
      shouldNotBlock: ['eye assessment'],
      activeEffect: 'Assisted breaths create visible chest rise.',
      reassess: ['RR', 'SpO2', 'EtCO2', 'vomiting', 'GCS'],
    }, ivAnchor],
    patientBehavior: [
      { id: 'tox-naloxone-agitation', when: 'naloxone reverses opioid physiology', responseType: 'agitate', quote: 'What happened... why do I feel sick?', debrief: 'Naloxone response can include agitation, vomiting, or refusal.' },
      { id: 'tox-low-gcs-silent', when: 'low GCS before reversal', responseType: 'silent', debrief: 'Reduced responsiveness should limit cooperation and voice responses.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['naloxone'], expectedFit: 'matched', visualResult: ['respiratory drive and consciousness improve gradually'], vitalTrajectory: ['RR and SpO2 improve if opioid physiology is present'], reassessment: ['RR', 'GCS', 'airway', 'vomiting', 'pupils'], patientBehavior: ['agitation or vomiting possible'], debriefSignal: 'time to naloxone and ventilation support' },
      { treatmentIdFragments: ['bvm', 'oxygen'], expectedFit: 'matched', visualResult: ['oxygen/BVM visible on face'], vitalTrajectory: ['oxygenation supported while antidote takes effect'], reassessment: ['chest rise', 'SpO2', 'EtCO2'], patientBehavior: ['low GCS patient may not cooperate'], debriefSignal: 'ventilation support before or with antidote' },
      { treatmentIdFragments: ['glucose'], expectedFit: 'partial', visualResult: ['no opioid-specific response'], vitalTrajectory: ['minimal change unless hypoglycaemia coexists'], reassessment: ['BGL', 'GCS', 'RR'], patientBehavior: ['no meaningful toxidrome reversal'], debriefSignal: 'glucose checked but opioid physiology still requires ventilation/naloxone' },
    ],
    reassessmentRequirements: ['RR', 'SpO2', 'EtCO2 if available', 'airway', 'vomiting', 'GCS', 'pupils', 'BGL'],
    debriefSignals: ['ventilation before/with antidote', 'time to naloxone', 'missed glucose check', 'airway protection'],
  },
  {
    id: 'metabolic-hypoglycaemia-seizure',
    family: 'metabolic',
    // 'confused' removed — far too generic (any syncope/sepsis/head-injury
    // case says "confused"); the specific keywords carry true hypo cases.
    match: ['hypoglycemia', 'hypoglycaemia', 'diabetic', 'insulin', 'low bgl', 'low glucose', 'blood glucose', 'seizure', 'post-ictal', 'postictal', 'missed meal', 'tremor'],
    priority: 70,
    activeProblems: ['glucose-driven altered mentation', 'airway route decision', 'seizure or post-ictal risk'],
    immediateVisuals: [
      { id: 'metab-sweat', kind: 'diaphoresis', region: 'face', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['glucose corrected'], detail: 'Clammy sweat supports hypoglycaemia.' },
      { id: 'metab-tremor', kind: 'tremor', region: 'left-arm', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['glucose corrected'], detail: 'Tremor/restlessness should improve as glucose normalizes.' },
      { id: 'metab-seizure', kind: 'seizure_activity', region: 'chest', intensity: 'severe', showWhen: 'if-deteriorating', detail: 'Seizure/post-ictal behavior appears when authored by the case.' },
    ],
    equipmentAnchors: [ivAnchor],
    patientBehavior: [
      { id: 'metab-confused', when: 'low glucose with altered mentation', responseType: 'agitate', quote: 'I do not know... I feel strange.', debrief: 'Hypoglycaemia changes cooperation until corrected.' },
      { id: 'metab-glucose-improves', when: 'glucose route matches airway safety', responseType: 'improve', quote: 'I feel a little clearer.', debrief: 'Mental status should improve gradually after correct glucose treatment.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['glucose', 'dextrose', 'glucagon'], expectedFit: 'matched', visualResult: ['diaphoresis/tremor gradually settle'], vitalTrajectory: ['GCS and behavior improve if glucose is the driver'], reassessment: ['repeat BGL', 'GCS/AVPU', 'airway', 'swallow safety'], patientBehavior: ['confusion improves'], debriefSignal: 'correct glucose route and reassessment' },
      { treatmentIdFragments: ['oral_glucose', 'glucose_10g'], expectedFit: 'blocked', visualResult: ['do not leave oral treatment applied if airway unsafe'], vitalTrajectory: ['aspiration risk if low GCS'], reassessment: ['GCS', 'airway safety', 'BGL'], patientBehavior: ['cannot cooperate if low GCS'], debriefSignal: 'unsafe oral glucose attempt' },
    ],
    reassessmentRequirements: ['repeat BGL', 'GCS/AVPU', 'airway', 'ability to swallow', 'seizure recurrence'],
    debriefSignals: ['time to glucose check', 'correct glucose route', 'avoided anchoring'],
  },
  {
    id: 'cardiac-acs-instability',
    family: 'cardiac',
    // 'diaphoresis' removed — sweating is a sign shared by hypoglycaemia,
    // anaphylaxis, heat illness, and ACS; it must not rule cardiac IN.
    match: ['chest pain', 'acs', 'stemi', 'nstemi', 'angina', 'myocardial', 'arrhythmia', 'bradycardia', 'heart block', 'syncope', 'palpitations', 'svt', ' vt', ' vf', 'cardiac arrest'],
    priority: 65,
    activeProblems: ['possible ACS or rhythm instability', 'perfusion risk', 'medication contraindication decision'],
    immediateVisuals: [
      { id: 'cardiac-guarding', kind: 'pallor', region: 'chest', intensity: 'moderate', showWhen: 'immediate', detail: 'Patient should look pale/uncomfortable and may guard the chest.' },
      { id: 'cardiac-sweat', kind: 'diaphoresis', region: 'face', intensity: 'moderate', showWhen: 'immediate', detail: 'Diaphoresis supports sympathetic stress and poor perfusion.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor, ivAnchor, {
      treatmentIdFragments: ['defib', 'pads', 'aed'],
      region: 'chest',
      appearance: 'Defib pads attach anterior-lateral or anterior-posterior with leads visible.',
      fitRule: 'Pads should not cover the entire chest exam surface or hide wounds.',
      shouldNotBlock: ['chest auscultation', 'wound assessment'],
      reassess: ['rhythm', 'pulse', 'skin', 'BP'],
    }],
    patientBehavior: [
      { id: 'cardiac-device-question', when: 'aggressive device-led treatment while awake and stable', responseType: 'refuse', quote: 'Are you sure I need that?', debrief: 'Device interventions must match rhythm, pulse, and stability.' },
      { id: 'cardiac-pain-improves', when: 'appropriate ACS treatment improves symptoms', responseType: 'improve', quote: 'The pain is easing a little.', debrief: 'Pain response must be reassessed with BP and ECG.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['aspirin'], expectedFit: 'matched', visualResult: ['no dramatic visual change; medication is documented'], vitalTrajectory: ['pain/perfusion reassessment drives next step'], reassessment: ['pain', 'BP', 'contraindications', 'ECG'], patientBehavior: ['may report pain change'], debriefSignal: 'aspirin given when ACS suspected' },
      { treatmentIdFragments: ['gtn', 'nitro'], expectedFit: 'partial', visualResult: ['medication administered only if BP permits'], vitalTrajectory: ['BP may fall if contraindicated'], reassessment: ['BP', 'pain', 'contraindications'], patientBehavior: ['may report dizziness if hypotensive'], debriefSignal: 'GTN requires BP and contraindication check' },
      { treatmentIdFragments: ['defib', 'shock', 'cardioversion'], expectedFit: 'matched', visualResult: ['pads visible on chest'], vitalTrajectory: ['rhythm/pulse response depends on shockable rhythm'], reassessment: ['rhythm', 'pulse', 'CPR quality'], patientBehavior: ['awake patient needs sedation/consent if synchronized cardioversion context'], debriefSignal: 'electrical therapy matched to rhythm and pulse state' },
    ],
    reassessmentRequirements: ['pain', 'BP', 'rhythm', 'perfusion', 'nausea', 'repeat ECG if changing'],
    debriefSignals: ['time to ECG', 'appropriate aspirin/GTN', 'contraindicated nitrate', 'shockable/non-shockable decision'],
  },
  {
    id: 'neurology-stroke-seizure',
    family: 'neurology',
    match: ['stroke', 'facial droop', 'arm drift', 'slurred speech', 'gaze', 'weakness', 'fast', 'seizure', 'postictal', 'post-ictal', 'unequal pupils'],
    priority: 60,
    activeProblems: ['neurologic deficit or mimic', 'time-critical destination decision', 'glucose mimic exclusion'],
    immediateVisuals: [
      { id: 'neuro-facial-droop', kind: 'facial_droop', region: 'face', intensity: 'moderate', showWhen: 'on-assessment', detail: 'Face check should reveal side-specific deficit when authored.' },
      { id: 'neuro-gaze-pupil', kind: 'dilated_pupils', region: 'face', intensity: 'moderate', showWhen: 'on-assessment', detail: 'Pupil/gaze findings appear in eye zoom when case supports them.' },
      { id: 'neuro-seizure-state', kind: 'seizure_activity', region: 'chest', intensity: 'severe', showWhen: 'if-deteriorating', detail: 'Seizure or post-ictal state should change voice/cooperation.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor, ivAnchor],
    patientBehavior: [
      { id: 'neuro-slurred-speech', when: 'stroke speech deficit is present', responseType: 'cooperate', quote: 'My words... are not coming out right.', debrief: 'Speech change should be captured as a neurologic finding.' },
      { id: 'neuro-postictal-confusion', when: 'post-ictal case state', responseType: 'agitate', quote: 'Where am I?', debrief: 'Post-ictal confusion should recover gradually, not instantly.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['oxygen'], expectedFit: 'partial', visualResult: ['oxygen visible only if hypoxic or clinically indicated'], vitalTrajectory: ['no neurologic reversal unless hypoxia is present'], reassessment: ['SpO2', 'GCS', 'speech'], patientBehavior: ['may tolerate if explained'], debriefSignal: 'oxygen titrated to need, not diagnosis label' },
      { treatmentIdFragments: ['glucose', 'dextrose'], expectedFit: 'matched', visualResult: ['mentation improves only if glucose mimic exists'], vitalTrajectory: ['BGL/mental status reassessment decides response'], reassessment: ['BGL', 'GCS', 'FAST'], patientBehavior: ['confusion may improve if hypoglycaemic'], debriefSignal: 'glucose mimic checked before stroke anchoring' },
    ],
    reassessmentRequirements: ['FAST changes', 'GCS', 'pupils', 'BGL', 'speech', 'limb strength', 'last known well'],
    debriefSignals: ['time to neuro screen', 'last known well obtained', 'missed glucose mimic', 'destination/pre-alert'],
  },
  {
    id: 'trauma-haemorrhage-open-chest',
    family: 'trauma',
    match: ['trauma', 'mvc', 'fall', 'stab', 'gunshot', 'open chest wound', 'sucking chest wound', 'bleeding', 'hemorrhage', 'haemorrhage', 'amputation', 'fracture', 'deformity', 'pelvic', 'flail', 'pneumothorax'],
    priority: 85,
    activeProblems: ['external bleeding or open wound', 'shock risk', 'pain and movement risk', 'source control priority'],
    immediateVisuals: [
      { id: 'trauma-open-wound', kind: 'open_wound', region: 'chest', intensity: 'severe', showWhen: 'immediate', clearsWhen: ['dressing or chest seal applied'], detail: 'Wound should be anatomically visible where the case describes it.' },
      { id: 'trauma-active-bleeding', kind: 'active_bleeding', region: 'chest', intensity: 'severe', showWhen: 'immediate', clearsWhen: ['source control applied correctly'], detail: 'External bleeding should slow only after matched source control.' },
      { id: 'trauma-blood-pool', kind: 'blood_pool', region: 'scene', intensity: 'moderate', showWhen: 'immediate', clearsWhen: ['bleeding controlled and packaged'], detail: 'Blood on clothes/scene reinforces mechanism and shock.' },
      { id: 'trauma-asym-chest', kind: 'asymmetric_chest_rise', region: 'chest', intensity: 'moderate', showWhen: 'on-assessment', detail: 'Chest trauma should affect chest rise and breath-sound comparison when authored.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor, ivAnchor, {
      treatmentIdFragments: ['tourniquet'],
      region: 'left-leg',
      appearance: 'Tourniquet placed proximal to limb wound, not over a joint, with time noted.',
      fitRule: 'Only stops limb arterial bleeding when placed on the correct limb and location.',
      shouldNotBlock: ['distal pulse assessment', 'wound reassessment'],
      activeEffect: 'Bleeding stops or slows markedly when location matches wound.',
      reassess: ['bleeding', 'distal pulse', 'pain', 'shock trend'],
    }, {
      treatmentIdFragments: ['dressing', 'bleeding_control', 'chest_seal'],
      region: 'chest',
      appearance: 'Dressing or occlusive chest seal covers the wound without hiding the entire chest.',
      fitRule: 'Dressing/seal must be centered over the wound and leave comparison auscultation possible.',
      shouldNotBlock: ['chest auscultation', 'respiratory effort assessment'],
      activeEffect: 'Sucking/bubbling cue reduces when seal matches open chest wound.',
      reassess: ['wound', 'breath sounds', 'chest rise', 'perfusion'],
    }],
    patientBehavior: [
      { id: 'trauma-pain-guard', when: 'movement or palpation near injury', responseType: 'guard', quote: 'Please stop, that really hurts.', debrief: 'Movement and splinting decisions should affect pain/cooperation.' },
      { id: 'trauma-source-control-needed', when: 'oxygen/IV applied without source control', responseType: 'deteriorate', debrief: 'Oxygen and IV support do not replace hemorrhage/source control.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['bleeding_control', 'dressing', 'chest_seal'], expectedFit: 'matched', visualResult: ['bleeding or sucking chest cue reduces when applied to correct wound'], vitalTrajectory: ['perfusion stabilizes only after source control'], reassessment: ['wound', 'distal pulse', 'shock trend', 'breath sounds'], patientBehavior: ['pain may remain but panic decreases'], debriefSignal: 'source control matched to wound' },
      { treatmentIdFragments: ['tourniquet'], expectedFit: 'matched', visualResult: ['limb bleeding stops if location is correct'], vitalTrajectory: ['distal pulse changes and shock trend stabilizes'], reassessment: ['bleeding', 'distal pulse', 'pain', 'time applied'], patientBehavior: ['pain/distress can rise'], debriefSignal: 'tourniquet indication and placement' },
      { treatmentIdFragments: ['fluids', 'txa', 'iv'], expectedFit: 'partial', visualResult: ['line visible on arm'], vitalTrajectory: ['supports shock but cannot fix uncontrolled bleeding'], reassessment: ['BP', 'pulse', 'lungs', 'source control'], patientBehavior: ['may remain pale if bleeding persists'], debriefSignal: 'supportive care does not replace hemorrhage control' },
    ],
    reassessmentRequirements: ['bleeding control', 'distal pulse', 'pain', 'shock trend', 'chest rise', 'breath sounds', 'BP/pulse', 'mental status'],
    debriefSignals: ['time to hemorrhage control', 'correct device matched to wound', 'missed posterior assessment', 'over-treatment without source control'],
  },
  {
    id: 'burns-inhalation-risk',
    family: 'burns',
    match: ['burn', 'thermal', 'chemical', 'electrical burn', 'electrocution', 'scald', 'soot', 'smoke inhalation', 'singed hair', 'facial burn', 'airway burn'],
    priority: 75,
    activeProblems: ['burn pattern', 'pain and exposure risk', 'inhalation airway risk', 'hypothermia risk after cooling'],
    immediateVisuals: [
      { id: 'burn-pattern', kind: 'burn_pattern', region: 'chest', intensity: 'severe', showWhen: 'immediate', clearsWhen: ['covered with burn dressing'], detail: 'Burn location/depth should be visible after exposure.' },
      { id: 'burn-soot', kind: 'soot', region: 'mouth', intensity: 'moderate', showWhen: 'on-assessment', detail: 'Soot around mouth/nose supports inhalation-risk assessment.' },
      { id: 'burn-face-swelling', kind: 'facial_swelling', region: 'face', intensity: 'moderate', showWhen: 'if-deteriorating', detail: 'Facial swelling risk should keep airway reassessment active.' },
    ],
    equipmentAnchors: [oxygenFaceAnchor, ivAnchor, {
      treatmentIdFragments: ['cooling', 'burn_dressing', 'dressing'],
      region: 'chest',
      appearance: 'Cooling/dressing visibly covers burn region while preserving airway and perfusion checks.',
      fitRule: 'Cooling/dressing must be limited to the affected region and not prolong exposure.',
      shouldNotBlock: ['airway assessment', 'distal circulation assessment'],
      activeEffect: 'Burn surface looks covered/cooled; hypothermia risk increases if exposure persists.',
      reassess: ['pain', 'temperature', 'burn coverage', 'distal circulation'],
    }],
    patientBehavior: [
      { id: 'burn-pain-guarding', when: 'burn exposed or touched', responseType: 'guard', quote: 'It burns, please be careful.', debrief: 'Analgesia and gentle handling matter in burns care.' },
      { id: 'burn-airway-worry', when: 'inhalation signs present', responseType: 'deteriorate', debrief: 'Airway risk can worsen even while skin care is underway.' },
    ],
    treatmentResponses: [
      { treatmentIdFragments: ['cooling'], expectedFit: 'matched', visualResult: ['burn region appears cooled/covered'], vitalTrajectory: ['pain may ease; hypothermia risk rises if overdone'], reassessment: ['pain', 'temperature', 'coverage'], patientBehavior: ['pain improves with careful cooling'], debriefSignal: 'cooling and hypothermia prevention balanced' },
      { treatmentIdFragments: ['oxygen'], expectedFit: 'matched', visualResult: ['oxygen visible on face'], vitalTrajectory: ['oxygenation supported when inhalation risk exists'], reassessment: ['airway', 'SpO2', 'voice', 'soot/swelling'], patientBehavior: ['may tolerate if explained'], debriefSignal: 'oxygen and airway vigilance for inhalation injury' },
      { treatmentIdFragments: ['warming_blanket'], expectedFit: 'matched', visualResult: ['blanket covers non-burned/exposed areas'], vitalTrajectory: ['temperature risk stabilizes after cooling/exposure'], reassessment: ['temperature', 'skin', 'perfusion'], patientBehavior: ['comfort improves'], debriefSignal: 'hypothermia prevention after burn care' },
    ],
    reassessmentRequirements: ['airway', 'pain', 'temperature', 'perfusion', 'burn coverage', 'distal circulation if circumferential'],
    debriefSignals: ['time to cooling and covering', 'airway reassessment', 'hypothermia prevention'],
  },
];

/**
 * Derive active patient behavior rules that match the current treatment state.
 *
 * Patient behaviors are gated by the `when` field which describes a clinical
 * context (e.g. "BVM attempted while awake and ventilating", "naloxone
 * reverses opioid physiology"). This function matches the `when` description
 * against the currently applied treatments to determine which behaviors
 * are currently relevant.
 */
export function deriveActivePatientBehaviors(
  patientBehavior: PatientBehaviorRule[],
  appliedTreatmentIds: string[] = [],
): PatientBehaviorRule[] {
  if (patientBehavior.length === 0 || appliedTreatmentIds.length === 0) return [];

  const text = appliedTreatmentIds.join(' ').toLowerCase();

  return patientBehavior.filter(rule => {
    const when = rule.when.toLowerCase();
    const keywordMatchesWhen = (keyword: string): boolean => {
      if (keyword === 'iv') return /\biv\b|i\.v\.|intravenous/.test(when);
      return when.includes(keyword);
    };

    const treatmentKeywords = [
      { keyword: 'bvm', ids: ['bvm', 'ventilat'] },
      { keyword: 'bronchodilator', ids: ['nebulizer', 'salbutamol', 'ipratropium'] },
      { keyword: 'oxygen', ids: ['oxygen', 'nonrebreather', 'nasal', 'simple_mask'] },
      { keyword: 'adrenaline', ids: ['adrenaline', 'epinephrine'] },
      { keyword: 'naloxone', ids: ['naloxone'] },
      { keyword: 'glucose', ids: ['glucose', 'dextrose'] },
      { keyword: 'cpap', ids: ['cpap', 'niv'] },
      { keyword: 'iv', ids: ['iv_access', 'iv_cannula', 'io_access'] },
      { keyword: 'fluids', ids: ['fluids_', 'iv_access'] },
      { keyword: 'airway', ids: ['opa', 'npa', 'lma', 'ett', 'intubat'] },
      { keyword: 'chest seal', ids: ['chest_seal', 'occlusive'] },
      { keyword: 'tourniquet', ids: ['tourniquet'] },
      { keyword: 'splint', ids: ['splint'] },
      { keyword: 'collar', ids: ['collar', 'cervical'] },
      { keyword: 'cooling', ids: ['cooling', 'burn_dressing'] },
      { keyword: 'defib', ids: ['defib', 'pads', 'aed', 'shock'] },
    ];

    for (const { keyword, ids } of treatmentKeywords) {
      if (keywordMatchesWhen(keyword) && ids.some(id => text.includes(id))) {
        return true;
      }
    }

    if (
      (when.includes('movement') || when.includes('palpation') || when.includes('touched'))
      && ['splint', 'collar', 'binder', 'stretcher', 'board', 'traction'].some(id => text.includes(id))
    ) {
      return true;
    }

    // State-based triggers (no specific treatment keyword)
    if (when.includes('low gcs') || when.includes('unresponsive') || when.includes('silent')) {
      return true;
    }

    return false;
  });
}

/**
 * Build a compact voice-response prompt for the patient simulator from
 * active patient behavior rules. Returns null if no voice interaction is needed.
 */
export function derivePatientVoicePrompt(
  behaviors: PatientBehaviorRule[],
): { quote: string; responseType: string; debrief: string } | null {
  const priority: Record<string, number> = {
    refuse: 5, agitate: 4, guard: 3, deteriorate: 3,
    improve: 2, cooperate: 1, silent: 0,
  };

  const sorted = behaviors.filter(behavior => Boolean(behavior.quote)).sort((a, b) =>
    (priority[b.responseType] ?? 0) - (priority[a.responseType] ?? 0),
  );

  const best = sorted[0];
  if (!best || !best.quote) return null;

  return { quote: best.quote, responseType: best.responseType, debrief: best.debrief };
}

export function matchRealismScenarios(caseData: CaseScenario): RealismScenarioSpec[] {
  const text = collectCaseText(caseData);
  return REALISM_SCENARIOS
    .filter(scenario => scenarioMatchesCase(scenario, caseData, text))
    .sort((a, b) => b.priority - a.priority);
}

export function deriveScenarioTreatmentResponses(
  caseData: CaseScenario,
  appliedTreatmentIds: string[] = [],
): TreatmentResponseRule[] {
  const scenarios = matchRealismScenarios(caseData);
  return scenarios.flatMap(scenario =>
    scenario.treatmentResponses.filter(response =>
      hasTreatment(appliedTreatmentIds, response.treatmentIdFragments),
    ),
  );
}

function visualRegionForInjury(region: BodyRegion): EquipmentAnchorRegion {
  if (region === 'head') return 'face';
  if (region === 'back') return 'posterior';
  if (region === 'airway') return 'mouth';
  return region;
}

function exposedInjuryDetail(injury: ReturnType<typeof inferInjuries>[number]): string {
  const location = injury.region.replace('-', ' ');
  if (injury.kind === 'amputation') {
    return `The exposed traumatic amputation at the ${location} remains visible after source control; protect the stump and reassess the device.`;
  }
  if (injury.kind === 'bleeding') {
    return `The exposed wound at the ${location} remains visible; reassess the dressing or device, distal circulation and tissue protection.`;
  }
  return injury.detail;
}

/**
 * The trauma scenario describes a family of injuries, but its visuals must be
 * bound to this patient's authored anatomy. A hand amputation must not create
 * a chest wound or asymmetric chest rise simply because both are "trauma".
 */
function contextualizeScenarioVisual(
  effect: RealismVisualEffect,
  caseData: CaseScenario,
): RealismVisualEffect | null {
  if (!effect.id.startsWith('trauma-')) return effect;

  const injuries = inferInjuries(caseData);
  const bleeding = injuries.find(injury => injury.kind === 'bleeding' || injury.kind === 'amputation');
  const openInjury = injuries.find(injury => injury.kind === 'wound' || injury.kind === 'amputation')
    ?? injuries.find(injury => injury.kind === 'bleeding');

  if (effect.id === 'trauma-open-wound') {
    return openInjury ? { ...effect, region: visualRegionForInjury(openInjury.region), detail: exposedInjuryDetail(openInjury) } : null;
  }
  if (effect.id === 'trauma-active-bleeding') {
    return bleeding ? { ...effect, region: visualRegionForInjury(bleeding.region), detail: bleeding.detail } : null;
  }
  if (effect.id === 'trauma-blood-pool') {
    return bleeding ? effect : null;
  }
  if (effect.id === 'trauma-asym-chest') {
    const chestInjury = injuries.some(injury => injury.region === 'chest' && ['wound', 'flail', 'bleeding', 'deformity'].includes(injury.kind));
    const chestText = [
      ...(caseData.abcde?.breathing?.findings ?? []),
      ...(caseData.abcde?.breathing?.auscultation ?? []),
      ...(caseData.secondarySurvey?.chest ?? []),
    ]
      .map(item => stripNegatedClauses(String(item)))
      .join(' ')
      .toLowerCase();
    const asymmetricEvidence = /\b(asymmetr|unilateral|flail|paradoxical|pneumothorax|hemothorax|haemothorax)\b|\b(?:reduced|absent|diminished)[^.]{0,45}\b(?:left|right)\b/.test(chestText);
    return chestInjury || asymmetricEvidence ? effect : null;
  }
  return effect;
}

export function deriveScenarioVisuals(
  caseData: CaseScenario,
  vitals?: VitalSigns | null,
  appliedTreatmentIds: string[] = [],
): RealismVisualEffect[] {
  return matchRealismScenarios(caseData)
    .flatMap(scenario => scenario.immediateVisuals)
    .map(effect => contextualizeScenarioVisual(effect, caseData))
    .filter((effect): effect is RealismVisualEffect => effect != null)
    .filter(effect => shouldShowVisualEffect(effect, caseData, vitals, appliedTreatmentIds));
}

function deriveScenarioVisualContext(
  caseData: CaseScenario,
  vitals?: VitalSigns | null,
  appliedTreatmentIds: string[] = [],
): RealismVisualEffect[] {
  return matchRealismScenarios(caseData)
    .flatMap(scenario => scenario.immediateVisuals)
    .map(effect => contextualizeScenarioVisual(effect, caseData))
    .filter((effect): effect is RealismVisualEffect => effect != null)
    .filter(effect => shouldIncludeVisualContext(effect, caseData, vitals, appliedTreatmentIds));
}

function uniqueVisualsById(visuals: RealismVisualEffect[]): RealismVisualEffect[] {
  const seen = new Set<string>();
  return visuals.filter(visual => {
    if (seen.has(visual.id)) return false;
    seen.add(visual.id);
    return true;
  });
}

export function deriveRealismScenarioState({
  caseData,
  vitals,
  appliedTreatmentIds = [],
}: ScenarioRealismInput): ScenarioRealismState {
  const scenarios = matchRealismScenarios(caseData);
  const treatmentResponses = deriveScenarioTreatmentResponses(caseData, appliedTreatmentIds);
  const equipmentAnchors = scenarios
    .flatMap(scenario => scenario.equipmentAnchors)
    .filter(anchor => hasTreatment(appliedTreatmentIds, anchor.treatmentIdFragments));
  const activeVisualEffects = deriveScenarioVisuals(caseData, vitals, appliedTreatmentIds);
  const contextualVisualEffects = deriveScenarioVisualContext(caseData, vitals, appliedTreatmentIds);

  return {
    matchedScenarioIds: scenarios.map(scenario => scenario.id),
    families: unique(scenarios.map(scenario => scenario.family)),
    activeProblems: unique(scenarios.flatMap(scenario => scenario.activeProblems)),
    visualEffects: uniqueVisualsById([...activeVisualEffects, ...contextualVisualEffects]),
    equipmentAnchors,
    patientBehavior: scenarios.flatMap(scenario => scenario.patientBehavior),
    treatmentResponses,
    reassessmentRequirements: unique([
      ...scenarios.flatMap(scenario => scenario.reassessmentRequirements),
      ...equipmentAnchors.flatMap(anchor => anchor.reassess),
      ...treatmentResponses.flatMap(response => response.reassessment),
    ]),
    debriefSignals: unique([
      ...scenarios.flatMap(scenario => scenario.debriefSignals),
      ...treatmentResponses.map(response => response.debriefSignal),
    ]),
  };
}
