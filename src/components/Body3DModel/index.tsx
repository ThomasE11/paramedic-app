/**
 * 3D Physical Examination
 *
 * Interactive patient examination frame.
 *
 * Clicking a body region zooms the mannequin and opens an in-frame exam tray:
 * technique choices, clinical maps, flow cues, and findings all remain inside
 * the patient area so the student stays oriented to the anatomy.
 */

import { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import type { CSSProperties, ElementRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, User, Eye, Hand, Activity, Stethoscope, X, ChevronRight, ChevronDown, AlertTriangle, Compass, Unlock, Wind, Shirt } from 'lucide-react';
import { BodyMesh } from './BodyMesh';
import type { LimbSide } from './BodyMesh';
import { AnatomyReferenceLayer } from './AnatomyReferenceLayer';
import { CLOTHING_PARTING } from './ClothingLayer';
import { usePatientVoice } from '@/hooks/usePatientVoice';
import { getNextGuidedStep, EXAM_SEQUENCE } from './bodyRegions';
import { useTranslation } from 'react-i18next';
import type { AssessmentStepId, SecondaryAssessmentStep } from '@/data/assessmentFramework';
import { getAssessmentProfile } from '@/data/assessmentFramework';
import type { CaseScenario, CaseCategory } from '@/types';
import type { ClinicalSoundState } from '@/data/clinicalSounds';
import { playBreathSound, playHeartSound, playPercussionSound, playBowelSound, stopAllSounds, getZoneBreathSound } from '@/data/clinicalSounds';
import type { BowelSoundType, BreathSoundType } from '@/data/clinicalSounds';
import { inferInjuries, injuryRegionTo3D, inferGeneralAppearance, type InjuryKind, type InjurySeverity } from '@/lib/injuryMap';
import {
  deriveAppliedTreatmentRealismCues,
  deriveCaseRealismProfile,
  shouldRevealRealismCue,
  type PatientRealismCue,
  type PatientRealismProfile,
  type RealismSeverity,
} from '@/lib/patientRealism';

const TOTAL_REGIONS = 11;
type OrbitControlsHandle = ElementRef<typeof OrbitControls>;

/** Helper: is this a limb region ID? */
const isLimbRegion = (id: string): boolean =>
  id === 'right-arm' || id === 'left-arm' || id === 'right-leg' || id === 'left-leg';

interface ExamLandmark {
  id: string;
  region: SecondaryAssessmentStep;
  label: string;
  sublabel: string;
  position: [number, number, number];
  level: 'overview' | 'detail';
  actionId?: string;
  tone?: 'neutral' | 'airway' | 'breathing' | 'circulation' | 'abdomen' | 'neuro' | 'warning';
}

interface PupilProfile {
  leftMm: number;
  rightMm: number;
  leftReaction: string;
  rightReaction: string;
  note: string;
  abnormal: boolean;
}

type OxygenVisualMode = 'nasal' | 'simple-mask' | 'nonrebreather' | 'nebulizer' | 'bvm' | 'cpap' | 'ventilator';

interface OxygenEquipmentVisual {
  mode: OxygenVisualMode;
  label: string;
  detail: string;
}

interface AppliedEquipmentVisualState {
  oxygen: OxygenEquipmentVisual | null;
  hasIvAccess: boolean;
  hasFluids: boolean;
  hasDefibPads: boolean;
  hasLucas: boolean;
  hasEtTube: boolean;
  hasOpa: boolean;
}

const TREATMENT_ASSET_PATHS = {
  nasal: '/treatment-assets/nasal-cannula.svg',
  simpleMask: '/treatment-assets/simple-mask.svg',
  nonrebreather: '/treatment-assets/nonrebreather-mask.svg',
  nebulizer: '/treatment-assets/nebulizer-mask.svg',
  bvm: '/treatment-assets/bvm.svg',
  cpap: '/treatment-assets/cpap-mask.svg',
  ventilator: '/treatment-assets/ventilator-circuit.svg',
  ivCannula: '/treatment-assets/iv-cannula.svg',
  fluidBag: '/treatment-assets/fluid-bag.svg',
  defibPads: '/treatment-assets/defib-pads.svg',
  lucas: '/treatment-assets/lucas-device.svg',
  etTube: '/treatment-assets/et-tube.svg',
  opa: '/treatment-assets/opa.svg',
  ivPole: '/treatment-assets/iv-pole.svg',
} as const;

type AbdomenQuadrant = 'ruq' | 'luq' | 'rlq' | 'llq';

const ABDOMEN_QUADRANTS: Array<{ id: AbdomenQuadrant; label: string; full: string; hint: string }> = [
  { id: 'ruq', label: 'RUQ', full: 'Right upper quadrant', hint: 'liver, gallbladder' },
  { id: 'luq', label: 'LUQ', full: 'Left upper quadrant', hint: 'stomach, spleen' },
  { id: 'rlq', label: 'RLQ', full: 'Right lower quadrant', hint: 'appendix, pelvis' },
  { id: 'llq', label: 'LLQ', full: 'Left lower quadrant', hint: 'colon, pelvis' },
];

// Anchors measured from the ACTUAL decoded mesh (scripts/measure-anatomy.cjs)
// in the exact in-app frame: feet Y=0, head Y≈1.8, centred on X/Z, anatomical
// front at +Z (camera side). The body's front surface sits at only z ≈ 0.16
// (face/chest) to 0.22 (belly) — NOT 0.3+ — so anything past ~0.25 floats in
// the air in front of the patient. Torso half-width is ~0.15 and the forearm/
// wrist sits at x ≈ ±0.18 (the upper arm bulges out to ±0.49). These positions
// sit just proud of the real camera-facing surface.
const EXAM_LANDMARKS: ExamLandmark[] = [
  { id: 'eyes-overview', region: 'face', label: 'Face / eyes', sublabel: 'pupils, lips, speech', position: [0.0, 1.62, 0.20], level: 'overview', tone: 'neuro' },
  { id: 'airway-overview', region: 'neck-cspine', label: 'Airway / neck', sublabel: 'mouth, trachea, JVD', position: [0.0, 1.46, 0.22], level: 'overview', tone: 'airway' },
  { id: 'chest-overview', region: 'chest', label: 'Chest', sublabel: 'rise, wall, lungs, heart', position: [0.02, 1.27, 0.20], level: 'overview', tone: 'breathing' },
  { id: 'abdomen-overview', region: 'abdomen', label: 'Abdomen', sublabel: 'quadrants, guarding', position: [0.03, 1.02, 0.24], level: 'overview', tone: 'abdomen' },
  { id: 'radial-overview', region: 'right-arm', label: 'Radial pulse', sublabel: 'CRT / motor', position: [-0.18, 0.82, 0.20], level: 'overview', tone: 'circulation' },
  // Minimal anatomical pulse points — click to check (works from any view).
  { id: 'pulse-carotid', region: 'neck-cspine', label: 'Carotid', sublabel: 'central pulse', position: [-0.12, 1.39, 0.20], level: 'overview', actionId: 'pulse-carotid', tone: 'circulation' },
  { id: 'pulse-radial-r', region: 'right-arm', label: 'Radial', sublabel: 'wrist pulse', position: [-0.20, 0.80, 0.18], level: 'overview', actionId: 'pulse-radial', tone: 'circulation' },
  { id: 'pulse-radial-l', region: 'left-arm', label: 'Radial', sublabel: 'wrist pulse', position: [0.20, 0.80, 0.18], level: 'overview', actionId: 'pulse-radial', tone: 'circulation' },
  { id: 'pedal-overview', region: 'right-leg', label: 'Pedal pulse', sublabel: 'DP / PT', position: [-0.13, 0.14, 0.20], level: 'overview', tone: 'circulation' },
  { id: 'posterior-overview', region: 'posterior-logroll', label: 'Posterior', sublabel: 'log roll / spine', position: [0.0, 1.10, -0.20], level: 'overview', tone: 'neutral' },

  { id: 'right-eye', region: 'face', label: 'Right eye', sublabel: 'pupil size, reactivity', position: [-0.052, 1.635, 0.205], level: 'detail', actionId: 'pupils-size', tone: 'neuro' },
  { id: 'left-eye', region: 'face', label: 'Left eye', sublabel: 'compare equality', position: [0.052, 1.635, 0.205], level: 'detail', actionId: 'pupils-equality', tone: 'neuro' },
  { id: 'nose-detail', region: 'face', label: 'Nose', sublabel: 'CSF, bleeding, deformity', position: [0, 1.595, 0.21], level: 'detail', actionId: 'nose-inspect', tone: 'neutral' },
  { id: 'mouth-detail', region: 'face', label: 'Mouth / lips', sublabel: 'cyanosis, secretions, tongue', position: [0, 1.555, 0.215], level: 'detail', actionId: 'mouth-inspect', tone: 'airway' },

  { id: 'trachea-detail', region: 'neck-cspine', label: 'Trachea', sublabel: 'midline / deviated', position: [0, 1.44, 0.22], level: 'detail', actionId: 'trachea-palpate', tone: 'airway' },
  { id: 'jvd-detail', region: 'neck-cspine', label: 'JVD', sublabel: 'neck veins', position: [0.09, 1.47, 0.19], level: 'detail', actionId: 'jvd-inspect', tone: 'circulation' },
  { id: 'cspine-detail', region: 'neck-cspine', label: 'C-spine', sublabel: 'midline tenderness', position: [0, 1.49, -0.12], level: 'detail', actionId: 'cspine-palpate', tone: 'warning' },

  { id: 'lung-ru', region: 'chest', label: 'R upper zone', sublabel: 'right apex / upper field', position: [-0.09, 1.34, 0.205], level: 'detail', actionId: 'chest-auscultate-ru', tone: 'breathing' },
  { id: 'lung-rl', region: 'chest', label: 'R lower zone', sublabel: 'right base', position: [-0.10, 1.22, 0.205], level: 'detail', actionId: 'chest-auscultate-rl', tone: 'breathing' },
  { id: 'lung-lu', region: 'chest', label: 'L upper zone', sublabel: 'left apex / upper field', position: [0.09, 1.34, 0.205], level: 'detail', actionId: 'chest-auscultate-lu', tone: 'breathing' },
  { id: 'lung-ll', region: 'chest', label: 'L lower zone', sublabel: 'left base', position: [0.10, 1.22, 0.205], level: 'detail', actionId: 'chest-auscultate-ll', tone: 'breathing' },
  { id: 'sternum-detail', region: 'chest', label: 'Chest wall', sublabel: 'tenderness, crepitus, flail', position: [0, 1.245, 0.215], level: 'detail', actionId: 'chest-palpate', tone: 'warning' },
  { id: 'heart-detail', region: 'chest', label: 'Heart', sublabel: 'aortic, pulmonic, apex', position: [0.05, 1.165, 0.215], level: 'detail', actionId: 'chest-auscultate-heart', tone: 'circulation' },

  { id: 'ruq-detail', region: 'abdomen', label: 'RUQ', sublabel: 'liver / gallbladder', position: [-0.095, 1.085, 0.245], level: 'detail', actionId: 'abd-ruq-auscultate', tone: 'abdomen' },
  { id: 'luq-detail', region: 'abdomen', label: 'LUQ', sublabel: 'stomach / spleen', position: [0.095, 1.085, 0.245], level: 'detail', actionId: 'abd-luq-auscultate', tone: 'abdomen' },
  { id: 'rlq-detail', region: 'abdomen', label: 'RLQ', sublabel: 'appendix / pelvis', position: [-0.095, 0.985, 0.245], level: 'detail', actionId: 'abd-rlq-auscultate', tone: 'abdomen' },
  { id: 'llq-detail', region: 'abdomen', label: 'LLQ', sublabel: 'colon / pelvis', position: [0.095, 0.985, 0.245], level: 'detail', actionId: 'abd-llq-auscultate', tone: 'abdomen' },
  { id: 'umbilicus-detail', region: 'abdomen', label: 'Umbilicus', sublabel: 'distension / bruising', position: [0, 1.035, 0.255], level: 'detail', actionId: 'abd-inspect', tone: 'abdomen' },

  // ===== HEAD (cranium — face/eyes/mouth live on the separate 'face' region) =====
  { id: 'scalp-detail', region: 'head', label: 'Scalp', sublabel: 'lacerations, haematoma', position: [-0.02, 1.79, 0.12], level: 'detail', actionId: 'scalp-inspect', tone: 'warning' },
  { id: 'skull-detail', region: 'head', label: 'Skull', sublabel: 'deformity, step, boggy', position: [0.03, 1.73, 0.16], level: 'detail', actionId: 'scalp-palpate', tone: 'warning' },
  { id: 'ear-right-detail', region: 'head', label: 'R ear', sublabel: 'Battle sign, CSF otorrhoea', position: [-0.135, 1.66, 0.05], level: 'detail', actionId: 'ears-inspect', tone: 'neutral' },
  { id: 'ear-left-detail', region: 'head', label: 'L ear', sublabel: 'Battle sign, CSF otorrhoea', position: [0.135, 1.66, 0.05], level: 'detail', actionId: 'ears-inspect', tone: 'neutral' },

  // ===== RIGHT ARM (patient's right = camera-left = negative X) =====
  { id: 'r-shoulder-detail', region: 'right-arm', label: 'Shoulder', sublabel: 'clavicle, ROM', position: [-0.28, 1.36, 0.10], level: 'detail', actionId: 'r-shoulder-palpate', tone: 'warning' },
  { id: 'r-humerus-detail', region: 'right-arm', label: 'Upper arm', sublabel: 'humerus, deformity', position: [-0.35, 1.14, 0.08], level: 'detail', actionId: 'r-humerus-palpate', tone: 'warning' },
  { id: 'r-elbow-detail', region: 'right-arm', label: 'Elbow', sublabel: 'effusion, ROM', position: [-0.34, 0.98, 0.09], level: 'detail', actionId: 'r-elbow-palpate', tone: 'warning' },
  { id: 'r-forearm-detail', region: 'right-arm', label: 'Forearm', sublabel: 'radius / ulna', position: [-0.27, 0.86, 0.13], level: 'detail', actionId: 'r-forearm-palpate', tone: 'warning' },
  { id: 'r-wrist-detail', region: 'right-arm', label: 'Wrist', sublabel: 'radial pulse, CRT', position: [-0.215, 0.78, 0.16], level: 'detail', actionId: 'r-arm-pulses', tone: 'circulation' },
  { id: 'r-hand-detail', region: 'right-arm', label: 'Hand', sublabel: 'grip, sensation, digits', position: [-0.205, 0.69, 0.16], level: 'detail', actionId: 'r-hand-palpate', tone: 'neuro' },

  // ===== LEFT ARM (patient's left = camera-right = positive X) =====
  { id: 'l-shoulder-detail', region: 'left-arm', label: 'Shoulder', sublabel: 'clavicle, ROM', position: [0.28, 1.36, 0.10], level: 'detail', actionId: 'l-shoulder-palpate', tone: 'warning' },
  { id: 'l-humerus-detail', region: 'left-arm', label: 'Upper arm', sublabel: 'humerus, deformity', position: [0.35, 1.14, 0.08], level: 'detail', actionId: 'l-humerus-palpate', tone: 'warning' },
  { id: 'l-elbow-detail', region: 'left-arm', label: 'Elbow', sublabel: 'effusion, ROM', position: [0.34, 0.98, 0.09], level: 'detail', actionId: 'l-elbow-palpate', tone: 'warning' },
  { id: 'l-forearm-detail', region: 'left-arm', label: 'Forearm', sublabel: 'radius / ulna', position: [0.27, 0.86, 0.13], level: 'detail', actionId: 'l-forearm-palpate', tone: 'warning' },
  { id: 'l-wrist-detail', region: 'left-arm', label: 'Wrist', sublabel: 'radial pulse, CRT', position: [0.215, 0.78, 0.16], level: 'detail', actionId: 'l-arm-pulses', tone: 'circulation' },
  { id: 'l-hand-detail', region: 'left-arm', label: 'Hand', sublabel: 'grip, sensation, digits', position: [0.205, 0.69, 0.16], level: 'detail', actionId: 'l-hand-palpate', tone: 'neuro' },

  // ===== RIGHT LEG (upper thigh → foot) =====
  { id: 'r-hip-detail', region: 'right-leg', label: 'Hip', sublabel: 'shortening, rotation', position: [-0.16, 0.86, 0.15], level: 'detail', actionId: 'r-hip-palpate', tone: 'warning' },
  { id: 'r-thigh-detail', region: 'right-leg', label: 'Upper thigh', sublabel: 'femur, quadriceps', position: [-0.155, 0.70, 0.17], level: 'detail', actionId: 'r-femur-palpate', tone: 'warning' },
  { id: 'r-knee-detail', region: 'right-leg', label: 'Knee', sublabel: 'patella, effusion', position: [-0.15, 0.47, 0.17], level: 'detail', actionId: 'r-knee-palpate', tone: 'warning' },
  { id: 'r-shin-detail', region: 'right-leg', label: 'Lower leg', sublabel: 'tibia, compartments', position: [-0.15, 0.30, 0.17], level: 'detail', actionId: 'r-tibia-palpate', tone: 'warning' },
  { id: 'r-ankle-detail', region: 'right-leg', label: 'Ankle', sublabel: 'malleoli, oedema', position: [-0.14, 0.15, 0.17], level: 'detail', actionId: 'r-ankle-palpate', tone: 'warning' },
  { id: 'r-foot-detail', region: 'right-leg', label: 'Foot', sublabel: 'pedal pulse, CRT', position: [-0.13, 0.07, 0.20], level: 'detail', actionId: 'r-leg-pulses', tone: 'circulation' },

  // ===== LEFT LEG (upper thigh → foot) =====
  { id: 'l-hip-detail', region: 'left-leg', label: 'Hip', sublabel: 'shortening, rotation', position: [0.16, 0.86, 0.15], level: 'detail', actionId: 'l-hip-palpate', tone: 'warning' },
  { id: 'l-thigh-detail', region: 'left-leg', label: 'Upper thigh', sublabel: 'femur, quadriceps', position: [0.155, 0.70, 0.17], level: 'detail', actionId: 'l-femur-palpate', tone: 'warning' },
  { id: 'l-knee-detail', region: 'left-leg', label: 'Knee', sublabel: 'patella, effusion', position: [0.15, 0.47, 0.17], level: 'detail', actionId: 'l-knee-palpate', tone: 'warning' },
  { id: 'l-shin-detail', region: 'left-leg', label: 'Lower leg', sublabel: 'tibia, compartments', position: [0.15, 0.30, 0.17], level: 'detail', actionId: 'l-tibia-palpate', tone: 'warning' },
  { id: 'l-ankle-detail', region: 'left-leg', label: 'Ankle', sublabel: 'malleoli, oedema', position: [0.14, 0.15, 0.17], level: 'detail', actionId: 'l-ankle-palpate', tone: 'warning' },
  { id: 'l-foot-detail', region: 'left-leg', label: 'Foot', sublabel: 'pedal pulse, CRT', position: [0.13, 0.07, 0.20], level: 'detail', actionId: 'l-leg-pulses', tone: 'circulation' },

  // ===== PELVIS =====
  { id: 'pelvis-right-detail', region: 'pelvis', label: 'R iliac crest', sublabel: 'spring test', position: [-0.13, 0.92, 0.16], level: 'detail', actionId: 'pelvis-palpate', tone: 'warning' },
  { id: 'pelvis-left-detail', region: 'pelvis', label: 'L iliac crest', sublabel: 'spring test', position: [0.13, 0.92, 0.16], level: 'detail', actionId: 'pelvis-palpate', tone: 'warning' },
  { id: 'pelvis-symphysis-detail', region: 'pelvis', label: 'Symphysis', sublabel: 'deformity, bruising', position: [0, 0.84, 0.20], level: 'detail', actionId: 'pelvis-inspect', tone: 'abdomen' },
];

function PatientSceneEnvironment() {
  return (
    <group>
      <mesh position={[0, 0.9, -0.78]} raycast={() => null}>
        <planeGeometry args={[2.75, 2.25]} />
        <meshStandardMaterial color="#edf4f8" roughness={0.94} transparent opacity={0.42} />
      </mesh>
      <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => null}>
        <planeGeometry args={[4.2, 4.2]} />
        <meshStandardMaterial color="#e7edf3" roughness={0.92} transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

/**
 * Floating marker wrapper that fades/hides itself as its anchored body
 * surface rotates away from the camera. Outward direction at an anchor is
 * approximated as the horizontal vector from the body's central axis to the
 * point; the dot product with the camera direction drives opacity. This keeps
 * region dots/labels from piling up and overlapping at any rotation
 * (top-down, posterior, oblique) — only the surfaces actually facing the
 * viewer show a marker.
 */
function MarkerHtml({
  position,
  distanceFactor,
  zIndexRange,
  interactive = true,
  children,
}: {
  position: [number, number, number];
  distanceFactor?: number;
  zIndexRange?: [number, number];
  interactive?: boolean;
  children: React.ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  useFrame(({ camera }) => {
    const el = wrapRef.current;
    if (!el) return;
    const [x, y, z] = position;
    const ol = Math.hypot(x, z) || 1;            // outward (horizontal) magnitude
    const dx = camera.position.x - x;
    const dy = camera.position.y - y;
    const dz = camera.position.z - z;
    const dl = Math.hypot(dx, dy, dz) || 1;
    // 1 = camera dead-on the surface, 0 = edge / straight above, <0 = behind.
    const facing = (x / ol) * (dx / dl) + (z / ol) * (dz / dl);
    const op = Math.max(0, Math.min(1, (facing - 0.12) / 0.32));
    el.style.opacity = String(op);
    el.style.pointerEvents = interactive && op >= 0.2 ? 'auto' : 'none';
  });
  return (
    <Html position={position} center distanceFactor={distanceFactor} zIndexRange={zIndexRange}>
      <div ref={wrapRef} style={{ transition: 'opacity 120ms linear' }}>
        {children}
      </div>
    </Html>
  );
}

function LandmarkMarkers({
  activeRegion,
  assessedRegions,
  requiredRegions,
  onSelect,
  onAction,
  onPulse,
  sampler,
}: {
  activeRegion: string | null;
  assessedRegions: Set<string>;
  requiredRegions: Set<string>;
  onSelect: (region: SecondaryAssessmentStep) => void;
  onAction?: (actionId: string) => void;
  onPulse?: (site: string) => void;
  sampler: ((x: number, y: number) => [number, number, number]) | null;
}) {
  const visibleMarkers = activeRegion
    ? EXAM_LANDMARKS.filter(marker => marker.region === activeRegion && marker.level === 'detail')
    : EXAM_LANDMARKS.filter(marker => marker.level === 'overview' && (
      requiredRegions.has(marker.region)
      || marker.id === 'eyes-overview'
      || marker.id === 'airway-overview'
      || marker.id === 'chest-overview'
      || marker.id === 'abdomen-overview'
      || marker.id === 'pulse-carotid'
      || marker.id === 'pulse-radial-r'
      || marker.id === 'pulse-radial-l'
    ));

  const toneClasses: Record<NonNullable<ExamLandmark['tone']>, string> = {
    neutral: 'border-slate-200/80 bg-white/90 text-slate-800 dark:border-white/10 dark:bg-slate-950/85 dark:text-slate-100',
    airway: 'border-sky-300/80 bg-sky-50/95 text-sky-900 dark:border-sky-400/35 dark:bg-sky-950/85 dark:text-sky-100',
    breathing: 'border-cyan-300/80 bg-cyan-50/95 text-cyan-900 dark:border-cyan-400/35 dark:bg-cyan-950/85 dark:text-cyan-100',
    circulation: 'border-rose-300/80 bg-rose-50/95 text-rose-900 dark:border-rose-400/35 dark:bg-rose-950/85 dark:text-rose-100',
    abdomen: 'border-emerald-300/80 bg-emerald-50/95 text-emerald-900 dark:border-emerald-400/35 dark:bg-emerald-950/85 dark:text-emerald-100',
    neuro: 'border-blue-300/80 bg-blue-50/95 text-blue-900 dark:border-blue-400/35 dark:bg-blue-950/85 dark:text-blue-100',
    warning: 'border-amber-300/80 bg-amber-50/95 text-amber-900 dark:border-amber-400/35 dark:bg-amber-950/85 dark:text-amber-100',
  };

  // Higher df = smaller on-screen marker. Face/neck zoom in very tight, which
  // otherwise balloons their dots; shrink them so the clustered facial/airway
  // landmarks stay separate and tappable.
  const DETAIL_DF: Record<string, number> = { face: 1.25, 'neck-cspine': 1.4 };
  return (
    <>
      {visibleMarkers.map(marker => {
        const assessed = assessedRegions.has(marker.region) || (isLimbRegion(marker.region) && assessedRegions.has('extremities'));
        const required = requiredRegions.has(marker.region);
        // Project the label's intended (x, y) onto the real patient surface.
        // 'posterior' lives on the back, which the front-facing sampler can't
        // resolve, so it keeps its authored anchor.
        const pos: [number, number, number] = sampler && marker.region !== 'posterior-logroll'
          ? sampler(marker.position[0], marker.position[1])
          : marker.position;
        const isDetail = marker.level === 'detail';
        const dotColor = assessed
          ? 'bg-emerald-400'
          : required
            ? 'bg-amber-400'
            : isDetail ? 'bg-cyan-300' : 'bg-sky-400';
        // Focused-region landmarks stay as quiet touch targets; the loupe and
        // cockpit already name the targets, so hover labels would just clutter
        // the patient surface.
        return (
          <MarkerHtml key={marker.id} position={pos} distanceFactor={isDetail ? (DETAIL_DF[activeRegion ?? ''] ?? 2.0) : 3.0} zIndexRange={[80, 0]}>
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onPointerUp={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                // Pulse points work from any view — one click checks the pulse.
                if (marker.actionId?.startsWith('pulse-') && onPulse) {
                  onPulse(marker.actionId);
                  return;
                }
                if (activeRegion === marker.region && marker.actionId && onAction) {
                  onAction(marker.actionId);
                  return;
                }
                onSelect(marker.region);
              }}
              className={`group pointer-events-auto relative flex items-center justify-center ${isDetail ? 'h-3 w-3' : 'h-4 w-4'}`}
              title={`${marker.label} — ${marker.sublabel}`}
            >
              <span className={`block rounded-full ring-[1.5px] ring-white/85 shadow-md transition-transform duration-150 group-hover:scale-125 ${isDetail ? 'h-1 w-1' : 'h-2.5 w-2.5'} ${dotColor}`} />
              {!isDetail && (
                <span className={`pointer-events-none absolute left-1/2 top-[125%] z-10 -translate-x-1/2 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[8px] font-semibold leading-none opacity-0 shadow-lg backdrop-blur-md transition-opacity duration-150 group-hover:opacity-100 ${toneClasses[marker.tone ?? 'neutral']}`}>
                  {marker.label}
                </span>
              )}
            </button>
          </MarkerHtml>
        );
      })}
    </>
  );
}

// 3D anchor positions per region for revealed-finding markers. Reuses the
// EXAM_LANDMARK coordinate space; adds the regions landmarks don't cover.
// Measured from the actual mesh (see EXAM_LANDMARKS note). Sit just proud of
// the real camera-facing (+Z) surface; arms anchor mid-upper-arm.
const FINDING_ANCHORS: Record<string, [number, number, number]> = {
  'head': [0.0, 1.70, 0.19],
  'face': [0.0, 1.62, 0.20],
  'neck-cspine': [0.0, 1.46, 0.22],
  'chest': [0.0, 1.27, 0.20],
  'abdomen': [0.0, 1.02, 0.24],
  'pelvis': [0.0, 0.90, 0.24],
  'right-arm': [-0.34, 1.08, 0.12],
  'left-arm': [0.34, 1.08, 0.12],
  'right-leg': [-0.14, 0.48, 0.20],
  'left-leg': [0.14, 0.48, 0.20],
  'posterior-logroll': [0.0, 1.10, -0.20],
};

const FINDING_SEVERITY_STYLE: Record<string, string> = {
  critical: 'border-rose-300/70 bg-rose-600/90 text-white shadow-[0_0_14px_rgba(244,63,94,0.6)]',
  major: 'border-orange-300/70 bg-orange-600/90 text-white shadow-[0_0_12px_rgba(249,115,22,0.5)]',
  minor: 'border-amber-300/70 bg-amber-400/90 text-amber-950 shadow-[0_0_10px_rgba(251,191,36,0.5)]',
};

const REALISM_CUE_STYLE: Record<RealismSeverity, { marker: string; dot: string; chip: string }> = {
  normal: {
    marker: 'border-emerald-200/45 bg-emerald-950/72 text-emerald-50 shadow-[0_0_16px_rgba(16,185,129,0.25)]',
    dot: 'bg-emerald-300',
    chip: 'border-emerald-200/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
  },
  observe: {
    marker: 'border-sky-200/45 bg-sky-950/72 text-sky-50 shadow-[0_0_16px_rgba(14,165,233,0.25)]',
    dot: 'bg-sky-300',
    chip: 'border-sky-200/40 bg-sky-500/10 text-sky-700 dark:text-sky-200',
  },
  warning: {
    marker: 'border-amber-200/55 bg-amber-950/78 text-amber-50 shadow-[0_0_18px_rgba(245,158,11,0.35)]',
    dot: 'bg-amber-300',
    chip: 'border-amber-200/50 bg-amber-500/12 text-amber-800 dark:text-amber-100',
  },
  critical: {
    marker: 'border-rose-200/60 bg-rose-950/82 text-rose-50 shadow-[0_0_20px_rgba(244,63,94,0.42)]',
    dot: 'bg-rose-300',
    chip: 'border-rose-200/55 bg-rose-500/12 text-rose-800 dark:text-rose-100',
  },
};

/**
 * Renders injury findings ON the body — but ONLY for regions the student has
 * already assessed. This is the core discovery mechanic: you don't see the
 * JVD until you go to the neck and examine it. Findings for un-assessed
 * regions stay hidden, so the student must work the systematic survey to
 * uncover them (the whole point of assessment).
 *
 * Model-agnostic: anchors to region coordinates, so it works on the current
 * placeholder mesh and the future Character Creator patient alike.
 */
function RevealedFindingMarkers({
  caseData,
  assessedRegions,
  activeRegion,
  sampler,
}: {
  caseData: CaseScenario;
  assessedRegions: Set<string>;
  activeRegion: string | null;
  sampler: ((x: number, y: number) => [number, number, number]) | null;
}) {
  const injuries = useMemo(() => inferInjuries(caseData), [caseData]);
  // Floating injury badges are an OVERVIEW discovery layer. In a focused
  // region view they piled on top of the exam landmarks / loupe (the
  // "overlapping pop-ups" problem) while duplicating what the cockpit and
  // findings panel already show — so they hide whenever a region is active.
  if (!injuries.length || activeRegion) return null;

  // Per-region slot counter so multiple findings in the SAME region fan out
  // instead of stacking on the identical FINDING_ANCHORS point (which made
  // abdominal findings pile up over the quadrant markers). Injuries flank the
  // LEFT of the region midline and stack DOWNWARD; realism cues mirror this on
  // the right (see CaseRealismMarkers), keeping the centre clear for the exam
  // landmark dots.
  const injurySlots: Record<string, number> = {};

  return (
    <>
      {injuries.map((inj) => {
        const region3d = injuryRegionTo3D(inj.region);
        // Reveal gate: region examined (with limb-group + extremities fallback)
        const revealed = assessedRegions.has(region3d)
          || (isLimbRegion(region3d) && assessedRegions.has('extremities'))
          || activeRegion === region3d;
        if (!revealed) return null;
        const fallback = FINDING_ANCHORS[region3d];
        if (!fallback) return null;
        const slot = (injurySlots[region3d] = (injurySlots[region3d] ?? -1) + 1);
        const fx = fallback[0] - 0.17;
        const fy = fallback[1] - slot * 0.11; // ~21px steps at overview zoom — clears the badge height
        // Anchor the finding badge to the real surface at the offset (x, y).
        const anchor: [number, number, number] = sampler && region3d !== 'posterior-logroll'
          ? sampler(fx, fy)
          : [fx, fy, fallback[2]];
        return (
          <MarkerHtml key={inj.id} position={anchor} distanceFactor={3.2} zIndexRange={[90, 0]} interactive={false}>
            <div className="scale-[0.6] pointer-events-none animate-in fade-in zoom-in-50 duration-500">
              <div className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 backdrop-blur-md ${FINDING_SEVERITY_STYLE[inj.severity] || FINDING_SEVERITY_STYLE.major}`}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <span className="whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.1em] leading-none">{inj.label}</span>
              </div>
            </div>
          </MarkerHtml>
        );
      })}
    </>
  );
}

// Visible wounds painted on the skin — blood, bruising, burns — at the injured
// region, sized by severity and coloured by kind. Unlike the text badges these
// stay visible when you zoom INTO a region, so a described injury is actually
// THERE on the mannequin to inspect. Shape-only findings (deformity, rotation,
// fracture, distension) are conveyed by badges/morphs, not a skin mark.
const WOUND_STYLE: Partial<Record<InjuryKind, { core: string; edge: string }>> = {
  bleeding: { core: 'rgba(150,16,22,0.92)', edge: 'rgba(120,10,14,0)' },
  wound: { core: 'rgba(140,14,20,0.92)', edge: 'rgba(110,8,12,0)' },
  amputation: { core: 'rgba(105,8,10,0.96)', edge: 'rgba(80,4,6,0)' },
  burn: { core: 'rgba(92,42,20,0.9)', edge: 'rgba(150,60,30,0)' },
  bruising: { core: 'rgba(74,28,104,0.8)', edge: 'rgba(60,20,90,0)' },
  flail: { core: 'rgba(80,32,96,0.72)', edge: 'rgba(60,22,80,0)' },
  swelling: { core: 'rgba(176,132,110,0.62)', edge: 'rgba(176,132,110,0)' },
};
const WOUND_SIZE: Record<InjurySeverity, number> = { critical: 42, major: 31, minor: 23 };

function InjuryWoundMarkers({
  caseData,
  assessedRegions,
  activeRegion,
  sampler,
}: {
  caseData: CaseScenario;
  assessedRegions: Set<string>;
  activeRegion: string | null;
  sampler: ((x: number, y: number) => [number, number, number]) | null;
}) {
  const injuries = useMemo(() => inferInjuries(caseData), [caseData]);
  if (!injuries.length) return null;
  const slots: Record<string, number> = {};
  return (
    <>
      {injuries.map((inj) => {
        const style = WOUND_STYLE[inj.kind];
        if (!style) return null; // shape-only finding — no skin mark
        const region3d = injuryRegionTo3D(inj.region);
        const revealed = assessedRegions.has(region3d)
          || (isLimbRegion(region3d) && assessedRegions.has('extremities'))
          || activeRegion === region3d;
        if (!revealed) return null;
        const base = FINDING_ANCHORS[region3d];
        if (!base) return null;
        const n = (slots[region3d] = (slots[region3d] ?? -1) + 1);
        // Small fan so several wounds in one region don't stack dead-centre.
        const bx = base[0] + (n % 2 === 0 ? 0.03 : -0.03) * Math.ceil(n / 2);
        const by = base[1] - 0.04 * n;
        const anchor: [number, number, number] = sampler && region3d !== 'posterior-logroll'
          ? sampler(bx, by)
          : [bx, by, base[2]];
        const d = WOUND_SIZE[inj.severity] ?? 26;
        return (
          <MarkerHtml key={`wound-${inj.id}`} position={anchor} distanceFactor={2.4} zIndexRange={[60, 0]} interactive={false}>
            <div
              aria-hidden
              className="pointer-events-none animate-in fade-in duration-700"
              style={{
                width: d,
                height: d,
                borderRadius: '50%',
                background: `radial-gradient(circle at 42% 40%, ${style.core} 0%, ${style.core} 26%, ${style.edge} 80%)`,
                filter: 'blur(1px)',
              }}
            />
          </MarkerHtml>
        );
      })}
    </>
  );
}

function CaseRealismMarkers({
  cues,
  assessedRegions,
  activeRegion,
  sampler,
}: {
  cues: PatientRealismCue[];
  assessedRegions: Set<string>;
  activeRegion: string | null;
  sampler: ((x: number, y: number) => [number, number, number]) | null;
}) {
  // Cue rings are an OVERVIEW breadcrumb. In a focused region view they
  // ballooned (~90px) over the loupe and exam landmarks — the detail panels
  // already convey patient state, so the rings hide whenever a region is active.
  if (activeRegion) return null;

  const visibleCues = cues.filter(item => shouldRevealRealismCue(item, assessedRegions, activeRegion)).slice(0, 5);
  if (!visibleCues.length) return null;

  // Collapse to ONE ring per region (highest severity wins, +N chip for the
  // rest). Stacked same-region rings overlapped heavily at overview zoom and
  // conveyed nothing a count doesn't. Rings flank the RIGHT of the region
  // midline, mirroring the injury badges on the left, keeping the centre
  // clear for the exam landmark dots.
  const severityRank: Record<RealismSeverity, number> = { critical: 3, warning: 2, observe: 1, normal: 0 };
  const byRegion = new Map<string, { top: PatientRealismCue; count: number }>();
  for (const item of visibleCues) {
    const cur = byRegion.get(item.region);
    if (!cur) byRegion.set(item.region, { top: item, count: 1 });
    else {
      cur.count += 1;
      if (severityRank[item.severity] > severityRank[cur.top.severity]) cur.top = item;
    }
  }

  return (
    <>
      {[...byRegion.values()].map(({ top, count }, index) => {
        const fallback = FINDING_ANCHORS[top.region] || FINDING_ANCHORS.chest;
        const fx = fallback[0] + 0.17;
        const anchor: [number, number, number] = sampler && top.region !== 'posterior-logroll'
          ? sampler(fx, fallback[1])
          : [fx, fallback[1], fallback[2]];
        const style = REALISM_CUE_STYLE[top.severity];
        return (
          <MarkerHtml key={top.id} position={anchor} distanceFactor={2.7} zIndexRange={[82 - index, 0]} interactive={false}>
            <div
              className="pointer-events-none relative flex h-3 w-3 items-center justify-center animate-in fade-in zoom-in-75 duration-500"
              aria-hidden="true"
            >
              <span className={`absolute h-3 w-3 rounded-full border backdrop-blur-md ${style.marker}`} />
              <span className={`relative h-1.5 w-1.5 rounded-full ${style.dot} ${top.severity === 'critical' ? 'animate-pulse' : ''}`} />
              {count > 1 && (
                <span className="absolute -right-1.5 -top-1.5 rounded-full border border-white/25 bg-slate-900/85 px-1 text-[7px] font-bold leading-[10px] text-white">
                  +{count - 1}
                </span>
              )}
            </div>
          </MarkerHtml>
        );
      })}
    </>
  );
}

const OXYGEN_VISUAL_PRIORITY: Array<{
  ids: string[];
  mode: OxygenVisualMode;
  label: string;
  detail: string;
}> = [
  { ids: ['mechanical_ventilation', 'ventilator_setup'], mode: 'ventilator', label: 'Ventilator circuit', detail: 'Secured airway with circuit attached' },
  { ids: ['bvm_ventilation'], mode: 'bvm', label: 'BVM ventilation', detail: 'Mask seal and bag-valve device in use' },
  { ids: ['cpap_niv'], mode: 'cpap', label: 'CPAP mask', detail: 'Strapped mask with pressure circuit' },
  { ids: ['nebulizer_salbutamol', 'nebulizer_ipratropium'], mode: 'nebulizer', label: 'Nebulizer mask', detail: 'Aerosol chamber attached to mask' },
  { ids: ['oxygen_nonrebreather'], mode: 'nonrebreather', label: 'Non-rebreather', detail: 'Reservoir mask with high-flow oxygen' },
  { ids: ['oxygen_mask'], mode: 'simple-mask', label: 'Simple oxygen mask', detail: 'Mask and oxygen tubing connected' },
  { ids: ['oxygen_nasal'], mode: 'nasal', label: 'Nasal cannula', detail: 'Nasal prongs and tubing fitted' },
];

const IV_MEDICATION_LINE_IDS = new Set([
  'adrenaline_1mg',
  'adrenaline_infusion',
  'amiodarone_300mg',
  'amiodarone_150mg',
  'morphine_5mg',
  'fentanyl_50mcg',
  'midazolam_5mg',
  'hydrocortisone_200mg',
  'magnesium_2g',
  'txa_1g',
  'naloxone_iv',
  'dextrose_iv',
  'glucose_iv',
]);

function buildTreatmentEquipmentState(appliedTreatmentIds: string[]): AppliedEquipmentVisualState {
  const applied = new Set(appliedTreatmentIds);
  const oxygenMatch = OXYGEN_VISUAL_PRIORITY.find(option => option.ids.some(id => applied.has(id)));
  const hasFluids = appliedTreatmentIds.some(id => id.startsWith('fluids_'));
  const hasMedicationLine = appliedTreatmentIds.some(id =>
    IV_MEDICATION_LINE_IDS.has(id) || id.endsWith('_iv') || id.includes('_infusion'),
  );
  const hasEtTube = applied.has('intubation')
    || applied.has('endotracheal_intubation')
    || applied.has('rsi_intubation')
    || applied.has('mechanical_ventilation')
    || applied.has('ventilator_setup');

  return {
    oxygen: oxygenMatch ? { mode: oxygenMatch.mode, label: oxygenMatch.label, detail: oxygenMatch.detail } : null,
    hasIvAccess: applied.has('iv_access') || hasFluids || hasMedicationLine,
    hasFluids,
    hasDefibPads: applied.has('defibrillation') || applied.has('aed') || applied.has('monitor_pads'),
    hasLucas: applied.has('lucas_device'),
    hasEtTube,
    hasOpa: applied.has('opa_insert'),
  };
}

type EquipTone = 'oxygen' | 'iv' | 'defib' | 'device';

const OXYGEN_SRC: Record<OxygenEquipmentVisual['mode'], string> = {
  nasal: TREATMENT_ASSET_PATHS.nasal,
  'simple-mask': TREATMENT_ASSET_PATHS.simpleMask,
  nonrebreather: TREATMENT_ASSET_PATHS.nonrebreather,
  nebulizer: TREATMENT_ASSET_PATHS.nebulizer,
  bvm: TREATMENT_ASSET_PATHS.bvm,
  cpap: TREATMENT_ASSET_PATHS.cpap,
  ventilator: TREATMENT_ASSET_PATHS.ventilator,
};

const EQUIP_PIN_RING: Record<EquipTone, string> = {
  oxygen: 'border-cyan-300/70',
  iv: 'border-emerald-300/70',
  defib: 'border-rose-300/70',
  device: 'border-slate-300/60',
};

// Small icon-only marker pinned to the relevant body part. Replaced the old
// large labelled cards that crowded the assessment view — the human-readable
// labels now live in the compact AppliedEquipmentTray below the model.
function EquipmentPin({ tone, src, bare = false }: { tone: EquipTone; src: string; bare?: boolean }) {
  // Bare = sits directly on the patient (the oxygen mask on the face), no badge
  // chrome, so it reads as a worn device rather than an icon button.
  if (bare) {
    return (
      <div className="pointer-events-none h-8 w-8 animate-in fade-in zoom-in-75 duration-200 drop-shadow-[0_3px_5px_rgba(8,47,73,0.4)]">
        <img src={src} alt="" className="h-full w-full object-contain" draggable={false} />
      </div>
    );
  }
  return (
    <div className={`pointer-events-none flex h-8 w-8 items-center justify-center rounded-xl border ${EQUIP_PIN_RING[tone]} bg-slate-950/70 p-1 shadow-lg backdrop-blur-sm animate-in fade-in zoom-in-75 duration-200`}>
      <img src={src} alt="" className="h-full w-full object-contain" draggable={false} />
    </div>
  );
}

// Compact, fixed corner list of everything currently applied — restores the
// labels the on-body pins omit, without floating cards over the patient.
function AppliedEquipmentTray({ appliedTreatmentIds }: { appliedTreatmentIds: string[] }) {
  const equipment = useMemo(() => buildTreatmentEquipmentState(appliedTreatmentIds), [appliedTreatmentIds]);
  const chips: Array<{ src: string; label: string }> = [];
  if (equipment.oxygen) chips.push({ src: OXYGEN_SRC[equipment.oxygen.mode], label: equipment.oxygen.label });
  if (equipment.hasEtTube && equipment.oxygen?.mode !== 'ventilator') chips.push({ src: TREATMENT_ASSET_PATHS.etTube, label: 'ET tube' });
  if (equipment.hasOpa && !equipment.hasEtTube) chips.push({ src: TREATMENT_ASSET_PATHS.opa, label: 'OPA inserted' });
  if (equipment.hasFluids) chips.push({ src: TREATMENT_ASSET_PATHS.ivPole, label: 'Fluids running' });
  else if (equipment.hasIvAccess) chips.push({ src: TREATMENT_ASSET_PATHS.ivCannula, label: 'IV access' });
  if (equipment.hasDefibPads) chips.push({ src: TREATMENT_ASSET_PATHS.defibPads, label: 'Defib pads on' });
  if (equipment.hasLucas) chips.push({ src: TREATMENT_ASSET_PATHS.lucas, label: 'LUCAS running' });
  if (chips.length === 0) return null;
  return (
    <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex max-w-[44%] flex-col items-end gap-1.5">
      {chips.map((chip, i) => (
        <div key={i} className="flex items-center gap-1.5 rounded-full border border-white/15 bg-slate-950/70 py-0.5 pl-0.5 pr-2.5 text-[10px] font-medium text-white/90 shadow-md backdrop-blur-md">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
            <img src={chip.src} alt="" className="h-3.5 w-3.5 object-contain" draggable={false} />
          </span>
          {chip.label}
        </div>
      ))}
    </div>
  );
}

// Per-device graphic components removed — the overlay now renders small
// EquipmentPin markers driven directly by TREATMENT_ASSET_PATHS / OXYGEN_SRC.

function TreatmentEquipmentOverlay({
  appliedTreatmentIds,
  sampler,
}: {
  appliedTreatmentIds: string[];
  sampler: ((x: number, y: number) => [number, number, number]) | null;
}) {
  const equipment = useMemo(
    () => buildTreatmentEquipmentState(appliedTreatmentIds),
    [appliedTreatmentIds],
  );
  const hasVisibleEquipment = equipment.oxygen
    || equipment.hasIvAccess
    || equipment.hasDefibPads
    || equipment.hasLucas
    || equipment.hasEtTube
    || equipment.hasOpa;

  if (!hasVisibleEquipment) return null;

  const anchor = (x: number, y: number, z: number): [number, number, number] =>
    sampler ? sampler(x, y) : [x, y, z];

  return (
    <>
      {equipment.oxygen && (
        <MarkerHtml position={anchor(0.05, 1.52, 0.215)} distanceFactor={1.5} zIndexRange={[76, 0]} interactive={false}>
          <EquipmentPin tone="oxygen" src={OXYGEN_SRC[equipment.oxygen.mode]} bare />
        </MarkerHtml>
      )}

      {equipment.hasEtTube && equipment.oxygen?.mode !== 'ventilator' && (
        <MarkerHtml position={anchor(0.07, 1.55, 0.215)} distanceFactor={2.4} zIndexRange={[74, 0]} interactive={false}>
          <EquipmentPin tone="oxygen" src={TREATMENT_ASSET_PATHS.etTube} />
        </MarkerHtml>
      )}

      {equipment.hasOpa && !equipment.hasEtTube && (
        <MarkerHtml position={anchor(-0.07, 1.55, 0.215)} distanceFactor={2.4} zIndexRange={[73, 0]} interactive={false}>
          <EquipmentPin tone="device" src={TREATMENT_ASSET_PATHS.opa} />
        </MarkerHtml>
      )}

      {equipment.hasIvAccess && (
        <MarkerHtml position={anchor(-0.205, 0.82, 0.2)} distanceFactor={2.5} zIndexRange={[72, 0]} interactive={false}>
          <EquipmentPin tone="iv" src={TREATMENT_ASSET_PATHS.ivCannula} />
        </MarkerHtml>
      )}

      {equipment.hasFluids && (
        <MarkerHtml position={[-0.46, 1.16, 0.12]} distanceFactor={3.0} zIndexRange={[71, 0]} interactive={false}>
          <EquipmentPin tone="iv" src={TREATMENT_ASSET_PATHS.ivPole} />
        </MarkerHtml>
      )}

      {equipment.hasDefibPads && (
        <MarkerHtml position={anchor(0.01, 1.24, 0.218)} distanceFactor={2.5} zIndexRange={[68, 0]} interactive={false}>
          <EquipmentPin tone="defib" src={TREATMENT_ASSET_PATHS.defibPads} />
        </MarkerHtml>
      )}

      {equipment.hasLucas && (
        <MarkerHtml position={anchor(0, 1.19, 0.22)} distanceFactor={2.6} zIndexRange={[69, 0]} interactive={false}>
          <EquipmentPin tone="device" src={TREATMENT_ASSET_PATHS.lucas} />
        </MarkerHtml>
      )}
    </>
  );
}

function getPupilProfile(caseData: CaseScenario): PupilProfile {
  const raw = Array.isArray(caseData.abcde?.disability?.pupils)
    ? caseData.abcde.disability.pupils.join(' ')
    : caseData.abcde?.disability?.pupils || '';
  const text = raw.toLowerCase();
  const sideSegment = (side: 'left' | 'right'): string => {
    const otherSide = side === 'left' ? 'right' : 'left';
    const start = text.indexOf(side);
    if (start < 0) return '';
    const nextSide = text.indexOf(otherSide, start + side.length);
    return nextSide > start ? text.slice(start, nextSide) : text.slice(start);
  };
  const parseSideMm = (side: 'left' | 'right'): number | null => {
    const segment = sideSegment(side);
    const match = segment.match(/(\d+(?:\.\d+)?)\s*mm/);
    return match ? Number(match[1]) : null;
  };
  const parseSideReaction = (side: 'left' | 'right'): string | null => {
    const segment = sideSegment(side);
    if (!segment) return null;
    if (/fixed|non-reactive|non reactive|unreactive/.test(segment)) return 'fixed';
    if (/sluggish|slow/.test(segment)) return 'sluggish';
    if (/brisk|reactive|pearl|perrl/.test(segment)) return 'brisk';
    return null;
  };
  const leftSpecificMm = parseSideMm('left');
  const rightSpecificMm = parseSideMm('right');
  const leftSpecificReaction = parseSideReaction('left');
  const rightSpecificReaction = parseSideReaction('right');

  if (leftSpecificMm !== null || rightSpecificMm !== null || leftSpecificReaction || rightSpecificReaction) {
    const fallbackMm = text.includes('pinpoint') || text.includes('constrict') ? 1 : text.includes('dilated') ? 6 : 3;
    const leftMm = leftSpecificMm ?? fallbackMm;
    const rightMm = rightSpecificMm ?? fallbackMm;
    const leftReaction = leftSpecificReaction ?? (text.includes('fixed') || text.includes('non-reactive') ? 'fixed' : text.includes('sluggish') ? 'sluggish' : 'brisk');
    const rightReaction = rightSpecificReaction ?? (text.includes('fixed') || text.includes('non-reactive') ? 'fixed' : text.includes('sluggish') ? 'sluggish' : 'brisk');

    return {
      leftMm,
      rightMm,
      leftReaction,
      rightReaction,
      note: raw || 'Compare pupil size, equality, and direct response.',
      abnormal: leftMm !== rightMm || leftReaction !== 'brisk' || rightReaction !== 'brisk',
    };
  }

  if (text.includes('pinpoint') || text.includes('constrict')) {
    return {
      leftMm: 1,
      rightMm: 1,
      leftReaction: text.includes('fixed') ? 'fixed' : 'sluggish',
      rightReaction: text.includes('fixed') ? 'fixed' : 'sluggish',
      note: raw || 'Pinpoint pupils. Check toxidrome and ventilation.',
      abnormal: true,
    };
  }
  if (text.includes('unequal') || text.includes('anisocoria')) {
    return {
      leftMm: 5,
      rightMm: 2,
      leftReaction: text.includes('fixed') ? 'fixed' : 'sluggish',
      rightReaction: 'reactive',
      note: raw || 'Unequal pupils. Consider raised ICP, trauma, or focal neurological pathology.',
      abnormal: true,
    };
  }
  if (text.includes('dilated')) {
    return {
      leftMm: 6,
      rightMm: 6,
      leftReaction: text.includes('fixed') || text.includes('non-reactive') ? 'fixed' : 'sluggish',
      rightReaction: text.includes('fixed') || text.includes('non-reactive') ? 'fixed' : 'sluggish',
      note: raw || 'Dilated pupils. Correlate with GCS, drugs, hypoxia, and perfusion.',
      abnormal: true,
    };
  }

  return {
    leftMm: 3,
    rightMm: 3,
    leftReaction: 'brisk',
    rightReaction: 'brisk',
    note: raw || 'Equal, round, reactive pupils. Compare both eyes in ambient and direct light.',
    abnormal: false,
  };
}

function getAirwayCue(caseData: CaseScenario): { status: string; cues: string[]; compromised: boolean } {
  const airway = caseData.abcde?.airway;
  const findings = airway?.findings || [];
  const cues = findings.length > 0 ? findings : ['No visible obstruction', 'No gurgling or stridor', 'Airway patent on first look'];
  return {
    status: airway?.patent ? 'Patent' : 'Compromised',
    cues,
    compromised: airway?.patent === false,
  };
}

function getWorkflowForRegion(regionId: string | null): string[] {
  switch (regionId) {
    case 'head':
      return ['Inspect scalp and hairline', 'Palpate skull and facial bones', 'Check ears for blood or CSF', 'Move to eyes, lips, mouth, and speech', 'Escalate any altered LOC or head injury signs'];
    case 'face':
      return ['Inspect face, eyes, lips, and gaze', 'Measure pupils in mm', 'Compare equality', 'Assess direct and consensual response', 'Check oral cavity, speech, and facial symmetry'];
    case 'neck-cspine':
      return ['Maintain C-spine awareness', 'Look into mouth and listen at neck', 'Check tracheal position', 'Assess JVD and neck swelling', 'Palpate for crepitus or midline tenderness'];
    case 'chest':
      return ['Expose chest', 'Inspect breathing pattern and chest rise', 'Palpate expansion and crepitus', 'Percuss both sides', 'Auscultate apices, bases, and heart'];
    case 'abdomen':
      return ['Inspect before touching', 'Auscultate RUQ, LUQ, RLQ, LLQ', 'Percuss each quadrant', 'Palpate away from pain first', 'Note guarding, rigidity, distension'];
    case 'right-arm':
    case 'left-arm':
      return ['Inspect from shoulder to fingers', 'Palpate joints and long bones', 'Check radial pulse and CRT', 'Test sensation', 'Test motor function and grip'];
    case 'right-leg':
    case 'left-leg':
      return ['Inspect limb alignment and wounds', 'Palpate femur, knee, tib/fib, ankle, foot', 'Check DP/PT pulses and CRT', 'Assess sensation and motor', 'Screen compartments'];
    case 'posterior-logroll':
      return ['Assign C-spine control', 'Log roll on command', 'Inspect posterior surface', 'Palpate whole spine', 'Return patient safely'];
    default:
      return ['Select a region', 'Inspect first', 'Palpate only when indicated', 'Compare sides', 'Document what you find'];
  }
}

function getWorkflowStepForAction(regionId: string | null, actionId: string | null): number | null {
  if (!regionId || !actionId) return null;

  if (regionId === 'head') {
    if (actionId === 'scalp-inspect') return 0;
    if (actionId === 'scalp-palpate') return 1;
    if (actionId === 'ears-inspect') return 2;
  }

  if (regionId === 'face') {
    if (actionId === 'eyes-inspect' || actionId === 'lips-inspect') return 0;
    if (actionId === 'pupils-size') return 1;
    if (actionId === 'pupils-equality') return 2;
    if (actionId === 'pupils-reactivity') return 3;
    if (actionId.includes('mouth') || actionId.includes('teeth') || actionId.includes('tongue') || actionId === 'face-symmetry-inspect' || actionId === 'face-speech') return 4;
  }

  if (regionId === 'neck-cspine') {
    if (actionId === 'cspine-inspect') return 0;
    if (actionId === 'mouth-inspect' || actionId === 'airway-listen') return 1;
    if (actionId === 'trachea-palpate') return 2;
    if (actionId === 'jvd-inspect') return 3;
    if (actionId === 'neck-emphysema' || actionId === 'cspine-palpate') return 4;
  }

  if (regionId === 'chest') {
    if (actionId === 'chest-inspect') return 1;
    if (actionId === 'chest-palpate') return 2;
    if (actionId === 'chest-percuss') return 3;
    if (actionId === 'chest-auscultate-lungs' || actionId === 'chest-auscultate-heart' || actionId.startsWith('chest-auscultate-')) return 4;
  }

  if (regionId === 'abdomen') {
    if (actionId === 'abd-inspect') return 0;
    if (actionId === 'abd-auscultate' || (actionId.startsWith('abd-') && actionId.includes('auscultate'))) return 1;
    if (actionId === 'abd-percuss' || (actionId.startsWith('abd-') && actionId.includes('percuss'))) return 2;
    if (actionId === 'abd-palpate' || (actionId.startsWith('abd-') && actionId.includes('palpate'))) return 3;
  }

  if (regionId === 'posterior-logroll') {
    if (actionId === 'logroll-inspect') return 1;
    if (actionId === 'spine-inspect') return 2;
    if (actionId === 'spine-palpate') return 3;
  }

  if (isLimbRegion(regionId)) {
    if (actionId.includes('inspect')) return 0;
    if (actionId.includes('palpate') || actionId.includes('femur') || actionId.includes('tibia') || actionId.includes('ankle') || actionId.includes('foot')) return 1;
    if (actionId.includes('pulse')) return 2;
    if (actionId.includes('neuro') || actionId.includes('sensation')) return 3;
    if (actionId.includes('compartment')) return 4;
  }

  return null;
}

function getQuadrantFromAction(actionId: string | null | undefined): AbdomenQuadrant | null {
  if (!actionId) return null;
  const match = actionId.match(/^abd-(ruq|luq|rlq|llq)-/);
  return match ? (match[1] as AbdomenQuadrant) : null;
}

function getQuadrantMeta(quadrant: AbdomenQuadrant) {
  return ABDOMEN_QUADRANTS.find(q => q.id === quadrant) || ABDOMEN_QUADRANTS[0];
}

function getAbdomenText(caseData: CaseScenario): string {
  return [
    caseData.title,
    caseData.dispatchInfo?.callReason,
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.appearance,
    ...(caseData.secondarySurvey?.abdomen || []),
    ...(caseData.expectedFindings?.keyObservations || []),
  ].filter(Boolean).join(' ').toLowerCase();
}

function getBowelSoundTypeForCase(caseData: CaseScenario): BowelSoundType {
  const abdText = getAbdomenText(caseData);
  if (/bruit|aneurysm|aortic|vascular|renal artery/.test(abdText)) return 'bruit';
  if (/absent bowel|ileus|paralytic|peritonitis|silent abdomen/.test(abdText)) return 'absent';
  if (/tinkling|mechanical obstruction|bowel obstruction/.test(abdText)) return 'tinkling';
  if (/borborygmi|loud gurgling|hunger/.test(abdText)) return 'borborygmi';
  if (/hyperactive|diarrh|gastroenter|vomiting/.test(abdText)) return 'hyperactive';
  if (/hypoactive|post-op|postoperative|opioid|constipat/.test(abdText)) return 'hypoactive';
  return 'normal';
}

function getQuadrantRelevantFindings(caseData: CaseScenario, quadrant: AbdomenQuadrant): string[] {
  const abdomen = caseData.secondarySurvey?.abdomen || [];
  const qNeedles: Record<AbdomenQuadrant, RegExp[]> = {
    ruq: [/ruq|right upper|right hypochond|liver|hepatic|gallbladder|murphy|right costal/],
    luq: [/luq|left upper|left hypochond|spleen|splenic|stomach|epigastric.*left/],
    rlq: [/rlq|right lower|right iliac|appendix|appendic|mcburney|right pelvic|right flank/],
    llq: [/llq|left lower|left iliac|sigmoid|divertic|left pelvic|left flank/],
  };
  const generic = /diffuse|general|all quadrants|periton|rigid|guard|distend|bloated|tender abdomen|abdominal tenderness/;
  const needles = qNeedles[quadrant];
  const specific = abdomen.filter(f => needles.some(rx => rx.test(f.toLowerCase())));
  if (specific.length) return specific;
  return abdomen.filter(f => generic.test(f.toLowerCase()));
}

function getQuadrantPercussionFinding(caseData: CaseScenario, quadrant: AbdomenQuadrant): string {
  const meta = getQuadrantMeta(quadrant);
  const abdText = getAbdomenText(caseData);
  if (/ascites|free fluid|shifting dullness|fluid thrill/.test(abdText)) {
    return `${meta.label}: Dullness shifts with position — possible free fluid.`;
  }
  if (/obstruction|distend|tympan/.test(abdText)) {
    return `${meta.label}: Hyper-tympanic note over distended bowel loops.`;
  }
  if (quadrant === 'ruq') return 'RUQ: Expected liver dullness at the costal margin, with tympany over bowel inferiorly.';
  return `${meta.label}: Tympanic percussion note, no focal dullness.`;
}

function getQuadrantPalpationFinding(caseData: CaseScenario, quadrant: AbdomenQuadrant): string {
  const meta = getQuadrantMeta(quadrant);
  const findings = getQuadrantRelevantFindings(caseData, quadrant);
  if (findings.length) return `${meta.label}: ${findings.join('. ')}`;
  return `${meta.label}: Soft, non-tender. No guarding, rigidity, rebound tenderness, or palpable mass.`;
}

function getBreathingPattern(caseData: CaseScenario) {
  const rr = caseData.vitalSignsProgression?.initial?.respiration ?? 16;
  const text = [
    caseData.title,
    caseData.initialPresentation?.appearance,
    caseData.initialPresentation?.generalImpression,
    ...(caseData.initialPresentation?.sounds || []),
    ...(caseData.abcde?.breathing?.findings || []),
    ...(caseData.secondarySurvey?.chest || []),
  ].filter(Boolean).join(' ').toLowerCase();

  if (/apnoea|apnea|not breathing|respiratory arrest/.test(text) || rr === 0) {
    return { label: 'Apnoeic', rate: 0, detail: 'No visible chest rise. Begin ventilation immediately.', severity: 'critical' as const, asymmetry: null as string | null };
  }
  if (/agonal|gasp/.test(text)) {
    return { label: 'Agonal gasps', rate: rr || 6, detail: 'Irregular gasping respirations with poor tidal volume.', severity: 'critical' as const, asymmetry: null as string | null };
  }
  if (/pneumothorax|absent.*right|right.*absent|absent.*left|left.*absent|unequal|asymmetric/.test(text)) {
    const side = /right/.test(text) && !/left.*absent/.test(text) ? 'right' : /left/.test(text) ? 'left' : 'one side';
    return { label: 'Asymmetric chest rise', rate: rr, detail: `Reduced movement on the ${side}; compare percussion and breath sounds.`, severity: 'warning' as const, asymmetry: side };
  }
  if (rr >= 30 || /severe distress|accessory|tripod|unable to speak|wheeze|asthma|copd/.test(text)) {
    return { label: 'Tachypnoeic, laboured', rate: rr, detail: 'Fast work of breathing with accessory muscle use and short phrases.', severity: 'warning' as const, asymmetry: null as string | null };
  }
  if (rr <= 8 || /shallow|hypoventilat|opioid|reduced respiratory/.test(text)) {
    return { label: 'Slow / shallow', rate: rr, detail: 'Reduced chest excursion; watch ventilation and consciousness closely.', severity: 'warning' as const, asymmetry: null as string | null };
  }
  if (/pain|splint|rib|chest injury|abdominal pain/.test(text)) {
    return { label: 'Shallow, splinting', rate: rr, detail: 'Smaller chest movement consistent with pain or guarding.', severity: 'observe' as const, asymmetry: null as string | null };
  }
  return { label: 'Regular chest rise', rate: rr, detail: 'Symmetrical rise and fall without obvious accessory muscle use.', severity: 'normal' as const, asymmetry: null as string | null };
}

function PupilCloseUp({ profile }: { profile: PupilProfile }) {
  const pupilStyle = (mm: number): CSSProperties => ({
    width: `${Math.max(10, Math.min(34, mm * 5.4))}px`,
    height: `${Math.max(10, Math.min(34, mm * 5.4))}px`,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/80 bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.22),transparent_34%),linear-gradient(180deg,#111827,#020617)] p-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_40px_-28px_rgba(2,6,23,0.95)]">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-300">Pupil Close-Up</p>
          <p className="mt-0.5 text-[10px] text-slate-400">Direct light, compare left and right</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-semibold ${
          profile.abnormal
            ? 'border-amber-300/30 bg-amber-400/15 text-amber-100'
            : 'border-emerald-300/30 bg-emerald-400/15 text-emerald-100'
        }`}>
          {profile.abnormal ? 'Abnormal finding' : 'Normal finding'}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
        {[
          { side: 'Left', mm: profile.leftMm, reaction: profile.leftReaction },
          { side: 'Right', mm: profile.rightMm, reaction: profile.rightReaction },
        ].map(eye => (
          <div key={eye.side} className="rounded-xl border border-white/10 bg-white/[0.07] p-2 shadow-[inset_0_1px_12px_rgba(255,255,255,0.03)]">
            <div className="relative mx-auto h-[76px] w-full min-w-[110px] max-w-[168px] overflow-hidden rounded-[50%] border border-white/15 bg-[#b9876e] shadow-[0_10px_22px_-18px_rgba(0,0,0,0.9)]">
              <div className="absolute inset-x-2 top-1/2 h-[48px] -translate-y-1/2 rounded-[999px] bg-gradient-to-b from-white via-slate-100 to-slate-300 shadow-[inset_0_2px_8px_rgba(15,23,42,0.34)]" />
              <div className="absolute inset-x-5 top-3 h-5 rounded-[100%] border-t-[10px] border-[#7a493d]/55" />
              <div className="absolute inset-x-5 bottom-3 h-5 rounded-[100%] border-b-[8px] border-[#6b3f35]/45" />
              <div className="absolute left-1/2 top-1/2 h-[47px] w-[47px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_32%,#67e8f9_0%,#0891b2_31%,#155e75_55%,#082f49_76%,#020617_100%)] shadow-[inset_0_0_10px_rgba(255,255,255,0.2),inset_0_0_18px_rgba(2,6,23,0.75)]" />
              <div className="absolute left-1/2 top-1/2 h-[54px] w-[54px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/20" />
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black shadow-[0_0_12px_rgba(0,0,0,0.75)]"
                style={pupilStyle(eye.mm)}
              />
              <div className="absolute left-[42%] top-[35%] h-2.5 w-2.5 rounded-full bg-white/90 blur-[0.5px]" />
              <div className="absolute left-[54%] top-[29%] h-1.5 w-1.5 rounded-full bg-white/60" />
              <div className="absolute left-[18%] top-[48%] h-px w-8 rotate-[-10deg] bg-red-400/25" />
              <div className="absolute right-[18%] top-[54%] h-px w-7 rotate-[12deg] bg-red-400/20" />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 text-[9px]">
              <span className="font-semibold text-slate-100">{eye.side}</span>
              <span className="rounded-full bg-black/25 px-1.5 py-0.5 font-mono text-slate-100">{eye.mm} mm</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${eye.reaction.includes('fixed') ? 'bg-red-300' : eye.reaction.includes('sluggish') ? 'bg-amber-300' : 'bg-emerald-300'}`} />
              <p className="truncate text-[8px] uppercase tracking-[0.12em] text-slate-300">{eye.reaction}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-[auto_1fr] gap-2 rounded-lg border border-white/10 bg-black/20 p-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-400/15 text-[10px] font-semibold text-sky-100">mm</div>
        <p className="text-[10px] leading-relaxed text-slate-200">{profile.note}</p>
      </div>
    </div>
  );
}

function AirwayCloseUp({ caseData }: { caseData: CaseScenario }) {
  const airway = getAirwayCue(caseData);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-sky-50/70 p-3 shadow-sm dark:border-white/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Airway View</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Look, listen, then palpate neck structures</p>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[8px] font-semibold ${airway.compromised ? 'border-red-300/40 bg-red-500/15 text-red-600 dark:text-red-300' : 'border-emerald-300/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'}`}>
          {airway.status}
        </span>
      </div>
      <div className="relative mx-auto h-28 max-w-[190px] rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200/70 dark:from-slate-800 dark:to-slate-900">
        <div className="absolute left-1/2 top-1 h-20 w-28 -translate-x-1/2 rounded-[48%] bg-gradient-to-b from-[#d6a688] to-[#a96d54] shadow-lg" />
        <div className="absolute left-[42%] top-7 h-2.5 w-2.5 rounded-full bg-slate-900/85" />
        <div className="absolute right-[42%] top-7 h-2.5 w-2.5 rounded-full bg-slate-900/85" />
        <div className="absolute left-1/2 top-11 h-3 w-5 -translate-x-1/2 rounded-b-full border-b-2 border-[#8f5749]/80" />
        <div className={`absolute left-1/2 top-14 h-8 w-16 -translate-x-1/2 rounded-b-full border-4 border-[#9f5f4e] shadow-inner ${airway.compromised ? 'bg-red-950' : 'bg-slate-900'}`}>
          <div className={`absolute left-1/2 top-2 h-3 w-6 -translate-x-1/2 rounded-full ${airway.compromised ? 'bg-red-500/70' : 'bg-pink-300/80'}`} />
        </div>
        <div className={`absolute bottom-0 left-1/2 h-12 w-10 -translate-x-1/2 rounded-t-full ${airway.compromised ? 'bg-red-500/20 ring-2 ring-red-400/40' : 'bg-sky-500/15 ring-1 ring-sky-300/50'}`} />
      </div>
      <div className="mt-2 space-y-1">
        {airway.cues.slice(0, 3).map(cue => (
          <div key={cue} className="rounded-lg border border-border/50 bg-muted/30 px-2 py-1 text-[10px] leading-relaxed">
            {cue}
          </div>
        ))}
      </div>
    </div>
  );
}

function BreathingPatternPanel({ caseData }: { caseData: CaseScenario }) {
  const pattern = getBreathingPattern(caseData);
  const cycleSeconds = pattern.rate > 0 ? Math.max(0.85, Math.min(4, 60 / pattern.rate)) : 2.8;
  const color = pattern.severity === 'critical' ? 'text-red-500 border-red-400/40 bg-red-500/10'
    : pattern.severity === 'warning' ? 'text-amber-500 border-amber-400/40 bg-amber-500/10'
      : pattern.severity === 'observe' ? 'text-sky-600 border-sky-400/40 bg-sky-500/10'
        : 'text-emerald-600 border-emerald-400/40 bg-emerald-500/10';
  const leftScale = pattern.asymmetry === 'left' ? 0.55 : 1;
  const rightScale = pattern.asymmetry === 'right' ? 0.55 : 1;

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10">
            <Wind className="h-3.5 w-3.5 text-sky-500" />
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Breathing Pattern</p>
            <p className="text-[10px] text-muted-foreground">RR {pattern.rate || '--'} /min</p>
          </div>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-[8px] font-semibold ${color}`}>{pattern.label}</span>
      </div>
      <div className="relative h-24 overflow-hidden rounded-xl border border-slate-200 bg-[linear-gradient(180deg,#f8fafc,#e2e8f0)] dark:border-white/10 dark:bg-[linear-gradient(180deg,#020617,#0f172a)]">
        <div className="absolute inset-x-8 bottom-4 h-14 rounded-t-[50px] border-t border-slate-400/30" />
        {[
          { side: 'L', scale: leftScale },
          { side: 'R', scale: rightScale },
        ].map(chest => (
          <div
            key={chest.side}
            className={`absolute bottom-5 h-12 w-12 rounded-[45%] border ${chest.scale < 1 ? 'border-amber-400/70 bg-amber-400/20' : 'border-sky-400/45 bg-sky-400/15'} animate-pulse`}
            style={{
              ...(chest.side === 'L' ? { left: '27%' } : { right: '27%' }),
              transform: `scaleY(${chest.scale})`,
              transformOrigin: 'bottom center',
              animationDuration: `${cycleSeconds}s`,
            }}
          >
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-500 dark:text-slate-300">{chest.side}</span>
          </div>
        ))}
        <div className="absolute left-1/2 bottom-4 h-16 w-px -translate-x-1/2 bg-slate-400/30" />
      </div>
      <p className="mt-2 rounded-lg bg-muted/35 px-2 py-1.5 text-[10px] leading-relaxed text-foreground/80">{pattern.detail}</p>
    </div>
  );
}

function ChestAssessmentMap({ selectedAction, caseData }: { selectedAction: string | null; caseData: CaseScenario }) {
  const pattern = getBreathingPattern(caseData);
  const chestText = [
    ...(caseData.abcde?.breathing?.findings || []),
    ...(caseData.secondarySurvey?.chest || []),
    ...(caseData.abcde?.breathing?.auscultation || []),
  ].join(' ').toLowerCase();
  const rightFlag = /right|r hemithorax/.test(chestText) && /(absent|diminished|reduced|tender|wound|bruise|crepitus)/.test(chestText);
  const leftFlag = /left|l hemithorax/.test(chestText) && /(absent|diminished|reduced|tender|wound|bruise|crepitus)/.test(chestText);
  const activeTone = selectedAction?.includes('auscultate')
    ? 'Auscultation'
    : selectedAction?.includes('percuss')
      ? 'Percussion'
      : selectedAction?.includes('palpate')
        ? 'Palpation'
        : selectedAction?.includes('inspect')
          ? 'Inspection'
          : 'Ready';

  const lungClass = (side: 'right' | 'left', zone: 'upper' | 'lower') => {
    const flagged = side === 'right' ? rightFlag : leftFlag;
    const zoneActionId = `chest-auscultate-${side === 'right' ? 'r' : 'l'}${zone === 'upper' ? 'u' : 'l'}`;
    const active = selectedAction === 'chest-auscultate-lungs'
      || selectedAction === 'chest-percuss'
      || selectedAction === zoneActionId;
    if (flagged) return 'border-amber-300 bg-amber-400/20 shadow-[0_0_18px_rgba(251,191,36,0.22)]';
    if (active) return zone === 'upper' ? 'border-cyan-300 bg-cyan-400/20' : 'border-sky-300 bg-sky-400/15';
    return 'border-slate-300/70 bg-white/70 dark:border-white/15 dark:bg-slate-900/70';
  };

  return (
    <div className="rounded-xl border border-slate-200/70 bg-gradient-to-br from-white to-cyan-50/45 p-3 shadow-sm dark:border-white/10 dark:from-slate-950 dark:to-cyan-950/15">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Chest Landmarks</p>
          <p className="text-[10px] text-muted-foreground">Compare sides, then listen in matching fields</p>
        </div>
        <span className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-2 py-0.5 text-[8px] font-semibold text-cyan-700 dark:text-cyan-300">
          {activeTone}
        </span>
      </div>

      <div className="grid gap-2 min-[430px]:grid-cols-[150px_1fr]">
        <div className="relative mx-auto h-40 w-36 rounded-[34px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc,#e2e8f0)] shadow-inner dark:border-white/10 dark:bg-[linear-gradient(180deg,#020617,#0f172a)]">
          <div className="absolute left-1/2 top-2 h-[132px] w-[108px] -translate-x-1/2 rounded-[40%] border border-slate-300/50 bg-white/45 dark:border-white/10 dark:bg-white/5" />
          <div className="absolute left-1/2 top-4 h-[116px] w-px -translate-x-1/2 bg-slate-400/35" />
          {[
            { key: 'right-upper', side: 'right' as const, zone: 'upper' as const, label: 'R upper', style: { left: '18px', top: '26px' } },
            { key: 'left-upper', side: 'left' as const, zone: 'upper' as const, label: 'L upper', style: { right: '18px', top: '26px' } },
            { key: 'right-lower', side: 'right' as const, zone: 'lower' as const, label: 'R lower', style: { left: '17px', top: '78px' } },
            { key: 'left-lower', side: 'left' as const, zone: 'lower' as const, label: 'L lower', style: { right: '17px', top: '78px' } },
          ].map(zone => (
            <div
              key={zone.key}
              className={`absolute h-[46px] w-[46px] rounded-[45%] border p-1 text-center text-[8px] font-semibold leading-[1.1] text-slate-700 transition-colors dark:text-slate-100 ${lungClass(zone.side, zone.zone)}`}
              style={zone.style}
            >
              <span className="absolute inset-0 rounded-[45%] border-t border-white/60" />
              <span className="relative top-3">{zone.label}</span>
            </div>
          ))}
          <div className={`absolute left-1/2 top-[74px] h-[42px] w-[34px] -translate-x-[18%] rounded-[45%_55%_55%_45%] border text-center text-[8px] font-bold leading-[42px] ${
            selectedAction === 'chest-auscultate-heart'
              ? 'border-rose-300 bg-rose-500/20 text-rose-700 shadow-[0_0_18px_rgba(244,63,94,0.22)] dark:text-rose-200'
              : 'border-rose-200 bg-rose-50/80 text-rose-700 dark:border-rose-400/25 dark:bg-rose-950/40 dark:text-rose-200'
          }`}>
            Heart
          </div>
          <div className={`absolute inset-x-7 top-[18px] h-[112px] rounded-[40%] border-2 border-dashed ${
            selectedAction === 'chest-palpate' || selectedAction === 'chest-inspect'
              ? 'border-amber-400/70'
              : 'border-transparent'
          }`} />
        </div>
        <div className="grid content-start gap-1.5">
          {[
            ['Pattern', pattern.label],
            ['Chest wall', 'symmetry, tenderness, crepitus, flail'],
            ['Lungs', 'upper and lower fields, compare right to left'],
            ['Heart', 'aortic, pulmonic, tricuspid, mitral/apex'],
          ].map(([label, detail]) => (
            <div key={label} className="rounded-lg border border-border/50 bg-white/65 px-2 py-1.5 dark:bg-slate-950/35">
              <p className="text-[9px] font-semibold text-foreground">{label}</p>
              <p className="text-[9px] leading-relaxed text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AbdominalQuadrantPanel({ selectedAction, caseData, compact = false }: { selectedAction: string | null; caseData: CaseScenario; compact?: boolean }) {
  const selectedQuadrant = getQuadrantFromAction(selectedAction);
  const bowelType = getBowelSoundTypeForCase(caseData);
  const painText = getAbdomenText(caseData);
  const technique = selectedAction?.includes('palpate')
    ? 'Palpation'
    : selectedAction?.includes('percuss')
      ? 'Percussion'
      : selectedAction?.includes('auscultate')
        ? 'Auscultation'
        : selectedAction?.includes('inspect')
          ? 'Inspection'
          : 'Ready';
  const isLikelyRelevant = (quadrant: AbdomenQuadrant) => quadrant === 'ruq' ? /ruq|right upper|liver|gallbladder/.test(painText)
    : quadrant === 'luq' ? /luq|left upper|spleen|stomach/.test(painText)
      : quadrant === 'rlq' ? /rlq|right lower|append/.test(painText)
        : /llq|left lower|sigmoid|divertic/.test(painText);

  if (compact) {
    return (
      <div className="rounded-xl border border-white/14 bg-white/92 p-2 text-slate-900 shadow-sm dark:bg-slate-950/80 dark:text-white">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-white/45">Quadrants</p>
            <p className="truncate text-[10px] font-semibold text-slate-800 dark:text-white/88">IAPP sequence</p>
          </div>
          <span className="shrink-0 rounded-full border border-emerald-300/50 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-semibold text-emerald-700 dark:text-emerald-200">
            {technique}
          </span>
        </div>

        <div className="grid grid-cols-[6.3rem_1fr] gap-2">
          <div className="relative h-28 w-[6.3rem] rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc,#e2e8f0)] shadow-inner dark:border-white/10 dark:bg-[linear-gradient(180deg,#020617,#0f172a)]">
            <div className="absolute left-1/2 top-3 h-[5.4rem] w-[4.6rem] -translate-x-1/2 rounded-[42%] border border-slate-300/50 bg-white/55 dark:border-white/10 dark:bg-white/5" />
            <div className="absolute left-1/2 top-[1.2rem] h-[4.7rem] w-px -translate-x-1/2 bg-slate-400/35" />
            <div className="absolute left-[1rem] right-[1rem] top-[3.55rem] h-px bg-slate-400/35" />
            <div className="absolute left-1/2 top-[3.15rem] h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-slate-400/45 bg-slate-100 shadow-sm dark:bg-slate-700" />
            {ABDOMEN_QUADRANTS.map(q => {
              const isActive = selectedQuadrant === q.id;
              const likelyRelevant = isLikelyRelevant(q.id);
              const position = q.id === 'ruq' ? 'left-[0.95rem] top-[1.4rem]'
                : q.id === 'luq' ? 'right-[0.95rem] top-[1.4rem]'
                  : q.id === 'rlq' ? 'left-[0.95rem] top-[4.35rem]'
                    : 'right-[0.95rem] top-[4.35rem]';
              return (
                <div
                  key={q.id}
                  className={`absolute flex h-9 w-9 items-center justify-center rounded-xl border text-[8px] font-bold transition-colors ${position} ${
                    isActive
                      ? 'border-emerald-400 bg-emerald-500/25 text-emerald-950 ring-1 ring-emerald-400/40 dark:text-emerald-100'
                      : likelyRelevant
                        ? 'border-amber-300/80 bg-amber-300/20 text-amber-900 dark:text-amber-100'
                        : 'border-slate-300/70 bg-white/72 text-slate-700 dark:border-white/15 dark:bg-slate-900/70 dark:text-slate-100'
                  }`}
                >
                  {q.label}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-1">
            {ABDOMEN_QUADRANTS.map(q => {
              const isActive = selectedQuadrant === q.id;
              const likelyRelevant = isLikelyRelevant(q.id);
              return (
                <div
                  key={q.id}
                  className={`rounded-lg border px-1.5 py-1 text-[8px] leading-tight ${
                    isActive
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-900 dark:text-emerald-100'
                      : likelyRelevant
                        ? 'border-amber-300/70 bg-amber-300/12 text-amber-900 dark:text-amber-100'
                        : 'border-slate-200 bg-slate-50/85 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-white/65'
                  }`}
                >
                  <p className="font-bold">{q.label}</p>
                  <p className="mt-0.5 line-clamp-2">{q.hint}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/70 bg-gradient-to-br from-white to-emerald-50/40 p-3 shadow-sm dark:border-white/10 dark:from-slate-950 dark:to-emerald-950/20">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Abdominal Quadrants</p>
          <p className="text-[10px] text-muted-foreground">Auscultate, percuss, then palpate each area</p>
        </div>
        <div className="flex gap-1">
          <span className="rounded-full border border-emerald-300/40 bg-emerald-500/10 px-2 py-0.5 text-[8px] font-semibold text-emerald-700 dark:text-emerald-300">
            {bowelType}
          </span>
          <span className="rounded-full border border-slate-300/60 bg-white/70 px-2 py-0.5 text-[8px] font-semibold text-slate-600 dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-300">
            {technique}
          </span>
        </div>
      </div>
      <div className="grid gap-2 min-[430px]:grid-cols-[132px_1fr]">
        <div className="relative mx-auto h-40 w-32 rounded-[38px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc,#e2e8f0)] shadow-inner dark:border-white/10 dark:bg-[linear-gradient(180deg,#020617,#0f172a)]">
          <div className="absolute left-1/2 top-4 h-[126px] w-[96px] -translate-x-1/2 rounded-[42%] border border-slate-300/50 bg-white/50 dark:border-white/10 dark:bg-white/5" />
          <div className="absolute left-1/2 top-[22px] h-[106px] w-px -translate-x-1/2 bg-slate-400/35" />
          <div className="absolute left-[19px] right-[19px] top-[77px] h-px bg-slate-400/35" />
          <div className="absolute left-1/2 top-[69px] h-3 w-3 -translate-x-1/2 rounded-full border border-slate-400/45 bg-slate-100 shadow-sm dark:bg-slate-700" />
          {ABDOMEN_QUADRANTS.map(q => {
            const isActive = selectedQuadrant === q.id;
            const likelyRelevant = isLikelyRelevant(q.id);
            const position = q.id === 'ruq' ? 'left-[21px] top-[30px]'
              : q.id === 'luq' ? 'right-[21px] top-[30px]'
                : q.id === 'rlq' ? 'left-[21px] top-[83px]'
                  : 'right-[21px] top-[83px]';
            return (
              <div
                key={q.id}
                className={`absolute h-[44px] w-[42px] rounded-2xl border px-1 pt-2 text-center text-[9px] font-bold transition-colors ${position} ${
                  isActive
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-900 ring-1 ring-emerald-400/30 dark:text-emerald-100'
                    : likelyRelevant
                      ? 'border-amber-300/80 bg-amber-400/15 text-amber-900 dark:text-amber-100'
                      : 'border-slate-300/70 bg-white/70 text-slate-700 dark:border-white/15 dark:bg-slate-900/70 dark:text-slate-100'
                }`}
              >
                {q.label}
                {isActive && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />}
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {ABDOMEN_QUADRANTS.map(q => {
            const isActive = selectedQuadrant === q.id;
            const likelyRelevant = isLikelyRelevant(q.id);
            return (
              <div
                key={q.id}
                className={`min-h-[58px] rounded-xl border p-2 transition-colors ${
                  isActive
                    ? 'border-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-400/30'
                    : likelyRelevant
                      ? 'border-amber-300/70 bg-amber-400/10'
                      : 'border-border/60 bg-white/70 dark:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <p className="text-[11px] font-bold">{q.label}</p>
                  {likelyRelevant && <span className="rounded-full bg-amber-400/20 px-1 text-[7px] font-semibold text-amber-700 dark:text-amber-300">focus</span>}
                </div>
                <p className="mt-0.5 text-[8px] leading-tight text-muted-foreground">{q.full}</p>
                <p className="mt-1 text-[8px] leading-tight text-muted-foreground/80">{q.hint}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SecondaryAssessmentOutline({ activeRegion, selectedAction, caseData }: {
  activeRegion: string | null;
  selectedAction: string | null;
  caseData: CaseScenario;
}) {
  const profile = activeRegion === 'face' ? getPupilProfile(caseData) : null;
  const workflow = getWorkflowForRegion(activeRegion);
  const activeWorkflowStep = getWorkflowStepForAction(activeRegion, selectedAction);
  const shouldShowPupils = activeRegion === 'face' && (!selectedAction || selectedAction.includes('pupil') || selectedAction.includes('eyes'));
  const shouldShowAirway = activeRegion === 'neck-cspine' && (!selectedAction || selectedAction.includes('airway') || selectedAction.includes('trachea') || selectedAction.includes('jvd'));
  const shouldShowBreathing = activeRegion === 'chest';
  const shouldShowAbdomen = activeRegion === 'abdomen';

  return (
    <div className="space-y-2">
      {shouldShowPupils && profile && <PupilCloseUp profile={profile} />}
      {shouldShowAirway && <AirwayCloseUp caseData={caseData} />}
      {shouldShowBreathing && <ChestAssessmentMap selectedAction={selectedAction} caseData={caseData} />}
      {shouldShowBreathing && <BreathingPatternPanel caseData={caseData} />}
      {shouldShowAbdomen && <AbdominalQuadrantPanel selectedAction={selectedAction} caseData={caseData} />}
      <div className="rounded-xl border border-border/50 bg-white/80 p-2.5 shadow-sm dark:bg-slate-900/60">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Secondary Assessment Flow</p>
          {activeWorkflowStep !== null && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-semibold text-primary">
              Step {activeWorkflowStep + 1}
            </span>
          )}
        </div>
        <div className="mt-2 space-y-0.5">
          {workflow.map((item, index) => {
            const isActive = activeWorkflowStep === index;
            const isBeforeActive = activeWorkflowStep !== null && index < activeWorkflowStep;
            return (
              <div
                key={item}
                className={`grid grid-cols-[18px_1fr] gap-2 rounded-lg px-1.5 py-1.5 text-[10px] leading-relaxed transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/15'
                    : isBeforeActive
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-foreground/80 dark:text-slate-300'
                }`}
              >
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-mono text-[8px] ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : isBeforeActive
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-muted text-muted-foreground'
                }`}>
                {index + 1}
                </span>
                <span className={isActive ? 'font-semibold' : ''}>{item}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Region config — what exams can be done per body region
// ============================================================================

interface ExamAction {
  id: string;
  label: string;
  technique: 'inspect' | 'palpate' | 'percuss' | 'auscultate';
}

interface SubRegion {
  id: string;
  label: string;
  actions: ExamAction[];
}

/** Collapsible action group for limb regions */
interface ActionGroup {
  id: string;
  label: string;
  defaultExpanded: boolean;
  actions: ExamAction[];
}

const TECHNIQUE_ICONS = { inspect: Eye, palpate: Hand, percuss: Activity, auscultate: Stethoscope };
type ExamTechnique = ExamAction['technique'];

const TECHNIQUE_META: Record<ExamTechnique, { label: string; hint: string; tone: string; active: string }> = {
  inspect: {
    label: 'Inspect',
    hint: 'look first',
    tone: 'border-sky-300/40 bg-sky-400/10 text-sky-800 dark:text-sky-100',
    active: 'border-sky-300 bg-sky-400/20 text-sky-900 shadow-[0_0_18px_rgba(56,189,248,0.22)] dark:text-sky-50',
  },
  palpate: {
    label: 'Palpate',
    hint: 'hands on',
    tone: 'border-amber-300/40 bg-amber-400/10 text-amber-800 dark:text-amber-100',
    active: 'border-amber-300 bg-amber-400/20 text-amber-900 shadow-[0_0_18px_rgba(251,191,36,0.22)] dark:text-amber-50',
  },
  percuss: {
    label: 'Percuss',
    hint: 'compare sides',
    tone: 'border-violet-300/40 bg-violet-400/10 text-violet-800 dark:text-violet-100',
    active: 'border-violet-300 bg-violet-400/20 text-violet-900 shadow-[0_0_18px_rgba(167,139,250,0.22)] dark:text-violet-50',
  },
  auscultate: {
    label: 'Listen',
    hint: 'stethoscope',
    tone: 'border-emerald-300/40 bg-emerald-400/10 text-emerald-800 dark:text-emerald-100',
    active: 'border-emerald-300 bg-emerald-400/20 text-emerald-900 shadow-[0_0_18px_rgba(52,211,153,0.22)] dark:text-emerald-50',
  },
};

const TECHNIQUE_ORDER: ExamTechnique[] = ['inspect', 'palpate', 'percuss', 'auscultate'];

// ============================================================================
// Collapsible action groups for limb regions (Phase 2A)
// ============================================================================

function getLimbActionGroups(regionId: string): ActionGroup[] | null {
  const prefix = regionId === 'right-arm' ? 'r' : regionId === 'left-arm' ? 'l' : regionId === 'right-leg' ? 'r' : regionId === 'left-leg' ? 'l' : null;
  if (!prefix) return null;

  if (regionId === 'right-arm' || regionId === 'left-arm') {
    return [
      {
        id: `${regionId}-core`,
        label: 'Core Assessment',
        defaultExpanded: true,
        actions: [
          { id: `${prefix}-arm-inspect`, label: 'Inspect', technique: 'inspect' },
          { id: `${prefix}-arm-pulses`, label: 'Radial Pulse + CRT', technique: 'palpate' },
          { id: `${prefix}-arm-neuro`, label: 'Sensation & Motor', technique: 'inspect' },
        ],
      },
      {
        id: `${regionId}-bones`,
        label: 'Bone & Joint Palpation',
        defaultExpanded: false,
        actions: [
          { id: `${prefix}-shoulder-palpate`, label: 'Shoulder', technique: 'palpate' },
          { id: `${prefix}-humerus-palpate`, label: 'Humerus (upper arm)', technique: 'palpate' },
          { id: `${prefix}-elbow-palpate`, label: 'Elbow', technique: 'palpate' },
          { id: `${prefix}-forearm-palpate`, label: 'Radius / Ulna (forearm)', technique: 'palpate' },
          { id: `${prefix}-wrist-palpate`, label: 'Wrist / Scaphoid', technique: 'palpate' },
          { id: `${prefix}-hand-palpate`, label: 'Hand (metacarpals)', technique: 'palpate' },
        ],
      },
      {
        id: `${regionId}-digits`,
        label: 'Detailed Digit Exam',
        defaultExpanded: false,
        actions: [
          { id: `${prefix}-thumb-palpate`, label: 'Thumb', technique: 'palpate' },
          { id: `${prefix}-fingers-palpate`, label: 'Fingers (index\u2013little)', technique: 'palpate' },
        ],
      },
    ];
  }

  if (regionId === 'right-leg' || regionId === 'left-leg') {
    return [
      {
        id: `${regionId}-core`,
        label: 'Core Assessment',
        defaultExpanded: true,
        actions: [
          { id: `${prefix}-leg-inspect`, label: 'Inspect (wounds, deformity, swelling)', technique: 'inspect' },
          { id: `${prefix}-leg-pulses`, label: 'Pedal Pulses (DP + PT) + CRT', technique: 'palpate' },
          { id: `${prefix}-leg-neuro`, label: 'Sensation & Motor', technique: 'inspect' },
        ],
      },
      {
        id: `${regionId}-upper`,
        label: 'Upper Leg (Thigh)',
        defaultExpanded: false,
        actions: [
          { id: `${prefix}-thigh-inspect`, label: 'Inspect Thigh', technique: 'inspect' },
          { id: `${prefix}-femur-palpate`, label: 'Palpate Femur', technique: 'palpate' },
          { id: `${prefix}-thigh-compartment`, label: 'Compartment Check (thigh)', technique: 'palpate' },
        ],
      },
      {
        id: `${regionId}-knee`,
        label: 'Knee',
        defaultExpanded: false,
        actions: [
          { id: `${prefix}-knee-inspect`, label: 'Inspect Knee', technique: 'inspect' },
          { id: `${prefix}-knee-palpate`, label: 'Palpate Knee (patella, ligaments)', technique: 'palpate' },
        ],
      },
      {
        id: `${regionId}-lower`,
        label: 'Lower Leg (Shin)',
        defaultExpanded: false,
        actions: [
          { id: `${prefix}-shin-inspect`, label: 'Inspect Lower Leg', technique: 'inspect' },
          { id: `${prefix}-tibia-palpate`, label: 'Palpate Tibia / Fibula', technique: 'palpate' },
          { id: `${prefix}-shin-compartment`, label: 'Compartment Check (lower leg)', technique: 'palpate' },
        ],
      },
      {
        id: `${regionId}-foot`,
        label: 'Ankle & Foot',
        defaultExpanded: false,
        actions: [
          { id: `${prefix}-ankle-inspect`, label: 'Inspect Ankle', technique: 'inspect' },
          { id: `${prefix}-ankle-palpate`, label: 'Palpate Ankle (malleoli)', technique: 'palpate' },
          { id: `${prefix}-foot-palpate`, label: 'Palpate Foot (metatarsals)', technique: 'palpate' },
          { id: `${prefix}-toes-inspect`, label: 'Toes (colour, cap refill)', technique: 'inspect' },
        ],
      },
    ];
  }

  return null;
}

function getSubRegions(regionId: string): SubRegion[] {
  switch (regionId) {
    // ===== HEAD =====
    // What you examine ON the head: scalp, skull, ears
    case 'head': return [
      { id: 'head-exam', label: 'Head', actions: [
        { id: 'scalp-inspect', label: 'Inspect Scalp', technique: 'inspect' },
        { id: 'scalp-palpate', label: 'Palpate Skull', technique: 'palpate' },
        { id: 'face-inspect', label: 'Inspect Face (bruising, swelling)', technique: 'inspect' },
        { id: 'jaw-palpate', label: 'Palpate Facial Bones / Jaw', technique: 'palpate' },
        { id: 'ears-inspect', label: 'Ears (Battle sign, CSF, haemotympanum)', technique: 'inspect' },
      ]},
    ];

    // ===== FACE =====
    // Specific structures: eyes, nose, mouth, jaw, facial symmetry
    case 'face': return [
      { id: 'face-eyes', label: 'Eyes', actions: [
        { id: 'pupils-size', label: 'Pupil Size (mm)', technique: 'inspect' },
        { id: 'pupils-reactivity', label: 'Pupil Reactivity', technique: 'inspect' },
        { id: 'pupils-equality', label: 'Pupil Equality (compare L vs R)', technique: 'inspect' },
        { id: 'eyes-inspect', label: 'Conjunctiva, Sclera, Periorbital', technique: 'inspect' },
      ]},
      { id: 'face-nose', label: 'Nose', actions: [
        { id: 'nose-inspect', label: 'Inspect (CSF, epistaxis, deformity)', technique: 'inspect' },
        { id: 'nose-palpate', label: 'Palpate (crepitus, deviation)', technique: 'palpate' },
      ]},
      { id: 'face-mouth', label: 'Mouth', actions: [
        { id: 'lips-inspect', label: 'Lips (colour, cyanosis, dryness)', technique: 'inspect' },
        { id: 'mouth-inspect', label: 'Inspect (foreign body, blood, vomit, substances)', technique: 'inspect' },
        { id: 'mouth-mucosa', label: 'Mucosa / Hydration', technique: 'inspect' },
        { id: 'tongue-inspect', label: 'Tongue (swelling, bite, deviation)', technique: 'inspect' },
        { id: 'mouth-smell', label: 'Note Odour (alcohol, ketones, toxins)', technique: 'inspect' },
        { id: 'teeth-inspect', label: 'Teeth (loose, broken, dentures)', technique: 'inspect' },
      ]},
      { id: 'face-jaw', label: 'Jaw', actions: [
        { id: 'jaw-palpate', label: 'Palpate (stability, crepitus)', technique: 'palpate' },
      ]},
      { id: 'face-symmetry', label: 'Facial Assessment', actions: [
        { id: 'face-symmetry-inspect', label: 'Symmetry (droop, weakness)', technique: 'inspect' },
        { id: 'face-speech', label: 'Speech (clarity, coherence)', technique: 'inspect' },
      ]},
    ];

    // ===== NECK & C-SPINE =====
    // Airway auscultation belongs here — you listen at the neck for stridor
    case 'neck-cspine': return [
      { id: 'neck-exam', label: 'Neck & C-Spine', actions: [
        { id: 'cspine-inspect', label: 'Inspect (wounds, swelling, deformity)', technique: 'inspect' },
        { id: 'cspine-palpate', label: 'Palpate Midline (tenderness, step)', technique: 'palpate' },
        { id: 'trachea-palpate', label: 'Trachea Position', technique: 'palpate' },
        { id: 'jvd-inspect', label: 'Jugular Veins (JVP / JVD)', technique: 'inspect' },
        { id: 'airway-listen', label: 'Auscultate Airway', technique: 'auscultate' },
        { id: 'neck-emphysema', label: 'Subcutaneous Emphysema', technique: 'palpate' },
      ]},
    ];

    // ===== CHEST =====
    case 'chest': return [
      { id: 'chest-core', label: 'Core Chest Exam', actions: [
        { id: 'chest-inspect', label: 'Inspect chest rise, accessory muscles, wounds', technique: 'inspect' },
        { id: 'chest-palpate', label: 'Palpate expansion, tenderness, crepitus, flail', technique: 'palpate' },
        { id: 'chest-percuss', label: 'Percuss right and left lung fields', technique: 'percuss' },
        { id: 'chest-auscultate-lungs', label: 'Auscultate apices, mid-zones, bases', technique: 'auscultate' },
        { id: 'chest-auscultate-heart', label: 'Auscultate heart sounds at four points', technique: 'auscultate' },
      ]},
      { id: 'chest-zones', label: 'Specific Lung Fields', actions: [
        { id: 'chest-auscultate-ru', label: 'Auscultate right upper zone', technique: 'auscultate' },
        { id: 'chest-auscultate-rl', label: 'Auscultate right base', technique: 'auscultate' },
        { id: 'chest-auscultate-lu', label: 'Auscultate left upper zone', technique: 'auscultate' },
        { id: 'chest-auscultate-ll', label: 'Auscultate left base', technique: 'auscultate' },
      ]},
    ];

    // ===== ABDOMEN =====
    // Clinical exam order: Inspect -> Auscultate -> Percuss -> Palpate
    case 'abdomen': return [
      { id: 'abd-general', label: 'General Look', actions: [
        { id: 'abd-inspect', label: 'Inspect (distension, bruising, wounds)', technique: 'inspect' },
      ]},
      ...ABDOMEN_QUADRANTS.map(q => ({
        id: `abd-${q.id}`,
        label: `${q.label} - ${q.full}`,
        actions: [
          { id: `abd-${q.id}-auscultate`, label: `${q.label} bowel sounds and bruits`, technique: 'auscultate' as const },
          { id: `abd-${q.id}-percuss`, label: `${q.label} percussion note`, technique: 'percuss' as const },
          { id: `abd-${q.id}-palpate`, label: `${q.label} light/deep palpation`, technique: 'palpate' as const },
        ],
      })),
    ];

    // ===== PELVIS =====
    case 'pelvis': return [
      { id: 'pelvis-exam', label: 'Pelvis', actions: [
        { id: 'pelvis-inspect', label: 'Inspect (deformity, bruising)', technique: 'inspect' },
        { id: 'pelvis-palpate', label: 'Spring Test (single attempt)', technique: 'palpate' },
        { id: 'r-hip-palpate', label: 'Right Hip', technique: 'palpate' },
        { id: 'l-hip-palpate', label: 'Left Hip', technique: 'palpate' },
      ]},
    ];
    // Limb regions: flat SubRegion[] for backward compat (getAllActions uses groups instead)
    case 'right-arm': return [
      { id: 'right-arm', label: 'Right Arm', actions: [
        { id: 'r-arm-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'r-shoulder-palpate', label: 'Shoulder', technique: 'palpate' },
        { id: 'r-humerus-palpate', label: 'Humerus (upper arm)', technique: 'palpate' },
        { id: 'r-elbow-palpate', label: 'Elbow', technique: 'palpate' },
        { id: 'r-forearm-palpate', label: 'Radius / Ulna (forearm)', technique: 'palpate' },
        { id: 'r-wrist-palpate', label: 'Wrist / Scaphoid', technique: 'palpate' },
        { id: 'r-hand-palpate', label: 'Hand (metacarpals)', technique: 'palpate' },
        { id: 'r-thumb-palpate', label: 'Thumb', technique: 'palpate' },
        { id: 'r-fingers-palpate', label: 'Fingers (index\u2013little)', technique: 'palpate' },
        { id: 'r-arm-pulses', label: 'Radial Pulse + CRT', technique: 'palpate' },
        { id: 'r-arm-neuro', label: 'Sensation & Motor', technique: 'inspect' },
      ]},
    ];
    case 'left-arm': return [
      { id: 'left-arm', label: 'Left Arm', actions: [
        { id: 'l-arm-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'l-shoulder-palpate', label: 'Shoulder', technique: 'palpate' },
        { id: 'l-humerus-palpate', label: 'Humerus (upper arm)', technique: 'palpate' },
        { id: 'l-elbow-palpate', label: 'Elbow', technique: 'palpate' },
        { id: 'l-forearm-palpate', label: 'Radius / Ulna (forearm)', technique: 'palpate' },
        { id: 'l-wrist-palpate', label: 'Wrist / Scaphoid', technique: 'palpate' },
        { id: 'l-hand-palpate', label: 'Hand (metacarpals)', technique: 'palpate' },
        { id: 'l-thumb-palpate', label: 'Thumb', technique: 'palpate' },
        { id: 'l-fingers-palpate', label: 'Fingers (index\u2013little)', technique: 'palpate' },
        { id: 'l-arm-pulses', label: 'Radial Pulse + CRT', technique: 'palpate' },
        { id: 'l-arm-neuro', label: 'Sensation & Motor', technique: 'inspect' },
      ]},
    ];
    case 'right-leg': return [
      { id: 'right-leg', label: 'Right Leg', actions: [
        { id: 'r-leg-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'r-femur-palpate', label: 'Femur (thigh)', technique: 'palpate' },
        { id: 'r-knee-palpate', label: 'Knee', technique: 'palpate' },
        { id: 'r-tibia-palpate', label: 'Tibia / Fibula (shin)', technique: 'palpate' },
        { id: 'r-ankle-palpate', label: 'Ankle (malleoli)', technique: 'palpate' },
        { id: 'r-foot-palpate', label: 'Foot (metatarsals)', technique: 'palpate' },
        { id: 'r-toes-palpate', label: 'Toes (all digits)', technique: 'palpate' },
        { id: 'r-leg-pulses', label: 'Dorsalis Pedis & Post. Tibial + CRT', technique: 'palpate' },
        { id: 'r-leg-neuro', label: 'Sensation & Motor', technique: 'inspect' },
        { id: 'r-leg-compartment', label: 'Compartment Check', technique: 'palpate' },
      ]},
    ];
    case 'left-leg': return [
      { id: 'left-leg', label: 'Left Leg', actions: [
        { id: 'l-leg-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'l-femur-palpate', label: 'Femur (thigh)', technique: 'palpate' },
        { id: 'l-knee-palpate', label: 'Knee', technique: 'palpate' },
        { id: 'l-tibia-palpate', label: 'Tibia / Fibula (shin)', technique: 'palpate' },
        { id: 'l-ankle-palpate', label: 'Ankle (malleoli)', technique: 'palpate' },
        { id: 'l-foot-palpate', label: 'Foot (metatarsals)', technique: 'palpate' },
        { id: 'l-toes-palpate', label: 'Toes (all digits)', technique: 'palpate' },
        { id: 'l-leg-pulses', label: 'Dorsalis Pedis & Post. Tibial + CRT', technique: 'palpate' },
        { id: 'l-leg-neuro', label: 'Sensation & Motor', technique: 'inspect' },
        { id: 'l-leg-compartment', label: 'Compartment Check', technique: 'palpate' },
      ]},
    ];
    // Legacy: if 'extremities' is somehow passed, show all limbs
    case 'extremities': return [
      { id: 'right-arm', label: 'Right Arm', actions: [
        { id: 'r-arm-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'r-arm-pulses', label: 'Radial Pulse + CRT', technique: 'palpate' },
        { id: 'r-arm-neuro', label: 'Sensation & Motor', technique: 'inspect' },
      ]},
      { id: 'left-arm', label: 'Left Arm', actions: [
        { id: 'l-arm-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'l-arm-pulses', label: 'Radial Pulse + CRT', technique: 'palpate' },
        { id: 'l-arm-neuro', label: 'Sensation & Motor', technique: 'inspect' },
      ]},
      { id: 'right-leg', label: 'Right Leg', actions: [
        { id: 'r-leg-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'r-leg-pulses', label: 'Dorsalis Pedis & Post. Tibial + CRT', technique: 'palpate' },
        { id: 'r-leg-neuro', label: 'Sensation & Motor', technique: 'inspect' },
      ]},
      { id: 'left-leg', label: 'Left Leg', actions: [
        { id: 'l-leg-inspect', label: 'Inspect', technique: 'inspect' },
        { id: 'l-leg-pulses', label: 'Dorsalis Pedis & Post. Tibial + CRT', technique: 'palpate' },
        { id: 'l-leg-neuro', label: 'Sensation & Motor', technique: 'inspect' },
      ]},
    ];
    case 'posterior-logroll': return [
      { id: 'posterior-exam', label: 'Posterior', actions: [
        { id: 'logroll-inspect', label: 'Log Roll', technique: 'inspect' },
        { id: 'spine-inspect', label: 'Inspect Spine', technique: 'inspect' },
        { id: 'spine-palpate', label: 'Palpate Spine', technique: 'palpate' },
      ]},
    ];
    default: return [];
  }
}

// ============================================================================
// Finding generator — case-specific
// ============================================================================

function getFinding(caseData: CaseScenario, actionId: string, isInArrest = false): string {
  // During cardiac arrest, all pulses are absent
  if (actionId.includes('pulse') && (isInArrest || caseData.vitalSignsProgression?.initial?.pulse === 0)) {
    return 'No pulse detected.';
  }

  const ss = caseData.secondarySurvey;
  const breathing = caseData.abcde?.breathing;
  const disability = caseData.abcde?.disability;
  const airway = caseData.abcde?.airway;

  // Chest — consolidated techniques
  if (actionId === 'chest-inspect') {
    const chestFindings = ss?.chest?.filter(f => !f.toLowerCase().includes('clear') && !f.toLowerCase().includes('wheez') && !f.toLowerCase().includes('breath'));
    return chestFindings?.length ? chestFindings.join('. ') : 'Equal bilateral chest expansion. No wounds, bruising, or deformity. No paradoxical movement.';
  }
  if (actionId === 'chest-palpate') {
    return ss?.chest?.some(f => f.toLowerCase().includes('crepitus') || f.toLowerCase().includes('tender'))
      ? ss.chest.filter(f => f.toLowerCase().includes('crepitus') || f.toLowerCase().includes('tender') || f.toLowerCase().includes('emphysema')).join('. ')
      : 'No tenderness. No crepitus. No subcutaneous emphysema. Trachea central.';
  }
  if (actionId === 'chest-percuss') {
    if (breathing?.findings?.some(f => f.toLowerCase().includes('pneumothorax'))) return 'Hyper-resonant percussion note \u2014 suggests pneumothorax.';
    if (breathing?.findings?.some(f => f.toLowerCase().includes('effusion') || f.toLowerCase().includes('haemothorax'))) return 'Dull percussion note \u2014 suggests fluid collection.';
    return 'Resonant percussion note bilaterally \u2014 normal.';
  }
  // Auscultation findings — sound plays, no text description.
  // Student must determine what they hear themselves.
  if (actionId === 'chest-auscultate-lungs') {
    return 'Auscultating lung fields — listen carefully.';
  }
  if (actionId.startsWith('chest-auscultate-')) {
    const zone: Record<string, string> = {
      'chest-auscultate-ru': 'right upper zone',
      'chest-auscultate-rl': 'right base',
      'chest-auscultate-lu': 'left upper zone',
      'chest-auscultate-ll': 'left base',
    };
    const z = zone[actionId];
    if (z) return `Auscultating the ${z} — listen for air entry, wheeze, or crackles.`;
  }
  if (actionId === 'chest-auscultate-heart') {
    return 'Auscultating heart — listen carefully.';
  }
  const abdomenQuadrant = getQuadrantFromAction(actionId);
  // Abdomen — consolidated techniques (each covers the whole abdomen)
  if (actionId === 'abd-inspect') {
    const abd = ss?.abdomen || [];
    const inspectFindings = abd.filter(f => f.toLowerCase().includes('distend') || f.toLowerCase().includes('bruis') || f.toLowerCase().includes('scar') || f.toLowerCase().includes('visible'));
    return inspectFindings.length ? inspectFindings.join('. ') : 'Abdomen flat, symmetrical. No distension. No visible bruising, scars, or peristalsis.';
  }
  if (abdomenQuadrant && actionId.endsWith('-auscultate')) {
    const meta = getQuadrantMeta(abdomenQuadrant);
    return `${meta.label}: Auscultating for bowel sounds and bruits — listen for pitch, frequency, and vascular whoosh.`;
  }
  if (abdomenQuadrant && actionId.endsWith('-percuss')) {
    return getQuadrantPercussionFinding(caseData, abdomenQuadrant);
  }
  if (abdomenQuadrant && actionId.endsWith('-palpate')) {
    return getQuadrantPalpationFinding(caseData, abdomenQuadrant);
  }
  if (actionId === 'abd-auscultate') {
    return 'Auscultating abdomen — listen to all 4 quadrants.';
  }
  if (actionId === 'abd-percuss') {
    const abd = ss?.abdomen || [];
    if (abd.some(f => f.toLowerCase().includes('ascites') || f.toLowerCase().includes('fluid'))) return 'Shifting dullness present \u2014 suggests free fluid.';
    if (abd.some(f => f.toLowerCase().includes('hepato'))) return 'RUQ: Dull \u2014 enlarged liver span >12cm. Rest: Tympanic.';
    return 'Tympanic throughout all quadrants \u2014 normal gas-filled bowel.';
  }
  if (actionId === 'abd-palpate') {
    const abd = ss?.abdomen || [];
    if (abd.length) return abd.join('. ');
    return 'Soft, non-tender in all 4 quadrants. No guarding, rigidity, or masses.';
  }
  // ===== FACE — Eyes =====
  if (actionId === 'pupils-size') {
    const pupilData = typeof disability?.pupils === 'string' ? disability.pupils.toLowerCase() : '';
    if (pupilData.includes('dilated')) return 'Left: 6mm. Right: 6mm.';
    if (pupilData.includes('unequal') || pupilData.includes('anisocoria')) return 'Left: 4mm. Right: 2mm.';
    if (pupilData.includes('pinpoint') || pupilData.includes('constrict')) return 'Left: 1mm. Right: 1mm.';
    return 'Left: 3mm. Right: 3mm.';
  }
  if (actionId === 'pupils-reactivity') {
    const pupilData = typeof disability?.pupils === 'string' ? disability.pupils.toLowerCase() : '';
    if (pupilData.includes('fixed') || pupilData.includes('non-reactive') || pupilData.includes('unreactive')) return 'Left: Fixed, non-reactive. Right: Fixed, non-reactive.';
    if (pupilData.includes('sluggish')) return 'Left: Reactive. Right: Sluggish response.';
    if (pupilData.includes('unequal')) return 'Left: Brisk direct and consensual. Right: Sluggish direct, absent consensual.';
    return 'Left: Brisk direct and consensual. Right: Brisk direct and consensual.';
  }
  if (actionId === 'pupils-equality') {
    const pupilData = typeof disability?.pupils === 'string' ? disability.pupils.toLowerCase() : '';
    if (pupilData.includes('unequal') || pupilData.includes('anisocoria')) return 'Unequal — left larger than right.';
    if (pupilData.includes('dilated')) return 'Equal — both dilated.';
    if (pupilData.includes('pinpoint')) return 'Equal — both constricted.';
    return 'Equal bilaterally.';
  }
  if (actionId === 'eyes-inspect') {
    // Look across face-detail, head, and neurological for eye-relevant signs:
    // periorbital bruising (trauma), gaze deviation (stroke), ptosis, nystagmus,
    // field cut / hemianopia. Previous logic only checked face-detail and
    // missed stroke-relevant gaze signs documented in the neurological line.
    const haystack = [
      ...(ss?.headDetailed?.face || []),
      ...(ss?.head || []),
      ...(ss?.neurological || []),
    ];
    const needles = ['eye', 'gaze', 'ptosis', 'nystagmus', 'hemianopia', 'field cut', 'periorbital', 'racoon', 'raccoon', 'conjunctiv', 'sclera', 'pupil'];
    const matches = haystack.filter(f => needles.some(n => f.toLowerCase().includes(n)));
    if (matches.length) return matches.join('. ');
    return 'Conjunctiva pink. Sclera white. No periorbital bruising. No foreign bodies. No gaze deviation or nystagmus.';
  }
  // ===== FACE — Nose =====
  if (actionId === 'nose-inspect') return ss?.headDetailed?.nose?.join('. ') || 'No CSF rhinorrhoea. No epistaxis. No deformity. Septum midline.';
  if (actionId === 'nose-palpate') return 'No crepitus. No deviation. Non-tender.';
  // ===== FACE — Mouth =====
  if (actionId === 'mouth-inspect') {
    const airwayFindings = airway?.findings || [];
    const mouthFindings = airwayFindings.filter(f => f.toLowerCase().includes('blood') || f.toLowerCase().includes('vomit') || f.toLowerCase().includes('foreign') || f.toLowerCase().includes('secretion') || f.toLowerCase().includes('obstruct'));
    if (mouthFindings.length) return mouthFindings.join('. ');
    return airway?.patent ? 'Clear. No foreign body, blood, vomit, or secretions. Mucosa moist.' : 'Airway compromised. Check for obstruction.';
  }
  if (actionId === 'lips-inspect') {
    const appearance = `${caseData.initialPresentation?.appearance || ''} ${caseData.initialPresentation?.generalImpression || ''}`.toLowerCase();
    const mouth = ss?.headDetailed?.mouth || [];
    const matched = mouth.filter(f => /lip|cyan|pale|dry|mucosa|dehydrat/.test(f.toLowerCase()));
    if (matched.length) return matched.join('. ');
    if (appearance.includes('cyan')) return 'Lips cyanotic with bluish discoloration — correlate with SpO2 and work of breathing.';
    if (appearance.includes('pale')) return 'Lips pale. Oral mucosa appears less perfused.';
    return 'Lips pink. No cyanosis, swelling, burns, or laceration.';
  }
  if (actionId === 'mouth-mucosa') {
    const mouth = ss?.headDetailed?.mouth || [];
    const matched = mouth.filter(f => /mucosa|dry|moist|dehydrat|tongue|oral/.test(f.toLowerCase()));
    return matched.length ? matched.join('. ') : 'Oral mucosa moist and pink. No dryness, burns, ulcers, or secretions.';
  }
  if (actionId === 'tongue-inspect') {
    const mouth = ss?.headDetailed?.mouth || [];
    const matched = mouth.filter(f => /tongue|bite|swelling|deviation|angioedema/.test(f.toLowerCase()));
    return matched.length ? matched.join('. ') : 'Tongue midline. No swelling, bite mark, fasciculation, or deviation.';
  }
  if (actionId === 'mouth-smell') {
    // Alcohol, ketones (fruity/DKA), uraemia (ammonia), hepatic fetor
    const history = caseData.history?.medicalConditions?.join(' ').toLowerCase() || '';
    const presentation = caseData.initialPresentation?.appearance?.toLowerCase() || '';
    if (history.includes('diabet') || presentation.includes('ketone') || presentation.includes('fruity')) return 'Fruity/acetone odour noted.';
    if (presentation.includes('alcohol') || history.includes('alcohol')) return 'Alcohol odour noted.';
    return 'No abnormal odour detected.';
  }
  if (actionId === 'teeth-inspect') return 'Dentition intact. No loose or broken teeth. No dentures.';
  // ===== FACE — Facial Assessment =====
  if (actionId === 'face-symmetry-inspect') {
    // Pull from every place facial-droop evidence might live: face-detail,
    // disability findings, secondary survey head + neurological. Previous
    // logic only looked at the first two, so a case with "Right nasolabial
    // fold flattened" / "Right hemiparesis" sitting in head/neurological
    // would return the generic "Symmetrical" lie.
    const faceFinding = (ss?.headDetailed?.face || []).join(' ').toLowerCase();
    const neuro = (disability?.findings || []).join(' ').toLowerCase();
    const headLine = (ss?.head || []).join(' ').toLowerCase();
    const neuroSS = (ss?.neurological || []).join(' ').toLowerCase();
    const haystack = `${faceFinding} ${neuro} ${headLine} ${neuroSS}`;
    if (/droop|facial weakness|facial asymm|nasolabial|hemipar|hemipleg|fast positive/.test(haystack)) {
      // Side it if we can — "right droop" reads better than a generic message.
      const right = /right.*droop|right.*nasolabial|right.*hemipar|right.*facial|facial.*right/.test(haystack);
      const left = /left.*droop|left.*nasolabial|left.*hemipar|left.*facial|facial.*left/.test(haystack);
      const side = right && !left ? ' on the RIGHT' : left && !right ? ' on the LEFT' : '';
      return `Asymmetry noted. Facial droop present${side} — nasolabial fold flattened, unable to smile equally.`;
    }
    return 'Symmetrical. No droop. Equal movement bilaterally on smile and brow raise.';
  }
  if (actionId === 'face-speech') {
    // Also consult the neurological section — aphasia/dysphasia is usually
    // documented there, not in disability findings.
    const neuro = (disability?.findings || []).join(' ').toLowerCase();
    const neuroSS = (ss?.neurological || []).join(' ').toLowerCase();
    const hay = `${neuro} ${neuroSS}`;
    // Aphasia takes precedence over slurred speech when both present — more
    // specific finding, points towards dominant-hemisphere stroke.
    if (/aphasia|dysphasia/.test(hay)) {
      const expressive = /expressive|broca/.test(hay);
      const receptive = /receptive|wernicke/.test(hay);
      if (expressive) return 'Expressive aphasia — patient can understand but struggles to produce words; speech non-fluent, frustrated.';
      if (receptive) return 'Receptive aphasia — fluent but non-sensical speech; patient does not understand commands.';
      return 'Aphasia — difficulty producing or understanding speech. Words garbled, absent, or out of sequence.';
    }
    if (/slur|dysarthria/.test(hay)) return 'Slurred speech (dysarthria) — articulation affected, comprehension intact.';
    return 'Clear, coherent speech. Repeats phrases correctly.';
  }
  if (actionId === 'face-inspect') return ss?.headDetailed?.face?.join('. ') || 'Symmetrical. No lacerations, bruising, or swelling.';
  // ===== FACE — Jaw =====
  if (actionId === 'jaw-palpate') return 'Jaw stable. No crepitus. TMJ non-tender. Full range of movement.';
  // ===== HEAD =====
  if (actionId === 'pupils-inspect') return typeof disability?.pupils === 'string' ? disability.pupils : 'Equal and reactive';
  // ===== NECK — Additional =====
  if (actionId === 'neck-emphysema') {
    const neckFindings = ss?.neck || [];
    if (neckFindings.some(f => f.toLowerCase().includes('emphysema') || f.toLowerCase().includes('crepitus'))) return 'Subcutaneous emphysema present — crackling sensation on palpation.';
    return 'No subcutaneous emphysema. No crepitus.';
  }
  // ===== HEAD — Scalp & Skull (NOT face/mouth/lip findings) =====
  if (actionId === 'scalp-inspect') {
    const headFindings = ss?.head || [];
    // Only return findings relevant to scalp: wounds, lacerations, haematoma, deformity, swelling
    const scalpOnly = headFindings.filter(f => {
      const lower = f.toLowerCase();
      return lower.includes('scalp') || lower.includes('lacerat') || lower.includes('haematoma')
        || lower.includes('deform') || lower.includes('wound') || lower.includes('swelling')
        || lower.includes('bleed') || lower.includes('contusion') || lower.includes('skull');
    });
    return scalpOnly.length ? scalpOnly.join('. ') : 'No wounds. No lacerations. No swelling. No deformity palpable.';
  }
  if (actionId === 'scalp-palpate') {
    const headFindings = ss?.head || [];
    const palpFindings = headFindings.filter(f => {
      const lower = f.toLowerCase();
      return lower.includes('depress') || lower.includes('step') || lower.includes('boggy')
        || lower.includes('crepitus') || lower.includes('tender') || lower.includes('fracture');
    });
    return palpFindings.length ? palpFindings.join('. ') : 'No depressed fracture. No boggy swelling. No step deformity. Non-tender.';
  }
  if (actionId === 'ears-inspect') return ss?.headDetailed?.ears?.join('. ') || 'No Battle sign. No CSF otorrhoea. No haemotympanum. Canals clear.';
  // ===== NECK =====
  if (actionId === 'airway-listen') return 'Auscultating airway — listen carefully.';
  if (actionId === 'trachea-palpate') return ss?.neck?.find(f => f.toLowerCase().includes('trachea')) || 'Trachea central and midline.';
  if (actionId === 'jvd-inspect') return ss?.neck?.find(f => f.toLowerCase().includes('jvd') || f.toLowerCase().includes('jugular')) || 'No JVD. Veins not distended.';
  if (actionId === 'cspine-inspect') {
    const neckFindings = ss?.neck || [];
    const inspectFindings = neckFindings.filter(f => {
      const lower = f.toLowerCase();
      return lower.includes('wound') || lower.includes('bruis') || lower.includes('swelling') || lower.includes('deform');
    });
    return inspectFindings.length ? inspectFindings.join('. ') : 'No wounds. No swelling. No deformity. Cervical collar in situ if applied.';
  }
  if (actionId === 'cspine-palpate') {
    const neckFindings = ss?.neck || [];
    const palpFindings = neckFindings.filter(f => {
      const lower = f.toLowerCase();
      return lower.includes('tender') || lower.includes('step') || lower.includes('midline') || lower.includes('spasm');
    });
    return palpFindings.length ? palpFindings.join('. ') : 'No midline tenderness. No step deformity. No muscle spasm.';
  }
  // Pelvis
  if (actionId === 'pelvis-inspect') return ss?.pelvis?.some(f => f.toLowerCase().includes('deform') || f.toLowerCase().includes('bruis')) ? ss.pelvis.join('. ') : 'No deformity. No bruising. Leg length equal.';
  if (actionId === 'pelvis-palpate') return ss?.pelvis?.join('. ') || 'Pelvis stable on single spring test. No instability.';
  // Extremities — specific bone/joint findings
  // Search case data for specific limb pathology
  const extFindings = ss?.extremities || [];
  const allExtText = extFindings.join(' ').toLowerCase();
  // Neurological findings (hemiparesis / aphasia / cranial nerve signs) are
  // stored on `ss.neurological` in case data. We MUST include this field when
  // the student examines a limb, otherwise a stroke case with "Right arm
  // weakness" in extremities and "Right hemiparesis" in neurological will
  // silently fall through to the generic "Motor power 5/5" default (real bug
  // reported: right-MCA stroke case showing 5/5 on arms).
  const neuroFindings = ss?.neurological || [];

  // Helper: find findings matching keywords for a specific area. Searches BOTH
  // extremities and neurological arrays so limb-strength findings documented
  // in the neuro line ("Right hemiparesis", "Left arm 0/5", "Pronator drift
  // on the right") surface correctly on the 3D body.
  const findFor = (keywords: string[]): string | null => {
    const matchIn = (arr: string[]) =>
      arr.filter(f => keywords.some(k => f.toLowerCase().includes(k)));
    const matches = [...matchIn(extFindings), ...matchIn(neuroFindings)];
    return matches.length ? matches.join('. ') : null;
  };

  // Neuro-specific helper: looks for limb strength / tone / reflex findings
  // that describe a whole side (hemiparesis, hemiplegia, pronator drift) so a
  // per-limb click can surface them. Without this, clicking "right arm neuro"
  // on a left-hemisphere stroke case returns the stock "5/5" lie.
  const sideNeuroFor = (side: 'right' | 'left'): string | null => {
    const needles = side === 'right'
      ? ['right hemipar', 'right hemipleg', 'right-sided weak', 'right sided weak', 'right pronator drift', 'right arm drift', 'right leg drift', 'right arm weak', 'right leg weak', 'right leg 0/5', 'right arm 0/5', 'right 0/5', 'right 1/5', 'right 2/5', 'right 3/5', 'right 4/5', 'babinski.*right', 'right.*babinski', 'right hyperreflex']
      : ['left hemipar', 'left hemipleg', 'left-sided weak', 'left sided weak', 'left pronator drift', 'left arm drift', 'left leg drift', 'left arm weak', 'left leg weak', 'left leg 0/5', 'left arm 0/5', 'left 0/5', 'left 1/5', 'left 2/5', 'left 3/5', 'left 4/5', 'babinski.*left', 'left.*babinski', 'left hyperreflex'];
    const all = [...extFindings, ...neuroFindings];
    const matches = all.filter(f => {
      const lower = f.toLowerCase();
      return needles.some(n => new RegExp(n).test(lower));
    });
    return matches.length ? matches.join('. ') : null;
  };

  // RIGHT ARM
  if (actionId === 'r-arm-inspect') return findFor(['right arm', 'right upper limb', 'right forearm', 'right hand']) || 'No deformity. No swelling. No wounds. No bruising. Skin colour normal.';
  if (actionId === 'r-shoulder-palpate') return findFor(['right shoulder', 'r shoulder']) || 'No tenderness. Full range of motion. No crepitus.';
  if (actionId === 'r-humerus-palpate') return findFor(['humerus', 'right upper arm', 'r upper arm']) || 'No tenderness. No deformity. No swelling.';
  if (actionId === 'r-elbow-palpate') return findFor(['right elbow', 'r elbow', 'olecranon']) || 'No tenderness. No effusion. Full flexion/extension.';
  if (actionId === 'r-forearm-palpate') return findFor(['right forearm', 'radius', 'ulna', 'colles', 'smith']) || 'No tenderness along radius or ulna. No deformity.';
  if (actionId === 'r-wrist-palpate') return findFor(['right wrist', 'r wrist', 'scaphoid', 'anatomical snuffbox']) || 'No tenderness. No swelling. Anatomical snuffbox non-tender.';
  if (actionId === 'r-hand-palpate') return findFor(['right hand', 'r hand', 'metacarpal']) || 'No metacarpal tenderness. No deformity. Grip strength normal.';
  if (actionId === 'r-thumb-palpate') return findFor(['right thumb', 'r thumb', 'gamekeeper', 'bennett']) || 'Thumb: no tenderness at MCP or IP joints. Full opposition. No instability.';
  if (actionId === 'r-fingers-palpate') return findFor(['right finger', 'r finger', 'right digit', 'mallet', 'boutonniere', 'phalanx']) || 'All digits: no tenderness. No deformity. Full range of motion. No mallet or boutonniere deformity.';
  if (actionId === 'r-arm-pulses') return findFor(['right radial', 'r radial']) || 'Right radial pulse present, strong, regular. CRT <2 seconds. Nailbed perfusion normal.';
  if (actionId === 'r-arm-neuro') {
    return sideNeuroFor('right')
      || findFor(['right arm', 'right upper limb', 'right arm sensation', 'right grip', 'r arm weak', 'right arm weak'])
      || 'Sensation intact all dermatomes (median/ulnar/radial). Motor power 5/5. Grip strength equal.';
  }

  // LEFT ARM
  if (actionId === 'l-arm-inspect') return findFor(['left arm', 'left upper limb', 'left forearm', 'left hand']) || 'No deformity. No swelling. No wounds. No bruising. Skin colour normal.';
  if (actionId === 'l-shoulder-palpate') return findFor(['left shoulder', 'l shoulder']) || 'No tenderness. Full range of motion. No crepitus.';
  if (actionId === 'l-humerus-palpate') return findFor(['left humerus', 'l upper arm']) || 'No tenderness. No deformity. No swelling.';
  if (actionId === 'l-elbow-palpate') return findFor(['left elbow', 'l elbow']) || 'No tenderness. No effusion. Full flexion/extension.';
  if (actionId === 'l-forearm-palpate') return findFor(['left forearm', 'l forearm', 'left radius', 'left ulna']) || 'No tenderness along radius or ulna. No deformity.';
  if (actionId === 'l-wrist-palpate') return findFor(['left wrist', 'l wrist']) || 'No tenderness. No swelling. Anatomical snuffbox non-tender.';
  if (actionId === 'l-hand-palpate') return findFor(['left hand', 'l hand', 'left metacarpal']) || 'No metacarpal tenderness. No deformity. Grip strength normal.';
  if (actionId === 'l-thumb-palpate') return findFor(['left thumb', 'l thumb']) || 'Thumb: no tenderness at MCP or IP joints. Full opposition. No instability.';
  if (actionId === 'l-fingers-palpate') return findFor(['left finger', 'l finger', 'left digit']) || 'All digits: no tenderness. No deformity. Full range of motion. No mallet or boutonniere deformity.';
  if (actionId === 'l-arm-pulses') return findFor(['left radial', 'l radial']) || 'Left radial pulse present, strong, regular. CRT <2 seconds. Nailbed perfusion normal.';
  if (actionId === 'l-arm-neuro') {
    return sideNeuroFor('left')
      || findFor(['left arm', 'left upper limb', 'left arm sensation', 'left grip', 'l arm weak', 'left arm weak'])
      || 'Sensation intact all dermatomes (median/ulnar/radial). Motor power 5/5. Grip strength equal.';
  }

  // Helper: check for oedema findings in ankle/foot exam
  const getOedemaFindings = (): string | null => {
    if (allExtText.includes('oedema') || allExtText.includes('edema') || allExtText.includes('swell') || allExtText.includes('pitting')) {
      const oedemaFindings = extFindings.filter(f =>
        f.toLowerCase().includes('oedema') || f.toLowerCase().includes('edema') || f.toLowerCase().includes('swell') || f.toLowerCase().includes('pitting')
      );
      if (oedemaFindings.length) return oedemaFindings.join('. ');
    }
    return null;
  };

  // RIGHT LEG
  // Bilateral findings like "Bilateral pitting oedema to mid-calf (2+)"
  // don't match limb-specific keywords — check the oedema helper too so
  // that pulmonary-oedema / heart-failure / DVT cases show their
  // expected leg findings instead of a generic "no swelling".
  if (actionId === 'r-leg-inspect') return findFor(['right leg', 'right lower limb', 'right thigh', 'right shin']) || getOedemaFindings() || 'No deformity. No swelling. No wounds. Skin colour normal. No shortening or rotation.';
  if (actionId === 'r-hip-palpate') return findFor(['right hip', 'r hip']) || 'No tenderness. No shortening or rotation.';
  if (actionId === 'r-femur-palpate') return findFor(['right femur', 'r femur', 'right thigh', 'r thigh']) || 'No tenderness. No deformity. No swelling.';
  if (actionId === 'r-knee-palpate') return findFor(['right knee', 'r knee', 'patella']) || 'No tenderness. No effusion. Stable to valgus/varus stress.';
  if (actionId === 'r-tibia-palpate') return findFor(['right tibia', 'right fibula', 'r tibia', 'right shin', 'r shin']) || 'No tenderness. No deformity. No crepitus.';
  if (actionId === 'r-ankle-palpate') {
    const specific = findFor(['right ankle', 'r ankle', 'right malleol']);
    if (specific) return specific;
    const oedema = getOedemaFindings();
    if (oedema) return oedema;
    return 'No tenderness over malleoli. No swelling. Ottawa rules negative.';
  }
  if (actionId === 'r-foot-palpate') {
    const specific = findFor(['right foot', 'r foot', 'right metatarsal']);
    if (specific) return specific;
    const oedema = getOedemaFindings();
    if (oedema) return oedema;
    return 'No tenderness. No deformity. Weight-bearing ability normal.';
  }
  if (actionId === 'r-toes-palpate') return findFor(['right toe', 'r toe', 'right digit', 'right hallux']) || 'All toes: no tenderness. No deformity. Capillary refill brisk. Sensation intact.';
  if (actionId === 'r-leg-pulses') return findFor(['right dorsalis', 'right pedal', 'r dorsalis']) || 'Right dorsalis pedis and posterior tibial pulses present. CRT <2 seconds. Nailbed perfusion normal.';
  if (actionId === 'r-leg-neuro') {
    return sideNeuroFor('right')
      || findFor(['right leg', 'right lower limb', 'right leg sensation', 'right leg weak', 'r leg weak'])
      || 'Sensation intact L2-S1. Motor power 5/5. Dorsi/plantar flexion normal.';
  }
  if (actionId === 'r-leg-compartment' || actionId === 'r-thigh-compartment' || actionId === 'r-shin-compartment') return allExtText.includes('compartment') && allExtText.includes('right') ? 'TENSE compartment \u2014 pain on passive stretch.' : 'Compartments soft. No pain on passive stretch. No paraesthesia.';
  if (actionId === 'r-thigh-inspect') return findFor(['right thigh', 'right femur', 'r thigh']) || 'No deformity. No swelling. No shortening or rotation.';
  if (actionId === 'r-knee-inspect') return findFor(['right knee', 'r knee']) || 'No swelling. No deformity. No effusion visible.';
  if (actionId === 'r-shin-inspect') return findFor(['right shin', 'right tibia', 'r shin']) || getOedemaFindings() || 'No deformity. No open wounds. Skin intact.';
  if (actionId === 'r-ankle-inspect') return findFor(['right ankle', 'r ankle']) || getOedemaFindings() || 'No swelling. No deformity. No bruising.';
  if (actionId === 'r-toes-inspect') return findFor(['right toe', 'r toe']) || 'Colour normal. Cap refill <2 seconds. No cyanosis.';

  // LEFT LEG
  if (actionId === 'l-leg-inspect') return findFor(['left leg', 'left lower limb', 'left thigh', 'left shin']) || getOedemaFindings() || 'No deformity. No swelling. No wounds. Skin colour normal. No shortening or rotation.';
  if (actionId === 'l-hip-palpate') return findFor(['left hip', 'l hip']) || 'No tenderness. No shortening or rotation.';
  if (actionId === 'l-femur-palpate') return findFor(['left femur', 'l femur', 'left thigh', 'l thigh']) || 'No tenderness. No deformity. No swelling.';
  if (actionId === 'l-knee-palpate') return findFor(['left knee', 'l knee']) || 'No tenderness. No effusion. Stable to valgus/varus stress.';
  if (actionId === 'l-tibia-palpate') return findFor(['left tibia', 'left fibula', 'l tibia', 'left shin']) || 'No tenderness. No deformity. No crepitus.';
  if (actionId === 'l-ankle-palpate') {
    const specific = findFor(['left ankle', 'l ankle', 'left malleol']);
    if (specific) return specific;
    const oedema = getOedemaFindings();
    if (oedema) return oedema;
    return 'No tenderness over malleoli. No swelling. Ottawa rules negative.';
  }
  if (actionId === 'l-foot-palpate') {
    const specific = findFor(['left foot', 'l foot', 'left metatarsal']);
    if (specific) return specific;
    const oedema = getOedemaFindings();
    if (oedema) return oedema;
    return 'No tenderness. No deformity. Weight-bearing ability normal.';
  }
  if (actionId === 'l-toes-palpate') return findFor(['left toe', 'l toe', 'left digit', 'left hallux']) || 'All toes: no tenderness. No deformity. Capillary refill brisk. Sensation intact.';
  if (actionId === 'l-leg-pulses') return findFor(['left dorsalis', 'left pedal', 'l dorsalis']) || 'Left dorsalis pedis and posterior tibial pulses present. CRT <2 seconds. Nailbed perfusion normal.';
  if (actionId === 'l-leg-neuro') {
    return sideNeuroFor('left')
      || findFor(['left leg', 'left lower limb', 'left leg sensation', 'left leg weak', 'l leg weak'])
      || 'Sensation intact L2-S1. Motor power 5/5. Dorsi/plantar flexion normal.';
  }
  if (actionId === 'l-leg-compartment' || actionId === 'l-thigh-compartment' || actionId === 'l-shin-compartment') return allExtText.includes('compartment') && allExtText.includes('left') ? 'TENSE compartment \u2014 pain on passive stretch.' : 'Compartments soft. No pain on passive stretch. No paraesthesia.';
  if (actionId === 'l-thigh-inspect') return findFor(['left thigh', 'left femur', 'l thigh']) || 'No deformity. No swelling. No shortening or rotation.';
  if (actionId === 'l-knee-inspect') return findFor(['left knee', 'l knee']) || 'No swelling. No deformity. No effusion visible.';
  if (actionId === 'l-shin-inspect') return findFor(['left shin', 'left tibia', 'l shin']) || getOedemaFindings() || 'No deformity. No open wounds. Skin intact.';
  if (actionId === 'l-ankle-inspect') return findFor(['left ankle', 'l ankle']) || getOedemaFindings() || 'No swelling. No deformity. No bruising.';
  if (actionId === 'l-toes-inspect') return findFor(['left toe', 'l toe']) || 'Colour normal. Cap refill <2 seconds. No cyanosis.';
  // Posterior
  if (actionId === 'logroll-inspect') {
    // Check for sacral oedema (heart failure, renal failure)
    const sacralFindings: string[] = [];
    if (ss?.posterior?.some(f => f.toLowerCase().includes('sacral'))) {
      sacralFindings.push(...(ss?.posterior?.filter(f => f.toLowerCase().includes('sacral')) || []));
    }
    if (allExtText.includes('sacral')) {
      sacralFindings.push(...extFindings.filter(f => f.toLowerCase().includes('sacral')));
    }
    const baseMsg = 'Log roll performed with manual in-line C-spine stabilisation. Patient rolled on command.';
    return sacralFindings.length ? `${baseMsg} ${sacralFindings.join('. ')}.` : baseMsg;
  }
  if (actionId === 'spine-inspect') {
    const posteriorFindings = ss?.posterior || [];
    return posteriorFindings.length ? posteriorFindings.join('. ') : 'No bruising, wounds, or haematoma along spine.';
  }
  if (actionId === 'spine-palpate') {
    const posteriorFindings = ss?.posterior || [];
    // Include sacral oedema in palpation findings if present
    const sacral = posteriorFindings.filter(f => f.toLowerCase().includes('sacral') || f.toLowerCase().includes('oedema') || f.toLowerCase().includes('edema'));
    const spinal = posteriorFindings.filter(f => !f.toLowerCase().includes('sacral'));
    const palpFindings = [...spinal, ...sacral].filter(Boolean);
    return palpFindings.length ? palpFindings.join('. ') : 'No midline tenderness. No step deformity. No muscle spasm.';
  }
  return 'No abnormalities detected.';
}

// ============================================================================
// Region label for display
// ============================================================================
const REGION_LABELS: Record<string, string> = {
  head: 'Head', face: 'Face', 'neck-cspine': 'Neck & C-Spine', chest: 'Chest',
  abdomen: 'Abdomen', pelvis: 'Pelvis',
  'right-arm': 'Right Arm', 'left-arm': 'Left Arm',
  'right-leg': 'Right Leg', 'left-leg': 'Left Leg',
  extremities: 'Extremities', 'posterior-logroll': 'Posterior',
};

const LIMB_LABELS: Record<string, string> = {
  'right-arm': 'Right Arm', 'left-arm': 'Left Arm',
  'right-leg': 'Right Leg', 'left-leg': 'Left Leg',
};

// ============================================================================
// Camera Animation Utility (Phase 2C)
// ============================================================================

function useCameraAnimation() {
  const animationRef = useRef<number | null>(null);

  const animateCamera = useCallback((
    controls: OrbitControlsHandle | null,
    targetPos: [number, number, number],
    targetLookAt: [number, number, number],
    duration = 400,
  ) => {
    if (!controls) return;
    // Cancel any existing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    const startPos = controls.object.position.clone();
    const startTarget = controls.target.clone();
    const startTime = performance.now();

    const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const rawT = Math.min(elapsed / duration, 1);
      const t = easeInOut(rawT);

      controls.object.position.set(
        startPos.x + (targetPos[0] - startPos.x) * t,
        startPos.y + (targetPos[1] - startPos.y) * t,
        startPos.z + (targetPos[2] - startPos.z) * t,
      );
      controls.target.set(
        startTarget.x + (targetLookAt[0] - startTarget.x) * t,
        startTarget.y + (targetLookAt[1] - startTarget.y) * t,
        startTarget.z + (targetLookAt[2] - startTarget.z) * t,
      );
      controls.update();

      if (rawT < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return animateCamera;
}

const PERCUSSION_DURATION = 800;

const DEFAULT_CAMERA_FOCUS = {
  pos: [0, 0.95, 4.25] as [number, number, number],
  target: [0, 0.92, 0] as [number, number, number],
};

const REGION_CAMERA_FOCUS: Record<string, { pos: [number, number, number]; target: [number, number, number] }> = {
  head: { pos: [0, 1.68, 1.72], target: [0, 1.68, 0.06] },
  face: { pos: [0, 1.61, 1.42], target: [0, 1.61, 0.07] },
  'neck-cspine': { pos: [0, 1.46, 1.6], target: [0, 1.46, 0.06] },
  chest: { pos: [0, 1.26, 1.78], target: [0, 1.26, 0.08] },
  abdomen: { pos: [0, 1.03, 1.84], target: [0, 1.03, 0.10] },
  pelvis: { pos: [0, 0.88, 2.28], target: [0, 0.88, 0.08] },
  'right-arm': { pos: [-0.32, 0.98, 2.42], target: [-0.22, 0.98, 0.06] },
  'left-arm': { pos: [0.32, 0.98, 2.42], target: [0.22, 0.98, 0.06] },
  'right-leg': { pos: [-0.14, 0.48, 2.55], target: [-0.10, 0.48, 0.06] },
  'left-leg': { pos: [0.14, 0.48, 2.55], target: [0.10, 0.48, 0.06] },
  extremities: { pos: [0, 0.62, 2.85], target: [0, 0.62, 0.06] },
  'posterior-logroll': { pos: [0, 1.10, -2.55], target: [0, 1.10, 0] },
};

// Approximate framing radius (metres) per region — the vertical half-extent
// the zoom should fill. Distance is derived from this + the live fov/aspect
// so the region fills the frame instead of sitting low with empty space
// above (the old fixed distances framed the head at only ~22% of height).
const REGION_RADIUS: Record<string, number> = {
  head: 0.16, face: 0.12, 'neck-cspine': 0.13, chest: 0.30, abdomen: 0.26,
  pelvis: 0.28, 'right-arm': 0.40, 'left-arm': 0.40, 'right-leg': 0.46,
  'left-leg': 0.46, extremities: 0.55, 'posterior-logroll': 0.55,
};

/**
 * Compute a camera position that frames a sphere of `radius` metres around
 * `target`, viewed from direction `dir`, filling ~`fill` of the viewport.
 * Distance comes from the LIVE perspective fov + aspect, so framing is
 * correct for any canvas shape (tall/narrow included).
 */
function fitCameraPos(
  controls: OrbitControlsHandle,
  target: [number, number, number],
  dir: [number, number, number],
  radius: number,
  fill = 0.82,
): [number, number, number] {
  const cam = controls.object as unknown as { fov?: number; aspect?: number };
  const vFov = ((cam.fov ?? 38) * Math.PI) / 180;
  const aspect = cam.aspect && cam.aspect > 0 ? cam.aspect : 1;
  const tan = Math.tan(vFov / 2);
  const distV = radius / tan / fill;
  const distH = radius / (tan * aspect) / fill;
  const dist = Math.max(distV, distH, 0.45);
  const len = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return [
    target[0] + (dir[0] / len) * dist,
    target[1] + (dir[1] / len) * dist,
    target[2] + (dir[2] / len) * dist,
  ];
}

// ============================================================================
// Main Component
// ============================================================================

interface Body3DModelProps {
  onRegionClick: (stepId: AssessmentStepId) => void;
  assessedRegions: Set<string>;
  caseData: CaseScenario;
  patientSounds?: ClinicalSoundState | null;
  isStudentView?: boolean;
  caseCategory?: string;
  /** Treatments already applied, used to render visible devices on the mannequin. */
  appliedTreatmentIds?: string[];
  /** Whether the patient is currently in cardiac arrest (all pulses absent) */
  isInArrest?: boolean;
  /** Live respiratory rate from the monitor (breaths/min). Drives the visible
   *  chest-rise so the mannequin breathes IN SYNC with the monitor — fast when
   *  tachypnoeic, absent at 0. Falls back to the case rate when undefined. */
  liveRespiration?: number;
  /** Run a pulse check from a mannequin pulse point (radial wrist / carotid neck). */
  onPulse?: (site: string) => void;
}

// Phase 2 — guided exam mode: persist preference across sessions
const GUIDED_MODE_STORAGE_KEY = 'paramedic-studio-guided-exam-mode';

function loadGuidedModePreference(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(GUIDED_MODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function saveGuidedModePreference(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GUIDED_MODE_STORAGE_KEY, value ? 'true' : 'false');
  } catch {
    /* noop */
  }
}

/**
 * Premium in-frame findings overlay. Renders the revealed exam findings as
 * small, semi-transparent glass cards layered over the bottom of the 3D
 * frame (instead of dropping into a panel below the mannequin). The active
 * finding is shown prominently; previously-revealed findings for the region
 * collapse into compact chips. Severity is inferred from the finding text
 * (findings are plain strings) so the card colour reads at a glance.
 */
function InFrameFindings({
  selectedAction,
  revealedFindings,
  allActions,
  offsetForEyeContext = false,
}: {
  selectedAction: string | null;
  revealedFindings: Map<string, string>;
  allActions: { id: string; label: string }[];
  offsetForEyeContext?: boolean;
}) {
  const labelFor = (id: string) => allActions.find(a => a.id === id)?.label ?? 'Finding';
  const active = selectedAction && revealedFindings.has(selectedAction)
    ? { label: labelFor(selectedAction), text: revealedFindings.get(selectedAction)! }
    : null;
  const regionIds = new Set(allActions.map(a => a.id));
  const others = [...revealedFindings.entries()].filter(([id]) => regionIds.has(id) && id !== selectedAction);
  if (!active && others.length === 0) return null;

  const severity = (t: string): 'crit' | 'warn' | 'ok' => {
    const s = t.toLowerCase();
    if (/no pulse|pulseless|absent|silent chest|stridor|cyanos|severe|critical|haemorrhag|hemorrhag|arrest|unequal|deviat|fixed|blown/.test(s)) return 'crit';
    if (/reduced|decreased|diminish|wheeze|crackle|delayed|abnormal|prolonged|weak|guard|tender|sluggish|distress/.test(s)) return 'warn';
    return 'ok';
  };
  const tone = {
    crit: 'border-red-400/40',
    warn: 'border-amber-300/40',
    ok: 'border-emerald-300/30',
  } as const;
  const dotTone = { crit: 'bg-red-400', warn: 'bg-amber-300', ok: 'bg-emerald-400' } as const;

  return (
    <div className={`pointer-events-none absolute right-3 z-10 flex w-[min(18rem,calc(100%-1.5rem))] flex-col items-stretch gap-1.5 ${offsetForEyeContext ? 'top-[15.5rem]' : 'top-14'}`}>
      {active && (() => {
        const sv = severity(active.text);
        return (
          <div className={`pointer-events-auto rounded-2xl border ${tone[sv]} bg-slate-950/55 px-3.5 py-2.5 shadow-2xl backdrop-blur-xl animate-fade-in`}>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${dotTone[sv]} animate-pulse`} />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">{active.label}</p>
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-white/95">{active.text}</p>
          </div>
        );
      })()}
      {others.length > 0 && (
        <div className="pointer-events-auto flex flex-wrap gap-1.5">
          {others.map(([id, text]) => (
            <span key={id} className="rounded-full border border-white/10 bg-slate-950/45 px-2.5 py-1 text-[10px] text-white/75 backdrop-blur-md">
              <span className="font-semibold text-white/90">{labelFor(id)}:</span>{' '}
              {text.length > 44 ? `${text.slice(0, 42)}…` : text}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AssessmentActionDock({
  activeRegion,
  actions,
  selectedAction,
  revealedFindings,
  onAction,
}: {
  activeRegion: string;
  actions: ExamAction[];
  selectedAction: string | null;
  revealedFindings: Map<string, string>;
  onAction: (actionId: string) => void;
}) {
  const grouped = TECHNIQUE_ORDER
    .map(technique => {
      const items = actions.filter(action => action.technique === technique);
      if (items.length === 0) return null;
      const selected = items.find(action => action.id === selectedAction);
      const primary = selected ?? items[0];
      const completed = items.filter(action => revealedFindings.has(action.id)).length;
      return { technique, items, primary, selected, completed };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (grouped.length === 0) return null;

  const selectedGroup = grouped.find(group => group.items.some(action => action.id === selectedAction)) ?? grouped[0];

  return (
    <div className="pointer-events-auto absolute bottom-2 left-2 z-20 w-[min(18rem,calc(100%-1rem))] overflow-hidden rounded-xl border border-white/16 bg-slate-950/54 text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-2.5 py-1.5">
        <div className="min-w-0">
          <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-white/45">Assessment cockpit</p>
          <p className="truncate text-[11px] font-semibold text-white/92">{REGION_LABELS[activeRegion] || activeRegion}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/8 px-2 py-0.5 text-[7px] font-semibold text-white/65">
          {actions.filter(action => revealedFindings.has(action.id)).length}/{actions.length}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1 p-1.5">
        {grouped.map(group => {
          const Icon = TECHNIQUE_ICONS[group.technique];
          const isActive = group.items.some(action => action.id === selectedAction);
          const meta = TECHNIQUE_META[group.technique];
          return (
            <button
              key={group.technique}
              type="button"
              onClick={() => onAction(group.primary.id)}
              className={`group flex min-h-[3.55rem] flex-col justify-between rounded-lg border px-1.5 py-1.5 text-left transition-all hover:-translate-y-0.5 ${isActive ? meta.active : `${meta.tone} hover:border-white/24`}`}
            >
              <span className="flex items-center justify-between gap-1">
                <Icon className="h-3 w-3 shrink-0" />
                <span className="rounded-full bg-white/12 px-1.5 py-0.5 text-[6px] font-bold text-current/80">
                  {group.completed}/{group.items.length}
                </span>
              </span>
              <span>
                <span className="block text-[9px] font-bold leading-tight">{meta.label}</span>
                <span className="mt-0.5 block text-[7px] font-medium leading-tight opacity-70">{meta.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="border-t border-white/10 px-1.5 pb-1.5">
        <p className="px-1 pt-1 text-[7px] font-semibold uppercase tracking-[0.14em] text-white/42">
          Targets
        </p>
        <div className="mt-1 flex gap-1.5 overflow-x-auto pb-0.5">
          {selectedGroup.items.map(action => {
            const isSelected = selectedAction === action.id;
            const isDone = revealedFindings.has(action.id);
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onAction(action.id)}
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-medium transition-colors ${
                  isSelected
                    ? 'border-white/35 bg-white/22 text-white'
                    : isDone
                      ? 'border-emerald-300/35 bg-emerald-400/14 text-emerald-50'
                      : 'border-white/10 bg-white/7 text-white/70 hover:bg-white/12'
                }`}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RegionalZoomLoupe({
  activeRegion,
  selectedAction,
  caseData,
  pupilProfile,
}: {
  activeRegion: string | null;
  selectedAction: string | null;
  caseData: CaseScenario;
  pupilProfile: PupilProfile;
}) {
  const isEyeFocused = activeRegion === 'face'
    && !!selectedAction
    && (selectedAction.includes('pupil') || selectedAction.includes('eyes'));

  if (isEyeFocused) return <PupilCloseUp profile={pupilProfile} />;

  // Chest "zoom loupe" intentionally removed — it duplicated the full chest
  // map already shown in the bottom Hands-On Exam Station. Chest detail now
  // lives in exactly one place to keep the assessment view uncluttered.

  if (activeRegion === 'abdomen') {
    return (
      <div className="overflow-hidden rounded-2xl border border-emerald-100/30 bg-slate-950/52 p-2 shadow-2xl backdrop-blur-xl">
        <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
          <div>
            <p className="text-[7px] font-semibold uppercase tracking-[0.2em] text-emerald-100/55">Zoom loupe</p>
            <p className="text-[10px] font-semibold text-white/92">Abdominal quadrants</p>
          </div>
          <span className="rounded-full border border-emerald-200/25 bg-emerald-300/12 px-2 py-0.5 text-[7px] font-semibold text-emerald-100">
            IAPP order
          </span>
        </div>
        <AbdominalQuadrantPanel selectedAction={selectedAction} caseData={caseData} compact />
      </div>
    );
  }

  return null;
}

type PatientReactionTone = 'patient' | 'coach' | 'warning' | 'calm';

interface PatientReaction {
  id: string;
  tone: PatientReactionTone;
  title: string;
  message: string;
  quote?: string;
  regionId: string;
  actionId: string;
}

function getPatientResponsiveness(caseData: CaseScenario) {
  const gcs = caseData.abcde?.disability?.gcs?.total
    ?? caseData.vitalSignsProgression?.initial?.gcs;
  const avpu = String(caseData.abcde?.disability?.avpu || '').toUpperCase();
  const consciousness = String(caseData.initialPresentation?.consciousness || '').toLowerCase();
  const appearance = [
    caseData.initialPresentation?.appearance,
    caseData.initialPresentation?.generalImpression,
  ].filter(Boolean).join(' ').toLowerCase();
  const apneic = caseData.abcde?.breathing?.rate === 0;
  const arrest = /asystole|pea|vf|cardiac arrest|unresponsive|no response/.test(consciousness) || avpu === 'U';
  const canVocalize = !apneic && !arrest && !(typeof gcs === 'number' && gcs <= 8);
  const isAwake = canVocalize && (
    avpu === 'A'
    || (typeof gcs === 'number' && gcs >= 13)
    || /alert|awake|oriented|talk|speaking|responding|verbal/.test(consciousness)
  );

  return {
    canVocalize,
    isAwake,
    isDistressed: /distress|anxious|pain|cry|gasping|moaning|uncomfortable|miserable|agitated/.test(appearance),
  };
}

function hasRevealedMatching(revealedFindings: Map<string, string>, predicate: (actionId: string) => boolean): boolean {
  for (const actionId of revealedFindings.keys()) {
    if (predicate(actionId)) return true;
  }
  return false;
}

function getPatientReaction(
  caseData: CaseScenario,
  regionId: string,
  actionId: string,
  finding: string,
  revealedFindings: Map<string, string>,
): PatientReaction | null {
  const patient = getPatientResponsiveness(caseData);
  const lowerFinding = finding.toLowerCase();
  const reactionBase = { regionId, actionId };

  if (/no pulse|absent pulse|pulseless/.test(lowerFinding)) {
    return {
      ...reactionBase,
      id: `${actionId}-no-pulse`,
      tone: 'warning',
      title: 'Critical finding',
      message: 'Treat this as absent perfusion. Confirm quickly, call for help, and move straight into the relevant resuscitation pathway.',
    };
  }

  if (regionId === 'abdomen' && actionId.includes('palpate')) {
    const auscultated = hasRevealedMatching(
      revealedFindings,
      id => id === 'abd-auscultate' || /^abd-(ruq|luq|rlq|llq)-.*auscultate$/.test(id),
    );

    if (!auscultated) {
      return {
        ...reactionBase,
        id: `${actionId}-abd-sequence`,
        tone: 'warning',
        title: 'Sequence critique',
        quote: patient.canVocalize ? 'Can you tell me before you press there?' : undefined,
        message: 'Auscultate before palpation when bowel sounds matter. Palpation can change bowel activity and can increase guarding.',
      };
    }
  }

  const closeAirwayCheck = actionId === 'mouth-inspect'
    || actionId === 'mouth-mucosa'
    || actionId === 'tongue-inspect'
    || actionId === 'teeth-inspect';

  if (closeAirwayCheck && patient.isAwake) {
    return {
      ...reactionBase,
      id: `${actionId}-awake-airway`,
      tone: 'warning',
      title: 'Patient tolerance',
      quote: 'What are you doing? That makes me gag.',
      message: 'Explain first and keep the check gentle. Awake patients may refuse or gag with invasive airway checks or adjuncts such as an OPA.',
    };
  }

  if (actionId.includes('palpate') && /tender|pain|sore|guard|rigid|rebound|crepitus|deform|fracture|swelling|unstable|bruise|contusion|burn/.test(lowerFinding)) {
    return {
      ...reactionBase,
      id: `${actionId}-pain-response`,
      tone: 'patient',
      title: 'Patient response',
      quote: patient.canVocalize
        ? (patient.isDistressed ? 'Please stop, that really hurts.' : 'Ow, that is sore there.')
        : undefined,
      message: 'The patient guards away from your hand. Reassess pain, distal perfusion, and explain before continuing.',
    };
  }

  if (regionId === 'posterior-logroll' && actionId === 'logroll-inspect') {
    return {
      ...reactionBase,
      id: `${actionId}-logroll`,
      tone: 'coach',
      title: 'Movement cue',
      quote: patient.canVocalize ? 'My back hurts when you move me.' : undefined,
      message: 'Coordinate the roll on one count, maintain C-spine control, and keep the patient aligned while you inspect the posterior surface.',
    };
  }

  if (actionId.includes('pupil') || actionId.includes('eyes')) {
    return {
      ...reactionBase,
      id: `${actionId}-eye-light`,
      tone: 'calm',
      title: 'Patient response',
      quote: patient.canVocalize ? 'The light is bright.' : undefined,
      message: 'Keep context: compare both eyes, note size in millimetres, equality, and direct or consensual response.',
    };
  }

  if (actionId.includes('auscultate')) {
    return {
      ...reactionBase,
      id: `${actionId}-listen-cue`,
      tone: 'coach',
      title: 'Technique cue',
      quote: patient.canVocalize && regionId === 'chest' ? 'I will try to stay still.' : undefined,
      message: regionId === 'chest'
        ? 'Ask for normal open-mouth breaths and compare matching positions side to side.'
        : 'Pause long enough to hear a real pattern before moving to the next site.',
    };
  }

  if (actionId.includes('percuss')) {
    return {
      ...reactionBase,
      id: `${actionId}-percussion-cue`,
      tone: 'coach',
      title: 'Technique cue',
      message: 'Percuss equivalent points right-to-left at the same level so dullness, resonance, or hyper-resonance means something.',
    };
  }

  return null;
}

function PatientReactionCard({ reaction }: { reaction: PatientReaction | null }) {
  if (!reaction) return null;

  const tone: Record<PatientReactionTone, { wrap: string; dot: string; label: string; icon: typeof User }> = {
    patient: {
      wrap: 'border-cyan-200/35 bg-slate-950/62 shadow-[0_24px_60px_-26px_rgba(34,211,238,0.7)]',
      dot: 'bg-cyan-300',
      label: 'Patient response',
      icon: User,
    },
    coach: {
      wrap: 'border-violet-200/35 bg-slate-950/62 shadow-[0_24px_60px_-26px_rgba(167,139,250,0.7)]',
      dot: 'bg-violet-300',
      label: 'Clinical coach',
      icon: Activity,
    },
    warning: {
      wrap: 'border-amber-200/45 bg-slate-950/68 shadow-[0_24px_60px_-26px_rgba(251,191,36,0.75)]',
      dot: 'bg-amber-300',
      label: 'Clinical critique',
      icon: AlertTriangle,
    },
    calm: {
      wrap: 'border-emerald-200/35 bg-slate-950/58 shadow-[0_24px_60px_-26px_rgba(52,211,153,0.6)]',
      dot: 'bg-emerald-300',
      label: 'Encounter cue',
      icon: User,
    },
  };
  const meta = tone[reaction.tone];
  const Icon = meta.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none absolute left-3 top-14 z-30 w-[min(16rem,calc(100%-1.5rem))] rounded-2xl border px-3.5 py-3 text-white backdrop-blur-xl animate-in fade-in slide-in-from-left-2 duration-300 ${meta.wrap}`}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/10">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/50">{meta.label}</p>
          </div>
          <p className="mt-0.5 text-[12px] font-semibold leading-tight text-white/95">{reaction.title}</p>
        </div>
      </div>

      {reaction.quote && (
        <p className="mt-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[12px] font-medium italic leading-snug text-white/92">
          "{reaction.quote}"
        </p>
      )}
      <p className="mt-2 text-[11px] leading-relaxed text-white/78">{reaction.message}</p>
    </div>
  );
}

function PatientRealismStrip({
  profile,
  cues,
  assessedRegions,
  activeRegion,
}: {
  profile: PatientRealismProfile;
  cues: PatientRealismCue[];
  assessedRegions: Set<string>;
  activeRegion: string | null;
}) {
  const visibleCues = cues
    .filter(item => shouldRevealRealismCue(item, assessedRegions, activeRegion))
    .slice(0, 4);
  const priorities = profile.assessmentPriorities.slice(0, 4);

  if (!visibleCues.length && !priorities.length) return null;

  return (
    <div className="border-b border-slate-200/50 bg-gradient-to-r from-white/72 via-cyan-50/50 to-white/55 px-3 py-2 dark:border-white/5 dark:from-slate-950/70 dark:via-cyan-950/20 dark:to-slate-950/55">
      <div className="grid gap-2 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.85fr)]">
        <div className="min-w-0 rounded-xl border border-white/70 bg-white/68 px-3 py-2 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/55">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.75)]" />
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/65">Live Patient Cues</p>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {visibleCues.map(item => {
              const style = REALISM_CUE_STYLE[item.severity];
              return (
                <span key={item.id} className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-semibold ${style.chip}`}>
                  {item.label}
                </span>
              );
            })}
            {visibleCues.length === 0 && (
              <span className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[9px] font-semibold text-muted-foreground dark:border-white/10 dark:bg-slate-900/60">
                Cues reveal as you assess
              </span>
            )}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-white/70 bg-white/60 px-3 py-2 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-slate-900/45">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.65)]" />
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/65">Assessment Targets</p>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {priorities.map(item => (
              <span key={item} className="shrink-0 rounded-full border border-slate-200/80 bg-slate-50/80 px-2.5 py-1 text-[9px] font-medium text-slate-700 dark:border-white/10 dark:bg-white/8 dark:text-slate-200">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Body3DModel({ onRegionClick, assessedRegions, caseData, patientSounds, caseCategory, appliedTreatmentIds = [], isInArrest = false, liveRespiration, onPulse }: Body3DModelProps) {
  const { t } = useTranslation();
  const controlsRef = useRef<OrbitControlsHandle | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  // Surface projector emitted by BodyMesh once the patient mesh loads — used to
  // anchor every floating label/finding onto the real body surface (works for
  // the male, female, or any future GLB without per-model coordinate tuning).
  const [surfaceSampler, setSurfaceSampler] = useState<((x: number, y: number) => [number, number, number]) | null>(null);
  // Stable callback for BodyMesh — it lives in an effect dependency array, so
  // a fresh inline arrow each render would re-run that effect → setState →
  // re-render every frame (an infinite "Maximum update depth" loop that read
  // on-screen as the vitals/3D flickering). useCallback pins it once.
  const handleSurfaceSampler = useCallback(
    (fn: ((x: number, y: number) => [number, number, number]) | null) =>
      setSurfaceSampler(() => fn),
    [],
  );
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activeLimb, setActiveLimb] = useState<LimbSide>(null);
  const [revealedFindings, setRevealedFindings] = useState<Map<string, string>>(new Map());
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [patientReaction, setPatientReaction] = useState<PatientReaction | null>(null);
  // The patient's spoken voice — exam reactions are read aloud through the
  // same ElevenLabs → Supertonic → Web Speech chain as history answers.
  const patientVoice = usePatientVoice(caseData);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [anatomyLayer, setAnatomyLayer] = useState<'surface' | 'skeleton' | 'dressed'>('surface');
  // Dressed view: zooming does NOT undress the patient. Exposure is a
  // deliberate clinical act — this flags that the student chose to expose
  // the focused region (reset on every region change/close).
  const [regionExposed, setRegionExposed] = useState(false);
  // Phase 2F: Sound playback progress
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [soundProgress, setSoundProgress] = useState(0);
  const soundTimerRef = useRef<number | null>(null);

  // Phase 2 — guided exam mode state + transient "blocked" flash
  const [guidedMode, setGuidedMode] = useState<boolean>(loadGuidedModePreference);
  const [blockedNudge, setBlockedNudge] = useState<{ attempted: string; expected: string } | null>(null);
  const nudgeTimerRef = useRef<number | null>(null);
  const reactionTimerRef = useRef<number | null>(null);

  const nextGuidedStep = useMemo(
    () => (guidedMode ? getNextGuidedStep(assessedRegions) : null),
    [guidedMode, assessedRegions],
  );

  const realismProfile = useMemo(
    () => deriveCaseRealismProfile(caseData),
    [caseData],
  );
  const appliedRealismCues = useMemo(
    () => deriveAppliedTreatmentRealismCues(caseData, appliedTreatmentIds),
    [caseData, appliedTreatmentIds],
  );
  const visibleRealismCues = useMemo(
    () => [...appliedRealismCues, ...realismProfile.observableCues],
    [appliedRealismCues, realismProfile.observableCues],
  );

  // Respiratory rate that drives the breathing morph (chest rise).
  // Drive the visible chest-rise from the LIVE monitor respiration so the
  // mannequin breathes in sync with the number on the screen (and stops when
  // it reads 0 — respiratory arrest). Fall back to the case rate only before
  // the monitor is connected.
  const breathRateRpm = useMemo(() => {
    const rr = typeof liveRespiration === 'number'
      ? liveRespiration
      : caseData.abcde?.breathing?.rate ?? caseData.vitalSignsProgression?.initial?.respiration;
    return typeof rr === 'number' && rr > 0 ? rr : 0;
  }, [caseData, liveRespiration]);

  // Depth factor for the chest-rise amplitude so SHALLOW breathing (opioid tox,
  // exhaustion, agonal) looks visibly shallow and DEEP/laboured breathing (DKA
  // Kussmaul, severe distress) looks visibly deep — not just faster/slower.
  const breathDepthFactor = useMemo(() => {
    const depth = String(caseData.abcde?.breathing?.depth ?? '').toLowerCase();
    if (/shallow|reduced|poor|agonal|gasp|minimal/.test(depth)) return 0.45;
    if (/deep|laboured|labored|kussmaul|increased|heav/.test(depth)) return 1.2;
    return 1.0;
  }, [caseData]);

  // Visible signs of shock / poor perfusion painted onto the whole patient: a
  // colour multiply that washes the skin pale (hypovolaemia/anaphylaxis) or
  // dusky-blue (cyanosis/hypoxia), plus a wet sheen for diaphoresis. Driven by
  // the case's described appearance + live hypoxia (SpO2 surrogate via low RR
  // states is unreliable, so cyanosis stays case/■SpO2-described).
  const skinAppearance = useMemo(() => {
    const a = inferGeneralAppearance(caseData);
    const spo2 = caseData.vitalSignsProgression?.initial?.spo2;
    const cyanotic = a.cyanotic || (typeof spo2 === 'number' && spo2 < 88);
    // Multiply tints (white = unchanged). Pale lifts toward cool grey; cyanosis
    // pulls blue; combined = mottled dusky. Tuned to stay recognisable on the
    // tanned base skin without looking cartoonish.
    let tint: string | null = null;
    if (cyanotic && a.pale) tint = '#aebccb';
    else if (cyanotic) tint = '#a9bbcf';
    else if (a.pale) tint = '#d9dad2';
    return { tint, diaphoretic: a.diaphoretic };
  }, [caseData]);

  // Which finding morphs are REVEALED — a finding's morph activates only
  // once the student has assessed its region. This is the discovery
  // mechanic expressed on the mesh: no JVD bulge until you examine the neck.
  const activeFindingMorphs = useMemo(() => {
    const injuries = inferInjuries(caseData);
    // Map a detected finding to the morph that depicts it.
    const MORPH_FOR_KIND: Record<string, string> = {
      distension: 'finding_abdo_distension', // abdominal distension
    };
    const out = new Set<string>();
    for (const inj of injuries) {
      const region3d = injuryRegionTo3D(inj.region);
      const revealed = assessedRegions.has(region3d)
        || (isLimbRegion(region3d) && assessedRegions.has('extremities'));
      if (!revealed) continue;
      // JVD: neck distension finding → finding_jvd morph
      if (inj.region === 'neck' && inj.kind === 'distension') { out.add('finding_jvd'); continue; }
      const morph = MORPH_FOR_KIND[inj.kind];
      if (morph) out.add(morph);
    }
    return Array.from(out);
  }, [caseData, assessedRegions]);

  const guidedStepIndex = useMemo(() => {
    if (!nextGuidedStep) return -1;
    return EXAM_SEQUENCE.indexOf(nextGuidedStep);
  }, [nextGuidedStep]);
  const caseSubcategory = caseData.subcategory;

  const handleToggleGuidedMode = useCallback(() => {
    setGuidedMode(prev => {
      const next = !prev;
      saveGuidedModePreference(next);
      return next;
    });
  }, []);

  const handleBlockedClick = useCallback((attempted: string, expected: string) => {
    setBlockedNudge({ attempted, expected });
    if (nudgeTimerRef.current !== null) {
      window.clearTimeout(nudgeTimerRef.current);
    }
    nudgeTimerRef.current = window.setTimeout(() => {
      setBlockedNudge(null);
      nudgeTimerRef.current = null;
    }, 2600);
  }, []);

  const clearPatientReaction = useCallback(() => {
    if (reactionTimerRef.current !== null) {
      window.clearTimeout(reactionTimerRef.current);
      reactionTimerRef.current = null;
    }
    setPatientReaction(null);
  }, []);

  useEffect(() => {
    return () => {
      if (nudgeTimerRef.current !== null) {
        window.clearTimeout(nudgeTimerRef.current);
      }
      if (reactionTimerRef.current !== null) {
        window.clearTimeout(reactionTimerRef.current);
      }
    };
  }, []);

  const animateCamera = useCameraAnimation();

  // Phase 2B: Determine required regions from assessment profile
  const requiredRegions = useMemo<Set<string>>(() => {
    if (!caseCategory) return new Set<string>();
    const profile = getAssessmentProfile(caseCategory as CaseCategory, caseSubcategory);
    const regions = new Set<string>();
    for (const step of profile.requiredSecondary) {
      // 'extremities' requirement maps to all 4 individual limbs
      if (step === 'extremities') {
        regions.add('right-arm');
        regions.add('left-arm');
        regions.add('right-leg');
        regions.add('left-leg');
      } else {
        regions.add(step);
      }
    }
    return regions;
  }, [caseCategory, caseSubcategory]);

  // Phase 2B: Count required regions that have been assessed
  const regionIds = ['head', 'face', 'neck-cspine', 'chest', 'abdomen', 'pelvis', 'right-arm', 'left-arm', 'right-leg', 'left-leg', 'posterior-logroll'];
  const isRegionAssessed = (id: string): boolean =>
    assessedRegions.has(id) || (isLimbRegion(id) && assessedRegions.has('extremities'));
  const assessedCount = regionIds.filter(id => isRegionAssessed(id)).length;

  const requiredTotal = requiredRegions.size;
  const requiredDone = regionIds.filter(id => requiredRegions.has(id) && isRegionAssessed(id)).length;

  const handleToggleView = useCallback(() => {
    if (!controlsRef.current) return;
    const targetAzimuth = isFlipped ? 0 : Math.PI;
    controlsRef.current.setAzimuthalAngle(targetAzimuth);
    controlsRef.current.update();
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  // Phase 2E: Consolidated close handler
  const handleCloseRegion = useCallback(() => {
    setActiveRegion(null);
    setRegionExposed(false);
    setSelectedAction(null);
    clearPatientReaction();
    setPlayingSound(null);
    setSoundProgress(0);
    if (soundTimerRef.current !== null) {
      cancelAnimationFrame(soundTimerRef.current);
      soundTimerRef.current = null;
    }
    stopAllSounds();
    // Animate camera back to default
    if (controlsRef.current) {
      animateCamera(
        controlsRef.current,
        DEFAULT_CAMERA_FOCUS.pos,
        DEFAULT_CAMERA_FOCUS.target,
        400,
      );
    }
  }, [animateCamera, clearPatientReaction]);

  // Esc deselects the focused region — alongside the in-frame "Full body"
  // pill and click-on-empty-space (onPointerMissed on the Canvas).
  useEffect(() => {
    if (!activeRegion) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCloseRegion(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeRegion, handleCloseRegion]);

  const handleRegionClick = useCallback((stepId: string) => {
    setActiveRegion(stepId);
    setRegionExposed(false);
    // Individual limb regions are directly the active limb
    setActiveLimb(isLimbRegion(stepId) ? stepId as LimbSide : null);
    setSelectedAction(null);
    clearPatientReaction();
    // Initialize expanded groups for limb regions
    const groups = getLimbActionGroups(stepId);
    if (groups) {
      const initial = new Set<string>();
      groups.forEach(g => { if (g.defaultExpanded) initial.add(g.id); });
      setExpandedGroups(initial);
    }
    // Also mark 'extremities' as assessed when any limb is assessed (for backward compatibility)
    onRegionClick(stepId as AssessmentStepId);

    // Zoom camera to a clinically useful close-up. Region presets are more
    // reliable than "current orbit direction" because the student may have
    // rotated to a posterior view before selecting an anterior structure.
    if (controlsRef.current) {
      const focus = REGION_CAMERA_FOCUS[stepId] ?? REGION_CAMERA_FOCUS.chest;
      const dir: [number, number, number] = [
        focus.pos[0] - focus.target[0],
        focus.pos[1] - focus.target[1],
        focus.pos[2] - focus.target[2],
      ];
      // HUD-aware framing. Chest/abdomen show the zoom loupe (top-right) and the
      // assessment cockpit (bottom-left). Bias the patient LEFT of the loupe (x),
      // and for the marker-dense chest also lift it ABOVE the cockpit (y), so no
      // exam landmark ever hides under a panel.
      const wide = typeof window !== 'undefined' && window.innerWidth >= 640;
      // Lift each region's framing above the bottom-left cockpit (values tuned per
      // region zoom — tighter regions need a smaller world-space lift) and shift
      // the loupe regions left of the top-right zoom panel.
      const Y_LIFT: Record<string, number> = { chest: -0.09, abdomen: -0.06, face: -0.19, 'neck-cspine': -0.13 };
      const X_BIAS: Record<string, number> = { chest: 0.13, abdomen: 0.13 };
      const xBias = wide ? (X_BIAS[stepId] ?? 0) : 0;
      const yBias = wide ? (Y_LIFT[stepId] ?? 0) : 0;
      const target: [number, number, number] = [focus.target[0] + xBias, focus.target[1] + yBias, focus.target[2]];
      const pos = fitCameraPos(controlsRef.current, target, dir, REGION_RADIUS[stepId] ?? 0.28);
      animateCamera(controlsRef.current, pos, target, 460);
    }
    setIsFlipped(stepId === 'posterior-logroll');
  }, [onRegionClick, animateCamera, clearPatientReaction]);

  // Phase 2F: Sound progress animation
  const startSoundProgress = useCallback((actionId: string, durationMs: number) => {
    // Cancel previous
    if (soundTimerRef.current !== null) {
      cancelAnimationFrame(soundTimerRef.current);
    }
    setPlayingSound(actionId);
    setSoundProgress(0);
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      setSoundProgress(progress);
      if (progress < 1) {
        soundTimerRef.current = requestAnimationFrame(tick);
      } else {
        soundTimerRef.current = null;
        setPlayingSound(null);
      }
    };
    soundTimerRef.current = requestAnimationFrame(tick);
  }, []);

  const handleExamAction = useCallback((actionId: string) => {
    if (!activeRegion) return;
    setSelectedAction(actionId);

    if (controlsRef.current) {
      const focus: Record<string, { pos: [number, number, number]; target: [number, number, number] }> = {
        'pupils-size': { pos: [0, 1.63, 1.22], target: [0, 1.63, 0.08] },
        'pupils-reactivity': { pos: [0, 1.63, 1.18], target: [0, 1.63, 0.08] },
        'pupils-equality': { pos: [0, 1.63, 1.2], target: [0, 1.63, 0.08] },
        'eyes-inspect': { pos: [0, 1.61, 1.34], target: [0, 1.61, 0.06] },
        'nose-inspect': { pos: [0, 1.59, 1.22], target: [0, 1.59, 0.08] },
        'nose-palpate': { pos: [0, 1.59, 1.22], target: [0, 1.59, 0.08] },
        'lips-inspect': { pos: [0, 1.56, 1.24], target: [0, 1.56, 0.08] },
        'mouth-mucosa': { pos: [0, 1.56, 1.22], target: [0, 1.55, 0.08] },
        'tongue-inspect': { pos: [0, 1.56, 1.22], target: [0, 1.55, 0.08] },
        'airway-listen': { pos: [0, 1.46, 1.38], target: [0, 1.45, 0.05] },
        'mouth-inspect': { pos: [0, 1.56, 1.28], target: [0, 1.54, 0.08] },
        'trachea-palpate': { pos: [0, 1.42, 1.44], target: [0, 1.42, 0.04] },
        'jvd-inspect': { pos: [0.08, 1.47, 1.38], target: [0.06, 1.47, 0.06] },
        'cspine-inspect': { pos: [0, 1.47, 1.54], target: [0, 1.47, 0.02] },
        'cspine-palpate': { pos: [0, 1.47, 1.50], target: [0, 1.47, 0.02] },
        'neck-emphysema': { pos: [0, 1.43, 1.42], target: [0, 1.43, 0.04] },
        // Chest exam — zoom in tight on the chest like the eyes/airway do, so
        // the student is looking right at the chest wall while they work.
        'chest-inspect': { pos: [0, 1.27, 1.42], target: [0, 1.27, 0.1] },
        'chest-palpate': { pos: [0, 1.25, 1.34], target: [0, 1.25, 0.1] },
        'chest-percuss': { pos: [0, 1.27, 1.36], target: [0, 1.27, 0.1] },
        'chest-auscultate-lungs': { pos: [0, 1.30, 1.38], target: [0, 1.28, 0.1] },
        'chest-auscultate-ru': { pos: [-0.09, 1.34, 1.20], target: [-0.09, 1.34, 0.1] },
        'chest-auscultate-rl': { pos: [-0.10, 1.22, 1.20], target: [-0.10, 1.22, 0.1] },
        'chest-auscultate-lu': { pos: [0.09, 1.34, 1.20], target: [0.09, 1.34, 0.1] },
        'chest-auscultate-ll': { pos: [0.10, 1.22, 1.20], target: [0.10, 1.22, 0.1] },
        'chest-auscultate-heart': { pos: [0.06, 1.22, 1.28], target: [0.05, 1.21, 0.1] },
        'abd-inspect': { pos: [0, 1.03, 1.28], target: [0, 1.03, 0.10] },
      };
      const abdomenQuadrant = getQuadrantFromAction(actionId);
      const quadrantX: Record<AbdomenQuadrant, number> = { ruq: -0.10, luq: 0.10, rlq: -0.10, llq: 0.10 };
      const quadrantY: Record<AbdomenQuadrant, number> = { ruq: 1.08, luq: 1.08, rlq: 0.98, llq: 0.98 };
      const exactFocus = abdomenQuadrant
        ? { pos: [quadrantX[abdomenQuadrant], quadrantY[abdomenQuadrant], 1.26] as [number, number, number], target: [quadrantX[abdomenQuadrant], quadrantY[abdomenQuadrant], 0.10] as [number, number, number] }
        : focus[actionId];
      if (exactFocus) {
        const sampled = surfaceSampler
          ? surfaceSampler(exactFocus.target[0], exactFocus.target[1])
          : null;
        const projected = sampled
          ? { pos: exactFocus.pos, target: sampled }
          : exactFocus;
        const actionRadius =
          /pupil|eyes/.test(actionId) ? 0.045 :
          /nose|lips|mouth|tongue/.test(actionId) ? 0.065 :
          /chest/.test(actionId) ? 0.18 :
          (abdomenQuadrant || /abd/.test(actionId)) ? 0.14 :
          0.10;
        const dir: [number, number, number] = [
          exactFocus.pos[0] - exactFocus.target[0],
          exactFocus.pos[1] - exactFocus.target[1],
          exactFocus.pos[2] - exactFocus.target[2],
        ];
        const pos = fitCameraPos(controlsRef.current, projected.target, dir, actionRadius);
        animateCamera(controlsRef.current, pos, projected.target, 500);
      }
    }

    const finding = getFinding(caseData, actionId, isInArrest);
    const reaction = getPatientReaction(caseData, activeRegion, actionId, finding, revealedFindings);
    if (reactionTimerRef.current !== null) {
      window.clearTimeout(reactionTimerRef.current);
      reactionTimerRef.current = null;
    }
    setPatientReaction(reaction);
    if (reaction) {
      // Every quote is the PATIENT speaking ("Please stop, that really
      // hurts") — make it audible, not just a caption.
      if (reaction.quote) patientVoice.say(reaction.quote);
      reactionTimerRef.current = window.setTimeout(() => {
        setPatientReaction(null);
        reactionTimerRef.current = null;
      }, 6200);
    }
    setRevealedFindings(prev => {
      const next = new Map(prev);
      next.set(actionId, finding);
      return next;
    });

    // Play sounds for auscultation actions
    if (actionId.includes('auscultate')) {
      stopAllSounds();
      if (actionId === 'chest-auscultate-lungs' && patientSounds) {
        // Play left lung (3s), then right lung (3s) — bilateral auscultation
        playBreathSound(patientSounds.leftLung, 3000);
        setTimeout(() => {
          playBreathSound(patientSounds.rightLung, 3000);
        }, 3200);
        startSoundProgress(actionId, 6200);
      } else if (actionId === 'chest-auscultate-ru' && patientSounds) {
        // Right apex — upper zone may differ from the base (e.g. a clear apex
        // over a consolidated/oedematous lower zone).
        playBreathSound(getZoneBreathSound(patientSounds, 'right-upper'), 4000);
        startSoundProgress(actionId, 4000);
      } else if (actionId === 'chest-auscultate-rl' && patientSounds) {
        // Right base.
        playBreathSound(getZoneBreathSound(patientSounds, 'right-lower'), 4000);
        startSoundProgress(actionId, 4000);
      } else if (actionId === 'chest-auscultate-lu' && patientSounds) {
        // Left apex.
        playBreathSound(getZoneBreathSound(patientSounds, 'left-upper'), 4000);
        startSoundProgress(actionId, 4000);
      } else if (actionId === 'chest-auscultate-ll' && patientSounds) {
        // Left base.
        playBreathSound(getZoneBreathSound(patientSounds, 'left-lower'), 4000);
        startSoundProgress(actionId, 4000);
      } else if (actionId === 'chest-auscultate-heart' && patientSounds) {
        // Heart sounds — realistic listening duration
        playHeartSound(patientSounds.heartSound, 8000);
        startSoundProgress(actionId, 8000);
      } else if (activeRegion === 'abdomen' && (actionId === 'abd-auscultate' || getQuadrantFromAction(actionId))) {
        // Bowel sounds are ongoing. Real practice may require much longer
        // listening for absent sounds, but this gives students a usable cue.
        const bowelType: BowelSoundType = patientSounds?.bowelSounds ?? getBowelSoundTypeForCase(caseData);
        const duration = bowelType === 'absent' ? 15000 : 12000;
        playBowelSound(bowelType, duration);
        startSoundProgress(actionId, duration);
      }
    }
    // Airway sounds — separate from chest auscultation (stridor/gurgling/snoring, not lung sounds)
    if (actionId === 'airway-listen' && patientSounds) {
      stopAllSounds();
      const airwayFindings = caseData.abcde?.airway?.findings || [];
      const airwayText = airwayFindings.join(' ').toLowerCase();
      // Determine airway sound: stridor > gurgling > snoring > clear
      const airwaySoundType: BreathSoundType = airwayText.includes('stridor') ? 'stridor'
        : airwayText.includes('gurgl') ? 'rhonchi'
        : airwayText.includes('snor') ? 'snoring'
        : 'clear';
      playBreathSound(airwaySoundType, 3000);
      startSoundProgress(actionId, 3000);
    }

    // Play percussion sound
    if (actionId.includes('percuss')) {
      stopAllSounds();
      const percFinding = getFinding(caseData, actionId);
      const percType = percFinding.toLowerCase().includes('hyper') ? 'hyper-resonant'
        : percFinding.toLowerCase().includes('dull') ? 'dull'
        : percFinding.toLowerCase().includes('tympanic') ? 'tympanic'
        : 'resonant';
      playPercussionSound(percType);
      startSoundProgress(actionId, PERCUSSION_DURATION);
    }
  }, [activeRegion, animateCamera, caseData, patientSounds, revealedFindings, startSoundProgress, isInArrest, patientVoice.say, surfaceSampler]);

  const allSubRegions = activeRegion ? getSubRegions(activeRegion) : [];
  const subRegions = allSubRegions;
  const limbGroups = activeRegion ? getLimbActionGroups(activeRegion) : null;

  // Collect all actions for findings lookup (from groups or subRegions)
  const allActions = useMemo(() => {
    if (limbGroups) {
      return limbGroups.flatMap(g => g.actions);
    }
    return subRegions.flatMap(sr => sr.actions);
  }, [limbGroups, subRegions]);
  const pupilProfile = useMemo(() => getPupilProfile(caseData), [caseData]);
  const showEyeContext = activeRegion === 'face'
    && !!selectedAction
    && (selectedAction.includes('pupil') || selectedAction.includes('eyes'));
  const showRegionalLoupe = showEyeContext || activeRegion === 'chest' || activeRegion === 'abdomen';
  // Narrow enough that the right-side exam landmarks (LUQ/LLQ, left lung
  // zones) clear the panel once the camera's loupe bias shifts the patient
  // left — the loupe must never sit on top of clickable anatomy.
  const loupeWidthClass = 'w-[min(14rem,calc(100%-1.5rem))]';

  // Phase 2D: Log roll hint
  const showLogRollHint = assessedRegions.size >= 8 && !assessedRegions.has('posterior-logroll');

  // Toggle group expansion
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  // Render an action button (shared between grouped and flat rendering)
  const renderActionButton = (action: ExamAction) => {
    const Icon = TECHNIQUE_ICONS[action.technique];
    const isRevealed = revealedFindings.has(action.id);
    const isSelected = selectedAction === action.id;
    const isPlaying = playingSound === action.id;

    return (
      <div key={action.id} className="relative">
        <button
          onClick={() => handleExamAction(action.id)}
          className={`flex items-center gap-1.5 w-full text-left px-2 py-1.5 rounded-lg text-[11px] leading-tight transition-all border ${
            isSelected ? 'ring-1 ring-blue-400 shadow-sm border-blue-400 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
            : isRevealed ? 'border-green-400 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300'
            : 'border-border/40 dark:border-slate-700 hover:border-blue-300 hover:bg-accent/30 text-foreground dark:text-slate-200'
          }`}
        >
          <Icon className="h-3 w-3 shrink-0" />
          <span className="flex-1 font-medium truncate">{action.label}</span>
          {isRevealed && <span className="text-green-500 font-bold text-xs shrink-0">{'\u2713'}</span>}
        </button>
        {/* Phase 2F: Sound progress bar */}
        {isPlaying && (
          <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-border/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-none rounded-full"
              style={{ width: `${soundProgress * 100}%` }}
            />
          </div>
        )}
        {/* Inline finding — mobile-only, appears immediately below the clicked technique
            so students don't have to scroll to the bottom of the techniques list. */}
        {isSelected && isRevealed && (
          <div className="sm:hidden mt-1 p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-700 animate-fade-in">
            <p className="text-[10px] font-bold text-green-800 dark:text-green-200 mb-0.5">{action.label}</p>
            <p className="text-[11px] text-green-700 dark:text-green-300 leading-relaxed">{revealedFindings.get(action.id)}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-panel relative rounded-2xl overflow-hidden border border-white/45 dark:border-white/[0.06] shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_40px_-16px_rgba(0,0,0,0.7)] backdrop-blur-xl">
      {/* Teal accent hairline — "hands on patient" phase */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-slate-200/50 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 ring-1 ring-teal-500/15">
            <User className="h-3.5 w-3.5 text-teal-500/80" />
          </div>
          <div>
            <p className="text-[9px] font-medium tracking-[0.25em] uppercase text-muted-foreground/60">Phase&nbsp;3</p>
            <h2 className="text-sm font-semibold tracking-tight leading-tight">
              Patient Examination
              {activeRegion && (
                <span className="ml-2 text-xs font-light text-muted-foreground">
                  {'\u2014'} {REGION_LABELS[activeRegion] || activeRegion}
                </span>
              )}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* ONE view switch (skin ↔ skeleton). Previously labelled
              "Surface | Anatomy", which read as two unrelated controls —
              renamed so it is obviously a single mutually-exclusive toggle. */}
          <div className="hidden items-center gap-1 rounded-lg border border-slate-200/70 bg-white/70 p-0.5 dark:border-white/10 dark:bg-slate-900/60 sm:flex" role="group" aria-label="Model view layer">
            <span className="pl-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/50">View</span>
            <button
              type="button"
              onClick={() => setAnatomyLayer('surface')}
              className={`flex h-5 items-center gap-1 rounded-md px-1.5 text-[9px] font-medium transition-colors ${
                anatomyLayer === 'surface'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={anatomyLayer === 'surface'}
              title="Skin / surface examination view"
            >
              <User className="h-2.5 w-2.5" />
              Skin
            </button>
            <button
              type="button"
              onClick={() => setAnatomyLayer('skeleton')}
              className={`flex h-5 items-center gap-1 rounded-md px-1.5 text-[9px] font-medium transition-colors ${
                anatomyLayer === 'skeleton'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={anatomyLayer === 'skeleton'}
              title="Skeletal anatomy reference overlay"
            >
              <Activity className="h-2.5 w-2.5" />
              Skeleton
            </button>
            <button
              type="button"
              onClick={() => setAnatomyLayer('dressed')}
              className={`flex h-5 items-center gap-1 rounded-md px-1.5 text-[9px] font-medium transition-colors ${
                anatomyLayer === 'dressed'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-pressed={anatomyLayer === 'dressed'}
              title="Clothed view — clothing parts over the region you assess"
            >
              <Shirt className="h-2.5 w-2.5" />
              Dressed
            </button>
          </div>
          {/* Dressed view: deliberate exposure of the focused region. */}
          {anatomyLayer === 'dressed' && activeRegion && (CLOTHING_PARTING[activeRegion]?.length ?? 0) > 0 && (
            <Button
              variant={regionExposed ? 'default' : 'ghost'}
              size="sm"
              className={`h-6 gap-1 px-2 text-[9px] rounded-lg ${regionExposed ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'border border-teal-500/30 text-teal-600 dark:text-teal-300'}`}
              onClick={() => setRegionExposed(v => !v)}
              aria-pressed={regionExposed}
              title={regionExposed ? 'Re-dress this region' : 'Expose this region for examination'}
            >
              <Shirt className="h-3 w-3" />
              {regionExposed ? 'Re-dress' : 'Expose'}
            </Button>
          )}
          {/* Phase 2 — guided exam mode toggle */}
          <Button
            variant={guidedMode ? 'default' : 'ghost'}
            size="sm"
            className={`h-6 gap-1 px-2 text-[9px] rounded-lg ${guidedMode ? 'bg-cyan-600 hover:bg-cyan-700 text-white' : ''}`}
            onClick={handleToggleGuidedMode}
            aria-pressed={guidedMode}
            title={t('guidedExam.toggleHint')}
          >
            {guidedMode ? <Compass className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            {guidedMode ? t('guidedExam.on') : t('guidedExam.off')}
          </Button>
          {/* Phase 2B: Required vs optional badge */}
          <Badge variant={assessedCount === TOTAL_REGIONS ? 'default' : 'secondary'}
            className={`text-[9px] ${assessedCount === TOTAL_REGIONS ? 'bg-green-500' : ''}`}>
            {requiredTotal > 0
              ? `${requiredDone}/${requiredTotal} required \u00b7 ${assessedCount}/${TOTAL_REGIONS} total`
              : `${assessedCount}/${TOTAL_REGIONS}`
            }
          </Badge>
          {activeRegion && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleCloseRegion}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Phase 2 — guided exam mode: step indicator + blocked-click nudge */}
      {guidedMode && !activeRegion && (
        <div className="px-3 py-1.5 border-b border-cyan-200/60 dark:border-cyan-800/40 bg-cyan-50/70 dark:bg-cyan-950/30 flex items-center gap-2">
          <Compass className="h-3 w-3 text-indigo-500 shrink-0" />
          {nextGuidedStep ? (
            <p className="text-[10px] text-indigo-700 dark:text-indigo-200">
              <span className="font-semibold">
                {t('guidedExam.stepOf', { current: guidedStepIndex + 1, total: EXAM_SEQUENCE.length })}
              </span>
              <span className="mx-1.5 text-indigo-400">{'\u2192'}</span>
              <span>{REGION_LABELS[nextGuidedStep] || nextGuidedStep}</span>
            </p>
          ) : (
            <p className="text-[10px] text-indigo-700 dark:text-indigo-200 font-semibold">
              {t('guidedExam.complete')}
            </p>
          )}
        </div>
      )}
      {guidedMode && blockedNudge && (
        <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-800/50 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
          <p className="text-[10px] text-amber-700 dark:text-amber-200">
            {t('guidedExam.blocked', {
              attempted: REGION_LABELS[blockedNudge.attempted] || blockedNudge.attempted,
              expected: REGION_LABELS[blockedNudge.expected] || blockedNudge.expected,
            })}
          </p>
        </div>
      )}

      {!activeRegion && (
        <div className="grid grid-cols-2 gap-2 px-3 py-2 border-b border-slate-200/50 bg-white/45 text-[10px] dark:border-white/5 dark:bg-slate-950/30 sm:grid-cols-4">
          <div className="rounded-lg border border-slate-200/70 bg-white/70 px-2 py-1.5 dark:border-white/10 dark:bg-slate-900/60">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">Patient</p>
            <p className="truncate font-medium">{caseData.patientInfo?.age}y {caseData.patientInfo?.gender}</p>
          </div>
          <div className="rounded-lg border border-slate-200/70 bg-white/70 px-2 py-1.5 dark:border-white/10 dark:bg-slate-900/60">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">Posture</p>
            <p className="truncate font-medium">{caseData.initialPresentation?.position || 'Supine for exam'}</p>
          </div>
          <div className="rounded-lg border border-slate-200/70 bg-white/70 px-2 py-1.5 dark:border-white/10 dark:bg-slate-900/60">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">Appearance</p>
            <p className="truncate font-medium">{caseData.initialPresentation?.appearance || 'Observe closely'}</p>
          </div>
          <div className="rounded-lg border border-slate-200/70 bg-white/70 px-2 py-1.5 dark:border-white/10 dark:bg-slate-900/60">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">Focus</p>
            <p className="truncate font-medium">{requiredTotal > 0 ? `${requiredTotal} required regions` : 'Head-to-toe survey'}</p>
          </div>
        </div>
      )}

      {!activeRegion && (
        <PatientRealismStrip
          profile={realismProfile}
          cues={visibleRealismCues}
          assessedRegions={assessedRegions}
          activeRegion={activeRegion}
        />
      )}

      {!activeRegion && (
        <div className="border-b border-slate-200/60 bg-white/55 px-3 py-2 dark:border-white/5 dark:bg-slate-950/30">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/65">Examine region</p>
            <p className="text-[8px] text-muted-foreground/55">Select here or on the patient</p>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { id: 'face', label: 'Face', Icon: Eye },
              { id: 'neck-cspine', label: 'Neck', Icon: User },
              { id: 'chest', label: 'Chest', Icon: Stethoscope },
              { id: 'abdomen', label: 'Abdomen', Icon: Activity },
              { id: 'right-arm', label: 'Limbs', Icon: Hand },
            ].map(({ id, label, Icon }) => {
              const assessed = isRegionAssessed(id);
              const required = requiredRegions.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  aria-label={`Examine ${label}`}
                  onClick={() => handleRegionClick(id)}
                  className={`relative flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg border px-1.5 py-1.5 text-[8px] font-semibold transition-colors ${
                    assessed
                      ? 'border-emerald-300/70 bg-emerald-50/80 text-emerald-700 dark:border-emerald-700/50 dark:bg-emerald-950/30 dark:text-emerald-300'
                      : 'border-slate-200/80 bg-white/75 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50/70 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-cyan-700/60 dark:hover:bg-cyan-950/25'
                  }`}
                >
                  {required && !assessed && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-400" />}
                  {assessed && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Patient frame. When a region is active, the exam tools live inside
          this grey mannequin area rather than in an external side panel. */}
      <div>
        <div className={`relative min-w-0 overflow-hidden ${activeRegion ? 'bg-slate-100/35 dark:bg-slate-950/20' : 'h-[320px] sm:h-[380px] lg:h-[420px]'}`}>
          <div className={`relative min-w-0 overflow-hidden ${activeRegion ? 'h-[430px] sm:h-[470px]' : 'h-full'}`}>
            <Canvas
              camera={{ position: [0, 0.95, 4.25], fov: 38 }}
              dpr={Math.min(window.devicePixelRatio, 2)}
              frameloop="always"
              gl={{ antialias: true, alpha: true, preserveDrawingBuffer: new URLSearchParams(window.location.search).has('capture') }}
              style={{ background: 'transparent' }}
              onPointerMissed={() => { if (activeRegion) handleCloseRegion(); }}
            >
              {/* Natural studio lighting: warm sky / cool ground hemisphere for
                  organic skin tone, a warm key, a cool fill for dimension, and a
                  rim light to separate the patient from the backdrop. The old rig
                  was all cool-blue + flat, which made the anatomy look pale and
                  underlit. */}
              <ambientLight intensity={0.55} />
              <hemisphereLight color="#fff4e8" groundColor="#cad3de" intensity={0.85} />
              <directionalLight position={[4, 8, 5]} intensity={1.6} color="#fff2e6" />
              <directionalLight position={[-4, 4, 3]} intensity={0.6} color="#e4ecff" />
              <directionalLight position={[0, 4, -5]} intensity={0.65} color="#ffffff" />
              <directionalLight position={[0, -2, 3]} intensity={0.2} color="#fff6ef" />

              <PatientSceneEnvironment />

              <BodyMesh
                assessedRegions={assessedRegions}
                onRegionClick={handleRegionClick}
                requiredRegions={requiredRegions}
                guidedMode={guidedMode}
                nextGuidedStep={nextGuidedStep}
                onBlockedClick={handleBlockedClick}
                // See public/models/REALISTIC_ANATOMY.md for the vetted model
                // sources and the required export/validation path.
                patientGender={caseData.patientInfo?.gender}
                surfaceOpacity={anatomyLayer === 'skeleton' ? 0.28 : 1}
                // Finding morphs reveal ONLY once their region is assessed —
                // the discovery mechanic, now expressed on the mesh itself.
                activeFindingMorphs={activeFindingMorphs}
                // Breathing morph driven at the case respiratory rate (0 when
                // apnoeic / in arrest — stillness is itself a finding).
                breathRateRpm={isInArrest ? 0 : breathRateRpm}
                breathDepthFactor={breathDepthFactor}
                skinTint={skinAppearance.tint}
                skinDiaphoretic={skinAppearance.diaphoretic}
                // Receive the surface projector so labels anchor to the real mesh.
                // Wrap in an arrow so React stores the function rather than calling it.
                onSurfaceSampler={handleSurfaceSampler}
                dressed={anatomyLayer === 'dressed'}
                dressedActiveRegion={regionExposed ? activeRegion : null}
                pupilLeftMm={pupilProfile.leftMm}
                pupilRightMm={pupilProfile.rightMm}
              />

              <AnatomyReferenceLayer visible={anatomyLayer === 'skeleton'} />

              <LandmarkMarkers
                activeRegion={activeRegion}
                assessedRegions={assessedRegions}
                requiredRegions={requiredRegions}
                onSelect={handleRegionClick}
                onAction={handleExamAction}
                onPulse={onPulse}
                sampler={surfaceSampler}
              />

              <CaseRealismMarkers
                cues={visibleRealismCues}
                assessedRegions={assessedRegions}
                activeRegion={activeRegion}
                sampler={surfaceSampler}
              />

              {/* Findings revealed ON the body, only once their region has
                  been assessed — the discovery mechanic. */}
              <RevealedFindingMarkers
                caseData={caseData}
                assessedRegions={assessedRegions}
                activeRegion={activeRegion}
                sampler={surfaceSampler}
              />

              <InjuryWoundMarkers
                caseData={caseData}
                assessedRegions={assessedRegions}
                activeRegion={activeRegion}
                sampler={surfaceSampler}
              />

              <TreatmentEquipmentOverlay
                appliedTreatmentIds={appliedTreatmentIds}
                sampler={surfaceSampler}
              />

              <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={3} blur={2.5} far={3} />

              <OrbitControls
                ref={controlsRef}
                enablePan={false}
                minDistance={activeRegion ? 0.7 : 2}
                maxDistance={7}
                minPolarAngle={Math.PI * 0.15}
                maxPolarAngle={Math.PI * 0.85}
                target={[0, 0.92, 0]}
              />
            </Canvas>

            {/* Compact list of applied equipment — labels for the on-body pins */}
            <AppliedEquipmentTray appliedTreatmentIds={appliedTreatmentIds} />

            {/* Floating deselect — effortless "back to full body" while focused */}
            {activeRegion && (
              <button
                onClick={handleCloseRegion}
                className="absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-slate-950/55 px-3 py-1.5 text-[11px] font-medium text-white/90 shadow-lg backdrop-blur-md transition hover:bg-slate-900/70 active:scale-95"
                aria-label="Back to full body"
              >
                <X className="h-3 w-3" /> Full body
              </button>
            )}

            {activeRegion && <PatientReactionCard reaction={patientReaction} />}

            {activeRegion && (
              <AssessmentActionDock
                activeRegion={activeRegion}
                actions={allActions}
                selectedAction={selectedAction}
                revealedFindings={revealedFindings}
                onAction={handleExamAction}
              />
            )}

            {showRegionalLoupe && (
              <div className={`pointer-events-none absolute right-3 top-3 z-20 ${loupeWidthClass} animate-in fade-in slide-in-from-top-2 duration-300 ${showEyeContext ? '' : 'hidden sm:block'}`}>
                <RegionalZoomLoupe
                  activeRegion={activeRegion}
                  selectedAction={selectedAction}
                  caseData={caseData}
                  pupilProfile={pupilProfile}
                />
              </div>
            )}

            {/* In-frame premium glass findings — replaces the drop-below panel */}
            {activeRegion && (
              <InFrameFindings
                selectedAction={selectedAction}
                revealedFindings={revealedFindings}
                allActions={allActions}
                offsetForEyeContext={showRegionalLoupe}
              />
            )}
          </div>

          {activeRegion && (
            <div className="glass-panel relative z-20 m-2 mt-0 max-h-[290px] overflow-hidden rounded-2xl border border-white/45 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-white/10 sm:m-3 sm:mt-0">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-3 py-2 dark:border-white/10">
                <div className="min-w-0">
                  <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Hands-on exam station
                  </p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {activeLimb ? LIMB_LABELS[activeLimb] : REGION_LABELS[activeRegion]}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 rounded-full text-[9px]">
                  {allActions.filter(action => revealedFindings.has(action.id)).length}/{allActions.length} checked
                </Badge>
              </div>

              <div className="grid max-h-[calc(100%-3rem)] gap-0 overflow-hidden sm:grid-cols-[minmax(220px,0.9fr)_minmax(280px,1.1fr)]">
                <div className="min-h-0 overflow-y-auto border-b border-slate-200/70 p-2.5 dark:border-white/10 sm:border-b-0 sm:border-r">
                  <div className="space-y-1.5">
                    {limbGroups ? (
                      limbGroups.map(group => {
                        const isGroupExpanded = expandedGroups.has(group.id);
                        const groupRevealedCount = group.actions.filter(a => revealedFindings.has(a.id)).length;
                        const isCore = group.defaultExpanded;
                        return (
                          <div key={group.id} className={`rounded-xl overflow-hidden ${!isCore ? 'border border-border/40 bg-white/45 dark:bg-slate-900/40' : ''}`}>
                            <button
                              onClick={() => toggleGroup(group.id)}
                              className={`flex items-center gap-1.5 w-full text-left px-2 py-1.5 transition-colors ${
                                !isCore ? 'bg-muted/50 hover:bg-muted border-b border-border/20' : ''
                              }`}
                            >
                              {isGroupExpanded
                                ? <ChevronDown className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                                : <ChevronRight className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                              }
                              <span className="text-[10px] font-semibold flex-1">{group.label}</span>
                              <Badge variant="outline" className={`h-3.5 py-0 text-[7px] ${
                                groupRevealedCount === group.actions.length && groupRevealedCount > 0
                                  ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-950/30'
                                  : ''
                              }`}>
                                {groupRevealedCount}/{group.actions.length}
                              </Badge>
                            </button>
                            {isGroupExpanded && (
                              <div className={`space-y-0.5 ${!isCore ? 'p-1.5' : 'py-0.5'}`}>
                                {group.actions.map(action => renderActionButton(action))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      subRegions.map(sr => (
                        <div key={sr.id} className="space-y-0.5">
                          {subRegions.length > 1 && (
                            <p className="px-1 pt-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              {sr.label}
                            </p>
                          )}
                          {sr.actions.map(action => renderActionButton(action))}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="min-h-0 overflow-y-auto p-2.5">
                  <SecondaryAssessmentOutline
                    activeRegion={activeRegion}
                    selectedAction={selectedAction}
                    caseData={caseData}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls + footer */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/50 dark:bg-black/20 border-t border-border/30">
        <p className="text-[9px] text-muted-foreground">
          {activeRegion
            ? 'Work inside the patient frame: choose a technique, watch the anatomy, then reassess.'
            : '🔊 Click the chest, heart, or abdomen to listen — breath, heart & bowel sounds play live'}
        </p>
        <div className="flex gap-1.5">
          {activeRegion && (
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-[9px] rounded-lg" onClick={handleCloseRegion}>
              <X className="h-2.5 w-2.5" /> Back
            </Button>
          )}
          {/* Phase 2D: Log Roll button */}
          <Button
            variant="secondary"
            size="sm"
            className="h-7 gap-1 text-[9px] rounded-lg"
            onClick={() => {
              handleRegionClick('posterior-logroll');
              // Also flip to posterior view
              if (controlsRef.current && !isFlipped) {
                controlsRef.current.setAzimuthalAngle(Math.PI);
                controlsRef.current.update();
                setIsFlipped(true);
              }
            }}
          >
            <RotateCcw className="h-2.5 w-2.5" />
            Log Roll
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 gap-1 text-[9px] rounded-lg"
            onClick={handleToggleView}
          >
            <RotateCcw className="h-2.5 w-2.5" />
            {isFlipped ? 'Anterior' : 'Posterior'}
          </Button>
        </div>
      </div>

      {/* Phase 2D: Log roll reminder hint */}
      {showLogRollHint && !activeRegion && (
        <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-200/50 dark:border-amber-800/50 flex items-center gap-2">
          <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
          <p className="text-[10px] text-amber-700 dark:text-amber-300">Remember to log roll the patient</p>
        </div>
      )}

    </div>
  );
}

export default Body3DModel;
