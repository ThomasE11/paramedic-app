/**
 * Body region geometry definitions mapping to secondary survey assessment steps.
 *
 * Uses anatomically proportioned geometries with proper human body ratios.
 * Based on standard 7.5-head-height proportional system used in medical illustration.
 */

import type { SecondaryAssessmentStep } from '@/data/assessmentFramework';

export interface RegionGeometry {
  type: 'sphere' | 'cylinder' | 'capsule' | 'box' | 'lathe';
  args: number[];
}

export interface BodyRegionChild {
  geometry: RegionGeometry;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface BodyRegionDef {
  id: SecondaryAssessmentStep;
  label: string;
  description: string;
  geometry: RegionGeometry;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  children?: BodyRegionChild[];
}

/**
 * Anatomically proportioned body regions.
 * Total height ~5.5 units (realistic human proportions).
 *
 * Proportions based on medical illustration standards:
 * - Head: 1/7.5 of total height
 * - Torso: navel at midpoint
 * - Arms: fingertips at mid-thigh
 * - Legs: half total height
 */
export const BODY_REGIONS: BodyRegionDef[] = [
  // ========== HEAD ==========
  // Cranium — elongated sphere with proper skull shape
  {
    id: 'head',
    label: 'Head',
    description: 'Inspect scalp, palpate skull for deformity, check ears (Battle sign, CSF)',
    geometry: { type: 'sphere', args: [0.28, 32, 32] },
    position: [0, 4.95, 0],
    scale: [1, 1.15, 1.05],
  },
  // ========== FACE ==========
  // Face — flattened ovoid on anterior of head
  {
    id: 'face',
    label: 'Face',
    description: 'Eyes (PERRL), nose, mouth, jaw stability, facial symmetry',
    geometry: { type: 'sphere', args: [0.2, 24, 24] },
    position: [0, 4.78, 0.16],
    scale: [0.85, 1.0, 0.5],
  },
  // ========== NECK / C-SPINE ==========
  {
    id: 'neck-cspine',
    label: 'Neck & C-Spine',
    description: 'Trachea position, JVD, C-spine tenderness, subcutaneous emphysema',
    geometry: { type: 'cylinder', args: [0.13, 0.16, 0.28, 16] },
    position: [0, 4.5, 0],
  },
  // ========== CHEST ==========
  // Ribcage — tapered torso shape (wider at shoulders, narrower at waist)
  {
    id: 'chest',
    label: 'Chest',
    description: 'Inspect, palpate, percuss. Symmetry, crepitus, flail, wounds. Auscultate separately.',
    geometry: { type: 'box', args: [0.72, 0.75, 0.38] },
    position: [0, 3.95, 0],
    scale: [1, 1, 1],
    children: [
      // Shoulders — rounded caps
      { geometry: { type: 'sphere', args: [0.15, 16, 16] }, position: [0.42, 4.15, 0], scale: [1, 0.8, 0.9] },
      { geometry: { type: 'sphere', args: [0.15, 16, 16] }, position: [-0.42, 4.15, 0], scale: [1, 0.8, 0.9] },
    ],
  },
  // ========== ABDOMEN ==========
  {
    id: 'abdomen',
    label: 'Abdomen',
    description: 'Inspect, auscultate bowel sounds, palpate all 4 quadrants, percussion. Guarding, rigidity.',
    geometry: { type: 'box', args: [0.65, 0.6, 0.35] },
    position: [0, 3.2, 0],
    scale: [1, 1, 1],
  },
  // ========== PELVIS ==========
  {
    id: 'pelvis',
    label: 'Pelvis',
    description: 'Pelvic spring test (compress iliac crests), check for instability, perineal inspection',
    geometry: { type: 'box', args: [0.6, 0.35, 0.32] },
    position: [0, 2.72, 0],
    scale: [1.1, 1, 1],
    children: [
      // Hip joints — rounded
      { geometry: { type: 'sphere', args: [0.12, 12, 12] }, position: [0.22, 2.55, 0] },
      { geometry: { type: 'sphere', args: [0.12, 12, 12] }, position: [-0.22, 2.55, 0] },
    ],
  },
  // ========== EXTREMITIES ==========
  // All 4 limbs as one assessment region
  {
    id: 'extremities',
    label: 'Extremities',
    description: 'All 4 limbs: pulses, sensation, motor, deformity, wounds, compartment syndrome signs',
    geometry: { type: 'cylinder', args: [0.08, 0.07, 0.6, 12] }, // placeholder
    position: [0, 2, 0],
    children: [
      // === RIGHT ARM ===
      // Upper arm
      { geometry: { type: 'capsule', args: [0.065, 0.5, 8, 12] }, position: [0.52, 3.85, 0], rotation: [0, 0, 0.12] },
      // Elbow joint
      { geometry: { type: 'sphere', args: [0.07, 10, 10] }, position: [0.56, 3.32, 0] },
      // Forearm
      { geometry: { type: 'capsule', args: [0.055, 0.48, 8, 12] }, position: [0.58, 2.85, 0], rotation: [0, 0, 0.05] },
      // Hand
      { geometry: { type: 'box', args: [0.08, 0.14, 0.04] }, position: [0.6, 2.38, 0], scale: [1.2, 1, 1] },

      // === LEFT ARM ===
      { geometry: { type: 'capsule', args: [0.065, 0.5, 8, 12] }, position: [-0.52, 3.85, 0], rotation: [0, 0, -0.12] },
      { geometry: { type: 'sphere', args: [0.07, 10, 10] }, position: [-0.56, 3.32, 0] },
      { geometry: { type: 'capsule', args: [0.055, 0.48, 8, 12] }, position: [-0.58, 2.85, 0], rotation: [0, 0, -0.05] },
      { geometry: { type: 'box', args: [0.08, 0.14, 0.04] }, position: [-0.6, 2.38, 0], scale: [1.2, 1, 1] },

      // === RIGHT LEG ===
      // Thigh
      { geometry: { type: 'capsule', args: [0.1, 0.65, 8, 12] }, position: [0.18, 2.0, 0] },
      // Knee joint
      { geometry: { type: 'sphere', args: [0.1, 10, 10] }, position: [0.18, 1.4, 0], scale: [1, 0.8, 1.1] },
      // Shin/calf
      { geometry: { type: 'capsule', args: [0.075, 0.62, 8, 12] }, position: [0.18, 0.8, 0] },
      // Ankle
      { geometry: { type: 'sphere', args: [0.06, 8, 8] }, position: [0.18, 0.25, 0] },
      // Foot
      { geometry: { type: 'box', args: [0.09, 0.06, 0.2] }, position: [0.18, 0.1, 0.06] },

      // === LEFT LEG ===
      { geometry: { type: 'capsule', args: [0.1, 0.65, 8, 12] }, position: [-0.18, 2.0, 0] },
      { geometry: { type: 'sphere', args: [0.1, 10, 10] }, position: [-0.18, 1.4, 0], scale: [1, 0.8, 1.1] },
      { geometry: { type: 'capsule', args: [0.075, 0.62, 8, 12] }, position: [-0.18, 0.8, 0] },
      { geometry: { type: 'sphere', args: [0.06, 8, 8] }, position: [-0.18, 0.25, 0] },
      { geometry: { type: 'box', args: [0.09, 0.06, 0.2] }, position: [-0.18, 0.1, 0.06] },
    ],
  },
  // ========== POSTERIOR ==========
  {
    id: 'posterior-logroll',
    label: 'Posterior / Log Roll',
    description: 'Log roll with C-spine control. Inspect and palpate entire spine, flanks, buttocks.',
    geometry: { type: 'box', args: [0.62, 1.6, 0.12] },
    position: [0, 3.55, -0.22],
  },
];

/** Skin tone colors */
export const SKIN_COLOR = '#d4a574';
/** Highlight color for hovering */
export const HOVER_COLOR = '#60a5fa';
/** Color for assessed regions */
export const ASSESSED_COLOR = '#22c55e';
/** Emissive intensity on hover */
export const HOVER_EMISSIVE_INTENSITY = 0.5;
