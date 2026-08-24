import { describe, expect, it } from 'vitest';
import { isBleedRegionControlled } from '@/lib/bleedControl';

describe('site-specific bleeding control', () => {
  it('stops only the wound selected for a pressure dressing', () => {
    const controls = ['bleeding_control', 'site:bleeding_control:right-leg'];
    expect(isBleedRegionControlled(controls, 'right-leg')).toBe(true);
    expect(isBleedRegionControlled(controls, 'left-arm')).toBe(false);
  });

  it('does not let a tourniquet control a different limb', () => {
    const controls = ['tourniquet', 'site:tourniquet:left-arm'];
    expect(isBleedRegionControlled(controls, 'left-arm')).toBe(true);
    expect(isBleedRegionControlled(controls, 'left-leg')).toBe(false);
  });

  it('preserves legacy broad controls for existing scenarios', () => {
    expect(isBleedRegionControlled(['pressure_dressing'], 'abdomen')).toBe(true);
  });
});
