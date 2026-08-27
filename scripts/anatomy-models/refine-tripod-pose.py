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
  hanging in front of them.

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
