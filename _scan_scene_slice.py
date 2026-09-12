from pathlib import Path
import re

ROOT = Path("/Users/eliastlcthomas/Projects/app")
sel = (ROOT / "src/lib/sceneImageSelection.ts").read_text()
data_files = [
    ROOT / "src/data/cases.ts",
    ROOT / "src/data/firstYearCases.ts",
    ROOT / "src/data/additionalCases.ts",
    ROOT / "src/data/secondYearCases.ts",
    ROOT / "src/data/enhancedCases.ts",
    ROOT / "src/data/litflCases.ts",
    ROOT / "src/data/severityVariantCases.ts",
]
id_re = re.compile(r"^    id: '([^']+)',", re.M)
gender_re = re.compile(r"gender: '(male|female)'")
path_re = re.compile(r"sceneImagePath: '(/scene-assets/[^']+)'")
loc_re = re.compile(r"location: '([^']*)'")
env_re = re.compile(r"environment: '([^']*)'")

def gender_of_asset(src):
    f = src.lower()
    if any(k in f for k in ("female", "woman", "obstetric", "eclamptic", "ectopic")):
        return "female"
    if "male" in f:
        return "male"
    m = re.search(r"'%s': '(male|female)'" % re.escape(src), sel)
    return m.group(1) if m else None

print("authored mismatches:")
for fp in data_files:
    text = fp.read_text()
    for m in id_re.finditer(text):
        start = m.start()
        nxt = id_re.search(text, m.end())
        end = nxt.start() if nxt else min(len(text), start + 8000)
        block = text[start:end]
        gm = gender_re.search(block)
        pm = path_re.search(block)
        if not gm or not pm:
            continue
        vis = gender_of_asset(pm.group(1))
        if vis and vis != gm.group(1):
            loc = loc_re.search(block)
            print(" ", m.group(1), gm.group(1), "->", vis, pm.group(1), "|", (loc.group(1) if loc else "")[:70])

print("\nPROMPT dups:")
block = sel.split("PROMPT_SCENE_IMAGE_OVERRIDES")[1].split("CURRENT_CONTEXT")[0]
keys = re.findall(r"'([a-z0-9-]+)':", block)
seen = {}
for k in keys:
    seen[k] = seen.get(k, 0) + 1
for k, n in seen.items():
    if n > 1:
        print(" DUP", k, n)
print("ok unique", sum(1 for n in seen.values() if n == 1))
