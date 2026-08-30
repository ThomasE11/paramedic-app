"""Verify that patient GLBs contain usable, continuous skeletal animation.

Run with Blender, not system Python::

    Blender --background --python scripts/anatomy-models/verify-patient-animation.py -- \
      public/models/patient-male.glb public/models/patient-infant-female.glb

The static mesh/morph checks cannot detect a frozen walk cycle, an adult rig
inside a paediatric body, or a stride that tears the skinned surface. This gate
samples the exported clips through Blender's evaluated dependency graph.
"""

from __future__ import annotations

import math
import os
import sys

import bpy


paths = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
if not paths:
    raise SystemExit("usage: verify-patient-animation.py <patient.glb> [...]")

EXPECTED_ACTIONS = {"idle", "walk", "agree", "headShake", "sad_pose"}
WALK_SAMPLE_FRACTIONS = (0.125, 0.375, 0.625, 0.875)
MOTION_BONES = (
    "mixamorig:LeftArm",
    "mixamorig:RightArm",
    "mixamorig:LeftUpLeg",
    "mixamorig:RightUpLeg",
    "mixamorig:LeftLeg",
    "mixamorig:RightLeg",
)


def largest_mesh():
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("GLB has no mesh objects")
    return max(meshes, key=lambda obj: len(obj.data.vertices))


def clear_import():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for action in list(bpy.data.actions):
        bpy.data.actions.remove(action)


def set_action_frame(armature, action, fraction: float):
    armature.animation_data_create()
    armature.animation_data.action = action
    start, end = action.frame_range
    bpy.context.scene.frame_set(round(start + (end - start) * fraction))
    bpy.context.view_layer.update()


def evaluated_vertices(body):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    evaluated = body.evaluated_get(depsgraph)
    mesh = evaluated.to_mesh()
    try:
        return [vertex.co.copy() for vertex in mesh.vertices]
    finally:
        evaluated.to_mesh_clear()


def edge_strain(body, rest_vertices, posed_vertices):
    maximum = 0.0
    max_extension = 0.0
    severe = 0
    for edge in body.data.edges:
        first, second = edge.vertices
        rest_length = (rest_vertices[second] - rest_vertices[first]).length
        if rest_length <= 1e-8:
            continue
        posed_length = (posed_vertices[second] - posed_vertices[first]).length
        ratio = posed_length / rest_length
        maximum = max(maximum, ratio)
        extension = posed_length - rest_length
        max_extension = max(max_extension, extension)
        # Ratio alone overreacts to sub-millimetre triangulation around joints.
        # A visible tear has both an extreme ratio and a centimetre-scale gap.
        if ratio > 3.5 and extension > 0.025:
            severe += 1
    return maximum, max_extension, severe


def bone_rotations(armature):
    rotations = {}
    for name in MOTION_BONES:
        bone = armature.pose.bones.get(name)
        if bone is None:
            raise RuntimeError(f"walk cycle is missing required bone {name}")
        rotations[name] = bone.matrix.to_quaternion().copy()
    return rotations


def maximum_rotation_delta(first, second):
    # q and -q encode the same rotation, so compare the absolute quaternion
    # dot product and keep the reported angular distance within 0..pi.
    return max(
        2 * math.acos(min(1.0, abs(first[name].dot(second[name]))))
        for name in MOTION_BONES
    )


def verify(path: str):
    clear_import()
    bpy.ops.import_scene.gltf(filepath=path)
    body = largest_mesh()
    armatures = [obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE"]
    if len(armatures) != 1:
        raise RuntimeError(f"expected one armature, found {len(armatures)}")
    armature = armatures[0]

    actions = {action.name: action for action in bpy.data.actions}
    missing = sorted(EXPECTED_ACTIONS - actions.keys())
    if missing:
        raise RuntimeError(f"missing animation clips: {', '.join(missing)}")
    for name in EXPECTED_ACTIONS - {"sad_pose"}:
        start, end = actions[name].frame_range
        if end - start < 2:
            raise RuntimeError(f"{name} has no usable duration ({start:.1f}-{end:.1f})")

    # Establish the fitted bind-pose surface before sampling the walk. This
    # makes the strain ratio independent of adult/paediatric absolute scale.
    armature.animation_data_create()
    armature.animation_data.action = None
    for bone in armature.pose.bones:
        bone.matrix_basis.identity()
    bpy.context.scene.frame_set(0)
    bpy.context.view_layer.update()
    rest_vertices = evaluated_vertices(body)

    walk = actions["walk"]
    sampled_rotations = []
    max_strain = 0.0
    max_extension = 0.0
    severe_edges = 0
    for fraction in WALK_SAMPLE_FRACTIONS:
        set_action_frame(armature, walk, fraction)
        sampled_rotations.append(bone_rotations(armature))
        strain, extension, severe = edge_strain(body, rest_vertices, evaluated_vertices(body))
        max_strain = max(max_strain, strain)
        max_extension = max(max_extension, extension)
        severe_edges = max(severe_edges, severe)

    rotation_delta = maximum_rotation_delta(sampled_rotations[1], sampled_rotations[3])
    if not math.isfinite(rotation_delta) or rotation_delta < 0.18:
        raise RuntimeError(f"walk cycle is frozen or too small: delta={rotation_delta:.3f}rad")
    if (
        not math.isfinite(max_strain)
        or not math.isfinite(max_extension)
        or max_extension > 0.075
        or severe_edges > 12
    ):
        raise RuntimeError(
            "walk cycle tears connected mesh edges: "
            f"count={severe_edges} max-ratio={max_strain:.2f} "
            f"max-extension={max_extension:.3f}m"
        )

    print(
        "[verify-patient-animation] "
        f"{os.path.basename(path)} clips={len(actions)} "
        f"walk-motion={rotation_delta:.2f}rad "
        f"walk-strain={max_strain:.2f}x/{severe_edges} "
        f"extension={max_extension:.3f}m"
    )


bpy.ops.wm.read_factory_settings(use_empty=True)
for patient_path in paths:
    verify(os.path.abspath(patient_path))
