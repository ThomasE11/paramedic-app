# Goal contract — ParaMedic Studio realism slice

Standing objective for Hermes `/goal` and kanban `--goal` workers.
Do not stop because `npm run check` is green. That gate was already green
before this overhaul. Done means the vertical slice is real.

**Repo:** `/Users/eliastlcthomas/Projects/app`
**Plan:** `REALISM_OVERHAUL_PLAN.md`
**Slice:** `resp-001` (severe asthma, male, villa living room)
**Dev server:** `http://localhost:5173`

## Outcome

Launching `resp-001` feels like walking into a villa living room where a
male patient is fighting to breathe. Elias's one-line acceptance:
*"That's a person in a room I walked into, and he's fighting to breathe."*

## Already shipped (do not rebuild)

| Phase | Commit | What landed |
|---|---|---|
| A | `4ccf2476` | masculinized male mesh, skin maps, viseme + posture clips |
| B | `1974799d` | SSS material, posture mixer, lip-sync RMS → `viseme_open` |
| C1 | `6cd579bf` | villa room geometry + props |
| C2 | `0df3861b` | window / lamp / AC light rig |
| C3 | `c59271f7` | positional ambience + breath |
| D1/D2 | `7a58bc01` | rack-focus DoF, warm grade, gated bloom |

## Remaining work

1. **D3** — HUD restyle + cinematic phase transitions. Opus-only. Touches
   `StudentPanel.tsx` last. Briefing → scene → treat must camera-lerp /
   crossfade, not hard-cut. Vitals read as a device, not a web form.
   Clinical state machine stays untouched.
2. **B4 verify** — SpO2-driven lip/nailbed cyanosis is partially wired in
   `BodyMesh` / `index.tsx`. Confirm it tints at SpO2 85 and clears at 94
   on `resp-001`. Finish only the gap; do not rewrite the director.
3. **Slice acceptance** — prove the ten criteria below on `resp-001`.

## Verification

Must all be true, with evidence (command output, capture path, or screenshot):

1. Skin: pores + warm translucency in ears/nostrils; no plastic sheen.
2. Male reads male; morphs intact (`node scripts/anatomy-models/verify-glb.cjs`
   or the project's equivalent).
3. Patient sits tripod; shoulders heave at live RR; eases as SpO2 recovers.
4. Speech: broken sentence with jaw moving in time.
5. Camera orbits *inside* the villa; window + lamp cast floor shadows.
6. Cyanosis: lips/nailbeds dusky at SpO2 85, clear at 94.
7. Cinematic DoF on the face during dialogue; warm grade; window bloom;
   adaptive ladder still sheds under 30fps.
8. AC hum + wheeze pans as the camera orbits.
9. Case launch dollies through the room onto the patient; phases crossfade.
10. `npm run check` green. Desktop ~60fps / iPad ≥30fps via `measure-fps.mjs`
    if the harness still exists.

## Constraints

- Upgrade in place. Do not invent a new engine.
- Never modify `cases.ts` / case library chunks as clinical content.
- Never `git add -A`. Stage explicit paths only.
- British English. i18n strings stay translatable.
- iPad must survive (adaptive ladder is the contract).
- Do not deploy. Do not touch secrets. Do not install packages unless
  `package.json` already needs them for a named API in the plan.

## Boundaries

Only `/Users/eliastlcthomas/Projects/app`. Prefer `src/components/Body3DModel/`,
`src/components/StudentPanel.tsx`, `src/hooks/useVoiceNarration.ts`,
`src/hooks/usePatientVoice.ts`, `src/lib/ambientAudio.ts`,
`scripts/anatomy-models/`. `StudentPanel.tsx` is last and Opus-only.

## Stop when

- Blender bake is blocked on a missing asset that cannot be generated.
- FPS cannot hold ≥30 on iPad even after shedding the adaptive ladder.
- A change would rewrite the clinical state machine to make a transition pretty.
- Turn budget / rate limit: block the kanban card with the exact reset time
  and remaining work. Do not pretend the slice is done.

## Quality gates (run before calling done)

```bash
cd /Users/eliastlcthomas/Projects/app
npm run check
```

A green gate is necessary, not sufficient.
