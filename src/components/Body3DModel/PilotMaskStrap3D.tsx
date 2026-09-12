import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { Point3 } from './pilotRespiratoryMaskGeometry';

const DEFAULT_WIDTH = 0.006;
const DEFAULT_THICKNESS = 0.0008;
const STRAP_SEGMENTS = 32;
const RING_VERTEX_COUNT = 4;
const POINT_EPSILON_SQUARED = 1e-12;
const AXIS_EPSILON_SQUARED = 1e-12;
const NO_RAYCAST = () => null;

const GLOBAL_UP = new THREE.Vector3(0, 1, 0);
const GLOBAL_RIGHT = new THREE.Vector3(1, 0, 0);
const GLOBAL_FORWARD = new THREE.Vector3(0, 0, 1);

export interface PilotMaskStrap3DProps {
  points: Point3[];
  width?: number;
  thickness?: number;
  color?: THREE.ColorRepresentation;
  name?: string;
}

function stablePerpendicular(tangent: THREE.Vector3, target: THREE.Vector3): THREE.Vector3 {
  const candidates = [GLOBAL_UP, GLOBAL_RIGHT, GLOBAL_FORWARD];

  for (const candidate of candidates) {
    target.copy(candidate).addScaledVector(tangent, -candidate.dot(tangent));
    if (target.lengthSq() > AXIS_EPSILON_SQUARED) return target.normalize();
  }

  // A finite unit tangent must have a usable perpendicular among the axes above.
  throw new RangeError('Pilot mask strap could not construct a stable cross-section frame.');
}

/**
 * Builds an indexed, rectangular elastic ribbon around an open centripetal spline.
 *
 * Consecutive coincident control points are collapsed before interpolation. Invalid
 * dimensions, non-finite coordinates, or fewer than two distinct points throw a
 * RangeError rather than returning a partially valid geometry.
 */
export function createPilotMaskStrapGeometry(
  points: Point3[],
  width = DEFAULT_WIDTH,
  thickness = DEFAULT_THICKNESS,
): THREE.BufferGeometry {
  if (!Number.isFinite(width) || width <= 0) {
    throw new RangeError('Pilot mask strap width must be a positive finite number.');
  }
  if (!Number.isFinite(thickness) || thickness <= 0) {
    throw new RangeError('Pilot mask strap thickness must be a positive finite number.');
  }
  if (points.length < 2) {
    throw new RangeError('Pilot mask strap requires at least two distinct points.');
  }

  const controlPoints: THREE.Vector3[] = [];
  const distinctPoints: THREE.Vector3[] = [];

  points.forEach((point) => {
    if (point.length !== 3 || point.some(coordinate => !Number.isFinite(coordinate))) {
      throw new RangeError('Pilot mask strap points must contain three finite coordinates.');
    }

    const vector = new THREE.Vector3(point[0], point[1], point[2]);
    if (!controlPoints.length || controlPoints.at(-1)!.distanceToSquared(vector) > POINT_EPSILON_SQUARED) {
      controlPoints.push(vector);
    }
    if (!distinctPoints.some(existing => existing.distanceToSquared(vector) <= POINT_EPSILON_SQUARED)) {
      distinctPoints.push(vector);
    }
  });

  if (distinctPoints.length < 2 || controlPoints.length < 2) {
    throw new RangeError('Pilot mask strap requires at least two distinct points.');
  }

  const curve = new THREE.CatmullRomCurve3(controlPoints, false, 'centripetal');
  const halfWidth = width / 2;
  const halfThickness = thickness / 2;
  const positions: number[] = [];
  const indices: number[] = [];
  const previousWidthAxis = new THREE.Vector3();
  const widthAxis = new THREE.Vector3();
  const thicknessAxis = new THREE.Vector3();

  for (let ring = 0; ring <= STRAP_SEGMENTS; ring += 1) {
    const t = ring / STRAP_SEGMENTS;
    const centre = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();

    if (!Number.isFinite(tangent.x + tangent.y + tangent.z) || tangent.lengthSq() < AXIS_EPSILON_SQUARED) {
      throw new RangeError('Pilot mask strap path contains a degenerate tangent.');
    }

    if (ring === 0) {
      stablePerpendicular(tangent, widthAxis);
    } else {
      // Projecting the previous width axis onto the next normal plane is a
      // rotation-minimising transport for this gently curving head strap.
      widthAxis.copy(previousWidthAxis).addScaledVector(tangent, -previousWidthAxis.dot(tangent));
      if (widthAxis.lengthSq() <= AXIS_EPSILON_SQUARED) {
        stablePerpendicular(tangent, widthAxis);
      } else {
        widthAxis.normalize();
      }
      if (widthAxis.dot(previousWidthAxis) < 0) widthAxis.negate();
    }

    thicknessAxis.crossVectors(tangent, widthAxis).normalize();
    previousWidthAxis.copy(widthAxis);

    // Deterministic rectangular ring: +W/+T, -W/+T, -W/-T, +W/-T.
    const corners: ReadonlyArray<readonly [number, number]> = [
      [halfWidth, halfThickness],
      [-halfWidth, halfThickness],
      [-halfWidth, -halfThickness],
      [halfWidth, -halfThickness],
    ];
    corners.forEach(([widthOffset, thicknessOffset]) => {
      positions.push(
        centre.x + widthAxis.x * widthOffset + thicknessAxis.x * thicknessOffset,
        centre.y + widthAxis.y * widthOffset + thicknessAxis.y * thicknessOffset,
        centre.z + widthAxis.z * widthOffset + thicknessAxis.z * thicknessOffset,
      );
    });
  }

  for (let segment = 0; segment < STRAP_SEGMENTS; segment += 1) {
    const current = segment * RING_VERTEX_COUNT;
    const next = current + RING_VERTEX_COUNT;
    for (let edge = 0; edge < RING_VERTEX_COUNT; edge += 1) {
      const followingEdge = (edge + 1) % RING_VERTEX_COUNT;
      indices.push(
        current + edge, current + followingEdge, next + edge,
        next + edge, current + followingEdge, next + followingEdge,
      );
    }
  }

  const end = STRAP_SEGMENTS * RING_VERTEX_COUNT;
  indices.push(0, 2, 1, 0, 3, 2);
  indices.push(end, end + 1, end + 2, end, end + 2, end + 3);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

export function PilotMaskStrap3D({
  points,
  width = DEFAULT_WIDTH,
  thickness = DEFAULT_THICKNESS,
  color = '#2f6a58',
  name = 'pilot-mask-elastic-strap',
}: PilotMaskStrap3DProps) {
  const pointsKey = points.map(point => point.join(',')).join('|');
  const geometry = useMemo(
    () => createPilotMaskStrapGeometry(points, width, thickness),
    // The scalar key invalidates memoization when a caller recreates or mutates
    // the small point array without forcing geometry churn on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pointsKey, thickness, width],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh name={name} geometry={geometry} raycast={NO_RAYCAST} userData={{ skipRecolor: true }}>
      <meshStandardMaterial color={color} roughness={0.96} metalness={0} flatShading />
    </mesh>
  );
}
