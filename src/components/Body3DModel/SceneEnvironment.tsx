/**
 * SceneEnvironment — the place the patient was found, as set dressing.
 *
 * One component, one preset prop (from lib/sceneEnvironment's pure
 * classifier). Every preset is lightweight primitive geometry — no textures,
 * no GLBs — so the scene stays interactive and cheap on iPad. Everything is
 * raycast-disabled: clicks fall through to the patient, always.
 *
 * Layout contract (shared with the exam camera): the patient stands/lies at
 * the origin, the back of the set lives at z ≲ -0.9, and props keep out of
 * the stretcher footprint (|x| < 0.8, -0.5 < z < 1.3) so the camera can
 * orbit and the crew's kit (SceneKit) has floor space.
 */

import { useMemo, useSyncExternalStore, type ReactElement } from 'react';
import * as THREE from 'three';
import { PRESET_MOOD, type ScenePresetId } from '@/lib/sceneEnvironment';

/** Follow the app's class-based theme so the 3D backdrop matches the UI. */
function useIsDarkTheme(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains('dark'),
  );
}

const noRaycast = () => null;

/** Terse primitive helpers — every scene mesh is click-transparent. */
function Box({ p, s, r, color, rough = 0.8, metal = 0.02, opacity = 1, emissive, emissiveIntensity = 0.3 }: {
  p: [number, number, number];
  s: [number, number, number];
  r?: [number, number, number];
  color: string;
  rough?: number;
  metal?: number;
  opacity?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <mesh position={p} rotation={r} raycast={noRaycast}>
      <boxGeometry args={s} />
      <meshStandardMaterial
        color={color}
        roughness={rough}
        metalness={metal}
        transparent={opacity < 1}
        opacity={opacity}
        {...(emissive ? { emissive, emissiveIntensity } : {})}
      />
    </mesh>
  );
}

function Cyl({ p, rTop, rBot, h, color, rough = 0.7, metal = 0.1, r, opacity = 1, emissive, emissiveIntensity = 0.3 }: {
  p: [number, number, number];
  rTop: number;
  rBot: number;
  h: number;
  color: string;
  rough?: number;
  metal?: number;
  r?: [number, number, number];
  opacity?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <mesh position={p} rotation={r} raycast={noRaycast}>
      <cylinderGeometry args={[rTop, rBot, h, 16]} />
      <meshStandardMaterial
        color={color}
        roughness={rough}
        metalness={metal}
        transparent={opacity < 1}
        opacity={opacity}
        {...(emissive ? { emissive, emissiveIntensity } : {})}
      />
    </mesh>
  );
}

/** Ground plane shared by every preset. */
function Floor({ color, rough = 0.8 }: { color: string; rough?: number }) {
  return (
    <mesh position={[0, -0.065, 0.16]} rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast}>
      <boxGeometry args={[4.4, 4.6, 0.035]} />
      <meshStandardMaterial color={color} roughness={rough} metalness={0.04} />
    </mesh>
  );
}

/** Back + side walls for indoor presets. `half` narrows the room (bathroom). */
function Walls({ color, half = false, opacity = 0.94 }: { color: string; half?: boolean; opacity?: number }) {
  const w = half ? 2.3 : 3.6;
  const sideZ = half ? 1.0 : 1.4;
  return (
    <group>
      <Box p={[0, 1.05, -0.98]} s={[w, 2.6, 0.05]} color={color} opacity={opacity} />
      <Box p={[-w / 2, 1.05, sideZ - 0.98]} s={[0.05, 2.6, sideZ * 2]} color={color} opacity={opacity * 0.9} />
      <Box p={[w / 2, 1.05, sideZ - 0.98]} s={[0.05, 2.6, sideZ * 2]} color={color} opacity={opacity * 0.9} />
    </group>
  );
}

/** Bright window band on the back wall — daylight is the UAE default. */
function Window({ x = 0.9, warm = false }: { x?: number; warm?: boolean }) {
  return (
    <Box
      p={[x, 1.35, -0.955]}
      s={[0.72, 0.85, 0.03]}
      color={warm ? '#ffe9c4' : '#dbeafe'}
      emissive={warm ? '#ffd9a0' : '#e0f2fe'}
      emissiveIntensity={0.5}
      rough={0.3}
    />
  );
}

/* ---------------------------------------------------------------- */
/*  Presets                                                          */
/* ---------------------------------------------------------------- */

function HomeLiving({ isDark }: { isDark: boolean }) {
  const wall = isDark ? '#3a3128' : '#d9cbb5';
  const sofa = isDark ? '#4a4238' : '#8b7d6b';
  return (
    <group>
      <Floor color={isDark ? '#4a3f33' : '#a89275'} rough={0.92} />
      <Walls color={wall} />
      <Window x={0.95} warm />
      {/* Rug under the patient */}
      <Cyl p={[0, -0.042, 0.15]} rTop={1.15} rBot={1.15} h={0.012} color={isDark ? '#5c4a3a' : '#b3937a'} rough={0.95} />
      {/* Sofa: seat + back + arms, left-back */}
      <group position={[-1.35, 0, -0.45]}>
        <Box p={[0, 0.22, 0]} s={[0.62, 0.24, 1.5]} color={sofa} rough={0.9} />
        <Box p={[-0.24, 0.48, 0]} s={[0.16, 0.42, 1.5]} color={sofa} rough={0.9} />
        <Box p={[0, 0.42, 0.78]} s={[0.62, 0.22, 0.14]} color={sofa} rough={0.9} />
        <Box p={[0, 0.42, -0.78]} s={[0.62, 0.22, 0.14]} color={sofa} rough={0.9} />
      </group>
      {/* Sideboard + TV on the back wall */}
      <Box p={[-0.4, 0.28, -0.86]} s={[1.1, 0.42, 0.22]} color={isDark ? '#2e2620' : '#6b5744'} rough={0.6} />
      <Box p={[-0.4, 0.95, -0.93]} s={[0.9, 0.52, 0.03]} color="#0b0f14" rough={0.35} emissive="#101826" emissiveIntensity={0.25} />
      {/* Floor lamp, right-back — the warm key of the room */}
      <group position={[1.45, 0, -0.6]}>
        <Cyl p={[0, 0.62, 0]} rTop={0.015} rBot={0.02} h={1.24} color="#8a8378" metal={0.4} />
        <Cyl p={[0, 1.32, 0]} rTop={0.13} rBot={0.17} h={0.2} color="#f3e2c0" emissive="#ffd9a0" emissiveIntensity={0.9} />
        <pointLight position={[0, 1.28, 0]} intensity={0.5} color="#ffd9a0" distance={3.2} decay={2} />
      </group>
      {/* Frames on the wall */}
      <Box p={[0.35, 1.45, -0.955]} s={[0.26, 0.34, 0.02]} color={isDark ? '#3b332a' : '#7a6c58'} />
      <Box p={[-1.15, 1.5, -0.955]} s={[0.4, 0.28, 0.02]} color={isDark ? '#3b332a' : '#7a6c58'} />
    </group>
  );
}

function HomeBedroom({ isDark }: { isDark: boolean }) {
  const wall = isDark ? '#332e33' : '#d8cfd8';
  return (
    <group>
      <Floor color={isDark ? '#453b31' : '#a08b71'} rough={0.92} />
      <Walls color={wall} />
      <Window x={-0.95} warm />
      {/* The patient's own bed, left — they were found beside/near it */}
      <group position={[-1.35, 0, -0.15]}>
        <Box p={[0, 0.26, 0]} s={[1.05, 0.16, 2.0]} color={isDark ? '#4a4442' : '#8f867f'} />
        <Box p={[0, 0.4, 0]} s={[1.0, 0.14, 1.95]} color={isDark ? '#d9d4cc' : '#f1ece2'} rough={0.95} />
        <Box p={[0, 0.62, -0.92]} s={[1.05, 0.5, 0.08]} color={isDark ? '#3a3230' : '#6e6055'} />
        <Box p={[0.15, 0.5, -0.62]} s={[0.5, 0.08, 0.32]} color="#ffffff" rough={0.95} />
      </group>
      {/* Bedside table + lamp */}
      <group position={[1.35, 0, -0.62]}>
        <Box p={[0, 0.25, 0]} s={[0.4, 0.42, 0.36]} color={isDark ? '#2e2824' : '#6b5744'} />
        <Cyl p={[0, 0.56, 0]} rTop={0.09} rBot={0.11} h={0.16} color="#f3e2c0" emissive="#ffd9a0" emissiveIntensity={0.85} />
        <pointLight position={[0, 0.6, 0]} intensity={0.42} color="#f5c56b" distance={2.6} decay={2} />
      </group>
      {/* Wardrobe */}
      <Box p={[1.45, 0.95, -0.15]} s={[0.5, 1.9, 0.4]} color={isDark ? '#2c2622' : '#7d6a55'} rough={0.65} />
    </group>
  );
}

function Bathroom({ isDark }: { isDark: boolean }) {
  const tile = isDark ? '#59666b' : '#dfe9ec';
  return (
    <group>
      <Floor color={isDark ? '#4d585c' : '#c8d4d8'} rough={0.35} />
      <Walls color={tile} half opacity={0.96} />
      {/* Bathtub along the back wall */}
      <group position={[0, 0, -0.68]}>
        <Box p={[0, 0.26, 0]} s={[1.6, 0.5, 0.62]} color={isDark ? '#c5ccd0' : '#f4f7f8'} rough={0.25} />
        <Box p={[0, 0.42, 0]} s={[1.4, 0.2, 0.44]} color={isDark ? '#39444a' : '#b8c6cc'} rough={0.3} />
      </group>
      {/* Sink pedestal + mirror */}
      <group position={[0.95, 0, 0.35]}>
        <Cyl p={[0, 0.38, 0]} rTop={0.07} rBot={0.09} h={0.76} color={isDark ? '#c5ccd0' : '#f4f7f8'} rough={0.3} />
        <Cyl p={[0, 0.78, 0]} rTop={0.21} rBot={0.16} h={0.09} color={isDark ? '#d4dade' : '#ffffff'} rough={0.2} />
      </group>
      <Box p={[1.12, 1.4, 0.35]} s={[0.03, 0.5, 0.4]} color="#9fb6c0" rough={0.1} metal={0.4} />
      {/* Towel rail — the bunched rug from the case text */}
      <Cyl p={[-1.1, 1.0, 0.2]} rTop={0.012} rBot={0.012} h={0.5} r={[Math.PI / 2, 0, 0]} color="#a8b0b5" metal={0.6} />
      <Box p={[-1.08, 0.78, 0.2]} s={[0.04, 0.42, 0.3]} color={isDark ? '#7c8a91' : '#cfdde2'} rough={0.95} />
      <Box p={[0.4, -0.04, 0.75]} s={[0.7, 0.015, 0.45]} r={[0, 0.35, 0]} color={isDark ? '#6e7e85' : '#b9cdd4'} rough={0.95} />
    </group>
  );
}

function Office({ isDark }: { isDark: boolean }) {
  const wall = isDark ? '#2b3440' : '#cfd8e3';
  return (
    <group>
      <Floor color={isDark ? '#333e4a' : '#8f9aa8'} rough={0.85} />
      <Walls color={wall} />
      <Window x={1.0} />
      {/* Two workstations along the back */}
      {[-0.85, 0.15].map((x) => (
        <group key={x} position={[x, 0, -0.68]}>
          <Box p={[0, 0.37, 0]} s={[0.85, 0.04, 0.45]} color={isDark ? '#3d4652' : '#b9c2cc'} rough={0.5} />
          {[-0.38, 0.38].map((lx) => (
            <Box key={lx} p={[lx, 0.18, 0]} s={[0.04, 0.36, 0.4]} color="#565f6a" metal={0.3} />
          ))}
          <Box p={[0, 0.55, -0.1]} s={[0.44, 0.28, 0.025]} color="#0b1018" emissive="#22384f" emissiveIntensity={0.6} rough={0.3} />
          <Cyl p={[0, 0.26, 0.42]} rTop={0.18} rBot={0.18} h={0.05} color="#2f353c" />
          <Cyl p={[0, 0.45, 0.42]} rTop={0.03} rBot={0.03} h={0.36} color="#3a414a" metal={0.5} />
          <Box p={[0, 0.62, 0.46]} s={[0.36, 0.34, 0.06]} color={isDark ? '#42505f' : '#5d6a77'} rough={0.85} />
        </group>
      ))}
      {/* Ceiling fluorescents */}
      {[-0.7, 0.7].map((x) => (
        <Box key={x} p={[x, 2.05, -0.1]} s={[0.9, 0.03, 0.16]} color="#eef4fb" emissive="#dbeafe" emissiveIntensity={0.8} />
      ))}
      <pointLight position={[0, 1.9, 0.2]} intensity={0.5} color="#dbe7f5" distance={3.4} decay={2} />
    </group>
  );
}

function Restaurant({ isDark }: { isDark: boolean }) {
  const wood = isDark ? '#4a382a' : '#8a6647';
  return (
    <group>
      <Floor color={wood} rough={0.7} />
      <Walls color={isDark ? '#3b2f26' : '#b59a7e'} />
      {/* Round tables + chairs, back corners */}
      {[[-1.25, -0.5], [1.3, -0.45]].map(([x, z]) => (
        <group key={`${x}`} position={[x, 0, z]}>
          <Cyl p={[0, 0.38, 0]} rTop={0.04} rBot={0.07} h={0.76} color="#3d3630" metal={0.3} />
          <Cyl p={[0, 0.78, 0]} rTop={0.42} rBot={0.42} h={0.04} color={isDark ? '#5c4735' : '#9c7a58'} rough={0.5} />
          <Box p={[0.12, 0.84, 0.1]} s={[0.14, 0.06, 0.14]} color="#e8e2d6" rough={0.4} />
          <Cyl p={[0.55, 0.24, 0.25]} rTop={0.16} rBot={0.16} h={0.04} color="#4d423a" />
          <Cyl p={[0.55, 0.12, 0.25]} rTop={0.02} rBot={0.03} h={0.22} color="#3d3630" metal={0.3} />
        </group>
      ))}
      {/* The story beat: a chair knocked over beside the patient */}
      <group position={[0.95, 0.1, 0.75]} rotation={[Math.PI / 2.15, 0, 0.7]}>
        <Cyl p={[0, 0.1, 0]} rTop={0.17} rBot={0.17} h={0.04} color="#4d423a" />
        <Cyl p={[0, -0.08, 0]} rTop={0.02} rBot={0.03} h={0.3} color="#3d3630" metal={0.3} />
        <Box p={[0, 0.28, -0.14]} s={[0.3, 0.34, 0.04]} color="#4d423a" />
      </group>
      {/* Pendant lights */}
      {[-0.6, 0.35].map((x) => (
        <group key={x} position={[x, 0, -0.2]}>
          <Cyl p={[0, 1.98, 0]} rTop={0.005} rBot={0.005} h={0.5} color="#2a2622" />
          <Cyl p={[0, 1.68, 0]} rTop={0.05} rBot={0.14} h={0.14} color="#3d3226" emissive="#f0a95c" emissiveIntensity={0.7} />
          <pointLight position={[0, 1.58, 0]} intensity={0.4} color="#f0a95c" distance={2.8} decay={2} />
        </group>
      ))}
      {/* Menu board */}
      <Box p={[0.3, 1.45, -0.955]} s={[0.9, 0.55, 0.02]} color="#1d1914" emissive="#332a1e" emissiveIntensity={0.4} />
    </group>
  );
}

function Street({ isDark }: { isDark: boolean }) {
  return (
    <group>
      {/* Asphalt + lane markings + curb */}
      <Floor color={isDark ? '#2b2e33' : '#4a4e55'} rough={0.95} />
      {[-1.2, 0.1, 1.4].map((z) => (
        <Box key={z} p={[-1.2, -0.045, z]} s={[0.09, 0.012, 0.65]} color="#d9d9d2" rough={0.9} />
      ))}
      <Box p={[1.7, 0.01, 0.2]} s={[0.5, 0.12, 4.4]} color={isDark ? '#55595f' : '#8b9096'} rough={0.9} />
      <Box p={[2.1, -0.02, 0.2]} s={[0.4, 0.06, 4.4]} color={isDark ? '#3f4348' : '#767b81'} rough={0.95} />
      {/* Distant building row */}
      {[[-1.6, 0.9, 0.6], [-0.4, 1.3, 0.8], [0.9, 0.8, 0.5], [2.0, 1.1, 0.7]].map(([x, h, w], index) => (
        <Box key={index} p={[x, h / 2 + 0.4, -3.1]} s={[w, h, 0.4]} color={isDark ? '#252a31' : '#9aa2ab'} opacity={0.85} />
      ))}
      {/* Streetlight */}
      <group position={[1.9, 0, -1.3]}>
        <Cyl p={[0, 1.15, 0]} rTop={0.025} rBot={0.035} h={2.3} color="#6b7178" metal={0.6} />
        <Box p={[-0.3, 2.28, 0]} s={[0.65, 0.05, 0.08]} color="#6b7178" metal={0.6} />
        <Box p={[-0.58, 2.24, 0]} s={[0.18, 0.04, 0.1]} color="#fff3d6" emissive="#fff3d6" emissiveIntensity={isDark ? 1.2 : 0.4} />
        {isDark && <pointLight position={[-0.58, 2.1, 0]} intensity={0.8} color="#ffe9b8" distance={4.5} decay={2} />}
      </group>
      {/* Traffic cones marking the working area */}
      {[[-1.5, 1.5], [1.2, 1.9]].map(([x, z]) => (
        <group key={`${x}`} position={[x, 0, z]}>
          <Cyl p={[0, 0.16, 0]} rTop={0.015} rBot={0.11} h={0.32} color="#e8641b" rough={0.6} />
          <Box p={[0, -0.02, 0]} s={[0.26, 0.03, 0.26]} color="#d0521a" />
        </group>
      ))}
      <pointLight position={[0, 2.4, 1.4]} intensity={0.45} color="#fff3d6" distance={5} decay={2} />
    </group>
  );
}

function OutdoorHeat({ isDark }: { isDark: boolean }) {
  return (
    <group>
      <Floor color={isDark ? '#6e5a3d' : '#d8b980'} rough={0.98} />
      {/* Low dunes */}
      {[[-1.9, -1.6, 1.4], [1.7, -2.0, 1.8], [0.2, -2.8, 2.4]].map(([x, z, s], index) => (
        <mesh key={index} position={[x, -0.35, z]} scale={[s, 0.42, s]} raycast={noRaycast}>
          <sphereGeometry args={[1, 20, 14]} />
          <meshStandardMaterial color={isDark ? '#7a6544' : '#e3c48c'} roughness={1} />
        </mesh>
      ))}
      {/* A palm off to the side */}
      <group position={[-1.85, 0, -0.9]}>
        <Cyl p={[0, 0.85, 0]} rTop={0.05} rBot={0.09} h={1.7} color="#6e563c" rough={0.95} />
        {[0, 1.2, 2.4, 3.7, 4.9].map((a) => (
          <mesh key={a} position={[Math.cos(a) * 0.35, 1.78, Math.sin(a) * 0.35]} rotation={[Math.sin(a) * 0.5, -a, Math.cos(a) * 0.5 + 0.5]} raycast={noRaycast}>
            <coneGeometry args={[0.09, 0.85, 6]} />
            <meshStandardMaterial color={isDark ? '#3f5c34' : '#5c8a4a'} roughness={0.9} />
          </mesh>
        ))}
      </group>
      {/* Scattered rocks */}
      {[[1.4, 0.9], [-1.1, 1.6], [1.9, -0.6]].map(([x, z], index) => (
        <mesh key={index} position={[x, -0.02, z]} scale={[0.16, 0.1, 0.13]} raycast={noRaycast}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={isDark ? '#8a7a5f' : '#b8a17a'} roughness={0.95} />
        </mesh>
      ))}
      {/* Desert sun */}
      <pointLight position={[1.6, 2.6, 1.2]} intensity={0.75} color="#ffd9a0" distance={6.5} decay={2} />
    </group>
  );
}

function Industrial({ isDark }: { isDark: boolean }) {
  const steel = isDark ? '#4b5157' : '#7d848b';
  return (
    <group>
      <Floor color={isDark ? '#3a3d40' : '#6f7276'} rough={0.9} />
      {/* Corrugated back wall */}
      <Box p={[0, 1.05, -0.98]} s={[3.6, 2.6, 0.05]} color={isDark ? '#33393f' : '#8b9298'} opacity={0.95} />
      {[-1.5, -0.9, -0.3, 0.3, 0.9, 1.5].map((x) => (
        <Box key={x} p={[x, 1.05, -0.95]} s={[0.06, 2.5, 0.02]} color={isDark ? '#282d32' : '#767d84'} />
      ))}
      {/* Scaffold frame, right */}
      <group position={[1.55, 0, -0.2]}>
        {[[-0.35, 0.9], [0.35, 0.9]].map(([x, h], index) => (
          <Cyl key={index} p={[x, h, 0]} rTop={0.03} rBot={0.03} h={1.8} color={steel} metal={0.5} />
        ))}
        {[0.6, 1.25, 1.8].map((y) => (
          <Cyl key={y} p={[0, y, 0]} rTop={0.025} rBot={0.025} h={0.75} r={[0, 0, Math.PI / 2]} color={steel} metal={0.5} />
        ))}
        <Box p={[0, 1.32, 0]} s={[0.8, 0.04, 0.4]} color={isDark ? '#5c503c' : '#a08a5f'} rough={0.9} />
      </group>
      {/* Barrels */}
      <Cyl p={[-1.45, 0.32, -0.45]} rTop={0.2} rBot={0.2} h={0.64} color="#c2571f" rough={0.6} />
      <Cyl p={[-1.05, 0.32, -0.62]} rTop={0.2} rBot={0.2} h={0.64} color="#2f5a8f" rough={0.6} />
      <Cyl p={[-1.28, 0.14, -0.1]} rTop={0.2} rBot={0.2} h={0.64} r={[0, 0, Math.PI / 2]} color={steel} rough={0.6} />
      {/* Hazard barrier near the patient */}
      <group position={[-0.05, 0, 1.55]}>
        <Box p={[0, 0.5, 0]} s={[1.1, 0.16, 0.05]} color="#e8b81b" />
        {[-0.28, 0.06, 0.4].map((x) => (
          <Box key={x} p={[x, 0.5, 0.005]} s={[0.14, 0.16, 0.055]} r={[0, 0, 0]} color="#1d1d1d" />
        ))}
        {[-0.48, 0.48].map((x) => (
          <Cyl key={x} p={[x, 0.25, 0]} rTop={0.02} rBot={0.03} h={0.5} color={steel} metal={0.4} />
        ))}
      </group>
      <pointLight position={[0.6, 2.2, 0.6]} intensity={0.5} color="#e6c17a" distance={4.5} decay={2} />
    </group>
  );
}

/** The original treatment-bay set — now the explicit fallback preset. */
function AmbulanceBay({ isDark }: { isDark: boolean }) {
  const wall = isDark ? '#172231' : '#273847';
  const wallDark = isDark ? '#0a1320' : '#13202d';
  const rail = isDark ? '#94a3b8' : '#8fa1b1';
  const cyan = '#22d3ee';
  return (
    <group>
      <Box p={[0, 0.92, -0.92]} s={[3.15, 2.35, 0.04]} color={wall} rough={0.86} opacity={0.92} />
      <Floor color={isDark ? '#1f2b38' : '#263542'} rough={0.78} />
      <mesh position={[0, 2.12, -0.08]} rotation={[Math.PI / 2, 0, 0]} raycast={noRaycast}>
        <boxGeometry args={[3.2, 3.25, 0.035]} />
        <meshStandardMaterial color={wallDark} roughness={0.72} metalness={0.04} transparent opacity={0.58} />
      </mesh>
      {[-1.42, 1.42].map(x => (
        <group key={`cabinet-${x}`} position={[x, 0.93, -0.35]}>
          <Box p={[0, 0, 0]} s={[0.34, 1.42, 0.26]} color={wallDark} rough={0.62} opacity={0.74} />
          {[0.42, 0.06, -0.30].map(y => (
            <Box key={y} p={[0, y, 0.135]} s={[0.25, 0.18, 0.02]} color={wall} rough={0.42} opacity={0.84} />
          ))}
        </group>
      ))}
      <Box p={[0.82, 1.38, -0.885]} s={[0.42, 0.26, 0.025]} color="#020617" rough={0.45} emissive={cyan} emissiveIntensity={0.18} />
      {[-0.78, 0, 0.78].map(x => (
        <mesh key={`light-${x}`} position={[x, 1.98, -0.32]} rotation={[Math.PI / 2, 0, 0]} raycast={noRaycast}>
          <boxGeometry args={[0.42, 0.07, 0.02]} />
          <meshStandardMaterial color="#dbeafe" roughness={0.22} emissive="#bae6fd" emissiveIntensity={0.55} transparent opacity={0.72} />
        </mesh>
      ))}
      {[[-1.04, 0.95], [1.04, 0.95], [0, 1.82], [0, 0.12]].map(([x, y], index) => (
        <mesh key={`door-frame-${index}`} position={[x, y, -0.86]} raycast={noRaycast}>
          <boxGeometry args={index < 2 ? [0.035, 1.7, 0.035] : [2.08, 0.035, 0.035]} />
          <meshStandardMaterial color={rail} roughness={0.38} metalness={0.32} transparent opacity={0.48} />
        </mesh>
      ))}
      <pointLight position={[0, 1.55, 0.42]} intensity={0.55} color={cyan} distance={3.3} decay={2} />
      <pointLight position={[-0.9, 0.72, 0.75]} intensity={0.18} color="#38bdf8" distance={2.2} decay={2} />
      <pointLight position={[0.9, 0.72, 0.75]} intensity={0.18} color="#22c55e" distance={2.2} decay={2} />
    </group>
  );
}

/** The ambulance stretcher — brought to every scene when the patient is on it. */
function Stretcher({ isDark }: { isDark: boolean }) {
  const bed = isDark ? '#d8e1e8' : '#d9e2e8';
  const rail = isDark ? '#94a3b8' : '#8fa1b1';
  return (
    <group>
      <mesh position={[0, 0.45, 0.02]} rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast}>
        <boxGeometry args={[1.18, 2.38, 0.08]} />
        <meshStandardMaterial color={bed} roughness={0.74} metalness={0.02} transparent opacity={0.62} />
      </mesh>
      <mesh position={[0, 0.45, 0.06]} rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast}>
        <boxGeometry args={[1.0, 2.14, 0.03]} />
        <meshStandardMaterial color={isDark ? '#eff6ff' : '#f8fafc'} roughness={0.9} transparent opacity={0.46} />
      </mesh>
      {[-0.66, 0.66].map(x => (
        <mesh key={`rail-${x}`} position={[x, 0.49, 0.02]} rotation={[Math.PI / 2, 0, 0]} raycast={noRaycast}>
          <cylinderGeometry args={[0.012, 0.012, 2.42, 14]} />
          <meshStandardMaterial color={rail} roughness={0.36} metalness={0.55} transparent opacity={0.46} />
        </mesh>
      ))}
    </group>
  );
}

const PRESET_SETS: Record<ScenePresetId, (props: { isDark: boolean }) => ReactElement> = {
  'home-living': HomeLiving,
  'home-bedroom': HomeBedroom,
  bathroom: Bathroom,
  office: Office,
  restaurant: Restaurant,
  street: Street,
  'outdoor-heat': OutdoorHeat,
  industrial: Industrial,
  'ambulance-bay': AmbulanceBay,
};

export function SceneEnvironment({ preset, showBed }: { preset: ScenePresetId; showBed: boolean }) {
  const isDark = useIsDarkTheme();
  const Set = PRESET_SETS[preset] ?? AmbulanceBay;
  const mood = PRESET_MOOD[preset];
  const accent = useMemo(() => new THREE.Color(mood.accent), [mood.accent]);
  return (
    <group>
      <Set isDark={isDark} />
      {showBed && <Stretcher isDark={isDark} />}
      {/* Preset mood accent over the patient — ties the set's palette onto
          the clinical subject without recolouring the skin channels. */}
      <pointLight position={[0, 1.7, 0.55]} intensity={0.2 + mood.warmth * 0.2} color={accent} distance={3.4} decay={2} />
    </group>
  );
}
