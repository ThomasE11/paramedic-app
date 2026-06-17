import type { CaseScenario, VitalSigns } from '@/types';
import type { Treatment } from '@/data/enhancedTreatmentEffects';
import { inferInjuries, injuryRegionTo3D } from '@/lib/injuryMap';

export type RealismSeverity = 'normal' | 'observe' | 'warning' | 'critical';

export type RealismCueVisibility = 'immediate' | 'on-assessment' | 'after-treatment';

export interface PatientRealismCue {
  id: string;
  label: string;
  detail: string;
  region: string;
  severity: RealismSeverity;
  visibility: RealismCueVisibility;
}

export interface PatientRealismProfile {
  caseFamily: string;
  summary: string;
  observableCues: PatientRealismCue[];
  assessmentPriorities: string[];
  treatmentLogic: string[];
  debriefEndpoints: string[];
}

export type TreatmentRealismStatus = 'matched' | 'partial' | 'mismatch' | 'harmful' | 'neutral';

export interface TreatmentRealismResult {
  status: TreatmentRealismStatus;
  title: string;
  clinicalFeedback: string;
  patientQuote?: string;
  visibleCue?: PatientRealismCue;
  debriefNote: string;
}

const uniq = <T>(items: T[]): T[] => Array.from(new Set(items));

function list(value: string | string[] | undefined | null): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseSystolic(bp: string | undefined): number | undefined {
  if (!bp) return undefined;
  const match = bp.match(/\d{2,3}/);
  return match ? Number(match[0]) : undefined;
}

function textForCase(caseData: CaseScenario): string {
  return [
    caseData.title,
    caseData.category,
    caseData.subcategory,
    caseData.dispatchInfo?.callReason,
    caseData.sceneInfo?.description,
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.appearance,
    caseData.initialPresentation?.position,
    caseData.initialPresentation?.consciousness,
    ...(caseData.initialPresentation?.sounds || []),
    ...(caseData.abcde?.airway?.findings || []),
    ...(caseData.abcde?.breathing?.findings || []),
    ...(caseData.abcde?.breathing?.auscultation || []),
    ...(caseData.abcde?.circulation?.findings || []),
    ...list(caseData.abcde?.disability?.pupils),
    ...(caseData.abcde?.disability?.focalDeficits || []),
    caseData.abcde?.disability?.seizureActivity,
    ...(caseData.abcde?.exposure?.findings || []),
    ...(caseData.secondarySurvey?.head || []),
    ...(caseData.secondarySurvey?.neck || []),
    ...(caseData.secondarySurvey?.chest || []),
    ...(caseData.secondarySurvey?.abdomen || []),
    ...(caseData.secondarySurvey?.pelvis || []),
    ...(caseData.secondarySurvey?.extremities || []),
    ...(caseData.expectedFindings?.keyObservations || []),
    ...(caseData.expectedFindings?.redFlags || []),
    caseData.history?.eventsLeading,
    ...(caseData.history?.medicalConditions || []),
  ].filter(Boolean).join(' ').toLowerCase();
}

function presentationTextForCase(caseData: CaseScenario): string {
  return [
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.appearance,
    ...(caseData.abcde?.airway?.findings || []),
    ...(caseData.abcde?.breathing?.findings || []),
    ...(caseData.abcde?.breathing?.auscultation || []),
    ...(caseData.abcde?.circulation?.findings || []),
    ...(caseData.secondarySurvey?.chest || []),
  ].filter(Boolean).join(' ').toLowerCase();
}

function cue(
  id: string,
  label: string,
  detail: string,
  region: string,
  severity: RealismSeverity,
  visibility: RealismCueVisibility = 'immediate',
): PatientRealismCue {
  return { id, label, detail, region, severity, visibility };
}

function baseProfile(): PatientRealismProfile {
  return {
    caseFamily: 'general',
    summary: 'Observe the patient, then let findings guide assessment and treatment.',
    observableCues: [],
    assessmentPriorities: [],
    treatmentLogic: [],
    debriefEndpoints: [],
  };
}

function hasAnyId(ids: Set<string>, candidates: string[]): boolean {
  return candidates.some(id => ids.has(id));
}

function treatmentName(treatment: Pick<Treatment, 'id' | 'name'>): string {
  return `${treatment.id} ${treatment.name}`.toLowerCase();
}

function makeTreatmentCue(
  id: string,
  label: string,
  detail: string,
  region: string,
  severity: RealismSeverity,
): PatientRealismCue {
  return cue(`tx-${id}`, label, detail, region, severity, 'immediate');
}

function result(
  status: TreatmentRealismStatus,
  title: string,
  clinicalFeedback: string,
  debriefNote: string,
  options: { patientQuote?: string; visibleCue?: PatientRealismCue } = {},
): TreatmentRealismResult {
  return {
    status,
    title,
    clinicalFeedback,
    debriefNote,
    patientQuote: options.patientQuote,
    visibleCue: options.visibleCue,
  };
}

export function deriveCaseRealismProfile(caseData: CaseScenario): PatientRealismProfile {
  const text = textForCase(caseData);
  const cat = String(caseData.category || '').toLowerCase();
  const sub = String(caseData.subcategory || '').toLowerCase();
  const vitals = caseData.vitalSignsProgression?.initial;
  const rr = caseData.abcde?.breathing?.rate ?? vitals?.respiration;
  const spo2 = caseData.abcde?.breathing?.spo2 ?? vitals?.spo2;
  const sbp = caseData.abcde?.circulation?.bp?.systolic ?? parseSystolic(vitals?.bp);
  const pulse = caseData.abcde?.circulation?.pulseRate ?? vitals?.pulse;
  const gcs = caseData.abcde?.disability?.gcs?.total ?? vitals?.gcs;
  const profile = baseProfile();
  const injuries = inferInjuries(caseData);

  const add = {
    cue: (item: PatientRealismCue) => { profile.observableCues.push(item); },
    assessment: (...items: string[]) => { profile.assessmentPriorities.push(...items); },
    treatment: (...items: string[]) => { profile.treatmentLogic.push(...items); },
    debrief: (...items: string[]) => { profile.debriefEndpoints.push(...items); },
  };

  const respiratoryCase = cat === 'respiratory'
    || /(asthma|copd|wheeze|bronchospasm|stridor|short of breath|dyspnoea|dyspnea|respiratory distress|pneumonia|pulmonary oedema|pulmonary edema|cpap|hypoxia|hypoxic)/.test(text);
  const hypoventilationCase = /(opioid|overdose|naloxone|pinpoint|bradypn|slow respir|hypoventilat|respiratory depression)/.test(text);
  const anaphylaxisCase = sub.includes('anaphylaxis') || /(anaphylaxis|allergic reaction|urticaria|hives|facial swelling|lip swelling|tongue swelling|stridor after|wheeze after|prawns|peanuts|bee sting)/.test(text);
  const traumaCase = cat === 'trauma' || cat === 'thoracic' || injuries.length > 0 || /(mvc|collision|fall|stab|gunshot|blast|fracture|deformity|laceration|haemorrh|hemorrh|bleeding|amputation|pelvic|flail|pneumothorax|tamponade)/.test(text);
  const burnsCase = cat === 'burns' || /(burn|scald|electrical|smoke inhalation|soot|singed|fire|flash)/.test(text);
  const cardiacCase = cat === 'cardiac' || cat === 'cardiac-ecg' || /(chest pain|stemi|nstemi|acs|myocardial|arrhythmia|palpitation|syncope|cardiac arrest|vf|vt|asystole|pea)/.test(text);
  const neuroCase = cat === 'neurological' || /(stroke|facial droop|arm drift|slurred speech|seizure|post-ictal|postictal|gaze deviation|unequal pupils|head injury|tbi)/.test(text);
  const metabolicCase = cat === 'metabolic'
    || /(hypogly|hypergly|diabetic|diabetes|glucose|bgl|blood sugar|dka|insulin|missed meal|tremor)/.test(text);
  const infectionCase = /(sepsis|septic|fever|febrile|infection|pneumonia|wound infection|meningitis|rigors|hot to touch)/.test(text);
  const anxietyCase = cat === 'psychiatric' || cat === 'anxiety-related' || /(panic|hyperventilat|carpopedal|tingling|anxiety|psychosis|agitated|restraint)/.test(text);

  if (respiratoryCase) {
    profile.caseFamily = 'respiratory';
    profile.summary = 'Make work of breathing, sounds, oxygen response, and airway tolerance visible.';
    if ((typeof rr === 'number' && rr >= 28) || /(tripod|accessory|unable to speak|severe respiratory distress|wheeze)/.test(text)) {
      add.cue(cue('resp-work', 'Laboured breathing', 'Accessory muscle use and short phrases should be obvious before the numbers are checked.', 'chest', 'warning'));
    }
    if (typeof spo2 === 'number' && spo2 < 90 || /cyanosis|cyanotic|blue lips/.test(text)) {
      add.cue(cue('resp-cyanosis', 'Low oxygen look', 'Lips and skin should trend dusky until oxygenation improves.', 'face', 'critical'));
    }
    if (/wheeze|asthma|copd|bronchospasm/.test(text)) {
      add.cue(cue('resp-wheeze', 'Audible wheeze', 'Chest auscultation should reveal wheeze and reduced air entry in context.', 'chest', 'warning', 'on-assessment'));
    }
    if (/stridor|upper airway|croup|epiglottitis/.test(text)) {
      add.cue(cue('resp-stridor', 'Upper-airway noise', 'Airway close-up should keep stridor and obstruction risk in context.', 'neck-cspine', 'critical', 'on-assessment'));
    }
    add.assessment('work of breathing', 'SpO2 trend', 'chest auscultation zones', 'speech tolerance', 'airway noise');
    add.treatment('oxygen device should appear on the face', 'bronchodilator should improve wheeze gradually', 'CPAP/BVM should depend on fatigue, consciousness, and tolerance');
    add.debrief('time to oxygen', 'time to bronchodilator or CPAP when indicated', 'inappropriate ventilation attempt');
  }

  if (hypoventilationCase) {
    profile.caseFamily = 'toxicology';
    profile.summary = 'Show toxidrome clues, ventilation failure, antidote response, and airway risk.';
    add.cue(cue('tox-slow-rr', 'Slow shallow breathing', 'Chest rise should be small and slow until ventilation or reversal improves it.', 'chest', 'critical'));
    add.cue(cue('tox-pupils', 'Pupil finding', 'Eye zoom should reveal pupils that match the toxidrome.', 'face', 'warning', 'on-assessment'));
    if (typeof gcs === 'number' && gcs < 13) {
      add.cue(cue('tox-low-tone', 'Reduced responsiveness', 'Voice and cooperation should reduce as consciousness falls.', 'head', 'critical'));
    }
    add.assessment('airway patency', 'respiratory rate and EtCO2', 'pupil zoom', 'glucose check', 'scene evidence');
    add.treatment('naloxone should improve respiratory drive when opioid physiology is present', 'oxygen and BVM support should bridge ventilation', 'awakening may cause agitation, vomiting, or refusal');
    add.debrief('ventilation before/with antidote', 'time to naloxone when indicated', 'missed glucose or airway protection check');
  }

  if (anaphylaxisCase) {
    profile.caseFamily = 'anaphylaxis';
    profile.summary = 'Connect skin, airway swelling, wheeze, shock, and adrenaline timing.';
    add.cue(cue('ana-skin', 'Rash / swelling', 'Skin and face cues should show allergic involvement without needing a text explanation.', 'face', 'warning'));
    add.cue(cue('ana-airway', 'Airway swelling risk', 'Mouth and neck assessment should keep tongue/lip swelling and stridor risk visible.', 'neck-cspine', 'critical', 'on-assessment'));
    if (typeof sbp === 'number' && sbp < 95) {
      add.cue(cue('ana-shock', 'Poor perfusion', 'The patient should look anxious, pale, and unwell while hypotensive.', 'chest', 'critical'));
    }
    add.assessment('allergen exposure', 'airway swelling', 'wheeze/stridor', 'BP and perfusion', 'skin signs');
    add.treatment('IM adrenaline should be the decisive intervention', 'oxygen and fluids support physiology', 'antihistamine alone should not reverse shock');
    add.debrief('time to IM adrenaline', 'airway reassessment', 'over-reliance on antihistamine or steroid');
  }

  if (metabolicCase) {
    profile.caseFamily = 'metabolic';
    profile.summary = 'Make glucose-related mental status changes and treatment response visible.';
    add.cue(cue('metab-sweat', 'Sweaty / shaky', 'Diaphoresis, tremor, and confusion should be visible when glucose is driving the case.', 'face', 'warning'));
    if (typeof gcs === 'number' && gcs < 15) {
      add.cue(cue('metab-confusion', 'Altered mentation', 'The patient should answer inconsistently until glucose is corrected.', 'head', 'warning'));
    }
    add.assessment('blood glucose', 'airway safety before oral glucose', 'neuro status', 'medications and meal history');
    add.treatment('oral glucose only if awake and safe to swallow', 'IV dextrose or glucagon should improve consciousness when appropriate', 'missed glucose should be a debrief-critical error');
    add.debrief('time to glucose check', 'correct route for consciousness level', 'response after glucose');
  }

  if (cardiacCase) {
    profile.caseFamily = 'cardiac';
    profile.summary = 'Show pain, perfusion, monitor rhythm, and medication/device effects as one story.';
    if (/chest pain|acs|stemi|nstemi|myocardial/.test(text)) {
      add.cue(cue('cardiac-pain', 'Guarding chest', 'The patient should look uncomfortable, pale, or sweaty if the presentation supports ACS.', 'chest', 'warning'));
    }
    if (/diaphor|sweat|clammy/.test(text)) {
      add.cue(cue('cardiac-sweat', 'Diaphoretic', 'Skin cues should support poor perfusion and sympathetic stress.', 'face', 'warning'));
    }
    if (/cardiac arrest|vf|vt|asystole|pea|unresponsive|no pulse/.test(text)) {
      add.cue(cue('cardiac-arrest', 'No purposeful response', 'The mannequin should feel still and device-led: pads, CPR, airway, EtCO2.', 'chest', 'critical'));
    }
    add.assessment('12-lead ECG', 'pain score and history', 'perfusion and BP', 'contraindications before nitrates', 'shockable rhythm check');
    add.treatment('aspirin/nitrates/analgesia should be case-appropriate', 'defib pads and LUCAS should appear when applied', 'arrest physiology should drive EtCO2 and pulse absence');
    add.debrief('time to ECG', 'time to aspirin or defib when indicated', 'contraindicated nitrate or missed arrest pathway');
  }

  if (traumaCase) {
    profile.caseFamily = 'trauma';
    profile.summary = 'Keep mechanism, wounds, pain, perfusion, immobilization, and equipment visible.';
    for (const injury of injuries.slice(0, 4)) {
      const label = injury.kind === 'bleeding' ? 'Visible bleeding'
        : injury.kind === 'fracture' || injury.kind === 'deformity' ? 'Deformity / fracture'
          : injury.label;
      add.cue(cue(
        `injury-${injury.id}`,
        label,
        injury.detail,
        injuryRegionTo3D(injury.region),
        injury.severity === 'critical' ? 'critical' : injury.severity === 'major' ? 'warning' : 'observe',
        injury.kind === 'bleeding' || injury.kind === 'amputation' || injury.kind === 'burn' ? 'immediate' : 'on-assessment',
      ));
    }
    if (/pale|shock|hypotens|weak pulse|delayed capillary|haemorrh|hemorrh/.test(text) || (typeof sbp === 'number' && sbp < 90) || (typeof pulse === 'number' && pulse > 120)) {
      add.cue(cue('trauma-shock', 'Shock look', 'Perfusion should deteriorate until the actual source problem is addressed.', 'chest', 'critical'));
    }
    add.assessment('MARCH / ABCDE', 'external bleeding and wounds', 'distal pulses', 'spinal risk', 'pain and mechanism');
    add.treatment('splints, collars, boards, dressings, and tourniquets should appear on the patient when used', 'source control must matter more than cosmetic treatment', 'movement should trigger pain and cooperation changes');
    add.debrief('time to critical trauma intervention', 'missed posterior/log-roll assessment', 'equipment matched to injury type');
  }

  if (burnsCase) {
    profile.caseFamily = 'burns';
    profile.summary = 'Make burn pattern, airway risk, pain, exposure, cooling, and hypothermia risk visible.';
    add.cue(cue('burn-pattern', 'Burn pattern', 'Burn location and depth should be visible after exposure, not buried in text.', 'chest', 'warning'));
    if (/soot|singed|smoke|inhalation|facial burn|airway/.test(text)) {
      add.cue(cue('burn-airway', 'Inhalation risk', 'Face/mouth view should show soot, swelling risk, and airway vigilance.', 'face', 'critical', 'on-assessment'));
    }
    add.assessment('remove from source', 'airway and inhalation signs', 'burn size/depth', 'pain', 'temperature protection');
    add.treatment('cooling/dressings should visually change the burn state', 'oxygen should be expected with inhalation risk', 'warming blanket should matter after cooling');
    add.debrief('time to cooling and covering', 'airway reassessment', 'hypothermia prevention');
  }

  if (neuroCase) {
    profile.caseFamily = 'neurology';
    profile.summary = 'Express neurologic asymmetry, pupils, speech, seizure state, and glucose exclusion.';
    if (/stroke|facial droop|slurred|arm drift|weakness|gaze/.test(text)) {
      add.cue(cue('neuro-asymmetry', 'Neurologic asymmetry', 'Face/arms/speech checks should reveal side-specific deficits.', 'face', 'warning', 'on-assessment'));
    }
    if (/seizure|post-ictal|postictal/.test(text)) {
      add.cue(cue('neuro-postictal', 'Post-seizure state', 'Confusion and gradual recovery should be visible in voice and cooperation.', 'head', 'warning'));
    }
    if (/unequal|fixed|dilated|pinpoint|pupil/.test(text)) {
      add.cue(cue('neuro-pupils', 'Pupil abnormality', 'Eye loupe should match the documented pupil finding.', 'face', 'warning', 'on-assessment'));
    }
    add.assessment('FAST/neurologic screen', 'blood glucose', 'pupil comparison', 'GCS/AVPU trend', 'seizure duration/recovery');
    add.treatment('benzodiazepines should fit active seizure physiology', 'glucose should be ruled out before stroke anchoring', 'destination/time decisions matter');
    add.debrief('time to neuro screen', 'missed glucose mimic', 'seizure timing and airway protection');
  }

  if (infectionCase) {
    profile.caseFamily = 'infection/sepsis';
    profile.summary = 'Show systemic illness: temperature, perfusion, respiratory effort, and fluid response.';
    add.cue(cue('sepsis-skin', 'Systemically unwell', 'The patient should look flushed or pale, sweaty, and exhausted depending on perfusion.', 'face', 'warning'));
    if ((typeof sbp === 'number' && sbp < 95) || /septic shock|hypotens|poor perfusion/.test(text)) {
      add.cue(cue('sepsis-shock', 'Sepsis perfusion risk', 'Capillary refill, mentation, and BP should trend if sepsis is missed.', 'chest', 'critical'));
    }
    add.assessment('temperature', 'source of infection', 'perfusion and BP', 'mental status', 'oxygen need');
    add.treatment('oxygen and fluids should improve selected patients gradually', 'clinical urgency should rise with hypotension or altered mentation', 'source recognition matters in debrief');
    add.debrief('time to sepsis recognition', 'temperature documented', 'fluid/oxygen appropriateness');
  }

  if (anxietyCase) {
    profile.caseFamily = 'behavioral / anxiety';
    profile.summary = 'Make distress human while still forcing students to rule out dangerous mimics.';
    add.cue(cue('anxiety-distress', 'Anxious distress', 'Voice, posture, tingling, and breathing pattern should feel human and contextual.', 'face', 'observe'));
    if (/hyperventilat|carpopedal|tingling/.test(text)) {
      add.cue(cue('anxiety-hypervent', 'Hyperventilation signs', 'Fast breathing and hand symptoms should improve with coaching only after red flags are excluded.', 'chest', 'observe'));
    }
    add.assessment('rule out hypoxia, PE, asthma, ACS, glucose', 'patient reassurance', 'risk and safety screen', 'substance/caffeine context');
    add.treatment('calm coaching and explanation should improve cooperation', 'paper-bag style shortcuts should be discouraged', 'sedation/restraint should be tightly justified');
    add.debrief('dangerous mimic ruled out', 'communication quality', 'unsafe restraint or anchoring');
  }

  if (profile.observableCues.length === 0) {
    add.cue(cue('general-observe', 'General impression', 'Use the mannequin, voice, monitor, and history together before choosing a path.', 'chest', 'normal'));
    add.assessment('general impression', 'ABCDE survey', 'focused history', 'reassess after each intervention');
    add.treatment('treatment should match findings rather than category labels');
    add.debrief('assessment before treatment', 'response to intervention', 'reassessment loop');
  }

  profile.observableCues = uniq(profile.observableCues).slice(0, 8);
  profile.assessmentPriorities = uniq(profile.assessmentPriorities).slice(0, 8);
  profile.treatmentLogic = uniq(profile.treatmentLogic).slice(0, 8);
  profile.debriefEndpoints = uniq(profile.debriefEndpoints).slice(0, 8);

  return profile;
}

export function shouldRevealRealismCue(
  cueItem: PatientRealismCue,
  assessedRegions: Set<string>,
  activeRegion: string | null,
): boolean {
  if (cueItem.visibility === 'immediate') return true;
  if (cueItem.visibility === 'after-treatment') return false;
  return activeRegion === cueItem.region
    || assessedRegions.has(cueItem.region)
    || (['right-arm', 'left-arm', 'right-leg', 'left-leg'].includes(cueItem.region) && assessedRegions.has('extremities'));
}

export function deriveAppliedTreatmentRealismCues(
  caseData: CaseScenario,
  appliedTreatmentIds: string[],
): PatientRealismCue[] {
  const ids = new Set(appliedTreatmentIds);
  const profile = deriveCaseRealismProfile(caseData);
  const cues: PatientRealismCue[] = [];
  const text = textForCase(caseData);

  if (hasAnyId(ids, ['oxygen_nasal', 'oxygen_mask', 'oxygen_nonrebreather'])) {
    cues.push(makeTreatmentCue(
      'oxygen-visible',
      'Oxygen connected',
      profile.caseFamily === 'respiratory'
        ? 'Device is on; watch SpO2, work of breathing, and speech tolerance over time.'
        : 'Oxygen is visible; reassess whether it is indicated and titrated to the patient.',
      'face',
      profile.caseFamily === 'respiratory' ? 'observe' : 'normal',
    ));
  }

  if (hasAnyId(ids, ['nebulizer_salbutamol', 'nebulizer_ipratropium'])) {
    cues.push(makeTreatmentCue(
      'nebulizer-response',
      'Nebulizer running',
      /asthma|copd|wheeze|bronchospasm/.test(text)
        ? 'Mist should be visible; wheeze and work of breathing should improve gradually if bronchospasm is the driver.'
        : 'Nebulizer is running, but response depends on actual bronchospasm.',
      'face',
      /asthma|copd|wheeze|bronchospasm/.test(text) ? 'observe' : 'warning',
    ));
  }

  if (hasAnyId(ids, ['cpap_niv'])) {
    cues.push(makeTreatmentCue(
      'cpap-response',
      'Positive pressure support',
      /pulmonary oedema|pulmonary edema|copd|severe respiratory|hypoxia|hypoxic/.test(text)
        ? 'Mask seal and pressure support should reduce distress if the patient tolerates it.'
        : 'CPAP is visible; patient tolerance and indication need active reassessment.',
      'face',
      /pulmonary oedema|pulmonary edema|copd|severe respiratory|hypoxia|hypoxic/.test(text) ? 'observe' : 'warning',
    ));
  }

  if (hasAnyId(ids, ['bvm_ventilation', 'mechanical_ventilation', 'ventilator_setup'])) {
    cues.push(makeTreatmentCue(
      'ventilation-support',
      'Ventilation supported',
      /opioid|overdose|respiratory depression|apnoea|apnea|arrest|gcs.*[3-8]/.test(text)
        ? 'Chest rise should now be assisted; watch EtCO2, SpO2, and gastric inflation risk.'
        : 'Ventilation device is applied; conscious patients may resist if the indication is weak.',
      'chest',
      'observe',
    ));
  }

  if (hasAnyId(ids, ['naloxone_04mg', 'naloxone_iv'])) {
    cues.push(makeTreatmentCue(
      'naloxone-response',
      'Antidote response',
      /opioid|overdose|pinpoint|respiratory depression/.test(text)
        ? 'Respiratory drive and consciousness should improve, but agitation or vomiting may follow.'
        : 'Naloxone was given; absence of toxidrome should limit response.',
      'head',
      /opioid|overdose|pinpoint|respiratory depression/.test(text) ? 'observe' : 'warning',
    ));
  }

  if (hasAnyId(ids, ['glucose_10g', 'dextrose_10', 'dextrose_10_250ml'])) {
    cues.push(makeTreatmentCue(
      'glucose-response',
      'Glucose response',
      /hypogly|glucose|bgl|blood sugar|diabetic|insulin|missed meal/.test(text)
        ? 'Mentation should improve gradually if hypoglycaemia was the cause.'
        : 'Glucose was given; reassess airway safety, BGL, and whether this was indicated.',
      'head',
      /hypogly|glucose|bgl|blood sugar|diabetic|insulin|missed meal/.test(text) ? 'observe' : 'warning',
    ));
  }

  if (hasAnyId(ids, ['adrenaline_im', 'adrenaline_im_child', 'adrenaline_im_older', 'adrenaline_im_infant'])) {
    cues.push(makeTreatmentCue(
      'im-adrenaline-response',
      'Adrenaline given',
      /anaphylaxis|allergic|urticaria|hives|swelling|stridor|prawns|peanuts|bee/.test(text)
        ? 'Airway swelling, wheeze, and perfusion should start improving; repeat assessment is urgent.'
        : 'Adrenaline is a high-stakes drug; monitor rhythm, BP, and indication closely.',
      'chest',
      /anaphylaxis|allergic|urticaria|hives|swelling|stridor|prawns|peanuts|bee/.test(text) ? 'observe' : 'warning',
    ));
  }

  if (hasAnyId(ids, ['aspirin', 'gtn_spray'])) {
    cues.push(makeTreatmentCue(
      'cardiac-meds-response',
      'Cardiac meds given',
      /chest pain|acs|stemi|nstemi|myocardial|angina/.test(text)
        ? 'Pain, BP, rhythm, and contraindications should stay in view after administration.'
        : 'Cardiac medication was applied; reassess indication and adverse effects.',
      'chest',
      /chest pain|acs|stemi|nstemi|myocardial|angina/.test(text) ? 'observe' : 'warning',
    ));
  }

  if (hasAnyId(ids, ['bleeding_control', 'tourniquet', 'txa_1g'])) {
    cues.push(makeTreatmentCue(
      'haemorrhage-response',
      'Bleeding pathway active',
      /bleed|haemorrh|hemorrh|blood loss|amputation|wound/.test(text)
        ? 'Source control should be visible; perfusion should stabilise only if the wound type matches the intervention.'
        : 'Haemorrhage treatment is staged; confirm an actual bleeding source and reassess perfusion.',
      'chest',
      /bleed|haemorrh|hemorrh|blood loss|amputation|wound/.test(text) ? 'observe' : 'warning',
    ));
  }

  if (hasAnyId(ids, ['splinting', 'sam_splint', 'box_splint', 'vacuum_limb_splint', 'air_splint', 'traction_splint', 'cervical_collar', 'pelvic_binder'])) {
    cues.push(makeTreatmentCue(
      'immobilisation-response',
      'Immobilisation applied',
      'The device should reduce movement and pain only when it matches the injured body region.',
      /pelvic|pelvis/.test(text) ? 'pelvis' : /leg|femur|ankle|tibia|traction/.test(text) ? 'right-leg' : 'neck-cspine',
      'observe',
    ));
  }

  if (hasAnyId(ids, ['active_cooling', 'warming_blanket'])) {
    cues.push(makeTreatmentCue(
      'temperature-response',
      'Temperature care active',
      /burn|heat|hypotherm|cold|fever|sepsis/.test(text)
        ? 'Temperature intervention is visible; reassess pain, skin, perfusion, and hypothermia risk.'
        : 'Temperature support is active; confirm the exposure problem it is treating.',
      'chest',
      'observe',
    ));
  }

  if (hasAnyId(ids, ['fluids_250ml', 'fluids_500ml', 'fluids_1000ml'])) {
    cues.push(makeTreatmentCue(
      'fluid-response',
      'Fluid line running',
      /sepsis|dehydrat|hypotens|shock|haemorrh|hemorrh|blood loss/.test(text)
        ? 'Fluids support perfusion, but source control and reassessment still decide the trajectory.'
        : 'Fluids are running; reassess BP, lungs, and whether this patient benefits.',
      'right-arm',
      /pulmonary oedema|pulmonary edema|heart failure/.test(text) ? 'warning' : 'observe',
    ));
  }

  return uniq(cues).slice(0, 8);
}

export function evaluateTreatmentRealism({
  treatment,
  caseData,
  vitals,
  appliedTreatmentIds = [],
}: {
  treatment: Pick<Treatment, 'id' | 'name' | 'category'>;
  caseData: CaseScenario;
  vitals?: VitalSigns | null;
  appliedTreatmentIds?: string[];
}): TreatmentRealismResult {
  const text = textForCase(caseData);
  const presentationText = presentationTextForCase(caseData);
  const ids = new Set(appliedTreatmentIds);
  const tx = treatmentName(treatment);
  const gcs = vitals?.gcs ?? caseData.abcde?.disability?.gcs?.total ?? 15;
  const spo2 = vitals?.spo2 ?? caseData.abcde?.breathing?.spo2;
  const rr = vitals?.respiration ?? caseData.abcde?.breathing?.rate;
  const sbp = parseSystolic(vitals?.bp) ?? caseData.abcde?.circulation?.bp?.systolic;

  if (/oxygen_(nasal|mask|nonrebreather)/.test(treatment.id)) {
    if ((typeof spo2 === 'number' && spo2 < 94) || /hypoxia|hypoxic|cyanosis|respiratory distress|shock|chest pain|anaphylaxis|sepsis/.test(text)) {
      return result('matched', 'Oxygen response started', 'Device is visible on the patient. Reassess SpO2, work of breathing, speech, and comfort rather than assuming instant correction.', 'Appropriate oxygen therapy started; reassessment required.', {
        patientQuote: gcs >= 13 ? 'Okay... I can feel the oxygen.' : undefined,
        visibleCue: makeTreatmentCue('oxygen-started', 'Oxygen connected', 'Watch oxygenation and comfort over the next reassessment cycle.', 'face', 'observe'),
      });
    }
    return result('partial', 'Oxygen may be excessive', 'The device is visible, but current oxygenation and presentation do not clearly demand high-flow oxygen. Consider titration and reassess.', 'Oxygen applied without a strong hypoxia cue.', {
      patientQuote: gcs >= 13 ? 'Do I need this mask? I can still talk.' : undefined,
      visibleCue: makeTreatmentCue('oxygen-question', 'Oxygen connected', 'Indication is not obvious; reassess need and target saturation.', 'face', 'warning'),
    });
  }

  if (/nebulizer|salbutamol|ipratropium/.test(tx)) {
    if (/hyperkalaem|hyperkalem|high potassium|electrolyte emergency/.test(text) && /salbutamol/.test(tx)) {
      return result('matched', 'Potassium shift started', 'Salbutamol is being used here to drive potassium into cells, not to treat bronchospasm. Continue ECG monitoring and definitive hyperkalaemia therapy.', 'Salbutamol matched to the intracellular potassium-shift pathway.', {
        visibleCue: makeTreatmentCue('potassium-shift-started', 'Potassium-shift therapy', 'Watch the ECG and reassess potassium-directed treatment response.', 'chest', 'observe'),
      });
    }
    if (/asthma|copd|wheeze|bronchospasm/.test(text)) {
      return result('matched', 'Bronchodilator response', 'Mist is running. Wheeze and work of breathing should improve gradually if bronchospasm is the driver.', 'Bronchodilator matched to wheeze/bronchospasm.', {
        patientQuote: gcs >= 13 ? 'It is a bit easier to breathe.' : undefined,
        visibleCue: makeTreatmentCue('bronchodilator-started', 'Nebulizer running', 'Reassess air entry, wheeze, RR, and SpO2 after the treatment has time to work.', 'face', 'observe'),
      });
    }
    return result('mismatch', 'Question bronchodilator fit', 'Nebulizer is running, but the case does not clearly show bronchospasm. Look for wheeze, air entry, and the real cause of distress.', 'Bronchodilator used without clear bronchospasm.', {
      patientQuote: gcs >= 13 ? 'This mask is not really changing the pain.' : undefined,
      visibleCue: makeTreatmentCue('bronchodilator-question', 'Nebulizer running', 'No clear bronchospasm cue; reassess diagnosis.', 'face', 'warning'),
    });
  }

  if (treatment.id === 'cpap_niv') {
    if (/pulmonary oedema|pulmonary edema|copd|severe respiratory|hypoxia|hypoxic/.test(text)) {
      return result('matched', 'Positive-pressure support', 'CPAP is visible and should reduce distress if the patient tolerates the mask and the physiology fits.', 'CPAP matched to pressure-responsive respiratory distress.', {
        patientQuote: gcs >= 13 ? 'The mask is tight... but I can breathe a bit better.' : undefined,
        visibleCue: makeTreatmentCue('cpap-started', 'CPAP mask sealed', 'Watch tolerance, SpO2, BP, and work of breathing.', 'face', 'observe'),
      });
    }
    return result('mismatch', 'Question CPAP indication', 'The mask is visible, but positive pressure can distress a patient who does not need it. Confirm respiratory failure, pulmonary oedema, COPD, or persistent hypoxia.', 'CPAP used without clear pressure-support indication.', {
      patientQuote: gcs >= 13 ? 'This feels too tight. Are you sure I need it?' : undefined,
      visibleCue: makeTreatmentCue('cpap-question', 'CPAP mask sealed', 'Tolerance and indication are uncertain.', 'face', 'warning'),
    });
  }

  if (treatment.id === 'bvm_ventilation') {
    if (/apnoea|apnea|agonal|respiratory depression|opioid|arrest|unresponsive/.test(text) || (typeof rr === 'number' && rr < 8) || gcs <= 8) {
      return result('matched', 'Ventilation supported', 'BVM support should produce visible chest rise. Reassess EtCO2, SpO2, mask seal, and gastric inflation risk.', 'Ventilation support matched to poor ventilatory drive.', {
        visibleCue: makeTreatmentCue('bvm-started', 'BVM ventilation', 'Chest rise should be assisted at the selected rate.', 'chest', 'observe'),
      });
    }
    return result('harmful', 'Patient likely resists BVM', 'The patient appears able to breathe and protect their airway. Assisted ventilation may cause distress unless they are failing or cannot ventilate.', 'BVM attempted despite weak indication.', {
      patientQuote: gcs >= 13 ? 'Stop, I can breathe. What are you doing?' : undefined,
      visibleCue: makeTreatmentCue('bvm-resistance', 'BVM resistance', 'Patient tolerance is poor; reassess ventilation need.', 'face', 'critical'),
    });
  }

  if (/naloxone/.test(tx)) {
    if (/opioid|overdose|pinpoint|respiratory depression|hypoventilat/.test(text)) {
      return result('matched', 'Naloxone response', 'Respiratory drive should improve, but vomiting, agitation, or refusal can appear as consciousness returns.', 'Naloxone matched to opioid toxidrome.', {
        patientQuote: gcs >= 10 ? 'What happened... why do I feel sick?' : undefined,
        visibleCue: makeTreatmentCue('naloxone-started', 'Consciousness changing', 'Watch RR, airway, vomiting risk, and agitation after reversal.', 'head', 'observe'),
      });
    }
    return result('mismatch', 'No toxidrome response expected', 'Naloxone has little effect without opioid physiology. Reassess pupils, RR, glucose, and other causes of altered consciousness.', 'Naloxone used without clear opioid physiology.', {
      visibleCue: makeTreatmentCue('naloxone-no-response', 'Minimal response', 'No clear opioid pattern; reassess differential.', 'head', 'warning'),
    });
  }

  if (/glucose|dextrose/.test(tx)) {
    const unsafeOral = treatment.id === 'glucose_10g' && gcs < 13;
    if (unsafeOral) {
      return result('harmful', 'Unsafe oral glucose', 'The patient is not alert enough for oral glucose. Use a route that protects the airway and reassess BGL.', 'Oral glucose attempted despite unsafe airway/mentation.', {
        visibleCue: makeTreatmentCue('oral-glucose-risk', 'Airway risk', 'Oral treatment risks aspiration when consciousness is reduced.', 'face', 'critical'),
      });
    }
    if (/hypogly|glucose|bgl|blood sugar|diabetic|insulin|missed meal/.test(text)) {
      return result('matched', 'Glucose response', 'Mentation should improve gradually if hypoglycaemia is driving the presentation. Recheck BGL and airway safety.', 'Glucose matched to suspected hypoglycaemia.', {
        patientQuote: gcs >= 10 ? 'I feel... a little clearer.' : undefined,
        visibleCue: makeTreatmentCue('glucose-started', 'Mentation improving', 'Repeat BGL and reassess consciousness.', 'head', 'observe'),
      });
    }
    return result('partial', 'Glucose given', 'This may be harmless in some contexts, but the simulator should reward confirming BGL before treating a non-glucose problem.', 'Glucose given without clear glucose-driven case.', {
      visibleCue: makeTreatmentCue('glucose-question', 'Glucose given', 'Confirm BGL and reassess cause of symptoms.', 'head', 'warning'),
    });
  }

  if (/adrenaline_im/.test(treatment.id)) {
    if (/anaphylaxis|allergic|urticaria|hives|swelling|stridor|prawns|peanuts|bee/.test(text)) {
      return result('matched', 'Adrenaline working', 'Airway swelling, wheeze, and perfusion should be reassessed quickly. Oxygen and fluids remain supportive.', 'IM adrenaline matched to anaphylaxis.', {
        patientQuote: gcs >= 13 ? 'My chest feels a bit less tight.' : undefined,
        visibleCue: makeTreatmentCue('adrenaline-im-started', 'Perfusion improving', 'Reassess airway, wheeze, BP, and repeat-dose need.', 'chest', 'observe'),
      });
    }
    if (/life-threatening asthma|near-fatal asthma|severe asthma|silent chest/.test(text)
      || (/asthma/.test(text) && ((typeof spo2 === 'number' && spo2 < 90) || (typeof rr === 'number' && rr >= 28)))) {
      return result('matched', 'Systemic bronchodilator rescue', 'IM adrenaline is being used as rescue bronchodilation in critical asthma. Reassess rhythm, BP, air entry, and response to the full severe-asthma bundle.', 'IM adrenaline matched to a critical asthma rescue pathway.', {
        patientQuote: gcs >= 13 ? 'My heart is racing, but I can feel a little more air.' : undefined,
        visibleCue: makeTreatmentCue('adrenaline-asthma-started', 'Critical asthma rescue', 'Monitor rhythm, BP, air entry, and work of breathing closely.', 'chest', 'observe'),
      });
    }
    return result('harmful', 'High-stakes medication', 'IM adrenaline can worsen tachycardia, hypertension, and anxiety if the physiology is wrong. Confirm indication.', 'Adrenaline used without clear anaphylaxis/cardiac-arrest indication.', {
      patientQuote: gcs >= 13 ? 'My heart is racing.' : undefined,
      visibleCue: makeTreatmentCue('adrenaline-question', 'Adrenergic effect', 'Monitor rhythm and BP closely.', 'chest', 'critical'),
    });
  }

  if (treatment.id === 'aspirin') {
    if (/chest pain|acs|stemi|nstemi|myocardial|angina/.test(text)) {
      return result('matched', 'Aspirin given', 'This supports the cardiac pathway, but pain, ECG, BP, and contraindications still need reassessment.', 'Aspirin matched to suspected ACS.', {
        visibleCue: makeTreatmentCue('aspirin-started', 'Cardiac pathway', 'Continue ECG, pain, BP, and transport decisions.', 'chest', 'observe'),
      });
    }
    return result('mismatch', 'Question aspirin indication', 'Aspirin is not a generic collapse treatment. Reassess cardiac features and bleeding risk.', 'Aspirin used without clear cardiac features.', {
      visibleCue: makeTreatmentCue('aspirin-question', 'Medication questioned', 'Indication and bleeding risk need reassessment.', 'chest', 'warning'),
    });
  }

  if (treatment.id === 'gtn_spray') {
    if (typeof sbp === 'number' && sbp < 100) {
      return result('harmful', 'Hypotension risk', 'Nitrates can worsen low blood pressure. Reassess BP, infarct pattern, medication history, and shock signs.', 'Nitrate risk with low systolic BP.', {
        patientQuote: gcs >= 13 ? 'I feel dizzy... worse.' : undefined,
        visibleCue: makeTreatmentCue('gtn-hypotension', 'BP risk', 'Watch for worsening hypotension after nitrate use.', 'chest', 'critical'),
      });
    }
    if (/chest pain|acs|stemi|nstemi|angina|pulmonary oedema|pulmonary edema/.test(text)) {
      return result('matched', 'Nitrate response', 'Pain or pulmonary congestion may improve if BP and contraindications are suitable. Reassess after each dose.', 'GTN matched with BP-aware cardiac pathway.', {
        visibleCue: makeTreatmentCue('gtn-started', 'Pain/BP reassessment', 'Repeat BP and pain score before stacking doses.', 'chest', 'observe'),
      });
    }
    return result('mismatch', 'Question nitrate indication', 'GTN is not a general analgesic. Confirm ACS or pulmonary oedema physiology and contraindications.', 'GTN used without clear nitrate-responsive physiology.', {
      visibleCue: makeTreatmentCue('gtn-question', 'Nitrate questioned', 'Indication unclear; reassess diagnosis.', 'chest', 'warning'),
    });
  }

  if (/bleeding_control|tourniquet|txa/.test(tx)) {
    const activeBleed = /bleed|haemorrh|hemorrh|blood loss|amputation|wound/.test(text);
    if (activeBleed) {
      const hasSourceControl = ids.has('bleeding_control') || ids.has('tourniquet') || treatment.id === 'bleeding_control' || treatment.id === 'tourniquet';
      return result('matched', hasSourceControl ? 'Source control active' : 'Haemorrhage support', hasSourceControl
        ? 'Visible bleeding should slow or stop only when the chosen method matches the wound type.'
        : 'This supports clotting or perfusion, but the visible bleeding source still needs direct control.',
      'Bleeding pathway intervention matched to trauma/circulation problem.', {
        patientQuote: gcs >= 13 && treatment.id === 'tourniquet' ? 'That really hurts, but the bleeding is slowing.' : undefined,
        visibleCue: makeTreatmentCue('haemorrhage-started', 'Bleeding pathway', 'Confirm source control, distal perfusion, and time of application.', 'chest', 'observe'),
      });
    }
    return result('mismatch', 'No bleeding source confirmed', 'Haemorrhage equipment should be matched to a real wound, not used because trauma is possible.', 'Bleeding intervention without confirmed source.', {
      visibleCue: makeTreatmentCue('haemorrhage-question', 'Source not confirmed', 'Find and match the wound before committing the intervention.', 'chest', 'warning'),
    });
  }

  if (/splint|collar|binder|stretcher|mattress|board/.test(tx)) {
    if (/fracture|deform|pelvic|spine|c-spine|cervical|trauma|fall|collision|mvc|pain/.test(text)) {
      return result('matched', 'Movement controlled', 'Immobilisation should reduce movement and pain when matched to the correct region. Check distal pulses and comfort.', 'Immobilisation matched to injury pattern.', {
        patientQuote: gcs >= 13 ? 'That feels more supported. Please move me carefully.' : undefined,
        visibleCue: makeTreatmentCue('immobilisation-started', 'Immobilisation applied', 'Reassess pain, alignment, distal pulse, motor, and sensation.', /pelvic|pelvis/.test(text) ? 'pelvis' : 'right-leg', 'observe'),
      });
    }
    return result('partial', 'Immobilisation may be unnecessary', 'The device is visible, but it should match mechanism, pain, deformity, or neurologic risk.', 'Immobilisation applied without a strong injury cue.', {
      visibleCue: makeTreatmentCue('immobilisation-question', 'Device applied', 'Confirm mechanism and body-region need.', 'neck-cspine', 'warning'),
    });
  }

  if (/fluids_/.test(treatment.id)) {
    const pulmonaryCongestionPresent = /(pink frothy|bilateral[^.]*crackles|crackles[^.]*bilateral|bibasal crackles|pulmonary oedema|pulmonary edema)/.test(presentationText)
      && !/(no pulmonary oedema|no pulmonary edema|no [^.]{0,30}crackles|clear lungs|clear bilateral air entry)/.test(presentationText);
    const fluidResponsiveShock = /sepsis|septic|dehydrat|haemorrh|hemorrh|blood loss/.test(text)
      && ((typeof sbp === 'number' && sbp < 95) || /shock|hypotens|poor perfusion|prolonged capillary|mottled/.test(text));
    if (fluidResponsiveShock) {
      return result('matched', 'Perfusion support', 'Fluid is running for a fluid-responsive shock state. Use titrated boluses and reassess BP, lungs, pulse, mentation, and source control after each one.', 'Titrated fluids matched to shock/perfusion physiology.', {
        visibleCue: makeTreatmentCue('fluid-started', 'Fluid line running', 'Reassess perfusion and lungs after each titrated bolus.', 'right-arm', 'observe'),
      });
    }
    if (pulmonaryCongestionPresent) {
      return result('harmful', 'Fluid may worsen breathing', 'Fluids can worsen pulmonary oedema. Reassess lungs, BP, perfusion, and the cause of shock before giving more.', 'Fluid risk in pulmonary oedema/heart failure.', {
        patientQuote: gcs >= 13 ? 'My breathing feels heavier.' : undefined,
        visibleCue: makeTreatmentCue('fluid-risk', 'Fluid risk', 'Watch crackles, SpO2, BP, and respiratory effort.', 'chest', 'critical'),
      });
    }
    if (/sepsis|dehydrat|hypotens|shock|haemorrh|hemorrh|blood loss/.test(text) || (typeof sbp === 'number' && sbp < 95)) {
      return result('matched', 'Perfusion support', 'Fluid is running. It supports circulation, but reassessment and source control still decide outcome.', 'Fluids matched to shock/perfusion problem.', {
        visibleCue: makeTreatmentCue('fluid-started', 'Fluid line running', 'Reassess BP, lungs, pulse, mentation, and source control.', 'right-arm', 'observe'),
      });
    }
    return result('partial', 'Fluids are supportive only', 'The line is running, but a fluid bolus should be justified by perfusion, dehydration, sepsis, or selected shock states.', 'Fluids given without a strong perfusion cue.', {
      visibleCue: makeTreatmentCue('fluid-question', 'Fluid line running', 'Confirm benefit and monitor lungs/BP.', 'right-arm', 'warning'),
    });
  }

  if (treatment.category === 'comfort' || treatment.category === 'positioning' || treatment.category === 'psychological') {
    return result('matched', 'Patient comfort changed', 'Comfort, position, and reassurance should change cooperation, pain, or breathing mechanics when matched to the case.', 'Supportive care applied; reassess comfort and clinical effect.', {
      patientQuote: gcs >= 13 ? 'Thank you... that helps.' : undefined,
      visibleCue: makeTreatmentCue('comfort-started', 'Comfort measure', 'Watch pain, breathing comfort, and cooperation.', 'chest', 'observe'),
    });
  }

  return result('neutral', 'Treatment applied', 'Reassess the patient directly. The monitor, mannequin, and patient response should guide the next step.', `${treatment.name} applied; reassessment required.`, {
    visibleCue: makeTreatmentCue(`generic-${treatment.id}`, 'Treatment applied', 'Reassess before stacking more interventions.', 'chest', 'normal'),
  });
}
