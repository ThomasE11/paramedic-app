/**
 * Scene-contextual environment variants — home, public, roadside. The clinic
 * variant stays in index.tsx (Room + BayLighting); these are the alternates
 * swapped in by TreatmentBayEnvironment when the case's scene words say the
 * patient is somewhere else.
 *
 * Same rules as the clinic bay:
 * - every mesh sets raycast={() => null} so region clicks pass through
 * - hideOverhead removes ceiling geometry when the orbit camera is above
 * - exactly ONE shadow-casting light per variant (iPad budget)
 * - primitives only, no external assets
 * - medical equipment (IV stand, monitor, crash cart, O2) is composed by
 *   index.tsx in every variant — the paramedic brings it to the scene
 */
import { useMemo } from 'react';
import * as THREE from 'three';
import type { EnvironmentVariant } from '@/lib/sceneEnvironment';

const NO_RAYCAST = () => null;

/** Shadow-casting key spot aimed at the patient — shared rig, per-scene color. */
function KeyLight({
  color,
  intensity,
  position,
  shadowsEnabled,
  angle = 0.55,
}: {
  color: string;
  intensity: number;
  position: [number, number, number];
  shadowsEnabled: boolean;
  angle?: number;
}) {
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 0.45, 0);
    return o;
  }, []);
  return (
    <>
      <primitive object={target} />
      <spotLight
        position={position}
        target={target}
        angle={angle}
        penumbra={0.7}
        intensity={intensity}
        distance={10}
        decay={2}
        color={color}
        castShadow={shadowsEnabled}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Home — villa/apartment living room. Warm cream walls, wood floor, rug,
// sofa + coffee table silhouettes, a window pouring in daylight.
// ---------------------------------------------------------------------------
function HomeScene({ hideOverhead, shadowsEnabled }: { hideOverhead: boolean; shadowsEnabled: boolean }) {
  return (
    <group>
      {/* Wood floor */}
      <mesh position={[0, -0.05, 0.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[7.2, 7.2]} />
        <meshStandardMaterial color="#7a5a3d" roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Rug under the patient */}
      <mesh position={[0, -0.04, 0.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[3.4, 2.4]} />
        <meshStandardMaterial color="#8c4a3a" roughness={0.95} />
      </mesh>
      {/* Walls — warm cream */}
      <mesh position={[0, 1.05, -1.05]} receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[4.2, 2.3, 0.05]} />
        <meshStandardMaterial color="#e6d9c2" roughness={0.9} />
      </mesh>
      {[-2.05, 2.05].map((x) => (
        <mesh key={`wall-${x}`} position={[x, 1.05, 0.4]} receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.05, 2.3, 3.0]} />
          <meshStandardMaterial color="#dccbb0" roughness={0.9} />
        </mesh>
      ))}
      {/* Skirting board */}
      <mesh position={[0, 0.05, -1.02]} raycast={NO_RAYCAST}>
        <boxGeometry args={[4.2, 0.14, 0.02]} />
        <meshStandardMaterial color="#8a6b4a" roughness={0.6} />
      </mesh>
      {/* Window on the left wall — warm daylight */}
      <group position={[-2.02, 1.35, 0.55]}>
        <mesh raycast={NO_RAYCAST}>
          <boxGeometry args={[0.03, 0.9, 1.3]} />
          <meshStandardMaterial color="#ffe6b8" emissive="#ffddA0" emissiveIntensity={0.9} roughness={0.15} />
        </mesh>
        <mesh position={[0.015, 0, 0]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.035, 1.0, 0.06]} />
          <meshStandardMaterial color="#8a6b4a" roughness={0.6} />
        </mesh>
      </group>
      {/* Sofa against the back wall */}
      <group position={[1.15, 0, -0.8]}>
        <mesh position={[0, 0.22, 0]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.5, 0.36, 0.65]} />
          <meshStandardMaterial color="#5c6b5e" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.55, -0.26]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.5, 0.5, 0.14]} />
          <meshStandardMaterial color="#546256" roughness={0.95} />
        </mesh>
        {[-0.72, 0.72].map((x) => (
          <mesh key={`arm-${x}`} position={[x, 0.4, 0]} castShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.14, 0.42, 0.65]} />
            <meshStandardMaterial color="#546256" roughness={0.95} />
          </mesh>
        ))}
      </group>
      {/* Coffee table, pushed aside to make room for the crew */}
      <group position={[-1.35, 0, 1.25]} rotation={[0, 0.4, 0]}>
        <mesh position={[0, 0.32, 0]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.85, 0.04, 0.5]} />
          <meshStandardMaterial color="#6b4a2f" roughness={0.4} />
        </mesh>
        {([[-0.38, -0.2], [0.38, -0.2], [-0.38, 0.2], [0.38, 0.2]] as const).map(([x, z]) => (
          <mesh key={`leg-${x}-${z}`} position={[x, 0.15, z]} raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
            <meshStandardMaterial color="#4a3320" roughness={0.5} />
          </mesh>
        ))}
      </group>
      {!hideOverhead && (
        <mesh position={[0, 2.3, 0.1]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
          <planeGeometry args={[4.2, 3.2]} />
          <meshStandardMaterial color="#efe6d6" roughness={0.9} />
        </mesh>
      )}
      {/* Warm domestic lighting */}
      <KeyLight color="#ffe2c0" intensity={7} position={[0.4, 2.5, 0.5]} shadowsEnabled={shadowsEnabled} />
      <pointLight position={[-1.85, 1.4, 0.55]} intensity={4} distance={6} decay={2} color="#ffdca6" />
      <pointLight position={[1.2, 1.0, 1.5]} intensity={1.2} distance={4.5} decay={2} color="#ffd9b0" />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Public — mall/office space. Polished pale floor, glass storefront backdrop,
// columns, bright fluorescent ceiling.
// ---------------------------------------------------------------------------
function PublicScene({ hideOverhead, shadowsEnabled }: { hideOverhead: boolean; shadowsEnabled: boolean }) {
  return (
    <group>
      {/* Polished stone floor — low roughness picks up the lights */}
      <mesh position={[0, -0.05, 0.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[7.2, 7.2]} />
        <meshStandardMaterial color="#cdd4da" roughness={0.12} metalness={0.25} />
      </mesh>
      {/* Storefront back wall: dark glass panels with a lit signage band */}
      <mesh position={[0, 1.05, -1.05]} receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[4.2, 2.3, 0.05]} />
        <meshStandardMaterial color="#1c2a36" roughness={0.1} metalness={0.5} />
      </mesh>
      <mesh position={[0, 2.0, -1.01]} raycast={NO_RAYCAST}>
        <boxGeometry args={[4.2, 0.3, 0.03]} />
        <meshStandardMaterial color="#dbeafe" emissive="#cfe8ff" emissiveIntensity={0.8} roughness={0.3} />
      </mesh>
      {/* Glass mullions */}
      {[-1.4, 0, 1.4].map((x) => (
        <mesh key={`mullion-${x}`} position={[x, 1.05, -1.0]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.06, 2.3, 0.06]} />
          <meshStandardMaterial color="#8fa1b1" roughness={0.35} metalness={0.7} />
        </mesh>
      ))}
      {/* Columns framing the open sides */}
      {[-2.0, 2.0].map((x) => (
        <mesh key={`col-${x}`} position={[x, 1.1, 0.9]} castShadow raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.14, 0.14, 2.4, 16]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.35} metalness={0.2} />
        </mesh>
      ))}
      {!hideOverhead && (
        <>
          <mesh position={[0, 2.3, 0.1]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
            <planeGeometry args={[4.2, 3.2]} />
            <meshStandardMaterial color="#dde3e9" roughness={0.8} />
          </mesh>
          {[-1.2, -0.4, 0.4, 1.2].map((x) => (
            <mesh key={`fluoro-${x}`} position={[x, 2.28, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
              <boxGeometry args={[0.35, 1.6, 0.02]} />
              <meshStandardMaterial color="#f0f7ff" roughness={0.2} emissive="#e3f0ff" emissiveIntensity={0.9} />
            </mesh>
          ))}
        </>
      )}
      {/* Cool fluorescent lighting — flatter and brighter than the bay */}
      <KeyLight color="#f2f7ff" intensity={7.5} position={[0, 2.6, 0.2]} shadowsEnabled={shadowsEnabled} angle={0.65} />
      <pointLight position={[-1.5, 2.0, 0.8]} intensity={2.2} distance={6} decay={2} color="#eaf4ff" />
      <pointLight position={[1.5, 2.0, 0.8]} intensity={2.2} distance={6} decay={2} color="#eaf4ff" />
      <pointLight position={[0, 1.2, 1.6]} intensity={0.9} distance={4.5} decay={2} color="#f5faff" />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Roadside — open air. Asphalt with lane markings, kerb, traffic cones, the
// ambulance's headlights raking in from behind the scene. No walls/ceiling.
// ---------------------------------------------------------------------------
function RoadsideScene({ shadowsEnabled }: { shadowsEnabled: boolean }) {
  return (
    <group>
      {/* Asphalt */}
      <mesh position={[0, -0.05, 0.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[9, 9]} />
        <meshStandardMaterial color="#2c2e33" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* Dashed lane markings */}
      {[-1.2, 0.4, 2.0].map((z) => (
        <mesh key={`lane-${z}`} position={[-2.4, -0.045, z]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
          <planeGeometry args={[0.14, 0.9]} />
          <meshStandardMaterial color="#cfd2d6" roughness={0.85} />
        </mesh>
      ))}
      {/* Kerb along the right edge */}
      <mesh position={[3.1, 0.02, 0.1]} receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[0.25, 0.14, 9]} />
        <meshStandardMaterial color="#6b7178" roughness={0.9} />
      </mesh>
      {/* Traffic cones securing the scene */}
      {([[-1.7, 1.6], [1.9, -1.3]] as const).map(([x, z]) => (
        <group key={`cone-${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.01, 0]} castShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.3, 0.03, 0.3]} />
            <meshStandardMaterial color="#e05a1e" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.24, 0]} castShadow raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.03, 0.12, 0.44, 12]} />
            <meshStandardMaterial color="#f2662a" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.28, 0]} raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.065, 0.085, 0.1, 12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
        </group>
      ))}
      {/* Ambulance headlights behind the scene — two emissive discs */}
      {[-0.55, 0.55].map((x) => (
        <mesh key={`headlight-${x}`} position={[x, 0.75, 3.4]} rotation={[0, Math.PI, 0]} raycast={NO_RAYCAST}>
          <circleGeometry args={[0.13, 20]} />
          <meshStandardMaterial color="#fffbe8" emissive="#fff6d0" emissiveIntensity={2.2} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Daylight: blue sky ambient + sun key. The headlights add warm rake. */}
      <hemisphereLight args={['#bcd7ff', '#3a3d42', 0.75]} />
      <KeyLight color="#fff4de" intensity={7} position={[2.2, 3.2, 1.6]} shadowsEnabled={shadowsEnabled} angle={0.5} />
      <pointLight position={[0, 0.8, 3.2]} intensity={3} distance={7} decay={2} color="#fff2cc" />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Public: the variant switch. 'clinic' is handled by index.tsx.
// ---------------------------------------------------------------------------
export function SceneVariantEnvironment({
  variant,
  hideOverhead,
  shadowsEnabled,
}: {
  variant: Exclude<EnvironmentVariant, 'clinic'>;
  hideOverhead: boolean;
  shadowsEnabled: boolean;
}) {
  if (variant === 'home') return <HomeScene hideOverhead={hideOverhead} shadowsEnabled={shadowsEnabled} />;
  if (variant === 'public') return <PublicScene hideOverhead={hideOverhead} shadowsEnabled={shadowsEnabled} />;
  return <RoadsideScene shadowsEnabled={shadowsEnabled} />;
}
