import type { CaseScenario } from '@/types';

/**
 * Where the treatment-bay patient is staged: on the ambulance stretcher
 * (default) or where the scene actually found them — the floor/ground.
 *
 * This drives the 3D presentation only. It never changes clinical state.
 */
export type PatientStage = 'stretcher' | 'floor';

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
