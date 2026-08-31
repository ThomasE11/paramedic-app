import { describe, expect, it } from 'vitest';

import { fallbackSpeechMouthTarget } from './useVoiceNarration';

// Regression: ISSUE-016 — browser-fallback patient speech left the mouth frozen
// Found by /qa on 2026-09-01
// Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-08-30.md
describe('fallback SpeechSynthesis lip movement', () => {
  it('produces a bounded, varied speech envelope with frequent closures', () => {
    const samples = Array.from({ length: 201 }, (_, index) =>
      fallbackSpeechMouthTarget(index / 200),
    );

    expect(samples.every(Number.isFinite)).toBe(true);
    expect(Math.min(...samples)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...samples)).toBeLessThanOrEqual(0.7);
    expect(Math.max(...samples) - Math.min(...samples)).toBeGreaterThan(0.45);
    expect(samples.filter((value) => value < 0.08).length).toBeGreaterThan(35);
    expect(samples.filter((value) => value > 0.45).length).toBeGreaterThan(10);
  });

  it('is deterministic and sanitises invalid time values', () => {
    expect(fallbackSpeechMouthTarget(0.42)).toBe(fallbackSpeechMouthTarget(0.42));
    expect(fallbackSpeechMouthTarget(-1)).toBe(fallbackSpeechMouthTarget(0));
    expect(fallbackSpeechMouthTarget(Number.NaN)).toBe(fallbackSpeechMouthTarget(0));
    expect(fallbackSpeechMouthTarget(Number.POSITIVE_INFINITY)).toBe(
      fallbackSpeechMouthTarget(0),
    );
  });
});
