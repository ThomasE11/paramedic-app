import { expect, it } from 'vitest';
import { stepPupilLightResponse } from './pupilLightResponse';
const normal = { leftMm: 3, rightMm: 3, leftReaction: 'brisk', rightReaction: 'brisk', note: '', abnormal: false };

it('has latency, smooth matched direct/consensual constriction and slower recovery', () => {
  expect(stepPupilLightResponse([3, 3], normal, true, .1, .016)).toEqual([3, 3]);
  let size: [number, number] = [3, 3];
  for (let i = 0; i < 60; i++) size = stepPupilLightResponse(size, normal, true, i / 60, 1 / 60);
  expect(size[0]).toBeCloseTo(1.8, 1);
  expect(size[0]).toBe(size[1]);
  const recovered = stepPupilLightResponse(size, normal, false, 0, .05);
  expect(recovered[0]).toBeGreaterThan(size[0]);
  expect(recovered[0]).toBeLessThan(2);
  for (let i = 0; i < 240; i++) size = stepPupilLightResponse(size, normal, false, 0, 1 / 60);
  expect(size[0]).toBeCloseTo(3, 2);
});
it('preserves fixed and asymmetric case pupils instead of normalising both eyes', () => {
  const abnormal = { ...normal, leftMm: 6, leftReaction: 'fixed', rightReaction: 'sluggish' };
  const result = stepPupilLightResponse([6, 3], abnormal, true, 1, .05);
  expect(result[0]).toBe(6);
  expect(result[1]).toBeGreaterThan(2.9);
  expect(result[1]).toBeLessThan(3);
});
