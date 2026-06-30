# Realistic Anatomy Asset Plan

This folder is the staging point for browser-safe 3D patient and anatomy
models. The goal is not to ship a cartoon patient. The active app should use
only assets that are clinically believable, correctly sex-matched, and legally
clear.

## Active policy

- `patient.glb` - current known-good fallback for unknown and male patients.
  It is not the final visual standard, but it is safer than showing a weak
  procedural mannequin or a female-looking male model.
- `patient-female.glb` - active for female cases. Source: Ready Player Me
  `brunette-t.glb` distributed through the TalkingHead repository. License:
  CC BY-NC 4.0, so keep the non-commercial constraint visible before any
  commercial deployment.
- `patient-male.glb` - intentionally absent from `public/models` until a
  validated male export exists. The rejected TalkingHead/MPFB candidate has
  female/casual-suit mesh names and reads incorrectly for male examination.
  Do not route male cases to this filename until a validated male export
  replaces it.
- `open3d-skeleton.glb` - active anatomy reference layer. Source:
  AnatomyTOOL/Open3DModel overview skeleton GLB. It is used as a transparent
  skeletal reference in the exam canvas, not as the patient skin.

## Free/open sources worth using

| Source | What it is good for | License notes | Implementation notes |
| --- | --- | --- | --- |
| Z-Anatomy | Full layered anatomy atlas: skeleton, muscles, organs, vessels, nerves | CC BY-SA 4.0 with BodyParts3D attribution requirements | Downloadable repo contains `Z-Anatomy.zip`, which expands to a Blender app template and a large `Startup.blend`. Needs Blender export, decimation, naming, and GLB compression before use in browser. |
| AnatomyTOOL/Open3DModel | Browser-ready anatomy submodels such as skeleton, skull, trunk muscles, upper limb, lower limb | Site states CC BY-SA for the model | Direct GLB zips are available. Best first use is focused anatomy reference layers for head, chest, abdomen, and limbs. |
| MakeHuman / MPFB | Sex-matched outer patient shells with controllable age/body habitus | Core assets are CC0; source code is GPL/AGPL | Best route for male/female patient shells. Export a deliberately male and female body from MakeHuman/MPFB, then retarget/prefix bones and compress. |
| BodyParts3D | Anatomical parts database that underpins several open anatomy projects | CC BY-SA 2.1 Japan | Useful as upstream reference, but not the fastest direct browser path. Prefer Z-Anatomy or Open3DModel exports unless we need a specific organ. |

## Vetted links

- Z-Anatomy repository: https://github.com/Z-Anatomy/Models-of-human-anatomy
- Z-Anatomy site: https://www.z-anatomy.com/
- Z-Anatomy SimTK page: https://simtk.org/projects/z-anatomy
- AnatomyTOOL Open3DModel: https://anatomytool.org/open3dmodel
- AnatomyTOOL learning models: https://anatomytool.org/open3dmodel-learn
- MakeHuman license: https://static.makehumancommunity.org/about/license.html
- MakeHuman repository: https://github.com/makehumancommunity/makehuman
- BodyParts3D download page: https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html

## Replacement route for the patient shell

1. Generate sex-specific patient shells in MakeHuman or MPFB:
   - adult male base body for male cases
   - adult female base body for female cases
   - optional elderly and paediatric variants later
2. Export GLB with an A-pose or relaxed neutral stance, no stylised clothing,
   no hair geometry that hides scalp/face exam, and body proportions that read
   clearly as the intended sex and age group.
3. Run the local pipeline in `scripts/anatomy-models/`:
   - strip non-clinical meshes
   - prefix important bones to `mixamorig:*`
   - translate feet to Y=0
   - inspect bounds and bones
   - compress to a browser budget of roughly 3-8 MB per patient shell
4. Replace `patient-male.glb` only after visual QA confirms it reads as male
   from the default exam camera, close face camera, chest camera, abdomen
   camera, and posterior/log-roll camera.
5. Keep `patient.glb` as fallback until the new shells pass both build and
   browser visual checks.

## Anatomy layer route

`open3d-skeleton.glb` is the first anatomy reference layer. The next layers
should be added as separate files rather than fused into the patient shell:

- `open3d-skull.glb` for detailed head/face/airway assessment.
- `open3d-trunk-muscles.glb` for chest wall, abdominal wall, and back.
- `open3d-upper-limb.glb` and `open3d-lower-limb.glb` for extremity exams.
- A Z-Anatomy-derived trunk/organ export for abdomen and thorax if we need
  organs, vessels, and nerves in one controlled atlas.

Keeping these as overlays lets students see a realistic patient first, then
turn on clinical anatomy when the exam step needs it.

---

## Character Creator 4 patient export spec (decided 2026-05-29)

The hero patient model will be built in **Character Creator 4** (Reallusion)
and exported to GLB via Blender. To make the export plug-and-play with the
app's findings layer + discovery interaction, the GLB must meet this spec.
Hand the finished `.glb` to the app and it drops in behind the existing
`resolveModelPath()` switch.

### Format & budget
- **GLB** (binary glTF 2.0), **Draco-compressed**, target **3–8 MB** per shell
  (hard ceiling ~10 MB — larger crashes mobile/Chromebook browsers).
- Textures **≤ 2048²**, baked PBR (base colour + normal + ORM). No 4K skin.
- **A-pose or relaxed neutral stance**, feet translated to **Y = 0**.
- No stylised clothing; no hair geometry that occludes scalp/face/airway exam.
- One model per sex (`patient-male.glb`, `patient-female.glb`); elderly/paediatric
  variants later.

### Rig
- Humanoid skeleton, bones prefixed **`mixamorig:*`** (the app's camera + region
  logic already assumes this convention — see `scripts/anatomy-models/`).
- Standard joints: head, neck, spine, shoulders, elbows, wrists, hips, knees,
  ankles. Limb deformity/rotation findings are driven by bone rotation, so the
  hip/knee/shoulder joints must be clean.

### Named morph targets (blend shapes) — REQUIRED for findings
Author these in CC4/Blender and confirm they survive the glTF export (check in
a glTF viewer's "Morph Targets" list). Names must match exactly (the findings
layer drives them by name):

| Morph name | Drives | Notes |
| --- | --- | --- |
| `finding_jvd` | Jugular venous distension | Bulge the external jugulars + slight neck fullness. Revealed on neck-cspine exam. |
| `finding_abdo_distension` | Distended abdomen | Round/protrude the abdominal wall. Revealed on abdomen exam. |
| `breathe_chest_rise` | Respiratory excursion | Chest+upper-abdomen rise. Driven continuously at the case RR. |
| `finding_flail_paradox` | Flail segment | Localised paradoxical in-draw on one hemithorax. Optional v2. |
| `expr_pain` | Pain grimace | Face. Drives distress/pain reactions. |
| `expr_distress` | Respiratory distress face | Optional v2. |
| `mouth_open` | Airway/agonal/speaking | Re-used for patient voice + airway exam. |

### Named material slots — for tint findings
The findings layer recolours these by name (cyanosis, pallor). Keep them as
separate material slots / named submeshes:
- `mat_lips` — lip tint (cyanosis → blue-grey).
- `mat_nailbeds` (or named hand submesh) — peripheral cyanosis.
- `mat_skin` — overall pallor shift.

### Decal surfaces — for bleeding/wounds/bruising/burns
No geometry needed — these are projected at runtime with `@react-three/drei`
`<Decal>` onto the body surface at anatomical coordinates. The model just needs
**clean, reasonably even UVs** on the torso/limbs so decals don't smear. Provide
nothing extra; just don't ship a model with broken/overlapping UVs on exam
surfaces.

### What the app does with it (so the export targets the right thing)
1. Loads the GLB as the patient shell (replacing the placeholder mannequin).
2. Findings stay HIDDEN until the student examines the region.
3. On region exam: reveals the finding via the matching morph / material tint /
   decal, and (for auscultation) plays the synthesised sound from
   `clinicalSounds.ts` for the chosen sub-site.
4. Camera zooms to the region; sub-site picker (L/R lung field, 4 heart areas,
   4 abdominal quadrants) chooses exactly what is auscultated/inspected.

### Acceptance checklist before replacing `patient-*.glb`
- [ ] Loads < 10 MB, renders at 60 fps on a mid-range laptop and a phone.
- [ ] Reads clearly as the intended sex/age from the default, face, chest,
      abdomen, and posterior cameras.
- [ ] All REQUIRED morph targets present and named exactly, visible in a glTF
      viewer.
- [ ] `mat_lips` / `mat_skin` recolour cleanly (no seams) when tinted.
- [ ] UVs on torso/limbs accept a test decal without smearing.
- [ ] Bones prefixed `mixamorig:*`; feet at Y=0; A-pose.

---

## SHIPPED 2026-05-29 — MPFB photographic-skin patients (CC0)

`patient.glb` (male) and `patient-female.glb` are now **MPFB-generated humans with
real photographic skin**, replacing the old game avatars. This also removed the
CC BY-NC licence problem (old female was Ready Player Me, non-commercial).

- **Base mesh:** MPFB2 `HumanService.create_human` (CC0), helper geometry stripped
  to the `body` vertex group (13,380 verts).
- **Skin:** MakeHuman System Assets pack (CC0) — `middleage_*_male/female_diffuse.png`
  applied as a PLAIN Principled BSDF (NOT MakeSkin/EnhancedSSS — those scramble or
  flatten on glTF export; see the script header for the full why).
- **Morphs:** breathing / JVD / abdominal-distension via `add-clinical-morphs.py`,
  Draco-compressed. ~6.6–7.6 MB each (texture-dominant, under budget).
- **Reproduce:**
  ```
  Blender --background --python scripts/anatomy-models/generate-mpfb-skinned.py -- \
      male  <skin_diffuse.png> /tmp/p-male.glb
  Blender --background --python scripts/anatomy-models/add-clinical-morphs.py -- \
      /tmp/p-male.glb public/models/patient.glb
  ```
  System Assets pack: https://files.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip
  (extracted skins at /tmp/mpfb-assets/extracted/skins/ this session).
- **Backups:** `patient.glb.orig` (Mixamo), `patient-mpfb-untextured.bak.glb`,
  `patient-female-rpm.bak.glb`.

### Still to improve (future)
- Skin has no normal/SSS maps (diffuse only) — could bake MPFB's procedural pore
  detail to a normal map (Cycles bake works headless) for more realism.
- No hair; bald. Add a hair card asset if desired (must not occlude scalp/airway exam).
- A rig is NOT included (static exam mesh + shape-key morphs). Add a rig if
  bone-driven limb-deformity findings are wired later.
