"""Regression guard for planted, separated seated feet.

Run with Blender, not system Python::

    Blender --background --python scripts/anatomy-models/verify-seated-foot-plant.regression-1.py -- \
      public/models/patient-male.glb public/models/patient-female.glb
"""

# Regression: ISSUE-015 — seated feet inherited the shin rotation and pointed at the floor
# Found by /qa on 2026-09-01
# Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-08-30.md

from __future__ import annotations

import os
import sys

import bpy


paths = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
if not paths:
    raise SystemExit("usage: verify-seated-foot-plant.regression-1.py <patient.glb> [...]")


def largest_mesh():
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("GLB has no mesh objects")
    return max(meshes, key=lambda obj: len(obj.data.vertices))


def verify(path: str):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=path)
    body = largest_mesh()
    shape_keys = body.data.shape_keys
    if shape_keys is None:
        raise RuntimeError("patient body has no shape keys")
    basis = shape_keys.key_blocks.get("Basis")
    seated = shape_keys.key_blocks.get("pose_seated")
    if basis is None or seated is None:
        raise RuntimeError("patient body is missing Basis or pose_seated")

    height = max(point.co.z for point in basis.data) - min(point.co.z for point in basis.data)
    centres = {}
    ratios = {}
    for side in ("Left", "Right"):
        group_names = {
            f"mixamorig:{side}Foot",
            f"mixamorig:{side}ToeBase",
        }
        group_indices = {
            group.index for group in body.vertex_groups if group.name in group_names
        }
        points = []
        for vertex in body.data.vertices:
            weight = sum(
                membership.weight
                for membership in vertex.groups
                if membership.group in group_indices
            )
            if weight >= 0.45:
                points.append(seated.data[vertex.index].co)
        if len(points) < 200:
            raise RuntimeError(f"{side} foot has incomplete fitted weights: {len(points)} vertices")

        forward_span = max(point.y for point in points) - min(point.y for point in points)
        vertical_span = max(point.z for point in points) - min(point.z for point in points)
        pitch_ratio = vertical_span / max(forward_span, 1e-8)
        if pitch_ratio > 0.65:
            raise RuntimeError(
                f"{side} seated foot remains toe-pointed: "
                f"vertical/forward ratio={pitch_ratio:.2f}"
            )
        centres[side] = sum(point.x for point in points) / len(points)
        ratios[side] = pitch_ratio

    separation = centres["Left"] - centres["Right"]
    if centres["Left"] <= 0 or centres["Right"] >= 0 or separation < height * 0.07:
        raise RuntimeError(
            "seated feet cross or overlap the body midline: "
            f"left={centres['Left']:.3f} right={centres['Right']:.3f}"
        )

    print(
        "[verify-seated-foot-plant] "
        f"{os.path.basename(path)} left={ratios['Left']:.2f} "
        f"right={ratios['Right']:.2f} separation={separation:.3f}m"
    )


bpy.ops.wm.read_factory_settings(use_empty=True)
for patient_path in paths:
    verify(os.path.abspath(patient_path))
