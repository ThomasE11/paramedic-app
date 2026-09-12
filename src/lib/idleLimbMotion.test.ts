import { describe, expect, it } from 'vitest';
import {
  accessoryLiftAmplitude,
  computeIdleLimbMotion,
  createIdleLimbMotion,
} from './idleLimbMotion';

const run = (input: Partial<Parameters<typeof computeIdleLimbMotion>[0]>) => (
  computeIdleLimbMotion(
    { time: 3, gate: 1, breathPhase01: 0.5, respiratoryRate: 16, ...input },
    createIdleLimbMotion(),
  )
);

describe('accessoryLiftAmplitude', () => {
  it('is silent in apnoea — still shoulders on a still chest is the finding', () => {
    expect(accessoryLiftAmplitude(0)).toBe(0);
  });

  it('stays barely perceptible at a comfortable rate', () => {
    expect(accessoryLiftAmplitude(14)).toBeLessThan(0.004);
  });

  it('recruits progressively as the patient becomes tachypnoeic', () => {
    const quiet = accessoryLiftAmplitude(16);
    const fast = accessoryLiftAmplitude(26);
    const laboured = accessoryLiftAmplitude(36);
    expect(fast).toBeGreaterThan(quiet);
    expect(laboured).toBeGreaterThan(fast);
  });

  it('saturates rather than growing without bound', () => {
    expect(accessoryLiftAmplitude(80)).toBeCloseTo(accessoryLiftAmplitude(34), 6);
  });

  it('lets a scenario show hard work before the rate looks alarming', () => {
    // Severe asthma: rate not yet dramatic, work of breathing obvious.
    const rateOnly = accessoryLiftAmplitude(20);
    const declared = accessoryLiftAmplitude(20, 1);
    expect(declared).toBeGreaterThan(rateOnly);
    expect(declared).toBeCloseTo(accessoryLiftAmplitude(34), 6);
  });

  it('takes the worse of rate and declared effort, never the sum', () => {
    expect(accessoryLiftAmplitude(34, 1)).toBeCloseTo(accessoryLiftAmplitude(34), 6);
  });

  it('keeps apnoea still even when a scenario declares effort', () => {
    expect(accessoryLiftAmplitude(0, 1)).toBe(0);
  });
});

describe('computeIdleLimbMotion', () => {
  it('goes completely still when unconscious', () => {
    const m = run({ gate: 0, respiratoryRate: 30 });
    expect(m.shoulderLift).toBe(0);
    expect(m.leftArmDrift).toBe(0);
    expect(m.rightArmDrift).toBe(0);
    expect(m.leftForeArmDrift).toBe(0);
    expect(m.rightForeArmDrift).toBe(0);
  });

  it('rides the breath: no lift at onset, peak lift mid-cycle', () => {
    const onset = run({ breathPhase01: 0, respiratoryRate: 30 });
    const peak = run({ breathPhase01: 0.5, respiratoryRate: 30 });
    expect(onset.shoulderLift).toBeCloseTo(0, 6);
    expect(peak.shoulderLift).toBeGreaterThan(0);
  });

  it('keeps the clinical signal but drops the garnish when reduced', () => {
    const m = run({ reduced: true, respiratoryRate: 30 });
    expect(m.shoulderLift).toBeGreaterThan(0);
    expect(m.leftArmDrift).toBe(0);
    expect(m.rightArmDrift).toBe(0);
  });

  it('never moves a limb far enough to read as a gesture', () => {
    for (let time = 0; time < 120; time += 0.3) {
      const m = run({ time, breathPhase01: (time % 3) / 3, respiratoryRate: 40 });
      expect(Math.abs(m.shoulderLift)).toBeLessThan(0.02);
      expect(Math.abs(m.leftArmDrift)).toBeLessThan(0.02);
      expect(Math.abs(m.rightForeArmDrift)).toBeLessThan(0.02);
    }
  });

  it('freezes arm garnish on a braced / tripod patient while keeping the shrug', () => {
    const m = run({ braced: true, respiratoryRate: 32, breathingEffort: 1 });
    expect(m.shoulderLift).toBeGreaterThan(0);
    expect(m.leftArmDrift).toBe(0);
    expect(m.rightArmDrift).toBe(0);
    expect(m.leftForeArmDrift).toBe(0);
    expect(m.rightForeArmDrift).toBe(0);
  });

  it('keeps a smaller shrug when the hands are load-bearing', () => {
    const free = run({ respiratoryRate: 32, breathingEffort: 1, breathPhase01: 0.5 });
    const braced = run({ respiratoryRate: 32, breathingEffort: 1, breathPhase01: 0.5, braced: true });
    expect(braced.shoulderLift).toBeGreaterThan(0);
    expect(braced.shoulderLift).toBeLessThan(free.shoulderLift);
  });

  it('drives the two sides out of step so the motion never reads mechanical', () => {
    let sameSign = 0;
    const samples = 200;
    for (let i = 0; i < samples; i++) {
      const m = run({ time: i * 0.4 });
      if (Math.sign(m.leftArmDrift) === Math.sign(m.rightArmDrift)) sameSign++;
    }
    // Independent periods: the sides agree some of the time, never always.
    expect(sameSign).toBeGreaterThan(0);
    expect(sameSign).toBeLessThan(samples);
  });

  it('reuses the caller-owned output object (no per-frame allocation)', () => {
    const out = createIdleLimbMotion();
    const returned = computeIdleLimbMotion(
      { time: 1, gate: 1, breathPhase01: 0.25, respiratoryRate: 20 },
      out,
    );
    expect(returned).toBe(out);
  });
});
