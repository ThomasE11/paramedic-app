import * as THREE from 'three';
import type { VitalSigns } from '@/types';

export interface SkinTintInputs {
  vitals?: Partial<VitalSigns> | null;
  initialVitals?: Partial<VitalSigns> | null;
  jaundice?: number;
  scenarioPallor?: number;
  scenarioCyanosis?: number;
}

export interface BaseSkinTintInputs {
  vitals?: Partial<VitalSigns> | null;
  initialVitals?: Partial<VitalSigns> | null;
  jaundice?: number;
  scenarioPallor?: number;
}

export function parseSystolic(bp: unknown): number | null {
  if (typeof bp === 'number' && Number.isFinite(bp)) return bp;
  if (typeof bp !== 'string') return null;
  const m = bp.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  if (m) return parseInt(m[1], 10);
  const single = bp.match(/\d{2,3}/);
  return single ? parseInt(single[0], 10) : null;
}

/**
 * Derives base skin tint (jaundice + pallor ONLY).
 * Cyanosis is handled locally at lips/nailbeds unless scenario overrides apply.
 */
export function deriveBaseSkinTint(inputs: BaseSkinTintInputs): THREE.Color | null {
  const source = inputs.vitals ?? inputs.initialVitals;
  const pulse = typeof source?.pulse === 'number' ? source.pulse : null;
  const systolic = parseSystolic(source?.bp);

  const color = new THREE.Color(0xffffff);
  let touched = false;

  const jaundice = inputs.jaundice ?? 0;
  if (jaundice > 0) {
    color.lerp(new THREE.Color(0xd6bd6a), 0.45 * jaundice);
    touched = true;
  }

  if (pulse !== null && systolic !== null && systolic > 0) {
    const shockIndex = pulse / systolic;
    if (shockIndex > 0.8) {
      const p = Math.min(0.7, 0.3 + (shockIndex - 0.8) * 0.4);
      color.lerp(new THREE.Color(0xc9b6a6), p);
      touched = true;
    }
  }
  const scenarioPallor = inputs.scenarioPallor ?? 0;
  if (scenarioPallor > 0) {
    color.lerp(new THREE.Color(0xc9b6a6), Math.min(0.72, 0.24 + scenarioPallor * 0.42));
    touched = true;
  }

  return touched ? color : null;
}

/**
 * Calculates 0..1 local cyanosis strength from SpO2.
 * SpO2 < 94% -> strength > 0. Clear (0) at SpO2 >= 94%.
 */
export function deriveCyanosisLocalStrength(
  vitals?: Partial<VitalSigns> | null,
  initialVitals?: Partial<VitalSigns> | null,
  scenarioCyanosis: number = 0,
): number {
  const source = vitals ?? initialVitals;
  const spo2 = typeof source?.spo2 === 'number' ? source.spo2 : null;
  let strength = 0;
  if (spo2 !== null && spo2 < 94) {
    strength = spo2 >= 90 ? 0.45 : spo2 >= 85 ? 0.7 : 0.9;
  }
  if (scenarioCyanosis > 0) {
    strength = Math.max(strength, Math.min(0.82, 0.26 + scenarioCyanosis * 0.5));
  }
  return strength;
}

/**
 * Derives the target THREE.Color for live skin perfusion tinting.
 * Order: base (white) -> jaundice -> pallor -> cyanosis.
 * Returns null when SpO2 >= 94 and no other indicators (jaundice, shock) exist.
 */
export function deriveSkinTint(inputs: SkinTintInputs): THREE.Color | null {
  const source = inputs.vitals ?? inputs.initialVitals;
  const spo2 = typeof source?.spo2 === 'number' ? source.spo2 : null;
  const pulse = typeof source?.pulse === 'number' ? source.pulse : null;
  const systolic = parseSystolic(source?.bp);

  const color = new THREE.Color(0xffffff);
  let touched = false;

  // 1. Jaundice
  const jaundice = inputs.jaundice ?? 0;
  if (jaundice > 0) {
    color.lerp(new THREE.Color(0xd6bd6a), 0.45 * jaundice);
    touched = true;
  }

  // 2. Pallor
  if (pulse !== null && systolic !== null && systolic > 0) {
    const shockIndex = pulse / systolic;
    if (shockIndex > 0.8) {
      const p = Math.min(0.7, 0.3 + (shockIndex - 0.8) * 0.4);
      color.lerp(new THREE.Color(0xc9b6a6), p);
      touched = true;
    }
  }
  const scenarioPallor = inputs.scenarioPallor ?? 0;
  if (scenarioPallor > 0) {
    color.lerp(new THREE.Color(0xc9b6a6), Math.min(0.72, 0.24 + scenarioPallor * 0.42));
    touched = true;
  }

  // 3. Cyanosis — threshold is SpO2 < 94% (clear at 94%)
  if (spo2 !== null && spo2 < 94) {
    const cyan =
      spo2 >= 90 ? new THREE.Color(0xa8b8c8) // faint
      : spo2 >= 85 ? new THREE.Color(0x7d9bb5) // noticeable
      : new THREE.Color(0x5b7a99);            // strong
    const strength = spo2 >= 90 ? 0.45 : spo2 >= 85 ? 0.7 : 0.9;
    color.lerp(cyan, strength);
    touched = true;
  }
  const scenarioCyanosis = inputs.scenarioCyanosis ?? 0;
  if (scenarioCyanosis > 0) {
    color.lerp(new THREE.Color(0x7d9bb5), Math.min(0.82, 0.26 + scenarioCyanosis * 0.5));
    touched = true;
  }

  return touched ? color : null;
}
