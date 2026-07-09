# Treatment Bay & Management Plan — Review + Optimization Plan

_Reviewed against the live build (active-case "vitals" phase) on 2026-05-29. Scope per Director's brief: make the management/treatment experience come alive, be readable for novice→Year-4 students, surface sounds, show injuries visually, and keep students structured without overwhelming them. This is a review — nothing below is implemented yet._

---

## 1. What's already there (and is genuinely good)

Before proposing changes, the honest finding: **a lot of what you asked for already exists** — it's just not surfaced where you're looking.

### Sounds — fully built, synthesized live ✅
`src/data/clinicalSounds.ts` (2,280 lines) synthesizes real audio with WebAudio — pink-noise beds through bandpass filters, not sound files:
- **Breath sounds:** clear, wheeze, fine/coarse crackles, stridor, diminished, absent, rhonchi, snoring
- **Heart sounds:** normal, murmur, gallop (S3/S4), muffled, irregular, arrest-silent — auto-derived from the case rhythm via `rhythmToHeartSound()`
- **Bowel sounds:** normal, hyperactive, hypoactive, absent (with the 3-minute-listen teaching rule)
- **Percussion:** resonant, hyper-resonant, dull, tympanic
- **Monitor:** QRS beep synced to pulse rate, pitch varies with SpO₂ (real pulse-ox behaviour)

These are wired into the **3D body auscultation** (`Body3DModel/index.tsx:1817-1863`): click a lung field → it plays left lung 3s then right lung 3s; click the heart → 8s of heart sound; abdomen → bowel sounds.

> **The problem isn't that sounds are missing — it's that they're buried inside the 3D body's auscultate actions, which a novice may never discover.** A student looking at the Management Plan or the Monitor has no signpost that says "go listen to the chest." See §4.

### The 3D anatomy + region exam — solid
`Body3DModel/` renders a GLB mannequin with clickable regions (head, chest, abdomen, limbs, etc.), each with inspect/palpate/percuss/auscultate actions that reveal case-specific findings as text. Camera animates to the region. Patient vocalizes on palpation (the `usePatientVoice` hook we added).

### History taking — now voice-driven ✅ (shipped last session)
The old SAMPLE checklist is replaced with the spoken `VoiceHistoryPanel`.

### The Management Plan structure — clinically sound
`StudentPanel.tsx:3869-4068`. Treatments are grouped under **A / B / C / D / E / Rx** tabs, each showing relevant treatments with onset time, vital-sign effect preview (`BP-10 · HR+15`), and gating (e.g. "Requires IV access first", "Withheld — core temp <30°C"). This is a genuinely good model — it mirrors how a paramedic thinks (treat by ABCDE priority).

---

## 2. The real problems (what's actually holding it back)

### P1 — Injuries are invisible on the anatomy ⚠️ (your specific complaint)
You said: _"they have a rotated leg — that should be seen on the anatomy."_

**Confirmed gap.** The active-case 3D body (`BodyMesh.tsx`) is a **neutral mannequin in T-pose**. It does NOT visually reflect injuries. "Left leg shortened and externally rotated", "flail segment", "open wound", "bruising" — all of these only appear as **text** when you palpate/inspect the limb. The stylized injury figure we built (`ProceduralPatient` in `SceneSurveyPanel`) shows rotation/deformity, but that's a _different, separate figure_ only used in the pre-arrival Scene Survey — it's not the 3D body you treat on.

So the student reads "externally rotated" but sees a mannequin standing in perfect anatomical position. That breaks immersion exactly where it matters most — trauma.

### P2 — Vitals show 0/0 / HR 0 until the monitor is powered ⚠️
In the screenshot the Management Plan header reads `Current 0/0 · HR 0` and `SpO2 0% · RR 0`. The monitor boots "MONITOR OFF" by design (realistic — you attach leads), but the **zeros read as broken**, and the Management Plan's treatment list is gated behind `currentVitals` existing, so a novice who hasn't powered the monitor sees an empty treatment bay with no explanation of _why_.

### P3 — Everything is on one screen, all at once 🧠
The active case stacks, top-to-bottom: Primary Survey → 3D Patient Exam → History (voice) → Pain Score → Special Assessments on the left, and Monitor → Check Pulse → Management Plan on the right. For a **Year-4** that's fine — they know the flow. For a **novice (diploma / Year-1)**, it's a wall of equally-weighted options with no "do this first" signal. There's no enforced or suggested order, and no sense of _phase_ once you're in the case.

### P4 — No bridge between assessment and treatment
A student auscultates, hears a wheeze, reads "bilateral expiratory wheeze" — then has to independently know to go to the Management Plan → **B** → salbutamol. Nothing connects the _finding_ to the _action_. Experienced students make that jump; novices stall. This is the single biggest "structured guidance" gap.

### P5 — Treatment feedback is vital-sign-only
When you apply a treatment, the effect shows up as numbers drifting on the monitor (`BP-10 · HR+15`). There's no _patient-level_ confirmation — the patient doesn't visibly ease, the wheeze doesn't audibly clear, the cyanosis doesn't fade. The "did this work?" loop is abstract.

---

## 3. Recommendations — ranked by impact-per-effort

### R1 — Injury overlay on the anatomy (HIGH impact, MED effort) 🎯
Render injury markers on the 3D body (or the 2D body diagram fallback) driven by the same `inferAnatomy()` logic that powers the Scene Survey figure. Minimum viable:
- A **pulsing red hotspot** at the injured region (leg, chest, head) with a short label ("Deformity — externally rotated", "Flail segment", "Active haemorrhage").
- For limbs with rotation/shortening: tint the limb region + a "⟳ external rotation" pip — re-use the exact detection from `ProceduralPatient`.
- Bleeding → a small animated drip/pool at the site that grows on long scenes.

This directly answers your complaint and reuses code we already wrote. Biggest realism win available.

### R2 — Finding → Treatment bridge (HIGH impact, MED effort) 🎯
When an assessment reveals an actionable finding, surface a **one-tap suggested action** inline:
- Auscultate → "bilateral wheeze" → a subtle chip appears: **"→ Treat in B: Salbutamol"** that deep-links to the right Management tab.
- This is the structure novices need without hand-holding Year-4s (they can ignore the chip). It teaches the assessment→treatment reflex that boards examine.

### R3 — Guided vs Free mode toggle (HIGH impact, MED effort) 🎯
A per-session toggle (default by year level):
- **Guided (novice):** a slim "Next recommended step" ribbon at the top — "Primary survey not complete → assess Airway" → "Wheeze found → consider bronchodilator" → "Reassess vitals". Never blocks, just suggests.
- **Free (Year-3/4):** ribbon hidden; full autonomy, scored on completeness + sequence in the debrief.

Year-appropriate scaffolding from the one app. This is the cleanest answer to "easy for novices AND Year-4s".

### R4 — Auscultation signpost from the Monitor/Management (LOW effort) ✅
A "🔊 Listen to chest / heart / abdomen" affordance that's visible without first discovering the 3D body — e.g. a small speaker row on the Monitor or an "Auscultate" shortcut that jumps to the body region. Surfaces the sound system you already paid for.

### R5 — Fix the "0/0 HR 0" empty state (LOW effort) ✅
When the monitor is off / vitals unread, the Management header should say **"Attach the monitor to read vitals"** and the gated treatment list should show **"Read vitals first to see effects"** instead of silently empty. Small copy change, big "is this broken?" reduction.

### R6 — Patient-level treatment confirmation (MED impact, MED effort)
On a correct, effective treatment: the patient visibly/audibly responds — wheeze clears on next auscultation, the procedural figure's breathing slows, a short Supertonic "That's… easier, thank you." Closes the "did it work?" loop beyond numbers.

### R7 — Layout: phase-segment the active case (MED impact, MED-HIGH effort)
Rather than one long scroll, introduce a light **Assess → Treat → Reassess** segmented control at the top of the active case that emphasizes (not hides) the relevant column. Keeps Year-4 speed while giving novices a spine. Lower priority — only after R1–R3 land.

---

## 4. Suggested sequence

1. **R5** (empty-state copy) — 15 min, removes the "broken" perception immediately
2. **R4** (auscultation signpost) — 30 min, surfaces existing sounds
3. **R1** (injury overlay) — the headline realism win, answers your direct ask
4. **R2** (finding→treatment bridge) — the structured-guidance win
5. **R3** (guided/free mode) — ties novice/Year-4 together
6. **R6 / R7** — polish once the above are in

---

## 5. Open questions for the Director

- **Injury overlay surface:** put it on the 3D GLB body (more work, looks premium) or on a 2D body-diagram companion (faster, clearer labels)? Or both — 2D diagram as the "injury map", 3D for exam?
- **Guided mode default:** auto-enable Guided for Diploma/Year-1, Free for Year-3/4 — or always let the student choose?
- **Scope for this pass:** do R1+R2+R4+R5 together as "bring treatment alive", or start with just the injury overlay (R1) since that's your stated pain point?
