// Add `mixamorig:` prefix to skeleton joint names in a GLB, in place.
// The Body3DModel hit-test (BodyMesh.tsx → BONE_REGION_MAP) looks up
// bones by `mixamorig:Hips`, `mixamorig:LeftArm`, etc. — the Mixamo
// convention shipped on the legacy patient.glb. RPM + MPFB exports use
// the same logical names without the prefix; renaming brings them
// into the existing weighted-nearest-bone hit-test for free.
//
// We rename only the BONE list (the ~25 anatomical anchors the
// hit-test cares about) plus any node whose name is also one of those
// bones — leaving mesh / scene / texture node names untouched.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const BONES_TO_RENAME = new Set([
  // Head + face + neck
  'HeadTop_End', 'Head', 'LeftEye', 'RightEye', 'Neck',
  // Torso
  'Spine', 'Spine1', 'Spine2', 'Hips',
  // Arms (full chain so the weighted nearest-bone picks the closest
  // segment — Hand wins over ForeArm wins over Arm)
  'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand',
  'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand',
  // Legs
  'LeftUpLeg', 'LeftLeg', 'LeftFoot',
  'RightUpLeg', 'RightLeg', 'RightFoot',
]);

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

const inPath = process.argv[2];
const outPath = process.argv[3];
if (!inPath || !outPath) {
  console.error('usage: node prefix-bones.mjs <in.glb> <out.glb>');
  process.exit(1);
}

const doc = await io.read(inPath);
let renamed = 0;
for (const node of doc.getRoot().listNodes()) {
  const name = node.getName();
  if (BONES_TO_RENAME.has(name)) {
    node.setName(`mixamorig:${name}`);
    renamed++;
  }
}
await io.write(outPath, doc);
console.log(`${inPath} → ${outPath}: renamed ${renamed} bones`);
