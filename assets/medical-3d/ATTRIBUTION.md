# Medical 3D asset attribution

Place downloaded free/CC medical meshes, appliances, and props in this folder (or clear subfolders). Record every asset below before merge.

Signup for free platforms (if required): elias@twetemo.com — no paid spend without operator approval.

| File / folder | Source URL | License | Author | Downloaded | Notes |
|---------------|------------|---------|--------|------------|-------|
| in-engine chairs / bed / stretcher | `src/components/Body3DModel/Environment/` | original | ParaMedic Studio | 2026-09-11 | Procedural geometry, no third-party mesh |
| `kenney-furniture-kit/` | https://kenney.nl/assets/furniture-kit | CC0 1.0 | Kenney | 2026-09-11 | Non-clinical props only. Extracted GLBs: chair, chairCushion, chairDesk, chairRounded, loungeChair, loungeChairRelax, loungeSofa, loungeSofaLong, bedSingle, bedDouble. Runtime copies: `public/models/props/kenney-chair.glb`, `kenney-lounge-chair.glb`, `kenney-desk-chair.glb`, `kenney-cushion-chair.glb`. Seated patients plant via `kenneyChairPlant` (adult sit height 0.53 m). |
| `kenney-car-kit/` | https://kenney.nl/assets/car-kit | CC0 1.0 | Kenney | 2026-09-11 | MVC roadside. Extracted: sedan, ambulance, hatchback-sports, debris-door, debris-bumper, debris-tire, cone + colormap.png. Runtime: `public/models/props/kenney-sedan.glb`, `kenney-debris-*.glb`, `Textures/colormap.png`. |
