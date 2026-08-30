"""Rig an active Paramedic Studio patient GLB without losing clinical morphs.

The photographic MPFB patient shells are visually stronger than the legacy
Mixamo patient, but they were exported as plain meshes.  That made articulated
idle/walk behaviour impossible and left the runtime trying to imitate movement
with whole-body shape keys.

This pipeline rebuilds either active shell with MPFB's fitted Mixamo armature:

* preserve the active body geometry, UVs, materials and every shape key;
* transfer the official MPFB skin weights by stable basemesh vertex index;
* retain the Stage-2 eye hierarchy and parent each eye to the head bone;
* carry over the vetted idle/walk/gesture clips from the legacy rig;
* export only the patient, eyes and armature (no Blender camera/light/cube).

Run with Blender, not system Python::

    Blender --background --python scripts/anatomy-models/rig-patient.py -- \
      male public/models/patient-male.glb \
      public/models/patient.glb.orig /tmp/patient-male-rigged.glb

The MPFB extension must be installed in the Blender profile.  The script
refuses to export if topology, weights, morphs, clips, or the head-parented eye
contract is incomplete.
"""

from __future__ import annotations

import importlib
import os
import sys

import bpy
from mathutils.kdtree import KDTree


argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
if len(argv) not in {4, 5}:
    raise SystemExit(
        "usage: rig-patient.py <male|female> <active.glb> "
        "<animation-donor.glb> <output.glb> [age-macro]"
    )

SEX, ACTIVE_GLB, ANIMATION_DONOR_GLB, OUTPUT_GLB = argv[:4]
AGE_MACRO = float(argv[4]) if len(argv) == 5 else 0.55
SEX = SEX.lower()
if SEX not in {"male", "female"}:
    raise SystemExit("sex must be 'male' or 'female'")

ACTIVE_GLB = os.path.abspath(ACTIVE_GLB)
ANIMATION_DONOR_GLB = os.path.abspath(ANIMATION_DONOR_GLB)
OUTPUT_GLB = os.path.abspath(OUTPUT_GLB)

CLINICAL_MORPHS = {
    "breathe_chest_rise",
    "finding_abdo_distension",
    "finding_jvd",
    "viseme_open",
    "pose_tripod",
    "pose_supine",
    "pose_recovery",
    "motion_gasp",
    "motion_wince",
    "motion_clutch",
    "motion_seizure",
    "motion_tremor",
    "motion_agitation",
}
RUNTIME_CLIPS = ("idle", "walk", "agree", "headShake", "sad_pose")


def log(message: str) -> None:
    print(f"[rig-patient] {message}")


def mesh_objects(objects):
    return [obj for obj in objects if obj.type == "MESH"]


def import_glb(path: str):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    return [obj for obj in bpy.data.objects if obj not in before]


def largest_mesh(objects):
    candidates = mesh_objects(objects)
    if not candidates:
        raise RuntimeError("GLB has no mesh objects")
    return max(candidates, key=lambda obj: len(obj.data.vertices))


def clinical_morph_names(body) -> set[str]:
    if not body.data.shape_keys:
        return set()
    return {key.name for key in body.data.shape_keys.key_blocks if key.name != "Basis"}


def strip_existing_rig(body):
    """Make the pipeline safe to rerun against the currently shipped GLB."""
    world = body.matrix_world.copy()
    body.parent = None
    body.matrix_world = world
    for modifier in list(body.modifiers):
        if modifier.type == "ARMATURE":
            body.modifiers.remove(modifier)
    for group in list(body.vertex_groups):
        if group.name.startswith("mixamorig:"):
            body.vertex_groups.remove(group)
    # A previously rigged input contributes its old clips to bpy.data. Remove
    # them before importing the canonical donor or Blender renames the donor
    # actions to `.001` and the retarget step silently picks the stale set.
    for action in list(bpy.data.actions):
        bpy.data.actions.remove(action)


def enable_mpfb():
    # Factory reset is intentionally before enabling the extension: resetting
    # afterwards clears MPFB's contextual package information in Blender 5.x.
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.preferences.addon_enable(module="bl_ext.blender_org.mpfb")
    human_service = importlib.import_module(
        "bl_ext.blender_org.mpfb.services.humanservice"
    ).HumanService
    target_service = importlib.import_module(
        "bl_ext.blender_org.mpfb.services.targetservice"
    ).TargetService
    return human_service, target_service


def build_weight_donor(human_service, target_service):
    macro = target_service.get_default_macro_info_dict()
    macro["gender"] = 1.0 if SEX == "male" else 0.0
    macro["age"] = AGE_MACRO
    macro["height"] = 0.55 if SEX == "male" else 0.45

    human = human_service.create_human(
        mask_helpers=True,
        # MPFB's Mixamo definition locates shoulders, elbows, hands, knees,
        # and feet from the named joint-helper cubes.  Omitting those helpers
        # makes the fitter fall back to adult default coordinates, which puts
        # an adult armature under paediatric skin and tears the mesh as soon as
        # an animation or seated IK pose runs.
        detailed_helpers=True,
        extra_vertex_groups=True,
        feet_on_ground=True,
        scale=0.1,
        macro_detail_dict=macro,
    )

    # The donor keeps age/sex as active macro shape keys. Capture evaluated
    # coordinates for nearest-position weight transfer while leaving the keys
    # live: MPFB needs them when resolving the joint helpers above. Baking and
    # deleting them before rig creation makes the helper fitter lose its macro
    # context and silently return to adult fallback positions.
    depsgraph = bpy.context.evaluated_depsgraph_get()
    evaluated = human.evaluated_get(depsgraph)
    evaluated_mesh = evaluated.to_mesh(
        preserve_all_data_layers=True,
        depsgraph=depsgraph,
    )
    source_positions = [vertex.co.copy() for vertex in evaluated_mesh.vertices]
    evaluated.to_mesh_clear()

    armature = human_service.add_builtin_rig(
        human, "mixamo", import_weights=True
    )
    if not armature or len(armature.data.bones) < 50:
        raise RuntimeError("MPFB did not produce a complete Mixamo armature")
    # glTF/Mixamo clips animate rotation_quaternion. MPFB creates several pose
    # bones in Euler mode by default; in that mode Blender stores the incoming
    # quaternion curves but does not evaluate them, so only hip translation
    # appears to move. Standardise the fitted rig before binding any action.
    for pose_bone in armature.pose.bones:
        pose_bone.rotation_mode = "QUATERNION"

    body_group = human.vertex_groups.get("body")
    if not body_group:
        raise RuntimeError("MPFB basemesh has no stable 'body' vertex group")
    body_group_index = body_group.index
    body_indices = [
        vertex.index
        for vertex in human.data.vertices
        if any(group.group == body_group_index for group in vertex.groups)
    ]
    return human, armature, body_indices, source_positions


def transfer_weights(source, source_indices, source_positions, target, armature):
    # glTF splits MPFB vertices at UV/material seams (13,380 Blender body
    # vertices become ~14,500 runtime vertices), so exported vertex indices
    # are no longer one-to-one.  Positions remain stable.  A nearest-vertex
    # transfer gives every seam duplicate the same source weights and also
    # tolerates the male shell's later jaw/shoulder silhouette refinement.
    tree = KDTree(len(source_indices))
    for source_index in source_indices:
        tree.insert(source_positions[source_index], source_index)
    tree.balance()

    source_group_names = {
        group.index: group.name
        for group in source.vertex_groups
        if group.name.startswith("mixamorig:")
    }
    target_groups = {
        name: target.vertex_groups.new(name=name)
        for name in source_group_names.values()
    }

    weighted_vertices = 0
    distances = []
    for target_index, target_vertex in enumerate(target.data.vertices):
        _, source_index, distance = tree.find(target_vertex.co)
        distances.append(distance)
        assigned = False
        for membership in source.data.vertices[source_index].groups:
            group_name = source_group_names.get(membership.group)
            if not group_name or membership.weight <= 0:
                continue
            target_groups[group_name].add(
                [target_index], membership.weight, "REPLACE"
            )
            assigned = True
        if assigned:
            weighted_vertices += 1

    # Make the medial pelvis follow the hips instead of letting the two upper
    # legs pull a millimetre-wide centre seam in opposite directions. MPFB's
    # standard weights are adequate for walking but several perineal vertices
    # are 100% upper-leg weighted; a deep seated pose then turns connected
    # triangles inside out. Add a smooth Hips influence only in that small
    # anatomical patch and renormalise every deform group on the vertex.
    min_z = min(vertex.co.z for vertex in target.data.vertices)
    max_z = max(vertex.co.z for vertex in target.data.vertices)
    patient_height = max_z - min_z
    hip_z = min_z + patient_height * 0.51
    hips_group = target_groups.get("mixamorig:Hips")
    deform_group_indices = {
        group.index for group in target_groups.values()
    }
    pelvis_vertices = 0

    def smoothstep(edge0, edge1, value):
        if edge0 == edge1:
            return 1.0 if value >= edge1 else 0.0
        t = max(0.0, min(1.0, (value - edge0) / (edge1 - edge0)))
        return t * t * (3.0 - 2.0 * t)

    if hips_group is None:
        raise RuntimeError("MPFB weight donor has no mixamorig:Hips weights")
    for vertex in target.data.vertices:
        centre = 1.0 - smoothstep(
            patient_height * 0.012,
            patient_height * 0.085,
            abs(vertex.co.x),
        )
        vertical = 1.0 - smoothstep(
            patient_height * 0.025,
            patient_height * 0.105,
            abs(vertex.co.z - hip_z),
        )
        desired_hips = 0.78 * centre * vertical
        if desired_hips <= 0.01:
            continue
        memberships = [
            membership
            for membership in vertex.groups
            if membership.group in deform_group_indices
        ]
        current_hips = next(
            (
                membership.weight
                for membership in memberships
                if membership.group == hips_group.index
            ),
            0.0,
        )
        if current_hips >= desired_hips:
            continue
        other_weight = sum(
            membership.weight
            for membership in memberships
            if membership.group != hips_group.index
        )
        if other_weight <= 1e-8:
            continue
        other_scale = (1.0 - desired_hips) / other_weight
        for membership in memberships:
            if membership.group == hips_group.index:
                continue
            target.vertex_groups[membership.group].add(
                [vertex.index], membership.weight * other_scale, "REPLACE"
            )
        hips_group.add([vertex.index], desired_hips, "REPLACE")
        pelvis_vertices += 1

    coverage = weighted_vertices / max(1, len(target.data.vertices))
    if coverage < 0.995:
        raise RuntimeError(f"skin-weight coverage too low: {coverage:.2%}")
    distances.sort()
    p99 = distances[min(len(distances) - 1, int(len(distances) * 0.99))]
    # The active shells have baked sex/age macro shapes plus the male's
    # shoulder/jaw refinement, so they are intentionally not point-identical
    # to a fresh MPFB donor.  Nearest-source distances under 12 cm at p99 stay
    # within the same anatomical segment while covering those silhouette
    # differences (female hands/feet are the largest outliers).
    if p99 > 0.12:
        raise RuntimeError(
            f"weight transfer is not anatomically aligned (p99={p99:.4f}m)"
        )

    world = target.matrix_world.copy()
    target.parent = armature
    target.matrix_world = world
    modifier = target.modifiers.new("Patient armature", "ARMATURE")
    modifier.object = armature
    modifier.use_deform_preserve_volume = True
    return coverage, p99, pelvis_vertices


def parent_eyes_to_head(active_objects, armature):
    head_name = "mixamorig:Head"
    if head_name not in armature.data.bones:
        raise RuntimeError("rig has no mixamorig:Head bone")

    roots = []
    for eye_name in ("eyeL", "eyeR"):
        eye = next((obj for obj in active_objects if obj.name == eye_name), None)
        if eye is None:
            raise RuntimeError(f"active patient is missing {eye_name}")
        world = eye.matrix_world.copy()
        eye.parent = armature
        eye.parent_type = "BONE"
        eye.parent_bone = head_name
        eye.matrix_world = world
        roots.append(eye)
    return roots


def attach_animation_clips(armature, donor_objects):
    donor_armature = next(
        (obj for obj in donor_objects if obj.type == "ARMATURE"), None
    )
    if donor_armature is None:
        raise RuntimeError("animation donor has no armature")

    source_actions = {action.name: action for action in bpy.data.actions}
    missing = [name for name in RUNTIME_CLIPS if name not in source_actions]
    if missing:
        raise RuntimeError(f"animation donor is missing clips: {missing}")

    # The two rigs share semantic Mixamo bone names but NOT bone roll/rest
    # orientation. Copying raw local quaternions twists the forearms and hands
    # into long spikes. Retarget each sampled pose in armature space instead:
    # apply the donor's global rotation/position delta to the fitted bone's own
    # rest matrix, then bake the resulting local transforms onto a fresh action.
    def rig_world_height(rig):
        points = [
            rig.matrix_world @ point
            for bone in rig.data.bones
            for point in (bone.head_local, bone.tail_local)
        ]
        return max(point.z for point in points) - min(point.z for point in points)

    translation_scale = rig_world_height(armature) / max(rig_world_height(donor_armature), 1e-8)
    shared_bones = [
        bone.name for bone in armature.data.bones
        if bone.name in donor_armature.data.bones
    ]
    if len(shared_bones) < 45:
        raise RuntimeError(f"too few shared retarget bones: {len(shared_bones)}")
    animated_bones = [
        name for name in shared_bones
        if not any(
            finger in name
            for finger in ("HandThumb", "HandIndex", "HandMiddle", "HandRing", "HandPinky")
        )
    ]

    donor_armature.animation_data_create()
    armature.animation_data_create()

    for name in RUNTIME_CLIPS:
        source_action = source_actions[name]
        if not source_action.slots:
            raise RuntimeError(f"animation {name} has no object action slot")
        source_action.name = f"__donor_{name}"
        target_action = bpy.data.actions.new(name=name)
        target_slot = target_action.slots.new("OBJECT", armature.name)

        donor_armature.animation_data.action = source_action
        donor_armature.animation_data.action_slot = source_action.slots[0]
        armature.animation_data.action = target_action
        armature.animation_data.action_slot = target_slot

        start = int(source_action.frame_range[0])
        end = int(source_action.frame_range[1])
        bpy.context.scene.frame_set(start)
        bpy.context.view_layer.update()
        reference_pose = {
            bone_name: donor_armature.pose.bones[bone_name].matrix_basis.copy()
            for bone_name in animated_bones
        }
        frames = range(start, max(start, end) + 1)
        for frame in frames:
            bpy.context.scene.frame_set(frame)
            bpy.context.view_layer.update()

            desired = {}
            for bone_name in animated_bones:
                donor_bone = donor_armature.data.bones[bone_name]
                target_bone = armature.data.bones[bone_name]
                donor_pose = donor_armature.pose.bones[bone_name]
                donor_reference = reference_pose[bone_name]
                donor_axis = donor_bone.matrix_local.to_quaternion()
                target_axis = target_bone.matrix_local.to_quaternion()

                # Conjugate the donor's local delta through the two rest-axis
                # frames. This preserves an elbow flex as an elbow flex even
                # when MPFB and the donor use different roll around that bone.
                # The first clip frame is the motion reference rather than the
                # donor's T-pose: the fitted shell already begins in an A-pose,
                # so applying the donor's full T-pose→walk offset a second time
                # folds both arms across the chest.
                donor_delta = (
                    donor_reference.to_quaternion().inverted()
                    @ donor_pose.matrix_basis.to_quaternion()
                )
                target_delta = (
                    target_axis.inverted()
                    @ donor_axis
                    @ donor_delta
                    @ donor_axis.inverted()
                    @ target_axis
                )
                donor_location = (
                    donor_pose.matrix_basis.translation
                    - donor_reference.translation
                )
                donor_scale = donor_pose.matrix_basis.to_scale()
                reference_scale = donor_reference.to_scale()
                target_location = target_axis.inverted() @ (
                    donor_axis @ donor_location
                ) * translation_scale
                desired[bone_name] = (
                    target_location,
                    target_delta,
                    tuple(
                        donor_scale[index] / max(reference_scale[index], 1e-8)
                        for index in range(3)
                    ),
                )

            for pose_bone in armature.pose.bones:
                transform = desired.get(pose_bone.name)
                if transform is not None:
                    pose_bone.location = transform[0]
                    pose_bone.rotation_quaternion = transform[1]
                    pose_bone.scale = transform[2]
            bpy.context.view_layer.update()
            for bone_name in animated_bones:
                pose_bone = armature.pose.bones[bone_name]
                pose_bone.keyframe_insert("location", frame=frame, group=bone_name)
                pose_bone.keyframe_insert("rotation_quaternion", frame=frame, group=bone_name)
                pose_bone.keyframe_insert("scale", frame=frame, group=bone_name)

        for layer in target_action.layers:
            for keyframe_strip in layer.strips:
                channelbag = keyframe_strip.channelbag(target_slot, ensure=False)
                if channelbag is None:
                    continue
                for curve in channelbag.fcurves:
                    for key in curve.keyframe_points:
                        key.interpolation = "LINEAR"

    # Export actions independently. Building simultaneously-active NLA tracks
    # makes Blender evaluate one pose over another during glTF baking.
    walk_action = bpy.data.actions["walk"]
    armature.animation_data.action = walk_action
    armature.animation_data.action_slot = walk_action.slots[0]
    probe_bone = armature.pose.bones.get("mixamorig:LeftArm")
    if probe_bone is None:
        raise RuntimeError("fitted rig has no left-arm animation probe bone")
    bpy.context.scene.frame_set(int(walk_action.frame_range[0]))
    first_rotation = probe_bone.rotation_quaternion.copy()
    bpy.context.scene.frame_set(int(sum(walk_action.frame_range) / 2))
    middle_rotation = probe_bone.rotation_quaternion.copy()
    if sum(abs(a - b) for a, b in zip(first_rotation, middle_rotation)) < 0.02:
        raise RuntimeError("walk clip did not produce articulated limb motion")
    armature.animation_data.action = bpy.data.actions["idle"]
    armature.animation_data.action_slot = bpy.data.actions["idle"].slots[0]
    return donor_armature


def delete_objects(objects):
    for obj in objects:
        if obj and obj.name in bpy.data.objects:
            bpy.data.objects.remove(obj, do_unlink=True)


def export_patient(body, armature, eye_roots):
    # MPFB uses hidden control-shape meshes in Blender's pose UI.  They are
    # editor helpers, not anatomy, and glTF follows the reference even when the
    # helper is unselected.  Clear them so no stray Icosphere ships again.
    for pose_bone in armature.pose.bones:
        pose_bone.custom_shape = None
    bpy.ops.object.select_all(action="DESELECT")
    armature.select_set(True)
    body.select_set(True)
    for eye in eye_roots:
        eye.select_set(True)
        for child in eye.children_recursive:
            child.select_set(True)
    bpy.context.view_layer.objects.active = armature

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
    human_service, target_service = enable_mpfb()

    active_objects = import_glb(ACTIVE_GLB)
    body = largest_mesh(active_objects)
    body.name = "Patient"
    body.data.name = "Patient"
    morphs = clinical_morph_names(body)
    missing_morphs = sorted(CLINICAL_MORPHS - morphs)
    if missing_morphs:
        raise RuntimeError(f"active patient is missing morphs: {missing_morphs}")
    strip_existing_rig(body)

    human, armature, body_indices, source_positions = build_weight_donor(
        human_service, target_service
    )
    armature.name = "PatientRig"
    armature.data.name = "PatientRig"
    coverage, weight_p99, pelvis_vertices = transfer_weights(
        human, body_indices, source_positions, body, armature
    )
    eye_roots = parent_eyes_to_head(active_objects, armature)

    donor_objects = import_glb(ANIMATION_DONOR_GLB)
    attach_animation_clips(armature, donor_objects)

    # The generated MPFB body provided fitted weights only.  The legacy donor
    # provided animation datablocks only.  Neither mesh belongs in the export.
    delete_objects([human])
    delete_objects(donor_objects)
    for action in list(bpy.data.actions):
        if action.name not in RUNTIME_CLIPS:
            bpy.data.actions.remove(action)

    # Remove every accidental scene object from the original GLB.  Selection
    # export already excludes them; deleting also makes the audit unambiguous.
    keep = {body, armature, *eye_roots}
    for eye in eye_roots:
        keep.update(eye.children_recursive)
    delete_objects([obj for obj in list(bpy.data.objects) if obj not in keep])

    export_patient(body, armature, eye_roots)
    log(
        f"exported {OUTPUT_GLB} | bones={len(armature.data.bones)} "
        f"coverage={coverage:.2%} weight-p99={weight_p99:.4f}m "
        f"pelvis-stabilised={pelvis_vertices} "
        f"morphs={len(morphs)} "
        f"clips={','.join(RUNTIME_CLIPS)}"
    )


main()
