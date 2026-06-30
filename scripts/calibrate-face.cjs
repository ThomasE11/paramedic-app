/* Find the patient model's EXACT eye positions in app-space, deterministically.
 *
 * The MakeHuman skin texture paints the eye sockets pure red (the same fact the
 * in-app EyesLayer exploits). So:
 *   1. Decode the embedded PNG, find the two red eye-socket blobs → texel centres.
 *   2. texel → UV (glTF: top-left origin) → the mesh triangle that owns that UV
 *      → barycentric-interpolate the 3 vertex POSITIONs → local 3D point.
 *   3. Apply the app's exact normalisation (see measure-anatomy.cjs) → app-space.
 *
 * Output: drop-in [x, y, z] for the right/left eye EXAM_LANDMARKS. No guessing,
 * no screenshot nudging — the model reports where its own eyes are.
 *
 * Run:  node scripts/calibrate-face.cjs [public/models/patient.glb]
 */
const fs = require('fs');
const draco3d = require('draco3d');
const { decode: decodePng } = require('fast-png');

const GLB = process.argv[2] || 'public/models/patient.glb';

function readGlb(path) {
  const buf = fs.readFileSync(path);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString('utf8'));
  const off = 20 + jsonLen;
  const binLen = buf.readUInt32LE(off);
  const bin = buf.slice(off + 8, off + 8 + binLen);
  const sliceBV = (i) => { const bv = json.bufferViews[i]; const s = bv.byteOffset || 0; return bin.slice(s, s + bv.byteLength); };
  const prim = json.meshes[0].primitives[0];
  const draco = prim.extensions.KHR_draco_mesh_compression;
  return {
    dracoBytes: sliceBV(draco.bufferView),
    ids: draco.attributes, // { POSITION, NORMAL, TEXCOORD_0 }
    pngBytes: sliceBV(json.images[0].bufferView),
  };
}

// Pure-red eye-socket mask (same thresholds as EyesLayer).
function findEyeBlobs(png) {
  const { width: w, height: h, data, channels } = png;
  const mask = new Uint8Array(w * h);
  for (let i = 0, p = 0; i < w * h; i++, p += channels) {
    const R = data[p], G = data[p + 1], B = data[p + 2];
    if (R > 165 && G < 90 && B < 90 && R - G > 95 && R - B > 95) mask[i] = 1;
  }
  const maxEye = Math.max(8, Math.round(w * 0.06));
  const blobs = [];
  const stack = [];
  for (let start = 0; start < mask.length; start++) {
    if (mask[start] !== 1) continue;
    let n = 0, sx = 0, sy = 0, minX = w, maxX = 0, minY = h, maxY = 0;
    mask[start] = 2; stack.push(start);
    while (stack.length) {
      const q = stack.pop();
      const qx = q % w, qy = (q / w) | 0;
      n++; sx += qx; sy += qy;
      if (qx < minX) minX = qx; if (qx > maxX) maxX = qx;
      if (qy < minY) minY = qy; if (qy > maxY) maxY = qy;
      if (qx > 0 && mask[q - 1] === 1) { mask[q - 1] = 2; stack.push(q - 1); }
      if (qx < w - 1 && mask[q + 1] === 1) { mask[q + 1] = 2; stack.push(q + 1); }
      if (qy > 0 && mask[q - w] === 1) { mask[q - w] = 2; stack.push(q - w); }
      if (qy < h - 1 && mask[q + w] === 1) { mask[q + w] = 2; stack.push(q + w); }
    }
    const bw = maxX - minX + 1, bh = maxY - minY + 1;
    if (n >= 20 && bw <= maxEye && bh <= maxEye && bw <= bh * 3 && bh <= bw * 3) {
      blobs.push({ cx: sx / n, cy: sy / n, n });
    }
  }
  blobs.sort((a, b) => b.n - a.n);
  return blobs.slice(0, 2).sort((a, b) => a.cx - b.cx); // atlas-left first
}

(async () => {
  const { dracoBytes, ids, pngBytes } = readGlb(GLB);
  const mod = await draco3d.createDecoderModule({});
  const decoder = new mod.Decoder();
  const dbuf = new mod.DecoderBuffer();
  dbuf.Init(new Int8Array(dracoBytes.buffer, dracoBytes.byteOffset, dracoBytes.byteLength), dracoBytes.byteLength);
  const mesh = new mod.Mesh();
  if (!decoder.DecodeBufferToMesh(dbuf, mesh).ok()) throw new Error('draco decode failed');

  const n = mesh.num_points();
  const readAttr = (uid, comps) => {
    const a = decoder.GetAttributeByUniqueId(mesh, uid);
    const out = new mod.DracoFloat32Array();
    decoder.GetAttributeFloatForAllPoints(mesh, a, out);
    const arr = new Float32Array(n * comps);
    for (let i = 0; i < n * comps; i++) arr[i] = out.GetValue(i);
    return arr;
  };
  const POS = readAttr(ids.POSITION, 3);
  const UV = readAttr(ids.TEXCOORD_0, 2);

  // Faces (triangle vertex indices).
  const numFaces = mesh.num_faces();
  const faces = new Uint32Array(numFaces * 3);
  const fa = new mod.DracoUInt32Array();
  for (let f = 0; f < numFaces; f++) {
    decoder.GetFaceFromMesh(mesh, f, fa);
    faces[f * 3] = fa.GetValue(0); faces[f * 3 + 1] = fa.GetValue(1); faces[f * 3 + 2] = fa.GetValue(2);
  }

  // App normalisation (identical to measure-anatomy.cjs / BodyMesh).
  let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { const v = POS[i * 3 + k]; if (v < mn[k]) mn[k] = v; if (v > mx[k]) mx[k] = v; }
  const rmn = [-mx[0], mn[1], -mx[2]], rmx = [-mn[0], mx[1], -mn[2]];
  const scale = 1.8 / (rmx[1] - rmn[1]);
  const center = [(rmn[0] + rmx[0]) / 2, (rmn[1] + rmx[1]) / 2, (rmn[2] + rmx[2]) / 2];
  const pos = [-center[0] * scale, -rmn[1] * scale, -center[2] * scale];
  const toFinal = (vx, vy, vz) => [scale * (-vx) + pos[0], scale * vy + pos[1], scale * (-vz) + pos[2]];

  // Point-in-UV-triangle → barycentric weights, else null.
  function bary(ux, uy, ia, ib, ic) {
    const ax = UV[ia * 2], ay = UV[ia * 2 + 1];
    const bx = UV[ib * 2], by = UV[ib * 2 + 1];
    const cx = UV[ic * 2], cy = UV[ic * 2 + 1];
    const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
    if (Math.abs(d) < 1e-12) return null;
    const wa = ((by - cy) * (ux - cx) + (cx - bx) * (uy - cy)) / d;
    const wb = ((cy - ay) * (ux - cx) + (ax - cx) * (uy - cy)) / d;
    const wc = 1 - wa - wb;
    const e = -1e-4;
    if (wa < e || wb < e || wc < e) return null;
    return [wa, wb, wc];
  }

  // For a UV point, find the owning triangle whose interpolated 3D point is the
  // most camera-facing (front of the head). Guards against atlas UV collisions.
  function uvToWorld(uv) {
    let best = null;
    for (let f = 0; f < numFaces; f++) {
      const ia = faces[f * 3], ib = faces[f * 3 + 1], ic = faces[f * 3 + 2];
      const w = bary(uv[0], uv[1], ia, ib, ic);
      if (!w) continue;
      const lx = w[0] * POS[ia * 3] + w[1] * POS[ib * 3] + w[2] * POS[ic * 3];
      const ly = w[0] * POS[ia * 3 + 1] + w[1] * POS[ib * 3 + 1] + w[2] * POS[ic * 3+ 1];
      const lz = w[0] * POS[ia * 3 + 2] + w[1] * POS[ib * 3 + 2] + w[2] * POS[ic * 3 + 2];
      const fin = toFinal(lx, ly, lz);
      if (!best || fin[2] > best[2]) best = fin;
    }
    return best;
  }

  const png = decodePng(pngBytes);
  const eyes = findEyeBlobs(png);
  console.log(`texture ${png.width}x${png.height}, channels ${png.channels}, faces ${numFaces}`);
  console.log(`eye blobs (texel): ${eyes.map(e => `(${e.cx.toFixed(0)},${e.cy.toFixed(0)} n=${e.n})`).join('  ')}`);
  if (eyes.length < 2) { console.log('did not find two eye sockets — texture may differ'); return; }

  // UV v-axis convention differs (top-left vs bottom-left origin / flipY). Try
  // both and keep whichever lands on the camera-facing front of the head (+z).
  const fmt = (v) => v.toFixed(3);
  const labels = ['RIGHT eye (screen-left, atlas-left)', 'LEFT eye (screen-right)'];
  const world = eyes.map(e => {
    const direct = uvToWorld([e.cx / png.width, e.cy / png.height]);
    const flip = uvToWorld([e.cx / png.width, 1 - e.cy / png.height]);
    // The eye is on the face front (z high). Pick the orientation that is most forward.
    if (direct && flip) return direct[2] >= flip[2] ? direct : flip;
    return direct || flip;
  });
  world.forEach((p, i) => {
    console.log(p
      ? `${labels[i]}: position [${fmt(p[0])}, ${fmt(p[1])}, ${fmt(p[2])}]`
      : `${labels[i]}: UV not found on any triangle`);
  });

  if (world[0] && world[1]) {
    const midY = (world[0][1] + world[1][1]) / 2;
    const midZ = (world[0][2] + world[1][2]) / 2;
    console.log('');
    console.log('Derived (proportional to the measured eye line):');
    console.log(`  nose  ~ [0, ${fmt(midY - 0.035)}, ${fmt(midZ + 0.005)}]`);
    console.log(`  mouth ~ [0, ${fmt(midY - 0.072)}, ${fmt(midZ + 0.010)}]`);
  }
})();
