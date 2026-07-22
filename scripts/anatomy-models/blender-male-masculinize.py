"""
A1 — Masculinize the male patient mesh (Phase A, REALISM_OVERHAUL_PLAN §2.2).

Headless:
    /Applications/Blender.app/Contents/MacOS/blender --background \
        --python scripts/anatomy-models/blender-male-masculinize.py

What it does, and — just as important — what it deliberately does NOT do:

The imported public/models/patient-male.glb is an UN-RIGGED morph-target mesh
(1 body mesh `Patient` @ 14,517 verts + 6 eye meshes; skins:0). Its clinical
contract is three shape keys — breathe_chest_rise, finding_abdo_distension,
finding_jvd — plus the two pure-red eye-socket texels EyesLayer repaints.

Shape keys store PER-VERTEX offsets against a fixed topology. So the plan's
"subdivide (OpenSubdiv) + decimate" would change the vertex set and silently
destroy all three morphs. We therefore masculinize by MOVING the Basis vertices
along masculine directions — a pure deformation, topology untouched — so every
shape key survives for free (they ride the same indices).

  ponytail: masculinize = a shape edit, done in-place on Basis. Subdivision /
  decimation SKIPPED — they'd break the shape-key topology and the eye-node
  laterality verify-glb.cjs guards, for silhouette gains a 14.5k-vert browser
  mesh doesn't need. Add a subdiv+shape-key-reproject pass only if a capture
  proves the silhouette too low-poly.

Masculinization (region-gated by Basis vertex position, all in the model's own
metres — model is ~1.6-1.7 m tall, faces +z, x = the patient's left/right):
  • jaw  — widen + square the lower face
  • brow — push the brow ridge forward
  • shoulders — broaden the deltoid span
  • hands — enlarge slightly
  • chest/waist — squarer male taper (broaden ribcage, trim hip flare)
Body-hair sheen is a MATERIAL property (roughness/sheen) set at runtime in
Phase B, not geometry — noted here, not done in Blender.

AO is NOT re-baked into the diffuse here — that would risk the red eye-socket
texels verify-glb.cjs guards. Skin AO/thickness/pore maps are baked as their
OWN textures in A2 (bake-skin-maps.py) for the Phase-B SSS material.

  ponytail: AO stays a separate map, not multiplied into diffuse — keeps the
  diffuse (and its eye texels) byte-identical, and the SSS material wants AO as
  its own channel anyway.

Output overwrites public/models/patient-male.glb (Draco, glTF exporter), after
backing up to patient-male.glb.bak.
"""

import bpy
import bmesh
import math
import os
import shutil

SRC = os.path.abspath("public/models/patient-male.glb")
BAK = SRC + ".bak"


def log(msg):
    print(f"[masculinize] {msg}")


def clean_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_glb(path):
    bpy.ops.import_scene.gltf(filepath=path)


def get_body():
    o = bpy.data.objects.get("Patient")
    if o is None or o.type != "MESH":
        raise RuntimeError("Patient body mesh not found after import")
    return o


def mesh_bounds(obj):
    """Local-space bounds of the body mesh (Basis positions)."""
    xs = [v.co.x for v in obj.data.vertices]
    ys = [v.co.y for v in obj.data.vertices]
    zs = [v.co.z for v in obj.data.vertices]
    return (min(xs), max(xs), min(ys), max(ys), min(zs), max(zs))


def smoothstep(a, b, x):
    if a == b:
        return 0.0 if x < a else 1.0
    t = max(0.0, min(1.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


def masculinize(obj):
    """Move Basis vertices along masculine directions. Topology untouched so
    every shape key (breathe_chest_rise, finding_*) survives unchanged."""
    minx, maxx, miny, maxy, minz, maxz = mesh_bounds(obj)
    height = maxy - miny
    half_w = max(abs(minx), abs(maxx)) or 1.0
    log(f"bounds y[{miny:.3f},{maxy:.3f}] height={height:.3f} half_w={half_w:.3f}")

    # Normalised body-height landmarks (fractions of total height from the feet).
    # A standing adult: head-top 1.0, chin ~0.87, brow ~0.93, shoulder ~0.82,
    # waist ~0.55, wrist ~0.42. Gated softly so edits blend, no hard seams.
    def yf(v):  # height fraction 0..1
        return (v.co.y - miny) / height if height else 0.0

    # We edit the Basis layer directly (shape key 0 is Basis; editing vertices
    # co edits Basis, and drivers/other keys keep their relative offsets).
    verts = obj.data.vertices

    moved = 0
    for v in verts:
        f = yf(v)                     # 0 feet .. 1 head-top
        x, y, z = v.co.x, v.co.y, v.co.z
        xr = x / half_w               # -1..1 signed lateral
        dx = dy = dz = 0.0

        # --- jaw: widen + square lower face (chin .82..0.90) --------------
        jaw = smoothstep(0.80, 0.86, f) * (1.0 - smoothstep(0.90, 0.95, f))
        if jaw > 0:
            # push lateral outward (square the jaw) and drop the chin a touch
            dx += xr * 0.010 * jaw
            if z > 0:                 # front of face only
                dz += 0.006 * jaw     # stronger chin projection

        # --- brow ridge: push forward (0.90..0.95, front) ----------------
        brow = smoothstep(0.895, 0.93, f) * (1.0 - smoothstep(0.955, 0.98, f))
        if brow > 0 and z > 0.02:
            dz += 0.007 * brow

        # --- shoulders: broaden deltoid span (0.76..0.86) ----------------
        sh = smoothstep(0.74, 0.80, f) * (1.0 - smoothstep(0.86, 0.90, f))
        if sh > 0:
            dx += xr * 0.028 * sh     # widen span

        # --- chest: broaden ribcage front/back (0.60..0.78) --------------
        chest = smoothstep(0.58, 0.66, f) * (1.0 - smoothstep(0.78, 0.83, f))
        if chest > 0:
            dx += xr * 0.014 * chest
            dz += (0.006 if z > 0 else -0.003) * chest  # deeper barrel chest

        # --- waist/hip: trim female flare (0.45..0.58) -------------------
        hip = smoothstep(0.42, 0.50, f) * (1.0 - smoothstep(0.58, 0.64, f))
        if hip > 0:
            dx -= xr * 0.012 * hip    # pull hips in (narrower than shoulders)

        # --- hands: enlarge slightly (below wrist ~0.38..0.46, lateral) --
        hand = (1.0 - smoothstep(0.46, 0.52, f)) * smoothstep(0.30, 0.38, f)
        if hand > 0 and abs(xr) > 0.55:
            # scale outward from local hand centre — cheap: push away from body x
            dx += (0.010 * hand) * (1 if xr > 0 else -1)

        if dx or dy or dz:
            v.co.x = x + dx
            v.co.y = y + dy
            v.co.z = z + dz
            moved += 1

    obj.data.update()
    log(f"masculinized {moved}/{len(verts)} verts")


def verify_shapekeys(obj, expected):
    keys = [k.name for k in obj.data.shape_keys.key_blocks] if obj.data.shape_keys else []
    log(f"shape keys after edit: {keys}")
    for e in expected:
        if e not in keys:
            raise RuntimeError(f"shape key '{e}' LOST during masculinize — abort")
    return keys


def export_glb(path):
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_morph=True,
        export_morph_normal=True,
        export_apply=False,           # NEVER apply modifiers — would flatten shape keys
        export_yup=True,
        use_selection=False,
    )


def main():
    if not os.path.exists(SRC):
        raise RuntimeError(f"missing {SRC}")
    if not os.path.exists(BAK):
        shutil.copy2(SRC, BAK)
        log(f"backup -> {BAK}")
    else:
        log(f"backup already exists ({BAK}) — leaving it")

    clean_scene()
    import_glb(SRC)
    body = get_body()
    expected = ["breathe_chest_rise", "finding_abdo_distension", "finding_jvd"]
    verify_shapekeys(body, expected)   # pre-check
    masculinize(body)
    verify_shapekeys(body, expected)   # post-check — must still be there

    # write to a temp then move over SRC so a mid-export crash can't corrupt it
    tmp = SRC + ".tmp.glb"
    export_glb(tmp)
    os.replace(tmp, SRC)
    size_mb = os.path.getsize(SRC) / 1024 / 1024
    log(f"exported {SRC} ({size_mb:.2f} MB)")
    if size_mb > 6.0:
        log(f"WARNING: {size_mb:.2f} MB > 6MB budget")


main()
