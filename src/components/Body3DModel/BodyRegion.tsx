/**
 * Individual clickable body region mesh with anatomical detail.
 * Handles hover highlighting, click-to-assess, color state, and tooltips.
 */

import { useState, useMemo } from 'react';
import { Html } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { BodyRegionDef, RegionGeometry } from './bodyRegions';
import { SKIN_COLOR, HOVER_COLOR, ASSESSED_COLOR, HOVER_EMISSIVE_INTENSITY } from './bodyRegions';

interface BodyRegionProps {
  def: BodyRegionDef;
  isAssessed: boolean;
  onRegionClick: (stepId: string) => void;
}

/** Create a Three.js geometry from config */
function createGeometry(geo: RegionGeometry): THREE.BufferGeometry {
  switch (geo.type) {
    case 'sphere':
      return new THREE.SphereGeometry(...(geo.args as [number, number, number]));
    case 'cylinder':
      return new THREE.CylinderGeometry(...(geo.args as [number, number, number, number]));
    case 'box': {
      const g = new THREE.BoxGeometry(...(geo.args as [number, number, number]), 2, 2, 2);
      // Round the edges slightly for organic look
      return g;
    }
    case 'capsule':
      return new THREE.CapsuleGeometry(...(geo.args as [number, number, number, number]));
    default:
      return new THREE.SphereGeometry(0.15);
  }
}

export function BodyRegion({ def, isAssessed, onRegionClick }: BodyRegionProps) {
  const [hovered, setHovered] = useState(false);

  const color = isAssessed ? ASSESSED_COLOR : hovered ? HOVER_COLOR : SKIN_COLOR;
  const emissive = hovered ? (isAssessed ? '#16a34a' : '#2563eb') : '#000000';
  const emissiveIntensity = hovered ? HOVER_EMISSIVE_INTENSITY : 0;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onRegionClick(def.id);
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  // Material props shared across all meshes in this region
  const materialProps = {
    color,
    emissive,
    emissiveIntensity,
    roughness: 0.7,
    metalness: 0.02,
    transparent: def.id === 'posterior-logroll',
    opacity: def.id === 'posterior-logroll' ? 0.6 : 1,
  };

  // Compound region (extremities, chest with shoulders, pelvis with hips)
  if (def.children && def.children.length > 0) {
    return (
      <group>
        {/* Main mesh (if not just a placeholder) */}
        {def.id !== 'extremities' && (() => {
          const geo = createGeometry(def.geometry);
          return (
            <mesh
              geometry={geo}
              position={def.position}
              rotation={def.rotation}
              scale={def.scale}
              onClick={handleClick}
              onPointerOver={handlePointerOver}
              onPointerOut={handlePointerOut}
            >
              <meshStandardMaterial {...materialProps} />
            </mesh>
          );
        })()}

        {/* Children meshes */}
        {def.children.map((child, i) => {
          const childGeo = createGeometry(child.geometry);
          return (
            <mesh
              key={i}
              geometry={childGeo}
              position={child.position}
              rotation={child.rotation}
              scale={child.scale}
              onClick={handleClick}
              onPointerOver={handlePointerOver}
              onPointerOut={handlePointerOut}
            >
              <meshStandardMaterial {...materialProps} />
            </mesh>
          );
        })}

        {/* Tooltip */}
        {hovered && (
          <Html
            position={def.id === 'extremities' ? [0.9, 2.5, 0] : [0.6, def.position[1], 0]}
            distanceFactor={5}
            zIndexRange={[100, 0]}
          >
            <div className="px-2.5 py-1.5 rounded-lg bg-black/85 text-white text-[11px] font-medium whitespace-nowrap pointer-events-none shadow-lg border border-white/10">
              <div className="font-semibold">{def.label} {isAssessed ? '✓' : ''}</div>
              <div className="text-[9px] text-white/60 mt-0.5 max-w-[180px]">{def.description}</div>
            </div>
          </Html>
        )}
      </group>
    );
  }

  // Single region mesh
  const geometry = useMemo(() => createGeometry(def.geometry), [def.geometry]);

  return (
    <mesh
      geometry={geometry}
      position={def.position}
      rotation={def.rotation}
      scale={def.scale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <meshStandardMaterial {...materialProps} />
      {hovered && (
        <Html distanceFactor={5} zIndexRange={[100, 0]} position={[0.5, 0.15, 0]}>
          <div className="px-2.5 py-1.5 rounded-lg bg-black/85 text-white text-[11px] font-medium whitespace-nowrap pointer-events-none shadow-lg border border-white/10">
            <div className="font-semibold">{def.label} {isAssessed ? '✓' : ''}</div>
            <div className="text-[9px] text-white/60 mt-0.5 max-w-[180px]">{def.description}</div>
          </div>
        </Html>
      )}
    </mesh>
  );
}
