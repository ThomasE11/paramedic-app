# ParaMedic Studio — gameplay north star (Elias 11 Sep 2026)

## Direction
The **patient treatment interface** should feel increasingly like a game bay, not a static slideshow:
- Enter / orient in the scene (look around)
- Read the environment (MVC must look like a real crash with real 3D vehicles/props)
- Interact with patient (pose, lift/move, examine)
- Interact with kit over time (pick equipment, apply on body) — bag-opening UI is later; keep treatment search/apply solid now

## Near-term (continuous build + deploy)
1. Pose/scene honesty (general-001 legs elevated, P0 pose list in pose-staging-honesty audit)
2. Patient appearance realism (skin, masks, wounds, cyanosis) with independent blender-eval PASS/FAIL
3. Scene authenticity: Blender-authored or license-clean sourced meshes in `assets/medical-3d/` + ATTRIBUTION.md — especially roadside/MVC cars, chairs, beds
4. Prefer deepening Body3D/SceneVariant toward orbit/look + prop interaction hooks over one-off fakes

## Explicitly later
- Full walk-in room gameplay
- Opening physical bag models in-bay

## Never
- Placeholder “car-shaped box” for MVC when we can source/bake real vehicles
- Stopping at request-review while scenes still lie
