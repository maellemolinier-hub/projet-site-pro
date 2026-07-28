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

### Routing
Dashboard pages live under the real `app/dashboard/` segment, so all authenticated routes are `/dashboard`, `/dashboard/carte`, `/dashboard/formation`, `/dashboard/parametres`, etc. (matching the sidebar links and post-signup redirect). The public marketing site is at `/`, and `/experts`, `/connexion`, `/inscription` are public.

### Prédiction de marché par zone + agent d'indicateurs
- Modèles `ZoneIndicator` (indicateurs publics agrégés par commune, RGPD-safe) et `MarketIndicator` (séries nationales, ex. taux de crédit) dans `packages/db/prisma/schema.prisma`.
- Agent d'ingestion : `data/pipelines/tasks/indicators_refresh.py` (tâches Celery `refresh_communes` via `geo.api.gouv.fr`, `refresh_deaths`, `refresh_vacant_housing`, `refresh_credit_rate`). Les URLs des gros fichiers INSEE (décès, logements) sont surchargeables par env (`INSEE_DECES_URL`, `INSEE_LOGEMENTS_URL`) car millésimées. Pas de clé pour `geo.api.gouv.fr`.
- Pour peupler en dev : `refresh_communes` (référentiel + population) puis `psql ... -f data/sql/indicators_seed.sql` (valeurs de démo par ville).
- Endpoint : `GET /predict/zone?lat&lng&radius_m` → score 0–100 + détail des facteurs (moteur transparent `apps/api/ml/market_score.py`). Recalcul temps réel à chaque requête (DVF + indicateurs commune + taux crédit + saison).
- Mobile : l'écran Carte (`MapScreen`) appelle `/predict/zone`. Expo lit les URLs backend depuis `apps/mobile/.env` (git-ignoré) : `EXPO_PUBLIC_API_URL` / `EXPO_PUBLIC_WEB_URL`. Sur appareil Android physique, remplacer `localhost` par l'IP LAN.

### API geo queries (asyncpg strict typing)
The FastAPI geo endpoints run raw SQL through the asyncpg driver, which is strict about parameter/return types. When editing these queries keep the explicit casts:
- `ROUND(<double precision expr>::numeric, n)` (asyncpg has no `round(double precision, int)`).
- `make_interval(months => :months)` for int month intervals (do not concatenate ints into a text interval).
- Compare the `PropertyType` enum column via `"propertyType"::text = CAST(:param AS text)`.
- Grid-aggregate points with `ST_SnapToGrid(<geometry>, 0.001::double precision)` (the geometry overload), not on scalar lng/lat.
All endpoints (`/prices/zone`, `/prices/street`, `/prices/trend`, `/tiles/{z}/{x}/{y}.mvt`, `/formations/courses`) return data against the seeded DB; the web price map (`/dashboard/carte`) loads MVT tiles from `/tiles/*`.
