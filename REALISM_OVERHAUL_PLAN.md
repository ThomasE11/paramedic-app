# REALISM OVERHAUL PLAN — ParaMedic Studio
*Architect: FABLE 5 · 2026-07-22 · executable by Opus 4.8 / Kimi K3 / Blender / DeepSeek*

## 0. TL;DR — read this first

Elias wants **a living patient in a place you walk into**, proven on **ONE scene** as a vertical slice, pushing browser 3D to its limit.

**The codebase is much further along than the brief assumes.** Before writing new systems, inventory what already ships:

| Capability | Already exists | File |
|---|---|---|
| Environment rooms (clinic/home/public/roadside) | ✅ variant system live | `src/components/Body3DModel/Environment/` (`index.tsx`, `SceneVariant.tsx`, `textures.ts`) + `src/lib/sceneEnvironment.ts` |
| Post-processing (AO/AA/DoF/vignette) | ✅ full stack + adaptive ladder | `src/components/Body3DModel/AdaptiveQuality.tsx` (`PatientPostEffects`, N8AO, SMAA, DepthOfField, ToneMapping, Vignette) |
| Idle animation (shiver/wince/gasp/seizure/tremor) | ✅ | `IdleAnimations.tsx` + `src/lib/idleCues.ts` |
| Breathing / blink / life signs | ✅ morph-driven | `BodyMesh.tsx`, `LifeSigns.tsx` |
| Patient voice + TTS (ElevenLabs → Supertonic → SpeechSynthesis) | ✅ 3-tier fallback | `src/hooks/useVoiceNarration.ts`, `usePatientVoice.ts` |
| Camera entrance / cinematic | ✅ partial (`CameraEntrance`) | `Environment/index.tsx` |
| Skinned male + female GLB | ✅ 5.4MB / 6.4MB | `public/models/patient-male.glb`, `patient-female.glb` |
| Blender headless pipeline | ✅ | `scripts/anatomy-models/*.py` |

**So this plan is NOT a rebuild.** It is: **(1)** pick one scene, **(2)** raise the four things that are still flat — *skin (no SSS), face (no lip-sync), room (backdrop not geometry), audio (no room tone)* — and **(3)** stitch them into a cinematic entrance→treat loop. Everything else already exists; we upgrade in place.

> ponytail note: the temptation is to write a new engine. Don't. Four gaps close the "AAA" perception; the rest is polish on working systems. Skipped: physics IK, patient lifting, procedural crowds — add only if the vertical slice lands and Elias asks.

---

## 1. Vertical slice selection

**Chosen scene: `asthma-villa-male-uae` → case `resp-001` (severe asthma, male, villa living room).**

Why this one:
- **Male patient** — forces the outstanding "masculinize the male patient" work (TRACKER §Next), so the slice fixes a known defect instead of sidestepping it.
- **Home/villa environment** — `deriveSceneEnvironment` already returns `'home'`; `Environment/SceneVariant.tsx` already has a home variant to upgrade. Indoor room is the *easiest* to make photoreal (four walls, controlled light) vs roadside (sky, distance, vehicles).
- **Conscious + talking** — patient can speak ("I can't... catch... my breath"), so **lip-sync TTS** has something to do. Asthma = visible work of breathing, tripod posture, accessory muscle use → the animation budget pays off.
- **Backdrop asset exists** — `public/scene-assets/asthma-villa-male-uae.png` for reference/parallax.
- **Clinically rich, non-arrest** — patient stays alive and interactive through the whole loop (breathing effort, speech-in-sentences shrinking, nebuliser response), so every realism system is exercised.

Fallback slice if villa interior proves too heavy: `home-copd-male-68-sharjah` (same room tech, older male, different injury profile).

**Definition of the slice:** launch `resp-001` → cinematic entrance into a villa living room → male patient tripod-seated on the floor, visibly labouring, skin with SSS, sweating → he speaks in broken sentences with lip-sync → you assess, apply O2/nebuliser → his breathing eases, sentences lengthen → room tone + AC hum throughout. One scene, end to end, at 60fps desktop / ≥30fps iPad.

---

## 2. Architecture — the nine systems

For each: what exists, what to build, the specific APIs/files, and the assigned builder.

### 2.1 SSS skin  *(Opus 4.8)*
**Gap:** skin uses a standard PBR material — no subsurface, reads as plastic/clay.
**Approach — two options, take the higher rung that holds:**
- **Rung A (default):** upgrade the runtime material to `MeshPhysicalMaterial` with `.thickness`, `.attenuationColor`, `.attenuationDistance`, `.sheen`/`.sheenColor` for peach-fuzz, and a baked **thickness map** (ear/nostril/finger translucency) sampled in Blender. `three@0.183` supports the KHR_materials_volume path natively. Set `transmission: 0` (opaque) but use `thickness` + `attenuationColor` (warm red) so ears/nose glow under the villa key light.
- **Rung B (only if A reads flat):** custom `onBeforeCompile` injection adding a wrapped-diffuse / pre-integrated SSS term (Penner 2011 LUT) into the lighting chunk. This is the "browser to its limit" move — a curvature+thickness LUT sampled in the fragment shader.

**Files:**
- `BodyMesh.tsx` — where the loaded GLB material is currently configured (search the material-tuning block); swap `MeshStandardMaterial` → `MeshPhysicalMaterial`, wire thickness map.
- New Blender: `scripts/anatomy-models/bake-skin-maps.py` — bake **thickness** (via ray-cast from inside), **cavity/AO** (already partially done), and a **detail-normal** (pores) from a tiling micro-normal. Output `patient-male-skin-*.png` (2k, KTX2/Basis compressed → keep GLB small).
- Detail normal: reuse `three` `normalMap` + a second `MeshPhysicalMaterial` won't tile — inject a detail-normal blend in `onBeforeCompile` (`#include <normal_fragment_maps>`).

**Success:** ears/nostrils/fingers show warm translucency under key light; pores visible on zoom; no plastic highlight.

### 2.2 Masculinize + high-fidelity male mesh  *(Blender → Kimi K3 wiring)*
**Gap (TRACKER known):** `patient.glb` male fallback reads feminine; low-poly.
**Build:** Blender MPFB2 pass — jaw width, brow ridge, shoulder breadth, body-hair sheen, larger hands. Subdivide once (OpenSubdiv) for silhouette, then decimate the non-visible back. Re-bake AO/thickness (2.1). Keep < 6MB via Draco/meshopt.
**Files:** extend `scripts/anatomy-models/generate-mpfb-skinned.py` (add male shape-key targets) → new `scripts/anatomy-models/blender-male-masculinize.py`; output overwrites `public/models/patient-male.glb`. Verify with `verify-glb.cjs` + `capture-model.mjs`.
**Success:** side-by-side capture reads unambiguously male; morph targets (breathing, findings) survive the re-bake.

### 2.3 Walking / posture animation  *(Blender bake → Opus 4.8 runtime)*
**Gap:** no skeletal animation; patient is static except morphs. Slice needs **tripod asthma posture** + subtle idle, not literal walking (patient is seated/collapsed — the *paramedic* "walks in" via camera, §2.9).
**Scope decision:** skip biped locomotion for the slice (patient doesn't walk — they can't breathe). Build **posture clips** instead:
- Blender: author 2–3 baked clips on the existing armature — `pose_tripod` (hands on knees, shoulders up), `pose_supine`, `pose_recovery`. Export as GLB animation tracks.
- Runtime: `useAnimations` from `@react-three/drei` + `THREE.AnimationMixer`; crossfade between poses with `action.crossFadeTo`. Layer the existing `IdleAnimations` + breathing morphs *on top* (additive blend — `THREE.AdditiveAnimationBlendMode`) so shiver/wince/gasp still ride the pose.
**Files:** `scripts/anatomy-models/bake-postures.py` (new); `BodyMesh.tsx` (add mixer + crossfade); reuse `IdleAnimations.tsx` unchanged.
**Success:** patient sits in tripod, accessory-muscle shoulder heave synced to RR; eases to relaxed posture as SpO2 recovers.
> ponytail: full IK/locomotion skipped — the patient can't walk. Add a walking rig only when a scene needs an ambulant patient.

### 2.4 Lip-sync TTS  *(Opus 4.8)*
**Gap:** `useVoiceNarration` speaks (ElevenLabs → Supertonic → SpeechSynthesis) but the mouth doesn't move.
**Approach — amplitude-driven visemes (no phoneme ML):**
- Add a jaw/mouth-open **morph target** to the male GLB (Blender, one shape key `viseme_open`).
- Runtime: on speak, route audio through a `THREE.AudioAnalyser` (or Web Audio `AnalyserNode`) → per-frame RMS → drive `viseme_open` influence. Add a light formant split (2-band) for open-vs-round if time allows; RMS alone reads convincingly at conversational distance.
- Hook the analyser into the existing playback in `useVoiceNarration.ts` (it already owns the `<audio>`/AudioBuffer). Expose a `mouthOpenRef` the `BodyMesh` reads in `useFrame`.
**Files:** `useVoiceNarration.ts` (tap the audio node → `mouthOpenRef`), `usePatientVoice.ts` (pass ref through), `BodyMesh.tsx` (apply to morph). Blender: add `viseme_open` in `add-clinical-morphs.py`.
**Success:** patient's jaw moves in time with "I can't... breathe" — broken cadence visible because the TTS clip itself is broken.
> ponytail: RMS→jaw over full phoneme viseme sets. Upgrade to Oculus-viseme mapping only if lip-read accuracy is ever a requirement (it isn't for medical sim).

### 2.5 Environment room  *(Kimi K3 bulk + Opus 4.8 lighting)*
**Gap:** `Environment/` variants exist but home reads as a backdrop, not a room you're inside.
**Build (villa living room):**
- **Geometry:** three walls + floor + ceiling as real meshes (not a skybox) so DoF/AO/shadows work. A sofa, coffee table, rug, floor lamp, AC unit, window with blown-out daylight. Keep polycount low; detail comes from PBR textures + light.
- **PBR set:** reuse/extend `Environment/textures.ts`. Source CC0 (Poly Haven) wall plaster, wood floor, fabric sofa. Bake into KTX2.
- **Light:** window = large area light (warm UAE daylight) + AC-cool fill; `floor lamp` = point light with soft shadow. Drive `Environment` HDRI intensity down; the room's own lights carry it. Volumetric dust motes via a cheap animated `Points` sprite field (not true volumetrics).
- **Parallax option:** for the window view, use `asthma-villa-male-uae.png` as an emissive far-plane behind the glass.
**Files:** `Environment/SceneVariant.tsx` (home variant → full room), `Environment/textures.ts` (add villa PBR set), `Environment/index.tsx` (place props + lights). `sceneEnvironment.ts` already routes villa→home — no change.
**Success:** camera can orbit and you feel enclosed; shadows fall on the floor; the patient sits *in* the room, lit by the window.
> This is the biggest bulk-geometry job → Kimi K3 for prop placement/texture wiring, Opus for the light rig (the thing that sells "place").

### 2.6 Injury realism  *(Kimi K3 — extends existing)*
**Gap:** `WoundLayer.ts` paints decals; fine for asthma (no wound) but the slice should still show *unwellness*.
**Build for slice:** asthma has no wound — instead raise **diaphoresis sheen** (already in `BodyMesh` `skinDiaphoretic`), **peri-oral cyanosis** (tint the mouth region as SpO2 drops — extend `MottlingLayer`/EyesLayer tint), and **flushed/pale gradient**. These are texture-driven, cheap, and already partially wired via `patientVisualState`.
**Files:** `MottlingLayer.ts` (cyanosis gradient by SpO2), `patientVisualState.ts` (already emits severities — verify cyanosis channel), `BodyMesh.tsx` (apply). No new system.
**Success:** as SpO2 drops 94→85 the lips/nailbeds tint dusky; recovers with nebuliser. (Wound realism itself — deeper decals, blood pooling — is a later slice; roadside/trauma case.)

### 2.7 DoF / post-processing  *(Opus 4.8 — tune existing)*
**Gap:** `PatientPostEffects` already has N8AO + SMAA + DepthOfField + Vignette + ACES. It's *present* but tuned for the void bay.
**Build:** re-tune for the room — DoF focus on the patient's face during dialogue (rack focus on entrance), stronger AO in room corners, subtle **color grade** (warm villa LUT via a `LUT`/`ColorAverage` effect from `@react-three/postprocessing`), and gentle **bloom** on the blown-out window (currently deliberately absent — the window justifies re-enabling it, LDR-clamped). Keep everything on the adaptive ladder so iPad sheds it.
**Files:** `AdaptiveQuality.tsx` (`PatientPostEffects` — add `Bloom` gated to window, add `LUT` warm grade), `index.tsx` (feed focus distance = patient head during dialogue).
**Success:** cinematic depth on entrance; face sharp during speech; warm graded villa mood; ladder still drops it cleanly under 30fps.

### 2.8 3D / spatial audio  *(Kimi K3)*
**Gap:** clinical sounds exist (`clinicalSounds.ts`) but no ambient room tone / positional audio.
**Build:**
- **Room tone:** looping villa ambience (AC hum, distant street muffled through walls) via `THREE.Audio` (non-positional bed) — or a plain looping `<audio>` mixed low.
- **Positional:** patient breathing/wheeze as `THREE.PositionalAudio` attached to the patient object → pans/attenuates as the camera orbits. AC unit as a second positional source.
- Reuse the existing audio unlock/gesture handling from `useVoiceNarration`.
**Files:** new `src/lib/ambientAudio.ts` (thin — load loop, attach PositionalAudio to patient group), wire in `Body3DModel/index.tsx`. Source CC0 ambience. `clinicalSounds.ts` breath playback → migrate breath/wheeze to PositionalAudio on the patient.
**Success:** orbiting the camera moves the wheeze in the stereo field; AC hum sits under everything; silence when tab hidden.
> ponytail: `THREE.PositionalAudio` (built into three, HRTF via Web Audio PannerNode) over any 3D-audio lib. No new dependency.

### 2.9 Game HUD + cinematic transitions  *(Opus 4.8)*
**Gap:** panels read as web forms; phase changes are hard cuts.
**Build (slice-scoped):**
- **Entrance:** extend existing `CameraEntrance` — dolly from doorway through the villa to the patient, DoF rack-focusing onto his face, room tone rising. `gsap`-free: drive with a `useFrame` eased lerp (no new dep) or the existing camera-animation util in `index.tsx`.
- **HUD:** restyle the assessment cockpit as a diegetic-ish overlay — corner vitals as a floating glass panel, radial action wheel on region select (reuse `framer-motion` already installed). Keep shadcn primitives; skin them, don't replace.
- **Transitions:** briefing→scene→treat as camera moves + crossfade, not route swaps. `framer-motion` `AnimatePresence` for the 2D layer; camera lerp for the 3D.
**Files:** `Environment/index.tsx` / `index.tsx` (`CameraEntrance` extension), `StudentPanel.tsx` (phase transition orchestration — carefully, it's battle-tested), HUD styling in the Workspace/cockpit components.
**Success:** launching the case *feels* like arriving on scene; no hard cuts; vitals feel like a device readout, not a form.

---

## 3. Multi-model orchestration

| Builder | Owns | Why |
|---|---|---|
| **Opus 4.8** | SSS shader (2.1), lip-sync analyser (2.4), light rig (2.5), post tuning (2.7), cinematic camera/HUD (2.9), animation runtime (2.3) | Complex 3D/shader/GLSL + state-sensitive edits to battle-tested `StudentPanel` |
| **Kimi K3** | Room props + texture wiring (2.5 bulk), injury texture channels (2.6), ambient audio plumbing (2.8), repetitive GLB/asset wiring | High-volume, low-ambiguity, contract-clear work |
| **Blender (headless)** | Male masculinize (2.2), skin thickness/pore bake (2.1), posture clips (2.3), viseme + morph (2.4) | All model authoring — one artist, sequential, feeds the runtime builders |
| **DeepSeek** | Fallback for any of the above when a builder stalls; test-writing; audit scripts | Cheap, strong tools, no context-critical edits |

**Handoff contracts (so builders don't collide):**
- Blender emits *assets only* (`public/models/*.glb`, `public/scene-assets/*`, texture PNG/KTX2) + a one-line manifest of new morph/animation/material names. Runtime builders consume by name — never edit GLBs by hand.
- Opus owns all `onBeforeCompile`/shader/camera code; Kimi never touches shaders.
- `StudentPanel.tsx` edits (phase transitions) are **Opus-only** and land last, gated behind a green `npm run check`.
- Every builder runs `npm run check` before commit. No exceptions (CLAUDE.md rule 1).

---

## 4. Build order + dependencies

```
PHASE A — Model foundation (Blender, sequential, blocks everything visual)
  A1 masculinize male mesh ............ 2.2   [Blender]
  A2 bake skin maps (thickness/pore/AO) 2.1   [Blender]  (needs A1 final topology)
  A3 add viseme_open + posture clips .. 2.4,2.3 [Blender] (needs A1)
  → emits: patient-male.glb (updated) + manifest
  → GATE: verify-glb.cjs + capture-model.mjs green

PHASE B — Runtime patient (parallel after A)
  B1 SSS material + detail normal ..... 2.1   [Opus]   ← needs A2
  B2 posture mixer + additive idle .... 2.3   [Opus]   ← needs A3
  B3 lip-sync analyser → mouthOpenRef . 2.4   [Opus]   ← needs A3 + useVoiceNarration
  B4 injury/cyanosis texture channels . 2.6   [Kimi]   ← independent
  → GATE: patient reads real, talks, sits tripod, sweats. npm run check.

PHASE C — Environment (parallel with B)
  C1 villa room geometry + props ...... 2.5   [Kimi]   ← independent of B
  C2 light rig (window + lamp + AC) ... 2.5   [Opus]   ← needs C1 geometry
  C3 ambient + positional audio ....... 2.8   [Kimi]   ← needs C1 (attach points)
  → GATE: room you can orbit inside, lit, with sound. npm run check.

PHASE D — Cinematic integration (last, Opus-only, needs B+C)
  D1 post-processing re-tune (DoF/grade/bloom) 2.7  ← needs B+C
  D2 camera entrance + rack focus ..... 2.9
  D3 HUD restyle + phase transitions .. 2.9   ← touches StudentPanel LAST
  → GATE: full slice end-to-end, 60fps desktop / ≥30fps iPad. npm run check.
```

**Critical path:** A1 → A2 → B1 (skin is the single most "AAA" lever). Start Blender A-phase immediately; it blocks the most.
**Parallelism:** once A lands, B and C run fully in parallel (different files). D serialises them.

---

## 5. Risks + fallbacks

| Risk | Likelihood | Fallback |
|---|---|---|
| SSS shader too costly on iPad | Med | Rung A (physical material thickness) is cheap; keep Rung B (LUT shader) behind the adaptive ladder — sheds to plain PBR under 30fps. Already have the ladder. |
| Room geometry tanks FPS | Med | Bake room lighting to lightmaps (Blender); use `ContactShadows` not real shadow maps on low tier; cull backfaces; the void bay stays as the low-tier fallback environment. |
| Lip-sync RMS reads robotic | Low | RMS→jaw is proven convincing at distance; if not, add 2-band formant split. Worst case: mouth stays shut, voice still plays (current behaviour — no regression). |
| Male re-bake breaks morph targets | Med | `verify-glb.cjs` + roundtrip test guard it; keep `patient.glb.orig`/`.bak` — revert is `git checkout`. Never delete backups. |
| `StudentPanel` transition edits break clinical flow | **High-impact** | Opus-only, lands last, behind full `npm run check` (364 tests). Camera/HUD is additive — clinical state machine untouched. |
| Scope creep into all 114 cases | High | **Slice is ONE case.** Environment/skin generalise for free (variant + material), but only `resp-001` is the acceptance target. Others follow later. |
| Bloom/grade over-cooks the look | Low | LDR-clamped, window-gated, on the ladder. A/B capture via `capture-model.mjs`; Elias signs off the still. |

**Hard guardrails (CLAUDE.md):** never modify `cases.ts`; `npm run check` green after every change; commit per working feature; iPad must survive (adaptive ladder is the contract); Arabic UI stays translatable (HUD strings via i18next).

---

## 6. Success criteria

**The slice is done when, launching `resp-001` on desktop and iPad:**

1. **Skin** — zooming the face shows pores + warm translucency in ears/nostrils; no plastic sheen. *(measure: side-by-side capture vs current, Elias sign-off)*
2. **Male reads male** — capture is unambiguous; morphs intact. *(verify-glb.cjs green)*
3. **Posture** — patient sits tripod, shoulders heave at the live RR, eases as SpO2 recovers.
4. **Speech + lips** — patient says a broken sentence; jaw moves in time; sentence length grows post-nebuliser.
5. **Room** — camera orbits *inside* a villa living room; window daylight + lamp cast shadows on the floor; dust motes drift.
6. **Cyanosis** — lips/nailbeds tint dusky at SpO2 85, clear at 94.
7. **Post** — cinematic DoF on the face during dialogue; warm villa grade; window bloom; all shed cleanly under 30fps.
8. **Audio** — AC hum + muffled street room tone; wheeze pans in stereo as the camera orbits.
9. **Entrance** — launching the case dollies you through the room onto the patient, rack-focusing his face; phases crossfade, no hard cuts.
10. **Gate** — `npm run check` green (≥364 tests), typecheck + lint clean, 60fps desktop / ≥30fps iPad measured via `measure-fps.mjs`.

**Elias's one-line acceptance:** *"That's a person in a room I walked into, and he's fighting to breathe."*

---

## 7. What this plan deliberately does NOT do (yet)

- Patient lifting / physical IK hand interaction — no scene in the slice needs it.
- Locomotion rig (walking patient) — slice patient is seated.
- All 114 environments — only villa/home is built; variants generalise but aren't tuned.
- Deep wound/blood/burn realism — that's the *next* slice (a trauma/roadside case).
- Full phoneme visemes, procedural crowds, weather — over-budget for a vertical slice.

Ship the villa. Prove the pattern. Then Elias picks slice two.
