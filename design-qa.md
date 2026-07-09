# Design QA — Supine Treatment Bay Reference Pass

## Visual Truth

- Source reference: `/Users/eliastlcthomas/Downloads/Generated image 1.png`
- Implementation screenshot: `/tmp/tactical-bay-supine-v10.png`
- Viewport: 1440 x 960
- State tested: student smart case, scene survey complete, active treatment/management bay

## Full-View Comparison

The treatment bay now follows the reference's ambulance-cockpit composition more closely: dispatch/anatomy panels sit on the left, equipment/debrief panels stay on the right, and the central viewport presents the patient supine on a stretcher rather than standing in a box. The functional simulator chrome remains, but the first patient view now reads as a treatment bay with rails, pillow, stretcher deck, monitor glow, and staged care affordances.

## Focused Regions

- Left rail: case-specific dispatch card, scene image, ETA/context chips, anatomy summary, and primary survey remain accessible.
- Center viewport: the full-body overview renders a supine patient on a stretcher with non-interactive straps, rails, foot board, IV stand, monitor glow, and applied-equipment cable hooks. Click classification is transformed back into the clinical coordinate frame so body-region selection still works.
- Right rail: treatment bags, staged equipment, debrief timeline, treatment loadout, and monitor controls remain visible without blocking the patient canvas.

## Patches Since Previous QA Pass

- Added an opt-in `treatmentBayMode` for the student management bay.
- Rotated the full-body overview into a supine stretcher presentation while preserving upright calibrated close-ups for focused exams.
- Made click hit-testing and surface marker sampling supine-aware so overview anatomy dots and region clicks continue to land correctly.
- Added stretcher immersion geometry: pillow, rails, straps, foot rail, IV stand, monitor traces, oxygen tubing, IV line, and monitor lead cables when equipment is applied.
- Collapsed the empty patient-loadout ribbon so it no longer hides the stretcher patient.
- Suppressed overview realism/finding text badges in supine mode; those cues remain in the care feed and anatomy panel, keeping the patient surface clear.

## Findings

- P3: The app remains a functional simulator interface, not a pixel-for-pixel static clone. The reference uses a photoreal generated patient/ambulance image; this implementation uses the current interactive GLB model and lightweight Three.js scene geometry so assessment and treatment controls keep working.
- P3: The global student header remains above the bay. It preserves navigation but still makes the first viewport less cinematic than the pure roadmap image.
- P3: Production build still reports the existing large chunk warning; no runtime errors were observed in the treatment bay screenshot run.

## Result

final result: passed

---

# Design QA — Patient-First Chest Assessment Dock

## Visual Truth

- Source reference: `/Users/eliastlcthomas/Downloads/Generated image 1.png`
- Implementation screenshot: `/tmp/tactical-bay-dev-chest-clean.png`
- Viewport: 1440 x 960
- State tested: dev live case `resp-001`, treatment/management bay, chest region selected

## Interaction Comparison

The active chest assessment no longer places action controls, patient reactions, the chest loupe, or finding cards over the patient's chest. The selected region keeps the supine stretcher view and moves the exam workflow into a dock under the patient viewport: technique buttons on the left, target points below them, and the chest map in the right side of the dock.

## Patches In This Pass

- Added a patient-first exam dock for treatment-bay active regions.
- Kept the treatment-bay supine camera when selecting a body region instead of zooming into the old close-up overlay state.
- Disabled the older floating `AssessmentActionDock`, patient reaction card, absolute loupe, and in-frame finding overlays for treatment-bay active regions.
- Hid the empty patient-loadout ribbon and body-cam label while the patient-first dock is open so they do not collide with the dock.
- Added a dev-only `?devLiveCase=<caseId>` route for deterministic visual QA of the live treatment bay.

## Verification

- `npm run typecheck`: passed
- `npm run lint`: passed
- Browser QA: `/tmp/tactical-bay-dev-chest-clean.png`
- DOM check: patient-first dock present, old assessment cockpit text absent, empty loadout ribbon hidden, body-cam label hidden, no console errors.

## Findings

- P3: The patient model itself is still the current interactive GLB, not yet the photoreal patient quality of the roadmap reference.
- P3: The global student header and surrounding simulator rails remain denser than the reference image, but the clinical controls no longer cover the selected anatomy.

## Result

final result: passed
