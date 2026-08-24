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
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import type { EnvironmentVariant } from '@/lib/sceneEnvironment';
import { getVillaTextures } from './textures';

const NO_RAYCAST = () => null;

// RectAreaLight needs its LTC uniforms initialised once for WebGLRenderer.
// No-op after the first call; safe at module scope in the browser build.
let rectAreaLightUniformsReady = false;
function ensureRectAreaLightUniforms(): void {
  if (rectAreaLightUniformsReady) return;
  RectAreaLightUniformsLib.init();
  rectAreaLightUniformsReady = true;
}

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
// Home — villa/apartment living room, built as a real enclosed room (not a
// backdrop). Room box ~5m (x) x 4m (z) x 2.7m (y): back wall at z=-2, two
// side walls at x=±2.5, floor + ceiling. Patient sits on the floor at origin.
// Props (sofa, coffee table, rug, floor lamp, AC, window) are low-poly boxes;
// fidelity comes from the procedural villa PBR set + the light rig.
// ---------------------------------------------------------------------------

const ROOM = {
  halfW: 2.5, // x half-extent → 5m wide
  backZ: -2.0, // back wall
  frontZ: 2.0, // room depth → 4m front-to-back
  height: 2.7,
} as const;

/** Window daylight far-plane. Uses the case scene photo as an emissive image
 *  behind the glass — parallax view of the UAE villa exterior. Suspends while
 *  the PNG loads; the caller wraps it in Suspense with a plain-glow fallback. */
function WindowView() {
  const tex = useTexture('/scene-assets/asthma-villa-male-uae.png');
  return (
    <mesh raycast={NO_RAYCAST}>
      <planeGeometry args={[1.9, 1.25]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

/** Warm UAE daylight entering through the villa window. A RectAreaLight gives
 *  the broad, soft window wash; the existing spot remains the single shadow
 *  caster so the patient still gets a readable key shadow on the floor. */
function WindowAreaLight() {
  const ref = useRef<THREE.RectAreaLight>(null);
  useEffect(() => {
    ensureRectAreaLightUniforms();
    // RectAreaLight is a Light, so lookAt points its emitting face (-Z) at
    // the patient rather than out through the glass.
    ref.current?.lookAt(0, 0.9, 0);
  }, []);
  return (
    <rectAreaLight
      ref={ref}
      args={['#ffd7a6', 4.2, 1.9, 1.25]}
      position={[-0.75, 1.58, ROOM.backZ + 0.1]}
    />
  );
}

// Dust motes drifting through the window beam. Kept separate from the bay
// motes so the villa beam reads as daylight, not surgical-light dust.
const HOME_DUST_COUNT = 90;
const HOME_DUST_HEIGHT = 1.9;
function HomeDustMotes() {
  const pointsRef = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const base = new Float32Array(HOME_DUST_COUNT * 3);
    const seed = new Float32Array(HOME_DUST_COUNT * 2);
    for (let i = 0; i < HOME_DUST_COUNT; i++) {
      base[i * 3] = -0.75 + (Math.random() - 0.5) * 1.5;
      base[i * 3 + 1] = 0.25 + Math.random() * HOME_DUST_HEIGHT;
      base[i * 3 + 2] = ROOM.backZ + 0.35 + Math.random() * 1.8;
      seed[i * 2] = Math.random() * Math.PI * 2;
      seed[i * 2 + 1] = 0.01 + Math.random() * 0.03;
    }
    return { base, seed, positions: base.slice() };
  }, []);

  useFrame(({ clock }) => {
    const points = pointsRef.current;
    if (!points) return;
    const attr = points.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = clock.elapsedTime;
    const { base, seed } = data;
    for (let i = 0; i < HOME_DUST_COUNT; i++) {
      const phase = seed[i * 2];
      const fall = seed[i * 2 + 1];
      const y = base[i * 3 + 1] - t * fall;
      arr[i * 3 + 1] = 0.25 + ((y % HOME_DUST_HEIGHT) + HOME_DUST_HEIGHT) % HOME_DUST_HEIGHT;
      arr[i * 3] = base[i * 3] + Math.sin(t * 0.25 + phase) * 0.045;
      arr[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.2 + phase) * 0.05;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} raycast={NO_RAYCAST}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        sizeAttenuation
        color="#ffe9c4"
        transparent
        opacity={0.26}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function HomeScene({ hideOverhead, shadowsEnabled }: { hideOverhead: boolean; shadowsEnabled: boolean }) {
  const tex = getVillaTextures();
  return (
    <group>
      {/* Oak floor */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[ROOM.halfW * 2, ROOM.frontZ - ROOM.backZ]} />
        <meshStandardMaterial
          map={tex.wood.map}
          normalMap={tex.wood.normalMap}
          normalScale={[0.7, 0.7]}
          roughness={0.45}
          metalness={0.05}
        />
      </mesh>

      {/* Rug under the patient — flat plane, soft weave */}
      <mesh position={[0, -0.043, 0.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[3.2, 2.3]} />
        <meshStandardMaterial color="#8c4436" roughness={0.98} />
      </mesh>
      <mesh position={[0, -0.042, 0.1]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <planeGeometry args={[2.7, 1.9]} />
        <meshStandardMaterial color="#a15a44" roughness={0.98} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, ROOM.height / 2 - 0.05, ROOM.backZ]} receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[ROOM.halfW * 2, ROOM.height, 0.06]} />
        <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.5, 0.5]} roughness={0.92} />
      </mesh>
      {/* Side walls */}
      {[-ROOM.halfW, ROOM.halfW].map((x) => (
        <mesh key={`wall-${x}`} position={[x, ROOM.height / 2 - 0.05, 0]} receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.06, ROOM.height, ROOM.frontZ - ROOM.backZ]} />
          <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.5, 0.5]} roughness={0.92} />
        </mesh>
      ))}

      {/* Skirting boards — back + both sides */}
      <mesh position={[0, 0.05, ROOM.backZ + 0.04]} raycast={NO_RAYCAST}>
        <boxGeometry args={[ROOM.halfW * 2, 0.14, 0.02]} />
        <meshStandardMaterial color="#e8ddc8" roughness={0.7} />
      </mesh>
      {[-ROOM.halfW + 0.04, ROOM.halfW - 0.04].map((x) => (
        <mesh key={`skirt-${x}`} position={[x, 0.05, 0]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.02, 0.14, ROOM.frontZ - ROOM.backZ]} />
          <meshStandardMaterial color="#e8ddc8" roughness={0.7} />
        </mesh>
      ))}

      {/* Window on the back wall — glass + parallax exterior + frame.
          The far-plane sits a little behind the glass so it reads as depth. */}
      <group position={[-0.75, 1.5, ROOM.backZ + 0.04]}>
        {/* Exterior view (emissive photo). Falls back to a warm glow plane. */}
        <group position={[0, 0, -0.12]}>
          <Suspense
            fallback={
              <mesh raycast={NO_RAYCAST}>
                <planeGeometry args={[1.9, 1.25]} />
                <meshBasicMaterial color="#ffe9c4" toneMapped={false} />
              </mesh>
            }
          >
            <WindowView />
          </Suspense>
        </group>
        {/* Glass pane — faint, slightly reflective */}
        <mesh raycast={NO_RAYCAST}>
          <planeGeometry args={[1.9, 1.25]} />
          <meshStandardMaterial color="#eaf3ff" transparent opacity={0.12} roughness={0.05} metalness={0.1} />
        </mesh>
        {/* Frame: outer border + cross mullions */}
        {([[0, 0.66, 2.02, 0.08], [0, -0.66, 2.02, 0.08], [-0.99, 0, 0.08, 1.34], [0.99, 0, 0.08, 1.34], [0, 0, 0.05, 1.3], [0, 0, 2.0, 0.05]] as const).map(
          ([fx, fy, fw, fh], i) => (
            <mesh key={`frame-${i}`} position={[fx, fy, 0.02]} raycast={NO_RAYCAST}>
              <boxGeometry args={[fw, fh, 0.05]} />
              <meshStandardMaterial color="#f5efe2" roughness={0.5} />
            </mesh>
          ),
        )}
      </group>

      {/* Wall-mounted AC unit — top of the back wall, right side */}
      <group position={[1.5, 2.25, ROOM.backZ + 0.09]}>
        <mesh castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.95, 0.3, 0.18]} />
          <meshStandardMaterial color="#f4f6f8" roughness={0.55} metalness={0.05} />
        </mesh>
        {/* Vent louvre strip */}
        <mesh position={[0, -0.11, 0.07]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.82, 0.05, 0.06]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>
      </group>

      {/* Sofa against the back wall */}
      <group position={[1.35, 0, ROOM.backZ + 0.55]}>
        {/* Seat base */}
        <mesh position={[0, 0.24, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.7, 0.34, 0.75]} />
          <meshStandardMaterial map={tex.sofa.map} normalMap={tex.sofa.normalMap} normalScale={[0.6, 0.6]} roughness={0.98} />
        </mesh>
        {/* Backrest */}
        <mesh position={[0, 0.6, -0.3]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.7, 0.55, 0.16]} />
          <meshStandardMaterial map={tex.sofa.map} normalMap={tex.sofa.normalMap} normalScale={[0.6, 0.6]} roughness={0.98} />
        </mesh>
        {/* Arms */}
        {[-0.82, 0.82].map((x) => (
          <mesh key={`arm-${x}`} position={[x, 0.42, 0]} castShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.16, 0.46, 0.75]} />
            <meshStandardMaterial map={tex.sofa.map} normalMap={tex.sofa.normalMap} normalScale={[0.6, 0.6]} roughness={0.98} />
          </mesh>
        ))}
        {/* Seat cushions */}
        {[-0.42, 0.42].map((x) => (
          <mesh key={`cush-${x}`} position={[x, 0.44, 0.03]} castShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.72, 0.14, 0.66]} />
            <meshStandardMaterial color="#6b7758" roughness={0.98} />
          </mesh>
        ))}
      </group>

      {/* Coffee table, pushed aside to make room for the crew */}
      <group position={[-1.55, 0, 1.25]} rotation={[0, 0.4, 0]}>
        <mesh position={[0, 0.33, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.95, 0.05, 0.55]} />
          <meshStandardMaterial color="#5a3d25" roughness={0.35} metalness={0.05} />
        </mesh>
        {([[-0.42, -0.22], [0.42, -0.22], [-0.42, 0.22], [0.42, 0.22]] as const).map(([x, z]) => (
          <mesh key={`ct-leg-${x}-${z}`} position={[x, 0.16, z]} castShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.05, 0.32, 0.05]} />
            <meshStandardMaterial color="#3f2a19" roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Floor lamp in the far corner — pole + emissive shade, own point light */}
      <group position={[-2.05, 0, -1.6]}>
        <mesh position={[0, 0.02, 0]} raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.16, 0.18, 0.04, 16]} />
          <meshStandardMaterial color="#3f3a33" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.75, 0]} raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.016, 0.016, 1.5, 10]} />
          <meshStandardMaterial color="#4a453d" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 1.55, 0]} raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.16, 0.22, 0.28, 20, 1, true]} />
          <meshStandardMaterial color="#fff2d4" emissive="#ffe6ad" emissiveIntensity={1.3} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
        <pointLight position={[0, 1.5, 0]} intensity={2.4} distance={4} decay={2} color="#ffdca0" />
      </group>

      {!hideOverhead && (
        <mesh position={[0, ROOM.height - 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
          <planeGeometry args={[ROOM.halfW * 2, ROOM.frontZ - ROOM.backZ]} />
          <meshStandardMaterial color="#f1e9da" roughness={0.9} />
        </mesh>
      )}

      {/* Light rig — window daylight does the soft wash (RectAreaLight) while
          a warm spot remains the single shadow caster; the floor lamp adds a
          practical pool and the AC gives a cool top-fill so the room reads
          like a villa interior instead of a clinic bay. */}
      <WindowAreaLight />
      <HomeDustMotes />
      <KeyLight color="#ffe0b8" intensity={5.6} position={[-0.75, 2.35, ROOM.backZ + 0.55]} shadowsEnabled={shadowsEnabled} />
      <pointLight position={[-0.75, 1.6, ROOM.backZ + 0.3]} intensity={2.6} distance={6} decay={2} color="#fff0d2" />
      <pointLight position={[1.5, 2.18, ROOM.backZ + 0.35]} intensity={1.15} distance={4.5} decay={2} color="#cfe0ff" />
      <pointLight position={[1.0, 1.0, 1.6]} intensity={0.85} distance={4.5} decay={2} color="#ffd9b0" />
      <hemisphereLight args={['#fff1dc', '#4a382c', 0.16]} />
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
      {/* Wrecked car — low-poly silhouette, front damage, pushed to the
          right side of the scene. Body + cabin + two wheels visible. */}
      <group name="wrecked-car" position={[3.8, 0, -1.6]} rotation={[0, -0.35, 0]}>
        {/* Body shell */}
        <mesh position={[0, 0.48, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[3.6, 0.7, 1.7]} />
          <meshStandardMaterial color="#8b1e1e" roughness={0.7} metalness={0.4} />
        </mesh>
        {/* Hood crumpled — rotated box */}
        <mesh position={[-1.6, 0.42, 0]} castShadow raycast={NO_RAYCAST} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[0.8, 0.12, 1.6]} />
          <meshStandardMaterial color="#4a5056" roughness={0.7} metalness={0.4} />
        </mesh>
        {/* Cabin (windows) */}
        <mesh position={[0.3, 0.92, 0]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.8, 0.55, 1.5]} />
          <meshStandardMaterial color="#2a3540" roughness={0.12} metalness={0.6} transparent opacity={0.65} />
        </mesh>
        {/* Roof */}
        <mesh position={[0.3, 1.18, 0]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.8, 0.12, 1.6]} />
          <meshStandardMaterial color="#5a6068" roughness={0.7} metalness={0.4} />
        </mesh>
        {/* Wheels */}
        {[-1.3, 1.3].map(wx => (
          <group key={`car-wheel-${wx}`}>
            <mesh position={[wx, 0.28, 0.82]} castShadow raycast={NO_RAYCAST}>
              <cylinderGeometry args={[0.28, 0.28, 0.18, 16]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
            </mesh>
            <mesh position={[wx, 0.28, -0.82]} castShadow raycast={NO_RAYCAST}>
              <cylinderGeometry args={[0.28, 0.28, 0.18, 16]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
            </mesh>
          </group>
        ))}
        {/* Headlight glass cracked — emissive chip */}
        <mesh position={[-1.95, 0.5, 0.55]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.05, 0.18, 0.3]} />
          <meshStandardMaterial color="#d4d4d4" emissive="#fff0c4" emissiveIntensity={0.4} roughness={0.2} />
        </mesh>
        <mesh position={[-1.95, 0.5, -0.55]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.05, 0.18, 0.3]} />
          <meshStandardMaterial color="#d4d4d4" roughness={0.2} metalness={0.3} />
        </mesh>
      </group>

      {/* Downed motorcycle — lying on its side, left of the patient */}
      <group name="downed-motorcycle" position={[-3.6, 0, 1.6]} rotation={[0, 1.1, Math.PI / 2 - 0.1]}>
        {/* Frame */}
        <mesh position={[0, 0.15, 0]} castShadow raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.06, 0.06, 1.8, 10]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Seat */}
        <mesh position={[0.5, 0.22, 0]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.6, 0.12, 0.22]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
        </mesh>
        {/* Wheels */}
        {[-0.7, 0.7].map(wx => (
          <mesh key={`moto-wheel-${wx}`} position={[wx, 0.15, 0]} castShadow raycast={NO_RAYCAST} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.32, 0.06, 8, 20]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
          </mesh>
        ))}
        {/* Handlebar */}
        <mesh position={[-0.75, 0.35, 0]} castShadow raycast={NO_RAYCAST} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
          <meshStandardMaterial color="#3a3a3a" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* Debris scattered across the road — small low-poly shards */}
      {[
        [-0.4, 0.01, -0.8], [0.3, 0.01, -1.4], [0.8, 0.01, 0.6],
        [-0.9, 0.01, 1.2], [1.2, 0.01, -1.6], [0.1, 0.01, 1.8],
      ].map(([dx, dy, dz], i) => (
        <mesh
          key={`debris-${i}`}
          position={[dx, dy, dz]}
          rotation={[i * 0.73, i * 1.17, i * 0.41]}
          castShadow
          raycast={NO_RAYCAST}
        >
          <boxGeometry args={[0.12 + (i % 3) * 0.035, 0.02, 0.08 + (i % 2) * 0.04]} />
          <meshStandardMaterial color="#4a4a4a" roughness={0.8} metalness={0.3} />
        </mesh>
      ))}

      {/* Broken glass shards — translucent sparkles near the car */}
      {[
        [1.2, 0.0, -0.6], [1.5, 0.0, -0.9], [2.1, 0.0, -0.4], [1.0, 0.0, -1.1],
      ].map(([gx, gy, gz], i) => (
        <mesh
          key={`glass-${i}`}
          position={[gx, gy + 0.005, gz]}
          rotation={[-Math.PI / 2, 0, i * 0.83]}
          raycast={NO_RAYCAST}
        >
          <planeGeometry args={[0.1 + (i % 3) * 0.025, 0.1 + (i % 2) * 0.035]} />
          <meshStandardMaterial
            color="#a8c0d8"
            transparent
            opacity={0.5}
            roughness={0.05}
            metalness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Fuel spill — dark glossy patch under the car */}
      <mesh position={[1.6, -0.045, -0.3]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <circleGeometry args={[1.1, 24]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.08} metalness={0.6} transparent opacity={0.7} />
      </mesh>

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
