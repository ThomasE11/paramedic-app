# ParaMedic Studio (3D case simulator)

**GitHub repo:** [`ThomasE11/paramedic-app`](https://github.com/ThomasE11/paramedic-app)
**Live:** https://app-three-gamma-88.vercel.app
**Local path:** `~/Projects/app`

This is the **3D UAE paramedic case simulator**. Students enter a scene, examine a 3D patient, apply treatments, and get a clinical debrief. It is a training sim, not a protocol handbook and not a course LMS.

## This is not the other two products

| Product | Repo | What it is |
| --- | --- | --- |
| **ParaMedic Studio (this repo)** | [`paramedic-app`](https://github.com/ThomasE11/paramedic-app) | 3D case simulator with a live patient, monitor, and treatment bay |
| EMS Training Studio | [`paramedic-studio`](https://github.com/ThomasE11/paramedic-studio) | HCT LMS: modules, PCR, skills tracking, student accounts |
| Pocket Paramedic | [`remedy-road`](https://github.com/ThomasE11/remedy-road) | Mobile clinical protocols / assessment guide (PWA) |

If you opened this repo looking for protocols, go to [`remedy-road`](https://github.com/ThomasE11/remedy-road). If you want the student LMS, go to [`paramedic-studio`](https://github.com/ThomasE11/paramedic-studio).

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
