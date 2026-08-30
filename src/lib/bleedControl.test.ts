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

  it('normalises a lateral chest-seal site to the chest wound region', () => {
    const controls = ['chest_seal_vented', 'site:chest_seal_vented:left-chest'];

    expect(isBleedRegionControlled(controls, 'chest')).toBe(true);
    expect(isBleedRegionControlled(controls, 'right-arm')).toBe(false);
  });
});
