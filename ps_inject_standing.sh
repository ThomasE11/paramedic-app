#!/bin/bash
set -e
NOTE="/Users/eliastlcthomas/Projects/app/OPERATOR_STANDING_DEPLOY.md"
cp "$NOTE" "$NOTE" 2>/dev/null || true
hermes kanban --board paramedic-studio comment t_6fcd9814 "$(cat <<'C'
OPERATOR STANDING (Elias 11 Sep ~00:43 GST): Deploy as you reach goals and keep going.

After each meaningful milestone: npm run check → commit on feat/case-dynamics-bidirectional → push → Vercel preview deploy (do NOT deploy onto student-workbook / old LMS project) → kanban comment with SHA + URL. Do not stop early; continue remaining items (classroom, jitter, chair, wounds, pupils, mannequin-bed, MVC, instructor polish, Blender/assets). Not Student Workbook.
C
)"
echo injected
hermes kanban --board paramedic-studio show t_6fcd9814 | head -40
