import { readFileSync } from 'node:fs';

function parseGlb(path) {
  const buf = readFileSync(path);
  const jsonLength = buf.readUInt32LE(12);
  const json = JSON.parse(buf.slice(20, 20 + jsonLength).toString('utf8'));
  const binOffset = 20 + jsonLength;
  const bin = buf.subarray(binOffset + 8, binOffset + 8 + buf.readUInt32LE(binOffset));
  return { json, bin };
}

function readPositions(json, bin, index) {
  const acc = json.accessors[index];
  const view = json.bufferViews[acc.bufferView];
  const start = (view.byteOffset || 0) + (acc.byteOffset || 0);
  const stride = view.byteStride || 12;
  const out = [];
  for (let i = 0; i < acc.count; i++) {
    const o = start + i * stride;
    out.push([bin.readFloatLE(o), bin.readFloatLE(o + 4), bin.readFloatLE(o + 8)]);
  }
  return out;
}

function analyze(path, seatYBand, backYBand) {
  const { json, bin } = parseGlb(path);
  const nodes = json.nodes || [];
  const verts = [];
  function transformNode(i, parent) {
    const n = nodes[i];
    const t = n.translation || [0, 0, 0];
    const s = n.scale || [1, 1, 1];
    const world = [parent[0] + t[0], parent[1] + t[1], parent[2] + t[2]];
    if (n.mesh != null) {
      for (const prim of json.meshes[n.mesh].primitives) {
        for (const [x, y, z] of readPositions(json, bin, prim.attributes.POSITION)) {
          verts.push([world[0] + x * s[0], world[1] + y * s[1], world[2] + z * s[2]]);
        }
      }
    }
    for (const c of n.children || []) transformNode(c, world);
  }
  for (const i of json.scenes[0].nodes) transformNode(i, [0, 0, 0]);

  const inBand = (lo, hi) => verts.filter(([, y]) => y >= lo && y <= hi);
  const stats = (label, pts) => {
    if (!pts.length) return console.log(label, 'NONE');
    const xs = pts.map(p => p[0]);
    const ys = pts.map(p => p[1]);
    const zs = pts.map(p => p[2]);
    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    console.log(label, {
      n: pts.length,
      x: [Math.min(...xs), Math.max(...xs), avg(xs)],
      y: [Math.min(...ys), Math.max(...ys), avg(ys)],
      z: [Math.min(...zs), Math.max(...zs), avg(zs)],
    });
  };
  console.log('\n===', path, 'n=', verts.length);
  stats('seat band', inBand(...seatYBand));
  stats('back band', inBand(...backYBand));
  stats('all', verts);
}

analyze('public/models/props/kenney-chair.glb', [0.18, 0.26], [0.38, 0.48]);
analyze('public/models/props/kenney-lounge-chair.glb', [0.12, 0.24], [0.36, 0.46]);
analyze('public/models/props/kenney-desk-chair.glb', [0.26, 0.34], [0.50, 0.62]);
analyze('public/models/props/kenney-cushion-chair.glb', [0.18, 0.26], [0.38, 0.46]);
