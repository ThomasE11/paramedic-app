/**
 * Dynamic Treatment Engine
 *
 * Context-aware, dose-dependent treatment system that mimics real clinical responses.
 *
 * Key Features:
 * 1. Case-aware effects — same treatment has different effects depending on pathology
 * 2. Dose-dependent responses — first dose may be partial, repeated doses accumulate
 * 3. Defibrillation logic — energy selection, sync vs unsync, consequences
 * 4. Wrong-action consequences — unsynchronized shock on VT → cardiac arrest
 * 5. Clinical sound integration — auscultation findings change with treatment
 * 6. Time-based deterioration — untreated patients get worse over time
 */

import type { VitalSigns, CaseScenario } from '@/types';
import type { Treatment } from './enhancedTreatmentEffects';
import {
  type ClinicalSoundState,
  getInitialSounds,
  updateSoundsAfterTreatment,
  rhythmToHeartSound,
} from './clinicalSounds';
import {
  getTreatmentEffectivenessMultiplier,
  getCaseDeteriorationTimeline,
  type DeteriorationStage,
} from './clinicalRealism';
import {
  findProtocol,
  determineSeverityFromVitals,
  getSynergyMultiplier,
  getPositioningEffects,
  assessProtocolCompliance,
  type SeverityProtocol,
} from './treatmentProtocols';

// ============================================================================
// TYPES
// ============================================================================

export interface TreatmentApplicationRecord {
  treatmentId: string;
  treatmentName: string;
  timestamp: number;
  count: number; // How many times this treatment has been applied total
  vitalsBefore: VitalSigns;
  vitalsAfter: VitalSigns;
  soundsBefore: ClinicalSoundState;
  soundsAfter: ClinicalSoundState;
  clinicalResponse: ClinicalResponse;
}

export interface ClinicalResponse {
  description: string;
  effectivenessPercent: number; // 0-100, how effective this application was
  isPartialResponse: boolean;
  requiresRepeat: boolean;
  warningMessage?: string;
  criticalEvent?: CriticalEvent;
  vitalChanges: VitalChange[];
}

export interface VitalChange {
  vital: string;
  oldValue: number | string;
  newValue: number | string;
  direction: 'improved' | 'worsened' | 'unchanged';
}

export interface CriticalEvent {
  type: 'cardiac-arrest' | 'deterioration' | 'adverse-reaction' | 'rosc' | 'rhythm-change';
  description: string;
  newRhythm?: string; // ECG rhythm change
  requiresAction: string[];
}

export interface DefibrillationParams {
  energy: number; // Joules: 50, 100, 150, 200, 360
  synchronized: boolean; // Cardioversion vs defibrillation
  currentRhythm: string; // VF, VT, SVT, AF etc.
}

export interface PatientState {
  vitals: VitalSigns;
  sounds: ClinicalSoundState;
  treatmentHistory: TreatmentApplicationRecord[];
  treatmentCounts: Record<string, number>; // treatmentId → count
  currentRhythm: string; // ECG rhythm
  isInArrest: boolean;
  deteriorationLevel: number; // 0 = stable, 1 = mild, 2 = moderate, 3 = severe, 4 = critical
  timeWithoutTreatment: number; // seconds since last meaningful treatment
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const parseBP = (bp: string): { systolic: number; diastolic: number } => {
  const parts = bp.split('/').map(p => parseInt(p.trim()));
  // Use nullish coalescing — 0 is a valid BP value (cardiac arrest)
  return { systolic: parts[0] ?? 120, diastolic: parts[1] ?? 80 };
};

const formatBP = (systolic: number, diastolic: number): string =>
  `${Math.round(Math.max(0, systolic))}/${Math.round(Math.max(0, diastolic))}`;

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Create initial patient state from a case scenario
 */
export function createInitialPatientState(caseData: CaseScenario): PatientState {
  const vitals = caseData.vitalSignsProgression.initial;
  const findings = [
    ...(caseData.expectedFindings?.keyObservations || []),
    ...(caseData.abcde?.breathing?.findings || []),
    ...(caseData.abcde?.breathing?.auscultation || []),
    caseData.initialPresentation?.generalImpression || '',
  ];

  // Determine initial ECG rhythm from case data.
  //
  // Priority order (first match wins):
  //   1. Explicit `initialRhythm` on the case — authors can nail the
  //      rhythm when free-text fields are ambiguous (e.g. an asystole
  //      arrest whose differentials mention "VF").
  //   2. Subcategory shortcuts — `subcategory: 'asystole'` forces
  //      Asystole regardless of other mentions.
  //   3. Keyword detection across a weighted haystack. The *primary*
  //      haystack (ecgFindings, subcategory, circulation.findings) is
  //      treated as authoritative; the *secondary* haystack
  //      (keyObservations, differentials, title, most-likely-dx) is
  //      only used if the primary yields nothing — this stops stray
  //      mentions of alternate rhythms in differential lists from
  //      hijacking the chosen rhythm.
  let rhythm = 'Normal Sinus Rhythm';
  const ecgFindings = caseData.abcde?.circulation?.ecgFindings || [];

  // ---- 1. Explicit override --------------------------------------------
  if (caseData.initialRhythm && caseData.initialRhythm.trim().length > 0) {
    rhythm = caseData.initialRhythm.trim();
  }
  // ---- 2. Subcategory shortcuts ----------------------------------------
  else if ((caseData.subcategory || '').toLowerCase() === 'asystole') {
    rhythm = 'Asystole';
  }
  else if ((caseData.subcategory || '').toLowerCase() === 'pea') {
    rhythm = 'PEA';
  }

  // ---- 3. Keyword detection (only if override/shortcut didn't fire) ----
  const primaryFindings = [
    ...ecgFindings,
    caseData.subcategory || '',
    ...(caseData.abcde?.circulation?.findings || []),
  ].join(' ').toLowerCase();
  const secondaryFindings = [
    ...(caseData.expectedFindings?.keyObservations || []),
    ...(caseData.expectedFindings?.differentialDiagnoses || []),
    caseData.expectedFindings?.mostLikelyDiagnosis || '',
    caseData.title || '',
  ].join(' ').toLowerCase();
  const allFindings = `${primaryFindings} ${secondaryFindings}`;

  // Prefer primary when it speaks — a rhythm mentioned in ecgFindings /
  // subcategory / circulation.findings beats one mentioned only in a
  // differential list. If primary is silent, fall back to the combined
  // haystack so cases that only tagged rhythm in keyObservations still
  // match.
  const matchIn = (haystack: string, word: string) =>
    new RegExp(`\\b${word}\\b`, 'i').test(haystack);
  const matchPrimary = (word: string) => matchIn(primaryFindings, word);
  const matchWord = (word: string) =>
    matchPrimary(word) || matchIn(secondaryFindings, word);

  if (rhythm !== 'Normal Sinus Rhythm') {
    // Override/shortcut already claimed the rhythm; skip keyword tree.
  } else

  if (matchWord('ventricular fibrillation') || (matchWord('vf') && !allFindings.includes('lvf'))) rhythm = 'Ventricular Fibrillation';
  else if (matchWord('ventricular tachycardia') || (matchWord('vt') && !allFindings.includes('avt'))) rhythm = 'Ventricular Tachycardia';
  else if (matchWord('svt') || matchWord('supraventricular tachycardia')) rhythm = 'SVT';
  else if (matchWord('atrial fibrillation') || (matchWord('af') && allFindings.includes('fibrillation'))) rhythm = 'Atrial Fibrillation';
  else if (matchWord('atrial flutter') || matchWord('flutter')) rhythm = 'Atrial Flutter';
  else if (matchWord('asystole')) rhythm = 'Asystole';
  else if (matchWord('pulseless electrical activity') || (matchWord('pea') && !allFindings.includes('peanut') && !allFindings.includes('appear'))) rhythm = 'PEA';
  else if (matchWord('anterior stemi') || (matchWord('stemi') && allFindings.includes('anterior')) || allFindings.includes('stem-anterior')) rhythm = 'Anterior STEMI';
  else if (matchWord('inferior stemi') || (matchWord('stemi') && allFindings.includes('inferior')) || allFindings.includes('stem-inferior')) rhythm = 'Inferior STEMI';
  else if (matchWord('lateral stemi') || (matchWord('stemi') && allFindings.includes('lateral')) || allFindings.includes('stem-lateral')) rhythm = 'Lateral STEMI';
  else if (matchWord('posterior stemi') || (matchWord('stemi') && allFindings.includes('posterior')) || allFindings.includes('stem-posterior')) rhythm = 'Inferior STEMI';
  else if (matchWord('nstemi') || matchWord('non-st elevation')) rhythm = 'NSTEMI';
  else if (matchWord('stemi') || matchWord('st elevation')) rhythm = 'Anterior STEMI';
  // Conduction blocks — check BEFORE generic bradycardia to avoid masking
  else if (allFindings.includes('complete heart block') || allFindings.includes('3rd degree') || allFindings.includes('third degree') || allFindings.includes('heart-block')) rhythm = 'Complete Heart Block';
  else if (allFindings.includes('wenckebach') || allFindings.includes('mobitz type i') || allFindings.includes('2nd degree type i')) rhythm = 'Wenckebach';
  else if (allFindings.includes('mobitz type ii') || allFindings.includes('mobitz 2') || allFindings.includes('2nd degree type ii')) rhythm = 'Mobitz Type II';
  else if (allFindings.includes('first degree') || allFindings.includes('1st degree')) rhythm = 'First Degree Block';
  else if (allFindings.includes('junctional')) rhythm = 'Junctional Rhythm';
  else if (allFindings.includes('lbbb') || allFindings.includes('left bundle branch')) rhythm = 'LBBB';
  else if (allFindings.includes('rbbb') || allFindings.includes('right bundle branch')) rhythm = 'RBBB';
  else if (matchWord('bradycardia') || (vitals.pulse && vitals.pulse < 60)) rhythm = 'Sinus Bradycardia';
  else if (vitals.pulse && vitals.pulse > 100) rhythm = 'Sinus Tachycardia';

  // If pulse is 0 but no arrest rhythm was matched, default to Asystole.
  // Rationale: defaulting to VF was unsafe — it meant any un-tagged arrest
  // case became shockable-with-ROSC, even when the author intended a non-
  // shockable presentation. Asystole is the safer default: authors MUST
  // explicitly mark a case as VF (via initialRhythm, ecgFindings, or
  // subcategory) for it to be shockable.
  if (rhythm === 'Normal Sinus Rhythm' && vitals.pulse !== undefined && vitals.pulse === 0) {
    rhythm = 'Asystole';
  }

  const isInArrest = ['Ventricular Fibrillation', 'Asystole', 'PEA'].includes(rhythm) ||
    (vitals.pulse !== undefined && vitals.pulse === 0);

  // If in arrest, force vitals to arrest values — pulse 0, BP 0/0
  const arrestVitals = isInArrest ? {
    ...vitals,
    pulse: 0,
    bp: '0/0',
    respiration: 0,
    gcs: 3,
  } : vitals;

  return {
    vitals: { ...arrestVitals },
    sounds: getInitialSounds(caseData.category, caseData.subcategory, findings, {
      spo2: arrestVitals.spo2,
      pulse: arrestVitals.pulse,
      respiration: arrestVitals.respiration,
      gcs: arrestVitals.gcs,
    }),
    treatmentHistory: [],
    treatmentCounts: {},
    currentRhythm: rhythm,
    isInArrest,
    deteriorationLevel: isInArrest ? 4 : 0,
    timeWithoutTreatment: 0,
  };
}

// ============================================================================
// CORE TREATMENT APPLICATION
// ============================================================================

/**
 * Apply a treatment to the patient and return updated state + clinical response.
 * This is the main entry point for the treatment system.
 */
export function applyDynamicTreatment(
  treatment: Treatment,
  patientState: PatientState,
  caseData: CaseScenario,
  defibrillationParams?: DefibrillationParams,
): { newState: PatientState; response: ClinicalResponse } {
  const state = {
    ...patientState,
    vitals: { ...patientState.vitals },
    sounds: { ...patientState.sounds },
    treatmentCounts: { ...patientState.treatmentCounts },
    treatmentHistory: [...patientState.treatmentHistory],
  };

  const vitalsBefore = { ...state.vitals };
  const soundsBefore = { ...state.sounds };
  const caseCategory = caseData.category.toLowerCase();
  const caseSubcategory = (caseData.subcategory || '').toLowerCase();

  // Update treatment count
  state.treatmentCounts[treatment.id] = (state.treatmentCounts[treatment.id] || 0) + 1;
  const count = state.treatmentCounts[treatment.id];

  // Reset deterioration timer on meaningful treatment
  if (treatment.effects.length > 0) {
    state.timeWithoutTreatment = 0;
  }

  // HYPOTHERMIA PROTOCOL: Block ALL medications when core temp < 30°C
  // Drug metabolism is severely impaired. Drugs accumulate to toxic levels.
  // Exception: CPR, airway, breathing, positioning, comfort treatments are allowed.
  const patientTemp = state.vitals.temperature ?? 37;
  const isSevereHypothermia = patientTemp < 30;
  if (isSevereHypothermia && treatment.category === 'medication' && treatment.id !== 'defibrillation') {
    return {
      newState: state,
      response: {
        description: `${treatment.name} WITHHELD — core temperature ${patientTemp}°C is below 30°C. All medications are withheld in severe hypothermia due to impaired drug metabolism and risk of toxic accumulation. Focus on CPR, active rewarming, and airway management. Resume medications once core temperature exceeds 30°C.`,
        effectivenessPercent: 0,
        isPartialResponse: false,
        requiresRepeat: false,
        warningMessage: 'Hypothermia protocol: Withhold all drugs below 30°C.',
        vitalChanges: [],
      },
    };
  }

  let response: ClinicalResponse;

  // Handle defibrillation separately — it has complex logic
  if (treatment.id === 'defibrillation' && defibrillationParams) {
    response = handleDefibrillation(state, defibrillationParams, caseCategory);
  } else {
    // Standard treatment logic with pathology-aware modifiers
    const appliedIds = Object.keys(state.treatmentCounts).filter(id => state.treatmentCounts[id] > 0);
    response = applyStandardTreatment(treatment, state, count, caseCategory, caseSubcategory, caseData, appliedIds);
  }

  // Update clinical sounds — pass all applied treatment IDs for combination awareness
  const allAppliedIds = Object.keys(state.treatmentCounts).filter(id => state.treatmentCounts[id] > 0);
  state.sounds = updateSoundsAfterTreatment(
    state.sounds, treatment.id, count, caseCategory,
    allAppliedIds, caseData.subcategory,
  );

  // Heart sound follows rhythm — when the rhythm has changed (e.g. shock
  // converted VF → Sinus Tachycardia, or deterioration dropped a patient
  // into AF), the auscultated heart sound must change with it. Skip when
  // the rhythm doesn't dictate a specific sound (normal sinus) so severity-
  // based defaults (muffled tamponade, gallop in CHF) still apply.
  const rhythmDictatedHeart = rhythmToHeartSound(state.currentRhythm);
  if (rhythmDictatedHeart && state.sounds.heartSound !== rhythmDictatedHeart) {
    state.sounds = { ...state.sounds, heartSound: rhythmDictatedHeart };
  }

  // CROSS-SYSTEM PHYSIOLOGY — adjust vitals based on multi-organ interactions
  applyCrossSystemPhysiology(treatment, state, caseData, response);

  // Record the application
  state.treatmentHistory.push({
    treatmentId: treatment.id,
    treatmentName: treatment.name,
    timestamp: Date.now(),
    count,
    vitalsBefore,
    vitalsAfter: { ...state.vitals },
    soundsBefore,
    soundsAfter: { ...state.sounds },
    clinicalResponse: response,
  });

  return { newState: state, response };
}

// ============================================================================
// STANDARD TREATMENT APPLICATION
// ============================================================================

function applyStandardTreatment(
  treatment: Treatment,
  state: PatientState,
  applicationCount: number,
  caseCategory: string,
  caseSubcategory: string,
  caseData?: CaseScenario,
  appliedTreatmentIds?: string[],
): ClinicalResponse {
  const vitals = state.vitals;
  const bp = parseBP(vitals.bp);
  const changes: VitalChange[] = [];
  let effectiveness = 100;
  let isPartial = false;
  let requiresRepeat = false;
  let warningMessage: string | undefined;
  let criticalEvent: CriticalEvent | undefined;

  // ===== DOSE-DEPENDENT EFFECTIVENESS =====
  // Diminishing returns on repeated doses of same treatment
  const diminishingFactor = applicationCount <= 1 ? 1.0
    : applicationCount === 2 ? 0.7
    : applicationCount === 3 ? 0.4
    : 0.2; // After 3rd dose, minimal additional effect

  // ===== PATHOLOGY-AWARE MODIFIERS =====
  // Get case-specific treatment effectiveness from the clinical realism engine
  let pathologyMultiplier = 1.0;
  let spo2Ceiling: number | undefined;
  let pathologyRationale: string | undefined;
  if (caseData && appliedTreatmentIds) {
    const pathologyResult = getTreatmentEffectivenessMultiplier(
      treatment.id, caseData, appliedTreatmentIds,
    );
    pathologyMultiplier = pathologyResult.multiplier;
    spo2Ceiling = pathologyResult.spo2Ceiling;
    pathologyRationale = pathologyResult.rationale;

    // If pathology makes this treatment nearly useless, add a warning
    if (pathologyMultiplier < 0.3 && pathologyRationale) {
      warningMessage = pathologyRationale;
    }
    // If pathology makes this treatment contraindicated (0.0), return immediately
    if (pathologyMultiplier === 0 && pathologyRationale) {
      return {
        description: `${treatment.name} applied but INEFFECTIVE for this condition. ${pathologyRationale}`,
        effectivenessPercent: 0,
        isPartialResponse: false,
        requiresRepeat: false,
        warningMessage: pathologyRationale,
        vitalChanges: [],
      };
    }
  }

  // ===== TREATMENT PROTOCOL SYNERGY =====
  // Check if a severity-aware protocol exists and apply synergy multipliers
  let protocolSynergyMultiplier = 1.0;
  let protocolSeverity: SeverityProtocol | undefined;
  if (caseData) {
    const protocol = findProtocol(caseSubcategory || '', caseCategory);
    if (protocol) {
      protocolSeverity = determineSeverityFromVitals(protocol, vitals);
      if (protocolSeverity && appliedTreatmentIds) {
        const synergy = getSynergyMultiplier(protocolSeverity, appliedTreatmentIds);
        protocolSynergyMultiplier = synergy.multiplier;

        // Check for contraindicated treatments
        if (protocolSeverity.contraindicatedTreatments.includes(treatment.id)) {
          warningMessage = `CAUTION: ${treatment.name} may be contraindicated in ${protocolSeverity.severity} ${protocol.conditionName}`;
        }

        // Apply positioning effects
        const posEffect = getPositioningEffects(protocolSeverity, appliedTreatmentIds || []);
        if (posEffect) {
          // Positioning bonus applied to SpO2 and RR
          if (posEffect.spo2Bonus !== 0) {
            const oldSpO2 = vitals.spo2;
            vitals.spo2 = Math.max(0, Math.min(100, vitals.spo2 + posEffect.spo2Bonus));
            if (vitals.spo2 !== oldSpO2) {
              changes.push({
                vital: 'SpO2', oldValue: `${oldSpO2}%`, newValue: `${vitals.spo2}%`,
                direction: vitals.spo2 > oldSpO2 ? 'improved' : 'worsened',
              });
            }
          }
          if (posEffect.rrReduction !== 0 && vitals.respiration > 12) {
            const oldRR = vitals.respiration;
            vitals.respiration = Math.max(10, vitals.respiration - posEffect.rrReduction);
            if (vitals.respiration !== oldRR) {
              changes.push({
                vital: 'RR', oldValue: oldRR, newValue: vitals.respiration,
                direction: Math.abs(vitals.respiration - 16) < Math.abs(oldRR - 16) ? 'improved' : 'worsened',
              });
            }
          }
        }
      }
    }
  }

  // ===== CASE-SPECIFIC EFFECTIVENESS MODIFIERS =====
  let categoryModifier = 1.0;

  // Salbutamol is much more effective for respiratory cases
  if (treatment.id === 'nebulizer_salbutamol') {
    if (caseCategory === 'respiratory' && (caseSubcategory.includes('asthma') || caseSubcategory.includes('copd'))) {
      categoryModifier = 1.5; // Very effective
      // But needs multiple doses for severe cases
      if (applicationCount === 1 && vitals.respiration > 28) {
        isPartial = true;
        requiresRepeat = true;
        effectiveness = 40;
      } else if (applicationCount === 2 && vitals.respiration > 22) {
        isPartial = true;
        requiresRepeat = true;
        effectiveness = 65;
      } else {
        effectiveness = 90;
      }
    } else {
      categoryModifier = 0.3; // Limited effect on non-respiratory cases
      effectiveness = 20;
    }
  }

  // Adrenaline — case-dependent
  if (treatment.id === 'adrenaline_1mg') {
    if (state.isInArrest) {
      categoryModifier = 1.0;
      effectiveness = 80;

      // ROSC pathway for non-shockable rhythms (Asystole/PEA) after repeated adrenaline + CPR
      const isNonShockable = state.currentRhythm === 'Asystole' || state.currentRhythm === 'PEA';
      if (isNonShockable && applicationCount >= 2) {
        // Probability of ROSC increases with each adrenaline dose. Tuned so
        // dose 2 + active CPR reliably converts — feedback was that the
        // simulation didn't feel responsive when the student was doing
        // everything right.
        const roscChance = applicationCount === 2 ? 0.45
          : applicationCount === 3 ? 0.70
          : 0.85; // 4th dose and beyond

        // Deterministic ROSC trigger. We consider the student's effort
        // adequate if treatments have been flowing (timeWithoutTreatment
        // < 45 s — set while CPR is running or any treatment is applied).
        const cprActive = state.timeWithoutTreatment < 45;
        const shouldROSC = roscChance >= 0.50 || (roscChance >= 0.30 && cprActive);

        if (shouldROSC) {
          // ROSC achieved on non-shockable rhythm
          const roscHR = 90 + Math.floor(applicationCount * 5); // 95-110 range
          const roscSpO2 = 85 + Math.floor(applicationCount * 2); // 87-92 range
          const oldPulse = vitals.pulse;
          const oldBP = vitals.bp;
          const oldSpO2 = vitals.spo2;

          vitals.pulse = Math.min(110, roscHR);
          vitals.bp = '90/60';
          vitals.spo2 = Math.min(92, roscSpO2);
          vitals.respiration = 8;
          state.isInArrest = false;
          state.currentRhythm = 'Sinus Tachycardia';
          state.deteriorationLevel = 2;

          changes.push(
            { vital: 'HR', oldValue: oldPulse, newValue: vitals.pulse, direction: 'improved' },
            { vital: 'BP', oldValue: oldBP, newValue: '90/60', direction: 'improved' },
            { vital: 'SpO2', oldValue: `${oldSpO2}%`, newValue: `${vitals.spo2}%`, direction: 'improved' },
          );

          return {
            description: `Adrenaline 1mg IV (dose ${applicationCount}) — ROSC achieved! ${state.currentRhythm} restored. HR ${vitals.pulse}, BP 90/60, SpO2 ${vitals.spo2}%. Continue post-ROSC care.`,
            effectivenessPercent: 100,
            isPartialResponse: false,
            requiresRepeat: false,
            criticalEvent: {
              type: 'rosc',
              description: `Return of Spontaneous Circulation achieved after ${applicationCount} doses of adrenaline on ${isNonShockable ? state.currentRhythm : 'non-shockable rhythm'}.`,
              newRhythm: 'Sinus Tachycardia',
              requiresAction: ['Continue ventilation', 'IV access', 'Post-ROSC care bundle', '12-lead ECG', 'Targeted temperature management'],
            },
            vitalChanges: changes,
          };
        }
      }
    } else if (caseSubcategory.includes('anaphylaxis') || caseCategory === 'environmental') {
      categoryModifier = 2.0; // Life-saving in anaphylaxis
      effectiveness = 95;
    } else {
      categoryModifier = 0.5;
      warningMessage = 'Adrenaline given to non-arrest patient — monitor for adverse effects';
    }
  }

  // GTN — contraindicated in hypotension
  if (treatment.id === 'gtn_spray') {
    if (bp.systolic < 90) {
      // WRONG ACTION: GTN in hypotension
      criticalEvent = {
        type: 'adverse-reaction',
        description: 'GTN given to hypotensive patient! BP dropping further.',
        requiresAction: ['Stop GTN immediately', 'Position supine', 'IV fluid bolus', 'Monitor BP closely'],
      };
      // Worsen the BP
      bp.systolic = Math.max(50, bp.systolic - 20);
      bp.diastolic = Math.max(30, bp.diastolic - 15);
      vitals.pulse = Math.min(160, vitals.pulse + 20);
      vitals.bp = formatBP(bp.systolic, bp.diastolic);
      changes.push(
        { vital: 'BP', oldValue: vitals.bp, newValue: formatBP(bp.systolic, bp.diastolic), direction: 'worsened' },
        { vital: 'HR', oldValue: vitals.pulse - 20, newValue: vitals.pulse, direction: 'worsened' },
      );
      effectiveness = 0;

      return {
        description: 'ADVERSE EVENT: GTN administered to hypotensive patient. Blood pressure dropped significantly. Reflex tachycardia.',
        effectivenessPercent: 0,
        isPartialResponse: false,
        requiresRepeat: false,
        warningMessage: 'CONTRAINDICATED: Systolic BP was below 90mmHg!',
        criticalEvent,
        vitalChanges: changes,
      };
    }
  }

  // Morphine/Fentanyl — respiratory depression risk
  if (treatment.id === 'morphine_5mg' || treatment.id === 'fentanyl_50mcg') {
    if (vitals.respiration <= 10) {
      criticalEvent = {
        type: 'adverse-reaction',
        description: 'Opioid given to patient with respiratory depression! RR dropping dangerously low.',
        requiresAction: ['Consider Naloxone', 'Bag-valve-mask ventilation', 'Monitor SpO2'],
      };
      vitals.respiration = Math.max(4, vitals.respiration - 4);
      vitals.spo2 = Math.max(60, vitals.spo2 - 10);
      effectiveness = 0;
      warningMessage = 'CAUTION: Patient already had respiratory depression';
    }
  }

  // ===== APPLY TREATMENT EFFECTS =====
  const effectMultiplier = diminishingFactor * categoryModifier * pathologyMultiplier * protocolSynergyMultiplier;

  treatment.effects.forEach(effect => {
    const adjustedValue = effect.value * effectMultiplier;

    switch (effect.vitalSign) {
      case 'bp': {
        const oldBP = formatBP(bp.systolic, bp.diastolic);
        if (effect.changeType === 'increase') {
          bp.systolic = clamp(bp.systolic + adjustedValue, effect.minValue || 60, effect.maxValue || 250);
          bp.diastolic = clamp(bp.diastolic + adjustedValue * 0.6, 30, 130);
        } else if (effect.changeType === 'decrease') {
          bp.systolic = clamp(bp.systolic - adjustedValue, effect.minValue || 60, effect.maxValue || 250);
          bp.diastolic = clamp(bp.diastolic - adjustedValue * 0.6, 30, 130);
        } else if (effect.changeType === 'set') {
          const target = effect.value;
          bp.systolic = bp.systolic + (target - bp.systolic) * effectMultiplier;
          bp.diastolic = bp.diastolic + ((target * 0.67) - bp.diastolic) * effectMultiplier;
        } else if (effect.changeType === 'stabilize') {
          if (bp.systolic < 90) bp.systolic += (90 - bp.systolic) * 0.3 * effectMultiplier;
          else if (bp.systolic > 180) bp.systolic -= (bp.systolic - 160) * 0.3 * effectMultiplier;
        }
        vitals.bp = formatBP(Math.round(bp.systolic), Math.round(bp.diastolic));
        if (vitals.bp !== oldBP) {
          changes.push({
            vital: 'BP', oldValue: oldBP, newValue: vitals.bp,
            direction: bp.systolic > parseBP(oldBP).systolic ? 'improved' : 'worsened'
          });
        }
        break;
      }

      case 'pulse': {
        const oldPulse = vitals.pulse;
        if (effect.changeType === 'increase') {
          vitals.pulse = Math.round(clamp(vitals.pulse + adjustedValue, effect.minValue || 40, effect.maxValue || 200));
        } else if (effect.changeType === 'decrease') {
          vitals.pulse = Math.round(clamp(vitals.pulse - adjustedValue, effect.minValue || 40, effect.maxValue || 200));
        } else if (effect.changeType === 'set') {
          vitals.pulse = Math.round(vitals.pulse + (effect.value - vitals.pulse) * effectMultiplier);
        }
        if (vitals.pulse !== oldPulse) {
          const normalRange = vitals.pulse >= 60 && vitals.pulse <= 100;
          const wasNormal = oldPulse >= 60 && oldPulse <= 100;
          changes.push({
            vital: 'HR', oldValue: oldPulse, newValue: vitals.pulse,
            direction: normalRange && !wasNormal ? 'improved' : Math.abs(vitals.pulse - 80) < Math.abs(oldPulse - 80) ? 'improved' : 'worsened'
          });
        }
        break;
      }

      case 'respiration': {
        const oldRR = vitals.respiration;
        if (effect.changeType === 'increase') {
          vitals.respiration = Math.round(clamp(vitals.respiration + adjustedValue, effect.minValue || 6, effect.maxValue || 50));
        } else if (effect.changeType === 'decrease') {
          vitals.respiration = Math.round(clamp(vitals.respiration - adjustedValue, effect.minValue || 8, effect.maxValue || 50));
        } else if (effect.changeType === 'set') {
          vitals.respiration = Math.round(vitals.respiration + (effect.value - vitals.respiration) * effectMultiplier);
        } else if (effect.changeType === 'stabilize') {
          if (vitals.respiration > 24) vitals.respiration -= Math.round((vitals.respiration - 18) * 0.3 * effectMultiplier);
          else if (vitals.respiration < 10) vitals.respiration += Math.round((12 - vitals.respiration) * 0.3 * effectMultiplier);
        }
        if (vitals.respiration !== oldRR) {
          changes.push({
            vital: 'RR', oldValue: oldRR, newValue: vitals.respiration,
            direction: Math.abs(vitals.respiration - 16) < Math.abs(oldRR - 16) ? 'improved' : 'worsened'
          });
        }
        break;
      }

      case 'spo2': {
        const oldSpO2 = vitals.spo2;
        // Apply pathology-based SpO2 ceiling (e.g., COPD 88-92%, tension PTX limited until decompressed)
        const effectiveMaxSpo2 = spo2Ceiling !== undefined ? Math.min(spo2Ceiling, effect.maxValue || 100) : (effect.maxValue || 100);
        if (effect.changeType === 'increase') {
          vitals.spo2 = Math.round(clamp(vitals.spo2 + adjustedValue, effect.minValue || 60, effectiveMaxSpo2));
        } else if (effect.changeType === 'set') {
          const target = spo2Ceiling !== undefined ? Math.min(effect.value, spo2Ceiling) : effect.value;
          vitals.spo2 = Math.round(vitals.spo2 + (target - vitals.spo2) * effectMultiplier);
        }
        if (vitals.spo2 !== oldSpO2) {
          changes.push({
            vital: 'SpO2', oldValue: `${oldSpO2}%`, newValue: `${vitals.spo2}%`,
            direction: vitals.spo2 > oldSpO2 ? 'improved' : 'worsened'
          });
        }
        break;
      }

      case 'gcs': {
        const oldGCS = vitals.gcs || 15;
        if (effect.changeType === 'increase') {
          vitals.gcs = Math.round(clamp(oldGCS + adjustedValue, effect.minValue || 3, effect.maxValue || 15));
        } else if (effect.changeType === 'decrease') {
          vitals.gcs = Math.round(clamp(oldGCS - adjustedValue, effect.minValue || 3, effect.maxValue || 15));
        } else if (effect.changeType === 'set') {
          vitals.gcs = Math.round(oldGCS + (effect.value - oldGCS) * effectMultiplier);
        }
        if (vitals.gcs !== oldGCS) {
          changes.push({
            vital: 'GCS', oldValue: oldGCS, newValue: vitals.gcs!,
            direction: vitals.gcs! > oldGCS ? 'improved' : 'worsened'
          });
        }
        break;
      }

      case 'bloodGlucose': {
        const oldBG = vitals.bloodGlucose || 5.5;
        if (effect.changeType === 'increase') {
          vitals.bloodGlucose = Math.round(clamp(oldBG + adjustedValue, effect.minValue || 1, effect.maxValue || 30) * 10) / 10;
        } else if (effect.changeType === 'decrease') {
          vitals.bloodGlucose = Math.round(clamp(oldBG - adjustedValue, effect.minValue || 1, effect.maxValue || 30) * 10) / 10;
        }
        if (vitals.bloodGlucose !== oldBG) {
          changes.push({
            vital: 'Glucose', oldValue: `${oldBG}`, newValue: `${vitals.bloodGlucose}`,
            direction: Math.abs(vitals.bloodGlucose - 5.5) < Math.abs(oldBG - 5.5) ? 'improved' : 'worsened'
          });
        }
        break;
      }

      case 'temperature': {
        const oldTemp = vitals.temperature || 36.5;
        if (effect.changeType === 'increase') {
          vitals.temperature = Math.round(clamp(oldTemp + adjustedValue, effect.minValue || 34, effect.maxValue || 42) * 10) / 10;
        } else if (effect.changeType === 'decrease') {
          vitals.temperature = Math.round(clamp(oldTemp - adjustedValue, effect.minValue || 34, effect.maxValue || 42) * 10) / 10;
        }
        if (vitals.temperature !== oldTemp) {
          changes.push({
            vital: 'Temp', oldValue: `${oldTemp}°C`, newValue: `${vitals.temperature}°C`,
            direction: Math.abs(vitals.temperature - 37) < Math.abs(oldTemp - 37) ? 'improved' : 'worsened'
          });
        }
        break;
      }
    }
  });

  // Build response description
  const improvementCount = changes.filter(c => c.direction === 'improved').length;
  const worsenedCount = changes.filter(c => c.direction === 'worsened').length;

  // Check for active synergies to mention in description
  let synergyNote = '';
  if (protocolSeverity && appliedTreatmentIds) {
    const synResult = getSynergyMultiplier(protocolSeverity, appliedTreatmentIds);
    if (synResult.activeSynergies.length > 0) {
      const bestSynergy = synResult.activeSynergies[synResult.activeSynergies.length - 1];
      synergyNote = ` ${bestSynergy.description}.`;
    }
  }

  let description: string;
  if (changes.length === 0) {
    description = `${treatment.name} applied. No immediate vital sign changes.`;
    if (treatment.id === 'iv_access') description = 'IV access established. Ready for medication administration.';
    if (treatment.id === 'bleeding_control') description = 'Bleeding controlled with direct pressure. Hemostasis achieved.';
  } else if (isPartial) {
    description = `${treatment.name} applied (dose ${applicationCount}). Partial response — ${improvementCount} vitals improving. Consider repeat dose.${synergyNote}`;
  } else if (improvementCount > 0 && worsenedCount === 0) {
    description = `${treatment.name} applied. Good clinical response — ${changes.map(c => `${c.vital}: ${c.oldValue} → ${c.newValue}`).join(', ')}.${synergyNote}`;
  } else if (worsenedCount > 0 && improvementCount === 0) {
    description = `${treatment.name} applied. Adverse response noted — ${changes.map(c => `${c.vital}: ${c.oldValue} → ${c.newValue}`).join(', ')}.`;
  } else {
    description = `${treatment.name} applied. Mixed response — ${changes.map(c => `${c.vital}: ${c.oldValue} → ${c.newValue}`).join(', ')}.${synergyNote}`;
  }

  return {
    description,
    effectivenessPercent: Math.round(effectiveness * effectMultiplier),
    isPartialResponse: isPartial,
    requiresRepeat,
    warningMessage,
    criticalEvent,
    vitalChanges: changes,
  };
}

// ============================================================================
// DEFIBRILLATION LOGIC
// ============================================================================

function handleDefibrillation(
  state: PatientState,
  params: DefibrillationParams,
  caseCategory: string,
): ClinicalResponse {
  const vitals = state.vitals;
  const changes: VitalChange[] = [];
  const { energy, synchronized, currentRhythm } = params;

  // ---- SAFETY GUARD (non-shockable short-circuit) ----
  // Defensive check ahead of all rhythm branches: if the rhythm label
  // contains "asystole" or "pea" (case-insensitive), this patient MUST
  // NOT convert to ROSC from a shock. A stray label mismatch upstream —
  // e.g. keyword detection picking "VF" out of a differentials list for
  // a narrative-asystole case — once produced the critical bug where
  // shocking flatline restored a perfusing rhythm. Catch that here at
  // the defib boundary so it's impossible to get there.
  const rhythmLower = (currentRhythm || '').toLowerCase();
  const looksNonShockable =
    rhythmLower.includes('asystole') ||
    rhythmLower.includes('pea') ||
    rhythmLower.includes('pulseless electrical');
  if (looksNonShockable) {
    return {
      description: `Shock delivered but ${currentRhythm || 'the displayed rhythm'} is a NON-SHOCKABLE rhythm. Defibrillation is NOT indicated. Resume high-quality CPR immediately and give Adrenaline 1mg IV every 3–5 minutes. Search for reversible causes (4H's & 4T's).`,
      effectivenessPercent: 0,
      isPartialResponse: false,
      requiresRepeat: false,
      warningMessage: `${currentRhythm} is non-shockable — do NOT defibrillate`,
      criticalEvent: {
        type: 'adverse-reaction',
        description: `Shock delivered on ${currentRhythm}. This is incorrect management — asystole and PEA are never shocked.`,
        requiresAction: [
          'Resume CPR immediately (minimise pause <10 s)',
          'Adrenaline 1mg IV every 3–5 min',
          'Identify reversible causes (4H & 4T)',
          'Rhythm check at next 2-min cycle',
        ],
      },
      vitalChanges: [],
    };
  }

  // HYPOTHERMIA PROTOCOL: Limit defibrillation when core temp < 30°C
  // Give up to 3 shocks, then withhold until rewarmed above 30°C
  const coreTemp = vitals.temperature ?? 37;
  const shocksSoFar = state.treatmentCounts['defibrillation'] || 0;
  if (coreTemp < 30 && shocksSoFar >= 3) {
    return {
      description: `Defibrillation WITHHELD — core temperature ${coreTemp}°C. Maximum 3 shocks have been delivered in severe hypothermia (<30°C). The myocardium is refractory to defibrillation when cold. Continue CPR and focus on active rewarming. Attempt further shocks once core temp exceeds 30°C.`,
      effectivenessPercent: 0,
      isPartialResponse: false,
      requiresRepeat: false,
      warningMessage: 'Hypothermia: max 3 shocks below 30°C. Rewarm before further attempts.',
      vitalChanges: [],
    };
  }

  // === SHOCKABLE RHYTHMS ===
  // VF: Defibrillation (unsynchronized) is correct
  if (currentRhythm === 'Ventricular Fibrillation') {
    if (synchronized) {
      // Synchronized cardioversion on VF — less effective but not harmful
      return {
        description: 'Synchronized cardioversion attempted on VF — sync may fail to identify R wave. Consider unsynchronized shock.',
        effectivenessPercent: 30,
        isPartialResponse: true,
        requiresRepeat: true,
        warningMessage: 'VF should be treated with unsynchronized defibrillation',
        vitalChanges: [],
      };
    }

    // Success depends on energy level and how many shocks already given
    const shockCount = state.treatmentCounts['defibrillation'] || 1;
    let successChance: number;

    if (energy >= 200) successChance = shockCount <= 2 ? 0.85 : 0.6;
    else if (energy >= 150) successChance = shockCount <= 2 ? 0.7 : 0.5;
    else if (energy >= 100) successChance = shockCount <= 2 ? 0.5 : 0.35;
    else successChance = shockCount <= 2 ? 0.3 : 0.2;

    // Simulate success/failure (deterministic based on energy + count for reproducibility)
    const isSuccessful = energy >= 150 || (energy >= 100 && shockCount >= 2);

    if (isSuccessful) {
      // ROSC!
      vitals.pulse = 80;
      vitals.bp = '100/65';
      vitals.spo2 = Math.min(98, (vitals.spo2 || 60) + 30);
      state.isInArrest = false;
      state.currentRhythm = 'Sinus Tachycardia';
      state.deteriorationLevel = 1;

      changes.push(
        { vital: 'HR', oldValue: 0, newValue: 80, direction: 'improved' },
        { vital: 'BP', oldValue: '0/0', newValue: '100/65', direction: 'improved' },
        { vital: 'SpO2', oldValue: `${vitals.spo2 - 30}%`, newValue: `${vitals.spo2}%`, direction: 'improved' },
      );

      return {
        description: `Defibrillation at ${energy}J — VF terminated! ROSC achieved. Sinus rhythm restored. Continue post-ROSC care.`,
        effectivenessPercent: 100,
        isPartialResponse: false,
        requiresRepeat: false,
        criticalEvent: {
          type: 'rosc',
          description: 'Return of Spontaneous Circulation achieved!',
          newRhythm: 'Sinus Tachycardia',
          requiresAction: ['Continue ventilation', 'IV access', 'Post-ROSC care bundle', '12-lead ECG', 'Targeted temperature management'],
        },
        vitalChanges: changes,
      };
    } else {
      // Shock delivered but VF persists
      return {
        description: `Defibrillation at ${energy}J — shock delivered. VF persists. Continue CPR for 2 minutes, then reassess rhythm. Consider increasing energy.`,
        effectivenessPercent: 20,
        isPartialResponse: true,
        requiresRepeat: true,
        warningMessage: energy < 150 ? `Consider increasing energy to 150-200J` : undefined,
        vitalChanges: [],
      };
    }
  }

  // VT with pulse: Synchronized cardioversion is correct
  if (currentRhythm === 'Ventricular Tachycardia') {
    if (!synchronized) {
      // WRONG ACTION: Unsynchronized shock on VT with pulse → may cause VF!
      state.currentRhythm = 'Ventricular Fibrillation';
      state.isInArrest = true;
      state.deteriorationLevel = 4;
      vitals.pulse = 0;
      vitals.bp = '0/0';
      vitals.spo2 = Math.max(40, (vitals.spo2 || 94) - 40);

      changes.push(
        { vital: 'HR', oldValue: vitals.pulse, newValue: 0, direction: 'worsened' },
        { vital: 'BP', oldValue: vitals.bp, newValue: '0/0', direction: 'worsened' },
      );

      return {
        description: `CRITICAL: Unsynchronized shock delivered to patient in VT! Patient has degenerated into Ventricular Fibrillation. Cardiac arrest! Begin CPR immediately.`,
        effectivenessPercent: 0,
        isPartialResponse: false,
        requiresRepeat: false,
        warningMessage: 'VT with a pulse requires SYNCHRONIZED cardioversion!',
        criticalEvent: {
          type: 'cardiac-arrest',
          description: 'Unsynchronized shock on VT caused degeneration to VF. Patient now in cardiac arrest.',
          newRhythm: 'Ventricular Fibrillation',
          requiresAction: ['Start CPR immediately', 'Prepare for defibrillation', 'Adrenaline 1mg IV', 'Amiodarone 300mg IV'],
        },
        vitalChanges: changes,
      };
    }

    // Correct: Synchronized cardioversion on VT
    const isSuccessful = energy >= 100 || (energy >= 50 && (state.treatmentCounts['defibrillation'] || 1) >= 2);

    if (isSuccessful) {
      const oldPulse = vitals.pulse;
      const oldBP = vitals.bp;
      state.currentRhythm = 'Normal Sinus Rhythm';
      vitals.pulse = 78;
      vitals.bp = '110/70';
      state.deteriorationLevel = Math.max(0, state.deteriorationLevel - 2);

      changes.push(
        { vital: 'HR', oldValue: oldPulse, newValue: 78, direction: 'improved' },
        { vital: 'BP', oldValue: oldBP, newValue: '110/70', direction: 'improved' },
      );

      return {
        description: `Synchronized cardioversion at ${energy}J successful! VT converted to normal sinus rhythm. HR 78, BP 110/70.`,
        effectivenessPercent: 100,
        isPartialResponse: false,
        requiresRepeat: false,
        criticalEvent: {
          type: 'rhythm-change',
          description: 'VT successfully cardioverted to normal sinus rhythm.',
          newRhythm: 'Normal Sinus Rhythm',
          requiresAction: ['Continue monitoring', 'Consider Amiodarone for maintenance', '12-lead ECG'],
        },
        vitalChanges: changes,
      };
    } else {
      return {
        description: `Synchronized cardioversion at ${energy}J — VT persists. Increase energy and retry. Consider Amiodarone 300mg IV.`,
        effectivenessPercent: 20,
        isPartialResponse: true,
        requiresRepeat: true,
        warningMessage: energy < 100 ? 'Consider increasing to 100J or higher' : undefined,
        vitalChanges: [],
      };
    }
  }

  // SVT: Synchronized cardioversion (low energy preferred: 50-100J)
  if (currentRhythm === 'SVT') {
    if (!synchronized) {
      return {
        description: `Unsynchronized shock delivered to SVT patient. Risk of inducing VF! Use SYNCHRONIZED cardioversion for SVT.`,
        effectivenessPercent: 10,
        isPartialResponse: false,
        requiresRepeat: false,
        warningMessage: 'SVT requires SYNCHRONIZED cardioversion!',
        vitalChanges: [],
      };
    }

    // Synchronized cardioversion — successful at 50-100J, also works at higher energy
    const isSuccessful = energy >= 50;

    if (isSuccessful) {
      const oldPulse = vitals.pulse;
      state.currentRhythm = 'Normal Sinus Rhythm';
      vitals.pulse = 80;
      state.deteriorationLevel = Math.max(0, state.deteriorationLevel - 2);

      return {
        description: `Synchronized cardioversion at ${energy}J — SVT terminated. Normal sinus rhythm restored at 80 bpm.${energy > 100 ? ' Note: Lower energy (50-100J) is typically sufficient for SVT.' : ''}`,
        effectivenessPercent: energy <= 100 ? 95 : 85,
        isPartialResponse: false,
        requiresRepeat: false,
        criticalEvent: {
          type: 'rhythm-change',
          description: 'SVT successfully cardioverted to normal sinus rhythm.',
          newRhythm: 'Normal Sinus Rhythm',
          requiresAction: ['Monitor for SVT recurrence', 'Consider Adenosine if recurs'],
        },
        warningMessage: energy > 100 ? 'SVT typically cardioverts at 50-100J — consider lower energy' : undefined,
        vitalChanges: [{ vital: 'HR', oldValue: oldPulse, newValue: 80, direction: 'improved' }],
      };
    } else {
      return {
        description: `Synchronized cardioversion at ${energy}J — SVT persists. Increase energy to 50-100J.`,
        effectivenessPercent: 15,
        isPartialResponse: true,
        requiresRepeat: true,
        warningMessage: 'Consider increasing energy to 50-100J for SVT',
        vitalChanges: [],
      };
    }
  }

  // Atrial Flutter: Synchronized cardioversion
  if (currentRhythm === 'Atrial Flutter') {
    if (!synchronized) {
      return {
        description: `Unsynchronized shock delivered to atrial flutter patient. Risk of inducing VF! Use SYNCHRONIZED cardioversion for atrial flutter.`,
        effectivenessPercent: 10,
        isPartialResponse: false,
        requiresRepeat: false,
        warningMessage: 'Atrial flutter requires SYNCHRONIZED cardioversion!',
        vitalChanges: [],
      };
    }

    // Synchronized cardioversion — effective at relatively low energy (50-100J typically)
    const isSuccessful = energy >= 50 || (energy >= 25 && (state.treatmentCounts['defibrillation'] || 1) >= 2);

    if (isSuccessful) {
      const oldPulse = vitals.pulse;
      state.currentRhythm = 'Normal Sinus Rhythm';
      vitals.pulse = 78;
      const oldBP = vitals.bp;
      vitals.bp = '120/75';
      state.deteriorationLevel = Math.max(0, state.deteriorationLevel - 2);

      changes.push(
        { vital: 'HR', oldValue: oldPulse, newValue: 78, direction: 'improved' },
        { vital: 'BP', oldValue: oldBP, newValue: '120/75', direction: 'improved' },
      );

      return {
        description: `Synchronized cardioversion at ${energy}J — atrial flutter terminated. Normal sinus rhythm restored at 78 bpm.`,
        effectivenessPercent: 100,
        isPartialResponse: false,
        requiresRepeat: false,
        criticalEvent: {
          type: 'rhythm-change',
          description: 'Atrial flutter successfully cardioverted to normal sinus rhythm.',
          newRhythm: 'Normal Sinus Rhythm',
          requiresAction: ['Continue monitoring', 'Consider rate/rhythm control maintenance', '12-lead ECG post-cardioversion'],
        },
        vitalChanges: changes,
      };
    } else {
      return {
        description: `Synchronized cardioversion at ${energy}J — atrial flutter persists. Consider increasing energy (50-100J for flutter).`,
        effectivenessPercent: 20,
        isPartialResponse: true,
        requiresRepeat: true,
        warningMessage: energy < 50 ? 'Consider increasing to 50-100J for atrial flutter' : undefined,
        vitalChanges: [],
      };
    }
  }

  // Atrial Fibrillation: Synchronized cardioversion (hemodynamically unstable)
  if (currentRhythm === 'Atrial Fibrillation') {
    if (!synchronized) {
      return {
        description: `Unsynchronized shock delivered to atrial fibrillation patient. Risk of inducing VF! Use SYNCHRONIZED cardioversion.`,
        effectivenessPercent: 10,
        isPartialResponse: false,
        requiresRepeat: false,
        warningMessage: 'Atrial fibrillation requires SYNCHRONIZED cardioversion!',
        vitalChanges: [],
      };
    }

    const isSuccessful = energy >= 120 || (energy >= 100 && (state.treatmentCounts['defibrillation'] || 1) >= 2);

    if (isSuccessful) {
      const oldPulse = vitals.pulse;
      state.currentRhythm = 'Normal Sinus Rhythm';
      vitals.pulse = 76;
      const oldBP = vitals.bp;
      vitals.bp = '118/72';
      state.deteriorationLevel = Math.max(0, state.deteriorationLevel - 2);

      changes.push(
        { vital: 'HR', oldValue: oldPulse, newValue: 76, direction: 'improved' },
        { vital: 'BP', oldValue: oldBP, newValue: '118/72', direction: 'improved' },
      );

      return {
        description: `Synchronized cardioversion at ${energy}J — atrial fibrillation terminated. Normal sinus rhythm restored at 76 bpm.`,
        effectivenessPercent: 100,
        isPartialResponse: false,
        requiresRepeat: false,
        criticalEvent: {
          type: 'rhythm-change',
          description: 'Atrial fibrillation successfully cardioverted to normal sinus rhythm.',
          newRhythm: 'Normal Sinus Rhythm',
          requiresAction: ['Continue monitoring', 'Anticoagulation assessment', 'Rate/rhythm control maintenance'],
        },
        vitalChanges: changes,
      };
    } else {
      return {
        description: `Synchronized cardioversion at ${energy}J — AF persists. Consider increasing energy (120-200J for AF).`,
        effectivenessPercent: 20,
        isPartialResponse: true,
        requiresRepeat: true,
        warningMessage: energy < 120 ? 'Consider increasing to 120-200J for atrial fibrillation' : undefined,
        vitalChanges: [],
      };
    }
  }

  // Non-shockable rhythm (Asystole, PEA)
  if (['Asystole', 'PEA'].includes(currentRhythm)) {
    return {
      description: `Shock delivered but ${currentRhythm} is a NON-SHOCKABLE rhythm! Defibrillation is not indicated. Continue CPR and give Adrenaline.`,
      effectivenessPercent: 0,
      isPartialResponse: false,
      requiresRepeat: false,
      warningMessage: `${currentRhythm} is non-shockable — do NOT defibrillate`,
      criticalEvent: {
        type: 'adverse-reaction',
        description: `Shock delivered to patient in ${currentRhythm}. This is incorrect management.`,
        requiresAction: ['Continue high-quality CPR', 'Adrenaline 1mg IV every 3-5 minutes', 'Identify reversible causes (4Hs and 4Ts)'],
      },
      vitalChanges: [],
    };
  }

  // Normal/other rhythm — HARMFUL: shock causes arrest
  const roll = Math.random();
  let arrestRhythm: string;
  if (roll < 0.7) arrestRhythm = 'Ventricular Fibrillation';
  else if (roll < 0.9) arrestRhythm = 'Asystole';
  else arrestRhythm = 'PEA';

  const oldPulse = vitals.pulse;
  const oldBP = vitals.bp;
  state.currentRhythm = arrestRhythm;
  state.isInArrest = true;
  state.deteriorationLevel = 4;
  vitals.pulse = 0;
  vitals.bp = '0/0';
  vitals.spo2 = Math.max(30, (vitals.spo2 || 98) - 55);

  changes.push(
    { vital: 'HR', oldValue: oldPulse, newValue: 0, direction: 'worsened' },
    { vital: 'BP', oldValue: oldBP, newValue: '0/0', direction: 'worsened' },
  );

  return {
    description: `CRITICAL: Shock delivered to patient with perfusing rhythm caused ${arrestRhythm}! Cardiac arrest — begin CPR immediately.`,
    effectivenessPercent: 0,
    isPartialResponse: false,
    requiresRepeat: false,
    warningMessage: 'Defibrillation is only indicated for VF/pulseless VT!',
    criticalEvent: {
      type: 'cardiac-arrest',
      description: `Inappropriate shock on perfusing rhythm caused ${arrestRhythm}. Patient now in cardiac arrest.`,
      newRhythm: arrestRhythm,
      requiresAction: ['Start CPR immediately', 'Prepare for defibrillation if VF', 'Adrenaline 1mg IV'],
    },
    vitalChanges: changes,
  };
}

// ============================================================================
// TIME-BASED DETERIORATION
// ============================================================================

/**
 * Apply time-based deterioration if patient is not being treated.
 * Uses case-specific staged deterioration timelines when available,
 * falling back to generic category-based deterioration.
 */
export function applyDeterioration(
  state: PatientState,
  caseData: CaseScenario,
  secondsElapsed: number,
): PatientState {
  const newState = {
    ...state,
    vitals: { ...state.vitals },
    sounds: { ...state.sounds },
    timeWithoutTreatment: state.timeWithoutTreatment + secondsElapsed,
  };

  // Only deteriorate if no treatment applied recently (>60 seconds)
  if (newState.timeWithoutTreatment < 60) return newState;

  const totalUntreatedMinutes = newState.timeWithoutTreatment / 60;

  // ===== CASE-SPECIFIC STAGED DETERIORATION =====
  // Use the clinically accurate staged timelines when available
  const stagedTimeline = getCaseDeteriorationTimeline(caseData);
  if (stagedTimeline.length > 0) {
    // Find the current deterioration stage based on elapsed untreated time
    let activeStage: DeteriorationStage | null = null;
    for (let i = stagedTimeline.length - 1; i >= 0; i--) {
      if (totalUntreatedMinutes >= stagedTimeline[i].triggerMinutes) {
        activeStage = stagedTimeline[i];
        break;
      }
    }

    if (activeStage) {
      const bp = parseBP(newState.vitals.bp);

      // Apply stage-specific vital changes
      if (activeStage.vitalChanges.pulse !== undefined) {
        newState.vitals.pulse = activeStage.vitalChanges.pulse;
      }
      if (activeStage.vitalChanges.spo2 !== undefined) {
        newState.vitals.spo2 = Math.max(0, activeStage.vitalChanges.spo2);
      }
      if (activeStage.vitalChanges.respiration !== undefined) {
        newState.vitals.respiration = activeStage.vitalChanges.respiration;
      }
      if (activeStage.vitalChanges.gcs !== undefined) {
        newState.vitals.gcs = activeStage.vitalChanges.gcs;
      }
      if (activeStage.vitalChanges.bloodGlucose !== undefined) {
        newState.vitals.bloodGlucose = activeStage.vitalChanges.bloodGlucose;
      }
      if (activeStage.vitalChanges.bpSystolicDelta !== undefined) {
        const initialBP = parseBP(caseData.vitalSignsProgression.initial.bp);
        bp.systolic = Math.max(0, initialBP.systolic + activeStage.vitalChanges.bpSystolicDelta);
        bp.diastolic = Math.max(0, bp.diastolic + (activeStage.vitalChanges.bpDiastolicDelta || activeStage.vitalChanges.bpSystolicDelta * 0.6));
        newState.vitals.bp = formatBP(Math.round(bp.systolic), Math.round(bp.diastolic));
      }

      // Apply rhythm change
      if (activeStage.rhythm) {
        newState.currentRhythm = activeStage.rhythm;
        if (['Ventricular Fibrillation', 'Asystole', 'PEA'].includes(activeStage.rhythm)) {
          newState.isInArrest = true;
        }
      }

      // Set deterioration level
      newState.deteriorationLevel = activeStage.isCritical ? 4 : Math.min(3, Math.ceil(totalUntreatedMinutes / 5));

      // Pulse = 0 means arrest
      if (newState.vitals.pulse === 0) {
        newState.isInArrest = true;
        newState.deteriorationLevel = 4;
      }

      return newState;
    }
  }

  // ===== FALLBACK: GENERIC CATEGORY-BASED DETERIORATION =====
  const cat = caseData.category.toLowerCase();
  const bp = parseBP(newState.vitals.bp);
  const deteriorationRate = Math.min(4, Math.floor(newState.timeWithoutTreatment / 120));

  // Arrest patients deteriorate fastest
  if (newState.isInArrest) {
    newState.vitals.spo2 = Math.max(0, newState.vitals.spo2 - 5);
    newState.deteriorationLevel = 4;
    return newState;
  }

  // Category-specific deterioration
  if (cat === 'respiratory') {
    newState.vitals.spo2 = Math.max(60, newState.vitals.spo2 - (2 + deteriorationRate));
    newState.vitals.respiration = Math.min(45, newState.vitals.respiration + (1 + deteriorationRate));
    newState.vitals.pulse = Math.min(180, newState.vitals.pulse + (3 + deteriorationRate));
  } else if (cat === 'cardiac' || cat === 'cardiac-ecg') {
    bp.systolic = Math.max(50, bp.systolic - (3 + deteriorationRate));
    bp.diastolic = Math.max(30, bp.diastolic - (2 + deteriorationRate));
    newState.vitals.bp = formatBP(bp.systolic, bp.diastolic);
    newState.vitals.pulse = Math.min(180, newState.vitals.pulse + (2 + deteriorationRate));
  } else if (cat === 'trauma') {
    bp.systolic = Math.max(40, bp.systolic - (4 + deteriorationRate * 2));
    bp.diastolic = Math.max(20, bp.diastolic - (3 + deteriorationRate));
    newState.vitals.bp = formatBP(bp.systolic, bp.diastolic);
    newState.vitals.pulse = Math.min(180, newState.vitals.pulse + (4 + deteriorationRate));
    newState.vitals.spo2 = Math.max(60, newState.vitals.spo2 - 1);
  } else {
    // General mild deterioration
    newState.vitals.pulse = Math.min(160, newState.vitals.pulse + 2);
    newState.vitals.spo2 = Math.max(80, newState.vitals.spo2 - 1);
  }

  newState.deteriorationLevel = Math.min(4, deteriorationRate);

  // Critical check: if vitals reach dangerous levels, flag cardiac arrest risk
  if (bp.systolic < 50 || newState.vitals.spo2 < 50 || newState.vitals.pulse > 180) {
    newState.deteriorationLevel = 4;
  }

  // Keep heart sound aligned with any rhythm change driven by deterioration
  // (e.g. normal sinus → VT → VF as the patient crashes).
  const deteriorationHeart = rhythmToHeartSound(newState.currentRhythm);
  if (deteriorationHeart && newState.sounds.heartSound !== deteriorationHeart) {
    newState.sounds = { ...newState.sounds, heartSound: deteriorationHeart };
  }

  return newState;
}

// ============================================================================
// CROSS-SYSTEM PHYSIOLOGY
// ============================================================================

/**
 * Apply realistic cross-system interactions after a treatment.
 *
 * Real patients don't respond in isolation — giving fluid to a heart failure
 * patient drops SpO2 because you've pushed them into pulmonary oedema.
 * Giving 100% O2 to a hypercapnic COPD patient can drop their respiratory drive.
 * Adrenaline causes tachycardia and hypertension and arrhythmia risk.
 *
 * This function adjusts vitals AFTER the treatment's primary effect has been
 * applied, modelling the second-order consequences.
 */
function applyCrossSystemPhysiology(
  treatment: Treatment,
  state: PatientState,
  caseData: CaseScenario,
  response: ClinicalResponse,
): void {
  const vitals = state.vitals;
  const sub = (caseData.subcategory || '').toLowerCase();
  const warnings: string[] = [];

  // --- 1. FLUID OVERLOAD IN HEART FAILURE ---
  // Giving IV fluids to a heart failure / pulmonary oedema patient worsens SpO2
  const isFluidBolus = treatment.id.includes('fluid') || treatment.id.includes('saline_bolus') || treatment.id.includes('hartmanns') || treatment.id.includes('crystalloid');
  const isHeartFailure = sub.includes('heart failure') || sub.includes('chf') || sub.includes('pulmonary oedema') || sub.includes('pulmonary edema');
  if (isFluidBolus && isHeartFailure) {
    const oldSpO2 = vitals.spo2;
    vitals.spo2 = Math.max(70, vitals.spo2 - 5);
    vitals.respiration = Math.min(40, vitals.respiration + 4);
    warnings.push(`Fluid bolus in heart failure — SpO2 dropped from ${oldSpO2}% to ${vitals.spo2}% as you've pushed the patient into worsening pulmonary oedema. Avoid IV fluids in CHF unless hypotensive.`);
  }

  // --- 2. HIGH-FLOW OXYGEN IN COPD ---
  // 100% O2 in a hypercapnic COPD patient can drop respiratory drive (CO2 retention)
  const isHighFlowO2 = treatment.id === 'oxygen_15l' || treatment.id === 'oxygen_nrb';
  const isCOPD = sub.includes('copd') || sub.includes('chronic obstructive');
  if (isHighFlowO2 && isCOPD) {
    const oldRR = vitals.respiration;
    vitals.respiration = Math.max(8, vitals.respiration - 2);
    vitals.gcs = Math.max(10, (vitals.gcs ?? 15) - 1);
    warnings.push(`High-flow O2 in COPD — respiratory rate dropped from ${oldRR} to ${vitals.respiration} as CO2 retention reduces respiratory drive. Target SpO2 88-92% with controlled O2 (nasal cannula 2-4L or 28% Venturi).`);
  }

  // --- 3. ADRENALINE IN INTACT CIRCULATION ---
  // IV adrenaline in a patient with a pulse causes tachycardia, hypertension, arrhythmia risk
  const isAdrenalineIV = treatment.id === 'adrenaline_1mg';
  if (isAdrenalineIV && !state.isInArrest && vitals.pulse > 0) {
    const oldHR = vitals.pulse;
    vitals.pulse = Math.min(180, vitals.pulse + 30);
    const bp = parseBP(vitals.bp);
    vitals.bp = formatBP(Math.min(220, bp.systolic + 40), Math.min(130, bp.diastolic + 25));
    warnings.push(`IV adrenaline in a perfusing patient — HR jumped from ${oldHR} to ${vitals.pulse}, BP hypertensive. This is the wrong dose/route for anything other than cardiac arrest. Use IM 1:1,000 for anaphylaxis.`);
  }

  // --- 4. EXCESSIVE HYPERVENTILATION / BVM ---
  // Over-ventilating a patient causes respiratory alkalosis and reduces cerebral perfusion
  const isBVM = treatment.id === 'bvm_ventilation';
  if (isBVM && (state.treatmentCounts['bvm_ventilation'] ?? 0) > 3) {
    warnings.push('Avoid over-ventilation — target 10 breaths per minute in cardiac arrest, 12-16 otherwise. Hyperventilation causes respiratory alkalosis and reduces cerebral perfusion.');
  }

  // --- 5. GTN / NITRATE IN RIGHT VENTRICULAR INFARCT ---
  // Inferior STEMI may involve RV — GTN drops preload and causes severe hypotension
  const isGTN = treatment.id === 'gtn_spray' || treatment.id === 'gtn_sl' || treatment.id === 'nitroglycerin';
  const isInferiorSTEMI = sub.includes('inferior') && (sub.includes('stemi') || sub.includes('mi'));
  if (isGTN && isInferiorSTEMI) {
    const bp = parseBP(vitals.bp);
    const oldSBP = bp.systolic;
    bp.systolic = Math.max(60, bp.systolic - 30);
    bp.diastolic = Math.max(40, bp.diastolic - 15);
    vitals.bp = formatBP(bp.systolic, bp.diastolic);
    warnings.push(`GTN in inferior STEMI — SBP crashed from ${oldSBP} to ${bp.systolic}. Inferior MI may involve the right ventricle, which is preload-dependent. Check V4R before giving GTN in inferior STEMI. Give fluids immediately.`);
  }

  // --- 6. BETA-BLOCKER IN ASTHMA ---
  const isBetaBlocker = treatment.id.includes('metoprolol') || treatment.id.includes('propranolol') || treatment.id.includes('atenolol') || treatment.id.includes('bisoprolol');
  const isAsthma = sub.includes('asthma');
  if (isBetaBlocker && isAsthma) {
    const oldSpO2 = vitals.spo2;
    vitals.spo2 = Math.max(75, vitals.spo2 - 6);
    vitals.respiration = Math.min(40, vitals.respiration + 4);
    warnings.push(`Beta-blocker in asthma — SpO2 dropped from ${oldSpO2}% to ${vitals.spo2}% from bronchospasm. Non-selective beta-blockers are contraindicated in asthma.`);
  }

  // --- 7. OPIOID DOSING AND RESPIRATORY DEPRESSION ---
  const isOpioid = treatment.id.includes('morphine') || treatment.id.includes('fentanyl') || treatment.id.includes('pethidine');
  const opioidCount = (state.treatmentCounts['morphine_2_5mg'] ?? 0) + (state.treatmentCounts['morphine_5mg'] ?? 0) + (state.treatmentCounts['fentanyl_100mcg'] ?? 0);
  if (isOpioid && opioidCount >= 2) {
    const oldRR = vitals.respiration;
    vitals.respiration = Math.max(6, vitals.respiration - 3);
    vitals.gcs = Math.max(8, (vitals.gcs ?? 15) - 2);
    warnings.push(`Repeated opioid dosing — respiratory rate dropped from ${oldRR} to ${vitals.respiration}, GCS decreasing. Watch for respiratory depression; have naloxone ready.`);
  }

  // --- 8. NALOXONE REVERSAL ---
  if (treatment.id.includes('naloxone')) {
    const oldRR = vitals.respiration;
    if (oldRR < 12) {
      vitals.respiration = Math.min(22, vitals.respiration + 6);
      vitals.gcs = Math.min(15, (vitals.gcs ?? 10) + 4);
      vitals.spo2 = Math.min(98, vitals.spo2 + 8);
    }
  }

  // --- 9. HYPERTONIC SALINE IN CEREBRAL OEDEMA (head injury / stroke) ---
  if (treatment.id.includes('hypertonic_saline') || treatment.id.includes('mannitol')) {
    const isHeadInjury = sub.includes('head') || sub.includes('tbi') || sub.includes('intracranial') || sub.includes('stroke');
    if (isHeadInjury) {
      vitals.gcs = Math.min(15, (vitals.gcs ?? 15) + 1);
    }
  }

  // ============================================================================
  // Phase 3 — additional cross-system interaction chains
  // ============================================================================

  const age = caseData.patientInfo?.age ?? 0;
  const cat = (caseData.category || '').toLowerCase();
  const history = (caseData.history?.medicalConditions || []).join(' ').toLowerCase();
  const meds = (caseData.history?.medications || []).join(' ').toLowerCase();

  // --- 10. FLUID OVERLOAD IN ELDERLY / STIFF HEARTS ---
  // Aggressive crystalloid in the elderly or anyone with cardiac history eventually
  // tips into iatrogenic pulmonary oedema even when they're not a classic CHF case.
  // Fires on the third+ bolus, or a second bolus in the elderly.
  const boluses =
    (state.treatmentCounts['saline_bolus_250ml'] ?? 0) +
    (state.treatmentCounts['saline_bolus_500ml'] ?? 0) +
    (state.treatmentCounts['saline_bolus_1000ml'] ?? 0) +
    (state.treatmentCounts['hartmanns_500ml'] ?? 0) +
    (state.treatmentCounts['hartmanns_1000ml'] ?? 0) +
    (state.treatmentCounts['crystalloid_bolus'] ?? 0);
  const cardiacHistory = history.includes('chf') || history.includes('heart failure') ||
    history.includes('cardiomyopathy') || history.includes('ef ') || history.includes('ejection fraction');
  const overloadThreshold = age >= 70 || cardiacHistory ? 2 : 3;
  if (isFluidBolus && !isHeartFailure && boluses >= overloadThreshold) {
    const oldSpO2 = vitals.spo2;
    vitals.spo2 = Math.max(82, vitals.spo2 - 3);
    vitals.respiration = Math.min(38, vitals.respiration + 3);
    const ageNote = age >= 70 ? ` Age ${age} — stiffer ventricles tolerate much less volume` : cardiacHistory ? ' Prior cardiac history reduces fluid tolerance' : '';
    warnings.push(`Volume overload — SpO2 ${oldSpO2}% \u2192 ${vitals.spo2}% after ${boluses} boluses.${ageNote}. Reassess lung bases before the next bolus; consider stopping fluids and sitting the patient up.`);
  }

  // --- 11. NSAIDs / ACE INHIBITORS IN ACUTE KIDNEY INJURY OR HYPOVOLAEMIA ---
  // Pre-renal AKI is worsened by anything that drops glomerular perfusion.
  const isNsaid = treatment.id.includes('ibuprofen') || treatment.id.includes('ketorolac') ||
    treatment.id.includes('diclofenac') || treatment.id.includes('naproxen') || treatment.id.includes('nsaid');
  const isAcei = treatment.id.includes('captopril') || treatment.id.includes('enalapril') ||
    treatment.id.includes('lisinopril') || treatment.id.includes('ramipril') || treatment.id.includes('perindopril');
  const bpNow = parseBP(vitals.bp);
  const isHypovolaemic = bpNow.systolic < 100 || vitals.pulse > 110;
  const renalRisk = history.includes('ckd') || history.includes('renal') || history.includes('kidney') ||
    sub.includes('sepsis') || sub.includes('dehydr') || sub.includes('vomit') || sub.includes('diarrh') || isHypovolaemic;
  if ((isNsaid || isAcei) && renalRisk) {
    vitals.pulse = Math.min(160, vitals.pulse + 8);
    bpNow.systolic = Math.max(60, bpNow.systolic - 12);
    bpNow.diastolic = Math.max(40, bpNow.diastolic - 6);
    vitals.bp = formatBP(bpNow.systolic, bpNow.diastolic);
    const drugClass = isNsaid ? 'NSAID' : 'ACE-inhibitor';
    warnings.push(`${drugClass} in a kidney-vulnerable patient — BP ${bpNow.systolic}/${bpNow.diastolic}. Both NSAIDs (efferent vasoconstriction block) and ACE-inhibitors (efferent dilatation) crash GFR in pre-renal states. Hold until euvolaemia confirmed.`);
  }

  // --- 12. TEMPERATURE CASCADE FROM MASSIVE COLD TRANSFUSION / COOL FLUIDS ---
  // The lethal triad: hypothermia \u2192 coagulopathy \u2192 acidosis. We don't track pH, but
  // we can push temperature down on every further cold bolus beyond the second.
  if (isFluidBolus && boluses >= 2 && !sub.includes('hypothermia')) {
    const oldTemp = vitals.temperature ?? 37;
    // Assume ~1L cold crystalloid drops core ~0.3\u00b0C in an average adult.
    const tempDrop = 0.25;
    if (oldTemp > 34.5) {
      vitals.temperature = Math.max(34, Math.round((oldTemp - tempDrop) * 10) / 10);
      if (vitals.temperature <= 35.5 && oldTemp > 35.5) {
        warnings.push(`Patient now hypothermic (${vitals.temperature}\u00b0C) from ${boluses} cold fluid boluses. Coagulopathy risk \u2014 warm fluids, cover the patient, and reassess. This is the first step of the lethal triad in trauma.`);
      }
    }
  }

  // --- 13. INOTROPE / VASOPRESSOR CEILING — TACHYPHYLAXIS ---
  // Repeat pushes of the same pressor stop giving linear HR/BP response.
  // Also flag when HR > 150: myocardial O2 demand outstrips supply, especially in ACS.
  const isPressor = treatment.id.includes('adrenaline') || treatment.id.includes('noradrenaline') ||
    treatment.id.includes('norepinephrine') || treatment.id.includes('metaraminol') || treatment.id.includes('phenylephrine') || treatment.id.includes('ephedrine');
  const pressorCount = (state.treatmentCounts[treatment.id] ?? 0);
  if (isPressor && pressorCount >= 3) {
    warnings.push(`${treatment.name} \u00d7${pressorCount} \u2014 receptor desensitisation (tachyphylaxis) reduces each subsequent dose's effect. Swap agent, add a second line, or look for an unaddressed cause (occult haemorrhage, tension pneumothorax, tamponade, pH < 7.2).`);
  }
  if (isPressor && vitals.pulse >= 150) {
    const acsRisk = sub.includes('stemi') || sub.includes('nstemi') || sub.includes('acs') ||
      sub.includes('angina') || history.includes('cad') || history.includes('coronary');
    if (acsRisk) {
      warnings.push(`HR ${vitals.pulse} on pressors with coronary disease \u2014 every bpm above 150 increases myocardial O2 demand while dropping diastolic filling time. Risk of demand ischaemia. Consider rate control vs. fixing underlying cause.`);
    }
  }

  // --- 14. BRONCHOCONSTRICTION CHAIN: beta-blockers, NSAIDs, cold air triggers ---
  // NSAIDs/aspirin trigger bronchospasm in "Samter's triad" / aspirin-exacerbated respiratory disease.
  if (isNsaid || treatment.id.includes('aspirin_300mg') || treatment.id.includes('aspirin_325mg')) {
    const hasAERD = history.includes('samter') || history.includes('nasal polyp') || history.includes('aspirin sensitiv') || history.includes('aerd');
    if (hasAERD || (isAsthma && (treatment.id.includes('aspirin') || isNsaid))) {
      const oldSpO2 = vitals.spo2;
      vitals.spo2 = Math.max(80, vitals.spo2 - 4);
      vitals.respiration = Math.min(36, vitals.respiration + 3);
      warnings.push(`${treatment.name} in aspirin-sensitive asthma \u2014 SpO2 ${oldSpO2}% \u2192 ${vitals.spo2}% from bronchospasm. Samter's triad (asthma + nasal polyps + AERD) contraindicates all COX inhibitors. Stop the drug; salbutamol nebuliser + IM adrenaline if severe.`);
    }
  }

  // --- 15. GTN + LOOP DIURETIC + UPRIGHT POSITION = SYNCOPE RISK ---
  // Classic pre-hospital over-treatment of dyspnoea: stacking preload reduction.
  const gtnCount = (state.treatmentCounts['gtn_spray'] ?? 0) + (state.treatmentCounts['gtn_sl'] ?? 0) + (state.treatmentCounts['nitroglycerin'] ?? 0);
  const loopCount = (state.treatmentCounts['frusemide_40mg'] ?? 0) + (state.treatmentCounts['frusemide_80mg'] ?? 0) + (state.treatmentCounts['furosemide'] ?? 0) + (state.treatmentCounts['lasix'] ?? 0);
  const justGaveGTN = isGTN || treatment.id.includes('gtn');
  const justGaveLoop = treatment.id.includes('frusemide') || treatment.id.includes('furosemide') || treatment.id.includes('lasix');
  if ((justGaveGTN && loopCount >= 1) || (justGaveLoop && gtnCount >= 1)) {
    const bp = parseBP(vitals.bp);
    const oldSBP = bp.systolic;
    bp.systolic = Math.max(70, bp.systolic - 18);
    bp.diastolic = Math.max(45, bp.diastolic - 10);
    vitals.bp = formatBP(bp.systolic, bp.diastolic);
    if (bp.systolic < 90) {
      warnings.push(`Stacked preload reduction (GTN + loop diuretic) \u2014 SBP ${oldSBP} \u2192 ${bp.systolic}. The patient is now pre-syncopal. Lay them flat, stop further GTN, and consider a small fluid challenge. Classic over-treatment error in APO.`);
    } else {
      warnings.push(`GTN + loop diuretic stacked \u2014 BP dropping (${oldSBP} \u2192 ${bp.systolic}). Re-check BP before the next dose; don't chase oedema into hypotension.`);
    }
  }

  // --- 16. LONG-TERM BETA-BLOCKER MASKING ANAPHYLAXIS / SHOCK ---
  // Home-medication context: beta-blocker users need higher adrenaline doses and
  // glucagon may be required when adrenaline under-responds.
  const onChronicBB = meds.includes('metoprolol') || meds.includes('bisoprolol') || meds.includes('atenolol') ||
    meds.includes('carvedilol') || meds.includes('propranolol') || meds.includes('nebivolol');
  if (onChronicBB && (sub.includes('anaphylax') || sub.includes('shock')) && treatment.id.includes('adrenaline')) {
    // Blunt the expected HR/BP bump from adrenaline.
    const bp = parseBP(vitals.bp);
    vitals.pulse = Math.max(40, vitals.pulse - 6);
    bp.systolic = Math.max(60, bp.systolic - 8);
    vitals.bp = formatBP(bp.systolic, bp.diastolic);
    warnings.push(`Chronic beta-blocker on board (${meds.includes('carvedilol') ? 'carvedilol' : 'beta-blocker'}) \u2014 adrenaline response is blunted at the beta receptor. Consider IV glucagon 1-2 mg as rescue, and expect to repeat adrenaline more frequently. This is why a "normal" anaphylaxis dose may fail.`);
  }

  // Attach warnings to the response
  if (warnings.length > 0 && !response.warningMessage) {
    response.warningMessage = warnings[0];
  } else if (warnings.length > 0 && response.warningMessage) {
    response.warningMessage = `${response.warningMessage} | ${warnings.join(' | ')}`;
  }
}
