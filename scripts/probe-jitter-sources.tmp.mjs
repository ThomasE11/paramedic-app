import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});

await page.goto('http://127.0.0.1:5173/?devLiveCase=resp-001&capture', {
  waitUntil: 'networkidle',
  timeout: 60_000,
});
await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 30_000 });
await page.waitForTimeout(3500);

const sampleOnce = () => page.evaluate(async () => {
  const THREE = await import('/node_modules/.vite/deps/three.js');
  const scene = window.__r3f?.scene;
  if (!scene) return null;

  const find = (name) => scene.getObjectByName(name) ?? scene.getObjectByName(name.replace(/:/g, ''));
  const world = (obj) => {
    if (!obj) return null;
    const v = new THREE.Vector3();
    obj.getWorldPosition(v);
    return [+v.x.toFixed(5), +v.y.toFixed(5), +v.z.toFixed(5)];
  };
  const quat = (obj) => obj ? obj.quaternion.toArray().map(n => +n.toFixed(6)) : null;

  let motionRoot = null;
  let morphMesh = null;
  scene.traverse((object) => {
    if (!motionRoot && object.userData?.patientMotion) motionRoot = object;
    if (!morphMesh && object.morphTargetDictionary?.breathe_chest_rise != null) {
      morphMesh = object;
    }
  });

  const leftHand = find('mixamorig:LeftHand') ?? find('mixamorigLeftHand');
  const rightHand = find('mixamorig:RightHand') ?? find('mixamorigRightHand');
  const leftArm = find('mixamorig:LeftArm') ?? find('mixamorigLeftArm');
  const rightArm = find('mixamorig:RightArm') ?? find('mixamorigRightArm');
  const leftFore = find('mixamorig:LeftForeArm') ?? find('mixamorigLeftForeArm');
  const rightFore = find('mixamorig:RightForeArm') ?? find('mixamorigRightForeArm');
  const head = find('mixamorig:Head') ?? find('mixamorigHead');
  const spine = find('mixamorig:Spine') ?? find('mixamorigSpine');
  const root = scene.getObjectByName('TreatmentBayPatientRoot');
  const patient = scene.getObjectByName('Patient');

  const influences = {};
  if (morphMesh?.morphTargetDictionary && morphMesh.morphTargetInfluences) {
    for (const [name, slot] of Object.entries(morphMesh.morphTargetDictionary)) {
      if (name.startsWith('motion_') || name.startsWith('breathe_') || name.startsWith('pose_')) {
        influences[name] = +(morphMesh.morphTargetInfluences[slot] ?? 0).toFixed(5);
      }
    }
  }

  let chestWorld = null;
  let wristL = null;
  let wristR = null;
  if (patient?.isSkinnedMesh) {
    patient.updateMatrixWorld(true);
    patient.skeleton?.update();
    const pos = patient.geometry.attributes.position;
    const tmp = new THREE.Vector3();
    let chestY = -Infinity;
    let chestV = null;
    let leftX = Infinity;
    let rightX = -Infinity;
    let leftV = null;
    let rightV = null;
    for (let i = 0; i < pos.count; i += 8) {
      tmp.fromBufferAttribute(pos, i);
      const y = tmp.y;
      const x = tmp.x;
      if (y > 1.1 && y < 1.45 && Math.abs(x) < 0.12) {
        if (y > chestY) { chestY = y; chestV = i; }
      }
      if (y > 0.7 && y < 1.1) {
        if (x < leftX) { leftX = x; leftV = i; }
        if (x > rightX) { rightX = x; rightV = i; }
      }
    }
    const skinned = (index) => {
      if (index == null) return null;
      patient.getVertexPosition(index, tmp);
      tmp.applyMatrix4(patient.matrixWorld);
      return [+tmp.x.toFixed(5), +tmp.y.toFixed(5), +tmp.z.toFixed(5)];
    };
    chestWorld = skinned(chestV);
    wristL = skinned(leftV);
    wristR = skinned(rightV);
  }

  return {
    root: world(root),
    rootR: root ? [root.rotation.x, root.rotation.y, root.rotation.z].map(n => +n.toFixed(6)) : null,
    modelP: motionRoot ? world(motionRoot) : null,
    modelR: motionRoot ? [motionRoot.rotation.x, motionRoot.rotation.y, motionRoot.rotation.z].map(n => +n.toFixed(6)) : null,
    leftHand: world(leftHand),
    rightHand: world(rightHand),
    head: world(head),
    spine: world(spine),
    leftArmQ: quat(leftArm),
    rightArmQ: quat(rightArm),
    leftForeQ: quat(leftFore),
    rightForeQ: quat(rightFore),
    chestWorld,
    wristL,
    wristR,
    influences,
    motion: motionRoot?.userData?.patientMotion ?? null,
    gaspBoost: motionRoot?.userData?.idleGaspBoost ?? 0,
  };
});

const samples = [];
for (let i = 0; i < 40; i += 1) {
  samples.push(await sampleOnce());
  await page.waitForTimeout(150);
}

const valid = samples.filter(Boolean);
const rangeOf = (getter) => {
  const values = valid.map(getter).filter(v => Array.isArray(v));
  if (!values.length) return null;
  const axes = [0, 1, 2].map((axis) => {
    const nums = values.map(v => v[axis]);
    return +(Math.max(...nums) - Math.min(...nums)).toFixed(6);
  });
  const mag = Math.hypot(...axes);
  return { axes, magMm: +(mag * 1000).toFixed(2) };
};
const quatRange = (getter) => {
  const values = valid.map(getter).filter(v => Array.isArray(v));
  if (!values.length) return null;
  return [0, 1, 2, 3].map((i) => {
    const nums = values.map(v => v[i]);
    return +(Math.max(...nums) - Math.min(...nums)).toFixed(6);
  });
};
const inflRange = (name) => {
  const nums = valid.map(s => s.influences?.[name] ?? 0);
  return { min: +Math.min(...nums).toFixed(5), max: +Math.max(...nums).toFixed(5), span: +(Math.max(...nums) - Math.min(...nums)).toFixed(5) };
};

const result = {
  samples: valid.length,
  errors,
  firstInfluences: valid[0]?.influences ?? null,
  firstMotion: valid[0]?.motion ?? null,
  root: rangeOf(s => s.root),
  model: rangeOf(s => s.modelP),
  leftHand: rangeOf(s => s.leftHand),
  rightHand: rangeOf(s => s.rightHand),
  head: rangeOf(s => s.head),
  spine: rangeOf(s => s.spine),
  chestVerts: rangeOf(s => s.chestWorld),
  wristLVerts: rangeOf(s => s.wristL),
  wristRVerts: rangeOf(s => s.wristR),
  leftArmQ: quatRange(s => s.leftArmQ),
  rightArmQ: quatRange(s => s.rightArmQ),
  leftForeQ: quatRange(s => s.leftForeQ),
  rightForeQ: quatRange(s => s.rightForeQ),
  breathe: inflRange('breathe_chest_rise'),
  gasp: inflRange('motion_gasp'),
  agitation: inflRange('motion_agitation'),
  wince: inflRange('motion_wince'),
  tremor: inflRange('motion_tremor'),
  seizure: inflRange('motion_seizure'),
  clutch: inflRange('motion_clutch'),
  pose_tripod: inflRange('pose_tripod'),
};

console.log(JSON.stringify(result, null, 2));
await browser.close();
if (!valid.length) process.exit(1);
