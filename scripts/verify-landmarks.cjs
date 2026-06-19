/* Verify every exam landmark lands ON the patient surface.
 *
 * Decodes patient.glb, rebuilds the EXACT surface sampler used by the app
 * (BodyMesh.buildSurfaceSampler, AUTHOR_HALFW=0.536), projects each authored
 * landmark, and reports whether a real surface vertex was found in the tight
 * scan window (= the dot sits on the skin) or whether it fell back to maxZ
 * (= the dot floats in front of the body). FAIL = any landmark floating, or a
 * lateral landmark whose projected x is >4 cm from the nearest arm/leg vertex
 * at that height (= dot beside the limb).
 */
const fs = require('fs');
const draco3d = require('draco3d');
const GLB = process.argv[2] || 'public/models/patient.glb';

// Authored landmarks (mirror of EXAM_LANDMARKS in Body3DModel/index.tsx).
const LANDMARKS = [
  ['eyes-overview', 0.0, 1.62], ['airway-overview', 0.0, 1.46],
  ['chest-overview', 0.02, 1.27], ['abdomen-overview', 0.03, 1.02],
  ['pulse-carotid', -0.11, 1.42], ['pulse-radial-r', -0.135, 0.81],
  ['pulse-radial-l', 0.135, 0.81], ['pedal-overview', -0.20, 0.13],
  ['r-shoulder', -0.15, 1.39], ['r-humerus', -0.145, 1.12], ['r-elbow', -0.14, 0.95],
  ['r-forearm', -0.145, 0.88], ['r-wrist', -0.135, 0.81], ['r-hand', -0.15, 0.72],
  ['l-shoulder', 0.15, 1.39], ['l-humerus', 0.145, 1.12], ['l-wrist', 0.135, 0.81],
  ['r-hip', -0.14, 0.88], ['r-thigh', -0.15, 0.70], ['r-knee', -0.165, 0.46],
  ['r-shin', -0.18, 0.31], ['r-ankle', -0.20, 0.17], ['r-foot', -0.20, 0.06],
  ['l-knee', 0.165, 0.46], ['l-ankle', 0.20, 0.17], ['l-foot', 0.20, 0.06],
];

function readDracoBytes(path) {
  const buf = fs.readFileSync(path);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString('utf8'));
  let off = 20 + jsonLen;
  const binLen = buf.readUInt32LE(off);
  const bin = buf.slice(off + 8, off + 8 + binLen);
  const prim = json.meshes[0].primitives[0];
  const dracoExt = prim.extensions.KHR_draco_mesh_compression;
  const bv = json.bufferViews[dracoExt.bufferView];
  const dracoBytes = bin.slice(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
  return { dracoBytes, posUniqueId: dracoExt.attributes.POSITION };
}

(async () => {
  const { dracoBytes, posUniqueId } = readDracoBytes(GLB);
  const mod = await draco3d.createDecoderModule({});
  const decoder = new mod.Decoder();
  const dbuf = new mod.DecoderBuffer();
  dbuf.Init(new Int8Array(dracoBytes.buffer, dracoBytes.byteOffset, dracoBytes.byteLength), dracoBytes.byteLength);
  const mesh = new mod.Mesh();
  if (!decoder.DecodeBufferToMesh(dbuf, mesh).ok()) { console.error('decode failed'); process.exit(1); }
  const n = mesh.num_points();
  const posAttr = decoder.GetAttributeByUniqueId(mesh, posUniqueId);
  const arr = new mod.DracoFloat32Array();
  decoder.GetAttributeFloatForAllPoints(mesh, posAttr, arr);

  // App transform: rotate Y by PI, scale to height 1.8, feet→0, centre X/Z.
  let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { const v = arr.GetValue(i*3+k); if (v<mn[k]) mn[k]=v; if (v>mx[k]) mx[k]=v; }
  const rmn = [-mx[0], mn[1], -mx[2]], rmx = [-mn[0], mx[1], -mn[2]];
  const scale = 1.8 / (rmx[1] - rmn[1]);
  const center = [(rmn[0]+rmx[0])/2, (rmn[1]+rmx[1])/2, (rmn[2]+rmx[2])/2];
  const pos = [-center[0]*scale, -rmn[1]*scale, -center[2]*scale];
  const wx = new Float32Array(n), wy = new Float32Array(n), wz = new Float32Array(n);
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity,maxZ=-Infinity;
  for (let i=0;i<n;i++){ const x=scale*(-arr.GetValue(i*3))+pos[0], y=scale*arr.GetValue(i*3+1)+pos[1], z=scale*(-arr.GetValue(i*3+2))+pos[2];
    wx[i]=x; wy[i]=y; wz[i]=z; if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y; if(z>maxZ)maxZ=z; }

  // Rebuilt sampler (matches BodyMesh.buildSurfaceSampler).
  const AUTHOR_H=1.8, AUTHOR_HALFW=0.536;
  const H=(maxY-minY)||AUTHOR_H, cx=(minX+maxX)/2, halfW=((maxX-minX)/2)||AUTHOR_HALFW, s=H/AUTHOR_H, PROUD=0.03*s;
  const scan=(x,y,xTol,yTol)=>{ let bz=-Infinity,found=false; for(let i=0;i<n;i++){ if(Math.abs(wx[i]-x)<xTol&&Math.abs(wy[i]-y)<yTol){ if(wz[i]>bz){bz=wz[i];found=true;} } } return found?bz:null; };
  // Nearest surface vertex in the X/Y plane (ignores the 3cm PROUD z-lift) —
  // this is the true "is the dot over the body footprint" metric.
  const nearestDist=(x,y)=>{ let best=Infinity; for(let i=0;i<n;i++){ const d=Math.hypot(wx[i]-x,wy[i]-y); if(d<best)best=d; } return best; };

  console.log(`sampler: halfW=${halfW.toFixed(3)} s=${s.toFixed(3)} (AUTHOR_HALFW=${AUTHOR_HALFW})\n`);
  let fails=0;
  for (const [id, xa, ya] of LANDMARKS) {
    const x = cx + xa*(halfW/AUTHOR_HALFW);
    const y = minY + (ya/AUTHOR_H)*H;
    const tight = scan(x,y,0.07*s,0.05*s);
    const z = tight ?? scan(x,y,0.16*s,0.11*s) ?? scan(x,y,0.30*s,0.18*s);
    const fz = (z ?? maxZ) + PROUD;
    const floating = z === null;
    const fit = nearestDist(x, y);
    const bad = floating || fit > 0.03;
    if (bad) fails++;
    console.log(`${bad?'FAIL':' ok '}  ${id.padEnd(15)} → (${x.toFixed(3)}, ${y.toFixed(3)}, ${fz.toFixed(3)})  ${floating?'FLOATING(maxZ)':`tight=${tight!==null}`}  nearestVtx=${(fit*100).toFixed(1)}cm`);
  }
  console.log(`\n${fails===0?'ALL LANDMARKS ON SURFACE ✓':fails+' landmark(s) off-surface ✗'}`);
  process.exitCode = fails===0?0:1;
})();
