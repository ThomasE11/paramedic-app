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

  // ---- Mutual gating: only ONE high-frequency motion active at once ----
  let jitterEnabled = false; // flag to prevent shiver-compounding into tremor

  if (cues.seizure) {
    // Seizure beats take priority when flag is set — no competing vibration.
    const seizureBeat = (0.5 + 0.5 * Math.sin(time * TAU * 3.5)) * 0.68;
    out.motion_seizure = seizureBeat;
    jitterEnabled = true;
  } else if (!reduced && (cues.tremor || cues.shivering)) {
    // Tremor or shiver only when not already jittering via another cue.
    const baseTremor = (0.5 + 0.5 * Math.sin(time * TAU * 4));
    const tremorBeat = cues.tremor
      ? baseTremor * 0.18 * consciousGate
      : !reduced && cues.shivering
        ? baseTremor * 0.12 * consciousGate
        : 0;
    out.motion_tremor = Math.max(0, tremorBeat);
    jitterEnabled = true;
  }

  // ---- Agitation doesn't compound with shiver/tremor — it's slow restless motion ----
  const agitationBeat = !reduced && cues.agitated && !jitterEnabled
    ? (0.5 + 0.5 * Math.sin(time * TAU * 0.16)) * 0.16 * consciousGate
    : jitterEnabled ? 0 : 0; // suppress while seizure/tremor/shiver active
  out.motion_agitation = agitationBeat;

  // ---- Clinical pulses (wince/gasp/clutch) always run on their own schedule ----
  out.motion_gasp = patientMotionPulse(time, gaspStart, PATIENT_MOTION_DURATIONS.gasp) * consciousGate;
  out.motion_wince = patientMotionPulse(time, winceStart, PATIENT_MOTION_DURATIONS.wince) * consciousGate;
  out.motion_clutch = patientMotionPulse(time, clutchStart, PATIENT_MOTION_DURATIONS.clutch) * consciousGate;

  return out;
}
