import type { CaseScenario } from '@/types';
import type { PatientVisualState } from '@/lib/patientVisualState';

export interface PupilProfile {
  leftMm: number;
  rightMm: number;
  leftReaction: string;
  rightReaction: string;
  note: string;
  abnormal: boolean;
}

export type PupilExamActionId = 'pupils-size' | 'pupils-reactivity' | 'pupils-equality';

const EYE_LANDMARKS: Array<{ actionId: PupilExamActionId; position: [number, number, number] }> = [
  { actionId: 'pupils-size', position: [-0.029, 1.55, 0.16] },
  { actionId: 'pupils-equality', position: [0.029, 1.55, 0.16] },
];

/** Grab radius for an eye click in clinical metres (~6.5 cm). Tight enough to miss the mouth. */
export const PUPIL_HIT_RADIUS = 0.065;

function pupilSourceText(caseData: CaseScenario): string {
  const raw = caseData.abcde?.disability?.pupils;
  if (Array.isArray(raw)) return raw.filter(Boolean).join(' ');
  return raw || '';
}

function reactionFromSegment(segment: string): string | null {
  if (/fixed|non-reactive|non reactive|unreactive/.test(segment)) return 'fixed';
  if (/sluggish|slow/.test(segment)) return 'sluggish';
  if (/brisk|reactive|pearl|perrl/.test(segment)) return 'brisk';
  return null;
}

function fallbackMm(text: string): number {
  if (text.includes('pinpoint') || text.includes('constrict')) return 1;
  if (text.includes('dilated') || text.includes('blown')) return 6;
  return 3;
}

function fallbackReaction(text: string): string {
  if (/fixed|non-reactive|non reactive|unreactive/.test(text)) return 'fixed';
  if (text.includes('sluggish') || text.includes('slow')) return 'sluggish';
  return 'brisk';
}

function isAsymmetric(profile: PupilProfile): boolean {
  return profile.leftMm !== profile.rightMm || profile.leftReaction !== profile.rightReaction;
}

/**
 * Parse authored `disability.pupils` (string or per-eye array) into millimetres
 * and reactivity so the 3D exam, close-up, and mesh discs stay in lockstep.
 */
export function getPupilProfile(caseData: CaseScenario): PupilProfile {
  const raw = pupilSourceText(caseData);
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
    return reactionFromSegment(segment);
  };

  const leftSpecificMm = parseSideMm('left');
  const rightSpecificMm = parseSideMm('right');
  const leftSpecificReaction = parseSideReaction('left');
  const rightSpecificReaction = parseSideReaction('right');

  if (leftSpecificMm !== null || rightSpecificMm !== null || leftSpecificReaction || rightSpecificReaction) {
    const fallback = fallbackMm(text);
    const leftMm = leftSpecificMm ?? fallback;
    const rightMm = rightSpecificMm ?? fallback;
    const leftReaction = leftSpecificReaction ?? fallbackReaction(text);
    const rightReaction = rightSpecificReaction ?? fallbackReaction(text);

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
    const reaction = /fixed|non-reactive|unreactive/.test(text) ? 'fixed' : 'sluggish';
    return {
      leftMm: 1,
      rightMm: 1,
      leftReaction: reaction,
      rightReaction: reaction,
      note: raw || 'Pinpoint pupils. Check toxidrome and ventilation.',
      abnormal: true,
    };
  }
  if (text.includes('unequal') || text.includes('anisocoria')) {
    return {
      leftMm: 5,
      rightMm: 2,
      leftReaction: /fixed|non-reactive|unreactive/.test(text) ? 'fixed' : 'sluggish',
      rightReaction: 'reactive',
      note: raw || 'Unequal pupils. Consider raised ICP, trauma, or focal neurological pathology.',
      abnormal: true,
    };
  }
  if (text.includes('dilated') || text.includes('blown')) {
    const reaction = /fixed|non-reactive|unreactive/.test(text) ? 'fixed' : 'sluggish';
    return {
      leftMm: 6,
      rightMm: 6,
      leftReaction: reaction,
      rightReaction: reaction,
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

/**
 * Scenario visuals (pinpoint / dilated toxidromes) fill a *normal* exam.
 * They must not flatten an already-asymmetric case profile (SAH, head injury).
 */
export function applyVisualEyeEffect(
  base: PupilProfile,
  visualState?: PatientVisualState | null,
): PupilProfile {
  const effect = visualState?.eyeEffects;
  if (!effect || effect.kind === 'normal') return base;
  if (base.abnormal && isAsymmetric(base)) return base;

  if (effect.kind === 'pinpoint') {
    return {
      leftMm: 1,
      rightMm: 1,
      leftReaction: base.leftReaction === 'fixed' ? 'fixed' : 'sluggish',
      rightReaction: base.rightReaction === 'fixed' ? 'fixed' : 'sluggish',
      note: effect.detail || 'Pinpoint pupils. Check toxidrome and ventilation.',
      abnormal: true,
    };
  }

  if (base.abnormal) return base;

  return {
    leftMm: 6,
    rightMm: 6,
    leftReaction: 'sluggish',
    rightReaction: 'sluggish',
    note: effect.detail || 'Dilated pupils. Correlate with GCS, drugs, hypoxia, and perfusion.',
    abnormal: true,
  };
}

function reactionFinding(reaction: string): string {
  if (reaction.includes('fixed')) return 'Fixed, non-reactive';
  if (reaction.includes('sluggish')) return 'Sluggish response';
  if (reaction === 'reactive') return 'Reactive';
  return 'Brisk direct and consensual';
}

export function describePupilFinding(profile: PupilProfile, actionId: string): string | null {
  if (actionId === 'pupils-size') {
    return `Left: ${profile.leftMm}mm. Right: ${profile.rightMm}mm.`;
  }
  if (actionId === 'pupils-reactivity') {
    return `Left: ${reactionFinding(profile.leftReaction)}. Right: ${reactionFinding(profile.rightReaction)}.`;
  }
  if (actionId === 'pupils-equality') {
    if (profile.leftMm !== profile.rightMm) {
      return profile.leftMm > profile.rightMm
        ? 'Unequal — left larger than right.'
        : 'Unequal — right larger than left.';
    }
    if (profile.leftMm <= 2) return 'Equal — both constricted.';
    if (profile.leftMm >= 5) return 'Equal — both dilated.';
    return 'Equal bilaterally.';
  }
  return null;
}

export function nearestPupilExamAction(
  point: { x: number; y: number; z: number },
  radius = PUPIL_HIT_RADIUS,
): PupilExamActionId | null {
  let best: { actionId: PupilExamActionId; d2: number } | null = null;
  const r2 = radius * radius;
  for (const landmark of EYE_LANDMARKS) {
    const dx = landmark.position[0] - point.x;
    const dy = landmark.position[1] - point.y;
    const dz = landmark.position[2] - point.z;
    const d2 = dx * dx + dy * dy + dz * dz;
    if (d2 > r2) continue;
    if (!best || d2 < best.d2) best = { actionId: landmark.actionId, d2 };
  }
  return best?.actionId ?? null;
}

export function isPupilExamAction(actionId: string | null | undefined): boolean {
  return actionId === 'pupils-size'
    || actionId === 'pupils-reactivity'
    || actionId === 'pupils-equality'
    || actionId === 'eyes-inspect';
}
