/**
 * Mottling (livedo reticularis) — late-shock skin overlay for the 3D patient.
 *
 * Mottling is the expensive unwellness channel done cheaply: instead of a
 * shader or per-frame work, we composite ONE pre-rendered set of purple-grey
 * blotches onto a COPY of the patient's diffuse atlas and swap `material.map`
 * to it at the moment the patient crosses into severe shock (see BodyMesh).
 * There is no per-frame texture upload — the composite happens once, at the
 * state-crossing event, and is reverted (map swapped back to the clean atlas)
 * once perfusion recovers past the hysteresis band.
 *
 * Distribution — legs/knees first. Rather than guess where the legs live in
 * the UV atlas (every export lays it out differently), we use the mesh itself:
 * each vertex carries both a world position (→ body height) and a UV (→ atlas
 * position). We splat blotches at the atlas coordinates of LOW vertices, so
 * the mottling lands on the legs/lower body no matter how the atlas is packed
 * — the "use the mesh UV islands if identifiable" path, driven by geometry.
 *
 * This mirrors the EyesLayer pattern: the caller stashes the clean open/closed
 * diffuse textures on the body mesh's userData, and this builds mottled twins
 * of both so the blink swap (LifeSigns) keeps working while mottling is on.
 */

import * as THREE from 'three';

export interface MottleTwin {
  /** Mottled copy of the eyes-open diffuse atlas. */
  open: THREE.CanvasTexture;
  /** Mottled copy of the eyes-closed (blink) atlas, when one exists. */
  closed: THREE.CanvasTexture | null;
}

interface Blotch {
  x: number;
  y: number;
  r: number;
  alpha: number;
}

/** Map a normalised body height (0 = feet, 1 = crown) to a mottling weight. */
function legWeight(h: number): number {
  if (h >= 0.55) return 0; // above the hips: no mottling
  const base = (0.55 - h) / 0.55; // 0 at hip line → 1 at the feet
  // Knees mottle first and worst — bump the ~0.18–0.32 height band.
  const kneeBoost = h > 0.18 && h < 0.32 ? 0.4 : 0;
  return Math.min(1, base + kneeBoost);
}

/**
 * Build mottled twin textures from the body mesh's stashed clean atlases.
 *
 * Reads `body.userData.eyesOpenTex` / `eyesClosedTex` (set by paintEyesOnTexture)
 * as the clean source atlases and the mesh's own geometry for the leg-weighted
 * blotch distribution. Returns null (no-op — mottling simply won't show) if the
 * source texture or UVs are unavailable, so a geometry surprise never breaks
 * the exam.
 */
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

    // Measure the body's world height so we can normalise each vertex.
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

    // Collect leg-weighted blotch centres in atlas pixel space. Step through
    // the vertices (a few thousand samples is plenty) and splat with a
    // probability proportional to the vertex's leg weight.
    const blotches: Blotch[] = [];
    const step = Math.max(1, Math.floor(pos.count / 4000));
    for (let i = 0; i < pos.count; i += step) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mw);
      const h = (v.y - minY) / H;
      const w = legWeight(h);
      if (w <= 0) continue;
      // Density: at most ~35% of leg vertices seed a blotch.
      if (Math.random() > w * 0.35) continue;
      const u = uv.getX(i);
      const vv = uv.getY(i);
      const px = u * tw;
      const py = (flipY ? 1 - vv : vv) * th;
      // Knee-height blotches a touch larger; all scale with the atlas.
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
      // Purple-grey livedo. 'multiply' darkens the underlying skin the way real
      // mottling does, rather than pasting flat colour over it.
      ctx.globalCompositeOperation = 'multiply';
      for (const b of blotches) {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        // Desaturated violet core fading to no-op (white = identity under
        // multiply) at the edge, so blotches blend softly into the skin.
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
