# ParaMedic Studio — Claude Code Project Instructions

## Project Overview

ParaMedic Studio is a UAE-focused paramedic training simulator built as a 3D web application. Students interact with a 3D patient body model, perform assessments, apply treatments, and receive clinical debriefing. The goal is to make paramedic training feel like a premium game experience — not a checklist web app.

**Owner:** Elias Thomas (elias@twetemo.com) — HCT clinical instructor, paramedic, MSc Critical Care (Edinburgh)
**GitHub:** ThomasE11/3d-case-simulator.git
**Local path:** /Users/eliastlcthomas/Projects/app
**Running dev server:** http://localhost:5173 (Vite)

## Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **3D Engine:** Three.js + @react-three/fiber + @react-three/drei + @react-three/postprocessing
- **UI:** Tailwind CSS + shadcn/ui (Radix primitives)
- **Animation:** framer-motion
- **State:** React hooks (no Zustand — useEducatorPanel, useSimulationTimer, useTreatmentEngine)
- **Backend:** Supabase (auth, student results)
- **i18n:** i18next (English + Arabic)
- **Forms:** react-hook-form + zod
- **PDF:** jsPDF
- **Charts:** Recharts
- **3D Assets:** GLB models (MPFB2/MakeHuman base, Blender headless pipeline)
- **HDRI:** studio_small_08_1k.hdr for lighting

## Project Structure

```
src/
├── App.tsx                      # Root — role routing (landing/student/educator/classroom)
├── main.tsx                     # Entry point
├── components/
│   ├── Body3DModel/             # 3D patient rendering (the core)
│   │   ├── index.tsx            # Canvas, camera, lighting, controls, region clicks
│   │   ├── BodyMesh.tsx         # GLB loading, morph targets, breathing, staging
│   │   ├── ClothingLayer.tsx    # Procedural garment geometry from body mesh
│   │   ├── EyesLayer.tsx        # Eye texture painting (open/closed/pupil response)
│   │   ├── WoundLayer.ts        # Procedural wound decal sprites on skin
│   │   ├── MottlingLayer.ts     # Skin mottling textures
│   │   ├── LifeSigns.tsx        # Chest rise, blink, idle sway, stillness when unresponsive
│   │   ├── AdaptiveQuality.tsx  # FPS-based quality ladder (post-processing → resolution → shadows)
│   │   ├── AnatomyReferenceLayer.tsx
│   │   ├── RegionAssessmentPanel.tsx
│   │   └── bodyRegions.ts       # Region definitions, guided exam sequence
│   ├── Workspace/               # Layout shell (ABCDE nav, anatomy explorer, timeline, monitor)
│   ├── classroom/               # Multiplayer classroom (host, join, chat, broadcast)
│   ├── StudentPanel.tsx         # Main student-facing case flow (briefing → scene → treat → debrief)
│   ├── TreatmentJumpBagPanel.tsx# Equipment bags with search and treatment application
│   ├── VitalSignsMonitor.tsx    # Live vitals display with device-voiced alarms
│   ├── DebriefReplay.tsx        # Post-case timeline scrubber with event markers
│   ├── CaseDisplay.tsx          # Case briefing display
│   ├── SessionSummary.tsx       # Post-case scoring and feedback
│   ├── SmartSearch.tsx          # Case library search
│   └── ui/                      # shadcn/ui primitives
├── data/
│   ├── cases.ts                 # 114 clinical cases (cardiac, trauma, resp, neuro, etc.)
│   ├── enhancedTreatmentEffects.ts # Treatment definitions with vitals effects
│   ├── dynamicTreatmentEngine.ts   # Patient state engine (vitals drift, deterioration)
│   ├── treatmentProtocols.ts    # Protocol compliance checking
│   ├── clinicalSounds.ts        # Breath/heart/bowel sound playback
│   ├── ecgRhythms.ts            # ECG rhythm library
│   ├── uaeMedications.ts        # UAE-specific drug reference
│   └── assessmentFramework.ts   # ABCDE assessment structure
├── lib/
│   ├── patientRealism.ts        # Clinical realism cues
│   ├── patientRealismDirector.ts # Director state (visuals, equipment, behavior, debrief)
│   ├── patientRealismScenarios.ts # 8 sentinel scenario families
│   ├── patientVisualState.ts    # Pure adapter: director state → visual state
│   ├── patientStaging.ts        # Scene-contextual patient position (floor/stretcher)
│   ├── caseManagementRealism.ts # Finding→treatment bridge, reassessment loop
│   ├── abcdeScoring.ts          # Weighted ABCDE scoring
│   ├── smartGrader.ts           # AI grading narrative
│   ├── pdf-export.ts            # Post-case PDF report
│   └── regionClassifier.ts      # Body point → region classification
├── hooks/
│   ├── useEducatorPanel.tsx     # Main state controller
│   ├── useSimulationTimer.ts    # Simulation clock
│   ├── useTreatmentEngine.tsx   # Treatment application + vitals engine
│   ├── usePatientVoice.ts       # Patient voice events
│   └── useGradualVitalChanges.ts # Smooth vitals transitions
├── types/index.ts               # Core types (CaseScenario, PatientState, etc.)
└── i18n/                        # English + Arabic
```

## 3D Pipeline

- **Blender** installed at `/Applications/Blender.app/Contents/MacOS/blender`
- **MPFB2** (MakeHuman For Blender) used for base body models
- **Existing Blender scripts** in `scripts/anatomy-models/`:
  - `generate-mpfb-patient.py` — generate patient GLB
  - `blender-mpfb-female-bake.py` — bake female patient with AO
  - `blender-stage2-eyes-ao.py` — add realistic eyes + ambient occlusion
  - `add-clinical-morphs.py` — add morph targets (breathing, etc.)
- **GLB models** in `public/models/`: patient.glb, patient-female.glb
- **HDRI** in `public/hdri/`: studio_small_08_1k.hdr
- **Scene background images** in `public/scene-assets/` (145MB of case-specific scene photos)

## Quality Gate

```bash
npm run check    # typecheck + lint + test + case audits (ALL must pass)
npm run typecheck
npm run lint
npm run test     # 273 tests
npm run build    # Vite production build
```

**Current status: 273 tests passing, typecheck clean, lint clean, 21 consecutive green deploys.**

## Current Visual State (as assessed 2026-07-21)

The app is functionally sophisticated but visually falls short of premium game quality:

### What works well:
- 3D patient model with breathing, blinking, eye response
- Wound decals on skin at anatomical sites
- Clothing layer (procedural garments from body mesh)
- HDRI studio lighting + ACES tone mapping
- Adaptive quality (FPS-based post-processing ladder)
- 114 cases with full clinical logic
- Treatment bags, vital signs, assessment flow
- Post-case debrief with timeline replay

### What needs to reach AAA game quality:
1. **Patient model fidelity** — Low-poly, flat textures, no subsurface scattering, no skin pores, male patient still uses feminine base mesh
2. **Environment** — Treatment bay is a void (white box, no walls, no equipment, no clutter)
3. **Lighting** — Flat ambient, no dramatic shadows, no volumetric atmosphere
4. **Animation** — No idle animations (shivering, wincing, gasping), no IK hand interaction, no patient movement beyond breathing
5. **Post-processing** — Basic, no depth of field, no motion blur, no color grading
6. **Scene immersion** — No sense of place (no ambulance interior, no villa room, no street scene)
7. **UI game-feel** — Panels feel like web forms, not game HUDs
8. **Audio** — Clinical sounds exist but no ambient environment audio (traffic, wind, room tone)
9. **Transition kinetics** — No cinematic transitions between phases (briefing → scene → treatment)

## The Vision: Compact Medic / Call of Duty Quality

The reference is Compact Medic and Call of Duty — not literally, but in terms of:
- **Visual fidelity:** High-poly models, PBR textures, subsurface scattering skin, realistic lighting
- **Environment immersion:** The patient is IN a place — a villa living room, a mall atrium, a roadside
- **Kinetics:** Camera moves with weight, transitions are cinematic, actions have physical feedback
- **Interaction:** The paramedic carries a bag, lifts patients, opens kits — physical, tactile, not click-a-button
- **Atmosphere:** Dust motes, ambient lighting that matches the scene, sound design that places you there

## Rules for Claude Code

1. **NEVER break the quality gate** — `npm run check` must pass after every change
2. **NEVER modify cases.ts** — 114 cases are the clinical foundation
3. **Test after every significant change** — not just at the end
4. **Commit after each working feature** — conventional commits
5. **Use existing shadcn/ui components** — don't reinvent UI primitives
6. **Preserve existing clinical logic** — the treatment engine, scoring, and debrief are battle-tested
7. **3D changes must work on iPad** — the adaptive quality ladder exists for a reason
8. **Blender pipeline** — use the existing MPFB2 scripts and Blender headless mode for model work
9. **No status reports or markdown files** — code is the deliverable
10. **Arabic support** — all UI text must remain translatable
11. **Build incrementally** — one feature at a time, test it, verify it, commit it
12. **Realism loop** — standing done-condition is `GOAL_CONTRACT.md`, not a green `npm run check`. Phases A–C and D1/D2 already shipped; remaining work is D3 + slice acceptance. Do not delete `GOAL_CONTRACT.md` or `REALISM_OVERHAUL_PLAN.md`.