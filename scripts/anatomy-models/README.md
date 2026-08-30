# Anatomy model build scripts

Five small Node scripts used to produce the GLB files in
`public/models/` from upstream sources. Each is standalone and reads
from `@gltf-transform/core`, `@gltf-transform/extensions`,
`@gltf-transform/functions`, and `meshoptimizer`.

| Script | What it does |
|---|---|
| `strip-glb.mjs` | Remove non-body meshes (hair, clothing, eyelashes, teeth, tongue) from a MakeHuman/MPFB export. Keeps only `base` and `high-poly`. |
| `prefix-bones.mjs` | Add `mixamorig:` prefix to the ~22 skeleton joints the Body3DModel hit-test cares about (Hips, Spine, Spine1, Spine2, Neck, Head, Shoulder/Arm/ForeArm/Hand × 2, UpLeg/Leg/Foot × 2, plus eyes + HeadTop_End). |
| `translate-glb.mjs` | Translate scene-root nodes along Y so the lowest vertex sits at Y=0. Used to align hip-origin meshes (e.g. MPFB) with the rest of the app's "feet on the ground" convention. |
| `glb-bounds.mjs` | Pretty-print world-space AABB for a GLB. Handy for verifying scale after a transform pass. |
| `glb-bones.mjs` | List every skin's joint names so you can verify the rig naming convention (Mixamo vs RPM vs MakeHuman). |

## Running

These are dev-time scripts — install the deps locally if you need to
re-run them (we deliberately don't add them to the app's runtime
deps):

```bash
cd scripts/anatomy-models
npm init -y
npm install @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer
node strip-glb.mjs in.glb out.glb
```

## Active patient pipeline

The shipped adult and age-specific models now use MPFB body geometry with a
fitted 52-bone Mixamo armature, five runtime clips and fourteen clinical
morphs. `generate-mpfb-age-patient.py` creates the sex/age shell,
`rig-patient.py` transfers the fitted weights and animation clips, and
`refine-tripod-pose.py` bakes the neutral seated legs used by both seated and
tripod presentations. The rig step must keep MPFB's detailed joint helpers
enabled; they are what fit the armature to infant, toddler and child macros.

```bash
# Example: rebuild a female toddler shell, fit its rig, then bake its seat.
Blender --background --python generate-mpfb-age-patient.py -- \
  female 0.10 ../../public/models/patient-female.glb /tmp/toddler-raw.glb
Blender --background --python rig-patient.py -- \
  female /tmp/toddler-raw.glb ../../public/models/patient.glb.orig \
  /tmp/toddler-rigged.glb 0.10
Blender --background --python refine-tripod-pose.py -- \
  /tmp/toddler-rigged.glb ../../public/models/patient-toddler-female.glb
```

## Verification

Run both geometry gates after rebuilding any patient. The first verifies rig
scale and seated/tripod continuity. The second evaluates the exported walk at
four phases, proving that the limbs move without a centimetre-scale mesh tear.

```bash
Blender --background --python verify-patient-deformation.py -- \
  ../../public/models/patient-male.glb ../../public/models/patient-infant-female.glb
Blender --background --python verify-patient-animation.py -- \
  ../../public/models/patient-male.glb ../../public/models/patient-infant-female.glb
```
