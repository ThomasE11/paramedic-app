# Patient Simulator Research — Visual Realism, Playability, Open-Source Scaffolds
*Compiled 2026-07-02 from four parallel research streams. Goal: ship a patient assessment that surpasses the current build — visually stunning, genuinely playable, industry-level.*

---

## 1. Where we are today (local audit)

- **Stack**: three r0.183, @react-three/fiber 9.5, drei 10.7. No post-processing package.
- **Patient**: `patient.glb` (MakeHuman-derived, ~27k faces, single 2048px *diffuse-only* texture, **painted-on eyes**, no normal/roughness/AO maps), `patient-female.glb` (RPM). An **MPFB export already exists** (`patient-mpfb-untextured.bak.glb`) — the CC0 pipeline below is one we've already touched.
- **Lighting**: ambient + hemisphere + 4 directionals. **No HDRI environment map** — this is why skin reads flat/plastic. ContactShadows present.
- **Aliveness systems already built**: pupil size/reactivity (texture repaint), perfusion tint (cyanosis/pallor from live SpO2/shock index), finding morphs (JVD, abdo distension), scrubs "Dressed" view, region camera rig, carotid/radial pulse points, breath/heart/bowel audio, patient TTS + voice input.
- **Case engine**: 100 cases, all with executable treatment protocols as of today (24 gaps closed — see §6), dynamic deterioration, treatment physiology engine, 60-unit-test + audit CI gate.

**Honest gap vs industry**: our *mechanics* are already close to Body Interact's model (ABCDE exam → findings → treatments → physiology). The gap is (a) the patient doesn't look/feel alive (no blink, no breathing motion, flat lighting, painted eyes) and (b) case depth/feedback polish.

## 2. What the industry does (Body Interact, Full Code, OMS, SimX, vSim, iSimulate, PerSim)

Full comparison table with sources: see research stream 2 (agent output archived in session). Key facts:
- Body Interact: ABCDE exam menu, assessment = **40% of score**, real-time physiology, patients "breathe, speak, react"; voice/text free-form patient interview.
- Full Code: ChatGPT-backed Patient AI history-taking; reviewers single out "looks unwell when they need to" + live vitals as the realism hooks.
- OMS (Unity): explicit "**unwellness systems**" — pallor, diaphoresis, jaundice rendered on the avatar; ~15-min crash timers; dedicated debrief room with timeline.
- iSimulate: an entire company built on **pixel-faithful monitor replicas** — waveform fidelity is realism.
- PerSim (AR): educators cite **facial expression + skin colour change + accessory-muscle breathing** as what manikins can't do.

### The Realism Top 10 (ranked by impact; difficulty for our stack)
1. Physiologically-coupled breathing (RR-driven chest rise, effort escalation) — *easy/medium*
2. Live monitor waveforms with trends/alarms — *medium (we have much of it)*
3. Patient talks — free-text/voice AI conversation — *medium (we have the seams)*
4. Visible unwellness skin states (pallor/cyanosis/diaphoresis/jaundice) — *medium (perfusion tint exists; extend)*
5. Consequence physics: deterioration + time pressure — *mostly built*
6. Pain/distress facial expressions + behaviour — *hard (needs face rig)*
7. Real positional auscultation audio — *mostly built*
8. Treatments visibly land on the body (mask, IV, pads) — *medium (partially built)*
9. Eye behaviour: blink, saccades, gaze, GCS-coupled lids — *easy/medium*
10. Scene staging + bystander NPCs — *medium*

### Interaction patterns to copy outright
- **A. Body Interact's weighted ABCDE spine**: every exam action timestamped, findings re-adjust as physiology changes, assessment worth a fixed large slice of the score.
- **B. OMS's tiered input**: same case content, two front-ends (menu for novices → natural voice for seniors) + a 3-panel debrief (timeline / scored actions / vitals graph).
- **C. iSimulate's event-synced replay**: record the state stream, replay with vitals HUD + jumpable event markers. We already own the state stream — this is nearly free and converts the sim into a teaching instrument.

## 3. Rendering upgrade path (three.js techniques, gain-per-effort)

**Stage 1 — Light & motion (days, ~zero FPS cost) → most of the "alive" perception**
1. drei `<Environment>` HDRI (1k studio/hospital, Poly Haven CC0) + one shadow key light; ACES tone mapping verified; retune exposure. *Biggest single jump for skin.*
2. Roughness variation on skin (even a constant ~0.45 + painted map: forehead/nose shinier, cheeks matte).
3. **Procedural life loop** in one `useFrame` (ref mutation, no setState): blink every 2–6s, micro-saccades, breathing at the case's actual RR (clinical signal!), micro head sway. Applied after `mixer.update()`.

**Stage 2 — Face & eyes authoring pass (~a week in Blender)**
4. Real eye meshes: clearcoat cornea sphere + iris disc, limbal ring; saccades + gaze-coupled eyelids; GCS-coupled lid droop.
5. ARKit-subset morphs: `eyeBlinkLeft/Right`, `browInnerUp/Down`, `jawOpen`, `mouthStretch` + custom `painGrimace`, `chestRise`.
6. Bake normal + AO maps (or tiling skin-detail normal overlay).

**Stage 3 — Polish + budget enforcement**
7. N8AO half-res + SMAA behind drei `<PerformanceMonitor>`; Bloom (mipmapBlur, threshold 1) for monitor glow only; **no DoF on iPad**. Auto-degrade ladder: post → dpr → shadows.
8. SSS approximation on head only (onBeforeCompile translucency; MeshPhysicalMaterial transmission only if iPad profiling allows).
9. Pipeline: `gltf-transform` **meshopt** (NOT Draco — Draco can't compress morph targets) + KTX2 (UASTC for normal maps, ETC1S diffuse). Budgets: ≤50 draw calls, dpr cap 2, iPad thermal headroom.

**Blueprint repo**: [met4citizen/TalkingHead](https://github.com/met4citizen/TalkingHead) — full-body GLB + ARKit blendshapes + procedural blink/gestures in three.js, no post-processing, MIT-adjacent. Closest architecture to what we need.

## 4. Open-source assets & scaffolds — acquisition list (licenses verified)

| Priority | Asset/Repo | License | Obligation |
|---|---|---|---|
| 1 | **MPFB2** patient bodies (M/F/elderly, posed, decimated) | exports **CC0** | none |
| 2 | **Mixamo** animations (idle/unresponsive/seizure/recovery) | Adobe royalty-free | bake into bundle, never expose raw files |
| 3 | **Infirmary Integrated** scenario/vitals mechanics | **Apache 2.0** | NOTICE in credits if code reused |
| 4 | **cmi5/xAPI** telemetry + MVP-style branching case format | open specs | none |
| 5 | **Z-Anatomy** / **BodyParts3D** anatomy overlays | **CC-BY-SA** ⚠ | attribution + quarantine (below) |
| 6 | Sketchfab **CC0-first** equipment props (monitor/defib/airway) | per-model | paste TASL credit for any CC-BY |
| 7 | *(optional, paid)* HumGen3D photoreal humans | $128 royalty-free | none post-purchase |

**Copyleft quarantine**: CC-BY-SA meshes stay as discrete runtime-loaded `.glb` under `assets/anatomy/` with their own LICENSE — never merged into proprietary art files; if we edit one, we publish the edited mesh (asset only — app code stays proprietary). **Never import OpenLabyrinth GPL code** — clean-room its branching data model only. Add an in-app Attributions screen.
Avoid: Ready Player Me for new work (CC-BY-NC-SA by default; partner registration required) — relevant since `patient-female.glb` is RPM-derived: replace with an MPFB2 female during Stage 2.

## 5. Build plan — parallel workstreams

- **W1 Visual realism** (Stage 1 → 2 → 3 above) — owns Body3DModel rendering, Blender authoring, asset pipeline.
- **W2 Playability mechanics** — weighted ABCDE scoring spine (pattern A), treatments-land-on-body completion, event-synced replay debrief (pattern C), tiered input (pattern B).
- **W3 Case base, diploma → Year 4** — level-banded case sets with year-appropriate objectives/rubrics on the now-complete protocol foundation; every case passes `npm run audit:clinical`.
- **W4 Unwellness shader states** — extend the existing perfusion tint into OMS-style visible states (diaphoresis sheen, jaundice, mottling) driven by live physiology.

Gate for all workstreams: `npm run check` + case audits + FPS budget (60fps laptop / 45fps iPad).

## 6. Landed alongside this research
All 24 protocol-less cases now route to clinically-reviewed executable protocols (16 new protocols, 3 aliases; audit coverage 99/100; whole gate green). Three items flagged for clinician review: chest-trauma O2 placement, head-injury GCS-6 ventilation choice, hypothermia warmed-fluid encoding.
