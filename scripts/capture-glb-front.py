# Front silhouette render of a patient GLB AS THE APP SHOWS IT: every shape key
# zeroed (BodyMesh ramps non-finding morphs to 0). Proves the baked male shape
# vs the androgynous basis the old file renders.
#   Blender --background --python scripts/capture-glb-front.py -- <in.glb> <out.png>
import sys, bpy, math

argv = sys.argv[sys.argv.index("--") + 1:]
SRC, OUT = argv[0], argv[1]
# Optional 3rd arg "finding_angioedema=1.0": force ONE morph for visual QA of
# authored shape keys; everything else stays zeroed like the app.
FORCE = argv[2].split("=") if len(argv) > 2 else None

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

body = max((o for o in bpy.data.objects if o.type == "MESH"), key=lambda o: len(o.data.vertices))
if body.data.shape_keys:
    for kb in body.data.shape_keys.key_blocks:
        kb.value = 0.0  # match the app: androgynous basis for the old file
    if FORCE and FORCE[0] in body.data.shape_keys.key_blocks:
        body.data.shape_keys.key_blocks[FORCE[0]].value = float(FORCE[1])
        print("forced", FORCE[0], "=", FORCE[1])
body.data.update()

# Frame the body: camera on -Y looking at +Y, orthographic so proportions read true.
bpy.ops.object.select_all(action="DESELECT")
for o in bpy.data.objects:
    if o.type == "MESH": o.select_set(True)
zmin = min((body.matrix_world @ v.co).z for v in body.data.vertices)
zmax = max((body.matrix_world @ v.co).z for v in body.data.vertices)
cz = (zmin + zmax) / 2
scale = (zmax - zmin) * 1.15
# Optional 4th arg "face": frame the head close-up (for facial-morph QA).
if len(argv) > 3 and argv[3] == "face":
    cz = zmin + (zmax - zmin) * 0.90
    scale = (zmax - zmin) * 0.22
cam_data = bpy.data.cameras.new("cam"); cam_data.type = "ORTHO"; cam_data.ortho_scale = scale
cam = bpy.data.objects.new("cam", cam_data); bpy.context.collection.objects.link(cam)
cam.location = (0, -4, cz); cam.rotation_euler = (math.pi/2, 0, 0)
bpy.context.scene.camera = cam

sun = bpy.data.objects.new("sun", bpy.data.lights.new("sun", "SUN"))
bpy.context.collection.objects.link(sun); sun.rotation_euler = (math.radians(60), 0, math.radians(20))
bpy.data.lights["sun"].energy = 3

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items] else "BLENDER_EEVEE"
scene.render.resolution_x = 500; scene.render.resolution_y = 900
scene.render.film_transparent = False
scene.world = bpy.data.worlds.new("w"); scene.world.use_nodes = True
scene.world.node_tree.nodes["Background"].inputs[0].default_value = (0.1, 0.1, 0.12, 1)
scene.render.filepath = OUT
bpy.ops.render.render(write_still=True)
print("rendered", OUT)
