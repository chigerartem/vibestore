<div align="center">

<h1>VibeStore</h1>

**Log project resources and get an instant, AI-simulated read on project health — a tested, full-stack prototype in one repo.**

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/tested_with-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![CI](https://github.com/chigerartem/vibestore/actions/workflows/ci.yml/badge.svg)](https://github.com/chigerartem/vibestore/actions/workflows/ci.yml)

**English** · [Русский](README.ru.md)

</div>

---

## What is this

**VibeStore** is a small full-stack app where a team logs project resources (a name and a
description) and gets an instant, AI-simulated **Vibe Check** on overall project health.

When you save a resource, the backend runs a mock-AI pass over the description and auto-tags it
with a **sentiment** (`positive` / `neutral` / `negative`) and a **priority** (`low` / `medium` /
`high`). A separate endpoint aggregates those tags across everything in the store and returns a
single read on the room — a status and a one-line headline.

It's built as an npm-workspaces monorepo with a clean client/server split: a REST API on Express
and a React single-page app, each independently tested and type-checked.

## Features

- 🧠 **Mock-AI tagging** — sentiment + priority are derived deterministically from the description; no external API, no keys, fully testable.
- 📊 **Aggregate Vibe Check** — one endpoint rolls every resource up into a status (`Quiet` / `Buzzing` / `Steady` / `Needs attention`) and a human-readable headline.
- 🧱 **Clean architecture** — pure logic (`lib/`) is separated from transport (`routes/`); the frontend talks to the backend through a single `api` module.
- ⚡ **One-command dev** — `npm run dev` runs the API and the SPA together; the frontend proxies `/api/*`, so there's no CORS to configure.
- 🧪 **Tested core** — unit tests for the mock-AI logic, an integration test over the full POST → GET cycle, and a frontend component test; backend logic kept ≥ 80% covered (currently 100%).
- 🎨 **Polished UI** — a responsive Tailwind v4 dashboard with subtle, reduced-motion-aware micro-interactions.
- 🚦 **CI on every push** — GitHub Actions runs lint → typecheck → test → build.

## How the mock AI works

`sentiment` and `priority` are computed in [`backend/src/lib/vibe.ts`](backend/src/lib/vibe.ts) —
pure functions, no network call, so they're trivial to unit-test:

- **sentiment** — the balance of positive vs. negative keywords found in the description.
- **priority** — `high` if the text contains urgency keywords or is very long (> 200 chars),
  `medium` if moderately long (> 80 chars), otherwise `low`.

Swapping this for a real LLM later is a one-file change: the routes only depend on the function
signature, not on how the tags are produced.

## Stack

- **Backend** — Express 5 + TypeScript (run with `tsx`), Zod for request validation
- **Frontend** — React 19, Vite, TypeScript, Tailwind CSS v4
- **Tests** — Vitest, with supertest (backend) and React Testing Library (frontend)
- **Tooling** — ESLint, Prettier, GitHub Actions CI

## Quick start

Requires Node.js 20+.

```bash
npm install      # installs both workspaces
npm run dev      # backend on :3001, frontend on :5173
```

In dev the frontend proxies `/api/*` to the backend, so there is no CORS setup. Open
http://localhost:5173.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | run backend and frontend together |
| `npm test` | run all tests |
| `npm run lint` | ESLint across the repo |
| `npm run typecheck` | type-check both packages |
| `npm run build` | production build of both packages |
| `npm run test:coverage -w backend` | backend tests with a coverage report (utility/logic kept ≥ 80%) |

## Project layout

```
backend/
  src/
    app.ts            createApp() — wires middleware + routers (no listen)
    index.ts          starts the server
    lib/
      vibe.ts         mock-AI logic: analyzeVibe + summarizeVibe (pure, unit-tested)
      store.ts        in-memory resource store
    routes/
      resources.ts    POST/GET/DELETE /resources, GET /vibe-check
      health.ts       GET /health
frontend/
  src/
    App.tsx           root — owns state, fetches on mount, refetches after a write
    lib/api.ts        the only module that talks to the backend
    components/       ResourceForm · ResourceList · VibeCheck · Reveal
```

## API

Base prefix `/api`, JSON in and out. Errors are returned as `{ "error": "<message>" }`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Liveness check — returns `{ "status": "ok", "timestamp": "<ISO>" }` |
| POST | `/api/resources` | Create a resource. Body `{ "name": string, "description": string }`. Returns `201` with the created `Resource` (mock-AI `sentiment` + `priority` attached). `400` on invalid body. |
| GET | `/api/resources` | List all resources — `200` with `Resource[]`. |
| DELETE | `/api/resources/:id` | Delete a resource — `204` on success, `404` if the id is unknown. |
| GET | `/api/vibe-check` | Aggregate health across all resources — `200` with a `VibeCheck`. |

**`Resource`** — `{ id, name, description, sentiment, priority, createdAt }`
where `sentiment` is `positive | neutral | negative` and `priority` is `low | medium | high`.

**`VibeCheck`** — `{ total, sentimentCounts, priorityCounts, status, headline }`
where `status` is `Quiet | Buzzing | Steady | Needs attention` and `headline` is a one-line summary.

## Testing

- **Backend unit** — [`backend/src/lib/vibe.test.ts`](backend/src/lib/vibe.test.ts) covers the mock-AI sentiment + summary logic.
- **Backend integration** — [`backend/src/routes/resources.test.ts`](backend/src/routes/resources.test.ts) verifies the POST → GET cycle, the DELETE path, and the `400` / `404` error paths with supertest.
- **Frontend component** — [`frontend/src/App.test.tsx`](frontend/src/App.test.tsx) covers the load/empty state, the add-resource flow, and the delete flow.
- `npm run test:coverage -w backend` enforces an 80% threshold on `backend/src/lib` (the utility/logic) — currently 100%.

## License

MIT — see [LICENSE](LICENSE).
