# Continue resp-001 realism — new coding-agent session (vision live)

This is a **new** session. Do not resume the old text-only chat.
Read `GOAL_CONTRACT.md`, `REALISM_OVERHAUL_PLAN.md`, `CLAUDE.md`, then work until the slice is done.

## Where you left off (2026-08-21)

Code is already committed. Do not rebuild A–D3 or the cyanosis atlas.

| Item | Status |
|------|--------|
| D3 HUD + phase transitions | Shipped `848c441f`. Kanban `t_d6299cb5` blocked only because the goal judge returned PermissionDeniedError. |
| B4 cyanosis | Shipped `8116a110` + `da0c3f9c`. Kanban `t_bc111075` timed out at 90 turns while trying to **see** lips/nailbeds. Vision was broken. |
| Slice acceptance `t_ab22933b` | Waiting on parents. |

Dev server is up: `http://localhost:5173`.

Existing shots (inspect these first with `vision_analyze` — aux vision is **gcli/grok-4.6** on 9Router; fallback Haiku 4.5 then Gemini 3.5 Flash Lite):

- `/Users/eliastlcthomas/Projects/app/test-results/desktop-01-overview.png`
- `/Users/eliastlcthomas/Projects/app/test-results/desktop-02-face.png`
- `/Users/eliastlcthomas/Projects/app/test-results/desktop-03b-limbs.png`
- `/Users/eliastlcthomas/Projects/app/test-results/mobile-01-overview.png`
- `/Users/eliastlcthomas/Projects/app/test-results/resp001-cyanosis-85.png`
- `/Users/eliastlcthomas/Projects/app/test-results/resp001-cyanosis-94.png`
- `/Users/eliastlcthomas/Projects/app/test-results/d3-acceptance-bay.png` (if present)
- `/Users/eliastlcthomas/Projects/app/test-results/resp001-live-hud.png` (if present)

`vision_analyze` works. Native image attach on `auto`/`coding` does **not** — always use the vision_analyze tool.

## Your job

1. **B4 visual verify.** `vision_analyze` the 85 vs 94 shots. Lips and nailbeds dusky at 85, clear at 94. If the stills are the wrong crop, recapture with `scripts/capture-model.mjs` (or the existing harness) on `resp-001` and inspect again. Fill only a real gap. Then `kanban_comment` evidence on `t_bc111075` and complete it.
2. **D3 visual verify.** Confirm briefing→scene→treat is not a hard cut and the vitals HUD reads as a device. Use existing D3 stills plus new captures if needed. Complete `t_d6299cb5` and `t_3d175025` (checklist mapped to paths).
3. **Slice acceptance** `t_ab22933b`. All ten `GOAL_CONTRACT.md` criteria with evidence. `npm run check` is necessary, not sufficient.
4. Keep looping until the contract is satisfied or a listed stop-when hits. Unblock/complete kanban as you go. Board: `paramedic-studio`.

## Constraints

Same as GOAL_CONTRACT: upgrade in place; never `git add -A`; never touch `cases.ts` clinical content; StudentPanel last and only if D3 still has a hole; British English; iPad adaptive ladder stays; do not deploy.
