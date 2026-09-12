export interface PositionAttributeLike {
  count: number;
  getX(index: number): number;
  getY(index: number): number;
  getZ(index: number): number;
}

export interface UvAttributeLike {
  count: number;
  getX(index: number): number;
  getY(index: number): number;
}

export interface IndexAttributeLike {
  count: number;
  getX(index: number): number;
}

export type LipUvPoint = readonly [u: number, v: number];

export interface LipUvTriangle {
  points: readonly [LipUvPoint, LipUvPoint, LipUvPoint];
  /** Soft anatomical edge coverage, 0..1. */
  coverage: number;
}

const LIP_X_FULL = 0.043;
const LIP_X_OUTER = 0.055;
const LIP_Y_MIN = 1.535;
const LIP_Y_FULL_MIN = 1.54;
const LIP_Y_FULL_MAX = 1.55;
const LIP_Y_MAX = 1.555;
const LIP_Z_MIN = 0.12;
const LIP_Z_FULL = 0.135;
const MAX_LIP_TRIANGLE_UV_EDGE = 0.04;

function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Soft anatomical membership for the male patient's vermilion surface.
 * Geometry coordinates keep the mask on the lips; the feathered inner band
 * prevents the triangle boundary from reading as a painted plate.
 */
export function lipCyanosisCoverage(x: number, y: number, z: number): number {
  const xWeight = 1 - smoothstep(LIP_X_FULL, LIP_X_OUTER, Math.abs(x));
  const yWeight = smoothstep(LIP_Y_MIN, LIP_Y_FULL_MIN, y)
    * (1 - smoothstep(LIP_Y_FULL_MAX, LIP_Y_MAX, y));
  const zWeight = smoothstep(LIP_Z_MIN, LIP_Z_FULL, z);
  return Math.min(1, Math.max(0, xWeight * yWeight * zWeight));
}

function uvEdgeSquared(a: LipUvPoint, b: LipUvPoint): number {
  const du = a[0] - b[0];
  const dv = a[1] - b[1];
  return du * du + dv * dv;
}

/**
 * Converts only fully lip-contained indexed faces into atlas triangles.
 * Requiring all three vertices to carry lip coverage prevents a shared
 * mouth-corner/cheek face from being tinted. The UV-edge guard rejects seam
 * bridges that would otherwise draw a large triangle across another island.
 */
export function collectContinuousLipUvTriangles(
  position: PositionAttributeLike,
  uv: UvAttributeLike,
  index?: IndexAttributeLike | null,
): LipUvTriangle[] {
  const indexCount = index?.count ?? position.count;
  const triangleCount = Math.floor(indexCount / 3);
  const triangles: LipUvTriangle[] = [];
  const maxEdgeSquared = MAX_LIP_TRIANGLE_UV_EDGE ** 2;

  for (let triangle = 0; triangle < triangleCount; triangle++) {
    const offset = triangle * 3;
    const indices = [0, 1, 2].map(vertex => (
      index ? Math.round(index.getX(offset + vertex)) : offset + vertex
    ));
    if (indices.some(vertex => vertex < 0 || vertex >= position.count || vertex >= uv.count)) {
      continue;
    }

    const coverage = indices.map(vertex => lipCyanosisCoverage(
      position.getX(vertex),
      position.getY(vertex),
      position.getZ(vertex),
    ));
    if (coverage.some(value => value <= 0)) continue;

    const points = indices.map(vertex => [uv.getX(vertex), uv.getY(vertex)] as const) as [
      LipUvPoint,
      LipUvPoint,
      LipUvPoint,
    ];
    if (
      uvEdgeSquared(points[0], points[1]) > maxEdgeSquared
      || uvEdgeSquared(points[1], points[2]) > maxEdgeSquared
      || uvEdgeSquared(points[2], points[0]) > maxEdgeSquared
    ) {
      continue;
    }

    // Geometric mean keeps the centre continuous while gently suppressing
    // faces that approach any anatomical boundary.
    const softCoverage = Math.cbrt(coverage[0] * coverage[1] * coverage[2]);
    triangles.push({ points, coverage: softCoverage });
  }

  return triangles;
}
