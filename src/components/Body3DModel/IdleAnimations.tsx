/**
 * IdleAnimations — condition-responsive procedural motion layered on top of
 * LifeSigns' baseline sway + blink. One useFrame, ref mutations only, no
 * per-frame allocations (same discipline as LifeSigns).
 *
 * The active patient GLBs ship as a single UNRIGGED mesh (no head/arm bones —
 * see LifeSigns) and carry only the clinical morphs (breathe_chest_rise,
 * finding_*), so every animation here is expressed through what the asset
 * actually supports:
 *
 *   • Shiver   (shock / hypothermia) — 10 Hz sub-2mm root-position jitter.
 *   • Tremor   (scenario flag)       — 5.5 Hz fine regular oscillation.
 *   • Seizure  (scenario flag)       — 4.5 Hz rhythmic shake, larger and
 *     multi-axis; the ONE animation that keeps running while unconscious.
 *   • Gasp     (SpO2 < 90 / effort)  — occasional sharp extra chest rise:
 *     writes `scene.userData.idleGaspBoost`, which BodyMesh's breathing loop
 *     adds to the breathe_chest_rise morph (ordering-safe: whichever frame
 *     callback runs first, the boost lands within one frame).
 *   • Wince    (high pain)           — brief whole-body tense (small curl)
 *     plus an eye squeeze: sets `scene.userData.idleWinceHold`, which
 *     LifeSigns folds into its lid-closed logic.
 *   • Chest clutch (cardiac ACS)     — slower, deeper guarding curl toward
 *     the chest with the same eye squeeze at its peak.
 *     ponytail: unrigged mesh — no arm bones, so the clutch reads as a
 *     guarding curl; upgrade to real arm IK when a rigged GLB ships.
 *   • Agitation (distress)           — restless positional shifting: a slow
 *     random-walk offset re-rolled every few seconds.
 *
 * Rotation writes are ADDITIVE and rely on mounting AFTER LifeSigns (sibling
 * order = frame-callback order), which writes the root rotation absolutely
 * each frame. Position writes are absolute against the base captured per
 * clone — nothing else animates scene.position.
 *
 * `reduced` (adaptive-quality low rung) drops the garnish (shiver,
 * agitation); clinical signals (seizure, gasp, wince, clutch) always run.
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { IdleCues } from '@/lib/idleCues';

export type { IdleCues };

const TAU = Math.PI * 2;
const WINCE_S = 0.9;
const GASP_S = 0.8;
const CLUTCH_S = 2.4;

/** Raised-cosine 0→1→0 envelope for an event that started at `start`. */
const pulse = (t: number, start: number, dur: number): number =>
  t < start || t > start + dur ? 0 : 0.5 - 0.5 * Math.cos(((t - start) / dur) * TAU);

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
  // Base position captured once per clone — BodyMesh's normalisation runs at
  // clone build time, so this is the settled neutral (same pattern as
  // LifeSigns' base rotation capture).
  const base = useMemo(
    () => ({ x: scene.position.x, z: scene.position.z }),
    [scene],
  );

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
    // Agitation random-walk target + eased current offset
    agTargetX: 0,
    agTargetZ: 0,
    agX: 0,
    agZ: 0,
    nextAgitateAt: 2 + Math.random() * 4,
  });

  useFrame((_, delta) => {
    const a = anim.current;
    a.t += delta;

    a.gate += ((unconscious ? 0 : 1) - a.gate) * Math.min(1, delta * 1.5);
    const c = a.gate;

    let px = 0;
    let pz = 0;
    let rx = 0;
    let rz = 0;
    let gaspBoost = 0;
    let winceHold = false;

    if (cues) {
      // ---- Seizure / tremor (mutually exclusive amplitudes) ----------------
      if (cues.seizure) {
        // Regular rhythmic shaking — NOT gated on consciousness.
        const f = a.t * TAU * 4.5;
        px += Math.sin(f) * 0.011 + Math.sin(f * 1.7) * 0.004;
        pz += Math.sin(f * 0.8) * 0.005;
        rz += Math.sin(f * 0.9) * 0.02;
        rx += Math.sin(f * 1.3) * 0.008;
      } else if (cues.tremor) {
        const f = a.t * TAU * 5.5;
        px += Math.sin(f) * 0.004 * c;
        rz += Math.sin(f * 1.1) * 0.007 * c;
      }

      // ---- Shiver (shock / cold) — fine, fast, irregular -------------------
      if (!reduced && cues.shivering && !cues.seizure) {
        const f = a.t * TAU * 10;
        px += (Math.sin(f) + Math.sin(f * 1.31) * 0.6) * 0.0016 * c;
        pz += Math.sin(f * 0.87) * 0.0012 * c;
      }

      // ---- Wince (pain events) ---------------------------------------------
      if (cues.pain01 > 0.45 && c > 0.5) {
        if (a.t >= a.nextWinceAt) {
          a.winceStart = a.t;
          // Worse pain → more frequent winces (roughly every 7–25 s).
          a.nextWinceAt = a.t + (18 - cues.pain01 * 12) + Math.random() * (12 - cues.pain01 * 6);
        }
      }
      const winceE = pulse(a.t, a.winceStart, WINCE_S) * c;
      rx += winceE * 0.03; // tense curl, ~1.7° at peak
      rz += winceE * 0.012;
      winceHold = winceHold || winceE > 0.4;

      // ---- Gasp (hypoxia) — sharp extra chest rise -------------------------
      if (cues.gasping && c > 0.3) {
        if (a.t >= a.nextGaspAt) {
          a.gaspStart = a.t;
          a.nextGaspAt = a.t + 6 + Math.random() * 8; // irregular
        }
      }
      const gaspE = pulse(a.t, a.gaspStart, GASP_S) * c;
      gaspBoost = gaspE * 0.5;
      rx -= gaspE * 0.012; // slight lift with the effort

      // ---- Chest clutch (cardiac) — slower guarding curl -------------------
      if (cues.chestClutch && c > 0.5) {
        if (a.t >= a.nextClutchAt) {
          a.clutchStart = a.t;
          a.nextClutchAt = a.t + 15 + Math.random() * 15;
        }
      }
      const clutchE = pulse(a.t, a.clutchStart, CLUTCH_S) * c;
      rx += clutchE * 0.045; // ~2.6° forward curl at peak
      rz += clutchE * 0.015;
      winceHold = winceHold || clutchE > 0.5;

      // ---- Agitation — restless positional shifting ------------------------
      if (!reduced && cues.agitated && c > 0.5) {
        if (a.t >= a.nextAgitateAt) {
          a.agTargetX = (Math.random() - 0.5) * 0.014;
          a.agTargetZ = (Math.random() - 0.5) * 0.01;
          a.nextAgitateAt = a.t + 2.5 + Math.random() * 3.5;
        }
      } else {
        a.agTargetX = 0;
        a.agTargetZ = 0;
      }
      const k = Math.min(1, delta * 2);
      a.agX += (a.agTargetX - a.agX) * k;
      a.agZ += (a.agTargetZ - a.agZ) * k;
      px += a.agX * c;
      pz += a.agZ * c;
    }

    // Absolute position against the captured base (sole per-frame writer);
    // additive rotation on top of LifeSigns' absolute base+sway write.
    scene.position.x = base.x + px;
    scene.position.z = base.z + pz;
    scene.rotation.x += rx;
    scene.rotation.z += rz;
    scene.userData.idleGaspBoost = gaspBoost;
    scene.userData.idleWinceHold = winceHold;
  });

  return null;
}
