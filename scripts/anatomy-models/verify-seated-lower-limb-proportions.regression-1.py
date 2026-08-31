"""Regression guard for anatomically stable seated lower limbs.

Run with Blender, not system Python::

    Blender --background --python scripts/anatomy-models/verify-seated-lower-limb-proportions.regression-1.py -- \
      public/models/patient-male.glb public/models/patient-female.glb
"""

# Regression: ISSUE-020 — rotating a seated adult exposed stretched feet and pinched calves
# Found by /qa on 2026-09-01
# Report: .gstack/qa-reports/qa-report-127-0-0-1-2026-08-30.md

from __future__ import annotations

import os
import sys

import bpy


paths = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
if not paths:
    raise SystemExit(
        "usage: verify-seated-lower-limb-proportions.regression-1.py <patient.glb> [...]"
    )


def largest_mesh():
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("GLB has no mesh objects")
    return max(meshes, key=lambda obj: len(obj.data.vertices))


def bounds(points):
    return tuple(
        max(getattr(point, axis) for point in points)
        - min(getattr(point, axis) for point in points)
        for axis in ("x", "y", "z")
    )


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
    measurements = []
    shin_quantiles = {}
    shin_bounds = {}
    for side in ("Left", "Right"):
        group_indices = {
            group.index
            for group in body.vertex_groups
            if group.name
            in {
                f"mixamorig:{side}Foot",
                f"mixamorig:{side}ToeBase",
            }
        }
        indices = [
            vertex.index
            for vertex in body.data.vertices
            if sum(
                membership.weight
                for membership in vertex.groups
                if membership.group in group_indices
            )
            >= 0.45
        ]
        if len(indices) < 200:
            raise RuntimeError(f"{side} foot has incomplete fitted weights: {len(indices)} vertices")

        rest_bounds = bounds([basis.data[index].co for index in indices])
        seated_bounds = bounds([seated.data[index].co for index in indices])
        sole_z = min(seated.data[index].co.z for index in indices)
        rest_length = max(rest_bounds)
        seated_length = max(seated_bounds)
        length_ratio = seated_length / max(rest_length, 1e-8)
        measurements.append(
            f"{side.lower()}={length_ratio:.2f}x "
            f"rest={tuple(round(value, 3) for value in rest_bounds)} "
            f"seated={tuple(round(value, 3) for value in seated_bounds)} "
            f"sole-z={sole_z:.3f}"
        )
        if length_ratio > 1.12:
            raise RuntimeError(
                f"{side} seated foot stretches beyond its rest dimensions: "
                f"ratio={length_ratio:.2f} rest={rest_bounds} seated={seated_bounds}"
            )

        shin_group = body.vertex_groups.get(f"mixamorig:{side}Leg")
        if shin_group is None:
            raise RuntimeError(f"patient body is missing {side} lower-leg weights")
        shin_indices = [
            vertex.index
            for vertex in body.data.vertices
            if any(
                membership.group == shin_group.index and membership.weight >= 0.65
                for membership in vertex.groups
            )
        ]
        shin_rest = bounds([basis.data[index].co for index in shin_indices])
        shin_seated = bounds([seated.data[index].co for index in shin_indices])
        shin_bounds[side] = shin_seated
        seated_x = sorted(seated.data[index].co.x for index in shin_indices)
        quantile_x = tuple(
            seated_x[round((len(seated_x) - 1) * quantile)]
            for quantile in (0.05, 0.5, 0.95)
        )
        shin_quantiles[side] = quantile_x
        shin_set = set(shin_indices)
        edge_ratios = []
        for edge in body.data.edges:
            first, second = edge.vertices
            if first not in shin_set or second not in shin_set:
                continue
            rest_length = (basis.data[second].co - basis.data[first].co).length
            if rest_length <= 1e-8:
                continue
            edge_ratios.append(
                (seated.data[second].co - seated.data[first].co).length / rest_length
            )
        measurements.append(
            f"{side.lower()}-shin rest={tuple(round(value, 3) for value in shin_rest)} "
            f"seated={tuple(round(value, 3) for value in shin_seated)} "
            f"x05/50/95={tuple(round(value, 3) for value in quantile_x)} "
            f"edge-max={max(edge_ratios):.2f}"
        )

    print(
        "[verify-seated-lower-limb-proportions] "
        f"{os.path.basename(path)} " + " ".join(measurements)
    )

    left = shin_quantiles["Left"]
    right = shin_quantiles["Right"]
    minimum_clearance = height * 0.012
    if left[0] < minimum_clearance or right[2] > -minimum_clearance:
        raise RuntimeError(
            "seated shins cross the body midline: "
            f"left-5th={left[0]:.3f} right-95th={right[2]:.3f} "
            f"minimum-clearance={minimum_clearance:.3f}"
        )
    if abs(left[1] + right[1]) > height * 0.015:
        raise RuntimeError(
            "seated shin centres are not bilaterally symmetric: "
            f"left={left[1]:.3f} right={right[1]:.3f}"
        )
    for side, (lateral_span, _depth_span, vertical_span) in shin_bounds.items():
        lateral_ratio = lateral_span / max(vertical_span, 1e-8)
        if lateral_ratio > 0.55:
            raise RuntimeError(
                f"{side} seated shin splays sideways instead of hanging vertically: "
                f"lateral/vertical ratio={lateral_ratio:.2f}"
            )


bpy.ops.wm.read_factory_settings(use_empty=True)
for patient_path in paths:
    verify(os.path.abspath(patient_path))
