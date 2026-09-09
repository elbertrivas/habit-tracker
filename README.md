# Habit Tracker

A small habit/streak tracker. Add daily habits, check them off each day, and see your current and best streak per habit.

Built as part of Chromedia's "100% AI-built app" team exercise — tracked in Beacon under [TEST-261](https://beacon.chro.media/browse/TEST-261).

## Stack

- **Frontend:** Vite + React + TypeScript (`client/`)
- **Backend:** Express + SQLite (`server/`)

Self-contained monorepo — no external hosted service. Clone, install, run.

## Scope

- In: habit CRUD, daily check-in, streak counter, daily reminder banner
- Out: authentication/accounts (single shared dataset), custom habit frequency (daily-only), soft delete

## Getting started

Requires Node 20+.

```bash
npm install
npm run dev
```

This runs both the client (http://localhost:5173) and the server (http://localhost:3001) together. The client proxies `/api` requests to the server, so no CORS setup is needed in dev.

## Structure

```
client/   Vite + React + TypeScript app
server/   Express API + SQLite database (server/data/, gitignored)
```

## Scripts (from repo root)

- `npm run dev` — run client + server together
- `npm run lint` — lint/typecheck both workspaces
- `npm run build` — build both workspaces
