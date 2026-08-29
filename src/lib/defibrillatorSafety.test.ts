import { describe, expect, it } from 'vitest';
import { hasAttachedDefibrillatorPads } from '@/lib/defibrillatorSafety';

describe('defibrillator safety', () => {
  it('requires a completed pad-placement treatment', () => {
    expect(hasAttachedDefibrillatorPads([])).toBe(false);
    expect(hasAttachedDefibrillatorPads(['defibrillation'])).toBe(false);
    expect(hasAttachedDefibrillatorPads(['monitor_pads'])).toBe(true);
    expect(hasAttachedDefibrillatorPads(['aed'])).toBe(true);
  });

  it('ignores unrelated equipment and site tokens', () => {
    expect(hasAttachedDefibrillatorPads(['oxygen_mask', 'site:iv_access:left-arm'])).toBe(false);
  });
});
