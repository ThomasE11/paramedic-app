import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const files = process.argv.slice(2);
const loader = new GLTFLoader();

for (const path of files) {
  const buf = readFileSync(path);
  const gltf = await loader.parseAsync(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), '');
  const box = new THREE.Box3().setFromObject(gltf.scene);
  const size = box.getSize(new THREE.Vector3());
  console.log(path);
  console.log(`  size ${size.x.toFixed(3)} ${size.y.toFixed(3)} ${size.z.toFixed(3)}`);
  console.log(`  min  ${box.min.x.toFixed(3)} ${box.min.y.toFixed(3)} ${box.min.z.toFixed(3)}`);
  console.log(`  max  ${box.max.x.toFixed(3)} ${box.max.y.toFixed(3)} ${box.max.z.toFixed(3)}`);
}
