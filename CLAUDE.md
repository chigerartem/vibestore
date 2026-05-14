# CLAUDE.md

Guidance for AI agents working in this repository. Human-facing docs live in `README.md`.

## What this is

An npm-workspaces monorepo: `backend/` (Express 5 + TypeScript) and `frontend/`
(React + Vite + TypeScript + Tailwind v4). Tests run on Vitest.

## Commands (from the repo root)

- `npm run dev` — backend (:3001) and frontend (:5173) together
- `npm test` — all tests
- `npm run lint` · `npm run typecheck` · `npm run build`

## Where things go

- `backend/src/app.ts` — `createApp()` builds the Express app (no `listen`); tests import it from here.
- `backend/src/index.ts` — starts the server; nothing else belongs here.
- `backend/src/routes/<feature>.ts` — one router per feature, mounted in `app.ts`.
- `backend/src/lib/store.ts` — the data layer; in-memory by default.
- `frontend/src/App.tsx` — root component. `frontend/src/lib/api.ts` — the only place that talks to the API.
- Tests are co-located: `foo.ts` → `foo.test.ts`.

## Conventions

- TypeScript strict; extensionless imports.
- Backend: throw on error — Express 5 forwards it to the handler in `app.ts`. Don't wrap everything in try/catch.
- Backend: route handlers with URL params — type them `Request<{ id: string }>`; Express 5 types raw `req.params` values as `string | string[]`.
- Frontend: all network calls go through `api` in `lib/api.ts`; style with Tailwind classes.
- Commits: `feat:` / `fix:` / `test:` / `chore:` / `docs:` — small and meaningful.
- Build only what the task asks for — no speculative features, abstractions, or handling of cases that cannot happen.
- Need persistence? `npm install better-sqlite3 @types/better-sqlite3 -w backend` (installs in seconds) — see the note in `backend/src/lib/store.ts`.
