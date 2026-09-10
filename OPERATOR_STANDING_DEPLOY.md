# OPERATOR STANDING ORDER — Elias 2026-09-11 ~00:43 GST

**Deploy as you reach goals. Keep going.**

For ParaMedic Studio card `t_6fcd9814` (~/Projects/app · :5173 · ThomasE11/3d-case-simulator):

1. After each meaningful milestone (classroom host/PIN, jitter calm, chair, wounds, pupils, mannequin-on-bed, MVC scene, instructor polish):
   - `npm run check` green (or note why skipped)
   - Commit on `feat/case-dynamics-bidirectional` (or short fix branch)
   - Push branch
   - Deploy preview (Vercel — known preview `app-three-gamma-88.vercel.app` if still linked). Prefer `vercel --prod` only if this project’s production is the 3D sim, NOT student-workbook / old paramedic-studio LMS.
   - Comment on the kanban card with: what shipped, commit SHA, deploy URL
2. Do NOT stop at request-review if more items remain — keep iterating.
3. Do NOT touch Student Workbook / Tier5 / ~/Projects/student-workbook.
4. From: elias@twetemo.com only if any account is needed for free asset downloads.

This supersedes “wait for full done before deploy.” Ship incrementally.
