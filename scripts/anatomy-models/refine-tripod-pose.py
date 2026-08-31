"""Refine the clinical ``pose_tripod`` morph into a true seated posture.

The original morph brought the arms forward and flexed the torso, but left
the legs straight. In the treatment bay that read as a standing patient even
though the runtime correctly selected ``tripod``. This pass preserves the
authored upper-body distress pose and rebuilds only the lower-limb component:

* thighs flex forward from the hips;
* knees stay together at seat height;
* lower legs hang vertically below the knees;
* feet remain aligned beneath the knees with the soles planted;
* the runtime fitted spine and arm bones supply the forward respiratory lean
  and relaxed arms without tearing the shoulder sockets.

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


def bake_rigged_seated_legs(body, basis, target_key, hip_z, knee_z, knee_blend, height, min_z):
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

    # glTF import may leave whichever action Blender visited last evaluated on
    # the armature. Baking IK on top of that hidden walk/gesture frame shifts
    # one hip and twists the opposite knee, even though the exported morph is
    # meant to be a symmetric neutral seat. Temporarily force the fitted rig
    # to its rest basis, then restore the imported animation state afterwards.
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
    # Small paediatric ankles carry fewer edge rings and proportionally larger
    # feet, so the full adult counter-rotation over-stretches their sparse skin
    # weights. Scale the correction continuously by fitted body height: enough
    # to unpoint an infant's toes, reaching a flat adult foot at 1.7 m.
    foot_plant_strength = 0.45 + 0.15 * min(
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
        constraint.name = f"Paramedic tripod {side} leg"
        # The treatment-bay tripod root is lowered to seat the pelvis on the
        # bench. Raising the local ankle/toe here keeps the soles on the room
        # floor under that calibrated root instead of burying them below it.
        constraint.target = make_target(
            f"tripod-{side.lower()}-ankle",
            (x * patient_scale, -0.34 * patient_scale, min_z + 0.42 * patient_scale),
        )
        constraint.pole_target = make_target(
            f"tripod-{side.lower()}-knee",
            (x * patient_scale, -1.0 * patient_scale, min_z + 0.68 * patient_scale),
        )
        constraint.chain_count = 2
        # Keep both fitted knees in the sagittal plane. The former pi-radian
        # pole angle drove one shin through the midline and splayed the other
        # laterally; a quarter turn makes both lower legs hang vertically.
        constraint.pole_angle = math.pi / 2
        created_constraints.append((lower_leg, constraint))
        planted_feet.append(foot)

    # Shape keys must be neutral while the evaluated armature result is read.
    previous_values = {key.name: key.value for key in body.data.shape_keys.key_blocks}
    for key in body.data.shape_keys.key_blocks:
        key.value = 0.0

    # A little space between the ankles prevents the feet and medial calves
    # intersecting in the three-quarter treatment-bay camera.
    add_leg_ik("Left", 0.125)
    add_leg_ik("Right", -0.125)
    bpy.context.view_layer.update()

    # The two-bone IK correctly seats the hips and hangs each lower leg, but a
    # foot left at identity inherits the shin's near-vertical rotation. That is
    # why seated patients appeared to balance on pointed toes. Keep the solved
    # ankle position and restore each foot's bind-space world orientation so
    # its sole remains parallel to the floor; the toe child then follows the
    # planted foot without a second counter-rotation.
    for foot in planted_feet:
        ankle_position = foot.matrix.translation.copy()
        # Blend rather than snapping all the way to the rest orientation. The
        # fitted ankle weights need a little plantar flexion to preserve joint
        # volume at a ninety-degree knee bend, while the majority correction is
        # enough to remove the pointed-toe silhouette.
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
        authored = target_key.data[index].co
        # The evaluated armature result already blends every hip/leg bone by
        # the vertex's normalised skin weights. Multiplying its displacement by
        # `leg_weight` a second time under-bent the pelvis boundary and folded
        # the groin triangles inward, which looked like a split body. Copy the
        # skinned coordinate directly so the fitted rig remains continuous.
        authored.x = skinned.x
        authored.y = skinned.y
        authored.z = skinned.z
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
    for pose_bone in armature.pose.bones:
        pose_bone.matrix_basis = previous_pose[pose_bone.name]
    if animation_data and previous_action is not None:
        animation_data.action = previous_action
        if previous_action_slot is not None:
            animation_data.action_slot = previous_action_slot
    bpy.context.view_layer.update()

    return changed, max_forward, max_knee_lift


def limit_pelvic_edge_strain(body, basis, target_key, hip_z, height):
    """Keep the medial hip topology continuous after deep seated flexion.

    MPFB's stock weights make several tiny perineal edges almost entirely left
    or right upper-leg weighted. At a deep hip angle the two sides can move a
    quarter metre apart even though the rest edge is only millimetres long.
    This position-based strain limiter acts as a seated corrective shape: it
    preserves the rigged silhouette but stops those connected triangles from
    turning inside out or exposing the room through the pelvis.
    """
    central_x = height * 0.09
    # Infants carry their perineal seam proportionally lower than the adult
    # 51%-height landmark used above. Include the lower medial-groin patch so
    # paediatric left/right upper-leg weights cannot pull it apart.
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

    before_ratio = max(
        (
            (target_key.data[second].co - target_key.data[first].co).length
            / rest_length
        )
        for first, second, rest_length in constraints
    )
    corrected = set()
    max_stretch = 1.8
    # Gauss-Seidel distance constraints converge quickly on this small pelvic
    # patch and preserve the authored boundary better than broad mesh smoothing.
    # The mirrored left-leg solve exposes more of the small paediatric groin
    # seam to this constraint graph. Give the densest child/toddler meshes
    # enough passes to converge instead of exporting a locally stretched hip.
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
    if height < 0.45:
        raise RuntimeError(f"unexpected patient height: {height:.3f}m")

    seated = shape_keys.key_blocks.get("pose_seated")
    if seated is None:
        seated = body.shape_key_add(name="pose_seated", from_mix=False)
    seated.value = 0.0

    # Older assets carry a discontinuous analytic arm/leg key. Start from the
    # continuous Basis every run, then let fitted-rig skinning author the legs.
    # This makes the pass idempotent and removes the abdominal/elbow/knee tears
    # visible when the old key reached full influence.
    for index, basis_point in enumerate(basis.data):
        tripod.data[index].co = basis_point.co
        seated.data[index].co = basis_point.co

    # Normalised anatomical landmarks. Blender imports the glTF as Z-up.
    hip_z = min_z + height * 0.51
    knee_z = min_z + height * 0.29
    knee_blend = height * 0.045

    # The fitted rig is authoritative for the legs; vertex-space analytic
    # rotations are intentionally absent because their hard region masks were
    # the source of the visible pelvis/knee seams.
    changed, max_forward, min_knee_lift = bake_rigged_seated_legs(
        body, basis, tripod, hip_z, knee_z, knee_blend, height, min_z,
    )

    corrected, strain_before, strain_after = limit_pelvic_edge_strain(
        body, basis, tripod, hip_z, height,
    )

    # Neutral seated and respiratory tripod share the same anatomically skinned
    # mesh pose. BodyMesh adds the respiratory forward lean through the fitted
    # Spine/Spine1 bones at runtime; doing that as a vertex-only morph separated
    # the shoulder sockets when the upper-arm rest pose was applied.
    for index in range(len(basis.data)):
        seated.data[index].co = tripod.data[index].co

    body["paramedic_tripod_arm_revision"] = 2
    body["paramedic_tripod_torso_revision"] = 4
    body["paramedic_seated_pelvis_revision"] = 2
    body["paramedic_seated_foot_revision"] = 1
    body["paramedic_seated_leg_revision"] = 1

    if changed < 2500:
        raise RuntimeError(f"tripod leg mask captured too few vertices: {changed}")
    if max_forward < height * 0.16:
        raise RuntimeError(f"tripod thigh flex is too small: {max_forward:.3f}m")
    if not math.isfinite(min_knee_lift) or min_knee_lift < height * 0.08:
        raise RuntimeError(f"tripod knee lift is too small: {min_knee_lift:.3f}m")
    if corrected < 20 or strain_after > 2.25:
        raise RuntimeError(
            "seated pelvis strain correction failed: "
            f"vertices={corrected} before={strain_before:.2f} after={strain_after:.2f}"
        )
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
