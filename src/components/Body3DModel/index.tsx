/**
 * 3D Physical Examination
 *
 * Three-panel layout when a body region is clicked:
 * LEFT: Assessment options (inspect, palpate, percuss, auscultate)
 * CENTER: 3D body model
 * RIGHT: Findings revealed when an assessment action is clicked
 *
 * When no region is selected, the body model fills the full width.
 */

import { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, User, Eye, Hand, Activity, Stethoscope, Heart, X, ChevronRight, ChevronDown, AlertTriangle } from 'lucide-react';
import { BodyMesh, getLastClickedLimb } from './BodyMesh';
import type { LimbSide } from './BodyMesh';
import type { AssessmentStepId, SecondaryAssessmentStep } from '@/data/assessmentFramework';
import { getAssessmentProfile } from '@/data/assessmentFramework';
import type { CaseScenario, CaseCategory } from '@/types';
import type { ClinicalSoundState } from '@/data/clinicalSounds';
import { playBreathSound, playHeartSound, playPercussionSound, playBowelSound, stopAllSounds } from '@/data/clinicalSounds';
import type { BowelSoundType, BreathSoundType } from '@/data/clinicalSounds';

const TOTAL_REGIONS = 11;

/** Helper: is this a limb region ID? */
const isLimbRegion = (id: string): boolean =>
  id === 'right-arm' || id === 'left-arm' || id === 'right-leg' || id === 'left-leg';

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
const TECHNIQUE_COLORS: Record<string, string> = {
  inspect: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:border-blue-800',
  palpate: 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-800',
  percuss: 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/30 dark:border-purple-800',
  auscultate: 'text-cyan-600 bg-cyan-50 border-cyan-200 hover:bg-cyan-100 dark:bg-cyan-950/30 dark:border-cyan-800',
};

// ============================================================================
// Collapsible action groups for limb regions (Phase 2A)
// ============================================================================

function getLimbActionGroups(regionId: string): ActionGroup[] | null {
  const prefix = regionId === 'right-arm' ? 'r' : regionId === 'left-arm' ? 'l' : regionId === 'right-leg' ? 'r' : regionId === 'left-leg' ? 'l' : null;
  if (!prefix) return null;

  const side = regionId.startsWith('right') ? 'right' : 'left';

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
        { id: 'mouth-inspect', label: 'Inspect (foreign body, blood, vomit, substances)', technique: 'inspect' },
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
      { id: 'chest-exam', label: 'Chest', actions: [
        { id: 'chest-inspect', label: 'Inspect (symmetry, wounds, flail)', technique: 'inspect' },
        { id: 'chest-palpate', label: 'Palpate (tenderness, crepitus)', technique: 'palpate' },
        { id: 'chest-percuss', label: 'Percuss', technique: 'percuss' },
        { id: 'chest-auscultate-lungs', label: 'Auscultate Lungs (bilateral)', technique: 'auscultate' },
        { id: 'chest-auscultate-heart', label: 'Auscultate Heart', technique: 'auscultate' },
      ]},
    ];

    // ===== ABDOMEN =====
    // Clinical exam order: Inspect -> Auscultate -> Percuss -> Palpate
    case 'abdomen': return [
      { id: 'abd-exam', label: 'Abdomen', actions: [
        { id: 'abd-inspect', label: 'Inspect (distension, bruising, wounds)', technique: 'inspect' },
        { id: 'abd-auscultate', label: 'Auscultate (bowel sounds, bruits)', technique: 'auscultate' },
        { id: 'abd-percuss', label: 'Percuss (tympany, dullness)', technique: 'percuss' },
        { id: 'abd-palpate', label: 'Palpate (tenderness, guarding, rigidity)', technique: 'palpate' },
      ]},
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

function getFinding(caseData: CaseScenario, regionId: string, actionId: string, isInArrest = false): string {
  // During cardiac arrest, all pulses are absent
  if (actionId.includes('pulse') && (isInArrest || caseData.vitalSignsProgression?.initial?.pulse === 0)) {
    return 'No pulse detected.';
  }

  const ss = caseData.secondarySurvey;
  const breathing = caseData.abcde?.breathing;
  const circ = caseData.abcde?.circulation;
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
  if (actionId === 'chest-auscultate-heart') {
    return 'Auscultating heart — listen carefully.';
  }
  // Abdomen — consolidated techniques (each covers the whole abdomen)
  if (actionId === 'abd-inspect') {
    const abd = ss?.abdomen || [];
    const inspectFindings = abd.filter(f => f.toLowerCase().includes('distend') || f.toLowerCase().includes('bruis') || f.toLowerCase().includes('scar') || f.toLowerCase().includes('visible'));
    return inspectFindings.length ? inspectFindings.join('. ') : 'Abdomen flat, symmetrical. No distension. No visible bruising, scars, or peristalsis.';
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
    const faceFindings = ss?.headDetailed?.face || [];
    const eyeFindings = faceFindings.filter(f => f.toLowerCase().includes('eye') || f.toLowerCase().includes('periorbital') || f.toLowerCase().includes('racoon') || f.toLowerCase().includes('conjunctiv') || f.toLowerCase().includes('sclera'));
    if (eyeFindings.length) return eyeFindings.join('. ');
    return 'Conjunctiva pink. Sclera white. No periorbital bruising. No foreign bodies.';
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
    const faceFinding = (ss?.headDetailed?.face || []).join(' ').toLowerCase();
    const neuro = (disability?.findings || []).join(' ').toLowerCase();
    if (faceFinding.includes('droop') || neuro.includes('droop') || neuro.includes('facial weakness')) return 'Asymmetry noted. Droop present.';
    return 'Symmetrical. No droop. Equal movement bilaterally on smile and brow raise.';
  }
  if (actionId === 'face-speech') {
    const neuro = (disability?.findings || []).join(' ').toLowerCase();
    if (neuro.includes('slur') || neuro.includes('dysarthria')) return 'Slurred speech noted.';
    if (neuro.includes('aphasia') || neuro.includes('dysphasia')) return 'Difficulty with speech. Words garbled or absent.';
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

  // Helper: find findings matching keywords for a specific area
  const findFor = (keywords: string[]): string | null => {
    const matches = extFindings.filter(f => keywords.some(k => f.toLowerCase().includes(k)));
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
  if (actionId === 'r-arm-neuro') return findFor(['right arm sensation', 'right upper limb']) || 'Sensation intact all dermatomes (median/ulnar/radial). Motor power 5/5. Grip strength equal.';

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
  if (actionId === 'l-arm-neuro') return findFor(['left arm sensation', 'left upper limb']) || 'Sensation intact all dermatomes (median/ulnar/radial). Motor power 5/5. Grip strength equal.';

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
  if (actionId === 'r-leg-inspect') return findFor(['right leg', 'right lower limb', 'right thigh', 'right shin']) || 'No deformity. No swelling. No wounds. Skin colour normal. No shortening or rotation.';
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
  if (actionId === 'r-leg-neuro') return findFor(['right leg sensation', 'right lower limb']) || 'Sensation intact L2-S1. Motor power 5/5. Dorsi/plantar flexion normal.';
  if (actionId === 'r-leg-compartment' || actionId === 'r-thigh-compartment' || actionId === 'r-shin-compartment') return allExtText.includes('compartment') && allExtText.includes('right') ? 'TENSE compartment \u2014 pain on passive stretch.' : 'Compartments soft. No pain on passive stretch. No paraesthesia.';
  if (actionId === 'r-thigh-inspect') return findFor(['right thigh', 'right femur', 'r thigh']) || 'No deformity. No swelling. No shortening or rotation.';
  if (actionId === 'r-knee-inspect') return findFor(['right knee', 'r knee']) || 'No swelling. No deformity. No effusion visible.';
  if (actionId === 'r-shin-inspect') return findFor(['right shin', 'right tibia', 'r shin']) || 'No deformity. No open wounds. Skin intact.';
  if (actionId === 'r-ankle-inspect') return findFor(['right ankle', 'r ankle']) || 'No swelling. No deformity. No bruising.';
  if (actionId === 'r-toes-inspect') return findFor(['right toe', 'r toe']) || 'Colour normal. Cap refill <2 seconds. No cyanosis.';

  // LEFT LEG
  if (actionId === 'l-leg-inspect') return findFor(['left leg', 'left lower limb', 'left thigh', 'left shin']) || 'No deformity. No swelling. No wounds. Skin colour normal. No shortening or rotation.';
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
  if (actionId === 'l-leg-neuro') return findFor(['left leg sensation', 'left lower limb']) || 'Sensation intact L2-S1. Motor power 5/5. Dorsi/plantar flexion normal.';
  if (actionId === 'l-leg-compartment' || actionId === 'l-thigh-compartment' || actionId === 'l-shin-compartment') return allExtText.includes('compartment') && allExtText.includes('left') ? 'TENSE compartment \u2014 pain on passive stretch.' : 'Compartments soft. No pain on passive stretch. No paraesthesia.';
  if (actionId === 'l-thigh-inspect') return findFor(['left thigh', 'left femur', 'l thigh']) || 'No deformity. No swelling. No shortening or rotation.';
  if (actionId === 'l-knee-inspect') return findFor(['left knee', 'l knee']) || 'No swelling. No deformity. No effusion visible.';
  if (actionId === 'l-shin-inspect') return findFor(['left shin', 'left tibia', 'l shin']) || 'No deformity. No open wounds. Skin intact.';
  if (actionId === 'l-ankle-inspect') return findFor(['left ankle', 'l ankle']) || 'No swelling. No deformity. No bruising.';
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
    controls: any,
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

// ============================================================================
// Sound duration estimates for progress bar
// ============================================================================
const SOUND_DURATIONS: Record<string, number> = {
  'chest-auscultate-lungs': 4000,
  'chest-auscultate-heart': 5000,
  'abd-auscultate': 5000,
  'airway-listen': 3000,
};
const PERCUSSION_DURATION = 800;

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
  /** Whether the patient is currently in cardiac arrest (all pulses absent) */
  isInArrest?: boolean;
}

export function Body3DModel({ onRegionClick, assessedRegions, caseData, patientSounds, caseCategory, isInArrest = false }: Body3DModelProps) {
  const controlsRef = useRef<any>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activeLimb, setActiveLimb] = useState<LimbSide>(null);
  const [revealedFindings, setRevealedFindings] = useState<Map<string, string>>(new Map());
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  // Phase 2F: Sound playback progress
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [soundProgress, setSoundProgress] = useState(0);
  const soundTimerRef = useRef<number | null>(null);

  const animateCamera = useCameraAnimation();

  // Phase 2B: Determine required regions from assessment profile
  const requiredRegions = useMemo<Set<string>>(() => {
    if (!caseCategory) return new Set<string>();
    const profile = getAssessmentProfile(caseCategory as CaseCategory);
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
  }, [caseCategory]);

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

  // Y-center positions for each region (must match BodyMesh REGION_RANGES)
  // Camera Y-center targets per region — keep model centered in canvas, don't overshoot
  const regionCenters: Record<string, number> = useMemo(() => ({
    'head': 1.55, 'face': 1.50, 'neck-cspine': 1.40,
    'chest': 1.25, 'abdomen': 1.05, 'pelvis': 0.90,
    'right-arm': 1.05, 'left-arm': 1.05,
    'right-leg': 0.50, 'left-leg': 0.50,
    'extremities': 0.50, 'posterior-logroll': 1.10,
  }), []);

  // Phase 2E: Consolidated close handler
  const handleCloseRegion = useCallback(() => {
    setActiveRegion(null);
    setSelectedAction(null);
    setPlayingSound(null);
    setSoundProgress(0);
    if (soundTimerRef.current !== null) {
      cancelAnimationFrame(soundTimerRef.current);
      soundTimerRef.current = null;
    }
    stopAllSounds();
    // Animate camera back to default
    if (controlsRef.current) {
      const currentPos = controlsRef.current.object.position;
      animateCamera(
        controlsRef.current,
        [0, 0.9, 3.2],
        [0, 0.85, 0],
        400,
      );
    }
  }, [animateCamera]);

  const handleRegionClick = useCallback((stepId: string) => {
    setActiveRegion(stepId);
    // Individual limb regions are directly the active limb
    setActiveLimb(isLimbRegion(stepId) ? stepId as LimbSide : null);
    setSelectedAction(null);
    // Initialize expanded groups for limb regions
    const groups = getLimbActionGroups(stepId);
    if (groups) {
      const initial = new Set<string>();
      groups.forEach(g => { if (g.defaultExpanded) initial.add(g.id); });
      setExpandedGroups(initial);
    }
    // Also mark 'extremities' as assessed when any limb is assessed (for backward compatibility)
    onRegionClick(stepId as AssessmentStepId);

    // Zoom camera to focus on the selected region (Phase 2C: smooth animation)
    if (controlsRef.current) {
      const centerY = regionCenters[stepId] ?? 0.85;
      const zoomDistance = isLimbRegion(stepId) || stepId === 'extremities' ? 3.2 : stepId === 'head' || stepId === 'face' ? 2.8 : 2.8;
      const currentPos = controlsRef.current.object.position;
      const currentTarget = controlsRef.current.target;
      const dir = currentPos.clone().sub(currentTarget).normalize();
      const newTarget: [number, number, number] = [0, centerY, 0];
      const newPos: [number, number, number] = [
        dir.x * zoomDistance + newTarget[0],
        dir.y * zoomDistance + newTarget[1],
        dir.z * zoomDistance + newTarget[2],
      ];
      animateCamera(controlsRef.current, newPos, newTarget, 400);
    }
  }, [onRegionClick, regionCenters, animateCamera]);

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
    const finding = getFinding(caseData, activeRegion, actionId, isInArrest);
    setRevealedFindings(prev => {
      const next = new Map(prev);
      next.set(actionId, finding);
      return next;
    });

    // Play sounds for auscultation actions
    if (actionId.includes('auscultate') && patientSounds) {
      stopAllSounds();
      if (actionId === 'chest-auscultate-lungs') {
        // Play left lung (3s), then right lung (3s) — bilateral auscultation
        playBreathSound(patientSounds.leftLung, 3000);
        setTimeout(() => {
          playBreathSound(patientSounds.rightLung, 3000);
        }, 3200);
        startSoundProgress(actionId, 6200);
      } else if (actionId === 'chest-auscultate-heart') {
        // Heart sounds — realistic listening duration
        playHeartSound(patientSounds.heartSound, 8000);
        startSoundProgress(actionId, 8000);
      } else if (actionId === 'abd-auscultate') {
        // Bowel sounds are ongoing — play for a realistic 15 seconds
        // In real practice you listen for at least 2 minutes if sounds are absent
        const abd = caseData.secondarySurvey?.abdomen || [];
        const abdText = abd.join(' ').toLowerCase();
        let bowelType: BowelSoundType = 'normal';
        if (abdText.includes('absent bowel') || abdText.includes('ileus') || abdText.includes('paralytic')) bowelType = 'absent';
        else if (abdText.includes('hyperactive') || abdText.includes('diarrh') || abdText.includes('gastroenter')) bowelType = 'hyperactive';
        else if (abdText.includes('tinkling') || abdText.includes('obstruct')) bowelType = 'tinkling';
        else if (abdText.includes('hypoactive') || abdText.includes('post-op') || abdText.includes('opioid')) bowelType = 'hypoactive';
        playBowelSound(bowelType, 15000);
        startSoundProgress(actionId, 15000);
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
      const percFinding = getFinding(caseData, activeRegion!, actionId);
      const percType = percFinding.toLowerCase().includes('hyper') ? 'hyper-resonant'
        : percFinding.toLowerCase().includes('dull') ? 'dull'
        : percFinding.toLowerCase().includes('tympanic') ? 'tympanic'
        : 'resonant';
      playPercussionSound(percType);
      startSoundProgress(actionId, PERCUSSION_DURATION);
    }
  }, [activeRegion, caseData, patientSounds, startSoundProgress, isInArrest]);

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
      </div>
    );
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-border/40 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-white/50 dark:bg-black/20">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-blue-500" />
          <span className="text-xs font-semibold">Physical Examination</span>
          {activeRegion && (
            <span className="text-xs text-muted-foreground">
              {'\u2014'} {REGION_LABELS[activeRegion] || activeRegion}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
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

      {/* 3-column layout when region active: LEFT(techniques) | CENTER(body) | RIGHT(findings)
           On mobile: stacks vertically. On desktop (sm+): side-by-side with flexible columns. */}
      <div className={`${activeRegion ? 'grid grid-cols-1 sm:grid-cols-[160px_1fr_200px]' : ''}`}>

        {/* LEFT PANEL: Exam techniques — only when region is active, desktop only inline */}
        {activeRegion && (
          <div className="hidden sm:block border-r border-border/30 bg-white/60 dark:bg-slate-900/60 overflow-y-auto max-h-[480px]">
            <div className="p-2.5 space-y-1">
              <p className="text-[10px] font-bold text-foreground dark:text-white mb-1.5 px-1">
                {activeLimb ? LIMB_LABELS[activeLimb] : REGION_LABELS[activeRegion]}
              </p>

              {limbGroups ? (
                limbGroups.map(group => {
                  const isGroupExpanded = expandedGroups.has(group.id);
                  const groupRevealedCount = group.actions.filter(a => revealedFindings.has(a.id)).length;
                  const isCore = group.defaultExpanded;
                  return (
                    <div key={group.id} className={`rounded-lg overflow-hidden ${!isCore ? 'border border-border/30' : ''}`}>
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
                        <Badge variant="outline" className={`text-[7px] py-0 h-3.5 ${
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
                    {sr.actions.map(action => renderActionButton(action))}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CENTER: 3D Body */}
        <div className={`min-w-0 overflow-hidden ${activeRegion ? 'h-[480px]' : 'h-[320px] sm:h-[380px] lg:h-[420px]'}`}>
          <Canvas
            camera={{ position: [0, 0.9, 3.2], fov: 40 }}
            dpr={Math.min(window.devicePixelRatio, 2)}
            frameloop="demand"
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[4, 8, 4]} intensity={1.0} color="#fff5ee" />
            <directionalLight position={[-3, 5, -2]} intensity={0.4} color="#e8e0ff" />
            <directionalLight position={[0, -2, 3]} intensity={0.2} color="#ffe8d0" />

            <BodyMesh assessedRegions={assessedRegions} onRegionClick={handleRegionClick} requiredRegions={requiredRegions} />

            <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={3} blur={2.5} far={3} />

            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              minDistance={2}
              maxDistance={7}
              minPolarAngle={Math.PI * 0.15}
              maxPolarAngle={Math.PI * 0.85}
              target={[0, 0.85, 0]}
            />
          </Canvas>
        </div>

        {/* RIGHT PANEL: Findings — only when region is active, desktop only inline */}
        {activeRegion && (
          <div className="hidden sm:block border-l border-border/30 bg-white/60 dark:bg-slate-900/60 overflow-y-auto max-h-[480px]">
            <div className="p-2.5">
              <p className="text-[10px] font-bold text-foreground dark:text-white mb-1.5 px-1">Findings</p>
              {selectedAction && revealedFindings.has(selectedAction) ? (
                <div className="space-y-1.5">
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-700">
                    <p className="text-[10px] font-bold text-green-800 dark:text-green-200 mb-0.5">
                      {allActions.find(a => a.id === selectedAction)?.label}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed">
                      {revealedFindings.get(selectedAction)}
                    </p>
                  </div>
                  {(() => {
                    const regionActionIds = allActions.map(a => a.id);
                    const others = [...revealedFindings.entries()].filter(([id]) => regionActionIds.includes(id) && id !== selectedAction);
                    if (others.length === 0) return null;
                    return (
                      <div className="space-y-1 pt-1">
                        {others.map(([id, finding]) => (
                          <div key={id} className="p-2 rounded-lg bg-muted/30 dark:bg-slate-800/40 border border-border/30">
                            <span className="text-[10px] font-semibold dark:text-slate-200">{allActions.find(a => a.id === id)?.label}: </span>
                            <span className="text-[10px] text-muted-foreground dark:text-slate-400">{finding}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex items-center justify-center h-20 text-muted-foreground">
                  <p className="text-[10px] text-center dark:text-slate-500">
                    Select an exam technique
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls + footer */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/50 dark:bg-black/20 border-t border-border/30">
        <p className="text-[9px] text-muted-foreground">
          {activeRegion ? 'Perform each examination technique below' : 'Click a body region to examine'}
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

      {/* ===== MOBILE EXAM PANEL: Below body on small screens ===== */}
      {activeRegion && (
        <div className="sm:hidden border-t border-border/30 bg-white/60 dark:bg-slate-900/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border/30">
            {/* LEFT: Exam techniques */}
            <div className="p-2.5 space-y-1">
              <p className="text-[10px] font-bold text-foreground dark:text-white mb-1.5">
                {activeLimb ? LIMB_LABELS[activeLimb] : REGION_LABELS[activeRegion]}
              </p>
              {limbGroups ? (
                limbGroups.map(group => {
                  const isGroupExpanded = expandedGroups.has(group.id);
                  const groupRevealedCount = group.actions.filter(a => revealedFindings.has(a.id)).length;
                  const isCore = group.defaultExpanded;
                  return (
                    <div key={group.id} className={`rounded-lg overflow-hidden ${!isCore ? 'border border-border/30' : ''}`}>
                      <button onClick={() => toggleGroup(group.id)}
                        className={`flex items-center gap-1.5 w-full text-left px-2 py-1.5 transition-colors ${!isCore ? 'bg-muted/50 hover:bg-muted' : ''}`}>
                        {isGroupExpanded ? <ChevronDown className="h-2.5 w-2.5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-2.5 w-2.5 text-muted-foreground shrink-0" />}
                        <span className="text-[10px] font-semibold flex-1">{group.label}</span>
                        <Badge variant="outline" className={`text-[7px] py-0 h-3.5 ${groupRevealedCount === group.actions.length && groupRevealedCount > 0 ? 'bg-green-50 text-green-600 border-green-200' : ''}`}>
                          {groupRevealedCount}/{group.actions.length}
                        </Badge>
                      </button>
                      {isGroupExpanded && <div className={`space-y-0.5 ${!isCore ? 'p-1.5' : 'py-0.5'}`}>{group.actions.map(action => renderActionButton(action))}</div>}
                    </div>
                  );
                })
              ) : (
                subRegions.map(sr => <div key={sr.id} className="space-y-0.5">{sr.actions.map(action => renderActionButton(action))}</div>)
              )}
            </div>
            {/* RIGHT: Findings */}
            <div className="p-2.5">
              <p className="text-[10px] font-bold text-foreground dark:text-white mb-1.5">Findings</p>
              {selectedAction && revealedFindings.has(selectedAction) ? (
                <div className="space-y-1.5">
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-300 dark:border-green-700">
                    <p className="text-[10px] font-bold text-green-800 dark:text-green-200 mb-0.5">{allActions.find(a => a.id === selectedAction)?.label}</p>
                    <p className="text-xs text-green-700 dark:text-green-300 leading-relaxed">{revealedFindings.get(selectedAction)}</p>
                  </div>
                  {(() => {
                    const regionActionIds = allActions.map(a => a.id);
                    const others = [...revealedFindings.entries()].filter(([id]) => regionActionIds.includes(id) && id !== selectedAction);
                    if (others.length === 0) return null;
                    return <div className="space-y-1 pt-1">{others.map(([id, finding]) => (
                      <div key={id} className="p-2 rounded-lg bg-muted/30 border border-border/30">
                        <span className="text-[10px] font-semibold">{allActions.find(a => a.id === id)?.label}: </span>
                        <span className="text-[10px] text-muted-foreground">{finding}</span>
                      </div>
                    ))}</div>;
                  })()}
                </div>
              ) : (
                <div className="flex items-center justify-center h-16 text-muted-foreground">
                  <p className="text-[10px] text-center">Select an exam technique</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Body3DModel;
