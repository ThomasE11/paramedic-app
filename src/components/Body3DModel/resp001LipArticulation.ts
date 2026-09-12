import * as THREE from 'three';

/**
 * Resp-001-only replacement geometry for the shipped `viseme_open` target.
 *
 * This is amplitude-reactive articulation: one measured audio envelope opens
 * the lips through the existing morph slot. It does not claim
 * phoneme, word, or syllable alignment; there is no transcript timing input.
 */
export const RESP001_LIP_ARTICULATION_MORPH = 'viseme_open';

export type Resp001LipSide = -1 | 0 | 1;

const LIP_X_FULL = 0.020;
const LIP_X_OUTER = 0.028;
const LIP_Y_MIN = 1.536;
const LIP_Y_FULL_MIN = 1.538;
const LIP_Y_FULL_MAX = 1.5485;
const LIP_Y_MAX = 1.5515;
const LIP_Z_MIN = 0.138;
const LIP_Z_FULL = 0.145;
const LIP_SPLIT_LOW = 1.5425;
const LIP_SPLIT_HIGH = 1.544;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Relative morph delta in the male Patient mesh's local Three.js frame.
 * Only the measured vermilion moves. Cheek, philtrum, chin, and neck vertices
 * remain exactly at the authored positions.
 */
export function resp001LipArticulationDelta(
  x: number,
  y: number,
  z: number,
  seamSide: Resp001LipSide = 0,
): readonly [x: number, y: number, z: number] {
  const lateral = 1 - smoothstep(LIP_X_FULL, LIP_X_OUTER, Math.abs(x));
  const vertical = smoothstep(LIP_Y_MIN, LIP_Y_FULL_MIN, y)
    * (1 - smoothstep(LIP_Y_FULL_MAX, LIP_Y_MAX, y));
  const anterior = smoothstep(LIP_Z_MIN, LIP_Z_FULL, z);
  const coverage = lateral * vertical * anterior;
  if (coverage <= 0) return [0, 0, 0];

  // A single open/close articulation, not a guessed vowel. Upper vermilion
  // lifts slightly; lower vermilion drops more and recedes a fraction. At full
  // influence the central separation is 5.8 mm, while the chin displacement
  // remains zero. The axis-bugged shipped jaw morph stays disabled for resp-001.
  const upper = seamSide > 0
    ? 1
    : seamSide < 0
      ? 0
      : smoothstep(LIP_SPLIT_LOW, LIP_SPLIT_HIGH, y);
  const yDelta = (-0.0042 + upper * 0.0058) * coverage;
  const zDelta = (-0.0008 + upper * 0.0013) * coverage;
  return [0, yDelta, zDelta];
}

interface EdgeUse {
  a: number;
  b: number;
  count: number;
  thirds: number[];
}

function edgeKey(a: number, b: number): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

function isMouthSeamCandidate(position: THREE.BufferAttribute, index: number): boolean {
  return Math.abs(position.getX(index)) <= LIP_X_OUTER
    && position.getY(index) >= LIP_Y_MIN
    && position.getY(index) <= LIP_Y_MAX
    && position.getZ(index) >= LIP_Z_MIN;
}

function correctedNormalDelta(
  geometry: THREE.BufferGeometry,
  positionDelta: THREE.BufferAttribute,
): THREE.Float32BufferAttribute {
  const sourcePosition = geometry.getAttribute('position');
  const sourceNormal = geometry.getAttribute('normal');
  if (!sourcePosition || !sourceNormal) {
    throw new Error('resp-001 lip articulation requires position and normal attributes');
  }

  // Compare topology-derived normals before/after the corrected deformation.
  // Subtracting the authored normal directly would introduce a full-body delta
  // when Blender's custom smoothing differs from computeVertexNormals().
  const base = geometry.clone();
  base.morphAttributes = {};
  base.deleteAttribute('normal');
  base.computeVertexNormals();

  const deformed = base.clone();
  const deformedPositions = new Float32Array(sourcePosition.count * 3);
  for (let index = 0; index < sourcePosition.count; index++) {
    const offset = index * 3;
    deformedPositions[offset] = sourcePosition.getX(index) + positionDelta.getX(index);
    deformedPositions[offset + 1] = sourcePosition.getY(index) + positionDelta.getY(index);
    deformedPositions[offset + 2] = sourcePosition.getZ(index) + positionDelta.getZ(index);
  }
  deformed.setAttribute('position', new THREE.Float32BufferAttribute(deformedPositions, 3));
  deformed.deleteAttribute('normal');
  deformed.computeVertexNormals();

  const baseNormal = base.getAttribute('normal');
  const deformedNormal = deformed.getAttribute('normal');
  const deltas = new Float32Array(sourceNormal.count * 3);
  for (let index = 0; index < sourceNormal.count; index++) {
    const offset = index * 3;
    deltas[offset] = deformedNormal.getX(index) - baseNormal.getX(index);
    deltas[offset + 1] = deformedNormal.getY(index) - baseNormal.getY(index);
    deltas[offset + 2] = deformedNormal.getZ(index) - baseNormal.getZ(index);
  }
  return new THREE.Float32BufferAttribute(deltas, 3);
}

/**
 * The MPFB mouth has two coincident but unwelded boundary loops: one belongs
 * to the upper lip, one to the lower. Coordinates alone cannot tell them
 * apart. The adjacent triangle sits above the upper loop and below the lower
 * loop, which gives a stable topology-based classification without changing
 * the model's vertices or indices.
 */
export function classifyResp001LipSeamSides(
  geometry: THREE.BufferGeometry,
): Int8Array {
  const position = geometry.getAttribute('position');
  const index = geometry.getIndex();
  if (!position || position.itemSize !== 3 || !index) {
    throw new Error('resp-001 lip seam classification requires indexed vec3 geometry');
  }

  const edges = new Map<string, EdgeUse>();
  const addEdge = (a: number, b: number, third: number) => {
    const key = edgeKey(a, b);
    const current = edges.get(key);
    if (current) {
      current.count++;
      current.thirds.push(third);
    } else {
      edges.set(key, { a: Math.min(a, b), b: Math.max(a, b), count: 1, thirds: [third] });
    }
  };
  for (let offset = 0; offset + 2 < index.count; offset += 3) {
    const a = Math.round(index.getX(offset));
    const b = Math.round(index.getX(offset + 1));
    const c = Math.round(index.getX(offset + 2));
    addEdge(a, b, c);
    addEdge(b, c, a);
    addEdge(c, a, b);
  }

  const boundary = [...edges.values()].filter(edge => (
    edge.count === 1
    && isMouthSeamCandidate(position as THREE.BufferAttribute, edge.a)
    && isMouthSeamCandidate(position as THREE.BufferAttribute, edge.b)
  ));
  const neighbours = new Map<number, Set<number>>();
  for (const edge of boundary) {
    if (!neighbours.has(edge.a)) neighbours.set(edge.a, new Set());
    if (!neighbours.has(edge.b)) neighbours.set(edge.b, new Set());
    neighbours.get(edge.a)?.add(edge.b);
    neighbours.get(edge.b)?.add(edge.a);
  }

  const components: number[][] = [];
  const remaining = new Set(neighbours.keys());
  while (remaining.size > 0) {
    const seed = remaining.values().next().value as number;
    remaining.delete(seed);
    const component = [seed];
    const stack = [seed];
    while (stack.length > 0) {
      const current = stack.pop() as number;
      for (const neighbour of neighbours.get(current) ?? []) {
        if (!remaining.delete(neighbour)) continue;
        component.push(neighbour);
        stack.push(neighbour);
      }
    }
    components.push(component);
  }

  const scored = components
    .map(vertices => {
      const membership = new Set(vertices);
      const componentEdges = boundary.filter(edge => membership.has(edge.a) && membership.has(edge.b));
      const biases = componentEdges.flatMap(edge => edge.thirds.map(third => (
        position.getY(third) - (position.getY(edge.a) + position.getY(edge.b)) * 0.5
      )));
      const xs = vertices.map(vertex => position.getX(vertex));
      return {
        vertices,
        bias: biases.length > 0 ? biases.reduce((sum, value) => sum + value, 0) / biases.length : 0,
        span: Math.max(...xs) - Math.min(...xs),
      };
    })
    .filter(component => component.vertices.length >= 2 && component.span >= 0.030);

  const upper = scored.reduce<(typeof scored)[number] | null>(
    (best, component) => !best || component.bias > best.bias ? component : best,
    null,
  );
  const lower = scored.reduce<(typeof scored)[number] | null>(
    (best, component) => !best || component.bias < best.bias ? component : best,
    null,
  );
  if (!upper || !lower || upper === lower || upper.bias <= 0 || lower.bias >= 0) {
    throw new Error('resp-001 upper and lower lip boundary loops were not found');
  }

  const sides = new Int8Array(position.count);
  for (const vertex of upper.vertices) sides[vertex] = 1;
  for (const vertex of lower.vertices) sides[vertex] = -1;
  return sides;
}

/**
 * Clone a geometry and replace only its existing `viseme_open` delta without
 * changing topology, UVs, skin attributes, indices, or morph order/name.
 * Keeping the original target slot preserves the existing audio and evidence
 * contract (`viseme_open` influence follows actual patient playback).
 */
export function withResp001LipArticulationMorph(
  source: THREE.BufferGeometry,
  explicitVisemeIndex?: number,
): THREE.BufferGeometry {
  const geometry = source.clone();
  const position = geometry.getAttribute('position');
  if (!position || position.itemSize !== 3) {
    throw new Error('resp-001 lip articulation requires a vec3 position attribute');
  }

  const existing = geometry.morphAttributes.position ?? [];
  if (!geometry.morphTargetsRelative) {
    throw new Error('resp-001 lip articulation requires relative morph targets');
  }
  const visemeIndex = explicitVisemeIndex ?? existing.findIndex(
    attribute => attribute.name === RESP001_LIP_ARTICULATION_MORPH,
  );
  if (!Number.isInteger(visemeIndex) || visemeIndex < 0 || visemeIndex >= existing.length) {
    throw new Error('resp-001 lip articulation requires a valid viseme_open morph index');
  }

  const seamSides = classifyResp001LipSeamSides(geometry);
  const deltas = new Float32Array(position.count * 3);
  for (let index = 0; index < position.count; index++) {
    const [dx, dy, dz] = resp001LipArticulationDelta(
      position.getX(index),
      position.getY(index),
      position.getZ(index),
      seamSides[index] as Resp001LipSide,
    );
    const offset = index * 3;
    deltas[offset] = dx;
    deltas[offset + 1] = dy;
    deltas[offset + 2] = dz;
  }

  const attribute = new THREE.Float32BufferAttribute(deltas, 3);
  // GLTFLoader gets semantic target names from mesh.extras.targetNames and
  // may leave BufferAttribute.name blank. Preserve that source attribute name;
  // the caller's existing morphTargetDictionary remains the name authority.
  attribute.name = existing[visemeIndex]?.name ?? '';
  geometry.morphAttributes.position = existing.map((current, index) => (
    index === visemeIndex ? attribute : current
  ));

  // The shipped target also contains an axis-bugged NORMAL delta. Keeping it
  // after fixing POSITION still makes the static chin/neck relight and bulge.
  // Replace the corresponding normal slot from the corrected deformation.
  const normalMorphs = geometry.morphAttributes.normal;
  if (normalMorphs && visemeIndex < normalMorphs.length) {
    const normalDelta = correctedNormalDelta(geometry, attribute);
    normalDelta.name = normalMorphs[visemeIndex]?.name ?? '';
    geometry.morphAttributes.normal = normalMorphs.map((current, index) => (
      index === visemeIndex ? normalDelta : current
    ));
  }
  return geometry;
}
