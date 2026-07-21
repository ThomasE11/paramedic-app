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

const parseSystolic = (bp: string | undefined): number | null => {
  const m = typeof bp === 'string' ? bp.match(/(\d{2,3})\s*\/\s*\d{2,3}/) : null;
  return m ? parseInt(m[1], 10) : null;
};

export function deriveIdleCues(
  caseData: CaseScenario,
  vitals: VitalSigns | undefined,
  visual: PatientVisualState | null | undefined,
): IdleCues {
  const source = vitals ?? caseData.vitalSignsProgression?.initial;
  const spo2 = typeof source?.spo2 === 'number' ? source.spo2 : null;
  const pulse = typeof source?.pulse === 'number' ? source.pulse : null;
  const systolic = parseSystolic(source?.bp);
  const temp = typeof source?.temperature === 'number' ? source.temperature : null;

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

  const shockIndex = pulse !== null && systolic !== null && systolic > 0
    ? pulse / systolic : 0;

  return {
    pain01: Math.max(painScore01, painText01),
    gasping: (spo2 !== null && spo2 < 90) || (visual?.breathingEffort ?? 0) >= 0.5,
    shivering: shockIndex > 0.9 || (temp !== null && temp < 35.5),
    seizure: visual?.hasSeizureActivity ?? false,
    tremor: visual?.hasTremor ?? false,
    agitated: /distress|anxious|agitat|restless|panick|frighten/.test(text),
    chestClutch:
      caseData.category === 'cardiac' &&
      /chest (pain|tightness|pressure|discomfort)|crushing|myocardial|infarct|angina|acs\b/.test(text),
  };
}
