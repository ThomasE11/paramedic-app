import * as THREE from 'three';

/** The Blender iris is an unwrapped-free NGON. Supply disc UVs on a clone,
 * otherwise the detailed iris map samples one texel and looks uniformly flat.
 * Project in its own plane: the authored gaze is baked into the vertices. */
export function withIrisSurfaceUv(source: THREE.BufferGeometry): THREE.BufferGeometry {
  const geometry = source.clone();
  const positions = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');
  if (!positions || !normals) return geometry;
  const normal = new THREE.Vector3().fromBufferAttribute(normals, 0).normalize();
  const tangent = new THREE.Vector3(0, 1, 0).cross(normal).normalize();
  if (tangent.lengthSq() < .5) tangent.set(1, 0, 0).cross(normal).normalize();
  const bitangent = normal.clone().cross(tangent).normalize();
  const point = new THREE.Vector3();
  const coordinates: [number, number][] = [];
  for (let i = 0; i < positions.count; i++) {
    point.fromBufferAttribute(positions, i);
    coordinates.push([point.dot(tangent), point.dot(bitangent)]);
  }
  const minU = Math.min(...coordinates.map(p => p[0]));
  const maxU = Math.max(...coordinates.map(p => p[0]));
  const minV = Math.min(...coordinates.map(p => p[1]));
  const maxV = Math.max(...coordinates.map(p => p[1]));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(coordinates.flatMap(([u, v]) => [
    (u - minU) / Math.max(maxU - minU, 1e-8),
    (v - minV) / Math.max(maxV - minV, 1e-8),
  ]), 2));
  return geometry;
}
