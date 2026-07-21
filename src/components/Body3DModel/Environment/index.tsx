/**
 * Treatment-bay environment — the room the patient is treated in.
 *
 * Everything here is procedural Three.js primitives (no external assets):
 * a lino-floored bay with walls, a side window, wall cabinets replaced by
 * real props (IV stand, monitor on a stand, oxygen tank, crash cart), a
 * shadow-casting surgical key light, a cool window rim light, dust motes
 * drifting through the beam, and a radial-gradient soft shadow grounding
 * the patient.
 *
 * Rules inherited from the old inline PatientSceneEnvironment:
 * - every mesh sets raycast={() => null} so region clicks pass through
 * - hideOverhead: the supine-bay orbit camera lives ABOVE the patient, so
 *   ceiling/lamp geometry would sit between camera and anatomy
 * - hideBed: floor-staged patients are treated where they were found
 * - the stretcher footprint ([0, 0.45, 0.02], 1.18 x 2.38) is load-bearing —
 *   BodyMesh stages the patient against it. Do not move it.
 */
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getBayTextures } from './textures';
import { SceneVariantEnvironment } from './SceneVariant';
import type { EnvironmentVariant } from '@/lib/sceneEnvironment';

const NO_RAYCAST = () => null;

/** Shared brushed-steel material props — the near-white metal map is tinted
 *  by each mesh's existing color. Reflections come from the scene HDRI. */
function steelProps(): {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughness: number;
  metalness: number;
} {
  const { metal } = getBayTextures();
  return { map: metal.map, normalMap: metal.normalMap, roughness: 0.4, metalness: 0.8 };
}

// ---------------------------------------------------------------------------
// Palette — one fixed clinical palette. The room lives behind ACES tone
// mapping and its own lighting; it no longer follows the DOM theme class.
// ---------------------------------------------------------------------------
const PALETTE = {
  floor: '#242f3a',
  wall: '#2e3d4b',
  wallBack: '#1c2733',
  ceiling: '#131b25',
  metal: '#8fa1b1',
  steel: '#b6c2cc',
  bed: '#d9e2e8',
  sheet: '#f1f5f9',
  screenGlow: '#22d3ee',
};

// ---------------------------------------------------------------------------
// Room shell
// ---------------------------------------------------------------------------
function Room({ hideOverhead }: { hideOverhead: boolean }) {
  const tex = getBayTextures();
  return (
    <group>
      {/* Floor — large enough that the orbit camera never sees its edge.
          Linoleum map carries the hue; slight gloss picks up the key light. */}
      <mesh position={[0, -0.05, 0.1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow raycast={NO_RAYCAST}>
        <planeGeometry args={[7.2, 7.2]} />
        <meshStandardMaterial
          map={tex.floor.map}
          normalMap={tex.floor.normalMap}
          normalScale={[0.7, 0.7]}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.05, -1.05]} receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[4.2, 2.3, 0.05]} />
        <meshStandardMaterial
          map={tex.wallBack.map}
          normalMap={tex.wallBack.normalMap}
          normalScale={[0.5, 0.5]}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      {/* Side walls */}
      {[-2.05, 2.05].map((x) => (
        <mesh key={`side-${x}`} position={[x, 1.05, 0.4]} receiveShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.05, 2.3, 3.0]} />
          <meshStandardMaterial
            map={tex.wall.map}
            normalMap={tex.wall.normalMap}
            normalScale={[0.5, 0.5]}
            roughness={0.9}
            metalness={0}
          />
        </mesh>
      ))}

      {/* Skirting — a bright steel kick-line where wall meets floor reads
          "hospital corridor" instantly. */}
      {[-2.02, 2.02].map((x) => (
        <mesh key={`skirt-${x}`} position={[x, 0.03, 0.4]} raycast={NO_RAYCAST}>
          <boxGeometry args={[0.02, 0.12, 3.0]} />
          <meshStandardMaterial color={PALETTE.metal} {...steelProps()} />
        </mesh>
      ))}
      <mesh position={[0, 0.03, -1.02]} raycast={NO_RAYCAST}>
        <boxGeometry args={[4.2, 0.12, 0.02]} />
        <meshStandardMaterial color={PALETTE.metal} {...steelProps()} />
      </mesh>

      {/* Window on the left wall — motivates the cool rim light. */}
      <group position={[-2.02, 1.35, 0.55]}>
        <mesh raycast={NO_RAYCAST}>
          <boxGeometry args={[0.03, 0.85, 1.25]} />
          <meshStandardMaterial
            color="#9db8d6"
            emissive="#a9c8e8"
            emissiveIntensity={0.65}
            roughness={0.15}
            metalness={0.1}
          />
        </mesh>
        {/* Frame + mullions */}
        {[[-0.46, 0], [0.46, 0], [0, 0]].map(([y], i) => (
          <mesh key={`mull-h-${i}`} position={[0.015, y, 0]} raycast={NO_RAYCAST}>
            <boxGeometry args={[0.035, 0.05, 1.3]} />
            <meshStandardMaterial color={PALETTE.wallBack} roughness={0.5} metalness={0.3} />
          </mesh>
        ))}
        {[-0.66, 0, 0.66].map((z) => (
          <mesh key={`mull-v-${z}`} position={[0.015, 0, z]} raycast={NO_RAYCAST}>
            <boxGeometry args={[0.035, 0.95, 0.05]} />
            <meshStandardMaterial color={PALETTE.wallBack} roughness={0.5} metalness={0.3} />
          </mesh>
        ))}
      </group>

      {/* Wall-mounted vitals repeater on the back wall — a lit panel. */}
      <mesh position={[0.85, 1.42, -1.01]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.44, 0.28, 0.03]} />
        <meshStandardMaterial
          color="#020617"
          roughness={0.4}
          metalness={0.15}
          emissive={PALETTE.screenGlow}
          emissiveIntensity={0.22}
        />
      </mesh>

      {/* Ceiling, panel lights and the surgical lamp head hide when the
          camera orbits above the patient. */}
      {!hideOverhead && (
        <>
          <mesh position={[0, 2.3, 0.1]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
            <planeGeometry args={[4.2, 3.2]} />
            <meshStandardMaterial
              map={tex.ceiling.map}
              normalMap={tex.ceiling.normalMap}
              normalScale={[0.5, 0.5]}
              roughness={0.7}
              metalness={0.05}
            />
          </mesh>
          {[-0.85, 0.85].map((x) => (
            <mesh key={`panel-${x}`} position={[x, 2.28, -0.2]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
              <boxGeometry args={[0.5, 1.1, 0.02]} />
              <meshStandardMaterial color="#dbeafe" roughness={0.2} emissive="#bae6fd" emissiveIntensity={0.6} />
            </mesh>
          ))}
          <SurgicalLampHead />
        </>
      )}
    </group>
  );
}

/** Visible surgical lamp: arm from the ceiling + emissive dish. The actual
 *  illumination comes from the shadow-casting spotlight in BayLighting. */
function SurgicalLampHead() {
  return (
    <group position={[0.25, 0, 0.3]}>
      <mesh position={[0, 2.05, 0]} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 10]} />
        <meshStandardMaterial color={PALETTE.metal} {...steelProps()} />
      </mesh>
      <mesh position={[0, 1.78, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.19, 0.24, 0.09, 24]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.25} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.73, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <circleGeometry args={[0.2, 24]} />
        <meshStandardMaterial color="#fff7e6" emissive="#fff2d9" emissiveIntensity={1.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Stretcher — same footprint as the old translucent bed, now solid with a
// frame, undercarriage and wheels.
// ---------------------------------------------------------------------------
function Stretcher() {
  const { fabric } = getBayTextures();
  return (
    <group position={[0, 0, 0.02]}>
      {/* Mattress + sheet (footprint is load-bearing — see file header) */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[1.18, 0.08, 2.38]} />
        <meshStandardMaterial
          map={fabric.map}
          normalMap={fabric.normalMap}
          normalScale={[0.6, 0.6]}
          roughness={0.95}
          metalness={0}
        />
      </mesh>
      <mesh position={[0, 0.495, 0]} raycast={NO_RAYCAST}>
        <boxGeometry args={[1.0, 0.015, 2.14]} />
        <meshStandardMaterial color={PALETTE.sheet} roughness={0.92} />
      </mesh>
      {/* Side rails */}
      {[-0.62, 0.62].map((x) => (
        <mesh key={`rail-${x}`} position={[x, 0.56, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.013, 0.013, 1.9, 12]} />
          <meshStandardMaterial color={PALETTE.steel} {...steelProps()} />
        </mesh>
      ))}
      {/* Undercarriage + legs + wheels */}
      <mesh position={[0, 0.36, 0]} castShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[0.9, 0.05, 2.0]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.45} metalness={0.35} />
      </mesh>
      {([[-0.45, -0.95], [0.45, -0.95], [-0.45, 0.95], [0.45, 0.95]] as const).map(([x, z]) => (
        <group key={`leg-${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.2, 0]} castShadow raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.016, 0.016, 0.34, 10]} />
            <meshStandardMaterial color={PALETTE.steel} {...steelProps()} />
          </mesh>
          <mesh position={[0, 0.0, 0]} rotation={[0, 0, Math.PI / 2]} raycast={NO_RAYCAST}>
            <cylinderGeometry args={[0.045, 0.045, 0.03, 14]} />
            <meshStandardMaterial color="#1e293b" roughness={0.55} metalness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Props — IV stand, monitor stand, oxygen tank, crash cart. All placed
// outside the patient/stretcher footprint, all castShadow.
// ---------------------------------------------------------------------------
function IVStand() {
  return (
    <group position={[-1.15, 0, 0.9]}>
      <mesh position={[0, 0.02, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.17, 0.19, 0.03, 5]} />
        <meshStandardMaterial color={PALETTE.steel} {...steelProps()} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.012, 0.012, 1.85, 10]} />
        <meshStandardMaterial color={PALETTE.steel} {...steelProps()} />
      </mesh>
      {/* Hook cross */}
      {[0, Math.PI / 2].map((rot) => (
        <mesh key={`hook-${rot}`} position={[0, 1.86, 0]} rotation={[Math.PI / 2, 0, rot]} raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.008, 0.008, 0.36, 8]} />
          <meshStandardMaterial color={PALETTE.steel} {...steelProps()} />
        </mesh>
      ))}
      {/* Saline bag */}
      <mesh position={[0.15, 1.68, 0]} castShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[0.1, 0.17, 0.035]} />
        <meshStandardMaterial color="#dbeafe" roughness={0.2} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function MonitorStand() {
  return (
    <group position={[1.3, 0, 0.7]} rotation={[0, -0.5, 0]}>
      <mesh position={[0, 0.02, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.18, 0.2, 0.03, 5]} />
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.02, 0.02, 1.05, 10]} />
        <meshStandardMaterial color="#334155" roughness={0.35} metalness={0.6} />
      </mesh>
      <group position={[0, 1.18, 0]} rotation={[-0.15, 0, 0]}>
        <mesh castShadow raycast={NO_RAYCAST}>
          <boxGeometry args={[0.38, 0.28, 0.05]} />
          <meshStandardMaterial color="#0f172a" roughness={0.45} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.027]} raycast={NO_RAYCAST}>
          <planeGeometry args={[0.34, 0.24]} />
          <meshStandardMaterial
            color="#020617"
            emissive={PALETTE.screenGlow}
            emissiveIntensity={0.9}
            roughness={0.3}
          />
        </mesh>
      </group>
    </group>
  );
}

function OxygenTank() {
  return (
    <group position={[1.55, 0, -0.6]}>
      <mesh position={[0, 0.31, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.075, 0.075, 0.62, 18]} />
        <meshStandardMaterial color="#0e7490" roughness={0.3} metalness={0.65} />
      </mesh>
      <mesh position={[0, 0.62, 0]} raycast={NO_RAYCAST}>
        <sphereGeometry args={[0.075, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.65} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.018, 0.018, 0.09, 10]} />
        <meshStandardMaterial color={PALETTE.steel} roughness={0.25} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.77, 0]} rotation={[0, 0, Math.PI / 2]} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.012, 0.012, 0.08, 8]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} metalness={0.4} />
      </mesh>
    </group>
  );
}

function CrashCart() {
  return (
    <group position={[-1.55, 0, -0.5]} rotation={[0, 0.35, 0]}>
      <mesh position={[0, 0.47, 0]} castShadow raycast={NO_RAYCAST}>
        <boxGeometry args={[0.52, 0.78, 0.42]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.5} metalness={0.15} />
      </mesh>
      {/* Drawer faces + handles */}
      {[0.68, 0.5, 0.32, 0.14].map((y) => (
        <group key={`drawer-${y}`} position={[0, y, 0.215]}>
          <mesh raycast={NO_RAYCAST}>
            <boxGeometry args={[0.46, 0.14, 0.015]} />
            <meshStandardMaterial color="#dc2626" roughness={0.45} metalness={0.15} />
          </mesh>
          <mesh position={[0, 0, 0.015]} raycast={NO_RAYCAST}>
            <boxGeometry args={[0.3, 0.02, 0.015]} />
            <meshStandardMaterial color={PALETTE.steel} {...steelProps()} />
          </mesh>
        </group>
      ))}
      {/* Top tray rim */}
      <mesh position={[0, 0.88, 0]} raycast={NO_RAYCAST}>
        <boxGeometry args={[0.54, 0.03, 0.44]} />
        <meshStandardMaterial color={PALETTE.steel} {...steelProps()} />
      </mesh>
      {([[-0.2, -0.15], [0.2, -0.15], [-0.2, 0.15], [0.2, 0.15]] as const).map(([x, z]) => (
        <mesh key={`wheel-${x}-${z}`} position={[x, 0.035, z]} rotation={[0, 0, Math.PI / 2]} raycast={NO_RAYCAST}>
          <cylinderGeometry args={[0.035, 0.035, 0.025, 12]} />
          <meshStandardMaterial color="#1e293b" roughness={0.55} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Lighting — surgical key spot (shadow-casting), cool window rim, warm fill.
// ---------------------------------------------------------------------------
function BayLighting({ shadowsEnabled }: { shadowsEnabled: boolean }) {
  const lampTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 0.45, 0);
    return o;
  }, []);
  return (
    <group>
      <primitive object={lampTarget} />
      {/* Surgical key light. Warm, tight, and the only shadow caster —
          the patient mesh already sets castShadow (BodyMesh). */}
      <spotLight
        position={[0.25, 2.6, 0.3]}
        target={lampTarget}
        angle={0.55}
        penumbra={0.7}
        intensity={8}
        distance={8}
        decay={2}
        color="#fff0dd"
        castShadow={shadowsEnabled}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
      />
      {/* Cool rim from the window — silhouette separation on the far side. */}
      <pointLight position={[-1.85, 1.45, 0.55]} intensity={3.5} distance={6} decay={2} color="#bcd7ff" />
      {/* Low warm fill from the camera side so shadow sides never go dead. */}
      <pointLight position={[1.2, 1.0, 1.5]} intensity={1.1} distance={4.5} decay={2} color="#ffd9b0" />
      {/* Equipment glow accents (carried over from the old bay). */}
      <pointLight position={[1.3, 1.2, 0.7]} intensity={0.5} distance={2.2} decay={2} color={PALETTE.screenGlow} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Dust motes drifting through the key-light beam. ~140 points, positions
// mutated in place — trivial per-frame cost, huge atmosphere payoff.
// ---------------------------------------------------------------------------
const DUST_COUNT = 140;
const DUST_HEIGHT = 2.1;

function DustMotes() {
  const pointsRef = useRef<THREE.Points>(null);
  const data = useMemo(() => {
    const base = new Float32Array(DUST_COUNT * 3);
    const seed = new Float32Array(DUST_COUNT * 2); // phase, fall speed
    for (let i = 0; i < DUST_COUNT; i++) {
      base[i * 3] = 0.25 + (Math.random() - 0.5) * 1.7;
      base[i * 3 + 1] = 0.15 + Math.random() * DUST_HEIGHT;
      base[i * 3 + 2] = 0.3 + (Math.random() - 0.5) * 1.7;
      seed[i * 2] = Math.random() * Math.PI * 2;
      seed[i * 2 + 1] = 0.015 + Math.random() * 0.04;
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
    for (let i = 0; i < DUST_COUNT; i++) {
      const phase = seed[i * 2];
      const fall = seed[i * 2 + 1];
      // Slow settle with wrap-around, plus a lazy horizontal waft.
      const y = base[i * 3 + 1] - t * fall;
      arr[i * 3 + 1] = 0.15 + ((y % DUST_HEIGHT) + DUST_HEIGHT) % DUST_HEIGHT;
      arr[i * 3] = base[i * 3] + Math.sin(t * 0.3 + phase) * 0.05;
      arr[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * 0.22 + phase) * 0.04;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} raycast={NO_RAYCAST}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.013}
        sizeAttenuation
        color="#ffedd5"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Soft grounding shadow — a radial-gradient disc under the patient. Softer
// and cheaper than pushing ContactShadows resolution up; the two layer.
// ---------------------------------------------------------------------------
function SoftGroundShadow() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(128, 128, 12, 128, 128, 128);
      gradient.addColorStop(0, 'rgba(0,0,0,0.5)');
      gradient.addColorStop(0.55, 'rgba(0,0,0,0.22)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[0, -0.045, 0.02]} rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
      <planeGeometry args={[3.2, 1.6]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Public: the composed environment.
// ---------------------------------------------------------------------------
export function TreatmentBayEnvironment({
  hideOverhead = false,
  hideBed = false,
  shadowsEnabled = true,
  variant = 'clinic',
}: {
  hideOverhead?: boolean;
  hideBed?: boolean;
  shadowsEnabled?: boolean;
  variant?: EnvironmentVariant;
}) {
  return (
    <group>
      {/* Scene shell + lighting swap per variant; the medical equipment
          below stays in every scene — the paramedic brings it. */}
      {variant === 'clinic' ? (
        <>
          <Room hideOverhead={hideOverhead} />
          <BayLighting shadowsEnabled={shadowsEnabled} />
        </>
      ) : (
        <SceneVariantEnvironment
          variant={variant}
          hideOverhead={hideOverhead}
          shadowsEnabled={shadowsEnabled}
        />
      )}
      {!hideBed && <Stretcher />}
      <IVStand />
      <MonitorStand />
      <OxygenTank />
      <CrashCart />
      <DustMotes />
      <SoftGroundShadow />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Camera entrance — easing into the bay with a slight dutch tilt instead of
// snapping to the preset. Runs once each time the bay presentation activates;
// any pointer interaction cancels it instantly (the student always wins).
// ---------------------------------------------------------------------------
interface EntranceControls {
  object: THREE.Camera & { up: THREE.Vector3; position: THREE.Vector3 };
  target: THREE.Vector3;
  update: () => void;
}

const ENTRANCE_MS = 1500;
const DUTCH_TILT_RAD = 0.07; // ~4 degrees of roll, eased out to level

export function CameraEntrance({
  active,
  focus,
  controlsRef,
}: {
  active: boolean;
  focus: { pos: [number, number, number]; target: [number, number, number] };
  controlsRef: React.RefObject<EntranceControls | null>;
}) {
  const gl = useThree((s) => s.gl);
  const focusRef = useRef(focus);
  focusRef.current = focus;

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let cancelled = false;
    const start = performance.now();
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const finish = (controls: EntranceControls) => {
      controls.object.up.set(0, 1, 0);
      controls.update();
    };

    const cancel = () => {
      if (cancelled) return;
      cancelled = true;
      cancelAnimationFrame(raf);
      const controls = controlsRef.current;
      if (controls) finish(controls);
    };

    const step = () => {
      if (cancelled) return;
      const controls = controlsRef.current;
      if (!controls) {
        raf = requestAnimationFrame(step);
        return;
      }
      const { pos, target } = focusRef.current;
      const rawT = Math.min((performance.now() - start) / ENTRANCE_MS, 1);
      const t = easeOutCubic(rawT);
      // Start pulled back and slightly high, ease down onto the preset.
      const pullback = 1 + 0.3 * (1 - t);
      controls.object.position.set(
        target[0] + (pos[0] - target[0]) * pullback,
        pos[1] + 0.35 * (1 - t) + (pos[1] - target[1]) * (pullback - 1),
        target[2] + (pos[2] - target[2]) * pullback,
      );
      controls.target.set(target[0], target[1], target[2]);
      // Dutch tilt: roll the up-vector, easing back to vertical.
      const roll = DUTCH_TILT_RAD * (1 - t);
      controls.object.up.set(Math.sin(roll), Math.cos(roll), 0);
      controls.update();
      if (rawT < 1) {
        raf = requestAnimationFrame(step);
      } else {
        finish(controls);
        cancelled = true;
      }
    };

    raf = requestAnimationFrame(step);
    const dom = gl.domElement;
    dom.addEventListener('pointerdown', cancel);
    return () => {
      dom.removeEventListener('pointerdown', cancel);
      cancel();
    };
  }, [active, controlsRef, gl]);

  return null;
}
