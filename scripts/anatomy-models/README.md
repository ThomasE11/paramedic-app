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

## Historical MPFB pipeline (not active for male cases)

The pipeline below was tested against the TalkingHead `mpfb.glb`, but that
source reads visually female in the current examination scene and should not
be used as the male patient shell without a fresh MakeHuman/MPFB export and
visual QA. `BodyMesh.tsx` currently routes male patients to `patient.glb`
until a validated male GLB replaces `public/models/patient-male.glb`.

```bash
# 1. Source: CC0 MPFB body (35 MB, hair + clothing + textures)
curl -L -o mpfb-source.glb \
  https://github.com/met4citizen/TalkingHead/raw/main/avatars/mpfb.glb

# 2. Optimize textures + meshopt geometry → 1.2 MB
npx --yes @gltf-transform/cli@latest optimize \
  mpfb-source.glb step1.glb \
  --texture-compress webp --texture-size 1024 \
  --simplify-error 0.001

# 3. Strip hair / clothing / eyelashes / teeth / tongue → ~290 KB
node strip-glb.mjs step1.glb step2.glb

# 4. Prefix bones to mixamorig:* so BodyMesh.tsx finds them
node prefix-bones.mjs step2.glb step3.glb

# 5. Translate so feet sit at Y=0
node translate-glb.mjs step3.glb ../../public/models/patient-male-unvalidated.glb
```

## Reproducing the current `patient-female.glb`

```bash
# 1. Source: Ready Player Me brunette-t (CC BY-NC, 2.7 MB, lean)
curl -L -o brunette-t.glb \
  https://github.com/met4citizen/TalkingHead/raw/main/avatars/brunette-t.glb

# 2. Just the bone prefix — already lean + feet at Y=0
node prefix-bones.mjs brunette-t.glb ../../public/models/patient-female.glb
```
