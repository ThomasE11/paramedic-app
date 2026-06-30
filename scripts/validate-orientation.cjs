/* Decode a patient GLB, apply the EXACT in-app transform (π-rotate only for
 * patient.glb, like rotateLegacyToCamera), normalize to height 1.8 + recenter,
 * then determine which way the patient faces (toes point anterior) and run the
 * runtime label sampler against the landmark intents. Camera sits at +Z. */
const fs = require('fs');
const draco3d = require('draco3d');

const PATH = process.argv[2];
const ROTATE = process.argv[3] === 'rotate'; // mirror rotateLegacyToCamera

function readDraco(path) {
  const buf = fs.readFileSync(path);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString('utf8'));
  let off = 20 + jsonLen;
  const binLen = buf.readUInt32LE(off);
  const bin = buf.slice(off + 8, off + 8 + binLen);
  const ext = json.meshes[0].primitives[0].extensions.KHR_draco_mesh_compression;
  const bv = json.bufferViews[ext.bufferView];
  return { bytes: bin.slice(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength), id: ext.attributes.POSITION };
}

(async () => {
  const { bytes, id } = readDraco(PATH);
  const dm = await draco3d.createDecoderModule({});
  const dec = new dm.Decoder();
  const db = new dm.DecoderBuffer();
  db.Init(new Int8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength), bytes.byteLength);
  const mesh = new dm.Mesh();
  dec.DecodeBufferToMesh(db, mesh);
  const n = mesh.num_points();
  const attr = dec.GetAttributeByUniqueId(mesh, id);
  const a = new dm.DracoFloat32Array();
  dec.GetAttributeFloatForAllPoints(mesh, attr, a);

  // raw verts -> (optionally) rotate Y by PI: (x,y,z)=>(-x,y,-z)
  const rx = new Float32Array(n), ry = new Float32Array(n), rz = new Float32Array(n);
  let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < n; i++) {
    let x = a.GetValue(i * 3), y = a.GetValue(i * 3 + 1), z = a.GetValue(i * 3 + 2);
    if (ROTATE) { x = -x; z = -z; }
    rx[i] = x; ry[i] = y; rz[i] = z;
    if (x < mn[0]) mn[0] = x; if (y < mn[1]) mn[1] = y; if (z < mn[2]) mn[2] = z;
    if (x > mx[0]) mx[0] = x; if (y > mx[1]) mx[1] = y; if (z > mx[2]) mx[2] = z;
  }
  const H = mx[1] - mn[1]; const scale = 1.8 / H;
  const cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2;
  const px = -cx * scale, py = -mn[1] * scale, pz = -cz * scale;
  const wx = new Float32Array(n), wy = new Float32Array(n), wz = new Float32Array(n);
  for (let i = 0; i < n; i++) { wx[i] = rx[i] * scale + px; wy[i] = ry[i] * scale + py; wz[i] = rz[i] * scale + pz; }

  // toes test: at foot level (y 0.0-0.12), anterior = the Z direction with the
  // larger extent (toes stick out further than the heel).
  let footMaxZ = -Infinity, footMinZ = Infinity;
  for (let i = 0; i < n; i++) { if (wy[i] <= 0.12) { if (wz[i] > footMaxZ) footMaxZ = wz[i]; if (wz[i] < footMinZ) footMinZ = wz[i]; } }
  const anteriorIsPlusZ = footMaxZ > -footMinZ;

  console.log(`\n=== ${PATH}  (rotateπ=${ROTATE}) ===`);
  console.log('final bbox Z: [', wz.reduce((a,b)=>Math.min(a,b),Infinity).toFixed(3), ',', wz.reduce((a,b)=>Math.max(a,b),-Infinity).toFixed(3), ']  (camera at +Z=4.25)');
  console.log('feet Z extent: +Z(toes?)', footMaxZ.toFixed(3), ' -Z', footMinZ.toFixed(3));
  console.log('>> PATIENT FACES', anteriorIsPlusZ ? 'the CAMERA (+Z) ✅ correct' : 'AWAY from camera (-Z) ❌ backwards');

  // runtime sampler (max +Z near x,y)
  const sample = (x, y) => {
    const scan = (xt, yt) => { let bz = -Infinity, f = false; for (let i = 0; i < n; i++) { if (Math.abs(wx[i]-x)<xt && Math.abs(wy[i]-y)<yt) { if (wz[i]>bz){bz=wz[i];f=true;} } } return f?bz:null; };
    const z = scan(0.07,0.05) ?? scan(0.16,0.11) ?? scan(0.30,0.18);
    return z;
  };
  const intents = [['eyes',0,1.63],['airway',0,1.46],['lung-fields',0.09,1.27],['chest-wall',-0.10,1.20],['abdomen',0.07,1.02],['radial',-0.18,0.82],['pedal',-0.13,0.14]];
  console.log('sampler projected z (front surface) per landmark intent:');
  for (const [name,x,y] of intents) { const z=sample(x,y); console.log(`  ${name.padEnd(12)} (x=${x}, y=${y}) -> z=${z==null?'(no surface)':z.toFixed(3)}`); }
})();
