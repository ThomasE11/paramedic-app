import * as THREE from 'three';

/** Call on the normalised, unposed patient clone, before it enters the scene.
 * The inverse bind frame preserves clinical coordinates while the real head
 * bone supplies every subsequent lean, turn and root movement. */
export function createFaceAttachment(root: THREE.Object3D, patientScale: number): THREE.Group | null {
  const head = root.getObjectByName('mixamorigHead') ?? root.getObjectByName('mixamorig:Head');
  if (!head) return null;
  head.updateWorldMatrix(true, false);
  const frame = new THREE.Group();
  frame.name = 'PatientFaceAttachment';
  frame.matrixAutoUpdate = false;
  frame.matrix.copy(head.matrixWorld).invert()
    .multiply(new THREE.Matrix4().makeScale(patientScale, patientScale, patientScale));
  head.add(frame);
  return frame;
}
