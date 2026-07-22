"""
A2 — Bake skin maps for the Phase-B SSS material (REALISM_OVERHAUL_PLAN §2.1).

Headless:
    /Applications/Blender.app/Contents/MacOS/blender --background \
        --python scripts/anatomy-models/bake-skin-maps.py

Bakes three 2K textures off the (masculinized) patient-male body mesh, using its
existing `UVMap`, and writes them next to the GLB. These are consumed at runtime
by the SSS `MeshPhysicalMaterial` in Phase B — NOT embedded in the GLB, so the
diffuse (and its red eye texels) stays byte-identical.

  1. patient-male-skin-thickness.png — thickness / translucency mask.
     Cycles "AO" with rays cast INWARD (only_local + inside) → thin parts
     (ears, nostrils, fingers, lips) read bright = translucent; the torso core
     reads dark. Feeds MeshPhysicalMaterial.thickness so key light glows through
     the thin bits.

  2. patient-male-skin-ao.png — cavity/ambient occlusion.
     Standard Cycles AO (outward rays). Darkens creases, nostrils, ear folds,
     under the jaw. Feeds the AO channel so corners read grounded.

  3. patient-male-skin-detail-normal.png — tiling micro-normal (pores).
     A procedural Voronoi/noise bump baked flat to a small tiling normal; the
     runtime blends it as a detail-normal (§2.1 onBeforeCompile) so skin shows
     pores on zoom without a giant unique normal map.

  ponytail: pore detail is a TILING map baked once, not a unique 4K normal —
  a few KB that tiles over the whole body. Bake a unique high-res normal only
  if a specific area (face) ever needs bespoke pores.

Cycles is required for baking (Eevee can't bake AO/thickness). Runs on CPU in
headless; sample counts kept low — these are soft masks, not hero renders.
"""

import bpy
import os

OUT_DIR = os.path.abspath("public/models")
SRC = os.path.join(OUT_DIR, "patient-male.glb")
RES = 2048
THICK_PNG = os.path.join(OUT_DIR, "patient-male-skin-thickness.png")
AO_PNG = os.path.join(OUT_DIR, "patient-male-skin-ao.png")
DETAIL_PNG = os.path.join(OUT_DIR, "patient-male-skin-detail-normal.png")


def log(m):
    print(f"[skin-maps] {m}")


def setup_cycles(samples):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.render.bake.margin = 8


def import_body(samples):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=SRC)
    setup_cycles(samples)  # AFTER factory reset — reset would clobber engine
    o = bpy.data.objects.get("Patient")
    if o is None:
        raise RuntimeError("Patient mesh not found")
    # bake only the body — hide/deselect the eye meshes
    for ob in bpy.data.objects:
        ob.select_set(False)
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    return o


def new_bake_image(name, res, is_data):
    img = bpy.data.images.new(name, width=res, height=res, alpha=False,
                              float_buffer=False, is_data=is_data)
    return img


def attach_bake_target(obj, img):
    """Give the object a material with an active image node so Cycles bakes to it."""
    mat = obj.data.materials[0] if obj.data.materials else None
    if mat is None:
        mat = bpy.data.materials.new("bake_mat")
        obj.data.materials.append(mat)
    mat.use_nodes = True
    nt = mat.node_tree
    node = nt.nodes.new("ShaderNodeTexImage")
    node.image = img
    nt.nodes.active = node
    return node


def cleanup_bake_node(obj, node):
    mat = obj.data.materials[0]
    mat.node_tree.nodes.remove(node)


def bake_ao(obj, inside):
    """Bake AO. inside=True casts inward → a thickness/translucency mask."""
    name = "thickness" if inside else "ao"
    img = new_bake_image(f"skin_{name}", RES, is_data=True)
    node = attach_bake_target(obj, img)
    sc = bpy.context.scene
    sc.render.bake.use_selected_to_active = False
    ao = sc.world.light_settings if hasattr(sc.world, "light_settings") else None
    # Cycles AO bake options live on the bake settings
    bpy.context.scene.cycles.use_fast_gi = False
    # For "inside" thickness we flip normals so AO rays sample the interior,
    # which lights up thin geometry (ears/fingers) — the classic thickness trick.
    if inside:
        _flip_normals(obj, True)
    bpy.ops.object.bake(type="AO")
    if inside:
        _flip_normals(obj, False)
    cleanup_bake_node(obj, node)
    return img


def _flip_normals(obj, flip):
    import bmesh
    me = obj.data
    bm = bmesh.new()
    bm.from_mesh(me)
    for f in bm.faces:
        f.normal_flip()
    bm.to_mesh(me)
    bm.free()
    me.update()


def bake_detail_normal(obj):
    """Bake a tiling micro-normal (pores) from a procedural bump. Baked flat via
    a temporary material whose surface normal is perturbed by noise; we bake the
    NORMAL pass. It's meant to TILE, so we don't rely on the body UVs matching
    scale — the runtime samples it with its own repeat."""
    img = new_bake_image("skin_detail_normal", 1024, is_data=True)  # 1K tiles fine
    mat = bpy.data.materials.new("pore_bump")
    mat.use_nodes = True
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    tex = nt.nodes.new("ShaderNodeTexNoise")
    tex.inputs["Scale"].default_value = 320.0   # fine pore frequency
    tex.inputs["Detail"].default_value = 4.0
    vor = nt.nodes.new("ShaderNodeTexVoronoi")
    vor.inputs["Scale"].default_value = 220.0
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.25
    mix = nt.nodes.new("ShaderNodeMixRGB")
    mix.inputs["Fac"].default_value = 0.5
    nt.links.new(tex.outputs["Fac"], mix.inputs["Color1"])
    nt.links.new(vor.outputs["Distance"], mix.inputs["Color2"])
    nt.links.new(mix.outputs["Color"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    img_node = nt.nodes.new("ShaderNodeTexImage")
    img_node.image = img
    nt.nodes.active = img_node

    # swap the pore material onto the body just for this bake
    saved = list(obj.data.materials)
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    bpy.context.scene.render.bake.normal_space = "TANGENT"
    bpy.ops.object.bake(type="NORMAL")
    # restore
    obj.data.materials.clear()
    for m in saved:
        obj.data.materials.append(m)
    return img


def normalize_rgb(img):
    """Stretch the RGB range to 0..1 so a low-contrast bake (inward-AO thickness
    reads dark) becomes a usable mask. Alpha untouched. Operates on the float
    pixel buffer in place before save."""
    px = list(img.pixels)  # RGBA flat
    lo, hi = 1.0, 0.0
    for i in range(0, len(px), 4):
        for c in range(3):
            v = px[i + c]
            if v < lo:
                lo = v
            if v > hi:
                hi = v
    rng = hi - lo
    if rng < 1e-5:
        return
    inv = 1.0 / rng
    for i in range(0, len(px), 4):
        for c in range(3):
            px[i + c] = (px[i + c] - lo) * inv
    img.pixels[:] = px


def save_png(img, path):
    img.filepath_raw = path
    img.file_format = "PNG"
    img.save()
    kb = os.path.getsize(path) / 1024
    log(f"wrote {os.path.basename(path)} ({img.size[0]}x{img.size[1]}, {kb:.0f} KB)")


def main():
    if not os.path.exists(SRC):
        raise RuntimeError(f"missing {SRC} — run A1 first")

    # --- thickness (inward AO) ---
    body = import_body(samples=64)
    thick = bake_ao(body, inside=True)
    normalize_rgb(thick)  # inward-AO reads dark → stretch to a usable mask
    save_png(thick, THICK_PNG)

    # --- AO (outward) — fresh import so flipped normals don't carry over ---
    body = import_body(samples=128)
    ao = bake_ao(body, inside=False)
    save_png(ao, AO_PNG)

    # --- detail normal (pores) ---
    body = import_body(samples=16)
    dn = bake_detail_normal(body)
    save_png(dn, DETAIL_PNG)

    log("done — 3 skin maps written")


main()
