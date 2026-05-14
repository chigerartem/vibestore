# VibeStore

A centralized repository where a team logs project resources (name + description) and gets
an instant, AI-simulated **Vibe Check** on project health. On save, the backend auto-tags each
resource with a `sentiment` (mock AI, derived from the description) while the user picks the
`priority`; a separate endpoint aggregates those tags into an overall status. Built as an
npm-workspaces monorepo — a REST API (Express) plus a React SPA.

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
| `npm run test:coverage -w backend` | backend tests with a coverage report (utility/logic kept ≥ 80%) |

## Layout

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
| POST | `/api/resources` | Create a resource. Body `{ "name": string, "description": string, "priority": "low" \| "medium" \| "high" }`. Returns `201` with the created `Resource` (mock-AI `sentiment` attached). `400` on invalid body. |
| GET | `/api/resources` | List all resources — `200` with `Resource[]`. |
| DELETE | `/api/resources/:id` | Delete a resource — `204` on success, `404` if the id is unknown. |
| GET | `/api/vibe-check` | Aggregate health across all resources — `200` with a `VibeCheck`. |

**`Resource`** — `{ id, name, description, sentiment, priority, createdAt }`
where `sentiment` is `positive \| neutral \| negative` and `priority` is `low \| medium \| high`.

**`VibeCheck`** — `{ total, sentimentCounts, priorityCounts, status, headline }`
where `status` is `Quiet \| Buzzing \| Steady \| Needs attention` and `headline` is a one-line summary.

### Mock AI logic

`sentiment` is the mock-AI tag — `backend/src/lib/vibe.ts` derives it deterministically from
the description (no external AI call) by weighing positive vs. negative keywords found in the
text. `priority` is **not** computed: the user picks it on the form, and it flows through onto
the stored resource and into the aggregate `VibeCheck` counts.

## Testing

- **Backend unit** — `backend/src/lib/vibe.test.ts` covers the mock-AI sentiment + summary logic.
- **Backend integration** — `backend/src/routes/resources.test.ts` verifies the POST → GET
  cycle, the DELETE path, and the `400` / `404` error paths with supertest.
- **Frontend component** — `frontend/src/App.test.tsx` covers the load/empty state, the
  add-resource flow, and the delete flow.
- `npm run test:coverage -w backend` enforces an 80% threshold on `backend/src/lib`
  (the utility/logic) — currently 100%.
