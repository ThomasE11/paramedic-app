# Male masculinization bake — the male counterpart of blender-mpfb-female-bake.py.
#
# patient.glb ships the MPFB2 male macrodetail targets ($md-*-$ma-*) as shape
# keys with authored default weights (universal male at 0.893 etc.) — but
# BodyMesh ramps every non-finding morph to 0 each frame, so students only
# ever saw the androgynous MakeHuman basis, which reads feminine. This script
# applies the authored macro weights INTO the basis geometry (broader
# shoulders, male jaw/brow, male proportions — all authored by MPFB2),
# preserves the three clinical morph deltas relative to the new basis, and
# deletes the macro keys. What ships is what renders.
#
# Unlike the female bake, no texture repaint is needed: the male diffuse's
# red eye-socket blobs already pass the shared eye-size filter
# (verify-glb.cjs confirms "red eye-socket blobs intact").
#
# The imported file carries stage-2 eye meshes placed for the OLD androgynous
# face; the bake moves the face, so those eyes are deleted here and
# blender-stage2-eyes-ao.py re-places them on the baked geometry.
#
# Run: /Applications/Blender.app/Contents/MacOS/Blender --background \
#        --python scripts/blender-mpfb-male-bake.py -- <in.glb> <out.glb>
# Then: scripts/blender-stage2-eyes-ao.py <out.glb> <final.glb> --skip-ao
#       (--skip-ao: the texture was already AO-multiplied in the original
#       stage-2 pass; multiplying twice would double-darken the skin)
# Then: node scripts/verify-glb.cjs <final.glb> --expect-eyes
import sys

import bpy
import numpy as np

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SRC = argv[0] if len(argv) > 0 else "public/models/patient.glb"
DST = argv[1] if len(argv) > 1 else "/tmp/patient-male-baked.glb"

CLINICAL = {"breathe_chest_rise", "finding_abdo_distension", "finding_jvd"}

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

# Drop the stale stage-2 eye rig — re-placed after the bake on the new face.
for name in ("eyeL", "eyeR", "irisL", "irisR", "pupilL", "pupilR"):
    obj = bpy.data.objects.get(name)
    if obj:
        bpy.data.objects.remove(obj, do_unlink=True)
        print(f"removed stale eye node {name!r}")

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
if not macro:
    raise RuntimeError("no $md macro keys — already baked?")
if len(clinical) != 3:
    raise RuntimeError(f"expected 3 clinical morphs, found {[k.name for k in clinical]}")
print("macro keys (authored weight):")
for kb in macro:
    print(f"  {kb.name} = {kb.value:.4f}")

# ---------------------------------------------------------------------------
# Bake macro morphs into the basis, preserving clinical deltas
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
# their deltas (chest rise etc.) identical relative to the new male basis.
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
