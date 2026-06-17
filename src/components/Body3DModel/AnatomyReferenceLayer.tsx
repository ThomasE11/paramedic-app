import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';

interface AnatomyReferenceLayerProps {
  visible: boolean;
}

export function AnatomyReferenceLayer({ visible }: AnatomyReferenceLayerProps) {
  const { scene } = useGLTF('/models/open3d-skeleton.glb');

  const anatomyScene = useMemo(() => {
    const clone = cloneSkeleton(scene) as THREE.Group;

    clone.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.raycast = () => null;
      mesh.material = new THREE.MeshStandardMaterial({
        color: '#f6ead7',
        roughness: 0.62,
        metalness: 0.02,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      mesh.renderOrder = 2;
    });

    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    const height = box.max.y - box.min.y;
    if (Number.isFinite(height) && height > 0.5) {
      const targetHeight = 1.8;
      const modelScale = targetHeight / height;
      const center = box.getCenter(new THREE.Vector3());
      clone.scale.setScalar(modelScale);
      clone.position.set(
        -center.x * modelScale,
        -box.min.y * modelScale,
        -center.z * modelScale,
      );
      clone.updateMatrixWorld(true);
    }

    return clone;
  }, [scene]);

  if (!visible) return null;

  return (
    <group>
      <primitive object={anatomyScene} />
    </group>
  );
}

useGLTF.preload('/models/open3d-skeleton.glb');
