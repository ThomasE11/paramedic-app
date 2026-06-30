/* Decode patient.glb (Draco), apply the app's exact normalization, and report
 * the real camera-facing surface point per anatomical region so labels can be
 * anchored to the actual model instead of guessed coordinates. */
const fs = require('fs');
const draco3d = require('draco3d');

const GLB = process.argv[2] || 'public/models/patient.glb';

function readDracoBytes(path) {
  const buf = fs.readFileSync(path);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString('utf8'));
  // BIN chunk follows the JSON chunk
  let off = 20 + jsonLen;
  const binLen = buf.readUInt32LE(off);
  const binType = buf.readUInt32LE(off + 4); // 0x004E4942 'BIN\0'
  const binStart = off + 8;
  const bin = buf.slice(binStart, binStart + binLen);
  const prim = json.meshes[0].primitives[0];
  const dracoExt = prim.extensions.KHR_draco_mesh_compression;
  const bv = json.bufferViews[dracoExt.bufferView];
  const dracoBytes = bin.slice(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
  return { dracoBytes, posUniqueId: dracoExt.attributes.POSITION };
}

(async () => {
  const { dracoBytes, posUniqueId } = readDracoBytes(GLB);
  const decoderModule = await draco3d.createDecoderModule({});
  const decoder = new decoderModule.Decoder();
  const dbuf = new decoderModule.DecoderBuffer();
  dbuf.Init(new Int8Array(dracoBytes.buffer, dracoBytes.byteOffset, dracoBytes.byteLength), dracoBytes.byteLength);
  const mesh = new decoderModule.Mesh();
  const status = decoder.DecodeBufferToMesh(dbuf, mesh);
  if (!status.ok()) { console.error('decode failed:', status.error_msg()); process.exit(1); }
  const n = mesh.num_points();
  const posAttr = decoder.GetAttributeByUniqueId(mesh, posUniqueId);
  const arr = new decoderModule.DracoFloat32Array();
  decoder.GetAttributeFloatForAllPoints(mesh, posAttr, arr);

  // raw bbox
  let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < n; i++) { for (let k = 0; k < 3; k++) { const v = arr.GetValue(i * 3 + k); if (v < mn[k]) mn[k] = v; if (v > mx[k]) mx[k] = v; } }

  // Replicate app transform: rotate Y by PI -> (x,y,z)=>(-x,y,-z); then scale
  // to height 1.8 and recenter X/Z to 0, feet to y=0. Box is computed AFTER
  // rotation (matches BodyMesh setFromObject on the rotated clone).
  const rmn = [-mx[0], mn[1], -mx[2]], rmx = [-mn[0], mx[1], -mn[2]];
  const height = rmx[1] - rmn[1];
  const scale = 1.8 / height;
  const center = [(rmn[0] + rmx[0]) / 2, (rmn[1] + rmx[1]) / 2, (rmn[2] + rmx[2]) / 2];
  const pos = [-center[0] * scale, -rmn[1] * scale, -center[2] * scale];
  const toFinal = (vx, vy, vz) => [scale * (-vx) + pos[0], scale * vy + pos[1], scale * (-vz) + pos[2]];

  // Collect transformed verts
  const V = new Array(n);
  let fmn = [Infinity, Infinity, Infinity], fmx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < n; i++) {
    const f = toFinal(arr.GetValue(i * 3), arr.GetValue(i * 3 + 1), arr.GetValue(i * 3 + 2));
    V[i] = f;
    for (let k = 0; k < 3; k++) { if (f[k] < fmn[k]) fmn[k] = f[k]; if (f[k] > fmx[k]) fmx[k] = f[k]; }
  }

  console.log('raw bbox   min', mn.map(v=>v.toFixed(3)), 'max', mx.map(v=>v.toFixed(3)));
  console.log('final bbox min', fmn.map(v=>v.toFixed(3)), 'max', fmx.map(v=>v.toFixed(3)), ' (camera at +Z)');
  console.log('scale', scale.toFixed(4), 'pos', pos.map(v=>v.toFixed(4)));
  console.log('');

  // For a midline region at height y: the camera-facing surface = max finalZ
  // among verts within yBand and |x| < xTol.
  function midlineFront(yLo, yHi, xTol = 0.05) {
    let best = null;
    for (let i = 0; i < n; i++) { const f = V[i]; if (f[1] >= yLo && f[1] <= yHi && Math.abs(f[0]) < xTol) { if (!best || f[2] > best[2]) best = f; } }
    return best;
  }
  // Lateral structure (arm/leg): pick the band, find max |x|, then among verts
  // near that |x| (within 0.04) the camera-facing (max z) point.
  function lateralFront(yLo, yHi, side /* +1 right(+x)/ -1 left */) {
    let extreme = 0, ex = null;
    for (let i = 0; i < n; i++) { const f = V[i]; if (f[1] >= yLo && f[1] <= yHi) { const xs = f[0] * side; if (xs > extreme) { extreme = xs; } } }
    const xTarget = extreme * side;
    let best = null;
    for (let i = 0; i < n; i++) { const f = V[i]; if (f[1] >= yLo && f[1] <= yHi && Math.abs(f[0] - xTarget) < 0.05) { if (!best || f[2] > best[2]) best = f; } }
    return { maxAbsX: extreme, point: best };
  }
  const p = (b) => b ? `[${b[0].toFixed(3)}, ${b[1].toFixed(3)}, ${b[2].toFixed(3)}]` : 'none';

  console.log('MIDLINE camera-facing surface (x, y, z):');
  console.log('  head   (y 1.70-1.80):', p(midlineFront(1.70, 1.80)));
  console.log('  face   (y 1.58-1.68):', p(midlineFront(1.58, 1.68)));
  console.log('  neck   (y 1.42-1.55):', p(midlineFront(1.42, 1.55)));
  console.log('  chest  (y 1.18-1.40):', p(midlineFront(1.18, 1.40)));
  console.log('  abdomen(y 0.95-1.15):', p(midlineFront(0.95, 1.15)));
  console.log('  pelvis (y 0.82-0.94):', p(midlineFront(0.82, 0.94)));
  console.log('');
  console.log('LATERAL (arm/leg) max|x| + camera-facing point:');
  const ua = lateralFront(1.00, 1.30, -1); console.log('  R upper-arm (y1.0-1.3, -x): maxAbsX', ua.maxAbsX.toFixed(3), 'pt', p(ua.point));
  const fa = lateralFront(0.78, 0.98, -1); console.log('  R forearm   (y0.78-0.98,-x): maxAbsX', fa.maxAbsX.toFixed(3), 'pt', p(fa.point));
  const th = lateralFront(0.45, 0.75, -1); console.log('  R thigh     (y0.45-0.75,-x): maxAbsX', th.maxAbsX.toFixed(3), 'pt', p(th.point));
  const sh = lateralFront(0.10, 0.42, -1); console.log('  R shin      (y0.10-0.42,-x): maxAbsX', sh.maxAbsX.toFixed(3), 'pt', p(sh.point));
})();
