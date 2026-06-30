// List every named node in a GLB. We're hunting for Mixamo skeleton
// bones (`mixamorig:Head`, `mixamorig:LeftArm`, etc.) — if they exist
// the existing bone-based hit-test in BodyMesh.tsx works without any
// retuning. If they don't, we either rename them or fall back to the
// Y-range table.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

for (const path of process.argv.slice(2)) {
  console.log(`\n=== ${path} ===`);
  const doc = await io.read(path);
  const root = doc.getRoot();
  const skins = root.listSkins();
  console.log(`skins: ${skins.length}`);
  for (const skin of skins) {
    const joints = skin.listJoints();
    console.log(`  skin "${skin.getName() || '(unnamed)'}" — ${joints.length} joints`);
    const sample = joints.slice(0, 30).map(j => j.getName()).join(', ');
    console.log(`    first 30 joints: ${sample}`);
  }
  // Also enumerate all named nodes
  const names = root.listNodes().map(n => n.getName()).filter(Boolean);
  const mixamoHits = names.filter(n => /mixamo/i.test(n));
  console.log(`  total named nodes: ${names.length}`);
  console.log(`  mixamo* matches: ${mixamoHits.length}`);
  if (mixamoHits.length > 0) {
    console.log(`    sample: ${mixamoHits.slice(0, 10).join(', ')}`);
  } else if (names.length > 0) {
    console.log(`    first 15 node names (non-mixamo): ${names.slice(0, 15).join(', ')}`);
  }
}
