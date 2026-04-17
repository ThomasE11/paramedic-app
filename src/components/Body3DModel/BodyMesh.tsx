/**
 * Realistic 3D human body mesh loaded from GLB model.
 *
 * Uses the Michelle model from Three.js examples — a properly proportioned
 * realistic human figure. Body regions are determined by Y-coordinate of
 * the click intersection point, mapped to secondary survey assessment steps.
 */

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { SKIN_COLOR, HOVER_COLOR, ASSESSED_COLOR, ACTIVE_COLOR, GUIDED_NEXT_COLOR, GUIDED_LOCKED_COLOR } from './bodyRegions';
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

const REGION_RANGES: ExtendedRegionRange[] = [
  { id: 'head', label: 'Head', description: 'Inspect and palpate scalp, skull, ears', yMin: 1.71, yMax: 1.81, highlightRadius: 0.18 },
  { id: 'face', label: 'Face', description: 'Eyes, nose, mouth, jaw, facial symmetry', yMin: 1.565, yMax: 1.71, highlightRadius: 0.15 },
  { id: 'neck-cspine', label: 'Neck & C-Spine', description: 'Trachea, JVD, C-spine, subcutaneous emphysema', yMin: 1.44, yMax: 1.565 },
  { id: 'chest', label: 'Chest', description: 'Inspect, palpate, percuss, auscultate', yMin: 1.20, yMax: 1.44 },
  { id: 'abdomen', label: 'Abdomen', description: 'Inspect, auscultate, percuss, palpate', yMin: 0.98, yMax: 1.20 },
  { id: 'pelvis', label: 'Pelvis', description: 'Stability test, perineal inspection', yMin: 0.83, yMax: 0.98 },
  // Arms — positioned laterally (x offset from center)
  { id: 'right-arm', label: 'Right Arm', description: 'Pulses, sensation, motor, deformity', yMin: 0.40, yMax: 1.40, xOffset: -0.45, highlightRadius: 0.14 },
  { id: 'left-arm', label: 'Left Arm', description: 'Pulses, sensation, motor, deformity', yMin: 0.40, yMax: 1.40, xOffset: 0.45, highlightRadius: 0.14 },
  // Legs — positioned laterally
  { id: 'right-leg', label: 'Right Leg', description: 'Pulses, sensation, motor, deformity', yMin: 0.0, yMax: 0.83, xOffset: -0.10, highlightRadius: 0.08 },
  { id: 'left-leg', label: 'Left Leg', description: 'Pulses, sensation, motor, deformity', yMin: 0.0, yMax: 0.83, xOffset: 0.10, highlightRadius: 0.08 },
  { id: 'posterior-logroll', label: 'Posterior / Log Roll', description: 'Log roll with C-spine control. Palpate entire spine.', yMin: 0.83, yMax: 1.565, condition: 'back' },
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
  { bone: 'mixamorig:Spine2', region: 'chest', weight: 1.0 },
  { bone: 'mixamorig:Spine1', region: 'chest', weight: 1.0 },
  { bone: 'mixamorig:Spine', region: 'abdomen', weight: 1.0 },
  { bone: 'mixamorig:Hips', region: 'pelvis', weight: 1.0 },

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
 * Find the anatomical region for a hit point. Uses weighted nearest-anchor
 * with a posterior-aware tie-break: when the hit is clearly on the back of
 * the torso (negative Z relative to the spine) we redirect torso clicks to
 * the posterior / log-roll region.
 */
function getRegionAtPoint(point: THREE.Vector3): RegionRange | null {
  if (anchors.length === 0) return null;

  let best: { anchor: Anchor; score: number } | null = null;
  for (const a of anchors) {
    const d = point.distanceTo(a.position);
    // Higher weight → shorter effective distance (more attractive).
    const score = d / (a.weight ?? 1);
    if (!best || score < best.score) best = { anchor: a, score };
  }
  if (!best) return null;

  let regionId: RegionId = best.anchor.region;

  // Posterior override: if click is behind the spine for a torso region,
  // reroute to the log-roll region. The spine bones sit at z ≈ -0.05 to
  // 0.0 in rest pose — anything ≤ -0.08 is clearly the back surface.
  const isTorso = regionId === 'chest' || regionId === 'abdomen' || regionId === 'pelvis';
  if (isTorso && point.z < -0.08) {
    regionId = 'posterior-logroll';
  }

  // Remember the specific limb for the exam panel filter.
  if (regionId === 'left-arm' || regionId === 'right-arm' || regionId === 'left-leg' || regionId === 'right-leg') {
    lastClickedLimb = regionId;
  } else {
    lastClickedLimb = null;
  }

  // Build the RegionRange shape the rest of the component expects. The Y
  // bounds are kept for compatibility with the highlight-overlay renderer
  // downstream but aren't used for hit-testing any more.
  const fromTable = REGION_RANGES.find(r => r.id === regionId);
  if (fromTable) return fromTable;
  return {
    id: regionId,
    label: regionId,
    description: '',
    yMin: 0, yMax: 0,
  };
}

export function BodyMesh({ assessedRegions, onRegionClick, requiredRegions, guidedMode = false, nextGuidedStep = null, onBlockedClick }: BodyMeshProps) {
  const { scene } = useGLTF('/models/patient.glb');
  const [hoveredRegion, setHoveredRegion] = useState<RegionRange | null>(null);
  const [tooltipPos, setTooltipPos] = useState<[number, number, number]>([0, 0, 0]);
  const meshRef = useRef<THREE.Group>(null);
  // For pulsing animation on required regions
  const pulseRef = useRef(0);

  // Clone the scene so we can modify materials
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    // Set initial material to skin tone
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshPhysicalMaterial({
          color: SKIN_COLOR,
          roughness: 0.45,
          metalness: 0.05,
          clearcoat: 0.15,
          clearcoatRoughness: 0.4,
          sheen: 0.3,
          sheenRoughness: 0.5,
          sheenColor: new THREE.Color('#8aa8c0'),
        });
      }
    });
    // Snapshot the skeleton's world-space bone positions for hit-testing.
    // Runs once per scene clone — cheap (67 bones, one matrix update).
    updateSkeleton(clone);
    return clone;
  }, [scene]);

  // Update mesh colors based on hover/assessed state
  const updateMeshColors = useCallback((region: RegionRange | null) => {
    if (!meshRef.current) return;
    meshRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        // Default skin color
        mat.color.set(SKIN_COLOR);
        mat.emissive.set('#000000');
        mat.emissiveIntensity = 0;
      }
    });
  }, []);

  // Refresh the skeleton snapshot on mount, after the primitive has been
  // inserted into the r3f scene graph. The useMemo snapshot above runs before
  // any parent transforms could apply — this effect guarantees anchors are in
  // the same world frame as the pointer hit-points.
  useEffect(() => {
    if (meshRef.current) updateSkeleton(meshRef.current);
  }, [clonedScene]);

  // Drive continuous rendering for pulse animation when required regions exist
  // or when guided mode is active (next-step ring needs to pulse).
  useFrame((_, delta) => {
    if ((requiredRegions && requiredRegions.size > 0) || (guidedMode && nextGuidedStep)) {
      pulseRef.current += delta;
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
    if (region) {
      setTooltipPos([point.x + 0.3, point.y + 0.1, point.z]);
    }
  }, [hoveredRegion, updateMeshColors]);

  const handlePointerOut = useCallback(() => {
    setHoveredRegion(null);
    updateMeshColors(null);
    document.body.style.cursor = 'auto';
  }, [updateMeshColors]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
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
    const highlights: JSX.Element[] = [];
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

      // Show highlights for: assessed, hovered, required-but-unassessed,
      // or (in guided mode) the next step and locked regions.
      if (!isAssessed && !isHovered && !isRequired && !isGuidedNext && !isGuidedLocked) continue;

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

      highlights.push(
        <mesh
          key={region.id}
          position={[xOffset, centerY, 0]}
        >
          <cylinderGeometry args={[radius, radius, height, 16, 1, true]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={opacity}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      );

      // Phase 2B: Add emissive outline ring for required unassessed regions
      if (isRequired && !isAssessed && !isGuidedNext) {
        highlights.push(
          <mesh
            key={`${region.id}-ring`}
            position={[xOffset, centerY, 0]}
          >
            <cylinderGeometry args={[radius + 0.005, radius + 0.005, height, 16, 1, true]} />
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
            position={[xOffset, centerY, 0]}
          >
            <cylinderGeometry args={[radius + 0.008, radius + 0.008, height, 16, 1, true]} />
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
      {/* The actual model */}
      <primitive
        object={clonedScene}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      />

      {/* Region highlight overlays */}
      {regionHighlights}

      {/* Hover tooltip */}
      {hoveredRegion && (
        <Html position={tooltipPos} distanceFactor={4} zIndexRange={[100, 0]}>
          <div className="px-3 py-2 rounded-xl bg-black/90 text-white text-xs font-medium pointer-events-none shadow-xl border border-white/10 backdrop-blur-sm max-w-[220px]">
            <div className="font-bold text-sm">
              {hoveredRegion.label}
              {(assessedRegions.has(hoveredRegion.id) || ((hoveredRegion.id === 'right-arm' || hoveredRegion.id === 'left-arm' || hoveredRegion.id === 'right-leg' || hoveredRegion.id === 'left-leg') && assessedRegions.has('extremities'))) && (
                <span className="ml-1.5 text-green-400">{'\u2713'}</span>
              )}
              {requiredRegions?.has(hoveredRegion.id) && !assessedRegions.has(hoveredRegion.id) && (
                <span className="ml-1.5 text-amber-400 text-[10px]">required</span>
              )}
              {guidedMode && nextGuidedStep && hoveredRegion.id === nextGuidedStep && (
                <span className="ml-1.5 text-indigo-300 text-[10px]">next step</span>
              )}
              {guidedMode && nextGuidedStep && hoveredRegion.id !== nextGuidedStep && !assessedRegions.has(hoveredRegion.id) && (
                <span className="ml-1.5 text-slate-400 text-[10px]">locked</span>
              )}
            </div>
            <div className="text-[10px] text-white/60 mt-0.5 max-w-[200px] leading-relaxed">
              {hoveredRegion.description}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Preload the model
useGLTF.preload('/models/patient.glb');
