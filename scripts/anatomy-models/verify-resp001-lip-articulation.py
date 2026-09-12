"""Measure speech-morph movement on the shipped resp-001 male patient.

This is a CPU-only structural check. It imports the GLB in Blender and reports
movement in two deliberately separate regions:

* vermilion: the measured lip surface used by the resp-001 cyanosis mask;
* chin: the lower-face region that should not substitute for lip articulation.

Run with Blender::

    Blender --background \
      --python scripts/anatomy-models/verify-resp001-lip-articulation.py -- \
      public/models/patient-male.glb [morph-name]
"""

from __future__ import annotations

import math
import os
import sys
from collections import Counter

import bpy


ARGS = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
GLB_PATH = os.path.abspath(ARGS[0] if ARGS else "public/models/patient-male.glb")
MORPH_NAME = ARGS[1] if len(ARGS) > 1 else "viseme_open"


def percentile(values: list[float], fraction: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    return ordered[round((len(ordered) - 1) * fraction)]


def metrics(values: list[float]) -> dict[str, float | int]:
    moved = [value for value in values if value > 1e-7]
    return {
        "vertices": len(values),
        "moved": len(moved),
        "mean_mm": 1000.0 * sum(values) / len(values) if values else 0.0,
        "p95_mm": 1000.0 * percentile(values, 0.95),
        "max_mm": 1000.0 * max(values, default=0.0),
    }


def in_vermilion(co) -> bool:
    """Bounds are Blender-space equivalents of the measured Three.js lips."""
    x, y, z = co
    anterior = -y
    return abs(x) <= 0.028 and 1.536 <= z <= 1.552 and anterior >= 0.138


def in_chin(co) -> bool:
    x, y, z = co
    anterior = -y
    return abs(x) <= 0.050 and 1.455 <= z < 1.520 and anterior >= 0.090


def fmt(label: str, result: dict[str, float | int]) -> str:
    return (
        f"{label}: vertices={result['vertices']} moved={result['moved']} "
        f"mean={result['mean_mm']:.3f}mm p95={result['p95_mm']:.3f}mm "
        f"max={result['max_mm']:.3f}mm"
    )


def smoothstep(edge0: float, edge1: float, value: float) -> float:
    if edge0 == edge1:
        return 0.0 if value < edge0 else 1.0
    amount = max(0.0, min(1.0, (value - edge0) / (edge1 - edge0)))
    return amount * amount * (3.0 - 2.0 * amount)


def procedural_lip_delta(co, seam_side: int):
    """Blender-space version of resp001LipArticulationDelta."""
    x, blender_y, height = co
    anterior = -blender_y
    lateral = 1.0 - smoothstep(0.020, 0.028, abs(x))
    vertical = smoothstep(1.536, 1.538, height) * (
        1.0 - smoothstep(1.5485, 1.5515, height)
    )
    front = smoothstep(0.138, 0.145, anterior)
    coverage = lateral * vertical * front
    if seam_side > 0:
        upper = 1.0
    elif seam_side < 0:
        upper = 0.0
    else:
        upper = smoothstep(1.5425, 1.544, height)
    three_y_delta = (-0.0042 + upper * 0.0058) * coverage
    three_z_delta = (-0.0008 + upper * 0.0013) * coverage
    # Three local (x, y, z) maps from Blender (x, z, -y).
    return (0.0, -three_z_delta, three_y_delta)


def report_mouth_topology(patient):
    """Report whether the closed-mouth lip line is a real mesh boundary."""
    vertices = patient.data.vertices
    edge_use: Counter[tuple[int, int]] = Counter()
    edge_thirds: dict[tuple[int, int], list[int]] = {}
    for polygon in patient.data.polygons:
        indices = list(polygon.vertices)
        for offset, start in enumerate(indices):
            end = indices[(offset + 1) % len(indices)]
            edge = tuple(sorted((start, end)))
            edge_use[edge] += 1
            if len(indices) == 3:
                third = indices[(offset + 2) % len(indices)]
                edge_thirds.setdefault(edge, []).append(third)

    def central_mouth(index: int) -> bool:
        x, y, z = vertices[index].co
        return abs(x) <= 0.028 and 1.536 <= z <= 1.552 and -y >= 0.138

    mouth_edges = [
        edge for edge in edge_use
        if central_mouth(edge[0]) and central_mouth(edge[1])
    ]
    boundary_edges = [edge for edge in mouth_edges if edge_use[edge] == 1]
    nonmanifold_edges = [edge for edge in mouth_edges if edge_use[edge] != 2]
    crossing_faces = 0
    for polygon in patient.data.polygons:
        points = [vertices[index].co for index in polygon.vertices]
        if not all(abs(point.x) <= 0.028 and -point.y >= 0.138 for point in points):
            continue
        heights = [point.z for point in points]
        if min(heights) < 1.5425 and max(heights) > 1.544:
            crossing_faces += 1

    position_groups: dict[tuple[int, int, int], list[int]] = {}
    for vertex in vertices:
        if not central_mouth(vertex.index):
            continue
        key = tuple(round(axis * 100_000) for axis in vertex.co)
        position_groups.setdefault(key, []).append(vertex.index)
    coincident_groups = [indices for indices in position_groups.values() if len(indices) > 1]

    neighbours: dict[int, set[int]] = {}
    for start, end in boundary_edges:
        neighbours.setdefault(start, set()).add(end)
        neighbours.setdefault(end, set()).add(start)
    components: list[set[int]] = []
    remaining = set(neighbours)
    while remaining:
        seed = remaining.pop()
        component = {seed}
        stack = [seed]
        while stack:
            current = stack.pop()
            for neighbour in neighbours.get(current, set()):
                if neighbour in component:
                    continue
                component.add(neighbour)
                remaining.discard(neighbour)
                stack.append(neighbour)
        components.append(component)

    print(
        "[speech-verify] mouth topology "
        f"edges={len(mouth_edges)} boundary={len(boundary_edges)} "
        f"nonmanifold={len(nonmanifold_edges)} split-crossing-faces={crossing_faces} "
        f"coincident-position-groups={len(coincident_groups)}"
    )
    component_records = []
    for number, component in enumerate(sorted(components, key=len, reverse=True)[:5], 1):
        points = [vertices[index].co for index in component]
        component_edges = [
            edge for edge in boundary_edges
            if edge[0] in component and edge[1] in component
        ]
        height_biases = []
        for start, end in component_edges:
            for third in edge_thirds.get((start, end), []):
                edge_height = (vertices[start].co.z + vertices[end].co.z) * 0.5
                height_biases.append(vertices[third].co.z - edge_height)
        mean_height_bias = (
            sum(height_biases) / len(height_biases) if height_biases else 0.0
        )
        component_records.append((component, mean_height_bias))
        print(
            f"[speech-verify] mouth boundary component {number}: vertices={len(component)} "
            f"x=[{min(point.x for point in points):.4f},{max(point.x for point in points):.4f}] "
            f"anterior=[{min(-point.y for point in points):.4f},{max(-point.y for point in points):.4f}] "
            f"height=[{min(point.z for point in points):.4f},{max(point.z for point in points):.4f}] "
            f"adjacent-height-bias={mean_height_bias * 1000.0:.3f}mm"
        )
    upper = max(component_records, key=lambda record: record[1])
    lower = min(component_records, key=lambda record: record[1])
    if upper[1] <= 0.0 or lower[1] >= 0.0 or upper[0] == lower[0]:
        raise RuntimeError("could not distinguish upper and lower mouth boundaries")
    return set(upper[0]), set(lower[0]), coincident_groups


def main() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=GLB_PATH)

    patient = bpy.data.objects.get("Patient")
    if patient is None or patient.type != "MESH":
        raise RuntimeError("Patient mesh not found")

    keys = patient.data.shape_keys
    if keys is None:
        raise RuntimeError("Patient mesh has no shape keys")
    basis = keys.key_blocks.get("Basis")
    target = keys.key_blocks.get(MORPH_NAME)
    procedural = MORPH_NAME == "resp001_lip_articulation" and target is None
    if basis is None or (target is None and not procedural):
        raise RuntimeError(f"missing Basis or {MORPH_NAME!r} shape key")
    if target is not None and len(basis.data) != len(target.data):
        raise RuntimeError("shape-key topology does not match Basis")

    upper_seam, lower_seam, coincident_groups = report_mouth_topology(patient)
    seam_sides = {
        **{index: 1 for index in upper_seam},
        **{index: -1 for index in lower_seam},
    }

    all_values: list[float] = []
    lip_values: list[float] = []
    chin_values: list[float] = []
    moved_coordinates = []

    deltas = []
    for index, base_point in enumerate(basis.data):
        if procedural:
            raw_delta = procedural_lip_delta(base_point.co, seam_sides.get(index, 0))
            delta = type(base_point.co)(raw_delta)
        else:
            delta = target.data[index].co - base_point.co
        deltas.append(delta)
        distance = math.sqrt(delta.x**2 + delta.y**2 + delta.z**2)
        all_values.append(distance)
        if in_vermilion(base_point.co):
            lip_values.append(distance)
        if in_chin(base_point.co):
            chin_values.append(distance)
        if distance > 1e-7:
            moved_coordinates.append(base_point.co.copy())

    print(f"[speech-verify] file={GLB_PATH}")
    print(
        f"[speech-verify] patient vertices={len(patient.data.vertices)} "
        f"polygons={len(patient.data.polygons)} morphs={len(keys.key_blocks) - 1}"
    )
    print(f"[speech-verify] morph={MORPH_NAME}")
    print(f"[speech-verify] {fmt('all', metrics(all_values))}")
    print(f"[speech-verify] {fmt('vermilion', metrics(lip_values))}")
    print(f"[speech-verify] {fmt('chin', metrics(chin_values))}")

    if moved_coordinates:
        bounds = []
        for axis in range(3):
            bounds.append(
                (
                    min(point[axis] for point in moved_coordinates),
                    max(point[axis] for point in moved_coordinates),
                )
            )
        print(
            "[speech-verify] moved bounds blender xyz="
            + " ".join(f"[{lower:.4f},{upper:.4f}]" for lower, upper in bounds)
        )
    if procedural:
        aperture = []
        for group in coincident_groups:
            uppers = [index for index in group if index in upper_seam]
            lowers = [index for index in group if index in lower_seam]
            for upper_index in uppers:
                for lower_index in lowers:
                    separation = deltas[upper_index] - deltas[lower_index]
                    aperture.append(separation.length)
        print(
            f"[speech-verify] opened seam pairs={len(aperture)} "
            f"mean={1000.0 * sum(aperture) / len(aperture):.3f}mm "
            f"p95={1000.0 * percentile(aperture, 0.95):.3f}mm "
            f"max={1000.0 * max(aperture):.3f}mm"
        )


if __name__ == "__main__":
    main()
