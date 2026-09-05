# PATIENT-TREATMENT-CENTRE.md — build plan for the patient-treatment epic

Goal (Elias 2026-08-23): the student can actually TREAT the patient with no hassle —
pulse/CPR, see and stop bleeding, expose infection, clean transitions, futuristic
UI, realism "patient comes to life".

## Scope

1. **Patient-treatment core** (biggest problem): CPR/pulse from the 3D patient,
   bleeding that is *visible and continuous* until controlled, infection exposure,
   body-region clicks that land where the student looks.
2. **Flawless phase transitions**: year → case → hazards → scene → treating →
   transport-route → debrief paper (PDF clean).
3. **Futuristic design pass** on the student UI; realism page goal — patient "comes
   to life" (motion, voice, visuals).

## Diagnosis from live probe (2026-08-23)

- Monitor readable, 3D patient present, zero console errors.
- **Blocking**: a "Patient Examination" modal overlays the 3D patient, hiding it.
  That is the "can't see / can't click" complaint — the exam dock must be a
  side/below panel, never a cover.
- Wound sprites are single-static ink — no alive pulsing bleed; `active_bleeding`
  decal is painted once, and has no "stops when controlled" visual besides the
  decal itself.
- Region selector exists and the flow works; the friction is presentation.

## Proposed surgical fixes (in order)

1. Keep the exam dock as a *side rail* on desktop (assessment | patient | monitor),
   with the patient column + region selector always visible and clickable.
   No modal ever covers the body.
2. Add a **living bleed overlay** (3D sprites at the bleeding region):
   - Visible from the overview (student sees the leg bleeding *before* clicking).
   - Pulsing bright-dark red; fades to a "controlled" state when source control
     (tourniquet / dressing / chest seal) is applied; stops dripping.
   - Wound decal remains (dressed), but the *active* pulse dies.
3. Infection: exposed region shows the infected wound visible on the skin
   (infected-incision decal already exists) — add an explicit "Expose" affordance
   on the region dock so students know to expose the body part.

## Gate

`npm run check` green before any commit. Probe patient-treatment live (see
`probe-patient-treatment.mjs`) after every change.