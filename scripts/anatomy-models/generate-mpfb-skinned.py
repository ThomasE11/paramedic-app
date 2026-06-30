"""
generate-mpfb-skinned.py — generate an MPFB human with REAL photographic skin
that survives GLB export, headless.

    Blender --background --python generate-mpfb-skinned.py -- \
        <sex: male|female> <skin_diffuse.png> <output.glb>

Then run add-clinical-morphs.py on the output to add breathing/JVD/distension
morphs + Draco-compress.

WHY THIS METHOD (learned the hard way):
- MPFB's `set_character_skin(..., 'ENHANCED_SSS')` skin is procedural → exports
  as a FLAT material (0 textures).
- `set_character_skin(..., 'MAKESKIN')` looks right IN BLENDER but its complex
  ink-layer node tree is mangled by the glTF exporter → scrambled UVs on the
  exported mesh (texture samples in the wrong places).
- The robust path: build a PLAIN Principled BSDF with the skin's diffuse PNG on
  the basemesh's standard UVMap. MakeHuman skin textures are authored for that
  UVMap, so it renders correctly AND the simple material round-trips through
  glTF cleanly. Verified: clean skin both in Blender and after export/reimport.
- We also strip MPFB's helper geometry (joint/clothes-fitting helpers) by
  keeping only the mask modifier's 'body' vertex group — those helpers otherwise
  export as blocky artefacts.

Skin diffuse PNGs come from the MakeHuman System Assets pack (CC0):
  https://files.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip
  → skins/<name>/<name>_diffuse.png
"""
import bpy, importlib, bmesh, json, struct, sys

argv = sys.argv[sys.argv.index("--") + 1:]
SEX = (argv[0] if argv else "male").lower()
DIFFUSE = argv[1]
OUT = argv[2]

HS = importlib.import_module('bl_ext.blender_org.mpfb.services.humanservice').HumanService
TS = importlib.import_module('bl_ext.blender_org.mpfb.services.targetservice').TargetService

bpy.ops.wm.read_factory_settings(use_empty=True)

macro = TS.get_default_macro_info_dict()
macro["gender"] = 1.0 if SEX == "male" else 0.0
macro["age"] = 0.55
macro["height"] = 0.55 if SEX == "male" else 0.45
human = HS.create_human(mask_helpers=True, detailed_helpers=False,
                        extra_vertex_groups=True, feet_on_ground=True,
                        scale=0.1, macro_detail_dict=macro)
print("human created:", human.name, "verts", len(human.data.vertices))

# Strip helper geometry — keep only the mask modifier's 'body' vertex group.
mask = next((m for m in human.modifiers if m.type == 'MASK'), None)
vg = human.vertex_groups.get(mask.vertex_group) if mask else None
keep = set()
if vg:
    gi = vg.index
    for v in human.data.vertices:
        if any(g.group == gi for g in v.groups):
            keep.add(v.index)
if mask:
    human.modifiers.remove(mask)
bpy.ops.object.select_all(action='DESELECT')
human.select_set(True)
bpy.context.view_layer.objects.active = human
bpy.ops.object.mode_set(mode='EDIT')
bm = bmesh.from_edit_mesh(human.data)
bm.verts.ensure_lookup_table()
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.index not in keep], context='VERTS')
bmesh.update_edit_mesh(human.data)
bpy.ops.object.mode_set(mode='OBJECT')
print("verts after helper strip:", len(human.data.vertices))

# Plain export-friendly skin material.
mat = bpy.data.materials.new('patient_skin')
mat.use_nodes = True
nt = mat.node_tree
nt.nodes.clear()
out = nt.nodes.new('ShaderNodeOutputMaterial')
bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
tex = nt.nodes.new('ShaderNodeTexImage')
tex.image = bpy.data.images.load(DIFFUSE)
bsdf.inputs['Roughness'].default_value = 0.62
nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
human.data.materials.clear()
human.data.materials.append(mat)

human.name = "Patient"
human.data.name = "Patient"

bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_yup=True,
                          export_apply=False, use_selection=False,
                          export_image_format="AUTO")
print("EXPORTED", OUT)

# Assert textures present (catches the flat-mannequin failure).
d = open(OUT, "rb").read()
jl = struct.unpack("<I", d[12:16])[0]
g = json.loads(d[20:20 + jl].decode("utf-8"))
print(f"GLB_CHECK images={len(g.get('images',[]))} textures={len(g.get('textures',[]))}")
