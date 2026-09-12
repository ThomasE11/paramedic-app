import type { PatientPosture } from './patientStaging';

// These are a paired adjustment: leaning the spine alone drives the palms
// into the knees. The small upper-arm correction preserves brace clearance.
export const TRIPOD_BRACE_CALIBRATION = { forearm: 0.15, spine: 0.07, upperArm: -0.065 } as const;

/** Calibrated on the adult male tripod rig: ~12–13mm palm clearance,
 * rather than the 65mm hovering gap left by the generic seated arm rest.
 * Mirrored local-Z sweep respects this rig's forearm axes. */
export function tripodHandBraceSweep(enabled: boolean, posture: PatientPosture | null, side: 'left' | 'right'): number {
  if (!enabled || posture !== 'tripod') return 0;
  return (side === 'left' ? -1 : 1) * TRIPOD_BRACE_CALIBRATION.forearm;
}
