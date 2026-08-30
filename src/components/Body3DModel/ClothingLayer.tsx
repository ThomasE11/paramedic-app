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
 * Vertices are classified geometrically + topologically, which keeps the
 * garment builder compatible with both the legacy unrigged fallback and the
 * active rigged male/female patients:
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

// "The way you would find them": casual street clothes, not scrubs —
// heather-navy tee + grey-brown trousers.
const TOP_COLOR = '#3a4a63';
const TROUSER_COLOR = '#4b4a45';

/**
 * Procedural woven-fabric normal map (lazy singleton). A subtle twill bump
 * is most of what separates "cloth" from "painted-on plastic" at exam zoom.
 */
let fabricNormalTex: THREE.CanvasTexture | null = null;
function getFabricNormal(): THREE.CanvasTexture | null {
  if (fabricNormalTex) return fabricNormalTex;
  if (typeof document === 'undefined') return null;
  const S = 128;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const img = ctx.createImageData(S, S);
  const d = img.data;
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      // Twill weave: alternating diagonal ridges + thread-level jitter.
      const ridge = Math.sin((x + y) * (Math.PI / 4)) * 0.5;
      const thread = Math.sin(x * Math.PI) * Math.cos(y * Math.PI) * 0.25;
      const nx = 128 + ridge * 22;
      const ny = 128 + thread * 22;
      const o = (y * S + x) * 4;
      d[o] = nx; d[o + 1] = ny; d[o + 2] = 255; d[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  fabricNormalTex = new THREE.CanvasTexture(canvas);
  fabricNormalTex.wrapS = THREE.RepeatWrapping;
  fabricNormalTex.wrapT = THREE.RepeatWrapping;
  return fabricNormalTex;
}

/**
 * Clothing source:
 *   'blended-garment' — GLBs authored in Blender FROM the body mesh
 *     (scripts/anatomy-models/blender-garment-bake.py): real draped topology,
 *     with the body's 11 morph targets baked in by matching NAME. Preferred.
 *   'procedural' — the runtime cut-from-skin fallback below (buildScrubs).
 * Blended mode auto-falls-back to procedural if the GLBs aren't loaded yet.
 */
export const CLOTHING_MODE: 'procedural' | 'blended-garment' = 'blended-garment';

/** Garment GLB URL → piece name the hide map (CLOTHING_PARTING) keys on. */
export interface GarmentGlbSpec {
  url: string;
  name: string;
  color: string;
  offset: number;
}

export const GARMENT_GLBS: GarmentGlbSpec[] = [
  // Garments are already lifted from the body in Blender. Runtime offset is
  // millimetric—only enough to prevent z-fighting, not a second inflated shell.
  { url: '/models/garment-shirt.glb', name: 'scrub-top', color: TOP_COLOR, offset: 0.001 },
  { url: '/models/garment-trousers.glb', name: 'scrub-trousers', color: TROUSER_COLOR, offset: 0.001 },
];

export const FEMALE_GARMENT_GLBS: GarmentGlbSpec[] = [
  { url: '/models/garment-shirt-female.glb', name: 'scrub-top', color: TOP_COLOR, offset: 0.001 },
  { url: '/models/garment-trousers-female.glb', name: 'scrub-trousers', color: TROUSER_COLOR, offset: 0.001 },
];

export const ALL_GARMENT_GLBS = [...GARMENT_GLBS, ...FEMALE_GARMENT_GLBS];

export function garmentGlbsForModel(modelPath: string): GarmentGlbSpec[] {
  return modelPath.includes('-female.glb') ? FEMALE_GARMENT_GLBS : GARMENT_GLBS;
}

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
  const SCOOP_Y = yf(0.806);
  const TOP_CAP = yf(0.844);
  const CUFF = yf(0.1);
  const SCOOP_HALF_W = 0.085 * (H / 1.8);
  // Cuffs are cut PERPENDICULAR to the upper-arm axis. A vertical |x| plane
  // looks acceptable in the base A-pose but collapses to a long triangular
  // point after the tripod morph brings the arms inward. Projecting each
  // vertex along the shoulder→elbow line gives a short, level sleeve in every
  // posture while keeping the torso as one connected garment component.
  const bodyScale = H / 1.8;
  const TORSO_HALF_W = 0.215 * bodyScale;
  const SHOULDER_X = 0.19 * bodyScale;
  const SHOULDER_Y = yf(0.82);
  const SLEEVE_LENGTH = 0.21 * bodyScale;
  const isShirtVertex = (i: number) => {
    if (wy[i] < TOP_HEM || wy[i] > TOP_CAP || inScoop(i)) return false;
    if (Math.abs(wx[i]) <= TORSO_HALF_W) return true;
    const alongArm = (Math.abs(wx[i]) - SHOULDER_X) * 0.62 + (SHOULDER_Y - wy[i]) * 0.78;
    return wy[i] >= yf(0.66) && alongArm <= SLEEVE_LENGTH;
  };

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

  // Top: torso plus a shoulder-axis sleeve. Largest-component filtering drops
  // any hand/forearm islands that happen to intersect the height band.
  const topMask = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    if (isShirtVertex(i)) topMask[i] = 1;
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

    // Rigged patients need their clothing to deform with the same bones. Copy
    // the four joint indices/weights for each retained body vertex into the
    // cut garment geometry. This preserves the exact anatomical binding while
    // still letting the garment carry the clinical morph targets above.
    const srcSkinIndex = geom.getAttribute('skinIndex') as THREE.BufferAttribute | undefined;
    const srcSkinWeight = geom.getAttribute('skinWeight') as THREE.BufferAttribute | undefined;
    if ((body as THREE.SkinnedMesh).isSkinnedMesh && srcSkinIndex && srcSkinWeight) {
      const skinIndices = new Uint16Array(M * 4);
      const skinWeights = new Float32Array(M * 4);
      remap.forEach((m, original) => {
        skinIndices[m * 4] = srcSkinIndex.getX(original);
        skinIndices[m * 4 + 1] = srcSkinIndex.getY(original);
        skinIndices[m * 4 + 2] = srcSkinIndex.getZ(original);
        skinIndices[m * 4 + 3] = srcSkinIndex.getW(original);
        skinWeights[m * 4] = srcSkinWeight.getX(original);
        skinWeights[m * 4 + 1] = srcSkinWeight.getY(original);
        skinWeights[m * 4 + 2] = srcSkinWeight.getZ(original);
        skinWeights[m * 4 + 3] = srcSkinWeight.getW(original);
      });
      g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
      g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));
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

    // Box-projected UVs so the fabric weave normal map can tile — the shell
    // has no authored UVs (it's cut from positions only). Scale keeps the
    // weave thread-fine at exam zoom.
    const uvArr = new Float32Array(M * 2);
    for (let m = 0; m < M; m++) {
      uvArr[m * 2] = (p[m * 3] + p[m * 3 + 2]) * 14;
      uvArr[m * 2 + 1] = p[m * 3 + 1] * 14;
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uvArr, 2));

    // Two draw calls per piece sell "real cloth": a sheened fabric OUTER
    // face and a darker BackSide INNER face. At every open edge (collar,
    // cuffs, hem) the viewer sees the dark interior — the thickness cue a
    // single DoubleSide shell can never give.
    const fabric = getFabricNormal();
    // polygonOffset pulls the cloth toward the camera in the depth buffer:
    // the shell rides only ~1-2.6cm off the skin and both carry the SAME
    // breathing morph, so without the bias the depth test flickers between
    // skin and fabric every frame — the reported "clothes keep fluttering".
    const outerMat = new THREE.MeshPhysicalMaterial({
      color: spec.color,
      roughness: 0.82,
      metalness: 0,
      sheen: 0.5,
      sheenRoughness: 0.65,
      sheenColor: new THREE.Color('#cfd6e0'),
      side: THREE.FrontSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      ...(fabric ? { normalMap: fabric, normalScale: new THREE.Vector2(0.35, 0.35) } : {}),
    });
    const innerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(spec.color).multiplyScalar(0.45),
      roughness: 0.96,
      metalness: 0,
      side: THREE.BackSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    const createGarmentMesh = (material: THREE.Material): THREE.Mesh => {
      const skinnedBody = body as THREE.SkinnedMesh;
      if (skinnedBody.isSkinnedMesh && g.getAttribute('skinIndex') && g.getAttribute('skinWeight')) {
        const mesh = new THREE.SkinnedMesh(g, material);
        mesh.bindMode = skinnedBody.bindMode;
        mesh.bind(skinnedBody.skeleton, skinnedBody.bindMatrix);
        return mesh;
      }
      return new THREE.Mesh(g, material);
    };

    const garment = createGarmentMesh(outerMat);
    garment.name = spec.name;
    const lining = createGarmentMesh(innerMat);
    lining.name = `${spec.name}-lining`;
    lining.raycast = () => {};
    lining.userData.skipRecolor = true;
    garment.add(lining);
    if (srcMorphs.length && body.morphTargetDictionary) {
      garment.morphTargetDictionary = { ...body.morphTargetDictionary };
      garment.morphTargetInfluences = new Array(srcMorphs.length).fill(0);
      lining.morphTargetDictionary = { ...body.morphTargetDictionary };
      lining.morphTargetInfluences = new Array(srcMorphs.length).fill(0);
      // Mirror the body's influences at draw time. Several drivers write the
      // body's morphs at different points in the frame (demographic shape,
      // breathing, findings) — onBeforeRender runs after ALL of them, so the
      // fabric (and its lining) always deforms with the skin it covers.
      garment.onBeforeRender = () => {
        const bodyInfl = body.morphTargetInfluences;
        const mine = garment.morphTargetInfluences;
        const lin = lining.morphTargetInfluences;
        if (bodyInfl && mine) {
          for (let k = 0; k < mine.length; k++) {
            mine[k] = bodyInfl[k] ?? 0;
            if (lin) lin[k] = bodyInfl[k] ?? 0;
          }
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

/**
 * Blended-garment build: assemble the clothing-layer Group from Blender-authored
 * garment GLBs instead of cutting it from the skin at runtime. Each garment GLB
 * was duplicated from THIS body mesh in Blender, so it already carries the same
 * 11 morph targets by NAME (breathe_chest_rise, finding_*, the demographic
 * shape blends). Here we:
 *   - clone each garment mesh, rename it to the piece name the hide map expects
 *     (scrub-top / scrub-trousers) so CLOTHING_PARTING + the parting effect work
 *     unchanged,
 *   - remap its morph influence array to the BODY's dictionary order and mirror
 *     the body's influences every frame (onBeforeRender), so the fabric breathes
 *     and reveals findings exactly like the procedural layer did,
 *   - give it the flat fabric material (the GLB ships no texture), a dark
 *     BackSide lining for edge thickness, disable raycast, and offset along
 *     normals for skin clearance.
 *
 * `garmentScenes` maps piece name → the loaded GLB scene (from useGLTF).
 * Returns null if no garment loaded (caller falls back to procedural).
 */
export function buildBlendedGarments(
  body: THREE.Mesh,
  garmentScenes: Map<string, THREE.Object3D>,
  garmentSpecs: GarmentGlbSpec[] = GARMENT_GLBS,
): THREE.Group | null {
  const bodyDict = body.morphTargetDictionary;
  const bodyInfl = body.morphTargetInfluences;

  body.updateWorldMatrix(true, false);
  const scl = new THREE.Vector3();
  body.matrixWorld.decompose(new THREE.Vector3(), new THREE.Quaternion(), scl);
  const worldScale = (Math.abs(scl.x) + Math.abs(scl.y) + Math.abs(scl.z)) / 3 || 1;

  const group = new THREE.Group();
  group.name = 'clothing-layer';
  group.visible = false;

  const fabric = getFabricNormal();

  for (const spec of garmentSpecs) {
    const gscene = garmentScenes.get(spec.url);
    if (!gscene) continue;
    // The garment GLB has a single mesh (the exported piece).
    let src: THREE.Mesh | null = null;
    gscene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!src && m.isMesh && m.geometry) src = m;
    });
    if (!src) continue;
    const srcMesh = src as THREE.Mesh;

    const g = (srcMesh.geometry as THREE.BufferGeometry).clone();
    // Offset the base positions along the vertex normal for skin clearance so
    // the fabric rides just off the body (the Blender bake already lifted it a
    // little; this matches the procedural layer's per-piece proud/tucked read).
    g.computeVertexNormals();
    const p = g.attributes.position as THREE.BufferAttribute;
    const n = g.attributes.normal as THREE.BufferAttribute;
    const local = spec.offset / worldScale;
    for (let i = 0; i < p.count; i++) {
      p.setXYZ(
        i,
        p.getX(i) + n.getX(i) * local,
        p.getY(i) + n.getY(i) * local,
        p.getZ(i) + n.getZ(i) * local,
      );
    }
    p.needsUpdate = true;
    g.computeVertexNormals();

    // Box-projected UVs for the fabric weave normal map (the GLB shipped no UVs).
    const M = p.count;
    const uvArr = new Float32Array(M * 2);
    for (let m = 0; m < M; m++) {
      uvArr[m * 2] = (p.getX(m) + p.getZ(m)) * 14;
      uvArr[m * 2 + 1] = p.getY(m) * 14;
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uvArr, 2));

    const outerMat = new THREE.MeshPhysicalMaterial({
      color: spec.color,
      roughness: 0.82,
      metalness: 0,
      sheen: 0.5,
      sheenRoughness: 0.65,
      sheenColor: new THREE.Color('#cfd6e0'),
      side: THREE.FrontSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
      ...(fabric ? { normalMap: fabric, normalScale: new THREE.Vector2(0.35, 0.35) } : {}),
    });
    const innerMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(spec.color).multiplyScalar(0.45),
      roughness: 0.96,
      metalness: 0,
      side: THREE.BackSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    const garment = new THREE.Mesh(g, outerMat);
    garment.name = spec.name;
    const lining = new THREE.Mesh(g, innerMat);
    lining.name = `${spec.name}-lining`;
    lining.raycast = () => {};
    lining.userData.skipRecolor = true;
    garment.add(lining);

    // Morph sync by NAME. The garment's own dictionary maps its morph names to
    // ITS influence-array slots; the body's maps the same names to the body's
    // slots. Build a garment-slot → body-slot map so we copy influences across
    // even if the exporter reordered them. (In practice they match, but the
    // name lookup makes the sync robust to a re-bake.)
    const gDict = srcMesh.morphTargetDictionary;
    const gInflLen = srcMesh.morphTargetInfluences?.length ?? 0;
    if (gDict && gInflLen && bodyDict && bodyInfl) {
      garment.morphTargetDictionary = { ...gDict };
      garment.morphTargetInfluences = new Array(gInflLen).fill(0);
      lining.morphTargetDictionary = { ...gDict };
      lining.morphTargetInfluences = new Array(gInflLen).fill(0);
      // garmentSlot -> bodySlot for each shared morph name.
      const slotMap: Array<number> = new Array(gInflLen).fill(-1);
      for (const [name, gSlot] of Object.entries(gDict)) {
        const bSlot = bodyDict[name];
        if (bSlot !== undefined) slotMap[gSlot] = bSlot;
      }
      garment.onBeforeRender = () => {
        const mine = garment.morphTargetInfluences;
        const lin = lining.morphTargetInfluences;
        const bi = body.morphTargetInfluences;
        if (!mine || !bi) return;
        for (let k = 0; k < mine.length; k++) {
          const b = slotMap[k];
          const val = b >= 0 ? bi[b] ?? 0 : 0;
          mine[k] = val;
          if (lin) lin[k] = val;
        }
      };
    }

    garment.castShadow = true;
    garment.receiveShadow = true;
    garment.raycast = () => {};
    garment.userData.skipRecolor = true;
    group.add(garment);
  }

  return group.children.length ? group : null;
}
