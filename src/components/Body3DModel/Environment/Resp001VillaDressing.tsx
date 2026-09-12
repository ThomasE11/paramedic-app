import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { resp001VillaMeshVisible } from './sceneProfile';

const VILLA_DRESSING_URL = '/models/scenes/resp-001-villa-dressing.glb';
const NO_RAYCAST = () => null;

/**
 * Case-specific furniture and narrative dressing for severe asthma.
 *
 * The asset is authored at room scale in Blender. It includes a padded chair
 * at the shared seat plant but excludes the room shell, so floor registration,
 * orbit bounds and adaptive shadows remain under the shared environment. The
 * chair's named meshes hide when the patient moves to another support surface.
 */
export function Resp001VillaDressing({
  shadowsEnabled,
  showPatientSeat,
}: {
  shadowsEnabled: boolean;
  showPatientSeat: boolean;
}) {
  const { scene } = useGLTF(VILLA_DRESSING_URL);
  const dressing = useMemo(() => {
    const clone = scene.clone(true);
    clone.name = 'resp-001-villa-dressing';
    clone.traverse(object => {
      object.raycast = NO_RAYCAST;
      if (object instanceof THREE.Mesh) {
        object.visible = resp001VillaMeshVisible(object.name, showPatientSeat);
        object.castShadow = shadowsEnabled;
        object.receiveShadow = true;
      }
    });
    return clone;
  }, [scene, shadowsEnabled, showPatientSeat]);

  return <primitive object={dressing} />;
}
