/**
 * SceneKit — the kit the crew carried in, sitting on the floor at the
 * patient's side: response bag, cardiac monitor, O2 cylinder.
 *
 * The crew's presence should be physical, not implied. The monitor screen
 * is dark until a monitoring treatment is applied (pads/ECG/SpO2), then
 * lights with a live waveform hint — the same "action leaves visible
 * evidence" rule the on-patient DeviceLayer follows.
 *
 * All primitive geometry, all raycast-disabled (clicks pass to the patient).
 * Placement contract: outside the stretcher footprint, crew side (+x).
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const noRaycast = () => null;

/** Screen waveform sweep — one thin emissive bar orbiting the screen width,
 *  driven by ref mutation only. Reads as a live monitor from exam distance. */
function MonitorTrace() {
  const barRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const bar = barRef.current;
    if (!bar) return;
    const t = (state.clock.elapsedTime % 1.6) / 1.6;
    bar.position.x = -0.13 + t * 0.26;
    // ECG-ish blip: scale spike near the middle of the sweep
    const blip = Math.exp(-Math.pow((t - 0.5) * 14, 2));
    bar.scale.y = 1 + blip * 2.6;
  });
  return (
    <mesh ref={barRef} position={[0, 0.005, 0.012]} raycast={noRaycast}>
      <boxGeometry args={[0.012, 0.05, 0.004]} />
      <meshStandardMaterial color="#4ade80" emissive="#4ade80" emissiveIntensity={1.6} />
    </mesh>
  );
}

export function SceneKit({ monitorOn }: { monitorOn: boolean }) {
  return (
    <group>
      {/* ---- Response bag — paramedic green, reflective banding ---- */}
      <group position={[1.18, 0, 1.12]} rotation={[0, -0.5, 0]}>
        <mesh position={[0, 0.17, 0]} raycast={noRaycast}>
          <boxGeometry args={[0.52, 0.34, 0.34]} />
          <meshStandardMaterial color="#276b45" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.36, 0]} raycast={noRaycast}>
          <boxGeometry args={[0.5, 0.06, 0.32]} />
          <meshStandardMaterial color="#1d5636" roughness={0.85} />
        </mesh>
        {/* Reflective strip + zip line */}
        <mesh position={[0, 0.2, 0.172]} raycast={noRaycast}>
          <boxGeometry args={[0.52, 0.045, 0.004]} />
          <meshStandardMaterial color="#d8dfe2" roughness={0.3} emissive="#aeb8bc" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0, 0.335, 0.16]} rotation={[0.5, 0, 0]} raycast={noRaycast}>
          <boxGeometry args={[0.5, 0.008, 0.008]} />
          <meshStandardMaterial color="#0f2e1d" roughness={0.4} />
        </mesh>
        {/* Carry handles */}
        {[-0.12, 0.12].map((x) => (
          <mesh key={x} position={[x, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]} raycast={noRaycast}>
            <torusGeometry args={[0.05, 0.011, 8, 20, Math.PI]} />
            <meshStandardMaterial color="#14341f" roughness={0.7} />
          </mesh>
        ))}
        {/* Red trauma pouch leaning on the bag */}
        <mesh position={[0.33, 0.09, 0.1]} rotation={[0, 0.4, -0.12]} raycast={noRaycast}>
          <boxGeometry args={[0.2, 0.17, 0.12]} />
          <meshStandardMaterial color="#a3382e" roughness={0.85} />
        </mesh>
      </group>

      {/* ---- Cardiac monitor — rugged case, screen toward the patient ---- */}
      <group position={[1.32, 0, 0.42]} rotation={[0, -0.95, 0]}>
        <mesh position={[0, 0.16, 0]} raycast={noRaycast}>
          <boxGeometry args={[0.4, 0.32, 0.22]} />
          <meshStandardMaterial color="#c9a72c" roughness={0.6} />
        </mesh>
        {/* Screen face */}
        <mesh position={[0, 0.19, 0.115]} raycast={noRaycast}>
          <boxGeometry args={[0.3, 0.18, 0.01]} />
          <meshStandardMaterial
            color="#060a08"
            roughness={0.3}
            emissive={monitorOn ? '#0d2f1c' : '#000000'}
            emissiveIntensity={monitorOn ? 0.9 : 0}
          />
        </mesh>
        {monitorOn && (
          <group position={[0, 0.19, 0.115]}>
            <MonitorTrace />
            <pointLight position={[0, 0.05, 0.25]} intensity={0.22} color="#4ade80" distance={1.2} decay={2} />
          </group>
        )}
        {/* Handle + knobs + hanging lead */}
        <mesh position={[0, 0.36, 0]} raycast={noRaycast}>
          <boxGeometry args={[0.26, 0.035, 0.05]} />
          <meshStandardMaterial color="#8a731e" roughness={0.55} />
        </mesh>
        {[-0.12, -0.04].map((x) => (
          <mesh key={x} position={[x, 0.05, 0.115]} rotation={[Math.PI / 2, 0, 0]} raycast={noRaycast}>
            <cylinderGeometry args={[0.016, 0.016, 0.012, 12]} />
            <meshStandardMaterial color="#2b2b28" roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0.21, 0.1, 0.02]} rotation={[0, 0, 0.9]} raycast={noRaycast}>
          <cylinderGeometry args={[0.008, 0.008, 0.24, 8]} />
          <meshStandardMaterial color="#23272b" roughness={0.7} />
        </mesh>
      </group>

      {/* ---- O2 cylinder in its carry sleeve, lying down ---- */}
      <group position={[0.98, 0, 1.55]} rotation={[0, 0.35, 0]}>
        <mesh position={[0, 0.085, 0]} rotation={[0, 0, Math.PI / 2]} raycast={noRaycast}>
          <cylinderGeometry args={[0.075, 0.075, 0.56, 18]} />
          <meshStandardMaterial color="#e8ecef" roughness={0.35} metalness={0.25} />
        </mesh>
        {/* Shoulder + valve */}
        <mesh position={[0.31, 0.085, 0]} rotation={[0, 0, Math.PI / 2]} raycast={noRaycast}>
          <cylinderGeometry args={[0.045, 0.07, 0.07, 18]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0.37, 0.085, 0]} rotation={[0, 0, Math.PI / 2]} raycast={noRaycast}>
          <cylinderGeometry args={[0.02, 0.02, 0.06, 10]} />
          <meshStandardMaterial color="#9aa3a8" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Green O2 band */}
        <mesh position={[-0.12, 0.085, 0]} rotation={[0, 0, Math.PI / 2]} raycast={noRaycast}>
          <cylinderGeometry args={[0.077, 0.077, 0.09, 18]} />
          <meshStandardMaterial color="#1f8a4c" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
