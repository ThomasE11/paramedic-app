# Build Plan — Remaining 6 Tasks
*Planned by Fable 5, 2026-07-21. Orchestrated by Hermes. Built by Opus 4.8.*

## Recommended build order

| # | Task | Complexity | Why this position |
|---|------|-----------|-------------------|
| 1 | Split cases.ts chunks | M | Foundation. Touches StudentPanel, ClassroomLobby, ClassroomJoin imports — do BEFORE classroom rework so task 5 builds on new loader. Pure perf, no clinical risk. |
| 2 | Attributions screen | S | Zero-dependency quick win. Fixes licensing accuracy conflict (see below). |
| 3 | Voice-first mode | S/M | ~70% already exists (useVoiceInput, VoiceCommandButton, assessment wiring). Finishing is cheap; classroom injects can reuse same intent layer. |
| 4 | 12-lead ECG fidelity | M | Fully self-contained (ecgRhythms.ts + VitalSignsMonitor.tsx). Ships before classroom so instructor rhythm-override injects display improved 12-lead. |
| 5 | Frontier classroom | L | Largest, highest-integration-risk. Benefits from 1, 3, 4 being stable. Extends existing useClassroomSession broadcast protocol. |
| 6 | Blender garments | L | GATED — TRACKER lists "Fabric/clothing verdict" as outstanding Elias decision. Highest technical risk. Do not start until verdict lands. |

---

## Task 1 — Split cases.ts per year-level chunk (Priority 1, M)

**Current state:** cases.ts is 631KB/11.8k lines aggregating 6 source files. vite.config.ts already pins all to single `cases` chunk, excluded from modulePreload — but statically imported by StudentPanel.tsx:59, ClassroomLobby.tsx:62, ClassroomJoin.tsx:49, so 1.2MB rides in on first case entry.

**Approach:** chunk granularity = per source file (approximates year-level). Win is parallel fetch + nothing on entry path.

**Files:**
- Create `src/data/caseLibrary.ts` — async loader: `loadAllCases(): Promise<CaseScenario[]>`, `loadCasesForCohort(year)`
- Create `src/data/caseMeta.ts` — static metadata arrays (yearLevels, caseCategories, complexityLevels) moved out of cases.ts
- Modify `src/data/cases.ts` — only aggregation/export tail; keep sync `allCases` export for tests/audits
- Modify `src/components/StudentPanel.tsx`, `ClassroomLobby.tsx`, `ClassroomJoin.tsx` — swap static import for `loadAllCases()` + loading state
- Modify `vite.config.ts` — split single `cases` manualChunk into `cases-core`, `cases-year1`, `cases-year2`, `cases-enhanced`, `cases-litfl`, `cases-variants`

**Risks:** Async waterfall on case entry → fire `loadAllCases()` on role transition in App.tsx so chunks stream during mission-board browse.

**Verify:** `npm run build` → confirm entry + StudentPanel chunks no longer contain case data; `npm run check`; manual landing → mission board → launch resp-001; one vitest for loader cache.

---

## Task 2 — In-app Attributions screen (Priority 2, S)

**⚠ Licensing conflict to resolve first:** TRACKER.md says "no RPM assets remain / MPFB2 CC0 confirmed", but footer still credits Ready Player Me CC BY-NC, and scripts/anatomy-models/README says female model is RPM brunette-t.glb. CC BY-NC on commercial product is a real problem. Verify actual provenance of patient-female.glb before writing credits.

**Files:**
- Create `src/components/AttributionsDialog.tsx` — shadcn Dialog, lazy-imported, copying ClinicalReferenceDialog pattern
- Modify `src/App.tsx` — footer link "Attributions" opens dialog; collapse inline footer credit text into dialog
- i18n: dialog title/trigger through i18next

**Verify:** `npm run check`; visual open/close in both themes + Arabic RTL.

---

## Task 3 — Voice-first mode for senior students (Priority 3, S/M)

**Current state:** useVoiceInput.ts and VoiceCommandButton.tsx exist; StudentPanel wires assessment commands. Missing: treatment intents, bag/monitor navigation intents, the "mode", senior gating.

**Files:**
- Create `src/lib/voiceIntents.ts` — pure function `buildVoiceIntents(case, treatments, phase): VoiceCommand[]` with assessment + treatment + navigation intents
- Modify `src/components/StudentPanel.tsx` — voice-first toggle (persisted localStorage), gated to yearLevel ∈ {'3rd-year','4th-year'}, confirm beat for drug administration
- Create `src/lib/voiceIntents.test.ts` — ~8 tests: aliases resolve, harmful/unavailable excluded, phase filtering, confirm-required flag

**Verify:** `npm run check`; manual Chrome + iPad Safari run of resp-001 by voice.

---

## Task 4 — 12-lead/ECG deep fidelity pass (Priority 4, M)

**Current state:** ecgRhythms.ts has per-lead TwelveLeadMorphology functions, STEMI variants, LBBB/RBBB. VitalSignsMonitor.tsx renders canvas + TwelveLeadECG with LITFL static-image fallback.

**Gap vs iSimulate:** print-style layout, calibration standards, grid, axis, making programmatic render good enough to drop LITFL images (likely CC BY-NC-SA).

**Key decisions:**
1. Standard print layout: 4 columns × 3 rows + continuous lead-II rhythm strip
2. Paper realism on canvas: pink 1mm/5mm grid, 10mm/mV calibration pulse, 25mm/s sweep
3. Axis deviation from frontal plane QRS amplitudes
4. Machine interpretation header: rate, intervals, "***ACUTE MI***" banner for STEMI
5. Demote LITFL images to dev-reference only

**Files:**
- Create `src/components/TwelveLeadReport.tsx` — print-style layout component
- Modify `src/data/ecgRhythms.ts` — export `measureRhythm(rhythm): { axisDegrees, prMs, qrsMs, qtcMs, interpretation[] }`
- Modify `src/components/VitalSignsMonitor.tsx` — swap in TwelveLeadReport, remove/flag LITFL map
- Create `src/data/ecgRhythms.test.ts` — ~12 tests sampling waveform functions numerically

**Verify:** `npm run check` + new tests; visual on cardiac-001 (anterior STEMI); FPS via measure-fps.mjs.

---

## Task 5 — Frontier classroom control tower (Priority 5, L)

**Current state:** useClassroomSession.ts has Supabase Realtime channel, typed broadcasts, SharedCaseState. InstructorLiveControls.tsx does vitals/rhythm overrides. Injects ~40% shipped.

**Sub-phases (each committed green separately):**

**5a. Roles** (S)
- Extend SharedCaseState + new broadcast `role_assigned`; ClassroomRole = 'lead' | 'airway' | 'circulation' | 'medication' | 'scribe'
- Create `src/lib/classroomRoles.ts` — role definitions + `isActionAllowedForRole(role, actionKind)`
- Modify ClassroomLobby.tsx (assign in roster), StudentPanel.tsx (role badge, soft warning for out-of-role), ClassroomBroadcastBar.tsx (show own role)

**5b. Inject library** (M)
- Create `src/lib/classroomInjects.ts` — typed inject catalogue: bystander_update, hospital_radio, equipment_failure, patient_refusal, new_finding + existing vitals/rhythm presets
- New broadcast `inject: { kind, injectId, payload, at }`; StudentPanel applies manifestation
- Modify InstructorLiveControls.tsx → control tower panel with tabs [Vitals | Rhythm | Injects | Roles | Timeline]

**5c. Control tower layout** (M)
- Modify ClassroomHost.tsx — instructor sees case state summary, live vitals, shared timeline, roster with roles, inject panel, rubric progress; keep "view patient bay" toggle

**5d. Synchronized debrief** (M)
- End-of-case: host broadcasts `debrief_started { timelineSnapshot }`; all clients open DebriefReplay.tsx
- Add instructor scrub-sync: `debrief_seek { t }` broadcast, students' scrubber follows (can detach)
- Modify DebriefReplay.tsx (accept external seek + inject markers), useClassroomSession.ts (2 new broadcast kinds)

**Tests:** classroomRoles.test.ts, classroomInjects.test.ts, extend session-state tests. Realtime transport manual-tested (two browsers).

**Verify per phase:** `npm run check`; two-browser manual session; playwright smoke if harness supports two contexts.

---

## Task 6 — Blender-authored garments (Priority 6, L, GATED)

**Do not start until Elias answers the outstanding "Fabric/clothing verdict".** If "good enough" — delete this task.

**If greenlit — hard constraint:** patients are baked meshes, no skeleton. Runtime ClothingLayer works because it clones body's own vertices and mirrors morph influences. Separate garment GLB has different topology, can't inherit body morphs by index.

**Key decision — author garments in Blender FROM the body mesh, with morphs baked in Blender:**
1. New script `scripts/anatomy-models/blender-garment-bake.py`: import patient GLB → duplicate body → mask to garment regions → shrinkwrap + solidify + cloth-sim → transfer morph targets → export garment GLBs with matching morph target names
2. Runtime: garment GLB loads via useGLTF; morph sync reuses name-matched influence-mirroring
3. Split garment into named meshes per CLOTHING_PARTING regions so existing hide map works
4. Keep runtime ClothingLayer as fallback behind a flag for one release
5. Unlocks exposure-gated wound decal reveal

**Files:** create blender-garment-bake.py; modify ClothingLayer.tsx, BodyMesh.tsx, verify-glb.cjs; assets public/models/garment-*.glb

**Risks:** cloth-sim drape intersecting breathing morph extremes; GLB size on iPad (<2MB, draco if needed); z-fighting.

**Verify:** verify-glb.cjs roundtrip, capture-model.mjs screenshots, measure-fps.mjs, region-exposure manual pass, npm run check.

---

## Cross-cutting

- **Gate discipline:** each sub-phase lands `npm run check` green + conventional commit; classroom is 4 commits minimum
- **i18n:** new UI strings through i18next EN+AR
- **Two decisions needed from Elias before/during this run:**
  1. Garment verdict (gates task 6 entirely)
  2. Licensing: RPM female mesh + LITFL images — both possibly CC BY-NC on commercial product