import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { deriveSkinTint } from './skinTint';

describe('deriveSkinTint', () => {
  it('returns null when SpO2 >= 94 and no other shock/jaundice indicators present', () => {
    const tint = deriveSkinTint({ vitals: { spo2: 94, pulse: 75, bp: '120/80' } });
    expect(tint).toBeNull();
  });

  it('returns dusky tint at SpO2 = 85', () => {
    const tint = deriveSkinTint({ vitals: { spo2: 85, pulse: 110, bp: '130/80' } });
    expect(tint).not.toBeNull();
    expect(tint).toBeInstanceOf(THREE.Color);
    // Should have significant blue/cyan component relative to pure white lerp
    expect(tint!.b).toBeGreaterThan(tint!.r);
  });

  it('returns null at SpO2 = 94 after treatment recovery', () => {
    const tintBefore = deriveSkinTint({ vitals: { spo2: 85, pulse: 120, bp: '130/80' } });
    const tintAfter = deriveSkinTint({ vitals: { spo2: 94, pulse: 90, bp: '120/80' } });
    expect(tintBefore).not.toBeNull();
    expect(tintAfter).toBeNull();
  });

  it('handles scenario cyanosis overrides', () => {
    const tint = deriveSkinTint({ vitals: { spo2: 98 }, scenarioCyanosis: 0.8 });
    expect(tint).not.toBeNull();
    expect(tint!.b).toBeGreaterThan(tint!.r);
  });
});
