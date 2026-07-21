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

# Design QA — Patient Visibility and Live Monitor

## Visual Truth

- Source reference: `/Users/eliastlcthomas/Downloads/Generated image 1.png`
- Implementation screenshot: `/tmp/treatment-bay-management-live-monitor.png`
- Viewport: 1440 x 960
- State tested: dev live case `resp-001`, treatment/management bay overview

## Interaction Comparison

The treatment bay now keeps the patient on the stretcher in the central working area, with the treatment loadout on the left and a live monitor/intervention stack on the right. The monitor powers on with the management bay so the student can read the current rhythm and vitals immediately; the hardware controls remain interactive.

## Patches In This Pass

- Reframed the lying patient with a wider three-quarter camera preset so the full patient remains available for selection instead of dropping below the viewport.
- Aimed the preset at the thoraco-abdominal centre and reduced the foreground rail opacity so the patient reads as the primary target.
- Kept the treatment options in the left rail and the monitor beside interventions on the right.
- Powered the monitor on at management-bay entry so the station presents live HR, SpO2, RR and BP rather than an empty display.

## Verification

- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed; existing large-chunk warnings remain.
- Browser capture: `/tmp/treatment-bay-management-live-monitor.png`
- DOM metrics: patient `778 x 830`, treatment rail `269 x 653`, monitor card `302 x 204`; dispatch context absent; treatment bags present.
- Interaction check: opening `Open Breathing Bag` changed the loadout to `Breathing Action Deck` while the right-side monitor remained visible.

## Result

final result: passed

---

# Design QA — Management Cockpit Rebalance

## Visual Truth

- Source reference: `/Users/eliastlcthomas/Downloads/Generated image 1.png`
- Implementation screenshot: `/tmp/tactical-bay-management-cockpit-final-torso.png`
- Viewport: 1440 x 960
- State tested: dev live case `resp-001`, treatment/management bay overview

## Interaction Comparison

The management bay now behaves more like a treatment cockpit: treatment loadout is the left working rail, the patient remains the centre canvas, and the monitor plus intervention state sit on the right. The old dispatch-style panel is no longer present in the management bay, which keeps the workflow focused on treating and reassessing.

## Patches In This Pass

- Replaced the left-side dispatch/context block with the interactive `TreatmentJumpBagPanel`.
- Moved monitor, staged interventions, pulse status, live care feed, and debrief into a single right-side management stack.
- Compacted the top bay command strip and moved the live care feed out of the header so the patient/monitor workspace starts higher in the first viewport.
- Added a compact monitor wrapper for the right rail so the monitor is visible without pushing all treatment state below the fold.
- Changed the treatment-bay camera to a three-quarter side clinician angle and reduced foreground rail opacity so the patient is easier to see and click.

## Verification

- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed; existing large-chunk warnings remain.
- Browser QA: `/tmp/tactical-bay-management-cockpit-final-torso.png`
- DOM check: dispatch context absent, treatment loadout present, right rail ordered monitor -> interventions -> pulse -> care feed -> debrief, no console/page errors.

## Findings

- P3: The patient viewport still has more ambulance-wall headroom than the aspirational reference. The current interactive GLB and stretcher geometry are preserved for clinical clickability; a later pass should add a true cinematic camera rail or tighter patient-first crop.
- P3: The monitor is intentionally compacted in the right rail. A future dedicated compact monitor component would be cleaner than CSS-scaling the full monitor.

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
