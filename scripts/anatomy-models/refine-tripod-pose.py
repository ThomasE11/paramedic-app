"""Refine the clinical ``pose_tripod`` morph into a true seated posture.

The original morph brought the arms forward and flexed the torso, but left
the legs straight. In the treatment bay that read as a standing patient even
though the runtime correctly selected ``tripod``. This pass preserves the
authored upper-body distress pose and rebuilds only the lower-limb component:

* thighs flex forward from the hips;
* knees stay together at seat height;
* lower legs hang vertically below the knees;
* feet remain aligned beneath the knees;
* the already-authored forearms settle back onto the raised knees instead of
  hanging in front of them;
* the trunk visibly hinges forward from the hips so the silhouette reads as
  respiratory tripod bracing rather than an upright seated mannequin.

The lower limbs are idempotent because every coordinate is recomputed from
``Basis`` rather than from the previous tripod key. The small forearm contact
correction is version-tagged on the mesh and applied once. Skin weights, the
remaining clinical morphs, eye hierarchy and animation actions are preserved.

Run with Blender, not system Python::

    Blender --background --python scripts/anatomy-models/refine-tripod-pose.py -- \
      public/models/patient-male.glb /tmp/patient-male-tripod.glb
"""

from __future__ import annotations

import math
import os
import sys

import bpy


argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
if len(argv) != 2:
    raise SystemExit("usage: refine-tripod-pose.py <input.glb> <output.glb>")

INPUT_GLB = os.path.abspath(argv[0])
OUTPUT_GLB = os.path.abspath(argv[1])


def largest_mesh():
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("GLB has no mesh objects")
    return max(meshes, key=lambda obj: len(obj.data.vertices))


def smoothstep(edge0: float, edge1: float, value: float) -> float:
    if edge0 == edge1:
        return 1.0 if value >= edge1 else 0.0
    t = max(0.0, min(1.0, (value - edge0) / (edge1 - edge0)))
    return t * t * (3.0 - 2.0 * t)


def bake_rigged_seated_legs(body, basis, tripod, hip_z, knee_z, knee_blend):
    """Replace the analytic leg bend with the fitted armature's deformation.

    The earlier coordinate-only pass moved each lower-limb vertex in isolation.
    It produced the right gross silhouette but stretched calves and feet at the
    knee blend. The shipped patient now has a complete Mixamo-weighted rig, so
    let Blender's IK + linear-blend skinning preserve volume and joint shape.
    """
    armature_modifier = next(
        (modifier for modifier in body.modifiers if modifier.type == "ARMATURE" and modifier.object),
        None,
    )
    if armature_modifier is None:
        raise RuntimeError("patient body is missing its armature modifier")
    armature = armature_modifier.object

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

    def add_leg_ik(side, x):
        lower_leg = armature.pose.bones.get(f"mixamorig:{side}Leg")
        if lower_leg is None:
            raise RuntimeError(f"patient rig is missing mixamorig:{side}Leg")
        constraint = lower_leg.constraints.new("IK")
        constraint.name = f"Paramedic tripod {side} leg"
        # The treatment-bay tripod root is lowered to seat the pelvis on the
        # bench. Raising the local ankle/toe here keeps the soles on the room
        # floor under that calibrated root instead of burying them below it.
        constraint.target = make_target(f"tripod-{side.lower()}-ankle", (x, -0.34, 0.42))
        constraint.pole_target = make_target(f"tripod-{side.lower()}-knee", (x, -1.0, 0.68))
        constraint.chain_count = 2
        constraint.pole_angle = math.pi
        created_constraints.append((lower_leg, constraint))

    # Shape keys must be neutral while the evaluated armature result is read.
    previous_values = {key.name: key.value for key in body.data.shape_keys.key_blocks}
    for key in body.data.shape_keys.key_blocks:
        key.value = 0.0

    add_leg_ik("Left", 0.105)
    add_leg_ik("Right", -0.105)
    bpy.context.view_layer.update()

    depsgraph = bpy.context.evaluated_depsgraph_get()
    evaluated_body = body.evaluated_get(depsgraph)
    evaluated_mesh = evaluated_body.to_mesh(preserve_all_data_layers=True, depsgraph=depsgraph)
    if len(evaluated_mesh.vertices) != len(body.data.vertices):
        evaluated_body.to_mesh_clear()
        raise RuntimeError("evaluated patient topology changed during tripod leg bake")

    changed = 0
    max_forward = 0.0
    max_knee_lift = float("-inf")
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
        authored = tripod.data[index].co
        authored.x = source.x + (skinned.x - source.x) * leg_weight
        authored.y = source.y + (skinned.y - source.y) * leg_weight
        authored.z = source.z + (skinned.z - source.z) * leg_weight
        changed += 1
        max_forward = max(max_forward, source.y - authored.y)
        if abs(source.z - knee_z) <= knee_blend:
            max_knee_lift = max(max_knee_lift, authored.z - source.z)

    evaluated_body.to_mesh_clear()
    for pose_bone, constraint in created_constraints:
        pose_bone.constraints.remove(constraint)
    for target in created_objects:
        bpy.data.objects.remove(target, do_unlink=True)
    for key in body.data.shape_keys.key_blocks:
        key.value = previous_values[key.name]
    bpy.context.view_layer.update()

    return changed, max_forward, max_knee_lift


def refine_tripod(body) -> tuple[int, float, float]:
    shape_keys = body.data.shape_keys
    if not shape_keys:
        raise RuntimeError("patient body has no shape keys")
    basis = shape_keys.key_blocks.get("Basis")
    tripod = shape_keys.key_blocks.get("pose_tripod")
    if basis is None or tripod is None:
        raise RuntimeError("patient body is missing Basis or pose_tripod")

    min_z = min(point.co.z for point in basis.data)
    max_z = max(point.co.z for point in basis.data)
    height = max_z - min_z
    if height < 1.4:
        raise RuntimeError(f"unexpected patient height: {height:.3f}m")

    # Normalised anatomical landmarks. Blender imports the glTF as Z-up.
    hip_z = min_z + height * 0.51
    knee_z = min_z + height * 0.29
    ankle_z = min_z + height * 0.075
    leg_half_width = height * 0.145
    pelvis_blend = height * 0.055
    knee_blend = height * 0.045
    flex = math.radians(-73.0)
    cos_flex = math.cos(flex)
    sin_flex = math.sin(flex)

    # Where a neutral knee centre lands after hip flexion. Lower legs keep
    # their vertical orientation and translate to this point so the patient
    # sits naturally rather than folding into a crouch.
    neutral_knee_y = -sin_flex * (knee_z - hip_z)
    neutral_knee_z = hip_z + cos_flex * (knee_z - hip_z)
    knee_delta_y = neutral_knee_y
    knee_delta_z = neutral_knee_z - knee_z

    changed = 0
    max_forward = 0.0
    min_knee_lift = float("inf")

    for index, basis_point in enumerate(basis.data):
        source = basis_point.co
        # Restrict the rebuild to both legs. Hands are below hip height too,
        # but sit laterally outside this mask and keep the authored braced-arm
        # component already present in the morph.
        lateral = 1.0 - smoothstep(leg_half_width * 0.82, leg_half_width, abs(source.x))
        vertical = 1.0 - smoothstep(hip_z - pelvis_blend, hip_z + pelvis_blend, source.z)
        leg_weight = lateral * vertical
        if leg_weight <= 0.0001 or source.z > hip_z + pelvis_blend:
            continue

        if source.z >= knee_z + knee_blend:
            # Rigid thigh rotation around the hip in the depth/height plane.
            rel_y = source.y
            rel_z = source.z - hip_z
            target_y = cos_flex * rel_y - sin_flex * rel_z
            target_z = hip_z + sin_flex * rel_y + cos_flex * rel_z
        elif source.z <= knee_z - knee_blend:
            # Hanging lower leg: preserve its vertical anatomy and translate
            # it below the flexed knee. Slight ankle taper keeps feet planted
            # beneath, rather than in front of, the shin.
            ankle_taper = smoothstep(min_z, ankle_z, source.z)
            target_y = source.y + knee_delta_y * (0.72 + 0.28 * ankle_taper)
            target_z = source.z + knee_delta_z
        else:
            # Smooth the joint between the rotated thigh and translated shin.
            joint = smoothstep(knee_z - knee_blend, knee_z + knee_blend, source.z)
            rel_y = source.y
            rel_z = source.z - hip_z
            thigh_y = cos_flex * rel_y - sin_flex * rel_z
            thigh_z = hip_z + sin_flex * rel_y + cos_flex * rel_z
            shin_y = source.y + knee_delta_y
            shin_z = source.z + knee_delta_z
            target_y = shin_y + (thigh_y - shin_y) * joint
            target_z = shin_z + (thigh_z - shin_z) * joint

        authored = tripod.data[index].co
        authored.x = source.x
        authored.y = source.y + (target_y - source.y) * leg_weight
        authored.z = source.z + (target_z - source.z) * leg_weight
        changed += 1
        max_forward = max(max_forward, source.y - authored.y)
        if abs(source.z - knee_z) <= knee_blend:
            min_knee_lift = min(min_knee_lift, authored.z - source.z)

    # The fitted rig is now authoritative for the legs. This deliberately
    # overwrites the analytic coordinates above while preserving the authored
    # torso and arm component of the same morph target.
    changed, max_forward, min_knee_lift = bake_rigged_seated_legs(
        body, basis, tripod, hip_z, knee_z, knee_blend,
    )

    # The earlier upper-body morph correctly brought both arms forward, but
    # overshot the knees by roughly 25 cm and left the fingers dangling beside
    # the thighs in the camera view. Pull the distal forearms back/up as one
    # tapered volume so the hands make contact without crushing their shape.
    # A mesh custom property survives the glTF round-trip and prevents the
    # small correction accumulating when the script is rerun.
    arm_revision = int(body.get("paramedic_tripod_arm_revision", 0))
    if arm_revision < 1:
        forearm_top = min_z + height * 0.72
        hand_level = min_z + height * 0.53
        arm_inner = height * 0.16
        arm_outer = height * 0.23
        for index, basis_point in enumerate(basis.data):
            source = basis_point.co
            if source.z < min_z + height * 0.34 or source.z > forearm_top:
                continue
            lateral = smoothstep(arm_inner, arm_outer, abs(source.x))
            distal = 1.0 - smoothstep(hand_level, forearm_top, source.z)
            weight = lateral * (0.35 + 0.65 * distal)
            if weight <= 0.0001:
                continue
            authored = tripod.data[index].co
            side = 1.0 if authored.x >= 0 else -1.0
            authored.x -= side * height * 0.018 * weight
            authored.y += height * 0.135 * weight
            authored.z += height * 0.058 * weight
        body["paramedic_tripod_arm_revision"] = 1

    # Revision 2: the original upper-body key translated the chest forward but
    # did not rotate the head/shoulder line enough to read as a true tripod in
    # the treatment-bay camera. Hinge the already-authored upper body another
    # 12 degrees around the hips. Hands below the hinge remain planted on the
    # knees while the shoulders and head travel forward, producing the braced
    # elbow/torso relationship students expect to recognise immediately.
    torso_revision = int(body.get("paramedic_tripod_torso_revision", 0))
    if torso_revision < 2:
        hinge_start = hip_z - height * 0.015
        hinge_full = hip_z + height * 0.22
        max_hinge = math.radians(12.0)
        for index, basis_point in enumerate(basis.data):
            source = basis_point.co
            hinge_weight = smoothstep(hinge_start, hinge_full, source.z)
            if hinge_weight <= 0.0001:
                continue
            authored = tripod.data[index].co
            angle = max_hinge * hinge_weight
            cos_angle = math.cos(angle)
            sin_angle = math.sin(angle)
            rel_y = authored.y
            rel_z = authored.z - hip_z
            authored.y = cos_angle * rel_y - sin_angle * rel_z
            authored.z = hip_z + sin_angle * rel_y + cos_angle * rel_z
        body["paramedic_tripod_torso_revision"] = 2

    if changed < 2500:
        raise RuntimeError(f"tripod leg mask captured too few vertices: {changed}")
    if max_forward < height * 0.16:
        raise RuntimeError(f"tripod thigh flex is too small: {max_forward:.3f}m")
    if not math.isfinite(min_knee_lift) or min_knee_lift < height * 0.08:
        raise RuntimeError(f"tripod knee lift is too small: {min_knee_lift:.3f}m")
    return changed, max_forward, min_knee_lift


def export_scene():
    bpy.ops.object.select_all(action="SELECT")
    os.makedirs(os.path.dirname(OUTPUT_GLB), exist_ok=True)
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
    changed, max_forward, knee_lift = refine_tripod(body)
    export_scene()
    actions = sorted(action.name for action in bpy.data.actions)
    print(
        "[refine-tripod] "
        f"exported={OUTPUT_GLB} vertices={changed} "
        f"forward={max_forward:.3f}m knee_lift={knee_lift:.3f}m "
        f"actions={','.join(actions)}"
    )


main()
