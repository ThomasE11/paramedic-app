/**
 * DeviceLayer — REAL 3D equipment fitted to the patient (realism directive:
 * "clinical action should never be only a toast"). Replaces the floating 2D
 * sticker cards for the oxygen family and IV/fluids with lit, occluded,
 * patient-anchored meshes: a transparent mask shell over nose and mouth, a
 * reservoir bag that breathes in counter-phase with the patient, nebulizer
 * mist, a nasal cannula line, CPAP strap, an IV cannula taped to the forearm
 * and a fluid line running up to a drip stand.
 *
 * Every mesh is raycast-transparent (clicks pass through to the body — the
 * directive: equipment must never block assessment) and positions are
 * sampler-projected onto the actual loaded mesh, so devices fit the male and
 * female patients without per-model tuning.
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getBreathPhase01 } from '@/lib/breathClock';
import type { SurfaceSampler } from './BodyMesh';

export type DeviceOxygenMode = 'nasal' | 'simple-mask' | 'nonrebreather' | 'nebulizer' | 'cpap' | null;

interface DeviceLayerProps {
  oxygenMode: DeviceOxygenMode;
  hasIvAccess: boolean;
  hasFluids: boolean;
  sampler: SurfaceSampler | null;
}

const NO_RAYCAST = () => null;

// Shared translucent materials (module-level: created once, never disposed —
// tiny, and the layer mounts/unmounts with the exam scene).
const MASK_MAT = new THREE.MeshPhysicalMaterial({
  color: '#dcefe9', transparent: true, opacity: 0.32, roughness: 0.18,
  metalness: 0, side: THREE.DoubleSide, depthWrite: false,
});
const SOFT_PLASTIC_MAT = new THREE.MeshStandardMaterial({
  color: '#e8f4ef', transparent: true, opacity: 0.55, roughness: 0.35, metalness: 0,
});
const TUBE_MAT = new THREE.MeshStandardMaterial({
  color: '#bfe8dc', transparent: true, opacity: 0.7, roughness: 0.4, metalness: 0,
});
const STRAP_MAT = new THREE.MeshStandardMaterial({ color: '#3d4a52', roughness: 0.8, metalness: 0 });
const TAPE_MAT = new THREE.MeshStandardMaterial({ color: '#f5f0e6', roughness: 0.9, metalness: 0 });
const CANNULA_MAT = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3, metalness: 0.05 });
const SALINE_MAT = new THREE.MeshPhysicalMaterial({
  color: '#dbeafe', transparent: true, opacity: 0.5, roughness: 0.2, metalness: 0, depthWrite: false,
});
const POLE_MAT = new THREE.MeshStandardMaterial({ color: '#8a929a', roughness: 0.45, metalness: 0.6 });
const MIST_MAT = new THREE.MeshBasicMaterial({ color: '#e6fbff', transparent: true, opacity: 0.35, depthWrite: false });

/** Thin tube along a smooth curve through the given points. */
function Tube({ points, radius = 0.004, material = TUBE_MAT }: {
  points: Array<[number, number, number]>; radius?: number; material?: THREE.Material;
}) {
  // Key on the serialized points: anchors only change on a model swap, and a
  // simple string dep keeps the geometry stable across re-renders.
  const pointsKey = JSON.stringify(points);
  const geom = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    return new THREE.TubeGeometry(curve, 24, radius, 8, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsKey, radius]);
  return <mesh geometry={geom} material={material} raycast={NO_RAYCAST} />;
}

/** Reservoir bag that breathes in counter-phase with the patient (an NRB bag
 *  visibly deflates a little on each inhalation). */
function ReservoirBag({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const inhale = Math.sin(getBreathPhase01() * Math.PI); // 0→1→0 per breath
    const s = 1 - inhale * 0.22;
    m.scale.set(1, s, 1);
  });
  return (
    <mesh ref={ref} position={position} raycast={NO_RAYCAST} material={SOFT_PLASTIC_MAT}>
      <capsuleGeometry args={[0.017, 0.05, 6, 12]} />
    </mesh>
  );
}

/** Rising, fading mist puffs above the nebulizer mask. */
function NebulizerMist({ origin }: { origin: [number, number, number] }) {
  const group = useRef<THREE.Group>(null);
  const seeds = useMemo(() => [0, 0.23, 0.45, 0.66, 0.85], []);
  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    g.children.forEach((child, i) => {
      const life = (t * 0.45 + seeds[i]) % 1; // 0..1 loop per puff
      child.position.set(
        origin[0] + Math.sin((seeds[i] + life) * 12) * 0.008,
        origin[1] + life * 0.05,
        origin[2] + 0.012,
      );
      const s = 0.5 + life * 0.9;
      child.scale.setScalar(s);
      (child as THREE.Mesh).material = MIST_MAT;
      ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.32 * (1 - life);
    });
  });
  return (
    <group ref={group}>
      {seeds.map(s => (
        <mesh key={s} raycast={NO_RAYCAST} material={MIST_MAT}>
          <sphereGeometry args={[0.006, 8, 8]} />
        </mesh>
      ))}
    </group>
  );
}

export function DeviceLayer({ oxygenMode, hasIvAccess, hasFluids, sampler }: DeviceLayerProps) {
  // Anchor helper: project an authored (x, y) onto the real patient surface.
  const anchor = (x: number, y: number, zFallback: number, forward = 0): [number, number, number] => {
    const p: [number, number, number] = sampler ? sampler(x, y) : [x, y, zFallback];
    return [p[0], p[1], p[2] + forward];
  };

  if (!oxygenMode && !hasIvAccess) return null;

  // Face anchors (authored frame: feet 0, head ≈1.8 — same for both models
  // via the sampler's self-calibration).
  const maskPos = anchor(0, 1.505, 0.17, 0.012);
  const chinPos = anchor(0, 1.44, 0.16, 0.02);
  const nosePos = anchor(0, 1.515, 0.165, 0.006);
  const maskIsShell = oxygenMode === 'simple-mask' || oxygenMode === 'nonrebreather' || oxygenMode === 'nebulizer' || oxygenMode === 'cpap';

  // IV anchors — patient's RIGHT forearm (app x < 0).
  const ivPos = anchor(-0.2, 0.82, 0.16, 0.004);
  const POLE_X = -0.5, POLE_Z = 0.12;
  const bagPos: [number, number, number] = [POLE_X, 1.42, POLE_Z];

  return (
    <group
      name="device-layer"
      ref={(g) => {
        // Dev/capture-only handle so probes can assert what equipment is
        // actually IN the scene (screenshots can't be trusted headless).
        if (import.meta.env.DEV && typeof window !== 'undefined') {
          (window as unknown as Record<string, unknown>).__deviceLayer = g;
        }
      }}
    >
      {/* ---- Oxygen family ------------------------------------------------ */}
      {maskIsShell && (
        <group position={maskPos}>
          {/* transparent shell over nose+mouth; CPAP reads slightly bigger */}
          <mesh
            raycast={NO_RAYCAST}
            material={MASK_MAT}
            rotation={[Math.PI * 0.52, 0, 0]}
            scale={oxygenMode === 'cpap' ? [0.052, 0.05, 0.062] : [0.045, 0.042, 0.055]}
          >
            <sphereGeometry args={[1, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          </mesh>
        </group>
      )}
      {maskIsShell && (
        // O2 supply tubing: mask → down the patient's left side, off the couch
        <Tube points={[
          [chinPos[0], chinPos[1] - 0.015, chinPos[2]],
          [0.09, 1.3, 0.16],
          [0.2, 1.05, 0.1],
          [0.34, 0.9, 0.02],
        ]} />
      )}
      {oxygenMode === 'nonrebreather' && (
        <ReservoirBag position={[chinPos[0], chinPos[1] - 0.045, chinPos[2] + 0.012]} />
      )}
      {oxygenMode === 'nebulizer' && (
        <>
          {/* medication chamber under the mask */}
          <mesh position={[chinPos[0], chinPos[1] - 0.028, chinPos[2] + 0.01]} raycast={NO_RAYCAST} material={SOFT_PLASTIC_MAT}>
            <cylinderGeometry args={[0.011, 0.013, 0.032, 12]} />
          </mesh>
          <NebulizerMist origin={[maskPos[0], maskPos[1] + 0.045, maskPos[2]]} />
        </>
      )}
      {oxygenMode === 'cpap' && (
        // head strap band
        <mesh position={[maskPos[0], maskPos[1] + 0.02, maskPos[2] - 0.1]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST} material={STRAP_MAT}>
          <torusGeometry args={[0.105, 0.006, 8, 28]} />
        </mesh>
      )}
      {oxygenMode === 'nasal' && (
        <>
          {/* cannula line across the upper lip, looping toward both ears */}
          <Tube radius={0.003} points={[
            [-0.095, 1.53, 0.1],
            [-0.05, 1.512, nosePos[2] - 0.004],
            [nosePos[0], nosePos[1] - 0.006, nosePos[2]],
            [0.05, 1.512, nosePos[2] - 0.004],
            [0.095, 1.53, 0.1],
          ]} />
          {/* the two prongs */}
          <mesh position={[nosePos[0] - 0.007, nosePos[1], nosePos[2] + 0.002]} raycast={NO_RAYCAST} material={SOFT_PLASTIC_MAT}>
            <cylinderGeometry args={[0.0018, 0.0018, 0.009, 6]} />
          </mesh>
          <mesh position={[nosePos[0] + 0.007, nosePos[1], nosePos[2] + 0.002]} raycast={NO_RAYCAST} material={SOFT_PLASTIC_MAT}>
            <cylinderGeometry args={[0.0018, 0.0018, 0.009, 6]} />
          </mesh>
        </>
      )}

      {/* ---- IV access / fluids ------------------------------------------- */}
      {hasIvAccess && (
        <group position={ivPos}>
          {/* cannula hub angled along the forearm + tape strip over it */}
          <mesh rotation={[0, 0, Math.PI * 0.45]} position={[0, 0.008, 0.004]} raycast={NO_RAYCAST} material={CANNULA_MAT}>
            <cylinderGeometry args={[0.0035, 0.0035, 0.03, 8]} />
          </mesh>
          <mesh position={[0, 0, 0.006]} rotation={[0.15, 0, 0]} raycast={NO_RAYCAST} material={TAPE_MAT}>
            <boxGeometry args={[0.034, 0.02, 0.0022]} />
          </mesh>
        </group>
      )}
      {hasIvAccess && hasFluids && (
        <>
          {/* giving set: cannula → up to the bag on the drip stand */}
          <Tube radius={0.0032} points={[
            [ivPos[0], ivPos[1] + 0.015, ivPos[2] + 0.006],
            [-0.32, 1.0, 0.14],
            [POLE_X + 0.015, bagPos[1] - 0.075, POLE_Z],
          ]} />
          {/* drip stand: pole, hook arm, saline bag */}
          <mesh position={[POLE_X, 0.8, POLE_Z]} raycast={NO_RAYCAST} material={POLE_MAT}>
            <cylinderGeometry args={[0.008, 0.008, 1.6, 10]} />
          </mesh>
          <mesh position={[POLE_X, 1.585, POLE_Z]} rotation={[0, 0, Math.PI / 2]} raycast={NO_RAYCAST} material={POLE_MAT}>
            <cylinderGeometry args={[0.005, 0.005, 0.09, 8]} />
          </mesh>
          <mesh position={[POLE_X, 0.02, POLE_Z]} raycast={NO_RAYCAST} material={POLE_MAT}>
            <cylinderGeometry args={[0.16, 0.18, 0.02, 5]} />
          </mesh>
          <mesh position={bagPos} raycast={NO_RAYCAST} material={SALINE_MAT}>
            <boxGeometry args={[0.075, 0.115, 0.024]} />
          </mesh>
        </>
      )}
    </group>
  );
}
