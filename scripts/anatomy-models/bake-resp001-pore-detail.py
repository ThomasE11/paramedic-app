"""Bake a tileable tangent-space pore normal for the resp-001 pilot.

The generic male detail normal is baked through the body's atlas. Repeating
that atlas also repeats its empty UV islands, so most fragments receive almost
no microsurface signal. This pilot asset is instead baked on a UV plane from a
deterministic, toroidally periodic height field. The plane makes Blender derive
the tangent-space normal from geometry while the periodic source keeps both
texture seams continuous.

Run with Blender (CPU only):

  Blender --background --python scripts/anatomy-models/bake-resp001-pore-detail.py -- \
    public/models/patient-male-skin-resp001-pore-detail-normal.png

No patient GLB, albedo, roughness, clinical state, or shared skin map is read or
modified by this script.
"""

from __future__ import annotations

import math
import os
import sys

import bpy


argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if len(argv) > 1:
    raise SystemExit("usage: bake-resp001-pore-detail.py [output.png]")

OUTPUT = os.path.abspath(
    argv[0] if argv else "public/models/patient-male-skin-resp001-pore-detail-normal.png"
)
RESOLUTION = 512
PORE_GRID = 52
SEED = 1001


def hash01(x: int, y: int, salt: int) -> float:
    """Stable integer hash in [0, 1), including wrapped negative cells."""
    value = (x * 0x1F123BB5) ^ (y * 0x5F356495) ^ (salt * 0x6C8E9CF5)
    value = (value ^ (value >> 16)) * 0x45D9F3B
    value = (value ^ (value >> 16)) * 0x45D9F3B
    value ^= value >> 16
    return (value & 0xFFFFFFFF) / 4294967296.0


def pore_height(u: float, v: float) -> float:
    """Periodic dermal micro-height with irregular pores and subtle ridges."""
    gx = u * PORE_GRID
    gy = v * PORE_GRID
    cell_x = math.floor(gx)
    cell_y = math.floor(gy)
    nearest = 10.0
    nearest_amplitude = 0.0
    nearest_radius = 0.16

    # One jittered pore per periodic cell. Wrapping the hash coordinates makes
    # the first and last cells share the same neighbours across each seam.
    for oy in (-1, 0, 1):
        for ox in (-1, 0, 1):
            wrapped_x = (cell_x + ox) % PORE_GRID
            wrapped_y = (cell_y + oy) % PORE_GRID
            if hash01(wrapped_x, wrapped_y, SEED + 4) < 0.12:
                continue
            point_x = cell_x + ox + 0.18 + 0.64 * hash01(wrapped_x, wrapped_y, SEED)
            point_y = cell_y + oy + 0.18 + 0.64 * hash01(wrapped_x, wrapped_y, SEED + 1)
            distance = math.hypot(gx - point_x, gy - point_y)
            if distance < nearest:
                nearest = distance
                nearest_amplitude = 0.30 + 0.70 * hash01(wrapped_x, wrapped_y, SEED + 2)
                nearest_radius = 0.11 + 0.09 * hash01(wrapped_x, wrapped_y, SEED + 3)

    # Narrow depressions read as pores; a broad shoulder prevents pin-prick
    # aliasing without creating coarse orange-peel lobes.
    pore = -nearest_amplitude * math.exp(-((nearest / nearest_radius) ** 2))
    shoulder = 0.10 * nearest_amplitude * math.exp(-((nearest / 0.34) ** 2))

    # Integer-frequency waves are exactly periodic in UV. Their amplitudes are
    # deliberately below the pore signal and break up the otherwise uniform
    # cellular field at two dermal scales.
    waves = (
        (3, 5, 0.12, 0.41),
        (7, -4, 0.08, 1.87),
        (11, 9, 0.055, 3.02),
        (17, -13, 0.035, 5.11),
    )
    undulation = sum(
        amplitude * math.sin(math.tau * (fx * u + fy * v) + phase)
        for fx, fy, amplitude, phase in waves
    )
    return pore + shoulder + undulation


def build_periodic_height_image() -> bpy.types.Image:
    image = bpy.data.images.new(
        "resp001_periodic_pore_height",
        width=RESOLUTION,
        height=RESOLUTION,
        alpha=False,
        float_buffer=False,
        is_data=True,
    )
    try:
        image.colorspace_settings.name = "Non-Color"
    except TypeError:
        pass

    values: list[float] = []
    minimum = float("inf")
    maximum = float("-inf")
    for y in range(RESOLUTION):
        # Sampling pixel centres avoids duplicating an endpoint while remaining
        # periodic under repeat filtering.
        v = (y + 0.5) / RESOLUTION
        for x in range(RESOLUTION):
            u = (x + 0.5) / RESOLUTION
            value = pore_height(u, v)
            values.append(value)
            minimum = min(minimum, value)
            maximum = max(maximum, value)

    span = maximum - minimum
    if span <= 1e-8:
        raise RuntimeError("periodic pore height field collapsed to a constant")

    # Keep headroom at both ends so Bump interpolation cannot clip gradients.
    pixels: list[float] = []
    for value in values:
        normalised = 0.15 + 0.70 * ((value - minimum) / span)
        pixels.extend((normalised, normalised, normalised, 1.0))
    image.pixels[:] = pixels
    image.update()
    return image


def bake_normal(height_image: bpy.types.Image) -> bpy.types.Image:
    bpy.ops.mesh.primitive_plane_add(size=2.0, location=(0.0, 0.0, 0.0))
    plane = bpy.context.object
    plane.name = "resp001_pore_bake_plane"

    material = bpy.data.materials.new("resp001_pore_bake_material")
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    shader = nodes.new("ShaderNodeBsdfPrincipled")
    texture = nodes.new("ShaderNodeTexImage")
    texture.image = height_image
    texture.interpolation = "Linear"
    texture.extension = "REPEAT"
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.30
    bump.inputs["Distance"].default_value = 0.034

    links.new(texture.outputs["Color"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], shader.inputs["Normal"])
    links.new(shader.outputs["BSDF"], output.inputs["Surface"])
    plane.data.materials.append(material)

    target = bpy.data.images.new(
        "resp001_pore_detail_normal",
        width=RESOLUTION,
        height=RESOLUTION,
        alpha=False,
        float_buffer=False,
        is_data=True,
    )
    try:
        target.colorspace_settings.name = "Non-Color"
    except TypeError:
        pass
    target_node = nodes.new("ShaderNodeTexImage")
    target_node.image = target
    nodes.active = target_node

    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 8
    scene.render.bake.use_clear = True
    scene.render.bake.margin = 0
    scene.render.bake.normal_space = "TANGENT"
    plane.select_set(True)
    bpy.context.view_layer.objects.active = plane
    bpy.ops.object.bake(type="NORMAL")
    return target


def enforce_periodic_edges(image: bpy.types.Image, band: int = 4) -> None:
    """Pair and normalise opposite border texels for mip-safe repetition.

    The source height is periodic, but pixel-centre sampling means the first
    and last baked tangents sit one texel apart. Pairing a narrow border band
    removes that residual half-texel seam without flattening the interior pore
    field or inventing a visible edge stripe.
    """
    width, height = image.size
    pixels = list(image.pixels)

    def offset(x: int, y: int) -> int:
        return (y * width + x) * 4

    def pair(first: int, second: int) -> None:
        vector = []
        for channel in range(3):
            a = pixels[first + channel] * 2.0 - 1.0
            b = pixels[second + channel] * 2.0 - 1.0
            vector.append((a + b) * 0.5)
        length = math.sqrt(sum(component * component for component in vector))
        if length <= 1e-8:
            vector = [0.0, 0.0, 1.0]
        else:
            vector = [component / length for component in vector]
        for channel in range(3):
            encoded = vector[channel] * 0.5 + 0.5
            pixels[first + channel] = encoded
            pixels[second + channel] = encoded

    for depth in range(band):
        for y in range(height):
            pair(offset(depth, y), offset(width - 1 - depth, y))
        for x in range(width):
            pair(offset(x, depth), offset(x, height - 1 - depth))

    image.pixels[:] = pixels
    image.update()


def main() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"
    scene.render.image_settings.color_depth = "8"
    height = build_periodic_height_image()
    normal = bake_normal(height)
    enforce_periodic_edges(normal)
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    normal.filepath_raw = OUTPUT
    normal.file_format = "PNG"
    normal.save()
    print(
        "[bake-resp001-pore-detail] "
        f"wrote={OUTPUT} size={RESOLUTION}x{RESOLUTION} pore-grid={PORE_GRID} "
        "periodic=toroidal plane-bake=tangent-space"
    )


main()
