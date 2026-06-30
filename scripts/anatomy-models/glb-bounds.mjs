// Compute real AABBs even when positions are stored as i16_norm
// (gltf-transform optimize quantizes positions into [-1, 1] range and
// stashes the inverse scale on the node transform). We need to read
// the node-level scale + translation to recover world bounds.
//
// Usage: node glb-bounds2.mjs <one-or-more.glb>
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

// Walk a node + apply its world transform to each position vert.
function visitNode(node, parentMatrix, callback) {
  const local = node.getMatrix(); // local matrix (T * R * S)
  const world = multiplyMatrix(parentMatrix, local);
  const mesh = node.getMesh();
  if (mesh) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION');
      if (!pos) continue;
      const arr = pos.getArray();
      const normalized = pos.getNormalized();
      const stride = pos.getElementSize();
      // For normalized i16, each value v in [-32768, 32767] maps to
      // v / 32767 in [-1, 1]. The node's scale then maps that to
      // world-space.
      const denom = normalized ? 32767 : 1;
      for (let i = 0; i < arr.length; i += stride) {
        const lx = arr[i] / denom;
        const ly = arr[i + 1] / denom;
        const lz = arr[i + 2] / denom;
        const wx = world[0] * lx + world[4] * ly + world[8] * lz + world[12];
        const wy = world[1] * lx + world[5] * ly + world[9] * lz + world[13];
        const wz = world[2] * lx + world[6] * ly + world[10] * lz + world[14];
        callback(wx, wy, wz);
      }
    }
  }
  for (const child of node.listChildren()) visitNode(child, world, callback);
}

function multiplyMatrix(a, b) {
  const out = new Array(16).fill(0);
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      for (let k = 0; k < 4; k++) {
        out[i + j * 4] += a[i + k * 4] * b[k + j * 4];
      }
    }
  }
  return out;
}

const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

for (const path of process.argv.slice(2)) {
  const doc = await io.read(path);
  let xMin = Infinity, yMin = Infinity, zMin = Infinity;
  let xMax = -Infinity, yMax = -Infinity, zMax = -Infinity;
  for (const scene of doc.getRoot().listScenes()) {
    for (const node of scene.listChildren()) {
      visitNode(node, identity, (x, y, z) => {
        if (x < xMin) xMin = x; if (x > xMax) xMax = x;
        if (y < yMin) yMin = y; if (y > yMax) yMax = y;
        if (z < zMin) zMin = z; if (z > zMax) zMax = z;
      });
    }
  }
  console.log(path);
  console.log(`  X: [${xMin.toFixed(3)}, ${xMax.toFixed(3)}]  width  ${(xMax - xMin).toFixed(3)}`);
  console.log(`  Y: [${yMin.toFixed(3)}, ${yMax.toFixed(3)}]  height ${(yMax - yMin).toFixed(3)}`);
  console.log(`  Z: [${zMin.toFixed(3)}, ${zMax.toFixed(3)}]  depth  ${(zMax - zMin).toFixed(3)}`);
}
