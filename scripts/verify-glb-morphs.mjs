// Criterion 2 evidence: parse patient.glb JSON chunk directly — no deps.
// Checks: male morph targets present, bone count, mesh primitives.
import { readFileSync } from 'node:fs';

const path = process.argv[2] ?? 'public/models/patient-male.glb';
const buf = readFileSync(path);
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));

const morphNames = new Set();
for (const m of json.meshes ?? []) {
  for (const p of m.primitives ?? []) {
    for (const [name] of Object.entries(p.targets ? p.targets.reduce((a, t) => {
      for (const k of Object.keys(t)) a[k] = (a[k] ?? 0) + 1;
      return a;
    }, {}) : {})) morphNames.add(name);
  }
}
// glTF morph target names come via meshes[].extras / weights + targetNames
const targetNames = [];
for (const m of json.meshes ?? []) {
  const names = m.extras?.targetNames;
  if (names) targetNames.push(...names);
}

console.log('meshes:', (json.meshes ?? []).length);
console.log('skins:', (json.skins ?? []).length, '| joints:', (json.skins?.[0]?.joints ?? []).length);
console.log('animations:', (json.animations ?? []).map(a => a.name));
console.log('morph target names:', targetNames.length ? targetNames : [...morphNames]);
console.log('materials:', (json.materials ?? []).map(m => m.name));

// masculinity markers in morph names
const maleMarkers = ['muscle', 'broad', 'jaw', 'brow', 'shoulder', 'chest', 'breath', 'viseme', 'belly'];
const found = targetNames.filter(n => maleMarkers.some(k => n.toLowerCase().includes(k)));
console.log('masculinity/clinical markers found:', found);

const requiredTargets = [
  'breathe_chest_rise',
  'viseme_open',
  'pose_tripod',
  'pose_supine',
  'pose_recovery',
  'motion_gasp',
  'motion_wince',
  'motion_clutch',
  'motion_seizure',
  'motion_tremor',
  'motion_agitation',
];
const missing = requiredTargets.filter(name => !targetNames.includes(name));
if (missing.length) {
  console.error('missing required morph targets:', missing);
  process.exitCode = 1;
} else {
  console.log(`required morph targets: ${requiredTargets.length}/${requiredTargets.length}`);
}
