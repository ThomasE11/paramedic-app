from pathlib import Path
import re

t = Path("/Users/eliastlcthomas/Projects/app/src/lib/sceneImageSelection.ts").read_text()
block = t.split("export const PROMPT_SCENE_IMAGE_OVERRIDES")[1].split("CURRENT_CONTEXT_OVERRIDES")[0]
keys = re.findall(r"'([a-z0-9-]+)':\s*'/scene-assets/", block)
seen = {}
for k in keys:
    seen[k] = seen.get(k, 0) + 1
print("PROMPT keys", len(keys), "unique", len(seen))
for k, n in seen.items():
    if n > 1:
        print(f"DUP {k} x{n}")
