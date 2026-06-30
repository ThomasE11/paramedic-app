// Strip non-body meshes from the MPFB GLB so the BodyMesh skin-tint
// pass doesn't accidentally recolor hair or clothing. Keeps only the
// "base" body and its high-poly subdivision; drops eyebrows, eyelashes,
// ponytail, female_casualsuit, teeth, tongue (teeth/tongue are inside
// the mouth and won't ever render visibly anyway, but they bulk the
// file slightly so we drop them too).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const KEEP_MESHES = new Set(['base', 'high-poly']);

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const inPath = process.argv[2];
const outPath = process.argv[3];
if (!inPath || !outPath) {
  console.error('usage: node strip-glb.mjs <in.glb> <out.glb>');
  process.exit(1);
}

const doc = await io.read(inPath);
const root = doc.getRoot();

// Detach nodes whose mesh name we want to drop.
const nodes = root.listNodes();
let droppedCount = 0;
for (const node of nodes) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const name = mesh.getName();
  if (!KEEP_MESHES.has(name)) {
    node.dispose();
    droppedCount++;
    continue;
  }
}

// Run prune to garbage-collect orphaned meshes, accessors, textures, etc.
const { prune } = await import('@gltf-transform/functions');
await doc.transform(prune({ keepAttributes: true, keepLeaves: false }));

await io.write(outPath, doc);
console.log(`stripped ${droppedCount} nodes; kept: ${[...KEEP_MESHES].join(', ')}`);
