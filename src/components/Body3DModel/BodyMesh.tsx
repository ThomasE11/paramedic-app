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
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { SKIN_COLOR, HOVER_COLOR, ASSESSED_COLOR } from './bodyRegions';
import type { SecondaryAssessmentStep } from '@/data/assessmentFramework';

interface BodyMeshProps {
  assessedRegions: Set<string>;
  onRegionClick: (stepId: string) => void;
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
const REGION_RANGES: RegionRange[] = [
  { id: 'head', label: 'Head', description: 'Inspect and palpate scalp, skull, ears', yMin: 1.71, yMax: 1.81 },
  { id: 'face', label: 'Face', description: 'Eyes, nose, mouth, jaw, facial symmetry', yMin: 1.565, yMax: 1.71 },
  { id: 'neck-cspine', label: 'Neck & C-Spine', description: 'Trachea, JVD, C-spine, subcutaneous emphysema', yMin: 1.44, yMax: 1.565 },
  { id: 'chest', label: 'Chest', description: 'Inspect, palpate, percuss, auscultate', yMin: 1.20, yMax: 1.44 },
  { id: 'abdomen', label: 'Abdomen', description: 'Inspect, auscultate, percuss, palpate', yMin: 0.98, yMax: 1.20 },
  { id: 'pelvis', label: 'Pelvis', description: 'Stability test, perineal inspection', yMin: 0.83, yMax: 0.98 },
  { id: 'extremities', label: 'Extremities', description: 'Pulses, sensation, motor, deformity', yMin: 0.0, yMax: 0.83 },
  { id: 'posterior-logroll', label: 'Posterior / Log Roll', description: 'Log roll with C-spine control. Palpate entire spine.', yMin: 0.83, yMax: 1.565, condition: 'back' },
];

function getRegionAtPoint(point: THREE.Vector3): RegionRange | null {
  // Check posterior first (back of model, z < -0.05)
  if (point.z < -0.05) {
    const posterior = REGION_RANGES.find(r => r.condition === 'back' && point.y >= r.yMin && point.y < r.yMax);
    if (posterior) return posterior;
  }
  // Then check front/lateral regions (no condition)
  return REGION_RANGES.find(r => !r.condition && point.y >= r.yMin && point.y < r.yMax) || null;
}

export function BodyMesh({ assessedRegions, onRegionClick }: BodyMeshProps) {
  const { scene } = useGLTF('/models/patient.glb');
  const [hoveredRegion, setHoveredRegion] = useState<RegionRange | null>(null);
  const [tooltipPos, setTooltipPos] = useState<[number, number, number]>([0, 0, 0]);
  const meshRef = useRef<THREE.Group>(null);

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

    for (const region of REGION_RANGES) {
      if (region.condition === 'back') continue; // Don't show overlay for posterior

      const isAssessed = assessedRegions.has(region.id);
      const isHovered = hoveredRegion?.id === region.id;

      if (!isAssessed && !isHovered) continue;

      const height = region.yMax - region.yMin;
      const centerY = region.yMin + height / 2;
      // Width varies by body part
      const radius = region.id === 'head' || region.id === 'face' ? 0.12
        : region.id === 'neck-cspine' ? 0.08
        : region.id === 'extremities' ? 0.25
        : 0.18;

      highlights.push(
        <mesh
          key={region.id}
          position={[0, centerY, 0]}
        >
          <cylinderGeometry args={[radius, radius, height, 16, 1, true]} />
          <meshStandardMaterial
            color={isAssessed ? ASSESSED_COLOR : HOVER_COLOR}
            transparent
            opacity={isHovered ? 0.35 : 0.2}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      );
    }

    return highlights;
  }, [assessedRegions, hoveredRegion]);

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
              {assessedRegions.has(hoveredRegion.id) && (
                <span className="ml-1.5 text-green-400">✓</span>
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
