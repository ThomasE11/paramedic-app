/**
 * LifeSigns — procedural "alive" loop for the 3D patient.
 *
 * One useFrame, ref mutations only (no setState, no per-frame allocations):
 *   • Micro idle sway  — two incommensurate sines rotate the model root a
 *     fraction of a degree around the feet, the gentle weight-shift real
 *     standing humans can't suppress. (The active patient GLBs ship as a
 *     single unrigged mesh — no head bone exists — so the sway lives on the
 *     model root rather than the head.) Eases to a perfectly still base pose
 *     when the patient is unconscious (GCS ≤ 8 / AVPU 'U' / arrest).
 *   • Blink            — swaps `material.map` between two PRE-RENDERED canvas
 *     textures (eyes open / skin-toned lids, built once in EyesLayer). A swap
 *     is a sampler-uniform update, not a texture re-upload, so blinking costs
 *     nothing per frame. Conscious patients blink ~120 ms every 2–6 s
 *     (randomised); unconscious patients keep their eyes closed — itself a
 *     clinical cue.
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
    return {
      baseRotX: scene.rotation.x,
      baseRotY: scene.rotation.y,
      baseRotZ: scene.rotation.z,
      eyeMesh: eyeMesh as THREE.Mesh | null,
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
  });

  useFrame((_, delta) => {
    const a = anim.current;
    a.t += delta;

    // ---- Micro idle sway ---------------------------------------------------
    const target = unconscious ? 0 : 1;
    a.sway += (target - a.sway) * Math.min(1, delta * 1.5);
    const s = a.sway;
    // Sub-degree amplitudes around the feet; incommensurate frequencies so
    // the pattern never visibly repeats. When s → 0 this writes the exact
    // base pose, so hit-testing/landmark anchors stay honest.
    scene.rotation.x = nodes.baseRotX + Math.sin(a.t * 0.43) * 0.0022 * s;
    scene.rotation.y = nodes.baseRotY + (Math.sin(a.t * 0.31) * 0.006 + Math.sin(a.t * 0.83) * 0.0025) * s;
    scene.rotation.z = nodes.baseRotZ + Math.sin(a.t * 0.57) * 0.0028 * s;

    // ---- Blink / GCS-coupled lids -----------------------------------------
    const eyeMesh = nodes.eyeMesh;
    if (eyeMesh) {
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
          wantClosed = a.t < a.blinkUntil;
        }
        if (wantClosed !== a.lidsClosed) {
          a.lidsClosed = wantClosed;
          mat.map = wantClosed ? closedTex : openTex;
          // Both textures exist from mount → same shader program; assigning
          // `map` only swaps the sampler uniform. No needsUpdate required.
        }
      }
    }
  });

  return null;
}
