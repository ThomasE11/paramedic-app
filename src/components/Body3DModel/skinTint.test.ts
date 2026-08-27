import { describe, it, expect } from 'vitest';
import { deriveSkinTint, deriveCyanosisLocalStrength } from './skinTint';
import { isCyanoticLipVertex, isCyanoticNailVertex } from './MottlingLayer';

describe('skinTint functions', () => {
  describe('deriveSkinTint', () => {
    it('returns null when no jaundice, shock, or scenario pallor present', () => {
      const tint = deriveSkinTint({ vitals: { spo2: 94, pulse: 75, bp: '120/80' } });
      expect(tint).toBeNull();
    });

    it('returns pale tint when shock index > 0.8', () => {
      const tint = deriveSkinTint({ vitals: { pulse: 120, bp: '100/70' } });
      expect(tint).not.toBeNull();
    });
  });

  describe('deriveCyanosisLocalStrength', () => {
    it('returns 0 when SpO2 >= 94', () => {
      expect(deriveCyanosisLocalStrength({ spo2: 94 })).toBe(0);
      expect(deriveCyanosisLocalStrength({ spo2: 98 })).toBe(0);
    });

    it('deepens cyanosis progressively between SpO2 94 and 85', () => {
      expect(deriveCyanosisLocalStrength({ spo2: 93 })).toBeCloseTo(0.078, 2);
      expect(deriveCyanosisLocalStrength({ spo2: 88 })).toBeCloseTo(0.467, 2);
      expect(deriveCyanosisLocalStrength({ spo2: 85 })).toBe(0.7);
    });

    it('progresses to a capped 0.9 strength below SpO2 85', () => {
      expect(deriveCyanosisLocalStrength({ spo2: 83 })).toBeCloseTo(0.78, 2);
      expect(deriveCyanosisLocalStrength({ spo2: 80 })).toBeCloseTo(0.9);
      expect(deriveCyanosisLocalStrength({ spo2: 70 })).toBe(0.9);
    });

    it('uses live SpO2 over scenario cyanosis', () => {
      expect(deriveCyanosisLocalStrength({ spo2: 96 }, null, 0.8)).toBe(0);
    });
  });
});

describe('cyanosis vertex predicates', () => {
  describe('isCyanoticLipVertex', () => {
    it('matches lip band measured from patient-male.glb', () => {
      expect(isCyanoticLipVertex(0, 1.57, 0.16)).toBe(true);
      expect(isCyanoticLipVertex(0.05, 1.58, 0.15)).toBe(true);
      expect(isCyanoticLipVertex(0.06, 1.57, 0.16)).toBe(false);
      expect(isCyanoticLipVertex(0, 1.55, 0.16)).toBe(false);
      expect(isCyanoticLipVertex(0, 1.60, 0.16)).toBe(false);
      expect(isCyanoticLipVertex(0, 1.57, 0.07)).toBe(false);
    });
  });

  describe('isCyanoticNailVertex', () => {
    it('matches nail band measured from patient-male.glb', () => {
      expect(isCyanoticNailVertex(0.12, 0.79, 0.20)).toBe(true);
      expect(isCyanoticNailVertex(0.21, 0.82, 0.20)).toBe(true);
      expect(isCyanoticNailVertex(0.07, 0.79, 0.20)).toBe(false);
      expect(isCyanoticNailVertex(0.23, 0.79, 0.20)).toBe(false);
      expect(isCyanoticNailVertex(0.12, 0.74, 0.20)).toBe(false);
      expect(isCyanoticNailVertex(0.12, 0.86, 0.20)).toBe(false);
      expect(isCyanoticNailVertex(0.12, 0.79, 0.07)).toBe(false);
    });
  });
});
