/**
 * Idle limb motion — the baseline "this patient is alive" movement.
 *
 * LifeSigns used to sway the whole model root, but rotating the root pivots a
 * supine body through its support surface, so it was reduced to a no-op. That
 * left non-ambulatory patients (every seated, supine and recovery case — i.e.
 * most of them) with a chest morph and eye saccades as their ONLY movement:
 * the arms sat perfectly still, which reads as a mannequin, not a person.
 *
 * This module produces small LOCAL bone offsets instead, so the patient stays
 * planted on the floor/stretcher and attached equipment keeps its anchor:
 *
 *   • Shoulder lift  — coupled to the real breathing clock, and scaled by the
 *     respiratory rate. At a normal rate it is a barely-perceptible rise; as
 *     the patient becomes tachypnoeic it grows into visible shoulder heave,
 *     which is the accessory-muscle recruitment a student should be reading
 *     off a respiratory-distress patient.
 *   • Arm / forearm drift — two incommensurate sines per side so the limbs
 *     settle and resettle instead of holding one frozen pose. Deliberately
 *     asymmetric: matching left/right motion reads as a machine.
 *
 * Amplitudes are radians and intentionally tiny — this should register as
 * "alive" in peripheral vision, never as a gesture.
 *
 * Pure + allocation-free (fills a caller-owned `out`), same discipline as
 * `computePatientMotionSignals`.
 */

export interface IdleLimbMotion {
  /** Applied to both shoulder bones — breathing-coupled, rate-scaled. */
  shoulderLift: number;
  leftArmDrift: number;
  rightArmDrift: number;
  leftForeArmDrift: number;
  rightForeArmDrift: number;
}

export interface IdleLimbMotionInput {
  /** Seconds since mount. */
  time: number;
  /** Eased consciousness gate 0..1. Unconscious stillness is a finding. */
  gate: number;
  /** Breath phase 0..1 from the shared breathing clock (0 = inhalation onset). */
  breathPhase01: number;
  /** Live respiratory rate (breaths/min). 0 = apnoea → no respiratory lift. */
  respiratoryRate: number;
  /** Adaptive-quality low rung — keep the clinical signal, drop the garnish. */
  reduced?: boolean;
}

/** Barely-there shoulder movement at a normal, comfortable respiratory rate. */
const SHOULDER_LIFT_QUIET = 0.004;
/** Full accessory-muscle heave once the patient is frankly tachypnoeic. */
const SHOULDER_LIFT_LABOURED = 0.05;
/** Rate at which shoulder involvement starts to become visible. */
const ACCESSORY_ONSET_RPM = 18;
/** Rate at which it is fully recruited. */
const ACCESSORY_FULL_RPM = 34;

const ARM_DRIFT = 0.014;
const FOREARM_DRIFT = 0.01;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * How much the shoulders should ride with each breath at this rate.
 * Apnoea returns 0 — still shoulders on a still chest is itself the finding.
 */
export function accessoryLiftAmplitude(respiratoryRate: number): number {
  if (respiratoryRate <= 0) return 0;
  const recruitment = clamp01(
    (respiratoryRate - ACCESSORY_ONSET_RPM) / (ACCESSORY_FULL_RPM - ACCESSORY_ONSET_RPM),
  );
  return SHOULDER_LIFT_QUIET + (SHOULDER_LIFT_LABOURED - SHOULDER_LIFT_QUIET) * recruitment;
}

export function computeIdleLimbMotion(
  input: IdleLimbMotionInput,
  out: IdleLimbMotion,
): IdleLimbMotion {
  const { time, gate, breathPhase01, respiratoryRate, reduced = false } = input;

  if (gate <= 0) {
    out.shoulderLift = 0;
    out.leftArmDrift = 0;
    out.rightArmDrift = 0;
    out.leftForeArmDrift = 0;
    out.rightForeArmDrift = 0;
    return out;
  }

  // Rise with inhalation, fall with exhalation — same 0..1 curve shape the
  // chest morph uses, so shoulders and chest move as one breath.
  const breathRise = 0.5 - 0.5 * Math.cos(breathPhase01 * Math.PI * 2);
  out.shoulderLift = accessoryLiftAmplitude(respiratoryRate) * breathRise * gate;

  if (reduced) {
    out.leftArmDrift = 0;
    out.rightArmDrift = 0;
    out.leftForeArmDrift = 0;
    out.rightForeArmDrift = 0;
    return out;
  }

  // Incommensurate periods (~14s / ~23s and ~17s / ~29s) so the two sides never
  // fall into step and the loop never visibly repeats.
  out.leftArmDrift = (
    Math.sin(time * 0.45) * 0.65 + Math.sin(time * 0.27) * 0.35
  ) * ARM_DRIFT * gate;
  out.rightArmDrift = (
    Math.sin(time * 0.37 + 1.9) * 0.65 + Math.sin(time * 0.21 + 0.6) * 0.35
  ) * ARM_DRIFT * gate;
  out.leftForeArmDrift = Math.sin(time * 0.31 + 2.4) * FOREARM_DRIFT * gate;
  out.rightForeArmDrift = Math.sin(time * 0.25 + 4.1) * FOREARM_DRIFT * gate;

  return out;
}

export function createIdleLimbMotion(): IdleLimbMotion {
  return {
    shoulderLift: 0,
    leftArmDrift: 0,
    rightArmDrift: 0,
    leftForeArmDrift: 0,
    rightForeArmDrift: 0,
  };
}
