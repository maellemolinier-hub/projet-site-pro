import os
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from typing import List, Optional

from routers import prices, prospects, tiles, formations, predict


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    yield
    # shutdown


app = FastAPI(
    title="ImmoExpert API",
    version="0.1.0",
    description="API de données immobilières, prospection prédictive et formations",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://immoexpert.fr"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prices.router, prefix="/prices", tags=["Prix immobiliers"])
app.include_router(prospects.router, prefix="/prospects", tags=["Prospection prédictive"])
app.include_router(tiles.router, prefix="/tiles", tags=["Tuiles vectorielles"])
app.include_router(formations.router, prefix="/formations", tags=["Formations"])
app.include_router(predict.router, prefix="/predict", tags=["Prédiction marché"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}


class DVFRefreshRequest(BaseModel):
    departments: Optional[List[str]] = None  # None = France entière (101 depts)
    year: Optional[int] = None               # None = année N-1


def _get_celery():
    from data.pipelines.celery_app import app as celery_app
    return celery_app


def _require_admin(secret: str):
    expected = os.environ.get("ADMIN_SECRET", "")
    if not expected or secret != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.post("/admin/refresh-dvf", tags=["Admin"])
async def trigger_dvf_refresh(
    body: DVFRefreshRequest,
    x_admin_secret: str = Header(alias="X-Admin-Secret", default=""),
):
    """Lance refresh_dvf pour les départements demandés (tous si non précisé)."""
    _require_admin(x_admin_secret)
    try:
        task = _get_celery().send_task(
            "data.pipelines.tasks.daily_refresh.refresh_dvf",
            kwargs={"departments": body.departments, "year": body.year},
        )
        dept_count = len(body.departments) if body.departments else 101
        return {"status": "queued", "task_id": task.id, "departments": dept_count}
    except Exception as exc:
        return {"status": "error", "detail": str(exc)}


@app.post("/admin/refresh-all-france", tags=["Admin"])
async def trigger_full_france(
    body: DVFRefreshRequest,
    x_admin_secret: str = Header(alias="X-Admin-Secret", default=""),
):
    """Lance l'ingestion complète France entière (101 départements)."""
    _require_admin(x_admin_secret)
    try:
        task = _get_celery().send_task(
            "data.pipelines.tasks.daily_refresh.refresh_all_france",
            kwargs={"year": body.year},
        )
        return {"status": "queued", "task_id": task.id, "departments": 101}
    except Exception as exc:
        return {"status": "error", "detail": str(exc)}


@app.get("/admin/departments", tags=["Admin"])
async def list_departments(
    x_admin_secret: str = Header(alias="X-Admin-Secret", default=""),
):
    """Retourne la liste des 101 départements et leur répartition en batches."""
    _require_admin(x_admin_secret)
    from data.pipelines.tasks.daily_refresh import ALL_DEPARTMENTS, DEPARTMENT_BATCHES
    return {
        "total": len(ALL_DEPARTMENTS),
        "departments": ALL_DEPARTMENTS,
        "batches": {str(i): b for i, b in enumerate(DEPARTMENT_BATCHES)},
    }
