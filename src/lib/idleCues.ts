/**
 * Idle-animation cues — pure derivation from case + live vitals + the
 * scenario visual state, consumed by the 3D layer's IdleAnimations component.
 *
 * Same decoupling contract as patientVisualState: the renderer gets flat
 * booleans/scalars and never touches clinical rules.
 */

import type { CaseScenario, VitalSigns } from '@/types';
import type { PatientVisualState } from '@/lib/patientVisualState';

export interface IdleCues {
  /** 0..1 pain intensity (painScore preferred, case text fallback). */
  pain01: number;
  /** SpO2 < 90 or visible breathing effort — occasional sharp chest rises. */
  gasping: boolean;
  /** Shock (SI > 0.9) or hypothermia — fine rapid whole-body shiver. */
  shivering: boolean;
  /** Scenario seizure activity — rhythmic shaking, runs even when unconscious. */
  seizure: boolean;
  /** Scenario tremor — finer, regular, conscious-gated. */
  tremor: boolean;
  /** Distressed presentation — restless positional shifting. */
  agitated: boolean;
  /** Cardiac chest-pain case — periodic guarding curl toward the chest. */
  chestClutch: boolean;
}

export function deriveIdleCues(
  caseData: CaseScenario,
  vitals: VitalSigns | undefined,
  visual: PatientVisualState | null | undefined,
): IdleCues {
  const source = vitals ?? caseData.vitalSignsProgression?.initial;
  const spo2 = typeof source?.spo2 === 'number' ? source.spo2 : null;
  const temp = typeof source?.temperature === 'number' ? source.temperature : null;
  const respiration = typeof source?.respiration === 'number' ? source.respiration : null;

  const text = [
    caseData.title,
    caseData.dispatchInfo?.callReason,
    caseData.initialPresentation?.appearance,
    caseData.initialPresentation?.generalImpression,
  ].filter(Boolean).join(' ').toLowerCase();

  const painScore01 = typeof source?.painScore === 'number'
    ? Math.min(1, Math.max(0, source.painScore / 10)) : 0;
  const painText01 = /severe pain|agony|crushing|excruciating|writh/.test(text) ? 0.85
    : /\bpain|clutch|guard/.test(text) ? 0.55 : 0;
  const distressedPresentation = /distress|anxious|agitat|restless|panick|frighten/.test(text);
  const ongoingPhysiologicalDistress =
    (spo2 !== null && spo2 < 94)
    || (respiration !== null && (respiration < 10 || respiration >= 24));
  const explicitlyRestless = /agitat|restless|panick/.test(text);

  return {
    pain01: Math.max(painScore01, painText01),
    gasping: (spo2 !== null && spo2 < 90) || (visual?.breathingEffort ?? 0) >= 0.5,
    // Hypotension/tachycardia alone does not make a patient shiver. The old
    // shock-index shortcut put a rapid limb tremor on warm indoor STEMI and
    // haemorrhage cases, which looked like rig vibration. Reserve this cue for
    // actual thermoregulatory or explicitly-authored shivering.
    shivering:
      (temp !== null && temp < 35.5)
      || /\bshiver(?:ing)?\b|\brigors?\b|\bhypotherm/.test(text),
    seizure: visual?.hasSeizureActivity ?? false,
    tremor: visual?.hasTremor ?? false,
    // Authored arrival text is historical once live treatment has improved
    // oxygenation and respiratory rate. Do not keep an asthma patient in a
    // perpetual arm-sway loop merely because the opening prose said anxious.
    agitated: distressedPresentation && (ongoingPhysiologicalDistress || explicitlyRestless),
    chestClutch:
      caseData.category === 'cardiac' &&
      /chest (pain|tightness|pressure|discomfort)|crushing|myocardial|infarct|angina|acs\b/.test(text),
  };
}
