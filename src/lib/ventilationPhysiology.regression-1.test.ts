import { describe, expect, it } from 'vitest';
import {
  estimatedBvmTidalVolumeLitres,
  projectedEtco2Target,
  targetMinuteVentilationLitres,
} from './ventilationPhysiology';

describe('weight-scaled BVM ventilation regression', () => {
  it('does not deliver a fixed 250 mL breath to infants and newborns', () => {
    expect(estimatedBvmTidalVolumeLitres(3.5)).toBeCloseTo(0.0245);
    expect(estimatedBvmTidalVolumeLitres(8)).toBeCloseTo(0.056);
    expect(estimatedBvmTidalVolumeLitres(20)).toBeCloseTo(0.14);
    expect(estimatedBvmTidalVolumeLitres(70)).toBeCloseTo(0.49);
  });

  it('keeps age-appropriate starting rates near normal simulated EtCO2', () => {
    const examples = [
      { weight: 3.5, rate: 50 },
      { weight: 20, rate: 20 },
      { weight: 70, rate: 12 },
    ];

    for (const { weight, rate } of examples) {
      const minuteVentilation = estimatedBvmTidalVolumeLitres(weight) * rate;
      expect(projectedEtco2Target(
        minuteVentilation,
        targetMinuteVentilationLitres(weight),
      )).toBe(40);
    }
  });

  it('still exposes clinically meaningful over- and under-ventilation', () => {
    expect(projectedEtco2Target(12, 6)).toBe(25);
    expect(projectedEtco2Target(2, 6)).toBe(60);
  });
});
