"""
append-clinical-morph.py — append one clinical-finding shape key to an existing
patient GLB, headless via Blender.

    /Applications/Blender.app/Contents/MacOS/Blender --background \
        --python scripts/anatomy-models/append-clinical-morph.py -- \
        <morph-name> <src.glb> <out.glb> [--inspect]

    morph names: finding_facial_droop | breathe_chest_rise_unilateral

This APPENDS to the asset as it ships rather than re-running the original bake
chain (MPFB generation → rig → clinical morphs → visemes → poses → AO bake),
which this script cannot reproduce. Existing shape keys keep their names AND
their order, so morph indices already resolved elsewhere stay valid.

`--inspect` prints the geometry a preset would touch and exports nothing.
ALWAYS run it first on a new asset — the band fractions are the only thing
standing between a clinical sign and a melted face.

Influence defaults to 0, so an exported model is visually identical until the
app drives the morph.
"""
import bpy, sys

argv = sys.argv[sys.argv.index("--") + 1:]
MORPH_NAME, SRC, OUT = argv[0], argv[1], argv[2]
INSPECT = "--inspect" in argv

# Bands are FRACTIONS of the mesh's own height (feet=0 → head=1), so a preset
# keeps working if the base mesh is swapped.
#
#   lo/hi/peak   height band and where the effect is strongest
#   down/out     displacement in metres at full weight
#   side         +1 / -1 = one side of the midline only; 0 = both sides
#   fade         how far from the midline the effect reaches full strength,
#                as a fraction of the BAND's own half-width
#   lateral_max  metres from the midline past which the effect is 0. Needed
#                whenever the band also contains the arms — at chest height
#                the widest vertices are the HANDS, so a midline fade alone
#                would lift the arm along with the hemithorax.
PRESETS = {
    # The F of FAST. Stops BELOW the brow on purpose: in a stroke (upper motor
    # neurone lesion) the forehead is SPARED, and forehead involvement is what
    # points at Bell's palsy (lower motor neurone) instead. Drooping the brow
    # here would teach students the wrong discriminator.
    "finding_facial_droop": dict(
        lo=0.880, hi=0.945, peak=0.918, down=0.011, out=0.004, side=1.0, fade=0.28,
        lateral_max=0.0,
    ),
    # One hemithorax rising while the other stays put — what a tension
    # pneumothorax or a flail segment actually looks like. Driven INSTEAD of
    # the symmetric breathe_chest_rise, so only the good side moves.
    # `down` is negative because this lifts rather than sags.
    "breathe_chest_rise_unilateral": dict(
        lo=0.620, hi=0.820, peak=0.720, down=-0.022, out=0.0, side=1.0, fade=0.18,
        lateral_max=0.22,
    ),
}

if MORPH_NAME not in PRESETS:
    print(f"ERROR: unknown morph '{MORPH_NAME}'. Known: {list(PRESETS)}")
    sys.exit(1)
P = PRESETS[MORPH_NAME]


def smoothstep(e0, e1, x):
    if e1 == e0:
        return 0.0
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def band_weight(zf):
    """Smooth ramp up to the peak, smooth ramp back down to the top."""
    if zf < P["lo"] or zf > P["hi"]:
        return 0.0
    if zf <= P["peak"]:
        return smoothstep(P["lo"], P["peak"], zf)
    return 1.0 - smoothstep(P["peak"], P["hi"], zf)


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=SRC)

    meshes = [o for o in bpy.data.objects if o.type == 'MESH']
    if not meshes:
        print("ERROR: no mesh in", SRC)
        sys.exit(1)
    obj = max(meshes, key=lambda o: len(o.data.vertices))
    mesh = obj.data
    print(f"target skin mesh: '{obj.name}' verts={len(mesh.vertices)}")

    existing = [k.name for k in mesh.shape_keys.key_blocks] if mesh.shape_keys else []
    print(f"existing shape keys ({len(existing)}): {existing}")
    if MORPH_NAME in existing:
        print(f"ERROR: '{MORPH_NAME}' already present — refusing to duplicate")
        sys.exit(1)

    zs = [v.co.z for v in mesh.vertices]
    z_min, z_max = min(zs), max(zs)
    height = z_max - z_min
    scale = obj.matrix_world.to_scale().x or 1.0
    patient_scale = height / 1.8
    print(f"z=[{z_min:.3f},{z_max:.3f}] height={height:.3f} scale={scale:.4f}")

    # Half-width of THIS band only — the whole body's half width is the
    # shoulders, and the midline fade would never engage.
    band_xs = [
        abs(v.co.x) for v in mesh.vertices
        if P["lo"] <= (v.co.z - z_min) / height <= P["hi"]
    ]
    if not band_xs:
        print("ERROR: no vertices in the band — check lo/hi")
        sys.exit(1)
    band_half_w = max(band_xs)
    print(f"band: {len(band_xs)} verts, halfW={band_half_w:.4f}")

    side = P["side"]
    fade_local = P["fade"] * band_half_w
    lateral_max_local = P.get("lateral_max", 0.0) * patient_scale / scale

    def weight_for(v):
        w = band_weight((v.co.z - z_min) / height)
        if w <= 0:
            return 0.0
        if side != 0:
            signed = v.co.x * side
            if signed <= 0:
                return 0.0
            w *= smoothstep(0.0, fade_local, signed)
        if lateral_max_local:
            w *= 1.0 - smoothstep(0.0, lateral_max_local, abs(v.co.x))
        return w

    if INSPECT:
        buckets = {}
        for v in mesh.vertices:
            if weight_for(v) > 0:
                zf = round((v.co.z - z_min) / height, 2)
                buckets[zf] = buckets.get(zf, 0) + 1
        print(f"'{MORPH_NAME}' would displace by height fraction:")
        for zf in sorted(buckets):
            print(f"  zf={zf:.2f}  {buckets[zf]} verts")
        print(f"TOTAL would displace: {sum(buckets.values())} verts")
        xs = {}
        for v in mesh.vertices:
            if weight_for(v) > 0:
                xs[round(abs(v.co.x), 2)] = xs.get(round(abs(v.co.x), 2), 0) + 1
        print("  |x| spread of displaced verts:", sorted(xs)[:1], "..", sorted(xs)[-1:])
        return

    if not mesh.shape_keys:
        obj.shape_key_add(name="Basis", from_mix=False)

    key = obj.shape_key_add(name=MORPH_NAME, from_mix=False)
    down_local = P["down"] * patient_scale / scale
    out_local = P["out"] * patient_scale / scale
    moved = 0
    for i, v in enumerate(mesh.vertices):
        w = weight_for(v)
        if w <= 0:
            continue
        co = v.co.copy()
        co.z -= down_local * w
        if out_local:
            co.x += out_local * w * (side or 1.0)
        key.data[i].co = co
        moved += 1

    key.value = 0.0
    print(f"morph '{MORPH_NAME}': displaced {moved} verts")

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
    print("wrote", OUT)


main()
