#!/usr/bin/env python3
"""Scan case files for sceneImagePath / environmentVariant vs dispatch gaps."""
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

id_re = re.compile(r"^\s+id:\s*['\"]([^'\"]+)['\"]", re.M)
env_re = re.compile(r"environment:\s*['\"]([^'\"]*)['\"]")
var_re = re.compile(r"environmentVariant:\s*['\"]([^'\"]+)['\"]")
img_re = re.compile(r"sceneImagePath:\s*['\"]([^'\"]+)['\"]")
loc_re = re.compile(r"location:\s*['\"]([^'\"]*)['\"]")
reason_re = re.compile(r"callReason:\s*['\"]([^'\"]*)['\"]")
desc_re = re.compile(r"description:\s*['\"]([^'\"]*)['\"]")

rows = []
for fname in files:
    p = data_dir / fname
    if not p.exists():
        print(f"MISSING FILE {fname}")
        continue
    text = p.read_text()
    for m in id_re.finditer(text):
        cid = m.group(1)
        window = text[m.start() : m.start() + 4500]
        if "sceneInfo" not in window and "dispatchInfo" not in window:
            continue
        env = env_re.search(window)
        var = var_re.search(window)
        img = img_re.search(window)
        loc = loc_re.search(window)
        reason = reason_re.search(window)
        desc = desc_re.search(window)
        img_path = img.group(1) if img else None
        img_exists = None
        if img_path:
            img_exists = Path(img_path).name in assets
        rows.append(
            {
                "file": fname,
                "id": cid,
                "env": env.group(1) if env else "",
                "variant": var.group(1) if var else "",
                "img": img_path or "",
                "img_exists": img_exists,
                "loc": loc.group(1) if loc else "",
                "reason": reason.group(1) if reason else "",
                "desc": (desc.group(1)[:90] if desc else ""),
            }
        )

print(f"Assets: {len(assets)}")
print(f"Case-like objects: {len(rows)}")
no_img = [r for r in rows if not r["img"]]
missing_asset = [r for r in rows if r["img"] and r["img_exists"] is False]
no_var = [r for r in rows if not r["variant"]]
print(f"NO sceneImagePath: {len(no_img)}")
print(f"MISSING asset file: {len(missing_asset)}")
print(f"NO environmentVariant: {len(no_var)}")

print("\n=== NO sceneImagePath ===")
for r in no_img:
    print(
        f"  {r['id']:22} [{r['file']:22}] var={r['variant'] or '-':10} "
        f"loc={r['loc'][:55]!r} env={r['env'][:55]!r} reason={r['reason'][:70]!r}"
    )

print("\n=== MISSING asset files ===")
for r in missing_asset:
    print(f"  {r['id']:22} {r['img']}")

print("\n=== NO environmentVariant ===")
for r in no_var:
    print(
        f"  {r['id']:22} [{r['file']:22}] loc={r['loc'][:55]!r} env={r['env'][:70]!r}"
    )

print("\n=== ALL with image+variant (spot mismatches) ===")
for r in rows:
    if not r["img"] or not r["variant"]:
        continue
    blob = " ".join([r["loc"], r["reason"], r["env"], r["desc"], r["img"]]).lower()
    var = r["variant"]
    mismatch = False
    notes = []
    roadside_kw = ("highway", "road", "mvc", "rta", "pedestrian", "motorcycle", "car crash", "traffic")
    home_kw = ("apartment", "villa", "home", "bedroom", "bathroom", "house", "flat")
    public_kw = ("mall", "office", "airport", "gym", "restaurant", "construction", "park", "beach", "hotel", "school", "library")
    if any(k in blob for k in roadside_kw) and var not in ("roadside",) and "parking" not in blob:
        if any(k in r["loc"].lower() + r["env"].lower() + r["reason"].lower() for k in roadside_kw):
            mismatch = True
            notes.append(f"road-ish loc but variant={var}")
    if any(k in r["loc"].lower() + r["env"].lower() for k in home_kw) and var not in ("home", "clinic"):
        if "office" not in blob and "mall" not in blob and "construction" not in blob:
            mismatch = True
            notes.append(f"home-ish loc but variant={var}")
    if mismatch:
        print(f"  {r['id']:22} var={var:10} img={Path(r['img']).name:50} loc={r['loc'][:50]!r} notes={notes}")
