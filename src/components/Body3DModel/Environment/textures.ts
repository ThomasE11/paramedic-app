/**
 * Procedural PBR-ish textures for the treatment bay — pure CanvasTexture,
 * no image files. Each surface gets a color map + a normal map derived from
 * a grayscale height canvas (central differences with wrap-around sampling,
 * so the normals tile as seamlessly as the color).
 *
 * Generated once per session via a module-level cache — the bay is the only
 * consumer and lives for the whole app, so nothing is disposed.
 * All randomness is seeded so reloads look identical.
 */
import * as THREE from 'three';

export interface SurfaceMaps {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
}

// Tiny deterministic PRNG (mulberry32) — same texture every load.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(size: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D | null } {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  return { canvas, ctx: canvas.getContext('2d') };
}

function toTexture(canvas: HTMLCanvasElement, repeatX: number, repeatY: number, srgb: boolean): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Height (grayscale) canvas → tangent-space normal map. Samples wrap so the
 *  resulting normals tile. strength ≈ how many pixels of slope one full
 *  black→white step represents. */
function heightToNormal(height: HTMLCanvasElement, strength: number): HTMLCanvasElement {
  const size = height.width;
  const out = makeCanvas(size);
  const srcCtx = height.getContext('2d');
  if (!srcCtx || !out.ctx) return out.canvas; // jsdom: blank canvas is fine
  const src = srcCtx.getImageData(0, 0, size, size).data;
  const dst = out.ctx.createImageData(size, size);
  const h = (x: number, y: number) => src[(((y + size) % size) * size + ((x + size) % size)) * 4] / 255;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (h(x - 1, y) - h(x + 1, y)) * strength;
      const dy = (h(x, y - 1) - h(x, y + 1)) * strength;
      const len = Math.sqrt(dx * dx + dy * dy + 1);
      const i = (y * size + x) * 4;
      dst.data[i] = ((dx / len) * 0.5 + 0.5) * 255;
      dst.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      dst.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      dst.data[i + 3] = 255;
    }
  }
  out.ctx.putImageData(dst, 0, 0);
  return out.canvas;
}

/** Per-pixel value noise sprinkled over the whole canvas (tiles trivially). */
function speckle(ctx: CanvasRenderingContext2D, size: number, count: number, rand: () => number, alpha: number) {
  for (let i = 0; i < count; i++) {
    const v = rand() * 255;
    ctx.fillStyle = `rgba(${v},${v},${v},${alpha})`;
    ctx.fillRect(Math.floor(rand() * size), Math.floor(rand() * size), 1, 1);
  }
}

// ---------------------------------------------------------------------------
// Floor — hospital linoleum. 2x2 tiles per texture, grout recess, speckle
// flecks, a few scuff arcs kept away from the edges so tiling stays clean.
// ---------------------------------------------------------------------------
function makeFloor(): SurfaceMaps {
  const size = 512;
  const tile = size / 2;
  const rand = rng(101);
  const { canvas, ctx } = makeCanvas(size);
  const height = makeCanvas(size);

  if (ctx && height.ctx) {
    ctx.fillStyle = '#242f3a';
    ctx.fillRect(0, 0, size, size);
    height.ctx.fillStyle = '#808080';
    height.ctx.fillRect(0, 0, size, size);

    // Slight per-tile tint variation.
    for (let ty = 0; ty < 2; ty++) {
      for (let tx = 0; tx < 2; tx++) {
        const d = (rand() - 0.5) * 14;
        ctx.fillStyle = `rgba(${60 + d},${75 + d},${90 + d},0.35)`;
        ctx.fillRect(tx * tile, ty * tile, tile, tile);
      }
    }

    // Linoleum flecks.
    speckle(ctx, size, 9000, rand, 0.06);

    // Scuff arcs — low alpha, inset from edges so the texture still tiles.
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 14; i++) {
      const x = 60 + rand() * (size - 120);
      const y = 60 + rand() * (size - 120);
      ctx.strokeStyle = `rgba(${rand() > 0.5 ? '15,20,26' : '110,125,140'},0.10)`;
      ctx.beginPath();
      ctx.arc(x, y, 15 + rand() * 40, rand() * Math.PI * 2, rand() * Math.PI);
      ctx.stroke();
    }

    // Grout lines — darker in color, recessed in height. Drawn on all four
    // tile boundaries (0 and size/2), which coincide under wrap.
    for (const p of [0, tile]) {
      ctx.fillStyle = 'rgba(10,14,19,0.55)';
      ctx.fillRect(p - 1, 0, 3, size);
      ctx.fillRect(0, p - 1, size, 3);
      height.ctx.fillStyle = '#565656';
      height.ctx.fillRect(p - 1, 0, 3, size);
      height.ctx.fillRect(0, p - 1, size, 3);
    }
    speckle(height.ctx, size, 6000, rand, 0.05);
  }

  return {
    map: toTexture(canvas, 6, 6, true),
    normalMap: toTexture(heightToNormal(height.canvas, 2.2), 6, 6, false),
  };
}

// ---------------------------------------------------------------------------
// Wall — clinical painted wall: soft low-frequency blotches, fine roller
// grain. The skirting is real geometry in index.tsx, so the texture stays
// fully tileable (no painted skirting line).
// ---------------------------------------------------------------------------
function makeWall(base: string, seed: number): SurfaceMaps {
  const size = 512;
  const rand = rng(seed);
  const { canvas, ctx } = makeCanvas(size);
  const height = makeCanvas(size);

  if (ctx && height.ctx) {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);
    height.ctx.fillStyle = '#808080';
    height.ctx.fillRect(0, 0, size, size);

    // Low-frequency blotches — subtle unevenness in the paint. Inset so
    // gradients never cross the wrap seam.
    for (let i = 0; i < 24; i++) {
      const x = 90 + rand() * (size - 180);
      const y = 90 + rand() * (size - 180);
      const r = 40 + rand() * 70;
      const light = rand() > 0.5;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, light ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.05)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    // Vertical roller streaks.
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(rand() * size);
      ctx.fillStyle = `rgba(${rand() > 0.5 ? '255,255,255' : '0,0,0'},0.02)`;
      ctx.fillRect(x, 0, 1 + Math.floor(rand() * 3), size);
    }

    speckle(ctx, size, 5000, rand, 0.03);
    speckle(height.ctx, size, 5000, rand, 0.06);
  }

  return {
    map: toTexture(canvas, 2, 1, true),
    normalMap: toTexture(heightToNormal(height.canvas, 1.6), 2, 1, false),
  };
}

// ---------------------------------------------------------------------------
// Ceiling — 2x2 acoustic tile grid with recessed seams and pinhole texture.
// The light panels are already separate emissive meshes in index.tsx.
// ---------------------------------------------------------------------------
function makeCeiling(): SurfaceMaps {
  const size = 512;
  const tile = size / 2;
  const rand = rng(303);
  const { canvas, ctx } = makeCanvas(size);
  const height = makeCanvas(size);

  if (ctx && height.ctx) {
    ctx.fillStyle = '#131b25';
    ctx.fillRect(0, 0, size, size);
    height.ctx.fillStyle = '#808080';
    height.ctx.fillRect(0, 0, size, size);

    // Acoustic-tile pinholes.
    for (let i = 0; i < 2600; i++) {
      const x = Math.floor(rand() * size);
      const y = Math.floor(rand() * size);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(x, y, 1, 1);
      height.ctx.fillStyle = 'rgba(70,70,70,0.5)';
      height.ctx.fillRect(x, y, 1, 1);
    }

    // T-bar grid — brighter rail, recessed seam.
    for (const p of [0, tile]) {
      ctx.fillStyle = 'rgba(150,165,180,0.28)';
      ctx.fillRect(p - 2, 0, 5, size);
      ctx.fillRect(0, p - 2, size, 5);
      height.ctx.fillStyle = '#4a4a4a';
      height.ctx.fillRect(p - 2, 0, 5, size);
      height.ctx.fillRect(0, p - 2, size, 5);
    }
  }

  return {
    map: toTexture(canvas, 3, 2, true),
    normalMap: toTexture(heightToNormal(height.canvas, 2.0), 3, 2, false),
  };
}

// ---------------------------------------------------------------------------
// Metal — brushed stainless. Drawn near-white so each mesh tints it with its
// existing material color (steel vs darker metal both reuse this one map).
// ---------------------------------------------------------------------------
function makeMetal(): SurfaceMaps {
  const size = 256;
  const rand = rng(404);
  const { canvas, ctx } = makeCanvas(size);
  const height = makeCanvas(size);

  if (ctx && height.ctx) {
    ctx.fillStyle = '#d8dde2';
    ctx.fillRect(0, 0, size, size);
    height.ctx.fillStyle = '#808080';
    height.ctx.fillRect(0, 0, size, size);

    // Horizontal brush streaks — full-width so they tile in X by definition.
    for (let i = 0; i < 900; i++) {
      const y = Math.floor(rand() * size);
      const v = 190 + Math.floor(rand() * 65);
      ctx.fillStyle = `rgba(${v},${v + 3},${v + 6},0.16)`;
      ctx.fillRect(0, y, size, 1);
      const hv = 118 + Math.floor(rand() * 20);
      height.ctx.fillStyle = `rgba(${hv},${hv},${hv},0.35)`;
      height.ctx.fillRect(0, y, size, 1);
    }
    speckle(ctx, size, 800, rand, 0.05);
  }

  return {
    map: toTexture(canvas, 1, 1, true),
    normalMap: toTexture(heightToNormal(height.canvas, 1.2), 1, 1, false),
  };
}

// ---------------------------------------------------------------------------
// Fabric — mattress cover: fine cross-weave plus soft wrinkle blotches.
// ---------------------------------------------------------------------------
function makeFabric(): SurfaceMaps {
  const size = 256;
  const rand = rng(505);
  const { canvas, ctx } = makeCanvas(size);
  const height = makeCanvas(size);

  if (ctx && height.ctx) {
    ctx.fillStyle = '#d9e2e8';
    ctx.fillRect(0, 0, size, size);
    height.ctx.fillStyle = '#808080';
    height.ctx.fillRect(0, 0, size, size);

    // Weave: alternating 2px warp/weft lines (period divides size → tiles).
    for (let p = 0; p < size; p += 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.045)';
      ctx.fillRect(p, 0, 2, size);
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(0, p, size, 2);
      height.ctx.fillStyle = 'rgba(96,96,96,0.5)';
      height.ctx.fillRect(p, 0, 1, size);
      height.ctx.fillStyle = 'rgba(160,160,160,0.5)';
      height.ctx.fillRect(0, p, size, 1);
    }

    // Soft wrinkle shading, inset from edges.
    for (let i = 0; i < 10; i++) {
      const x = 50 + rand() * (size - 100);
      const y = 50 + rand() * (size - 100);
      const r = 25 + rand() * 45;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rand() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(70,90,105,0.07)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    speckle(ctx, size, 2500, rand, 0.03);
  }

  return {
    map: toTexture(canvas, 2, 4, true),
    normalMap: toTexture(heightToNormal(height.canvas, 1.4), 2, 4, false),
  };
}

// ---------------------------------------------------------------------------
// Public: one lazily-built set for the whole bay.
// ponytail: module-level singleton, never disposed — the bay lives for the
// whole session. Revisit only if the environment becomes hot-swappable.
// ---------------------------------------------------------------------------
export interface BayTextures {
  floor: SurfaceMaps;
  wall: SurfaceMaps;
  wallBack: SurfaceMaps;
  ceiling: SurfaceMaps;
  metal: SurfaceMaps;
  fabric: SurfaceMaps;
}

let cache: BayTextures | null = null;

export function getBayTextures(): BayTextures {
  if (!cache) {
    cache = {
      floor: makeFloor(),
      wall: makeWall('#2e3d4b', 201),
      wallBack: makeWall('#1c2733', 202),
      ceiling: makeCeiling(),
      metal: makeMetal(),
      fabric: makeFabric(),
    };
  }
  return cache;
}
