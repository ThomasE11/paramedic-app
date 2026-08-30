import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:5173';
const model = process.argv[3] === 'female' ? 'female' : 'male';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});

try {
  await page.goto(`${base}/?devLiveCase=resp-001&capture&model=${model}`, {
    waitUntil: 'networkidle',
    timeout: 60_000,
  });
  await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(2_500);

  const samples = [];
  for (let index = 0; index < 48; index += 1) {
    samples.push(await page.evaluate(() => {
      const state = window.__r3f;
      const scene = state?.scene;
      if (!scene) return null;

      let motionRoot = null;
      let morphMesh = null;
      let garmentTop = null;
      let leftArm = null;
      let rightArm = null;
      scene.traverse(object => {
        if (!motionRoot && object.userData?.patientMotion) motionRoot = object;
        if (!morphMesh && object.morphTargetDictionary?.motion_gasp != null) morphMesh = object;
        if (!garmentTop && object.name === 'scrub-top') garmentTop = object;
        const normalisedName = object.name.replace(/:/g, '').toLowerCase();
        if (!leftArm && normalisedName === 'mixamorigleftarm') leftArm = object;
        if (!rightArm && normalisedName === 'mixamorigrightarm') rightArm = object;
      });
      if (!motionRoot || !morphMesh || !garmentTop || !leftArm || !rightArm) return null;

      const influences = {};
      for (const [name, slot] of Object.entries(morphMesh.morphTargetDictionary)) {
        if (name.startsWith('motion_') || name === 'breathe_chest_rise') {
          influences[name] = morphMesh.morphTargetInfluences?.[slot] ?? 0;
        }
      }
      return {
        position: motionRoot.position.toArray(),
        rotation: motionRoot.rotation.toArray().slice(0, 3),
        leftArm: leftArm.quaternion.toArray(),
        rightArm: rightArm.quaternion.toArray(),
        garmentSkinned: garmentTop.isSkinnedMesh === true,
        influences,
      };
    }));
    await page.waitForTimeout(250);
  }

  const valid = samples.filter(Boolean);
  if (!valid.length) throw new Error('No patient motion samples were available');

  const maxRange = key => {
    const values = valid.map(sample => sample.influences[key] ?? 0);
    return { min: Math.min(...values), max: Math.max(...values) };
  };
  const rootRange = axis => {
    const values = valid.map(sample => sample.position[axis]);
    return Math.max(...values) - Math.min(...values);
  };
  const rotationRange = axis => {
    const values = valid.map(sample => sample.rotation[axis]);
    return Math.max(...values) - Math.min(...values);
  };
  const quaternionRange = (side, component) => {
    const values = valid.map(sample => sample[side][component]);
    return Math.max(...values) - Math.min(...values);
  };

  const result = {
    samples: valid.length,
    rootPositionRange: [rootRange(0), rootRange(1), rootRange(2)],
    rootRotationRange: [rotationRange(0), rotationRange(1), rotationRange(2)],
    leftArmQuaternionRange: [0, 1, 2, 3].map(component => quaternionRange('leftArm', component)),
    rightArmQuaternionRange: [0, 1, 2, 3].map(component => quaternionRange('rightArm', component)),
    garmentSkinned: valid.every(sample => sample.garmentSkinned),
    breathing: maxRange('breathe_chest_rise'),
    gasp: maxRange('motion_gasp'),
    agitation: maxRange('motion_agitation'),
    errors,
  };

  await page.screenshot({ path: `test-results/patient-motion-${model}-verified.png` });
  console.log(JSON.stringify(result, null, 2));

  if (result.rootPositionRange.some(range => range > 1e-6)) {
    throw new Error(`Patient root translated during local motion: ${result.rootPositionRange.join(', ')}`);
  }
  if (result.rootRotationRange.some(range => range > 1e-6)) {
    throw new Error(`Patient root rotated during local motion: ${result.rootRotationRange.join(', ')}`);
  }
  if ([...result.leftArmQuaternionRange, ...result.rightArmQuaternionRange].some(range => range > 1e-6)) {
    throw new Error(
      `Patient upper arms accumulated unstable rotation: ${[
        ...result.leftArmQuaternionRange,
        ...result.rightArmQuaternionRange,
      ].join(', ')}`,
    );
  }
  if (!result.garmentSkinned) {
    throw new Error('Patient garment is not bound to the clinical skeleton');
  }
  if (result.breathing.max - result.breathing.min < 0.04) {
    throw new Error('Respiratory morph did not visibly change');
  }
  if (result.gasp.max < 0.3) {
    throw new Error('Hypoxic gasp morph did not activate');
  }
  if (errors.length) throw new Error(errors.join('\n'));
} finally {
  await browser.close();
}
