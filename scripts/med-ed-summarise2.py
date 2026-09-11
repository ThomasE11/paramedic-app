#!/usr/bin/env python3
"""Second-pass summary of extract JSON + injuries JSON."""
import json
from pathlib import Path
from collections import Counter, defaultdict

root = Path("/Users/eliastlcthomas/Projects/app")
data = json.loads((root / "AUDITS/_med-ed-extract.json").read_text())
inj = json.loads((root / "AUDITS/trauma-injuries-cohort.json").read_text()) if (root / "AUDITS/trauma-injuries-cohort.json").exists() else None
ty = json.loads((root / "AUDITS/trauma-year-data.json").read_text()) if (root / "AUDITS/trauma-year-data.json").exists() else None

print("=== INJURIES FILE KEYS ===")
if inj:
    print(list(inj.keys()) if isinstance(inj, dict) else type(inj), "len", len(inj) if hasattr(inj, "__len__") else None)
    if isinstance(inj, dict):
        for k, v in inj.items():
            if isinstance(v, list):
                print(k, "list", len(v), "sample", json.dumps(v[:1])[:400])
            elif isinstance(v, dict):
                print(k, "dict keys", list(v.keys())[:20])
            else:
                print(k, type(v).__name__, str(v)[:200])
    elif isinstance(inj, list):
        print("list len", len(inj))
        print(json.dumps(inj[:2], indent=2)[:3000])

print("\n=== TRAUMA-YEAR-DATA KEYS ===")
if ty:
    if isinstance(ty, dict):
        print(list(ty.keys()))
        for k, v in ty.items():
            s = json.dumps(v)[:500]
            print("---", k, type(v).__name__, "---")
            print(s)
    else:
        print(type(ty), len(ty) if hasattr(ty, "__len__") else None)

print("\n=== ALL TRAUMA WOUND / SCENE HONESTY ===")
for t in data["trauma"]:
    print(f"{t['id']:12} wounds={t['woundCount']} scene={bool(t['sceneImagePath']):5} path={t['sceneImagePath']} pos={t['position']}")

print("\n=== DIPLOMA TAGGED (all 30) ===")
for d in data["diplomaTagged"]:
    print(f"{d['id']:14} {d['category']:18} {d['complexity']:14} {d['yearLevels']}  {d['title'][:60]}")

print("\n=== YEAR TAG COMBOS ===")
combos = Counter(tuple(sorted(s["yearLevels"])) for s in data["allSummaries"])
for combo, n in combos.most_common():
    print(n, combo)

print("\n=== COMPLEXITY BY YEAR TAG (a case counted in each tagged year) ===")
for year in ["diploma", "1st-year", "2nd-year", "3rd-year", "4th-year"]:
    c = Counter(s["complexity"] for s in data["allSummaries"] if year in s["yearLevels"])
    print(year, dict(c))

print("\n=== CASES TAGGED 2ND-YEAR BUT NOT 1ST/DIPLOMA (diploma progressive leak source) ===")
leak = [s for s in data["allSummaries"] if "2nd-year" in s["yearLevels"] and "1st-year" not in s["yearLevels"] and "diploma" not in s["yearLevels"]]
print("count", len(leak))
for s in leak:
    print(f"  {s['id']:16} {s['category']:18} {s['complexity']:14} {s['priority']:10} {s['yearLevels']} {s['title'][:55]}")

print("\n=== ADVANCED/EXPERT TAGGED 1ST OR DIPLOMA ===")
hard = [s for s in data["allSummaries"] if (set(s["yearLevels"]) & {"1st-year","diploma"}) and s["complexity"] in ("advanced","expert")]
print("count", len(hard))
for s in hard:
    print(f"  {s['id']:16} {s['complexity']:10} {s['priority']:10} {s['yearLevels']} {s['title'][:55]}")

print("\n=== CRITICAL PRIORITY ON 1ST/DIPLOMA ===")
crit = [s for s in data["allSummaries"] if (set(s["yearLevels"]) & {"1st-year","diploma"}) and s["priority"]=="critical"]
print("count", len(crit))
for s in crit:
    print(f"  {s['id']:16} {s['complexity']:10} {s['category']:16} {s['yearLevels']} {s['title'][:55]}")

print("\n=== 3RD/4TH ONLY (hidden from diploma progressive) ===")
senior = [s for s in data["allSummaries"] if not (set(s["yearLevels"]) & {"diploma","1st-year","2nd-year"})]
print("count", len(senior))
cats = Counter(s["category"] for s in senior)
print("cats", dict(cats))
print("complexity", dict(Counter(s["complexity"] for s in senior)))
for s in senior:
    print(f"  {s['id']:16} {s['category']:18} {s['complexity']:14} {s['yearLevels']} {s['title'][:50]}")

print("\n=== TRAUMA MISSING FROM Y2 EXACT ===")
print("Y2 exact trauma:", [s['id'] for s in data["allSummaries"] if s["category"]=="trauma" and "2nd-year" in s["yearLevels"]])
print("Y3 exact trauma:", [s['id'] for s in data["allSummaries"] if s["category"]=="trauma" and "3rd-year" in s["yearLevels"]])
print("Y4 exact trauma:", [s['id'] for s in data["allSummaries"] if s["category"]=="trauma" and "4th-year" in s["yearLevels"]])
print("NOT tagged 3rd:", [s['id'] for s in data["trauma"] if "3rd-year" not in s["yearLevels"]])
print("NOT tagged 4th:", [s['id'] for s in data["trauma"] if "4th-year" not in s["yearLevels"]])

print("\n=== CATEGORY HOLES BY COHORT EXACT ===")
all_cats = sorted(data["byCategory"].keys())
for year, cats in data["categoryByYearExact"].items():
    missing = [c for c in all_cats if c not in cats]
    print(year, "missing", missing)

print("\n=== SCENE IMAGE PATH COLLISIONS ===")
paths = defaultdict(list)
for s in data["allSummaries"]:
    if s.get("sceneImagePath"):
        paths[s["sceneImagePath"]].append(s["id"])
coll = {k:v for k,v in paths.items() if len(v)>1}
print("shared scene images", len(coll))
for k,v in sorted(coll.items(), key=lambda x: -len(x[1])):
    print(f"  {len(v)} {k} -> {v}")

print("\n=== TRAUMA WITHOUT SCENE IMAGE ===")
for t in data["trauma"]:
    if not t["sceneImagePath"]:
        print(" ", t["id"], t["title"])

print("\n=== MULTI-001 FULL ===")
for s in data["allSummaries"]:
    if s["id"]=="multi-001":
        print(json.dumps(s, indent=2)[:5000])
