import type { CaseScenario } from '@/types';
import { isBleedRegionControlled } from '@/lib/bleedControl';
import { inferInjuries, type BodyRegion } from '@/lib/injuryMap';
import { collectActualCaseClauses } from '@/lib/tractionSplintSafety';

export type LimbSplintTreatmentId =
  | 'splinting'
  | 'sam_splint'
  | 'box_splint'
  | 'vacuum_limb_splint'
  | 'air_splint';

export type LimbSplintDecisionCode =
  | 'eligible'
  | 'no-limb-injury'
  | 'proximal-femur-injury'
  | 'device-mismatch'
  | 'open-injury'
  | 'uncontrolled-haemorrhage';

type LimbRegion = Extract<BodyRegion, 'left-arm' | 'right-arm' | 'left-leg' | 'right-leg'>;

export interface LimbSplintDecision {
  allowed: boolean;
  code: LimbSplintDecisionCode;
  eligibleTargets: LimbRegion[];
  title: string;
  reason: string;
}

const LIMB_REGIONS = new Set<LimbRegion>(['left-arm', 'right-arm', 'left-leg', 'right-leg']);
const SPLINTABLE_KINDS = new Set(['deformity', 'fracture', 'rotation', 'shortening', 'swelling']);
const PROXIMAL_FEMUR = /\b(neck of femur|femoral neck|fractured?\s+nof|nof fracture|#nof|subcapital|intertrochanteric|hip fracture|proximal femur)\b/i;
const FEMORAL_SHAFT = /\b(femur|femoral|thigh)\b[\s\w/-]*\b(fractur\w*|broken|deform\w*)\b|\b(fractur\w*|broken|deform\w*)\b[\s\w/-]*\b(femur|femoral|thigh)\b/i;
const OPEN_INJURY = /\b(open\b[\s\w/-]{0,28}\bfractur\w*|open wound|bone exposed|compound fracture|amputat\w*|deglov\w*|active bleed\w*|haemorrhag\w*|hemorrhag\w*)\b/i;
const ACTIVE_BLEEDING = /\b(bleed(?:ing)?|haemorrhag\w*|hemorrhag\w*|blood loss|exsanguinat\w*|oozing blood|pooling blood|losing blood)\b/i;
const NEGATED_PREFIX = /^\s*(no|not|without|denies|denied|negative for|absent|nil|free of|ruled out)\b/i;

function sideOf(clause: string): 'left' | 'right' | null {
  if (/\b(left|l\.)\b/i.test(clause)) return 'left';
  if (/\b(right|r\.)\b/i.test(clause)) return 'right';
  return null;
}

function matchesRegion(clause: string, region: LimbRegion): boolean {
  const side = sideOf(clause);
  if (side && !region.startsWith(side)) return false;
  if (region.endsWith('arm')) return /\b(arm|shoulder|humerus|elbow|forearm|radius|ulna|wrist|hand)\b/i.test(clause);
  return /\b(leg|hip|femur|femoral|thigh|knee|tibia|tibial|fibula|fibular|shin|ankle|foot)\b/i.test(clause);
}

function hasRegionalClause(clauses: string[], region: LimbRegion, expression: RegExp): boolean {
  return clauses.some(clause => matchesRegion(clause, region) && expression.test(clause) && !NEGATED_PREFIX.test(clause));
}

function block(
  code: Exclude<LimbSplintDecisionCode, 'eligible'>,
  title: string,
  reason: string,
): LimbSplintDecision {
  return { allowed: false, code, eligibleTargets: [], title, reason };
}

/**
 * Filters real limb injuries to those that the selected splint can safely fit.
 * This keeps equipment choice meaningful: a temporary air sleeve is not a
 * substitute for open-fracture care, and distal splints are not femur devices.
 */
export function assessLimbSplintSafety(
  caseData: CaseScenario,
  treatmentId: LimbSplintTreatmentId,
  appliedTreatmentIds: Iterable<string> = [],
): LimbSplintDecision {
  const clauses = collectActualCaseClauses(caseData);
  const injuries = inferInjuries(caseData);
  const targets = [...new Set(
    injuries
      .filter(injury => LIMB_REGIONS.has(injury.region as LimbRegion) && SPLINTABLE_KINDS.has(injury.kind))
      .map(injury => injury.region as LimbRegion),
  )];

  if (targets.length === 0) {
    return block(
      'no-limb-injury',
      'No splintable limb injury identified',
      'Expose and assess the limbs first. This device must be fitted to an authored deformity, fracture or significant traumatic swelling.',
    );
  }

  const proximalTargets = targets.filter(region => hasRegionalClause(clauses, region, PROXIMAL_FEMUR));
  let eligibleTargets = targets.filter(region => !proximalTargets.includes(region));
  if (eligibleTargets.length === 0) {
    return block(
      'proximal-femur-injury',
      'Use whole-body support for this hip injury',
      'A neck-of-femur or proximal hip injury should be immobilised in the position found with analgesia, a scoop transfer and a vacuum mattress—not a distal limb splint.',
    );
  }

  const femurTargets = eligibleTargets.filter(region => hasRegionalClause(clauses, region, FEMORAL_SHAFT));
  if (treatmentId !== 'vacuum_limb_splint' && femurTargets.length > 0) {
    eligibleTargets = eligibleTargets.filter(region => !femurTargets.includes(region));
    if (eligibleTargets.length === 0) {
      return block(
        'device-mismatch',
        'Choose a femur-capable device',
        'A SAM, box or air splint does not provide controlled femoral-shaft traction or full-length support. Use a traction splint when eligible, or a vacuum limb splint when traction is contraindicated.',
      );
    }
  }

  const openTargets = eligibleTargets.filter(region =>
    hasRegionalClause(clauses, region, OPEN_INJURY)
    || injuries.some(injury => injury.region === region && ['wound', 'amputation', 'bleeding'].includes(injury.kind)),
  );
  if (treatmentId === 'air_splint' && openTargets.length > 0) {
    eligibleTargets = eligibleTargets.filter(region => !openTargets.includes(region));
    if (eligibleTargets.length === 0) {
      return block(
        'open-injury',
        'Air splint unsuitable for this open injury',
        'Do not enclose an open fracture, amputation or actively bleeding wound in an inflatable sleeve. Control and dress the wound, then select an open-injury-compatible splint.',
      );
    }
  }

  const uncontrolledTargets = eligibleTargets.filter(region =>
    (injuries.some(injury => injury.region === region && injury.kind === 'bleeding')
      || hasRegionalClause(clauses, region, ACTIVE_BLEEDING))
    && !isBleedRegionControlled(appliedTreatmentIds, region),
  );
  if (uncontrolledTargets.length > 0) {
    eligibleTargets = eligibleTargets.filter(region => !uncontrolledTargets.includes(region));
    if (eligibleTargets.length === 0) {
      return block(
        'uncontrolled-haemorrhage',
        'Control bleeding before immobilisation',
        'Expose the bleeding source and apply site-specific haemorrhage control before lifting, shaping or wrapping a splint around the limb.',
      );
    }
  }

  return {
    allowed: true,
    code: 'eligible',
    eligibleTargets,
    title: 'Limb splint appropriate',
    reason: `The selected device can be fitted to ${eligibleTargets.map(region => region.replace('-', ' ')).join(' or ')} after documented distal neurovascular assessment.`,
  };
}
