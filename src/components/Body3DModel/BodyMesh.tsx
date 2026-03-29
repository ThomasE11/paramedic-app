/**
 * Realistic 3D human body mesh loaded from GLB model.
 *
 * Uses the Michelle model from Three.js examples — a properly proportioned
 * realistic human figure. Body regions are determined by Y-coordinate of
 * the click intersection point, mapped to secondary survey assessment steps.
 */

import { useState, useRef, useCallback, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { SKIN_COLOR, HOVER_COLOR, ASSESSED_COLOR, ACTIVE_COLOR } from './bodyRegions';
import type { SecondaryAssessmentStep } from '@/data/assessmentFramework';

interface BodyMeshProps {
  assessedRegions: Set<string>;
  onRegionClick: (stepId: string) => void;
  requiredRegions?: Set<string>;
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
  { id: 'head', label: 'Head', description: 'Inspect and palpate scalp, skull, ears', yMin: 1.71, yMax: 1.81 },
  { id: 'face', label: 'Face', description: 'Eyes, nose, mouth, jaw, facial symmetry', yMin: 1.565, yMax: 1.71 },
  { id: 'neck-cspine', label: 'Neck & C-Spine', description: 'Trachea, JVD, C-spine, subcutaneous emphysema', yMin: 1.44, yMax: 1.565 },
  { id: 'chest', label: 'Chest', description: 'Inspect, palpate, percuss, auscultate', yMin: 1.20, yMax: 1.44 },
  { id: 'abdomen', label: 'Abdomen', description: 'Inspect, auscultate, percuss, palpate', yMin: 0.98, yMax: 1.20 },
  { id: 'pelvis', label: 'Pelvis', description: 'Stability test, perineal inspection', yMin: 0.83, yMax: 0.98 },
  // Arms — positioned laterally (x offset from center)
  { id: 'right-arm', label: 'Right Arm', description: 'Pulses, sensation, motor, deformity', yMin: 0.60, yMax: 1.40, xOffset: -0.45, highlightRadius: 0.08 },
  { id: 'left-arm', label: 'Left Arm', description: 'Pulses, sensation, motor, deformity', yMin: 0.60, yMax: 1.40, xOffset: 0.45, highlightRadius: 0.08 },
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

function getRegionAtPoint(point: THREE.Vector3): RegionRange | null {
  // Check posterior first (back of model, z < -0.05)
  if (point.z < -0.05) {
    const posterior = REGION_RANGES.find(r => r.condition === 'back' && point.y >= r.yMin && point.y < r.yMax);
    if (posterior) return posterior;
  }

  // Arms detection: if click is lateral (|X| > threshold) AND in the
  // torso Y range, it's an arm, not chest/abdomen. The model's arms
  // extend outward from X ≈ ±0.20 at shoulders to ±0.85 at hands.
  //
  // Use a graduated X threshold: near the shoulder (Y 1.2-1.44) the arms
  // are closer to the body midline, so use a lower threshold (0.15).
  // Below the shoulder (Y < 1.2) arms extend further out, use 0.20.
  const absX = Math.abs(point.x);
  const armXThreshold = point.y >= 1.20 ? 0.15 : 0.20;
  if (absX > armXThreshold && point.y >= 0.60 && point.y < 1.44) {
    // Determine which arm based on X sign (model faces forward, +X = model's left = viewer's right)
    const limbId = point.x > 0 ? 'left-arm' : 'right-arm';
    lastClickedLimb = limbId;
    return { id: limbId as SecondaryAssessmentStep, label: limbId === 'left-arm' ? 'Left Arm' : 'Right Arm', description: 'Pulses, sensation, motor, deformity', yMin: 0.60, yMax: 1.44 };
  }

  // Legs detection: below pelvis, determine left vs right by X
  if (point.y < 0.83) {
    const limbId = point.x > 0 ? 'left-leg' : 'right-leg';
    lastClickedLimb = limbId;
    return { id: limbId as SecondaryAssessmentStep, label: limbId === 'left-leg' ? 'Left Leg' : 'Right Leg', description: 'Pulses, sensation, motor, deformity', yMin: 0.0, yMax: 0.83 };
  }

  // Clear limb selection for non-extremity clicks
  lastClickedLimb = null;

  // Then check front/lateral regions (no condition)
  return REGION_RANGES.find(r => !r.condition && point.y >= r.yMin && point.y < r.yMax) || null;
}

export function BodyMesh({ assessedRegions, onRegionClick, requiredRegions }: BodyMeshProps) {
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
        mesh.material = new THREE.MeshStandardMaterial({
          color: SKIN_COLOR,
          roughness: 0.65,
          metalness: 0.02,
        });
      }
    });
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

  // Drive continuous rendering for pulse animation when required regions exist
  useFrame((_, delta) => {
    if (requiredRegions && requiredRegions.size > 0) {
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
    if (region) {
      onRegionClick(region.id);
    }
  }, [onRegionClick]);

  // Render region highlight overlays using transparent cylinders
  const regionHighlights = useMemo(() => {
    const highlights: JSX.Element[] = [];
    const required = requiredRegions || new Set<string>();
    // Compute pulse opacity for amber ring
    const pulseOpacity = 0.15 + Math.sin(pulseRef.current * 3) * 0.1;

    for (const region of REGION_RANGES) {
      if (region.condition === 'back') continue; // Don't show overlay for posterior

      const isLimbId = region.id === 'right-arm' || region.id === 'left-arm' || region.id === 'right-leg' || region.id === 'left-leg';
      const isAssessed = assessedRegions.has(region.id) || (isLimbId && assessedRegions.has('extremities'));
      const isHovered = hoveredRegion?.id === region.id;
      const isRequired = required.has(region.id);

      // Show highlights for: assessed, hovered, or required-but-unassessed
      if (!isAssessed && !isHovered && !isRequired) continue;

      const height = region.yMax - region.yMin;
      const centerY = region.yMin + height / 2;
      const xOffset = (region as ExtendedRegionRange).xOffset || 0;
      // Width varies by body part — use custom radius if defined
      const radius = (region as ExtendedRegionRange).highlightRadius
        || (region.id === 'head' || region.id === 'face' ? 0.12
          : region.id === 'neck-cspine' ? 0.08
          : 0.18);

      // Determine color and opacity based on state
      let color: string;
      let opacity: number;

      if (isAssessed && isRequired) {
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
      if (isRequired && !isAssessed) {
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
    }

    return highlights;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessedRegions, hoveredRegion, requiredRegions, pulseRef.current]);

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
