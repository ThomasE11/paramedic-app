"""Generate an age-specific MPFB patient using a shipped patient's skin.

Run with Blender::

    Blender --background --python generate-mpfb-age-patient.py -- \
      female 0.0 public/models/patient-female.glb /tmp/patient-infant-female-raw.glb

The age macro uses MPFB's 0..1 continuum (0 infant, ~0.1 toddler, ~0.2
school-age child, ~0.42 adolescent, 0.55 adult). Reusing a shipped CC0 skin
keeps the UV/material pipeline deterministic and offline.
"""

from __future__ import annotations

import bmesh
import bpy
import importlib
import os
import sys

import numpy as np


argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
if len(argv) != 4:
    raise SystemExit(
        "usage: generate-mpfb-age-patient.py "
        "<male|female> <age-macro> <skin-source.glb> <output.glb>"
    )

SEX, AGE_RAW, SKIN_SOURCE, OUTPUT_GLB = argv
SEX = SEX.lower()
AGE = float(AGE_RAW)
if SEX not in {"male", "female"}:
    raise SystemExit("sex must be 'male' or 'female'")
if not 0 <= AGE <= 1:
    raise SystemExit("age macro must be between 0 and 1")

SKIN_SOURCE = os.path.abspath(SKIN_SOURCE)
OUTPUT_GLB = os.path.abspath(OUTPUT_GLB)


def import_glb(path: str):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    return [obj for obj in bpy.data.objects if obj not in before]


def largest_mesh(objects):
    meshes = [obj for obj in objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("skin source has no mesh")
    return max(meshes, key=lambda obj: len(obj.data.vertices))


def strip_helpers(human):
    mask = next((modifier for modifier in human.modifiers if modifier.type == "MASK"), None)
    body_group = human.vertex_groups.get(mask.vertex_group) if mask else human.vertex_groups.get("body")
    if body_group is None:
        raise RuntimeError("MPFB basemesh has no body vertex group")
    keep = {
        vertex.index
        for vertex in human.data.vertices
        if any(group.group == body_group.index for group in vertex.groups)
    }
    if mask:
        human.modifiers.remove(mask)

    bpy.ops.object.select_all(action="DESELECT")
    human.select_set(True)
    bpy.context.view_layer.objects.active = human
    bpy.ops.object.mode_set(mode="EDIT")
    editable = bmesh.from_edit_mesh(human.data)
    editable.verts.ensure_lookup_table()
    bmesh.ops.delete(
        editable,
        geom=[vertex for vertex in editable.verts if vertex.index not in keep],
        context="VERTS",
    )
    bmesh.update_edit_mesh(human.data)
    bpy.ops.object.mode_set(mode="OBJECT")


def bake_macro_shape(human):
    shape_keys = human.data.shape_keys
    if not shape_keys:
        raise RuntimeError("MPFB basemesh has no macro shape keys")
    basis_key = shape_keys.key_blocks.get("Basis")
    if basis_key is None:
        raise RuntimeError("MPFB basemesh has no Basis shape key")
    count = len(human.data.vertices)

    def coordinates(key):
        values = np.empty(count * 3, dtype=np.float32)
        key.data.foreach_get("co", values)
        return values

    basis = coordinates(basis_key)
    baked = basis.copy()
    macro_keys = [key for key in shape_keys.key_blocks if key.name != "Basis"]
    for key in macro_keys:
        if key.value:
            baked += key.value * (coordinates(key) - basis)
    basis_key.data.foreach_set("co", baked)
    human.data.vertices.foreach_set("co", baked)
    for key in macro_keys:
        human.shape_key_remove(key)
    human.data.update()


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.preferences.addon_enable(module="bl_ext.blender_org.mpfb")
human_service = importlib.import_module(
    "bl_ext.blender_org.mpfb.services.humanservice"
).HumanService
target_service = importlib.import_module(
    "bl_ext.blender_org.mpfb.services.targetservice"
).TargetService

macro = target_service.get_default_macro_info_dict()
macro["gender"] = 1.0 if SEX == "male" else 0.0
macro["age"] = AGE
macro["height"] = 0.5
macro["muscle"] = 0.38 if AGE < 0.45 else 0.48
macro["weight"] = 0.48
macro["proportions"] = 0.5

human = human_service.create_human(
    mask_helpers=True,
    detailed_helpers=False,
    extra_vertex_groups=True,
    feet_on_ground=True,
    scale=0.1,
    macro_detail_dict=macro,
)
strip_helpers(human)
bake_macro_shape(human)

source_objects = import_glb(SKIN_SOURCE)
source_body = largest_mesh(source_objects)
if not source_body.data.materials or source_body.data.materials[0] is None:
    raise RuntimeError("skin source body has no material")
skin_material = source_body.data.materials[0].copy()
skin_material.name = f"patient_{SEX}_age_{AGE:.2f}_skin"
human.data.materials.clear()
human.data.materials.append(skin_material)

for obj in source_objects:
    if obj.name in bpy.data.objects:
        bpy.data.objects.remove(obj, do_unlink=True)

human.name = "Patient"
human.data.name = "Patient"
bpy.ops.object.select_all(action="DESELECT")
human.select_set(True)
bpy.context.view_layer.objects.active = human
os.makedirs(os.path.dirname(OUTPUT_GLB), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=OUTPUT_GLB,
    export_format="GLB",
    use_selection=True,
    export_yup=True,
    export_apply=False,
    export_image_format="AUTO",
)
print(
    f"[age-patient] exported {OUTPUT_GLB} sex={SEX} age={AGE:.2f} "
    f"verts={len(human.data.vertices)} height={human.dimensions.z:.3f}m"
)
