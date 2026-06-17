/**
 * Realistic 3D human body mesh loaded from GLB model.
 *
 * Female cases use a gender-matched GLB. Male cases deliberately fall back to
 * the legacy patient mesh until a complete, browser-safe male GLB is added.
 * We do not render a stylised procedural mannequin in clinical mode because it
 * breaks assessment realism.
 */

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { buildScrubs, CLOTHING_PARTING } from './ClothingLayer';
import { paintEyesOnTexture } from './EyesLayer';
import { setBreathClock } from '@/lib/breathClock';
import type { ThreeEvent } from '@react-three/fiber';
import { HOVER_COLOR, ASSESSED_COLOR, GUIDED_NEXT_COLOR, GUIDED_LOCKED_COLOR } from './bodyRegions';
import type { SecondaryAssessmentStep } from '@/data/assessmentFramework';

interface BodyMeshProps {
  assessedRegions: Set<string>;
  onRegionClick: (stepId: string) => void;
  requiredRegions?: Set<string>;
  /** Phase 2 — guided exam mode. When true, only `nextGuidedStep` is clickable. */
  guidedMode?: boolean;
  /** Phase 2 — the region the student is expected to assess next. */
  nextGuidedStep?: SecondaryAssessmentStep | null;
  /** Phase 2 — called when the student clicks a locked region in guided mode. */
  onBlockedClick?: (attemptedStepId: string, expectedStepId: string) => void;
  /** Optional patient gender — switches to a sex-matched mesh when the
   * project has a complete, browser-safe asset for that sex. */
  patientGender?: 'male' | 'female';
  /** Fade the surface patient when an internal anatomy reference is shown. */
  surfaceOpacity?: number;
  /** Names of finding morph targets that should be ACTIVE (revealed) — e.g.
   *  ['finding_jvd']. BodyMesh ramps these toward full influence and others
   *  back to 0. Driven by the parent from assessed-region + case findings. */
  activeFindingMorphs?: string[];
  /** Respiratory rate (breaths/min). When > 0, drives the breathe_chest_rise
   *  morph as a continuous sine so the patient visibly breathes at the case
   *  rate. 0 / undefined = no breathing animation (e.g. apnoea/arrest). */
  breathRateRpm?: number;
  /** Chest-rise depth multiplier (1 = normal). <1 = shallow (opioid/agonal),
   *  >1 = deep/laboured (Kussmaul). Combined with a fast-breathing taper. */
  breathDepthFactor?: number;
  /** Shock/perfusion skin tint as a colour-multiply (null = normal skin).
   *  Pale grey = hypovolaemia/anaphylaxis; dusky blue = cyanosis/hypoxia. */
  skinTint?: string | null;
  /** Diaphoresis — drops skin roughness for a clammy/sweaty sheen. */
  skinDiaphoretic?: boolean;
  /** Emits a surface-projection function once the mesh is loaded + normalised.
   *  Given an intended (x, y) it returns [x, y, z] on the patient's actual
   *  camera-facing surface, so floating labels/finding markers anchor to the
   *  real body regardless of which GLB (male/female/future) is loaded. Emits
   *  null on unmount/model-swap. */
  onSurfaceSampler?: (sampler: ((x: number, y: number) => [number, number, number]) | null) => void;
  /** Dressed view on/off — shows the scrubs layer derived from this mesh (see ClothingLayer). */
  dressed?: boolean;
  /** Focused region id — the garment piece covering it parts so the skin can be assessed. */
  dressedActiveRegion?: string | null;
  /** Case pupil diameters (mm) — rendered as the model's actual pupils. */
  pupilLeftMm?: number;
  pupilRightMm?: number;
}

/**
 * Resolve which GLB to load. Three meshes ship in `public/models/`:
 *   • patient-female.glb — Ready Player Me brunette-t, A-pose
 *     (~2.7 MB, CC BY-NC 4.0)
 *   • patient-male.glb   — reserved for a validated male patient shell. The
 *     current MPFB/TalkingHead source is not active because it reads visually
 *     female in this examination context.
 *   • patient.glb        — legacy Beta_Surface, T-pose, kept as the
 *     last-resort fallback (~2.8 MB)
 *
 * Why dropping the new meshes in works without retuning the Y-range
 * hit-test table: the primary hit-test path in `getRegionAtPoint`
 * uses weighted nearest-bone against the `mixamorig:*` skeleton, and
 * we re-prefixed the joint names on both new meshes (see
 * `/tmp/prefix-bones.mjs`) so they slot straight into the existing
 * `BONE_REGION_MAP`. The Y-range table is only consulted when the
 * rig isn't traversable, and even then the new meshes are within ±5%
 * of the legacy 1.81m height (1.77m female, 1.92m male) so the
 * Y-band assignments still land in the right region for midline
 * clicks. Pose-induced arm position is irrelevant because the bones
 * carry their region label regardless of where the limb hangs.
 *
 * Tier-1 multi-layer anatomy (Z-Anatomy skin/muscle/skeleton toggles)
 * is a separate component — see `public/models/REALISTIC_ANATOMY.md`.
 */
function resolveModelPath(gender?: 'male' | 'female'): string {
  // The available male candidate is not acceptable for this simulator yet, so
  // keep male cases on the known-good legacy body until a validated MakeHuman
  // or Z-Anatomy-derived shell is exported.
  if (gender === 'male') return '/models/patient.glb';
  if (gender === 'female') return '/models/patient-female.glb';
  return '/models/patient.glb';
}

/**
 * Map Y-coordinate on the model to a body region.
 * Michelle model stands ~1.7 units tall, centered at origin, feet at Y≈0.
 */
interface RegionRange {
  id: SecondaryAssessmentStep;
  label: string;
  description: string;
  yMin: number;
  yMax: number;
  /** If set, only match when |x| or |z| meets this condition */
  condition?: 'front' | 'back' | 'lateral';
}

// Beta_Surface GLB model — measured bounds: Y -0.003 to 1.806 (height 1.81)
// Using 7.5-head proportional system: head unit = 1.81 / 7.5 = 0.241
//
// Anatomical landmarks (Y coordinates):
//   Top of skull:    1.806
//   Crown/forehead:  ~1.71  (where hair starts)
//   Eyes/nose:       ~1.65  (mid-face)
//   Chin:            ~1.565 (bottom of mandible)
//   Neck (C3-C7):    ~1.44 to 1.565
//   Shoulders:       ~1.40
//   Nipple line:     ~1.20
//   Navel:           ~0.98
//   Groin:           ~0.83
//   Knees:           ~0.48
//   Feet:            ~0.00
interface ExtendedRegionRange extends RegionRange {
  /** X offset for limb highlights (arms/legs are not centered) */
  xOffset?: number;
  /** Custom radius for the highlight overlay */
  highlightRadius?: number;
}

// Region Y-bounds aligned to real human anatomy on a 1.81m model
// (percentages from Gray's Anatomy / Drake/Vogl/Mitchell):
//   Head crown:      Y 1.81 (100%)
//   Eyes:            Y ~1.71 (95%)
//   Chin / mandible: Y ~1.56 (86%)
//   Suprasternal notch: Y ~1.46 (81%) — top of chest
//   Nipple line:     Y ~1.30 (72%)
//   Xiphoid / costal margin: Y ~1.16 (64%) — chest / abdomen boundary
//   Umbilicus:       Y ~1.09 (60%) — middle of abdomen
//   ASIS / pelvic crest: Y ~1.00 (55%)
//   Pubic symphysis: Y ~0.91 (50%) — abdomen / pelvis boundary
//   Groin crease:    Y ~0.87 (48%)
//   Greater trochanter: Y ~0.83 (46%) — pelvis / leg boundary
const REGION_RANGES: ExtendedRegionRange[] = [
  { id: 'head', label: 'Head', description: 'Inspect and palpate scalp, skull, ears', yMin: 1.71, yMax: 1.81, highlightRadius: 0.18 },
  { id: 'face', label: 'Face', description: 'Eyes, nose, mouth, jaw, facial symmetry', yMin: 1.56, yMax: 1.71, highlightRadius: 0.15 },
  { id: 'neck-cspine', label: 'Neck & C-Spine', description: 'Trachea, JVD, C-spine, subcutaneous emphysema', yMin: 1.46, yMax: 1.56 },
  // Chest: suprasternal notch down to xiphoid / costal margin
  { id: 'chest', label: 'Chest', description: 'Inspect, palpate, percuss, auscultate', yMin: 1.16, yMax: 1.46 },
  // Abdomen: xiphoid down to pubic symphysis (wraps umbilicus at 1.09)
  { id: 'abdomen', label: 'Abdomen', description: 'Inspect, auscultate, percuss, palpate', yMin: 0.91, yMax: 1.16 },
  // Pelvis: pubic symphysis down to greater trochanter — the narrow band
  // where the pelvic ring + perineum live. Previous 0.83-0.98 was too wide
  // and hijacked mid-abdominal clicks.
  { id: 'pelvis', label: 'Pelvis', description: 'Stability test, perineal inspection', yMin: 0.83, yMax: 0.91 },
  // Arms — positioned laterally (x offset from center)
  { id: 'right-arm', label: 'Right Arm', description: 'Pulses, sensation, motor, deformity', yMin: 0.40, yMax: 1.40, xOffset: -0.45, highlightRadius: 0.14 },
  { id: 'left-arm', label: 'Left Arm', description: 'Pulses, sensation, motor, deformity', yMin: 0.40, yMax: 1.40, xOffset: 0.45, highlightRadius: 0.14 },
  // Legs — positioned laterally
  { id: 'right-leg', label: 'Right Leg', description: 'Pulses, sensation, motor, deformity', yMin: 0.0, yMax: 0.83, xOffset: -0.10, highlightRadius: 0.08 },
  { id: 'left-leg', label: 'Left Leg', description: 'Pulses, sensation, motor, deformity', yMin: 0.0, yMax: 0.83, xOffset: 0.10, highlightRadius: 0.08 },
  { id: 'posterior-logroll', label: 'Posterior / Log Roll', description: 'Log roll with C-spine control. Palpate entire spine.', yMin: 0.83, yMax: 1.56, condition: 'back' },
];

// Amber color for required-but-unassessed regions
const REQUIRED_UNASSESSED_COLOR = '#f59e0b';

// Track which specific limb was clicked for exam panel filtering
export type LimbSide = 'right-arm' | 'left-arm' | 'right-leg' | 'left-leg' | null;
let lastClickedLimb: LimbSide = null;
export function getLastClickedLimb(): LimbSide { return lastClickedLimb; }

// ---------------------------------------------------------------------------
// Bone-based anatomical hit-testing
// ---------------------------------------------------------------------------
// The mesh is a Mixamo Beta rig with 67 named skeletal bones (Head, Neck,
// Spine/Spine1/Spine2, Hips, L/R Shoulder/Arm/ForeArm/Hand/UpLeg/Leg/Foot).
// We use those bones as anatomical anchors — every hit-point is assigned to
// the region whose anchor(s) it sits closest to.
//
// Why bones, not Y-ranges? Three reasons.
//   1. Anatomically correct. Character's left arm stays the character's left
//      regardless of pose, camera angle, or scene rotation. (Mixamo convention:
//      "Left" / "Right" are from the character's frame — which is exactly
//      clinical documentation convention: "patient's left", "patient's right".)
//   2. Pose-agnostic. If the character is repositioned (arms raised, bent,
//      seated) the bone positions still partition the body correctly.
//   3. Boundary accuracy. Costal margin, umbilicus, ASIS — these sit at
//      specific bone positions (Spine1 tail, Spine base, Hips), not at
//      fixed world-Y values. Using bones keeps our "chest vs abdomen vs
//      pelvis" boundaries on real anatomical landmarks.

type RegionId = SecondaryAssessmentStep;

interface Anchor {
  region: RegionId;
  /** Weight multiplier — favour more specific/local bones (e.g. Hand > ForeArm). */
  weight?: number;
  /**
   * World position of the bone, recomputed when the rig mounts. Populated
   * by `updateSkeleton()` below.
   */
  position: THREE.Vector3;
}

// Bone name → anatomical region + relative pull weight. Distal bones (hands,
// feet) get a higher weight so a click on the hand wins over the shoulder
// even when geometrically similar.
const BONE_REGION_MAP: Array<{ bone: string; region: RegionId; weight?: number }> = [
  // Head + face + neck
  { bone: 'mixamorig:HeadTop_End', region: 'head', weight: 1.2 },
  { bone: 'mixamorig:Head', region: 'head', weight: 1.0 },
  // Eyes live inside the Head bone — using them biases toward "face" for
  // anything below the crown.
  { bone: 'mixamorig:LeftEye', region: 'face', weight: 1.3 },
  { bone: 'mixamorig:RightEye', region: 'face', weight: 1.3 },
  { bone: 'mixamorig:Neck', region: 'neck-cspine', weight: 1.2 },

  // Torso: Spine2 = upper chest (sternum/manubrium level), Spine1 = mid
  // chest (xiphoid-ish), Spine = upper abdomen (epigastrium), Hips = pelvis.
  // Spine gets a slight weight bump so the full abdominal expanse between
  // xiphoid and pubic bone reliably resolves to "abdomen" rather than
  // drifting down to the Hips bone at the pelvic-crest level.
  { bone: 'mixamorig:Spine2', region: 'chest', weight: 1.0 },
  { bone: 'mixamorig:Spine1', region: 'chest', weight: 1.1 },
  { bone: 'mixamorig:Spine', region: 'abdomen', weight: 1.3 },
  { bone: 'mixamorig:Hips', region: 'pelvis', weight: 0.9 },

  // Arms — shoulder is on the body edge, so weight it lower than Arm/ForeArm/Hand
  // so a click on the upper lateral chest doesn't drift to the arm.
  { bone: 'mixamorig:LeftShoulder', region: 'left-arm', weight: 0.85 },
  { bone: 'mixamorig:LeftArm', region: 'left-arm', weight: 1.0 },
  { bone: 'mixamorig:LeftForeArm', region: 'left-arm', weight: 1.2 },
  { bone: 'mixamorig:LeftHand', region: 'left-arm', weight: 1.4 },
  { bone: 'mixamorig:RightShoulder', region: 'right-arm', weight: 0.85 },
  { bone: 'mixamorig:RightArm', region: 'right-arm', weight: 1.0 },
  { bone: 'mixamorig:RightForeArm', region: 'right-arm', weight: 1.2 },
  { bone: 'mixamorig:RightHand', region: 'right-arm', weight: 1.4 },

  // Legs — UpLeg is close to the hip crease, so slightly lower weight than
  // thigh/shin/foot (otherwise groin clicks drift to the leg).
  { bone: 'mixamorig:LeftUpLeg', region: 'left-leg', weight: 0.9 },
  { bone: 'mixamorig:LeftLeg', region: 'left-leg', weight: 1.1 },
  { bone: 'mixamorig:LeftFoot', region: 'left-leg', weight: 1.3 },
  { bone: 'mixamorig:RightUpLeg', region: 'right-leg', weight: 0.9 },
  { bone: 'mixamorig:RightLeg', region: 'right-leg', weight: 1.1 },
  { bone: 'mixamorig:RightFoot', region: 'right-leg', weight: 1.3 },
];

// Populated once the rig mounts. Kept module-level so both hover and click
// paths share the same snapshot.
let anchors: Anchor[] = [];

/**
 * Walk a scene tree to collect world positions of every anchor bone.
 * Call after the mesh is added to the scene so world matrices are valid.
 */
function updateSkeleton(root: THREE.Object3D | null): void {
  if (!root) return;
  root.updateMatrixWorld(true);
  const byName = new Map<string, THREE.Object3D>();
  root.traverse((obj) => { if (obj.name) byName.set(obj.name, obj); });

  anchors = BONE_REGION_MAP
    .map(({ bone, region, weight }) => {
      const node = byName.get(bone);
      if (!node) return null;
      const pos = new THREE.Vector3();
      node.getWorldPosition(pos);
      return { region, weight, position: pos } as Anchor;
    })
    .filter((a): a is Anchor => a !== null);
}

/**
 * Find the anatomical region for a hit point.
 *
 * Primary path: weighted nearest-anchor across the rig's skeletal bones.
 * Fallback path: the original Y-coordinate range + lateral-X heuristic,
 * used whenever the bone snapshot is empty or the nearest bone is so far
 * from the hit point that the result would be nonsense.
 *
 * The fallback matters in practice. `scene.clone(true)` on a Mixamo rig
 * does not always produce a tree where the bones are traversable as
 * independent named Object3D nodes (skeleton references can get flattened
 * depending on the GLB exporter). The fallback keeps the feature working
 * in that case; the primary path still wins when the bones are available.
 */
function getRegionAtPoint(point: THREE.Vector3): RegionRange | null {
  // Strategy:
  //   Limbs (arms, legs) — use the bone rig when available (pose-agnostic,
  //     correct for patient's-left vs patient's-right) with an X-threshold
  //     fallback when the rig isn't traversable.
  //   Anterior midline (head, face, neck, chest, abdomen, pelvis) — use the
  //     anatomically-tuned Y-range table. Bones like Hips sit at the pelvic
  //     centre, which is physically inside the abdomen band anatomically;
  //     trusting nearest-bone there produced "Pelvis" labels for mid-abdomen
  //     hits. The Y-range table now uses real landmarks (xiphoid, pubic
  //     symphysis, greater trochanter) so it's authoritative for midline.
  //   Posterior — z < -0.05 on torso returns the log-roll region.

  // --- 1. Posterior first -------------------------------------------------
  if (point.z < -0.05) {
    const posterior = REGION_RANGES.find(r => r.condition === 'back' && point.y >= r.yMin && point.y < r.yMax);
    if (posterior) { lastClickedLimb = null; return posterior; }
  }

  // --- 2. Limb check via bones when available -----------------------------
  // Compare the nearest LIMB bone to the nearest TORSO/HEAD bone. If a limb
  // bone wins decisively, classify as that limb. Otherwise fall through to
  // the Y-range midline decision.
  if (anchors.length > 0) {
    let bestLimb: { anchor: Anchor; score: number } | null = null;
    let bestTorso: { anchor: Anchor; score: number } | null = null;
    for (const a of anchors) {
      const d = point.distanceTo(a.position);
      const score = d / (a.weight ?? 1);
      const isLimb = a.region === 'left-arm' || a.region === 'right-arm' || a.region === 'left-leg' || a.region === 'right-leg';
      if (isLimb) {
        if (!bestLimb || score < bestLimb.score) bestLimb = { anchor: a, score };
      } else {
        if (!bestTorso || score < bestTorso.score) bestTorso = { anchor: a, score };
      }
    }
    // Limb wins only if clearly closer — prevents a shoulder click from
    // hijacking the upper chest (where Arm and Spine2 can be similar).
    if (bestLimb && (!bestTorso || bestLimb.score < bestTorso.score * 0.85)) {
      const limbId = bestLimb.anchor.region;
      lastClickedLimb = limbId as LimbSide;
      return REGION_RANGES.find(r => r.id === limbId)
        || { id: limbId, label: limbId, description: '', yMin: 0, yMax: 0 };
    }
  }

  // --- 3. X-threshold limb fallback (when rig isn't available) -----------
  const absX = Math.abs(point.x);
  const armXThreshold = point.y >= 1.16 ? 0.15 : 0.20;
  if (absX > armXThreshold && point.y >= 0.40 && point.y < 1.46) {
    // Mixamo convention: character faces +Z, +X = patient's left side.
    const limbId = point.x > 0 ? 'left-arm' : 'right-arm';
    lastClickedLimb = limbId;
    const r = REGION_RANGES.find(rr => rr.id === limbId);
    return r || { id: limbId, label: limbId, description: '', yMin: 0.40, yMax: 1.46 };
  }
  if (point.y < 0.83) {
    if (absX > 0.20 && point.y >= 0.40) {
      const limbId = point.x > 0 ? 'left-arm' : 'right-arm';
      lastClickedLimb = limbId;
      const r = REGION_RANGES.find(rr => rr.id === limbId);
      return r || { id: limbId, label: limbId, description: '', yMin: 0.40, yMax: 1.46 };
    }
    const limbId = point.x > 0 ? 'left-leg' : 'right-leg';
    lastClickedLimb = limbId;
    const r = REGION_RANGES.find(rr => rr.id === limbId);
    return r || { id: limbId, label: limbId, description: '', yMin: 0.0, yMax: 0.83 };
  }

  // --- 4. Anterior midline via anatomically-tuned Y-range ----------------
  lastClickedLimb = null;
  return REGION_RANGES.find(r => !r.condition && point.y >= r.yMin && point.y < r.yMax) || null;
}

// ---------------------------------------------------------------------------
// Runtime label anchoring — the ONLY reliable way to label across models.
// ---------------------------------------------------------------------------
// Hardcoded label coordinates can never be correct across different GLBs: the
// legacy (`patient.glb`) and female (`patient-female.glb`) meshes have different
// geometry and proportions. We sample the ACTUAL loaded + normalised mesh and
// project each label onto the
// patient's real camera-facing surface (the camera sits at +Z, so the visible
// front surface for any (x,y) is the vertex with the largest Z there). This
// self-calibrates for any model — no per-model tuning, no guessing.
function buildSurfaceSampler(root: THREE.Object3D | null): ((x: number, y: number) => [number, number, number]) | null {
  if (!root) return null;
  root.updateMatrixWorld(true);
  // The body is the mesh with the most vertices (skips eye/hair/lash meshes).
  let mesh: THREE.Mesh | null = null;
  let best = -1;
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    const geom = m.geometry as THREE.BufferGeometry | undefined;
    if (m.isMesh && geom && geom.attributes && geom.attributes.position) {
      const c = geom.attributes.position.count;
      if (c > best) { best = c; mesh = m; }
    }
  });
  if (!mesh) return null;
  const posAttr = ((mesh as THREE.Mesh).geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
  const mw = (mesh as THREE.Mesh).matrixWorld;
  const N = posAttr.count;
  // Transform every vertex into world (the exam coordinate frame) once, and
  // measure the model's ACTUAL rendered bounds while we're at it.
  const wx = new Float32Array(N), wy = new Float32Array(N), wz = new Float32Array(N);
  const v = new THREE.Vector3();
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < N; i++) {
    v.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)).applyMatrix4(mw);
    wx[i] = v.x; wy[i] = v.y; wz[i] = v.z;
    if (v.x < minX) minX = v.x; if (v.x > maxX) maxX = v.x;
    if (v.y < minY) minY = v.y; if (v.y > maxY) maxY = v.y;
    if (v.z > maxZ) maxZ = v.z;
  }

  // Markers are authored in a normalised frame: feet at y=0, head ≈ y=1.8,
  // centred on x, half-width ≈ 0.5. The real rendered model is frequently NOT
  // that exact size/position (different GLB, normalisation quirks), which made
  // fixed coordinates float ABOVE the head / off the side. Remap every
  // requested point from the authoring frame onto the model's MEASURED bounds
  // so labels land on the actual body regardless of its rendered scale.
  const AUTHOR_H = 1.8, AUTHOR_HALFW = 0.5;
  const H = (maxY - minY) || AUTHOR_H;
  const cx = (minX + maxX) / 2;
  const halfW = ((maxX - minX) / 2) || AUTHOR_HALFW;
  const s = H / AUTHOR_H; // overall scale factor (tolerances/offsets scale too)
  const PROUD = 0.03 * s; // lift the label just off the skin toward the camera

  return (xAuthor: number, yAuthor: number): [number, number, number] => {
    const x = cx + xAuthor * (halfW / AUTHOR_HALFW);
    const y = minY + (yAuthor / AUTHOR_H) * H;
    // Front surface at (x,y) = the largest Z among nearby verts. Try a tight
    // window first, widen if nothing is close (e.g. a lateral limb point).
    const scan = (xTol: number, yTol: number): number | null => {
      let bz = -Infinity, found = false;
      for (let i = 0; i < N; i++) {
        if (Math.abs(wx[i] - x) < xTol && Math.abs(wy[i] - y) < yTol) {
          if (wz[i] > bz) { bz = wz[i]; found = true; }
        }
      }
      return found ? bz : null;
    };
    const z = scan(0.07 * s, 0.05 * s) ?? scan(0.16 * s, 0.11 * s) ?? scan(0.30 * s, 0.18 * s);
    return [x, y, (z ?? maxZ) + PROUD];
  };
}

export function BodyMesh({ assessedRegions, onRegionClick, requiredRegions, guidedMode = false, nextGuidedStep = null, onBlockedClick, patientGender, surfaceOpacity = 1, activeFindingMorphs, breathRateRpm = 0, breathDepthFactor = 1, skinTint = null, skinDiaphoretic = false, onSurfaceSampler, dressed = false, dressedActiveRegion = null, pupilLeftMm = 3.5, pupilRightMm = 3.5 }: BodyMeshProps) {
  // The path is recomputed per render so a `caseData.patientInfo.gender`
  // change (e.g. user picks a different case) swaps the mesh without
  // remounting the parent. useGLTF caches by URL.
  const modelPath = resolveModelPath(patientGender);
  const { scene } = useGLTF(modelPath);
  const [hoveredRegion, setHoveredRegion] = useState<RegionRange | null>(null);
  const meshRef = useRef<THREE.Group>(null);
  // For pulsing animation on required regions
  const pulseRef = useRef(0);
  // Morph-target driving: the skinned mesh that carries the clinical morphs
  // (finding_jvd, finding_abdo_distension, breathe_chest_rise), plus the
  // smoothed per-morph influence we ramp toward each frame, and a breathing
  // phase accumulator.
  const morphMeshRef = useRef<THREE.Mesh | null>(null);
  const morphInfluenceRef = useRef<Record<string, number>>({});
  const breathPhaseRef = useRef(0);

  // Clone the rig with SkeletonUtils so skinned meshes keep their own bone
  // bindings. A regular deep clone can detach limbs on some exported GLBs.
  const clonedScene = useMemo(() => {
    const clone = cloneSkeleton(scene) as THREE.Group;
    const useSolidMaleBodyMaterial = modelPath.includes('patient-male');
    // Both active exam meshes are normalised to face the default camera (+Z).
    // Rotating the legacy patient here shows the posterior surface first while
    // landmarks still describe anterior anatomy, so keep the loaded orientation.
    const rotateLegacyToCamera = false;

    // Preserve the source model's visual detail. The previous implementation
    // replaced every material with one skin shader, which erased eyes, hair,
    // mouth, clothing and texture cues that students need for examination.
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Capture the mesh that carries the clinical morph targets so
        // useFrame can drive its influences (breathing + revealed findings).
        if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          morphMeshRef.current = mesh;
        }
        const meshName = mesh.name.toLowerCase();
        if (useSolidMaleBodyMaterial && meshName === 'human') {
          // The compact MPFB male GLB carries a diffuse texture that can render
          // patchily after compression in Safari/Chromium. Use a solid clinical
          // skin material for the body mesh while preserving the separate eye
          // mesh material, so the patient never appears as disconnected limbs.
          mesh.material = new THREE.MeshStandardMaterial({
            color: '#c58f72',
            roughness: 0.68,
            metalness: 0,
            side: THREE.DoubleSide,
          });
        } else {
          mesh.material = Array.isArray(mesh.material)
            ? mesh.material.map(material => material.clone())
            : mesh.material.clone();
        }
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        materials.forEach((material) => {
          material.transparent = surfaceOpacity < 1;
          material.opacity = surfaceOpacity;
          material.depthWrite = surfaceOpacity >= 1;
          material.needsUpdate = true;
        });
      }
    });

    if (rotateLegacyToCamera) {
      clone.rotation.y = Math.PI;
    }

    // Normalise all GLBs into the clinical exam coordinate frame: feet at Y=0,
    // head near Y=1.8, body centred on X/Z. The male MPFB mesh ships with a
    // baked +0.92m vertical offset, which made the torso/camera alignment look
    // broken and left floating limbs in the viewport.
    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    const height = box.max.y - box.min.y;
    if (Number.isFinite(height) && height > 0.5) {
      const targetHeight = 1.8;
      const modelScale = targetHeight / height;
      const center = box.getCenter(new THREE.Vector3());
      clone.scale.setScalar(modelScale);
      clone.position.set(
        -center.x * modelScale,
        -box.min.y * modelScale,
        -center.z * modelScale,
      );
      clone.updateMatrixWorld(true);
    }

    // Snapshot anchors from the aligned clone so bone hit-testing and floating
    // labels share the same coordinate frame as the rendered patient.
    updateSkeleton(clone);

    // Dressed view: cut scrubs out of the body mesh itself so the garment
    // follows this patient's real geometry (ClothingLayer.buildScrubs).
    // Cosmetic only — a rig/geometry surprise must never break the exam.
    try {
      let bodyMesh: THREE.Mesh | null = null;
      let bestCount = -1;
      clone.traverse((child) => {
        const m = child as THREE.Mesh;
        const g = m.geometry as THREE.BufferGeometry | undefined;
        if (m.isMesh && g && g.attributes && g.attributes.position && g.attributes.position.count > bestCount) {
          bestCount = g.attributes.position.count;
          bodyMesh = m;
        }
      });
      if (bodyMesh) {
        const scrubs = buildScrubs(bodyMesh as THREE.Mesh);
        // Child of the body mesh at identity → inherits its exact placement.
        if (scrubs) (bodyMesh as THREE.Mesh).add(scrubs);
        // Eyes — the skin texture paints the sockets bright red (a placeholder);
        // repaint those texels into proper eyes (sclera/iris/pupil) in place, so
        // they land exactly on the sockets via the model's own UVs and the case
        // pupil size shows. Works on any of the textured patient meshes.
        paintEyesOnTexture(bodyMesh as THREE.Mesh, pupilLeftMm, pupilRightMm);

        // Invisible, generously-sized hit boxes over each arm. The rendered
        // forearm is only a few pixels wide at the overview zoom, so honest
        // clicks slip past it (or graze the torso and read as "abdomen"). Each
        // box spans the arm's measured lateral region — filling it, unlike a
        // thin capsule whose bounding box is mostly empty air — and is tagged
        // with its limb id; the click handler resolves the tag before any
        // geometric guessing. Added to the normalised root (no rotation) so a
        // world-axis box stays world-aligned regardless of the GLB's own node
        // transform.
        try {
          clone.updateMatrixWorld(true);
          const invClone = clone.matrixWorld.clone().invert();
          const cloneScale = clone.scale.x || 1;
          const bm = bodyMesh as THREE.Mesh;
          const posB = (bm.geometry as THREE.BufferGeometry).attributes.position as THREE.BufferAttribute;
          bm.updateWorldMatrix(true, false);
          const mwB = bm.matrixWorld;
          const vB = new THREE.Vector3();
          let minYB = Infinity, maxYB = -Infinity;
          const wpos: Array<[number, number, number]> = new Array(posB.count);
          for (let i = 0; i < posB.count; i++) {
            vB.fromBufferAttribute(posB, i).applyMatrix4(mwB);
            wpos[i] = [vB.x, vB.y, vB.z];
            if (vB.y < minYB) minYB = vB.y;
            if (vB.y > maxYB) maxYB = vB.y;
          }
          const HB = maxYB - minYB;
          const sB = HB / 1.8;
          for (const side of [1, -1] as const) {
            let xn = Infinity, xx = -Infinity, yn = Infinity, yx = -Infinity, zn = Infinity, zx = -Infinity, cnt = 0;
            for (let i = 0; i < posB.count; i++) {
              const [x, y, z] = wpos[i];
              // Clearly-lateral verts (beyond shoulder width) from the upper
              // arm down to the hanging hand. Excludes the shoulder root so the
              // box never steals a lateral-chest click.
              if (Math.sign(x) !== side || Math.abs(x) < 0.18 * sB || y < minYB + 0.42 * HB || y > minYB + 0.86 * HB) continue;
              cnt++;
              if (x < xn) xn = x; if (x > xx) xx = x;
              if (y < yn) yn = y; if (y > yx) yx = y;
              if (z < zn) zn = z; if (z > zx) zx = z;
            }
            if (cnt < 20) continue;
            // Pad so near-misses beside the arm still land on it.
            const padXY = 0.03 * sB, padZ = 0.06 * sB;
            const wCenter = new THREE.Vector3((xn + xx) / 2, (yn + yx) / 2, (zn + zx) / 2);
            const box = new THREE.Mesh(
              new THREE.BoxGeometry(
                ((xx - xn) + 2 * padXY) / cloneScale,
                ((yx - yn) + 2 * padXY) / cloneScale,
                ((zx - zn) + 2 * padZ) / cloneScale,
              ),
              new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
            );
            box.position.copy(wCenter).applyMatrix4(invClone);
            // Mixamo convention: +X is the PATIENT'S left.
            box.userData.limbRegion = side > 0 ? 'left-arm' : 'right-arm';
            box.userData.skipRecolor = true;
            box.name = side > 0 ? 'hit-left-arm' : 'hit-right-arm';
            clone.add(box);
          }
        } catch {
          // hit volumes are a convenience — never break the exam
        }
      }
    } catch {
      // dressing is cosmetic; the exam continues undressed
    }
    return clone;
    // surfaceOpacity & pupil sizes are deliberately omitted from deps: a
    // Skin/Skeleton toggle or pupil change must NOT rebuild the clone (mesh +
    // scrubs + 2048² eye texture repaint). Opacity is applied live by the
    // effect below; the eyes are baked once (live pupil reading is the 2D panel).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, modelPath]);

  // Region state is now communicated with anatomical overlays and landmarks,
  // not by recolouring the whole patient. Keep this callback for the pointer
  // path, but leave the model's real materials untouched.
  const updateMeshColors = useCallback((region: RegionRange | null) => {
    void region;
  }, []);

  // Refresh the skeleton snapshot on mount, after the primitive has been
  // inserted into the r3f scene graph. Walks the MOUNTED group so the bone
  // world matrices are computed in the same frame as pointer hit-points. If
  // the scan finds no bones (skinned-clone flattened the rig) the earlier
  // snapshot from the original scene, taken in the useMemo above, stays
  // valid — the frames match because the parent group is identity.
  useEffect(() => {
    if (!meshRef.current) return;
    const before = anchors.length;
    updateSkeleton(meshRef.current);
    // If the mounted group doesn't expose the bones by name (some GLB
    // exporters flatten the skeleton on clone), anchors end up empty —
    // re-populate from the original scene so the primary path keeps
    // working. The fallback getRegionAtPoint() still works regardless.
    if (anchors.length === 0 && before > 0) updateSkeleton(clonedScene);
  }, [clonedScene]);

  // Emit a surface-projection sampler built from the actual mounted mesh, so
  // the parent can anchor every floating label/finding marker onto the real
  // patient surface (self-calibrating across the male/female/any GLB).
  useEffect(() => {
    if (!onSurfaceSampler) return;
    const sampler = buildSurfaceSampler(meshRef.current ?? clonedScene);
    onSurfaceSampler(sampler);
    return () => onSurfaceSampler(null);
  }, [clonedScene, onSurfaceSampler]);

  // Dressed-view garment: layer on only in dressed mode, and the piece
  // covering the focused region parts so the skin underneath is assessable.
  useEffect(() => {
    const layer = clonedScene.getObjectByName('clothing-layer');
    if (!layer) return;
    layer.visible = dressed;
    const parted = new Set(dressed ? CLOTHING_PARTING[dressedActiveRegion ?? ''] ?? [] : []);
    for (const piece of layer.children) piece.visible = !parted.has(piece.name);
  }, [clonedScene, dressed, dressedActiveRegion]);

  // Surface opacity (Skin = 1, Skeleton = 0.28) is applied to the body material
  // HERE, not baked into the clone build — so toggling the view layer flips a
  // material flag instead of rebuilding the mesh/scrubs/eyes. Scrubs and arm
  // hit-boxes carry skipRecolor and are left untouched (they manage their own
  // visibility).
  useEffect(() => {
    clonedScene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || m.userData?.skipRecolor) return;
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mat of mats) {
        mat.transparent = surfaceOpacity < 1;
        mat.opacity = surfaceOpacity;
        mat.depthWrite = surfaceOpacity >= 1;
        mat.needsUpdate = true;
      }
    });
  }, [clonedScene, surfaceOpacity]);

  // Shock / perfusion appearance: a colour-multiply on the skin (pale grey or
  // dusky blue) plus a clammy sheen (lower roughness) for diaphoresis. Same body
  // mesh set as the opacity effect; white tint = normal skin. The base roughness
  // is captured once so the sheen toggles without clobbering the model's value.
  useEffect(() => {
    clonedScene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || m.userData?.skipRecolor) return;
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mat of mats) {
        const std = mat as THREE.MeshStandardMaterial;
        if (!std.color) continue;
        std.color.set(skinTint ?? '#ffffff');
        if (std.userData.baseRoughness === undefined && typeof std.roughness === 'number') {
          std.userData.baseRoughness = std.roughness;
        }
        const base = typeof std.userData.baseRoughness === 'number' ? std.userData.baseRoughness : 0.7;
        std.roughness = skinDiaphoretic ? Math.min(base, 0.32) : base;
        std.needsUpdate = true;
      }
    });
  }, [clonedScene, skinTint, skinDiaphoretic]);

  // Free the GPU resources WE created on the PREVIOUS clone when a new one
  // replaces it (e.g. a male↔female model switch): the scrubs/hit-box
  // geometry+materials and the painted eye CanvasTexture. The body geometry and
  // any un-painted skin texture are SHARED with the useGLTF cache
  // (SkeletonUtils.clone shares them) and are never disposed. We compare the
  // previous ref instead of returning a cleanup, so React StrictMode's
  // double-invoke can't dispose the live clone.
  const prevCloneRef = useRef<THREE.Object3D | null>(null);
  useEffect(() => {
    const prev = prevCloneRef.current;
    if (prev && prev !== clonedScene) {
      prev.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const created = m.userData?.skipRecolor === true || m.name.startsWith('hit-');
        if (created && m.geometry) m.geometry.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        for (const mat of mats) {
          const map = (mat as THREE.MeshStandardMaterial).map;
          if (map instanceof THREE.CanvasTexture) map.dispose(); // our painted eye texture
          mat.dispose(); // every material in this clone is a per-instance clone/fresh
        }
      });
    }
    prevCloneRef.current = clonedScene;
  }, [clonedScene]);

  // Drive continuous rendering for pulse animation when required regions exist
  // or when guided mode is active (next-step ring needs to pulse).
  useFrame((_, delta) => {
    if ((requiredRegions && requiredRegions.size > 0) || (guidedMode && nextGuidedStep)) {
      pulseRef.current += delta;
    }

    // ---- Drive clinical morph targets ----
    const mesh = morphMeshRef.current;
    if (mesh && mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
      const dict = mesh.morphTargetDictionary;
      const infl = mesh.morphTargetInfluences;
      const active = activeFindingMorphs ?? [];

      // Findings: ramp active morphs toward 1, inactive toward 0 (~0.6s).
      for (const name of Object.keys(dict)) {
        if (name === 'breathe_chest_rise') continue; // handled below
        const target = active.includes(name) ? 1 : 0;
        const cur = morphInfluenceRef.current[name] ?? 0;
        const next = cur + (target - cur) * Math.min(1, delta * 4);
        morphInfluenceRef.current[name] = next;
        const idx = dict[name];
        if (idx !== undefined) infl[idx] = next;
      }

      // Breathing: continuous sine at the case respiratory rate. Apnoea
      // (rate 0) leaves the chest still — itself a finding.
      const idx = dict['breathe_chest_rise'];
      if (idx !== undefined) {
        if (breathRateRpm > 0) {
          const hz = breathRateRpm / 60;
          breathPhaseRef.current += delta * hz * Math.PI * 2;
          // Visible chest-rise depth: case-driven shallow/deep factor, tapered a
          // little more when very tachypnoeic (fast breathing rides shallower).
          // Clamped so shallow stays perceptible and deep never clips. This makes
          // the four states unmistakable: fast (high hz), shallow (low amp), deep
          // (high amp), absent (rpm 0 → no movement, handled below).
          const fastTaper = breathRateRpm >= 34 ? 0.7 : breathRateRpm >= 26 ? 0.85 : 1.0;
          const amp = Math.min(1.35, Math.max(0.25, breathDepthFactor * fastTaper));
          infl[idx] = (0.5 - 0.5 * Math.cos(breathPhaseRef.current)) * amp;
        } else {
          infl[idx] = 0;
        }
        // Publish the phase so auscultation audio can inhale/exhale in sync
        // with the chest the student is watching.
        setBreathClock(breathPhaseRef.current, breathRateRpm);
      }
    }
  });

  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const point = e.point;
    const region = getRegionAtPoint(point);

    if (region !== hoveredRegion) {
      setHoveredRegion(region);
      updateMeshColors(region);
      document.body.style.cursor = region ? 'pointer' : 'auto';
    }
  }, [hoveredRegion, updateMeshColors]);

  const handlePointerOut = useCallback(() => {
    setHoveredRegion(null);
    updateMeshColors(null);
    document.body.style.cursor = 'auto';
  }, [updateMeshColors]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    // A tagged limb hit-box beats coordinate guessing — thin forearms are
    // nearly impossible to ray-hit honestly at the overview zoom.
    const limbHit = (e.intersections ?? [])
      .map(i => i.object.userData?.limbRegion as SecondaryAssessmentStep | undefined)
      .find(Boolean);
    if (limbHit) {
      lastClickedLimb = limbHit as LimbSide;
      if (guidedMode && nextGuidedStep && limbHit !== nextGuidedStep) {
        onBlockedClick?.(limbHit, nextGuidedStep);
        return;
      }
      onRegionClick(limbHit);
      return;
    }
    const region = getRegionAtPoint(e.point);
    if (!region) return;

    // Phase 2 — in guided mode, block clicks on anything other than the
    // expected next step. Let the parent know so it can nudge the student.
    if (guidedMode && nextGuidedStep && region.id !== nextGuidedStep) {
      onBlockedClick?.(region.id, nextGuidedStep);
      return;
    }

    onRegionClick(region.id);
  }, [onRegionClick, guidedMode, nextGuidedStep, onBlockedClick]);

  // Render region highlight overlays using transparent cylinders
  const regionHighlights = useMemo(() => {
    // The big torus ring overlays were removed — they cluttered the view and
    // hid the patient. Region affordance now comes from the small landmark
    // dots (rendered by the parent) plus the hover tooltip. The legacy ring
    // builder below stays in place but is disabled by this guard.
    const ringsEnabled = false;
    const highlights: JSX.Element[] = [];
    if (!ringsEnabled) return highlights;
    const required = requiredRegions || new Set<string>();
    // Compute pulse opacity for amber ring
    const pulseOpacity = 0.15 + Math.sin(pulseRef.current * 3) * 0.1;
    // Phase 2 — stronger pulse for the guided "next" region so it really pops.
    const guidedPulseOpacity = 0.35 + Math.sin(pulseRef.current * 2.5) * 0.2;

    for (const region of REGION_RANGES) {
      if (region.condition === 'back') continue; // Don't show overlay for posterior

      const isLimbId = region.id === 'right-arm' || region.id === 'left-arm' || region.id === 'right-leg' || region.id === 'left-leg';
      const isAssessed = assessedRegions.has(region.id) || (isLimbId && assessedRegions.has('extremities'));
      const isHovered = hoveredRegion?.id === region.id;
      const isRequired = required.has(region.id);
      // Phase 2 — guided mode states
      const isGuidedNext = guidedMode && nextGuidedStep === region.id && !isAssessed;
      const isGuidedLocked = guidedMode && !!nextGuidedStep && region.id !== nextGuidedStep && !isAssessed;

      // Show highlights only when they are instructional: hovered,
      // required, guided next/locked, or assessed+required. Assessed-only
      // regions stay clean so focused face/airway views do not grow large
      // floating outlines over the patient.
      if (!isHovered && !isRequired && !isGuidedNext && !isGuidedLocked) continue;

      const height = region.yMax - region.yMin;
      const centerY = region.yMin + height / 2;
      const xOffset = (region as ExtendedRegionRange).xOffset || 0;
      // Width varies by body part — use custom radius if defined
      const radius = (region as ExtendedRegionRange).highlightRadius
        || (region.id === 'neck-cspine' ? 0.08
          : 0.18);

      // Determine color and opacity based on state
      let color: string;
      let opacity: number;

      if (isGuidedNext) {
        // Guided: indigo pulse on the current step, overrides other states
        color = GUIDED_NEXT_COLOR;
        opacity = isHovered ? 0.65 : guidedPulseOpacity;
      } else if (isGuidedLocked) {
        // Guided: dim grey wash on everything else — still visible so the
        // student can see where they'll go next, but obviously disabled.
        color = GUIDED_LOCKED_COLOR;
        opacity = 0.22;
      } else if (isAssessed && isRequired) {
        color = ASSESSED_COLOR;
        opacity = isHovered ? 0.5 : 0.35;
      } else if (isAssessed) {
        color = ASSESSED_COLOR;
        opacity = isHovered ? 0.45 : 0.25;
      } else if (isRequired && !isAssessed) {
        // Required but not yet assessed: pulsing amber
        color = REQUIRED_UNASSESSED_COLOR;
        opacity = isHovered ? 0.5 : pulseOpacity;
      } else {
        // Hovered: bright cyan
        color = HOVER_COLOR;
        opacity = 0.45;
      }

      const ringDepth = region.id === 'posterior-logroll' ? -0.36 : 0.42;
      const ringHeightScale = Math.max(0.72, Math.min(3.2, height / Math.max(radius * 2, 0.01)));

      highlights.push(
        <mesh
          key={region.id}
          position={[xOffset, centerY, ringDepth]}
          scale={[1, ringHeightScale, 1]}
          userData={{ skipRecolor: true }}
        >
          <torusGeometry args={[radius, 0.008, 8, 48]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={Math.min(opacity + 0.18, 0.72)}
            side={THREE.DoubleSide}
            depthWrite={false}
            emissive={color}
            emissiveIntensity={0.08}
          />
        </mesh>
      );

      // Phase 2B: Add emissive outline ring for required unassessed regions
      if (isRequired && !isAssessed && !isGuidedNext) {
        highlights.push(
          <mesh
            key={`${region.id}-ring`}
            position={[xOffset, centerY, ringDepth + 0.01]}
            scale={[1, ringHeightScale, 1]}
            userData={{ skipRecolor: true }}
          >
            <torusGeometry args={[radius + 0.012, 0.006, 8, 48]} />
            <meshStandardMaterial
              color={REQUIRED_UNASSESSED_COLOR}
              transparent
              opacity={pulseOpacity * 1.5}
              side={THREE.DoubleSide}
              depthWrite={false}
              emissive={REQUIRED_UNASSESSED_COLOR}
              emissiveIntensity={0.3 + Math.sin(pulseRef.current * 3) * 0.2}
            />
          </mesh>
        );
      }

      // Phase 2 — glowing indigo ring on the guided next step
      if (isGuidedNext) {
        highlights.push(
          <mesh
            key={`${region.id}-guided-ring`}
            position={[xOffset, centerY, ringDepth + 0.012]}
            scale={[1, ringHeightScale, 1]}
            userData={{ skipRecolor: true }}
          >
            <torusGeometry args={[radius + 0.018, 0.007, 8, 48]} />
            <meshStandardMaterial
              color={GUIDED_NEXT_COLOR}
              transparent
              opacity={0.5 + Math.sin(pulseRef.current * 2.5) * 0.25}
              side={THREE.DoubleSide}
              depthWrite={false}
              emissive={GUIDED_NEXT_COLOR}
              emissiveIntensity={0.55 + Math.sin(pulseRef.current * 2.5) * 0.3}
            />
          </mesh>
        );
      }
    }

    return highlights;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessedRegions, hoveredRegion, requiredRegions, guidedMode, nextGuidedStep, pulseRef.current]);

  return (
    <group ref={meshRef}>
      {/* Invisible "catch-all" plane behind the body. r3f only fires
          onPointerMove on the mesh the raycast hits, so moving the pointer
          from the body to empty canvas space left the hover state stuck.
          This plane sits behind the model and catches any pointer event
          that missed the anatomy — when it fires, we clear the hover.
          userData.skipRecolor keeps updateMeshColors from recolouring it
          (it has no emissive property → would throw). */}
      <mesh
        position={[0, 0.9, -1.5]}
        userData={{ skipRecolor: true }}
        onPointerMove={(e) => {
          e.stopPropagation();
          handlePointerOut();
        }}
      >
        <planeGeometry args={[8, 4]} />
        <meshBasicMaterial visible={false} side={THREE.DoubleSide} />
      </mesh>

      {/* The actual model */}
      <primitive
        object={clonedScene}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      />

      {/* Region highlight overlays */}
      {regionHighlights}

      {/* The big black hover tooltip was removed \u2014 the small dot markers
          (rendered by the parent) already name each region/landmark on hover,
          so the bulky black label is redundant clutter. Hovering still sets
          the pointer cursor so the body reads as clickable. */}
    </group>
  );
}

// Preload all candidate models. The browser parallelises the requests
// during the initial paint so the first case-open doesn't pay the GLB
// download cost. drei's loader is idempotent — preloading a URL that's
// never used costs ~one HEAD request and nothing else.
useGLTF.preload('/models/patient.glb');
useGLTF.preload('/models/patient-female.glb');
