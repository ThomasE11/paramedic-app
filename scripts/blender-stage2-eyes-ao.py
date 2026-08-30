# Stage-2 authoring pass for the patient GLBs (run headless):
#
#   1. AO bake — Cycles bakes ambient occlusion from the mesh's own geometry
#      into the existing 2048 UV layout, then multiplies it SUBTLY into the
#      diffuse texture. The pure-red eye-socket texels are masked out of the
#      multiply: EyesLayer.paintEyesOnTexture and scripts/calibrate-face.cjs
#      both key off those exact texel values.
#   2. Real eye meshes — two low-poly sclera spheres recessed into the eye
#      sockets, each parenting an iris disc + smaller pupil disc on its front
#      pole. Socket positions are found from the model's own data: red texel
#      blob -> UV -> owning mesh triangle -> barycentric surface point, so the
#      same script works on any patient GLB that uses the red-socket
#      convention. Node names are the app contract: eyeL/eyeR/irisL/irisR/
#      pupilL/pupilR, where eyeR = the PATIENT'S right (raw x < 0 — the raw
#      model faces +z_glTF and the app normalisation is scale+translate only).
#
# Coordinate cheat-sheet (verified empirically against patient.glb):
#   glTF: +y up, patient faces +z (nose/toes at +z), patient's right = -x.
#   Blender import: (x, y, z)_glTF -> (x, -z, y)_Blender, object matrix
#   identity. So in Blender: up = +Z, patient faces -Y, right = -X.
#
# Run: /Applications/Blender.app/Contents/MacOS/Blender --background \
#        --python scripts/blender-stage2-eyes-ao.py -- \
#        <in.glb> <out.glb> [--ao-strength 0.4] [--ao-samples 32] [--skip-ao]
# Then: node scripts/verify-glb.cjs <out.glb> --expect-eyes
import math
import sys

import bpy
import numpy as np

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SRC = argv[0] if len(argv) > 0 else "public/models/patient.glb"
DST = argv[1] if len(argv) > 1 else "/tmp/patient-stage2.glb"
AO_STRENGTH = float(argv[argv.index("--ao-strength") + 1]) if "--ao-strength" in argv else 0.40
AO_SAMPLES = int(argv[argv.index("--ao-samples") + 1]) if "--ao-samples" in argv else 32
SKIP_AO = "--skip-ao" in argv

# Adult reference dimensions. Age-specific meshes scale these after import;
# pupil diameter remains a real millimetre measurement at every age.
ADULT_EYE_RADIUS = 0.011
ADULT_EYE_RECESS = 0.0095
ADULT_IRIS_RADIUS = 0.006
ADULT_IRIS_OFFSET = 0.0115
PUPIL_RADIUS = 0.0025   # 5mm pupil at scale 1 (case baseline)
ADULT_PUPIL_OFFSET = 0.0122


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_linear(h):
    return tuple(srgb_to_linear(int(h[i:i + 2], 16) / 255.0) for i in (0, 2, 4)) + (1.0,)


# --------------------------------------------------------------------------
# Import
# --------------------------------------------------------------------------
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

body = max((o for o in bpy.data.objects if o.type == "MESH"), key=lambda o: len(o.data.vertices))
print(f"body mesh: {body.name!r} verts={len(body.data.vertices)}")
if body.matrix_world != body.matrix_world.Identity(4):
    raise RuntimeError("body object transform is not identity — coordinate assumptions void")

# The GLB ships with non-zero DEFAULT weights on the MakeHuman macro morphs,
# but the app zeroes every non-finding morph on its first frame — students only
# ever see the BASIS shape. Zero the keys here so the AO bake and debug render
# match the displayed geometry; the original weights are restored before
# export so the file's authored defaults stay untouched.
saved_weights = {}
if body.data.shape_keys:
    for kb in body.data.shape_keys.key_blocks:
        if kb.name != "Basis":
            saved_weights[kb.name] = kb.value
            kb.value = 0.0

mat = body.data.materials[0]
tex_node = next(n for n in mat.node_tree.nodes if n.type == "TEX_IMAGE" and n.image)
diffuse = tex_node.image
W, H = diffuse.size
print(f"diffuse: {diffuse.name!r} {W}x{H}")

# Pixels as float array, bottom-up rows (Blender convention), RGBA.
px = np.empty(W * H * 4, dtype=np.float32)
diffuse.pixels.foreach_get(px)
rgba = px.reshape(H, W, 4)
R, G, B = (rgba[..., i] * 255.0 for i in range(3))

# --------------------------------------------------------------------------
# Red eye-socket blobs (same rule as EyesLayer.paintEyesOnTexture)
# --------------------------------------------------------------------------
red = (R > 165) & (G < 90) & (B < 90) & (R - G > 95) & (R - B > 95)
ys, xs = np.nonzero(red)
print(f"red texels: {len(xs)}")
if len(xs) < 40:
    raise RuntimeError("no red eye-socket texels — model does not use the red-socket convention")

# Connected components over the sparse set (4-connectivity flood fill).
pix = set(zip(xs.tolist(), ys.tolist()))
blobs = []
max_eye = max(8, round(W * 0.06))
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
    bx = [p[0] for p in blob]
    by = [p[1] for p in blob]
    bw, bh = max(bx) - min(bx) + 1, max(by) - min(by) + 1
    if len(blob) >= 20 and bw <= max_eye and bh <= max_eye and bw <= bh * 3 and bh <= bw * 3:
        blobs.append((sum(bx) / len(bx), sum(by) / len(by), len(blob)))
blobs.sort(key=lambda b: -b[2])
eye_blobs = blobs[:2]
if len(eye_blobs) != 2:
    raise RuntimeError(f"expected 2 eye blobs, found {len(blobs)}")
print(f"eye blobs (bottom-up texels): {eye_blobs}")

# --------------------------------------------------------------------------
# Blob UV -> owning triangle -> barycentric 3D socket surface point
# --------------------------------------------------------------------------
mesh = body.data
mesh.calc_loop_triangles()
uv_layer = mesh.uv_layers.active.data
verts = mesh.vertices
body_min_z = min(vertex.co.z for vertex in verts)
body_max_z = max(vertex.co.z for vertex in verts)
body_height = body_max_z - body_min_z
head_floor = body_min_z + body_height * 0.78
# Newborn eyeballs are already roughly three quarters of adult diameter and
# approach adult size through childhood; do not uniformly shrink them with the
# body or an infant reads as a miniature adult.
eye_scale = max(0.74, min(1.0, 0.74 + 0.26 * ((body_height - 0.65) / 1.08)))
EYE_RADIUS = ADULT_EYE_RADIUS * eye_scale
EYE_RECESS = ADULT_EYE_RECESS * eye_scale
IRIS_RADIUS = ADULT_IRIS_RADIUS * max(0.84, eye_scale)
IRIS_OFFSET = ADULT_IRIS_OFFSET * eye_scale
PUPIL_OFFSET = ADULT_PUPIL_OFFSET * eye_scale
print(f"body height={body_height:.3f}m eye scale={eye_scale:.3f}")


def uv_to_surface(u, v):
    """Blob UV -> (surface point, smooth outward normal) on the head."""
    candidates = []
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
        n = (wa * verts[i0].normal + wb * verts[i1].normal + wc * verts[i2].normal).normalized()
        candidates.append((p, n))
    # Eyes live in the upper 22% of the patient, whether this is a 66cm infant
    # or a 1.8m adult, and on the face front (most -Y).
    head = [c for c in candidates if c[0].z > head_floor]
    if not head:
        raise RuntimeError(f"UV ({u:.4f},{v:.4f}) found no head triangle (candidates: {candidates})")
    return min(head, key=lambda c: c[0].y)


sockets = [uv_to_surface(bx / W, by / H) for bx, by, _ in eye_blobs]
for s, n in sockets:
    print(f"socket surface (Blender): [{s.x:.4f}, {s.y:.4f}, {s.z:.4f}] normal [{n.x:.3f}, {n.y:.3f}, {n.z:.3f}]")

# Patient's right = -X. calibrate-face app-space |x| should be ~0.029/1.0805.
sockets.sort(key=lambda c: c[0].x)  # index 0 = most -X = patient's RIGHT
if not (sockets[0][0].x < 0 < sockets[1][0].x):
    raise RuntimeError(f"sockets not either side of the midline: {[c[0].x for c in sockets]}")

# Gaze direction. Socket-interior normals are unreliable (the red texels sit
# inside a concave cavity whose normals point every which way), so derive the
# head's facing from the EYE LINE instead: gaze = horizontal perpendicular of
# the right->left socket vector, i.e. where the face points if the head yaws.
# Both eyes share it (real eyes verge at infinity).
from mathutils import Vector  # noqa: E402  (Blender module, available after bpy)

eyeline = (sockets[1][0] - sockets[0][0]).normalized()  # patient right -> left
gaze = Vector((eyeline.y, -eyeline.x, 0.0)).normalized()
if gaze.y > 0:  # must point out of the face (front = -Y)
    gaze = -gaze
# Texel centroids carry a few degrees of noise; a genuinely turned head shows
# up as a much larger lean. Snap near-straight gazes to dead ahead so the
# patient doesn't look subtly cross-eyed.
if abs(gaze.x) < 0.15:
    gaze = Vector((0.0, -1.0, 0.0))
print(f"gaze (outward): [{gaze.x:.4f}, {gaze.y:.4f}, {gaze.z:.4f}]")

# Refine each eye centre using the palpebral opening: the sockets are OPEN
# boundary loops in the mesh. Boundary verts (edges used by exactly one tri)
# within 3cm of the texel-derived socket point trace the eyelid rim; their
# centroid is the true opening centre, which beats the texel centroid (the
# red region is not symmetric around the opening).
import collections  # noqa: E402

edge_count = collections.Counter()
for tri in mesh.loop_triangles:
    tv = tri.vertices
    for e in ((tv[0], tv[1]), (tv[1], tv[2]), (tv[2], tv[0])):
        edge_count[tuple(sorted(e))] += 1
boundary_idx = set()
for (a, b), cnt in edge_count.items():
    if cnt == 1:
        boundary_idx.add(a)
        boundary_idx.add(b)

openings = []
for socket, _n in sockets:
    ring = [verts[i].co for i in boundary_idx if (verts[i].co - socket).length < 0.03]
    if len(ring) >= 6:
        centroid = sum(ring, Vector()) / len(ring)
        openings.append(centroid)
        print(f"palpebral opening: [{centroid.x:.4f}, {centroid.y:.4f}, {centroid.z:.4f}] from {len(ring)} rim verts")
    else:
        openings.append(socket)
        print(f"no rim found near socket [{socket.x:.4f}, …] — keeping texel-derived point ({len(ring)} verts)")

# --------------------------------------------------------------------------
# AO bake -> subtle multiply into the diffuse (red texels excluded)
# --------------------------------------------------------------------------
if not SKIP_AO:
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = AO_SAMPLES

    ao_img = bpy.data.images.new("ao_bake", width=W, height=H, alpha=False, float_buffer=True)
    ao_img.colorspace_settings.name = "Non-Color"
    bake_node = mat.node_tree.nodes.new("ShaderNodeTexImage")
    bake_node.image = ao_img
    mat.node_tree.nodes.active = bake_node
    bake_node.select = True

    bpy.ops.object.select_all(action="DESELECT")
    body.select_set(True)
    bpy.context.view_layer.objects.active = body
    print(f"baking AO {W}x{H} at {AO_SAMPLES} samples (CPU)…")
    bpy.ops.object.bake(type="AO", margin=8)
    print("bake done")

    ao_px = np.empty(W * H * 4, dtype=np.float32)
    ao_img.pixels.foreach_get(ao_px)
    ao = ao_px.reshape(H, W, 4)[..., 0]
    print(f"AO range: {ao.min():.3f}..{ao.max():.3f} mean {ao.mean():.3f}")

    # Subtle multiply: factor 1 at ao=1, (1-strength) at ao=0. Red texels keep
    # factor 1 so the eye-socket convention survives byte-exact thresholds.
    factor = 1.0 - AO_STRENGTH * (1.0 - np.clip(ao, 0.0, 1.0))
    factor[red] = 1.0
    rgba[..., :3] *= factor[..., None]

    mat.node_tree.nodes.remove(bake_node)
    bpy.data.images.remove(ao_img)

    out_img = bpy.data.images.new("patient_diffuse_ao", width=W, height=H, alpha=False)
    out_img.colorspace_settings.name = "sRGB"
    out_img.pixels.foreach_set(rgba.reshape(-1))
    out_img.filepath_raw = "/tmp/patient_diffuse_ao.png"
    out_img.file_format = "PNG"
    out_img.save()
    out_img.source = "FILE"
    out_img.filepath = "/tmp/patient_diffuse_ao.png"
    out_img.reload()
    out_img.pack()
    tex_node.image = out_img
    print("diffuse *= AO (subtle) — red texels preserved")

# --------------------------------------------------------------------------
# Eye meshes
# --------------------------------------------------------------------------
sclera_mat = bpy.data.materials.new("eye_sclera")
sclera_mat.use_nodes = True
p = sclera_mat.node_tree.nodes["Principled BSDF"]
p.inputs["Base Color"].default_value = hex_linear("ede8dc")  # warm off-white
p.inputs["Roughness"].default_value = 0.35
p.inputs["Metallic"].default_value = 0.0

iris_mat = bpy.data.materials.new("eye_iris")
iris_mat.use_nodes = True
p = iris_mat.node_tree.nodes["Principled BSDF"]
p.inputs["Base Color"].default_value = hex_linear("5d4634")  # matches painted iris
p.inputs["Roughness"].default_value = 0.4
p.inputs["Metallic"].default_value = 0.0

pupil_mat = bpy.data.materials.new("eye_pupil")
pupil_mat.use_nodes = True
p = pupil_mat.node_tree.nodes["Principled BSDF"]
p.inputs["Base Color"].default_value = hex_linear("0b0b0d")
p.inputs["Roughness"].default_value = 0.3
p.inputs["Metallic"].default_value = 0.0


disc_align = Vector((0.0, 0.0, 1.0)).rotation_difference(gaze)  # +Z (primitive normal) -> gaze


def add_disc(name, radius, location, material):
    bpy.ops.mesh.primitive_circle_add(vertices=24, radius=radius, fill_type="NGON", location=location)
    disc = bpy.context.active_object
    disc.name = name
    disc.data.name = name
    disc.rotation_mode = "QUATERNION"
    disc.rotation_quaternion = disc_align
    # Bake the orientation into the mesh so the exported node has identity
    # rotation — the app scales pupil nodes and expects clean local frames.
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    disc.data.materials.append(material)
    return disc


for side, opening in (("R", openings[0]), ("L", openings[1])):
    centre = opening - gaze * EYE_RECESS  # recess into the head along the gaze
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=14, radius=EYE_RADIUS, location=centre)
    eye = bpy.context.active_object
    eye.name = f"eye{side}"
    eye.data.name = f"eye{side}"
    bpy.ops.object.shade_smooth()
    eye.data.materials.append(sclera_mat)

    iris = add_disc(f"iris{side}", IRIS_RADIUS, centre + gaze * IRIS_OFFSET, iris_mat)
    pupil = add_disc(f"pupil{side}", PUPIL_RADIUS, centre + gaze * PUPIL_OFFSET, pupil_mat)
    for child in (iris, pupil):
        child.parent = eye
        child.matrix_parent_inverse = eye.matrix_world.inverted()
    print(f"eye{side}: centre Blender [{centre.x:.4f}, {centre.y:.4f}, {centre.z:.4f}] "
          f"-> glTF [{centre.x:.4f}, {centre.z:.4f}, {-centre.y:.4f}]")

# --------------------------------------------------------------------------
# Export
# --------------------------------------------------------------------------
# --------------------------------------------------------------------------
# Debug face render (fast, app-independent placement check)
# --------------------------------------------------------------------------
if "--render" in argv:
    mid = (sockets[0][0] + sockets[1][0]) * 0.5
    cam_data = bpy.data.cameras.new("dbgcam")
    cam_data.lens = 85
    cam = bpy.data.objects.new("dbgcam", cam_data)
    bpy.context.collection.objects.link(cam)
    cam.location = mid + gaze * 0.55
    cam.rotation_mode = "QUATERNION"
    cam.rotation_quaternion = gaze.to_track_quat("Z", "Y")  # camera -Z looks along -gaze
    sun = bpy.data.objects.new("dbgsun", bpy.data.lights.new("dbgsun", "SUN"))
    bpy.context.collection.objects.link(sun)
    sun.rotation_euler = (math.radians(60), 0, math.radians(15))
    sun.data.energy = 3.0
    scene = bpy.context.scene
    scene.camera = cam
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 900
    scene.render.resolution_y = 700
    scene.render.filepath = "/tmp/stage2-blender-face.png"
    bpy.ops.render.render(write_still=True)
    print("debug render: /tmp/stage2-blender-face.png")
    for o in (cam, sun):
        bpy.data.objects.remove(o)

# Restore the authored default morph weights (see note at the top).
if body.data.shape_keys:
    for kb in body.data.shape_keys.key_blocks:
        if kb.name in saved_weights:
            kb.value = saved_weights[kb.name]

bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(
    filepath=DST,
    export_format="GLB",
    export_yup=True,
    export_morph=True,
    export_morph_normal=True,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_image_format="AUTO",
)
print(f"exported {DST}")
