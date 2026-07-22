"""
A3 — Add viseme_open + posture morph targets to patient-male.glb
(REALISM_OVERHAUL_PLAN §2.4 lip-sync, §2.3 posture).

Headless:
    /Applications/Blender.app/Contents/MacOS/blender --background \
        --python scripts/anatomy-models/add-viseme-morph.py

Why morph targets and not baked skeletal clips (the plan's §2.3 wording):
patient-male.glb is UN-RIGGED (skins:0, no armature). Skeletal AnimationMixer
clips need a skinned skeleton that doesn't exist; building+skinning one would
change topology and risk the eye-node laterality verify-glb.cjs guards. So all
four are authored as SHAPE KEYS — the same mechanism breathing/findings already
use. Phase B drives them via morphTargetInfluences (the existing loop in
BodyMesh.tsx already ramps any non-finding morph), not a mixer.

  ponytail: full-body reposing via morph target is crude for big limb motion —
  fine for the seated tripod LEAN the slice needs, approximate for supine/
  recovery. Ceiling: swap these three to real skeletal clips once the mesh is
  rigged. viseme_open (a jaw drop) is genuinely well-suited to a morph.

Morphs added (default value 0 → model unchanged until driven):
  • viseme_open   — jaw/lower-lip drop for amplitude-driven lip-sync
  • pose_tripod   — torso forward-lean + shoulder raise (accessory-muscle look)
  • pose_supine   — slight overall settle/flatten (lie-back lean)
  • pose_recovery — asymmetric roll toward one side

Runs on the OUTPUT of A1 (already masculinized) and re-exports in place, so the
masculinization + existing 3 clinical morphs are preserved. Backup .bak from A1
stays as the revert point.
"""

import bpy
import os

SRC = os.path.abspath("public/models/patient-male.glb")

REQUIRED_EXISTING = ["breathe_chest_rise", "finding_abdo_distension", "finding_jvd"]
NEW_MORPHS = ["viseme_open", "pose_tripod", "pose_supine", "pose_recovery"]


def log(m):
    print(f"[viseme] {m}")


def smoothstep(e0, e1, x):
    if e1 == e0:
        return 0.0
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def height_axis(mesh):
    """Return the index (0/1/2) of the tallest bbox dimension — that's height,
    robust to whichever up-axis the importer chose."""
    lo = [min(v.co[a] for v in mesh.vertices) for a in range(3)]
    hi = [max(v.co[a] for v in mesh.vertices) for a in range(3)]
    span = [hi[a] - lo[a] for a in range(3)]
    a = span.index(max(span))
    return a, lo[a], hi[a], span[a]


def import_glb():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=SRC)
    o = bpy.data.objects.get("Patient")
    if o is None:
        raise RuntimeError("Patient mesh not found")
    return o


def add_viseme_open(obj, ax, lo, span):
    """Jaw drop: lower-face front vertices move down + slightly back to open the
    mouth. Face front is +z on this asset (from A1 masculinize: z>0 = front)."""
    key = obj.shape_key_add(name="viseme_open", from_mix=False)
    mesh = obj.data
    moved = 0
    # jaw band: chin..mouth, roughly 0.82..0.90 of height, front hemisphere
    for i, v in enumerate(mesh.vertices):
        f = (v.co[ax] - lo) / span
        jaw = smoothstep(0.80, 0.855, f) * (1.0 - smoothstep(0.895, 0.92, f))
        if jaw <= 0 or v.co.z <= 0.0:
            continue
        front = smoothstep(0.0, 0.04, v.co.z)  # more open at the very front
        w = jaw * front
        p = key.data[i].co
        # drop along height axis, pull slightly back (−z)
        newco = p.copy()
        newco[ax] = p[ax] - 0.018 * w
        newco.z = p.z - 0.006 * w
        key.data[i].co = newco
        moved += 1
    key.value = 0.0
    log(f"viseme_open: {moved} verts")


def add_pose(obj, name, ax, lo, span, mode):
    """Author a posture as a per-vertex bend keyed by height fraction.
    mode:
      tripod   — upper body pitches forward (+z) increasing with height, shoulders lift
      supine   — whole body settles: slight uniform −z lean + shoulder drop
      recovery — asymmetric: one side (x<0) rolls, the other stays
    """
    key = obj.shape_key_add(name=name, from_mix=False)
    mesh = obj.data
    moved = 0
    for i, v in enumerate(mesh.vertices):
        f = (v.co[ax] - lo) / span
        p = key.data[i].co.copy()
        d = 0.0
        if mode == "tripod":
            # forward lean grows above the hips (f>0.5); shoulders (f~0.8) lift
            lean = smoothstep(0.5, 0.95, f)
            p.z += 0.05 * lean                       # torso forward
            sh = smoothstep(0.74, 0.84, f) * (1.0 - smoothstep(0.86, 0.92, f))
            p[ax] += 0.018 * sh                      # shoulders up
            d = lean + sh
        elif mode == "supine":
            # gentle settle: whole upper body eases back + shoulders relax down
            up = smoothstep(0.4, 1.0, f)
            p.z -= 0.02 * up
            p[ax] -= 0.010 * up
            d = up
        elif mode == "recovery":
            # roll toward patient's right (x<0): lateral shift growing with height
            up = smoothstep(0.45, 1.0, f)
            side = 1.0 if v.co.x < 0 else 0.3
            p.x -= 0.03 * up * side
            p.z += 0.015 * up * side
            d = up
        if d > 0:
            key.data[i].co = p
            moved += 1
    key.value = 0.0
    log(f"{name} ({mode}): {moved} verts")


def export_glb():
    tmp = SRC + ".tmp.glb"
    bpy.ops.export_scene.gltf(
        filepath=tmp,
        export_format="GLB",
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_morph=True,
        # morph normals dropped: 4 extra morphs with per-vertex normals blew the
        # <6MB budget, and these gross displacements don't need baked normals —
        # the runtime relights fine. ponytail: re-enable per-morph normals only
        # if a morph shows shading artefacts at full influence.
        export_morph_normal=False,
        export_apply=False,
        export_yup=True,
    )
    os.replace(tmp, SRC)


def main():
    obj = import_glb()
    mesh = obj.data
    # pre-check existing morphs
    have = [k.name for k in mesh.shape_keys.key_blocks] if mesh.shape_keys else []
    log(f"existing shape keys: {have}")
    for e in REQUIRED_EXISTING:
        if e not in have:
            raise RuntimeError(f"existing morph '{e}' missing on input — abort")

    ax, lo, hi, span = height_axis(mesh)
    log(f"height axis={'xyz'[ax]} lo={lo:.3f} hi={hi:.3f} span={span:.3f}")

    add_viseme_open(obj, ax, lo, span)
    add_pose(obj, "pose_tripod", ax, lo, span, "tripod")
    add_pose(obj, "pose_supine", ax, lo, span, "supine")
    add_pose(obj, "pose_recovery", ax, lo, span, "recovery")

    # post-check: existing + new all present
    keys = [k.name for k in mesh.shape_keys.key_blocks]
    log(f"final shape keys: {keys}")
    for e in REQUIRED_EXISTING + NEW_MORPHS:
        if e not in keys:
            raise RuntimeError(f"morph '{e}' missing after authoring — abort")

    export_glb()
    size_mb = os.path.getsize(SRC) / 1024 / 1024
    log(f"exported {SRC} ({size_mb:.2f} MB)")
    if size_mb > 6.0:
        log(f"WARNING: {size_mb:.2f} MB > 6MB budget")


main()
