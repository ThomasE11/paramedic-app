/**
 * Unwellness states — pure derivation of OMS-style visible sickness cues from
 * live physiology + case context (PATIENT_SIM_RESEARCH.md §2, Realism Top 10
 * item 4: "Visible unwellness skin states").
 *
 * This module owns the *decision* — "which unwellness states are active, at
 * what intensity" — and nothing else. It performs no rendering, holds no
 * three.js references, allocates no GPU resources: given the current vitals,
 * the case's own presentation/finding text, and the PREVIOUS derived state
 * (for hysteresis), it returns three normalised channels in [0, 1]. The 3D
 * layer (BodyMesh) consumes those numbers and drives the material/texture.
 *
 * The three channels are deliberately orthogonal to the existing perfusion
 * tint (cyanosis + pallor, computed in Body3DModel/index.tsx) and to each
 * other in derivation terms:
 *
 *   • diaphoresis (sweat sheen)  — MATERIAL channel. Driven by live physiology
 *     (shock index, hypoglycaemia, severe respiratory distress) OR by case
 *     appearance text. Ramps continuously; the caller eases it.
 *   • jaundice   (yellow-ochre)  — TINT channel. Driven by CASE TEXT only
 *     (hepatic presentation), not vitals — jaundice is a days-scale finding,
 *     constant for the duration of a case. Binary in derivation (0 or 1).
 *   • mottling   (livedo)        — TEXTURE channel. Late-shock sign. Driven by
 *     sustained severe shock (shock index or systolic), with HYSTERESIS so it
 *     latches on at the severe threshold and only clears once perfusion
 *     recovers well past it — the expensive texture composite must not thrash
 *     on/off around a single threshold. Binary (0 or 1).
 *
 * Composition/precedence with the existing cyanosis+pallor tint is documented
 * where the tint is assembled (Body3DModel/index.tsx): base → jaundice →
 * pallor → cyanosis. Sheen and mottling are separate output channels (material
 * roughness and a texture overlay respectively) and do not participate in the
 * colour-lerp order.
 */

import type { VitalSigns } from '@/types';

export interface UnwellnessState {
  /** Sweat sheen, 0 (dry) .. 1 (drenched). Material roughness/envMap driver. */
  diaphoresis: number;
  /** Yellow-ochre jaundice cast, 0 (none) .. 1 (icteric). Tint driver. */
  jaundice: number;
  /** Late-shock mottling, 0 (clear) .. 1 (mottled). Texture-overlay driver. */
  mottling: number;
}

export interface UnwellnessInputs {
  /** Live (or case-initial) vitals. bp is "120/80"-style; may be partial. */
  vitals?: Partial<VitalSigns> | null;
  /**
   * Lower-cased, concatenated case text used for text-driven states. Callers
   * should pass appearance/general-impression/finding strings joined together
   * — see collectUnwellnessText() for the canonical set. Matched
   * case-insensitively regardless, but pre-lowering keeps the hot path cheap.
   */
  caseText?: string;
  /**
   * The previously-derived state, for hysteresis on the latched channels
   * (mottling). Omit on the first derivation (treated as all-clear).
   */
  previous?: UnwellnessState | null;
}

// --- Thresholds (documented so tests and clinicians can audit them) --------
// Diaphoresis drivers
const SHOCK_INDEX_SWEAT = 0.9; // HR/systolic above this → sympathetic sweating
const BGL_SWEAT = 4.0; // mmol/L; hypoglycaemia below this → clammy sweat
const RESP_DISTRESS_RR = 28; // breaths/min with hypoxaemia → work-of-breathing sweat
const RESP_DISTRESS_SPO2 = 92; // %
// Mottling (late shock) — latched with hysteresis
const MOTTLE_SI_ON = 1.3; // shock index at/above → mottling appears
const MOTTLE_SI_OFF = 1.1; // must recover BELOW this to clear (hysteresis band)
const MOTTLE_SYS_ON = 75; // systolic mmHg at/below → mottling appears
const MOTTLE_SYS_OFF = 85; // must recover ABOVE this to clear

const DIAPHORESIS_TEXT = /diaphore|sweat|clammy|drenched|perspir/i;
const JAUNDICE_TEXT = /jaundice|jaundiced|icteric|icterus|yellow scler/i;

function clamp01(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

/** Parse the systolic value out of a "120/80" / "120/80 mmHg" / "120" string. */
export function parseSystolic(bp: unknown): number | null {
  if (typeof bp === 'number' && Number.isFinite(bp)) return bp;
  if (typeof bp !== 'string') return null;
  const m = bp.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (m) return parseInt(m[1], 10);
  const single = bp.match(/\d{2,3}/);
  return single ? parseInt(single[0], 10) : null;
}

/** Shock index = pulse / systolic, or null when either is missing/zero. */
export function shockIndex(vitals?: Partial<VitalSigns> | null): number | null {
  if (!vitals) return null;
  const pulse = typeof vitals.pulse === 'number' ? vitals.pulse : null;
  const systolic = parseSystolic(vitals.bp);
  if (pulse === null || systolic === null || systolic <= 0 || pulse <= 0) return null;
  return pulse / systolic;
}

/**
 * Derive the active unwellness states.
 *
 * Pure: no side effects, no allocation beyond the returned object. Safe to
 * call every physiology tick (it is memoised by the caller, but is cheap
 * enough to run per vitals change).
 */
export function deriveUnwellness(inputs: UnwellnessInputs): UnwellnessState {
  const { vitals, previous } = inputs;
  const text = (inputs.caseText ?? '').toLowerCase();

  // ---- Diaphoresis (continuous 0..1) ------------------------------------
  // Multiple independent drivers; the strongest wins (max, not sum — a soaked
  // patient is soaked, driver count doesn't stack past drenched).
  let diaphoresis = 0;

  const si = shockIndex(vitals);
  if (si !== null && si > SHOCK_INDEX_SWEAT) {
    // 0.9 → ~0.35, ramping to full by shock index ~1.6.
    diaphoresis = Math.max(diaphoresis, 0.35 + (si - SHOCK_INDEX_SWEAT) * 0.9);
  }

  const bgl = typeof vitals?.bloodGlucose === 'number' ? vitals.bloodGlucose : null;
  if (bgl !== null && bgl < BGL_SWEAT) {
    // Lower glucose → wetter. 3.9 → ~0.3, 2.0 → full, floors at severe.
    diaphoresis = Math.max(diaphoresis, 0.3 + (BGL_SWEAT - bgl) * 0.35);
  }

  const rr = typeof vitals?.respiration === 'number' ? vitals.respiration : null;
  const spo2 = typeof vitals?.spo2 === 'number' ? vitals.spo2 : null;
  if (rr !== null && spo2 !== null && rr > RESP_DISTRESS_RR && spo2 < RESP_DISTRESS_SPO2) {
    diaphoresis = Math.max(diaphoresis, 0.6);
  }

  // Case appearance text ("diaphoretic", "profuse sweating", "clammy") — the
  // authored presentation is itself a driver, so a case that opens diaphoretic
  // shows sweat immediately even before vitals move.
  if (DIAPHORESIS_TEXT.test(text)) {
    diaphoresis = Math.max(diaphoresis, 0.65);
  }

  diaphoresis = clamp01(diaphoresis);

  // ---- Jaundice (text-driven, constant) ---------------------------------
  const jaundice = JAUNDICE_TEXT.test(text) ? 1 : 0;

  // ---- Mottling (latched with hysteresis) -------------------------------
  const wasMottled = (previous?.mottling ?? 0) > 0.5;
  const systolic = parseSystolic(vitals?.bp);

  // Severe-shock ON conditions (either the ratio or an absolute low systolic).
  const severeOn =
    (si !== null && si >= MOTTLE_SI_ON) ||
    (systolic !== null && systolic <= MOTTLE_SYS_ON);

  // Recovery: only clear once BOTH available signals are past the wider OFF
  // band. A missing signal cannot block clearing (don't strand mottling on a
  // patient whose BP we can no longer read).
  const siRecovered = si === null || si < MOTTLE_SI_OFF;
  const sysRecovered = systolic === null || systolic > MOTTLE_SYS_OFF;
  const recovered = siRecovered && sysRecovered;

  let mottling: number;
  if (wasMottled) {
    // Latched on — stay on until perfusion recovers past the hysteresis band.
    mottling = recovered ? 0 : 1;
  } else {
    // Latched off — turn on only when severe shock is reached.
    mottling = severeOn ? 1 : 0;
  }

  return { diaphoresis, jaundice, mottling };
}

/**
 * Canonical case-text collector for unwellness derivation. Pulls the
 * appearance/presentation/finding strings that clinically carry sweat, jaundice
 * and shock language, lower-cased and joined. Kept here (not in the component)
 * so the derivation's text contract is testable in isolation.
 *
 * Typed loosely against the case shape used elsewhere in Body3DModel — only
 * the fields we read are named, everything optional.
 */
export interface UnwellnessCaseLike {
  initialPresentation?: {
    generalImpression?: string;
    appearance?: string;
    consciousness?: string;
  };
  abcde?: {
    circulation?: { skin?: string; findings?: string[] };
    breathing?: { findings?: string[] };
    exposure?: { findings?: string[] };
  };
  expectedFindings?: { keyObservations?: string[]; redFlags?: string[] };
  secondarySurvey?: { head?: string[]; abdomen?: string[] };
  history?: { medicalConditions?: string[] };
}

export function collectUnwellnessText(caseData: UnwellnessCaseLike | null | undefined): string {
  if (!caseData) return '';
  const parts: Array<string | undefined> = [
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.appearance,
    caseData.initialPresentation?.consciousness,
    caseData.abcde?.circulation?.skin,
    ...(caseData.abcde?.circulation?.findings ?? []),
    ...(caseData.abcde?.breathing?.findings ?? []),
    ...(caseData.abcde?.exposure?.findings ?? []),
    ...(caseData.expectedFindings?.keyObservations ?? []),
    ...(caseData.expectedFindings?.redFlags ?? []),
    ...(caseData.secondarySurvey?.head ?? []),
    ...(caseData.secondarySurvey?.abdomen ?? []),
    ...(caseData.history?.medicalConditions ?? []),
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
}
