/**
 * Scene-contextual environment variants — home, public, roadside, worksite,
 * fire, water rescue and heat exposure. The clinic variant stays in index.tsx
 * (Room + BayLighting); these are the alternates swapped in by
 * TreatmentBayEnvironment from the case's complete scene contract.
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

/**
 * Lightweight daylight dome for open-air scenes. The Canvas is deliberately
 * transparent so the cockpit can frame it, but that used to expose the dark
 * HUD background beyond the floor plane and made heat/water/worksite calls
 * look as though they happened at night. One back-faced sphere restores a
 * readable horizon without an HDR sky texture or another network asset.
 */
function OutdoorSky({ zenith, horizon }: { zenith: string; horizon: string }) {
  const uniforms = useMemo(() => ({
    zenithColour: { value: new THREE.Color(zenith) },
    horizonColour: { value: new THREE.Color(horizon) },
  }), [horizon, zenith]);

  return (
    <mesh renderOrder={-1000} frustumCulled={false} raycast={NO_RAYCAST}>
      <sphereGeometry args={[18, 32, 16]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        toneMapped={false}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying float vSkyHeight;
          void main() {
            vSkyHeight = normalize(position).y;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 zenithColour;
          uniform vec3 horizonColour;
          varying float vSkyHeight;
          void main() {
            float blend = smoothstep(-0.12, 0.72, vSkyHeight);
            gl_FragColor = vec4(mix(horizonColour, zenithColour, blend), 1.0);
          }
        `}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Home — villa/apartment living room with a visible adjoining hallway. The
// first procedural version stopped at a full-width back wall and read like a
// furnished display box. The open doorway, continued floor and deeper hall
// give the student a believable home beyond the immediate treatment area,
// while the camera-facing side remains open for unobstructed patient care.
// ---------------------------------------------------------------------------

const ROOM = {
  halfW: 3.25,
  backZ: -2.6,
  frontZ: 2.8,
  height: 2.75,
} as const;

const HALL = {
  leftX: 0.75,
  rightX: 2.45,
  backZ: -5.4,
  openingHeight: 2.2,
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
      position={[-1.45, 1.58, ROOM.backZ + 0.1]}
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
      base[i * 3] = -1.45 + (Math.random() - 0.5) * 1.5;
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

function HomeScene({ hideOverhead, shadowsEnabled, showPatientSeat }: { hideOverhead: boolean; shadowsEnabled: boolean; showPatientSeat: boolean }) {
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
      <mesh position={[0, -0.043, 0.15]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[3.7, 2.6]} />
        <meshStandardMaterial color="#8c4436" roughness={0.98} />
      </mesh>
      <mesh position={[0, -0.042, 0.15]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <planeGeometry args={[3.15, 2.1]} />
        <meshStandardMaterial color="#a15a44" roughness={0.98} />
      </mesh>

      {/* Back wall split around an open hallway. A real opening is important:
          painting a dark rectangle on the old wall preserved the stage-box
          silhouette and supplied no parallax when the student orbited. */}
      {([
        [(-ROOM.halfW + HALL.leftX) / 2, HALL.leftX + ROOM.halfW],
        [(HALL.rightX + ROOM.halfW) / 2, ROOM.halfW - HALL.rightX],
      ] as const).map(([x, width]) => (
        <mesh key={`back-wall-${x}`} position={[x, ROOM.height / 2 - 0.05, ROOM.backZ]} receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[width, ROOM.height, 0.06]} />
          <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.5, 0.5]} roughness={0.92} />
        </mesh>
      ))}
      <mesh
        position={[(HALL.leftX + HALL.rightX) / 2, HALL.openingHeight + (ROOM.height - HALL.openingHeight) / 2 - 0.05, ROOM.backZ]}
        receiveShadow
        raycast={NO_RAYCAST}
      >
        <boxGeometry args={[HALL.rightX - HALL.leftX, ROOM.height - HALL.openingHeight, 0.06]} />
        <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.5, 0.5]} roughness={0.92} />
      </mesh>
      {/* Side walls */}
      {[-ROOM.halfW, ROOM.halfW].map((x) => (
        <mesh key={`wall-${x}`} position={[x, ROOM.height / 2 - 0.05, 0]} receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.06, ROOM.height, ROOM.frontZ - ROOM.backZ]} />
          <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.5, 0.5]} roughness={0.92} />
        </mesh>
      ))}

      {/* Skirting boards — broken around the doorway rather than bridging it. */}
      {([
        [(-ROOM.halfW + HALL.leftX) / 2, HALL.leftX + ROOM.halfW],
        [(HALL.rightX + ROOM.halfW) / 2, ROOM.halfW - HALL.rightX],
      ] as const).map(([x, width]) => (
        <mesh key={`back-skirt-${x}`} position={[x, 0.05, ROOM.backZ + 0.04]} raycast={NO_RAYCAST}>
          <boxGeometry args={[width, 0.14, 0.02]} />
          <meshStandardMaterial color="#e8ddc8" roughness={0.7} />
        </mesh>
      ))}
      {[-ROOM.halfW + 0.04, ROOM.halfW - 0.04].map((x) => (
        <mesh key={`skirt-${x}`} position={[x, 0.05, 0]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.02, 0.14, ROOM.frontZ - ROOM.backZ]} />
          <meshStandardMaterial color="#e8ddc8" roughness={0.7} />
        </mesh>
      ))}

      {/* Adjoining hallway: continued timber floor, side walls and a distant
          interior door create real depth instead of a flat scenic backdrop. */}
      <mesh
        position={[(HALL.leftX + HALL.rightX) / 2, -0.049, (ROOM.backZ + HALL.backZ) / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        raycast={NO_RAYCAST}
      >
        <planeGeometry args={[HALL.rightX - HALL.leftX, ROOM.backZ - HALL.backZ]} />
        <meshStandardMaterial map={tex.wood.map} normalMap={tex.wood.normalMap} normalScale={[0.55, 0.55]} roughness={0.5} />
      </mesh>
      {[HALL.leftX, HALL.rightX].map((x) => (
        <mesh
          key={`hall-wall-${x}`}
          position={[x, ROOM.height / 2 - 0.05, (ROOM.backZ + HALL.backZ) / 2]}
          receiveShadow
          raycast={NO_RAYCAST}
        >
          <boxGeometry args={[0.06, ROOM.height, ROOM.backZ - HALL.backZ]} />
          <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.45, 0.45]} roughness={0.92} />
        </mesh>
      ))}
      <mesh
        position={[(HALL.leftX + HALL.rightX) / 2, ROOM.height / 2 - 0.05, HALL.backZ]}
        receiveShadow
        raycast={NO_RAYCAST}
      >
        <boxGeometry args={[HALL.rightX - HALL.leftX, ROOM.height, 0.06]} />
        <meshStandardMaterial map={tex.plaster.map} normalMap={tex.plaster.normalMap} normalScale={[0.45, 0.45]} roughness={0.92} />
      </mesh>
      <group position={[(HALL.leftX + HALL.rightX) / 2, 1.02, HALL.backZ + 0.05]}>
        <mesh castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.86, 2.04, 0.08]} />
          <meshStandardMaterial color="#8b684c" roughness={0.62} />
        </mesh>
        {[0.34, -0.34].map((y) => (
          <mesh key={`door-panel-${y}`} position={[0, y, 0.05]} raycast={NO_RAYCAST}>
            <boxGeometry args={[0.68, 0.5, 0.025]} />
            <meshStandardMaterial color="#9c7656" roughness={0.66} />
          </mesh>
        ))}
        <mesh position={[0.31, 0, 0.1]} raycast={NO_RAYCAST}>
          <sphereGeometry args={[0.035, 12, 8]} />
          <meshStandardMaterial color="#c9a86a" metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
      {([HALL.leftX, HALL.rightX] as const).map((x) => (
        <group key={`door-trim-${x}`}>
          <mesh position={[x, HALL.openingHeight / 2, ROOM.backZ + 0.055]} raycast={NO_RAYCAST}>
            <boxGeometry args={[0.09, HALL.openingHeight, 0.08]} />
            <meshStandardMaterial color="#eee1cf" roughness={0.66} />
          </mesh>
        </group>
      ))}
      <mesh position={[(HALL.leftX + HALL.rightX) / 2, HALL.openingHeight, ROOM.backZ + 0.055]} raycast={NO_RAYCAST}>
        <boxGeometry args={[HALL.rightX - HALL.leftX + 0.18, 0.09, 0.08]} />
        <meshStandardMaterial color="#eee1cf" roughness={0.66} />
      </mesh>

      {/* Window on the back wall — glass + parallax exterior + frame.
          The far-plane sits a little behind the glass so it reads as depth. */}
      <group position={[-1.45, 1.5, ROOM.backZ + 0.04]}>
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
      <group position={[1.6, 2.42, ROOM.backZ + 0.09]}>
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
      <group position={[-1.65, 0, ROOM.backZ + 0.55]}>
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

      {/* Patient bench — deliberately backless/armless so the student's view
          of the chest, forearms and knees stays unobstructed. Its front edge sits
          directly beneath the grounded tripod pelvis; without a support the
          newly flexed seated pose correctly planted its feet but appeared to
          hover in the middle of the room. */}
      {showPatientSeat && (
        <group position={[0, 0, 0.34]}>
          <mesh position={[0, 0.53, -0.08]} castShadow receiveShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.78, 0.16, 0.5]} />
            <meshStandardMaterial color="#68745a" roughness={0.94} />
          </mesh>
          {[-0.29, 0.29].map((x) => (
            <mesh key={`patient-chair-leg-${x}`} position={[x, 0.255, -0.08]} castShadow raycast={NO_RAYCAST}>
              <boxGeometry args={[0.055, 0.51, 0.055]} />
              <meshStandardMaterial color="#3f2f22" roughness={0.55} metalness={0.08} />
            </mesh>
          ))}
        </group>
      )}

      {/* Coffee table, pushed aside to make room for the crew */}
      <group position={[-1.75, 0, 1.3]} rotation={[0, 0.4, 0]}>
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
      <group position={[2.78, 0, -1.8]}>
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
      <KeyLight color="#ffe0b8" intensity={5.6} position={[-1.45, 2.35, ROOM.backZ + 0.55]} shadowsEnabled={shadowsEnabled} />
      <pointLight position={[-1.45, 1.6, ROOM.backZ + 0.3]} intensity={2.6} distance={6} decay={2} color="#fff0d2" />
      <pointLight position={[1.6, 2.18, ROOM.backZ + 0.35]} intensity={1.15} distance={4.5} decay={2} color="#cfe0ff" />
      <pointLight position={[1.6, 1.8, HALL.backZ + 0.45]} intensity={1.1} distance={4} decay={2} color="#ffe5bf" />
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
  // A supine patient extends to roughly z=-1.15 at the head. Keep every
  // storefront element behind a generous examination clearance plane so the
  // centre mullion cannot pass through the skull from the arrival camera.
  const backdropZ = -2.7;
  return (
    <group>
      {/* Polished stone floor — low roughness picks up the lights */}
      <mesh position={[0, -0.05, 0.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[7.2, 7.2]} />
        <meshStandardMaterial color="#cdd4da" roughness={0.38} metalness={0.08} />
      </mesh>
      {/* Storefront back wall: dark glass panels with a lit signage band */}
      <mesh position={[0, 1.05, backdropZ]} receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[4.2, 2.3, 0.05]} />
        <meshStandardMaterial color="#1c2a36" roughness={0.1} metalness={0.5} />
      </mesh>
      <mesh position={[0, 2.0, backdropZ + 0.04]} raycast={NO_RAYCAST}>
        <boxGeometry args={[4.2, 0.3, 0.03]} />
        <meshStandardMaterial color="#dbeafe" emissive="#cfe8ff" emissiveIntensity={0.8} roughness={0.3} />
      </mesh>
      {/* Glass mullions */}
      {/* Side mullions frame the storefront; no centre mullion behind the
          patient, where perspective made it read as a pole through the body. */}
      {[-1.4, 1.4].map((x) => (
        <mesh key={`mullion-${x}`} position={[x, 1.05, backdropZ + 0.05]} raycast={NO_RAYCAST}>
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
            <mesh key={`fluoro-${x}`} position={[x, 2.28, backdropZ + 0.85]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
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
// Industrial — construction, warehouse, machinery and farm incidents. The
// central treatment lane remains clear while scaffold, materials and access
// control make this read as a worksite instead of a road collision.
// ---------------------------------------------------------------------------
function IndustrialScene({ shadowsEnabled }: { shadowsEnabled: boolean }) {
  return (
    <group>
      <OutdoorSky zenith="#9fc8e7" horizon="#e8dcc4" />
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[9, 9]} />
        <meshStandardMaterial color="#777b7d" roughness={0.96} metalness={0.04} />
      </mesh>

      {/* Corrugated site wall and steel frame. */}
      <mesh position={[0, 1.15, -2.7]} receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[7.5, 2.4, 0.08]} />
        <meshStandardMaterial color="#6f7b82" roughness={0.62} metalness={0.55} />
      </mesh>
      {[-3.2, -2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4, 3.2].map(x => (
        <mesh key={`corrugation-${x}`} position={[x, 1.15, -2.64]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.035, 2.35, 0.045]} />
          <meshStandardMaterial color="#9aa3a8" roughness={0.5} metalness={0.68} />
        </mesh>
      ))}
      {[-2.65, 2.65].map(x => (
        <group key={`scaffold-${x}`} position={[x, 0, -0.55]}>
          {[-0.45, 0.45].map(z => (
            <mesh key={`upright-${z}`} position={[0, 1.35, z]} castShadow raycast={NO_RAYCAST}>
              <cylinderGeometry args={[0.035, 0.035, 2.7, 10]} />
              <meshStandardMaterial color="#c8ced2" roughness={0.36} metalness={0.78} />
            </mesh>
          ))}
          {[0.45, 1.35, 2.25].map(y => (
            <mesh key={`rail-${y}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
              <cylinderGeometry args={[0.028, 0.028, 0.9, 10]} />
              <meshStandardMaterial color="#c8ced2" roughness={0.36} metalness={0.78} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Hazard-striped exclusion line around the clear treatment lane. */}
      {[-1.9, 1.9].map(x => (
        <mesh key={`hazard-line-${x}`} position={[x, -0.042, 0.35]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
          <planeGeometry args={[0.12, 4.8]} />
          <meshStandardMaterial color="#f5c518" roughness={0.72} />
        </mesh>
      ))}

      {/* Palletised materials remain to the side, preserving anatomy access. */}
      <group position={[2.85, 0, 1.55]}>
        <mesh position={[0, 0.08, 0]} receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[1.35, 0.16, 0.9]} />
          <meshStandardMaterial color="#745035" roughness={0.88} />
        </mesh>
        {[-0.38, 0, 0.38].map(x => (
          <mesh key={`material-${x}`} position={[x, 0.48, 0]} castShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.34, 0.7, 0.68]} />
            <meshStandardMaterial color="#b89361" roughness={0.9} />
          </mesh>
        ))}
      </group>
      <group position={[-2.85, 0, 1.45]}>
        <mesh position={[0, 0.85, 0]} castShadow raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.33, 0.33, 1.7, 18]} />
          <meshStandardMaterial color="#d8a51f" roughness={0.7} metalness={0.15} />
        </mesh>
        <mesh position={[0, 0.95, 0.31]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.36, 0.22, 0.025]} />
          <meshStandardMaterial color="#111827" emissive="#fbbf24" emissiveIntensity={0.45} roughness={0.5} />
        </mesh>
      </group>

      <hemisphereLight args={['#d9e5ed', '#4d4538', 0.48]} />
      <ambientLight intensity={0.52} color="#e8eef2" />
      <KeyLight color="#fff0cf" intensity={7.2} position={[2.8, 4.2, 2.2]} shadowsEnabled={shadowsEnabled} angle={0.58} />
      <pointLight position={[-2.6, 2.1, 1.6]} intensity={2.4} distance={7} decay={2} color="#ffd27a" />
      <pointLight position={[0, 1.7, 3.2]} intensity={3.2} distance={7} decay={2} color="#f1f5f9" />
    </group>
  );
}

const FIRE_SMOKE_COUNT = 72;
function FireSmoke() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(FIRE_SMOKE_COUNT * 3);
    for (let i = 0; i < FIRE_SMOKE_COUNT; i++) {
      const band = i % 12;
      values[i * 3] = -3 + band * 0.5 + Math.sin(i * 2.17) * 0.18;
      values[i * 3 + 1] = 0.25 + ((i * 0.31) % 2.6);
      values[i * 3 + 2] = -2.35 + Math.cos(i * 1.73) * 0.35;
    }
    return values;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const attribute = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const values = attribute.array as Float32Array;
    for (let i = 0; i < FIRE_SMOKE_COUNT; i++) {
      values[i * 3] += Math.sin(clock.elapsedTime * 0.18 + i) * 0.0008;
      values[i * 3 + 1] = 0.2 + ((positions[i * 3 + 1] + clock.elapsedTime * 0.035) % 2.75);
    }
    attribute.needsUpdate = true;
  });

  return (
    <points ref={ref} raycast={NO_RAYCAST}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.slice(), 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.16} color="#4b5563" transparent opacity={0.25} depthWrite={false} />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Fire — smoke-stained structure with cordon, extinguishing equipment and
// animated residual smoke. There are no decorative open flames beside the
// patient: the scene represents the safe treatment zone after extraction.
// ---------------------------------------------------------------------------
function FireScene({ shadowsEnabled }: { shadowsEnabled: boolean }) {
  return (
    <group>
      <OutdoorSky zenith="#596979" horizon="#a78b78" />
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[9, 9]} />
        <meshStandardMaterial color="#252728" roughness={0.97} />
      </mesh>
      <mesh position={[0, 1.2, -2.65]} receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[7.8, 2.5, 0.1]} />
        <meshStandardMaterial color="#383536" roughness={0.94} />
      </mesh>
      {[-2.8, -1.4, 0, 1.4, 2.8].map((x, index) => (
        <mesh key={`charred-stud-${x}`} position={[x, 1.25, -2.52]} rotation={[0, 0, index % 2 ? 0.035 : -0.025]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.16, 2.5, 0.16]} />
          <meshStandardMaterial color="#161617" roughness={0.99} />
        </mesh>
      ))}
      <mesh position={[0, 0.55, -2.46]} raycast={NO_RAYCAST}>
        <planeGeometry args={[5.8, 0.9]} />
        <meshStandardMaterial color="#151516" transparent opacity={0.55} roughness={1} />
      </mesh>

      {/* Fire service exclusion tape and extinguisher. */}
      {[-2.1, 2.1].map(x => (
        <group key={`cordon-${x}`} position={[x, 0, 1.7]}>
          <mesh position={[0, 0.62, 0]} raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.035, 0.045, 1.24, 10]} />
            <meshStandardMaterial color="#d6d8da" metalness={0.6} roughness={0.38} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.72, 1.7]} raycast={NO_RAYCAST}>
        <boxGeometry args={[4.2, 0.08, 0.025]} />
        <meshStandardMaterial color="#f5c518" emissive="#f59e0b" emissiveIntensity={0.18} roughness={0.62} />
      </mesh>
      <group position={[2.75, 0, 0.9]}>
        <mesh position={[0, 0.45, 0]} castShadow raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.16, 0.19, 0.8, 18]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.5} metalness={0.26} />
        </mesh>
        <mesh position={[0, 0.92, 0]} rotation={[0, 0, -0.3]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.28, 0.1, 0.08]} />
          <meshStandardMaterial color="#111827" metalness={0.55} roughness={0.4} />
        </mesh>
      </group>
      <FireSmoke />
      <hemisphereLight args={['#7f8fa6', '#2b211f', 0.32]} />
      <ambientLight intensity={0.42} color="#b8c3cf" />
      <KeyLight color="#f8dcc4" intensity={6.1} position={[2.4, 3.4, 2.0]} shadowsEnabled={shadowsEnabled} angle={0.62} />
      <pointLight position={[-2.4, 1.1, -1.7]} intensity={2.8} distance={6} decay={2} color="#ff6b35" />
      <pointLight position={[2.6, 1.5, 1.6]} intensity={1.5} distance={5} decay={2} color="#3b82f6" />
      <pointLight position={[0, 1.7, 3.1]} intensity={2.8} distance={7} decay={2} color="#f8fafc" />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Water rescue — wet treatment apron beside visible water, with rescue ring,
// throw line and drainage. The patient remains on dry ground after extraction.
// ---------------------------------------------------------------------------
function WaterScene({ shadowsEnabled }: { shadowsEnabled: boolean }) {
  return (
    <group>
      <OutdoorSky zenith="#7bc7e3" horizon="#d9f2ed" />
      <mesh position={[0, -0.05, 0.3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[9, 8]} />
        <meshStandardMaterial color="#c8b48f" roughness={0.86} />
      </mesh>
      <mesh position={[0, -0.035, -2.45]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <planeGeometry args={[9, 2.4]} />
        <meshStandardMaterial color="#1886a7" emissive="#0e7490" emissiveIntensity={0.18} roughness={0.13} metalness={0.18} transparent opacity={0.9} />
      </mesh>
      {[-3, -1.5, 0, 1.5, 3].map((x, index) => (
        <mesh key={`water-ripple-${x}`} position={[x, -0.025, -2.15 - (index % 2) * 0.4]} rotation={[-Math.PI / 2, 0, 0.08]} raycast={NO_RAYCAST}>
          <planeGeometry args={[0.9, 0.035]} />
          <meshBasicMaterial color="#b9efff" transparent opacity={0.46} />
        </mesh>
      ))}
      <mesh position={[0, 0.01, -1.28]} receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[9, 0.14, 0.32]} />
        <meshStandardMaterial color="#e6e2da" roughness={0.74} />
      </mesh>

      <group position={[2.75, 0.62, -0.85]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow raycast={NO_RAYCAST}>
          <torusGeometry args={[0.38, 0.1, 12, 28]} />
          <meshStandardMaterial color="#f97316" roughness={0.58} />
        </mesh>
        {[0, Math.PI / 2].map(rotation => (
          <mesh key={`ring-band-${rotation}`} rotation={[0, 0, rotation]} raycast={NO_RAYCAST}>
            <boxGeometry args={[0.2, 0.74, 0.12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.45} />
          </mesh>
        ))}
      </group>
      <mesh position={[-2.8, 0.02, 1.5]} rotation={[-Math.PI / 2, 0, -0.18]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[1.4, 0.75]} />
        <meshStandardMaterial color="#f3f4f6" roughness={0.98} />
      </mesh>
      <mesh position={[2.35, 0.01, 1.5]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <circleGeometry args={[0.72, 24]} />
        <meshStandardMaterial color="#698491" roughness={0.2} metalness={0.16} transparent opacity={0.42} />
      </mesh>

      <hemisphereLight args={['#caefff', '#735f42', 0.72]} />
      <ambientLight intensity={0.62} color="#dff7ff" />
      <KeyLight color="#fff6dd" intensity={7.8} position={[-2.7, 4.2, 2.4]} shadowsEnabled={shadowsEnabled} angle={0.55} />
      <pointLight position={[0, 0.8, -2.0]} intensity={1.4} distance={7} decay={2} color="#66d9ff" />
      <pointLight position={[0, 1.6, 3.2]} intensity={3.4} distance={7} decay={2} color="#e6f7ff" />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Heat/outdoor — desert or exposed sports/work scene, with shade canopy,
// hydration station and high-contrast sun. This avoids placing heat illness
// beside traffic wreckage merely because it happened outdoors.
// ---------------------------------------------------------------------------
function HeatScene({ shadowsEnabled, showPatientSeat }: { shadowsEnabled: boolean; showPatientSeat: boolean }) {
  return (
    <group>
      <OutdoorSky zenith="#78b9e4" horizon="#dbe8ea" />
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#cda66d" roughness={0.99} />
      </mesh>
      {[[-3.2, -2.6], [-2.5, 2.6], [2.9, -2.8], [3.4, 2.5]].map(([x, z], index) => (
        <mesh key={`desert-stone-${index}`} position={[x, 0.02, z]} rotation={[0, index * 0.8, 0]} castShadow raycast={NO_RAYCAST}>
          <dodecahedronGeometry args={[0.18 + (index % 2) * 0.08, 0]} />
          <meshStandardMaterial color="#9a744a" roughness={0.98} />
        </mesh>
      ))}

      {/* The case presentation says the worker is sitting in shade. Centre the
          canopy over the treatment lane, with four corner uprights outside
          the examination silhouette so no pole projects through the patient. */}
      {([[-2.8, -2], [2.8, -2], [-2.8, 2], [2.8, 2]] as const).map(([x, z]) => (
        <mesh key={`canopy-pole-${x}-${z}`} position={[x, 1.35, z]} castShadow raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.035, 0.045, 2.7, 10]} />
          <meshStandardMaterial color="#d7dde1" metalness={0.72} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, 2.64, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[5.75, 0.045, 4.15]} />
        <meshStandardMaterial color="#e8dfc8" roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      {/* Backless field bench supports a seated heat-illness patient without
          covering the chest, arms or legs students need to examine. */}
      {showPatientSeat && (
        <group position={[0, 0, 0.34]}>
          <mesh position={[0, 0.53, -0.08]} castShadow receiveShadow raycast={NO_RAYCAST}>
            <boxGeometry args={[0.82, 0.12, 0.5]} />
            <meshStandardMaterial color="#6b563f" roughness={0.9} />
          </mesh>
          {[-0.3, 0.3].map(x => (
            <mesh key={`heat-bench-leg-${x}`} position={[x, 0.255, -0.08]} castShadow raycast={NO_RAYCAST}>
              <boxGeometry args={[0.055, 0.51, 0.055]} />
              <meshStandardMaterial color="#454a4e" roughness={0.52} metalness={0.48} />
            </mesh>
          ))}
        </group>
      )}
      {/* Cooler and bottled water on the crew side. */}
      <group position={[2.75, 0, 1.5]}>
        <mesh position={[0, 0.28, 0]} castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.8, 0.56, 0.52]} />
          <meshStandardMaterial color="#e5edf2" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.58, 0]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.84, 0.08, 0.56]} />
          <meshStandardMaterial color="#38a6c9" roughness={0.48} />
        </mesh>
        {[-0.22, 0, 0.22].map(x => (
          <mesh key={`water-bottle-${x}`} position={[x, 0.88, 0]} castShadow raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.045, 0.055, 0.46, 12]} />
            <meshStandardMaterial color="#bce9f4" transparent opacity={0.62} roughness={0.18} />
          </mesh>
        ))}
      </group>

      {/* A broad, front-biased field light keeps skin and assessment targets
          legible beneath the canopy. The warm hemisphere still carries the
          desert palette without turning clinical findings into silhouettes. */}
      <hemisphereLight args={['#d7edff', '#8b6336', 0.7]} />
      <ambientLight intensity={1.15} color="#fff1d6" />
      <KeyLight color="#fff0c4" intensity={8.4} position={[0, 3.1, 1.8]} shadowsEnabled={shadowsEnabled} angle={0.72} />
      <pointLight position={[-1.5, 2.0, 1.2]} intensity={3.2} distance={7} decay={2} color="#fff4dc" />
      <pointLight position={[1.5, 2.0, 1.2]} intensity={3.2} distance={7} decay={2} color="#fff4dc" />
      <pointLight position={[0, 1.2, 2.4]} intensity={2.2} distance={6} decay={2} color="#e8f4ff" />
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
      <OutdoorSky zenith="#8cb6d4" horizon="#e8d3ba" />
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
// Variant switch. 'clinic' is handled by index.tsx.
// ---------------------------------------------------------------------------
export function SceneVariantEnvironment({
  variant,
  hideOverhead,
  shadowsEnabled,
  showPatientSeat,
}: {
  variant: Exclude<EnvironmentVariant, 'clinic'>;
  hideOverhead: boolean;
  shadowsEnabled: boolean;
  showPatientSeat: boolean;
}) {
  if (variant === 'home') return <HomeScene hideOverhead={hideOverhead} shadowsEnabled={shadowsEnabled} showPatientSeat={showPatientSeat} />;
  if (variant === 'public') return <PublicScene hideOverhead={hideOverhead} shadowsEnabled={shadowsEnabled} />;
  if (variant === 'industrial') return <IndustrialScene shadowsEnabled={shadowsEnabled} />;
  if (variant === 'fire') return <FireScene shadowsEnabled={shadowsEnabled} />;
  if (variant === 'water') return <WaterScene shadowsEnabled={shadowsEnabled} />;
  if (variant === 'heat') return <HeatScene shadowsEnabled={shadowsEnabled} showPatientSeat={showPatientSeat} />;
  return <RoadsideScene shadowsEnabled={shadowsEnabled} />;
}
