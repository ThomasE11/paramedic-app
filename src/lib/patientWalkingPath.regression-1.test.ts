import { describe, expect, it } from 'vitest';
import { patientWalkingPath } from './patientWalkingPath';

describe('walking scene path', () => {
  it('faces the direction of travel on both straight passes and both turns', () => {
    for (let time = .02; time < 18; time += .03) {
      const here = patientWalkingPath(time);
      const next = patientWalkingPath(time + .001);
      const dx = next.x - here.x;
      const dz = next.z - here.z;
      const speed = Math.hypot(dx, dz) / .001;
      expect(speed).toBeCloseTo(.42, 3);
      expect((dx * Math.sin(here.yaw) + dz * Math.cos(here.yaw)) / Math.hypot(dx, dz)).toBeGreaterThan(.999);
      expect(here.x).toBeGreaterThanOrEqual(0);
      expect(here.x).toBeLessThanOrEqual(.48);
      expect(here.z).toBeGreaterThanOrEqual(-.24);
      expect(here.z).toBeLessThanOrEqual(1.34);
    }
  });
  it('makes actual forward progress and handles invalid time without snapping', () => {
    expect(patientWalkingPath(2).z).toBeCloseTo(.84);
    expect(patientWalkingPath(Number.NaN)).toEqual(patientWalkingPath(0));
    expect(patientWalkingPath(-10)).toEqual(patientWalkingPath(0));
    const duration = 2 * (1.1 + Math.PI * .24) / .42;
    expect(patientWalkingPath(duration).x).toBeCloseTo(0);
    expect(patientWalkingPath(duration).z).toBeCloseTo(0);
  });
});
