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
| `facial_swelling` | `finding_facial_swelling` morph | ✅ *fixed 2026-09-06* |
| `soot` | `soot` decal on the face | ✅ *fixed 2026-09-06* |
| `vomit_risk` | none | ❌ |

## Open gaps, in the order worth doing them

### 1. `vomit_risk` — not rendered ❌
Declared for opioid reversal (naloxone) and post-ROSC. Arguably not a 3D
problem at all: the honest fix is probably a positioning/airway prompt rather
than a visual.

## Second audit: does every case declare anything at all?

The table above asks whether a declared sign renders. The other half of the
question is whether a case declares anything in the first place — a case that
matches no scenario has no signs, so its patient presents identically no matter
what is wrong with them.

**Coverage was 99/114. It is now 114/114.** Nine scenario families were added:
foreign-body airway obstruction, sepsis, acute behavioural disturbance,
anxiety/hyperventilation, eclampsia, imminent delivery, croup, heat illness,
hypertensive emergency and gastroenteritis. `infection`, `obstetric` and
`pediatric` already existed in the `ProblemFamily` union with nothing behind
them, which is a fair signal they were always intended.

One pre-existing mismatch was corrected on the way: an **eclamptic seizure at
34 weeks** was matching `metabolic-hypoglycaemia-seizure`, because the seizure
keywords collided and nothing obstetric outranked them. That case was teaching
students to reach for glucose in a seizing pregnant patient.

### Priority is a clinical statement, not a tie-breaker

- `airway-foreign-body-obstruction` sits at the top with anaphylaxis. A blocked
  airway kills fastest, and without that rank the bronchospasm scenario claims
  a choking patient and teaches salbutamol.
- `anxiety-hyperventilation` and `gastro-dehydration` sit at the bottom on
  purpose. Both are diagnoses of exclusion; if either outranked an organic
  scenario the app would teach students to reassure a PE or a surgical abdomen.
  A test asserts every organic scenario outranks them.

### Third pass: coverage is not the same as visibility

Matching a scenario does not guarantee the patient looks like anything. Ten
cases matched `trauma-haemorrhage-open-chest` — the only trauma scenario, so it
caught every fall, fracture and even both obstetric haemorrhages — and then
showed NOTHING, because its chest-wound visuals are correctly suppressed
without wound context. A wrist fracture and a hip fracture presented as a blank
patient.

Two more scenarios fixed that: `obstetric-haemorrhage` (above trauma, because
placenta praevia and a postpartum haemorrhage are the wrong compartment, source
control and destination for an open-chest scenario) and `trauma-limb-injury`
(below it, so a genuine open chest wound still wins).

**Cases showing at least one sign on first look: 113/114.** The one exception
is a minor RTC with neck pain, where a patient who looks unremarkable IS the
correct presentation.

### Keyword creep is the failure mode to watch

Every scenario added here initially STOLE a case from a scenario that was
already correct. All three are now locked into regression tests:

| Keyword | Also true of | Fix |
|---|---|---|
| `cannot speak` | dysphasic stroke, severe asthma | dropped from choking |
| `neck stiffness`, `photophobia` | subarachnoid haemorrhage | dropped from sepsis |
| `weeks pregnant` | every pregnant patient | dropped from imminent delivery |

A test now asserts no case is left uncovered, so the coverage cannot silently
regress either.

## Notes for whoever picks this up

- **`activeVisualEffects` is already `showWhen`-gated.** If a sign reaches the
  adapter it is meant to be visible now; do not re-gate it in the renderer.
- **`computeBoundingBox()` lies on these meshes.** It expands over every morph
  target, `pose_supine` included, so it reports the whole body no matter which
  band you asked about. Scan positions directly when you need rest-pose extents.
- **Pose morph deltas are authored against original vertex positions**, so any
  base-position shift you add is re-applied in every pose. Shifts that look
  right standing can be badly wrong seated — check both.
- **Morph amplitudes are tuning knobs, and `--replace` re-bakes one in place.**
  The first facial-swelling bake was too subtle to teach from; it was retuned
  without rebuilding the asset.
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
