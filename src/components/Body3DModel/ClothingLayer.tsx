/**
 * "Dressed" view — scrubs derived from the patient's own body mesh.
 *
 * v1 draped primitive shapes (lathe + cylinders) over the body; it read as
 * cardboard boxes, not clothing. v2 instead cuts the garment out of the
 * patient's actual skin geometry and inflates it along the vertex normals:
 * the shoulders slope, the chest curves, the hips flare and the legs taper
 * exactly like the body they cover, so it reads as fabric worn by THIS
 * patient — and it works unchanged on any normalised GLB we load.
 *
 * The patient GLBs are a single baked mesh with NO skeleton (the exam's bone
 * hit-test falls back to Y-ranges on them too), so vertices are classified
 * geometrically + topologically:
 *
 *   1. Cut heights (hem, waistband, sleeve, neckline, cuff) are FRACTIONS of
 *      the measured body height — no per-model tuning.
 *   2. Within each garment Y-slab, keep only the LARGEST connected component
 *      of the triangle graph. The hands hanging beside the thighs and the
 *      forearms crossing the torso slab connect to the body only through the
 *      arm OUTSIDE the slab, so inside it they are small islands — dropped.
 *      That is what keeps wrists, hands and ankles bare without any rig.
 *   3. Keep only triangles whose three corners survive — the dropped mixed
 *      triangles ARE the hem and neckline cut lines.
 *   4. Inflate along the normals (the top sits a touch prouder than the
 *      trousers so the waistband layers under the shirt like real scrubs),
 *      then a few passes of Laplacian smoothing (interior verts only) soften
 *      body detail into a draped-fabric read; boundary verts are pinned so
 *      the hems stay crisp.
 *
 * Assessment safety: every garment mesh has raycasting disabled (clicks fall
 * straight through to the skin), carries no morph targets, and has fewer
 * vertices than the body so the surface sampler and morph driver still bind
 * to the skin mesh. Pieces part per focused region via CLOTHING_PARTING, and
 * the whole layer renders only in the Dressed view.
 */

import * as THREE from 'three';

const TOP_COLOR = '#41908b';
const TROUSER_COLOR = '#33706c';

/** Region id → garment pieces that part (hide) while that region is focused. */
export const CLOTHING_PARTING: Record<string, string[]> = {
  chest: ['scrub-top'],
  abdomen: ['scrub-top'],
  'posterior-logroll': ['scrub-top'],
  'left-arm': ['scrub-top'],
  'right-arm': ['scrub-top'],
  pelvis: ['scrub-trousers'],
  'left-leg': ['scrub-trousers'],
  'right-leg': ['scrub-trousers'],
};

export function buildScrubs(body: THREE.Mesh): THREE.Group | null {
  const geom = body.geometry as THREE.BufferGeometry | undefined;
  const pos = geom?.attributes?.position as THREE.BufferAttribute | undefined;
  if (!geom || !pos) {
    console.warn('[ClothingLayer] dressed view unavailable: body mesh has no geometry');
    return null;
  }

  body.updateWorldMatrix(true, false);
  const mw = body.matrixWorld;
  const scl = new THREE.Vector3();
  mw.decompose(new THREE.Vector3(), new THREE.Quaternion(), scl);
  const worldScale = (Math.abs(scl.x) + Math.abs(scl.y) + Math.abs(scl.z)) / 3 || 1;

  // World x/y per vertex + measured body bounds so the cut heights adapt to
  // whatever frame this GLB actually renders in.
  const N = pos.count;
  const wx = new Float32Array(N);
  const wy = new Float32Array(N);
  const wz = new Float32Array(N);
  const v = new THREE.Vector3();
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < N; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(mw);
    wx[i] = v.x;
    wy[i] = v.y;
    wz[i] = v.z;
    if (v.y < minY) minY = v.y;
    if (v.y > maxY) maxY = v.y;
  }
  const H = maxY - minY;
  if (!Number.isFinite(H) || H <= 0) return null;
  const yf = (fraction: number) => minY + fraction * H;

  // Anthropometric cut lines as fractions of head-to-heel height
  // (hip-hem, waistband, mid-biceps, neck scoop, shoulder cap, ankle cuff).
  const TOP_HEM = yf(0.522);
  const WAISTBAND = yf(0.539);
  const SLEEVE_HEM = yf(0.644);
  const SCOOP_Y = yf(0.806);
  const TOP_CAP = yf(0.844);
  const CUFF = yf(0.1);
  const SCOOP_HALF_W = 0.085 * (H / 1.8);
  // Sleeves are bounded LATERALLY, not by height — this model holds its arms
  // in a wide A-pose, so a horizontal cut would slice the diagonal arm
  // lengthwise (ragged half-sleeve to the wrist). |x| beyond this = bare arm.
  const SLEEVE_MAX_X = 0.31 * (H / 1.8);

  // Shared triangle accessors.
  const index = geom.index;
  const triCount = (index ? index.count : N) / 3;
  const idxAt = (t: number, k: number) => (index ? index.getX(t * 3 + k) : t * 3 + k);

  // The exporter splits vertices along UV seams (Draco keeps the splits), so
  // raw triangle connectivity fragments the surface into UV islands — the
  // front of each trouser leg is its own island and would be dropped by the
  // largest-component rule. Weld coincident positions first so "connected"
  // means physically connected skin.
  const weldRoot = new Int32Array(N);
  {
    const byPos = new Map<string, number>();
    for (let i = 0; i < N; i++) {
      const key =
        Math.round(wx[i] * 5000) + ':' + Math.round(wy[i] * 5000) + ':' + Math.round(wz[i] * 5000);
      const first = byPos.get(key);
      if (first === undefined) {
        byPos.set(key, i);
        weldRoot[i] = i;
      } else {
        weldRoot[i] = first;
      }
    }
  }

  // Largest connected component of the triangle graph restricted to `mask`.
  // Union-find with path compression; returns the surviving vertex mask.
  const largestComponent = (mask: Uint8Array): Uint8Array => {
    const parent = new Int32Array(N);
    for (let i = 0; i < N; i++) parent[i] = i;
    const find = (a: number): number => {
      let root = a;
      while (parent[root] !== root) root = parent[root];
      while (parent[a] !== root) {
        const next = parent[a];
        parent[a] = root;
        a = next;
      }
      return root;
    };
    const union = (a: number, b: number) => {
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) parent[rb] = ra;
    };
    for (let t = 0; t < triCount; t++) {
      const a = idxAt(t, 0);
      const b = idxAt(t, 1);
      const c = idxAt(t, 2);
      if (mask[a] && mask[b] && mask[c]) {
        union(a, b);
        union(b, c);
        // Stitch across UV-seam duplicates so islands merge.
        union(a, weldRoot[a]);
        union(b, weldRoot[b]);
        union(c, weldRoot[c]);
      }
    }
    const sizes = new Map<number, number>();
    for (let i = 0; i < N; i++) {
      if (!mask[i]) continue;
      const r = find(i);
      sizes.set(r, (sizes.get(r) ?? 0) + 1);
    }
    let bestRoot = -1;
    let bestSize = 0;
    sizes.forEach((size, root) => {
      if (size > bestSize) {
        bestSize = size;
        bestRoot = root;
      }
    });
    const keep = new Uint8Array(N);
    if (bestRoot < 0) return keep;
    for (let i = 0; i < N; i++) if (mask[i] && find(i) === bestRoot) keep[i] = 1;
    return keep;
  };

  const inScoop = (i: number) => wy[i] > SCOOP_Y && Math.abs(wx[i]) < SCOOP_HALF_W;

  // Top, lower band [hem → sleeve hem]: the trunk is the giant component;
  // forearm tube slices passing through this band are islands → dropped.
  const lowerMask = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    if (wy[i] >= TOP_HEM && wy[i] <= SLEEVE_HEM && Math.abs(wx[i]) <= SLEEVE_MAX_X) lowerMask[i] = 1;
  }
  const lowerKeep = largestComponent(lowerMask);

  // Top, full: upper band (torso + upper arms, joined at the shoulders →
  // short sleeves end exactly at the sleeve-hem cut) + surviving trunk band.
  const topMask = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    if (inScoop(i)) continue;
    if ((wy[i] > SLEEVE_HEM && wy[i] <= TOP_CAP && Math.abs(wx[i]) <= SLEEVE_MAX_X) || lowerKeep[i]) topMask[i] = 1;
  }
  const topKeep = largestComponent(topMask);

  // Trousers [cuff → waistband]: legs join through the pelvis = giant
  // component; hands/forearm tips hanging in this band are islands → bare.
  const trouserMask = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    if (wy[i] >= CUFF && wy[i] <= WAISTBAND) trouserMask[i] = 1;
  }
  const trouserKeep = largestComponent(trouserMask);

  const pieces = [
    { name: 'scrub-top', color: TOP_COLOR, offset: 0.026, keep: topKeep },
    { name: 'scrub-trousers', color: TROUSER_COLOR, offset: 0.012, keep: trouserKeep },
  ];

  const group = new THREE.Group();
  group.name = 'clothing-layer';
  group.visible = false;

  for (const spec of pieces) {
    const kept: number[] = [];
    for (let t = 0; t < triCount; t++) {
      const a = idxAt(t, 0);
      const b = idxAt(t, 1);
      const c = idxAt(t, 2);
      if (spec.keep[a] && spec.keep[b] && spec.keep[c]) kept.push(a, b, c);
    }
    if (kept.length < 60) continue;

    const remap = new Map<number, number>();
    const tris = new Uint32Array(kept.length);
    for (let j = 0; j < kept.length; j++) {
      const original = kept[j];
      let m = remap.get(original);
      if (m === undefined) {
        m = remap.size;
        remap.set(original, m);
      }
      tris[j] = m;
    }
    const M = remap.size;
    const p = new Float32Array(M * 3);
    remap.forEach((m, original) => {
      p[m * 3] = pos.getX(original);
      p[m * 3 + 1] = pos.getY(original);
      p[m * 3 + 2] = pos.getZ(original);
    });

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setIndex(new THREE.BufferAttribute(tris, 1));
    g.computeVertexNormals();

    // The body is reshaped at runtime by morph targets (per-case demographic
    // shape blend, the breathing cycle, revealed findings). A static shell
    // gets swallowed wherever those push the skin outward, so the garment
    // carries the SAME morph deltas (filtered to its vertices) and BodyMesh
    // mirrors the body's influences onto it every frame — the fabric
    // breathes and reshapes with the patient.
    const srcMorphs = (geom.morphAttributes && geom.morphAttributes.position) || [];
    if (srcMorphs.length) {
      g.morphAttributes.position = srcMorphs.map((ma) => {
        const arr = new Float32Array(M * 3);
        remap.forEach((m, original) => {
          arr[m * 3] = ma.getX(original);
          arr[m * 3 + 1] = ma.getY(original);
          arr[m * 3 + 2] = ma.getZ(original);
        });
        return new THREE.BufferAttribute(arr, 3);
      });
      g.morphTargetsRelative = geom.morphTargetsRelative;
    }

    const n = g.attributes.normal as THREE.BufferAttribute;
    const local = spec.offset / worldScale;
    for (let m = 0; m < M; m++) {
      const o = m * 3;
      p[o] += n.getX(m) * local;
      p[o + 1] += n.getY(m) * local;
      p[o + 2] += n.getZ(m) * local;
    }
    g.computeVertexNormals();

    const garment = new THREE.Mesh(
      g,
      new THREE.MeshStandardMaterial({
        color: spec.color,
        roughness: 0.88,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    );
    garment.name = spec.name;
    if (srcMorphs.length && body.morphTargetDictionary) {
      garment.morphTargetDictionary = { ...body.morphTargetDictionary };
      garment.morphTargetInfluences = new Array(srcMorphs.length).fill(0);
      // Mirror the body's influences at draw time. Several drivers write the
      // body's morphs at different points in the frame (demographic shape,
      // breathing, findings) — onBeforeRender runs after ALL of them, so the
      // fabric always deforms with the skin it covers.
      garment.onBeforeRender = () => {
        const bodyInfl = body.morphTargetInfluences;
        const mine = garment.morphTargetInfluences;
        if (bodyInfl && mine) {
          for (let k = 0; k < mine.length; k++) mine[k] = bodyInfl[k] ?? 0;
        }
      };
    }
    garment.castShadow = true;
    garment.receiveShadow = true;
    // Clicks must reach the patient: the garment is invisible to the raycaster.
    garment.raycast = () => {};
    garment.userData.skipRecolor = true;
    group.add(garment);
  }

  return group.children.length ? group : null;
}
