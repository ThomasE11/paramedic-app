# Stage-2 gate 0: prove the Blender import -> export round-trip preserves the
# clinical contract (shape-key names + PNG texture) before we author anything.
#
# Run: /Applications/Blender.app/Contents/MacOS/Blender --background \
#        --python scripts/blender-roundtrip-test.py -- <in.glb> <out.glb>
# Then: node scripts/verify-glb.cjs <out.glb>
import sys

import bpy

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
src = argv[0] if len(argv) > 0 else "public/models/patient.glb"
dst = argv[1] if len(argv) > 1 else "/tmp/roundtrip.glb"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)

for obj in bpy.data.objects:
    print(f"object: {obj.name!r} type={obj.type} matrix_world=\n{obj.matrix_world}")
    if obj.type == "MESH":
        keys = obj.data.shape_keys
        names = [kb.name for kb in keys.key_blocks] if keys else []
        print(f"  verts={len(obj.data.vertices)} shape_keys={names}")
        print(f"  uv_layers={[l.name for l in obj.data.uv_layers]}")
for img in bpy.data.images:
    print(f"image: {img.name!r} {img.size[0]}x{img.size[1]} packed={img.packed_file is not None}")

bpy.ops.export_scene.gltf(
    filepath=dst,
    export_format="GLB",
    export_yup=True,
    export_morph=True,
    export_morph_normal=True,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_image_format="AUTO",
)
print(f"exported {dst}")
