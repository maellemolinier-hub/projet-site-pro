# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

ImmoExpert is a French real-estate SaaS monorepo: property price data (DVF —
"Demandes de Valeurs Foncières", France's open transaction dataset), predictive
prospecting for agents, e-learning/certification, and an embeddable widget for
agency websites. Pnpm/Turborepo workspace with three apps and two shared
packages, plus a separate Python data layer.

- `apps/web` — Next.js 15 (App Router, React 19) main SaaS app, marketing site,
  dashboard, and embeddable widget. Deployed to Vercel.
- `apps/api` — FastAPI service serving price/prospect/tile/formation data.
  Deployed to Railway (Docker).
- `apps/mobile` — Expo Router app for field prospecting (map + prospect list).
- `packages/db` — Prisma schema + generated client, shared by `apps/web`
  (TypeScript) — the Python API does **not** use Prisma, it queries the same
  Postgres tables directly with raw SQL (see below).
- `packages/types` — shared TypeScript types.
- `data/pipelines` — Celery tasks that ingest DVF data and retrain the ML
  scoring model. Deployed as separate Railway services (`celery-worker`,
  `celery-beat`), not part of the pnpm workspace.
- `infra/`, `data/sql/` — Supabase/Postgres setup and indexes (PostGIS).

## Commands

All JS/TS commands run from the repo root via Turborepo/pnpm filters unless noted.

```bash
pnpm install                          # install all workspace deps
pnpm dev                              # turbo dev (all apps, web only really needs this)
pnpm build                            # turbo build
pnpm lint                             # turbo lint (next lint in apps/web)
pnpm --filter @immoexpert/web exec tsc --noEmit   # type-check web (what CI runs)
pnpm format                           # prettier --write across the repo
```

Single app dev servers:

```bash
pnpm --filter @immoexpert/web dev     # Next.js on :3000
pnpm --filter @immoexpert/mobile start
```

Prisma (`packages/db`, run via pnpm filter):

```bash
pnpm --filter @immoexpert/db exec prisma generate
pnpm --filter @immoexpert/db db:push       # push schema without migration (dev)
pnpm --filter @immoexpert/db db:migrate    # prisma migrate dev
pnpm --filter @immoexpert/db db:studio
pnpm --filter @immoexpert/db exec prisma migrate deploy  # what CI runs on main
```

Python API (`apps/api`, run from that directory):

```bash
cd apps/api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
ruff check apps/api --ignore E501       # what CI runs (from repo root)
```

Celery pipelines (`data/pipelines`, run from repo root so the `data.pipelines.*`
module path resolves, matching Railway's `startCommand`s):

```bash
celery -A data.pipelines.celery_app worker --loglevel=info -Q dvf,default
celery -A data.pipelines.celery_app beat --loglevel=info
```

**There is no test suite in this repo** (no jest/vitest/pytest config, no
`*.test.*`/`*.spec.*`/`test_*.py` files). CI (`.github/workflows/deploy.yml`)
only runs type-checking, `next lint`, and `ruff`.

## Architecture

### Data flow: TypeScript writes via Prisma, Python reads via raw SQL

The Postgres schema is defined once in `packages/db/prisma/schema.prisma` and
migrated via Prisma. `apps/web` is the only consumer that uses the Prisma
client (`@immoexpert/db`'s `db` export). `apps/api` (Python/SQLAlchemy) talks
to the **same tables** with hand-written SQL using the Prisma-generated
column names verbatim (e.g. `"pricePerSqm"`, `"saleDate"`, quoted camelCase —
see `apps/api/routers/prices.py`, `prospects.py`, `tiles.py`). When changing
`PricePoint` or other models touched by the API, the raw SQL in those routers
must be updated by hand — there is no shared ORM layer between the two
languages. `data/pipelines/tasks/daily_refresh.py` writes into `PricePoint`
using the same convention.

### DVF ingestion pipeline

`data/pipelines/celery_app.py` defines three scheduled jobs (Europe/Paris tz):
- Nightly (3am): `refresh_dvf_batch` processes a rotating ~15-department batch
  (`DEPARTMENT_BATCHES` in `daily_refresh.py`, 7 batches, full France coverage
  every 7 days).
- Monthly (1st, 2am): `refresh_all_france` reloads the full annual DVF file for
  all 101 départements (96 métropole + 5 DOM: 971/972/973/974/976).
- Weekly (Sunday, 4am): `ml_retrain.retrain_model`.

Source data comes from `https://files.data.gouv.fr/geo-dvf/latest/csv`.
`apps/api/main.py` exposes `/admin/*` endpoints (guarded by `X-Admin-Secret`)
that enqueue these same Celery tasks on demand, and `vercel.json` also has a
Vercel cron (`/api/cron/dvf-refresh`) hitting the web app, which presumably
proxies to these. Celery worker/beat run as separate Railway services
(`infra/railway.toml`), not colocated with the FastAPI process.

### Predictive scoring (`apps/api/ml/model.py`)

`predict_sale_probability()` loads an XGBoost model pickle
(`sale_probability_model.pkl`) trained by `train_model()` if present, and
falls back to `_heuristic_score()` (rule-based on years-owned + local price
trend) when no trained model exists yet. `routers/prospects.py`'s
`/prospects/scan` endpoint builds features (years owned, local avg price/sqm,
6-month price trend from a lateral join) per candidate `PricePoint` and
filters/sorts by the returned score.

### Web app structure (`apps/web`)

- `app/(dashboard)/*` — authenticated agent dashboard (prospects, rapports,
  parametres, carte, expert, formation); gated by `middleware.ts`, which
  redirects unauthenticated requests to `/connexion` for any `/dashboard*`
  path.
- `app/widget/carte` + `app/api/widget/[token]` — embeddable, iframe-able map
  widget for agency websites, keyed by `Agency.widgetToken`/
  `ExpertProfile.widgetToken`; `vercel.json` sets permissive CORS/frame headers
  scoped to `/widget/*` and `/api/widget/*` only.
- `app/experts/[slug]` — public expert directory pages (`ExpertProfile` model).
- `app/api/auth/[...nextauth]` + `lib/auth.ts` — NextAuth v5, JWT sessions,
  Credentials (bcrypt against `User.passwordHash`) + Google OAuth providers,
  Prisma adapter.
- `app/api/checkout`, `app/api/billing-portal`, `app/api/webhooks/stripe` +
  `lib/stripe.ts` — Stripe subscription billing (`Subscription` model, plans
  STARTER/EXPERT/AGENCE_PRO/ENTERPRISE).
- `components/map` — MapLibre GL + Deck.gl layers, also consumed by the widget
  and dashboard `carte` views. `routers/tiles.py` serves MVT vector tiles this
  layer renders directly.
- `app/api/auth/mobile-login` — a separate token-issuing endpoint for the Expo
  app (which can't use NextAuth's cookie-based session flow).

### Mobile app (`apps/mobile`)

Expo Router (`app/(tabs)/*`: index, carte, prospects, profil) with business
logic under `src/` (screens, hooks, zustand store, `src/lib/api.ts` axios
client hitting the FastAPI service directly via `EXPO_PUBLIC_API_URL`, not the
Next.js app). Does not consume `packages/db` or `packages/types` (no shared
workspace dependency declared in `apps/mobile/package.json`).

### Deployment topology

- `apps/web` → Vercel (`vercel.json`: custom build/install commands `cd ../..`
  back to repo root since Vercel's root is `apps/web`; also proxies
  `/api/geo/*` to `api.immoexpert.fr`).
- `apps/api` + Celery worker/beat → Railway, all three services built from
  `apps/api/Dockerfile` but with different `startCommand`s
  (`infra/railway.toml`).
- Prisma migrations are deployed as a separate CI job (`migrate`) that runs
  only after the web deploy succeeds, on `main`.
- CI (`.github/workflows/deploy.yml`) runs on push to `main` (and the
  `claude/realestate-pricing-tool-strategy-syf8am` branch) and on PRs into
  `main`; only pushes to `main` trigger the deploy/migrate jobs.

## Known inconsistencies (don't "fix" without checking intent first)

- `apps/web/next.config.ts` and `tailwind.config.ts` reference a
  `@immoexpert/ui` workspace package that does not exist under `packages/` —
  a dead/aspirational reference, not a bug to silently remove.
- Two ML models exist and are **not** wired together:
  `apps/api/ml/model.py` (`predict_sale_probability`, sale-probability
  classifier used by `/prospects/scan`) reads from
  `apps/api/ml/sale_probability_model.pkl`, while
  `data/pipelines/tasks/ml_retrain.py`'s weekly job trains an `XGBRegressor`
  for price-per-sqm and saves to `/app/ml/model.pkl` — different task,
  different path, different model type.
- DVF refresh is triggered from two places that may overlap: Vercel's own
  cron (`vercel.json` → `/api/cron/dvf-refresh`, daily 03:00) and Celery
  Beat's `dvf-nightly-batch` (`data/pipelines/celery_app.py`, also daily
  03:00 Europe/Paris).
- `data/pipelines/dvf_ingest.py` is an older standalone script writing to a
  lowercase `price_points` table — inconsistent with the Prisma-driven
  `"PricePoint"` camelCase schema everything else uses; it appears superseded
  by `tasks/daily_refresh.py`.
- `apps/api/routers/formations.py` returns hardcoded data, not reads from the
  `Course`/`Certification`/`CourseProgress` Prisma tables that already model
  this domain.
- `data/sql/indexes.sql` and `infra/supabase-setup.sql` define near-duplicate
  PostGIS indexes — check both if changing index strategy.
- `apps/web` has no committed ESLint config, so `next lint` / `pnpm lint`
  prompts interactively to create one instead of actually linting; CI's
  `lint` job only runs `tsc --noEmit`, not `pnpm lint`, so this has gone
  unnoticed.
