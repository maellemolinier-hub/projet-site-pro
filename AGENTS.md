# ImmoExpert

French real-estate valuation SaaS. pnpm + Turborepo monorepo:

- `apps/web` — Next.js 15 / React 19 dashboard (the primary product). Port 3000.
- `apps/api` — Python 3.11 FastAPI + SQLAlchemy(async) + PostGIS price/prospect/tiles API. Port 8000.
- `apps/mobile` — Expo / React Native app (optional; not needed for web testing).
- `packages/db` — Prisma schema + client (`@immoexpert/db`). `packages/ui`, `packages/types` — shared source.
- `data/pipelines` — Celery DVF ingestion / ML (optional).

## Cursor Cloud specific instructions

The update script (run on startup) only refreshes dependencies: `pnpm install`, Prisma client generate, and the API Python venv at `apps/api/.venv`. Everything below (services, DB bootstrap) must be started/verified manually per session.

### Environment files (non-obvious — read this first)
There are **two** env files, and they are NOT interchangeable:

- Root `/workspace/.env` is consumed **only** by `apps/api` (FastAPI reads `../../.env` via pydantic `BaseSettings`). That Settings model **forbids extra keys**, so this file must contain *only* `DATABASE_URL`, `REDIS_URL`, `API_SECRET`, `ENVIRONMENT`. The API uses the SQLAlchemy asyncpg driver, so its `DATABASE_URL` must be `postgresql+asyncpg://...` (different from Prisma's).
- `apps/web/.env.local` is what the **web app** uses. Next.js auto-loads env from the app dir (`apps/web`), **not** the repo root. Prisma uses the plain `postgresql://...` URL here.

Both files are git-ignored. If they are missing after a fresh clone, recreate them (see git history of this setup / `.env.example` for the full key list).

### Local services (start each session)
Postgres and Redis are installed as system packages but are not auto-started:

```
sudo pg_ctlcluster 16 main start
sudo service redis-server start
```

DB role/db used locally: role `immoexpert` / password `immoexpert` / database `immoexpert` (superuser, so PostGIS RLS is bypassed). PostGIS + `uuid-ossp` extensions are required and already enabled in the local DB.

### Database bootstrap (only if the DB is empty)
```
DATABASE_URL="postgresql://immoexpert:immoexpert@localhost:5432/immoexpert" pnpm --filter @immoexpert/db run db:push
PGPASSWORD=immoexpert psql -h localhost -U immoexpert -d immoexpert -f infra/supabase-setup.sql   # MVT function, spatial indexes, views
PGPASSWORD=immoexpert psql -h localhost -U immoexpert -d immoexpert -f data/sql/seed.sql            # 32 DVF price points + courses
```

### Run the services
- Web: `pnpm --filter @immoexpert/web dev` (port 3000).
- API: must run **from `apps/api`** with the repo root on `PYTHONPATH` (the admin routes import `data.pipelines`) and the async DB URL:
  ```
  cd apps/api
  DATABASE_URL="postgresql+asyncpg://immoexpert:immoexpert@localhost:5432/immoexpert" PYTHONPATH=/workspace \
    .venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
  ```
- Redis is only needed for the Celery/admin DVF-refresh paths; the web app and read API endpoints work without it.

### Lint / typecheck / build
- `pnpm lint` (root, `next lint`) is **broken/interactive**: `apps/web` ships no ESLint config, so it prompts and fails in non-TTY. CI does not use it. Use the CI-authoritative checks instead:
  - Web typecheck: `pnpm --filter @immoexpert/web exec tsc --noEmit`
  - API lint: `apps/api/.venv/bin/ruff check apps/api --ignore E501`
- Web build: `pnpm --filter @immoexpert/web build` (runs `prisma generate` then `next build`).

### Known pre-existing bugs (app code, not environment)
Do not treat these as setup failures:
- Sidebar/nav links point to `/dashboard/*`, but the dashboard pages live in the `(dashboard)` route group and resolve to `/carte`, `/formation`, `/parametres`, etc. `/dashboard/*` returns 404. Auth + session work correctly; navigate to the un-prefixed paths.
- `/parametres` shows hardcoded placeholder profile data ("Sophie Martin").
- API geo endpoints `/prices/zone`, `/prices/trend`, and `/tiles/{z}/{x}/{y}.mvt` return 500 under asyncpg's strict typing (missing `::numeric` / `::double precision` casts and an int-to-string interval concat). `/prices/street` and `/formations/courses` work and confirm PostGIS is healthy. The web price map (`/carte`) shows a "Failed to fetch" toast because of these.
