/**
 * Individual clickable body region mesh.
 * Handles hover highlighting, click-to-assess, and color state.
 */

import { useState, useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { BodyRegionDef, RegionGeometry } from './bodyRegions';
import { SKIN_COLOR, HOVER_COLOR, ASSESSED_COLOR, HOVER_EMISSIVE_INTENSITY } from './bodyRegions';

interface BodyRegionProps {
  def: BodyRegionDef;
  isAssessed: boolean;
  onRegionClick: (stepId: string) => void;
}

/** Create a Three.js geometry from our config */
function createGeometry(geo: RegionGeometry): THREE.BufferGeometry {
  switch (geo.type) {
    case 'sphere':
      return new THREE.SphereGeometry(...(geo.args as [number, number, number]));
    case 'cylinder':
      return new THREE.CylinderGeometry(...(geo.args as [number, number, number, number]));
    case 'box':
      return new THREE.BoxGeometry(...(geo.args as [number, number, number]));
    case 'capsule':
      return new THREE.CapsuleGeometry(...(geo.args as [number, number, number, number]));
    default:
      return new THREE.SphereGeometry(0.2);
  }
}

export function BodyRegion({ def, isAssessed, onRegionClick }: BodyRegionProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => createGeometry(def.geometry), [def.geometry]);

  const color = isAssessed ? ASSESSED_COLOR : hovered ? HOVER_COLOR : SKIN_COLOR;
  const emissive = hovered ? (isAssessed ? '#22c55e' : '#3b82f6') : '#000000';
  const emissiveIntensity = hovered ? HOVER_EMISSIVE_INTENSITY : 0;

  const handleClick = (e: THREE.Event) => {
    e.stopPropagation();
    onRegionClick(def.id);
  };

  const handlePointerOver = (e: THREE.Event) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  // Compound region (extremities) — render children as a group
  if (def.children && def.children.length > 0) {
    return (
      <group>
        {def.children.map((child, i) => {
          const childGeo = createGeometry(child.geometry);
          return (
            <mesh
              key={i}
              geometry={childGeo}
              position={child.position}
              rotation={child.rotation ? new THREE.Euler(...child.rotation) : undefined}
              scale={child.scale}
              onClick={handleClick}
              onPointerOver={handlePointerOver}
              onPointerOut={handlePointerOut}
            >
              <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={emissiveIntensity}
                roughness={0.6}
                metalness={0.05}
              />
            </mesh>
          );
        })}
        {/* Tooltip on hover — positioned at group center */}
        {hovered && (
          <Html position={[0.8, 1.5, 0]} distanceFactor={5} zIndexRange={[100, 0]}>
            <div className="px-2 py-1 rounded-md bg-black/80 text-white text-[10px] font-medium whitespace-nowrap pointer-events-none">
              {def.label} {isAssessed ? '✓' : ''}
            </div>
          </Html>
        )}
      </group>
    );
  }

  // Single region mesh
  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={def.position}
      rotation={def.rotation ? new THREE.Euler(...def.rotation) : undefined}
      scale={def.scale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={0.6}
        metalness={0.05}
        transparent={def.id === 'posterior-logroll'}
        opacity={def.id === 'posterior-logroll' ? 0.7 : 1}
      />
      {/* Tooltip on hover */}
      {hovered && (
        <Html distanceFactor={5} zIndexRange={[100, 0]} position={[0.5, 0.2, 0]}>
          <div className="px-2 py-1 rounded-md bg-black/80 text-white text-[10px] font-medium whitespace-nowrap pointer-events-none">
            {def.label} {isAssessed ? '✓' : ''}
          </div>
        </Html>
      )}
    </mesh>
  );
}
