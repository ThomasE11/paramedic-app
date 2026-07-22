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
  /** World-space focus distance (m). Resting: 2.5 (the patient). */
  worldDistance: 2.5,
  /** World-space sharp zone around the focus point (m). */
  range: 1.8,
  /** Bokeh blur scale. Higher during the entrance, settles to resting. */
  bokehScale: 2.2,
};

/** Resting values — CameraEntrance restores these when it finishes/cancels. */
export const FOCUS_REST = { worldDistance: 2.5, range: 1.8, bokehScale: 2.2 } as const;

/** Entrance start values — deep, soft focus on the wider room. */
export const FOCUS_WIDE = { worldDistance: 6.0, range: 1.2, bokehScale: 3.4 } as const;

export function resetFocusRig(): void {
  focusRig.worldDistance = FOCUS_REST.worldDistance;
  focusRig.range = FOCUS_REST.range;
  focusRig.bokehScale = FOCUS_REST.bokehScale;
}
