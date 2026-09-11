# Med-ed + curriculum honesty audit

ParaMedic Studio 3D (`~/Projects/app`). Generated 2026-09-11.
Read-only against live case data (`src/data/*.ts`), `StudentPanel` mission board, `OnboardingTour`, `pdf-export`, `sceneEnvironment`, `caseFilters`, `yearSpecificRubrics`, `simulationObjectives`, `injuryMap` / `WoundLayer`.
Not Student Workbook.

Standing constraints used here:
- Year chips are diploma + 1st–4th only. There is no 5th year.
- Dedicated chunks: firstYearCases = 23, secondYearCases = 9. Years 3/4 live mainly in core/enhanced via `yearLevels`.
- Burns = 4 across y1–y4.
- Multi-patient plan must assume building real multi-body, not current data.
- Elias north star (11 Sep): treatment bay should become game-like (look around, kit on body). Near-term P0 remains pose / scene / wound honesty. Full walk-in room and physical bag models are later.

Library snapshot: **114 cases**. Trauma category **15**. Burns **4**. Multiple-patients **1**.

---

## 0. Verdict in one page

The clinical writing on the 15 trauma cases is strong (UAE locations, MARCH language, TXA, permissive hypotension, TCCC chest-seal, NEXUS/CCR). The **learning product is not yet honest** about what the student can see, touch, or be scored on.

Three integrity failures dominate:

1. **The 3D body does not carry the case.** Every trauma case has `woundCount = 0` authored. Visible injuries are keyword-inferred (`inferInjuries`). Four cases have no scene photo. Five trauma photos are reused on the wrong call. Poses that matter for trauma (driver seat, sitting-leaning, grass, water) are already on the pose-honesty P0/P1 list.
2. **Cohort gating is internally consistent and pedagogically leaky.** Progressive diploma = 69 cases because any `2nd-year` tag is in scope. That dumps **12 advanced** cases (including `trauma-003` sucking chest wound) onto diploma students. Year 2 exact trauma is only **two** cases. AEM 112 (bleed / splint / spinal / MCI) cannot be taught from the diploma-tagged set.
3. **`multi-001` claims 8 patients and implements 2.** START triage is written as management text against an aggregate ABCDE of a well adult (GCS 15, HR 95). Scoring that case as MCI competence is invalid.

What already teaches well and should be kept: gated scene-survey before the clock, ABCDE tracker with `<C>ABC` exception, year-aware checklist, 5-step transport wizard captured into the PDF, MARCH bag-open for shocked haemorrhage.

Default mission-board year is **3rd-year**. In an AEM 111/112 lab that is a silent senior-case leak unless the instructor remembers to switch.

---

## 1. Trauma track — 15 `category == trauma` confirmed

All 15:

| ID | Title | Years | Complexity | Priority | Subcategory |
|---|---|---|---|---|---|
| trauma-001 | Multi-Trauma from RTC - Motorcycle vs Car | 3rd, 4th | expert | critical | multi-trauma |
| trauma-002 | Head Injury with Skull Fracture | 3rd, 4th | advanced | critical | head-injury |
| trauma-003 | Penetrating Chest Wound | 2nd, 3rd, 4th | advanced | critical | chest-trauma |
| trauma-004 | Penetrating Chest Trauma - Cardiac Tamponade | 3rd, 4th | expert | critical | tamponade |
| trauma-005 | Blunt Chest Trauma - Tension PTX with Flail Chest | 3rd, 4th | expert | critical | chest-trauma |
| trauma-006 | Massive Hemothorax - Penetrating Trauma | 3rd, 4th | expert | critical | chest-trauma |
| trauma-007 | Blunt Abdominal Trauma - Splenic Laceration | 3rd, 4th | expert | critical | abdominal-trauma |
| trauma-008 | Pelvic Fracture with Hemorrhagic Shock | 3rd, 4th | expert | critical | pelvic-fracture |
| trauma-009 | Severe Head Injury - Epidural Hematoma | 3rd, 4th | expert | critical | head-injury |
| trauma-010 | Cervical Spinal Cord Injury - Diving Accident | 3rd, 4th | expert | critical | spinal-injury |
| resp-006 | Pneumothorax After Chest Trauma | 3rd, 4th | advanced | critical | chest-trauma |
| trauma-011 | Amputation Injury Industrial Accident | 3rd, 4th | advanced | critical | extremity-trauma |
| y1-010 | Adolescent - Wrist Fracture from Bicycle Fall | 1st, diploma | basic | moderate | long-bone-fracture |
| y1-011 | Adult - Minor RTC with Neck Pain | 1st, diploma | basic | moderate | whiplash |
| y1-020 | Teenager - Deformed Lower Leg After Football Tackle | diploma, 1st, 2nd | basic | moderate | long-bone-fracture |

`resp-006` is trauma by category (id leftover). `multi-001` is **not** in this 15 — it is `multiple-patients`.

### 1.1 Cohort fit vs AEM 112 / degree trauma

AEM 112 (trauma): MOI/scene W1–3, trauma assess W4–8, case study W9, bleed/splint/spinal/MCI W10–13, OSCE W14.

| Cohort | Trauma they can actually launch | Honest learning objective |
|---|---|---|
| Diploma exact (30) | y1-010, y1-011, y1-020 | Isolated limb, selective C-spine, scene safety. **No** catastrophic haemorrhage, pelvic binder, open chest, MCI. |
| Diploma progressive (69) | those three **plus trauma-003** | The extra case is an advanced sucking chest wound. Wrong difficulty, wrong week, wrong honesty. |
| 1st-year exact/progressive (32) | y1-010, y1-011, y1-020 | Same three. Appropriate for year-1 assessment + splint. |
| 2nd-year exact (58) | trauma-003, y1-020 | One advanced penetrating chest and one closed tibia. **Year-2 trauma track is a hole.** |
| 2nd-year progressive (69) | + y1-010, y1-011 | Still only four trauma cases. MARCH not spaced. |
| 3rd/4th exact | 12 senior trauma cases | Polytrauma, TBI, chest, pelvis, SCI, amputation. Written at PHTLS/TCCC level. Visuals do not match. |

Year-3/4 trauma writing is the curriculum backbone of AEM 112 weeks 10–13 — but those cases are hidden from diploma. Diploma students therefore cannot practise the module they are assessed on, unless they sit in 3rd-year (the UI default) or pick up the leaked `trauma-003`.

### 1.2 Case-by-case honesty

Legend: **Obj** = intended objective. **Visual** = 3D/scene vs authored text. **Adequacy** = can this cohort learn the claimed skill on the current build.

**trauma-001 — Motorcycle vs car, Sheikh Zayed Road.** 3rd/4th, expert. GCS 5, HR 125, BP 80/50, RR 8, SpO2 85, airway not patent. Immediate actions correctly put CAT tourniquet / MARCH before airway. Inferred injuries: R-leg deformity, R-leg bleed, flail chest (3). Authored wounds: 0. Scene photo exists (`road-traffic-male-dubai.png`) but is **shared with y1-011 minor rear-end**. Position “supine, head turned” is renderable; helmet-off-by-bystanders is not visible. **Obj fit:** excellent for senior polytrauma + `<C>ABC`. **Visual:** fail (no open femur, shared MVC plate). **Adequacy:** written yes, 3D no.

**trauma-002 — Construction fall, skull fracture.** 3rd/4th, advanced. GCS 5, HR 48, BP 190/110 (Cushing), blown pupil language. Inferred: base-of-skull signs only. Scene: Dubai Hills construction (good). `environmentVariant` inferred **roadside** — wrong for a worksite (heuristic on “road”/location words). Immediate still lists rigid collar + blocks as default (conflicts with selective C-spine elsewhere). Mannitol / hypertonic saline is 4th-year scope; tagged 3rd as well. **Obj:** TBI / herniation. **Visual:** head wound under-drawn; worksite not a worksite in 3D. **Adequacy:** cognitive yes, psychomotor no.

**trauma-003 — Deira stabbing, sucking chest.** 2nd/3rd/4th, **advanced**. GCS 15, sitting leaning forward (pose-honesty P1). Inferred: open chest wound + active bleed. Dedicated scene plate (good). Immediate: vented chest seal (TCCC 2022), TXA, permissive hypotension. **This is the diploma progressive leak.** A 2nd-year tag is defensible for “chest seal + open PTX” if scoped; it is not defensible as diploma + advanced + critical. **Obj:** chest-seal / open PTX. **Visual:** pose + wound inference only. **Adequacy:** 3rd/4th yes if wound paints; diploma no.

**trauma-004 — Park stabbing, tamponade.** 3rd/4th, expert. GCS 8, Beck triad in key observations. Scene path is **`trauma-005-trapped-driver-flail-chest.png`** — a trapped MVC driver, not a park at night. Inferred injury: JVD only. **The stab wound is not in the injury map.** Immediate still says “aggressive fluid” and pericardiocentesis / clamshell — mixed UAE ACP vs in-hospital. **Obj:** recognise tamponade, load-and-go. **Visual:** fail (wrong photo, no wound). **Adequacy:** invalid as a visual diagnosis case.

**trauma-005 — Trapped driver, tension + flail.** 3rd/4th, expert. Extrication true. Inferred: R-leg deformity, tracheal deviation, JVD, flail, chest bruising (5) — richest injury set in the library. Scene plate matches this case (and is wrongly reused by trauma-004). Position sitting-leaning (P1). Needle decompression authored at 2nd ICS MCL; `resp-006` authors 4th–5th ICS AAL as preferred (TCCC 2022). Students will be scored against whichever case they drew. **Obj:** tension PTX + flail + extrication. **Visual:** best of the senior set if flail morph exists; still no authored wound sprites. **Adequacy:** closest to teachable senior chest trauma.

**trauma-006 — Nightclub GSW, massive haemothorax.** 3rd/4th, expert. Call reason “multiple GSW victims” but `hasMci` is false — a second quiet multi-patient overclaim. Scene: `nightclub-stabbing-male-dubai.png` **shared with trauma-008 pelvic pedestrian**. Hazards include “ACTIVE SHOOTER SCENE”. Inferred: open chest + bleed. Immediate: chest tube 36–40F (typically in-hospital / physician). **Obj:** massive haemothorax + TXA + permissive hypotension. **Visual:** fail (shared plate, GSW vs stab ambiguity). **Adequacy:** written yes; scene safety objective contaminated by shooter language the 3D bay cannot stage.

**trauma-007 — Al Khail MVC, splenic laceration.** 3rd/4th, expert. GCS 15, LUQ, seatbelt sign, FAST. Inferred injury: **chest bruising only** — abdomen not mapped. `environmentVariant` null (falls through to clinic bay). Sitting-leaning (P1). **Obj:** blunt abdominal + concealed haemorrhage. **Visual:** fail (no LUQ, clinic bay for a roadside MVC). **Adequacy:** history/FAST checklist only.

**trauma-008 — Mamzar Beach Road, pelvic fracture.** 3rd/4th, expert. BP 75/50, binder + TXA + no Foley if blood at meatus. Impression: **female**, shortened externally rotated left leg. Scene: **male nightclub stabbing** (shared with trauma-006). Inferred: left-leg external rotation + unstable pelvis (2) — good mapping, wrong place. **Obj:** pelvic binder / haemorrhage. **Visual:** fail. **Adequacy:** psychomotor binder can still be scored if the treatment exists; scene is a lie.

**trauma-009 — Construction fall, EDH + herniation.** 3rd/4th, expert. **No scene image.** Overlaps trauma-002 (same worksite family, both GCS ~5–6 unresponsive). Lucid-interval teaching is in text only — the student never sees the lucid phase. Mannitol marked “4th-year scope only” inside a case also tagged 3rd. **Obj:** EDH / time-critical neurosurgery. **Visual:** fail. **Adequacy:** cognitive duplicate of trauma-002.

**trauma-010 — Jumeirah Beach diving, complete C5 SCI.** 3rd/4th, expert. **No scene image. Zero inferred injuries.** Position “supine in shallow water” (environment should be `water`; currently null/clinic). Priapism, diaphragmatic breathing, neurogenic shock are text-only. **Obj:** water rescue + neurogenic vs hypovolemic shock + spinal package. **Visual:** total fail. **Adequacy:** cannot examine what is not on the body.

**resp-006 — Ladder fall, tension PTX.** 3rd/4th, advanced. **No scene image.** Id says respiratory, category trauma. Overlaps trauma-005 on the same life-threat with **conflicting needle-decompression sites**. Sitting, leaning to right. **Obj:** tension PTX without flail/extrication — actually a useful *simpler* chest case if it had a scene. **Adequacy:** written duplicate; keep one, retire or retarget the other.

**trauma-011 — Industrial amputation, right hand.** 3rd/4th, advanced. MARCH tourniquet + part preservation authored well. Inferred: R-arm bleed + amputation (2). Scene `industrial-workshop-male-uae.png` **shared with y2-004 flash burn**. `environmentVariant` inferred **public**, not industrial. **Obj:** CAT + stump + TXA-adjacent haemorrhage. **Visual:** partial (amputation inferred; wrong workshop plate shared with burns). **Adequacy:** best haemorrhage-control case in the library if the stump paints.

**y1-010 — Bicycle FOOSH, Colles.** 1st/diploma, basic. Isolated, NV intact. **No scene image.** Inferred: left-arm deformity. Position sitting on grass (pose P2). Checklist 16 items — heavy for a 15-minute basic case. **Obj:** scene, consent, NV check, splint. **Adequacy:** the right diploma case on paper; park scene and deformity must exist or it is a talking-head OSCE.

**y1-011 — Minor rear-end, neck pain.** 1st/diploma, basic. Canadian C-spine / NEXUS. Position **seated in driver seat with seatbelt** (pose-honesty **P0**). Scene photo is the **motorcycle crash plate from trauma-001**. **Obj:** selective immobilisation, not pan-spinal. **Visual:** fail (wrong crash, driver-seat pose missing). **Adequacy:** this is the AEM 112 W1–8 case; it currently teaches the opposite visual lesson (high-energy wreck).

**y1-020 — Football tibia.** diploma/1st/2nd, basic. Isolated closed tibial shaft. Scene: **`gym-cardiac-arrest-male-dubai.png`** (indoor gym arrest, not a pitch). Inferred: R-leg deformity. Position supine guarding (P2). **Obj:** expose, NV before/after, splint, analgesia. **Adequacy:** right skill; wrong place.

### 1.3 Trauma visual scoreboard

| Honesty failure | Cases |
|---|---|
| Authored `woundCount = 0` | **all 15** |
| No scene photo | trauma-009, trauma-010, resp-006, y1-010 |
| Photo reused on the wrong call | trauma-001 ↔ y1-011; trauma-004 ↔ trauma-005; trauma-006 ↔ trauma-008; trauma-011 ↔ y2-004; y1-020 ↔ cardiac-013 |
| Injury map empty or missing the actual wound | trauma-004 (no stab), trauma-007 (no LUQ), trauma-010 (zero), trauma-009 (BOS only) |
| Environment heuristic wrong / null | trauma-002 roadside, trauma-007 clinic, trauma-010 not water, trauma-011 public |
| Pose on the existing honesty list | y1-011 P0 driver seat; trauma-003/005/007 sitting-leaning P1; y1-010 grass / y1-020 guarding P2 |

**None of the 15 trauma cases currently meet “adequate 3D realism for the tagged cohort.”** The senior writing is exam-ready; the body and bay are not.

### 1.4 Burns (adjacent, 4 cases)

Same wound honesty problem (`woundCount = 0` on all four).

| ID | Years | Complexity | Scene |
|---|---|---|---|
| y1-004 Kitchen scald ~5% TBSA | 1st, diploma | basic | none |
| y2-004 Workshop flash ~15% TBSA | 2nd, 3rd, 4th | intermediate | industrial-workshop (shared with amputation) |
| burn-001 Industrial fire + inhalation | 3rd, 4th | advanced | dedicated Jebel Ali plate |
| burn-002 Electrical burn + arrest | 4th | expert | construction-anaphylaxis plate (wrong family) |

Diploma has a scald and, via progressive, the Y2 flash burn. TBSA / cooling / inhalation cannot be examined on an unburned mesh.

---

## 2. Cohort gating map

### 2.1 How gating actually works

`isCaseAvailableForCohort` (`src/data/caseFilters.ts`):

- **exact:** case must list that year.
- **progressive, diploma:** any case tagged `diploma` **or** `1st-year` **or** `2nd-year`. Year 3/4 stay hidden unless also tagged diploma.
- **progressive, degree year N:** any case whose degree rank ≤ N. Diploma tags do not help a 1st-year (diploma is not in `DEGREE_YEAR_RANK`).

Mission board **standard launch** calls `isCaseAvailableForCohort(c.yearLevels, selectedYear)` with **no mode** → defaults to **progressive**. Random-category and condition search pass `'progressive'` explicitly. There is **no exact/progressive toggle** in the UI. The chip label (“diploma + Year 1/2 fundamentals”, “current cohort only”, “Nth + prerequisite review”) is the only disclosure.

Default `selectedYear` is **`'3rd-year'`**.

No 5th-year value exists in `yearLevels`. `unknownYear` / `invalidYear` on the 114-case extract: empty.

### 2.2 Counts (114 cases)

| Cohort | Exact | Progressive | Notes |
|---|---|---|---|
| diploma | 30 | **69** | +39 from 1st/2nd tags, including 12 advanced |
| 1st-year | 32 | 32 | exact == progressive (no junior pool below) |
| 2nd-year | 58 | 69 | +11 from 1st-year-only tags |
| 3rd-year | 79 | 102 | |
| 4th-year | 86 | 114 | whole library |

Tag combos: 33 cases `3rd+4th`; 32 cases `2nd+3rd+4th`; 12 cases `4th` only; 11 `1st+diploma`; 10 `1st+2nd+diploma`; 9 all five years; 5 `2nd+3rd`; 2 `1st+2nd`.

Complexity by tag (a case counted in every year it lists):

| Year tag | basic | intermediate | advanced | expert |
|---|---|---|---|---|
| diploma | 26 | 4 | 0 | 0 |
| 1st-year | 26 | 6 | 0 | 0 |
| 2nd-year | 15 | 31 | **12** | 0 |
| 3rd-year | 5 | 29 | 34 | 11 |
| 4th-year | 5 | 24 | 35 | 22 |

No case tagged 1st/diploma is coded advanced/expert. The leak is **progressive inclusion of 2nd-year advanced**, not a bad complexity flag on diploma rows.

### 2.3 Diploma progressive leak (the 12 advanced)

These are tagged `2nd-year` (not diploma/1st) and therefore appear on a diploma mission board:

- trauma-003 Penetrating chest (advanced, critical)
- cardiac-004 Hypertensive emergency
- resp-004 Pulmonary embolism
- neuro-001 Acute ischaemic stroke FAST+
- neuro-003 Meningitis
- cardiac-011 ADHF “crashing asthma”
- cardiac-015 Symptomatic bradycardia
- cardiac-016 Complete heart block
- resp-005 Severe COPD
- resp-009 Foreign body aspiration
- env-002 Heat stroke altered consciousness
- fall-003 Long lie fractured hip, shocked

Plus 25 intermediate 2nd-year cases (AF-RVR, SVT, paediatric seizure, opioid OD, ectopic, psychosis, y2-* assessment set, etc.). Some of those *belong* in a diploma medical module (y2-001 asthma assessment, y1-015 anaphylaxis already diploma-tagged). The 12 advanced do not.

**Fix (curriculum, not code-fight):** either (a) drop `2nd-year` from those 12 and keep them 3rd/4th, or (b) change diploma progressive to `diploma | 1st-year` only and add an explicit “Year 2 review” toggle, or (c) add a real diploma-scoped chest-seal / haemorrhage case so `trauma-003` can lose its 2nd-year tag. (a)+(c) is the honest pair.

### 2.4 Mis-tags and holes

**Too hard for the year-1 label (complexity still `basic`):**

| ID | Why it is a problem |
|---|---|
| y1-006 Imminent delivery | Psychomotor load of a birth. AEM 111 early weeks are assessment, not obstetrics. Keep in library; retag 2nd+ or mark “stretch / observed”. |
| y1-014 Witnessed cardiac arrest | Priority critical, complexity basic. Valid **if** the rubric is BLS-only (scene, CPR, AED). Invalid if ACLS drugs/airway are expected. Rubric must say which. |
| y1-005 Toddler febrile seizure | Paediatrics + post-ictal. Fine as a communication/ABC case; not “basic first-aid”. |
| y1-007 Croup | Airway noise, work of breathing — year-1 observable, year-2 management. |
| y1-009 Toddler ingestion | Toxicology history is year-2. |
| y1-017 Witnessed seizure | Already also 2nd-year — OK. |

**Critical priority on 1st/diploma:** y1-014 arrest, y1-015 anaphylaxis (also 2nd — this one is correctly a diploma must-have), y1-023 opioid OD (`1st+2nd`, **not** diploma-tagged — diploma exact misses it; diploma progressive gets it via 2nd-year). Opioid OD with pinpoint pupils is AEM 111 medical-emergency material and should be diploma-tagged explicitly rather than leaked.

**Wrongly hidden from diploma (should be in the practical core):**
- Isolated catastrophic limb bleed / tourniquet (only trauma-011, 3rd/4th).
- Pelvic binder (trauma-008, 3rd/4th).
- Open chest seal as a *scoped* skill (only via leaked trauma-003).
- MCI / START (multi-001, 4th only — and it does not work).
- y1-023 opioid if diploma medical week needs naloxone.

**Year-2 trauma hole:** exact trauma = `trauma-003`, `y1-020`. Progressive adds `y1-010`, `y1-011`. Four cases, one of them advanced penetrating. Cannot space MARCH across a year.

**Category holes (exact):**
- diploma / 1st: no cardiac-ecg, no multiple-patients, no post-discharge
- 2nd / 3rd: no cardiac-ecg, no multiple-patients
- 4th: none

Cardiac-ecg-only-in-4th is acceptable (Wellens / De Winter). Multiple-patients-only-in-4th is acceptable **once it is a real MCI**. Post-discharge missing from diploma is fine.

**No diploma-only and no year-1-only cases.** Every diploma row is shared with 1st-year. That is good for a dual pathway (HCT diploma + degree year 1) provided the leak above is closed.

### 2.5 Recommended cohort policy

1. Mission board default year = **diploma** in classroom builds, or remember last-used. Never ship 3rd-year as the blank-slate default.
2. Expose **exact | progressive** as a control. Exact for OSCEs and weekly labs. Progressive for mixed practice / revision.
3. Diploma progressive should mean `diploma ∪ 1st-year`, not `∪ 2nd-year`. Year-2 review is a separate chip.
4. Do not invent a 5th year.
5. Tag new trauma skills to the week they are taught, not to “whoever might benefit”.

---

## 3. Multi-patient / MCI

### 3.1 What the data actually contains

`multi-001` — “Mass Casualty Incident - Bus vs Car Collision **(8 Patients)**”.
- category `multiple-patients`, 4th-year only, expert, 60 min
- `hasMci: true`
- `totalPatients: 8` in copy / triage object
- **`patientsLength: 2`** — `PT-001-RED` Bus Driver 34, `PT-002-RED` Car Driver 28
- claimed START mix: 2 red, 3 yellow, 2 green, 1 black
- patientAge 0, weight 0
- ABCDE is **aggregate and well**: airway patent, RR 20, SpO2 97, HR 95, BP 120/75, GCS 15, AVPU A
- authored wounds 0
- scene plate `mci-highway-uae.png` exists
- managementImmediate correctly describes START, ICS roles, “do NOT perform full ABCDE during triage”
- the live student flow still is: one body, one ABCDE, one jump bag, one transport wizard

This is a **tabletop MCI script attached to a single-patient bay**. Scoring START, ICS, or “8 patients in 60 seconds each” against it is assessment fraud.

`trauma-006` (“Multiple GSW victims”) is a second, quieter overclaim (`hasMci: false`).

### 3.2 Educational value of *true* multi-casualty

For UAE diploma (AEM 112 W10–13 MCI) and year-4 ICS, a real multi-body case is high value **if and only if** the student can:

1. Do a 360° scene size-up (fuel, wires, traffic) without opening a treatment bag.
2. Apply START (or JumpSTART if a child is present) to **independent** patients: respirations → perfusion → mentation, 60-second cap, colour tag.
3. Perform **only** the START life-saving interventions (open airway, needle? no — START is airway reposition + haemorrhage control + maybe chest seal; full treatment is after tagging).
4. Live with the constraint **more RED than ambulances**.
5. Hand over a triage count, not an ATMIST on one body.

That cannot be simulated by cloning the current patient mesh eight times with the same vitals. It needs eight `PatientState`s, eight injury maps, a tag UI, and a rule that ABCDE on patient 3 while patients 1–2 are untagged is a scoring fail.

### 3.3 Recommended START pedagogy (when real multi-body exists)

Build as a **separate activity type**, not a `category: trauma` case:

| Phase | Student action | Pass condition |
|---|---|---|
| 0 Scene | Look around; name 3 hazards; request fire/police/HEMS; don PPE | Clock not started on treatment |
| 1 Declare | “MCI, 8 casualties, request ICS” | Dispatch resource request logged |
| 2 START walk | Tap each body once; assign R/Y/G/Black | All 8 tagged; no full secondary on anyone yet |
| 3 LSIs only | Tourniquet / airway / seal on RED only | Treatments on GREEN = fail |
| 4 Transport officer | Assign destinations / order | RED before YELLOW; BLACK not loaded as salvage without medical direction |
| 5 Debrief | Compare tags to gold; time-to-last-tag | PDF shows tag table, not ABCDE % |

Gold mix should stay 2/3/2/1 **and** each colour must exist as a body. Until then: **retitle** to “MCI command tabletop — 2 live patients, 6 paper casualties” or pull `multi-001` from the launch board.

Do not put MCI on diploma until the 8-body activity exists. AEM 112 can use a paper START drill in class; the 3D app should not pretend it is that drill.

---

## 4. Learning environment optimisation

### 4.1 Mission board IA

What works:
- Three routes (standard / category drill / condition search) are the right grain for a lab.
- Cohort chips match the real year enum (diploma + 1st–4th).
- Launch preview framed as “your next call” / clinical handover, not a generic thumbnail.
- Timebox + skill/equipment focus exist as optional constraints.
- Fallback when skill filters match nothing (`missionFilterFallback`) avoids empty states.

What lies or fights the instructor:

| Issue | Why it matters |
|---|---|
| Default year = 3rd | AEM 111/112 lab opens on senior polytrauma unless someone clicks Diploma. |
| Progressive is invisible | Label is small; no exact mode for OSCEs. Diploma students get 69 cases including PE and sucking chest. |
| Condition browse copy | UI still says “Showing 30 of N indexed conditions” while empty-query browse is uncapped (`StudentPanel` ~5062 vs ~2573). |
| Category drill counts | Uses default progressive. Diploma “Trauma” tile will count 4, one of which is trauma-003. |
| No AEM week / module filter | Cannot launch “W10 haemorrhage” as a set. |
| Skill focus vs MARCH | Equipment tags include Circulation bag / Splints for trauma, but there is no “MARCH primary” skill chip. |
| Last-launched exclusion | Good anti-repeat; does not prevent the same wrong scene photo across IDs. |

**Recommendations:** default year last-used; exact/progressive toggle; fix the “30 of N” string; add a Trauma skills row (haemorrhage, chest, spinal, MCI) that filters on subcategory not keyword soup; diploma Trauma tile should not include advanced 2nd-year until retagged.

### 4.2 Onboarding tour accuracy

Seven steps, English hardcoded except Guided Exam i18n. Persists to `localStorage`.

| Step | Claim | Honesty |
|---|---|---|
| Welcome | assess, treat, transport | OK |
| ABCDE | “Start every case with ABCDE… Scene safety, Airway…” | **Partial.** Scene safety is a **separate gated phase** (`scene-survey`) before the clock. Trauma writing teaches MARCH / `<C>ABC`, and `abcdeScoring` already waives sequence penalty for catastrophic haemorrhage. The tour never says that. |
| Cardiac monitor | tap vitals to connect sensors | Feature-true; not the first thing a trauma student should do. |
| Physical exam | 3D tap + SAMPLE | OK |
| Guided exam | head-to-toe lock | OK |
| Treatments | meds need IV; vitals change | OK |
| Transport & debrief | transport → report | **Partial.** Skips the 5-step wizard (priority / position / pre-alert / destination / working dx). Never names ATMIST. Never names PDF. |

Missing entirely: cohort picker, scene-survey, MARCH, wounds-on-body, timebox, Arabic (tour body is not on i18n except guided exam).

**Fix:** insert a Scene step before ABCDE; branch the primary-survey sentence on category (`trauma` → MARCH); add a one-line “pick Diploma / Year before you launch”. Do not claim kit-on-body interaction until that north-star work ships.

### 4.3 Progressive vs exact — recommendation

| Use | Mode |
|---|---|
| Weekly lab mapped to AEM 111/112 week | **exact** |
| OSCE dry-run | **exact** + timebox |
| End-of-term mixed practice | **progressive** (after leak is closed) |
| Year-4 internship revision | progressive, whole library |
| Diploma | progressive = diploma ∪ 1st only |

Keep both modes. Make exact the classroom default.

### 4.4 Spacing MARCH / ABCDE

Current spacing is accidental:

| Skill | First honest case today | First case that *looks* like the skill |
|---|---|---|
| Scene + PPE | scene-survey phase (all cases) | y1-011 if driver-seat + correct roadside ever render |
| ABCDE medical | y1-001 fall, y2-001 asthma | already OK |
| Selective C-spine | y1-011 | pose P0 + wrong motorcycle photo |
| Isolated splint | y1-010, y1-020 | missing park/pitch plates |
| Catastrophic haemorrhage / CAT | trauma-001, trauma-011 (3rd/4th) | inferred bleed only |
| Chest seal | trauma-003 (leaks to diploma) | sitting-leaning P1 |
| Pelvic binder | trauma-008 (3rd/4th) | nightclub plate |
| Tension decompression | trauma-005 vs resp-006 (conflicting sites) | |
| Spinal package / water | trauma-010 | nothing on the mesh |
| START | multi-001 text | 2 of 8 bodies |

**Proposed unlock (curriculum map, not a new year enum):**

1. Diploma / Y1: scene-survey + ABCDE + isolated limb + selective C-spine + BLS arrest (`y1-014` with BLS rubric) + anaphylaxis.
2. Diploma late / Y2: chest seal on a **new intermediate** open-PTX, tourniquet on a **new intermediate** isolated limb bleed, pelvic binder as a single-threat case, naloxone (`y1-023` diploma-tag).
3. Y3: polytrauma MARCH, TBI, tension+flail, abdomen, amputation.
4. Y4: tamponade, EDH herniation, complete SCI, electrical burn arrest, **real** MCI.

Do not teach MARCH for the first time on trauma-001 (GCS 5 motorcycle). That is a capstone, not an introduction.

`TreatmentJumpBagPanel` already opens circulation first when trauma + SBP < 90 + haemorrhage language. Keep that. Tour and ABCDE letters should not contradict it.

---

## 5. End-to-end clinical learning arc

Actual student phases (`StudentPhase`):

`select` → `prebriefing` → `scene-survey` → `vitals`/`case` → transport modal → `postcase`

Clock starts when they enter scene from `SceneSurveyPanel`, not at briefing. That is the right educational design.

### 5.1 What teaches well

| Arc step | Why it is valid |
|---|---|
| Mission board as “next call” | Frames a job, not a quiz menu. |
| Pre-brief | Dispatch copy is UAE-specific and usually mechanism-rich. |
| Scene survey gated, clock off | Matches AEM 112 W1–3. Hazard / PPE / impression before touching the patient. |
| ABCDE tracker + weighted score | Order, timing, completeness. `<C>ABC` exception is clinically correct. |
| 3D region exam + guided lock | Secondary survey can be taught, not just ticked. |
| Dynamic vitals / treatment engine | Omissions deteriorate; that is the educational point of a simulator. |
| Year-aware checklist filter | `item.yearLevel?.includes(selectedYear)` — diploma is not scored on 4th-year mannitol. |
| MARCH bag priority | Circulation deck first on shocked bleed. |
| Transport wizard (5 steps) | Forces priority, position, pre-alert, destination, working dx. Captured into session + PDF. |
| PDF (`pdf-export.ts`) | Uses the **student’s** transport object, SmartGrade, timings, management debrief — not the case template. This is the one artefact an instructor can mark. |

### 5.2 What breaks assessment validity

| Break | Effect on a grade |
|---|---|
| Scene photo collisions | Student “reads” a motorcycle wreck on a minor rear-end and a gym arrest on a football pitch. Visual scene size-up cannot be marked. |
| Authored wounds = 0; inferInjuries brittle | Exposure/findings scores reward clicking a region that looks normal. trauma-010 SCI is a clean body. |
| Pose vs text | Driver still not in a seat; legs-elevated syncope already flagged. Physical exam of position is fiction. |
| MCI 8 vs 2 | Any START score is noise. |
| ATMIST is a regex, not a form | Filling any working dx credits checklist items matching `/atmist\|handover/`. No Age / Time / Mechanism / Injuries / Signs / Treatment fields. Objective `obj-clinical-handover` cannot be observed. |
| Checklist auto-credit | Pre-alert, destination, last-known-well, FAST, glucose credited by keyword when a related step exists. Generous. Fine for coaching; too loose for an OSCE. |
| Needle-decomp site conflict | trauma-005 vs resp-006. Two gold standards. |
| Tour ABCDE-first vs MARCH cases | Students follow the tour, get a medically correct C-first, and still feel they “did it wrong”. |
| Diploma progressive leak | Grade compares diploma students who rolled trauma-003 against those who rolled y1-010. |
| Default 3rd-year | Unproctored self-study is a senior exam. |
| Transport is a form | No load, no drive, no receiving-team voice. Destination is a chip. Valid as a *decision*; invalid as a *handover skill*. |
| Environment heuristic | Construction fall plays as roadside; amputation as public; several trauma cases fall through to clinic. Scene-survey “look around” will show the wrong bay. |
| North-star gap | Kit is still search-and-apply, not pick-up-and-put-on. Do not write OSCE items that require “open the CAT pouch on the body” until that ships. |

### 5.3 Future game-bay (progressive unlock of interactivity)

Per Elias 11 Sep: look around → read the crash → examine/move patient → kit on body. Bag-opening UI later.

Curriculum implication: **unlock interactivity by cohort**, do not wait for AAA completeness to teach.

| Unlock | Cohort | Honest OSCE item |
|---|---|---|
| Now | all | Scene-survey checklist; ABCDE clicks; treatment search; transport decisions; PDF |
| Next (P0 honesty) | all | “What do you see on the body / in the bay?” only on cases with unique photo + painted injuries + correct pose |
| Kit-on-body | 2nd+ | Tourniquet / seal / binder as placed objects |
| Look-around crash | 2nd+ trauma | Hazard call-outs from 3D props, not a text list |
| Multi-body START | 4th, later diploma | Tag walk |
| Physical bag models | later | not an OSCE this term |

Until P0 honesty lands, instructors should mark **decisions and sequence**, not “inspection of wounds”.

---

## 6. Priority backlog for coding-agent

Do not edit `cases.ts` from this card. These are briefs for the coding lane. Near-term honesty of pose/scene/wounds stays P0 (north star + pose audit).

### P0 — assessment validity / lying scenes

1. **Unique scene plates for trauma collisions:** trauma-004 (stop using trapped-driver), trauma-008 (stop using nightclub), y1-011 (stop using motorcycle wreck), y1-020 (stop using gym arrest), trauma-001 keep the motorcycle plate. Source/bake real vehicles for MVC (north star: no car-shaped box).
2. **Author injuries, do not only infer.** Per trauma ID, a typed injury list that `WoundLayer` / `inferInjuries` consumes. Must-fix empties: trauma-004 stab, trauma-007 LUQ, trauma-010 SCI signs, trauma-009 scalp/EDH, all 15 `woundCount = 0`.
3. **Pose P0 that blocks trauma labs:** `y1-011` driver seat; then sitting-leaning chest cases (trauma-003/005/007). `general-001` legs-elevated remains first if still open.
4. **`multi-001` honesty:** retitle + hide from scoring, or stub eight independent patients. Do not leave “8 Patients” in the launch title.
5. **Close diploma leak:** remove `2nd-year` from the 12 advanced IDs **or** change diploma progressive to exclude 2nd-year. Pair with a new intermediate open-chest / CAT case if diploma still needs those skills.
6. **Mission-board default year** last-used or diploma; never first-load 3rd-year.

### P1 — curriculum shape

7. Exact / progressive toggle on the mission board. Classroom default exact.
8. Year-2 trauma set (new cases, not retags of expert polytrauma): isolated CAT, pelvic binder single-threat, chest seal intermediate, traction/splint beyond y1-020.
9. Structured ATMIST form (A/T/M/I/S/T) scored; stop regex-credit on any working dx.
10. Onboarding: scene-survey step; MARCH branch; cohort sentence; drop “ABCDE is always first”.
11. `y1-014` rubric explicitly BLS vs ALS. `y1-006` stretch flag or retag.
12. Diploma-tag `y1-023` if AEM 111 naloxone is in-scope.
13. Harmonise needle decompression site (TCCC 4th–5th ICS AAL preferred) across trauma-005 and resp-006; retire or retarget one tension-PTX duplicate.
14. Authored `sceneVariant` on trauma/burns (already named as upgrade path in `sceneEnvironment.ts`) so construction is industrial, beach is water, factory is industrial.
15. Fix “Showing 30 of N” copy.

### P2 — next product layer

16. Real START multi-body activity (section 3.3). Diploma only after it works.
17. AEM 111/112 week filter on the mission board (W1–3 scene, W4–8 assess, W10–13 bleed/splint/spinal/MCI).
18. Burns visual (TBSA paint) for y1-004 / y2-004 / burn-001.
19. Kit-on-body interaction (north star). Progressive unlock from Y2.
20. Arabic the onboarding tour.
21. Split `trauma-002` / `trauma-009` so one case is the lucid-interval / EDH story over time, not two unresponsive construction falls.
22. `trauma-006` shooter language: either a true warm-zone constraint or delete “ACTIVE SHOOTER” from a nightclub GSW that is not an MCI.

---

## 7. Sources (this run)

- Extract: `AUDITS/_med-ed-extract.json` (114 cases, generated this session)
- Injury/cohort: `AUDITS/trauma-injuries-cohort.json`
- Pose honesty: `AUDITS/pose-staging-honesty-2026-09-11.md`
- North star: `AUDITS/GAMEPLAY_NORTH_STAR_2026-09-11.md`
- Code: `src/data/caseFilters.ts`, `src/data/cases.ts` (trauma-001…, multi-001), `src/data/firstYearCases.ts`, `src/data/secondYearCases.ts`, `src/data/yearSpecificRubrics.ts`, `src/data/simulationObjectives.ts`, `src/components/StudentPanel.tsx`, `src/components/OnboardingTour.tsx`, `src/components/TreatmentJumpBagPanel.tsx`, `src/lib/pdf-export.ts`, `src/lib/sceneEnvironment.ts`, `src/components/Body3DModel/WoundLayer.ts`

No production code changed. Scratch helpers under `scripts/med-ed-*.py` / `AUDITS/_med-ed-summary*.txt` are analysis only.
