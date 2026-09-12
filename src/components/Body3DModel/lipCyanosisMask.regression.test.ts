import { describe, expect, it } from 'vitest';

import {
  collectContinuousLipUvTriangles,
  lipCyanosisCoverage,
} from './lipCyanosisMask';

class Attribute {
  private readonly values: number[][];
  constructor(values: number[][]) { this.values = values; }
  get count() { return this.values.length; }
  getX(index: number) { return this.values[index][0]; }
  getY(index: number) { return this.values[index][1]; }
  getZ(index: number) { return this.values[index][2]; }
}

class IndexAttribute {
  private readonly values: number[];
  constructor(values: number[]) { this.values = values; }
  get count() { return this.values.length; }
  getX(index: number) { return this.values[index]; }
}

describe('continuous lip cyanosis UV mask', () => {
  it('feathers anatomical coverage and excludes cheek coordinates', () => {
    expect(lipCyanosisCoverage(0, 1.545, 0.15)).toBe(1);
    expect(lipCyanosisCoverage(0.05, 1.537, 0.125)).toBeGreaterThan(0);
    expect(lipCyanosisCoverage(0.05, 1.537, 0.125)).toBeLessThan(1);
    expect(lipCyanosisCoverage(0.06, 1.545, 0.15)).toBe(0);
    expect(lipCyanosisCoverage(0, 1.57, 0.15)).toBe(0);
  });

  it('fills connected lip faces but rejects a mouth-corner face entering the cheek', () => {
    const position = new Attribute([
      [-0.025, 1.542, 0.145],
      [0.025, 1.542, 0.145],
      [-0.025, 1.548, 0.145],
      [0.025, 1.548, 0.145],
      [0.075, 1.548, 0.14],
    ]);
    const uv = new Attribute([
      [0.84, 0.51],
      [0.86, 0.51],
      [0.84, 0.53],
      [0.86, 0.53],
      [0.88, 0.53],
    ]);
    const index = new IndexAttribute([
      0, 1, 2,
      2, 1, 3,
      1, 4, 3,
    ]);

    const triangles = collectContinuousLipUvTriangles(position, uv, index);

    expect(triangles).toHaveLength(2);
    expect(triangles.every(triangle => triangle.coverage > 0)).toBe(true);
    expect(triangles.flatMap(triangle => triangle.points)).not.toContainEqual([0.88, 0.53]);
  });

  it('rejects UV seam bridges instead of painting across unrelated atlas islands', () => {
    const position = new Attribute([
      [-0.02, 1.545, 0.145],
      [0, 1.545, 0.145],
      [0.02, 1.545, 0.145],
    ]);
    const uv = new Attribute([
      [0.02, 0.5],
      [0.98, 0.5],
      [0.99, 0.52],
    ]);

    expect(collectContinuousLipUvTriangles(position, uv)).toEqual([]);
  });
});
