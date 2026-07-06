# ParaMedic Studio — Build Tracker
*Updated 2026-07-05. The single source of truth for what's shipped and what's next. Update this file as items land.*

**Gate status: 167 tests · case audits ERROR/WARN/INFO = 0/0/0 · CI on every push · 20 consecutive green production deploys.**

---

## ✅ Shipped to production

### Quality foundation & loop
- [x] 228 TypeScript errors → 0; ESLint fully clean
- [x] Test suite 0 → **167** (vitest, ~0.3s) — clinical engines, scoring, classifiers, routing audits
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
- [x] **Male patient actually renders male** — same defect, same cure: the 8 male macrodetail shape keys (zeroed at runtime) baked into the basis (`blender-mpfb-male-bake.py` → `patient-male.glb`, 5.2MB, verify-glb green); before/after silhouettes decisive; dead solid-material branch deleted
- [x] Unwellness states on live physiology: diaphoresis sheen (dries as treatment works), jaundice + scleral icterus, legs-first mottling with hysteresis
- [x] Stage 3 polish: N8AO + SMAA + ACES pass; theme-aware backdrop (dark-mode light-box fixed)
- [x] **Wound decals**: case injuries painted on the skin at their anatomical site (6 procedural sprite types; severity-sized; deterministic)
- [x] **Dressed by default** — casual clothes with weave, sheen, and interior lining; exam parts garments per region
- [x] **Consent beat**: awake patients audibly consent to exposure + coach card teaches asking first

### Interaction & playability
- [x] Click the anatomy itself: regions + in-region detail actions (eye→pupil check, carotid→pulse, quadrants) + feet
- [x] Replay debrief: timeline scrubber, jumpable event markers, vitals trends (Body-Interact pattern)
- [x] Weighted ABCDE scoring: order + timing count; year-banded targets (diploma 10:00 → Y4 5:00); arrest/⟨C⟩ABC exceptions
- [x] Treatment bags: search-within-open-bag, treatments above equipment, discoverability hint
- [x] Legible assessment cockpit + clinical-critique cards (solid dark, vivid tones)
- [x] Device-voiced alarms — field-validated: *"sounds exactly like a real monitor"*
- [x] **Wheeze routing**: authored findings now drive the recordings (14 cases were wrong: asthma→diminished, croup→diminished, OD→snoring); whole-library audit guards it permanently
- [x] Carotid pulse points on the neck; landmark dots model-derived
- [x] **Monitor quiver fixed at the root** (field report round 2: "the alarm keeps quivering"). Reproduced headless: 1162 elements jumping 61px together every ~2s. FOUR structural causes, all fixed: (1) the CO2 waveform block mounted/unmounted because treatment-target vitals without etco2 wiped it every animation frame (useGradualVitalChanges now preserves last-known optional channels); (2) alarms had no hysteresis — a vital hovering at its limit flipped the alarm set every tick (now latched: trip at limit, clear past a per-vital margin); (3) alarms fired from unconnected sensors (now gated on visibleVitals — leads off can't alarm); (4) the alarm status bar mounted/unmounted (now a permanent 22px strip) + `scrollbar-gutter: stable` for the classic-scrollbar page shake. Verified: page height byte-stable over 14s with a live borderline alarm; tap-to-connect → acquire → numeral → latched alarm all confirmed end-to-end

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
- [ ] **Monitor quiver — confirm the fix on your machine** (description received 2026-07-05, root-caused + fixed same day; see Interaction & playability)
- [ ] **LIFEPAK-15 alarm**: judge the shipped voicing against your ear; describe the gap or provide a recording to match
- [ ] ~~Landmark dots sign-off~~ — moot: overview dots deleted 2026-07-05 (A1); only in-region detail targets remain
- [ ] **Dark-mode backdrop**: 10-second shade check
- [ ] **Fabric/clothing verdict**: is the runtime fabric good enough, or escalate to Blender-authored garments?

## 🔜 Next build rounds (fresh session recommended — say the phrase)
- [x] ~~"Masculinize the male patient"~~ — shipped 2026-07-05 (see Visual realism)
- [x] ~~"Design proposal"~~ — **written 2026-07-05 → `DESIGN_PROPOSAL.md`**; remaining sections await approval: **B "consolidate selection"**, **C "frontier classroom"**
- [x] **A3 SHIPPED 2026-07-05 — the finding→treatment bridge.** A revealed finding earns an amber **Treat** arm on the action ring; clicking it opens the RIGHT jump bag — pre-filtered for diploma/1st/2nd years, full shelf for 3rd/4th (scaffolding fades). Mapping is data (`src/lib/findingTreatmentBridge.ts`, local-worker + hand-patched negation, 15 spec tests): stridor→breathing/adrenaline · silent chest→airway/ventilation · wheeze→breathing/salbutamol · crackles→medications/GTN · haemorrhage→circulation/bleeding; negation-aware ("no wheeze" never bridges). Auscultation stays sound-only pedagogy: the chest bridges from what the stethoscope actually PLAYED, and only after the student listened. Verified live (1st-year asthma): listen → hear wheeze → Treat → Breathing bag opens filtered to salbutamol → Salbutamol Nebulizer on the shelf. Suite 193.
- [x] **A1+A2 SHIPPED 2026-07-05 — no dots, organ-first action ring.** Overview landmark dots deleted (the body is the interface; in-region detail targets stay). Clicking anatomy anchors a verb ring at the exact click point — Inspect · Palpate · Percuss · Auscultate derived from the region's real actions (`src/lib/ringMenu.ts`, local-worker-authored against hand-written spec tests, 11 tests); verb fires the region's primary action of that technique; ring re-anchors on bare-skin clicks inside a region, respects guided-mode locks, dismisses on action/✕/region close. Verified live: chest click → ring → Auscultate → "Auscultating lung fields". Suite 178.
- [ ] Blender-authored garments (only if field test says runtime fabric isn't enough)
- [ ] Tiered input: voice-first mode for senior students (OMS pattern B)

## 📋 Backlog (valuable, not urgent)
- [x] ~~Move repo out of iCloud-synced Desktop~~ — **done 2026-07-05**: repo now at `~/Projects/app` (2,144 evicted files materialized first, worktree repaired, gate green, desktop launcher repointed). Found a stale June-30 clone already at that path holding **23 commits that exist nowhere else** (tablet one-finger swipe, sticky arrest banner — the pre-loss line): pushed to GitHub as `backup/jun30-tablet-arrest-fixes`, local copy kept at `~/Projects/app-jun30-stale`. Worth a cherry-pick review.
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
