import * as THREE from 'three';

// These authored motions are near-rigid at the pilot's eye sockets. Clinical
// swelling/droop and non-rigid recovery-pose deformation are deliberately NOT
// treated as translations of the globe.
const ORBIT_MOTIONS = ['motion_gasp', 'motion_wince', 'motion_agitation'] as const;

/** Follow the skinned lids' orbital displacement without altering gaze or pupils. */
export function createEyeMorphFollower(root: THREE.Object3D, body: THREE.SkinnedMesh, lids: THREE.SkinnedMesh): () => void {
  const positions = lids.geometry.getAttribute('position');
  const joints = lids.geometry.getAttribute('skinIndex');
  const weights = lids.geometry.getAttribute('skinWeight');
  const bindLinear = new THREE.Matrix3().setFromMatrix4(lids.bindMatrix);
  const followers = ['L', 'R'].flatMap(side => {
    const eye = root.getObjectByName(`eye${side}`);
    if (!eye?.parent) return [];
    // The clinical asset faces +Z: patient-left vertices have positive X.
    const vertices = Array.from({ length: positions.count }, (_, i) => i)
      .filter(i => (positions.getX(i) > 0) === (side === 'L'));
    if (!vertices.length) return [];
    const motions = ORBIT_MOTIONS.flatMap(name => {
      const sourceIndex = body.morphTargetDictionary?.[name];
      const lidIndex = lids.morphTargetDictionary?.[name];
      const attribute = lidIndex === undefined ? undefined : lids.geometry.morphAttributes.position?.[lidIndex];
      if (sourceIndex === undefined || !attribute) return [];
      const boneDeltas = new Map<number, THREE.Vector3>();
      for (const vertex of vertices) {
        const delta = new THREE.Vector3().fromBufferAttribute(attribute, vertex);
        if (!lids.geometry.morphTargetsRelative) delta.sub(new THREE.Vector3().fromBufferAttribute(positions, vertex));
        delta.applyMatrix3(bindLinear);
        for (let lane = 0; lane < 4; lane++) {
          const weight = weights.getComponent(vertex, lane) / vertices.length;
          if (!weight) continue;
          const joint = joints.getComponent(vertex, lane);
          if (!boneDeltas.has(joint)) boneDeltas.set(joint, new THREE.Vector3());
          boneDeltas.get(joint)!.addScaledVector(delta, weight);
        }
      }
      return [{ sourceIndex, boneDeltas }];
    });
    return [{ eye, neutral: eye.position.clone(), motions }];
  });
  const matrix = new THREE.Matrix4(), linear = new THREE.Matrix3();
  const offset = new THREE.Vector3(), transformed = new THREE.Vector3();
  return () => {
    for (const { eye, neutral, motions } of followers) {
      offset.set(0, 0, 0);
      for (const { sourceIndex, boneDeltas } of motions) {
        const influence = body.morphTargetInfluences?.[sourceIndex] ?? 0;
        if (!influence) continue;
        for (const [joint, delta] of boneDeltas) {
          // Direction transforms only: translations must not be added twice.
          matrix.copy(eye.parent!.matrixWorld).invert().multiply(body.matrixWorld)
            .multiply(lids.bindMatrixInverse).multiply(lids.skeleton.bones[joint].matrixWorld)
            .multiply(lids.skeleton.boneInverses[joint]);
          linear.setFromMatrix4(matrix);
          offset.addScaledVector(transformed.copy(delta).applyMatrix3(linear), influence);
        }
      }
      eye.position.copy(neutral).add(offset);
      eye.updateMatrixWorld(true);
    }
  };
}
