import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { readFileSync } from 'fs';
const loader = new GLTFLoader();
function inspect(path) {
  return new Promise((resolve, reject) => {
    const buf = readFileSync(path);
    loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '', (gltf) => {
      const info = [];
      gltf.scene.traverse((o) => {
        if (!o.isMesh) return;
        const dict = o.morphTargetDictionary || {};
        info.push({ name: o.name, verts: o.geometry?.attributes?.position?.count, morphs: Object.keys(dict), hasPoseTripod: 'pose_tripod' in dict, hasPoseSeated: 'pose_seated' in dict, hasSkinAttr: !!(o.geometry?.attributes?.skinIndex), isSkinned: o.isSkinnedMesh });
      });
      resolve(info);
    }, reject);
  });
}
for (const p of ['public/models/garment-trousers.glb','public/models/garment-shirt.glb','public/models/patient-male.glb']) {
  console.log('===', p, '===');
  console.log(JSON.stringify(await inspect(p), null, 2));
}
