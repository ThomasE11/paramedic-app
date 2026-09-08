import * as THREE from 'three';

/** Cache a skin vertex at each pulse landmark in the bind pose, then evaluate
 * that same vertex through the live morphs and skeleton on every frame. A
 * static (x,y) projection leaves wrist targets on the knees when arms bend.
 */
export function createPatientPulseAnchors(body: THREE.SkinnedMesh) {
  if (!body.isSkinnedMesh) return () => null;
  const cache = new Map<string, number>();
  const position = body.geometry.getAttribute('position');
  const skinIndex = body.geometry.getAttribute('skinIndex');
  const skinWeight = body.geometry.getAttribute('skinWeight');
  const point = new THREE.Vector3();
  const bindInverse = body.bindMatrix.clone().invert();

  return (site: string): [number, number, number] | null => {
    const match = /^pulse-(radial|carotid|pedal)-(left|right)$/.exec(site);
    if (!match || !skinIndex || !skinWeight) return null;
    let vertex = cache.get(site);
    if (vertex === undefined) {
      const [, type, side] = match;
      const boneName = type === 'radial' ? `${side === 'left' ? 'Left' : 'Right'}Hand`
        : type === 'pedal' ? `${side === 'left' ? 'Left' : 'Right'}Foot` : 'Neck';
      const bone = body.skeleton.bones.findIndex(b => b.name.replace(/^mixamorig:?/, '') === boneName);
      if (bone < 0) return null;
      const landmark = new THREE.Vector3().setFromMatrixPosition(body.skeleton.boneInverses[bone].clone().invert()).applyMatrix4(bindInverse);
      // Neck pulses sit to either side of the trachea, on the anterior surface.
      if (type === 'carotid') landmark.x += (side === 'left' ? 1 : -1) * .035;
      landmark.z += type === 'carotid' ? .07 : type === 'pedal' ? .06 : .025;
      let best = Infinity;
      vertex = -1;
      for (let i = 0; i < position.count; i++) {
        let weight = 0;
        for (let c = 0; c < 4; c++) if (skinIndex.getComponent(i, c) === bone) weight += skinWeight.getComponent(i, c);
        if (weight < .15) continue;
        const distance = point.fromBufferAttribute(position, i).distanceToSquared(landmark);
        if (distance < best) { best = distance; vertex = i; }
      }
      cache.set(site, vertex);
    }
    if (vertex < 0) return null;
    body.updateWorldMatrix(true, false);
    body.skeleton.update();
    body.getVertexPosition(vertex, point).applyMatrix4(body.matrixWorld);
    return point.toArray() as [number, number, number];
  };
}
