"""
add-clinical-morphs.py — author clinical-finding morph targets onto a patient
GLB, headless via Blender.

    /Applications/Blender.app/Contents/MacOS/Blender --background \
        --python scripts/anatomy-models/add-clinical-morphs.py -- \
        public/models/patient.glb.orig public/models/patient.glb

Adds shape keys (morph targets) the app's findings layer drives by name:
  - breathe_chest_rise        chest + upper abdomen rise (driven at case RR)
  - finding_abdo_distension   abdominal wall protrusion
  - finding_jvd               jugular/neck fullness

Each morph displaces vertices within a height band (Z, feet=0 → head=top)
ALONG THEIR NORMAL, weighted by a smoothstep falloff across the band, so the
effect reads as natural swelling regardless of which way the model faces.
Influence defaults to 0, so the exported model looks identical until the app
drives a morph — safe to ship even before wiring.

Bands are FRACTIONS of the mesh's own height, so this keeps working if the
base mesh is swapped (Character Creator export, etc.).
"""
import bpy, sys

argv = sys.argv[sys.argv.index("--") + 1:]
SRC, OUT = argv[0], argv[1]
# Skin mesh name: 3rd arg, or auto-detect the highest-vertex mesh (the body).
SKIN_MESH = argv[2] if len(argv) > 2 else None

# Band as (lo_frac, hi_frac) of height, plus displacement metres and a
# lateral mask. lateral_max limits |x| (centreline proximity) so e.g. the
# JVD doesn't balloon the shoulders; front_only pushes the belly forward.
MORPHS = {
    "breathe_chest_rise":      dict(lo=0.62, hi=0.82, disp=0.022, lateral_max=0.32),
    "finding_abdo_distension": dict(lo=0.50, hi=0.66, disp=0.055, lateral_max=0.30),
    "finding_jvd":             dict(lo=0.80, hi=0.88, disp=0.018, lateral_max=0.12),
}


def smoothstep(e0, e1, x):
    if e1 == e0:
        return 0.0
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def band_weight(zf, lo, hi):
    """Triangular smoothstep peaking at band centre, 0 at edges."""
    mid = (lo + hi) / 2
    if zf < lo or zf > hi:
        return 0.0
    if zf <= mid:
        return smoothstep(lo, mid, zf)
    return 1.0 - smoothstep(mid, hi, zf)


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=SRC)

    # Drop the stray Icosphere junk mesh if present.
    junk = bpy.data.objects.get("Icosphere")
    if junk:
        bpy.data.objects.remove(junk, do_unlink=True)

    if SKIN_MESH:
        obj = bpy.data.objects.get(SKIN_MESH)
    else:
        # Auto-detect: the body is the mesh with the most vertices.
        meshes = [o for o in bpy.data.objects if o.type == 'MESH']
        obj = max(meshes, key=lambda o: len(o.data.vertices)) if meshes else None
    if not obj:
        print(f"ERROR: skin mesh not found (SKIN_MESH={SKIN_MESH})")
        sys.exit(1)
    print(f"target skin mesh: '{obj.name}'")
    mesh = obj.data

    # Local-space height bbox + half-width for lateral mask.
    zs = [v.co.z for v in mesh.vertices]
    z_min, z_max = min(zs), max(zs)
    height = z_max - z_min
    half_w = max(abs(v.co.x) for v in mesh.vertices)
    print(f"mesh '{obj.name}': verts={len(mesh.vertices)} z=[{z_min:.2f},{z_max:.2f}] height={height:.2f} halfW={half_w:.2f}")

    # Per-vertex normals (Blender 4.x: mesh.vertex_normals; fallback to v.normal).
    def vnormal(i):
        return mesh.vertices[i].normal

    # Ensure a Basis shape key exists.
    if not mesh.shape_keys:
        obj.shape_key_add(name="Basis", from_mix=False)

    # Convert displacement metres to LOCAL units. matrix_world is a uniform
    # 0.01 scale on this asset, so local = world / scale.
    scale = obj.matrix_world.to_scale().x or 1.0
    print(f"scale={scale:.4f} (local disp = metres/{scale:.4f})")

    for name, p in MORPHS.items():
        key = obj.shape_key_add(name=name, from_mix=False)
        lateral_max_local = p["lateral_max"] / scale
        disp_local = p["disp"] / scale
        moved = 0
        for i, v in enumerate(mesh.vertices):
            zf = (v.co.z - z_min) / height
            w = band_weight(zf, p["lo"], p["hi"])
            if w <= 0:
                continue
            # Lateral mask: full weight near centreline, fades to 0 past lateral_max.
            lat = 1.0 - smoothstep(0.0, lateral_max_local, abs(v.co.x))
            w *= lat
            if w <= 0:
                continue
            n = vnormal(i)
            key.data[i].co = v.co + n * (disp_local * w)
            moved += 1
        key.value = 0.0  # default off — model looks unchanged until driven
        print(f"morph '{name}': displaced {moved} verts (band {p['lo']:.2f}-{p['hi']:.2f})")

    # Export Draco-compressed GLB.
    bpy.ops.export_scene.gltf(
        filepath=OUT,
        export_format="GLB",
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_morph=True,
        export_morph_normal=True,
        export_skins=True,
        export_yup=True,
    )
    print(f"EXPORTED {OUT}")


main()
