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
export type PatientPosture = 'seated' | 'tripod' | 'supine' | 'recovery' | null;

export interface PatientPacingTransform {
  x: number;
  z: number;
  yaw: number;
}

export interface PatientPositioningOverride {
  mobility: PatientMobility;
  posture: PatientPosture;
  treatmentId: string;
}

export interface PatientPostureContext {
  mobility: PatientMobility;
  isInArrest?: boolean;
  unconscious?: boolean;
  positioningOverride?: PatientPositioningOverride | null;
  respiration?: number | null;
}

const TREATMENT_POSITIONING: Record<string, Omit<PatientPositioningOverride, 'treatmentId'>> = {
  supine_position: { mobility: 'recumbent', posture: 'supine' },
  recovery_position: { mobility: 'recumbent', posture: 'recovery' },
  fowlers_position: { mobility: 'seated', posture: 'tripod' },
  left_lateral_tilt: { mobility: 'recumbent', posture: 'recovery' },
  leg_elevation: { mobility: 'recumbent', posture: 'supine' },
  assisted_ambulation: { mobility: 'pacing', posture: null },
};

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

/** Derive a clinically plausible authored posture without conflating all seats. */
export function derivePatientPosture(
  caseData: CaseScenario,
  context: PatientPostureContext,
): PatientPosture {
  const {
    mobility,
    isInArrest = false,
    unconscious = false,
    positioningOverride = null,
    respiration = null,
  } = context;
  if (isInArrest) return 'supine';
  if (positioningOverride) return positioningOverride.posture;
  if (unconscious) return 'supine';

  const authoredPosition = caseData.initialPresentation?.position?.toLowerCase() ?? '';
  if (/recovery position|curled on (?:their |his |her )?side|lying on (?:their |his |her )?side/.test(authoredPosition)) {
    return 'recovery';
  }

  const respiratoryDistress =
    (typeof respiration === 'number' && respiration >= 24) ||
    /asthma|copd|respiratory|breath|wheez|dyspn/i.test(
      `${caseData.category ?? ''} ${caseData.title ?? ''} ${caseData.dispatchInfo?.callReason ?? ''}`,
    );

  if (mobility === 'recumbent') return 'supine';
  if (mobility === 'seated') {
    return /\btripod\b|leaning forward/.test(authoredPosition) || respiratoryDistress
      ? 'tripod'
      : 'seated';
  }
  if (mobility === 'standing' || mobility === 'pacing') return null;
  return respiratoryDistress ? 'tripod' : 'supine';
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

/** Local upper-arm rotation that turns the donor clip's A-pose into rest. */
export function patientArmRestRadians(
  mobility: PatientMobility,
  unconscious = false,
  ageYears?: number,
): number {
  if (mobility === 'pacing') return 0;
  const paediatricScale = typeof ageYears === 'number' && ageYears < 2
    ? 0.49
    : typeof ageYears === 'number' && ageYears < 6
      ? 0.63
      : typeof ageYears === 'number' && ageYears < 12
        ? 0.78
        : 1;
  if (mobility === 'seated') return 0.72 * paediatricScale;
  if (mobility === 'recumbent') return 0.28 * paediatricScale;
  return !unconscious ? 0.65 : 0;
}

/** Per-spine-bone flexion for the respiratory tripod silhouette. */
export function patientSpineLeanRadians(posture: PatientPosture, ageYears?: number): number {
  // Split roughly 15° across Spine + Spine1. Applying this through the fitted
  // rig keeps the abdomen, chest and shoulder sockets continuous; the former
  // vertex-space torso morph tore at both axillae when the arms were lowered.
  if (posture !== 'tripod') return 0;
  if (typeof ageYears === 'number' && ageYears < 2) return 0.08;
  if (typeof ageYears === 'number' && ageYears < 6) return 0.1;
  return 0.13;
}

/**
 * Compact out-and-back path for an observed walk in the treatment bay.
 *
 * A Mixamo walk clip is intentionally in-place; without a matching root path
 * the feet move but the patient remains fixed like a treadmill mannequin.
 * This path adds real displacement, a gentle turn into the direction of
 * travel and a few centimetres of depth variation while keeping the patient
 * inside the examination zone. The trigonometric loop is continuous at the
 * turnaround points, so there is no root snap for students to notice.
 */
export function patientPacingTransform(timeSeconds: number): PatientPacingTransform {
  const safeTime = Number.isFinite(timeSeconds) ? Math.max(0, timeSeconds) : 0;
  const phase = safeTime * ((Math.PI * 2) / 3.2);
  const direction = Math.cos(phase);

  return {
    x: Math.sin(phase) * 0.32,
    z: (1 - Math.cos(phase * 2)) * 0.025,
    // Face partly into the path rather than sliding sideways. atan keeps the
    // turn smooth as direction reverses at each end of the short walk.
    yaw: Math.atan(direction * 2.4) * 0.3,
  };
}

/**
 * The last positioning intervention is the patient's current position. This
 * closes the treatment-to-visual loop: applying recovery/Fowler's/supine or
 * assisted ambulation must move the rendered patient, not only change vitals.
 */
export function deriveTreatmentPositioningOverride(
  appliedTreatmentIds: readonly string[],
): PatientPositioningOverride | null {
  for (let index = appliedTreatmentIds.length - 1; index >= 0; index -= 1) {
    const treatmentId = appliedTreatmentIds[index];
    const positioning = TREATMENT_POSITIONING[treatmentId];
    if (positioning) return { ...positioning, treatmentId };
  }
  return null;
}
