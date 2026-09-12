"""Create the resp-001-only seated trouser corrective asset.

The generic trouser shell is anatomically faithful, but its medial front
thigh has a tight fan of stretched triangles when ``pose_tripod`` is active.
Under the villa key it reads as a grey seam.  This pass keeps the topology,
skin weights, armature and every clinical morph intact, and relaxes only the
front-medial vertices of the seated/tripod shape keys.  It is deliberately a
small corrective (8 mm cap) rather than cloth simulation or a global garment
rebake.

Run with Blender:

  Blender --background --python scripts/anatomy-models/bake-resp001-trouser-profile.py -- \
    public/models/garment-trousers.glb public/models/garment-trousers-resp001.glb
"""

from __future__ import annotations

import math
import os
import sys

import bpy
from mathutils import Vector


argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if len(argv) != 2:
    raise SystemExit("usage: bake-resp001-trouser-profile.py <input.glb> <output.glb>")

INPUT_GLB = os.path.abspath(argv[0])
OUTPUT_GLB = os.path.abspath(argv[1])

# This is intentionally local to the inner, camera-facing thigh / crotch
# trough of the adult male trouser.  Blender imports glTF as Z-up and the
# anterior surface is negative Y for this patient asset.
MEDIAL_X = 0.085
FRONT_Y_MAX = 0.025
THIGH_Z_MIN = 0.54
THIGH_Z_MAX = 0.90
SMOOTH_PASSES = 2
SMOOTH_FACTOR = 0.14
MAX_DISPLACEMENT = 0.008


def largest_mesh() -> bpy.types.Object:
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("garment GLB has no mesh")
    return max(meshes, key=lambda obj: len(obj.data.vertices))


def adjacency(mesh: bpy.types.Mesh) -> list[set[int]]:
    neighbours = [set() for _ in mesh.vertices]
    for edge in mesh.edges:
        first, second = edge.vertices
        neighbours[first].add(second)
        neighbours[second].add(first)
    return neighbours


def boundary_vertices(mesh: bpy.types.Mesh) -> set[int]:
    edge_uses: dict[tuple[int, int], int] = {}
    for polygon in mesh.polygons:
        vertices = list(polygon.vertices)
        for corner, first in enumerate(vertices):
            second = vertices[(corner + 1) % len(vertices)]
            edge = (first, second) if first < second else (second, first)
            edge_uses[edge] = edge_uses.get(edge, 0) + 1
    return {index for edge, uses in edge_uses.items() if uses == 1 for index in edge}


def medial_mask(key, boundary: set[int]) -> set[int]:
    return {
        index
        for index, point in enumerate(key.data)
        if index not in boundary
        and abs(point.co.x) <= MEDIAL_X
        and point.co.y <= FRONT_Y_MAX
        and THIGH_Z_MIN <= point.co.z <= THIGH_Z_MAX
    }


def edge_strain(mesh: bpy.types.Mesh, basis, target, indices: set[int]) -> tuple[float, int]:
    ratios = []
    for edge in mesh.edges:
        first, second = edge.vertices
        if first not in indices and second not in indices:
            continue
        rest = (basis.data[first].co - basis.data[second].co).length
        if rest <= 1e-8:
            continue
        ratios.append((target.data[first].co - target.data[second].co).length / rest)
    return (max(ratios) if ratios else 0.0, sum(ratio > 1.5 for ratio in ratios))


def relax_key(mesh: bpy.types.Mesh, basis, target, neighbours, boundary) -> tuple[int, float, float, int, int, float]:
    masked = medial_mask(target, boundary)
    if len(masked) < 20:
        raise RuntimeError(f"resp-001 medial mask captured too few vertices: {len(masked)}")
    before_max, before_stretched = edge_strain(mesh, basis, target, masked)
    original = [point.co.copy() for point in target.data]

    for _ in range(SMOOTH_PASSES):
        prior = [point.co.copy() for point in target.data]
        for index in masked:
            local_neighbours = neighbours[index]
            if not local_neighbours:
                continue
            average = sum((prior[other] for other in local_neighbours), Vector()) / len(local_neighbours)
            candidate = prior[index].lerp(average, SMOOTH_FACTOR)
            delta = candidate - original[index]
            if delta.length > MAX_DISPLACEMENT:
                candidate = original[index] + delta.normalized() * MAX_DISPLACEMENT
            target.data[index].co = candidate

    after_max, after_stretched = edge_strain(mesh, basis, target, masked)
    max_displacement = max((target.data[index].co - original[index]).length for index in masked)
    return len(masked), before_max, after_max, before_stretched, after_stretched, max_displacement


def export_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    os.makedirs(os.path.dirname(OUTPUT_GLB), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_GLB,
        export_format="GLB",
        use_selection=True,
        export_apply=False,
        export_skins=True,
        export_morph=True,
        export_morph_normal=True,
        export_animations=False,
        export_cameras=False,
        export_lights=False,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_materials="NONE",
    )


def main() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=INPUT_GLB)
    garment = largest_mesh()
    keys = garment.data.shape_keys.key_blocks if garment.data.shape_keys else None
    if not keys:
        raise RuntimeError("trouser asset has no shape keys")
    basis = keys.get("Basis")
    tripod = keys.get("pose_tripod")
    seated = keys.get("pose_seated")
    if basis is None or tripod is None or seated is None:
        raise RuntimeError("trouser asset is missing Basis, pose_tripod or pose_seated")

    neighbours = adjacency(garment.data)
    boundary = boundary_vertices(garment.data)
    tripod_result = relax_key(garment.data, basis, tripod, neighbours, boundary)
    # The source uses identical seated/tripod lower-limb shapes. Preserve that
    # continuity so a transient posture crossfade cannot reveal the old seam.
    for index in range(len(seated.data)):
        seated.data[index].co = tripod.data[index].co
    garment["paramedic_resp001_medial_thigh_revision"] = 1
    export_scene()
    print(
        "[resp001-trouser-profile] "
        f"verts={len(garment.data.vertices)} mask={tripod_result[0]} "
        f"strain={tripod_result[1]:.2f}x->{tripod_result[2]:.2f}x "
        f"over1.5={tripod_result[3]}->{tripod_result[4]} "
        f"max-displacement={tripod_result[5]:.4f}m output={OUTPUT_GLB}"
    )


main()
