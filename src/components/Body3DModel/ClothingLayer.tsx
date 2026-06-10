/**
 * Stylised clothing layer — the "Dressed" view.
 *
 * The patient GLBs are body-only (no clothing geometry), so a dressed view
 * can't be a simple visibility flip like skin↔skeleton. Instead we drape a
 * lightweight set of scrub-coloured primitives OVER the existing body, sized
 * to the real (measured) torso/leg geometry of the normalised mesh:
 *
 *   • the body is normalised to height 1.8 (feet Y=0, head ≈ Y=1.8),
 *     centred on X and Z, camera at +Z, +X = patient's left;
 *   • torso front surface sits at Z ≈ +0.045, torso half-width ≈ 0.17–0.19
 *     from chest down to hip; each leg is centred at X ≈ ±0.131, radius ≈ 0.066.
 *
 * The garment is intentionally a touch loose so it reads as fabric and never
 * clips the skin. It does NOT breathe with the chest morph — acceptable for a
 * stylised layer, and the chest garment is hidden the moment you assess the
 * chest anyway.
 *
 * Exam workflow: focusing a region "parts" the clothing over it (the covering
 * piece hides) so the exposed skin underneath can be assessed — mirroring how
 * you'd lift a top or drop a waistband to examine a patient.
 */

import { useMemo } from 'react';
import * as THREE from 'three';

interface ClothingLayerProps {
  /** True only in the "Dressed" view layer. */
  visible: boolean;
  /** The region currently focused, so its covering garment can part. */
  activeRegion?: string | null;
}

// Scrub colours — clinical teal for the top, a shade darker for the trousers.
const TOP_COLOR = '#41908b';
const TROUSER_COLOR = '#347470';

// Lathe profile for the scrub top: Vector2(radius, y), revolved about Y and
// then flattened in Z (group scale) into a torso ellipse. Shaped neck →
// shoulders → chest → waist → hem to follow the measured torso barrel.
const TOP_PROFILE: THREE.Vector2[] = [
  [0.168, 0.86], // hem
  [0.183, 0.93],
  [0.178, 1.03],
  [0.176, 1.16], // xiphoid
  [0.180, 1.27], // chest
  [0.158, 1.38], // upper chest
  [0.120, 1.44], // shoulder base
  [0.095, 1.47], // neckline
].map(([r, y]) => new THREE.Vector2(r, y));

export function ClothingLayer({ visible, activeRegion }: ClothingLayerProps) {
  const topGeometry = useMemo(() => new THREE.LatheGeometry(TOP_PROFILE, 32), []);

  // Which garment pieces "part" for the focused region.
  const hideTop = activeRegion === 'chest' || activeRegion === 'abdomen' || activeRegion === 'posterior-logroll';
  const hideLSleeve = activeRegion === 'left-arm';
  const hideRSleeve = activeRegion === 'right-arm';
  const hideWaist = activeRegion === 'pelvis';
  const hideLLeg = activeRegion === 'left-leg' || activeRegion === 'pelvis';
  const hideRLeg = activeRegion === 'right-leg' || activeRegion === 'pelvis';

  return (
    <group visible={visible}>
      {/* Scrub top — lathe revolved then flattened front-to-back. Sits a hair
          in front of the torso (front ≈ +0.07 vs skin +0.045). */}
      <group visible={!hideTop} position={[0, 0, -0.02]} scale={[1, 1, 0.52]}>
        <mesh geometry={topGeometry} castShadow>
          <meshStandardMaterial color={TOP_COLOR} roughness={0.82} metalness={0} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Short sleeves over the deltoid / upper arm. Tilt outward so the hem
          follows the arm as it drops away from the shoulder. */}
      <mesh visible={!hideLSleeve} position={[0.166, 1.31, -0.01]} rotation={[0, 0, 0.17]} scale={[1, 1, 0.85]} castShadow>
        <cylinderGeometry args={[0.082, 0.072, 0.21, 20]} />
        <meshStandardMaterial color={TOP_COLOR} roughness={0.82} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      <mesh visible={!hideRSleeve} position={[-0.166, 1.31, -0.01]} rotation={[0, 0, -0.17]} scale={[1, 1, 0.85]} castShadow>
        <cylinderGeometry args={[0.082, 0.072, 0.21, 20]} />
        <meshStandardMaterial color={TOP_COLOR} roughness={0.82} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      {/* Trouser waistband — tucked under the top hem so it reads as one outfit. */}
      <mesh visible={!hideWaist} position={[0, 0.84, -0.02]} scale={[1, 1, 0.52]} castShadow>
        <cylinderGeometry args={[0.178, 0.176, 0.11, 28]} />
        <meshStandardMaterial color={TROUSER_COLOR} roughness={0.85} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      {/* Trouser legs — one per measured leg centre (x ±0.131), tapered
          thigh → ankle, kept nearly round in Z. */}
      <mesh visible={!hideLLeg} position={[0.131, 0.52, -0.02]} scale={[1, 1, 0.95]} castShadow>
        <cylinderGeometry args={[0.104, 0.072, 0.70, 20]} />
        <meshStandardMaterial color={TROUSER_COLOR} roughness={0.85} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      <mesh visible={!hideRLeg} position={[-0.131, 0.52, -0.02]} scale={[1, 1, 0.95]} castShadow>
        <cylinderGeometry args={[0.104, 0.072, 0.70, 20]} />
        <meshStandardMaterial color={TROUSER_COLOR} roughness={0.85} metalness={0} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
