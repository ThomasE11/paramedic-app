import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { kenneyChairPlant, KENNEY_CHAIR_NATIVE, type KenneyChairKind } from '@/lib/kenneyChairPlant';

const NO_RAYCAST = () => null;

/**
 * License-clean Kenney CC0 chair, scaled and recentred onto the seated
 * patient plant. Corner-origin GLBs would otherwise read as a tiny crate
 * sitting beside the patient.
 */
export function KenneyPatientChair({
  kind,
  name,
}: {
  kind: KenneyChairKind;
  name: string;
}) {
  const plant = kenneyChairPlant(kind);
  const { scene } = useGLTF(plant.url);
  const clone = useMemo(() => {
    const next = scene.clone(true);
    next.traverse(object => {
      object.raycast = NO_RAYCAST;
      object.castShadow = true;
      object.receiveShadow = true;
    });
    return next;
  }, [scene]);
  return <primitive name={name} object={clone} position={plant.position} scale={plant.scale} />;
}

(Object.values(KENNEY_CHAIR_NATIVE) as Array<(typeof KENNEY_CHAIR_NATIVE)[KenneyChairKind]>).forEach(entry => {
  useGLTF.preload(entry.url);
});
