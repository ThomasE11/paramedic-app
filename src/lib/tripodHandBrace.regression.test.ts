import { describe, expect, it } from 'vitest';
import { tripodHandBraceSweep, TRIPOD_BRACE_CALIBRATION } from './tripodHandBrace';

describe('reference adult tripod hand brace', () => {
  it('uses mirrored bounded forearm rotation instead of bending the elbow backwards', () => {
    expect(tripodHandBraceSweep(true, 'tripod', 'left')).toBe(-0.15);
    expect(tripodHandBraceSweep(true, 'tripod', 'right')).toBe(0.15);
  });
  it('leaves other cases and non-tripod postures unchanged', () => {
    expect(tripodHandBraceSweep(false, 'tripod', 'left')).toBe(0);
    for (const posture of ['seated', 'supine', 'recovery', null] as const) {
      expect(tripodHandBraceSweep(true, posture, 'right')).toBe(0);
    }
  });
  it('pairs stronger forward lean with an upper-arm clearance correction', () => {
    expect(TRIPOD_BRACE_CALIBRATION.spine).toBe(.07);
    expect(TRIPOD_BRACE_CALIBRATION.upperArm).toBe(-.065);
    expect(TRIPOD_BRACE_CALIBRATION.forearm).toBe(.15);
  });
});
