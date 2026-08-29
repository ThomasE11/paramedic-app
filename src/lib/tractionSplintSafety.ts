import type { CaseScenario } from '@/types';
import { isBleedRegionControlled } from '@/lib/bleedControl';
import { inferInjuries, type BodyRegion } from '@/lib/injuryMap';

export type TractionSplintDecisionCode =
  | 'eligible'
  | 'no-femoral-shaft-injury'
  | 'bilateral-femur-injury'
  | 'proximal-femur-injury'
  | 'pelvic-injury'
  | 'associated-lower-limb-injury'
  | 'distal-vascular-compromise'
  | 'uncontrolled-haemorrhage';

export interface TractionSplintDecision {
  allowed: boolean;
  code: TractionSplintDecisionCode;
  target: Extract<BodyRegion, 'left-leg' | 'right-leg'> | null;
  title: string;
  reason: string;
}

const FEMUR = /\b(femur|femoral|thigh)\b/i;
const FRACTURE = /\b(fractur\w*|broken|deform\w*|angulat\w*|shorten\w*)\b/i;
const PROXIMAL_FEMUR = /\b(neck of femur|femoral neck|fractured?\s+nof|nof fracture|#nof|subcapital|intertrochanteric|hip fracture|proximal femur)\b/i;
const PELVIC_INJURY = /\b(pelvi(?:s|c)|acetabul\w*|pubic ram\w*|sacroiliac)\b[\s\w/-]*\b(fractur\w*|unstable|disrupt\w*|deform\w*)\b/i;
const LOWER_LEG_INJURY = /\b(knee|patella|tibia|tibial|fibula|fibular|shin|lower leg|ankle|foot)\b[\s\w/-]*\b(fractur\w*|broken|deform\w*|dislocat\w*|amputat\w*)\b/i;
const ABSENT_DISTAL_PULSE = /\b(absent|no|lost|pulseless|cold)\b[\s\w/-]{0,32}\b(distal pulse|dorsalis pedis|posterior tibial|foot pulse|pedal pulse|pulse)\b|\b(distal pulse|dorsalis pedis|posterior tibial|foot pulse|pedal pulse)\b[\s\w/-]{0,24}\b(absent|lost|not palpable|not present)\b/i;

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  return [];
}

/**
 * Only fields that describe what is actually present belong here. Red flags,
 * differentials, teaching notes and treatment pathways intentionally stay out:
 * a warning such as "consider pelvic fracture" must never manufacture one.
 */
function actualClinicalClauses(caseData: CaseScenario): string[] {
  const ss = caseData.secondarySurvey;
  const fields: unknown[] = [
    caseData.title,
    caseData.subcategory,
    caseData.dispatchInfo?.callReason,
    caseData.sceneInfo?.description,
    caseData.initialPresentation?.appearance,
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.position,
    caseData.abcde?.circulation?.findings,
    caseData.abcde?.exposure?.findings,
    caseData.abcde?.exposure?.deformities,
    ss?.pelvis,
    ss?.extremities,
    caseData.history?.eventsLeading,
    caseData.expectedFindings?.keyObservations,
    caseData.expectedFindings?.mostLikelyDiagnosis,
    caseData.expectedFindings?.supportingEvidence,
  ];
  return fields
    .flatMap(strings)
    .flatMap(value => value.split(/[.;]|\band\b/i))
    .map(value => value.trim())
    .filter(Boolean);
}

function isNegated(clause: string, expression: RegExp): boolean {
  const match = clause.match(expression);
  if (!match || match.index == null) return false;
  const before = clause.slice(Math.max(0, match.index - 30), match.index);
  return /\b(no|not|without|denies|negative for|absent|nil|free of|ruled out)\b[\s\w/-]*$/i.test(before);
}

function affirmed(clauses: string[], expression: RegExp): string[] {
  return clauses.filter(clause => expression.test(clause) && !isNegated(clause, expression));
}

function sideOf(clause: string): 'left' | 'right' | null {
  if (/\b(left|l\.)\b/i.test(clause)) return 'left';
  if (/\b(right|r\.)\b/i.test(clause)) return 'right';
  return null;
}

function sideRegion(side: 'left' | 'right'): Extract<BodyRegion, 'left-leg' | 'right-leg'> {
  return `${side}-leg`;
}

function blocked(
  code: Exclude<TractionSplintDecisionCode, 'eligible'>,
  title: string,
  reason: string,
  target: TractionSplintDecision['target'] = null,
): TractionSplintDecision {
  return { allowed: false, code, target, title, reason };
}

/**
 * Decides whether a traction splint is anatomically and operationally safe.
 * This is deliberately narrower than generic splinting: traction is reserved
 * for a femoral-shaft injury and must never be inferred from a generic limb,
 * wrist, tibial, hip or pelvic deformity.
 */
export function assessTractionSplintSafety(
  caseData: CaseScenario,
  appliedTreatmentIds: Iterable<string> = [],
): TractionSplintDecision {
  const clauses = actualClinicalClauses(caseData);
  const femurClauses = clauses.filter(clause => FEMUR.test(clause) && FRACTURE.test(clause) && !isNegated(clause, FRACTURE));

  if (femurClauses.length === 0) {
    return blocked(
      'no-femoral-shaft-injury',
      'Traction splint not indicated',
      'A traction splint is specific to a confirmed femoral-shaft injury. Use an injury-appropriate SAM, box, air or vacuum splint instead.',
    );
  }

  const explicitSides = new Set(femurClauses.map(sideOf).filter((side): side is 'left' | 'right' => side != null));
  if (explicitSides.size > 1 || femurClauses.some(clause => /\bbilateral\b/i.test(clause))) {
    return blocked(
      'bilateral-femur-injury',
      'Single traction splint is insufficient',
      'Both femurs appear injured. Do not treat this as an isolated one-device procedure; prioritise haemorrhage control, whole-body immobilisation and rapid trauma transport.',
    );
  }

  const inferredLegs = new Set(
    inferInjuries(caseData)
      .filter(injury => (injury.region === 'left-leg' || injury.region === 'right-leg') && ['deformity', 'rotation', 'shortening', 'fracture'].includes(injury.kind))
      .map(injury => injury.region as Extract<BodyRegion, 'left-leg' | 'right-leg'>),
  );
  const target = explicitSides.size === 1
    ? sideRegion([...explicitSides][0])
    : inferredLegs.size === 1 ? [...inferredLegs][0] : null;

  if (!target) {
    return blocked(
      'no-femoral-shaft-injury',
      'Identify the injured femur first',
      'The case does not establish which femur is injured. Expose and assess both legs before selecting a site-specific traction device.',
    );
  }

  if (affirmed(clauses, PROXIMAL_FEMUR).length > 0) {
    return blocked(
      'proximal-femur-injury',
      'Traction splint contraindicated',
      'This is a hip or neck-of-femur injury, not a mid-shaft femur injury. Provide analgesia and immobilise in the position found using a scoop and vacuum mattress.',
      target,
    );
  }

  if (affirmed(clauses, PELVIC_INJURY).length > 0 || inferInjuries(caseData).some(injury => injury.region === 'pelvis' && injury.kind === 'fracture')) {
    return blocked(
      'pelvic-injury',
      'Traction splint contraindicated',
      'Suspected pelvic-ring injury makes longitudinal limb traction unsafe. Apply a pelvic binder when indicated and use a scoop or vacuum mattress for movement.',
      target,
    );
  }

  const targetSide = target.startsWith('left') ? 'left' : 'right';
  const sameSideLowerLegInjury = affirmed(clauses, LOWER_LEG_INJURY).some(clause => {
    const side = sideOf(clause);
    return side == null || side === targetSide;
  });
  if (sameSideLowerLegInjury) {
    return blocked(
      'associated-lower-limb-injury',
      'Traction splint contraindicated',
      `The ${targetSide} lower leg or adjacent joint is also injured. A traction splint could worsen that injury; support the whole limb in the position found.`,
      target,
    );
  }

  if (affirmed(clauses, ABSENT_DISTAL_PULSE).some(clause => sideOf(clause) == null || sideOf(clause) === targetSide)) {
    return blocked(
      'distal-vascular-compromise',
      'Urgent vascular injury suspected',
      `The ${targetSide} foot has evidence of distal vascular compromise. Support the limb, avoid delaying transport and obtain urgent trauma support rather than completing routine traction.`,
      target,
    );
  }

  const hasActiveTargetBleeding = inferInjuries(caseData).some(injury => injury.region === target && injury.kind === 'bleeding');
  if (hasActiveTargetBleeding && !isBleedRegionControlled(appliedTreatmentIds, target)) {
    return blocked(
      'uncontrolled-haemorrhage',
      'Control catastrophic bleeding first',
      `The ${targetSide} femur wound is still actively bleeding. Apply site-specific haemorrhage control and confirm it is effective before manipulating the limb.`,
      target,
    );
  }

  return {
    allowed: true,
    code: 'eligible',
    target,
    title: 'Femoral-shaft traction indicated',
    reason: `The ${targetSide} femoral-shaft injury has no identified pelvic, proximal-femur, same-side lower-leg or uncontrolled-haemorrhage contraindication.`,
  };
}
