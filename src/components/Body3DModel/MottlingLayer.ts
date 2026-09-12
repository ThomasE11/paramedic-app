/**
 * Mottling (livedo reticularis) & Local Cyanosis overlays for the 3D patient.
 */

import * as THREE from 'three';
import {
  collectContinuousLipUvTriangles,
} from './lipCyanosisMask';

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

export type CyanosisSite = 'lip' | 'nail';

/**
 * Perceptual tuning for the two clinically useful cyanosis sites.
 *
 * A linear, low-alpha wash was technically present in the atlas but disappeared
 * under the warm skin texture and scene lighting. The eased curve makes moderate
 * hypoxia readable at examination distance while still fading continuously to
 * zero as oxygenation recovers. Nail marks remain a little smaller and lighter
 * so the distal pads do not look bruised.
 */
export function getCyanosisBlotchAppearance(site: CyanosisSite, strength: number) {
  const scaled = Math.min(1, Math.max(0, strength));
  const eased = Math.pow(scaled, 0.72);
  const alphaCap = site === 'lip' ? 0.58 : 0.56;
  return {
    radiusScale: site === 'lip' ? 0.0042 : 0.0024,
    alpha: alphaCap * eased,
  };
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
  // Measured against the rendered patient-male.glb rather than the face's
  // overall Y band: 1.535–1.555 projects onto the vermilion border. The old
  // 1.56–1.59 range sits across the philtrum, nostrils and upper cheeks, which
  // made any clinically legible tint look like facial bruising.
  return y >= 1.535 && y <= 1.555 && Math.abs(x) < 0.055 && z >= 0.12;
}

export function isCyanoticNailVertex(x: number, y: number, z: number): boolean {
  // Distal finger tips / nailbeds on patient-male.glb (geometry-local).
  // All five digits: pinky at |x|≈0.55, index/middle nearer |x|≈0.50,
  // forward tips at z≈0.34–0.37. buildCyanosisLocalTwin further gates by
  // nail-plate UV+normal (isCyanoticNailPlateSample) and UV-cell dedupe so
  // fingertip pads / mid-phalanx stay clear.
  // Legacy groin band (|x|≤0.22, y≤0.85) never reached the hand atlas.
  const lateralTip = Math.abs(x) >= 0.53 && y >= 0.915 && y <= 0.96 && z >= 0.30;
  const forwardTip = Math.abs(x) >= 0.49 && y >= 0.95 && y <= 0.985 && z >= 0.34;
  return lateralTip || forwardTip;
}

/** Nail-plate UV/normal gate on distal tip verts.
 *  Tip islands share high V for both nail and pad; the actual dorsal plates
 *  occupy the narrow V≥0.975 / normal.z≥0.65 cap. The looser historical gate
 *  reached the distal phalanx and made hypoxia resemble fingertip bruising. */
export function isCyanoticNailPlateSample(uvV: number, normalZ: number): boolean {
  return uvV >= 0.975 && normalZ >= 0.65;
}

/** Local cyanosis (lips + nailbeds). */
export function buildCyanosisLocalTwin(
  body: THREE.Mesh,
  strength = 1,
  sourceOpen?: THREE.CanvasTexture,
  sourceClosed?: THREE.CanvasTexture | null,
  continuousLipMask = false,
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
    const nrm = geom.attributes.normal as THREE.BufferAttribute | undefined;
    if (!pos || !uv) return null;

    const tw = srcImg.width;
    const th = srcImg.height;
    const flipY = openTex.flipY;

    // Geometry-local: presentation rotation lives on the group, not the
    // position attribute, so these gates must stay in the source mesh frame.
    // NAILS: full-resolution scan (no stride). Distal fingertip islands are
    // dense on the atlas; stride sampling thinned them and made gameplay
    // nailbed cyanosis unreadable at exam zoom.
    const v = new THREE.Vector3();
    const blotches: Blotch[] = [];
    const nailKeys = new Set<string>();
    const lipTriangles = continuousLipMask
      ? collectContinuousLipUvTriangles(pos, uv, geom.index)
      : [];
    const step = Math.max(1, Math.floor(pos.count / 4000));
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const inLipStride = i % step === 0;
      if (!inLipStride && !isCyanoticNailVertex(v.x, v.y, v.z)) continue;
      const isLip = isCyanoticLipVertex(v.x, v.y, v.z);
      const isNail = !isLip && isCyanoticNailVertex(v.x, v.y, v.z);
      if (!isLip && !isNail) continue;
      if (isLip && continuousLipMask) continue;
      const u = uv.getX(i);
      const vv = uv.getY(i);
      // Nail-plate only: high-V distal UV + dorsal-facing normal.z.
      // Tip islands put pad-facing flesh at the same V band; without nz the
      // cyan blotch reads as fingertip-pad peripheral bleed.
      if (isNail) {
        const nz = nrm ? nrm.getZ(i) : 1;
        if (!isCyanoticNailPlateSample(vv, nz)) continue;
      }
      const px = u * tw;
      const py = (flipY ? 1 - vv : vv) * th;
      if (isNail) {
        // One blotch per ~10px UV cell — full-res fingertip verts otherwise
        // stack into an opaque milky slab instead of a dusky nail tint.
        const key = `${Math.round(px / 10)}_${Math.round(py / 10)}`;
        if (nailKeys.has(key)) continue;
        nailKeys.add(key);
      }
      // Dense lip UVs need small marks so the vermilion edge remains soft.
      // Nail marks stay inside the dorsal nail-plate island and scale with the
      // live hypoxia channel without flooding the distal finger pad.
      const appearance = getCyanosisBlotchAppearance(isLip ? 'lip' : 'nail', strength);
      const r = Math.max(3, appearance.radiusScale * tw);
      blotches.push({ x: px, y: py, r, alpha: appearance.alpha });
    }
    if (blotches.length === 0 && lipTriangles.length === 0) return null;

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
      if (lipTriangles.length > 0) {
        const appearance = getCyanosisBlotchAppearance('lip', strength);
        const cyan = appearance.alpha > 0.5 ? '72, 84, 116' : '88, 102, 132';
        // source-atop retains the atlas's original transparency. The partial
        // alpha leaves pores and authored lip colour visible beneath the tint.
        ctx.globalCompositeOperation = 'source-atop';
        for (const triangle of lipTriangles) {
          const [a, b, c] = triangle.points.map(([u, vv]) => [
            u * tw,
            (flipY ? 1 - vv : vv) * th,
          ]);
          ctx.fillStyle = `rgba(${cyan}, ${appearance.alpha * triangle.coverage})`;
          ctx.beginPath();
          ctx.moveTo(a[0], a[1]);
          ctx.lineTo(b[0], b[1]);
          ctx.lineTo(c[0], c[1]);
          ctx.closePath();
          ctx.fill();
        }
      }
      // Central cyanosis tints lips/nailbeds toward a dusky blue-grey while
      // preserving skin tone texturing. Multiply crushes the tan lip texels
      // to near-black; source-over desaturates toward clinical cyanosis.
      ctx.globalCompositeOperation = 'source-over';
      for (const b of blotches) {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        const cyan = b.alpha > 0.5 ? 'rgba(72, 84, 116, ' : 'rgba(88, 102, 132, ';
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
