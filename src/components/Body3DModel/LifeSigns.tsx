/**
 * LifeSigns — procedural "alive" loop for the 3D patient.
 *
 * One useFrame, ref mutations only (no setState, no per-frame allocations):
 *   • Micro idle sway  — two incommensurate sines rotate the model root a
 *     fraction of a degree around the feet, the gentle weight-shift real
 *     standing humans can't suppress. Whole-skeleton idle/walk clips are now
 *     selected by BodyMesh for ambulatory cases; this layer keeps the staged
 *     root planted and supplies eyes/lids for every posture. Unconscious
 *     patients remain still (GCS ≤ 8 / AVPU 'U' / arrest).
 *   • Blink            — the resp-001 pilot closes physical, skinned lids
 *     over 180 ms while retaining the eyeballs underneath. Other models keep
 *     the shared 120 ms pre-rendered eye texture swap and hide real eyeballs
 *     during closure. Both paths blink every 2–6 s and retain the existing
 *     unconscious/held-wince closure signal.
 *   • Micro-saccades   — real eyes are never still: tiny conjugate gaze
 *     shifts every ~0.8–3 s (fast ease, both eyes together) on the eye mesh
 *     rotations. Suppressed when unconscious. No-op on painted-eye models.
 *
 * Breathing is NOT here: chest rise is a clinical vital-sign signal driven by
 * the live respiratory rate through the `breathe_chest_rise` morph target in
 * BodyMesh's frame loop (kept there so it stays phase-locked with the
 * auscultation breath clock).
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BLINK_SECONDS = 0.12;
const PILOT_BLINK_SECONDS = 0.18;
const BLINK_MIN_GAP = 2;
const BLINK_EXTRA_GAP = 4; // gap = MIN + rand * EXTRA → 2–6 s

interface LifeSignsProps {
  /** The mounted patient clone (BodyMesh's clonedScene). */
  scene: THREE.Object3D;
  /** GCS ≤ 8 / AVPU 'U' / arrest — lie still, eyes stay closed. */
  unconscious: boolean;
}

export function LifeSigns({ scene, unconscious }: LifeSignsProps) {
  // Resolve the animated targets once per clone: the model root's base pose
  // (set by BodyMesh's normalisation — must be treated as the neutral) and
  // the mesh whose material holds the pre-rendered open/closed eye textures
  // (see EyesLayer; absent when the repaint didn't run — blink then disables
  // itself gracefully).
  const nodes = useMemo(() => {
    let eyeMesh: THREE.Mesh | null = null;
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!eyeMesh && m.isMesh && m.userData.eyesOpenTex) eyeMesh = m;
    });
    // Stage-2 real eyeball meshes (cached refs — no per-frame traversal).
    // Absent on painted-eye models; every eyeball feature then no-ops.
    const eyeL = (scene.getObjectByName('eyeL') as THREE.Object3D | undefined) ?? null;
    const eyeR = (scene.getObjectByName('eyeR') as THREE.Object3D | undefined) ?? null;
    const lids = (scene.getObjectByName('PilotEyelids') as THREE.Mesh | undefined) ?? null;
    return {
      baseRotX: scene.rotation.x,
      baseRotY: scene.rotation.y,
      baseRotZ: scene.rotation.z,
      eyeMesh: eyeMesh as THREE.Mesh | null,
      eyeL,
      eyeR,
      lids,
    };
  }, [scene]);

  // All mutable animation state lives in one plain-object ref — nothing is
  // allocated inside the frame loop.
  const anim = useRef({
    t: 0,
    sway: 0, // 0..1 eased "consciousness" factor for the idle motion
    nextBlinkAt: BLINK_MIN_GAP + Math.random() * BLINK_EXTRA_GAP,
    blinkUntil: 0,
    lidsClosed: false,
    // Micro-saccade state (real-eye models only): conjugate gaze target the
    // eye rotations ease toward, re-rolled every 0.8–3 s.
    nextSaccadeAt: 1 + Math.random() * 2,
    saccadeX: 0, // pitch (rad)
    saccadeY: 0, // yaw (rad)
  });

  useFrame((_, delta) => {
    const a = anim.current;
    a.t += delta;

    // ---- Stable patient root -----------------------------------------------
    // Rotating the entire scene as "idle sway" pivots a supine/collapsed body
    // through its support surface and also fights the fitted skeleton's
    // ambulatory clips. Keep the root at its authored/staged transform;
    // breathing is driven by the chest morph and eyes move independently.
    const target = unconscious ? 0 : 1;
    a.sway += (target - a.sway) * Math.min(1, delta * 1.5);
    scene.rotation.x = nodes.baseRotX;
    scene.rotation.y = nodes.baseRotY;
    scene.rotation.z = nodes.baseRotZ;

    // ---- Blink / GCS-coupled lids -----------------------------------------
    const eyeMesh = nodes.eyeMesh;
    if (nodes.lids?.morphTargetDictionary?.eyelids_closed !== undefined) {
      // Physical pilot lids retain the eyeballs behind the moving panels.
      // Closing is faster than reopening; the brief overlap hides the socket
      // without replacing the whole face atlas or making the eyeballs vanish.
      if (!unconscious && a.t >= a.nextBlinkAt) {
        a.blinkUntil = a.t + PILOT_BLINK_SECONDS;
        a.nextBlinkAt = a.t + BLINK_MIN_GAP + Math.random() * BLINK_EXTRA_GAP;
      }
      const phase = THREE.MathUtils.clamp((a.t - a.blinkUntil + PILOT_BLINK_SECONDS) / PILOT_BLINK_SECONDS, 0, 1);
      const closure = unconscious || scene.userData.idleWinceHold === true ? 1
        : phase < .3 ? THREE.MathUtils.smoothstep(phase, 0, .3)
          : 1 - THREE.MathUtils.smoothstep(phase, .5, 1);
      nodes.lids.morphTargetInfluences![nodes.lids.morphTargetDictionary.eyelids_closed] = closure;
      if (nodes.eyeL) nodes.eyeL.visible = true;
      if (nodes.eyeR) nodes.eyeR.visible = true;
    } else if (eyeMesh) {
      const openTex = eyeMesh.userData.eyesOpenTex as THREE.Texture | undefined;
      const closedTex = eyeMesh.userData.eyesClosedTex as THREE.Texture | null | undefined;
      const mat = (Array.isArray(eyeMesh.material) ? eyeMesh.material[0] : eyeMesh.material) as
        | THREE.MeshStandardMaterial
        | undefined;
      if (openTex && closedTex && mat) {
        let wantClosed: boolean;
        if (unconscious) {
          wantClosed = true; // persistent closed lids — a clinical finding
        } else {
          if (a.t >= a.nextBlinkAt) {
            a.blinkUntil = a.t + BLINK_SECONDS;
            a.nextBlinkAt = a.t + BLINK_MIN_GAP + Math.random() * BLINK_EXTRA_GAP;
          }
          // idleWinceHold: IdleAnimations squeezes the eyes shut during a
          // wince/chest-clutch peak — reuses this same lid-texture swap.
          wantClosed = a.t < a.blinkUntil || scene.userData.idleWinceHold === true;
        }
        if (wantClosed !== a.lidsClosed) {
          a.lidsClosed = wantClosed;
          mat.map = wantClosed ? closedTex : openTex;
          // Both textures exist from mount → same shader program; assigning
          // `map` only swaps the sampler uniform. No needsUpdate required.
          // Real eyeballs hide while the lids are closed (visible = open
          // eyes only) so the spheres never pierce the painted lids.
          if (nodes.eyeL) nodes.eyeL.visible = !wantClosed;
          if (nodes.eyeR) nodes.eyeR.visible = !wantClosed;
        }
      }
    }

    // ---- Micro-saccades (real-eye models) ----------------------------------
    if (nodes.eyeL && nodes.eyeR) {
      if (unconscious) {
        a.saccadeX = 0;
        a.saccadeY = 0;
      } else if (a.t >= a.nextSaccadeAt) {
        a.saccadeX = (Math.random() - 0.5) * 0.06; // ±1.7° pitch
        a.saccadeY = (Math.random() - 0.5) * 0.12; // ±3.4° yaw
        a.nextSaccadeAt = a.t + 0.8 + Math.random() * 2.2;
      }
      // Saccades are fast (~40 ms) — snap toward the target, conjugate on
      // both eyes. Writes tiny rotations only; iris/pupil ride along as
      // children of the eye node.
      const k = Math.min(1, delta * 18);
      const ex = nodes.eyeL.rotation.x + (a.saccadeX - nodes.eyeL.rotation.x) * k;
      const ey = nodes.eyeL.rotation.y + (a.saccadeY - nodes.eyeL.rotation.y) * k;
      nodes.eyeL.rotation.x = ex;
      nodes.eyeL.rotation.y = ey;
      nodes.eyeR.rotation.x = ex;
      nodes.eyeR.rotation.y = ey;
    }
  });

  return null;
}
