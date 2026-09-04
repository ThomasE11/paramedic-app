export type CameraPoint3 = [number, number, number];

const TREATMENT_BAY_ACTION_RADIUS_SCALE = 1.6;

/**
 * Surface samples in the treatment presentation are already world-space.
 * Only authored clinical coordinates need the treatment-bay projection.
 * Keeping this boundary explicit prevents a second root transform from
 * throwing a focused face/chest action back toward a full-body view.
 */
export function resolveTreatmentBayActionTarget(
  sampledWorld: CameraPoint3 | null,
  authoredClinical: CameraPoint3,
  projectClinicalToWorld: (point: CameraPoint3) => CameraPoint3,
): CameraPoint3 {
  return sampledWorld ?? projectClinicalToWorld(authoredClinical);
}

/**
 * The narrow patient viewport already feeds its live aspect ratio into the
 * camera fit. A small margin is enough for the surrounding anatomy; the old
 * 4.2 multiplier counteracted that fit and reduced a lip exam to a torso shot.
 */
export function treatmentBayActionFramingRadius(
  clinicalRadius: number,
  patientScale: number,
): number {
  return clinicalRadius * Math.max(0.5, patientScale) * TREATMENT_BAY_ACTION_RADIUS_SCALE;
}
