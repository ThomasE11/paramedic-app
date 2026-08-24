/**
 * IdleAnimations — condition-responsive procedural motion layered on top of
 * LifeSigns' baseline sway + blink. One useFrame, ref mutations only, no
 * per-frame allocations (same discipline as LifeSigns).
 *
 * The active patient GLBs ship as UNRIGGED meshes (no head/arm bones — see
 * LifeSigns), so every animation here is expressed through Blender-authored
 * local morph targets. The patient root is never moved or rotated:
 *
 *   • Shiver   (shock / hypothermia) — fine irregular distal-limb movement.
 *   • Tremor   (scenario flag)       — regular local distal-limb movement.
 *   • Seizure  (scenario flag)       — rhythmic limb/shoulder movement; the
 *     ONE animation that keeps running while unconscious.
 *   • Gasp     (SpO2 < 90 / effort)  — occasional sharp extra chest rise:
 *     writes `scene.userData.idleGaspBoost`, which BodyMesh's breathing loop
 *     adds to the breathe_chest_rise morph (ordering-safe: whichever frame
 *     callback runs first, the boost lands within one frame).
 *   • Wince    (high pain)           — brief local torso/shoulder guarding
 *     plus an eye squeeze: sets `scene.userData.idleWinceHold`, which
 *     LifeSigns folds into its lid-closed logic.
 *   • Chest clutch (cardiac ACS)     — slower guarding movement toward the
 *     chest with the same eye squeeze at its peak.
 *   • Agitation (distress)           — restless upper-body movement.
 *
 * `reduced` (adaptive-quality low rung) drops the garnish (shiver,
 * agitation); clinical signals (seizure, gasp, wince, clutch) always run.
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import type { IdleCues } from '@/lib/idleCues';
import {
  computePatientMotionSignals,
  type PatientMotionSignals,
} from '@/lib/patientMotion';

export type { IdleCues };

interface IdleAnimationsProps {
  /** The mounted patient clone (BodyMesh's clonedScene). */
  scene: THREE.Object3D;
  /** GCS ≤ 8 / AVPU 'U' / arrest — everything but seizure goes still. */
  unconscious: boolean;
  cues: IdleCues | null;
  /** Adaptive-quality low rung — skip non-essential motion. */
  reduced?: boolean;
}

export function IdleAnimations({ scene, unconscious, cues, reduced = false }: IdleAnimationsProps) {
  const anim = useRef({
    t: 0,
    gate: 0, // eased 0..1 consciousness factor
    // Event schedules (absolute times on t)
    winceStart: -1,
    nextWinceAt: 6 + Math.random() * 8,
    gaspStart: -1,
    nextGaspAt: 4 + Math.random() * 6,
    clutchStart: -1,
    nextClutchAt: 10 + Math.random() * 12,
    motion: {
      motion_gasp: 0,
      motion_wince: 0,
      motion_clutch: 0,
      motion_seizure: 0,
      motion_tremor: 0,
      motion_agitation: 0,
    } satisfies PatientMotionSignals,
  });

  useFrame((_, delta) => {
    const a = anim.current;
    a.t += delta;

    a.gate += ((unconscious ? 0 : 1) - a.gate) * Math.min(1, delta * 1.5);
    const c = a.gate;

    if (cues) {
      // ---- Wince (pain events) ---------------------------------------------
      if (cues.pain01 > 0.45 && c > 0.5) {
        if (a.t >= a.nextWinceAt) {
          a.winceStart = a.t;
          // Worse pain → more frequent winces (roughly every 7–25 s).
          a.nextWinceAt = a.t + (18 - cues.pain01 * 12) + Math.random() * (12 - cues.pain01 * 6);
        }
      }
      // ---- Gasp (hypoxia) — sharp extra chest rise -------------------------
      if (cues.gasping && c > 0.3) {
        if (a.t >= a.nextGaspAt) {
          a.gaspStart = a.t;
          a.nextGaspAt = a.t + 6 + Math.random() * 8; // irregular
        }
      }
      // ---- Chest clutch (cardiac) — slower guarding curl -------------------
      if (cues.chestClutch && c > 0.5) {
        if (a.t >= a.nextClutchAt) {
          a.clutchStart = a.t;
          a.nextClutchAt = a.t + 15 + Math.random() * 15;
        }
      }
    }

    const motion = computePatientMotionSignals({
      time: a.t,
      gate: c,
      cues,
      reduced,
      winceStart: a.winceStart,
      gaspStart: a.gaspStart,
      clutchStart: a.clutchStart,
      out: a.motion,
    });

    // BodyMesh applies these Blender-authored LOCAL morphs on the next frame.
    // The model root stays untouched, keeping the patient planted on the floor
    // or stretcher while shoulders and limbs respond to the condition.
    scene.userData.patientMotion = motion;
    scene.userData.idleGaspBoost = motion.motion_gasp * 0.14;
    scene.userData.idleWinceHold =
      motion.motion_wince > 0.4 || motion.motion_clutch > 0.5;
  });

  return null;
}
