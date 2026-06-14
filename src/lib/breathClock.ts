/**
 * Shared breathing clock.
 *
 * BodyMesh drives the chest-rise morph from an accumulated phase at the case
 * respiratory rate; auscultation needs the SAME phase so the recorded breath
 * loop's inhale/exhale lines up with the chest the student is watching.
 * BodyMesh writes here every frame; clinicalSounds reads it when a breath
 * recording starts, to phase-align and rate-match the loop.
 *
 * Plain module state (not React) — both writers/readers live outside the
 * React render cycle (useFrame / audio callbacks).
 */

const state = {
  /** Accumulated phase in radians: inhalation starts at 0, peaks at π. */
  phase: 0,
  /** Current respiratory rate driving the morph (breaths/min, 0 = apnoea). */
  rpm: 0,
  /** Last write time — readers can detect a stale clock (scene unmounted). */
  writtenAt: 0,
};

export function setBreathClock(phase: number, rpm: number): void {
  state.phase = phase;
  state.rpm = rpm;
  state.writtenAt = Date.now();
}

/** Phase within the current breath, normalised 0..1 (0 = inhalation onset). */
export function getBreathPhase01(): number {
  const tau = Math.PI * 2;
  return ((state.phase % tau) + tau) % tau / tau;
}

export function getBreathRpm(): number {
  // A clock older than 2s means no body is animating — treat as unknown.
  if (Date.now() - state.writtenAt > 2000) return 0;
  return state.rpm;
}
