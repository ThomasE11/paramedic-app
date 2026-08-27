import type { CaseScenario } from '@/types';

/**
 * Where the treatment-bay patient is staged: on the ambulance stretcher
 * (default) or where the scene actually found them — the floor/ground.
 *
 * This drives the 3D presentation only. It never changes clinical state.
 */
export type PatientStage = 'stretcher' | 'floor';
export type PatientMobility = 'recumbent' | 'seated' | 'standing' | 'pacing';
export type PatientSkeletalAction = 'idle' | 'walk' | null;

// ponytail: keyword staging over authored per-case data — explicit ground
// words only, so an ambiguous scene stays on the stretcher (clinically fine:
// the crew moved them). Upgrade path: an authored `sceneStage` field per case.
const FLOOR_PATTERN = new RegExp(
  [
    'on the floor',
    'on the ground',
    '\\bfloor\\b',
    '\\bground\\b',
    '\\bcollapsed\\b',
    'found down',
    '\\broadside\\b',
    '\\bstreet\\b',
    '\\bpavement\\b',
    '\\bsidewalk\\b',
    '\\bkerb\\b',
    '\\bcurb\\b',
    'car park',
    'parking lot',
    '\\bpitch\\b',
    '\\bfield\\b',
    '\\bbeach\\b',
    '\\bpoolside\\b',
  ].join('|'),
);

/**
 * Derive the presentation stage from the scene's own words — where the
 * patient was found is part of the clinical story ("treat them where they
 * lie"), so a collapsed/roadside patient renders on the ground instead of
 * magically pre-loaded onto the stretcher.
 */
export function deriveScenePatientStage(caseData: CaseScenario): PatientStage {
  const text = [
    caseData.initialPresentation?.position,
    caseData.initialPresentation?.generalImpression,
    caseData.initialPresentation?.appearance,
    caseData.dispatchInfo?.callReason,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return FLOOR_PATTERN.test(text) ? 'floor' : 'stretcher';
}

/**
 * Translate authored free-text positions into a small, renderable movement
 * contract.  This deliberately uses the initial-presentation position only:
 * a location containing words such as "street" must not make a supine trauma
 * patient walk, and a differential mentioning agitation must not override the
 * pose the crew actually finds.
 */
export function derivePatientMobility(
  caseData: CaseScenario,
  unconscious = false,
): PatientMobility {
  if (unconscious) return 'recumbent';
  const position = (caseData.initialPresentation?.position ?? '').toLowerCase();

  if (/\bpacing\b|\bwalking\b|\bwandering\b|\bambulatory\b/.test(position)) {
    return 'pacing';
  }
  if (/\bstanding\b|\bstood\b|\bon (?:their|his|her) feet\b/.test(position)) {
    return 'standing';
  }
  if (
    /\bsitting\b|\bseated\b|\bchair\b|\bdriver(?:'s)? seat\b|\blap\b|\bbeing held\b|\btripod\b|\bleaning against\b/.test(
      position,
    )
  ) {
    return 'seated';
  }
  return 'recumbent';
}

/** Only ambulatory patients receive whole-skeleton locomotion. */
export function patientSkeletalAction(
  mobility: PatientMobility,
  unconscious = false,
): PatientSkeletalAction {
  if (unconscious) return null;
  if (mobility === 'pacing') return 'walk';
  if (mobility === 'standing') return 'idle';
  return null;
}
