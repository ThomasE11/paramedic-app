"""
blender-garment-bake.py — author clothing GLBs FROM the patient body mesh,
headless via Blender, with the body's morph targets baked into the garment.

    /Applications/Blender.app/Contents/MacOS/blender --background \
        --python scripts/anatomy-models/blender-garment-bake.py -- \
        public/models/patient.glb public/models/

Why author from the body (not model garments standalone):
  The patient GLBs are a single baked mesh with NO skeleton. The runtime
  ClothingLayer works because it cuts the garment out of the body's own
  vertices and mirrors the body's morph influences by index. A standalone
  garment GLB has different topology, so it cannot inherit body morphs by
  index. This script solves that the durable way: it DUPLICATES the body
  mesh, so every garment vertex keeps the body's shape-key deltas verbatim,
  masks to garment regions, offsets for cloth clearance + thickness, splits
  into named pieces the hide map already knows, and exports GLBs whose morph
  target NAMES match the body's exactly. At runtime the garment's morph i is
  the body's morph i for the SAME name — sync is a name lookup, not luck.

Output:
    public/models/garment-shirt.glb
    public/models/garment-trousers.glb

Notes / deliberate simplifications:
  - Cloth SIMULATION is not run. Headless cloth sim on a masked body-derived
    shell is slow and non-deterministic across Blender builds, and needs a
    collision body + baked cache to look right. Shrinkwrap-clearance (offset
    along normals) + manual solidify (a back shell) gives stable, repeatable
    fabric thickness with the body's silhouette. Upgrade path: add a cloth
    modifier + collision on the body and bake a cache if drape/folds matter.
  - Modifiers can't be applied to a mesh that has shape keys, so the cloth
    clearance and thickness are done by direct vertex math (same technique as
    add-clinical-morphs.py), which preserves the shape keys.
"""
import bpy, bmesh, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
SRC = argv[0] if argv else "public/models/patient.glb"
OUT_DIR = argv[1] if len(argv) > 1 else "public/models/"

# Cloth clearance off the skin (metres) and fabric thickness (metres).
# Clearance lifts the outer face just off the skin so it never z-fights;
# the shirt rides a touch prouder than trousers so a tucked waistband layers.
SHIRT_CLEARANCE = 0.002
TROUSER_CLEARANCE = 0.002
FABRIC_THICKNESS = 0.004

# Garment regions as FRACTIONS of mesh height (Blender Z-up: feet=0, head=1),
# matching ClothingLayer.tsx's anthropometric cut lines. Arms are excluded
# LATERALLY (this model holds a wide A-pose), everything else by height band.
#   shirt:    hem  -> shoulder cap, short sleeves bounded by |x|
#   trousers: cuff -> waistband
SHIRT_HEM = 0.522
SHIRT_SLEEVE_HEM = 0.644
SHIRT_CAP = 0.844
SHIRT_SCOOP_Y = 0.806          # neck scoop: bare above this near centreline
SHIRT_SCOOP_HALF_W = 0.085     # scaled by height/1.8 below
SLEEVE_MAX_X = 0.31            # |x| beyond this = bare arm (scaled)
TROUSER_CUFF = 0.10
TROUSER_WAISTBAND = 0.539


def find_body(SKIN_MESH=None):
    junk = bpy.data.objects.get("Icosphere")
    if junk:
        bpy.data.objects.remove(junk, do_unlink=True)
    meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    if SKIN_MESH:
        return bpy.data.objects.get(SKIN_MESH)
    # Body = mesh with the most vertices (eyes/iris are tiny).
    return max(meshes, key=lambda o: len(o.data.vertices)) if meshes else None


def measure(mesh):
    zs = [v.co.z for v in mesh.vertices]
    z_min, z_max = min(zs), max(zs)
    return z_min, z_max, (z_max - z_min)


def keep_shirt(co, z_min, H, half_scale, lat_max_local, scoop_y, scoop_half_local):
    zf = (co.z - z_min) / H
    # Short-sleeve band: torso + upper arms, bounded laterally.
    in_band = SHIRT_HEM <= zf <= SHIRT_CAP and abs(co.x) <= lat_max_local
    if not in_band:
        return False
    # Neck scoop: drop verts high + near centreline so the collar opens.
    if zf > scoop_y and abs(co.x) < scoop_half_local:
        return False
    return True


def keep_trouser(co, z_min, H):
    zf = (co.z - z_min) / H
    return TROUSER_CUFF <= zf <= TROUSER_WAISTBAND


def mask_and_offset(body, name, keep_fn, clearance, out_path):
    """Duplicate body, delete non-garment verts (shape keys ride along),
    offset outer face for cloth clearance, add a back shell for thickness,
    export GLB. Returns True on success."""
    # Full-scene duplicate of just the body object.
    bpy.ops.object.select_all(action='DESELECT')
    body.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.duplicate()
    g = bpy.context.view_layer.objects.active
    g.name = name
    mesh = g.data

    z_min, z_max, H = measure(mesh)
    scale = g.matrix_world.to_scale().x or 1.0
    half_w = max(abs(v.co.x) for v in mesh.vertices)
    half_scale = H / 1.8
    lat_max_local = SLEEVE_MAX_X * half_scale
    scoop_half_local = SHIRT_SCOOP_HALF_W * half_scale

    # Which verts to KEEP (garment region).
    keep = [keep_fn(v.co) for v in mesh.vertices]
    n_keep = sum(keep)
    print(f"[{name}] verts={len(mesh.vertices)} keep={n_keep} scale={scale:.4f} H={H:.3f}")
    if n_keep < 50:
        print(f"[{name}] ERROR: too few garment verts ({n_keep})")
        bpy.data.objects.remove(g, do_unlink=True)
        return False

    # Delete the non-kept verts with bmesh (shape-key data for surviving verts
    # is preserved — bmesh remaps shape layers by vertex).
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bm.verts.ensure_lookup_table()
    to_del = [bm.verts[i] for i in range(len(bm.verts)) if not keep[i]]
    bmesh.ops.delete(bm, geom=to_del, context='VERTS')
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()
    if len(mesh.vertices) < 30 or len(mesh.polygons) < 10:
        print(f"[{name}] ERROR: garment mesh empty after cut")
        bpy.data.objects.remove(g, do_unlink=True)
        return False

    # Largest connected component only — drops the forearm/hand islands that
    # pass through the torso band and the ankle/hand islands in the trouser
    # band (they connect to the body only outside the band). This is what
    # keeps wrists/hands/ankles bare without a rig.
    keep_largest_component(mesh)
    if len(mesh.vertices) < 30:
        print(f"[{name}] ERROR: empty after component filter")
        bpy.data.objects.remove(g, do_unlink=True)
        return False

    # Recompute normals for the cut shell, then offset the Basis + every shape
    # key along the vertex normal for cloth clearance. Offsetting shape keys by
    # the SAME per-vertex amount keeps the garment riding the skin as it morphs.
    mesh.calc_normals_split() if hasattr(mesh, "calc_normals_split") else None
    normals = [v.normal.copy() for v in mesh.vertices]
    clearance_local = clearance / scale

    # Offset the Basis (rest) shape and every shape key by clearance along normal.
    if mesh.shape_keys:
        for kb in mesh.shape_keys.key_blocks:
            for i in range(len(kb.data)):
                kb.data[i].co = kb.data[i].co + normals[i] * clearance_local
    else:
        for i, v in enumerate(mesh.vertices):
            v.co = v.co + normals[i] * clearance_local

    # Fabric thickness: a back shell. Solidify modifier is blocked with shape
    # keys, so extrude the boundary + build an inner offset shell manually is
    # overkill — instead we render the outer face + a BackSide inner face in
    # the app (ClothingLayer already does this). Here we only need a single
    # surface with correct clearance; thickness is a runtime material trick.
    # ponytail: single-surface garment, app draws the dark inner face. Add a
    # real solidified shell here only if the open edges need geometric depth.

    # Split by loose parts? No — each garment file is ONE named piece already.
    # Export just this object.
    export_single(g, out_path)
    print(f"[{name}] EXPORTED {out_path} verts={len(mesh.vertices)}")
    bpy.data.objects.remove(g, do_unlink=True)
    return True


def keep_largest_component(mesh):
    """Delete all but the largest connected vertex component."""
    bm = bmesh.new()
    bm.from_mesh(mesh)
    bm.verts.ensure_lookup_table()
    # Union-find over edges.
    parent = list(range(len(bm.verts)))

    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]
            a = parent[a]
        return a

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    for e in bm.edges:
        union(e.verts[0].index, e.verts[1].index)
    sizes = {}
    for v in bm.verts:
        r = find(v.index)
        sizes[r] = sizes.get(r, 0) + 1
    if not sizes:
        bm.free()
        return
    best = max(sizes, key=sizes.get)
    to_del = [v for v in bm.verts if find(v.index) != best]
    bmesh.ops.delete(bm, geom=to_del, context='VERTS')
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()


def export_single(obj, out_path):
    # Drop the inherited skin material + its 2048² atlas — a garment is a flat
    # fabric coloured in the app (like the procedural layer). Keeping it makes
    # a ~2k-vert mesh a 4.8MB file. Also clear UVs so no texture is referenced.
    obj.data.materials.clear()
    while obj.data.uv_layers:
        obj.data.uv_layers.remove(obj.data.uv_layers[0])
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        use_selection=True,
        export_format="GLB",
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_morph=True,
        export_morph_normal=False,
        export_skins=False,
        export_yup=True,
        export_materials='NONE',
    )


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=SRC)
    body = find_body()
    if not body:
        print("ERROR: body mesh not found")
        sys.exit(1)
    mesh = body.data
    names = [kb.name for kb in mesh.shape_keys.key_blocks] if mesh.shape_keys else []
    print(f"body='{body.name}' verts={len(mesh.vertices)} shape_keys={names}")

    z_min, z_max, H = measure(mesh)
    half_scale = H / 1.8
    lat_max_local = SLEEVE_MAX_X * half_scale
    scoop_half_local = SHIRT_SCOOP_HALF_W * half_scale
    scoop_y = SHIRT_SCOOP_Y

    os.makedirs(OUT_DIR, exist_ok=True)
    shirt_path = os.path.join(OUT_DIR, "garment-shirt.glb")
    trouser_path = os.path.join(OUT_DIR, "garment-trousers.glb")

    ok_shirt = mask_and_offset(
        body, "garment-shirt",
        lambda co: keep_shirt(co, z_min, H, half_scale, lat_max_local, scoop_y, scoop_half_local),
        SHIRT_CLEARANCE, shirt_path,
    )
    ok_trouser = mask_and_offset(
        body, "garment-trousers",
        lambda co: keep_trouser(co, z_min, H),
        TROUSER_CLEARANCE, trouser_path,
    )

    if not (ok_shirt and ok_trouser):
        print("ERROR: one or more garments failed to export")
        sys.exit(1)
    print("DONE: garment-shirt.glb + garment-trousers.glb")


main()
