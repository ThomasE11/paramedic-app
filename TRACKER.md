# ParaMedic Studio — Build Tracker
*Updated 2026-07-06. The single source of truth for what's shipped and what's next. Update this file as items land.*

**Gate status: 264 tests · typecheck clean · lint clean · case audits ERROR/WARN/INFO = 0/0/0 · CI on every push · 21 consecutive green production deploys.**

---

## ✅ Shipped to production (or ready for integration)

### Quality foundation & loop
- [x] 228 TypeScript errors → 0; ESLint fully clean
- [x] Test suite 0 → **249** (vitest, ~1s) — clinical engines, scoring, classifiers, routing audits, scenario layer, visual state adapter, treatment loop, sentinel audit, mannequin integration
- [x] `npm run check` gate (typecheck + lint + tests + case audits) + **GitHub Actions CI** on every push/PR
- [x] 2 real clinical engine bugs found by tests: chest-seal effects never applied · O2 could *lower* SpO2
- [x] Latent bugs fixed while typing: classroom replay arg-order, PMH row never rendered, arrest detection field, murmur audio key
- [x] Vitals history: 1Hz recording with real timestamps (was ~12/s with stale times; 7.7k-row sessions)
- [x] Clinical audit fully clean: 24 protocol-less cases → executable protocols; 27 recovery targets reconciled against the physiology engine

### Performance
- [x] First load −483KB gz: case library + PDF stack off the entry chunk (palette lazy-loads; Vite preload-helper pinned to its own chunk)
- [x] Adaptive quality ladder: low FPS sheds post-processing → resolution → shadows, recovers with hysteresis (iPad insurance)

### Visual realism (research Stages 1–3 complete)
- [x] HDRI studio lighting + ACES + skin dielectric response (was flat 4-directional rig)
- [x] Living patient: chest rises at the live RR (apnoea = still), blink, unconscious eyes stay closed, idle sway stills when unresponsive
- [x] Real eye meshes + AO-baked skin on **both** patients (Blender headless pipeline)
- [x] Female patient actually renders female (was male-identical basis) with eyes in sockets (were painted in her mouth); MPFB2/CC0 provenance confirmed — no RPM assets remain
- [x] Unwellness states on live physiology: diaphoresis sheen (dries as treatment works), jaundice + scleral icterus, legs-first mottling with hysteresis
- [x] Stage 3 polish: N8AO + SMAA + ACES pass; theme-aware backdrop (dark-mode light-box fixed)
- [x] **Wound decals**: case injuries painted on the skin at their anatomical site (6 procedural sprite types; severity-sized; deterministic)
- [x] **Dressed by default** — casual clothes with weave, sheen, and interior lining; exam parts garments per region
- [x] **Consent beat**: awake patients audibly consent to exposure + coach card teaches asking first

### Realism scenario layer (Round 1 — NEW)
- [x] **`patientRealismScenarios.ts`**: 8 typed sentinel scenarios (respiratory, anaphylaxis, opioid, hypoglycaemia, ACS, stroke, trauma, burns) with match keywords, priority, active problems, immediate visuals, equipment anchors, patient behavior rules, treatment responses, reassessment requirements, debrief signals
- [x] `matchRealismScenarios()` — keyword matching with priority sorting
- [x] `deriveScenarioVisuals()` — gated visual effects from matched scenarios (`immediate`, `on-assessment`, `if-deteriorating`, `after-treatment`)
- [x] `deriveScenarioTreatmentResponses()` — treatment fit evaluation from matched scenarios
- [x] `deriveRealismScenarioState()` — integrated state with 8 output channels
- [x] **18 tests** covering 5+ scenario families, treatment responses, and integrated state

### Director integration (Round 2 — NEW)
- [x] **`patientRealismDirector.ts`** extended: `RealismDirectorState` now includes `matchedScenarioIds`, `activeProblems`, `visualEffects`, `equipmentAnchors`, `patientBehavior`, `treatmentResponses`, `reassessmentRequirements`, `debriefSignals`
- [x] `deriveRealismDirectorState()` merges scenario state into every director output
- [x] Backward compatible — all existing fields unchanged, all existing tests pass
- [x] **2 existing tests updated** to verify scenario integration

### Visual state adapter (Round 3 — NEW)
- [x] **`patientVisualState.ts`**: pure adapter — takes `RealismDirectorState` → flat `PatientVisualState` with skin effects, eye effects, chest rise asymmetry, wound/blood/burn overlays, equipment anchors (region + appearance + reassessment metadata), seizure/tremor/vomit flags
- [x] No three.js references, no rendering logic — follows `unwellnessStates.ts` pattern
- [x] **8 tests** covering all output channels: empty state, respiratory, opioid, trauma + equipment, anaphylaxis, burns, anchor metadata, seizure

### Treatment prepare/apply/reassess loop (Round 4 — NEW)
- [x] **`patientRealismDirector.ts`** extended: `TreatmentLoopState` interface with `'applied' | 'reassessed'` lifecycle + `pendingReassessmentIds[]`, `fullyRealizedTreatmentIds[]`
- [x] **`deriveTreatmentLoopStates()`**: maps applied treatment IDs against reassessed IDs — 45 high-impact treatment variants catalogued, including actual app aliases (`iv_access`, vented chest seal, occlusive dressing, fluids, TXA, IO, ventilator setup, named splints, spinal devices, cooling/warming)
- [x] Each treatment has: category label, specific reassessment prompt, pending note for debrief
- [x] Wired into `deriveRealismDirectorState()` — loop state included in every director output
- [x] `StudentPanel` now closes treatment loops from real assessment actions: respiratory reassessment closes oxygen/nebuliser/CPAP/BVM, circulation closes IV/IO/fluids/TXA, BGL/GCS closes glucose/dextrose, ECG/pain closes ACS meds, limb checks close splints/tourniquets
- [x] `deriveClinicalManagementDebrief()` turns pending/reassessed loops into end-of-case educator feedback, coaching points, and a capped reassessment penalty
- [x] Post-case scoring, smart-grade narrative, and PDF export now all flag unreassessed high-impact treatments instead of treating "applied" as clinically complete
- [x] Backward compatible — no existing fields changed
- [x] **16 tests** covering empty, applied, reassessed, prefix matching, mixed states, real catalogue aliases, assessment-to-treatment follow-up mapping, and management-loop debrief penalties

### Sentinel case polish audit (Round 5 — NEW)
- [x] **`sentinelCaseAudit.test.ts`**: 33 tests auditing 8 premium sentinel cases (asthma, anaphylaxis, opioid OD, hypoglycaemia, ACS/STEMI, stroke, open chest trauma, burns/inhalation)
- [x] Each case verified: scenario matching, visual derivation, treatment response correctness, equipment anchor generation, treatment loop state, reassessment requirements
- [x] Found + fixed pre-existing bug in `patientRealism.ts`: `pea` in cardiac regex matched "speaking" — false-positive cardiac classification on non-cardiac cases (asthma → cardiac)
- [x] Word-boundary anchors added: `\bvt\b`, `\bpea\b`

### Body3D integration (Round 4B — NEW)
- [x] `StudentPanel` now derives `PatientVisualState` from the realism director and passes it into `Body3DModel`
- [x] `Body3DModel` consumes scenario visuals without importing clinical scenario logic: pupil effects, scenario pallor/cyanosis tint, diaphoresis/mottling strengths, wound/burn/bleeding decals, and compact overview markers
- [x] Treatment equipment overlay recognizes `iv_cannula` as visible IV access, not only `iv_access`

### Coherence round (Round 4E — NEW, 2026-07-10 evening)
- [x] **A convulsing patient does not talk**: canPatientVocalize (lib) supplies case-authored silence (active seizure / arrest / GCS ≤ 8) to every speech surface — voice hook + both StudentPanel treatment-quote paths (which previously spoke unchecked). Post-ictal patients still talk.
- [x] **Defib pads + BVM are 3D on the patient** — pads anterior-lateral with cables off to the monitor side; BVM bag squeezes with the shared breath clock. Sticker cards retired (ventilator card remains, last one).
- [x] Paediatric guard: patientInfo.age <= 0 = placeholder, not a newborn (MCI case)
- [x] Verified: all 11 paediatric-age cases carry correct patientInfo.age — "child renders adult" reports were the stale Vercel preview (pediatric stature deployed 4fe2224a)
- [ ] **NEXT: CoD-style bag selector** — bag opens into a scrollable equipment carousel (big webp art, quick-apply); public/equipment-assets has the art
- [ ] NEXT: ventilator 3D unit; collar/splint/dressing meshes on the patient

### The scene is the place (Round 4D — NEW, 2026-07-10)
- [x] **Stability root-fix**: the "Maximum update depth" storm is dead — surface-sampler handoff rAF-coalesced, scenarioBodyInjuries content-keyed (was rebuilding the ENTIRE patient clone every vitals tick), VitalSignsMonitor case-reset content-guarded (was firing 6 setStates per parent render and wiping assessment progress). Verified 0 errors through bay mount + GLB load + viewport resize (was 57+ and a StudentPanel crash)
- [x] **Case-authored motion**: a patient authored convulsing convulses on arrival; ped-001's febrile child twitches; tremor/shivering shows immediately. Presentation-fields-only matching — teaching text ("status epilepticus = >5 min") can never set the patient shaking
- [x] **Environment scenes**: the set dressing follows the case — villa living room, bedroom, bathroom, office, restaurant (with the knocked-over chair), street/roadside, desert heat, construction/industrial; ambulance bay is the fallback. Pure classifier (lib/sceneEnvironment) tested against real library phrasings
- [x] **SceneKit**: response bag + trauma pouch, cardiac monitor (dark until a monitoring treatment is applied, then live ECG sweep), O2 cylinder — on the floor at the patient's side
- [x] **Walk-in arrival**: camera starts at the doorway and dollies to the bedside over 2.2 s, once per case; grabbing the scene mid-walk takes over
- [x] **Clothing v3**: per-case wardrobe (deterministic seed, gender pool, elderly mellow) + fabric pass (Laplacian smoothing erases transmitted anatomy, value-noise wrinkles, hems pinned). ponytail ceiling: kandura/abaya need Blender garments (cut topology)
- [x] **Paediatric stature**: age scales the presentation group (3yo = 0.56), head stays at the pillow, clicks map back through worldToLocal — ped-001 presents a child-sized patient. Proper MPFB child mesh spawned as its own task
- [x] **Negation-aware scenario matching**: "No rash noted" no longer matches the anaphylaxis scenario (found live on ped-001; sentinel audit green)

### Motion channels alive (Round 4C — NEW)
- [x] The four computed-but-inert `PatientVisualState` channels now move the patient: `breathingEffort` (deeper chest excursion + breath-synced torso heave via the shared breath clock), `chestRiseAsymmetry` (shallow chest rise — one bilateral morph; per-side rise needs new GLB morph targets), `hasTremor` (fine 9 Hz shiver), `hasSeizureActivity` (3 Hz clonic jerking that overrides unconscious stillness)
- [x] `patientMotion.ts` — pure amplitude math (`chestRiseAmplitude` + MOTION constants as the tuning knobs), **6 tests**; arrest stills every channel
- [x] All root motion stays in LifeSigns (single writer), eased in/out ~0.7 s so mid-case onset reads as deterioration, not a snap
- [x] ~~KNOWN PRE-EXISTING: `onSurfaceSampler` effect loop~~ — FIXED in Round 4D (see above): rAF-coalesced handoff + content-keyed injuries + monitor reset guard; verified 0 errors through mount/load/resize

### Interaction & playability
- [x] Click the anatomy itself: regions + in-region detail actions (eye→pupil check, carotid→pulse, quadrants) + feet
- [x] Replay debrief: timeline scrubber, jumpable event markers, vitals trends (Body-Interact pattern)
- [x] Weighted ABCDE scoring: order + timing count; year-banded targets (diploma 10:00 → Y4 5:00); arrest/⟨C⟩ABC exceptions
- [x] Treatment bags: search-within-open-bag, treatments above equipment, discoverability hint
- [x] Legible assessment cockpit + clinical-critique cards (solid dark, vivid tones)
- [x] Training Mission Board: case selection consolidated into full scenario, category drill, and condition practice, with smart skill/equipment/time filters and a launch preview
- [x] Progressive cohort case library: seniors retain prerequisite review cases; juniors are protected from senior complexity; diploma sees diploma + Year 1/2 fundamentals
- [x] Clinical realism director: live scene constraints, visible patient cues, treatment evidence, and reassessment prompts now sit inside the patient bay flow
- [x] Device-voiced alarms — field-validated: *"sounds exactly like a real monitor"*
- [x] **Wheeze routing**: authored findings now drive the recordings (14 cases were wrong: asthma→diminished, croup→diminished, OD→snoring); whole-library audit guards it permanently
- [x] Carotid pulse points on the neck; landmark dots model-derived

### Cases & content
- [x] 114 cases (was 100), diploma→Year 4 bands filled; all with executable protocols; physiology verified 0 findings
- [x] Gender-consistency guard (narrative vs mesh) across every case

### Infrastructure
- [x] Desktop launcher (ParaMedic Studio.app)
- [x] **Local-LLM worker** (`scripts/local-worker.mjs`, Qwen-7B via Ollama): 2 modules shipped this way; calibration + accept-and-patch pattern in memory notes
- [x] Blender headless pipeline: eyes/AO authoring, female shape bake, roundtrip test, `verify-glb.cjs`
- [x] Harnesses: `capture-model.mjs` (screenshots via real flow), `measure-fps.mjs`, probe scripts
- [x] Research doc (`PATIENT_SIM_RESEARCH.md`): industry patterns, technique menu, licensed asset list

---

## ⏳ Outstanding — needs Elias (minutes each)
- [ ] **Monitor quiver**: one sentence on *what* moves (numbers? waveform? whole panel?) → then I fix at the root
- [ ] **LIFEPAK-15 alarm**: judge the shipped voicing against your ear; describe the gap or provide a recording to match
- [ ] **Landmark dots**: on-screen sign-off (or per-dot nudge directions)
- [ ] **Dark-mode backdrop**: 10-second shade check
- [ ] **Fabric/clothing verdict**: is the runtime fabric good enough, or escalate to Blender-authored garments?

## 🔜 Next build rounds
- [ ] **"Masculinize the male patient"** — Blender pass (jaw, brow, shoulders); root cause of the "male shows female" report
- [ ] **Frontier classroom from design proposal** — instructor control tower, role assignments, injects, synchronized debrief
- [ ] **Sentinel case polish (Round 5)** — pick 8 premium cases (one per family) and verify each: clinical consistency, finding visibility, treatment attachment, wrong-action behavior, gradual vitals, reassessment requirement
- [ ] Blender-authored garments (only if field test says runtime fabric isn't enough)
- [ ] Tiered input: voice-first mode for senior students (OMS pattern B)

## 📋 Backlog (valuable, not urgent)
- [ ] Move repo out of iCloud-synced Desktop (`~/Projects/`) — kills the SIGBUS/duplicate-file class permanently
- [ ] In-app Attributions screen (CC0/CC-BY statements drafted in research doc + commits)
- [ ] Split `cases.ts` chunk per year-level (1.2MB loads on first case entry)
- [ ] E2E playwright suite in CI (probes exist ad-hoc; formalize the case-flow smoke test)
- [ ] 12-lead/ECG deep fidelity pass (iSimulate benchmark from research)
- [ ] cmi5/xAPI telemetry for LMS integration (research §4)
- [ ] `public/scene-assets` (145MB in git) → CDN/Blob if it grows
- [ ] Wound decals: exposure-gated reveal once Blender garments land (currently visible on uncovered skin — correct for current clothing coverage)

## 🧠 Known-not-bugs (don't re-chase — see memory notes)
- "Maximum update depth" console errors during dev = HMR artifact, not real (verified clean on fresh loads; absent in prod)
- `validate-orientation.cjs` toe-heuristic flags both patients "backwards" — false positive (MPFB heel wedge)
- Production URLs 302 for curl = Vercel Deployment Protection (SSO), not an outage
