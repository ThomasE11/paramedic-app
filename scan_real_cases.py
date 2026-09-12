#!/usr/bin/env python3
"""Scan only top-level CaseScenario ids (4-space indent) for scene wiring gaps."""
from pathlib import Path
import re

ROOT = Path("/Users/eliastlcthomas/Projects/app")
data_dir = ROOT / "src/data"
assets = {p.name for p in (ROOT / "public/scene-assets").iterdir() if p.is_file()}

files = [
    "cases.ts",
    "firstYearCases.ts",
    "secondYearCases.ts",
    "additionalCases.ts",
    "enhancedCases.ts",
    "litflCases.ts",
    "severityVariantCases.ts",
]

id_re = re.compile(r"^    id: '([^']+)',", re.M)
env_re = re.compile(r"environment:\s*'([^']*)'")
var_re = re.compile(r"environmentVariant:\s*'([^']+)'")
img_re = re.compile(r"sceneImagePath:\s*'([^']+)'")
loc_re = re.compile(r"location:\s*'([^']*)'")
reason_re = re.compile(r"callReason:\s*'([^']*)'")
desc_re = re.compile(r"description:\s*'([^']*)'")
gender_re = re.compile(r"gender:\s*'([^']+)'")
title_re = re.compile(r"title:\s*'([^']*)'")

sel = (ROOT / "src/lib/sceneImageSelection.ts").read_text()
prompt_block = sel.split("export const PROMPT_SCENE_IMAGE_OVERRIDES")[1].split(
    "CURRENT_CONTEXT_OVERRIDES"
)[0]
prompt = dict(re.findall(r"'([a-z0-9-]+)':\s*'(/scene-assets/[^']+)'", prompt_block))

rows = []
for fname in files:
    text = (data_dir / fname).read_text()
    matches = list(id_re.finditer(text))
    for i, m in enumerate(matches):
        cid = m.group(1)
        end = matches[i + 1].start() if i + 1 < len(matches) else min(m.start() + 8000, len(text))
        window = text[m.start() : end]
        if "dispatchInfo" not in window:
            continue
        env = env_re.search(window)
        var = var_re.search(window)
        img = img_re.search(window)
        loc = loc_re.search(window)
        reason = reason_re.search(window)
        desc = desc_re.search(window)
        gender = gender_re.search(window)
        title = title_re.search(window)
        img_path = img.group(1) if img else ""
        img_exists = Path(img_path).name in assets if img_path else None
        rows.append(
            {
                "file": fname,
                "id": cid,
                "title": title.group(1) if title else "",
                "env": env.group(1) if env else "",
                "variant": var.group(1) if var else "",
                "img": img_path,
                "img_exists": img_exists,
                "loc": loc.group(1) if loc else "",
                "reason": reason.group(1) if reason else "",
                "desc": (desc.group(1)[:90] if desc else ""),
                "gender": gender.group(1) if gender else "",
                "override": prompt.get(cid, ""),
            }
        )

print(f"Assets on disk: {len(assets)}")
print(f"Real cases: {len(rows)}")
print(f"PROMPT overrides: {len(prompt)}")
with_img = [r for r in rows if r["img"]]
no_img = [r for r in rows if not r["img"]]
print(f"With sceneImagePath: {len(with_img)}")
print(f"NO sceneImagePath: {len(no_img)}")
print(f"NO path AND NO override: {sum(1 for r in no_img if not r['override'])}")

print("\n=== NO path AND NO override ===")
for r in no_img:
    if r["override"]:
        continue
    print(
        f"  {r['id']:16} [{r['file']:22}] {r['gender']:6} "
        f"loc={r['loc'][:50]!r}"
    )
    print(f"                     title={r['title'][:70]!r}")
    print(f"                     reason={r['reason'][:80]!r}")

print("\n=== Gender mismatches on CASE PATH (not resolver) ===")
for r in with_img:
    fname = Path(r["img"]).name.lower()
    g = r["gender"]
    if "female" in fname and g == "male":
        print(f"  MALE case + FEMALE asset: {r['id']} -> {Path(r['img']).name} loc={r['loc'][:40]!r}")
        print(f"      override={Path(r['override']).name if r['override'] else '-'}")
    elif re.search(r"(^|[-_])male", fname) and "female" not in fname and g == "female":
        print(f"  FEMALE case + MALE asset: {r['id']} -> {Path(r['img']).name} loc={r['loc'][:40]!r}")
        print(f"      override={Path(r['override']).name if r['override'] else '-'}")

print("\n=== Duplicate PROMPT keys ===")
keys = re.findall(r"'([a-z0-9-]+)':\s*'/scene-assets/", prompt_block)
seen = {}
for k in keys:
    seen[k] = seen.get(k, 0) + 1
for k, n in seen.items():
    if n > 1:
        print(f"  {k} x{n}")
