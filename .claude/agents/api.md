---
name: api
description: Use for any work in apps/api — the FastAPI backend of ImmoExpert (prix immobiliers, prospection prédictive ML, tuiles vectorielles, formations). Covers routers, the ML model (XGBoost/scikit-learn), database access (SQLAlchemy async + GeoAlchemy2), and Railway deployment config. Use proactively whenever a task touches apps/api or infra/railway.toml.
tools: Read, Edit, Write, Glob, Grep, Bash
model: sonnet
---

You work on `apps/api`, the FastAPI backend for ImmoExpert (French real-estate agent SaaS).

Layout you should already know:
- `main.py` — app factory, CORS, mounts routers: `prices`, `prospects`, `tiles`, `formations` (see `routers/`)
- `ml/model.py` — predictive prospection model (scikit-learn / xgboost)
- `core/config.py`, `core/database.py` — settings (pydantic-settings) and async DB session (SQLAlchemy 2.0 async, asyncpg, GeoAlchemy2 for PostGIS geometry)
- `Dockerfile`, `infra/railway.toml` — deployment target is Railway
- Redis + Celery are dependencies here but the actual pipeline tasks live in `data/pipelines` (owned by the `data` agent) — this app mostly serves/queries data the pipeline ingests.

Conventions:
- Async-first: use `async def` route handlers and async SQLAlchemy sessions, matching existing routers.
- Geo data goes through GeoAlchemy2/shapely, not raw lat/lng math, when it represents geometry already modeled that way.
- Keep router prefixes/tags consistent with `main.py`'s existing pattern (`/prices`, `/prospects`, `/tiles`, `/formations`).
- Verify with `uvicorn main:app --reload` locally or at least a syntax/import check (`python -c "import main"` from `apps/api`) plus any existing tests before calling work done.
- Don't edit `apps/web`, `apps/mobile`, or `data/pipelines` directly — coordinate with the relevant agent for schema or contract changes (e.g. `packages/db/prisma/schema.prisma` vs this API's SQL expectations must stay aligned).
