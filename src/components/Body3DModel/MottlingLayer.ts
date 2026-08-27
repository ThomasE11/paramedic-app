/**
 * Mottling (livedo reticularis) & Local Cyanosis overlays for the 3D patient.
 */

import * as THREE from 'three';

export interface MottleTwin {
  /** Mottled copy of the eyes-open diffuse atlas. */
  open: THREE.CanvasTexture;
  /** Mottled copy of the eyes-closed (blink) atlas, when one exists. */
  closed: THREE.CanvasTexture | null;
}

export interface CyanosisLocalTwin {
  open: THREE.CanvasTexture;
  closed: THREE.CanvasTexture | null;
}

interface Blotch {
  x: number;
  y: number;
  r: number;
  alpha: number;
}

function legWeight(h: number): number {
  if (h >= 0.55) return 0;
  const base = (0.55 - h) / 0.55;
  const kneeBoost = h > 0.18 && h < 0.32 ? 0.4 : 0;
  return Math.min(1, base + kneeBoost);
}

export function buildMottledTextures(body: THREE.Mesh): MottleTwin | null {
  try {
    const openTex = body.userData?.eyesOpenTex as THREE.CanvasTexture | undefined;
    const closedTex = (body.userData?.eyesClosedTex as THREE.CanvasTexture | null | undefined) ?? null;
    const srcImg = openTex?.image as HTMLCanvasElement | undefined;
    if (!openTex || !srcImg?.width || !srcImg?.height) return null;

    const geom = body.geometry as THREE.BufferGeometry;
    const pos = geom.attributes.position as THREE.BufferAttribute | undefined;
    const uv = geom.attributes.uv as THREE.BufferAttribute | undefined;
    if (!pos || !uv) return null;

    const tw = srcImg.width;
    const th = srcImg.height;
    const flipY = openTex.flipY;

    body.updateWorldMatrix(true, false);
    const mw = body.matrixWorld;
    const v = new THREE.Vector3();
    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mw);
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    }
    const H = maxY - minY || 1;

    const blotches: Blotch[] = [];
    const step = Math.max(1, Math.floor(pos.count / 4000));
    for (let i = 0; i < pos.count; i += step) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mw);
      const h = (v.y - minY) / H;
      const w = legWeight(h);
      if (w <= 0) continue;
      if (Math.random() > w * 0.35) continue;
      const u = uv.getX(i);
      const vv = uv.getY(i);
      const px = u * tw;
      const py = (flipY ? 1 - vv : vv) * th;
      const r = (0.010 + Math.random() * 0.022) * tw * (0.8 + w * 0.5);
      const alpha = 0.22 + Math.random() * 0.28 * w;
      blotches.push({ x: px, y: py, r, alpha });
    }
    if (blotches.length === 0) return null;

    const adopt = (t: THREE.CanvasTexture) => {
      t.flipY = openTex.flipY;
      t.colorSpace = openTex.colorSpace;
      t.wrapS = openTex.wrapS;
      t.wrapT = openTex.wrapT;
      t.anisotropy = openTex.anisotropy;
      t.needsUpdate = true;
    };

    const composite = (srcTex: THREE.CanvasTexture): THREE.CanvasTexture | null => {
      const src = srcTex.image as HTMLCanvasElement | undefined;
      if (!src?.width) return null;
      const canvas = document.createElement('canvas');
      canvas.width = tw;
      canvas.height = th;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(src, 0, 0, tw, th);
      ctx.globalCompositeOperation = 'multiply';
      for (const b of blotches) {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, `rgba(96, 74, 104, ${b.alpha})`);
        g.addColorStop(0.6, `rgba(120, 104, 126, ${b.alpha * 0.5})`);
        g.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      const tex = new THREE.CanvasTexture(canvas);
      adopt(tex);
      return tex;
    };

    const open = composite(openTex);
    if (!open) return null;
    const closed = closedTex ? composite(closedTex) : null;
    return { open, closed };
  } catch {
    return null; // mottling is cosmetic — never break the exam
  }
}

/** Vertex test helpers for local cyanosis (lips + nailbeds).
 *  Coordinates are geometry-local (the GLB attribute), not world /
 *  presentation-rotated. Y=0 feet, Y≈1.73 crown, +Z faces camera. */
export function isCyanoticLipVertex(x: number, y: number, z: number): boolean {
  return y >= 1.56 && y <= 1.59 && Math.abs(x) < 0.06 && z >= 0.08;
}

export function isCyanoticNailVertex(x: number, y: number, z: number): boolean {
  return y >= 0.75 && y <= 0.85 && Math.abs(x) >= 0.08 && Math.abs(x) <= 0.22 && z >= 0.08;
}

/** Local cyanosis (lips + nailbeds). */
export function buildCyanosisLocalTwin(
  body: THREE.Mesh,
  strength = 1,
  sourceOpen?: THREE.CanvasTexture,
  sourceClosed?: THREE.CanvasTexture | null,
): CyanosisLocalTwin | null {
  try {
    const openTex = sourceOpen ?? (body.userData?.eyesOpenTex as THREE.CanvasTexture | undefined);
    const closedTex = sourceClosed === undefined
      ? ((body.userData?.eyesClosedTex as THREE.CanvasTexture | null | undefined) ?? null)
      : sourceClosed;
    const srcImg = openTex?.image as HTMLCanvasElement | undefined;
    if (!openTex || !srcImg?.width) return null;

    const geom = body.geometry as THREE.BufferGeometry;
    const pos = geom.attributes.position as THREE.BufferAttribute | undefined;
    const uv = geom.attributes.uv as THREE.BufferAttribute | undefined;
    if (!pos || !uv) return null;

    const tw = srcImg.width;
    const th = srcImg.height;
    const flipY = openTex.flipY;

    // Geometry-local: presentation rotation lives on the group, not the
    // attribute. World/root-inverse puts the mouth at z≈0.02 and the
    // original lip band (z>=0.08) never fires.
    // NAILS: full-resolution scan (no stride). The nailbed bands are tiny
    // (~46 verts on this mesh); stride sampling skipped most of them and the
    // nail blotches landed too sparsely to read at gameplay zoom.
    const v = new THREE.Vector3();
    const blotches: Blotch[] = [];
    const step = Math.max(1, Math.floor(pos.count / 4000));
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const inLipStride = i % step === 0;
      if (!inLipStride && !isCyanoticNailVertex(v.x, v.y, v.z)) continue;
      const isLip = isCyanoticLipVertex(v.x, v.y, v.z);
      const isNail = !isLip && isCyanoticNailVertex(v.x, v.y, v.z);
      if (!isLip && !isNail) continue;
      const u = uv.getX(i);
      const vv = uv.getY(i);
      const px = u * tw;
      const py = (flipY ? 1 - vv : vv) * th;
      // Dense lip UVs need small marks. The previous 1.8%-of-atlas radius
      // caused hundreds of overlapping discs to spread over the moustache and
      // chin area. These tighter marks remain inside the authored lip/nail
      // islands and scale their opacity with the live hypoxia channel.
      const r = Math.max(3, (isLip ? 0.0045 : 0.0035) * tw);
      const scaledStrength = Math.min(1, Math.max(0, strength));
      blotches.push({ x: px, y: py, r, alpha: (isLip ? 0.38 : 0.34) * scaledStrength });
    }
    if (blotches.length === 0) return null;

    const adopt = (t: THREE.CanvasTexture) => {
      t.flipY = openTex.flipY;
      t.colorSpace = openTex.colorSpace;
      t.wrapS = openTex.wrapS;
      t.wrapT = openTex.wrapT;
      t.anisotropy = openTex.anisotropy;
      t.needsUpdate = true;
    };

    const composite = (srcTex: THREE.CanvasTexture): THREE.CanvasTexture | null => {
      const src = srcTex.image as HTMLCanvasElement | undefined;
      if (!src?.width) return null;
      const canvas = document.createElement('canvas');
      canvas.width = tw;
      canvas.height = th;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(src, 0, 0, tw, th);
      // Central cyanosis tints lips/nailbeds toward a dusky blue-grey while
      // preserving skin tone texturing. Multiply crushes the tan lip texels
      // to near-black; source-over desaturates toward clinical cyanosis.
      ctx.globalCompositeOperation = 'source-over';
      for (const b of blotches) {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        const cyan = b.alpha > 0.5 ? 'rgba(96, 111, 128, ' : 'rgba(112, 126, 142, ';
        g.addColorStop(0, `${cyan}${b.alpha})`);
        g.addColorStop(0.6, `${cyan}${b.alpha * 0.5})`);
        g.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      const tex = new THREE.CanvasTexture(canvas);
      adopt(tex);
      return tex;
    };

    const open = composite(openTex);
    if (!open) return null;
    const closed = closedTex ? composite(closedTex) : null;
    return { open, closed };
  } catch {
    return null;
  }
}
