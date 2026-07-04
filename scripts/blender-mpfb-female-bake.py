# Stage-2 female prep pass — fixes the two defects that made the MPFB2 female
# GLB read as "male body + broken eyes" in the app:
#
#   1. BAKE the female shape into the BASIS. The May-29 MPFB2 export carries
#      the female macrodetail targets ($md-*-$fe-*) as shape keys with authored
#      default weights — but BodyMesh ramps every non-finding morph to 0 each
#      frame, so students only ever saw the androgynous MakeHuman basis (byte-
#      identical to the male patient.glb basis). This script applies the
#      authored macro weights INTO the basis geometry, preserves the three
#      clinical morph deltas (breathe_chest_rise / finding_jvd /
#      finding_abdo_distension) relative to the new basis, and deletes the
#      macro keys. What ships is what renders.
#
#   2. REPAINT the red eye-socket convention. The MakeHuman female skin marks
#      the whole eyeball UV islands pure red (146x186 texels) — bigger than
#      the shared eye-size filter (bbox <= round(W*0.06) = 123px) used by
#      EyesLayer.paintEyesOnTexture, scripts/verify-glb.cjs and
#      blender-stage2-eyes-ao.py. The filter therefore rejected the real
#      sockets and elected a mouth-interior blob + an orphan texel blob as
#      "eyes". Fix: recolour EVERY pure-red texel to the sclera tone EyesLayer
#      would have painted anyway, then stamp two fresh pure-red ovals
#      (91x111px, inside the filter) at the true socket island centroids —
#      found from the mesh's own UVs, same rule as the male texture.
#
# Run: /Applications/Blender.app/Contents/MacOS/Blender --background \
#        --python scripts/blender-mpfb-female-bake.py -- <in.glb> <out.glb>
# Then: scripts/blender-stage2-eyes-ao.py <out.glb> <final.glb>  (eyes + AO)
# Then: node scripts/verify-glb.cjs <final.glb> --expect-eyes
import sys

import bpy
import numpy as np

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SRC = argv[0] if len(argv) > 0 else "public/models/patient-female.glb"
DST = argv[1] if len(argv) > 1 else "/tmp/patient-female-baked.glb"

CLINICAL = {"breathe_chest_rise", "finding_abdo_distension", "finding_jvd"}
SCLERA = (232 / 255.0, 228 / 255.0, 216 / 255.0)  # EyesLayer's warm off-white
EYE_RED = (204 / 255.0, 26 / 255.0, 26 / 255.0)   # passes the strict red rule
OVAL_RX, OVAL_RY = 45, 55                          # bbox 91x111 < 123 limit

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

body = max((o for o in bpy.data.objects if o.type == "MESH"), key=lambda o: len(o.data.vertices))
mesh = body.data
nverts = len(mesh.vertices)
print(f"body: {body.name!r} verts={nverts}")

keys = mesh.shape_keys
if not keys:
    raise RuntimeError("no shape keys — wrong input file?")
basis_kb = keys.key_blocks["Basis"]
macro = [kb for kb in keys.key_blocks if kb.name.startswith("$md")]
clinical = [kb for kb in keys.key_blocks if kb.name in CLINICAL]
if len(clinical) != 3:
    raise RuntimeError(f"expected 3 clinical morphs, found {[k.name for k in clinical]}")
print("macro keys (authored weight):")
for kb in macro:
    print(f"  {kb.name} = {kb.value:.4f}")

# ---------------------------------------------------------------------------
# 1. Bake macro morphs into the basis, preserving clinical deltas
# ---------------------------------------------------------------------------
def get_co(kb):
    a = np.empty(nverts * 3, dtype=np.float32)
    kb.data.foreach_get("co", a)
    return a


basis = get_co(basis_kb)
offset = np.zeros_like(basis)
for kb in macro:
    if kb.value != 0.0:
        offset += kb.value * (get_co(kb) - basis)
new_basis = basis + offset

# Clinical keys store ABSOLUTE coords; shifting them by the same offset keeps
# their deltas (chest rise etc.) identical relative to the new female basis.
for kb in clinical:
    kb.data.foreach_set("co", get_co(kb) + offset)

basis_kb.data.foreach_set("co", new_basis)
mesh.vertices.foreach_set("co", new_basis)

for kb in macro:
    body.shape_key_remove(kb)
for kb in clinical:
    kb.value = 0.0
mesh.update()

xyz = new_basis.reshape(-1, 3)
print(f"baked bbox: min {xyz.min(axis=0).round(3)} max {xyz.max(axis=0).round(3)}")
print(f"remaining shape keys: {[kb.name for kb in keys.key_blocks]}")

# ---------------------------------------------------------------------------
# 2. Repaint the red eye-socket convention
# ---------------------------------------------------------------------------
mat = mesh.materials[0]
tex_node = next(n for n in mat.node_tree.nodes if n.type == "TEX_IMAGE" and n.image)
diffuse = tex_node.image
W, H = diffuse.size
px = np.empty(W * H * 4, dtype=np.float32)
diffuse.pixels.foreach_get(px)
rgba = px.reshape(H, W, 4)  # bottom-up rows (Blender convention)
R, G, B = (rgba[..., i] * 255.0 for i in range(3))
red = (R > 165) & (G < 90) & (B < 90) & (R - G > 95) & (R - B > 95)
ys, xs = np.nonzero(red)
print(f"pure-red texels before repaint: {len(xs)}")

# Connected components (all sizes) — we need the two genuine eye islands.
pix = set(zip(xs.tolist(), ys.tolist()))
blobs = []
while pix:
    seed = pix.pop()
    stack, blob = [seed], [seed]
    while stack:
        cx, cy = stack.pop()
        for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
            if (nx, ny) in pix:
                pix.remove((nx, ny))
                stack.append((nx, ny))
                blob.append((nx, ny))
    if len(blob) >= 50:
        bx = [p[0] for p in blob]
        by = [p[1] for p in blob]
        blobs.append((sum(bx) / len(bx), sum(by) / len(by), len(blob)))

# Map each blob's centroid UV onto the mesh; genuine eye islands sit on the
# face FRONT (Blender -Y), HIGH on the head, clearly OFF the midline (one per
# side). Mouth-interior / nostril red is midline or set back; orphan texels
# own no triangle at all.
mesh.calc_loop_triangles()
uv_layer = mesh.uv_layers.active.data
verts = mesh.vertices
zmax = xyz[:, 2].max()


def uv_owner(u, v):
    for tri in mesh.loop_triangles:
        l0, l1, l2 = tri.loops
        a, b, c = uv_layer[l0].uv, uv_layer[l1].uv, uv_layer[l2].uv
        d = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y)
        if abs(d) < 1e-12:
            continue
        wa = ((b.y - c.y) * (u - c.x) + (c.x - b.x) * (v - c.y)) / d
        wb = ((c.y - a.y) * (u - c.x) + (a.x - c.x) * (v - c.y)) / d
        wc = 1.0 - wa - wb
        if wa < -1e-4 or wb < -1e-4 or wc < -1e-4:
            continue
        i0, i1, i2 = tri.vertices
        p = wa * verts[i0].co + wb * verts[i1].co + wc * verts[i2].co
        if p.z > zmax * 0.85:  # head only
            return p
    return None


eye_candidates = []
for bx, by, n in blobs:
    p = uv_owner(bx / W, by / H)
    where = f"[{p.x:.3f},{p.y:.3f},{p.z:.3f}]" if p else "no owning tri"
    print(f"  blob ({bx:.0f},{by:.0f}) n={n} -> {where}")
    if p and abs(p.x) >= 0.012 and p.y <= -0.09:
        eye_candidates.append((bx, by, n, p.x))

left = [c for c in eye_candidates if c[3] > 0]
right = [c for c in eye_candidates if c[3] < 0]
if not left or not right:
    raise RuntimeError(f"could not identify one eye island per side: {eye_candidates}")
sockets = [max(right, key=lambda c: c[2]), max(left, key=lambda c: c[2])]
print(f"eye islands: R at texel ({sockets[0][0]:.0f},{sockets[0][1]:.0f}) "
      f"L at ({sockets[1][0]:.0f},{sockets[1][1]:.0f})")

# All current red -> sclera (exactly what EyesLayer.paintEyesOnTexture does at
# runtime today, so nothing visible changes), then stamp the two fresh ovals.
for i, c in enumerate(SCLERA):
    rgba[..., i][red] = c

yy, xx = np.mgrid[0:H, 0:W]
for bx, by, _n, _x in sockets:
    oval = ((xx - bx) / OVAL_RX) ** 2 + ((yy - by) / OVAL_RY) ** 2 <= 1.0
    for i, c in enumerate(EYE_RED):
        rgba[..., i][oval] = c

out_img = bpy.data.images.new("female_diffuse_fixed", width=W, height=H, alpha=False)
out_img.colorspace_settings.name = "sRGB"
out_img.pixels.foreach_set(rgba.reshape(-1))
out_img.filepath_raw = "/tmp/female_diffuse_fixed.png"
out_img.file_format = "PNG"
out_img.save()
out_img.source = "FILE"
out_img.filepath = "/tmp/female_diffuse_fixed.png"
out_img.reload()
out_img.pack()
tex_node.image = out_img
print("texture repainted: all red -> sclera; two fresh socket ovals stamped")

# ---------------------------------------------------------------------------
# Export (NO Draco here — blender-stage2-eyes-ao.py re-exports with Draco;
# compressing twice would quantise the geometry twice for nothing)
# ---------------------------------------------------------------------------
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(
    filepath=DST,
    export_format="GLB",
    export_yup=True,
    export_morph=True,
    export_morph_normal=True,
    export_draco_mesh_compression_enable=False,
    export_image_format="AUTO",
)
print(f"exported {DST}")
