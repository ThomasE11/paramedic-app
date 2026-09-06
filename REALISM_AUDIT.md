# Realism Audit — declared signs vs. rendered signs

*Audited 2026-09-06. Method: extract every `kind` the scenario layer declares in
`src/lib/patientRealismScenarios.ts`, then trace each one through
`patientVisualState.ts` (the adapter) into the 3D layer and find its actual
renderer. A sign is only "rendered" if something draws or moves for it — being
declared, adapted and unit-tested is not the same as being visible.*

The pipeline is:

```
patientRealismScenarios  →  patientRealismDirector  →  patientVisualState  →  renderer
   (declares the sign)        (gates by showWhen)        (flattens it)        (draws it)
```

The failure mode this audit exists to catch is a sign that survives the first
three stages and then falls off the fourth — declared, gated, adapted, and
invisible to the student.

## Status by sign

| Sign | Renderer | Status |
|---|---|---|
| `cyanosis` | skin tint + localised lips/nailbeds | ✅ |
| `pallor` | skin tint | ✅ |
| `diaphoresis` | sheen, dries as treatment works | ✅ |
| `mottling` | `MottlingLayer` | ✅ |
| `open_wound` | wound decal | ✅ |
| `active_bleeding` | `ActiveBleedLayer` | ✅ |
| `blood_pool` | wound decal | ✅ |
| `burn_pattern` | wound decal | ✅ |
| `deformity` | injury pip + morph | ✅ |
| `pinpoint_pupils` | `eyeEffects` → pupil profile | ✅ |
| `dilated_pupils` | `eyeEffects` → pupil profile | ✅ |
| `seizure_activity` | `idleCues` → `motion_seizure` morph | ✅ |
| `tremor` | `idleCues` → `motion_tremor` morph | ✅ |
| `rash` | `urticaria` decal | ✅ *fixed 2026-09-06* |
| `facial_droop` | `finding_facial_droop` morph | ✅ *fixed 2026-09-06* |
| `accessory_muscle_use` | breathing-coupled shoulder heave | ✅ *fixed 2026-09-06* |
| `reduced_chest_rise` | feeds `breathingEffort` → shoulder heave | ✅ *fixed 2026-09-06* |
| `asymmetric_chest_rise` | `breathe_chest_rise_unilateral` morph | ✅ *fixed 2026-09-06* |
| `facial_swelling` | none | ❌ |
| `soot` | `soot` decal on the face | ✅ *fixed 2026-09-06* |
| `vomit_risk` | none | ❌ |

## Open gaps, in the order worth doing them

### 1. `facial_swelling` — not rendered ❌
Anaphylaxis now shows its rash but not the lip/face swelling that carries the
airway-risk story. Needs a Blender shape key — add a preset to
`append-clinical-morph.py`, which already does exactly this for the droop and
the unilateral chest rise.

### 2. `vomit_risk` — not rendered ❌
Declared for opioid reversal (naloxone) and post-ROSC. Arguably not a 3D
problem at all: the honest fix is probably a positioning/airway prompt rather
than a visual.

## Notes for whoever picks this up

- **`activeVisualEffects` is already `showWhen`-gated.** If a sign reaches the
  adapter it is meant to be visible now; do not re-gate it in the renderer.
- **`computeBoundingBox()` lies on these meshes.** It expands over every morph
  target, `pose_supine` included, so it reports the whole body no matter which
  band you asked about. Scan positions directly when you need rest-pose extents.
- **Pose morph deltas are authored against original vertex positions**, so any
  base-position shift you add is re-applied in every pose. Shifts that look
  right standing can be badly wrong seated — check both.
- **Adding a morph does not require re-running the bake chain.** Append a shape
  key to the shipped GLB and verify mesh count, vertex count, skin count and
  the existing morph names/order survive the re-export.
- **Run `--inspect` before baking any new preset.** At chest height the widest
  vertices in the band are the HANDS, so a band + midline rule alone will lift
  the arm along with the hemithorax; that is what `lateral_max` is for.
- **The garments carry their own 14 morphs and sync by NAME**, garment-slot →
  body-slot. Morphs added to the body after the garment bake are simply not
  mirrored — safe, no index errors, but a body-only morph will not deform the
  shirt. The unilateral chest rise therefore reads on the EXPOSED chest, which
  is the state a student assessing breathing is in anyway.
