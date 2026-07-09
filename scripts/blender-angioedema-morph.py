# Author the `finding_angioedema` clinical morph (anaphylaxis facial/lip
# swelling — REALISM_EXECUTION_DIRECTIVE.md scenario 2) into a patient GLB.
#
# Anatomy targeting works from the model's own landmarks, no hand-tuned
# coordinates: eye centres come from the authored eyeL/eyeR node origins;
# the mouth sits below the eye midpoint by standard facial proportions
# (crown→eye distance ≈ eye→mouth distance). The morph swells the lips
# outward along vertex normals with smooth radial falloff and puffs the
# periorbital rings more gently — the classic angioedema silhouette.
#
# The shape key exports as a morph target named finding_angioedema with
# default weight 0; BodyMesh's frame loop already ramps ANY finding_* morph
# toward activeFindingMorphs membership, so the app needs no mesh-side code.
#
# Run (per patient model):
#   Blender --background --python scripts/blender-angioedema-morph.py -- \
#       public/models/patient-male.glb /tmp/patient-male-angio.glb
# Then: node scripts/verify-glb.cjs /tmp/patient-male-angio.glb --expect-eyes
import sys

import bpy
import numpy as np

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SRC = argv[0] if len(argv) > 0 else "public/models/patient-male.glb"
DST = argv[1] if len(argv) > 1 else "/tmp/patient-angio.glb"

# Dose scales with the model's OWN face size (face_h = crown→eye distance),
# so the male and the smaller-faced female swell to the same clinical read.
# Ratios calibrated on the male render (face_h 0.179 → radius 45mm, amp 11mm).
LIP_RADIUS_F = 0.25     # × face_h — capture the whole mouth area
LIP_AMP_F = 0.062       # × face_h — outward swell at the lip centre
EYE_RADIUS_F = 0.17     # × face_h — periorbital ring
EYE_AMP_F = 0.025       # × face_h — gentler puff around the eyes
FRONT_DOT = 0.15        # only front-facing verts swell (no inflating the skull)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

body = max((o for o in bpy.data.objects if o.type == "MESH"), key=lambda o: len(o.data.vertices))
mesh = body.data
nverts = len(mesh.vertices)
print(f"body: {body.name!r} verts={nverts}")

eyeL = bpy.data.objects.get("eyeL")
eyeR = bpy.data.objects.get("eyeR")
if not (eyeL and eyeR):
    raise RuntimeError("eyeL/eyeR nodes missing — wrong GLB?")
eL = np.array(eyeL.matrix_world.translation)
eR = np.array(eyeR.matrix_world.translation)
eye_mid = (eL + eR) / 2.0

keys = mesh.shape_keys
if not keys:
    raise RuntimeError("no shape keys — expected the 3 clinical morphs")
if "finding_angioedema" in keys.key_blocks:
    raise RuntimeError("finding_angioedema already present")
basis_kb = keys.key_blocks["Basis"]
basis = np.empty(nverts * 3, dtype=np.float32)
basis_kb.data.foreach_get("co", basis)
xyz = basis.reshape(-1, 3).astype(np.float64)

# Mesh-local landmark positions (object transform is identity for these GLBs,
# but be safe and bring the eye world positions into mesh space).
inv = np.array(body.matrix_world.inverted())
def to_local(p):
    v = inv @ np.array([p[0], p[1], p[2], 1.0])
    return v[:3]
eye_mid_l = to_local(eye_mid)
eL_l, eR_l = to_local(eL), to_local(eR)

# Facial proportions: crown→eye ≈ eye→mouth (Z is up in Blender's frame).
crown_z = xyz[:, 2].max()
face_h = crown_z - eye_mid_l[2]
mouth = eye_mid_l.copy()
mouth[2] = eye_mid_l[2] - 0.55 * face_h
# Pull the mouth anchor to the actual front surface: among verts near that
# height and centred on x, take the most-negative-Y (front) vertex.
band = (np.abs(xyz[:, 2] - mouth[2]) < 0.02) & (np.abs(xyz[:, 0] - mouth[0]) < 0.03)
if band.sum() < 8:
    raise RuntimeError(f"mouth band found only {band.sum()} verts — proportions off?")
mouth[1] = xyz[band, 1].min()
print(f"eyeMid(local)={np.round(eye_mid_l,3)} mouth(local)={np.round(mouth,3)} face_h={face_h:.3f}")

# Vertex normals for outward displacement.
mesh.calc_normals_split() if hasattr(mesh, "calc_normals_split") else None
normals = np.empty(nverts * 3, dtype=np.float32)
mesh.vertices.foreach_get("normal", normals)
nrm = normals.reshape(-1, 3).astype(np.float64)

front = nrm[:, 1] < -FRONT_DOT  # front of the body faces -Y

def radial_swell(center, radius, amp):
    d = np.linalg.norm(xyz - center, axis=1)
    w = np.clip(1.0 - (d / radius) ** 2, 0.0, 1.0) ** 1.5  # smooth bell
    w[~front] = 0.0
    return (nrm.T * (w * amp)).T

delta = radial_swell(mouth, LIP_RADIUS_F * face_h, LIP_AMP_F * face_h)
delta += radial_swell(eL_l, EYE_RADIUS_F * face_h, EYE_AMP_F * face_h)
delta += radial_swell(eR_l, EYE_RADIUS_F * face_h, EYE_AMP_F * face_h)
moved = int((np.linalg.norm(delta, axis=1) > 1e-5).sum())
print(f"verts displaced: {moved}")
if moved < 50:
    raise RuntimeError("morph moved almost nothing — landmark targeting failed")

kb = body.shape_key_add(name="finding_angioedema", from_mix=False)
kb.data.foreach_set("co", (xyz + delta).reshape(-1).astype(np.float32))
kb.value = 0.0

bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(
    filepath=DST,
    export_format="GLB",
    export_yup=True,
    export_morph=True,
    export_morph_normal=True,
    export_draco_mesh_compression_enable=True,
    export_image_format="AUTO",
)
print(f"exported {DST}")
