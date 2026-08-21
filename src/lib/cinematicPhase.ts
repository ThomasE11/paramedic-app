/**
 * Phase D3 cinematic helpers — presentational only.
 *
 * The student clinical state machine (StudentPhase, setPhase, enterScene)
 * stays untouched. These map that existing phase onto an AnimatePresence
 * key and a villa doorway camera origin so briefing → scene → treat
 * crossfades / dollies instead of hard-cutting.
 */

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
