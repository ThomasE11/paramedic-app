"""Verify the resp-001 trouser corrective is narrow and rig-compatible.

This compares decoded generic and profile GLBs rather than trusting their
names. Draco export/import can introduce a small coordinate rounding error;
all fixed attributes are therefore compared with a stated tolerance.
"""

from __future__ import annotations

import os
import sys

import bpy


argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if len(argv) != 2:
    raise SystemExit("usage: verify-resp001-trouser-profile.py <generic.glb> <resp001.glb>")


# The baking script deliberately bounds the moved pose-key vertices to 8 mm.
# glTF/Draco round-trips are tolerated to 0.25 mm in unchanged data.
CORRECTIVE_BOUND = 0.008
ROUND_TRIP_TOLERANCE = 0.00025
# Skin weights are dimensionless, independently bounded to 0.025 percentage points.
WEIGHT_TOLERANCE = 0.00025


def max_distance(first, second) -> float:
    return max(
        ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** 0.5
        for a, b in zip(first, second)
    )


def snapshot(path: str) -> dict:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.abspath(path))
    mesh_object = max(
        (obj for obj in bpy.context.scene.objects if obj.type == "MESH"),
        key=lambda obj: len(obj.data.vertices),
    )
    mesh = mesh_object.data
    keys = mesh.shape_keys.key_blocks if mesh.shape_keys else None
    if not keys:
        raise RuntimeError(f"{path} has no morph keys")
    armatures = [obj for obj in bpy.context.scene.objects if obj.type == "ARMATURE"]
    if len(armatures) != 1:
        raise RuntimeError(f"{path} has {len(armatures)} armatures, expected one")

    return {
        "vertices": len(mesh.vertices),
        "morphs": {key.name: [tuple(point.co) for point in key.data] for key in keys},
        "polygons": [tuple(polygon.vertices) for polygon in mesh.polygons],
        "loops": len(mesh.loops),
        "uvs": [tuple(uv.uv) for uv in mesh.uv_layers.active.data] if mesh.uv_layers.active else [],
        "bones": [(bone.name, bone.parent.name if bone.parent else None) for bone in armatures[0].data.bones],
        "weights": [
            tuple(sorted((mesh_object.vertex_groups[group.group].name, group.weight) for group in vertex.groups))
            for vertex in mesh.vertices
        ],
    }


generic = snapshot(argv[0])
profile = snapshot(argv[1])

if profile["vertices"] != generic["vertices"]:
    raise RuntimeError(f"vertex count changed: {generic['vertices']} -> {profile['vertices']}")
if profile["polygons"] != generic["polygons"] or profile["loops"] != generic["loops"]:
    raise RuntimeError("profile changed garment topology")
if profile["uvs"] != generic["uvs"]:
    raise RuntimeError("profile changed UV correspondence")
if profile["bones"] != generic["bones"] or len(profile["bones"]) < 52:
    raise RuntimeError("profile changed skeleton bone names or parent hierarchy")
for index, (generic_weights, profile_weights) in enumerate(zip(generic["weights"], profile["weights"])):
    if tuple(name for name, _ in generic_weights) != tuple(name for name, _ in profile_weights):
        raise RuntimeError(f"profile changed skin-weight groups at vertex {index}")
weight_delta = max(
    abs(generic_weight - profile_weight)
    for generic_weights, profile_weights in zip(generic["weights"], profile["weights"])
    for (_, generic_weight), (_, profile_weight) in zip(generic_weights, profile_weights)
)
if weight_delta > WEIGHT_TOLERANCE:
    raise RuntimeError(f"profile changed skin weights by {weight_delta:.6f}")
if list(profile["morphs"]) != list(generic["morphs"]):
    raise RuntimeError("profile changed the clinical morph-name contract")

basis_delta = max_distance(generic["morphs"]["Basis"], profile["morphs"]["Basis"])
if basis_delta > ROUND_TRIP_TOLERANCE:
    raise RuntimeError(f"profile changed Basis positions by {basis_delta:.6f}m")

unchanged_names = [name for name in generic["morphs"] if name not in {"pose_tripod", "pose_seated"}]
unchanged_delta = max(
    max_distance(generic["morphs"][name], profile["morphs"][name])
    for name in unchanged_names
)
if unchanged_delta > ROUND_TRIP_TOLERANCE:
    raise RuntimeError(f"profile changed an untouched clinical morph by {unchanged_delta:.6f}m")

tripod_delta = max_distance(generic["morphs"]["pose_tripod"], profile["morphs"]["pose_tripod"])
seated_delta = max_distance(generic["morphs"]["pose_seated"], profile["morphs"]["pose_seated"])
if tripod_delta > CORRECTIVE_BOUND + ROUND_TRIP_TOLERANCE:
    raise RuntimeError(f"tripod corrective exceeds 8 mm bound: {tripod_delta:.6f}m")
if seated_delta > CORRECTIVE_BOUND + ROUND_TRIP_TOLERANCE:
    raise RuntimeError(f"seated corrective exceeds 8 mm bound: {seated_delta:.6f}m")

seated_gap = max_distance(profile["morphs"]["pose_tripod"], profile["morphs"]["pose_seated"])
if seated_gap > ROUND_TRIP_TOLERANCE:
    raise RuntimeError(f"seated/tripod corrective diverged: {seated_gap:.6f}m")

print(
    "[verify-resp001-trouser-profile] "
    f"verts={generic['vertices']} bones={len(profile['bones'])} morphs={len(generic['morphs'])} "
    f"basis-delta={basis_delta:.6f}m unchanged-morph-delta={unchanged_delta:.6f}m "
    f"tripod-delta={tripod_delta:.6f}m seated-delta={seated_delta:.6f}m "
    f"seated-gap={seated_gap:.6f}m skin-weight-delta={weight_delta:.6f} "
    "topology=preserved uvs=preserved weights=preserved"
)
