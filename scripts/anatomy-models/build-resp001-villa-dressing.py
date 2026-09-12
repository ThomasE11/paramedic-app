"""Build the resp-001 villa's case-specific, lived-in furniture dressing.

Run with:
  /Applications/Blender.app/Contents/MacOS/Blender --background --python \
    scripts/anatomy-models/build-resp001-villa-dressing.py

The exported GLB contains the furniture dressing and an authored patient chair
registered to the shared seat plant. The room shell and lighting remain in
React so camera bounds and the adaptive shadow budget stay under the existing
runtime's control. React hides the named chair meshes after patient transfer.
"""

from __future__ import annotations

import math
import hashlib
from pathlib import Path
import urllib.request

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "public/models/scenes/resp-001-villa-dressing.glb"
PREVIEW = ROOT / "test-results/resp-001-villa-dressing-blender.png"
TEXTURE_CACHE = Path("/tmp/paramedic-resp001-villa-textures")

COTTON_MAPS = {
    "diffuse": {
        "url": "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/cotton_jersey/cotton_jersey_diff_1k.jpg",
        "md5": "d2f4493fdd48634b50d40f810ce9deb7",
    },
    "normal": {
        "url": "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/cotton_jersey/cotton_jersey_nor_gl_1k.jpg",
        "md5": "2dcc9dda3b726477f607c808e52f1833",
    },
    "roughness": {
        "url": "https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/cotton_jersey/cotton_jersey_rough_1k.jpg",
        "md5": "ac691d215d3aca34dcd6ea2d03937286",
    },
}


def mat(name: str, colour: tuple[float, float, float, float], roughness: float = 0.6,
        metallic: float = 0.0) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.diffuse_color = colour
    material.use_nodes = True
    principled = material.node_tree.nodes.get("Principled BSDF")
    principled.inputs["Base Color"].default_value = colour
    principled.inputs["Roughness"].default_value = roughness
    principled.inputs["Metallic"].default_value = metallic
    return material


def checked_download(name: str, source: dict[str, str]) -> Path:
    TEXTURE_CACHE.mkdir(parents=True, exist_ok=True)
    target = TEXTURE_CACHE / f"cotton_jersey_{name}_1k.jpg"
    if not target.exists() or hashlib.md5(target.read_bytes()).hexdigest() != source["md5"]:
        request = urllib.request.Request(source["url"], headers={"User-Agent": "ParaMedic-Studio/1.0 (asset provenance audit)"})
        with urllib.request.urlopen(request) as response:
            target.write_bytes(response.read())
    actual = hashlib.md5(target.read_bytes()).hexdigest()
    if actual != source["md5"]:
        raise RuntimeError(f"Checksum mismatch for {target}: {actual}")
    return target


def cotton_material() -> bpy.types.Material:
    paths = {name: checked_download(name, source) for name, source in COTTON_MAPS.items()}
    material = bpy.data.materials.new("polyhaven_cotton_jersey_upholstery")
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    principled = nodes.get("Principled BSDF")

    diffuse = nodes.new("ShaderNodeTexImage")
    diffuse.image = bpy.data.images.load(str(paths["diffuse"]), check_existing=True)
    diffuse.image.pack()
    links.new(diffuse.outputs["Color"], principled.inputs["Base Color"])

    roughness = nodes.new("ShaderNodeTexImage")
    roughness.image = bpy.data.images.load(str(paths["roughness"]), check_existing=True)
    roughness.image.colorspace_settings.name = "Non-Color"
    roughness.image.pack()
    links.new(roughness.outputs["Color"], principled.inputs["Roughness"])

    normal = nodes.new("ShaderNodeTexImage")
    normal.image = bpy.data.images.load(str(paths["normal"]), check_existing=True)
    normal.image.colorspace_settings.name = "Non-Color"
    normal.image.pack()
    normal_map = nodes.new("ShaderNodeNormalMap")
    normal_map.inputs["Strength"].default_value = 0.65
    links.new(normal.outputs["Color"], normal_map.inputs["Color"])
    links.new(normal_map.outputs["Normal"], principled.inputs["Normal"])
    return material


def rounded_box(name: str, location: tuple[float, float, float],
                scale: tuple[float, float, float], material: bpy.types.Material,
                bevel: float = 0.035) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = (scale[0] / 2, scale[1] / 2, scale[2] / 2)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    modifier = obj.modifiers.new("softened_edges", "BEVEL")
    modifier.width = bevel
    modifier.segments = 3
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth_by_angle()
    obj.data.materials.append(material)
    return obj


def cylinder(name: str, location: tuple[float, float, float], radius: float,
             depth: float, material: bpy.types.Material, vertices: int = 24) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    return obj


def uv_sphere(name: str, location: tuple[float, float, float],
              scale: tuple[float, float, float], material: bpy.types.Material) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=12, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(material)
    bpy.ops.object.shade_smooth()
    return obj


def add_materials() -> dict[str, bpy.types.Material]:
    return {
        "linen": cotton_material(),
        "linen_light": mat("oatmeal_cushion", (0.70, 0.60, 0.46, 1), 0.96),
        "accent": mat("indigo_cushion", (0.10, 0.18, 0.24, 1), 0.92),
        "wood": mat("walnut_wood", (0.20, 0.095, 0.035, 1), 0.48),
        "wood_light": mat("book_oak", (0.43, 0.25, 0.10, 1), 0.62),
        "rug": mat("woven_rug_warm_sand", (0.30, 0.24, 0.17, 1), 0.98),
        "rug_border": mat("woven_rug_muted_rust", (0.48, 0.22, 0.09, 1), 1.0),
        "ceramic": mat("cream_ceramic", (0.82, 0.75, 0.62, 1), 0.32),
        "glass": mat("water_glass", (0.60, 0.78, 0.82, 0.38), 0.08),
        "blue": mat("salbutamol_blue", (0.045, 0.23, 0.55, 1), 0.38),
        "paper": mat("paper_tissue", (0.92, 0.89, 0.80, 1), 0.9),
        "green": mat("date_palm_leaf", (0.08, 0.24, 0.10, 1), 0.82),
        "pot": mat("unglazed_terracotta", (0.44, 0.18, 0.10, 1), 0.92),
        "metal": mat("dark_brass", (0.23, 0.17, 0.09, 1), 0.3, 0.55),
        "red": mat("book_cloth_red", (0.42, 0.075, 0.05, 1), 0.88),
        "cream": mat("book_cloth_cream", (0.76, 0.65, 0.48, 1), 0.88),
    }


def add_rug(materials: dict[str, bpy.types.Material]) -> None:
    rounded_box("villa_woven_rug", (0.0, -0.15, 0.016), (3.75, 2.65, 0.032), materials["rug"], 0.025)
    # Inlaid border reads as woven pattern without adding image textures.
    for x in (-1.69, 1.69):
        rounded_box(f"rug_border_x_{x}", (x, -0.15, 0.035), (0.075, 2.35, 0.016), materials["rug_border"], 0.008)
    for y in (-1.265, 0.965):
        rounded_box(f"rug_border_y_{y}", (0.0, y, 0.035), (3.45, 0.075, 0.016), materials["rug_border"], 0.008)


def add_sofa(materials: dict[str, bpy.types.Material]) -> None:
    # Blender Y is room depth; +Y exports towards the room's back (-Z in R3F).
    centre_y = 2.08
    rounded_box("villa_sofa_plinth", (-1.54, centre_y, 0.23), (2.45, 0.80, 0.34), materials["linen"], 0.09)
    rounded_box("villa_sofa_back", (-1.54, centre_y + 0.31, 0.69), (2.45, 0.22, 0.78), materials["linen"], 0.08)
    for index, x in enumerate((-2.28, -1.54, -0.80)):
        cushion = rounded_box(f"villa_sofa_seat_{index}", (x, centre_y - 0.06, 0.48), (0.68, 0.65, 0.16), materials["linen_light"], 0.065)
        cushion.rotation_euler[2] = (-0.012, 0.008, 0.018)[index]
    for x in (-2.72, -0.36):
        rounded_box(f"villa_sofa_arm_{x}", (x, centre_y, 0.54), (0.18, 0.80, 0.54), materials["linen"], 0.07)
    # Deliberately imperfect cushions make the room occupied, not staged.
    cushions = [
        (-2.24, 2.30, 0.79, 0.11, materials["accent"]),
        (-1.55, 2.34, 0.80, -0.05, materials["linen_light"]),
        (-0.82, 2.29, 0.78, -0.12, materials["accent"]),
    ]
    for index, (x, y, z, tilt, material) in enumerate(cushions):
        obj = rounded_box(f"villa_loose_cushion_{index}", (x, y, z), (0.52, 0.14, 0.48), material, 0.10)
        obj.rotation_euler[1] = tilt


def add_coffee_table(materials: dict[str, bpy.types.Material]) -> None:
    # Shifted aside to preserve the clinician's approach corridor to the chair.
    x, y = -1.88, -1.12
    rounded_box("villa_coffee_table_top", (x, y, 0.37), (1.05, 0.62, 0.07), materials["wood"], 0.035)
    rounded_box("villa_coffee_table_shelf", (x, y, 0.13), (0.92, 0.52, 0.04), materials["wood_light"], 0.025)
    for dx in (-0.44, 0.44):
        for dy in (-0.225, 0.225):
            rounded_box(f"coffee_leg_{dx}_{dy}", (x + dx, y + dy, 0.19), (0.045, 0.045, 0.36), materials["wood"], 0.012)
    # A remote and a current book: sparse, recognisable evidence of use.
    rounded_box("television_remote", (x - 0.20, y - 0.05, 0.425), (0.20, 0.065, 0.025), materials["accent"], 0.012)
    rounded_box("coffee_table_book", (x + 0.20, y + 0.06, 0.425), (0.30, 0.22, 0.035), materials["red"], 0.012)


def add_breathing_side_table(materials: dict[str, bpy.types.Material]) -> None:
    # Patient is seated at the origin. This table is within reach but outside
    # the forearm support and body-click corridors used during assessment.
    x, y = 1.28, -0.05
    cylinder("side_table_top", (x, y, 0.58), 0.36, 0.055, materials["wood"], 32)
    cylinder("side_table_stem", (x, y, 0.30), 0.035, 0.53, materials["metal"], 16)
    cylinder("side_table_foot", (x, y, 0.035), 0.25, 0.05, materials["metal"], 24)

    # Asthma narrative props: reliever, water and tissues. These explain the
    # patient's preceding self-care without turning into interaction targets.
    inhaler = rounded_box("blue_reliever_inhaler", (x - 0.12, y - 0.04, 0.64), (0.07, 0.04, 0.13), materials["blue"], 0.015)
    inhaler.rotation_euler[1] = math.radians(-12)
    rounded_box("inhaler_mouthpiece", (x - 0.08, y - 0.04, 0.595), (0.09, 0.045, 0.04), materials["blue"], 0.012)
    cylinder("water_glass", (x + 0.11, y + 0.06, 0.68), 0.055, 0.18, materials["glass"], 24)
    rounded_box("tissue_box", (x + 0.03, y - 0.15, 0.65), (0.18, 0.11, 0.10), materials["cream"], 0.022)
    tissue = rounded_box("raised_tissue", (x + 0.03, y - 0.15, 0.73), (0.055, 0.012, 0.10), materials["paper"], 0.018)
    tissue.rotation_euler[1] = math.radians(8)


def add_patient_chair(materials: dict[str, bpy.types.Material]) -> None:
    """Author the resp-001 support chair at the shared seated plant.

    The cushion top is exactly 0.53 m and its R3F depth centre is 0.32 m,
    matching PATIENT_CHAIR_SEAT_Y / PATIENT_CHAIR_SEAT_Z in kenneyChairPlant.
    Blender +Y exports towards R3F -Z, hence the -0.32 m depth coordinate.
    """
    rounded_box("asthma_chair_seat_frame", (0, -0.32, 0.445), (0.66, 0.60, 0.075), materials["wood"], 0.025)
    rounded_box("asthma_chair_seat_cushion", (0, -0.32, 0.49), (0.62, 0.57, 0.08), materials["linen"], 0.055)
    rounded_box("asthma_chair_back_frame", (0, -0.055, 0.83), (0.65, 0.065, 0.69), materials["wood"], 0.025)
    rounded_box("asthma_chair_back_cushion", (0, -0.09, 0.84), (0.57, 0.10, 0.59), materials["linen_light"], 0.075)
    for x in (-0.27, 0.27):
        for y in (-0.10, -0.54):
            leg = cylinder(f"asthma_chair_leg_{x}_{y}", (x, y, 0.22), 0.028, 0.44, materials["wood"], 16)
            leg.rotation_euler[1] = math.radians(2 if x < 0 else -2)


def add_console_and_plant(materials: dict[str, bpy.types.Material]) -> None:
    # Low console on the right wall balances the sofa without closing the room.
    x = 2.91
    rounded_box("villa_media_console", (x, 0.35, 0.38), (0.34, 1.65, 0.66), materials["wood"], 0.045)
    for y in (-0.18, 0.35, 0.88):
        rounded_box(f"console_door_{y}", (x - 0.185, y, 0.42), (0.025, 0.43, 0.44), materials["wood_light"], 0.015)
        cylinder(f"console_pull_{y}", (x - 0.21, y, 0.42), 0.015, 0.035, materials["metal"], 12).rotation_euler[1] = math.pi / 2
    # Two stacked books and a shallow ceramic bowl keep the surface human-scale.
    rounded_box("console_book_red", (x - 0.19, 0.05, 0.75), (0.20, 0.34, 0.035), materials["red"], 0.01)
    rounded_box("console_book_cream", (x - 0.19, 0.05, 0.79), (0.18, 0.31, 0.035), materials["cream"], 0.01)
    cylinder("console_ceramic_bowl", (x - 0.19, 0.70, 0.78), 0.12, 0.055, materials["ceramic"], 32)

    # Potted date palm in the hall-side corner, using a small silhouette count.
    # Its narrow, raised crown clears the seated patient's head from both side
    # orbits while the pot stays tucked between the sofa and left wall.
    px, py = -2.64, 1.30
    cylinder("date_palm_pot", (px, py, 0.20), 0.22, 0.40, materials["pot"], 24)
    cylinder("date_palm_trunk", (px, py, 0.98), 0.045, 1.40, materials["wood_light"], 12)
    for index in range(9):
        angle = index * (math.tau / 9)
        leaf = uv_sphere(
            f"date_palm_frond_{index}",
            (px + math.cos(angle) * 0.23, py + math.sin(angle) * 0.23, 1.67 + (index % 2) * 0.08),
            (0.31, 0.045, 0.075),
            materials["green"],
        )
        leaf.rotation_euler[2] = angle
        leaf.rotation_euler[1] = math.radians(10 + (index % 3) * 6)


def add_wall_art(materials: dict[str, bpy.types.Material]) -> None:
    # Three small family-photo frames, mounted on the right wall. Their shallow
    # depth keeps them well outside the orbit envelope and patient sightline.
    for index, (y, z, colour) in enumerate(((0.95, 1.65, "accent"), (0.30, 1.82, "rug_border"), (-0.35, 1.58, "linen_light"))):
        rounded_box(f"wall_frame_{index}", (3.16, y, z), (0.055, 0.48, 0.58), materials["wood"], 0.02)
        rounded_box(f"wall_print_{index}", (3.125, y, z), (0.012, 0.38, 0.47), materials[colour], 0.008)


def add_preview_room(materials: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    preview: list[bpy.types.Object] = []
    plaster = mat("preview_warm_plaster", (0.76, 0.69, 0.57, 1), 0.9)
    floor = mat("preview_oak_floor", (0.34, 0.18, 0.07, 1), 0.62)
    preview.append(rounded_box("preview_floor", (0, 0, -0.04), (6.5, 5.4, 0.08), floor, 0.01))
    preview.append(rounded_box("preview_back_wall", (0, 2.65, 1.36), (6.5, 0.08, 2.72), plaster, 0.01))
    preview.append(rounded_box("preview_right_wall", (3.25, 0, 1.36), (0.08, 5.4, 2.72), plaster, 0.01))
    return preview


def point_camera(camera: bpy.types.Object, target: tuple[float, float, float]) -> None:
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()


def main() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    materials = add_materials()
    add_rug(materials)
    add_sofa(materials)
    add_coffee_table(materials)
    add_breathing_side_table(materials)
    add_patient_chair(materials)
    add_console_and_plant(materials)
    add_wall_art(materials)

    dressing = list(bpy.context.scene.objects)
    for obj in dressing:
        obj["paramedic_scene_profile"] = "resp-001-villa"

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    for obj in dressing:
        if obj.type == "MESH":
            obj.select_set(True)
    bpy.context.view_layer.objects.active = dressing[0]
    bpy.ops.export_scene.gltf(
        filepath=str(OUTPUT),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_materials="EXPORT",
        export_yup=True,
    )

    add_preview_room(materials)
    bpy.ops.object.light_add(type="AREA", location=(-2.2, -1.5, 4.4))
    key = bpy.context.object
    key.name = "preview_window_key"
    key.data.energy = 950
    key.data.shape = "RECTANGLE"
    key.data.size = 3.2
    key.data.color = (1.0, 0.76, 0.52)
    point_camera(key, (0, 0.3, 0.7))
    bpy.ops.object.light_add(type="AREA", location=(2.5, -0.3, 2.2))
    fill = bpy.context.object
    fill.data.energy = 420
    fill.data.size = 2.0
    fill.data.color = (0.55, 0.68, 1.0)
    point_camera(fill, (0, 0.5, 0.7))

    bpy.ops.object.camera_add(location=(-5.3, -7.4, 3.5))
    camera = bpy.context.object
    camera.data.lens = 46
    point_camera(camera, (0, 0.55, 0.75))
    bpy.context.scene.camera = camera

    world = bpy.context.scene.world or bpy.data.worlds.new("preview_world")
    bpy.context.scene.world = world
    world.color = (0.025, 0.025, 0.025)
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1100
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(PREVIEW)
    scene.render.film_transparent = False
    scene.view_settings.look = "AgX - Medium High Contrast"
    PREVIEW.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.render.render(write_still=True)
    print(f"Exported {OUTPUT}")
    print(f"Rendered {PREVIEW}")


if __name__ == "__main__":
    main()
