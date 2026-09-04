import { describe, expect, it } from 'vitest';
import { cameraOrbitSafetyForEnvironment } from './cameraOrbitSafety';

describe('cameraOrbitSafetyForEnvironment', () => {
  it('keeps clinic and home cameras on the open, patient-facing side of walls', () => {
    const clinic = cameraOrbitSafetyForEnvironment('clinic');
    const home = cameraOrbitSafetyForEnvironment('home');

    expect(clinic.minAzimuthAngle).toBe(-Math.PI / 6);
    expect(clinic.maxAzimuthAngle).toBe(Math.PI / 6);
    expect(clinic.maxDistance * Math.sin(clinic.maxAzimuthAngle)).toBeLessThan(2.05);

    expect(home.minAzimuthAngle).toBe(-Math.PI / 4);
    expect(home.maxAzimuthAngle).toBe(Math.PI / 4);
    expect(home.maxDistance * Math.sin(home.maxAzimuthAngle)).toBeLessThan(3.25);
  });

  it('leaves outdoor incident scenes unrestricted', () => {
    for (const variant of ['roadside', 'industrial', 'fire', 'water', 'heat'] as const) {
      const safety = cameraOrbitSafetyForEnvironment(variant);
      expect(safety.minAzimuthAngle).toBe(-Infinity);
      expect(safety.maxAzimuthAngle).toBe(Infinity);
      expect(safety.maxDistance).toBe(7);
    }
  });
});
