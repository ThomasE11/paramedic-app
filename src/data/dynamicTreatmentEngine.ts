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
  return { systolic: parts[0] || 120, diastolic: parts[1] || 80 };
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

  // Determine initial ECG rhythm from case data
  let rhythm = 'Normal Sinus Rhythm';
  const ecgFindings = caseData.abcde?.circulation?.ecgFindings || [];
  const allFindings = [...ecgFindings, ...(caseData.expectedFindings?.keyObservations || [])].join(' ').toLowerCase();

  if (allFindings.includes('vf') || allFindings.includes('ventricular fibrillation')) rhythm = 'Ventricular Fibrillation';
  else if (allFindings.includes('vt') || allFindings.includes('ventricular tachycardia')) rhythm = 'Ventricular Tachycardia';
  else if (allFindings.includes('svt') || allFindings.includes('supraventricular')) rhythm = 'SVT';
  else if (allFindings.includes('af') || allFindings.includes('atrial fibrillation')) rhythm = 'Atrial Fibrillation';
  else if (allFindings.includes('flutter')) rhythm = 'Atrial Flutter';
  else if (allFindings.includes('asystole')) rhythm = 'Asystole';
  else if (allFindings.includes('pea') || allFindings.includes('pulseless electrical')) rhythm = 'PEA';
  else if (allFindings.includes('stemi') || allFindings.includes('st elevation')) rhythm = 'Sinus Tachycardia with ST Elevation';
  else if (allFindings.includes('bradycardia') || (vitals.pulse && vitals.pulse < 50)) rhythm = 'Sinus Bradycardia';
  else if (vitals.pulse && vitals.pulse > 100) rhythm = 'Sinus Tachycardia';

  const isInArrest = ['Ventricular Fibrillation', 'Asystole', 'PEA'].includes(rhythm) ||
    (vitals.pulse !== undefined && vitals.pulse === 0);

  return {
    vitals: { ...vitals },
    sounds: getInitialSounds(caseData.category, caseData.subcategory, findings, {
      spo2: vitals.spo2,
      pulse: vitals.pulse,
      respiration: vitals.respiration,
      gcs: vitals.gcs,
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
      state.currentRhythm = 'Sinus Rhythm';
      vitals.pulse = 78;
      vitals.bp = '110/70';
      state.deteriorationLevel = Math.max(0, state.deteriorationLevel - 2);

      changes.push(
        { vital: 'HR', oldValue: vitals.pulse, newValue: 78, direction: 'improved' },
        { vital: 'BP', oldValue: vitals.bp, newValue: '110/70', direction: 'improved' },
      );
      vitals.pulse = 78;
      vitals.bp = '110/70';

      return {
        description: `Synchronized cardioversion at ${energy}J successful! VT converted to sinus rhythm. HR 78, BP 110/70.`,
        effectivenessPercent: 100,
        isPartialResponse: false,
        requiresRepeat: false,
        criticalEvent: {
          type: 'rhythm-change',
          description: 'VT successfully cardioverted to sinus rhythm.',
          newRhythm: 'Sinus Rhythm',
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

  // SVT: Synchronized cardioversion at lower energy
  if (currentRhythm === 'SVT') {
    if (synchronized && energy <= 100) {
      state.currentRhythm = 'Sinus Rhythm';
      vitals.pulse = 80;

      return {
        description: `Synchronized cardioversion at ${energy}J — SVT terminated. Sinus rhythm restored at 80 bpm.`,
        effectivenessPercent: 95,
        isPartialResponse: false,
        requiresRepeat: false,
        criticalEvent: {
          type: 'rhythm-change',
          description: 'SVT successfully cardioverted.',
          newRhythm: 'Sinus Rhythm',
          requiresAction: ['Monitor for SVT recurrence', 'Consider Adenosine if recurs'],
        },
        vitalChanges: [{ vital: 'HR', oldValue: vitals.pulse, newValue: 80, direction: 'improved' }],
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

  // Normal/other rhythm — unnecessary shock
  return {
    description: 'Shock delivered to patient with perfusing rhythm — this was unnecessary and may cause harm.',
    effectivenessPercent: 0,
    isPartialResponse: false,
    requiresRepeat: false,
    warningMessage: 'Defibrillation is only indicated for VF/pulseless VT!',
    vitalChanges: [],
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

  return newState;
}
