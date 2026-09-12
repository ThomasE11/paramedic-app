import { describe, expect, it } from 'vitest';
import type { IdleCues } from '@/lib/idleCues';
import {
  computePatientMotionSignals,
  PATIENT_MOTION_DURATIONS,
  patientMotionPulse,
} from '@/lib/patientMotion';

const cues = (overrides: Partial<IdleCues> = {}): IdleCues => ({
  pain01: 0,
  gasping: false,
  shivering: false,
  seizure: false,
  tremor: false,
  agitated: false,
  chestClutch: false,
  ...overrides,
});

describe('patientMotion', () => {
  it('keeps a calm patient locally still', () => {
    const signals = computePatientMotionSignals({
      time: 5,
      gate: 1,
      cues: cues(),
      reduced: false,
      winceStart: -1,
      gaspStart: -1,
      clutchStart: -1,
    });
    expect(Object.values(signals).every(value => value === 0)).toBe(true);
  });

  it('peaks a scheduled gasp halfway through its envelope', () => {
    const start = 4;
    const time = start + PATIENT_MOTION_DURATIONS.gasp / 2;
    const signals = computePatientMotionSignals({
      time,
      gate: 1,
      cues: cues({ gasping: true }),
      reduced: false,
      winceStart: -1,
      gaspStart: start,
      clutchStart: -1,
    });
    expect(signals.motion_gasp).toBeCloseTo(1, 5);
    expect(patientMotionPulse(time, start, PATIENT_MOTION_DURATIONS.gasp)).toBeCloseTo(1, 5);
  });

  it('suppresses conscious motion at zero responsiveness but preserves seizure activity', () => {
    const signals = computePatientMotionSignals({
      time: 2.025,
      gate: 0,
      cues: cues({ gasping: true, agitated: true, seizure: true }),
      reduced: false,
      winceStart: 1.55,
      gaspStart: 1.625,
      clutchStart: 0.825,
    });
    expect(signals.motion_gasp).toBe(0);
    expect(signals.motion_agitation).toBe(0);
    expect(signals.motion_seizure).toBeGreaterThan(0);
  });

  it('drops garnish on the reduced tier without hiding a seizure', () => {
    const signals = computePatientMotionSignals({
      time: 3.025,
      gate: 1,
      cues: cues({ shivering: true, agitated: true, seizure: true }),
      reduced: true,
      winceStart: -1,
      gaspStart: -1,
      clutchStart: -1,
    });
    expect(signals.motion_tremor).toBe(0);
    expect(signals.motion_agitation).toBe(0);
    expect(signals.motion_seizure).toBeGreaterThan(0);
  });

  it('keeps tremor and shivering in a clinically subtle morph range', () => {
    const tremor = computePatientMotionSignals({
      time: 0.03125,
      gate: 1,
      cues: cues({ tremor: true }),
      reduced: false,
      winceStart: -1,
      gaspStart: -1,
      clutchStart: -1,
    });
    const shiver = computePatientMotionSignals({
      time: 0.025,
      gate: 1,
      cues: cues({ shivering: true }),
      reduced: false,
      winceStart: -1,
      gaspStart: -1,
      clutchStart: -1,
    });
    expect(tremor.motion_tremor).toBeLessThanOrEqual(0.18);
    expect(shiver.motion_tremor).toBeLessThanOrEqual(0.12);
  });

  it('keeps agitation subtle enough to preserve a braced clinical posture', () => {
    const signals = computePatientMotionSignals({
      time: 1.5625,
      gate: 1,
      cues: cues({ agitated: true }),
      reduced: false,
      winceStart: -1,
      gaspStart: -1,
      clutchStart: -1,
    });

    expect(signals.motion_agitation).toBeGreaterThan(0);
    expect(signals.motion_agitation).toBeLessThanOrEqual(0.08);
  });

  it('does not layer agitation on top of a gasping respiratory patient', () => {
    const signals = computePatientMotionSignals({
      time: 1.5625,
      gate: 1,
      cues: cues({ agitated: true, gasping: true }),
      reduced: false,
      winceStart: -1,
      gaspStart: -1,
      clutchStart: -1,
    });
    expect(signals.motion_agitation).toBe(0);
  });
});
