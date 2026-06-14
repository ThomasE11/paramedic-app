/**
 * Eyes for the patient model — painted into the skin texture.
 *
 * The patient GLBs ship with NO eye mesh: the eye sockets are painted bright
 * red in the single skin texture (a MakeHuman placeholder), which read as
 * alarming red eyes. Earlier attempts to cover them with floating 3D eyeballs
 * fought the mesh proportions and the two models' incompatible UV layouts —
 * the eyeballs kept landing on the forehead or the neck.
 *
 * The key realisation: the red is ALREADY at the correct eye location (it is
 * the socket, mapped through the model's own UVs). So we just repaint those
 * red texels in-place — sclera white, a brown iris, a black pupil and a
 * catch-light — and the eyes appear exactly where they belong on ANY of the
 * textured patient meshes, with zero geometry guesswork. The pupil radius is
 * scaled from the case's pupil diameter so anisocoria / blown pupils show.
 *
 * Returns true if it repainted (so the caller knows the eyes are handled).
 */

import * as THREE from 'three';

const SCLERA = [232, 228, 216] as const; // warm off-white
const IRIS = '#5d4634';
const PUPIL = '#0b0b0d';

export function paintEyesOnTexture(
  body: THREE.Mesh,
  pupilLeftMm: number,
  pupilRightMm: number,
): boolean {
  const mat = (Array.isArray(body.material) ? body.material[0] : body.material) as
    | THREE.MeshStandardMaterial
    | undefined;
  const tex = mat?.map as THREE.Texture | undefined;
  const img = tex?.image as { width?: number; height?: number } | undefined;
  if (!mat || !tex || !img?.width || !img?.height) return false;

  try {
    const tw = img.width;
    const th = img.height;
    const canvas = document.createElement('canvas');
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;
    ctx.drawImage(img as unknown as CanvasImageSource, 0, 0, tw, th);
    const imgData = ctx.getImageData(0, 0, tw, th);
    const d = imgData.data;

    // Pure-red mask (eyes). Lips/skin are far duller. Recolour to sclera as we
    // go — that part is always safe (it only touches the actual red texels).
    const mask = new Uint8Array(tw * th);
    let redCount = 0;
    for (let y = 0; y < th; y++) {
      for (let x = 0; x < tw; x++) {
        const i = y * tw + x;
        const o = i * 4;
        const R = d[o], G = d[o + 1], B = d[o + 2];
        if (R > 165 && G < 90 && B < 90 && R - G > 95 && R - B > 95) {
          mask[i] = 1;
          redCount++;
          d[o] = SCLERA[0]; d[o + 1] = SCLERA[1]; d[o + 2] = SCLERA[2];
        }
      }
    }
    if (redCount < 30) return false; // no recognisable red eyes — leave as-is
    ctx.putImageData(imgData, 0, 0);

    // Connected-component labelling so the IRIS/PUPIL discs only land on genuine
    // eye-sized blobs — the red can appear elsewhere in the atlas (and a naive
    // mean-x split then paints a giant disc across the body). 4-connectivity,
    // iterative stack (no recursion blowups on a 2048² atlas).
    type Blob = { cx: number; cy: number; w: number; h: number; n: number };
    const blobs: Blob[] = [];
    const stack: number[] = [];
    const maxEye = Math.max(8, Math.round(tw * 0.06)); // an eye is small in-atlas
    for (let start = 0; start < mask.length; start++) {
      if (mask[start] !== 1) continue;
      let n = 0, sumX = 0, sumY = 0, minX = tw, maxX = 0, minY = th, maxY = 0;
      mask[start] = 2;
      stack.push(start);
      while (stack.length) {
        const p = stack.pop()!;
        const px = p % tw, py = (p / tw) | 0;
        n++; sumX += px; sumY += py;
        if (px < minX) minX = px; if (px > maxX) maxX = px;
        if (py < minY) minY = py; if (py > maxY) maxY = py;
        if (px > 0 && mask[p - 1] === 1) { mask[p - 1] = 2; stack.push(p - 1); }
        if (px < tw - 1 && mask[p + 1] === 1) { mask[p + 1] = 2; stack.push(p + 1); }
        if (py > 0 && mask[p - tw] === 1) { mask[p - tw] = 2; stack.push(p - tw); }
        if (py < th - 1 && mask[p + tw] === 1) { mask[p + tw] = 2; stack.push(p + tw); }
      }
      const bw = maxX - minX + 1, bh = maxY - minY + 1;
      // Eye-like: enough pixels, compact, roughly round.
      if (n >= 20 && bw <= maxEye && bh <= maxEye && bw <= bh * 3 && bh <= bw * 3) {
        blobs.push({ cx: sumX / n, cy: sumY / n, w: bw, h: bh, n });
      }
    }
    // Keep the two largest eye blobs.
    blobs.sort((a, b) => b.n - a.n);
    const eyes = blobs.slice(0, 2);
    eyes.sort((a, b) => a.cx - b.cx); // left atlas-x → index 0
    eyes.forEach((e, idx) => {
      // Use the smaller half-extent so a tall/wide socket still gives a round
      // iris that fills it (covering the red), leaving just a thin sclera rim.
      const rEye = Math.min(e.w, e.h) / 2;
      const irisR = Math.max(2, rEye * 1.05);
      const pupilMm = idx === 0 ? pupilLeftMm : pupilRightMm;
      const pupilR = Math.max(irisR * 0.32, Math.min(irisR * 0.9, irisR * (pupilMm / 5)));
      ctx.fillStyle = IRIS;
      ctx.beginPath(); ctx.arc(e.cx, e.cy, irisR, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = PUPIL;
      ctx.beginPath(); ctx.arc(e.cx, e.cy, pupilR, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath(); ctx.arc(e.cx - irisR * 0.28, e.cy - irisR * 0.28, Math.max(1, irisR * 0.14), 0, Math.PI * 2); ctx.fill();
    });

    const newTex = new THREE.CanvasTexture(canvas);
    newTex.flipY = tex.flipY;
    newTex.colorSpace = tex.colorSpace;
    newTex.wrapS = tex.wrapS;
    newTex.wrapT = tex.wrapT;
    newTex.anisotropy = tex.anisotropy;
    newTex.needsUpdate = true;
    mat.map = newTex;
    mat.needsUpdate = true;
    return true;
  } catch {
    return false; // texture not readable — fall back to the model as shipped
  }
}
