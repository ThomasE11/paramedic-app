/**
 * AmbientAudioLayer — R3F bridge for the procedural villa ambience.
 *
 * Mounts the room tone, AC hum and patient breath emitters from
 * `createAmbientAudio()` into the scene graph, parents the THREE.AudioListener
 * to the active camera (so positional audio tracks the student's viewpoint),
 * and keeps the breath loop in sync with the case's respiratory rate and
 * auscultation findings as vitals evolve.
 *
 * Gating:
 *  - Only mounts for the home/villa variant — clinic/public/roadside keep
 *    their own (existing) soundscape behaviour.
 *  - Respects the global voice-enabled preference the same way narration
 *    does; if the student muted voice, the room stays silent too.
 *  - Tears down fully on unmount (stop + disconnect + listener detach).
 */

import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createAmbientAudio, type AmbientAudioState, type AmbientBreathKind } from '@/lib/ambientAudio';
import type { EnvironmentVariant } from '@/lib/sceneEnvironment';

const VOICE_PREF_KEY = 'paramedic-studio-voice-enabled';

function ambientAudioAllowed(): boolean {
  try {
    const stored = localStorage.getItem(VOICE_PREF_KEY);
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

interface AmbientAudioLayerProps {
  active: boolean;
  variant: EnvironmentVariant;
  breathKind: AmbientBreathKind;
  breathRpm: number;
}

export function AmbientAudioLayer({ active, variant, breathKind, breathRpm }: AmbientAudioLayerProps) {
  const camera = useThree((s) => s.camera);
  const groupRef = useRef<THREE.Group>(null);
  const stateRef = useRef<AmbientAudioState | null>(null);

  useEffect(() => {
    if (!active || variant !== 'home' || !ambientAudioAllowed()) return undefined;
    const state = createAmbientAudio();
    stateRef.current = state;
    camera.add(state.listener);
    const group = groupRef.current;
    if (group) {
      group.add(state.roomTone);
      group.add(state.ac);
      group.add(state.patient);
    }
    state.setPatientBreath(breathKind, breathRpm);
    return () => {
      state.dispose();
      stateRef.current = null;
    };
    // Mount/unmount only on presentation/variant/camera changes. Breath
    // updates flow through the effect below without re-creating buffers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, variant, camera]);

  useEffect(() => {
    stateRef.current?.setPatientBreath(breathKind, breathRpm);
  }, [breathKind, breathRpm]);

  return <group ref={groupRef} />;
}
