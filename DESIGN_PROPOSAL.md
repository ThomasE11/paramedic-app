# Design Proposal — Assessment→Treatment Flow, Case Selection, Frontier Classroom

*2026-07-05. The "design proposal" round from TRACKER.md. Each section: honest
audit of what exists → the gap → the proposal → what it costs. Elias's
guide-rails (verbatim intent): click the organ itself, contextual assessment
actions, **no dots on the patient**, clinically sound for paramedic students,
easy to follow from assessment through treatment.*

---

## A. The core loop: assessment → finding → decision → treatment

### What exists (it's more than it looks)
- **Stage spine** (StudentPanel, 5 phases): prebriefing → scene survey →
  vitals → active case → post-case. Scene survey has the consent beat.
  Weighted ABCDE scoring with year-banded time targets already grades order
  and timing.
- **Organ clicking is already real**: body clicks bone-classify to 11 regions;
  in-region detail exams exist (eye→pupil check, carotid→pulse, abdominal
  quadrants, feet). Dressed garments part per focused region.
- **Findings surface on the patient**: wounds as skin decals, breathing at the
  live RR, diaphoresis/jaundice/mottling on live physiology, auscultation
  routed from authored findings.
- **Treatment lives elsewhere**: TreatmentJumpBagPanel — three bags (Airway
  17 / Circulation 15 / Medication 68 options), search-within-bag. The
  dynamic treatment engine underneath is deep (37 protocols, bidirectional
  harm, synergies).

### The gap
1. **Overview landmark dots still float on the patient** (EXAM_LANDMARKS
   `level: 'overview'` in Body3DModel). Elias: remove. The body itself is the
   interface; hover glow already signals clickability.
2. **Assessment actions live in a side panel**, not at the click. You click
   the chest, then travel to a panel to pick auscultate. The spatial thread
   breaks.
3. **Findings don't lead anywhere.** You hear crackles on the chest; nothing
   connects that moment to the GTN/CPAP sitting in a 68-item bag list. The
   student does the clinical reasoning jump with zero scaffolding — fine for
   Y4, wall for diploma.

### Proposal (in build order)
**A1 — Kill the overview dots.** Delete the `level: 'overview'` marker pass.
Keep `level: 'detail'` markers *inside* an active region view only — they
anchor real targets (pupils, pulse points) after the student has already
committed to a region. Cheapest change in this document; do first.

**A2 — Contextual action ring at the click point.** Click chest → a compact
ring/menu at the intersection point: Inspect · Palpate · Percuss · Auscultate
· Expose. These actions all exist; this is presentation relocation, not new
capability. The ring is region-aware (abdomen offers quadrants; limbs offer
pulse/motor/sensation; head offers pupils/airway). Keyboard/tap friendly, one
gesture from organ to action. Guided mode highlights the expected ring arm
instead of a panel row.

**A3 — "Treat" bridge from findings.** When a finding is revealed
(auscultated crackles, seen cyanosis), the region's ring gains a Treat arm
that opens the right bag **pre-filtered** (crackles → GTN/CPAP/positioning).
The mapping table is data (finding-pattern → treatment ids) and the engine
already knows correct/contraindicated — the bridge only *narrows the shelf*,
it never picks for the student, so contraindication learning stays intact.
Year-gate it: diploma/Y1 get the filtered shelf, Y3+ get the full bag
(scaffolding fades as competence grows — matches the existing year-banded
scoring philosophy).

**A4 — leave the stage spine alone.** Scene survey → primary → exam →
treat → handover matches how paramedics are actually taught; it's built,
scored, and field-tested. Everything above changes the interaction *surface*,
not the pedagogy.

---

## B. Case selection — one front door

### What exists
Three overlapping entries: LandingPage quick generator + category browser,
StudentPanel Phase-1 selection (Generate Random / by Category / Practice
Condition, year tabs), and the older educator generator page.

### Proposal
The StudentPanel Phase-1 board is the real one — it has year bands, category
filters, and condition search, and it feeds the phase machine. Make it the
**only** selection surface:
- Landing page cards become deep-links into it (they already nearly are).
- Educator page retires; educator-only controls (objectives, checklist
  visibility) become a role toggle on the same board. One surface to
  maintain, one to polish. Evidence like the trauma card lives here as case
  preview metadata (mechanism, acuity chips) so selection teaches triage
  before the case even starts.

---

## C. Frontier classroom

### What exists (substantial)
Nine components: Host, Join, Lobby, BroadcastBar, VideoTiles, ChatSidebar,
WatchBanner, InstructorLiveControls, MarkingView. Live broadcast of a case to
a roster already works; replay/marking exists.

### The gap
The classroom currently *broadcasts one shared case* — students watch the
same patient state. The frontier-classroom idea is each student running the
case **independently** while the instructor sees everyone.

### Proposal
1. **Independent runs**: each joined student gets their own PatientState
   (engine already instantiates per session — the classroom just needs to
   stop sharing one).
2. **Instructor cockpit**: a grid — one card per student — showing live ABCDE
   progress, elapsed time, last action, current vitals trend arrow. All data
   the scoring spine already emits; this is a subscription + a card grid.
3. **Comparative debrief**: after time-box, MarkingView gains a compare
   strip — every student's decision timeline on one axis (who gave adrenaline
   at 2:10 vs 6:40). The replay-debrief scrubber already renders a single
   timeline; this is N of them stacked.
Defer: live video tiles polish, chat moderation — they work, they're not the
frontier.

---

## Build order & token routing (per the worker doctrine)

| # | Item | Who | Why |
|---|------|-----|-----|
| 1 | A1 remove overview dots | Fable (small 3D/UI diff) | 30-line deletion, browser-verified |
| 2 | A2 action ring | Fable | Cross-file UI wiring, the kind local models fail |
| 3 | A3 finding→treatment map table + tests | **Local worker** (tests-as-spec) | Pure data + pure function — its proven lane |
| 4 | A3 ring/bag wiring | Fable | UI integration over the worker's table |
| 5 | B consolidation | Fable plans, **local worker** does the mechanical page moves | Boilerplate-heavy |
| 6 | C1–C3 classroom | Fable | State architecture; get A+B field-tested first |

Rule of thumb throughout: one tree-writer at a time; `npm run check` gates
every step; anything bulk (tables, tests, case metadata) goes local.

---

*Approval gates: say "build A1" (or A1+A2 together), "build the bridge",
"consolidate selection", or "frontier classroom" — each lands independently.*
