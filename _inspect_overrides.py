from pathlib import Path

p = Path("/Users/eliastlcthomas/Projects/app/src/lib/sceneImageSelection.ts")
t = p.read_text()
print("lines", t.count("\n") + 1, "bytes", p.stat().st_size)
for key in [
    "trauma-009",
    "litfl-019",
    "y1-023",
    "y1-001",
    "fall-002",
    "cardiac-005",
    "neuro-002",
    "staff-accommodation-collapse-sharjah.png",
]:
    print(f"has {key}: {key in t}")
start = t.find("export const PROMPT_SCENE_IMAGE_OVERRIDES")
end = t.find("const PATIENT_OVERLAY_SCENE_ASSETS")
print("==== PROMPT BLOCK ====")
print(t[start:end])
print("==== CURRENT_CONTEXT ====")
i = t.find("CURRENT_CONTEXT_OVERRIDES")
print(t[i : i + 1200])
