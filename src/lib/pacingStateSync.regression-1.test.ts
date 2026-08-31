import { describe, expect, it } from 'vitest';
import { safePacingActive } from './pacingSafety';

describe('synchronised pacing safety regression', () => {
  it('rejects an active pacer state when pads are absent', () => {
    expect(safePacingActive(true, false)).toBe(false);
  });

  it('preserves active pacing only with connected pads', () => {
    expect(safePacingActive(true, true)).toBe(true);
  });

  it('does not turn pacing on merely because pads are attached', () => {
    expect(safePacingActive(false, true)).toBe(false);
    expect(safePacingActive(false, false)).toBe(false);
  });
});
