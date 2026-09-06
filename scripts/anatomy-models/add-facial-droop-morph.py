"""
add-facial-droop-morph.py — append a unilateral facial-droop shape key to an
existing patient GLB, headless via Blender.

    /Applications/Blender.app/Contents/MacOS/Blender --background \
        --python scripts/anatomy-models/add-facial-droop-morph.py -- \
        public/models/patient-male.glb public/models/patient-male.glb [--inspect]

Facial droop is the sign a stroke case hangs on (the F of FAST), and the
patient models had no morph for it — the scenario layer declared it and the
renderer had nothing to drive. This APPENDS one shape key to the asset as it
ships today rather than re-running the original bake chain, because the live
models are the product of a long pipeline (MPFB generation → rig → clinical
morphs → visemes → poses → AO bake) that this script cannot reproduce.

`--inspect` prints the geometry it would touch and exports nothing. Always run
it first on a new asset — the band fractions below are the only thing standing
between "one side of the mouth sags" and "the patient's face melts".

The droop:
  - lives in a height band around the mouth/cheek,
  - fades out across the midline so the face never creases down the centre,
  - pulls DOWN with a little outward slack, like unopposed gravity on a
    flaccid lower face.

Influence defaults to 0, so the exported model is visually identical until the
app drives it.
"""
import bpy, sys

argv = sys.argv[sys.argv.index("--") + 1:]
SRC, OUT = argv[0], argv[1]
INSPECT = "--inspect" in argv

MORPH_NAME = "finding_facial_droop"

# Fractions of total mesh height (feet=0 → head=1).
#
# CLINICAL: this stops BELOW the brow on purpose. In a stroke (upper motor
# neurone lesion) the forehead is SPARED — the patient can still wrinkle it.
# Forehead involvement is what points at Bell's palsy (lower motor neurone)
# instead, so drooping the brow here would teach the wrong discriminator.
BAND_LO, BAND_HI = 0.880, 0.945
# Where within the band the sag is strongest (mouth corner / nasolabial fold).
BAND_PEAK = 0.918
# Downward displacement in metres at full weight, and the outward slack.
DROOP_DOWN = 0.011
DROOP_OUT = 0.004
# Side to droop: +1 = +x side. Stroke is unilateral; the app can mirror by
# flipping the model, and a single authored side keeps the asset small.
SIDE = 1.0
# How far from the midline the effect reaches full strength (fraction of the
# head's own half-width). Keeps the centreline of the face still.
MIDLINE_FADE = 0.28


def smoothstep(e0, e1, x):
    if e1 == e0:
        return 0.0
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def band_weight(zf):
    """Smooth ramp up to BAND_PEAK, smooth ramp back down to BAND_HI."""
    if zf < BAND_LO or zf > BAND_HI:
        return 0.0
    if zf <= BAND_PEAK:
        return smoothstep(BAND_LO, BAND_PEAK, zf)
    return 1.0 - smoothstep(BAND_PEAK, BAND_HI, zf)


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

    existing = []
    if mesh.shape_keys:
        existing = [k.name for k in mesh.shape_keys.key_blocks]
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

    # Half-width of the head band only — using the whole body's half width
    # would be the shoulders and the midline fade would never engage.
    head_xs = [
        abs(v.co.x) for v in mesh.vertices
        if BAND_LO <= (v.co.z - z_min) / height <= BAND_HI
    ]
    if not head_xs:
        print("ERROR: no vertices in the head band — check BAND_LO/BAND_HI")
        sys.exit(1)
    head_half_w = max(head_xs)
    print(f"head band: {len(head_xs)} verts, halfW={head_half_w:.4f}")

    if INSPECT:
        buckets = {}
        for v in mesh.vertices:
            zf = (v.co.z - z_min) / height
            if band_weight(zf) > 0 and v.co.x * SIDE > 0:
                buckets[round(zf, 2)] = buckets.get(round(zf, 2), 0) + 1
        print("would displace by height fraction:")
        for zf in sorted(buckets):
            print(f"  zf={zf:.2f}  {buckets[zf]} verts")
        print(f"TOTAL would displace: {sum(buckets.values())} verts")
        return

    if not mesh.shape_keys:
        obj.shape_key_add(name="Basis", from_mix=False)

    key = obj.shape_key_add(name=MORPH_NAME, from_mix=False)
    down_local = DROOP_DOWN * patient_scale / scale
    out_local = DROOP_OUT * patient_scale / scale
    fade_local = MIDLINE_FADE * head_half_w
    moved = 0
    for i, v in enumerate(mesh.vertices):
        zf = (v.co.z - z_min) / height
        w = band_weight(zf)
        if w <= 0:
            continue
        # One side only, easing across the midline.
        signed = v.co.x * SIDE
        if signed <= 0:
            continue
        w *= smoothstep(0.0, fade_local, signed)
        if w <= 0:
            continue
        key.data[i].co = v.co.copy()
        key.data[i].co.z -= down_local * w
        key.data[i].co.x += out_local * w * SIDE
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
