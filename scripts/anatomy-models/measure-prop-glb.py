"""Print world-axis bounds of one or more GLB files (headless Blender)."""
import bpy
import sys
from pathlib import Path

argv = sys.argv
args = argv[argv.index("--") + 1 :] if "--" in argv else []
if not args:
    raise SystemExit("usage: blender --background --python measure-prop-glb.py -- <file.glb> ...")

bpy.ops.wm.read_factory_settings(use_empty=True)

for path in args:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=path)
    min_c = [1e9, 1e9, 1e9]
    max_c = [-1e9, -1e9, -1e9]
    for obj in bpy.context.scene.objects:
        if obj.type != "MESH":
            continue
        for corner in obj.bound_box:
            world = obj.matrix_world @ __import__("mathutils").Vector(corner)
            for i in range(3):
                min_c[i] = min(min_c[i], world[i])
                max_c[i] = max(max_c[i], world[i])
    size = [max_c[i] - min_c[i] for i in range(3)]
    print(f"{Path(path).name}")
    print(f"  size {size[0]:.3f} {size[1]:.3f} {size[2]:.3f}")
    print(f"  min  {min_c[0]:.3f} {min_c[1]:.3f} {min_c[2]:.3f}")
    print(f"  max  {max_c[0]:.3f} {max_c[1]:.3f} {max_c[2]:.3f}")
