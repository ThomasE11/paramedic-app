import type { IdleCues } from '@/lib/idleCues';

export const PATIENT_MOTION_MORPHS = [
  'motion_gasp',
  'motion_wince',
  'motion_clutch',
  'motion_seizure',
  'motion_tremor',
  'motion_agitation',
] as const;

export type PatientMotionMorph = typeof PATIENT_MOTION_MORPHS[number];
export type PatientMotionSignals = Record<PatientMotionMorph, number>;

export const PATIENT_MOTION_DURATIONS = {
  wince: 0.9,
  gasp: 0.8,
  clutch: 2.4,
} as const;

const TAU = Math.PI * 2;

/** Raised-cosine 0→1→0 envelope for a scheduled clinical movement. */
export const patientMotionPulse = (time: number, start: number, duration: number): number =>
  time < start || time > start + duration
    ? 0
    : 0.5 - 0.5 * Math.cos(((time - start) / duration) * TAU);

interface PatientMotionFrameInput {
  time: number;
  gate: number;
  cues: IdleCues | null;
  reduced: boolean;
  winceStart: number;
  gaspStart: number;
  clutchStart: number;
  /** Optional reusable output for the render loop's allocation-free path. */
  out?: PatientMotionSignals;
}

const EMPTY_SIGNALS: PatientMotionSignals = {
  motion_gasp: 0,
  motion_wince: 0,
  motion_clutch: 0,
  motion_seizure: 0,
  motion_tremor: 0,
  motion_agitation: 0,
};

/**
 * Convert case cues into local morph weights for one render frame. This never
 * returns a root transform: collapsed patients stay in contact with their
 * support surface while shoulders, face and limbs respond to the condition.
 */
export function computePatientMotionSignals({
  time,
  gate,
  cues,
  reduced,
  winceStart,
  gaspStart,
  clutchStart,
  out = { ...EMPTY_SIGNALS },
}: PatientMotionFrameInput): PatientMotionSignals {
  if (!cues) {
    for (const name of PATIENT_MOTION_MORPHS) out[name] = 0;
    return out;
  }

  const consciousGate = Math.max(0, Math.min(1, gate));
  const seizureBeat = cues.seizure
    ? (0.5 + 0.5 * Math.sin(time * TAU * 3.5)) * 0.68
    : 0;
  const tremorBeat = !cues.seizure && cues.tremor
    ? (0.5 + 0.5 * Math.sin(time * TAU * 4)) * 0.18 * consciousGate
    : !reduced && cues.shivering
      ? (0.5 + 0.5 * Math.sin(time * TAU * 5)) * 0.12 * consciousGate
      : 0;

  out.motion_gasp = patientMotionPulse(time, gaspStart, PATIENT_MOTION_DURATIONS.gasp) * consciousGate;
  out.motion_wince = patientMotionPulse(time, winceStart, PATIENT_MOTION_DURATIONS.wince) * consciousGate;
  out.motion_clutch = patientMotionPulse(time, clutchStart, PATIENT_MOTION_DURATIONS.clutch) * consciousGate;
  // Seizure remains visible when unconscious. Other behaviours fade with
  // responsiveness and stop entirely in cardiac arrest.
  out.motion_seizure = seizureBeat;
  out.motion_tremor = tremorBeat;
  out.motion_agitation = !reduced && cues.agitated
    ? (0.5 + 0.5 * Math.sin(time * TAU * 0.22)) * 0.55 * consciousGate
    : 0;
  return out;
}
