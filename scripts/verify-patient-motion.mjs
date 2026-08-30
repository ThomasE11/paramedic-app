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
  const eyeCues = await page.evaluate(() => {
    const scene = window.__r3f?.scene;
    const read = name => {
      const object = scene?.getObjectByName(name);
      const material = Array.isArray(object?.material) ? object.material[0] : object?.material;
      return {
        visible: object?.visible === true,
        colour: material?.color?.getHexString?.() ?? null,
        material: material?.name ?? null,
        scale: object?.scale?.x ?? null,
      };
    };
    return Object.fromEntries(
      ['eyeL', 'irisL', 'pupilL', 'eyeR', 'irisR', 'pupilR'].map(name => [name, read(name)]),
    );
  });
  const appearanceCues = await page.evaluate(() => {
    const scene = window.__r3f?.scene;
    const body = scene?.getObjectByName('Patient');
    const bodyPosition = body?.geometry?.attributes?.position;
    if (!body || !bodyPosition) return null;
    let bodyMinY = Infinity;
    let bodyMaxY = -Infinity;
    for (let i = 0; i < bodyPosition.count; i++) {
      bodyMinY = Math.min(bodyMinY, bodyPosition.getY(i));
      bodyMaxY = Math.max(bodyMaxY, bodyPosition.getY(i));
    }
    const bodyHeight = bodyMaxY - bodyMinY;
    const read = name => {
      const object = scene.getObjectByName(name);
      const position = object?.geometry?.attributes?.position;
      let minY = Infinity;
      let maxY = -Infinity;
      for (let i = 0; position && i < position.count; i++) {
        minY = Math.min(minY, position.getY(i));
        maxY = Math.max(maxY, position.getY(i));
      }
      return {
        exists: Boolean(object),
        skinned: object?.isSkinnedMesh === true,
        sharedSkeleton: object?.skeleton === body.skeleton,
        vertices: position?.count ?? 0,
        morphs: object?.morphTargetInfluences?.length ?? 0,
        minHeightFraction: Number.isFinite(minY) ? (minY - bodyMinY) / bodyHeight : null,
        maxHeightFraction: Number.isFinite(maxY) ? (maxY - bodyMinY) / bodyHeight : null,
      };
    };
    return Object.fromEntries(
      ['patient-hair', 'patient-brow-left', 'patient-brow-right'].map(name => [name, read(name)]),
    );
  });

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
      let leftForearm = null;
      let rightForearm = null;
      scene.traverse(object => {
        if (!motionRoot && object.userData?.patientMotion) motionRoot = object;
        if (!morphMesh && object.morphTargetDictionary?.motion_gasp != null) morphMesh = object;
        if (!garmentTop && object.name === 'scrub-top') garmentTop = object;
        const normalisedName = object.name.replace(/:/g, '').toLowerCase();
        if (!leftArm && normalisedName === 'mixamorigleftarm') leftArm = object;
        if (!rightArm && normalisedName === 'mixamorigrightarm') rightArm = object;
        if (!leftForearm && normalisedName === 'mixamorigleftforearm') leftForearm = object;
        if (!rightForearm && normalisedName === 'mixamorigrightforearm') rightForearm = object;
      });
      if (
        !motionRoot || !morphMesh || !garmentTop
        || !leftArm || !rightArm || !leftForearm || !rightForearm
      ) return null;

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
        leftForearm: leftForearm.quaternion.toArray(),
        rightForearm: rightForearm.quaternion.toArray(),
        garmentSkinned: garmentTop.isSkinnedMesh === true,
        eyesVisible: scene.getObjectByName('eyeL')?.visible === true
          && scene.getObjectByName('eyeR')?.visible === true,
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
    leftForearmQuaternionRange: [0, 1, 2, 3].map(component => quaternionRange('leftForearm', component)),
    rightForearmQuaternionRange: [0, 1, 2, 3].map(component => quaternionRange('rightForearm', component)),
    garmentSkinned: valid.every(sample => sample.garmentSkinned),
    eyeOpenSamples: valid.filter(sample => sample.eyesVisible).length,
    eyeCues,
    appearanceCues,
    breathing: maxRange('breathe_chest_rise'),
    gasp: maxRange('motion_gasp'),
    agitation: maxRange('motion_agitation'),
    errors,
  };

  // A pacing patient exercises the full locomotion path: skeletal walk clip,
  // arm swing, real root displacement and the Blender outer garment plus its
  // body-indexed seam underlay. Every visible clothing mesh must remain bound
  // to the same skeleton as the patient while the root moves across the bay.
  await page.goto(`${base}/?devLiveCase=psych-003&capture&model=${model}`, {
    waitUntil: 'networkidle',
    timeout: 60_000,
  });
  await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(2_500);
  const walkingSamples = [];
  for (let index = 0; index < 32; index += 1) {
    walkingSamples.push(await page.evaluate(() => {
      const scene = window.__r3f?.scene;
      const body = scene?.getObjectByName('Patient');
      let motionRoot = null;
      scene?.traverse(object => {
        if (!motionRoot && object.userData?.patientMotion) motionRoot = object;
      });
      if (!scene || !body || !motionRoot || !body.isSkinnedMesh) return null;
      const walkingRoot = motionRoot.parent ?? motionRoot;
      const garments = [];
      scene.traverse(object => {
        if (object.name === 'scrub-top' || object.name === 'scrub-trousers') garments.push(object);
      });
      return {
        position: walkingRoot.position.toArray(),
        garmentCount: garments.length,
        garmentsSkinned: garments.every(garment => garment.isSkinnedMesh),
        sharedSkeleton: garments.every(garment => garment.skeleton === body.skeleton),
      };
    }));
    await page.waitForTimeout(250);
  }
  const validWalking = walkingSamples.filter(Boolean);
  const walkingRootRange = [0, 1, 2].map(axis => {
    const values = validWalking.map(sample => sample.position[axis]);
    return Math.max(...values) - Math.min(...values);
  });
  result.walking = {
    samples: validWalking.length,
    rootPositionRange: walkingRootRange,
    garmentCount: Math.min(...validWalking.map(sample => sample.garmentCount)),
    garmentsSkinned: validWalking.every(sample => sample.garmentsSkinned),
    sharedSkeleton: validWalking.every(sample => sample.sharedSkeleton),
  };

  // A paediatric case must use the surface-derived garment rather than the
  // adult Blender shell. Besides counting the expected two procedural pieces,
  // verify that the top stays below the head and overlaps the trouser waist.
  await page.goto(`${base}/?devLiveCase=trauma-012&capture`, {
    waitUntil: 'networkidle',
    timeout: 60_000,
  });
  await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(2_500);
  result.paediatricGarment = await page.evaluate(() => {
    const scene = window.__r3f?.scene;
    const body = scene?.getObjectByName('Patient');
    const bodyPosition = body?.geometry?.attributes?.position;
    if (!scene || !body || !bodyPosition) return null;

    let bodyMinY = Infinity;
    let bodyMaxY = -Infinity;
    for (let index = 0; index < bodyPosition.count; index += 1) {
      bodyMinY = Math.min(bodyMinY, bodyPosition.getY(index));
      bodyMaxY = Math.max(bodyMaxY, bodyPosition.getY(index));
    }
    const bodyHeight = bodyMaxY - bodyMinY;
    const garments = [];
    scene.traverse(object => {
      if (object.name !== 'scrub-top' && object.name !== 'scrub-trousers') return;
      const position = object.geometry?.attributes?.position;
      let minY = Infinity;
      let maxY = -Infinity;
      for (let index = 0; position && index < position.count; index += 1) {
        minY = Math.min(minY, position.getY(index));
        maxY = Math.max(maxY, position.getY(index));
      }
      garments.push({
        name: object.name,
        minHeightFraction: (minY - bodyMinY) / bodyHeight,
        maxHeightFraction: (maxY - bodyMinY) / bodyHeight,
        sharedSkeleton: object.isSkinnedMesh === true && object.skeleton === body.skeleton,
      });
    });
    return { garments };
  });

  await page.screenshot({ path: `test-results/patient-motion-${model}-paediatric-verified.png` });
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
  if (
    [...result.leftForearmQuaternionRange, ...result.rightForearmQuaternionRange]
      .some(range => range > 1e-6)
  ) {
    throw new Error(
      `Patient forearms accumulated unstable rotation: ${[
        ...result.leftForearmQuaternionRange,
        ...result.rightForearmQuaternionRange,
      ].join(', ')}`,
    );
  }
  if (!result.garmentSkinned) {
    throw new Error('Patient garment is not bound to the clinical skeleton');
  }
  const eyeLuminance = hex => {
    if (!hex || !/^[0-9a-f]{6}$/i.test(hex)) return Infinity;
    const channels = [0, 2, 4].map(offset => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  for (const side of ['L', 'R']) {
    const sclera = result.eyeCues[`eye${side}`];
    const iris = result.eyeCues[`iris${side}`];
    const pupil = result.eyeCues[`pupil${side}`];
    if (sclera.material !== 'eye_sclera' || iris.material !== 'eye_iris' || pupil.material !== 'eye_pupil') {
      throw new Error(`Patient ${side} eye has incorrect material mapping: ${JSON.stringify({ sclera, iris, pupil })}`);
    }
    if (eyeLuminance(iris.colour) >= eyeLuminance(sclera.colour) * 0.65) {
      throw new Error(`Patient ${side} iris is not visibly darker than the sclera: ${JSON.stringify({ sclera, iris })}`);
    }
    if (eyeLuminance(pupil.colour) >= eyeLuminance(iris.colour) * 0.45) {
      throw new Error(`Patient ${side} pupil is not visibly darker than the iris: ${JSON.stringify({ iris, pupil })}`);
    }
    if (typeof pupil.scale !== 'number' || pupil.scale < 0.4 || pupil.scale > 1.8) {
      throw new Error(`Patient ${side} pupil diameter did not map to a safe visual scale: ${pupil.scale}`);
    }
  }
  if (result.eyeOpenSamples < 1) {
    throw new Error('Patient eyes never opened during the respiratory motion sample');
  }
  if (!result.appearanceCues) throw new Error('Patient appearance layer was unavailable');
  const hair = result.appearanceCues['patient-hair'];
  const leftBrow = result.appearanceCues['patient-brow-left'];
  const rightBrow = result.appearanceCues['patient-brow-right'];
  for (const [name, cue] of Object.entries({ hair, leftBrow, rightBrow })) {
    if (!cue?.exists || !cue.skinned || !cue.sharedSkeleton || cue.morphs < 10) {
      throw new Error(`Patient ${name} detached from the clinical rig: ${JSON.stringify(cue)}`);
    }
  }
  if (hair.vertices < 120 || hair.minHeightFraction < 0.9) {
    throw new Error(`Patient hairline left the scalp region: ${JSON.stringify(hair)}`);
  }
  for (const brow of [leftBrow, rightBrow]) {
    if (brow.vertices < 40 || brow.minHeightFraction < 0.9 || brow.maxHeightFraction > 0.98) {
      throw new Error(`Patient eyebrow left the orbital region: ${JSON.stringify(brow)}`);
    }
  }
  if (result.breathing.max - result.breathing.min < 0.04) {
    throw new Error('Respiratory morph did not visibly change');
  }
  if (result.gasp.max < 0.3) {
    throw new Error('Hypoxic gasp morph did not activate');
  }
  if (validWalking.length !== 32 || walkingRootRange[0] < 0.25) {
    throw new Error(`Pacing patient did not walk across the bay: ${walkingRootRange.join(', ')}`);
  }
  if (result.walking.garmentCount < 4 || !result.walking.garmentsSkinned || !result.walking.sharedSkeleton) {
    throw new Error(`Walking garment lost its patient skeleton: ${JSON.stringify(result.walking)}`);
  }
  const paediatricGarments = result.paediatricGarment?.garments ?? [];
  const paediatricTop = paediatricGarments.find(garment => garment.name === 'scrub-top');
  const paediatricTrousers = paediatricGarments.find(garment => garment.name === 'scrub-trousers');
  if (
    paediatricGarments.length !== 2
    || !paediatricGarments.every(garment => garment.sharedSkeleton)
    || !paediatricTop || !paediatricTrousers
  ) {
    throw new Error(`Paediatric garment did not use the fitted procedural pair: ${JSON.stringify(paediatricGarments)}`);
  }
  if (
    paediatricTop.maxHeightFraction > 0.93
    || paediatricTop.minHeightFraction > 0.51
    || paediatricTrousers.maxHeightFraction < 0.54
  ) {
    throw new Error(`Paediatric garment left the intended torso/waist region: ${JSON.stringify(paediatricGarments)}`);
  }
  if (errors.length) throw new Error(errors.join('\n'));
} finally {
  await browser.close();
}
