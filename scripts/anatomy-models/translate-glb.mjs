// Translate a GLB along Y so the lowest vertex sits at Y=0. The MPFB
// export has origin at the hip (Y ∈ [-0.92, 1.0]); the rest of the
// app + the legacy patient.glb assume feet-on-the-ground (Y starts
// at 0). Shifting up by `|yMin|` lines everything up: ContactShadows
// at Y=-0.01 land on the feet, the orbit-controls auto-target lands
// at chest height, and the Y-range hit-test fallback uses comparable
// numbers across all meshes.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

const inPath = process.argv[2];
const outPath = process.argv[3];
if (!inPath || !outPath) {
  console.error('usage: node translate-glb.mjs <in.glb> <out.glb>');
  process.exit(1);
}

const doc = await io.read(inPath);
const root = doc.getRoot();

// Compute world-space Y minimum by sampling every vertex through its
// node chain. This is intentionally a separate pass from the rewrite
// below — we need a stable number before mutating anything.
function visitNode(node, parentMatrix, callback) {
  const local = node.getMatrix();
  const world = multiplyMatrix(parentMatrix, local);
  const mesh = node.getMesh();
  if (mesh) {
    for (const prim of mesh.listPrimitives()) {
      const pos = prim.getAttribute('POSITION');
      if (!pos) continue;
      const arr = pos.getArray();
      const normalized = pos.getNormalized();
      const stride = pos.getElementSize();
      const denom = normalized ? 32767 : 1;
      for (let i = 0; i < arr.length; i += stride) {
        const lx = arr[i] / denom;
        const ly = arr[i + 1] / denom;
        const lz = arr[i + 2] / denom;
        const wy = world[1] * lx + world[5] * ly + world[9] * lz + world[13];
        callback(wy);
      }
    }
  }
  for (const child of node.listChildren()) visitNode(child, world, callback);
}
function multiplyMatrix(a, b) {
  const out = new Array(16).fill(0);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++)
      for (let k = 0; k < 4; k++) out[i + j * 4] += a[i + k * 4] * b[k + j * 4];
  return out;
}
const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

let yMin = Infinity;
for (const scene of root.listScenes()) {
  for (const node of scene.listChildren()) {
    visitNode(node, identity, (y) => { if (y < yMin) yMin = y; });
  }
}
const shift = -yMin; // amount to add to Y so the lowest point becomes 0
console.log(`yMin=${yMin.toFixed(3)} — shifting all root nodes by Y+${shift.toFixed(3)}`);

// Apply the translation at the scene-root level. Each top-level node's
// translation gets `shift` added to its Y component. This lifts the
// entire scene without touching mesh data (the gltf-transform optimize
// pass left positions as i16_norm, which we don't want to re-quantize).
for (const scene of root.listScenes()) {
  for (const node of scene.listChildren()) {
    const t = node.getTranslation();
    node.setTranslation([t[0], t[1] + shift, t[2]]);
  }
}

await io.write(outPath, doc);
console.log(`wrote ${outPath}`);
