"""
generate-mpfb-patient.py — generate a realistic patient body with MPFB
(MakeHuman-for-Blender), headless, and export a raw GLB.

    /Applications/Blender.app/Contents/MacOS/Blender --background \
        --python scripts/anatomy-models/generate-mpfb-patient.py -- \
        male /tmp/patient-male-raw.glb

Args after `--`:  <sex: male|female>  <output.glb>

Produces a clinically-proportioned human with a basic skin material, feet at
Y=0, A-pose. Morph targets (breathing / JVD / distension) are added afterwards
by add-clinical-morphs.py, then Draco-compressed.

Realism note: this is the MPFB BASE mesh + a solid skin material. Photoreal
skin (pores/SSS) needs MPFB skin asset packs; this is correct human form and
topology without textured skin — a clear step up from a game-rig mannequin
for examination, and the clean topology makes the clinical morphs deform well.
"""
import bpy, importlib, sys

argv = sys.argv[sys.argv.index("--") + 1:]
SEX = (argv[0] if argv else "male").lower()
OUT = argv[1] if len(argv) > 1 else f"/tmp/patient-{SEX}-raw.glb"

HS = importlib.import_module('bl_ext.blender_org.mpfb.services.humanservice').HumanService
TS = importlib.import_module('bl_ext.blender_org.mpfb.services.targetservice').TargetService

bpy.ops.wm.read_factory_settings(use_empty=True)

# Macro shape: push gender to the requested pole, adult age, neutral build.
macro = TS.get_default_macro_info_dict()
macro["gender"] = 1.0 if SEX == "male" else 0.0
macro["age"] = 0.55          # adult
macro["muscle"] = 0.5
macro["weight"] = 0.5
macro["height"] = 0.55 if SEX == "male" else 0.45
macro["proportions"] = 0.5
if SEX == "female":
    macro["cupsize"] = 0.5
    macro["firmness"] = 0.5

human = HS.create_human(
    mask_helpers=True,
    detailed_helpers=False,
    extra_vertex_groups=True,
    feet_on_ground=True,
    scale=0.1,
    macro_detail_dict=macro,
)
print("MPFB human created:", human.name, "verts", len(human.data.vertices))

# Ensure a skin material so it doesn't render as flat default grey. Use a
# warm clinical skin tone with slight SSS-ish roughness. (Asset-pack skins
# can replace this later for photoreal detail.)
if not human.data.materials or human.data.materials[0] is None:
    mat = bpy.data.materials.new(name="patient_skin")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.78, 0.57, 0.45, 1.0)
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = 0.62
    if human.data.materials:
        human.data.materials[0] = mat
    else:
        human.data.materials.append(mat)
    print("applied fallback skin material")
else:
    print("human already has material:", human.data.materials[0].name)

# Name the mesh deterministically so downstream scripts can find it.
human.name = "Patient"
human.data.name = "Patient"

# Export GLB (no Draco here — add-clinical-morphs.py compresses after morphs).
bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    export_yup=True,
    export_apply=True,      # apply modifiers (subsurf/mask) into the mesh
    use_selection=False,
)
print("EXPORTED", OUT)
