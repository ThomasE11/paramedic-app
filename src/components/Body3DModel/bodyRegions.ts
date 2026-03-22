/**
 * Body region geometry definitions mapping to secondary survey assessment steps.
 * Each region defines its 3D geometry, position, and the assessment step ID it triggers.
 */

import type { SecondaryAssessmentStep } from '@/data/assessmentFramework';

export interface RegionGeometry {
  type: 'sphere' | 'cylinder' | 'capsule' | 'box';
  args: number[]; // geometry constructor args
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
  geometry: RegionGeometry;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  /** Sub-parts for compound regions (e.g., extremities = 4 limbs) */
  children?: BodyRegionChild[];
}

/**
 * All 8 secondary survey body regions with their 3D geometry definitions.
 * Positioned relative to origin, total body height ~4.5 units.
 */
export const BODY_REGIONS: BodyRegionDef[] = [
  // HEAD — scalp/skull
  {
    id: 'head',
    label: 'Head',
    geometry: { type: 'sphere', args: [0.32, 24, 24] },
    position: [0, 3.85, 0],
  },
  // FACE — front of head (slightly forward + lower)
  {
    id: 'face',
    label: 'Face',
    geometry: { type: 'sphere', args: [0.22, 16, 16] },
    position: [0, 3.65, 0.18],
  },
  // NECK / C-SPINE
  {
    id: 'neck-cspine',
    label: 'Neck & C-Spine',
    geometry: { type: 'cylinder', args: [0.12, 0.14, 0.35, 12] },
    position: [0, 3.35, 0],
  },
  // CHEST — upper torso
  {
    id: 'chest',
    label: 'Chest',
    geometry: { type: 'box', args: [0.85, 0.8, 0.45] },
    position: [0, 2.7, 0],
    scale: [1, 1, 1],
  },
  // ABDOMEN — lower torso
  {
    id: 'abdomen',
    label: 'Abdomen',
    geometry: { type: 'box', args: [0.78, 0.55, 0.4] },
    position: [0, 2.0, 0],
  },
  // PELVIS — hip area
  {
    id: 'pelvis',
    label: 'Pelvis',
    geometry: { type: 'sphere', args: [0.42, 16, 16] },
    position: [0, 1.5, 0],
    scale: [1, 0.45, 0.8],
  },
  // EXTREMITIES — all 4 limbs as one clickable group
  {
    id: 'extremities',
    label: 'Extremities',
    geometry: { type: 'cylinder', args: [0.08, 0.07, 0.8, 8] }, // template (not rendered directly)
    position: [0, 1.5, 0],
    children: [
      // Right upper arm
      { geometry: { type: 'cylinder', args: [0.09, 0.08, 0.65, 8] }, position: [0.58, 2.85, 0], rotation: [0, 0, 0.15] },
      // Right forearm
      { geometry: { type: 'cylinder', args: [0.07, 0.06, 0.6, 8] }, position: [0.65, 2.2, 0], rotation: [0, 0, 0.05] },
      // Left upper arm
      { geometry: { type: 'cylinder', args: [0.09, 0.08, 0.65, 8] }, position: [-0.58, 2.85, 0], rotation: [0, 0, -0.15] },
      // Left forearm
      { geometry: { type: 'cylinder', args: [0.07, 0.06, 0.6, 8] }, position: [-0.65, 2.2, 0], rotation: [0, 0, -0.05] },
      // Right upper leg
      { geometry: { type: 'cylinder', args: [0.12, 0.1, 0.85, 8] }, position: [0.22, 0.85, 0] },
      // Right lower leg
      { geometry: { type: 'cylinder', args: [0.09, 0.07, 0.8, 8] }, position: [0.22, 0.1, 0] },
      // Left upper leg
      { geometry: { type: 'cylinder', args: [0.12, 0.1, 0.85, 8] }, position: [-0.22, 0.85, 0] },
      // Left lower leg
      { geometry: { type: 'cylinder', args: [0.09, 0.07, 0.8, 8] }, position: [-0.22, 0.1, 0] },
    ],
  },
  // POSTERIOR — back (behind torso)
  {
    id: 'posterior-logroll',
    label: 'Posterior / Log Roll',
    geometry: { type: 'box', args: [0.75, 1.5, 0.15] },
    position: [0, 2.35, -0.28],
  },
];

/** Skin tone color for unassessed regions */
export const SKIN_COLOR = '#e0b89d';
/** Highlight color for hovering */
export const HOVER_COLOR = '#60a5fa';
/** Color for assessed regions */
export const ASSESSED_COLOR = '#4ade80';
/** Emissive intensity on hover */
export const HOVER_EMISSIVE_INTENSITY = 0.4;
