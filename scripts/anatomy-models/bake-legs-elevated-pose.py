"""Bake a seated ``pose_legs_elevated`` morph from the fitted Mixamo rig.

Sitting with legs elevated is not a recumbent dump and not a floor-foot seat.
The pelvis stays on the chair; the knees extend so the calves rest on a
footstool / ottoman in front of the seat, soles off the floor.

The bake is the same IK + linear-blend skinning pass as
``refine-tripod-pose.py``, with ankle targets moved forward and raised.
Skin weights, remaining morphs, eyes and animation actions are preserved.

Run with Blender, not system Python::

    Blender --background --python scripts/anatomy-models/bake-legs-elevated-pose.py -- \\
      public/models/patient-female.glb /tmp/patient-female-legs-elevated.glb
"""

from __future__ import annotations

import math
import os
import sys

import bpy


argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
if len(argv) != 2:
    raise SystemExit("usage: bake-legs-elevated-pose.py <input.glb> <output.glb>")

INPUT_GLB = os.path.abspath(argv[0])
OUTPUT_GLB = os.path.abspath(argv[1])

MORPH_NAME = "pose_legs_elevated"


def largest_mesh():
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("GLB has no mesh objects")
    return max(meshes, key=lambda obj: len(obj.data.vertices))


def bake_rigged_elevated_legs(body, basis, target_key, hip_z, knee_z, knee_blend, height, min_z):
    """IK-skin the lower limbs into a seated, calves-raised plant."""
    armature_modifier = next(
        (modifier for modifier in body.modifiers if modifier.type == "ARMATURE" and modifier.object),
        None,
    )
    if armature_modifier is None:
        raise RuntimeError("patient body is missing its armature modifier")
    armature = armature_modifier.object

    animation_data = armature.animation_data
    previous_action = animation_data.action if animation_data else None
    previous_action_slot = (
        animation_data.action_slot
        if animation_data and animation_data.action is not None
        else None
    )
    previous_pose = {
        pose_bone.name: pose_bone.matrix_basis.copy()
        for pose_bone in armature.pose.bones
    }
    if animation_data:
        animation_data.action = None
    for pose_bone in armature.pose.bones:
        pose_bone.matrix_basis.identity()
    bpy.context.view_layer.update()

    leg_group_names = {
        "mixamorig:LeftUpLeg", "mixamorig:LeftLeg", "mixamorig:LeftFoot", "mixamorig:LeftToeBase",
        "mixamorig:RightUpLeg", "mixamorig:RightLeg", "mixamorig:RightFoot", "mixamorig:RightToeBase",
    }
    leg_group_indices = {
        group.index for group in body.vertex_groups if group.name in leg_group_names
    }
    if len(leg_group_indices) < 8:
        raise RuntimeError("patient body is missing complete fitted leg weights")

    created_objects = []
    created_constraints = []

    def make_target(name, position):
        target = bpy.data.objects.new(name, None)
        target.empty_display_type = "PLAIN_AXES"
        target.location = position
        bpy.context.scene.collection.objects.link(target)
        created_objects.append(target)
        return target

    patient_scale = height / 1.8
    # Elevated soles rest on an ottoman, so keep more of the bind-space foot
    # orientation than a hanging shin would need. Still blend a little plantar
    # flexion so the ankle joint does not pancake.
    foot_plant_strength = 0.58 + 0.12 * min(
        1.0,
        max(0.0, (height - 0.65) / 1.05),
    )

    planted_feet = []

    def add_leg_ik(side, x):
        lower_leg = armature.pose.bones.get(f"mixamorig:{side}Leg")
        foot = armature.pose.bones.get(f"mixamorig:{side}Foot")
        if lower_leg is None:
            raise RuntimeError(f"patient rig is missing mixamorig:{side}Leg")
        if foot is None:
            raise RuntimeError(f"patient rig is missing mixamorig:{side}Foot")
        constraint = lower_leg.constraints.new("IK")
        constraint.name = f"Paramedic elevated {side} leg"
        # Seated hanging ankles live near y=-0.34, z=min+0.42*scale. Push them
        # further forward onto a footstool and raise them to ottoman height so
        # the calves clear the floor without dumping the pelvis recumbent.
        constraint.target = make_target(
            f"elevated-{side.lower()}-ankle",
            (
                x * patient_scale,
                -0.92 * patient_scale,
                min_z + 0.70 * patient_scale,
            ),
        )
        constraint.pole_target = make_target(
            f"elevated-{side.lower()}-knee",
            (
                x * patient_scale,
                -1.55 * patient_scale,
                min_z + 0.66 * patient_scale,
            ),
        )
        constraint.chain_count = 2
        constraint.pole_angle = math.pi / 2
        created_constraints.append((lower_leg, constraint))
        planted_feet.append(foot)

    previous_values = {key.name: key.value for key in body.data.shape_keys.key_blocks}
    for key in body.data.shape_keys.key_blocks:
        key.value = 0.0

    add_leg_ik("Left", 0.125)
    add_leg_ik("Right", -0.125)
    bpy.context.view_layer.update()

    for foot in planted_feet:
        ankle_position = foot.matrix.translation.copy()
        planted_rotation = foot.matrix.to_quaternion().slerp(
            foot.bone.matrix_local.to_quaternion(),
            foot_plant_strength,
        )
        planted_matrix = planted_rotation.to_matrix().to_4x4()
        planted_matrix.translation = ankle_position
        foot.matrix = planted_matrix
    bpy.context.view_layer.update()

    depsgraph = bpy.context.evaluated_depsgraph_get()
    evaluated_body = body.evaluated_get(depsgraph)
    evaluated_mesh = evaluated_body.to_mesh(preserve_all_data_layers=True, depsgraph=depsgraph)
    if len(evaluated_mesh.vertices) != len(body.data.vertices):
        evaluated_body.to_mesh_clear()
        raise RuntimeError("evaluated patient topology changed during elevated-leg bake")

    changed = 0
    max_forward = 0.0
    max_knee_lift = float("-inf")
    min_sole_z = float("inf")
    for index, vertex in enumerate(body.data.vertices):
        leg_weight = min(1.0, sum(
            membership.weight
            for membership in vertex.groups
            if membership.group in leg_group_indices
        ))
        if leg_weight <= 0.0001:
            continue
        source = basis.data[index].co
        skinned = evaluated_mesh.vertices[index].co
        authored = target_key.data[index].co
        authored.x = skinned.x
        authored.y = skinned.y
        authored.z = skinned.z
        changed += 1
        max_forward = max(max_forward, source.y - authored.y)
        if abs(source.z - knee_z) <= knee_blend:
            max_knee_lift = max(max_knee_lift, authored.z - source.z)
        if source.z <= min_z + height * 0.08:
            min_sole_z = min(min_sole_z, authored.z)

    evaluated_body.to_mesh_clear()
    for pose_bone, constraint in created_constraints:
        pose_bone.constraints.remove(constraint)
    for target in created_objects:
        bpy.data.objects.remove(target, do_unlink=True)
    for key in body.data.shape_keys.key_blocks:
        key.value = previous_values[key.name]
    for pose_bone in armature.pose.bones:
        pose_bone.matrix_basis = previous_pose[pose_bone.name]
    if animation_data and previous_action is not None:
        animation_data.action = previous_action
        if previous_action_slot is not None:
            animation_data.action_slot = previous_action_slot
    bpy.context.view_layer.update()

    return changed, max_forward, max_knee_lift, min_sole_z


def limit_pelvic_edge_strain(body, basis, target_key, hip_z, height):
    """Keep the medial hip topology continuous after deep seated flexion."""
    central_x = height * 0.09
    lower_z = hip_z - height * 0.22
    upper_z = hip_z + height * 0.10
    constraints = []
    for edge in body.data.edges:
        first_index, second_index = edge.vertices
        first_rest = basis.data[first_index].co
        second_rest = basis.data[second_index].co
        midpoint_z = (first_rest.z + second_rest.z) * 0.5
        if not lower_z <= midpoint_z <= upper_z:
            continue
        if max(abs(first_rest.x), abs(second_rest.x)) > central_x:
            continue
        rest_length = (second_rest - first_rest).length
        if rest_length <= 1e-7:
            continue
        constraints.append((first_index, second_index, rest_length))

    if not constraints:
        return 0, 1.0, 1.0

    before_ratio = max(
        (
            (target_key.data[second].co - target_key.data[first].co).length
            / rest_length
        )
        for first, second, rest_length in constraints
    )
    corrected = set()
    max_stretch = 1.8
    for _ in range(320):
        for first, second, rest_length in constraints:
            first_point = target_key.data[first].co
            second_point = target_key.data[second].co
            delta = second_point - first_point
            current_length = delta.length
            allowed_length = rest_length * max_stretch
            if current_length <= allowed_length or current_length <= 1e-8:
                continue
            correction = delta * ((current_length - allowed_length) / current_length * 0.5)
            first_point += correction
            second_point -= correction
            corrected.add(first)
            corrected.add(second)

    after_ratio = max(
        (
            (target_key.data[second].co - target_key.data[first].co).length
            / rest_length
        )
        for first, second, rest_length in constraints
    )
    return len(corrected), before_ratio, after_ratio


def seated_sole_z(body, basis, seated_key, height, min_z):
    if seated_key is None:
        return min_z
    sole_z = float("inf")
    for index, point in enumerate(basis.data):
        if point.co.z <= min_z + height * 0.08:
            sole_z = min(sole_z, seated_key.data[index].co.z)
    return sole_z if math.isfinite(sole_z) else min_z


def bake_legs_elevated(body) -> tuple[int, float, float, float]:
    shape_keys = body.data.shape_keys
    if not shape_keys:
        raise RuntimeError("patient body has no shape keys")
    basis = shape_keys.key_blocks.get("Basis")
    if basis is None:
        raise RuntimeError("patient body is missing Basis")

    min_z = min(point.co.z for point in basis.data)
    max_z = max(point.co.z for point in basis.data)
    height = max_z - min_z
    if height < 0.45:
        raise RuntimeError(f"unexpected patient height: {height:.3f}m")

    elevated = shape_keys.key_blocks.get(MORPH_NAME)
    if elevated is None:
        elevated = body.shape_key_add(name=MORPH_NAME, from_mix=False)
    elevated.value = 0.0

    for index, basis_point in enumerate(basis.data):
        elevated.data[index].co = basis_point.co

    hip_z = min_z + height * 0.51
    knee_z = min_z + height * 0.29
    knee_blend = height * 0.045

    changed, max_forward, min_knee_lift, elevated_sole_z = bake_rigged_elevated_legs(
        body, basis, elevated, hip_z, knee_z, knee_blend, height, min_z,
    )
    corrected, strain_before, strain_after = limit_pelvic_edge_strain(
        body, basis, elevated, hip_z, height,
    )

    seated = shape_keys.key_blocks.get("pose_seated")
    seated_soles = seated_sole_z(body, basis, seated, height, min_z)
    sole_lift = elevated_sole_z - seated_soles

    body["paramedic_legs_elevated_revision"] = 1

    if changed < 2500:
        raise RuntimeError(f"elevated-leg mask captured too few vertices: {changed}")
    if max_forward < height * 0.18:
        raise RuntimeError(f"elevated thigh/shin reach is too small: {max_forward:.3f}m")
    if not math.isfinite(min_knee_lift) or min_knee_lift < height * 0.05:
        raise RuntimeError(f"elevated knee lift is too small: {min_knee_lift:.3f}m")
    if not math.isfinite(elevated_sole_z) or sole_lift < height * 0.10:
        raise RuntimeError(
            "elevated soles are not raised above the seated plant: "
            f"seated={seated_soles:.3f}m elevated={elevated_sole_z:.3f}m lift={sole_lift:.3f}m"
        )
    # Elevated calves reach further than a hanging seat, so the perineal
    # constraint graph is smaller. A healthy after-ratio is the gate; the
    # seated-hanging 20-vertex floor would reject a valid plant.
    if strain_after > 2.25:
        raise RuntimeError(
            "elevated pelvis strain correction failed: "
            f"vertices={corrected} before={strain_before:.2f} after={strain_after:.2f}"
        )
    return changed, max_forward, min_knee_lift, sole_lift


def export_scene():
    bpy.ops.object.select_all(action="SELECT")
    os.makedirs(os.path.dirname(OUTPUT_GLB) or ".", exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_GLB,
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=False,
        export_skins=True,
        export_morph=True,
        export_morph_normal=True,
        export_animations=True,
        export_animation_mode="ACTIONS",
        export_cameras=False,
        export_lights=False,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_image_format="AUTO",
    )


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=INPUT_GLB)
    body = largest_mesh()
    changed, max_forward, knee_lift, sole_lift = bake_legs_elevated(body)
    export_scene()
    actions = sorted(action.name for action in bpy.data.actions)
    print(
        "[bake-legs-elevated] "
        f"exported={OUTPUT_GLB} vertices={changed} "
        f"forward={max_forward:.3f}m knee_lift={knee_lift:.3f}m "
        f"sole_lift={sole_lift:.3f}m actions={','.join(actions)}"
    )


main()
