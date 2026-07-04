/* Stage-2 GLB gate: decode a patient GLB (Draco or plain) and verify the
 * clinical contract the app depends on:
 *   • morph target names survive (breathe_chest_rise + finding_* + macros)
 *   • the diffuse texture survives with its two pure-red eye-socket blobs
 *     (EyesLayer's repaint + calibrate-face both key off those texels)
 *   • optional: the six real-eye nodes exist (eyeL/R, irisL/R, pupilL/R)
 *     with eyeR on the patient's right (raw x < 0 — the raw model faces +z,
 *     the app applies scale+translate only, so raw x sign == app x sign)
 *   • file stays under the 10MB budget
 *
 * Usage: node scripts/verify-glb.cjs <file.glb> [--expect-eyes]
 * Exits non-zero when a hard gate fails.
 */
const fs = require('fs');
const { decode: decodePng } = require('fast-png');

const file = process.argv[2] || 'public/models/patient.glb';
const expectEyes = process.argv.includes('--expect-eyes');

const REQUIRED_MORPHS = ['breathe_chest_rise', 'finding_abdo_distension', 'finding_jvd'];
const EYE_NODES = ['eyeL', 'eyeR', 'irisL', 'irisR', 'pupilL', 'pupilR'];

function fail(msg) { console.error(`FAIL: ${msg}`); process.exitCode = 1; }
function ok(msg) { console.log(`  ok: ${msg}`); }

const buf = fs.readFileSync(file);
const jsonLen = buf.readUInt32LE(12);
const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString('utf8'));
const off = 20 + jsonLen;
const bin = buf.slice(off + 8, off + 8 + buf.readUInt32LE(off));

console.log(`${file}  (${(buf.length / 1024 / 1024).toFixed(2)} MB, generator: ${json.asset?.generator ?? '?'})`);

// --- size budget -----------------------------------------------------------
if (buf.length > 10 * 1024 * 1024) fail(`file is ${(buf.length / 1e6).toFixed(1)}MB — over the 10MB budget`);
else ok(`size ${(buf.length / 1024 / 1024).toFixed(2)}MB < 10MB`);

// --- morph target names ----------------------------------------------------
const allTargetNames = (json.meshes ?? []).flatMap((m) => m.extras?.targetNames ?? []);
for (const name of REQUIRED_MORPHS) {
  if (allTargetNames.includes(name)) ok(`morph "${name}" present`);
  else fail(`morph "${name}" MISSING (have: ${allTargetNames.join(', ') || 'none'})`);
}
console.log(`  all morphs (${allTargetNames.length}): ${allTargetNames.join(', ')}`);

// --- texture + red eye-socket blobs ----------------------------------------
const img = (json.images ?? [])[0];
if (!img) fail('no embedded image — diffuse texture lost');
else {
  const bv = json.bufferViews[img.bufferView];
  const bytes = bin.slice(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
  if (img.mimeType !== 'image/png') fail(`texture is ${img.mimeType}, expected image/png (red texels must be lossless)`);
  try {
    const png = decodePng(bytes);
    ok(`texture ${png.width}x${png.height} ${img.mimeType} (${(bytes.length / 1024 / 1024).toFixed(2)}MB)`);
    // Same pure-red rule as EyesLayer.paintEyesOnTexture
    const { width: w, height: h, data, channels } = png;
    const mask = new Uint8Array(w * h);
    for (let i = 0, p = 0; i < w * h; i++, p += channels) {
      const R = data[p], G = data[p + 1], B = data[p + 2];
      if (R > 165 && G < 90 && B < 90 && R - G > 95 && R - B > 95) mask[i] = 1;
    }
    const maxEye = Math.max(8, Math.round(w * 0.06));
    const blobs = [];
    const stack = [];
    for (let s = 0; s < mask.length; s++) {
      if (mask[s] !== 1) continue;
      let n = 0, sx = 0, sy = 0, minX = w, maxX = 0, minY = h, maxY = 0;
      mask[s] = 2; stack.push(s);
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
        blobs.push({ cx: (sx / n) | 0, cy: (sy / n) | 0, n });
      }
    }
    blobs.sort((a, b) => b.n - a.n);
    if (blobs.length >= 2) ok(`red eye-socket blobs intact: ${blobs.slice(0, 2).map((b) => `(${b.cx},${b.cy} n=${b.n})`).join(' ')}`);
    else fail(`red eye-socket blobs lost — found ${blobs.length} eye-sized blob(s); EyesLayer repaint would break`);
  } catch (e) {
    fail(`texture PNG did not decode: ${e.message}`);
  }
}

// --- eye nodes ---------------------------------------------------------------
const nodeByName = new Map((json.nodes ?? []).map((n, i) => [n.name, { node: n, i }]));
const haveEyes = EYE_NODES.every((n) => nodeByName.has(n));
if (expectEyes) {
  if (!haveEyes) fail(`eye nodes missing: ${EYE_NODES.filter((n) => !nodeByName.has(n)).join(', ')}`);
  else {
    ok('all six eye nodes present (eyeL/R, irisL/R, pupilL/R)');
    // World x of each eye = its translation (parents carry no x offset worth
    // worrying about; assert through the chain anyway).
    const worldX = (name) => {
      let x = 0;
      let target = nodeByName.get(name).i;
      // walk down from roots accumulating translation x
      const parents = new Map();
      (json.nodes ?? []).forEach((n, i) => (n.children ?? []).forEach((c) => parents.set(c, i)));
      let cur = target;
      while (cur !== undefined) {
        x += (json.nodes[cur].translation ?? [0, 0, 0])[0];
        cur = parents.get(cur);
      }
      return x;
    };
    const xR = worldX('eyeR'), xL = worldX('eyeL');
    if (xR < 0 && xL > 0) ok(`eyeR raw x=${xR.toFixed(4)} (<0, patient's right ✓), eyeL raw x=${xL.toFixed(4)}`);
    else fail(`eye laterality wrong: eyeR x=${xR.toFixed(4)} (must be <0), eyeL x=${xL.toFixed(4)} (must be >0)`);
    // iris/pupil must be children of their eye so saccade rotation carries them
    for (const side of ['L', 'R']) {
      const eyeIdx = nodeByName.get(`eye${side}`).i;
      const kids = json.nodes[eyeIdx].children ?? [];
      const kidNames = kids.map((k) => json.nodes[k].name);
      if (kidNames.includes(`iris${side}`) && kidNames.includes(`pupil${side}`)) ok(`eye${side} parents iris${side}+pupil${side}`);
      else fail(`eye${side} children are [${kidNames.join(', ')}] — expected iris${side}+pupil${side}`);
    }
  }
} else {
  console.log(`  eye nodes: ${haveEyes ? 'present' : 'absent'} (not required for this file)`);
}

process.on('exit', (code) => console.log(code ? '\nVERIFY FAILED' : '\nVERIFY PASSED'));
