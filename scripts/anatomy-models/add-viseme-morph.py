"""
A3 — Add viseme_open + posture morph targets to patient-male.glb
(REALISM_OVERHAUL_PLAN §2.4 lip-sync, §2.3 posture).

Headless:
    /Applications/Blender.app/Contents/MacOS/blender --background \
        --python scripts/anatomy-models/add-viseme-morph.py

Optional target (defaults to the male model):
    ... --python scripts/anatomy-models/add-viseme-morph.py -- \
        public/models/patient-female.glb

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
  • pose_seated   — neutral seated base, completed from the fitted rig by
                    refine-tripod-pose.py
  • pose_tripod   — seated base + torso forward-lean (accessory-muscle look)
  • pose_supine   — slight overall settle/flatten (lie-back lean)
  • pose_recovery — asymmetric roll toward one side
  • motion_gasp    — local shoulder / upper-chest effort without moving the root
  • motion_wince   — protective torso curl and shoulder draw-in
  • motion_clutch  — one forearm guards the chest in cardiac pain
  • motion_seizure — asymmetric limb flexion for rhythmic convulsive movement
  • motion_tremor  — small distal hand movement for tremor / shivering
  • motion_agitation — head and upper-torso restless shift

Runs on the OUTPUT of A1 (already masculinized) and re-exports in place, so the
masculinization + existing 3 clinical morphs are preserved. Backup .bak from A1
stays as the revert point.
"""

import bpy
import os
import math
import sys

SCRIPT_ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SRC = os.path.abspath(SCRIPT_ARGS[0] if SCRIPT_ARGS else "public/models/patient-male.glb")

REQUIRED_EXISTING = ["breathe_chest_rise", "finding_abdo_distension", "finding_jvd"]
NEW_MORPHS = [
    "viseme_open", "pose_seated", "pose_tripod", "pose_supine", "pose_recovery",
    "motion_gasp", "motion_wince", "motion_clutch", "motion_seizure",
    "motion_tremor", "motion_agitation",
]


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
    """Lip part for speech: split the mouth band (y fraction ~0.86..0.92) at its
    vertical midline — vertices ABOVE the midline (upper lip) go UP (+y), vertices
    BELOW (lower lip) go DOWN (−y, + slight back). A uniform jaw drop moved the
    whole band together and never parted the lips (chin droop only). Face front
    is +z on this asset (A1 masculinize: z>0 = front)."""
    key = obj.shape_key_add(name="viseme_open", from_mix=False)
    mesh = obj.data
    scale = span / 1.8
    moved = 0
    mouth_lo, mouth_hi = 0.86, 0.925
    mid = mouth_lo + (mouth_hi - mouth_lo) * 0.5  # lip line fraction
    for i, v in enumerate(mesh.vertices):
        f = (v.co[ax] - lo) / span
        # taper in from both edges of the mouth band
        band = smoothstep(mouth_lo, mouth_lo + 0.025, f) * (1.0 - smoothstep(mouth_hi - 0.03, mouth_hi, f))
        if band <= 0 or v.co.z <= 0.0:
            continue
        front = smoothstep(0.0, 0.05, v.co.z)  # more open at the very front
        w = band * front
        side = 1.0 if f >= mid else -1.0       # +1 below lip line (lower lip down)
        p = key.data[i].co
        newco = p.copy()
        newco[ax] = p[ax] + 0.15 * scale * side * w
        newco.z = p.z - 0.05 * scale * w
        key.data[i].co = newco
        moved += 1
    key.value = 0.0
    log(f"viseme_open: {moved} verts")


def add_pose(obj, name, ax, lo, span, mode):
    """Author a posture as a per-vertex bend keyed by height fraction.
    mode:
      seated   — neutral placeholder completed after rigging
      tripod   — upper body pitches forward (+z) increasing with height, shoulders lift
      supine   — whole body settles: slight uniform −z lean + shoulder drop
      recovery — asymmetric: one side (x<0) rolls, the other stays
    """
    key = obj.shape_key_add(name=name, from_mix=False)
    mesh = obj.data
    scale = span / 1.8
    moved = 0
    for i, v in enumerate(mesh.vertices):
        f = (v.co[ax] - lo) / span
        p = key.data[i].co.copy()
        d = 0.0
        if mode == "seated":
            # A shape key must exist before rig-patient.py transfers the fitted
            # skeleton. refine-tripod-pose.py replaces it with the rig-derived
            # seated legs after skinning is available.
            d = 0.0
        elif mode == "tripod":
            # Forward lean grows above the hips; shoulders lift with visible
            # accessory-muscle effort. Blender's imported forward axis is -Y.
            lean = smoothstep(0.5, 0.95, f)
            p.y -= 0.18 * scale * lean
            sh = smoothstep(0.74, 0.84, f) * (1.0 - smoothstep(0.86, 0.92, f))
            p[ax] += 0.022 * scale * sh
            d += lean + sh
        elif mode == "supine":
            # gentle settle: whole upper body eases back + shoulders relax down
            up = smoothstep(0.4, 1.0, f)
            p.z -= 0.02 * scale * up
            p[ax] -= 0.010 * scale * up
            d = up
        elif mode == "recovery":
            # roll toward patient's right (x<0): lateral shift growing with height
            up = smoothstep(0.45, 1.0, f)
            side = 1.0 if v.co.x < 0 else 0.3
            p.x -= 0.03 * scale * up * side
            p.z += 0.015 * scale * up * side
            d = up
        if d > 0:
            key.data[i].co = p
            moved += 1
    key.value = 0.0
    log(f"{name} ({mode}): {moved} verts")


def add_motion(obj, name, ax, lo, span, mode):
    """Author local clinical motion while keeping support points planted.

    Animating the root makes a collapsed patient detach from the floor or
    stretcher. These targets move only the anatomy involved in the cue.
    """
    key = obj.shape_key_add(name=name, from_mix=False)
    mesh = obj.data
    scale = span / 1.8
    moved = 0

    for i, v in enumerate(mesh.vertices):
        f = (v.co[ax] - lo) / span
        p = key.data[i].co.copy()
        changed = False

        if mode == "gasp":
            upper = smoothstep(0.62, 0.80, f) * (1.0 - smoothstep(0.89, 0.96, f))
            shoulder = smoothstep(0.73, 0.80, f) * (1.0 - smoothstep(0.84, 0.90, f))
            if upper > 0:
                p.y += 0.030 * scale * upper
                p[ax] += 0.018 * scale * shoulder
                changed = True

        elif mode == "wince":
            torso = smoothstep(0.50, 0.72, f) * (1.0 - smoothstep(0.92, 0.99, f))
            if torso > 0:
                lateral = smoothstep(0.12 * scale, 0.42 * scale, abs(v.co.x))
                p.y += 0.035 * scale * torso
                p.x -= math.copysign(0.018 * scale * torso * lateral, v.co.x)
                changed = True

        elif mode == "clutch":
            # Patient-left arm (x>0) guards the sternum. Keep the arc modest so
            # additive posture blending cannot fold the limb through the torso.
            if 0.48 <= f <= 0.84 and v.co.x > 0.18 * scale:
                distal = smoothstep(0.18 * scale, 0.52 * scale, v.co.x)
                p.x -= 0.22 * scale * distal
                p.y += 0.16 * scale * distal
                p[ax] += 0.055 * scale * distal
                changed = True

        elif mode == "seizure":
            lateral = abs(v.co.x) > 0.18 * scale
            if f < 0.55 or (0.48 <= f <= 0.84 and lateral):
                side = 1.0 if v.co.x >= 0 else -1.0
                distal = smoothstep(0.16 * scale, 0.52 * scale, abs(v.co.x))
                lower = 1.0 - smoothstep(0.50, 0.66, f)
                amount = max(distal, lower * 0.7)
                p.y += side * 0.055 * scale * amount
                p[ax] += side * 0.028 * scale * amount
                changed = True

        elif mode == "tremor":
            if 0.42 <= f <= 0.72 and abs(v.co.x) > 0.42 * scale:
                side = 1.0 if v.co.x >= 0 else -1.0
                p.y += side * 0.018 * scale
                p[ax] += 0.009 * scale
                changed = True

        elif mode == "agitation":
            upper = smoothstep(0.68, 0.90, f)
            if upper > 0:
                p.x += 0.020 * scale * upper
                p.y += 0.012 * scale * upper
                changed = True

        if changed:
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

    # Idempotent: remove previously-authored targets so a re-run REPLACES them
    # (Blender would otherwise append .001 duplicates that three.js indexes first).
    have_set = set(have)
    if mesh.shape_keys:
        for name in NEW_MORPHS:
            if name in have_set:
                key = mesh.shape_keys.key_blocks.get(name)
                obj.shape_key_remove(key)
                log(f"removed existing '{name}' for re-author")
        # any leftover .00N duplicates from earlier non-idempotent runs
        for name in [k.name for k in mesh.shape_keys.key_blocks]:
            if any(name.startswith(m + '.') for m in NEW_MORPHS):
                obj.shape_key_remove(mesh.shape_keys.key_blocks.get(name))
                log(f"removed stale duplicate '{name}'")

    add_viseme_open(obj, ax, lo, span)
    add_pose(obj, "pose_seated", ax, lo, span, "seated")
    add_pose(obj, "pose_tripod", ax, lo, span, "tripod")
    add_pose(obj, "pose_supine", ax, lo, span, "supine")
    add_pose(obj, "pose_recovery", ax, lo, span, "recovery")
    add_motion(obj, "motion_gasp", ax, lo, span, "gasp")
    add_motion(obj, "motion_wince", ax, lo, span, "wince")
    add_motion(obj, "motion_clutch", ax, lo, span, "clutch")
    add_motion(obj, "motion_seizure", ax, lo, span, "seizure")
    add_motion(obj, "motion_tremor", ax, lo, span, "tremor")
    add_motion(obj, "motion_agitation", ax, lo, span, "agitation")

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
