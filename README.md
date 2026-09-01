# 3D Case Simulator

**GitHub repo:** [`ThomasE11/3d-case-simulator`](https://github.com/ThomasE11/3d-case-simulator)
**Live:** https://app-three-gamma-88.vercel.app
**Local path:** `~/Projects/app`

This is the **3D UAE paramedic case simulator**. Students enter a scene, examine a 3D patient, apply treatments, and get a clinical debrief. It is a training sim, not a protocol handbook and not a course LMS.

## This is not the other two products

| Product | Repo | What it is |
| --- | --- | --- |
| **3D Case Simulator (this repo)** | [`3d-case-simulator`](https://github.com/ThomasE11/3d-case-simulator) | Live 3D patient, monitor, and treatment bay |
| EMS Training Studio | [`ems-training-studio`](https://github.com/ThomasE11/ems-training-studio) | HCT LMS: modules, PCR, skills tracking, student accounts |
| Pocket Paramedic | [`pocket-paramedic`](https://github.com/ThomasE11/pocket-paramedic) | Mobile clinical protocols / assessment guide (PWA) |

If you opened this repo looking for protocols, go to [`pocket-paramedic`](https://github.com/ThomasE11/pocket-paramedic). If you want the student LMS, go to [`ems-training-studio`](https://github.com/ThomasE11/ems-training-studio).

## Stack

React + TypeScript + Vite, Three.js / React Three Fiber, Tailwind + shadcn/ui, Supabase, i18next (English + Arabic).

## Run locally

```bash
cd ~/Projects/app
npm install
npm run dev
```

Dev server is Vite (port 5173, or 5174 if 5173 is taken).

```bash
npm run check      # typecheck + lint + tests + case audits
npm test
npm run build
```

Owner: Elias Thomas (`elias@twetemo.com`).
