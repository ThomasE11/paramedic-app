# Realistic Anatomy — Sourcing & Architecture Decision

_The Director's direction: the assessment's whole value is **discovery** — the student suspects something and goes to the body to find it. Telling them "JVD present" up front defeats it. We need a genuinely human model where findings are **rendered on the body** and **only revealed by assessing the right region** (zoom to neck → see the distended jugulars; auscultate left lung field → hear the wheeze). Find a real anatomy first._

---

## Reframe: what "realism" actually means here

The instinct is "we need MetaHuman-grade photoreal skin." The research says that's the wrong target for a web app:

- A 60 MB GLB **crashes the browser**; >10 MB struggles; raycasting (click-to-assess) on a 19 MB / 17k-poly mesh causes "huge delays." Photoreal skin (pores, SSS) is the single most performance-expensive thing you can do, and it's the first thing that breaks on a student's phone or a classroom Chromebook.
- The two most successful clinical sims in the literature **don't** chase photoreal:
  - **Philips Visual Patient Avatar** — a clean stylised human whose **skin turns cyanotic as SpO₂ falls**, lungs animate at the respiratory rate, etc. Proven in multicentre studies to improve sign recognition.
  - **NSF Physical-Virtual Patient Simulator** — renders **cyanosis, ecchymosis, cigarette burns, bites, blisters, swelling, delayed cap refill** on a **4,825-vertex** model (deliberately low-poly for performance).

**Conclusion:** the realism that matters is *correct human form + clinically accurate, discoverable findings* — not skin pores. We should target "convincingly human and clinically expressive," which is web-deliverable, not "MetaHuman photoreal," which is not. The current mannequin fails because it's a featureless game T-pose, not because it lacks pores.

---

## The two-part problem

### Part A — the base model (what you asked to find first)

A clean, realistic, **rigged** human GLB that supports **morph targets** (blend shapes). Ranked for our use:

| Option | Realism | License | GLB path | Cost | Verdict |
|---|---|---|---|---|---|
| **Character Creator 4** (Reallusion) | High — industry medical-sim standard | Commercial OK | CC4 → Blender → GLB (no native GLB) | ~$199 one-off | **Best realism.** Body+expression morphs built in. The Blender step is routine. |
| **MakeHuman / MPFB2** (Blender plugin) | Good | **CC0 — zero restriction** | MPFB2 in Blender → GLB | **Free** | **Best risk/cost.** Riggable, morph targets, decent skin. Output is CC0 (safe for commercial, closed-source). |
| **Sketchfab / CGTrader purchased human** | Varies, can be high | Per-item (watch CC-BY vs royalty-free) | Often native GLB | $20–150 | Fast start, but you still do Blender work to add finding morphs. |
| MetaHuman / SMPL-X | Highest / parametric | Unreal-bound / research-only | Painful on web | — | **Rejected** — not web-deliverable / license traps. |

**Recommendation: Character Creator 4 as the hero model** if you'll invest the ~$199 + a day of Blender setup (it's what professional medical sims use and the morph/expression tooling will pay off for pain faces, distress, breathing). **MakeHuman/MPFB2 as the zero-cost, zero-license-risk fallback** that gets us 80% there for free.

Either way the deliverable is the same: **one rigged GLB + a set of authored finding morphs**, Draco-compressed to <5 MB for web.

### Part B — the findings layer (the actually-valuable engineering, model-agnostic)

No off-the-shelf model shows JVD or a distended abdomen. Each finding is rendered by one of three mechanisms, **all driven by case data and gated behind assessment**:

| Finding | Mechanism | Notes |
|---|---|---|
| Cyanosis / pallor | **Material tint** on lips, nailbeds, peripheries | Proven (Philips). Cheap. Can be live-driven by SpO₂. |
| Bleeding / wounds / bruising / burns | **Decal** (`@react-three/drei <Decal>`) at anatomical coords | Proven technique (same as tattoo-on-mannequin configurators). Decals can grow/darken over time. |
| JVD, abdominal distension, chest rise, flail paradox | **Morph targets** authored in Blender, driven by case | The bespoke work. Each is a blend shape we sculpt once. |
| Limb deformity / external rotation | **Bone rotation** on the rig | Re-uses the rig; same idea as the Scene Survey figure but on the real mesh. |
| Breathing | Morph (chest-rise) at the case's RR | We already animate this on the stylised figure. |

### Part C — discovery interaction (the pedagogy)

Findings are **hidden by default**. The flow:
1. Click a body region → camera **zooms** to it.
2. Choose technique (Inspect / Palpate / Percuss / **Auscultate**).
3. For auscultate: choose **sub-site** (L/R lung field, the 4 heart areas, the 4 abdominal quadrants).
4. The finding is **revealed** — visually (decal/morph/tint becomes visible) and/or audibly (the synthesized sound — **already built** in `clinicalSounds.ts`).
5. Student carries the finding to the Treatment panel.

**The Injury Map I built last pass violates this** — it lists findings up front. It should be **removed from the student view** (kept, if at all, as a debrief/instructor summary). I'll do that as part of this work.

---

## Honest scope

This is a **multi-week re-platforming of the exam**, not an afternoon. Sequencing:

1. **Decide the base model** (this doc's open question) — gates everything.
2. **Acquire + rig + Draco-compress** the GLB; author the first finding morphs (JVD, abdominal distension, chest-rise).
3. **Build the findings-layer system** in react-three-fiber: tint + decal + morph drivers, all reading case data, all gated behind assessment state.
4. **Region zoom + sub-site auscultation** wired to the existing sound engine.
5. **Retire the Injury Map** from student view.
6. Iterate finding-by-finding (bleeding, deformity, burns, …).

## Open question for the Director

**Which base model do we commit to?** That decision unblocks everything else:
- **Character Creator 4** — best realism, ~$199 + Blender setup, the professional medical-sim path.
- **MakeHuman/MPFB2** — free, CC0, slightly less photoreal, no license risk.
- **Buy a specific Sketchfab/CGTrader human** — fastest to a model in-hand, per-item license to vet.

Once chosen, the first concrete build is: get that model into the app as a Draco-compressed GLB replacing the current mannequin, with one finding (JVD on neck-zoom) wired end-to-end as the proof-of-concept.
