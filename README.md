# Sentinel Support — Fintech Transaction Alert System

A full-stack support console where admins ingest customer transaction batches (CSV/JSON),
the backend scores each transaction against that customer's historical behaviour using a
**rank-order algorithm**, and significant deviations become **alerts** that support agents
triage and resolve (freeze card, open dispute, mark false positive) — with every action
audited, rate-limited, PII-redacted, and observable.

This is a scoped-down, honest build: it keeps the engineering spine
(ingestion → scoring → alerts → triage → audit) and deliberately drops any multi-agent
LLM layer.

## Architecture

```
                  ┌──────────────┐      ┌──────────────────────────────┐
  CSV / JSON ───▶ │  POST /api/  │ ───▶ │  ingest: dedupe + idempotency │
                  │   ingest     │      │  → rank-order scoring         │
                  └──────────────┘      │  → alerts (score ≥ threshold) │
                                        └──────────────┬───────────────┘
   ┌──────────────┐   read APIs (keyset)               │
   │  web (React) │ ◀──────────────────────────────────┤
   │  /alerts     │   GET /api/alerts, /transactions    │
   │  /customer   │   POST /api/action/*  (X-API-Key)   ▼
   └──────────────┘                          ┌────────────────────┐
                                             │ Postgres (Prisma)  │
        Redis ── idempotency · rate limit    │ + case_events audit│
                                             └────────────────────┘
```

## Tech stack

| Layer        | Technology                                   |
|--------------|----------------------------------------------|
| Frontend     | React + TypeScript + Vite + Tailwind CSS     |
| Backend      | Node.js + Express + TypeScript (strict, Zod) |
| Database     | PostgreSQL via Prisma                         |
| Cache/Queue  | Redis (idempotency + rate limiting)          |
| Infra        | Docker Compose (postgres + redis + api + web)|

## Repo layout

Independent packages (each self-contained with its own lockfile), orchestrated from the root.

```
.
├── api/        # Express + Prisma backend   (was: server/)
├── web/        # React + Vite frontend      (was: client/)
├── fixtures/   # known-fraud / known-legit / sample batches
├── scripts/    # data generator, seed, eval harness
├── http/       # sentinel.http — HTTP collection for every endpoint
├── .env.example
└── package.json  # root orchestration scripts (npm --prefix)
```

> **Note:** `web/` and `api/` were previously named `client/` and `server/`; renamed via
> `git mv` to match the project brief (history preserved).

## Quick start

```bash
# 1. install both packages
npm run install:all

# 2. configure env (copy template, set DATABASE_URL / REDIS_URL)
cp .env.example api/.env

# 3. apply migrations, then run api + web
npm run migrate
npm run dev:api    # in one terminal
npm run dev:web    # in another
```

> Docker Compose (one-command bring-up) lands once the `api` and `web` images are built;
> until then, run the two `dev:*` scripts above against a local Postgres + Redis.

## Root scripts

| Script                 | What it does                                      |
|------------------------|---------------------------------------------------|
| `npm run install:all`  | Install deps in `api` and `web`                   |
| `npm run dev:api`      | Start the API in watch mode                       |
| `npm run dev:web`      | Start the Vite dev server                         |
| `npm run build`        | Typecheck + build both packages                   |
| `npm run migrate`      | `prisma migrate dev` in `api`                     |
| `npm run seed`         | Seed customers/cards/accounts/alerts *(Step 9)*   |
| `npm run eval`         | Precision/recall eval of the scoring algo *(Step 10)* |

## Build order

1. Schema + Prisma migrations
2. Ingestion endpoint (idempotency + dedupe)
3. Scoring wired into ingestion → alerts
4. Read APIs (keyset pagination)
5. Alerts route + triage drawer
6. Action endpoints + audit logging
7. Customer detail page
8. Metrics + structured logs + rate limiting + PII redaction
9. Fixtures + seed scripts
10. Eval harness
