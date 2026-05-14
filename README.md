# VibeStore

A centralized repository where a team logs project resources (name + description) and gets
an instant, AI-simulated **Vibe Check** on project health. On save, the backend tags each
resource with a `sentiment` and `priority` derived from its description; a separate endpoint
aggregates those tags into an overall status. Built as an npm-workspaces monorepo —
a REST API (Express) plus a React SPA.

## Stack

- **Backend:** Express 5, TypeScript (run with `tsx`)
- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4
- **Tests:** Vitest — with supertest (backend) and React Testing Library (frontend)

## Quick start

Requires Node.js 20+.

```bash
npm install      # installs both workspaces
npm run dev      # backend on :3001, frontend on :5173
```

In dev the frontend proxies `/api/*` to the backend, so there is no CORS setup.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | run backend and frontend together |
| `npm test` | run all tests |
| `npm run lint` | ESLint across the repo |
| `npm run typecheck` | type-check both packages |
| `npm run build` | production build of both packages |

## Layout

```
backend/    REST API (Express + TypeScript)
frontend/   SPA (React + Vite + TypeScript + Tailwind)
```

## API

Base prefix `/api`, JSON in and out. Errors are returned as `{ "error": "<message>" }`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Liveness check — returns `{ "status": "ok", "timestamp": "<ISO>" }` |
| POST | `/api/resources` | Create a resource. Body `{ "name": string, "description": string }`. Returns `201` with the created `Resource` (mock-AI `sentiment` + `priority` attached). `400` on invalid body. |
| GET | `/api/resources` | List all resources — `200` with `Resource[]`. |
| GET | `/api/vibe-check` | Aggregate health across all resources — `200` with a `VibeCheck`. |

**`Resource`** — `{ id, name, description, sentiment, priority, createdAt }`
where `sentiment` is `positive \| neutral \| negative` and `priority` is `low \| medium \| high`.

**`VibeCheck`** — `{ total, sentimentCounts, priorityCounts, status, headline }`
where `status` is `Quiet \| Buzzing \| Steady \| Needs attention` and `headline` is a one-line summary.

### Mock AI logic

`sentiment` and `priority` are computed deterministically from the description by
`backend/src/lib/vibe.ts` — no external AI call:

- **sentiment** — balance of positive vs. negative keywords found in the text.
- **priority** — `high` if it contains urgency keywords or is very long (>200 chars),
  `medium` if moderately long (>80 chars), otherwise `low`.
