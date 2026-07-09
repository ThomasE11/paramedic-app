# Male bake pass — the male twin of blender-mpfb-female-bake.py.
#
# patient.glb ships the MakeHuman MALE macrodetail targets ($md-*-$ma-*) as
# eight shape keys with authored default weights. BodyMesh ramps every
# non-finding morph to 0 each frame (BodyMesh.tsx), so students only ever saw
# the androgynous MakeHuman basis — male and female cases rendered the same
# neutral body. The female was fixed by baking her macro weights into the basis;
# this does the same for the male so the shipped geometry reads as male.
#
# Unlike the female pass this needs NO eye repaint: patient.glb already carries
# real eye meshes + the correctly-sized red socket ovals (it is the reference
# the female eye rule was copied from) and AO-baked skin. So this is step 1
# only — bake macros into the basis, preserve the three clinical morph deltas
# (breathe_chest_rise / finding_jvd / finding_abdo_distension), delete the
# macro keys — then re-export WITH Draco (no stage-2 pass follows).
#
# Run: /Applications/Blender.app/Contents/MacOS/Blender --background \
#        --python scripts/blender-mpfb-male-bake.py -- <in.glb> <out.glb>
# Then: node scripts/verify-glb.cjs <out.glb> --expect-eyes
import sys

import bpy
import numpy as np

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SRC = argv[0] if len(argv) > 0 else "public/models/patient.glb"
DST = argv[1] if len(argv) > 1 else "/tmp/patient-male-baked.glb"

CLINICAL = {"breathe_chest_rise", "finding_abdo_distension", "finding_jvd"}

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
if not macro:
    raise RuntimeError("no $md macro keys — nothing to bake (already baked?)")
if len(clinical) != 3:
    raise RuntimeError(f"expected 3 clinical morphs, found {[k.name for k in clinical]}")
print("macro keys (authored weight):")
for kb in macro:
    print(f"  {kb.name} = {kb.value:.4f}")


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

bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(
    filepath=DST,
    export_format="GLB",
    export_yup=True,
    export_morph=True,
    export_morph_normal=True,
    export_draco_mesh_compression_enable=True,
    export_image_format="AUTO",
)
print(f"exported {DST}")
