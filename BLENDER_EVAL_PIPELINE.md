# Blender Eval Pipeline — independent authenticity reviewer

_Last updated: 10 Sep 2026 (Asia/Dubai)._

## Why this exists

ParaMedic Studio authenticity is gated by **two separate model roles**:

| Role | Model / combo | Used for |
|------|---------------|----------|
| **Worker (coding)** | Card `model_override` → `cx/gpt-5.6-sol` (or profile `auto`/`coding`) | bpy scripts, GLB export, app wiring, commits |
| **Independent evaluator** | 9Router combo **`blender-eval`** (alias **`paramedic-3d`**) | Critique renders/screenshots for clinical/scene authenticity **before merge** |

Do **not** point the coding worker’s primary chat at `blender-eval`. The evaluator is vision/review only so the same model stack that authored a bake cannot rubber-stamp it.

Combo stack (fallback order):

```json
["cc/claude-opus-5", "cx/gpt-5.6-sol", "cx/gpt-5.6-terra", "ollama-local/gemma4:31b-cloud", "offline/hermes-qwen3.5:9b"]
```

Hermes wiring (`~/.hermes/profiles/coding-agent/config.yaml`):

- `auxiliary.vision` → `9Router` / `blender-eval`
- Fallbacks → `browserking-vision` then `cx/gpt-5.6-sol`
- Optional named slot `auxiliary.blender_eval` mirrors the same (for explicit review prompts)

## Blender CLI

| Item | Path |
|------|------|
| App binary | `/Applications/Blender.app/Contents/MacOS/Blender` |
| Symlink on PATH | `~/.local/bin/blender` → same |
| Env (coding-agent) | `BLENDER="/Applications/Blender.app/Contents/MacOS/Blender"` |
| Version | Blender **5.1.2** (bpy matching) |

Invoke headless:

```bash
export BLENDER="${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"
"$BLENDER" --background --python scripts/anatomy-models/<script>.py -- <args>
```

Prefer scripts under `scripts/anatomy-models/` over placeholder meshes. MCP `blender` toolset (viewport screenshot / `execute_blender_code`) is enabled on coding-agent.

## When to call the evaluator

After each **meaningful** Blender bake/render or scene change that affects student/instructor visuals:

1. Produce a still: viewport screenshot (MCP `get_viewport_screenshot`), EEVEE/Cycles still, or app screenshot at `http://localhost:5173`.
2. Send the image to **`blender-eval`** (Hermes vision / auxiliary) with a short critique brief, e.g.:
   - clinical findings readable only on correct assessment zoom?
   - wound/decal placement vs case data?
   - chair seating / bed contact (no mannequin-through-mesh)?
   - MVC / mechanism props match case?
   - pupil/face exam lighting & hit targets?
   - jitter / skinning / clip artifacts?
3. Fix issues the evaluator flags; re-render; only then merge / request-review.

Skip the evaluator for pure TypeScript refactors with no mesh/material/scene change.

## Free / license-clean medical 3D asset bank

Download into `assets/medical-3d/` with a root `ATTRIBUTION.md` (source URL, license, author, date, files). Prefer **CC0 / CC-BY / NIH** — no invented paid spend; stop and note paywalls. Work signup email: `elias@twetemo.com`.

Starter sources (see also `ANATOMY_SOURCING.md`):

- **MakeHuman / MPFB2** — CC0 base humans (already in Blender pipeline)
- **NIH 3D Print Exchange** — medical/anatomy models, often public-domain / government
- **NIH 3D** (https://3d.nih.gov/) — successor portal; CC0/CC biomedical assets
- **AnatomyTOOL Open 3D Man** — open educational anatomy (BodyParts3D / Z-Anatomy lineage); verify per-asset CC
- **Z-Anatomy** (Blender atlas, CC-BY-SA) — good reference; share-alike if redistributing derivatives
- **BodyParts3D / Anatomography** — CC-BY-SA 2.1 JP typical
- **Anatomography / BodyParts3D** — anatomy meshes (check license terms)
- **Sketchfab** — filter medical + CC0 / CC-BY
- **Poly Pizza** — medical filter, CC0 pack hunting
- **Free3D** — medical category (vet license per asset)
- **Open Ortho / open orthopaedic** datasets where available
- **Kenney** — only for non-clinical props/UI if style fits (not anatomy)
- **CGTrader / TurboSquid free bins** — only when license explicitly allows redistributed sim use

Out of scope for this pipeline: Student Workbook, Tier5, Namibia paper, LinkedIn/WA spam.

## Related kanban

Running worker card: `t_6fcd9814` (classroom host + 3D jitter/wounds/chair/pupils) — scope includes Blender authenticity + free medical asset catalog via operator comment.
