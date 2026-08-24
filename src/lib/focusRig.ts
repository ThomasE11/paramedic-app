/**
 * Shared rack-focus rig for the post stack (Phase D1/D2).
 *
 * A plain mutable object — NOT React state. The camera entrance writes to it
 * every animation frame (raf loop) and the DepthOfField driver inside the
 * composer reads it every render frame (useFrame). Routing this through React
 * props would re-render the whole Canvas subtree at 60 Hz; through useFrame
 * it costs a uniform write.
 *
 * Defaults match the resting "portrait" focus: whole patient sharp at 2.5 m,
 * room melting off behind. The entrance widens the distance (deep focus on
 * the doorway view) and pulls it in as the camera settles — the rack focus.
 */
export const focusRig = {
  /** Clinical treatment view keeps the whole patient and nearby scene sharp. */
  worldDistance: 2.5,
  /** Broad sharp zone: face, torso and limbs must remain simultaneously readable. */
  range: 12,
  /** No cinematic bokeh during hands-on assessment. */
  bokehScale: 0,
};

/** Resting clinical values — CameraEntrance restores these when it finishes/cancels. */
export const FOCUS_REST = { worldDistance: 2.5, range: 12, bokehScale: 0 } as const;

/** Entrance remains sharp too; camera movement supplies the transition. */
export const FOCUS_WIDE = { worldDistance: 6.0, range: 12, bokehScale: 0 } as const;

export function resetFocusRig(): void {
  focusRig.worldDistance = FOCUS_REST.worldDistance;
  focusRig.range = FOCUS_REST.range;
  focusRig.bokehScale = FOCUS_REST.bokehScale;
}
