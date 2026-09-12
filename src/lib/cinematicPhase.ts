/**
 * Phase D3 cinematic helpers — presentational only.
 *
 * The student clinical state machine (StudentPhase, setPhase, enterScene)
 * stays untouched. These map that existing phase onto an AnimatePresence
 * key and a villa doorway camera origin so briefing → scene → treat
 * crossfades / dollies instead of hard-cutting.
 *
 * Phase-specific motion variants make briefing → scene read as a cinematic
 * arrival rather than a generic 10px web fade. Every variant collapses to
 * instant show/hide under prefers-reduced-motion.
 */

import type { TargetAndTransition, Transition } from 'framer-motion';

export type CinematicPhase =
  | 'select'
  | 'prebriefing'
  | 'scene-survey'
  | 'vitals'
  | 'case'
  | 'postcase';

/**
 * Shared AnimatePresence key. `vitals` and `case` share `live-treatment`
 * so the LIFEPAK monitor stays mounted when the student flips to Case
 * Details (the existing CSS-hide pattern). Other phases each get their
 * own key so briefing → scene → treat actually crossfades.
 */
export function phaseTransitionKey(phase: CinematicPhase): string {
  if (phase === 'vitals' || phase === 'case') return 'live-treatment';
  return phase;
}

/** Standing start just outside the villa front wall (SceneVariant ROOM.frontZ = 2.0). */
export const VILLA_DOORWAY: [number, number, number] = [0, 1.8, 2.8];

/** Doorway origin for the scene-entry dolly. Non-home variants keep the short pull-back. */
export function sceneEntryOrigin(variant: string | undefined): [number, number, number] | undefined {
  return variant === 'home' ? VILLA_DOORWAY : undefined;
}

// ---------------------------------------------------------------------------
// Phase-specific framer-motion variants (D3)
// ---------------------------------------------------------------------------

export interface PhaseMotionVariant {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  transition: Transition;
}

// ponytail: one lookup, no class hierarchy. Add when a phase needs its own easing.
const VARIANTS: Record<string, PhaseMotionVariant> = {
  // Case selection — vanilla fade, nothing cinematic needed
  select: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -6 },
    transition: { duration: 0.25, ease: 'easeOut' },
  },

  // Dispatch briefing — arrives as a focused card, exits with a scale-down
  // "radio signing off" feel before the scene survey takes over
  prebriefing: {
    initial: { opacity: 0, y: 14, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit:    { opacity: 0, scale: 0.94, filter: 'blur(4px)' },
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  },

  // Scene survey — slides in from below (arriving at scene), exits fast
  // (getting out of the way for the 3D camera entrance)
  'scene-survey': {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -4 },
    transition: { duration: 0.32, ease: [0.4, 0, 0.2, 1] },
  },

  // Live treatment HUD — enters with a subtle upward slide after a
  // slight delay so the 3D camera entrance has breathing room. Exits
  // downward on case end.
  'live-treatment': {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: 8 },
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },

  // Post-case debrief — fade in cleanly, no direction bias
  postcase: {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

/** Instant-show variant for prefers-reduced-motion. */
const REDUCED_MOTION_VARIANT: PhaseMotionVariant = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
  transition: { duration: 0.01, ease: 'linear' },
};

/**
 * Return the framer-motion variant for a given phase.
 *
 * Uses `phaseTransitionKey` internally so vitals/case share the
 * live-treatment variant (LIFEPAK stays mounted).
 *
 * @param reducedMotion - pass `useReducedMotion()` result; collapses
 *   all motion to instant when true.
 */
export function phaseMotionVariant(
  phase: CinematicPhase,
  reducedMotion: boolean | null,
): PhaseMotionVariant {
  if (reducedMotion) return REDUCED_MOTION_VARIANT;
  const key = phaseTransitionKey(phase);
  return VARIANTS[key] ?? VARIANTS.select;
}
