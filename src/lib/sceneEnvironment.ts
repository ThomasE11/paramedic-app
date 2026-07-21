import type { CaseScenario } from '@/types';

/**
 * Which 3D environment the treatment-bay scene renders in — derived from the
 * case's own scene words, same approach as patientStaging.ts.
 *
 * This drives the 3D presentation only. It never changes clinical state.
 */
export type EnvironmentVariant = 'clinic' | 'home' | 'public' | 'roadside';

// ponytail: keyword scene-typing over authored per-case data — mirrors the
// staging heuristic. Ambiguous scenes fall through to the clinic bay.
// Upgrade path: an authored `sceneVariant` field per case.
const ROADSIDE_PATTERN = new RegExp(
  [
    '\\broad\\b',
    'roadside',
    '\\bstreet\\b',
    'highway',
    'motorway',
    '\\brta\\b',
    '\\bmvc\\b',
    'collision',
    'construction site',
    'car park',
    'parking lot',
    'pavement',
    'sidewalk',
    '\\bkerb\\b',
    '\\bcurb\\b',
    '\\bbeach\\b',
    '\\bdesert\\b',
    '\\bfarm\\b',
    '\\bpitch\\b',
    '\\bfield\\b',
  ].join('|'),
);

const HOME_PATTERN = new RegExp(
  [
    '\\bvilla\\b',
    'apartment',
    '\\bflat\\b',
    '\\bhome\\b',
    '\\bhouse\\b',
    'residence',
    'bedroom',
    'living room',
    '\\bkitchen\\b',
    '\\bmajlis\\b',
    'hotel room',
  ].join('|'),
);

const PUBLIC_PATTERN = new RegExp(
  [
    '\\bmall\\b',
    'shopping',
    'supermarket',
    '\\bsouk\\b',
    '\\boffice\\b',
    '\\bhotel\\b',
    'restaurant',
    '\\bcafe\\b',
    '\\bschool\\b',
    'university',
    '\\bcollege\\b',
    '\\bmosque\\b',
    '\\bgym\\b',
    '\\bairport\\b',
    '\\bmetro\\b',
    '\\bstadium\\b',
    'warehouse',
  ].join('|'),
);

/**
 * Derive the environment variant from the scene's own words. Roadside wins
 * over home/public (an RTA outside a villa is still outdoors); home wins over
 * public so "hotel room" doesn't render as a mall atrium.
 */
export function deriveSceneEnvironment(caseData: CaseScenario): EnvironmentVariant {
  const text = [
    caseData.dispatchInfo?.location,
    caseData.dispatchInfo?.callReason,
    caseData.sceneInfo?.description,
    caseData.sceneInfo?.environment,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (ROADSIDE_PATTERN.test(text)) return 'roadside';
  if (HOME_PATTERN.test(text)) return 'home';
  if (PUBLIC_PATTERN.test(text)) return 'public';
  return 'clinic';
}
