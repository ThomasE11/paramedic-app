import { expect, it } from 'vitest';
import * as THREE from 'three';
import { withIrisSurfaceUv } from './irisSurface';

it('unwraps a tilted iris without changing the shared eye geometry', () => {
  const source = new THREE.CircleGeometry(.006, 24).rotateX(.4);
  source.deleteAttribute('uv');
  const result = withIrisSurfaceUv(source);
  expect(source.getAttribute('uv')).toBeUndefined();
  expect(result.getAttribute('position').array).toEqual(source.getAttribute('position').array);
  expect(result.getAttribute('normal').array).toEqual(source.getAttribute('normal').array);
  expect(result.index!.array).toEqual(source.index!.array);
  const uv = result.getAttribute('uv');
  expect(uv.getX(0)).toBeCloseTo(.5);
  expect(uv.getY(0)).toBeCloseTo(.5);
  expect(Math.min(...uv.array)).toBeCloseTo(0);
  expect(Math.max(...uv.array)).toBeCloseTo(1);
  result.dispose(); source.dispose();
});
