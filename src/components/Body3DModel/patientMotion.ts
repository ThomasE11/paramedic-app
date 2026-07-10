/**
 * patientMotion — pure amplitude math for the living-patient motion channels.
 *
 * Kept free of three.js so the clinical read of each channel is unit-testable:
 * BodyMesh/LifeSigns own the per-frame mutation, this module owns the numbers.
 */

/**
 * Chest-rise morph amplitude for one breath cycle (0..1 morph influence).
 *
 *  • Apnoea (rpm ≤ 0) → 0: a still chest is itself a finding.
 *  • Tachypnoea (≥ 28) → shallower base so it reads as "fast, shallow".
 *  • Reduced chest rise (scenario: poor air entry, chest injury) → shallow
 *    wins over everything, including effort — a labouring patient with poor
 *    air entry still shows a poor chest. ponytail: one bilateral morph only;
 *    true left/right asymmetry needs per-side morph targets in the GLB.
 *  • Breathing effort (accessory-muscle work, 0..1) deepens the excursion,
 *    capped at full influence.
 */
export function chestRiseAmplitude(rpm: number, effort = 0, reducedRise = false): number {
  if (rpm <= 0) return 0;
  const base = rpm >= 28 ? 0.55 : 1.0;
  if (reducedRise) return base * 0.45;
  return Math.min(1, base * (1 + 0.35 * Math.min(1, Math.max(0, effort))));
}

/**
 * Stature scale by age — a paediatric case presents a CHILD-SIZED patient,
 * not an adult. Applied to the presentation group, so the mesh's internal
 * 1.8 m clinical frame (hit-testing, morphs, clothing cuts, samplers) is
 * untouched — clicks map back through worldToLocal.
 * ponytail: adult proportions at child stature (head ratio is wrong); the
 * proper MPFB child mesh replaces this scale when it lands.
 */
export function ageStatureScale(age?: number): number {
  if (typeof age !== 'number' || age >= 16) return 1;
  if (age <= 1) return 0.42;  // infant ~75 cm
  if (age <= 5) return 0.56;  // toddler/preschool ~100 cm
  if (age <= 12) return 0.74; // school age ~135 cm
  return 0.9;                 // young teen
}

/** Root-rotation amplitudes (radians) for the LifeSigns motion channels.
 *  The model root pivots at the feet, so tiny angles read as centimetres of
 *  head/torso movement. Sway for scale sits at 0.002–0.006 rad. */
export const MOTION = {
  /** Fine shiver (hypoglycaemia, sympathomimetic) — fast and small. */
  tremorHz: 9,
  tremorAmp: 0.0035,
  /** Clonic seizure jerk — slow, large, deliberately un-sway-like. */
  seizureHz: 3.1,
  seizureAmp: 0.014,
  /** Labored-breathing torso heave, scaled by effort and synced to the
   *  shared breath clock so it moves WITH the chest. */
  effortHeaveAmp: 0.012,
} as const;
