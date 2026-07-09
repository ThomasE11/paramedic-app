/**
 * UrticariaLayer — anaphylaxis rash (realism directive scenario 2: "rash /
 * urticaria on face / chest / arms"). Like WoundLayer, wheals are painted ONCE
 * into the patient's stashed diffuse atlas (constant + immediate visual), so
 * the blink swap and the mottling twins inherit them for free. Unlike wounds
 * (one decal per injury) urticaria scatters many wheals across the upper body.
 *
 * Site targeting mirrors WoundLayer/MottlingLayer: never guess the UV layout —
 * classify each vertex's WORLD position into a body region, keep the
 * front-facing upper-body ones, and splat wheals at their atlas UVs. Works on
 * any atlas packing, on the male and the female mesh alike. Deterministic (a
 * fixed seed) so the same rash renders on every reload.
 */

import * as THREE from 'three';
import { classifyBodyPoint } from '@/lib/regionClassifier';
import { drawWheal } from './urticariaSprite';

// Regions urticaria favours (the exposed upper body a paramedic sees first).
const RASH_REGIONS = new Set(['face', 'head', 'neck-cspine', 'chest', 'left-arm', 'right-arm']);
const WHEAL_COUNT = 48;
const SEED = 0x5b8c2a; // fixed → stable rash across reloads

function mulberry32(a: number): () => number {
  return function (): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Paint the urticarial rash onto the body's stashed atlases when `active`.
 * Returns the number of wheals painted (0 = inactive / no atlas / no UVs —
 * never throws; a geometry surprise must never break the exam).
 */
export function applyUrticariaToTextures(body: THREE.Mesh, active: boolean): number {
  if (!active) return 0;
  try {
    const openTex = body.userData?.eyesOpenTex as THREE.CanvasTexture | undefined;
    const closedTex = (body.userData?.eyesClosedTex as THREE.CanvasTexture | null | undefined) ?? null;
    const openCanvas = openTex?.image as HTMLCanvasElement | undefined;
    if (!openTex || !openCanvas?.width) return 0;

    const geom = body.geometry as THREE.BufferGeometry;
    const pos = geom.attributes.position as THREE.BufferAttribute | undefined;
    const uv = geom.attributes.uv as THREE.BufferAttribute | undefined;
    if (!pos || !uv) return 0;

    const tw = openCanvas.width;
    const th = openCanvas.height;
    const flipY = openTex.flipY;

    body.updateWorldMatrix(true, false);
    const mw = body.matrixWorld;
    const v = new THREE.Vector3();

    // Collect front-facing upper-body candidate UVs.
    const candidates: Array<[number, number]> = [];
    for (let i = 0; i < pos.count; i += 2) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mw);
      if (v.z < 0.02) continue; // camera-facing skin only
      const hit = classifyBodyPoint(v.x, v.y, v.z);
      if (!RASH_REGIONS.has(hit.region)) continue;
      candidates.push([uv.getX(i), uv.getY(i)]);
    }
    if (candidates.length === 0) return 0;

    // Deterministic scatter: sort for stability, then pick WHEAL_COUNT spots
    // via the seeded PRNG. Wheals are small (skin-scale) and vary a little.
    candidates.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const rnd = mulberry32(SEED);
    const targets: Array<{ px: number; py: number; r: number; seed: number }> = [];
    for (let n = 0; n < WHEAL_COUNT; n++) {
      const pick = candidates[Math.floor(rnd() * candidates.length)];
      const r = (0.008 + rnd() * 0.012) * tw; // ~0.8–2% of atlas width
      targets.push({
        px: pick[0] * tw,
        py: (flipY ? 1 - pick[1] : pick[1]) * th,
        r,
        seed: (SEED ^ (n * 2654435761)) >>> 0,
      });
    }

    const paintInto = (tex: THREE.CanvasTexture | null) => {
      const canvas = tex?.image as HTMLCanvasElement | undefined;
      const ctx = canvas?.getContext('2d');
      if (!tex || !ctx) return;
      for (const t of targets) drawWheal(ctx, t.px, t.py, t.r, t.seed);
      tex.needsUpdate = true;
    };
    paintInto(openTex);
    paintInto(closedTex);
    // Dev-only: record what was painted so capture probes can verify the rash
    // landed on the real mesh (the runtime atlas can't be diffed cheaply).
    if (import.meta.env.DEV) body.userData.urticariaWhealCount = targets.length;
    return targets.length;
  } catch {
    return 0; // rash is polish — never let it break the patient
  }
}
