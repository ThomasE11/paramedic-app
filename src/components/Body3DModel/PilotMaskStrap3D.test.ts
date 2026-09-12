import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createPilotMaskStrapGeometry } from './PilotMaskStrap3D';

describe('pilot flat elastic mask harness', () => {
  const points: Array<[number, number, number]> = [
    [-.06, 1.635, .04], [-.085, 1.665, -.08], [.085, 1.665, -.08], [.06, 1.635, .04],
  ];

  it('keeps a rectangular 6mm by 0.8mm profile throughout the head curve', () => {
    const geometry = createPilotMaskStrapGeometry(points);
    const positions = geometry.getAttribute('position');
    expect(positions.count).toBeLessThan(500);
    const ringCount = 33;
    for (let ring = 0; ring < ringCount; ring++) {
      const corners = Array.from({ length: 4 }, (_, i) => new THREE.Vector3().fromBufferAttribute(positions, ring * 4 + i));
      const lengths = corners.flatMap((a, i) => corners.slice(i + 1).map(b => a.distanceTo(b))).sort((a, b) => a - b);
      expect(lengths[0]).toBeCloseTo(.0008, 6);
      expect(lengths[1]).toBeCloseTo(.0008, 6);
      expect(lengths[2]).toBeCloseTo(.006, 6);
      expect(lengths[3]).toBeCloseTo(.006, 6);
    }
    const centroid = (start: number) => {
      const sum = new THREE.Vector3();
      for (let i = 0; i < 4; i++) sum.add(new THREE.Vector3().fromBufferAttribute(positions, start + i));
      return sum.multiplyScalar(.25);
    };
    expect(centroid(0).distanceTo(new THREE.Vector3(...points[0]))).toBeLessThan(1e-6);
    expect(centroid((ringCount - 1) * 4).distanceTo(new THREE.Vector3(...points.at(-1)!))).toBeLessThan(1e-6);
    geometry.dispose();
  });

  it('has finite normals and nondegenerate triangles without a flipped width frame', () => {
    const geometry = createPilotMaskStrapGeometry(points);
    const position = geometry.getAttribute('position');
    const normal = geometry.getAttribute('normal');
    const index = geometry.getIndex()!;
    for (let i = 0; i < normal.count; i++) {
      const n = new THREE.Vector3().fromBufferAttribute(normal, i);
      expect(n.toArray().every(Number.isFinite)).toBe(true);
      expect(n.length()).toBeCloseTo(1, 5);
    }
    for (let i = 0; i < index.count; i += 3) {
      const [a, b, c] = [0, 1, 2].map(offset => new THREE.Vector3().fromBufferAttribute(position, index.getX(i + offset)));
      expect(b.sub(a).cross(c.sub(a)).length()).toBeGreaterThan(1e-9);
    }
    const edges: THREE.Vector3[] = [];
    for (let ring = 0; ring < 33; ring++) {
      const a = new THREE.Vector3().fromBufferAttribute(position, ring * 4);
      const b = new THREE.Vector3().fromBufferAttribute(position, ring * 4 + 1);
      edges.push(b.sub(a).normalize());
    }
    for (let i = 1; i < edges.length; i++) expect(edges[i].dot(edges[i - 1])).toBeGreaterThan(.8);
    geometry.dispose();
  });

  it('collapses duplicate controls and rejects invalid paths and dimensions', () => {
    const geometry = createPilotMaskStrapGeometry([points[0], points[0], points[1]]);
    expect([...geometry.getAttribute('position').array].every(Number.isFinite)).toBe(true);
    geometry.dispose();
    for (const path of [[], [points[0]], [points[0], points[0]], [[NaN, 0, 0], points[1]]]) {
      expect(() => createPilotMaskStrapGeometry(path as Array<[number, number, number]>)).toThrow(RangeError);
    }
    for (const size of [0, -1, Infinity, NaN]) {
      expect(() => createPilotMaskStrapGeometry(points, size)).toThrow(RangeError);
      expect(() => createPilotMaskStrapGeometry(points, .006, size)).toThrow(RangeError);
    }
  });

  it('winds the exterior walls and end caps outward', () => {
    const geometry = createPilotMaskStrapGeometry([[0,0,0],[1,0,0]]);
    const position = geometry.getAttribute('position'), index = geometry.getIndex()!;
    for(let i=0;i<index.count;i+=3) {
      const [a,b,c] = [0,1,2].map(j => new THREE.Vector3().fromBufferAttribute(position,index.getX(i+j)));
      const centre = a.clone().add(b).add(c).divideScalar(3);
      const outward = i<32*24 ? new THREE.Vector3(0,centre.y,centre.z) : new THREE.Vector3(centre.x<.5?-1:1,0,0);
      expect(b.sub(a).cross(c.sub(a)).dot(outward)).toBeGreaterThan(0);
    }
    geometry.dispose();
  });
});
